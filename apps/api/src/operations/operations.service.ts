import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  evaluateQuota,
  QuotaEvaluationError,
  type QuotaEvaluationResult,
} from '@dailydose/quota-evaluator';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 20;

@Injectable()
export class OperationsService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly idempotency: IdempotencyService,
    private readonly config: RuntimeConfigService,
  ) {}

  async list(principal: SessionPrincipal, status?: string, cursor?: string) {
    this.policy.requireCapability(principal.capabilities, 'operations:read');
    const allowed = [
      'QUEUED',
      'RUNNING',
      'RETRYING',
      'SUCCEEDED',
      'FAILED',
      'DEAD_LETTER',
    ] as const;
    if (status && !allowed.includes(status as (typeof allowed)[number]))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    let position: { at: Date; id: string } | undefined;
    if (cursor) {
      try {
        const value = JSON.parse(Buffer.from(cursor, 'base64url').toString()) as {
          at: string;
          id: string;
        };
        const at = new Date(value.at);
        if (!UUID.test(value.id) || Number.isNaN(at.getTime())) throw new Error();
        position = { at, id: value.id };
      } catch {
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
      }
    }
    const jobs = await this.db.quotaEvaluationJob.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(position
          ? {
              OR: [
                { createdAt: { lt: position.at } },
                { createdAt: position.at, id: { lt: position.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
    });
    const page = jobs.slice(0, PAGE_SIZE);
    const last = page.at(-1);
    return {
      items: page.map((job) => ({
        id: job.id,
        type: 'H24_QUOTA_EVALUATION',
        status: job.status,
        attemptCount: job.attempts,
        maxAttempts: job.maxAttempts,
        progress: job.status === 'SUCCEEDED' ? 100 : 0,
        dueAt: job.dueAt,
        nextAttemptAt: job.nextAttemptAt,
        leaseExpiresAt: job.leaseExpiresAt,
        lastErrorCode: job.lastErrorCode,
        createdAt: job.createdAt,
        version: job.version,
      })),
      page: {
        hasMore: jobs.length > PAGE_SIZE,
        nextCursor:
          jobs.length > PAGE_SIZE && last
            ? Buffer.from(
                JSON.stringify({ at: last.createdAt.toISOString(), id: last.id }),
              ).toString('base64url')
            : null,
      },
    };
  }

  async listEmailDeliveries(principal: SessionPrincipal, status?: string, cursor?: string) {
    this.policy.requireCapability(principal.capabilities, 'operations:read');
    const allowed = [
      'PENDING',
      'SENDING',
      'ACCEPTED_BY_SMTP',
      'FAILED_RETRYABLE',
      'FAILED_TERMINAL',
      'EXPIRED',
      'FALLBACK_IN_APP',
    ] as const;
    if (status && !allowed.includes(status as (typeof allowed)[number]))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    let position: { at: Date; id: string } | undefined;
    if (cursor) {
      try {
        const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString()) as {
          at: string;
          id: string;
        };
        const at = new Date(parsed.at);
        if (!UUID.test(parsed.id) || Number.isNaN(at.getTime())) throw new Error();
        position = { at, id: parsed.id };
      } catch {
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
      }
    }
    const items = await this.db.notificationOccurrence.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(position
          ? {
              OR: [
                { createdAt: { lt: position.at } },
                { createdAt: position.at, id: { lt: position.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
      include: { attempts: { orderBy: { attemptNumber: 'desc' }, take: 1 } },
    });
    const page = items.slice(0, PAGE_SIZE);
    const last = page.at(-1);
    const [statusGroups, totals, oldestQueued, retryCount] = await Promise.all([
      this.db.notificationOccurrence.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.db.notificationOccurrence.aggregate({
        _count: { _all: true },
        _sum: { attemptCount: true, rateLimitWaitCount: true },
      }),
      this.db.notificationOccurrence.aggregate({
        where: { status: { in: ['PENDING', 'SENDING', 'FAILED_RETRYABLE'] } },
        _min: { createdAt: true },
      }),
      this.db.notificationAttempt.count({ where: { attemptNumber: { gt: 1 } } }),
    ]);
    const statusCounts = Object.fromEntries(
      statusGroups.map((item) => [item.status, item._count._all]),
    ) as Record<string, number>;
    const acceptedCount = statusCounts.ACCEPTED_BY_SMTP ?? 0;
    const terminalFailureCount =
      (statusCounts.FAILED_TERMINAL ?? 0) + (statusCounts.FALLBACK_IN_APP ?? 0);
    const settledCount = acceptedCount + terminalFailureCount + (statusCounts.EXPIRED ?? 0);
    return {
      items: page.map((item) => ({
        id: item.id,
        eventType: item.eventType,
        templateKey: item.templateKey,
        channel: item.channel,
        status: item.status,
        recipientMasked: item.recipientMasked,
        attemptCount: item.attemptCount,
        rateLimitWaitCount: item.rateLimitWaitCount,
        maxAttempts: item.maxAttempts,
        nextAttemptAt: item.nextAttemptAt,
        lastErrorCode: item.lastErrorCode,
        correlationId: item.correlationId,
        createdAt: item.createdAt,
        acceptedAt: item.acceptedAt,
        lastAttempt: item.attempts[0] ?? null,
      })),
      metrics: {
        totalCount: totals._count._all,
        pendingCount:
          (statusCounts.PENDING ?? 0) +
          (statusCounts.SENDING ?? 0) +
          (statusCounts.FAILED_RETRYABLE ?? 0),
        acceptedCount,
        terminalFailureCount,
        deadLetterCount: terminalFailureCount,
        retryCount,
        rateLimitWaitCount: totals._sum.rateLimitWaitCount ?? 0,
        queueAgeSeconds: oldestQueued._min.createdAt
          ? Math.max(0, Math.floor((Date.now() - oldestQueued._min.createdAt.getTime()) / 1_000))
          : 0,
        acceptedRateBasisPoints: settledCount
          ? Math.round((acceptedCount / settledCount) * 10_000)
          : 0,
        failureRateBasisPoints: settledCount
          ? Math.round((terminalFailureCount / settledCount) * 10_000)
          : 0,
        byStatus: statusCounts,
      },
      page: {
        hasMore: items.length > PAGE_SIZE,
        nextCursor:
          items.length > PAGE_SIZE && last
            ? Buffer.from(
                JSON.stringify({ at: last.createdAt.toISOString(), id: last.id }),
              ).toString('base64url')
            : null,
      },
    };
  }

  async retryEmailDelivery(
    principal: SessionPrincipal,
    id: string,
    reason: string,
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'operations:recover');
    if (!UUID.test(id) || reason.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const occurrence = await this.db.notificationOccurrence.findUnique({ where: { id } });
    if (!occurrence) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (
      !['FAILED_TERMINAL', 'FALLBACK_IN_APP', 'FAILED_RETRYABLE'].includes(occurrence.status) ||
      !occurrence.envelopeEncrypted ||
      (occurrence.expiresAt && occurrence.expiresAt <= new Date())
    )
      throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
    const updated = await this.db.$transaction(async (tx) => {
      const result = await tx.notificationOccurrence.update({
        where: { id },
        data: {
          status: 'PENDING',
          maxAttempts: occurrence.attemptCount + this.config.value.email.maxAttempts,
          nextAttemptAt: new Date(),
          leaseExpiresAt: null,
          lastErrorCode: null,
        },
      });
      await tx.auditLog.create({
        data: {
          id: crypto.randomUUID(),
          actorType: 'USER',
          actorId: principal.userId,
          action: 'notification.email_retry_requested',
          objectType: 'NotificationOccurrence',
          objectId: id,
          beforeMasked: { status: occurrence.status, attemptCount: occurrence.attemptCount },
          afterMasked: { status: 'PENDING', reasonPresent: true },
          correlationId,
        },
      });
      return result;
    });
    return { id: updated.id, status: updated.status, nextAttemptAt: updated.nextAttemptAt };
  }

  async run(
    principal: SessionPrincipal,
    id: string,
    input: { expectedDueAt: string; expectedVersion: number },
    key: string,
    correlationId: string,
    now = new Date(),
  ) {
    this.policy.requireCapability(principal.capabilities, 'operations:recover');
    if (!UUID.test(id) || !key || key.length < 16 || key.length > 128)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const expectedDueAt = new Date(input.expectedDueAt);
    if (
      Number.isNaN(expectedDueAt.getTime()) ||
      !Number.isInteger(input.expectedVersion) ||
      input.expectedVersion < 0
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    try {
      return await this.idempotency.execute(
        {
          scope: `quota-evaluation:run:${id}`,
          key,
          payload: input,
          ttlMs: 86400000,
          leaseMs: this.config.value.quotaEvaluation.leaseMs,
        },
        async (tx) => {
          const result = await evaluateQuota(tx, {
            jobId: id,
            now,
            expectedDueAt,
            expectedVersion: input.expectedVersion,
            actor: { type: 'USER', id: principal.userId },
            correlationId,
            syntheticEnabled: this.config.value.quotaEvaluation.syntheticEnabled,
          });
          return { status: HttpStatus.OK, body: result as unknown as Prisma.InputJsonValue };
        },
      );
    } catch (error) {
      this.mapError(error);
    }
  }

  async retryJob(
    principal: SessionPrincipal,
    id: string,
    input: { reason: string },
    key: string,
    correlationId: string,
    now = new Date(),
  ) {
    this.policy.requireCapability(principal.capabilities, 'operations:recover');
    this.validateRecoveryInput(id, input.reason, key);
    return this.idempotency.execute(
      {
        scope: `operational-job:retry:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: this.config.value.quotaEvaluation.leaseMs,
      },
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`QuotaEvaluationJob\` WHERE \`id\` = ${id} FOR UPDATE`;
        const job = await tx.quotaEvaluationJob.findUnique({ where: { id } });
        if (!job) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (job.status !== 'FAILED')
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        if (job.attempts >= 10)
          throw new ApiProblem('RETRY_LIMIT_REACHED', HttpStatus.TOO_MANY_REQUESTS);
        const updated = await tx.quotaEvaluationJob.update({
          where: { id },
          data: {
            status: 'RETRYING',
            maxAttempts: Math.max(job.maxAttempts, job.attempts + 1),
            nextAttemptAt: now,
            leaseOwner: null,
            leaseExpiresAt: null,
            version: { increment: 1 },
          },
        });
        await tx.auditLog.create({
          data: {
            id: crypto.randomUUID(),
            actorType: 'USER',
            actorId: principal.userId,
            branchId: null,
            action: 'operations.job_retry_requested',
            objectType: 'QuotaEvaluationJob',
            objectId: id,
            beforeMasked: { status: job.status, attemptCount: job.attempts },
            afterMasked: { status: updated.status, reasonPresent: true },
            correlationId,
          },
        });
        return {
          status: HttpStatus.ACCEPTED,
          body: this.recoveryView(updated) as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async deadLetterJob(
    principal: SessionPrincipal,
    id: string,
    input: { reason: string },
    key: string,
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'operations:recover');
    this.validateRecoveryInput(id, input.reason, key);
    return this.idempotency.execute(
      {
        scope: `operational-job:dead-letter:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: this.config.value.quotaEvaluation.leaseMs,
      },
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`QuotaEvaluationJob\` WHERE \`id\` = ${id} FOR UPDATE`;
        const job = await tx.quotaEvaluationJob.findUnique({ where: { id } });
        if (!job) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (!['QUEUED', 'RETRYING', 'FAILED'].includes(job.status))
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        const updated = await tx.quotaEvaluationJob.update({
          where: { id },
          data: {
            status: 'DEAD_LETTER',
            leaseOwner: null,
            leaseExpiresAt: null,
            nextAttemptAt: job.nextAttemptAt,
            lastErrorCode: 'OPERATOR_DEAD_LETTER',
            version: { increment: 1 },
          },
        });
        await tx.auditLog.create({
          data: {
            id: crypto.randomUUID(),
            actorType: 'USER',
            actorId: principal.userId,
            branchId: null,
            action: 'operations.job_dead_lettered',
            objectType: 'QuotaEvaluationJob',
            objectId: id,
            beforeMasked: { status: job.status, attemptCount: job.attempts },
            afterMasked: { status: updated.status, reasonPresent: true },
            correlationId,
          },
        });
        return {
          status: HttpStatus.OK,
          body: this.recoveryView(updated) as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  private validateRecoveryInput(id: string, reason: string, key: string) {
    if (
      !UUID.test(id) ||
      reason?.trim().length < 3 ||
      reason.trim().length > 500 ||
      !key ||
      key.length < 16 ||
      key.length > 128
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  }

  private recoveryView(job: {
    id: string;
    status: string;
    attempts: number;
    maxAttempts: number;
    leaseExpiresAt: Date | null;
    lastErrorCode: string | null;
  }) {
    return {
      jobId: job.id,
      status: job.status,
      attemptCount: job.attempts,
      maxAttempts: job.maxAttempts,
      leaseExpiresAt: job.leaseExpiresAt?.toISOString() ?? null,
      lastErrorCode: job.lastErrorCode,
    };
  }

  private mapError(error: unknown): never {
    if (!(error instanceof QuotaEvaluationError)) throw error;
    const statuses: Record<string, HttpStatus> = {
      RESOURCE_NOT_FOUND: HttpStatus.NOT_FOUND,
      QUOTA_EVALUATION_NOT_DUE: HttpStatus.CONFLICT,
      CLASS_ALREADY_STARTED: HttpStatus.CONFLICT,
      INVALID_STATE_TRANSITION: HttpStatus.CONFLICT,
      STALE_VERSION: HttpStatus.CONFLICT,
      JOB_LOCKED: HttpStatus.LOCKED,
      CONFIGURATION_REQUIRED: HttpStatus.SERVICE_UNAVAILABLE,
    };
    throw new ApiProblem(error.code, statuses[error.code] ?? HttpStatus.CONFLICT, error.retryable);
  }
}
