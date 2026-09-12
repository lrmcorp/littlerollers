import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type RescheduleStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';

export type RescheduleRequestReasonCode =
  | 'CUSTOMER_SCHEDULE_CONFLICT'
  | 'WRONG_CLASS_SELECTED'
  | 'PERSONAL_UNAVAILABLE'
  | 'OTHER';

export type RescheduleDecisionReasonCode =
  | 'ELIGIBILITY_VERIFIED'
  | 'TARGET_UNAVAILABLE'
  | 'OUTSIDE_POLICY'
  | 'OUT_OF_SCOPE'
  | 'OTHER';

export type RescheduleRequestCommand = {
  bookingId: string;
  targetClassSlotId: string;
  reasonCode: RescheduleRequestReasonCode;
  expectedBookingVersion?: number;
};

export type RescheduleDecisionCommand = {
  reasonCode: RescheduleDecisionReasonCode;
  expectedVersion?: number;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REQUEST_CODES: RescheduleRequestReasonCode[] = [
  'CUSTOMER_SCHEDULE_CONFLICT',
  'WRONG_CLASS_SELECTED',
  'PERSONAL_UNAVAILABLE',
  'OTHER',
];
const PAGE_SIZE = 20;

export function isRescheduleEntitled(
  sourceStartAt: Date,
  evaluatedAt: Date,
  cutoffHours: number,
): boolean {
  return evaluatedAt.getTime() <= sourceStartAt.getTime() - cutoffHours * 3_600_000;
}

@Injectable()
export class ReschedulesService {
  constructor(
    private readonly db: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly policy: PolicyService,
    private readonly config: RuntimeConfigService,
  ) {}

  private syntheticPolicy() {
    const booking = this.config.value.booking;
    const reschedule = this.config.value.reschedule;
    if (
      !booking.enabled ||
      booking.cutoffHours === null ||
      !reschedule.enabled ||
      reschedule.cutoffHours === null
    )
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE);
    return { bookingCutoffHours: booking.cutoffHours, cutoffHours: reschedule.cutoffHours };
  }

  private requireBranch(principal: SessionPrincipal, branchId: string, capability: string) {
    if (
      !this.policy.hasCapability(principal, 'branch:all', branchId) &&
      !this.policy.hasCapability(principal, capability, branchId)
    )
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  async options(principal: SessionPrincipal, bookingId: string) {
    this.policy.requireCapability(principal.capabilities, 'reschedule:self:read');
    if (!UUID.test(bookingId)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const policy = this.syntheticPolicy();

    const booking = await this.db.pemesananKelas.findFirst({
      where: { id: bookingId, userId: principal.userId },
      include: {
        classSlot: {
          include: {
            branch: { select: { id: true, name: true, timezone: true } },
            classType: { select: { id: true, name: true } },
          },
        },
        customerPackage: {
          include: { package: true },
        },
        reschedules: { orderBy: { requestedAt: 'desc' }, take: 1 },
      },
    });
    if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const now = new Date();
    const cutoffAt = new Date(booking.classSlot.startAt.getTime() - policy.cutoffHours * 3_600_000);
    const latestRequest = booking.reschedules[0] ?? null;
    const pending = latestRequest?.status === 'PENDING';

    const unavailableReason =
      booking.status !== 'BOOKED'
        ? 'BOOKING_NOT_ACTIVE'
        : pending
          ? 'RESCHEDULE_PENDING'
          : !isRescheduleEntitled(booking.classSlot.startAt, now, policy.cutoffHours)
            ? 'RESCHEDULE_CUTOFF_PASSED'
            : null;

    const availableSlots = await this.db.slotKelas.findMany({
      where: {
        id: { not: booking.classSlotId },
        branchId: booking.classSlot.branchId,
        classTypeId: booking.classSlot.classTypeId,
        status: { in: ['PUBLISHED', 'CONFIRMED'] },
        startAt: { gt: now },
      },
      include: {
        classType: { select: { id: true, name: true } },
        instructor: { select: { id: true, displayName: true } },
        studio: { select: { id: true, name: true } },
      },
      orderBy: { startAt: 'asc' },
      take: 20,
    });

    const targets = availableSlots.map((slot) => {
      const remaining = Math.max(0, slot.capacity - slot.bookedCount);
      return {
        id: slot.id,
        startAt: slot.startAt,
        endAt: slot.endAt,
        timezone: booking.classSlot.branch.timezone,
        capacity: slot.capacity,
        bookedCount: slot.bookedCount,
        available: remaining,
        eligible: remaining > 0,
        ineligibilityReason: remaining <= 0 ? 'SLOT_FULL' : null,
        classType: slot.classType,
        instructor: slot.instructor,
        studio: slot.studio,
      };
    });

    return {
      bookingId: booking.id,
      bookingVersion: 1,
      cutoffAt,
      canReschedule: unavailableReason === null,
      unavailableReason,
      source: {
        id: booking.classSlot.id,
        startAt: booking.classSlot.startAt,
        endAt: booking.classSlot.endAt,
        branch: booking.classSlot.branch,
        classType: booking.classSlot.classType,
      },
      latestRequest,
      targets,
    };
  }

  async list(
    principal: SessionPrincipal,
    query: { branchId?: string; status?: string; cursor?: string } = {},
  ) {
    const customer = principal.capabilities.includes('reschedule:self:read');
    this.policy.requireCapability(
      principal.capabilities,
      customer ? 'reschedule:self:read' : 'reschedule:read',
    );

    const items = await this.db.ubahJadwal.findMany({
      where: {
        ...(customer ? { requestedById: principal.userId } : {}),
        ...(query.status ? { status: query.status as RescheduleStatus } : {}),
        ...(query.branchId
          ? {
              OR: [
                { sourceSlot: { branchId: query.branchId } },
                { targetSlot: { branchId: query.branchId } },
              ],
            }
          : {}),
      },
      include: {
        booking: {
          include: {
            user: { select: { id: true, displayName: true, email: true, phone: true } },
            customerPackage: {
              include: { package: { select: { id: true, name: true } } },
            },
          },
        },
        sourceSlot: {
          include: {
            classType: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true, timezone: true } },
          },
        },
        targetSlot: {
          include: {
            classType: { select: { id: true, name: true } },
            branch: { select: { id: true, name: true, timezone: true } },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
      take: PAGE_SIZE,
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        bookingId: item.bookingId,
        sourceClassSlotId: item.sourceSlotId,
        targetClassSlotId: item.targetSlotId,
        requestedById: item.requestedById,
        status: item.status,
        reason: item.reason,
        requestedAt: item.requestedAt,
        version: 1,
        branch: item.targetSlot.branch,
        customer: item.booking.user,
        package: item.booking.customerPackage?.package ?? null,
        sourceClassSlot: item.sourceSlot,
        targetClassSlot: item.targetSlot,
      })),
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async request(
    principal: SessionPrincipal,
    input: RescheduleRequestCommand,
    key: string,
    _correlationId: string,
  ) {
    if (
      !key ||
      !UUID.test(input.bookingId) ||
      !UUID.test(input.targetClassSlotId) ||
      !REQUEST_CODES.includes(input.reasonCode)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    this.policy.requireCapability(principal.capabilities, 'reschedule:self:request');
    const policy = this.syntheticPolicy();

    return this.idempotency.execute(
      {
        scope: `reschedule-request:${principal.userId}:${input.bookingId}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const booking = await tx.pemesananKelas.findUnique({
          where: { id: input.bookingId },
          include: {
            classSlot: true,
            customerPackage: true,
            user: true,
          },
        });
        if (!booking || booking.userId !== principal.userId || booking.status !== 'BOOKED')
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

        const now = new Date();
        if (!isRescheduleEntitled(booking.classSlot.startAt, now, policy.cutoffHours))
          throw new ApiProblem('RESCHEDULE_CUTOFF_PASSED', HttpStatus.CONFLICT);

        const targetSlot = await tx.slotKelas.findUnique({
          where: { id: input.targetClassSlotId },
          include: { branch: true, classType: true },
        });
        if (!targetSlot || !['PUBLISHED', 'CONFIRMED'].includes(targetSlot.status))
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (targetSlot.startAt <= now)
          throw new ApiProblem('BOOKING_CUTOFF_PASSED', HttpStatus.CONFLICT);
        if (targetSlot.bookedCount >= targetSlot.capacity)
          throw new ApiProblem('CLASS_CAPACITY_FULL', HttpStatus.CONFLICT);

        // Buat record UbahJadwal
        const reschedule = await tx.ubahJadwal.create({
          data: {
            id: randomUUID(),
            bookingId: booking.id,
            sourceSlotId: booking.classSlotId,
            targetSlotId: targetSlot.id,
            requestedById: principal.userId,
            status: 'APPROVED',
            reason: input.reasonCode,
          },
          include: {
            sourceSlot: { include: { classType: true, branch: true } },
            targetSlot: { include: { classType: true, branch: true } },
            booking: { include: { user: true, customerPackage: { include: { package: true } } } },
          },
        });

        // Pindahkan booking ke targetSlot
        await tx.pemesananKelas.update({
          where: { id: booking.id },
          data: { classSlotId: targetSlot.id },
        });

        // Kurangi bookedCount slot lama
        await tx.slotKelas.update({
          where: { id: booking.classSlotId },
          data: { bookedCount: { decrement: 1 } },
        });

        // Tambah bookedCount slot baru
        await tx.slotKelas.update({
          where: { id: targetSlot.id },
          data: { bookedCount: { increment: 1 } },
        });

        return {
          status: HttpStatus.CREATED,
          body: {
            id: reschedule.id,
            status: 'APPROVED',
            bookingId: booking.id,
            sourceClassSlotId: reschedule.sourceSlotId,
            targetClassSlotId: reschedule.targetSlotId,
            requestedAt: reschedule.requestedAt,
          } as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async decide(
    principal: SessionPrincipal,
    id: string,
    decision: 'approve' | 'reject',
    input: RescheduleDecisionCommand,
    key: string,
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'reschedule:manage');
    return this.idempotency.execute(
      {
        scope: `reschedule-decide:${id}`,
        key,
        payload: { decision, ...input },
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const reschedule = await tx.ubahJadwal.findUnique({
          where: { id },
          include: { booking: true },
        });
        if (!reschedule) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

        const newStatus: RescheduleStatus = decision === 'approve' ? 'APPROVED' : 'REJECTED';
        const updated = await tx.ubahJadwal.update({
          where: { id },
          data: {
            status: newStatus,
            reason: input.reasonCode ?? reschedule.reason,
          },
        });

        return {
          status: HttpStatus.OK,
          body: {
            id: updated.id,
            status: updated.status,
          } as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  // --- Indonesian Domain Aliases ---
  async opsiUbahJadwal(principal: SessionPrincipal, bookingId: string) {
    return this.options(principal, bookingId);
  }

  async ajukanUbahJadwal(
    principal: SessionPrincipal,
    input: RescheduleRequestCommand,
    key: string,
    correlationId: string,
  ) {
    return this.request(principal, input, key, correlationId);
  }

  async putuskanUbahJadwal(
    principal: SessionPrincipal,
    id: string,
    decision: 'approve' | 'reject',
    input: RescheduleDecisionCommand,
    key: string,
    correlationId: string,
  ) {
    return this.decide(principal, id, decision, input, key, correlationId);
  }

  async daftarUbahJadwal(
    principal: SessionPrincipal,
    query: Parameters<ReschedulesService['list']>[1],
  ) {
    return this.list(principal, query);
  }
}
