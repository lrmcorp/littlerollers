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
    const allowed = ['QUEUED', 'RUNNING', 'RETRYING', 'SUCCEEDED', 'FAILED'] as const;
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

  async run(
    principal: SessionPrincipal,
    id: string,
    input: { expectedDueAt: string; expectedVersion: number },
    key: string,
    correlationId: string,
    now = new Date(),
  ) {
    this.policy.requireCapability(principal.capabilities, 'operations:recover');
    this.policy.requireMfa(principal.assurance);
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
