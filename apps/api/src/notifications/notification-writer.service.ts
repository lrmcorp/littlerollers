import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { randomUUID } from 'crypto';

type Tx = Prisma.TransactionClient | PrismaService;

export type NotificationCategory = 'PAYMENT' | 'BOOKING' | 'SCHEDULE' | 'SYSTEM' | 'PROMO' | string;
export type NotificationTone = 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER' | string;
export type ApplicationRole = 'SUPERADMIN' | 'ADMIN' | 'COACH' | 'MEMBER' | string;

export interface NotificationItem {
  id: string;
  userId: string;
  eventKey: string;
  category: string;
  tone: string;
  title: string;
  message: string;
  href: string | null;
  branchId: string | null;
  metadataMasked?: unknown;
  readAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export const inMemoryNotifications: NotificationItem[] = [];

export interface WriteNotificationInput {
  userId: string;
  eventKey: string;
  category: NotificationCategory;
  tone: NotificationTone;
  title: string;
  message: string;
  href?: string;
  branchId?: string;
  expiresInDays?: number;
}

export interface WriteForBranchInput {
  branchId: string;
  roles: ApplicationRole[];
  eventKey: string;
  category: NotificationCategory;
  tone: NotificationTone;
  title: string;
  message: string;
  href?: string;
  expiresInDays?: number;
}

@Injectable()
export class NotificationWriterService {
  constructor(private readonly db: PrismaService) {}

  /**
   * Menulis notifikasi in-app untuk satu user.
   */
  async writeForUser(_tx: Tx, input: WriteNotificationInput): Promise<void> {
    const exists = inMemoryNotifications.some(
      (n) => n.userId === input.userId && n.eventKey === input.eventKey,
    );
    if (exists) return;

    const expiresAt = input.expiresInDays
      ? new Date(Date.now() + input.expiresInDays * 86_400_000)
      : null;

    inMemoryNotifications.unshift({
      id: randomUUID(),
      userId: input.userId,
      eventKey: input.eventKey,
      category: input.category,
      tone: input.tone,
      title: input.title,
      message: input.message,
      href: input.href ?? null,
      branchId: input.branchId ?? null,
      readAt: null,
      expiresAt,
      createdAt: new Date(),
    });

    if (inMemoryNotifications.length > 500) {
      inMemoryNotifications.pop();
    }
  }

  /**
   * Menulis notifikasi in-app ke staf cabang.
   */
  async writeForUsersInBranch(_tx: Tx, input: WriteForBranchInput): Promise<void> {
    const expiresAt = input.expiresInDays
      ? new Date(Date.now() + input.expiresInDays * 86_400_000)
      : null;

    const users = await this.db.user.findMany({
      where: {
        preferredBranchId: input.branchId,
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    for (const user of users) {
      const eventKey = `${input.eventKey}:${user.id}`;
      const exists = inMemoryNotifications.some(
        (n) => n.userId === user.id && n.eventKey === eventKey,
      );
      if (!exists) {
        inMemoryNotifications.unshift({
          id: randomUUID(),
          userId: user.id,
          eventKey,
          category: input.category,
          tone: input.tone,
          title: input.title,
          message: input.message,
          href: input.href ?? null,
          branchId: input.branchId,
          readAt: null,
          expiresAt,
          createdAt: new Date(),
        });
      }
    }
  }
}
