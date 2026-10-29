import { randomUUID } from 'node:crypto';
import type { NotificationDeliveryStatus, PrismaClient } from '@prisma/client';
import type { RuntimeConfig } from '@dailydose/config';
import {
  decryptEnvelope,
  EMAIL_TEMPLATE_KEYS,
  renderEmail,
  type EmailTemplateKey,
} from '@dailydose/notification-core';
import nodemailer from 'nodemailer';

const RETRY_DELAYS_MS = [60_000, 300_000, 900_000, 3_600_000];

type SendFailure = Error & { code?: string; responseCode?: number; response?: string };

export class EmailDeliveryWorker {
  private timer?: NodeJS.Timeout;
  private lastEnvelopeCleanupAt = 0;

  constructor(
    private readonly db: PrismaClient,
    private readonly config: RuntimeConfig['email'],
    private readonly pollIntervalMs = 2_000,
  ) {}

  start() {
    if (!this.config.deliveryEnabled) return;
    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.pollIntervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick() {
    try {
      await this.poll();
    } catch {
      console.error('email_delivery_worker_poll_failed');
    }
  }

  private async rateLimited(now: Date) {
    const [minute, hour] = await Promise.all([
      this.db.notificationAttempt.count({
        where: { startedAt: { gte: new Date(now.getTime() - 60_000) } },
      }),
      this.db.notificationAttempt.count({
        where: { startedAt: { gte: new Date(now.getTime() - 3_600_000) } },
      }),
    ]);
    return minute >= this.config.rateLimitPerMinute || hour >= this.config.rateLimitPerHour;
  }

  private classify(error: SendFailure) {
    const responseCode = Number(error.responseCode || 0);
    const terminal =
      responseCode >= 500 ||
      ['EAUTH', 'EENVELOPE', 'EMESSAGE'].includes(error.code || '') ||
      /authentication|invalid recipient|mailbox unavailable|envelope|template/i.test(error.message);
    return {
      retryable: !terminal,
      errorCode: terminal ? 'SMTP_TERMINAL' : 'SMTP_RETRYABLE',
      providerCode: responseCode ? String(responseCode) : error.code?.slice(0, 64),
    };
  }

  private async send(to: string, templateKey: EmailTemplateKey, variables: Record<string, string>) {
    const rendered = renderEmail(templateKey, variables);
    const from = `"${this.config.fromName.replaceAll('"', '')}" <${this.config.fromEmail}>`;
    if (this.config.driver === 'resend') {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.config.resendApiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ from, to: [to], ...rendered }),
      });
      if (!response.ok) {
        const failure = new Error('EMAIL_PROVIDER_REJECTED') as SendFailure;
        failure.responseCode = response.status;
        throw failure;
      }
      return { providerCode: String(response.status) };
    }
    const transporter = nodemailer.createTransport({
      host: this.config.smtpHost!,
      port: this.config.smtpPort,
      secure: this.config.smtpSecure,
      requireTLS: !this.config.smtpSecure,
      auth: { user: this.config.smtpUser!, pass: this.config.smtpPassword! },
      connectionTimeout: this.config.connectionTimeoutMs,
      greetingTimeout: this.config.connectionTimeoutMs,
      socketTimeout: this.config.connectionTimeoutMs,
      tls: { rejectUnauthorized: true },
    });
    try {
      const result = await transporter.sendMail({ from, to, ...rendered });
      return { providerCode: /^\d{3}/.exec(result.response || '')?.[0] || 'SMTP_ACCEPTED' };
    } finally {
      transporter.close();
    }
  }

  async poll(now = new Date()): Promise<boolean> {
    if (!this.config.deliveryEnabled || !this.config.encryptionKey) return false;
    if (now.getTime() - this.lastEnvelopeCleanupAt >= 3_600_000) {
      await this.db.notificationOccurrence.updateMany({
        where: {
          envelopeEncrypted: { not: null },
          updatedAt: { lt: new Date(now.getTime() - 7 * 86_400_000) },
          status: { in: ['FAILED_TERMINAL', 'FALLBACK_IN_APP', 'EXPIRED'] },
        },
        data: { envelopeEncrypted: null },
      });
      this.lastEnvelopeCleanupAt = now.getTime();
    }
    const occurrence = await this.db.notificationOccurrence.findFirst({
      where: {
        nextAttemptAt: { lte: now },
        OR: [
          { status: { in: ['PENDING', 'FAILED_RETRYABLE'] } },
          { status: 'SENDING', leaseExpiresAt: { lte: now } },
        ],
      },
      orderBy: [{ nextAttemptAt: 'asc' }, { createdAt: 'asc' }],
    });
    if (!occurrence) return false;
    if (await this.rateLimited(now)) {
      await this.db.notificationOccurrence.update({
        where: { id: occurrence.id },
        data: {
          rateLimitWaitCount: { increment: 1 },
          nextAttemptAt: new Date(now.getTime() + 10_000),
        },
      });
      return false;
    }
    if (occurrence.expiresAt && occurrence.expiresAt <= now) {
      await this.db.notificationOccurrence.update({
        where: { id: occurrence.id },
        data: {
          status: 'EXPIRED',
          envelopeEncrypted: null,
          leaseExpiresAt: null,
          lastErrorCode: 'MESSAGE_EXPIRED',
        },
      });
      return true;
    }
    const claimed = await this.db.notificationOccurrence.updateMany({
      where: {
        id: occurrence.id,
        OR: [
          { status: { in: ['PENDING', 'FAILED_RETRYABLE'] } },
          { status: 'SENDING', leaseExpiresAt: { lte: now } },
        ],
      },
      data: {
        status: 'SENDING',
        leaseExpiresAt: new Date(now.getTime() + 60_000),
        attemptCount: { increment: 1 },
      },
    });
    if (!claimed.count) return false;
    const current = await this.db.notificationOccurrence.findUniqueOrThrow({
      where: { id: occurrence.id },
    });
    const attempt = await this.db.notificationAttempt.create({
      data: {
        id: randomUUID(),
        occurrenceId: current.id,
        attemptNumber: current.attemptCount,
        status: 'SENDING',
      },
    });
    try {
      if (!current.envelopeEncrypted) throw new Error('EMAIL_ENVELOPE_MISSING');
      if (!EMAIL_TEMPLATE_KEYS.includes(current.templateKey as EmailTemplateKey))
        throw new Error('EMAIL_TEMPLATE_UNSUPPORTED');
      const envelope = decryptEnvelope(current.envelopeEncrypted, this.config.encryptionKey);
      const result = await this.send(
        envelope.to,
        current.templateKey as EmailTemplateKey,
        envelope.variables,
      );
      await this.db.$transaction([
        this.db.notificationAttempt.update({
          where: { id: attempt.id },
          data: {
            status: 'ACCEPTED_BY_SMTP',
            providerCode: result.providerCode,
            completedAt: new Date(),
          },
        }),
        this.db.notificationOccurrence.update({
          where: { id: current.id },
          data: {
            status: 'ACCEPTED_BY_SMTP',
            acceptedAt: new Date(),
            leaseExpiresAt: null,
            lastErrorCode: null,
            envelopeEncrypted: null,
          },
        }),
      ]);
      return true;
    } catch (unknownError) {
      const error = unknownError as SendFailure;
      const classified = this.classify(error);
      const retryable = classified.retryable && current.attemptCount < current.maxAttempts;
      const status: NotificationDeliveryStatus = retryable ? 'FAILED_RETRYABLE' : 'FAILED_TERMINAL';
      const delay =
        RETRY_DELAYS_MS[Math.min(current.attemptCount - 1, RETRY_DELAYS_MS.length - 1)]!;
      await this.db.$transaction(async (tx) => {
        await tx.notificationAttempt.update({
          where: { id: attempt.id },
          data: {
            status,
            providerCode: classified.providerCode,
            errorCode: classified.errorCode,
            completedAt: new Date(),
          },
        });
        await tx.notificationOccurrence.update({
          where: { id: current.id },
          data: {
            status: retryable ? status : current.userId ? 'FALLBACK_IN_APP' : status,
            nextAttemptAt: new Date(now.getTime() + delay),
            leaseExpiresAt: null,
            lastErrorCode: classified.errorCode,
            ...(!retryable && current.userId ? { fallbackCreatedAt: new Date() } : {}),
          },
        });
        if (!retryable && current.userId) {
          await tx.userNotification.createMany({
            data: [
              {
                id: randomUUID(),
                userId: current.userId,
                branchId: current.branchId,
                eventKey: `email-fallback:${current.id}`,
                category: 'SYSTEM',
                tone: 'WARNING',
                title: 'We could not send an email',
                message:
                  'The details are still here in the app. Our team has been told about the problem.',
                href: null,
                metadataMasked: { occurrenceId: current.id },
              },
            ],
            skipDuplicates: true,
          });
        }
        if (!retryable) {
          const operators = await tx.userRole.findMany({
            where: {
              role: { in: ['OPS', 'SUPER_OWNER'] },
              activeFrom: { lte: now },
              OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
              user: { status: 'ACTIVE' },
            },
            distinct: ['userId'],
            select: { userId: true, branchId: true },
          });
          if (operators.length) {
            await tx.userNotification.createMany({
              data: operators.map((operator) => ({
                id: randomUUID(),
                userId: operator.userId,
                branchId: operator.branchId,
                eventKey: `email-terminal-alert:${current.id}:${operator.userId}`,
                category: 'SYSTEM' as const,
                tone: 'DANGER' as const,
                title: 'Pengiriman email gagal terminal',
                message: `Occurrence ${current.id} memerlukan pemeriksaan operasional.`,
                href: '/operations',
                metadataMasked: {
                  occurrenceId: current.id,
                  errorCode: classified.errorCode,
                },
              })),
              skipDuplicates: true,
            });
          }
        }
      });
      console.warn('email_delivery_failed', {
        occurrenceId: current.id,
        correlationId: current.correlationId,
        errorCode: classified.errorCode,
        retryable,
      });
      return true;
    }
  }
}
