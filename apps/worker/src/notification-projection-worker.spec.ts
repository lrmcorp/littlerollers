import { NotificationProjectionWorker } from './notification-projection-worker';

describe('NotificationProjectionWorker', () => {
  it('marks unsupported events as skipped without creating a user notification', async () => {
    const event = {
      id: 'event-1',
      eventType: 'unrelated.event.v1',
      aggregateType: 'Unknown',
      aggregateId: 'aggregate-1',
      payload: {},
      correlationId: 'correlation-1',
      status: 'PENDING',
      occurredAt: new Date(),
      publishedAt: null,
      attempts: 0,
    };
    const tx = {
      notificationProjection: { upsert: jest.fn().mockResolvedValue({}) },
      userNotification: { createMany: jest.fn() },
    };
    const db = {
      outboxEvent: { findFirst: jest.fn().mockResolvedValue(event) },
      $transaction: jest.fn(async (callback: (value: typeof tx) => unknown) => callback(tx)),
    };
    await expect(new NotificationProjectionWorker(db as never).poll()).resolves.toBe(true);
    expect(tx.notificationProjection.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ status: 'SKIPPED' }) }),
    );
    expect(tx.userNotification.createMany).not.toHaveBeenCalled();
  });

  it('includes failed projections in the retry scan with a backoff boundary', async () => {
    const db = {
      outboxEvent: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    await expect(new NotificationProjectionWorker(db as never).poll()).resolves.toBe(false);
    expect(db.outboxEvent.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { notificationProjection: null },
            {
              notificationProjection: {
                status: 'FAILED',
                projectedAt: { lte: expect.any(Date) },
              },
            },
          ],
        },
      }),
    );
  });

  it('deep-links a rejected identity document without exposing private metadata', async () => {
    const event = {
      id: 'event-verification-rejected',
      eventType: 'identity.verification.rejected.v1',
      aggregateType: 'IdentityVerificationDocument',
      aggregateId: 'document-selfie',
      payload: { documentId: 'document-selfie', decision: 'REJECTED' },
      correlationId: 'correlation-1',
      status: 'PENDING',
      occurredAt: new Date(),
      publishedAt: null,
      attempts: 0,
    };
    const tx = {
      notificationProjection: { upsert: jest.fn().mockResolvedValue({}) },
      userNotification: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const db = {
      outboxEvent: { findFirst: jest.fn().mockResolvedValue(event) },
      identityVerificationDocument: {
        findUnique: jest.fn().mockResolvedValue({ userId: 'customer-1', kind: 'SELFIE' }),
      },
      $transaction: jest.fn(async (callback: (value: typeof tx) => unknown) => callback(tx)),
    };

    await expect(new NotificationProjectionWorker(db as never).poll()).resolves.toBe(true);
    expect(tx.userNotification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: 'customer-1',
          category: 'VERIFICATION',
          href: '/account/verification?document=SELFIE',
        }),
      ],
      skipDuplicates: true,
    });
  });
});
