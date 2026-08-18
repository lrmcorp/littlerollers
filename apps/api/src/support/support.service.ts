import { HttpStatus, Injectable } from '@nestjs/common';
import type { Prisma, SupportCasePriority, SupportCaseStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';
import { SupportRepository } from './support.repository';

@Injectable()
export class SupportService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly repository: SupportRepository,
  ) {}
  private buatScopeCabang(principal: SessionPrincipal, branchId?: string): Prisma.KasusBantuanWhereInput {
    this.policy.requireCapability(principal.capabilities, 'support:read');
    if (
      branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return principal.capabilities.includes('branch:all')
      ? branchId
        ? { branchId }
        : {}
      : { branchId: { in: principal.branchIds } };
  }
  async daftarKasus(
    principal: SessionPrincipal,
    input: {
      branchId?: string;
      status?: SupportCaseStatus;
      priority?: SupportCasePriority;
      q?: string;
      cursor?: string;
    },
  ) {
    const where: Prisma.KasusBantuanWhereInput = {
      ...this.buatScopeCabang(principal, input.branchId),
      ...(input.status ? { status: input.status } : {}),
      ...(input.priority ? { priority: input.priority } : {}),
      ...(input.q?.trim()
        ? {
            OR: [
              { subject: { contains: input.q.trim() } },
              { customer: { displayName: { contains: input.q.trim() } } },
            ],
          }
        : {}),
    };
    const rows = await this.repository.daftarKasus(
      where,
      input.cursor,
    );
    const items = rows.slice(0, 20);
    return {
      items,
      page: {
        hasMore: rows.length > 20,
        nextCursor: rows.length > 20 ? (items.at(-1)?.id ?? null) : null,
      },
    };
  }
  async detailKasus(principal: SessionPrincipal, id: string) {
    const item = await this.repository.detailKasus({
      id,
      ...this.buatScopeCabang(principal),
    });
    if (!item) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return item;
  }
  async buatKasus(
    principal: SessionPrincipal,
    input: {
      customerUserId: string;
      branchId?: string | null;
      subject: string;
      priority?: SupportCasePriority;
      tags?: string[];
    },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'support:manage');
    const branchId =
      input.branchId ||
      (!principal.capabilities.includes('branch:all') && principal.branchIds.length === 1
        ? principal.branchIds[0]
        : null);
    if (!branchId && !principal.capabilities.includes('branch:all'))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    this.buatScopeCabang(principal, branchId || undefined);
    const subject = input.subject?.trim();
    if (!subject || subject.length > 200)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const customer = await this.repository.cariCustomer(
      input.customerUserId,
    );
    if (!customer) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return this.db.$transaction(async (tx) => {
      const item = await this.repository.buatKasus(
        tx,
        {
          id: newId(),
          customerUserId: input.customerUserId,
          branchId,
          subject,
          priority: input.priority || 'NORMAL',
          tags: input.tags || [],
        },
      );
      await this.catatAudit(tx, principal, item.id, 'support.case_created', correlationId, {
        priority: item.priority,
        branchConfigured: Boolean(item.branchId),
      });
      return item;
    });
  }
  async ubahKasus(
    principal: SessionPrincipal,
    id: string,
    input: {
      status: SupportCaseStatus;
      priority: SupportCasePriority;
      assignedUserId?: string | null;
      tags?: string[];
      expectedVersion: number;
    },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'support:manage');
    const current = await this.repository.cariKasus({
      id,
      ...this.buatScopeCabang(principal),
    });
    if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (input.assignedUserId) {
      const assignee = await this.repository.cariPetugas(
        input.assignedUserId,
        current.branchId,
      );
      if (!assignee) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return this.db.$transaction(async (tx) => {
      const changed = await this.repository.ubahKasus(
        tx,
        id,
        input.expectedVersion,
        {
          status: input.status,
          priority: input.priority,
          assignedUserId: input.assignedUserId || null,
          tags: input.tags || [],
          resolvedAt: ['RESOLVED', 'CLOSED'].includes(input.status) ? new Date() : null,
          version: { increment: 1 },
        },
      );
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await this.catatAudit(tx, principal, id, 'support.case_updated', correlationId, {
        status: input.status,
        priority: input.priority,
        version: input.expectedVersion + 1,
      });
      return this.repository.cariKasusDalamTransaksi(
        tx,
        id,
      );
    });
  }
  async tambahCatatanInternal(
    principal: SessionPrincipal,
    id: string,
    body: string,
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'support:manage');
    const current = await this.repository.cariKasus({
      id,
      ...this.buatScopeCabang(principal),
    });
    if (!current || !body?.trim() || body.trim().length > 5000)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.db.$transaction(async (tx) => {
      const note = await this.repository.buatCatatanInternal(
        tx,
        {
          id: newId(),
          caseId: id,
          authorId: principal.userId,
          body: body.trim(),
          internal: true,
        },
      );
      await this.catatAudit(tx, principal, id, 'support.internal_note_added', correlationId, {
        internal: true,
      });
      return note;
    });
  }
  private catatAudit(
    tx: Prisma.TransactionClient,
    principal: SessionPrincipal,
    id: string,
    action: string,
    correlationId: string,
    afterMasked: Prisma.InputJsonValue,
  ) {
    return tx.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: principal.userId,
        action,
        objectType: 'SupportCase',
        objectId: id,
        correlationId,
        afterMasked,
      },
    });
  }
}
