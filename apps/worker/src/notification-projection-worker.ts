import { randomUUID } from 'node:crypto';
import { ApplicationRole, Prisma, PrismaClient, type OutboxEvent } from '@prisma/client';
import type { RuntimeConfig } from '@dailydose/config';
import {
  deterministicKey,
  encryptEnvelope,
  hashEmail,
  maskEmail,
  type EmailTemplateKey,
} from '@dailydose/notification-core';

type NotificationSpec = {
  userId: string;
  branchId?: string | null;
  category:
    | 'VERIFICATION'
    | 'PAYMENT'
    | 'PACKAGE'
    | 'BOOKING'
    | 'RESCHEDULE'
    | 'CLASS'
    | 'ATTENDANCE'
    | 'ADJUSTMENT'
    | 'OPERATIONS'
    | 'APPROVAL'
    | 'SYSTEM';
  tone: 'SUCCESS' | 'INFO' | 'WARNING' | 'DANGER';
  title: string;
  message: string;
  href?: string;
  metadataMasked?: Prisma.InputJsonValue;
  emailEligible?: boolean;
};

const payloadOf = (event: OutboxEvent) =>
  event.payload && typeof event.payload === 'object' && !Array.isArray(event.payload)
    ? (event.payload as Record<string, unknown>)
    : {};

export class NotificationProjectionWorker {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly db: PrismaClient,
    private readonly pollIntervalMs = 5_000,
    private readonly emailConfig?: RuntimeConfig['email'],
  ) {}

  private templateFor(eventType: string): EmailTemplateKey | null {
    const templates: Record<string, EmailTemplateKey> = {
      'order.created.v1': 'ORDER_CREATED_V1',
      'order.action-required.v1': 'ORDER_ACTION_REQUIRED_V1',
      'purchase.approved.v1': 'ORDER_APPROVED_V1',
      'purchase.rejected.v1': 'ORDER_REJECTED_V1',
      'booking.created.v1': 'BOOKING_CONFIRMED_V1',
      'booking.cancelled.v1': 'BOOKING_CANCELLED_V1',
      'booking.rescheduled.v1': 'RESCHEDULE_APPROVED_V1',
      'booking.reschedule_rejected.v1': 'RESCHEDULE_REJECTED_V1',
      'class.manual_cancelled.v1': 'CLASS_CANCELLED_V1',
      'identity.verification.approved.v1': 'IDENTITY_APPROVED_V1',
      'identity.verification.rejected.v1': 'IDENTITY_ACTION_REQUIRED_V1',
      'session.adjustment_posted.v1': 'SESSION_ADJUSTMENT_POSTED_V1',
      'session.adjustment_rejected.v1': 'SESSION_ADJUSTMENT_REJECTED_V1',
      'operations.job_failed.v1': 'OPERATIONS_JOB_FAILED_V1',
    };
    return templates[eventType] ?? null;
  }

  start(): void {
    this.timer = setInterval(() => void this.poll(), this.pollIntervalMs);
    void this.poll();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async staffRecipients(roles: string[], branchId?: string) {
    const now = new Date();
    return this.db.user.findMany({
      where: {
        status: 'ACTIVE',
        roles: {
          some: {
            role: { in: roles as ApplicationRole[] },
            activeFrom: { lte: now },
            OR: [{ activeUntil: null }, { activeUntil: { gte: now } }],
            ...(branchId ? { AND: [{ OR: [{ branchId }, { branchId: null }] }] } : {}),
          },
        },
      },
      select: { id: true },
    });
  }

  private async specs(event: OutboxEvent): Promise<NotificationSpec[] | null> {
    const payload = payloadOf(event);
    const branchId = typeof payload.branchId === 'string' ? payload.branchId : undefined;
    if (event.eventType.startsWith('purchase.') || event.eventType.startsWith('order.')) {
      const purchase = await this.db.pembelian.findUnique({
        where: { id: event.aggregateId },
        select: { userId: true, branchId: true, status: true },
      });
      if (!purchase) return [];
      if (
        [
          'order.created.v1',
          'purchase.approved.v1',
          'purchase.rejected.v1',
          'order.action-required.v1',
        ].includes(event.eventType)
      ) {
        const approved = event.eventType === 'purchase.approved.v1';
        const actionRequired = event.eventType === 'order.action-required.v1';
        const created = event.eventType === 'order.created.v1';
        return [
          {
            userId: purchase.userId,
            branchId: purchase.branchId,
            category: approved ? 'PACKAGE' : 'PAYMENT',
            tone: approved || created ? 'SUCCESS' : actionRequired ? 'WARNING' : 'DANGER',
            title: created
              ? 'Pesanan berhasil dibuat'
              : approved
                ? 'Pembayaran disetujui'
                : actionRequired
                  ? 'Pembayaran perlu diperbaiki'
                  : 'Pembayaran ditolak',
            message: created
              ? 'Selesaikan pembayaran sebelum batas waktu pesanan.'
              : approved
                ? 'Paket Anda telah aktif dan siap digunakan.'
                : actionRequired
                  ? 'Buka pesanan untuk melihat tindakan yang diperlukan.'
                  : 'Buka pesanan untuk melihat hasil pemeriksaan.',
            href: `/orders/${event.aggregateId}`,
          },
        ];
      }
      if (['order.payment-proof.submitted.v1', 'purchase.submitted.v1'].includes(event.eventType)) {
        const recipients = await this.staffRecipients(
          ['FINANCE', 'SUPER_OWNER', 'ADMIN'],
          purchase.branchId,
        );
        return recipients.map(({ id }) => ({
          userId: id,
          branchId: purchase.branchId,
          category: 'APPROVAL',
          tone: 'WARNING',
          title: 'Pembayaran menunggu pemeriksaan',
          message: 'Bukti pembayaran baru masuk ke antrean pemeriksaan.',
          href: '/workspace/payments?status=PENDING',
        }));
      }
      return null;
    }
    if (event.aggregateType === 'Booking') {
      const booking = await this.db.pemesananKelas.findUnique({
        where: { id: event.aggregateId },
        select: {
          id: true,
          customerUserId: true,
          branchId: true,
          classSlotId: true,
          classSlot: { select: { instructorUserId: true } },
        },
      });
      if (!booking) return [];
      if (event.eventType === 'booking.reschedule_requested.v1') {
        const recipients = await this.staffRecipients(['ADMIN', 'SUPER_OWNER'], booking.branchId);
        return recipients.map(({ id }) => ({
          userId: id,
          branchId: booking.branchId,
          category: 'APPROVAL',
          tone: 'WARNING',
          title: 'Reschedule menunggu keputusan',
          message: 'Permintaan perubahan jadwal baru membutuhkan pemeriksaan.',
          href: '/bookings?rescheduleStatus=PENDING',
          metadataMasked: { bookingId: booking.id },
        }));
      }
      if (event.eventType === 'booking.cancelled.v1') {
        const staff = await this.staffRecipients(['ADMIN', 'MANAGER'], booking.branchId);
        const operationalIds = new Set([
          ...(booking.classSlot.instructorUserId ? [booking.classSlot.instructorUserId] : []),
          ...staff.map(({ id }) => id),
        ]);
        operationalIds.delete(booking.customerUserId);
        return [
          {
            userId: booking.customerUserId,
            branchId: booking.branchId,
            category: 'BOOKING',
            tone: 'INFO',
            title: 'Booking berhasil dibatalkan',
            message: 'Booking Anda telah dibatalkan dan slot kelas telah dilepas.',
            href: '/bookings',
            metadataMasked: { classSlotId: booking.classSlotId },
            emailEligible: true,
          },
          ...[...operationalIds].map((userId) => ({
            userId,
            branchId: booking.branchId,
            category: 'BOOKING' as const,
            tone: 'INFO' as const,
            title: 'Customer membatalkan booking',
            message: 'Satu slot kelas telah dilepas oleh customer.',
            href: '/workspace/bookings',
            metadataMasked: { classSlotId: booking.classSlotId },
            emailEligible: false,
          })),
        ];
      }
      const copy: Record<
        string,
        [NotificationSpec['category'], NotificationSpec['tone'], string, string]
      > = {
        'booking.created.v1': [
          'BOOKING',
          'SUCCESS',
          'Booking berhasil dibuat',
          'Jadwal baru telah ditambahkan ke booking Anda.',
        ],
        'booking.rescheduled.v1': [
          'RESCHEDULE',
          'SUCCESS',
          'Reschedule disetujui',
          'Booking Anda telah dipindahkan ke jadwal baru.',
        ],
        'booking.reschedule_rejected.v1': [
          'RESCHEDULE',
          'DANGER',
          'Reschedule ditolak',
          'Permintaan perubahan jadwal belum dapat disetujui.',
        ],
        'check_in.customer.v1': [
          'ATTENDANCE',
          'SUCCESS',
          'Check-in berhasil',
          'Kehadiran Anda telah tercatat.',
        ],
        'check_in.customer_backfilled.v1': [
          'ATTENDANCE',
          'INFO',
          'Kehadiran diperbarui',
          'Kehadiran Anda telah dikoreksi oleh staf yang berwenang.',
        ],
      };
      const selected = copy[event.eventType];
      if (!selected) return null;
      return [
        {
          userId: booking.customerUserId,
          branchId: booking.branchId,
          category: selected[0],
          tone: selected[1],
          title: selected[2],
          message: selected[3],
          href: '/bookings',
          metadataMasked: { classSlotId: booking.classSlotId },
        },
      ];
    }
    if (event.eventType === 'class.completed.v1') {
      const noShows = await this.db.pemesananKelas.findMany({
        where: { classSlotId: event.aggregateId, status: 'NO_SHOW' },
        select: { id: true, customerUserId: true, branchId: true, classSlotId: true },
      });
      return noShows.map((booking) => ({
        userId: booking.customerUserId,
        branchId: booking.branchId,
        category: 'ATTENDANCE',
        tone: 'WARNING',
        title: 'Kehadiran tidak tercatat',
        message:
          'Kelas telah selesai dan kehadiran Anda belum tercatat. Hubungi Studio/Cabang bila perlu dikoreksi.',
        href: `/bookings/${booking.id}`,
        metadataMasked: { classSlotId: booking.classSlotId },
        emailEligible: false,
      }));
    }
    if (event.eventType === 'class.manual_cancelled.v1') {
      const bookings = await this.db.pemesananKelas.findMany({
        where: { classSlotId: event.aggregateId, status: { in: ['BOOKED', 'ATTENDED'] } },
        select: { customerUserId: true, branchId: true },
      });
      return bookings.map((booking) => ({
        userId: booking.customerUserId,
        branchId: booking.branchId,
        category: 'CLASS',
        tone: 'DANGER',
        title: 'Kelas dibatalkan',
        message: 'Salah satu kelas pada jadwal Anda telah dibatalkan. Buka booking untuk detail.',
        href: '/bookings',
      }));
    }
    if (event.aggregateType === 'SessionAdjustment') {
      const adjustment = await this.db.penyesuaianSesi.findUnique({
        where: { id: event.aggregateId },
        select: { customerPackage: { select: { customerUserId: true, branchId: true } } },
      });
      if (!adjustment) return [];
      if (event.eventType === 'session.adjustment_requested.v1') {
        const recipients = await this.staffRecipients(
          ['MANAGER', 'SUPER_OWNER'],
          adjustment.customerPackage.branchId,
        );
        return recipients.map(({ id }) => ({
          userId: id,
          branchId: adjustment.customerPackage.branchId,
          category: 'APPROVAL',
          tone: 'WARNING',
          title: 'Adjustment menunggu keputusan',
          message: 'Permintaan adjustment baru membutuhkan pemeriksaan.',
          href: '/ledger?status=PENDING',
        }));
      }
      if (
        event.eventType === 'session.adjustment_posted.v1' ||
        event.eventType === 'session.adjustment_rejected.v1'
      ) {
        const posted = event.eventType === 'session.adjustment_posted.v1';
        return [
          {
            userId: adjustment.customerPackage.customerUserId,
            branchId: adjustment.customerPackage.branchId,
            category: 'ADJUSTMENT',
            tone: posted ? 'SUCCESS' : 'DANGER',
            title: posted ? 'Saldo sesi diperbarui' : 'Adjustment ditolak',
            message: posted
              ? 'Perubahan saldo sesi telah diposting ke ledger Anda.'
              : 'Permintaan perubahan saldo belum dapat disetujui.',
            href: '/account/packages',
          },
        ];
      }
      return null;
    }
    if (event.eventType.startsWith('identity.verification.')) {
      const document = await this.db.dokumenVerifikasiIdentitas.findUnique({
        where: { id: event.aggregateId },
        select: { userId: true, kind: true },
      });
      if (!document) return [];
      const approved = event.eventType === 'identity.verification.approved.v1';
      const rejected = event.eventType === 'identity.verification.rejected.v1';
      if (!approved && !rejected) return null;
      return [
        {
          userId: document.userId,
          category: 'VERIFICATION',
          tone: approved ? 'SUCCESS' : 'WARNING',
          title: approved ? 'Dokumen disetujui' : 'Dokumen perlu diperbaiki',
          message: approved
            ? 'Dokumen identitas Anda telah disetujui.'
            : 'Buka verifikasi untuk melihat panduan unggah ulang.',
          href: rejected
            ? `/account/verification?document=${document.kind}`
            : '/account/verification',
        },
      ];
    }
    if (event.eventType === 'operations.job_failed.v1') {
      const recipients = await this.staffRecipients(['OPS', 'SUPER_OWNER'], branchId);
      return recipients.map(({ id }) => ({
        userId: id,
        branchId,
        category: 'OPERATIONS',
        tone: 'DANGER',
        title: 'Job operasional gagal',
        message: 'Satu job membutuhkan pemeriksaan atau recovery.',
        href: '/operations?status=FAILED',
      }));
    }
    return null;
  }

  async poll(): Promise<boolean> {
    const retryBefore = new Date(Date.now() - 60_000);
    const event = await this.db.outboxEvent.findFirst({
      where: {
        OR: [
          { notificationProjection: null },
          {
            notificationProjection: {
              status: 'FAILED',
              projectedAt: { lte: retryBefore },
            },
          },
        ],
      },
      orderBy: [{ occurredAt: 'asc' }, { id: 'asc' }],
    });
    if (!event) return false;
    try {
      const specs = await this.specs(event);
      await this.db.$transaction(async (tx) => {
        await tx.notificationProjection.upsert({
          where: { sourceEventId: event.id },
          create: {
            id: randomUUID(),
            sourceEventId: event.id,
            status: specs === null ? 'SKIPPED' : 'SUCCEEDED',
          },
          update: {
            status: specs === null ? 'SKIPPED' : 'SUCCEEDED',
            errorCode: null,
            projectedAt: new Date(),
          },
        });
        if (specs?.length) {
          await tx.userNotification.createMany({
            data: specs.map(({ emailEligible: _emailEligible, ...spec }) => ({
              id: randomUUID(),
              ...spec,
              sourceEventId: event.id,
              eventKey: event.id,
            })),
            skipDuplicates: true,
          });
          const templateKey = this.templateFor(event.eventType);
          const encryptionKey = this.emailConfig?.encryptionKey;
          const baseUrl = process.env.PUBLIC_WEB_BASE_URL?.trim();
          if (templateKey && encryptionKey && baseUrl) {
            const recipients = await tx.user.findMany({
              where: { id: { in: specs.map(({ userId }) => userId) }, email: { not: null } },
              select: { id: true, email: true },
            });
            for (const spec of specs) {
              if (spec.emailEligible === false) continue;
              const user = recipients.find(({ id }) => id === spec.userId);
              if (!user?.email) continue;
              const recipient = this.emailConfig?.recipientOverride || user.email;
              const occurrenceKey = deterministicKey(
                'email',
                event.id,
                spec.userId,
                templateKey,
                1,
              );
              await tx.notificationOccurrence.upsert({
                where: { occurrenceKey },
                create: {
                  id: randomUUID(),
                  occurrenceKey,
                  sourceEventId: event.id,
                  userId: spec.userId,
                  branchId: spec.branchId,
                  eventType: event.eventType,
                  templateKey,
                  templateVersion: 1,
                  recipientHash: hashEmail(recipient),
                  recipientMasked: maskEmail(recipient),
                  envelopeEncrypted: encryptEnvelope(
                    {
                      to: recipient,
                      variables: {
                        href: new URL(spec.href || '/', baseUrl).toString(),
                        detail: spec.message,
                      },
                    },
                    encryptionKey,
                  ),
                  maxAttempts: this.emailConfig?.maxAttempts ?? 5,
                  correlationId: event.correlationId,
                },
                update: {},
              });
            }
          }
        }
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        return false;
      await this.db.notificationProjection.upsert({
        where: { sourceEventId: event.id },
        create: {
          id: randomUUID(),
          sourceEventId: event.id,
          status: 'FAILED',
          errorCode: 'PROJECTION_FAILED',
        },
        update: { status: 'FAILED', errorCode: 'PROJECTION_FAILED', projectedAt: new Date() },
      });
      return false;
    }
  }
}
