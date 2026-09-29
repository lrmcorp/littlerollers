import { HttpStatus, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EmailDeliveryStatus, Prisma, type EmailDelivery } from '@prisma/client';
import {
  decryptEnvelope,
  deterministicKey,
  encryptEnvelope,
  maskEmail,
  renderEmail,
  type EmailTemplateKey,
} from '@dailydose/notification-core';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';
import { NotificationTemplateService } from '../notifications/notification-template.service';
import { EmailDeliveryError, EmailSender } from './email-sender';

type Database = PrismaService | Prisma.TransactionClient;

export interface NotificationOccurrence {
  id: string;
  occurrenceKey: string;
  eventType: string;
  templateKey: string;
  status: string;
  createdAt: Date;
}

/** Jeda sebelum kirim pertama agar transaksi pemanggil sempat commit (baris yang di-rollback dilewati). */
const FIRST_ATTEMPT_DELAY_MS = 300;
/** Jeda antar percobaan otomatis; percobaan ke-n memakai elemen ke-n (yang terakhir diulang). */
const BACKOFF_MS = [60_000, 5 * 60_000, 15 * 60_000, 30 * 60_000];
/** Baris SENDING lebih lama dari ini saat boot dianggap terputus (proses mati di tengah kirim). */
const STALE_SENDING_MS = 5 * 60_000;
const RECOVERY_LIMIT = 200;
const SENDABLE: EmailDeliveryStatus[] = [
  EmailDeliveryStatus.PENDING,
  EmailDeliveryStatus.FAILED_RETRYABLE,
];
/** Status yang boleh dicoba ulang manual dari halaman Operasi. */
const RETRYABLE_BY_OPERATOR: EmailDeliveryStatus[] = [
  EmailDeliveryStatus.FAILED_TERMINAL,
  EmailDeliveryStatus.FAILED_RETRYABLE,
  EmailDeliveryStatus.FALLBACK_IN_APP,
];

const toOccurrence = (row: EmailDelivery): NotificationOccurrence => ({
  id: row.id,
  occurrenceKey: row.occurrenceKey,
  eventType: row.eventType,
  templateKey: row.templateKey,
  status: row.status,
  createdAt: row.createdAt,
});

/** Kode galat aman untuk kegagalan di luar pengirim (dekripsi, render): hanya kode berawalan EMAIL_. */
function failureFrom(error: unknown): EmailDeliveryError {
  if (error instanceof EmailDeliveryError) return error;
  const message = error instanceof Error ? error.message : '';
  if (/^EMAIL_[A-Z_]+$/u.test(message)) return new EmailDeliveryError(message, false);
  return new EmailDeliveryError('UNEXPECTED_ERROR', true);
}

@Injectable()
export class EmailNotificationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EmailNotificationService.name);
  /** Waktu (ms) email yang diterima server SMTP dalam satu jam terakhir; untuk batas per menit/jam. */
  private accepted: number[] = [];

  constructor(
    private readonly db: PrismaService,
    private readonly config: RuntimeConfigService,
    private readonly sender: EmailSender,
    private readonly templates: NotificationTemplateService,
  ) {}

  /** Pengaturan pengiriman untuk ditampilkan di halaman Operasi. */
  deliverySettings() {
    const email = this.config.value.email;
    return {
      enabled: email.deliveryEnabled,
      driver: email.driver,
      redirected: Boolean(email.recipientOverride),
    };
  }

  /**
   * Menyimpan email ke antrean (terenkripsi) lalu mengirimnya di latar belakang. Alur pemanggil
   * (login, persetujuan pembayaran) tidak menunggu SMTP.
   */
  async enqueue(
    input: {
      eventType: string;
      templateKey: EmailTemplateKey;
      recipient: string;
      variables: Record<string, string>;
      correlationId: string;
      occurrenceParts: Array<string | number | null | undefined>;
      sourceEventId?: string;
      userId?: string;
      branchId?: string;
      expiresAt?: Date;
    },
    database: Database = this.db,
  ): Promise<NotificationOccurrence | null> {
    const email = this.config.value.email;
    if (!email.deliveryEnabled) return null;
    if (!email.encryptionKey) throw new EmailDeliveryError('EMAIL_NOT_CONFIGURED', false);

    const recipient = (email.recipientOverride || input.recipient).trim().toLowerCase();
    const occurrenceKey = deterministicKey(
      'email',
      input.eventType,
      input.templateKey,
      ...input.occurrenceParts,
    );

    let row: EmailDelivery;
    try {
      row = await database.emailDelivery.create({
        data: {
          occurrenceKey,
          eventType: input.eventType,
          templateKey: input.templateKey,
          recipientMasked: maskEmail(recipient),
          envelope: encryptEnvelope({ to: recipient, variables: input.variables }, email.encryptionKey),
          maxAttempts: email.maxAttempts,
          nextAttemptAt: new Date(),
          expiresAt: input.expiresAt ?? null,
          correlationId: input.correlationId.slice(0, 96),
          userId: input.userId ?? null,
          branchId: input.branchId ?? null,
        },
      });
    } catch (error) {
      // Peristiwa yang sama sudah pernah masuk antrean: jangan kirim dua kali.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await database.emailDelivery.findUnique({ where: { occurrenceKey } });
        return existing ? toOccurrence(existing) : null;
      }
      throw error;
    }
    this.schedule(row.id, FIRST_ATTEMPT_DELAY_MS);
    return toOccurrence(row);
  }

  /** Mengirim satu email bila sudah waktunya dan belum diambil proses lain. */
  async deliver(id: string): Promise<void> {
    const email = this.config.value.email;
    const now = new Date();

    const wait = this.rateLimitWaitMs(now.getTime());
    if (wait > 0) {
      const limited = await this.db.emailDelivery.updateMany({
        where: { id, status: { in: SENDABLE } },
        data: { rateLimitWaitCount: { increment: 1 }, nextAttemptAt: new Date(now.getTime() + wait) },
      });
      if (limited.count === 1) this.schedule(id, wait);
      return;
    }

    const claimed = await this.db.emailDelivery.updateMany({
      where: {
        id,
        status: { in: SENDABLE },
        OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
      },
      data: { status: EmailDeliveryStatus.SENDING, attemptCount: { increment: 1 }, lastAttemptAt: now },
    });
    if (claimed.count !== 1) return;
    const row = await this.db.emailDelivery.findUnique({ where: { id } });
    if (!row) return;

    if (row.expiresAt && row.expiresAt <= now) {
      await this.finish(id, { status: EmailDeliveryStatus.EXPIRED, lastErrorCode: 'LINK_EXPIRED' });
      return;
    }

    try {
      if (!email.encryptionKey) throw new EmailDeliveryError('EMAIL_NOT_CONFIGURED', false);
      const envelope = decryptEnvelope(row.envelope, email.encryptionKey);
      // Selalu memakai template terbit terbaru pada saat kirim, bukan yang berlaku saat antre — jika
      // staf menerbitkan perubahan di antara enqueue dan percobaan kirim (mis. setelah retry), versi
      // terbaru itulah yang terpakai.
      const override = await this.templates.emailCopy(row.templateKey);
      const rendered = renderEmail(row.templateKey as EmailTemplateKey, envelope.variables, override);
      await this.sender.send({ to: envelope.to, ...rendered });
      this.accepted.push(Date.now());
      await this.finish(id, {
        status: EmailDeliveryStatus.ACCEPTED_BY_SMTP,
        acceptedAt: new Date(),
        lastErrorCode: null,
        nextAttemptAt: null,
      });
    } catch (error) {
      const failure = failureFrom(error);
      const canRetry = failure.retryable && row.attemptCount < row.maxAttempts;
      if (canRetry) {
        const backoff = BACKOFF_MS[Math.min(row.attemptCount - 1, BACKOFF_MS.length - 1)]!;
        await this.finish(id, {
          status: EmailDeliveryStatus.FAILED_RETRYABLE,
          lastErrorCode: failure.code,
          nextAttemptAt: new Date(Date.now() + backoff),
        });
        this.schedule(id, backoff);
      } else {
        await this.finish(id, {
          status: EmailDeliveryStatus.FAILED_TERMINAL,
          lastErrorCode: failure.code,
          nextAttemptAt: null,
        });
      }
      this.logger.warn(
        `[EMAIL FAILED] id=${id} template=${row.templateKey} attempt=${row.attemptCount}/${row.maxAttempts} code=${failure.code} retry=${canRetry}`,
      );
    }
  }

  /** Percobaan ulang manual oleh operator; alasan dicatat di log bersama pelakunya. */
  async retry(id: string, reason: string, actorId: string) {
    const row = await this.db.emailDelivery.findUnique({ where: { id } });
    if (!row) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (!RETRYABLE_BY_OPERATOR.includes(row.status))
      throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
    // Tautan sekali pakai yang sudah kedaluwarsa tidak berguna bila dikirim ulang.
    if (row.expiresAt && row.expiresAt <= new Date())
      throw new ApiProblem('EMAIL_EXPIRED', HttpStatus.CONFLICT);

    const nextAttemptAt = new Date();
    const updated = await this.db.emailDelivery.updateMany({
      where: { id, status: row.status },
      data: {
        status: EmailDeliveryStatus.PENDING,
        maxAttempts: row.attemptCount + this.config.value.email.maxAttempts,
        nextAttemptAt,
        lastErrorCode: null,
      },
    });
    if (updated.count !== 1) throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
    this.logger.log(`[EMAIL RETRY] id=${id} by=${actorId} reason=${JSON.stringify(reason.trim().slice(0, 200))}`);
    this.schedule(id, 0);
    return { id, status: EmailDeliveryStatus.PENDING as string, nextAttemptAt };
  }

  /** Halaman riwayat pengiriman, terbaru dulu (kursor: waktu + id). */
  async page(input: { status?: EmailDeliveryStatus; cursor?: { at: Date; id: string }; limit: number }) {
    const rows = await this.db.emailDelivery.findMany({
      where: {
        ...(input.status ? { status: input.status } : {}),
        ...(input.cursor
          ? {
              OR: [
                { createdAt: { lt: input.cursor.at } },
                { createdAt: input.cursor.at, id: { lt: input.cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: input.limit + 1,
    });
    return { rows: rows.slice(0, input.limit), hasMore: rows.length > input.limit };
  }

  /** Angka ringkasan untuk halaman Operasi. */
  async stats() {
    const active: EmailDeliveryStatus[] = [
      EmailDeliveryStatus.PENDING,
      EmailDeliveryStatus.SENDING,
      EmailDeliveryStatus.FAILED_RETRYABLE,
    ];
    const [byStatus, waits, retries, oldest] = await Promise.all([
      this.db.emailDelivery.groupBy({ by: ['status'], _count: { _all: true } }),
      this.db.emailDelivery.aggregate({ _sum: { rateLimitWaitCount: true } }),
      this.db.emailDelivery.aggregate({
        where: { attemptCount: { gt: 1 } },
        _sum: { attemptCount: true },
        _count: { _all: true },
      }),
      this.db.emailDelivery.aggregate({
        where: { status: { in: active } },
        _min: { createdAt: true },
      }),
    ]);
    const statusCounts: Record<string, number> = {};
    for (const group of byStatus) statusCounts[group.status] = group._count._all;
    const extraAttempts = (retries._sum.attemptCount ?? 0) - retries._count._all;
    return {
      statusCounts,
      rateLimitWaitCount: waits._sum.rateLimitWaitCount ?? 0,
      retryCount: Math.max(0, extraAttempts),
      queueAgeSeconds: oldest._min.createdAt
        ? Math.max(0, Math.round((Date.now() - oldest._min.createdAt.getTime()) / 1000))
        : 0,
    };
  }

  /**
   * Saat API menyala: baris SENDING yang menggantung dijadikan gagal (operator memutuskan kirim ulang,
   * agar tidak ada email ganda), lalu baris yang menunggu dijadwalkan lagi.
   */
  async onApplicationBootstrap(): Promise<void> {
    if (!this.config.value.email.deliveryEnabled) return;
    try {
      await this.db.emailDelivery.updateMany({
        where: {
          status: EmailDeliveryStatus.SENDING,
          lastAttemptAt: { lt: new Date(Date.now() - STALE_SENDING_MS) },
        },
        data: { status: EmailDeliveryStatus.FAILED_TERMINAL, lastErrorCode: 'SENDING_INTERRUPTED' },
      });
      const waiting = await this.db.emailDelivery.findMany({
        where: { status: { in: SENDABLE } },
        orderBy: { createdAt: 'asc' },
        take: RECOVERY_LIMIT,
        select: { id: true, nextAttemptAt: true },
      });
      for (const item of waiting)
        this.schedule(item.id, Math.max(0, (item.nextAttemptAt?.getTime() ?? 0) - Date.now()));
    } catch (error) {
      this.logger.warn(`[EMAIL RECOVERY SKIPPED] ${error instanceof Error ? error.name : 'error'}`);
    }
  }

  /** Jeda yang harus ditunggu bila batas per menit atau per jam tercapai; 0 bila boleh kirim. */
  private rateLimitWaitMs(now: number): number {
    const { rateLimitPerMinute, rateLimitPerHour } = this.config.value.email;
    this.accepted = this.accepted.filter((at) => now - at < 3_600_000);
    const lastMinute = this.accepted.filter((at) => now - at < 60_000);
    if (rateLimitPerMinute > 0 && lastMinute.length >= rateLimitPerMinute)
      return lastMinute[0]! + 60_000 - now + 50;
    if (rateLimitPerHour > 0 && this.accepted.length >= rateLimitPerHour)
      return this.accepted[0]! + 3_600_000 - now + 50;
    return 0;
  }

  private finish(id: string, data: Prisma.EmailDeliveryUncheckedUpdateManyInput) {
    return this.db.emailDelivery.updateMany({ where: { id }, data });
  }

  private schedule(id: string, delayMs: number) {
    const timer = setTimeout(() => {
      this.deliver(id).catch((error: unknown) =>
        this.logger.error(`[EMAIL DELIVER ERROR] id=${id} ${error instanceof Error ? error.name : 'error'}`),
      );
    }, delayMs);
    timer.unref?.();
  }
}
