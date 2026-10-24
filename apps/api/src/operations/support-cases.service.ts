import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../foundation/audit.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, ENTITY_ID_REGEX } from '../identity/security';

export const SUPPORT_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;
export const SUPPORT_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'WAITING_CUSTOMER',
  'RESOLVED',
  'CLOSED',
] as const;
type Priority = (typeof SUPPORT_PRIORITIES)[number];
type Status = (typeof SUPPORT_STATUSES)[number];

const PAGE_SIZE = 20;
const MAX_TAGS = 10;
const CLOSED_STATUSES: readonly Status[] = ['RESOLVED', 'CLOSED'];
const STAFF_EXCLUDED_ROLES = ['CUSTOMER', 'MEMBER'];

const caseInclude = {
  customer: { select: { id: true, displayName: true, email: true, phone: true } },
  branch: { select: { id: true, name: true } },
  assignedUser: { select: { id: true, displayName: true } },
  _count: { select: { notes: true } },
} satisfies Prisma.SupportCaseInclude;

type CaseRow = Prisma.SupportCaseGetPayload<{ include: typeof caseInclude }>;

const invalid = (field: string, issue = 'INVALID') =>
  new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [{ field, issue }]);
const notFound = () => new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

function normalizeTags(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw invalid('tags');
  const tags = [
    ...new Set(
      value.map((tag) => {
        if (typeof tag !== 'string') throw invalid('tags');
        return tag.trim().toLowerCase();
      }),
    ),
  ].filter(Boolean);
  if (tags.length > MAX_TAGS || tags.some((tag) => tag.length > 40)) throw invalid('tags');
  return tags;
}

@Injectable()
export class SupportCasesService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  /** Kasus berlabel cabang mengikuti cakupan cabang; kasus tanpa cabang hanya untuk `branch:all`. */
  private scopeWhere(principal: SessionPrincipal, capability: string): Prisma.SupportCaseWhereInput {
    const scope = this.policy.capabilityBranchScope(principal, capability);
    if (scope.all)
      return scope.excluded.length
        ? { OR: [{ branchId: null }, { branchId: { notIn: scope.excluded } }] }
        : {};
    return { branchId: { in: scope.included } };
  }

  private canAccess(principal: SessionPrincipal, capability: string, branchId: string | null) {
    return branchId
      ? this.policy.hasCapability(principal, capability, branchId)
      : this.policy.capabilityBranchScope(principal, capability).all;
  }

  private view(row: CaseRow) {
    return {
      id: row.id,
      subject: row.subject,
      customerUserId: row.customerId,
      customer: {
        id: row.customer.id,
        displayName: row.customer.displayName,
        email: row.customer.email,
        phoneE164: row.customer.phone,
      },
      branchId: row.branchId,
      branch: row.branch,
      priority: row.priority,
      status: row.status,
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
      assignedUser: row.assignedUser,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      resolvedAt: row.resolvedAt?.toISOString() ?? null,
      _count: { notes: row._count.notes },
    };
  }

  async list(
    principal: SessionPrincipal,
    query: {
      status?: string;
      priority?: string;
      assignedUserId?: string;
      q?: string;
      cursor?: string;
      limit?: string;
    } = {},
  ) {
    this.policy.requireCapability(principal.capabilities, 'support:read');
    if (query.status && !(SUPPORT_STATUSES as readonly string[]).includes(query.status))
      throw invalid('status');
    if (query.priority && !(SUPPORT_PRIORITIES as readonly string[]).includes(query.priority))
      throw invalid('priority');
    if (query.assignedUserId && query.assignedUserId !== 'me' && !ENTITY_ID_REGEX.test(query.assignedUserId))
      throw invalid('assignedUserId');
    const limit = Math.min(Math.max(Number(query.limit) || PAGE_SIZE, 1), 100);
    const term = query.q?.trim();

    const scope = this.scopeWhere(principal, 'support:read');
    const filters: Prisma.SupportCaseWhereInput = {
      ...(query.status ? { status: query.status as Status } : {}),
      ...(query.priority ? { priority: query.priority as Priority } : {}),
      ...(query.assignedUserId
        ? { assignedUserId: query.assignedUserId === 'me' ? principal.userId : query.assignedUserId }
        : {}),
      ...(term
        ? {
            OR: [
              { subject: { contains: term } },
              { customer: { is: { displayName: { contains: term } } } },
              { customer: { is: { email: { contains: term } } } },
            ],
          }
        : {}),
    };

    const [rows, grouped] = await Promise.all([
      this.db.supportCase.findMany({
        where: { AND: [scope, filters] },
        include: caseInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
      this.db.supportCase.groupBy({ by: ['status'], where: scope, _count: { _all: true } }),
    ]);
    const hasMore = rows.length > limit;
    const items = (hasMore ? rows.slice(0, limit) : rows).map((row) => this.view(row));
    const counts = new Map(grouped.map((entry) => [entry.status, entry._count._all]));
    return {
      items,
      summary: {
        total: [...counts.values()].reduce((sum, count) => sum + count, 0),
        open: counts.get('OPEN') ?? 0,
        inProgress: counts.get('IN_PROGRESS') ?? 0,
        waitingCustomer: counts.get('WAITING_CUSTOMER') ?? 0,
        resolved: counts.get('RESOLVED') ?? 0,
        closed: counts.get('CLOSED') ?? 0,
      },
      page: { hasMore, nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null },
    };
  }

  async create(
    principal: SessionPrincipal,
    body: {
      customerUserId: string;
      branchId?: string | null;
      subject: string;
      priority?: string;
      tags?: string[];
      note?: string;
    },
  ) {
    this.policy.requireCapability(principal.capabilities, 'support:manage');
    const subject = body?.subject?.trim();
    if (!subject || subject.length > 200) throw invalid('subject');
    const priority = (body.priority ?? 'NORMAL') as Priority;
    if (!SUPPORT_PRIORITIES.includes(priority)) throw invalid('priority');
    const tags = normalizeTags(body.tags);
    const note = body.note?.trim();
    if (note !== undefined && note.length > 5000) throw invalid('note');
    if (!body.customerUserId || !ENTITY_ID_REGEX.test(body.customerUserId))
      throw invalid('customerUserId');
    if (body.branchId) {
      if (!this.policy.hasCapability(principal, 'support:manage', body.branchId)) throw notFound();
    } else if (!this.policy.capabilityBranchScope(principal, 'support:manage').all) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const customer = await this.db.user.findUnique({ where: { id: body.customerUserId } });
    if (!customer) throw notFound();
    if (body.branchId) {
      const branch = await this.db.cabang.findUnique({ where: { id: body.branchId } });
      if (!branch) throw notFound();
    }

    const created = await this.db.supportCase.create({
      data: {
        subject,
        customerId: customer.id,
        branchId: body.branchId ?? null,
        priority,
        status: 'OPEN',
        tags,
        createdById: principal.userId,
        ...(note ? { notes: { create: { body: note, internal: true, authorId: principal.userId } } } : {}),
      },
      include: caseInclude,
    });
    // Isi subjek dan catatan tidak disalin ke audit; cukup rujukan dan atribut penanganan.
    await this.audit?.catat(null, {
      actorId: principal.userId,
      branchId: created.branchId,
      action: 'support_case.created',
      objectType: 'SupportCase',
      objectId: created.id,
      targetUserId: customer.id,
      afterMasked: { priority, tags, withNote: Boolean(note) },
    });
    return this.view(created);
  }

  private async load(id: string) {
    if (!ENTITY_ID_REGEX.test(id)) throw notFound();
    const row = await this.db.supportCase.findUnique({ where: { id }, include: caseInclude });
    if (!row) throw notFound();
    return row;
  }

  async detail(principal: SessionPrincipal, id: string) {
    this.policy.requireCapability(principal.capabilities, 'support:read');
    const row = await this.load(id);
    if (!this.canAccess(principal, 'support:read', row.branchId)) throw notFound();
    const notes = await this.db.supportCaseNote.findMany({
      where: { caseId: id },
      include: { author: { select: { id: true, displayName: true } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 200,
    });
    return {
      ...this.view(row),
      notes: notes.map((note) => ({
        id: note.id,
        body: note.body,
        internal: note.internal,
        createdAt: note.createdAt.toISOString(),
        author: { id: note.author?.id ?? null, displayName: note.author?.displayName ?? 'Staf' },
      })),
    };
  }

  async update(
    principal: SessionPrincipal,
    id: string,
    body: {
      status?: string;
      priority?: string;
      assignedUserId?: string | null;
      tags?: string[];
      expectedVersion?: number;
    },
  ) {
    this.policy.requireCapability(principal.capabilities, 'support:manage');
    if (!Number.isInteger(body?.expectedVersion)) throw invalid('expectedVersion', 'REQUIRED');
    const data: Prisma.SupportCaseUncheckedUpdateManyInput = {};
    if (body.status !== undefined) {
      if (!(SUPPORT_STATUSES as readonly string[]).includes(body.status)) throw invalid('status');
      data.status = body.status as Status;
      data.resolvedAt = CLOSED_STATUSES.includes(body.status as Status) ? new Date() : null;
    }
    if (body.priority !== undefined) {
      if (!(SUPPORT_PRIORITIES as readonly string[]).includes(body.priority))
        throw invalid('priority');
      data.priority = body.priority as Priority;
    }
    if (body.tags !== undefined) data.tags = normalizeTags(body.tags);
    if (body.assignedUserId !== undefined) {
      if (body.assignedUserId === null || body.assignedUserId === '') {
        data.assignedUserId = null;
      } else {
        if (!ENTITY_ID_REGEX.test(body.assignedUserId)) throw invalid('assignedUserId');
        const assignee = await this.db.user.findUnique({ where: { id: body.assignedUserId } });
        if (!assignee || assignee.status !== 'ACTIVE' || STAFF_EXCLUDED_ROLES.includes(assignee.role))
          throw invalid('assignedUserId', 'NOT_STAFF');
        data.assignedUserId = assignee.id;
      }
    }
    if (Object.keys(data).length === 0) throw invalid('body', 'EMPTY');

    const row = await this.load(id);
    if (!this.canAccess(principal, 'support:manage', row.branchId)) throw notFound();
    // Status yang sama tidak menggeser waktu selesai.
    if (data.status === row.status) delete data.resolvedAt;

    const claimed = await this.db.supportCase.updateMany({
      where: { id, version: body.expectedVersion },
      data: { ...data, version: { increment: 1 } },
    });
    if (claimed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    await this.audit?.catat(null, {
      actorId: principal.userId,
      branchId: row.branchId,
      action: 'support_case.updated',
      objectType: 'SupportCase',
      objectId: id,
      targetUserId: row.customerId,
      beforeMasked: {
        status: row.status,
        priority: row.priority,
        assignedUserId: row.assignedUserId ?? null,
        tags: row.tags as unknown as string[],
      },
      afterMasked: {
        status: data.status ?? row.status,
        priority: data.priority ?? row.priority,
        assignedUserId: data.assignedUserId === undefined ? (row.assignedUserId ?? null) : (data.assignedUserId ?? null),
        tags: (data.tags ?? row.tags) as unknown as string[],
      },
    });
    return this.detail(principal, id);
  }

  async addInternalNote(principal: SessionPrincipal, id: string, body: { body?: string }) {
    this.policy.requireCapability(principal.capabilities, 'support:manage');
    const text = typeof body?.body === 'string' ? body.body.trim() : '';
    if (text.length < 2 || text.length > 5000) throw invalid('body');
    const row = await this.load(id);
    if (!this.canAccess(principal, 'support:manage', row.branchId)) throw notFound();

    const [note] = await this.db.$transaction([
      this.db.supportCaseNote.create({
        data: { caseId: id, body: text, internal: true, authorId: principal.userId },
        include: { author: { select: { id: true, displayName: true } } },
      }),
      this.db.supportCase.update({ where: { id }, data: { updatedAt: new Date() } }),
    ]);
    await this.audit?.catat(null, {
      actorId: principal.userId,
      branchId: row.branchId,
      action: 'support_case.note_added',
      objectType: 'SupportCase',
      objectId: id,
      targetUserId: row.customerId,
      afterMasked: { noteId: note.id, length: text.length },
    });
    return {
      id: note.id,
      body: note.body,
      internal: note.internal,
      createdAt: note.createdAt.toISOString(),
      author: { id: note.author?.id ?? null, displayName: note.author?.displayName ?? 'Staf' },
    };
  }
}
