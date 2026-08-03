import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma, type BookingCancellationReasonCode, type BookingStatus } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { PilotRollbackOutboxService } from '../migration/pilot-rollback-outbox.service';

export type BookingCommand = {
  classSlotId: string;
  customerPackageId: string;
  customerUserId?: string;
  source: 'SELF' | 'ADMIN_ASSISTED';
};

export type CancelBookingCommand = {
  reasonCode: BookingCancellationReasonCode;
  expectedVersion: number;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 20;
const CANCELLATION_REASON_CODES: BookingCancellationReasonCode[] = [
  'PERSONAL_UNAVAILABLE',
  'CUSTOMER_SCHEDULE_CONFLICT',
  'WRONG_CLASS_SELECTED',
  'OTHER',
];
type Cursor = { at: string; id: string };
type CustomerBookingTimeline = 'UPCOMING' | 'HISTORY';
type BookingEligibilityReason =
  | 'IDENTITY_VERIFICATION_REQUIRED'
  | 'MATCHING_PACKAGE_REQUIRED'
  | 'INSUFFICIENT_AVAILABLE_SESSION'
  | 'SLOT_FULL'
  | 'SLOT_UNAVAILABLE'
  | 'BOOKING_CUTOFF_PASSED';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const maskPhone = (value: string | null) =>
  value ? `${value.slice(0, 4)}••••${value.slice(-3)}` : null;

function encodeCursor(at: Date, id: string) {
  return Buffer.from(JSON.stringify({ at: at.toISOString(), id })).toString('base64url');
}

function decodeCursor(value?: string): Cursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Cursor;
    if (!UUID.test(parsed.id) || Number.isNaN(Date.parse(parsed.at))) throw new Error('invalid');
    return parsed;
  } catch {
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }
}

export function isCancellationEntitled(
  classStartAt: Date,
  evaluatedAt: Date,
  cutoffHours: number,
): boolean {
  return evaluatedAt.getTime() < classStartAt.getTime() - cutoffHours * 3_600_000;
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly policy: PolicyService,
    private readonly config: RuntimeConfigService,
    @Optional() private readonly pilotOutbox?: PilotRollbackOutboxService,
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

  private async isVerifiedCustomer(principal: SessionPrincipal) {
    if (!principal.roles.some(({ role }) => role === 'CUSTOMER')) return true;
    const approved = await this.db.identityVerificationDocument.groupBy({
      by: ['kind'],
      where: { userId: principal.userId, status: 'APPROVED', replacedById: null },
    });
    return ['SELFIE', 'KTP_FRONT'].every((kind) => approved.some((item) => item.kind === kind));
  }

  private async requireVerifiedCustomer(principal: SessionPrincipal) {
    if (!(await this.isVerifiedCustomer(principal)))
      throw new ApiProblem('IDENTITY_VERIFICATION_REQUIRED', HttpStatus.FORBIDDEN);
  }

  private bookingView(booking: any) {
    return {
      id: booking.id,
      branchId: booking.branchId,
      classSlotId: booking.classSlotId,
      customerUserId: booking.customerUserId,
      customerPackageId: booking.customerPackageId,
      reservationId: booking.reservationId,
      createdById: booking.createdById,
      source: booking.source,
      status: booking.status,
      reservedQuantity: booking.reservedQuantity,
      cancellationReasonCode: booking.cancellationReasonCode ?? null,
      cancelledAt: booking.cancelledAt ?? null,
      createdAt: booking.createdAt,
      version: booking.version,
      idempotentReplay: false,
      branch: booking.branch,
      classSlot: booking.classSlot
        ? {
            id: booking.classSlot.id,
            startAt: booking.classSlot.startAt,
            endAt: booking.classSlot.endAt,
            timezone: booking.classSlot.timezone,
            status: booking.classSlot.status,
            classType: booking.classSlot.classType,
          }
        : undefined,
      package: booking.customerPackage?.package
        ? {
            id: booking.customerPackage.package.id,
            name: booking.customerPackage.package.name,
          }
        : undefined,
      attendance: booking.attendance
        ? {
            checkedInAt: booking.attendance.checkedInAt,
            source: booking.attendance.source,
          }
        : null,
      checkInToken: booking.checkInTokens?.[0]
        ? {
            id: booking.checkInTokens[0].id,
            status: booking.checkInTokens[0].status,
            notBeforeAt: booking.checkInTokens[0].notBeforeAt,
            expiresAt: booking.checkInTokens[0].expiresAt,
            usedAt: booking.checkInTokens[0].usedAt,
            revokedAt: booking.checkInTokens[0].revokedAt,
            version: booking.checkInTokens[0].version,
          }
        : null,
    };
  }

  async cancellationOptions(principal: SessionPrincipal, bookingId: string) {
    this.policy.requireCapability(principal.capabilities, 'booking:self:cancel');
    if (!UUID.test(bookingId)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const policy = this.cancellationPolicy();
    const booking = await this.db.booking.findFirst({
      where: { id: bookingId, customerUserId: principal.userId },
      include: {
        classSlot: { select: { startAt: true, status: true, timezone: true } },
        reservation: { select: { status: true } },
        attendance: { select: { id: true } },
        reschedules: {
          where: { status: 'PENDING' },
          select: { id: true },
          take: 1,
        },
      },
    });
    if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const now = new Date();
    const cutoffAt = new Date(booking.classSlot.startAt.getTime() - policy.cutoffHours * 3_600_000);
    const pending = booking.status === 'RESCHEDULE_PENDING' || booking.reschedules.length > 0;
    const unavailableReason = pending
      ? 'RESCHEDULE_PENDING'
      : booking.status !== 'BOOKED'
        ? 'BOOKING_NOT_ACTIVE'
        : booking.attendance
          ? 'ATTENDANCE_RECORDED'
          : booking.reservation.status !== 'ACTIVE'
            ? 'RESERVATION_NOT_ACTIVE'
            : !['PUBLISHED', 'CONFIRMED'].includes(booking.classSlot.status)
              ? 'CLASS_SLOT_UNAVAILABLE'
              : !isCancellationEntitled(booking.classSlot.startAt, now, policy.cutoffHours)
                ? 'CANCELLATION_CUTOFF_PASSED'
                : null;
    return {
      bookingId: booking.id,
      bookingVersion: booking.version,
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
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'booking:self:cancel');
    if (
      !key ||
      !UUID.test(bookingId) ||
      !Number.isInteger(input.expectedVersion) ||
      input.expectedVersion < 0 ||
      !CANCELLATION_REASON_CODES.includes(input.reasonCode)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const policy = this.cancellationPolicy();
    return this.idempotency
      .execute(
        {
          scope: `booking-cancel:${principal.userId}:${bookingId}`,
          key,
          payload: input,
          ttlMs: 86_400_000,
          leaseMs: 30_000,
        },
        async (tx) => {
          const owned = await tx.booking.findFirst({
            where: { id: bookingId, customerUserId: principal.userId },
            select: { id: true, classSlotId: true, reservationId: true },
          });
          if (!owned) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

          await tx.$queryRaw`SELECT \`id\` FROM \`Booking\` WHERE \`id\` = ${bookingId} FOR UPDATE`;
          await tx.$queryRaw`SELECT \`id\` FROM \`ClassSlot\` WHERE \`id\` = ${owned.classSlotId} FOR UPDATE`;
          await tx.$queryRaw`SELECT \`id\` FROM \`SessionReservation\` WHERE \`id\` = ${owned.reservationId} FOR UPDATE`;

          const booking = await tx.booking.findFirst({
            where: { id: bookingId, customerUserId: principal.userId },
            include: {
              classSlot: true,
              reservation: true,
              attendance: true,
              reschedules: { where: { status: 'PENDING' }, select: { id: true }, take: 1 },
            },
          });
          if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          if (booking.version !== input.expectedVersion)
            throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
          if (booking.status === 'RESCHEDULE_PENDING' || booking.reschedules.length > 0)
            throw new ApiProblem('PENDING_RESCHEDULE_EXISTS', HttpStatus.CONFLICT);
          if (booking.status !== 'BOOKED')
            throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
          if (booking.attendance)
            throw new ApiProblem('ATTENDANCE_ALREADY_RECORDED', HttpStatus.CONFLICT);
          if (
            booking.reservation.status !== 'ACTIVE' ||
            booking.reservation.classSlotId !== booking.classSlotId ||
            booking.reservation.customerPackageId !== booking.customerPackageId ||
            booking.reservation.quantity !== booking.reservedQuantity
          )
            throw new ApiProblem('RESERVATION_NOT_ACTIVE', HttpStatus.CONFLICT);
          if (!['PUBLISHED', 'CONFIRMED'].includes(booking.classSlot.status))
            throw new ApiProblem('CLASS_SLOT_UNAVAILABLE', HttpStatus.CONFLICT);
          const now = new Date();
          if (!isCancellationEntitled(booking.classSlot.startAt, now, policy.cutoffHours))
            throw new ApiProblem('CANCELLATION_CUTOFF_PASSED', HttpStatus.CONFLICT);

          await tx.sessionReservation.update({
            where: { id: booking.reservationId },
            data: { status: 'RELEASED', releasedAt: now },
          });
          const remaining = await tx.sessionReservation.aggregate({
            where: { classSlotId: booking.classSlotId, status: 'ACTIVE' },
            _sum: { quantity: true },
          });
          await tx.classSlot.update({
            where: { id: booking.classSlotId },
            data: { bookedCount: remaining._sum.quantity ?? 0 },
          });
          await tx.checkInToken.updateMany({
            where: { bookingId, status: 'ACTIVE' },
            data: {
              status: 'REVOKED',
              revokedAt: now,
              activeBookingKey: null,
              version: { increment: 1 },
            },
          });
          const updated = await tx.booking.update({
            where: { id: bookingId },
            data: {
              status: 'CANCELLED',
              cancellationReasonCode: input.reasonCode,
              cancelledAt: now,
              cancelledById: principal.userId,
              version: { increment: 1 },
            },
          });
          await Promise.all([
            tx.auditLog.create({
              data: {
                id: randomUUID(),
                actorType: 'USER',
                actorId: principal.userId,
                branchId: booking.branchId,
                action: 'booking.cancelled',
                objectType: 'Booking',
                objectId: booking.id,
                correlationId,
                beforeMasked: { status: booking.status, version: booking.version },
                afterMasked: {
                  status: 'CANCELLED',
                  reasonCode: input.reasonCode,
                  version: updated.version,
                },
              },
            }),
            tx.outboxEvent.create({
              data: {
                id: randomUUID(),
                eventType: 'booking.cancelled.v1',
                aggregateType: 'Booking',
                aggregateId: booking.id,
                correlationId,
                payload: {
                  bookingId: booking.id,
                  classSlotId: booking.classSlotId,
                  branchId: booking.branchId,
                },
              },
            }),
            this.pilotOutbox?.record(tx, {
              branchId: booking.branchId,
              aggregateType: 'Booking',
              aggregateId: booking.id,
              operation: 'CANCEL',
              correlationId,
              occurredAt: now,
              payload: {
                bookingId: booking.id,
                customerUserId: booking.customerUserId,
                classSlotId: booking.classSlotId,
                customerPackageId: booking.customerPackageId,
                reasonCode: input.reasonCode,
              },
            }),
          ]);
          return {
            status: HttpStatus.OK,
            body: updated as unknown as Prisma.InputJsonValue,
          };
        },
      )
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')
          throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
        throw error;
      });
  }

  async customerOptions(principal: SessionPrincipal, classSlotId: string) {
    this.policy.requireCapability(principal.capabilities, 'booking:self:read');
    if (!UUID.test(classSlotId)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const verified = await this.isVerifiedCustomer(principal);
    const policy = this.syntheticPolicy();
    const now = new Date();
    const slot = await this.db.classSlot.findUnique({
      where: { id: classSlotId },
      include: {
        branch: { select: { id: true, code: true, name: true, timezone: true } },
        classType: { select: { id: true, code: true, name: true } },
      },
    });
    if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const cutoffAt = new Date(slot.startAt.getTime() - policy.cutoffHours * 3_600_000);
    const slotAvailable = Math.max(0, slot.capacity - slot.bookedCount);

    const owned = await this.db.customerPackage.findMany({
      where: {
        customerUserId: principal.userId,
        branchId: slot.branchId,
        classTypeId: slot.classTypeId,
        status: 'ACTIVE',
        expiryAt: { gt: now },
      },
      include: { package: { select: { name: true } } },
      orderBy: [{ expiryAt: 'asc' }, { createdAt: 'asc' }],
    });
    const packageOptions = await Promise.all(
      owned.map(async (item) => {
        const [ledger, reservations] = await Promise.all([
          this.db.ledgerEntry.aggregate({
            where: { customerPackageId: item.id },
            _sum: { quantity: true },
          }),
          this.db.sessionReservation.aggregate({
            where: { customerPackageId: item.id, status: 'ACTIVE' },
            _sum: { quantity: true },
          }),
        ]);
        const ledgerBalance = ledger._sum.quantity ?? 0;
        const reserved = reservations._sum.quantity ?? 0;
        const available = ledgerBalance - reserved;
        if (ledgerBalance < 0 || reserved > ledgerBalance)
          throw new ApiProblem('LEDGER_INVARIANT_VIOLATION', HttpStatus.CONFLICT);
        return {
          id: item.id,
          packageId: item.packageId,
          name: item.package.name,
          available,
          projectedAvailable: Math.max(0, available - 1),
          expiryAt: item.expiryAt,
        };
      }),
    );
    const packages = packageOptions.filter(({ available }) => available > 0);
    let reasonCode: BookingEligibilityReason | null = null;
    let requiredAction:
      'COMPLETE_IDENTITY_VERIFICATION' | 'BUY_MATCHING_PACKAGE' | 'CONTACT_STUDIO' | null = null;
    if (!verified) {
      reasonCode = 'IDENTITY_VERIFICATION_REQUIRED';
      requiredAction = 'COMPLETE_IDENTITY_VERIFICATION';
    } else if (!['PUBLISHED', 'CONFIRMED'].includes(slot.status)) {
      reasonCode = 'SLOT_UNAVAILABLE';
      requiredAction = 'CONTACT_STUDIO';
    } else if (slotAvailable < 1) {
      reasonCode = 'SLOT_FULL';
    } else if (now >= cutoffAt || slot.startAt <= now) {
      reasonCode = 'BOOKING_CUTOFF_PASSED';
      requiredAction = 'CONTACT_STUDIO';
    } else if (owned.length === 0) {
      reasonCode = 'MATCHING_PACKAGE_REQUIRED';
      requiredAction = 'BUY_MATCHING_PACKAGE';
    } else if (packages.length === 0) {
      reasonCode = 'INSUFFICIENT_AVAILABLE_SESSION';
      requiredAction = 'BUY_MATCHING_PACKAGE';
    }

    return {
      slot: {
        id: slot.id,
        branchId: slot.branchId,
        classTypeId: slot.classTypeId,
        startAt: slot.startAt,
        endAt: slot.endAt,
        timezone: slot.timezone,
        status: slot.status,
        capacity: slot.capacity,
        bookedCount: slot.bookedCount,
        available: slotAvailable,
        branch: slot.branch,
        classType: slot.classType,
      },
      packages,
      eligibility: {
        canBook: reasonCode === null,
        reasonCode,
        requiredAction,
        cutoffAt,
      },
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
    },
  ) {
    const customer = this.isCustomer(principal);
    if (query.includeHistorical)
      this.policy.requireCapability(principal.capabilities, 'migration:read');
    this.policy.requireCapability(
      principal.capabilities,
      customer ? 'booking:self:read' : 'booking:read',
    );
    const statuses: BookingStatus[] = [
      'BOOKED',
      'RESCHEDULE_PENDING',
      'CANCELLED',
      'ATTENDED',
      'NO_SHOW',
    ];
    if (query.status && !statuses.includes(query.status as BookingStatus))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (query.timeline && (!customer || !['UPCOMING', 'HISTORY'].includes(query.timeline)))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (query.branchId && !customer) this.requireBranch(principal, query.branchId, 'booking:read');
    const limit = query.limit ?? PAGE_SIZE;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (query.classSlotId && !UUID.test(query.classSlotId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (query.customerId && !UUID.test(query.customerId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const from = query.from ? new Date(query.from) : null;
    const until = query.until ? new Date(query.until) : null;
    if (
      (from && Number.isNaN(from.getTime())) ||
      (until && Number.isNaN(until.getTime())) ||
      (from && until && from >= until)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const cursor = decodeCursor(query.cursor);
    const timeline = query.timeline as CustomerBookingTimeline | undefined;
    const now = new Date();
    const branchScope = this.policy.capabilityBranchScope(principal, 'booking:read');
    const timelineWhere =
      timeline === 'UPCOMING'
        ? {
            status: { in: ['BOOKED', 'RESCHEDULE_PENDING'] as BookingStatus[] },
            classSlot: { endAt: { gte: now } },
          }
        : timeline === 'HISTORY'
          ? {
              OR: [
                { status: { in: ['CANCELLED', 'ATTENDED', 'NO_SHOW'] as BookingStatus[] } },
                { classSlot: { endAt: { lt: now } } },
              ],
            }
          : {};
    const timelineCursor =
      timeline && cursor
        ? {
            OR:
              timeline === 'UPCOMING'
                ? [
                    { classSlot: { startAt: { gt: new Date(cursor.at) } } },
                    { classSlot: { startAt: new Date(cursor.at) }, id: { gt: cursor.id } },
                  ]
                : [
                    { classSlot: { startAt: { lt: new Date(cursor.at) } } },
                    { classSlot: { startAt: new Date(cursor.at) }, id: { lt: cursor.id } },
                  ],
          }
        : {};
    const queryText = query.q?.trim();
    const commonWhere: Prisma.BookingWhereInput = {
      ...(query.includeHistorical ? {} : { historical: false }),
      ...(customer ? { customerUserId: principal.userId } : {}),
      ...(query.branchId
        ? { branchId: query.branchId }
        : customer
          ? {}
          : branchScope.all
            ? branchScope.excluded.length
              ? { branchId: { notIn: branchScope.excluded } }
              : {}
            : { branchId: { in: branchScope.included } }),
      ...(query.classSlotId ? { classSlotId: query.classSlotId } : {}),
      ...(query.customerId ? { customerUserId: query.customerId } : {}),
      ...(from || until
        ? {
            classSlot: {
              startAt: {
                ...(from ? { gte: from } : {}),
                ...(until ? { lt: until } : {}),
              },
            },
          }
        : {}),
      ...(queryText
        ? {
            OR: [
              { id: queryText },
              { customer: { displayName: { contains: queryText } } },
              { customer: { phoneE164: { contains: queryText } } },
              { classSlot: { classType: { name: { contains: queryText } } } },
              { customerPackage: { package: { name: { contains: queryText } } } },
              { branch: { name: { contains: queryText } } },
            ],
          }
        : {}),
    };
    const statusWhere: Prisma.BookingWhereInput = query.status
      ? { status: query.status as BookingStatus }
      : {};
    const items = await this.db.booking.findMany({
      where: {
        AND: [
          commonWhere,
          statusWhere,
          timelineWhere,
          timelineCursor,
          !timeline && cursor
            ? {
                OR: [
                  { createdAt: { lt: new Date(cursor.at) } },
                  { createdAt: new Date(cursor.at), id: { lt: cursor.id } },
                ],
              }
            : {},
        ],
      },
      orderBy: timeline
        ? [
            { classSlot: { startAt: timeline === 'UPCOMING' ? 'asc' : 'desc' } },
            { id: timeline === 'UPCOMING' ? 'asc' : 'desc' },
          ]
        : [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        branch: { select: { id: true, name: true, timezone: true } },
        customer: { select: { id: true, displayName: true, phoneE164: true } },
        classSlot: {
          include: { classType: { select: { id: true, name: true } } },
        },
        customerPackage: {
          include: { package: { select: { id: true, name: true } } },
        },
        attendance: { select: { checkedInAt: true, source: true } },
        checkInTokens: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            notBeforeAt: true,
            expiresAt: true,
            usedAt: true,
            revokedAt: true,
            version: true,
          },
        },
      },
    });
    const hasMore = items.length > limit;
    const pageItems = items.slice(0, limit);
    const packageIds = [...new Set(pageItems.map((item) => item.customerPackageId))];
    const [ledger, reservations, statusGroups] = await Promise.all([
      this.db.ledgerEntry.groupBy({
        by: ['customerPackageId'],
        where: { customerPackageId: { in: packageIds } },
        _sum: { quantity: true },
      }),
      this.db.sessionReservation.groupBy({
        by: ['customerPackageId'],
        where: { customerPackageId: { in: packageIds }, status: 'ACTIVE' },
        _sum: { quantity: true },
      }),
      this.db.booking.groupBy({
        by: ['status'],
        where: timeline ? { AND: [commonWhere, timelineWhere] } : commonWhere,
        _count: { _all: true },
      }),
    ]);
    const balanceByPackage = new Map(
      ledger.map((item) => [item.customerPackageId, item._sum.quantity ?? 0]),
    );
    const reservedByPackage = new Map(
      reservations.map((item) => [item.customerPackageId, item._sum.quantity ?? 0]),
    );
    const summaryByStatus = new Map(statusGroups.map((item) => [item.status, item._count._all]));
    const last = pageItems.at(-1);
    const cursorAt = timeline ? last?.classSlot.startAt : last?.createdAt;
    return {
      items: pageItems.map((item) => {
        const balance = balanceByPackage.get(item.customerPackageId) ?? 0;
        const reserved = reservedByPackage.get(item.customerPackageId) ?? 0;
        return {
          ...this.bookingView(item),
          customer: {
            id: item.customer.id,
            displayName: item.customer.displayName,
            phoneMasked: maskPhone(item.customer.phoneE164),
          },
          sessionBalance: {
            ledgerBalance: balance,
            reserved,
            available: Math.max(0, balance - reserved),
          },
        };
      }),
      summary: {
        total: [...summaryByStatus.values()].reduce((sum, value) => sum + value, 0),
        booked: summaryByStatus.get('BOOKED') ?? 0,
        reschedulePending: summaryByStatus.get('RESCHEDULE_PENDING') ?? 0,
        attended: summaryByStatus.get('ATTENDED') ?? 0,
        cancelled: summaryByStatus.get('CANCELLED') ?? 0,
        noShow: summaryByStatus.get('NO_SHOW') ?? 0,
      },
      page: {
        hasMore,
        nextCursor: hasMore && last && cursorAt ? encodeCursor(cursorAt, last.id) : null,
      },
    };
  }

  async detail(principal: SessionPrincipal, id: string) {
    const customer = this.isCustomer(principal);
    this.policy.requireCapability(
      principal.capabilities,
      customer ? 'booking:self:read' : 'booking:read',
    );
    if (!UUID.test(id)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const booking = await this.db.booking.findFirst({
      where: { id, ...(customer ? { customerUserId: principal.userId } : {}) },
      include: {
        branch: { select: { id: true, name: true, timezone: true } },
        customer: { select: { id: true, displayName: true, phoneE164: true } },
        createdBy: { select: { id: true, displayName: true } },
        classSlot: {
          include: { classType: { select: { id: true, name: true } } },
        },
        customerPackage: {
          include: { package: { select: { id: true, name: true } } },
        },
        attendance: { select: { checkedInAt: true, source: true } },
        reschedules: {
          orderBy: { requestedAt: 'desc' },
          include: {
            sourceClassSlot: {
              select: { id: true, startAt: true, endAt: true, timezone: true },
            },
            targetClassSlot: {
              select: { id: true, startAt: true, endAt: true, timezone: true },
            },
          },
        },
        checkInTokens: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            notBeforeAt: true,
            expiresAt: true,
            usedAt: true,
            revokedAt: true,
            version: true,
          },
        },
      },
    });
    if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (!customer) this.requireBranch(principal, booking.branchId, 'booking:read');
    const view = this.bookingView(booking);
    if (customer) return view;
    const [ledger, reservations] = await Promise.all([
      this.db.ledgerEntry.aggregate({
        where: { customerPackageId: booking.customerPackageId },
        _sum: { quantity: true },
      }),
      this.db.sessionReservation.aggregate({
        where: { customerPackageId: booking.customerPackageId, status: 'ACTIVE' },
        _sum: { quantity: true },
      }),
    ]);
    const ledgerBalance = ledger._sum.quantity ?? 0;
    const reserved = reservations._sum.quantity ?? 0;
    return {
      ...view,
      customer: {
        id: booking.customer.id,
        displayName: booking.customer.displayName,
        phoneMasked: maskPhone(booking.customer.phoneE164),
      },
      createdBy: {
        id: booking.createdBy.id,
        displayName: booking.createdBy.displayName,
      },
      sessionBalance: {
        ledgerBalance,
        reserved,
        available: Math.max(0, ledgerBalance - reserved),
      },
      reschedules: booking.reschedules.map((item) => ({
        id: item.id,
        status: item.status,
        requestReasonCode: item.requestReasonCode,
        decisionReasonCode: item.decisionReasonCode,
        requestedAt: item.requestedAt,
        decidedAt: item.decidedAt,
        version: item.version,
        sourceClassSlot: item.sourceClassSlot,
        targetClassSlot: item.targetClassSlot,
      })),
      checkInToken: booking.checkInTokens[0] ?? null,
    };
  }

  async create(
    principal: SessionPrincipal,
    input: BookingCommand,
    key: string,
    correlationId: string,
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

    return this.idempotency
      .execute(
        {
          scope: `booking-create:${principal.userId}`,
          key,
          payload: { ...input, customerUserId },
          ttlMs: 86_400_000,
          leaseMs: 30_000,
        },
        async (tx) => {
          await tx.$queryRaw`SELECT \`id\` FROM \`ClassSlot\` WHERE \`id\` = ${input.classSlotId} FOR UPDATE`;
          const slot = await tx.classSlot.findUnique({ where: { id: input.classSlotId } });
          if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          if (!customerFlow)
            this.requireBranch(principal, slot.branchId, 'booking:create:assisted');

          await tx.$queryRaw`SELECT \`id\` FROM \`CustomerPackage\` WHERE \`id\` = ${input.customerPackageId} FOR UPDATE`;
          const [customerPackage, customer] = await Promise.all([
            tx.customerPackage.findUnique({ where: { id: input.customerPackageId } }),
            tx.user.findUnique({ where: { id: customerUserId } }),
          ]);
          if (!customerPackage || !customer || customer.status !== 'ACTIVE')
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          if (
            customerPackage.customerUserId !== customerUserId ||
            customerPackage.branchId !== slot.branchId ||
            customerPackage.classTypeId !== slot.classTypeId
          )
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          if (customerPackage.status !== 'ACTIVE' || customerPackage.expiryAt <= new Date())
            throw new ApiProblem('INSUFFICIENT_AVAILABLE_SESSIONS', HttpStatus.CONFLICT);
          if (!['PUBLISHED', 'CONFIRMED'].includes(slot.status))
            throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
          const now = new Date();
          if (slot.startAt <= now)
            throw new ApiProblem('BOOKING_CUTOFF_PASSED', HttpStatus.CONFLICT);
          const cutoffAt = new Date(slot.startAt.getTime() - policy.cutoffHours * 3_600_000);
          if (now >= cutoffAt) throw new ApiProblem('BOOKING_CUTOFF_PASSED', HttpStatus.CONFLICT);

          const duplicate = await tx.booking.findFirst({
            where: {
              customerUserId,
              classSlotId: slot.id,
              status: { in: ['BOOKED', 'RESCHEDULE_PENDING'] },
            },
          });
          if (duplicate) throw new ApiProblem('DUPLICATE_ACTIVE_BOOKING', HttpStatus.CONFLICT);

          const [slotReserved, packageReserved, ledger] = await Promise.all([
            tx.sessionReservation.aggregate({
              where: { classSlotId: slot.id, status: 'ACTIVE' },
              _sum: { quantity: true },
            }),
            tx.sessionReservation.aggregate({
              where: { customerPackageId: customerPackage.id, status: 'ACTIVE' },
              _sum: { quantity: true },
            }),
            tx.ledgerEntry.aggregate({
              where: { customerPackageId: customerPackage.id },
              _sum: { quantity: true },
            }),
          ]);
          const booked = slotReserved._sum.quantity ?? 0;
          const reserved = packageReserved._sum.quantity ?? 0;
          const balance = ledger._sum.quantity ?? 0;
          if (booked >= slot.capacity)
            throw new ApiProblem('CLASS_CAPACITY_FULL', HttpStatus.CONFLICT);
          if (balance < 0 || reserved > balance)
            throw new ApiProblem('LEDGER_INVARIANT_VIOLATION', HttpStatus.CONFLICT);
          if (balance - reserved < 1)
            throw new ApiProblem('INSUFFICIENT_AVAILABLE_SESSIONS', HttpStatus.CONFLICT);

          const reservationId = randomUUID();
          const bookingId = randomUUID();
          await tx.sessionReservation.create({
            data: {
              id: reservationId,
              customerPackageId: customerPackage.id,
              classSlotId: slot.id,
              referenceHash: hash(`booking:${bookingId}`),
              quantity: 1,
            },
          });
          const booking = await tx.booking.create({
            data: {
              id: bookingId,
              branchId: slot.branchId,
              classSlotId: slot.id,
              customerUserId,
              customerPackageId: customerPackage.id,
              reservationId,
              createdById: principal.userId,
              source: input.source,
            },
          });
          await tx.classSlot.update({
            where: { id: slot.id },
            data: { bookedCount: booked + 1 },
          });
          await Promise.all([
            tx.auditLog.create({
              data: {
                id: randomUUID(),
                actorType: 'USER',
                actorId: principal.userId,
                branchId: slot.branchId,
                action: 'booking.created',
                objectType: 'Booking',
                objectId: booking.id,
                correlationId,
                afterMasked: { status: 'BOOKED', source: input.source, reservedQuantity: 1 },
              },
            }),
            tx.outboxEvent.create({
              data: {
                id: randomUUID(),
                eventType: 'booking.created.v1',
                aggregateType: 'Booking',
                aggregateId: booking.id,
                correlationId,
                payload: { bookingId: booking.id, classSlotId: slot.id, branchId: slot.branchId },
              },
            }),
            this.pilotOutbox?.record(tx, {
              branchId: slot.branchId,
              aggregateType: 'Booking',
              aggregateId: booking.id,
              operation: 'CREATE',
              correlationId,
              payload: {
                bookingId: booking.id,
                customerUserId,
                classSlotId: slot.id,
                customerPackageId: customerPackage.id,
                source: input.source,
              },
            }),
          ]);
          return { status: HttpStatus.CREATED, body: booking as unknown as Prisma.InputJsonValue };
        },
      )
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
          throw new ApiProblem('DUPLICATE_ACTIVE_BOOKING', HttpStatus.CONFLICT);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')
          throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
        throw error;
      });
  }
}
