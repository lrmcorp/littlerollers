import { OperationsService } from './operations.service';

const principal = {
  userId: '00000000-0000-4000-8000-000000000001',
  capabilities: ['operations:read', 'operations:recover'],
  branchIds: [],
  roles: [],
};

test('returns masked delivery observability without encrypted recipient or provider payload', async () => {
  const createdAt = new Date('2026-07-28T00:00:00.000Z');
  const db = {
    notificationOccurrence: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: '00000000-0000-4000-8000-000000000101',
          eventType: 'purchase.approved.v1',
          templateKey: 'ORDER_APPROVED_V1',
          channel: 'EMAIL',
          status: 'FALLBACK_IN_APP',
          recipientMasked: 'cu*****@example.test',
          recipientHash: 'hash-not-returned',
          envelopeEncrypted: 'encrypted-recipient-not-returned',
          attemptCount: 5,
          rateLimitWaitCount: 2,
          maxAttempts: 5,
          nextAttemptAt: createdAt,
          lastErrorCode: 'SMTP_TERMINAL',
          correlationId: 'safe-correlation',
          createdAt,
          acceptedAt: null,
          attempts: [],
        },
      ]),
      groupBy: jest.fn().mockResolvedValue([
        { status: 'ACCEPTED_BY_SMTP', _count: { _all: 9 } },
        { status: 'FALLBACK_IN_APP', _count: { _all: 1 } },
      ]),
      aggregate: jest
        .fn()
        .mockResolvedValueOnce({
          _count: { _all: 10 },
          _sum: { attemptCount: 14, rateLimitWaitCount: 2 },
        })
        .mockResolvedValueOnce({ _min: { createdAt } }),
    },
    notificationAttempt: { count: jest.fn().mockResolvedValue(4) },
  };
  const policy = { requireCapability: jest.fn() };
  const service = new OperationsService(db as never, policy as never, {} as never, {} as never);

  const result = await service.listEmailDeliveries(principal as never);
  expect(result.metrics).toEqual(
    expect.objectContaining({
      acceptedCount: 9,
      terminalFailureCount: 1,
      deadLetterCount: 1,
      retryCount: 4,
      rateLimitWaitCount: 2,
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
