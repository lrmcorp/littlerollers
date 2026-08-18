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
      dokumenVerifikasiIdentitas: {
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

  it('projects a reschedule request to branch staff in-app without email', async () => {
    const event = {
      id: 'event-reschedule-requested',
      eventType: 'booking.reschedule_requested.v1',
      aggregateType: 'Booking',
      aggregateId: 'booking-1',
      payload: { bookingId: 'booking-1', branchId: 'branch-1' },
      correlationId: 'correlation-reschedule',
      status: 'PENDING',
      occurredAt: new Date(),
      publishedAt: null,
      attempts: 0,
    };
    const tx = {
      notificationProjection: { upsert: jest.fn().mockResolvedValue({}) },
      userNotification: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
      user: { findMany: jest.fn() },
      notificationOccurrence: { upsert: jest.fn() },
    };
    const db = {
      outboxEvent: { findFirst: jest.fn().mockResolvedValue(event) },
      pemesananKelas: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'booking-1',
          customerUserId: 'customer-1',
          branchId: 'branch-1',
          classSlotId: 'slot-1',
        }),
      },
      user: { findMany: jest.fn().mockResolvedValue([{ id: 'admin-1' }, { id: 'owner-1' }]) },
      $transaction: jest.fn(async (callback: (value: typeof tx) => unknown) => callback(tx)),
    };

    await expect(new NotificationProjectionWorker(db as never).poll()).resolves.toBe(true);
    expect(tx.userNotification.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          userId: 'admin-1',
          category: 'APPROVAL',
          href: '/bookings?rescheduleStatus=PENDING',
        }),
      ]),
      skipDuplicates: true,
    });
    expect(tx.notificationOccurrence.upsert).not.toHaveBeenCalled();
  });

  it('projects a session adjustment request to branch reviewers without email', async () => {
    const event = {
      id: 'event-adjustment-requested',
      eventType: 'session.adjustment_requested.v1',
      aggregateType: 'SessionAdjustment',
      aggregateId: 'adjustment-1',
      payload: {},
      correlationId: 'correlation-adjustment',
      status: 'PENDING',
      occurredAt: new Date(),
      publishedAt: null,
      attempts: 0,
    };
    const tx = {
      notificationProjection: { upsert: jest.fn().mockResolvedValue({}) },
      userNotification: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
      notificationOccurrence: { upsert: jest.fn() },
    };
    const db = {
      outboxEvent: { findFirst: jest.fn().mockResolvedValue(event) },
      penyesuaianSesi: {
        findUnique: jest.fn().mockResolvedValue({
          customerPackage: { customerUserId: 'customer-1', branchId: 'branch-1' },
        }),
      },
      user: { findMany: jest.fn().mockResolvedValue([{ id: 'manager-1' }]) },
      $transaction: jest.fn(async (callback: (value: typeof tx) => unknown) => callback(tx)),
    };
    await expect(new NotificationProjectionWorker(db as never).poll()).resolves.toBe(true);
    expect(tx.userNotification.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ userId: 'manager-1', category: 'APPROVAL' })],
      skipDuplicates: true,
    });
    expect(tx.notificationOccurrence.upsert).not.toHaveBeenCalled();
  });

  it('notifies a customer when attendance is backfilled without creating email', async () => {
    const event = {
      id: 'event-attendance-backfill',
      eventType: 'check_in.customer_backfilled.v1',
      aggregateType: 'Booking',
      aggregateId: 'booking-1',
      payload: { branchId: 'branch-1' },
      correlationId: 'correlation-attendance',
      status: 'PENDING',
      occurredAt: new Date(),
      publishedAt: null,
      attempts: 0,
    };
    const tx = {
      notificationProjection: { upsert: jest.fn().mockResolvedValue({}) },
      userNotification: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
      notificationOccurrence: { upsert: jest.fn() },
    };
    const db = {
      outboxEvent: { findFirst: jest.fn().mockResolvedValue(event) },
      pemesananKelas: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'booking-1',
          customerUserId: 'customer-1',
          branchId: 'branch-1',
          classSlotId: 'slot-1',
          classSlot: { instructorUserId: 'instructor-1' },
        }),
      },
      $transaction: jest.fn(async (callback: (value: typeof tx) => unknown) => callback(tx)),
    };
    await expect(new NotificationProjectionWorker(db as never).poll()).resolves.toBe(true);
    expect(tx.userNotification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: 'customer-1',
          category: 'ATTENDANCE',
          title: 'Kehadiran diperbarui',
        }),
      ],
      skipDuplicates: true,
    });
    expect(tx.notificationOccurrence.upsert).not.toHaveBeenCalled();
  });

  it('notifies only no-show customers when a class is completed', async () => {
    const event = {
      id: 'event-class-completed',
      eventType: 'class.completed.v1',
      aggregateType: 'ClassSlot',
      aggregateId: 'slot-1',
      payload: { branchId: 'branch-1', attendedCount: 1, noShowCount: 1 },
      correlationId: 'correlation-completion',
      status: 'PENDING',
      occurredAt: new Date(),
      publishedAt: null,
      attempts: 0,
    };
    const tx = {
      notificationProjection: { upsert: jest.fn().mockResolvedValue({}) },
      userNotification: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
      notificationOccurrence: { upsert: jest.fn() },
    };
    const db = {
      outboxEvent: { findFirst: jest.fn().mockResolvedValue(event) },
      pemesananKelas: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'booking-no-show',
            customerUserId: 'customer-no-show',
            branchId: 'branch-1',
            classSlotId: 'slot-1',
          },
        ]),
      },
      $transaction: jest.fn(async (callback: (value: typeof tx) => unknown) => callback(tx)),
    };
    await expect(new NotificationProjectionWorker(db as never).poll()).resolves.toBe(true);
    expect(db.pemesananKelas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { classSlotId: 'slot-1', status: 'NO_SHOW' } }),
    );
    expect(tx.userNotification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          userId: 'customer-no-show',
          title: 'Kehadiran tidak tercatat',
          href: '/bookings/booking-no-show',
        }),
      ],
      skipDuplicates: true,
    });
  });

  it('creates one deterministic customer email occurrence for a posted adjustment', async () => {
    const previousBaseUrl = process.env.PUBLIC_WEB_BASE_URL;
    process.env.PUBLIC_WEB_BASE_URL = 'https://dailydosepilates.com';
    const event = {
      id: 'event-adjustment-posted',
      eventType: 'session.adjustment_posted.v1',
      aggregateType: 'SessionAdjustment',
      aggregateId: 'adjustment-1',
      payload: {},
      correlationId: 'correlation-adjustment',
      status: 'PENDING',
      occurredAt: new Date(),
      publishedAt: null,
      attempts: 0,
    };
    const tx = {
      notificationProjection: { upsert: jest.fn().mockResolvedValue({}) },
      userNotification: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
      user: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'customer-1', email: 'customer@example.test' }]),
      },
      notificationOccurrence: { upsert: jest.fn().mockResolvedValue({}) },
    };
    const db = {
      outboxEvent: { findFirst: jest.fn().mockResolvedValue(event) },
      penyesuaianSesi: {
        findUnique: jest.fn().mockResolvedValue({
          customerPackage: { customerUserId: 'customer-1', branchId: 'branch-1' },
        }),
      },
      $transaction: jest.fn(async (callback: (value: typeof tx) => unknown) => callback(tx)),
    };
    try {
      await expect(
        new NotificationProjectionWorker(db as never, 5_000, {
          encryptionKey: Buffer.alloc(32, 1).toString('base64'),
          maxAttempts: 5,
          recipientOverride: null,
        } as never).poll(),
      ).resolves.toBe(true);
      expect(tx.notificationOccurrence.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            templateKey: 'SESSION_ADJUSTMENT_POSTED_V1',
            userId: 'customer-1',
          }),
        }),
      );
    } finally {
      process.env.PUBLIC_WEB_BASE_URL = previousBaseUrl;
    }
  });

  it('notifies customer, assigned instructor, and branch operations but emails only customer', async () => {
    const previousBaseUrl = process.env.PUBLIC_WEB_BASE_URL;
    process.env.PUBLIC_WEB_BASE_URL = 'https://dailydosepilates.com';
    const event = {
      id: 'event-booking-cancelled',
      eventType: 'booking.cancelled.v1',
      aggregateType: 'Booking',
      aggregateId: 'booking-1',
      payload: { branchId: 'branch-1' },
      correlationId: 'correlation-cancelled',
      status: 'PENDING',
      occurredAt: new Date(),
      publishedAt: null,
      attempts: 0,
    };
    const tx = {
      notificationProjection: { upsert: jest.fn().mockResolvedValue({}) },
      userNotification: { createMany: jest.fn().mockResolvedValue({ count: 4 }) },
      user: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'customer-1', email: 'customer@example.test' },
          { id: 'instructor-1', email: 'instructor@example.test' },
          { id: 'admin-1', email: 'admin@example.test' },
          { id: 'manager-1', email: 'manager@example.test' },
        ]),
      },
      notificationOccurrence: { upsert: jest.fn().mockResolvedValue({}) },
    };
    const db = {
      outboxEvent: { findFirst: jest.fn().mockResolvedValue(event) },
      pemesananKelas: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'booking-1',
          customerUserId: 'customer-1',
          branchId: 'branch-1',
          classSlotId: 'slot-1',
          classSlot: { instructorUserId: 'instructor-1' },
        }),
      },
      user: {
        findMany: jest.fn().mockResolvedValue([{ id: 'admin-1' }, { id: 'manager-1' }]),
      },
      $transaction: jest.fn(async (callback: (value: typeof tx) => unknown) => callback(tx)),
    };
    try {
      await expect(
        new NotificationProjectionWorker(db as never, 5_000, {
          encryptionKey: Buffer.alloc(32, 1).toString('base64'),
          maxAttempts: 5,
          recipientOverride: null,
        } as never).poll(),
      ).resolves.toBe(true);
      const notifications = tx.userNotification.createMany.mock.calls[0]![0].data;
      expect(notifications.map(({ userId }: { userId: string }) => userId).sort()).toEqual([
        'admin-1',
        'customer-1',
        'instructor-1',
        'manager-1',
      ]);
      expect(tx.notificationOccurrence.upsert).toHaveBeenCalledTimes(1);
      expect(tx.notificationOccurrence.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            userId: 'customer-1',
            templateKey: 'BOOKING_CANCELLED_V1',
          }),
        }),
      );
    } finally {
      process.env.PUBLIC_WEB_BASE_URL = previousBaseUrl;
    }
  });
});
