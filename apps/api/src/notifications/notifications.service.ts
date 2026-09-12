import { HttpStatus, Injectable } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';
import { inMemoryNotifications, type NotificationItem } from './notification-writer.service';

@Injectable()
export class NotificationsService {
  private safeHref(value: string | null) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
    try {
      const url = new URL(value, 'https://dailydose.invalid');
      if (url.origin !== 'https://dailydose.invalid') return null;
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return null;
    }
  }

  private view(item: NotificationItem) {
    return {
      ...item,
      href: this.safeHref(item.href),
      tone: item.tone.toLowerCase(),
      readAt: item.readAt?.toISOString() ?? null,
      expiresAt: item.expiresAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
    };
  }

  async list(
    principal: SessionPrincipal,
    input: { cursor?: string; limit?: number; unreadOnly?: boolean },
  ) {
    const limit = input.limit ?? 20;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const now = new Date();
    const userNotifications = inMemoryNotifications.filter((n) => {
      if (n.userId !== principal.userId) return false;
      if (input.unreadOnly && n.readAt !== null) return false;
      if (n.expiresAt && n.expiresAt <= now) return false;
      return true;
    });

    let startIndex = 0;
    if (input.cursor) {
      const cursorIndex = userNotifications.findIndex((n) => n.id === input.cursor);
      if (cursorIndex === -1) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      startIndex = cursorIndex + 1;
    }

    const items = userNotifications.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < userNotifications.length;

    return {
      items: items.map((item) => this.view(item)),
      page: { hasMore, nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null },
    };
  }

  async unreadCount(principal: SessionPrincipal) {
    const now = new Date();
    const count = inMemoryNotifications.filter(
      (n) =>
        n.userId === principal.userId &&
        n.readAt === null &&
        (!n.expiresAt || n.expiresAt > now),
    ).length;

    return { count };
  }

  async markRead(principal: SessionPrincipal, id: string) {
    const item = inMemoryNotifications.find((n) => n.id === id && n.userId === principal.userId);
    if (!item) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    item.readAt = new Date();
    return this.view(item);
  }

  async markAllRead(principal: SessionPrincipal) {
    const readAt = new Date();
    let updatedCount = 0;

    for (const item of inMemoryNotifications) {
      if (item.userId === principal.userId && item.readAt === null) {
        item.readAt = readAt;
        updatedCount++;
      }
    }

    return { updatedCount, readAt: readAt.toISOString() };
  }
}
