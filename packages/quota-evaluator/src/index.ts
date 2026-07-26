import { randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';

type Database = PrismaClient | Prisma.TransactionClient;
export type EvaluationActor = { type: 'SYSTEM'; id?: never } | { type: 'USER'; id: string };

export interface QuotaEvaluationInput {
  jobId: string;
  now: Date;
  expectedDueAt?: Date;
  expectedVersion?: number;
  actor: EvaluationActor;
  correlationId: string;
  syntheticEnabled: boolean;
  leaseOwner?: string;
}

export interface QuotaEvaluationResult {
  classSlotId: string;
  previousStatus: string;
  status: 'CONFIRMED' | 'AUTO_CANCELLED';
  bookingCount: number;
  minimumQuota: number;
  releasedReservationIds: string[];
  outboxEventIds: string[];
  evaluatedAt: string;
  idempotentReplay: boolean;
}

export class QuotaEvaluationError extends Error {
  constructor(
    readonly code: string,
    readonly retryable = false,
  ) {
    super(code);
  }
}

export async function evaluateQuota(
  database: Database,
  input: QuotaEvaluationInput,
): Promise<QuotaEvaluationResult> {
  if (!input.syntheticEnabled) throw new QuotaEvaluationError('CONFIGURATION_REQUIRED', true);
  const execute = async (tx: Prisma.TransactionClient): Promise<QuotaEvaluationResult> => {
    await tx.$queryRaw`
      SELECT \`id\`
      FROM \`QuotaEvaluationJob\`
      WHERE \`id\` = ${input.jobId}
      FOR UPDATE
    `;
    const job = await tx.quotaEvaluationJob.findUnique({
      where: { id: input.jobId },
      include: { classSlot: true },
    });
    if (!job) throw new QuotaEvaluationError('RESOURCE_NOT_FOUND');
    if (job.status === 'SUCCEEDED' && job.result)
      return { ...(job.result as unknown as QuotaEvaluationResult), idempotentReplay: true };
    if (
      job.status === 'RUNNING' &&
      job.leaseExpiresAt &&
      job.leaseExpiresAt > input.now &&
      job.leaseOwner !== input.leaseOwner
    )
      throw new QuotaEvaluationError('JOB_LOCKED', true);
    if (input.expectedDueAt && job.dueAt.getTime() !== input.expectedDueAt.getTime())
      throw new QuotaEvaluationError('STALE_VERSION');
    if (input.expectedVersion !== undefined && job.version !== input.expectedVersion)
      throw new QuotaEvaluationError('STALE_VERSION');
    if (input.now < job.dueAt) throw new QuotaEvaluationError('QUOTA_EVALUATION_NOT_DUE');
    if (input.now >= job.classSlot.startAt) throw new QuotaEvaluationError('CLASS_ALREADY_STARTED');
    if (job.classSlot.status !== 'PUBLISHED')
      throw new QuotaEvaluationError('INVALID_STATE_TRANSITION');

    const reservations = await tx.sessionReservation.findMany({
      where: { classSlotId: job.classSlotId, status: 'ACTIVE' },
      select: { id: true, quantity: true },
      orderBy: { id: 'asc' },
    });
    const bookingCount = reservations.reduce((sum, item) => sum + item.quantity, 0);
    const confirmed = bookingCount >= job.classSlot.minimumQuota;
    const status = confirmed ? 'CONFIRMED' : 'AUTO_CANCELLED';
    const releasedReservationIds = confirmed ? [] : reservations.map(({ id }) => id);
    if (!confirmed && releasedReservationIds.length)
      await tx.sessionReservation.updateMany({
        where: { id: { in: releasedReservationIds }, status: 'ACTIVE' },
        data: { status: 'RELEASED', releasedAt: input.now },
      });
    await tx.classSlot.update({
      where: { id: job.classSlotId },
      data: {
        status,
        bookedCount: confirmed ? bookingCount : 0,
        version: { increment: 1 },
      },
    });
    const auditId = randomUUID();
    const eventId = randomUUID();
    await tx.auditLog.create({
      data: {
        id: auditId,
        actorType: input.actor.type,
        actorId: input.actor.type === 'USER' ? input.actor.id : null,
        branchId: job.classSlot.branchId,
        action: confirmed ? 'class.slot.confirmed' : 'class.slot.auto_cancelled',
        objectType: 'ClassSlot',
        objectId: job.classSlotId,
        beforeMasked: { status: 'PUBLISHED', bookedCount: job.classSlot.bookedCount },
        afterMasked: {
          status,
          bookedCount: confirmed ? bookingCount : 0,
          minimumQuota: job.classSlot.minimumQuota,
        },
        correlationId: input.correlationId,
      },
    });
    await tx.outboxEvent.create({
      data: {
        id: eventId,
        eventType: confirmed ? 'class.confirmed.v1' : 'class.auto_cancelled.v1',
        aggregateType: 'ClassSlot',
        aggregateId: job.classSlotId,
        payload: {
          classSlotId: job.classSlotId,
          branchId: job.classSlot.branchId,
          bookingCount,
          minimumQuota: job.classSlot.minimumQuota,
          releasedReservationCount: releasedReservationIds.length,
          status,
        },
        correlationId: input.correlationId,
      },
    });
    const result: QuotaEvaluationResult = {
      classSlotId: job.classSlotId,
      previousStatus: 'PUBLISHED',
      status,
      bookingCount,
      minimumQuota: job.classSlot.minimumQuota,
      releasedReservationIds,
      outboxEventIds: [eventId],
      evaluatedAt: input.now.toISOString(),
      idempotentReplay: false,
    };
    await tx.quotaEvaluationJob.update({
      where: { id: job.id },
      data: {
        status: 'SUCCEEDED',
        attempts: { increment: 1 },
        leaseOwner: null,
        leaseExpiresAt: null,
        lastErrorCode: null,
        result: result as unknown as Prisma.InputJsonValue,
        version: { increment: 1 },
      },
    });
    return result;
  };
  return '$transaction' in database
    ? database.$transaction(execute, { isolationLevel: 'Serializable' })
    : execute(database as Prisma.TransactionClient);
}
