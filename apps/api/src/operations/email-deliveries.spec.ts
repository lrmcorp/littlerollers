import { OperationsService } from './operations.service';

const principal = {
  userId: '00000000-0000-4000-8000-000000000001',
  capabilities: ['operations:read', 'operations:recover'],
  branchIds: [],
  roles: [],
};

const row = (overrides: Record<string, unknown> = {}) => ({
  id: '00000000-0000-4000-8000-000000000101',
  occurrenceKey: 'key-1',
  eventType: 'purchase.approved.v1',
  templateKey: 'ORDER_APPROVED_V1',
  recipientMasked: 'cu*****@example.test',
  status: 'FALLBACK_IN_APP',
  attemptCount: 5,
  maxAttempts: 5,
  rateLimitWaitCount: 2,
  nextAttemptAt: null,
  lastErrorCode: 'SMTP_TERMINAL',
  correlationId: 'safe-correlation',
  createdAt: new Date('2026-07-28T00:00:00.000Z'),
  acceptedAt: null,
  ...overrides,
});

describe('OperationsService email deliveries', () => {
  it('returns masked delivery observability without an encrypted envelope, sourced from EmailNotificationService', async () => {
    const policy = { requireCapability: jest.fn() };
    const emails = {
      page: jest.fn().mockResolvedValue({ rows: [row()], hasMore: false }),
      stats: jest.fn().mockResolvedValue({
        statusCounts: { ACCEPTED_BY_SMTP: 9, FALLBACK_IN_APP: 1 },
        rateLimitWaitCount: 2,
        retryCount: 4,
        queueAgeSeconds: 30,
      }),
    };
    const service = new OperationsService(policy as never, emails as never);

    const result = await service.listEmailDeliveries(principal as never);
    expect(result.metrics).toEqual(
      expect.objectContaining({
        acceptedCount: 9,
        terminalFailureCount: 1,
        deadLetterCount: 1,
        acceptedRateBasisPoints: 9000,
        failureRateBasisPoints: 1000,
        retryCount: 4,
        rateLimitWaitCount: 2,
        queueAgeSeconds: 30,
      }),
    );
    const serialized = JSON.stringify(result);
    expect(serialized).toContain('cu*****@example.test');
    expect(serialized).not.toContain('envelope');
    expect(serialized).not.toContain('key-1');
    expect(policy.requireCapability).toHaveBeenCalledWith(
      ['operations:read', 'operations:recover'],
      'operations:read',
    );
  });

  it('rejects an unknown status filter before querying', async () => {
    const policy = { requireCapability: jest.fn() };
    const emails = { page: jest.fn(), stats: jest.fn() };
    const service = new OperationsService(policy as never, emails as never);
    await expect(
      service.listEmailDeliveries(principal as never, 'BOGUS_STATUS'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(emails.page).not.toHaveBeenCalled();
  });

  it('delegates a manual retry to EmailNotificationService, requiring a reason', async () => {
    const policy = { requireCapability: jest.fn() };
    const retried = { id: row().id, status: 'PENDING', nextAttemptAt: new Date() };
    const emails = { retry: jest.fn().mockResolvedValue(retried) };
    const service = new OperationsService(policy as never, emails as never);

    await expect(
      service.retryEmailDelivery(principal as never, row().id, 'x', 'corr'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(emails.retry).not.toHaveBeenCalled();

    const result = await service.retryEmailDelivery(
      principal as never,
      row().id,
      'Credential SMTP sudah diperbaiki',
      'corr',
    );
    expect(result).toBe(retried);
    expect(emails.retry).toHaveBeenCalledWith(
      row().id,
      'Credential SMTP sudah diperbaiki',
      principal.userId,
    );
  });

  it('records every manual retry in the permanent audit with the operator reason', async () => {
    const policy = { requireCapability: jest.fn() };
    const emails = { retry: jest.fn().mockResolvedValue({ id: row().id, status: 'PENDING', nextAttemptAt: new Date() }) };
    const audit = { catat: jest.fn().mockResolvedValue(undefined) };
    const service = new OperationsService(policy as never, emails as never, audit as never);
    await service.retryEmailDelivery(principal as never, row().id, '  Credential SMTP sudah diperbaiki  ', 'corr');
    expect(audit.catat).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        action: 'operations.email_retried',
        objectType: 'EmailDelivery',
        objectId: row().id,
        reason: 'Credential SMTP sudah diperbaiki',
        correlationId: 'corr',
      }),
    );
  });
});
