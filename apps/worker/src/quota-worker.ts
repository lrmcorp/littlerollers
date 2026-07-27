import { randomUUID } from 'node:crypto';
import type { RuntimeConfig } from '@dailydose/config';
import { evaluateQuota, QuotaEvaluationError } from '@dailydose/quota-evaluator';
import { PrismaClient } from '@prisma/client';

export class QuotaWorker {
  private timer?: NodeJS.Timeout;
  private readonly owner = `worker:${randomUUID()}`;

  constructor(
    private readonly db: PrismaClient,
    private readonly config: RuntimeConfig['quotaEvaluation'],
    private readonly clock: () => Date = () => new Date(),
  ) {}

  start(): void {
    this.timer = setInterval(() => void this.poll(), this.config.pollIntervalMs);
    void this.poll();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async poll(): Promise<boolean> {
    if (!this.config.syntheticEnabled) return false;
    const now = this.clock();
    const candidate = await this.db.quotaEvaluationJob.findFirst({
      where: {
        dueAt: { lte: now },
        nextAttemptAt: { lte: now },
        OR: [
          { status: { in: ['QUEUED', 'RETRYING'] } },
          { status: 'RUNNING', leaseExpiresAt: { lte: now } },
        ],
      },
      orderBy: [{ dueAt: 'asc' }, { id: 'asc' }],
    });
    if (!candidate) return false;
    const leaseExpiresAt = new Date(now.getTime() + this.config.leaseMs);
    const claimed = await this.db.quotaEvaluationJob.updateMany({
      where: {
        id: candidate.id,
        version: candidate.version,
        OR: [
          { status: { in: ['QUEUED', 'RETRYING'] } },
          { status: 'RUNNING', leaseExpiresAt: { lte: now } },
        ],
      },
      data: {
        status: 'RUNNING',
        leaseOwner: this.owner,
        leaseExpiresAt,
        version: { increment: 1 },
      },
    });
    if (claimed.count !== 1) return false;
    try {
      await evaluateQuota(this.db, {
        jobId: candidate.id,
        now,
        actor: { type: 'SYSTEM' },
        correlationId: `quota-job:${candidate.id}`,
        syntheticEnabled: this.config.syntheticEnabled,
        leaseOwner: this.owner,
      });
    } catch (error) {
      const code = error instanceof QuotaEvaluationError ? error.code : 'DEPENDENCY_UNAVAILABLE';
      const attempts = candidate.attempts + 1;
      const exhausted = attempts >= candidate.maxAttempts;
      await this.db.$transaction(async (tx) => {
        await tx.quotaEvaluationJob.updateMany({
          where: { id: candidate.id, leaseOwner: this.owner },
          data: {
            status: exhausted ? 'FAILED' : 'RETRYING',
            attempts,
            nextAttemptAt: new Date(now.getTime() + this.config.backoffMs * attempts),
            lastErrorCode: code,
            leaseOwner: null,
            leaseExpiresAt: null,
            version: { increment: 1 },
          },
        });
        if (exhausted)
          await tx.outboxEvent.create({
            data: {
              id: randomUUID(),
              eventType: 'operations.job_failed.v1',
              aggregateType: 'QuotaEvaluationJob',
              aggregateId: candidate.id,
              payload: { jobId: candidate.id, failureCode: code },
              correlationId: `quota-job:${candidate.id}`,
            },
          });
      });
    }
    return true;
  }
}
