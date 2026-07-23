import { HttpStatus, Injectable } from '@nestjs/common';
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

export function isRescheduleEntitled(
  sourceStartAt: Date,
  evaluatedAt: Date,
  cutoffHours: number,
): boolean {
  return evaluatedAt.getTime() < sourceStartAt.getTime() - cutoffHours * 3_600_000;
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
  ) {}

  private syntheticPolicy() {
    const booking = this.config.value.booking;
    const reschedule = this.config.value.reschedule;
    if (
      !booking.syntheticEnabled ||
      booking.cutoffHours === null ||
      !reschedule.syntheticEnabled ||
      reschedule.cutoffHours === null
    )
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE);
    return { bookingCutoffHours: booking.cutoffHours, cutoffHours: reschedule.cutoffHours };
  }

  private requireBranch(principal: SessionPrincipal, branchId: string) {
    if (!principal.capabilities.includes('branch:all') && !principal.branchIds.includes(branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
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
    if (query.branchId && !customer) this.requireBranch(principal, query.branchId);
    const cursor = decodeCursor(query.cursor);
    const items = await this.db.reschedule.findMany({
      where: {
        ...(customer ? { requestedById: principal.userId } : {}),
        ...(query.branchId
          ? { branchId: query.branchId }
          : customer || principal.capabilities.includes('branch:all')
            ? {}
            : { branchId: { in: principal.branchIds } }),
        ...(query.status ? { status: query.status as RescheduleStatus } : {}),
        ...(cursor
          ? {
              OR: [
                { requestedAt: { lt: new Date(cursor.at) } },
                { requestedAt: new Date(cursor.at), id: { lt: cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
    });
    const hasMore = items.length > PAGE_SIZE;
    const pageItems = items.slice(0, PAGE_SIZE);
    const last = pageItems.at(-1);
    return {
      items: pageItems,
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
          await tx.$queryRaw`SELECT "id" FROM "Booking" WHERE "id" = ${input.bookingId}::uuid FOR UPDATE`;
          const booking = await tx.booking.findUnique({ where: { id: input.bookingId } });
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
          await tx.$queryRaw`SELECT "id" FROM "ClassSlot" WHERE "id" IN (${ids[0]}::uuid, ${ids[1]}::uuid) ORDER BY "id" FOR UPDATE`;
          const [source, target, customerPackage] = await Promise.all([
            tx.classSlot.findUnique({ where: { id: booking.classSlotId } }),
            tx.classSlot.findUnique({ where: { id: input.targetClassSlotId } }),
            tx.customerPackage.findUnique({ where: { id: booking.customerPackageId } }),
          ]);
          if (!source || !target || !customerPackage)
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          const now = new Date();
          const entitlementCutoffAt = new Date(
            source.startAt.getTime() - policy.cutoffHours * 3_600_000,
          );
          if (!isRescheduleEntitled(source.startAt, now, policy.cutoffHours))
            throw new ApiProblem('RESCHEDULE_CUTOFF_PASSED', HttpStatus.CONFLICT);
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
          const targetReserved = await tx.sessionReservation.aggregate({
            where: { classSlotId: target.id, status: 'ACTIVE' },
            _sum: { quantity: true },
          });
          if ((targetReserved._sum.quantity ?? 0) >= target.capacity)
            throw new ApiProblem('TARGET_CLASS_FULL', HttpStatus.CONFLICT);
          if (
            await tx.booking.findFirst({
              where: {
                id: { not: booking.id },
                customerUserId: booking.customerUserId,
                classSlotId: target.id,
                status: { in: ['BOOKED', 'RESCHEDULE_PENDING'] },
              },
            })
          )
            throw new ApiProblem('TARGET_CLASS_INELIGIBLE', HttpStatus.CONFLICT);

          const reschedule = await tx.reschedule.create({
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
          await tx.booking.update({
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
    this.policy.requireMfa(principal.assurance);
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
          await tx.$queryRaw`SELECT "id" FROM "Reschedule" WHERE "id" = ${id}::uuid FOR UPDATE`;
          const reschedule = await tx.reschedule.findUnique({ where: { id } });
          if (!reschedule) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          this.requireBranch(principal, reschedule.branchId);
          if (reschedule.status !== 'PENDING')
            throw new ApiProblem('RESCHEDULE_ALREADY_DECIDED', HttpStatus.CONFLICT);
          if (reschedule.version !== input.expectedVersion)
            throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);

          await tx.$queryRaw`SELECT "id" FROM "Booking" WHERE "id" = ${reschedule.bookingId}::uuid FOR UPDATE`;
          const booking = await tx.booking.findUnique({ where: { id: reschedule.bookingId } });
          if (!booking || booking.status !== 'RESCHEDULE_PENDING')
            throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);

          if (decision === 'reject') {
            const [updatedReschedule, updatedBooking] = await Promise.all([
              tx.reschedule.update({
                where: { id },
                data: {
                  status: 'REJECTED',
                  decisionReasonCode: input.reasonCode,
                  decidedById: principal.userId,
                  decidedAt: new Date(),
                  version: { increment: 1 },
                },
              }),
              tx.booking.update({
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
            return {
              status: HttpStatus.OK,
              body: {
                reschedule: updatedReschedule,
                booking: updatedBooking,
              } as unknown as Prisma.InputJsonValue,
            };
          }

          const slotIds = [reschedule.sourceClassSlotId, reschedule.targetClassSlotId].sort();
          await tx.$queryRaw`SELECT "id" FROM "ClassSlot" WHERE "id" IN (${slotIds[0]}::uuid, ${slotIds[1]}::uuid) ORDER BY "id" FOR UPDATE`;
          await tx.$queryRaw`SELECT "id" FROM "SessionReservation" WHERE "id" = ${booking.reservationId}::uuid FOR UPDATE`;
          const [source, target, reservation, customerPackage] = await Promise.all([
            tx.classSlot.findUnique({ where: { id: reschedule.sourceClassSlotId } }),
            tx.classSlot.findUnique({ where: { id: reschedule.targetClassSlotId } }),
            tx.sessionReservation.findUnique({ where: { id: booking.reservationId } }),
            tx.customerPackage.findUnique({ where: { id: booking.customerPackageId } }),
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
            tx.sessionReservation.aggregate({
              where: { classSlotId: source.id, status: 'ACTIVE' },
              _sum: { quantity: true },
            }),
            tx.sessionReservation.aggregate({
              where: { classSlotId: target.id, status: 'ACTIVE' },
              _sum: { quantity: true },
            }),
          ]);
          const sourceCount = sourceReserved._sum.quantity ?? 0;
          const targetCount = targetReserved._sum.quantity ?? 0;
          if (targetCount >= target.capacity)
            throw new ApiProblem('TARGET_CLASS_FULL', HttpStatus.CONFLICT);

          await tx.sessionReservation.update({
            where: { id: reservation.id },
            data: { classSlotId: target.id },
          });
          const [updatedBooking, updatedReschedule] = await Promise.all([
            tx.booking.update({
              where: { id: booking.id },
              data: { classSlotId: target.id, status: 'BOOKED', version: { increment: 1 } },
            }),
            tx.reschedule.update({
              where: { id },
              data: {
                status: 'APPROVED',
                decisionReasonCode: input.reasonCode,
                decidedById: principal.userId,
                decidedAt: now,
                version: { increment: 1 },
              },
            }),
            tx.classSlot.update({
              where: { id: source.id },
              data: { bookedCount: Math.max(0, sourceCount - reservation.quantity) },
            }),
            tx.classSlot.update({
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      throw new ApiProblem('PENDING_RESCHEDULE_EXISTS', HttpStatus.CONFLICT);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')
      throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
    throw error;
  }
}
