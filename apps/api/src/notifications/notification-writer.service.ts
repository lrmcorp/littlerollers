import { Injectable } from '@nestjs/common';
import { type ApplicationRole, type NotificationCategory, type NotificationTone, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { randomUUID } from 'crypto';

type Tx = Prisma.TransactionClient | PrismaService;

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
   * Menggunakan skipDuplicates untuk idempotency berdasarkan unique(userId, eventKey).
   */
  async writeForUser(tx: Tx, input: WriteNotificationInput): Promise<void> {
    const expiresAt = input.expiresInDays
      ? new Date(Date.now() + input.expiresInDays * 86_400_000)
      : undefined;

    await tx.userNotification.createMany({
      data: [
        {
          id: randomUUID(),
          userId: input.userId,
          eventKey: input.eventKey,
          category: input.category,
          tone: input.tone,
          title: input.title,
          message: input.message,
          href: input.href ?? null,
          branchId: input.branchId ?? null,
          expiresAt: expiresAt ?? null,
        },
      ],
      skipDuplicates: true,
    });
  }

  /**
   * Menulis notifikasi in-app ke semua staf aktif di suatu cabang
   * yang memiliki salah satu dari role yang ditentukan.
   */
  async writeForUsersInBranch(tx: Tx, input: WriteForBranchInput): Promise<void> {
    const now = new Date();
    const expiresAt = input.expiresInDays
      ? new Date(Date.now() + input.expiresInDays * 86_400_000)
      : null;

    // Gunakan PrismaService langsung (bukan tx) agar bisa pakai db.userRole
    const assignments = await this.db.userRole.findMany({
      where: {
        branchId: input.branchId,
        role: { in: input.roles },
        activeFrom: { lte: now },
        OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    if (assignments.length === 0) return;

    await tx.userNotification.createMany({
      data: assignments.map(({ userId }) => ({
        id: randomUUID(),
        userId,
        eventKey: `${input.eventKey}:${userId}`,
        category: input.category,
        tone: input.tone,
        title: input.title,
        message: input.message,
        href: input.href ?? null,
        branchId: input.branchId,
        expiresAt,
      })),
      skipDuplicates: true,
    });
  }
}
