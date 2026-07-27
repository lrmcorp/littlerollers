export type NotificationTone = 'success' | 'info' | 'warning' | 'danger';

export type UserNotification = {
  id: string;
  category: string;
  tone: NotificationTone;
  title: string;
  message: string;
  href: string | null;
  branchId: string | null;
  metadataMasked: unknown;
  readAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type UserNotificationPage = {
  items: UserNotification[];
  page: { hasMore: boolean; nextCursor: string | null };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error(`NOTIFICATION_REQUEST_${response.status}`);
  return response.json() as Promise<T>;
}

export const browserNotificationClient = {
  list(input: { cursor?: string; limit?: number; unreadOnly?: boolean } = {}) {
    const query = new URLSearchParams();
    if (input.cursor) query.set('cursor', input.cursor);
    if (input.limit) query.set('limit', String(input.limit));
    if (input.unreadOnly) query.set('unreadOnly', 'true');
    return request<UserNotificationPage>(`/me/notifications?${query}`);
  },
  unreadCount() {
    return request<{ count: number }>('/me/notifications/unread-count');
  },
  markRead(id: string) {
    return request<UserNotification>(`/me/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
    });
  },
  markAllRead() {
    return request<{ updatedCount: number; readAt: string }>('/me/notifications/read-all', {
      method: 'POST',
    });
  },
};
