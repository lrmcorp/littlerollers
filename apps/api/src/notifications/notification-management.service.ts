import { HttpStatus, Injectable } from '@nestjs/common';
import type { ManagedContentStatus, NotificationChannel, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';

@Injectable()
export class NotificationManagementService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}
  private require(principal: SessionPrincipal) {
    this.policy.requireGlobalCapability(principal, 'notification:manage');
  }

  async overview(principal: SessionPrincipal, status?: ManagedContentStatus) {
    this.require(principal);
    const [templates, deliveries, metrics] = await Promise.all([
      this.db.notificationTemplate.findMany({
        where: status ? { status } : {},
        orderBy: [{ templateKey: 'asc' }, { version: 'desc' }],
        take: 100,
      }),
      this.db.notificationOccurrence.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          eventType: true,
          templateKey: true,
          templateVersion: true,
          recipientMasked: true,
          channel: true,
          status: true,
          attemptCount: true,
          lastErrorCode: true,
          createdAt: true,
        },
      }),
      this.db.notificationOccurrence.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    return {
      templates,
      deliveries,
      metrics: Object.fromEntries(metrics.map((item) => [item.status, item._count._all])),
      deferredChannels: ['WHATSAPP'],
    };
  }

  async create(
    principal: SessionPrincipal,
    input: {
      templateKey: string;
      channel: NotificationChannel;
      eventType: string;
      audience: unknown;
      subject?: string;
      title: string;
      body: string;
    },
    correlationId: string,
  ) {
    this.require(principal);
    const templateKey = input.templateKey?.trim().toUpperCase();
    if (
      !templateKey ||
      !/^[A-Z0-9_]{3,96}$/u.test(templateKey) ||
      !input.eventType?.trim() ||
      !input.title?.trim() ||
      !input.body?.trim()
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.db.$transaction(async (tx) => {
      const latest = await tx.notificationTemplate.findFirst({
        where: { templateKey, channel: input.channel },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      const created = await tx.notificationTemplate.create({
        data: {
          id: newId(),
          templateKey,
          channel: input.channel,
          version: (latest?.version ?? 0) + 1,
          eventType: input.eventType.trim(),
          audience: (input.audience ?? {}) as Prisma.InputJsonValue,
          subject: input.subject?.trim() || null,
          title: input.title.trim(),
          body: input.body.trim(),
          createdById: principal.userId,
        },
      });
      await tx.auditLog.create({
        data: {
          id: newId(),
          actorType: 'USER',
          actorId: principal.userId,
          action: 'notification.template_created',
          objectType: 'NotificationTemplate',
          objectId: created.id,
          correlationId,
          afterMasked: { templateKey, channel: input.channel, version: created.version },
        },
      });
      return created;
    });
  }

  async transition(
    principal: SessionPrincipal,
    id: string,
    status: 'PUBLISHED' | 'ARCHIVED',
    correlationId: string,
  ) {
    this.require(principal);
    return this.db.$transaction(async (tx) => {
      const current = await tx.notificationTemplate.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      if (status === 'PUBLISHED' && current.status !== 'DRAFT')
        throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
      if (status === 'PUBLISHED')
        await tx.notificationTemplate.updateMany({
          where: {
            templateKey: current.templateKey,
            channel: current.channel,
            status: 'PUBLISHED',
            id: { not: current.id },
          },
          data: { status: 'ARCHIVED', archivedAt: new Date() },
        });
      const updated = await tx.notificationTemplate.update({
        where: { id },
        data: {
          status,
          publishedAt: status === 'PUBLISHED' ? new Date() : current.publishedAt,
          archivedAt: status === 'ARCHIVED' ? new Date() : null,
        },
      });
      await tx.auditLog.create({
        data: {
          id: newId(),
          actorType: 'USER',
          actorId: principal.userId,
          action: `notification.template_${status.toLowerCase()}`,
          objectType: 'NotificationTemplate',
          objectId: id,
          correlationId,
          afterMasked: { status },
        },
      });
      return updated;
    });
  }
}
