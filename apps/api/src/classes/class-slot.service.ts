import { HttpStatus, Injectable } from '@nestjs/common';
import { ClassSlotStatus, Prisma } from '@prisma/client';
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

@Injectable()
export class ClassSlotService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly idempotency: IdempotencyService,
    private readonly config: RuntimeConfigService,
  ) {}

  private scope(principal: SessionPrincipal, branchId: string) {
    if (!principal.capabilities.includes('branch:all') && !principal.branchIds.includes(branchId))
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
    input: { branchId?: string; status?: string; from?: string; until?: string; cursor?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'class-slot:read');
    const isCustomer =
      principal.roles.some((item) => item.role === 'CUSTOMER') &&
      !principal.capabilities.includes('class-slot:manage');
    if (input.branchId && !isCustomer) this.scope(principal, input.branchId);
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
    const items = await this.db.classSlot.findMany({
      where: {
        ...(input.branchId
          ? { branchId: input.branchId }
          : principal.capabilities.includes('branch:all') || isCustomer
            ? {}
            : { branchId: { in: principal.branchIds } }),
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
        this.scope(principal, input.branchId);
        const [branch, classType] = await Promise.all([
          tx.branch.findUnique({ where: { id: input.branchId } }),
          tx.classType.findUnique({ where: { id: input.classTypeId } }),
        ]);
        if (!branch?.active || !classType?.active || classType.branchId !== branch.id)
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        const config = await this.configuration(
          tx,
          branch.id,
          classType.id,
          startAt,
          branch.timezone,
        );
        if (input.instructorUserId)
          await this.instructorCoverage(
            tx,
            input.instructorUserId,
            branch.id,
            startAt,
            endAt,
            branch.timezone,
          );
        const slot = await tx.classSlot.create({
          data: {
            id: newId(),
            branchId: branch.id,
            classTypeId: classType.id,
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
        const slot = await tx.classSlot.update({
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

  async publish(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number },
    key: string,
    correlationId: string,
  ) {
    this.manage(principal);
    this.policy.requireMfa(principal.assurance);
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
        const slot = await tx.classSlot.update({
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
    this.policy.requireMfa(principal.assurance);
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
        const released = await tx.sessionReservation.updateMany({
          where: { classSlotId: id, status: 'ACTIVE' },
          data: { status: 'RELEASED', releasedAt: new Date() },
        });
        const slot = await tx.classSlot.update({
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
    const slot = await tx.classSlot.findUnique({ where: { id } });
    if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.scope(principal, slot.branchId);
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
    const configs = await tx.effectiveConfiguration.findMany({
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
    const assignment = await tx.assignment.findFirst({
      where: {
        userId,
        branchId,
        type: 'INSTRUCTOR',
        activeFrom: { lte: start },
        OR: [{ activeUntil: null }, { activeUntil: { gt: occupiedEnd } }],
      },
    });
    if (!assignment) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const availability = await tx.instructorAvailability.findFirst({
      where: {
        instructorUserId: userId,
        branchId,
        startAt: { lte: startAt },
        endAt: { gte: endAt },
      },
    });
    if (!availability) throw new ApiProblem('AVAILABILITY_REQUIRED', HttpStatus.CONFLICT);
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
}
