import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type NotificationTemplate } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, ENTITY_ID_REGEX } from '../identity/security';
import {
  SAMPLE_VALUES,
  TEMPLATE_REGISTRY,
  WHATSAPP_CHANNEL,
  renderTemplate,
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
  ) {}

  private require(principal: SessionPrincipal) {
    this.policy.requireGlobalCapability(principal, 'notification:manage');
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
      catalog: Object.entries(TEMPLATE_REGISTRY).map(([templateKey, definition]) => ({
        templateKey,
        label: definition.label,
        description: definition.description,
        eventType: definition.eventType,
        channel: WHATSAPP_CHANNEL,
        variables: definition.variables,
        defaultBody: definition.defaultBody,
      })),
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
      deferredChannels: ['EMAIL'],
    };
  }

  /** Render isi template dengan data contoh, tanpa menyimpan apa pun. */
  async preview(principal: SessionPrincipal, input: { templateKey?: string; body?: unknown }) {
    this.require(principal);
    const templateKey = input?.templateKey?.trim().toUpperCase() ?? '';
    const body = validateTemplateBody(templateKey, input?.body);
    return { text: renderTemplate(body, SAMPLE_VALUES), length: body.length };
  }

  async create(
    principal: SessionPrincipal,
    input: { templateKey?: string; body?: unknown },
    _correlationId: string,
  ) {
    this.require(principal);
    const templateKey = input?.templateKey?.trim().toUpperCase() ?? '';
    const definition = TEMPLATE_REGISTRY[templateKey];
    if (!definition) throw invalid('templateKey', 'UNSUPPORTED_TEMPLATE');
    const body = validateTemplateBody(templateKey, input.body);
    return this.nextDraft(principal.userId, templateKey, body);
  }

  private async nextDraft(createdById: string, templateKey: string, body: string) {
    const definition = TEMPLATE_REGISTRY[templateKey]!;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const latest = await this.db.notificationTemplate.aggregate({
        where: { templateKey, channel: WHATSAPP_CHANNEL },
        _max: { version: true },
      });
      try {
        const created = await this.db.notificationTemplate.create({
          data: {
            templateKey,
            channel: WHATSAPP_CHANNEL,
            version: (latest._max.version ?? 0) + 1,
            eventType: definition.eventType,
            title: definition.label,
            body,
            status: 'DRAFT',
            createdById,
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
    const body = validateTemplateBody(current.templateKey, input?.body);
    const claimed = await this.db.notificationTemplate.updateMany({
      where: { id, status: 'DRAFT' },
      data: { body },
    });
    if (claimed.count !== 1) throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
    return this.view(await this.load(id));
  }

  async duplicate(principal: SessionPrincipal, id: string, _correlationId: string) {
    this.require(principal);
    const current = await this.load(id);
    return this.nextDraft(principal.userId, current.templateKey, current.body);
  }

  async transition(
    principal: SessionPrincipal,
    id: string,
    status: 'PUBLISHED' | 'ARCHIVED',
    _correlationId: string,
  ) {
    this.require(principal);
    if (status !== 'PUBLISHED' && status !== 'ARCHIVED') throw invalid('status');
    const current = await this.load(id);
    const now = new Date();

    if (status === 'PUBLISHED') {
      // Isi divalidasi ulang: registry bisa berubah sejak draf dibuat.
      validateTemplateBody(current.templateKey, current.body);
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
    return this.view(await this.load(id));
  }
}
