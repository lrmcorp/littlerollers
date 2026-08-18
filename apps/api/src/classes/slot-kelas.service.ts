import { HttpStatus, Injectable } from '@nestjs/common';
import { ClassSlotStatus, Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { dateInTimeZone } from '../identity/assignment-boundary';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
const PAGE_SIZE = 20;
export const CANCELLATION_REASONS = [
  'STUDIO_UNAVAILABLE',
  'INSTRUCTOR_UNAVAILABLE',
  'SAFETY_ISSUE',
  'OTHER_REVIEW_REQUIRED',
] as const;
export type ClassSlotCancellationReason = (typeof CANCELLATION_REASONS)[number];
type Tx = Prisma.TransactionClient;

function instant(value: string) {
  if (!OFFSET.test(value)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  const result = new Date(value);
  if (Number.isNaN(result.getTime()))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  return result;
}
function decodeCursor(value?: string): { at: Date; id: string } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString()) as {
      at: string;
      id: string;
    };
    if (!UUID.test(parsed.id)) throw new Error();
    return { at: instant(parsed.at), id: parsed.id };
  } catch {
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }
}
const encodeCursor = (at: Date, id: string) =>
  Buffer.from(JSON.stringify({ at: at.toISOString(), id })).toString('base64url');

export function classCompletionControlHash(
  bookings: Array<{
    id: string;
    status: string;
    reservedQuantity: number;
    reservation: { status: string; quantity: number };
    attendance: { id: string } | null;
  }>,
) {
  const projection = bookings
    .map((booking) => ({
      id: booking.id,
      status: booking.status,
      reservedQuantity: booking.reservedQuantity,
      reservationStatus: booking.reservation.status,
      reservationQuantity: booking.reservation.quantity,
      attended: Boolean(booking.attendance),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  return createHash('sha256').update(JSON.stringify(projection)).digest('hex');
}

@Injectable()
export class ClassSlotService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly idempotency: IdempotencyService,
    private readonly config: RuntimeConfigService,
  ) {}

  private scope(principal: SessionPrincipal, branchId: string, capability: string) {
    if (
      !this.policy.hasCapability(principal, 'branch:all', branchId) &&
      !this.policy.hasCapability(principal, capability, branchId)
    )
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
  private manage(principal: SessionPrincipal) {
    this.policy.requireCapability(principal.capabilities, 'class-slot:manage');
  }
  private view(slot: {
    id: string;
    branchId: string;
    classTypeId: string;
    instructorUserId: string | null;
    startAt: Date;
    endAt: Date;
    timezone: string;
    minimumQuota: number;
    capacity: number;
    bookedCount: number;
    status: ClassSlotStatus;
    cancellationReasonCode: string | null;
    version: number;
  }) {
    return { ...slot, cancellationReasonCode: slot.cancellationReasonCode ?? null };
  }

  async list(
    principal: SessionPrincipal,
    input: {
      branchId?: string;
      status?: string;
      from?: string;
      until?: string;
      cursor?: string;
      includeHistorical?: boolean;
    },
  ) {
    this.policy.requireCapability(principal.capabilities, 'class-slot:read');
    if (input.includeHistorical)
      this.policy.requireCapability(principal.capabilities, 'migration:read');
    const isCustomer =
      principal.roles.some((item) => item.role === 'CUSTOMER') &&
      !principal.capabilities.includes('class-slot:manage');
    if (input.branchId && !isCustomer) this.scope(principal, input.branchId, 'class-slot:read');
    const allowed = Object.values(ClassSlotStatus);
    if (input.status && !allowed.includes(input.status as ClassSlotStatus))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const from = input.from ? instant(input.from) : undefined;
    const until = input.until ? instant(input.until) : undefined;
    if (from && until && from >= until)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const cursor = decodeCursor(input.cursor);
    const isInstructor =
      principal.roles.some((item) => item.role === 'INSTRUCTOR') &&
      !principal.capabilities.includes('class-slot:manage');
    const branchScope = this.policy.capabilityBranchScope(principal, 'class-slot:read');
    const items = await this.db.slotKelas.findMany({
      where: {
        ...(input.includeHistorical ? {} : { historical: false }),
        ...(input.branchId
          ? { branchId: input.branchId }
          : isCustomer
            ? {}
            : branchScope.all
              ? branchScope.excluded.length
                ? { branchId: { notIn: branchScope.excluded } }
                : {}
              : { branchId: { in: branchScope.included } }),
        ...(input.status
          ? { status: input.status as ClassSlotStatus }
          : isCustomer
            ? { status: 'PUBLISHED' as const }
            : {}),
        ...(isInstructor ? { instructorUserId: principal.userId } : {}),
        ...(from ? { endAt: { gt: from } } : {}),
        ...(until ? { startAt: { lt: until } } : {}),
        ...(cursor
          ? { OR: [{ startAt: { lt: cursor.at } }, { startAt: cursor.at, id: { lt: cursor.id } }] }
          : {}),
      },
      orderBy: [{ startAt: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
    });
    const page = items.slice(0, PAGE_SIZE);
    const last = page.at(-1);
    return {
      items: page.map((item) => this.view(item)),
      page: {
        hasMore: items.length > PAGE_SIZE,
        nextCursor: items.length > PAGE_SIZE && last ? encodeCursor(last.startAt, last.id) : null,
      },
    };
  }

  async create(
    principal: SessionPrincipal,
    input: {
      branchId: string;
      classTypeId: string;
      studioId: string;
      roomId?: string;
      instructorUserId?: string;
      startAt: string;
      endAt: string;
    },
    key: string,
    correlationId: string,
  ) {
    this.manage(principal);
    this.validateKey(key);
    if (
      !UUID.test(input.branchId) ||
      !UUID.test(input.classTypeId) ||
      !UUID.test(input.studioId) ||
      (input.roomId && !UUID.test(input.roomId)) ||
      (input.instructorUserId && !UUID.test(input.instructorUserId))
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const startAt = instant(input.startAt);
    const endAt = instant(input.endAt);
    if (startAt >= endAt) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.execute(
      principal,
      `class-slot:create:${principal.userId}`,
      key,
      input,
      HttpStatus.CREATED,
      async (tx) => {
        this.scope(principal, input.branchId, 'class-slot:manage');
        const [branch, classType, studio, room] = await Promise.all([
          tx.cabang.findUnique({ where: { id: input.branchId } }),
          tx.jenisKelas.findUnique({
            where: { id: input.classTypeId },
            include: { branchScopes: { where: { branchId: input.branchId, active: true } } },
          }),
          tx.studio.findUnique({ where: { id: input.studioId } }),
          input.roomId ? tx.ruangan.findUnique({ where: { id: input.roomId } }) : null,
        ]);
        if (
          !branch?.active ||
          !classType?.active ||
          classType.branchScopes.length !== 1 ||
          !studio?.active ||
          studio.branchId !== branch.id ||
          (input.roomId && (!room?.active || room.studioId !== studio.id))
        )
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        const config = await this.configuration(
          tx,
          branch.id,
          classType.id,
          startAt,
          branch.timezone,
        );
        if (input.instructorUserId) {
          await this.instructorCoverage(
            tx,
            input.instructorUserId,
            branch.id,
            startAt,
            endAt,
            branch.timezone,
          );
          await this.ensureNoInstructorOverlap(tx, input.instructorUserId, startAt, endAt);
        }
        const slot = await tx.slotKelas.create({
          data: {
            id: newId(),
            branchId: branch.id,
            classTypeId: classType.id,
            studioId: studio.id,
            roomId: room?.id,
            instructorUserId: input.instructorUserId,
            startAt,
            endAt,
            timezone: branch.timezone,
            minimumQuota: config.minimumQuota,
            capacity: config.defaultCapacity,
          },
        });
        await this.audit(tx, principal, correlationId, 'class.slot.created', slot, null);
        return this.view(slot);
      },
    );
  }

  async assign(
    principal: SessionPrincipal,
    id: string,
    input: { instructorUserId: string; expectedVersion: number },
    key: string,
    correlationId: string,
  ) {
    this.manage(principal);
    this.validateKey(key);
    if (
      !UUID.test(id) ||
      !UUID.test(input.instructorUserId) ||
      !Number.isInteger(input.expectedVersion)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.execute(
      principal,
      `class-slot:assign:${id}`,
      key,
      input,
      HttpStatus.OK,
      async (tx) => {
        const current = await this.visible(tx, principal, id);
        this.requireDraftVersion(current, input.expectedVersion);
        await this.instructorCoverage(
          tx,
          input.instructorUserId,
          current.branchId,
          current.startAt,
          current.endAt,
          current.timezone,
        );
        await this.ensureNoInstructorOverlap(
          tx,
          input.instructorUserId,
          current.startAt,
          current.endAt,
          current.id,
        );
        const slot = await tx.slotKelas.update({
          where: { id: current.id },
          data: { instructorUserId: input.instructorUserId, version: { increment: 1 } },
        });
        await this.audit(
          tx,
          principal,
          correlationId,
          'class.slot.instructor_assigned',
          slot,
          this.view(current),
        );
        return this.view(slot);
      },
    );
  }

  async update(
    principal: SessionPrincipal,
    id: string,
    input: {
      classTypeId: string;
      instructorUserId?: string | null;
      startAt: string;
      endAt: string;
      expectedVersion: number;
      reason: string;
    },
    key: string,
    correlationId: string,
  ) {
    this.manage(principal);
    this.validateKey(key);
    if (
      !UUID.test(id) ||
      !UUID.test(input.classTypeId) ||
      (input.instructorUserId && !UUID.test(input.instructorUserId)) ||
      !Number.isInteger(input.expectedVersion) ||
      input.reason.trim().length < 3 ||
      input.reason.trim().length > 500
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const startAt = instant(input.startAt);
    const endAt = instant(input.endAt);
    if (startAt >= endAt) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.execute(
      principal,
      `class-slot:update:${id}`,
      key,
      input,
      HttpStatus.OK,
      async (tx) => {
        const current = await this.visible(tx, principal, id);
        this.requireDraftVersion(current, input.expectedVersion);
        const [branch, classType] = await Promise.all([
          tx.cabang.findUnique({ where: { id: current.branchId } }),
          tx.jenisKelas.findUnique({ where: { id: input.classTypeId } }),
        ]);
        if (!branch?.active || !classType?.active || classType.branchId !== current.branchId)
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        const configuration = await this.configuration(
          tx,
          current.branchId,
          input.classTypeId,
          startAt,
          branch.timezone,
        );
        const instructorUserId = input.instructorUserId || null;
        if (instructorUserId) {
          await this.instructorCoverage(
            tx,
            instructorUserId,
            current.branchId,
            startAt,
            endAt,
            branch.timezone,
          );
          await this.ensureNoInstructorOverlap(tx, instructorUserId, startAt, endAt, current.id);
        }
        const slot = await tx.slotKelas.update({
          where: { id: current.id },
          data: {
            classTypeId: input.classTypeId,
            instructorUserId,
            startAt,
            endAt,
            timezone: branch.timezone,
            minimumQuota: configuration.minimumQuota,
            capacity: configuration.defaultCapacity,
            version: { increment: 1 },
          },
        });
        await this.audit(tx, principal, correlationId, 'class.slot.updated', slot, {
          ...this.view(current),
          reason: input.reason.trim(),
        });
        return this.view(slot);
      },
    );
  }

  async publish(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number },
    key: string,
    correlationId: string,
  ) {
    this.manage(principal);
    this.validateKey(key);
    return this.execute(
      principal,
      `class-slot:publish:${id}`,
      key,
      input,
      HttpStatus.OK,
      async (tx) => {
        const current = await this.visible(tx, principal, id);
        this.requireDraftVersion(current, input.expectedVersion);
        if (!current.instructorUserId)
          throw new ApiProblem('AVAILABILITY_REQUIRED', HttpStatus.CONFLICT);
        const effective = await this.configuration(
          tx,
          current.branchId,
          current.classTypeId,
          current.startAt,
          current.timezone,
        );
        if (
          effective.minimumQuota !== current.minimumQuota ||
          effective.defaultCapacity !== current.capacity
        )
          throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
        await this.instructorCoverage(
          tx,
          current.instructorUserId,
          current.branchId,
          current.startAt,
          current.endAt,
          current.timezone,
        );
        const slot = await tx.slotKelas.update({
          where: { id },
          data: { status: 'PUBLISHED', version: { increment: 1 } },
        });
        const dueAt = new Date(slot.startAt.getTime() - 24 * 60 * 60 * 1000);
        await tx.quotaEvaluationJob.upsert({
          where: { classSlotId: slot.id },
          create: {
            id: newId(),
            classSlotId: slot.id,
            evaluationKey: `H24:${slot.id}`,
            dueAt,
            nextAttemptAt: dueAt,
            maxAttempts: this.config.value.quotaEvaluation.maxAttempts,
          },
          update: {},
        });
        await this.audit(
          tx,
          principal,
          correlationId,
          'class.slot.published',
          slot,
          this.view(current),
        );
        await tx.outboxEvent.create({
          data: {
            id: newId(),
            eventType: 'class.published.v1',
            aggregateType: 'ClassSlot',
            aggregateId: id,
            payload: {
              classSlotId: id,
              branchId: slot.branchId,
              startAt: slot.startAt.toISOString(),
              status: slot.status,
            },
            correlationId,
          },
        });
        return this.view(slot);
      },
    );
  }

  async cancel(
    principal: SessionPrincipal,
    id: string,
    input: { reasonCode: ClassSlotCancellationReason; expectedVersion: number },
    key: string,
    correlationId: string,
  ) {
    this.manage(principal);
    this.validateKey(key);
    if (!CANCELLATION_REASONS.includes(input.reasonCode))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.execute(
      principal,
      `class-slot:cancel:${id}`,
      key,
      input,
      HttpStatus.OK,
      async (tx) => {
        const current = await this.visible(tx, principal, id);
        if (current.version !== input.expectedVersion)
          throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        if (!['DRAFT', 'PUBLISHED'].includes(current.status))
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        const released = await tx.reservasiSesi.updateMany({
          where: { classSlotId: id, status: 'ACTIVE' },
          data: { status: 'RELEASED', releasedAt: new Date() },
        });
        const slot = await tx.slotKelas.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            cancellationReasonCode: input.reasonCode,
            version: { increment: 1 },
          },
        });
        await this.audit(
          tx,
          principal,
          correlationId,
          'class.slot.cancelled',
          slot,
          this.view(current),
        );
        await tx.outboxEvent.create({
          data: {
            id: newId(),
            eventType: 'class.manual_cancelled.v1',
            aggregateType: 'ClassSlot',
            aggregateId: id,
            payload: {
              classSlotId: id,
              branchId: slot.branchId,
              reasonCode: input.reasonCode,
              releasedReservationCount: released.count,
              status: slot.status,
            },
            correlationId,
          },
        });
        return this.view(slot);
      },
    );
  }

  async complete(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number; controlHash: string; reason: string },
    key: string,
    correlationId: string,
    now = new Date(),
  ) {
    this.validateKey(key);
    if (
      !UUID.test(id) ||
      !Number.isInteger(input.expectedVersion) ||
      input.expectedVersion < 0 ||
      !/^[a-f0-9]{64}$/iu.test(input.controlHash) ||
      input.reason?.trim().length < 3 ||
      input.reason.trim().length > 500
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.execute(
      principal,
      `class-slot:complete:${id}`,
      key,
      input,
      HttpStatus.OK,
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`SlotKelas\` WHERE \`id\` = ${id} FOR UPDATE`;
        const slot = await tx.slotKelas.findUnique({ where: { id } });
        if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        const ownInstructor =
          slot.instructorUserId === principal.userId &&
          this.policy.hasCapability(principal, 'attendance:self', slot.branchId);
        if (!ownInstructor) {
          this.policy.requireCapability(principal.capabilities, 'class-slot:manage');
          this.scope(principal, slot.branchId, 'class-slot:manage');
        }
        if (slot.version !== input.expectedVersion)
          throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        if (slot.status !== 'CONFIRMED')
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        if (slot.endAt > now) throw new ApiProblem('CLASS_NOT_ENDED', HttpStatus.CONFLICT);

        const instructorAttendance = await tx.kehadiranInstruktur.findUnique({
          where: { classSlotId: id },
        });
        let instructorFee: { id: string; feeRp: number; instructorUserId: string } | undefined;
        if (instructorAttendance) {
          await tx.$queryRaw`SELECT \`id\` FROM \`Cabang\` WHERE \`id\` = ${slot.branchId} FOR UPDATE`;
          if (
            !slot.instructorUserId ||
            instructorAttendance.instructorUserId !== slot.instructorUserId ||
            instructorAttendance.branchId !== slot.branchId
          )
            throw new ApiProblem('FINANCE_CONFIGURATION_INCOMPLETE', HttpStatus.CONFLICT);
          const localDate = dateInTimeZone(slot.endAt, slot.timezone);
          const effectiveDate = new Date(`${localDate}T00:00:00.000Z`);
          const candidates = await tx.konfigurasiEfektif.findMany({
            where: {
              kind: 'INSTRUCTOR_FEE',
              branchId: slot.branchId,
              classTypeId: slot.classTypeId,
              effectiveFrom: { lte: effectiveDate },
              OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: effectiveDate } }],
            },
            select: { id: true, value: true },
          });
          const matched = candidates.flatMap((candidate) => {
            const value = candidate.value as { instructorUserId?: unknown; feeRp?: unknown };
            return value.instructorUserId === slot.instructorUserId &&
              Number.isSafeInteger(value.feeRp) &&
              (value.feeRp as number) >= 0
              ? [
                  {
                    id: candidate.id,
                    instructorUserId: slot.instructorUserId!,
                    feeRp: value.feeRp as number,
                  },
                ]
              : [];
          });
          if (matched.length !== 1)
            throw new ApiProblem('FINANCE_CONFIGURATION_INCOMPLETE', HttpStatus.CONFLICT);
          instructorFee = matched[0];
          const financePeriod = await tx.periodeKeuangan.findUnique({
            where: {
              branchId_period: {
                branchId: slot.branchId,
                period: localDate.slice(0, 7),
              },
            },
            select: { status: true },
          });
          if (financePeriod?.status === 'CLOSED')
            throw new ApiProblem('FINANCE_PERIOD_CLOSED', HttpStatus.LOCKED);
        }

        const bookings = await tx.pemesananKelas.findMany({
          where: { classSlotId: id },
          orderBy: { id: 'asc' },
          include: {
            reservation: true,
            attendance: { select: { id: true } },
          },
        });
        if (bookings.some((booking) => booking.status === 'RESCHEDULE_PENDING'))
          throw new ApiProblem('PENDING_RESCHEDULE_EXISTS', HttpStatus.CONFLICT);
        if (classCompletionControlHash(bookings) !== input.controlHash)
          throw new ApiProblem('COMPLETION_CONTROL_MISMATCH', HttpStatus.CONFLICT);

        const attendanceBookings = bookings.filter(
          (booking) =>
            booking.reservation.status === 'ACTIVE' &&
            ['BOOKED', 'ATTENDED'].includes(booking.status),
        );
        if (
          attendanceBookings.some(
            (booking) =>
              booking.reservation.quantity !== booking.reservedQuantity ||
              booking.reservation.customerPackageId !== booking.customerPackageId ||
              booking.reservation.classSlotId !== id,
          )
        )
          throw new ApiProblem('RESERVATION_INVARIANT_VIOLATION', HttpStatus.CONFLICT);

        const ledgerEntryIds: string[] = [];
        const releasedReservationIds: string[] = [];
        let attendedCount = 0;
        let noShowCount = 0;
        for (const booking of attendanceBookings) {
          const reservationClaim = await tx.reservasiSesi.updateMany({
            where: { id: booking.reservationId, status: 'ACTIVE' },
            data: { status: 'CONSUMED', consumedAt: now },
          });
          if (reservationClaim.count !== 1)
            throw new ApiProblem('RESERVATION_INVARIANT_VIOLATION', HttpStatus.CONFLICT);
          const ledger = await tx.entriBukuBesar.create({
            data: {
              id: newId(),
              customerPackageId: booking.customerPackageId,
              type: 'ATTEND',
              quantity: -booking.reservedQuantity,
              referenceType: 'CLASS_COMPLETION',
              referenceId: booking.id,
              occurredAt: slot.endAt,
            },
          });
          ledgerEntryIds.push(ledger.id);
          const attended = Boolean(booking.attendance);
          attendedCount += attended ? 1 : 0;
          noShowCount += attended ? 0 : 1;
          await tx.pemesananKelas.update({
            where: { id: booking.id },
            data: { status: attended ? 'ATTENDED' : 'NO_SHOW', version: { increment: 1 } },
          });
          await tx.hasilKehadiranPemesanan.upsert({
            where: { bookingId: booking.id },
            create: {
              bookingId: booking.id,
              outcome: attended ? 'ATTENDED' : 'NO_SHOW',
              occurredAt: now,
            },
            update: {
              outcome: attended ? 'ATTENDED' : 'NO_SHOW',
              occurredAt: now,
            },
          });
          await tx.checkInToken.updateMany({
            where: { bookingId: booking.id, status: 'ACTIVE' },
            data: {
              status: 'REVOKED',
              activeBookingKey: null,
              revokedAt: now,
              version: { increment: 1 },
            },
          });
        }
        const invalidActiveReservation = bookings.some(
          (booking) =>
            booking.reservation.status === 'ACTIVE' &&
            !['BOOKED', 'ATTENDED'].includes(booking.status),
        );
        if (invalidActiveReservation)
          throw new ApiProblem('RESERVATION_INVARIANT_VIOLATION', HttpStatus.CONFLICT);

        const hourLogIds: string[] = [];
        if (instructorAttendance && instructorFee) {
          const hourLog = await tx.rekapJamInstruktur.create({
            data: {
              classSlotId: id,
              instructorUserId: instructorAttendance.instructorUserId,
              branchId: slot.branchId,
              classTypeId: slot.classTypeId,
              effectiveConfigurationId: instructorFee.id,
              matchedUnits: 1,
              feeRpSnapshot: instructorFee.feeRp,
              amountRp: instructorFee.feeRp,
              period: dateInTimeZone(slot.endAt, slot.timezone).slice(0, 7),
              occurredAt: now,
            },
          });
          hourLogIds.push(hourLog.id);
        }

        const completed = await tx.slotKelas.update({
          where: { id },
          data: { status: 'COMPLETED', bookedCount: 0, version: { increment: 1 } },
        });
        const auditLogId = newId();
        await tx.auditLog.create({
          data: {
            id: auditLogId,
            actorType: 'USER',
            actorId: principal.userId,
            branchId: slot.branchId,
            action: 'class.slot.completed',
            objectType: 'ClassSlot',
            objectId: id,
            beforeMasked: { status: slot.status, bookedCount: slot.bookedCount },
            afterMasked: {
              status: completed.status,
              attendedCount,
              noShowCount,
              reasonPresent: true,
            },
            correlationId,
          },
        });
        const outbox = await tx.outboxEvent.create({
          data: {
            id: newId(),
            eventType: 'class.completed.v1',
            aggregateType: 'ClassSlot',
            aggregateId: id,
            payload: {
              classSlotId: id,
              branchId: slot.branchId,
              attendedCount,
              noShowCount,
              ledgerEntryIds,
              hourLogIds,
            },
            correlationId,
          },
        });
        return {
          classSlotId: id,
          status: completed.status,
          attendanceCount: attendedCount,
          noShowCount,
          releasedReservationIds,
          ledgerEntryIds,
          hourLogIds,
          auditLogId,
          outboxEventIds: [outbox.id],
          completedAt: now.toISOString(),
        };
      },
    );
  }

  async completionControl(principal: SessionPrincipal, id: string) {
    if (!UUID.test(id)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const slot = await this.db.slotKelas.findUnique({ where: { id } });
    if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const ownInstructor =
      slot.instructorUserId === principal.userId &&
      this.policy.hasCapability(principal, 'attendance:self', slot.branchId);
    if (!ownInstructor) {
      this.policy.requireCapability(principal.capabilities, 'class-slot:manage');
      this.scope(principal, slot.branchId, 'class-slot:manage');
    }
    if (slot.status !== 'CONFIRMED')
      throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
    const bookings = await this.db.pemesananKelas.findMany({
      where: { classSlotId: id },
      orderBy: { id: 'asc' },
      include: { reservation: true, attendance: { select: { id: true } } },
    });
    return {
      classSlotId: id,
      expectedVersion: slot.version,
      controlHash: classCompletionControlHash(bookings),
      attendanceCount: bookings.filter((booking) => Boolean(booking.attendance)).length,
      noShowCount: bookings.filter(
        (booking) =>
          booking.reservation.status === 'ACTIVE' &&
          booking.status === 'BOOKED' &&
          !booking.attendance,
      ).length,
      activeReservationCount: bookings.filter((booking) => booking.reservation.status === 'ACTIVE')
        .length,
    };
  }

  private validateKey(key: string) {
    if (!key || key.length < 16 || key.length > 128)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }
  private execute(
    principal: SessionPrincipal,
    scope: string,
    key: string,
    payload: unknown,
    status: number,
    action: (tx: Tx) => Promise<object>,
  ) {
    return this.idempotency
      .execute({ scope, key, payload, ttlMs: 86400000, leaseMs: 30000 }, async (tx) => ({
        status,
        body: (await action(tx)) as Prisma.InputJsonValue,
      }))
      .catch((error: unknown) => {
        this.mapConflict(error);
      });
  }
  private async visible(tx: Tx, principal: SessionPrincipal, id: string) {
    if (!UUID.test(id)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const slot = await tx.slotKelas.findUnique({ where: { id } });
    if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.scope(principal, slot.branchId, 'class-slot:manage');
    return slot;
  }
  private requireDraftVersion(
    slot: { status: ClassSlotStatus; version: number },
    expected: number,
  ) {
    if (slot.version !== expected) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    if (slot.status !== 'DRAFT')
      throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
  }
  private async configuration(
    tx: Tx,
    branchId: string,
    classTypeId: string,
    at: Date,
    timezone: string,
  ) {
    const day = new Date(`${dateInTimeZone(at, timezone)}T00:00:00Z`);
    const configs = await tx.konfigurasiEfektif.findMany({
      where: {
        kind: 'QUOTA_CAPACITY',
        branchId,
        classTypeId,
        effectiveFrom: { lte: day },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: day } }],
      },
    });
    if (configs.length !== 1)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    const value = configs[0]!.value as { minimumQuota?: number; defaultCapacity?: number };
    if (
      !Number.isSafeInteger(value.minimumQuota) ||
      !Number.isSafeInteger(value.defaultCapacity) ||
      value.minimumQuota! < 1 ||
      value.defaultCapacity! < value.minimumQuota!
    )
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    return { minimumQuota: value.minimumQuota!, defaultCapacity: value.defaultCapacity! };
  }
  private async instructorCoverage(
    tx: Tx,
    userId: string,
    branchId: string,
    startAt: Date,
    endAt: Date,
    timezone: string,
  ) {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user || user.status !== 'ACTIVE')
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const start = new Date(`${dateInTimeZone(startAt, timezone)}T00:00:00Z`);
    const occupiedEnd = new Date(
      `${dateInTimeZone(new Date(endAt.getTime() - 1), timezone)}T00:00:00Z`,
    );
    const assignment = await tx.penugasan.findFirst({
      where: {
        userId,
        branchId,
        type: 'INSTRUCTOR',
        activeFrom: { lte: start },
        OR: [{ activeUntil: null }, { activeUntil: { gt: occupiedEnd } }],
      },
    });
    if (!assignment) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const availability = await tx.ketersediaanInstruktur.findFirst({
      where: {
        instructorUserId: userId,
        branchId,
        startAt: { lte: startAt },
        endAt: { gte: endAt },
      },
    });
    if (!availability) throw new ApiProblem('AVAILABILITY_REQUIRED', HttpStatus.CONFLICT);
  }
  private async ensureNoInstructorOverlap(
    tx: Tx,
    instructorUserId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string,
  ) {
    await tx.$queryRaw`
      SELECT \`id\`
      FROM \`User\`
      WHERE \`id\` = ${instructorUserId}
      FOR UPDATE
    `;
    const overlap = await tx.slotKelas.findFirst({
      where: {
        instructorUserId,
        status: { in: ['DRAFT', 'PUBLISHED', 'CONFIRMED'] },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (overlap) throw new ApiProblem('SCHEDULE_CONFLICT', HttpStatus.CONFLICT);
  }
  private audit(
    tx: Tx,
    principal: SessionPrincipal,
    correlationId: string,
    action: string,
    slot: {
      id: string;
      branchId: string;
      classTypeId: string;
      instructorUserId: string | null;
      startAt: Date;
      endAt: Date;
      timezone: string;
      minimumQuota: number;
      capacity: number;
      bookedCount: number;
      status: ClassSlotStatus;
      cancellationReasonCode: string | null;
      version: number;
    },
    before: object | null,
  ) {
    return tx.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: principal.userId,
        branchId: slot.branchId,
        action,
        objectType: 'ClassSlot',
        objectId: slot.id,
        ...(before ? { beforeMasked: before as Prisma.InputJsonValue } : {}),
        afterMasked: this.view(slot) as Prisma.InputJsonValue,
        correlationId,
      },
    });
  }
  private mapConflict(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    if (
      /ClassSlot_instructor_no_overlap|23P01|exclusion/i.test(message) ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P2004', 'P2010'].includes(error.code))
    )
      throw new ApiProblem('SCHEDULE_CONFLICT', HttpStatus.CONFLICT);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')
      throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
    throw error;
  }

  // --- Indonesian Domain Aliases ---
  async daftarSlot(principal: SessionPrincipal, query: Parameters<ClassSlotService['list']>[1]) {
    return this.list(principal, query);
  }

  async buatSlot(
    principal: SessionPrincipal,
    input: Parameters<ClassSlotService['create']>[1],
    key: string,
    correlationId: string,
  ) {
    return this.create(principal, input, key, correlationId);
  }

  async perbaruiSlot(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<ClassSlotService['update']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.update(principal, id, input, key, correlationId);
  }

  async publikasikanSlot(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<ClassSlotService['publish']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.publish(principal, id, input, key, correlationId);
  }

  async batalkanSlot(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<ClassSlotService['cancel']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.cancel(principal, id, input, key, correlationId);
  }

  async selesaikanKelas(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<ClassSlotService['complete']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.complete(principal, id, input, key, correlationId);
  }
}
