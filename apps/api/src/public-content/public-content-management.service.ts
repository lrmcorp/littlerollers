import { HttpStatus, Injectable } from '@nestjs/common';
import type { ManagedContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';

@Injectable()
export class PublicContentManagementService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}
  async list(
    principal: SessionPrincipal,
    input: { branchId?: string; kind?: string; status?: ManagedContentStatus },
  ) {
    this.policy.requireCapability(principal.capabilities, 'public-content:read');
    if (
      input.branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(input.branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const visibleScope = principal.capabilities.includes('branch:all')
      ? input.branchId
        ? { branchId: input.branchId }
        : {}
      : { branchId: { in: principal.branchIds } };
    return this.db.publicContentEntry.findMany({
      where: {
        ...visibleScope,
        ...(input.kind ? { kind: input.kind } : {}),
        ...(input.status ? { status: input.status } : {}),
      },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: 100,
    });
  }
  async create(
    principal: SessionPrincipal,
    input: {
      contentKey: string;
      branchId?: string | null;
      kind: string;
      locale?: string;
      payload: unknown;
    },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'public-content:manage');
    if (
      input.branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(input.branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const contentKey = input.contentKey?.trim().toUpperCase();
    const kind = input.kind?.trim().toUpperCase();
    const scopeKey = input.branchId || 'GLOBAL';
    if (!contentKey || !kind || !input.payload || typeof input.payload !== 'object')
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.db.$transaction(async (tx) => {
      const latest = await tx.publicContentEntry.findFirst({
        where: { contentKey, scopeKey, locale: input.locale || 'id-ID' },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      const item = await tx.publicContentEntry.create({
        data: {
          id: newId(),
          contentKey,
          branchId: input.branchId || null,
          scopeKey,
          kind,
          locale: input.locale || 'id-ID',
          version: (latest?.version ?? 0) + 1,
          payload: input.payload as Prisma.InputJsonValue,
          createdById: principal.userId,
        },
      });
      await tx.auditLog.create({
        data: {
          id: newId(),
          actorType: 'USER',
          actorId: principal.userId,
          branchId: input.branchId || null,
          action: 'public_content.draft_created',
          objectType: 'PublicContentEntry',
          objectId: item.id,
          correlationId,
          afterMasked: { contentKey, kind, version: item.version },
        },
      });
      return item;
    });
  }
  async transition(
    principal: SessionPrincipal,
    id: string,
    status: 'PUBLISHED' | 'ARCHIVED',
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'public-content:manage');
    return this.db.$transaction(async (tx) => {
      const current = await tx.publicContentEntry.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      if (
        current.branchId &&
        !principal.capabilities.includes('branch:all') &&
        !principal.branchIds.includes(current.branchId)
      )
        throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      if (status === 'PUBLISHED' && current.status !== 'DRAFT')
        throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
      if (status === 'PUBLISHED')
        await tx.publicContentEntry.updateMany({
          where: {
            contentKey: current.contentKey,
            scopeKey: current.scopeKey,
            locale: current.locale,
            status: 'PUBLISHED',
            id: { not: current.id },
          },
          data: { status: 'ARCHIVED', archivedAt: new Date() },
        });
      const updated = await tx.publicContentEntry.update({
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
          branchId: current.branchId,
          action: `public_content.${status.toLowerCase()}`,
          objectType: 'PublicContentEntry',
          objectId: id,
          correlationId,
          afterMasked: { status },
        },
      });
      return updated;
    });
  }
}
