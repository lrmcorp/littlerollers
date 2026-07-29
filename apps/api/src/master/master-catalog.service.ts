import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type Branch, type ClassType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { MasterAccessService } from './master-access.service';

@Injectable()
export class MasterCatalogService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: MasterAccessService,
    private readonly idempotency: IdempotencyService,
  ) {}

  async listBranches(
    principal: SessionPrincipal,
    query: { q?: string; status?: string; cursor?: string; limit?: string } = {},
  ) {
    this.access.authorize(principal);
    const scope = this.access.branchScope(principal);
    if (query.status && !['ACTIVE', 'INACTIVE'].includes(query.status))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 20)));
    if (!Number.isInteger(limit)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const branchScope = scope.all
      ? scope.excluded.length
        ? { id: { notIn: scope.excluded } }
        : {}
      : { id: { in: scope.included } };
    const where: Prisma.BranchWhereInput = {
      ...branchScope,
      active: query.status === 'ACTIVE' ? true : query.status === 'INACTIVE' ? false : undefined,
      OR: query.q?.trim()
        ? [
            { code: { contains: query.q.trim() } },
            { name: { contains: query.q.trim() } },
            { publicProfile: { area: { contains: query.q.trim() } } },
            { publicProfile: { city: { contains: query.q.trim() } } },
          ]
        : undefined,
    };
    const [rows, active, inactive] = await Promise.all([
      this.db.branch.findMany({
        where,
        include: { publicProfile: true },
        orderBy: [{ code: 'asc' }, { id: 'asc' }],
        cursor: query.cursor ? { id: query.cursor } : undefined,
        skip: query.cursor ? 1 : undefined,
        take: limit + 1,
      }),
      this.db.branch.count({ where: { ...where, active: true } }),
      this.db.branch.count({ where: { ...where, active: false } }),
    ]);
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    return {
      items,
      summary: { total: active + inactive, active, inactive },
      page: { nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null, hasMore },
    };
  }

  async branchDetail(principal: SessionPrincipal, id: string) {
    this.access.authorize(principal);
    this.access.ensureBranchScope(principal, id);
    const branch = await this.db.branch.findUnique({
      where: { id },
      include: { publicProfile: true },
    });
    if (!branch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const now = new Date();
    const [
      assignments,
      futureClasses,
      packages,
      paymentAccounts,
      classTypes,
      staff,
      auditActivity,
    ] = await Promise.all([
      this.db.assignment.count({
        where: {
          branchId: id,
          activeFrom: { lte: now },
          OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
        },
      }),
      this.db.classSlot.count({
        where: {
          branchId: id,
          endAt: { gt: now },
          status: { in: ['DRAFT', 'PUBLISHED', 'CONFIRMED'] },
        },
      }),
      this.db.package.count({
        where: {
          branchId: id,
          status: 'ACTIVE',
          effectiveFrom: { lte: now },
          OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
        },
      }),
      this.db.paymentAccount.count({ where: { branchId: id, active: true } }),
      this.db.classType.count({ where: { branchId: id, active: true } }),
      this.db.userRole.count({
        where: {
          branchId: id,
          activeFrom: { lte: now },
          OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
        },
      }),
      this.db.auditLog.findMany({
        where: { branchId: id },
        orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
        take: 20,
        select: { id: true, action: true, objectType: true, occurredAt: true },
      }),
    ]);
    return {
      ...branch,
      dependencies: { assignments, futureClasses, packages, paymentAccounts, classTypes, staff },
      auditActivity,
    };
  }

  async updateBranch(
    principal: SessionPrincipal,
    id: string,
    input: {
      name: string;
      timezone: string;
      supportWhatsappE164?: string | null;
      expectedVersion: number;
      reason: string;
    },
    key: string | undefined,
    correlationId: string,
  ): Promise<Branch> {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, id, true);
    const name = input.name?.trim();
    const reason = input.reason?.trim();
    if (!key || name.length < 2 || reason.length < 3 || !Number.isInteger(input.expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format();
    } catch {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }
    if (input.supportWhatsappE164 && !/^\+[1-9]\d{7,14}$/.test(input.supportWhatsappE164.trim()))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const result = await this.idempotency.execute(
      {
        scope: `branch-update:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const current = await tx.branch.findUnique({ where: { id } });
        if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
        const changed = await tx.branch.updateMany({
          where: { id, version: input.expectedVersion },
          data: {
            name,
            timezone: input.timezone,
            supportWhatsappE164: input.supportWhatsappE164?.trim() || null,
            version: { increment: 1 },
          },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const updated = await tx.branch.findUniqueOrThrow({ where: { id } });
        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.branch_updated',
          'Branch',
          id,
          id,
          { name: current.name, timezone: current.timezone, version: current.version },
          {
            name: updated.name,
            timezone: updated.timezone,
            version: updated.version,
            reasonPresent: true,
          },
        );
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as Branch;
  }

  async transitionBranch(
    principal: SessionPrincipal,
    id: string,
    status: 'ACTIVE' | 'INACTIVE',
    input: { expectedVersion: number; reason: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<Branch> {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, id, true);
    if (!key || !Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const result = await this.idempotency.execute(
      {
        scope: `branch-transition:${id}`,
        key,
        payload: { status, ...input },
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const current = await tx.branch.findUnique({ where: { id } });
        if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
        if (current.version !== input.expectedVersion)
          throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        if (status === 'INACTIVE') {
          const now = new Date();
          const [assignments, futureClasses, packages, paymentAccounts] = await Promise.all([
            tx.assignment.count({
              where: {
                branchId: id,
                activeFrom: { lte: now },
                OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
              },
            }),
            tx.classSlot.count({
              where: {
                branchId: id,
                endAt: { gt: now },
                status: { in: ['DRAFT', 'PUBLISHED', 'CONFIRMED'] },
              },
            }),
            tx.package.count({
              where: {
                branchId: id,
                status: 'ACTIVE',
                effectiveFrom: { lte: now },
                OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
              },
            }),
            tx.paymentAccount.count({ where: { branchId: id, active: true } }),
          ]);
          if (assignments || futureClasses || packages || paymentAccounts)
            throw new ApiProblem('ACTIVE_DEPENDENCY', HttpStatus.CONFLICT);
        }
        const updated = await tx.branch.update({
          where: { id },
          data: { active: status === 'ACTIVE', version: { increment: 1 } },
        });
        await this.access.audit(
          tx,
          principal,
          correlationId,
          status === 'ACTIVE' ? 'master.branch_reactivated' : 'master.branch_deactivated',
          'Branch',
          id,
          id,
          { active: current.active, version: current.version },
          { active: updated.active, version: updated.version, reasonPresent: true },
        );
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as Branch;
  }

  async createBranch(
    principal: SessionPrincipal,
    input: {
      code: string;
      name: string;
      timezone: string;
      supportWhatsappE164?: string | null;
      reason?: string;
    },
    correlationId: string,
    key?: string,
  ): Promise<Branch> {
    this.access.authorize(principal, true);
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    if (!/^[A-Z0-9_-]{2,30}$/.test(code) || name.length < 2 || name.length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format();
    } catch {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }
    if (input.supportWhatsappE164 && !/^\+[1-9]\d{7,14}$/.test(input.supportWhatsappE164.trim()))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    try {
      const create = async (tx: Prisma.TransactionClient) => {
        const branch = await tx.branch.create({
          data: {
            id: newId(),
            code,
            name,
            timezone: input.timezone,
            supportWhatsappE164: input.supportWhatsappE164?.trim() || null,
          },
        });
        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.branch_created',
          'Branch',
          branch.id,
          branch.id,
          undefined,
          {
            code,
            timezone: input.timezone,
            active: true,
            version: 0,
            reasonPresent: Boolean(input.reason?.trim()),
          },
        );
        return branch;
      };
      if (!key) return await this.db.$transaction(create);
      if (input.reason?.trim().length && input.reason.trim().length < 3)
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
      const result = await this.idempotency.execute(
        {
          scope: `branch-create:${code}`,
          key,
          payload: input,
          ttlMs: 86_400_000,
          leaseMs: 30_000,
        },
        async (tx) => ({
          status: 201,
          body: (await create(tx)) as unknown as Prisma.InputJsonValue,
        }),
      );
      return result.body as unknown as Branch;
    } catch (error) {
      if (isUnique(error)) throw new ApiProblem('BUSINESS_KEY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async deactivateBranch(
    principal: SessionPrincipal,
    id: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, id, true);
    return this.db.$transaction(async (tx) => {
      const current = await tx.branch.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      if (!current.active || current.version !== expectedVersion)
        throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      const dependencies = await tx.assignment.count({
        where: { branchId: id, activeUntil: null },
      });
      if (dependencies) throw new ApiProblem('ACTIVE_DEPENDENCY', HttpStatus.CONFLICT);
      const result = await tx.branch.update({
        where: { id },
        data: { active: false, version: { increment: 1 } },
      });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.branch_deactivated',
        'Branch',
        id,
        id,
        { active: true, version: expectedVersion },
        { active: false, version: expectedVersion + 1 },
      );
      return result;
    });
  }

  async listClassTypes(principal: SessionPrincipal, branchId?: string) {
    this.access.authorize(principal);
    if (branchId) this.access.ensureBranchScope(principal, branchId);
    const scope = this.access.branchScope(principal);
    const items = await this.db.classType.findMany({
      where: {
        branchId:
          branchId ??
          (scope.all
            ? scope.excluded.length
              ? { notIn: scope.excluded }
              : undefined
            : { in: scope.included }),
      },
      orderBy: { code: 'asc' },
    });
    return { items, page: { nextCursor: null, hasMore: false } };
  }

  async createClassType(
    principal: SessionPrincipal,
    input: { branchId: string; code: string; name: string },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, input.branchId, true);
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    if (!/^[A-Z0-9_-]{2,30}$/.test(code) || name.length < 2 || name.length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    try {
      return await this.db.$transaction(async (tx) => {
        const branch = await tx.branch.findUnique({ where: { id: input.branchId } });
        if (!branch?.active) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
        const item = await tx.classType.create({
          data: { id: newId(), branchId: input.branchId, code, name },
        });
        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_created',
          'ClassType',
          item.id,
          input.branchId,
          undefined,
          { code, active: true, version: 0 },
        );
        return item;
      });
    } catch (error) {
      if (isUnique(error)) throw new ApiProblem('BUSINESS_KEY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async deactivateClassType(
    principal: SessionPrincipal,
    id: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    return this.db.$transaction(async (tx) => {
      const item = await tx.classType.findUnique({ where: { id } });
      if (!item) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      this.access.ensureBranchScope(principal, item.branchId, true);
      if (!item.active || item.version !== expectedVersion)
        throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      const activeSettings = await tx.effectiveConfiguration.count({
        where: { classTypeId: id, effectiveUntil: null },
      });
      if (activeSettings) throw new ApiProblem('ACTIVE_DEPENDENCY', HttpStatus.CONFLICT);
      const result = await tx.classType.update({
        where: { id },
        data: { active: false, version: { increment: 1 } },
      });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.class_type_deactivated',
        'ClassType',
        id,
        item.branchId,
        { active: true, version: expectedVersion },
        { active: false, version: expectedVersion + 1 },
      );
      return result;
    });
  }

  async deactivateClassTypeIdempotent(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number; reason: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<ClassType> {
    this.access.authorize(principal, true);
    if (!key || !Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const result = await this.idempotency.execute(
      {
        scope: `class-type-deactivate:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const current = await tx.classType.findUnique({ where: { id } });
        if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
        this.access.ensureBranchScope(principal, current.branchId, true);
        if (!current.active) throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
        if (current.version !== input.expectedVersion)
          throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const activeSettings = await tx.effectiveConfiguration.count({
          where: { classTypeId: id, effectiveUntil: null },
        });
        if (activeSettings) throw new ApiProblem('ACTIVE_DEPENDENCY', HttpStatus.CONFLICT);
        const updated = await tx.classType.update({
          where: { id, version: input.expectedVersion },
          data: { active: false, version: { increment: 1 } },
        });
        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_deactivated',
          'ClassType',
          id,
          current.branchId,
          { active: true, version: current.version },
          { active: false, version: updated.version, reasonPresent: true },
        );
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as ClassType;
  }

  async updateClassType(
    principal: SessionPrincipal,
    id: string,
    input: { name: string; expectedVersion: number; reason: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<ClassType> {
    this.access.authorize(principal, true);
    const name = input.name?.trim();
    const reason = input.reason?.trim();
    if (!key || name.length < 2 || name.length > 120 || reason.length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (!Number.isInteger(input.expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const result = await this.idempotency.execute(
      {
        scope: `class-type-update:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const current = await tx.classType.findUnique({ where: { id } });
        if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
        this.access.ensureBranchScope(principal, current.branchId, true);
        const changed = await tx.classType.updateMany({
          where: { id, version: input.expectedVersion },
          data: { name, version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const updated = await tx.classType.findUniqueOrThrow({ where: { id } });
        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_updated',
          'ClassType',
          id,
          current.branchId,
          { name: current.name, version: current.version },
          { name: updated.name, version: updated.version, reasonPresent: true },
        );
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as ClassType;
  }

  async reactivateClassType(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number; reason: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<ClassType> {
    this.access.authorize(principal, true);
    if (!key || !Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const result = await this.idempotency.execute(
      {
        scope: `class-type-reactivate:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const current = await tx.classType.findUnique({
          where: { id },
          include: { branch: { select: { active: true } } },
        });
        if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
        this.access.ensureBranchScope(principal, current.branchId, true);
        if (!current.branch.active) throw new ApiProblem('ACTIVE_DEPENDENCY', HttpStatus.CONFLICT);
        if (current.active) throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
        const changed = await tx.classType.updateMany({
          where: { id, version: input.expectedVersion, active: false },
          data: { active: true, version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const updated = await tx.classType.findUniqueOrThrow({ where: { id } });
        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_reactivated',
          'ClassType',
          id,
          current.branchId,
          { active: false, version: current.version },
          { active: true, version: updated.version, reasonPresent: true },
        );
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as ClassType;
  }
}

function isUnique(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
