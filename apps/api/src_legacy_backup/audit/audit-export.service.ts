import { HttpStatus, Injectable } from '@nestjs/common';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { AuditExportFormat } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';
import { PolicyService } from '../identity/policy.service';
import { EmailNotificationService } from '../email/email-notification.service';

type Command = {
  branchIds: string[];
  from: string;
  to: string;
  actorId?: string;
  objectType?: string;
  format: AuditExportFormat;
  reason: string;
};
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const csv = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;

@Injectable()
export class AuditExportService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly emails?: EmailNotificationService,
  ) {}

  private scope(principal: SessionPrincipal, branchIds: string[]) {
    this.policy.requireCapability(principal.capabilities, 'audit:read');
    if (
      !branchIds.length ||
      branchIds.some(
        (id) => !principal.capabilities.includes('branch:all') && !principal.branchIds.includes(id),
      )
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  private view(item: {
    id: string;
    status: string;
    requestedAt: Date;
    completedAt: Date | null;
    expiresAt: Date;
    rowCount: number;
    failureCode: string | null;
  }) {
    return {
      ...item,
      requestedAt: item.requestedAt.toISOString(),
      completedAt: item.completedAt?.toISOString() ?? null,
      expiresAt: item.expiresAt.toISOString(),
    };
  }

  async create(
    principal: SessionPrincipal,
    input: Command,
    idempotencyKey: string,
    correlationId: string,
  ) {
    const branchIds = [...new Set(input.branchIds)];
    this.scope(principal, branchIds);
    const from = new Date(input.from);
    const until = new Date(input.to);
    if (
      !idempotencyKey ||
      input.reason.trim().length < 3 ||
      Number.isNaN(from.getTime()) ||
      Number.isNaN(until.getTime()) ||
      from >= until
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const idempotencyKeyHash = hash(idempotencyKey);
    const requestHash = hash(
      JSON.stringify({
        ...input,
        branchIds: [...branchIds].sort(),
        reason: Boolean(input.reason.trim()),
      }),
    );
    const existing = await this.db.auditExport.findUnique({
      where: {
        requestedById_idempotencyKeyHash: { requestedById: principal.userId, idempotencyKeyHash },
      },
    });
    if (existing) {
      if (existing.requestHash !== requestHash)
        throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
      return this.view(existing);
    }
    const created = await this.db.auditExport.create({
      data: {
        id: randomUUID(),
        requestedById: principal.userId,
        idempotencyKeyHash,
        requestHash,
        branchIds,
        from,
        until,
        actorId: input.actorId,
        objectType: input.objectType?.trim() || null,
        format: input.format,
        expiresAt: new Date(Date.now() + 24 * 60 * 60_000),
      },
    });
    await this.db.auditLog.create({
      data: {
        id: randomUUID(),
        actorType: 'USER',
        actorId: principal.userId,
        action: 'audit.export_requested',
        objectType: 'AuditExport',
        objectId: created.id,
        beforeMasked: undefined,
        afterMasked: { branchCount: branchIds.length, format: input.format, reasonPresent: true },
        correlationId,
      },
    });
    setImmediate(() => void this.process(created.id));
    return this.view(created);
  }

  private async process(id: string) {
    try {
      const job = await this.db.auditExport.update({
        where: { id },
        data: { status: 'RUNNING', version: { increment: 1 } },
      });
      const branchIds = job.branchIds as string[];
      const logs = await this.db.auditLog.findMany({
        where: {
          branchId: { in: branchIds },
          occurredAt: { gte: job.from, lt: job.until },
          ...(job.actorId ? { actorId: job.actorId } : {}),
          ...(job.objectType ? { objectType: job.objectType } : {}),
        },
        orderBy: [{ occurredAt: 'asc' }, { id: 'asc' }],
      });
      const content =
        job.format === 'JSONL'
          ? logs.map((item) => JSON.stringify(item)).join('\n')
          : [
              'occurredAt,action,actorId,branchId,objectType,objectId,correlationId',
              ...logs.map((item) =>
                [
                  item.occurredAt.toISOString(),
                  item.action,
                  item.actorId,
                  item.branchId,
                  item.objectType,
                  item.objectId,
                  item.correlationId,
                ]
                  .map(csv)
                  .join(','),
              ),
            ].join('\n');
      const ready = await this.db.$transaction(async (tx) => {
        const completed = await tx.auditExport.update({
          where: { id },
          data: {
            status: 'READY',
            content,
            rowCount: logs.length,
            completedAt: new Date(),
            version: { increment: 1 },
          },
        });
        await tx.userNotification.createMany({
          data: [
            {
              id: randomUUID(),
              userId: completed.requestedById,
              eventKey: `audit-export-ready:${completed.id}:${completed.version}`,
              category: 'SYSTEM',
              tone: 'SUCCESS',
              title: 'Export audit telah siap',
              message: `Export berisi ${completed.rowCount} baris dan tersedia selama 24 jam.`,
              href: '/audit',
              expiresAt: completed.expiresAt,
            },
          ],
          skipDuplicates: true,
        });
        return completed;
      });
      const requester = await this.db.user.findUnique({
        where: { id: ready.requestedById },
        select: { email: true },
      });
      const publicBaseUrl = process.env.PUBLIC_WEB_BASE_URL?.trim();
      if (requester?.email && publicBaseUrl && this.emails) {
        await this.emails
          .enqueue({
            eventType: 'audit.export_ready.v1',
            templateKey: 'AUDIT_EXPORT_READY_V1',
            recipient: requester.email,
            variables: {
              href: new URL('/audit', publicBaseUrl).toString(),
              detail: `Export berisi ${ready.rowCount} baris dan tersedia selama 24 jam.`,
            },
            correlationId: `audit-export:${id}`,
            occurrenceParts: [id, ready.version],
            userId: ready.requestedById,
            expiresAt: ready.expiresAt,
          })
          .catch(() => undefined);
      }
    } catch {
      await this.db.auditExport
        .update({
          where: { id },
          data: {
            status: 'FAILED',
            failureCode: 'EXPORT_GENERATION_FAILED',
            completedAt: new Date(),
            version: { increment: 1 },
          },
        })
        .catch(() => undefined);
    }
  }

  async get(principal: SessionPrincipal, id: string) {
    this.policy.requireCapability(principal.capabilities, 'audit:read');
    let item = await this.db.auditExport.findUnique({ where: { id } });
    if (
      !item ||
      (item.requestedById !== principal.userId && !principal.capabilities.includes('branch:all'))
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    this.scope(principal, item.branchIds as string[]);
    if (item.expiresAt <= new Date() && item.status !== 'EXPIRED')
      item = await this.db.auditExport.update({
        where: { id },
        data: { status: 'EXPIRED', content: null },
      });
    if (item.status === 'EXPIRED') throw new ApiProblem('RESOURCE_GONE', HttpStatus.GONE);
    return this.view(item);
  }

  async authorize(principal: SessionPrincipal, id: string, correlationId: string) {
    const status = await this.get(principal, id);
    if (status.status !== 'READY') throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 5 * 60_000);
    await this.db.auditExport.update({
      where: { id },
      data: { downloadTokenHash: hash(token), downloadExpiresAt: expiresAt },
    });
    await this.db.auditLog.create({
      data: {
        id: randomUUID(),
        actorType: 'USER',
        actorId: principal.userId,
        action: 'audit.export_download_authorized',
        objectType: 'AuditExport',
        objectId: id,
        afterMasked: { shortLived: true },
        correlationId,
      },
    });
    return {
      url: `/api/v1/audit-exports/${id}/download?token=${token}`,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async download(id: string, token: string) {
    const item = await this.db.auditExport.findUnique({ where: { id } });
    if (
      !item ||
      !item.downloadTokenHash ||
      !item.downloadExpiresAt ||
      item.downloadExpiresAt <= new Date() ||
      hash(token) !== item.downloadTokenHash ||
      item.status !== 'READY' ||
      !item.content
    )
      throw new ApiProblem('RESOURCE_GONE', HttpStatus.GONE);
    await this.db.auditExport.update({
      where: { id },
      data: { downloadTokenHash: null, downloadExpiresAt: null },
    });
    return { content: item.content, format: item.format };
  }
}
