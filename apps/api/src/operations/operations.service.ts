import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { AuditService } from '../foundation/audit.service';
import { EmailDeliveryStatus } from '@prisma/client';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, ENTITY_ID_REGEX } from '../identity/security';
import { EmailNotificationService } from '../email/email-notification.service';

const UUID = ENTITY_ID_REGEX;
const PAGE_SIZE = 20;
const STATUSES = Object.values(EmailDeliveryStatus);

function decodeCursor(cursor?: string): { at: Date; id: string } | undefined {
  if (!cursor) return undefined;
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString()) as { at: string; id: string };
    const at = new Date(parsed.at);
    if (!UUID.test(parsed.id) || Number.isNaN(at.getTime())) throw new Error();
    return { at, id: parsed.id };
  } catch {
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }
}

@Injectable()
export class OperationsService {
  constructor(
    private readonly policy: PolicyService,
    private readonly emails: EmailNotificationService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  async listEmailDeliveries(principal: SessionPrincipal, status?: string, cursor?: string) {
    this.policy.requireCapability(principal.capabilities, 'operations:read');
    if (status && !STATUSES.includes(status as EmailDeliveryStatus))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const position = decodeCursor(cursor);

    const [{ rows, hasMore }, stats] = await Promise.all([
      this.emails.page({
        status: status as EmailDeliveryStatus | undefined,
        cursor: position,
        limit: PAGE_SIZE,
      }),
      this.emails.stats(),
    ]);
    const last = rows.at(-1);

    const acceptedCount = stats.statusCounts.ACCEPTED_BY_SMTP ?? 0;
    const terminalFailureCount =
      (stats.statusCounts.FAILED_TERMINAL ?? 0) + (stats.statusCounts.FALLBACK_IN_APP ?? 0);
    const settledCount = acceptedCount + terminalFailureCount + (stats.statusCounts.EXPIRED ?? 0);
    const totalCount = Object.values(stats.statusCounts).reduce((sum, count) => sum + count, 0);

    return {
      items: rows.map((row) => ({
        id: row.id,
        eventType: row.eventType,
        templateKey: row.templateKey,
        channel: 'EMAIL',
        status: row.status,
        recipientMasked: row.recipientMasked,
        attemptCount: row.attemptCount,
        rateLimitWaitCount: row.rateLimitWaitCount,
        maxAttempts: row.maxAttempts,
        nextAttemptAt: row.nextAttemptAt,
        lastErrorCode: row.lastErrorCode,
        correlationId: row.correlationId,
        createdAt: row.createdAt,
        acceptedAt: row.acceptedAt,
        lastAttempt: null,
      })),
      metrics: {
        totalCount,
        pendingCount:
          (stats.statusCounts.PENDING ?? 0) +
          (stats.statusCounts.SENDING ?? 0) +
          (stats.statusCounts.FAILED_RETRYABLE ?? 0),
        acceptedCount,
        terminalFailureCount,
        deadLetterCount: terminalFailureCount,
        retryCount: stats.retryCount,
        rateLimitWaitCount: stats.rateLimitWaitCount,
        queueAgeSeconds: stats.queueAgeSeconds,
        acceptedRateBasisPoints: settledCount ? Math.round((acceptedCount / settledCount) * 10_000) : 0,
        failureRateBasisPoints: settledCount
          ? Math.round((terminalFailureCount / settledCount) * 10_000)
          : 0,
        byStatus: stats.statusCounts,
      },
      page: {
        hasMore,
        nextCursor:
          hasMore && last
            ? Buffer.from(JSON.stringify({ at: last.createdAt.toISOString(), id: last.id })).toString(
                'base64url',
              )
            : null,
      },
    };
  }

  async retryEmailDelivery(principal: SessionPrincipal, id: string, reason: string, _correlationId: string) {
    this.policy.requireCapability(principal.capabilities, 'operations:recover');
    if (!UUID.test(id) || reason.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const result = await this.emails.retry(id, reason, principal.userId);
    await this.audit?.catat(null, {
      actorId: principal.userId,
      correlationId: _correlationId,
      action: 'operations.email_retried',
      objectType: 'EmailDelivery',
      objectId: id,
      reason: reason.trim().slice(0, 500),
      afterMasked: { status: result.status },
    });
    return result;
  }
}
