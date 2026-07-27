import { NotificationsService } from './notifications.service';

const principal = {
  userId: 'user-1',
  roles: [{ role: 'CUSTOMER', branchId: null }],
  branchIds: [],
  capabilities: ['customer:self'],
} as never;

describe('NotificationsService', () => {
  it('lists only the authenticated user and applies expiry and unread scope', async () => {
    const db = {
      userNotification: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const result = await new NotificationsService(db as never).list(principal, {
      limit: 10,
      unreadOnly: true,
    });
    expect(result).toEqual({ items: [], page: { hasMore: false, nextCursor: null } });
    expect(db.userNotification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-1', readAt: null }),
        take: 11,
      }),
    );
  });

  it('does not reveal a notification owned by another user', async () => {
    const db = {
      userNotification: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };
    await expect(
      new NotificationsService(db as never).markRead(principal, 'notification-2'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
    expect(db.userNotification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'user-1' }) }),
    );
  });

  it('rejects an excessive page size before querying', async () => {
    const db = { userNotification: { findMany: jest.fn() } };
    await expect(
      new NotificationsService(db as never).list(principal, { limit: 51 }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 422 });
    expect(db.userNotification.findMany).not.toHaveBeenCalled();
  });
});
