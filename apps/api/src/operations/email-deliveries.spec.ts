import { OperationsService, inMemoryEmailDeliveries } from './operations.service';

const principal = {
  userId: '00000000-0000-4000-8000-000000000001',
  capabilities: ['operations:read', 'operations:recover'],
  branchIds: [],
  roles: [],
};

describe('OperationsService - Email Deliveries', () => {
  beforeEach(() => {
    inMemoryEmailDeliveries.length = 0;
  });

  test('returns masked delivery observability without encrypted recipient or provider payload', async () => {
    const createdAt = new Date('2026-07-28T00:00:00.000Z');

    // 9 ACCEPTED_BY_SMTP
    for (let i = 1; i <= 9; i++) {
      inMemoryEmailDeliveries.push({
        id: `00000000-0000-4000-8000-00000000000${i}`,
        eventType: 'purchase.approved.v1',
        templateKey: 'ORDER_APPROVED_V1',
        channel: 'EMAIL',
        status: 'ACCEPTED_BY_SMTP',
        recipientMasked: 'ok*****@example.test',
        attemptCount: 1,
        rateLimitWaitCount: 0,
        maxAttempts: 3,
        nextAttemptAt: null,
        lastErrorCode: null,
        correlationId: `corr-${i}`,
        createdAt,
        acceptedAt: createdAt,
        attempts: [],
      });
    }

    // 1 FALLBACK_IN_APP
    inMemoryEmailDeliveries.push({
      id: '00000000-0000-4000-8000-000000000101',
      eventType: 'purchase.approved.v1',
      templateKey: 'ORDER_APPROVED_V1',
      channel: 'EMAIL',
      status: 'FALLBACK_IN_APP',
      recipientMasked: 'cu*****@example.test',
      attemptCount: 5,
      rateLimitWaitCount: 2,
      maxAttempts: 5,
      nextAttemptAt: createdAt,
      lastErrorCode: 'SMTP_TERMINAL',
      correlationId: 'safe-correlation',
      createdAt,
      acceptedAt: null,
      attempts: [],
    });

    const policy = { requireCapability: jest.fn() };
    const service = new OperationsService(policy as never, {} as never);

    const result = await service.listEmailDeliveries(principal as never);
    expect(result.metrics).toEqual(
      expect.objectContaining({
        acceptedCount: 9,
        terminalFailureCount: 1,
        deadLetterCount: 1,
        acceptedRateBasisPoints: 9000,
        failureRateBasisPoints: 1000,
      }),
    );
    const serialized = JSON.stringify(result);
    expect(serialized).toContain('cu*****@example.test');
    expect(serialized).not.toContain('encrypted-recipient-not-returned');
    expect(serialized).not.toContain('hash-not-returned');
    expect(policy.requireCapability).toHaveBeenCalledWith(
      ['operations:read', 'operations:recover'],
      'operations:read',
    );
  });
});
