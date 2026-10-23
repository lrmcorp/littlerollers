import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma, type NotificationTemplate } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../foundation/audit.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, ENTITY_ID_REGEX } from '../identity/security';
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

type Status = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

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

  private async load(id: string) {
    if (!ENTITY_ID_REGEX.test(id)) throw notFound();
    const row = await this.db.notificationTemplate.findUnique({ where: { id } });
    if (!row) throw notFound();
    return row;
  }

  async overview(principal: SessionPrincipal, status?: Status) {
    this.require(principal);
    if (status && !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) throw invalid('status');
    const [templates, logs, grouped] = await Promise.all([
      this.db.notificationTemplate.findMany({
        where: status ? { status } : {},
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

  async create(
    principal: SessionPrincipal,
    input: { templateKey?: string; body?: unknown },
    _correlationId: string,
  ) {
    this.require(principal);
    const templateKey = input?.templateKey?.trim().toUpperCase() ?? '';
    const { channel } = this.definitionFor(templateKey);
    const draft =
      channel === EMAIL_CHANNEL
        ? await this.nextEmailDraft(
            principal.userId,
            templateKey,
            validateEmailTemplateCopy(templateKey, input.body),
          )
        : await this.nextDraft(principal.userId, templateKey, validateTemplateBody(templateKey, input.body));
    await this.record(principal, _correlationId, 'notification_template.draft_created', draft);
    return draft;
  }

  private async nextDraft(createdById: string, templateKey: string, body: string) {
    const definition = TEMPLATE_REGISTRY[templateKey]!;
    return this.createVersion(createdById, templateKey, WHATSAPP_CHANNEL, {
      eventType: definition.eventType,
      title: definition.label,
      body,
    });
  }

  private async nextEmailDraft(
    createdById: string,
    templateKey: string,
    copy: { subject: string; intro: string },
  ) {
    const definition = EMAIL_TEMPLATE_REGISTRY[templateKey as EmailTemplateKey]!;
    return this.createVersion(createdById, templateKey, EMAIL_CHANNEL, {
      eventType: definition.eventType,
      title: definition.label,
      subject: copy.subject,
      body: copy.intro,
    });
  }

  /** Nomor versi berikutnya untuk `templateKey`+`channel`; diulang bila dua draf dibuat bersamaan. */
  private async createVersion(
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
            status: 'DRAFT',
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

  async updateDraft(
    principal: SessionPrincipal,
    id: string,
    input: { body?: unknown },
    _correlationId: string,
  ) {
    this.require(principal);
    const current = await this.load(id);
    const data =
      current.channel === EMAIL_CHANNEL
        ? (({ subject, intro }) => ({ subject, body: intro }))(
            validateEmailTemplateCopy(current.templateKey, input?.body),
          )
        : { body: validateTemplateBody(current.templateKey, input?.body) };
    const claimed = await this.db.notificationTemplate.updateMany({
      where: { id, status: 'DRAFT' },
      data,
    });
    if (claimed.count !== 1) throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
    const updated = this.view(await this.load(id));
    await this.record(principal, _correlationId, 'notification_template.draft_updated', updated);
    return updated;
  }

  async duplicate(principal: SessionPrincipal, id: string, _correlationId: string) {
    this.require(principal);
    const current = await this.load(id);
    const draft =
      current.channel === EMAIL_CHANNEL
        ? await this.nextEmailDraft(principal.userId, current.templateKey, {
            subject: current.subject ?? '',
            intro: current.body,
          })
        : await this.nextDraft(principal.userId, current.templateKey, current.body);
    await this.record(principal, _correlationId, 'notification_template.duplicated', draft, {
      status: current.status,
    });
    return draft;
  }

  async transition(
    principal: SessionPrincipal,
    id: string,
    status: 'PUBLISHED' | 'ARCHIVED',
    _correlationId: string,
    reasonInput?: string,
  ) {
    this.require(principal);
    if (status !== 'PUBLISHED' && status !== 'ARCHIVED') throw invalid('status');
    // Mengarsipkan wajib beralasan (K4); menerbitkan tidak.
    const reason = typeof reasonInput === 'string' ? reasonInput.trim() : '';
    if (status === 'ARCHIVED' && (reason.length < 3 || reason.length > 500))
      throw invalid('reason', reason.length === 0 ? 'REQUIRED' : reason.length < 3 ? 'TOO_SHORT' : 'TOO_LONG');
    const current = await this.load(id);
    const now = new Date();

    if (status === 'PUBLISHED') {
      // Isi divalidasi ulang: registry bisa berubah sejak draf dibuat.
      if (current.channel === EMAIL_CHANNEL)
        validateEmailTemplateCopy(current.templateKey, { subject: current.subject, intro: current.body });
      else validateTemplateBody(current.templateKey, current.body);
      await this.db.$transaction(async (tx) => {
        const claimed = await tx.notificationTemplate.updateMany({
          where: { id, status: 'DRAFT' },
          data: { status: 'PUBLISHED', publishedAt: now },
        });
        if (claimed.count !== 1) throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
        await tx.notificationTemplate.updateMany({
          where: {
            templateKey: current.templateKey,
            channel: current.channel,
            status: 'PUBLISHED',
            id: { not: id },
          },
          data: { status: 'ARCHIVED', archivedAt: now },
        });
      });
    } else {
      const claimed = await this.db.notificationTemplate.updateMany({
        where: { id, status: { not: 'ARCHIVED' } },
        data: { status: 'ARCHIVED', archivedAt: now },
      });
      if (claimed.count !== 1) throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
    }
    const result = this.view(await this.load(id));
    await this.record(
      principal,
      _correlationId,
      status === 'PUBLISHED' ? 'notification_template.published' : 'notification_template.archived',
      result,
      { status: current.status },
      reason || null,
    );
    return result;
  }
}
