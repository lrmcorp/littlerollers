import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import {
  Prisma,
  type RescheduleDecisionReasonCode,
  type RescheduleRequestReasonCode,
  type RescheduleStatus,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { PilotRollbackOutboxService } from '../migration/pilot-rollback-outbox.service';

export type RescheduleRequestCommand = {
  bookingId: string;
  targetClassSlotId: string;
  reasonCode: RescheduleRequestReasonCode;
  expectedBookingVersion: number;
};

export type RescheduleDecisionCommand = {
  reasonCode: RescheduleDecisionReasonCode;
  expectedVersion: number;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REQUEST_CODES: RescheduleRequestReasonCode[] = [
  'CUSTOMER_SCHEDULE_CONFLICT',
  'WRONG_CLASS_SELECTED',
  'PERSONAL_UNAVAILABLE',
];
const APPROVE_CODES: RescheduleDecisionReasonCode[] = ['ELIGIBILITY_VERIFIED'];
const REJECT_CODES: RescheduleDecisionReasonCode[] = [
  'TARGET_UNAVAILABLE',
  'OUTSIDE_POLICY',
  'OUT_OF_SCOPE',
];
const PAGE_SIZE = 20;
type Cursor = { at: string; id: string };
const maskPhone = (value: string | null) =>
  value && value.length > 5 ? `${value.slice(0, 4)}*****${value.slice(-2)}` : null;

export function isRescheduleEntitled(
  sourceStartAt: Date,
  evaluatedAt: Date,
  cutoffHours: number,
): boolean {
  return evaluatedAt.getTime() <= sourceStartAt.getTime() - cutoffHours * 3_600_000;
}

function encodeCursor(at: Date, id: string): string {
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

@Injectable()
export class ReschedulesService {
  constructor(
    private readonly db: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly policy: PolicyService,
    private readonly config: RuntimeConfigService,
    @Optional() private readonly pilotOutbox?: PilotRollbackOutboxService,
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
      where: { id: bookingId, customerUserId: principal.userId },
      include: {
        classSlot: {
          include: {
            branch: { select: { id: true, name: true, timezone: true } },
            classType: { select: { id: true, name: true } },
          },
        },
        customerPackage: true,
        reschedules: { orderBy: { requestedAt: 'desc' }, take: 1 },
      },
    });
    if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const now = new Date();
    const cutoffAt = new Date(booking.classSlot.startAt.getTime() - policy.cutoffHours * 3_600_000);
    const latestRequest = booking.reschedules[0] ?? null;
    const pending = latestRequest?.status === 'PENDING';
    const entitled = isRescheduleEntitled(booking.classSlot.startAt, now, policy.cutoffHours);
    const packageEligible =
      booking.customerPackage.status === 'ACTIVE' && booking.customerPackage.expiryAt > now;
    const canRequest = booking.status === 'BOOKED' && entitled && packageEligible && !pending;
    const candidates = canRequest
      ? await this.db.slotKelas.findMany({
          where: {
            id: { not: booking.classSlotId },
            branchId: booking.branchId,
            classTypeId: booking.classSlot.classTypeId,
            status: { in: ['PUBLISHED', 'CONFIRMED'] },
            startAt: { gt: new Date(now.getTime() + policy.bookingCutoffHours * 3_600_000) },
          },
          select: {
            id: true,
            branchId: true,
            classTypeId: true,
            startAt: true,
            endAt: true,
            timezone: true,
            status: true,
            capacity: true,
            bookedCount: true,
            branch: { select: { id: true, name: true, timezone: true } },
            classType: { select: { id: true, name: true } },
            reservations: { where: { status: 'ACTIVE' }, select: { quantity: true } },
          },
          orderBy: [{ startAt: 'asc' }, { id: 'asc' }],
          take: 50,
        })
      : [];
    const duplicateTargets = candidates.length
      ? await this.db.pemesananKelas.findMany({
          where: {
            id: { not: booking.id },
            customerUserId: principal.userId,
            classSlotId: { in: candidates.map(({ id }) => id) },
            status: { in: ['BOOKED', 'RESCHEDULE_PENDING'] },
          },
          select: { classSlotId: true },
        })
      : [];
    const duplicated = new Set(duplicateTargets.map(({ classSlotId }) => classSlotId));
    const targets = candidates
      .map(({ reservations, ...slot }) => ({
        ...slot,
        availableCapacity:
          slot.capacity - reservations.reduce((sum, item) => sum + item.quantity, 0),
      }))
      .filter(({ id, availableCapacity }) => availableCapacity > 0 && !duplicated.has(id));
    const unavailableReason = canRequest
      ? targets.length
        ? null
        : 'NO_ELIGIBLE_TARGET'
      : pending
        ? 'RESCHEDULE_PENDING'
        : booking.status !== 'BOOKED'
          ? 'BOOKING_NOT_ACTIVE'
          : !entitled
            ? 'RESCHEDULE_CUTOFF_PASSED'
            : 'PACKAGE_INELIGIBLE';
    return {
      bookingId: booking.id,
      bookingVersion: booking.version,
      sourceClassSlotId: booking.classSlotId,
      cutoffAt,
      canRequest,
      unavailableReason,
      supportAction: !entitled ? 'CONTACT_STUDIO' : null,
      source: {
        id: booking.classSlot.id,
        branchId: booking.classSlot.branchId,
        classTypeId: booking.classSlot.classTypeId,
        startAt: booking.classSlot.startAt,
        endAt: booking.classSlot.endAt,
        timezone: booking.classSlot.timezone,
        status: booking.classSlot.status,
        capacity: booking.classSlot.capacity,
        bookedCount: booking.classSlot.bookedCount,
        branch: booking.classSlot.branch,
        classType: booking.classSlot.classType,
      },
      latestRequest,
      targets,
    };
  }

  async list(
    principal: SessionPrincipal,
    query: { branchId?: string; status?: string; cursor?: string },
  ) {
    const customer = principal.capabilities.includes('reschedule:self:read');
    this.policy.requireCapability(
      principal.capabilities,
      customer ? 'reschedule:self:read' : 'reschedule:read',
    );
    const statuses: RescheduleStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];
    if (query.status && !statuses.includes(query.status as RescheduleStatus))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (query.branchId && !customer)
      this.requireBranch(principal, query.branchId, 'reschedule:read');
    const cursor = decodeCursor(query.cursor);
    const pendingQueue = query.status === 'PENDING';
    const branchScope = this.policy.capabilityBranchScope(principal, 'reschedule:read');
    const items = await this.db.ubahJadwal.findMany({
      where: {
        ...(customer ? { requestedById: principal.userId } : {}),
        ...(query.branchId
          ? { branchId: query.branchId }
          : customer
            ? {}
            : branchScope.all
              ? branchScope.excluded.length
                ? { branchId: { notIn: branchScope.excluded } }
                : {}
              : { branchId: { in: branchScope.included } }),
        ...(query.status ? { status: query.status as RescheduleStatus } : {}),
        ...(cursor
          ? {
              OR: [
                { requestedAt: { [pendingQueue ? 'gt' : 'lt']: new Date(cursor.at) } },
                {
                  requestedAt: new Date(cursor.at),
                  id: { [pendingQueue ? 'gt' : 'lt']: cursor.id },
                },
              ],
            }
          : {}),
      },
      orderBy: [
        { requestedAt: pendingQueue ? 'asc' : 'desc' },
        { id: pendingQueue ? 'asc' : 'desc' },
      ],
      take: PAGE_SIZE + 1,
      include: {
        branch: { select: { id: true, name: true, timezone: true } },
        booking: {
          select: {
            id: true,
            customer: { select: { id: true, displayName: true, phoneE164: true } },
            customerPackage: {
              select: { package: { select: { id: true, name: true } } },
            },
          },
        },
        sourceClassSlot: {
          select: {
            id: true,
            startAt: true,
            endAt: true,
            timezone: true,
            capacity: true,
            bookedCount: true,
            classType: { select: { id: true, name: true } },
          },
        },
        targetClassSlot: {
          select: {
            id: true,
            startAt: true,
            endAt: true,
            timezone: true,
            capacity: true,
            bookedCount: true,
            classType: { select: { id: true, name: true } },
          },
        },
      },
    });
    const hasMore = items.length > PAGE_SIZE;
    const pageItems = items.slice(0, PAGE_SIZE);
    const last = pageItems.at(-1);
    return {
      items: pageItems.map((item) => ({
        id: item.id,
        branchId: item.branchId,
        bookingId: item.bookingId,
        sourceClassSlotId: item.sourceClassSlotId,
        targetClassSlotId: item.targetClassSlotId,
        requestedById: item.requestedById,
        decidedById: item.decidedById,
        requestReasonCode: item.requestReasonCode,
        decisionReasonCode: item.decisionReasonCode,
        status: item.status,
        entitlementCutoffAt: item.entitlementCutoffAt,
        entitledAtRequest: item.entitledAtRequest,
        decidedAt: item.decidedAt,
        version: item.version,
        requestedAt: item.requestedAt,
        branch: item.branch,
        customer: {
          id: item.booking.customer.id,
          displayName: item.booking.customer.displayName,
          phoneMasked: maskPhone(item.booking.customer.phoneE164),
        },
        package: item.booking.customerPackage.package,
        sourceClassSlot: item.sourceClassSlot,
        targetClassSlot: item.targetClassSlot,
      })),
      page: {
        hasMore,
        nextCursor: hasMore && last ? encodeCursor(last.requestedAt, last.id) : null,
      },
    };
  }

  async request(
    principal: SessionPrincipal,
    input: RescheduleRequestCommand,
    key: string,
    correlationId: string,
  ) {
    if (
      !key ||
      !UUID.test(input.bookingId) ||
      !UUID.test(input.targetClassSlotId) ||
      !REQUEST_CODES.includes(input.reasonCode) ||
      !Number.isInteger(input.expectedBookingVersion) ||
      input.expectedBookingVersion < 0
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    this.policy.requireCapability(principal.capabilities, 'reschedule:self:request');
    const policy = this.syntheticPolicy();

    return this.idempotency
      .execute(
        {
          scope: `reschedule-request:${principal.userId}:${input.bookingId}`,
          key,
          payload: input,
          ttlMs: 86_400_000,
          leaseMs: 30_000,
        },
        async (tx) => {
          await tx.$queryRaw`SELECT \`id\` FROM \`PemesananKelas\` WHERE \`id\` = ${input.bookingId} FOR UPDATE`;
          const booking = await tx.pemesananKelas.findUnique({ where: { id: input.bookingId } });
          if (
            !booking ||
            booking.customerUserId !== principal.userId ||
            booking.status !== 'BOOKED'
          )
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          if (booking.version !== input.expectedBookingVersion)
            throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
          if (booking.classSlotId === input.targetClassSlotId)
            throw new ApiProblem('TARGET_CLASS_INELIGIBLE', HttpStatus.CONFLICT);

          const ids = [booking.classSlotId, input.targetClassSlotId].sort();
          await tx.$queryRaw`SELECT \`id\` FROM \`SlotKelas\` WHERE \`id\` IN (${ids[0]}, ${ids[1]}) ORDER BY \`id\` FOR UPDATE`;
          const [source, target, customerPackage] = await Promise.all([
            tx.slotKelas.findUnique({ where: { id: booking.classSlotId } }),
            tx.slotKelas.findUnique({ where: { id: input.targetClassSlotId } }),
            tx.paketPelanggan.findUnique({ where: { id: booking.customerPackageId } }),
          ]);
          if (!source || !target || !customerPackage)
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          const now = new Date();
          const entitlementCutoffAt = new Date(
            source.startAt.getTime() - policy.cutoffHours * 3_600_000,
          );
          if (!isRescheduleEntitled(source.startAt, now, policy.cutoffHours))
            throw new ApiProblem('RESCHEDULE_CUTOFF_PASSED', HttpStatus.CONFLICT, false, [
              { field: 'cutoffAt', issue: entitlementCutoffAt.toISOString() },
              { field: 'nextAction', issue: 'CONTACT_STUDIO' },
            ]);
          const targetCutoffAt = new Date(
            target.startAt.getTime() - policy.bookingCutoffHours * 3_600_000,
          );
          if (
            source.branchId !== target.branchId ||
            source.classTypeId !== target.classTypeId ||
            customerPackage.classTypeId !== target.classTypeId ||
            !['PUBLISHED', 'CONFIRMED'].includes(target.status) ||
            now >= targetCutoffAt ||
            customerPackage.status !== 'ACTIVE' ||
            customerPackage.expiryAt <= now
          )
            throw new ApiProblem('TARGET_CLASS_INELIGIBLE', HttpStatus.CONFLICT);
          const targetReserved = await tx.reservasiSesi.aggregate({
            where: { classSlotId: target.id, status: 'ACTIVE' },
            _sum: { quantity: true },
          });
          if ((targetReserved._sum.quantity ?? 0) >= target.capacity)
            throw new ApiProblem('TARGET_CLASS_FULL', HttpStatus.CONFLICT);
          if (
            await tx.pemesananKelas.findFirst({
              where: {
                id: { not: booking.id },
                customerUserId: booking.customerUserId,
                classSlotId: target.id,
                status: { in: ['BOOKED', 'RESCHEDULE_PENDING'] },
              },
            })
          )
            throw new ApiProblem('TARGET_CLASS_INELIGIBLE', HttpStatus.CONFLICT);

          const reschedule = await tx.ubahJadwal.create({
            data: {
              id: randomUUID(),
              branchId: booking.branchId,
              bookingId: booking.id,
              sourceClassSlotId: source.id,
              targetClassSlotId: target.id,
              requestedById: principal.userId,
              requestReasonCode: input.reasonCode,
              entitlementCutoffAt,
            },
          });
          await tx.pemesananKelas.update({
            where: { id: booking.id },
            data: { status: 'RESCHEDULE_PENDING', version: { increment: 1 } },
          });
          await tx.auditLog.create({
            data: {
              id: randomUUID(),
              actorType: 'USER',
              actorId: principal.userId,
              branchId: booking.branchId,
              action: 'booking.reschedule_requested',
              objectType: 'Reschedule',
              objectId: reschedule.id,
              correlationId,
              afterMasked: {
                status: 'PENDING',
                reasonCode: input.reasonCode,
                entitledAtRequest: true,
              },
            },
          });
          await tx.outboxEvent.create({
            data: {
              id: randomUUID(),
              eventType: 'booking.reschedule_requested.v1',
              aggregateType: 'Booking',
              aggregateId: booking.id,
              correlationId,
              payload: {
                bookingId: booking.id,
                rescheduleId: reschedule.id,
                branchId: booking.branchId,
                sourceClassSlotId: source.id,
                targetClassSlotId: target.id,
              },
            },
          });
          await this.pilotOutbox?.record(tx, {
            branchId: booking.branchId,
            aggregateType: 'Booking',
            aggregateId: booking.id,
            operation: 'RESCHEDULE_REQUEST',
            correlationId,
            payload: {
              bookingId: booking.id,
              rescheduleId: reschedule.id,
              sourceClassSlotId: source.id,
              targetClassSlotId: target.id,
              reasonCode: input.reasonCode,
            },
          });
          return {
            status: HttpStatus.CREATED,
            body: reschedule as unknown as Prisma.InputJsonValue,
          };
        },
      )
      .catch((error: unknown) => this.mapTransactionError(error));
  }

  async decide(
    principal: SessionPrincipal,
    id: string,
    decision: 'approve' | 'reject',
    input: RescheduleDecisionCommand,
    key: string,
    correlationId: string,
  ) {
    const allowedCodes = decision === 'approve' ? APPROVE_CODES : REJECT_CODES;
    if (
      !key ||
      !UUID.test(id) ||
      !['approve', 'reject'].includes(decision) ||
      !allowedCodes.includes(input.reasonCode) ||
      !Number.isInteger(input.expectedVersion) ||
      input.expectedVersion < 0
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    this.policy.requireCapability(principal.capabilities, 'reschedule:decide');
    const policy = this.syntheticPolicy();

    return this.idempotency
      .execute(
        {
          scope: `reschedule-decision:${id}`,
          key,
          payload: { decision, ...input },
          ttlMs: 86_400_000,
          leaseMs: 30_000,
        },
        async (tx) => {
          await tx.$queryRaw`SELECT \`id\` FROM \`UbahJadwal\` WHERE \`id\` = ${id} FOR UPDATE`;
          const reschedule = await tx.ubahJadwal.findUnique({ where: { id } });
          if (!reschedule) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          this.requireBranch(principal, reschedule.branchId, 'reschedule:decide');
          if (reschedule.status !== 'PENDING')
            throw new ApiProblem('RESCHEDULE_ALREADY_DECIDED', HttpStatus.CONFLICT);
          if (reschedule.version !== input.expectedVersion)
            throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
          if (decision === 'approve' && reschedule.requestedById === principal.userId)
            throw new ApiProblem('SELF_APPROVAL_FORBIDDEN', HttpStatus.FORBIDDEN);

          await tx.$queryRaw`SELECT \`id\` FROM \`PemesananKelas\` WHERE \`id\` = ${reschedule.bookingId} FOR UPDATE`;
          const booking = await tx.pemesananKelas.findUnique({
            where: { id: reschedule.bookingId },
          });
          if (!booking || booking.status !== 'RESCHEDULE_PENDING')
            throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);

          if (decision === 'reject') {
            const [updatedReschedule, updatedBooking] = await Promise.all([
              tx.ubahJadwal.update({
                where: { id },
                data: {
                  status: 'REJECTED',
                  decisionReasonCode: input.reasonCode,
                  decidedById: principal.userId,
                  decidedAt: new Date(),
                  version: { increment: 1 },
                },
              }),
              tx.pemesananKelas.update({
                where: { id: booking.id },
                data: { status: 'BOOKED', version: { increment: 1 } },
              }),
            ]);
            const eventId = randomUUID();
            await Promise.all([
              this.auditDecision(
                tx,
                principal,
                updatedReschedule.id,
                updatedReschedule.branchId,
                correlationId,
                'REJECTED',
                input.reasonCode,
              ),
              tx.outboxEvent.create({
                data: {
                  id: eventId,
                  eventType: 'booking.reschedule_rejected.v1',
                  aggregateType: 'Booking',
                  aggregateId: booking.id,
                  correlationId,
                  payload: { bookingId: booking.id, rescheduleId: id, branchId: booking.branchId },
                },
              }),
            ]);
            await this.pilotOutbox?.record(tx, {
              branchId: booking.branchId,
              aggregateType: 'Booking',
              aggregateId: booking.id,
              operation: 'RESCHEDULE_REJECT',
              correlationId,
              payload: {
                bookingId: booking.id,
                rescheduleId: id,
                reasonCode: input.reasonCode,
              },
            });
            return {
              status: HttpStatus.OK,
              body: {
                reschedule: updatedReschedule,
                booking: updatedBooking,
              } as unknown as Prisma.InputJsonValue,
            };
          }

          const slotIds = [reschedule.sourceClassSlotId, reschedule.targetClassSlotId].sort();
          await tx.$queryRaw`SELECT \`id\` FROM \`SlotKelas\` WHERE \`id\` IN (${slotIds[0]}, ${slotIds[1]}) ORDER BY \`id\` FOR UPDATE`;
          await tx.$queryRaw`SELECT \`id\` FROM \`ReservasiSesi\` WHERE \`id\` = ${booking.reservationId} FOR UPDATE`;
          const [source, target, reservation, customerPackage] = await Promise.all([
            tx.slotKelas.findUnique({ where: { id: reschedule.sourceClassSlotId } }),
            tx.slotKelas.findUnique({ where: { id: reschedule.targetClassSlotId } }),
            tx.reservasiSesi.findUnique({ where: { id: booking.reservationId } }),
            tx.paketPelanggan.findUnique({ where: { id: booking.customerPackageId } }),
          ]);
          const now = new Date();
          if (
            !source ||
            !target ||
            !reservation ||
            !customerPackage ||
            reservation.status !== 'ACTIVE' ||
            reservation.classSlotId !== source.id ||
            source.startAt <= now ||
            source.branchId !== target.branchId ||
            source.classTypeId !== target.classTypeId ||
            customerPackage.classTypeId !== target.classTypeId ||
            customerPackage.status !== 'ACTIVE' ||
            customerPackage.expiryAt <= now ||
            !['PUBLISHED', 'CONFIRMED'].includes(target.status) ||
            now >= new Date(target.startAt.getTime() - policy.bookingCutoffHours * 3_600_000)
          )
            throw new ApiProblem('TARGET_CLASS_INELIGIBLE', HttpStatus.CONFLICT);
          const [sourceReserved, targetReserved] = await Promise.all([
            tx.reservasiSesi.aggregate({
              where: { classSlotId: source.id, status: 'ACTIVE' },
              _sum: { quantity: true },
            }),
            tx.reservasiSesi.aggregate({
              where: { classSlotId: target.id, status: 'ACTIVE' },
              _sum: { quantity: true },
            }),
          ]);
          const sourceCount = sourceReserved._sum.quantity ?? 0;
          const targetCount = targetReserved._sum.quantity ?? 0;
          if (targetCount >= target.capacity)
            throw new ApiProblem('TARGET_CLASS_FULL', HttpStatus.CONFLICT);
          const duplicateTarget = await tx.pemesananKelas.findFirst({
            where: {
              id: { not: booking.id },
              customerUserId: booking.customerUserId,
              classSlotId: target.id,
              status: { in: ['BOOKED', 'RESCHEDULE_PENDING'] },
            },
          });
          if (duplicateTarget)
            throw new ApiProblem('DUPLICATE_ACTIVE_BOOKING', HttpStatus.CONFLICT);

          await tx.reservasiSesi.update({
            where: { id: reservation.id },
            data: { classSlotId: target.id },
          });
          const [updatedBooking, updatedReschedule] = await Promise.all([
            tx.pemesananKelas.update({
              where: { id: booking.id },
              data: { classSlotId: target.id, status: 'BOOKED', version: { increment: 1 } },
            }),
            tx.ubahJadwal.update({
              where: { id },
              data: {
                status: 'APPROVED',
                decisionReasonCode: input.reasonCode,
                decidedById: principal.userId,
                decidedAt: now,
                version: { increment: 1 },
              },
            }),
            tx.slotKelas.update({
              where: { id: source.id },
              data: { bookedCount: Math.max(0, sourceCount - reservation.quantity) },
            }),
            tx.slotKelas.update({
              where: { id: target.id },
              data: { bookedCount: targetCount + reservation.quantity },
            }),
          ]);
          const eventId = randomUUID();
          await Promise.all([
            this.auditDecision(
              tx,
              principal,
              id,
              updatedReschedule.branchId,
              correlationId,
              'APPROVED',
              input.reasonCode,
            ),
            tx.outboxEvent.create({
              data: {
                id: eventId,
                eventType: 'booking.rescheduled.v1',
                aggregateType: 'Booking',
                aggregateId: booking.id,
                correlationId,
                payload: {
                  bookingId: booking.id,
                  rescheduleId: id,
                  sourceClassSlotId: source.id,
                  targetClassSlotId: target.id,
                  branchId: booking.branchId,
                },
              },
            }),
          ]);
          await this.pilotOutbox?.record(tx, {
            branchId: booking.branchId,
            aggregateType: 'Booking',
            aggregateId: booking.id,
            operation: 'RESCHEDULE_APPROVE',
            correlationId,
            occurredAt: now,
            payload: {
              bookingId: booking.id,
              rescheduleId: id,
              sourceClassSlotId: source.id,
              targetClassSlotId: target.id,
              reasonCode: input.reasonCode,
            },
          });
          return {
            status: HttpStatus.OK,
            body: {
              reschedule: updatedReschedule,
              booking: updatedBooking,
            } as unknown as Prisma.InputJsonValue,
          };
        },
      )
      .catch((error: unknown) => this.mapTransactionError(error));
  }

  private auditDecision(
    tx: Prisma.TransactionClient,
    principal: SessionPrincipal,
    id: string,
    branchId: string,
    correlationId: string,
    status: 'APPROVED' | 'REJECTED',
    reasonCode: RescheduleDecisionReasonCode,
  ) {
    return tx.auditLog.create({
      data: {
        id: randomUUID(),
        actorType: 'USER',
        actorId: principal.userId,
        branchId,
        action: status === 'APPROVED' ? 'booking.rescheduled' : 'booking.reschedule_rejected',
        objectType: 'Reschedule',
        objectId: id,
        correlationId,
        beforeMasked: { status: 'PENDING' },
        afterMasked: { status, reasonCode },
      },
    });
  }

  private mapTransactionError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = JSON.stringify(error.meta?.target ?? '');
      throw new ApiProblem(
        target.includes('activeCustomerSlot')
          ? 'DUPLICATE_ACTIVE_BOOKING'
          : 'PENDING_RESCHEDULE_EXISTS',
        HttpStatus.CONFLICT,
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')
      throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
    throw error;
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
