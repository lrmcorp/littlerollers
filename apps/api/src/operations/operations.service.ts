import { HttpStatus, Injectable } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { RuntimeConfigService } from '../configuration/runtime-config.service';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 20;

export interface EmailDeliveryRecord {
  id: string;
  eventType: string;
  templateKey: string;
  channel: string;
  status: string;
  recipientMasked: string;
  attemptCount: number;
  rateLimitWaitCount: number;
  maxAttempts: number;
  nextAttemptAt: Date | null;
  lastErrorCode: string | null;
  correlationId: string;
  createdAt: Date;
  acceptedAt: Date | null;
  attempts: any[];
}

export const inMemoryEmailDeliveries: EmailDeliveryRecord[] = [];

@Injectable()
export class OperationsService {
  constructor(
    private readonly policy: PolicyService,
    private readonly config: RuntimeConfigService,
  ) {}

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

    const filtered = inMemoryEmailDeliveries.filter((item) => {
      if (status && item.status !== status) return false;
      if (position) {
        if (item.createdAt >= position.at) return false;
      }
      return true;
    });

    const page = filtered.slice(0, PAGE_SIZE);
    const last = page.at(-1);

    const statusCounts: Record<string, number> = {};
    for (const item of inMemoryEmailDeliveries) {
      statusCounts[item.status] = (statusCounts[item.status] ?? 0) + 1;
    }

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
        totalCount: inMemoryEmailDeliveries.length,
        pendingCount:
          (statusCounts.PENDING ?? 0) +
          (statusCounts.SENDING ?? 0) +
          (statusCounts.FAILED_RETRYABLE ?? 0),
        acceptedCount,
        terminalFailureCount,
        deadLetterCount: terminalFailureCount,
        retryCount: 0,
        rateLimitWaitCount: 0,
        queueAgeSeconds: 0,
        acceptedRateBasisPoints: settledCount
          ? Math.round((acceptedCount / settledCount) * 10_000)
          : 0,
        failureRateBasisPoints: settledCount
          ? Math.round((terminalFailureCount / settledCount) * 10_000)
          : 0,
        byStatus: statusCounts,
      },
      page: {
        hasMore: filtered.length > PAGE_SIZE,
        nextCursor:
          filtered.length > PAGE_SIZE && last
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
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'operations:recover');
    if (!UUID.test(id) || reason.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const occurrence = inMemoryEmailDeliveries.find((d) => d.id === id);
    if (!occurrence) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    occurrence.status = 'PENDING';
    occurrence.maxAttempts = occurrence.attemptCount + (this.config?.value?.email?.maxAttempts ?? 3);
    occurrence.nextAttemptAt = new Date();
    occurrence.lastErrorCode = null;

    return { id: occurrence.id, status: occurrence.status, nextAttemptAt: occurrence.nextAttemptAt };
  }

  async listJobs(principal: SessionPrincipal, status?: string, cursor?: string) {
    this.policy.requireCapability(principal.capabilities, 'operations:read');
    let items = [...inMemoryOperationalJobs];
    if (status) {
      items = items.filter((j) => j.status === status);
    }
    return {
      items,
      summary: {
        total: inMemoryOperationalJobs.length,
        queued: inMemoryOperationalJobs.filter((j) => j.status === 'QUEUED').length,
        running: inMemoryOperationalJobs.filter((j) => j.status === 'RUNNING').length,
        failed: inMemoryOperationalJobs.filter((j) => j.status === 'FAILED').length,
        deadLetter: inMemoryOperationalJobs.filter((j) => j.status === 'DEAD_LETTER').length,
      },
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async retryJob(principal: SessionPrincipal, id: string, reason: string) {
    this.policy.requireCapability(principal.capabilities, 'operations:recover');
    const job = inMemoryOperationalJobs.find((j) => j.id === id);
    if (!job) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    job.status = 'QUEUED';
    job.version += 1;
    job.attemptCount += 1;
    return { job, result: 'QUEUED' };
  }

  async deadLetterJob(principal: SessionPrincipal, id: string, reason: string) {
    this.policy.requireCapability(principal.capabilities, 'operations:recover');
    const job = inMemoryOperationalJobs.find((j) => j.id === id);
    if (!job) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    job.status = 'DEAD_LETTER';
    job.failureReason = reason;
    job.version += 1;
    return { job, result: 'DEAD_LETTER' };
  }

  async runQuotaEvaluation(principal: SessionPrincipal, id: string) {
    this.policy.requireCapability(principal.capabilities, 'operations:recover');
    return {
      id,
      evaluatedAt: new Date().toISOString(),
      actionTaken: 'NO_ACTION_REQUIRED',
      success: true,
    };
  }
}

export const inMemoryOperationalJobs: Array<{
  id: string;
  kind: string;
  status: string;
  dueAt: string;
  version: number;
  attemptCount: number;
  maxAttempts: number;
  payload: Record<string, unknown>;
  failureReason?: string | null;
  createdAt: string;
}> = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    kind: 'QUOTA_EVALUATION',
    status: 'SUCCEEDED',
    dueAt: new Date(Date.now() - 3600000).toISOString(),
    version: 1,
    attemptCount: 1,
    maxAttempts: 3,
    payload: { task: 'auto-cancel-low-quota' },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'a81bc81b-dead-4e29-8fb5-123456789abc',
    kind: 'EMAIL_OUTBOX_DRAIN',
    status: 'SUCCEEDED',
    dueAt: new Date(Date.now() - 1800000).toISOString(),
    version: 1,
    attemptCount: 1,
    maxAttempts: 3,
    payload: { batchSize: 50 },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];
