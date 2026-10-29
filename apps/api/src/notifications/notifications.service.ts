import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: PrismaService) {}

  private safeHref(value: string | null) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
    try {
      const url = new URL(value, 'https://littlerollers.invalid');
      if (url.origin !== 'https://littlerollers.invalid') return null;
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return null;
    }
  }

  private view(item: {
    id: string;
    category: string;
    tone: string;
    title: string;
    message: string;
    href: string | null;
    branchId: string | null;
    metadataMasked: unknown;
    readAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
  }) {
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
    const cursor = input.cursor
      ? await this.db.userNotification.findFirst({
          where: { id: input.cursor, userId: principal.userId },
          select: { id: true, createdAt: true },
        })
      : null;
    if (input.cursor && !cursor) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const now = new Date();
    const items = await this.db.userNotification.findMany({
      where: {
        userId: principal.userId,
        ...(input.unreadOnly ? { readAt: null } : {}),
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        ...(cursor
          ? {
              AND: [
                {
                  OR: [
                    { createdAt: { lt: cursor.createdAt } },
                    { createdAt: cursor.createdAt, id: { lt: cursor.id } },
                  ],
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
    });
    const hasMore = items.length > limit;
    const page = items.slice(0, limit);
    return {
      items: page.map((item) => this.view(item)),
      page: { hasMore, nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null },
    };
  }

  async unreadCount(principal: SessionPrincipal) {
    const now = new Date();
    return {
      count: await this.db.userNotification.count({
        where: {
          userId: principal.userId,
          readAt: null,
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
      }),
    };
  }

  async markRead(principal: SessionPrincipal, id: string) {
    const changed = await this.db.userNotification.updateMany({
      where: { id, userId: principal.userId, readAt: null },
      data: { readAt: new Date() },
    });
    if (changed.count === 0) {
      const existing = await this.db.userNotification.findFirst({
        where: { id, userId: principal.userId },
      });
      if (!existing) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const notification = await this.db.userNotification.findFirst({
      where: { id, userId: principal.userId },
    });
    return this.view(notification!);
  }

  async markAllRead(principal: SessionPrincipal) {
    const readAt = new Date();
    const result = await this.db.userNotification.updateMany({
      where: {
        userId: principal.userId,
        readAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: readAt } }],
      },
      data: { readAt },
    });
    return { updatedCount: result.count, readAt: readAt.toISOString() };
  }
}
