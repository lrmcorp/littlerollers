import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma, type NotificationTemplate } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../foundation/audit.service';
import { optionalReason } from '../foundation/reason';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { renderEmail, type EmailTemplateKey } from '@dailydose/notification-core';
import {
  EMAIL_CHANNEL,
  EMAIL_SAMPLE_VARIABLES,
  EMAIL_TEMPLATE_REGISTRY,
  SAMPLE_VALUES,
  TEMPLATE_REGISTRY,
  WHATSAPP_CHANNEL,
  defaultEmailTemplateCopy,
  renderTemplate,
  validateEmailTemplateCopy,
  validateTemplateBody,
} from './notification-template.registry';

const notFound = () => new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
const invalid = (field: string, issue = 'INVALID') =>
  new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [{ field, issue }]);

const maskPhone = (phone: string) =>
  phone.length <= 6 ? '***' : `${phone.slice(0, 4)}${'*'.repeat(Math.max(3, phone.length - 7))}${phone.slice(-3)}`;

@Injectable()
export class NotificationManagementService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  /** Jejak audit permanen; isi pesan tidak disalin, cukup identitas, kanal, dan versinya. */
  private async record(
    principal: SessionPrincipal,
    correlationId: string,
    action: string,
    row: { id: string; templateKey: string; channel: string; version: number; status: string },
    before?: { status: string },
    reason?: string | null,
  ) {
    await this.audit?.catat(null, {
      actorId: principal.userId,
      correlationId,
      action,
      objectType: 'NotificationTemplate',
      objectId: row.id,
      reason: reason ?? null,
      beforeMasked: before,
      afterMasked: {
        templateKey: row.templateKey,
        channel: row.channel,
        version: row.version,
        status: row.status,
      },
    });
  }

  private require(principal: SessionPrincipal) {
    this.policy.requireGlobalCapability(principal, 'notification:manage');
  }

  /** Kanal & definisi sebuah kunci template; melempar `UNSUPPORTED_TEMPLATE` bila tidak dikenal. */
  private definitionFor(templateKey: string) {
    if (TEMPLATE_REGISTRY[templateKey]) return { channel: WHATSAPP_CHANNEL as string };
    if (EMAIL_TEMPLATE_REGISTRY[templateKey as EmailTemplateKey])
      return { channel: EMAIL_CHANNEL as string };
    throw invalid('templateKey', 'UNSUPPORTED_TEMPLATE');
  }

  private view(row: NotificationTemplate) {
    return {
      id: row.id,
      templateKey: row.templateKey,
      channel: row.channel,
      version: row.version,
      eventType: row.eventType,
      audience: row.audience ?? {},
      subject: row.subject,
      title: row.title,
      body: row.body,
      status: row.status,
      createdById: row.createdById,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      publishedAt: row.publishedAt?.toISOString() ?? null,
      archivedAt: row.archivedAt?.toISOString() ?? null,
    };
  }

  /** Template yang sedang dipakai (satu per kunci) beserta katalog bawaan dan log pengiriman. */
  async overview(principal: SessionPrincipal) {
    this.require(principal);
    const [templates, logs, grouped] = await Promise.all([
      this.db.notificationTemplate.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ templateKey: 'asc' }, { version: 'desc' }],
        take: 200,
      }),
      this.db.reminderLog.findMany({ orderBy: { sentAt: 'desc' }, take: 20 }),
      this.db.reminderLog.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    const counts = new Map(grouped.map((entry) => [entry.status, entry._count._all]));
    return {
      templates: templates.map((row) => this.view(row)),
      catalog: [
        ...Object.entries(TEMPLATE_REGISTRY).map(([templateKey, definition]) => ({
          templateKey,
          label: definition.label,
          description: definition.description,
          eventType: definition.eventType,
          channel: WHATSAPP_CHANNEL,
          variables: definition.variables,
          defaultBody: definition.defaultBody,
        })),
        ...Object.entries(EMAIL_TEMPLATE_REGISTRY).map(([templateKey, definition]) => ({
          templateKey,
          label: definition!.label,
          description: definition!.description,
          eventType: definition!.eventType,
          channel: EMAIL_CHANNEL,
          ...defaultEmailTemplateCopy(templateKey),
        })),
      ],
      deliveries: logs.map((log) => ({
        id: log.id,
        eventType: log.reminderType,
        recipientMasked: maskPhone(log.recipientPhone),
        status: log.status,
        attemptCount: 1,
        createdAt: log.sentAt.toISOString(),
      })),
      metrics: {
        DELIVERED: counts.get('SENT') ?? 0,
        PENDING: 0,
        FAILED: counts.get('FAILED') ?? 0,
      },
      deferredChannels: [],
    };
  }

  /** Render isi template dengan data contoh, tanpa menyimpan apa pun. */
  async preview(principal: SessionPrincipal, input: { templateKey?: string; body?: unknown }) {
    this.require(principal);
    const templateKey = input?.templateKey?.trim().toUpperCase() ?? '';
    const { channel } = this.definitionFor(templateKey);
    if (channel === EMAIL_CHANNEL) {
      const copy = validateEmailTemplateCopy(templateKey, input?.body);
      const rendered = renderEmail(templateKey as EmailTemplateKey, EMAIL_SAMPLE_VARIABLES, copy);
      return { channel, subject: rendered.subject, text: rendered.text, html: rendered.html };
    }
    const body = validateTemplateBody(templateKey, input?.body);
    return { channel, text: renderTemplate(body, SAMPLE_VALUES), length: body.length };
  }

  /**
   * Simpan isi template dan langsung pakai. Satu isi aktif per kunci template: bila sudah ada isinya diganti,
   * bila belum dibuat. Tidak ada draf, versi, atau arsip.
   */
  async save(
    principal: SessionPrincipal,
    templateKeyParam: string,
    input: { body?: unknown },
    correlationId: string,
  ) {
    this.require(principal);
    const templateKey = templateKeyParam?.trim().toUpperCase() ?? '';
    const { channel } = this.definitionFor(templateKey);
    const fields =
      channel === EMAIL_CHANNEL
        ? (({ subject, intro }) => ({ subject, body: intro }))(validateEmailTemplateCopy(templateKey, input?.body))
        : { body: validateTemplateBody(templateKey, input?.body) };

    const active = await this.db.notificationTemplate.findFirst({
      where: { templateKey, channel, status: 'PUBLISHED' },
      orderBy: { version: 'desc' },
    });
    if (active) {
      const updated = this.view(
        await this.db.notificationTemplate.update({ where: { id: active.id }, data: fields }),
      );
      await this.record(principal, correlationId, 'notification_template.updated', updated, {
        status: active.status,
      });
      return updated;
    }

    const definition =
      channel === EMAIL_CHANNEL
        ? EMAIL_TEMPLATE_REGISTRY[templateKey as EmailTemplateKey]!
        : TEMPLATE_REGISTRY[templateKey]!;
    const created = await this.createFirst(principal.userId, templateKey, channel, {
      eventType: definition.eventType,
      title: definition.label,
      ...fields,
    });
    await this.record(principal, correlationId, 'notification_template.published', created);
    return created;
  }

  /** Buat isi aktif pertama, bernomor setelah versi lama bila ada; diulang bila dua penyimpanan bersamaan. */
  private async createFirst(
    createdById: string,
    templateKey: string,
    channel: string,
    fields: { eventType: string; title: string; body: string; subject?: string },
  ) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const latest = await this.db.notificationTemplate.aggregate({
        where: { templateKey, channel },
        _max: { version: true },
      });
      try {
        const created = await this.db.notificationTemplate.create({
          data: {
            templateKey,
            channel,
            version: (latest._max.version ?? 0) + 1,
            status: 'PUBLISHED',
            publishedAt: new Date(),
            createdById,
            ...fields,
          },
        });
        return this.view(created);
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'))
          throw error;
      }
    }
    throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
  }

  /** Kembalikan template ke teks bawaan: isi aktif diarsipkan. Alasan opsional (3–500 karakter bila diisi). */
  async reset(principal: SessionPrincipal, templateKeyParam: string, correlationId: string, reasonInput?: string) {
    this.require(principal);
    const templateKey = templateKeyParam?.trim().toUpperCase() ?? '';
    const { channel } = this.definitionFor(templateKey);
    const reason = optionalReason(reasonInput) ?? '';
    const where = { templateKey, channel, status: 'PUBLISHED' as const };
    const active = await this.db.notificationTemplate.findMany({ where });
    if (active.length === 0) return { reset: false };
    await this.db.notificationTemplate.updateMany({ where, data: { status: 'ARCHIVED', archivedAt: new Date() } });
    for (const row of active)
      await this.record(
        principal,
        correlationId,
        'notification_template.archived',
        { ...row, status: 'ARCHIVED' },
        { status: row.status },
        reason || null,
      );
    return { reset: true };
  }
}
