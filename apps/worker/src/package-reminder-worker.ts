import { randomUUID } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import type { RuntimeConfig } from '@dailydose/config';
import {
  deterministicKey,
  encryptEnvelope,
  hashEmail,
  maskEmail,
  type EmailTemplateKey,
} from '@dailydose/notification-core';

const localDate = (value: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
};

const dayDifference = (from: Date, until: Date, timezone: string) => {
  const fromDate = Date.parse(`${localDate(from, timezone)}T00:00:00Z`);
  const untilDate = Date.parse(`${localDate(until, timezone)}T00:00:00Z`);
  return Math.round((untilDate - fromDate) / 86_400_000);
};

export class PackageReminderWorker {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly db: PrismaClient,
    private readonly config: RuntimeConfig['email'],
    private readonly intervalMs = 3_600_000,
  ) {}

  start() {
    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick() {
    try {
      await this.runOnce();
    } catch {
      console.error('package_reminder_worker_failed');
    }
  }

  private async createReminder(input: {
    packageId: string;
    userId: string;
    branchId: string;
    email: string;
    eventType: string;
    templateKey: EmailTemplateKey;
    occurrence: string;
    detail: string;
    now: Date;
  }) {
    const baseUrl = process.env.PUBLIC_WEB_BASE_URL?.trim();
    const occurrenceKey = deterministicKey(
      'email',
      input.eventType,
      input.packageId,
      input.occurrence,
    );
    return this.db.$transaction(async (tx) => {
      const notification = await tx.userNotification.createMany({
        data: [
          {
            id: randomUUID(),
            userId: input.userId,
            branchId: input.branchId,
            eventKey: `package-reminder:${input.packageId}:${input.occurrence}`,
            category: 'PACKAGE',
            tone: 'WARNING',
            title:
              input.templateKey === 'PACKAGE_LOW_BALANCE_V1'
                ? 'Your package is running low'
                : 'Your package expires soon',
            message: input.detail,
            href: '/account/packages',
            metadataMasked: { customerPackageId: input.packageId },
            createdAt: input.now,
          },
        ],
        skipDuplicates: true,
      });
      if (baseUrl && this.config.encryptionKey) {
        const recipient = this.config.recipientOverride || input.email;
        await tx.notificationOccurrence.upsert({
          where: { occurrenceKey },
          create: {
            id: randomUUID(),
            occurrenceKey,
            userId: input.userId,
            branchId: input.branchId,
            eventType: input.eventType,
            templateKey: input.templateKey,
            recipientHash: hashEmail(recipient),
            recipientMasked: maskEmail(recipient),
            envelopeEncrypted: encryptEnvelope(
              {
                to: recipient,
                variables: {
                  href: new URL('/account/packages', baseUrl).toString(),
                  detail: input.detail,
                },
              },
              this.config.encryptionKey,
            ),
            maxAttempts: this.config.maxAttempts,
            correlationId: `package-reminder:${input.packageId}:${input.occurrence}`,
          },
          update: {},
        });
      }
      return notification.count > 0;
    });
  }

  async runOnce(now = new Date()) {
    let created = 0;
    let cursor: string | undefined;
    while (true) {
      const packages = await this.db.customerPackage.findMany({
        where: {
          status: 'ACTIVE',
          expiryAt: { gt: now },
          customer: { email: { not: null }, status: 'ACTIVE' },
        },
        include: { customer: { select: { email: true } }, branch: { select: { timezone: true } } },
        orderBy: [{ expiryAt: 'asc' }, { id: 'asc' }],
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        take: 250,
      });
      if (!packages.length) break;
      cursor = packages.at(-1)!.id;
      for (const item of packages) {
        if (!item.customer.email) continue;
        const [ledger, reservations] = await Promise.all([
          this.db.ledgerEntry.aggregate({
            where: { customerPackageId: item.id },
            _sum: { quantity: true },
          }),
          this.db.sessionReservation.aggregate({
            where: { customerPackageId: item.id, status: 'ACTIVE' },
            _sum: { quantity: true },
          }),
        ]);
        const available = (ledger._sum.quantity ?? 0) - (reservations._sum.quantity ?? 0);
        if ([3, 1, 0].includes(available)) {
          const inserted = await this.createReminder({
            packageId: item.id,
            userId: item.customerUserId,
            branchId: item.branchId,
            email: item.customer.email,
            eventType: 'package.session_balance_threshold_reached.v1',
            templateKey: 'PACKAGE_LOW_BALANCE_V1',
            occurrence: `balance-${available}`,
            detail: `You have ${available} ${available === 1 ? 'session' : 'sessions'} left on your package.`,
            now,
          });
          if (inserted) created += 1;
        }
        const days = dayDifference(now, item.expiryAt, item.branch.timezone);
        if ([7, 3, 1].includes(days)) {
          const inserted = await this.createReminder({
            packageId: item.id,
            userId: item.customerUserId,
            branchId: item.branchId,
            email: item.customer.email,
            eventType: 'package.expiry_reminder.v1',
            templateKey: 'PACKAGE_EXPIRY_REMINDER_V1',
            occurrence: `expiry-${localDate(item.expiryAt, item.branch.timezone)}-h${days}`,
            detail: `Your package expires in ${days} ${days === 1 ? 'day' : 'days'}.`,
            now,
          });
          if (inserted) created += 1;
        }
      }
    }
    return created;
  }
}
