import { HttpStatus, Injectable } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, ENTITY_ID_REGEX } from '../identity/security';
import { RuntimeConfigService } from '../configuration/runtime-config.service';

const UUID = ENTITY_ID_REGEX;
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
}
