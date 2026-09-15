import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type BookingStatus } from '@prisma/client';
import { randomBytes, randomUUID } from 'node:crypto';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';

export type BookingCancellationReasonCode =
  | 'PERSONAL_UNAVAILABLE'
  | 'CUSTOMER_SCHEDULE_CONFLICT'
  | 'WRONG_CLASS_SELECTED'
  | 'OTHER';

export type BookingCommand = {
  classSlotId: string;
  customerPackageId: string;
  customerUserId?: string;
  source: 'SELF' | 'ADMIN_ASSISTED';
};

export type CancelBookingCommand = {
  reasonCode: BookingCancellationReasonCode;
  expectedVersion?: number;
  reason?: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 20;

export function isCancellationEntitled(
  classStartAt: Date,
  evaluatedAt: Date,
  cutoffHours: number,
): boolean {
  return evaluatedAt.getTime() < classStartAt.getTime() - cutoffHours * 3_600_000;
}

export function isInstructorRosterPrincipal(principal: {
  capabilities?: readonly string[];
}): boolean {
  const caps = principal.capabilities ?? [];
  return caps.includes('class:assigned:read') && !caps.includes('booking:read');
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly policy: PolicyService,
    private readonly config: RuntimeConfigService,
  ) {}

  private syntheticPolicy() {
    const { enabled, cutoffHours } = this.config.value.booking;
    if (!enabled || cutoffHours === null)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE);
    return { cutoffHours };
  }

  private cancellationPolicy() {
    const { enabled, cutoffHours } = this.config.value.bookingCancellation;
    if (!enabled || cutoffHours === null)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE);
    return { cutoffHours };
  }

  private isCustomer(principal: SessionPrincipal) {
    return (
      principal.capabilities.includes('booking:self:create') &&
      !principal.capabilities.includes('booking:create:assisted')
    );
  }

  private requireBranch(principal: SessionPrincipal, branchId: string, capability: string) {
    if (
      !this.policy.hasCapability(principal, 'branch:all', branchId) &&
      !this.policy.hasCapability(principal, capability, branchId)
    )
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  private async requireVerifiedCustomer(principal: SessionPrincipal) {
    const user = await this.db.user.findUnique({ where: { id: principal.userId } });
    if (!user || user.status !== 'ACTIVE')
      throw new ApiProblem('IDENTITY_VERIFICATION_REQUIRED', HttpStatus.FORBIDDEN);
  }

  bookingView(booking: any) {
    const slot = booking.classSlot;
    const pkg = booking.customerPackage?.package;
    const phone = booking.user?.phone;
    const phoneMasked = phone
      ? phone.length > 6
        ? `${phone.slice(0, 4)}****${phone.slice(-2)}`
        : phone
      : null;
    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      branchId: slot?.branchId ?? booking.branchId,
      classSlotId: booking.classSlotId,
      customerUserId: booking.userId,
      customerPackageId: booking.customerPackageId,
      status: booking.status,
      cancellationReasonCode: booking.cancellationReason ?? null,
      cancelledAt: booking.cancelledAt ?? null,
      createdAt: booking.createdAt,
      reservedQuantity: 1,
      source: booking.source ?? 'SELF',
      version: 1,
      idempotentReplay: false,
      branch: slot?.branch ?? null,
      customer: booking.user
        ? {
            id: booking.user.id,
            displayName: booking.user.displayName,
            email: booking.user.email,
            phone: booking.user.phone,
            phoneMasked,
          }
        : undefined,
      classSlot: slot
        ? {
            id: slot.id,
            startAt: slot.startAt,
            endAt: slot.endAt,
            timezone: slot.branch?.timezone ?? 'Asia/Jakarta',
            status: slot.status,
            capacity: slot.capacity,
            bookedCount: slot.bookedCount,
            available: Math.max(0, slot.capacity - slot.bookedCount),
            classType: slot.classType,
            instructor: slot.instructor
              ? {
                  id: slot.instructor.id,
                  displayName: slot.instructor.displayName,
                }
              : null,
            studio: slot.studio ? { id: slot.studio.id, name: slot.studio.name } : null,
          }
        : undefined,
      package: pkg
        ? {
            id: pkg.id,
            name: pkg.name,
          }
        : undefined,
      attendance: booking.attendance
        ? {
            checkedInAt: booking.attendance.checkedInAt,
            method: booking.attendance.method,
          }
        : null,
      checkInToken: booking.checkInTokens?.[0]
        ? {
            id: booking.checkInTokens[0].id,
            isUsed: booking.checkInTokens[0].isUsed,
            expiresAt: booking.checkInTokens[0].expiresAt,
          }
        : null,
    };
  }

  async cancellationOptions(principal: SessionPrincipal, bookingId: string) {
    this.policy.requireCapability(principal.capabilities, 'booking:self:cancel');
    if (!UUID.test(bookingId)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const policy = this.cancellationPolicy();
    const booking = await this.db.pemesananKelas.findFirst({
      where: { id: bookingId, userId: principal.userId },
      include: {
        classSlot: {
          include: { branch: true },
        },
        attendance: true,
      },
    });
    if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const now = new Date();
    const cutoffAt = new Date(booking.classSlot.startAt.getTime() - policy.cutoffHours * 3_600_000);
    const unavailableReason =
      booking.status !== 'BOOKED'
        ? 'BOOKING_NOT_ACTIVE'
        : booking.attendance
          ? 'ATTENDANCE_RECORDED'
          : !['PUBLISHED', 'CONFIRMED'].includes(booking.classSlot.status)
            ? 'CLASS_SLOT_UNAVAILABLE'
            : !isCancellationEntitled(booking.classSlot.startAt, now, policy.cutoffHours)
              ? 'CANCELLATION_CUTOFF_PASSED'
              : null;

    return {
      bookingId: booking.id,
      bookingVersion: 1,
      cutoffAt,
      canCancel: unavailableReason === null,
      unavailableReason,
      supportAction: unavailableReason === null ? null : 'CONTACT_STUDIO',
    };
  }

  async cancel(
    principal: SessionPrincipal,
    bookingId: string,
    input: CancelBookingCommand,
    key: string,
    _correlationId: string,
  ) {
    if (!UUID.test(bookingId)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const customerFlow = this.isCustomer(principal);
    this.policy.requireCapability(
      principal.capabilities,
      customerFlow ? 'booking:self:cancel' : 'booking:cancel:assisted',
    );

    return this.idempotency.execute(
      {
        scope: `booking-cancel:${bookingId}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const booking = await tx.pemesananKelas.findUnique({
          where: { id: bookingId },
          include: {
            classSlot: {
              include: { branch: true, classType: true, instructor: true, studio: true },
            },
            customerPackage: { include: { package: true } },
            user: true,
            attendance: true,
          },
        });
        if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (customerFlow && booking.userId !== principal.userId)
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (booking.status !== 'BOOKED')
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        if (booking.attendance)
          throw new ApiProblem('ATTENDANCE_RECORDED', HttpStatus.CONFLICT);

        const now = new Date();
        const policy = this.cancellationPolicy();
        if (
          customerFlow &&
          !isCancellationEntitled(booking.classSlot.startAt, now, policy.cutoffHours)
        ) {
          throw new ApiProblem('CANCELLATION_CUTOFF_PASSED', HttpStatus.CONFLICT);
        }

        const reason = input.reason ?? input.reasonCode ?? 'CANCELLED_BY_USER';
        const updated = await tx.pemesananKelas.update({
          where: { id: booking.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: now,
            cancellationReason: reason,
          },
          include: {
            classSlot: {
              include: { branch: true, classType: true, instructor: true, studio: true },
            },
            customerPackage: { include: { package: true } },
            user: true,
            attendance: true,
          },
        });

        // Kembalikan 1 sesi ke paket pelanggan O(1)
        await tx.paketPelanggan.update({
          where: { id: booking.customerPackageId },
          data: {
            usedSessions: { decrement: 1 },
            remainingSessions: { increment: 1 },
            status: 'ACTIVE',
          },
        });

        // Kurangi bookedCount di slot kelas O(1)
        await tx.slotKelas.update({
          where: { id: booking.classSlotId },
          data: {
            bookedCount: { decrement: 1 },
          },
        });

        return {
          status: HttpStatus.OK,
          body: this.bookingView(updated) as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async customerOptions(principal: SessionPrincipal, classSlotId: string) {
    if (!UUID.test(classSlotId)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const slot = await this.db.slotKelas.findUnique({
      where: { id: classSlotId },
      include: {
        classType: true,
        branch: true,
      },
    });
    if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const now = new Date();
    const packages = await this.db.paketPelanggan.findMany({
      where: {
        userId: principal.userId,
        status: 'ACTIVE',
        remainingSessions: { gt: 0 },
        validUntil: { gt: now },
      },
      include: {
        package: true,
      },
    });

    const items = packages.map((pkg) => ({
      id: pkg.id,
      customerPackageId: pkg.id,
      packageId: pkg.packageId,
      packageName: pkg.package.name,
      remainingSessions: pkg.remainingSessions,
      totalSessions: pkg.totalSessions,
      expiresAt: pkg.validUntil,
      isEligible: true,
    }));

    return {
      classSlotId: slot.id,
      classType: slot.classType,
      branch: slot.branch,
      packages: items,
    };
  }

  async list(
    principal: SessionPrincipal,
    query: {
      branchId?: string;
      status?: string;
      cursor?: string;
      timeline?: string;
      q?: string;
      from?: string;
      until?: string;
      classSlotId?: string;
      customerId?: string;
      limit?: number;
      includeHistorical?: boolean;
    } = {},
  ) {
    const customerFlow = this.isCustomer(principal);
    const targetUserId = customerFlow ? principal.userId : query.customerId;
    const limit = Math.min(query.limit ?? PAGE_SIZE, 100);

    const classSlotFilter: any = {};
    if (query.branchId) {
      classSlotFilter.branchId = query.branchId;
    }
    if (query.from || query.until) {
      classSlotFilter.startAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.until ? { lte: new Date(query.until) } : {}),
      };
    }
    if (query.timeline === 'UPCOMING') {
      classSlotFilter.startAt = {
        ...(classSlotFilter.startAt || {}),
        gte: new Date(),
      };
    }

    const where: Prisma.PemesananKelasWhereInput = {
      ...(targetUserId ? { userId: targetUserId } : {}),
      ...(query.status ? { status: query.status as BookingStatus } : {}),
      ...(query.classSlotId ? { classSlotId: query.classSlotId } : {}),
      ...(Object.keys(classSlotFilter).length > 0 ? { classSlot: classSlotFilter } : {}),
    };

    if (query.timeline === 'UPCOMING') {
      where.status = 'BOOKED';
    } else if (query.timeline === 'HISTORY') {
      where.OR = [
        { status: { in: ['ATTENDED', 'CANCELLED'] } },
        { classSlot: { endAt: { lt: new Date() } } },
      ];
    }

    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { bookingNumber: { contains: q } },
        { user: { displayName: { contains: q } } },
      ];
    }

    const items = await this.db.pemesananKelas.findMany({
      where,
      include: {
        user: true,
        classSlot: {
          include: {
            branch: true,
            classType: true,
            instructor: true,
            studio: true,
          },
        },
        customerPackage: {
          include: { package: true },
        },
        attendance: true,
        checkInTokens: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      take: limit + 1,
      orderBy: { bookedAt: 'desc' },
    });

    const hasNext = items.length > limit;
    const pageItems = hasNext ? items.slice(0, limit) : items;

    return {
      items: pageItems.map((b) => this.bookingView(b)),
      nextCursor: hasNext ? pageItems[pageItems.length - 1]?.id ?? null : null,
    };
  }

  async detail(principal: SessionPrincipal, id: string) {
    if (!UUID.test(id)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const customerFlow = this.isCustomer(principal);

    const booking = await this.db.pemesananKelas.findUnique({
      where: { id },
      include: {
        user: true,
        classSlot: {
          include: {
            branch: true,
            classType: true,
            instructor: true,
            studio: true,
          },
        },
        customerPackage: {
          include: { package: true },
        },
        attendance: true,
        checkInTokens: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (customerFlow && booking.userId !== principal.userId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    return this.bookingView(booking);
  }

  async create(
    principal: SessionPrincipal,
    input: BookingCommand,
    key: string,
    _correlationId: string,
  ) {
    if (this.isCustomer(principal)) await this.requireVerifiedCustomer(principal);
    const customerFlow = input.source === 'SELF';
    if (
      !key ||
      !UUID.test(input.classSlotId) ||
      !UUID.test(input.customerPackageId) ||
      !['SELF', 'ADMIN_ASSISTED'].includes(input.source) ||
      (customerFlow && input.customerUserId && input.customerUserId !== principal.userId) ||
      (!customerFlow && (!input.customerUserId || !UUID.test(input.customerUserId)))
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    this.policy.requireCapability(
      principal.capabilities,
      customerFlow ? 'booking:self:create' : 'booking:create:assisted',
    );
    const customerUserId = customerFlow ? principal.userId : input.customerUserId!;
    const policy = this.syntheticPolicy();

    return this.idempotency.execute(
      {
        scope: `booking-create:${principal.userId}`,
        key,
        payload: { ...input, customerUserId },
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const slot = await tx.slotKelas.findUnique({
          where: { id: input.classSlotId },
          include: { branch: true, classType: true, instructor: true, studio: true },
        });
        if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (!customerFlow)
          this.requireBranch(principal, slot.branchId, 'booking:create:assisted');

        const [customerPackage, customer] = await Promise.all([
          tx.paketPelanggan.findUnique({
            where: { id: input.customerPackageId },
            include: { package: true },
          }),
          tx.user.findUnique({ where: { id: customerUserId } }),
        ]);

        if (!customerPackage || !customer || customer.status !== 'ACTIVE')
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (customerPackage.userId !== customerUserId)
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (customerPackage.status !== 'ACTIVE' || customerPackage.validUntil <= new Date())
          throw new ApiProblem('INSUFFICIENT_AVAILABLE_SESSIONS', HttpStatus.CONFLICT);
        if (customerPackage.remainingSessions <= 0)
          throw new ApiProblem('INSUFFICIENT_AVAILABLE_SESSIONS', HttpStatus.CONFLICT);
        if (!['PUBLISHED', 'CONFIRMED'].includes(slot.status))
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);

        const now = new Date();
        if (slot.startAt <= now)
          throw new ApiProblem('BOOKING_CUTOFF_PASSED', HttpStatus.CONFLICT);
        const cutoffAt = new Date(slot.startAt.getTime() - policy.cutoffHours * 3_600_000);
        if (now >= cutoffAt) throw new ApiProblem('BOOKING_CUTOFF_PASSED', HttpStatus.CONFLICT);

        const duplicate = await tx.pemesananKelas.findFirst({
          where: {
            userId: customerUserId,
            classSlotId: slot.id,
            status: 'BOOKED',
          },
        });
        if (duplicate) throw new ApiProblem('DUPLICATE_ACTIVE_BOOKING', HttpStatus.CONFLICT);

        if (slot.bookedCount >= slot.capacity)
          throw new ApiProblem('CLASS_CAPACITY_FULL', HttpStatus.CONFLICT);

        const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`;
        const booking = await tx.pemesananKelas.create({
          data: {
            id: randomUUID(),
            bookingNumber,
            classSlotId: slot.id,
            userId: customerUserId,
            customerPackageId: customerPackage.id,
            status: 'BOOKED',
          },
          include: {
            user: true,
            classSlot: {
              include: { branch: true, classType: true, instructor: true, studio: true },
            },
            customerPackage: { include: { package: true } },
            attendance: true,
            checkInTokens: true,
          },
        });

        // Potong sesi O(1)
        const remainingAfter = customerPackage.remainingSessions - 1;
        await tx.paketPelanggan.update({
          where: { id: customerPackage.id },
          data: {
            usedSessions: { increment: 1 },
            remainingSessions: { decrement: 1 },
            status: remainingAfter <= 0 ? 'DEPLETED' : 'ACTIVE',
          },
        });

        // Tambah bookedCount O(1)
        await tx.slotKelas.update({
          where: { id: slot.id },
          data: {
            bookedCount: { increment: 1 },
          },
        });

        return {
          status: HttpStatus.CREATED,
          body: this.bookingView(booking) as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  // --- Indonesian Domain Aliases ---
  async opsiPembatalan(principal: SessionPrincipal, bookingId: string) {
    return this.cancellationOptions(principal, bookingId);
  }

  async opsiPaketPelanggan(principal: SessionPrincipal, classSlotId: string) {
    return this.customerOptions(principal, classSlotId);
  }

  async batalkanPemesanan(
    principal: SessionPrincipal,
    bookingId: string,
    input: CancelBookingCommand,
    key: string,
    correlationId: string,
  ) {
    return this.cancel(principal, bookingId, input, key, correlationId);
  }

  async daftarPemesanan(
    principal: SessionPrincipal,
    query: Parameters<BookingsService['list']>[1],
  ) {
    return this.list(principal, query);
  }

  async ambilDetail(principal: SessionPrincipal, id: string) {
    return this.detail(principal, id);
  }

  async buatPemesanan(
    principal: SessionPrincipal,
    input: BookingCommand,
    key: string,
    correlationId: string,
  ) {
    return this.create(principal, input, key, correlationId);
  }
}
