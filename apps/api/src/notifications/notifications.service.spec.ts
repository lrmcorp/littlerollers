import { NotificationsService } from './notifications.service';
import { inMemoryNotifications } from './notification-writer.service';

const principal = {
  userId: 'user-1',
  roles: [{ role: 'CUSTOMER', branchId: null }],
  branchIds: [],
  capabilities: ['customer:self'],
} as never;

describe('NotificationsService', () => {
  beforeEach(() => {
    inMemoryNotifications.length = 0;
  });

  it('lists only the authenticated user and applies expiry and unread scope', async () => {
    inMemoryNotifications.push(
      {
        id: 'notif-1',
        userId: 'user-1',
        eventKey: 'booking.created',
        category: 'BOOKING',
        tone: 'INFO',
        title: 'Booking Confirmed',
        message: 'Your booking is confirmed',
        href: '/classes/1',
        branchId: null,
        readAt: null,
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
      },
      {
        id: 'notif-2',
        userId: 'user-1',
        eventKey: 'promo',
        category: 'PROMO',
        tone: 'INFO',
        title: 'Promo Read',
        message: 'Already read',
        href: null,
        branchId: null,
        readAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
      },
      {
        id: 'notif-other',
        userId: 'user-2',
        eventKey: 'booking.created',
        category: 'BOOKING',
        tone: 'INFO',
        title: 'Other User',
        message: 'Other user booking',
        href: null,
        branchId: null,
        readAt: null,
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
      },
      {
        id: 'notif-expired',
        userId: 'user-1',
        eventKey: 'expired',
        category: 'SYSTEM',
        tone: 'WARNING',
        title: 'Expired',
        message: 'Expired message',
        href: null,
        branchId: null,
        readAt: null,
        expiresAt: new Date(Date.now() - 10000),
        createdAt: new Date(),
      },
    );

    const service = new NotificationsService();
    const result = await service.list(principal, {
      limit: 10,
      unreadOnly: true,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('notif-1');
    expect(result.page.hasMore).toBe(false);
  });

  it('does not reveal or mark read a notification owned by another user', async () => {
    inMemoryNotifications.push({
      id: 'notification-2',
      userId: 'user-2', // owned by user-2
      eventKey: 'other',
      category: 'SYSTEM',
      tone: 'INFO',
      title: 'Not Yours',
      message: 'Private',
      href: null,
      branchId: null,
      readAt: null,
      expiresAt: null,
      createdAt: new Date(),
    });

    const service = new NotificationsService();
    await expect(service.markRead(principal, 'notification-2')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('safely formats notifications with string dates or non-standard tones', async () => {
    inMemoryNotifications.push({
      id: 'notif-defensive',
      userId: 'user-1',
      eventKey: 'system.alert',
      category: 'SYSTEM',
      tone: undefined as any,
      title: 'Resilience Test',
      message: 'Test message',
      href: '/workspace',
      branchId: null,
      readAt: '2026-10-01T00:00:00.000Z' as any,
      expiresAt: null,
      createdAt: '2026-10-01T00:00:00.000Z' as any,
    });

    const service = new NotificationsService();
    const result = await service.list(principal, { limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.tone).toBe('info');
    expect(result.items[0]?.readAt).toBe('2026-10-01T00:00:00.000Z');
    expect(result.items[0]?.createdAt).toBe('2026-10-01T00:00:00.000Z');
  });
});
