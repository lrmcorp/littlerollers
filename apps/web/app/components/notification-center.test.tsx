import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationClient, UserNotification } from '@/api-clients/notification-client';
import { NotificationCenter } from './notification-center';

const mockSessionContext = vi.hoisted(() => vi.fn(() => null));
vi.mock('../session-context', () => ({
  useSessionContext: () => mockSessionContext(),
}));

const item = (id: string, title = `Notifikasi ${id}`): UserNotification => ({
  id,
  category: 'BOOKING',
  tone: 'success',
  title,
  message: 'Pembaruan aman untuk customer.',
  href: '/bookings',
  branchId: 'branch-1',
  metadataMasked: null,
  readAt: null,
  expiresAt: null,
  createdAt: '2026-08-06T00:00:00.000Z',
});

const client = (overrides: Partial<NotificationClient> = {}): NotificationClient => ({
  list: vi.fn().mockResolvedValue({
    items: [item('notification-1')],
    page: { hasMore: false, nextCursor: null },
  }),
  unreadCount: vi.fn().mockResolvedValue({ count: 1 }),
  markRead: vi
    .fn()
    .mockResolvedValue({ ...item('notification-1'), readAt: new Date().toISOString() }),
  markAllRead: vi.fn().mockResolvedValue({ updatedCount: 1, readAt: new Date().toISOString() }),
  ...overrides,
});

describe('NotificationCenter', () => {
  beforeEach(() => {
    mockSessionContext.mockReturnValue(null);
  });
  it('loads current notifications when opened and marks one item read', async () => {
    const notification = { ...item('notification-1'), href: null };
    const api = client({
      list: vi.fn().mockResolvedValue({
        items: [notification],
        page: { hasMore: false, nextCursor: null },
      }),
      markRead: vi.fn().mockResolvedValue({ ...notification, readAt: new Date().toISOString() }),
    });
    render(<NotificationCenter client={api} />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /Notifikasi/ }));
    expect(await screen.findByText('Notifikasi notification-1')).toBeVisible();
    await user.click(screen.getByRole('link', { name: /Notifikasi notification-1/ }));
    expect(api.markRead).toHaveBeenCalledWith('notification-1');
  });

  it('deduplicates paginated records and blocks repeated load-more clicks', async () => {
    let resolveNext!: (value: Awaited<ReturnType<NotificationClient['list']>>) => void;
    const nextPage = new Promise<Awaited<ReturnType<NotificationClient['list']>>>((resolve) => {
      resolveNext = resolve;
    });
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        items: [item('notification-1')],
        page: { hasMore: true, nextCursor: 'notification-1' },
      })
      .mockResolvedValueOnce({
        items: [item('notification-1')],
        page: { hasMore: true, nextCursor: 'notification-1' },
      })
      .mockImplementationOnce(() => nextPage);
    const api = client({ list });
    render(<NotificationCenter client={api} />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /Notifikasi/ }));
    const more = await screen.findByRole('button', { name: 'Muat lebih banyak' });
    await user.click(more);
    expect(screen.getByRole('button', { name: 'Memuat…' })).toBeDisabled();
    resolveNext({
      items: [item('notification-1'), item('notification-2')],
      page: { hasMore: false, nextCursor: null },
    });
    expect(await screen.findByText('Notifikasi notification-2')).toBeVisible();
    expect(screen.getAllByText('Notifikasi notification-1')).toHaveLength(1);
    expect(list).toHaveBeenCalledTimes(3);
  });

  it('keeps unread state and shows a safe error when mark-all fails', async () => {
    const api = client({ markAllRead: vi.fn().mockRejectedValue(new Error('offline')) });
    render(<NotificationCenter client={api} />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: /Notifikasi/ }));
    await user.click(await screen.findByRole('button', { name: 'Tandai semua' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Notifikasi belum dapat diperbarui.',
    );
    expect(screen.getByText('1 belum dibaca')).toBeVisible();
  });

  it('does not poll notification APIs when session context is unauthenticated', () => {
    mockSessionContext.mockReturnValue({ status: 'unauthenticated', session: null } as any);
    const api = client();
    render(<NotificationCenter client={api} />);
    expect(api.list).not.toHaveBeenCalled();
    expect(api.unreadCount).not.toHaveBeenCalled();
  });
});
