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
          branchScopes: { some: { branchId: id, active: true } },
          status: 'ACTIVE',
          effectiveFrom: { lte: now },
          OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
        },
      }),
      this.db.paymentAccount.count({ where: { branchId: id, active: true } }),
      this.db.classType.count({
        where: { active: true, branchScopes: { some: { branchId: id, active: true } } },
      }),
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

  async listStudios(principal: SessionPrincipal, branchId: string) {
    this.access.authorize(principal);
    this.access.ensureBranchScope(principal, branchId);
    const items = await this.db.studio.findMany({
      where: { branchId, historical: false },
      include: { rooms: { where: { historical: false }, orderBy: { code: 'asc' } } },
      orderBy: [{ code: 'asc' }, { id: 'asc' }],
    });
    return { items, page: { hasMore: false, nextCursor: null } };
  }

  async createStudio(
    principal: SessionPrincipal,
    branchId: string,
    input: {
      code: string;
      name: string;
      equipmentText?: string | null;
      contactPhoneE164?: string | null;
    },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, branchId, true);
    const code = input.code?.trim().toUpperCase();
    const name = input.name?.trim();
    if (!/^[A-Z0-9_-]{2,64}$/u.test(code) || name.length < 2)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.db.$transaction(async (tx) => {
      const branch = await tx.branch.findUnique({ where: { id: branchId } });
      if (!branch?.active) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const studio = await tx.studio.create({
        data: {
          id: newId(),
          branchId,
          code,
          name,
          equipmentText: input.equipmentText?.trim() || null,
          contactPhoneE164: input.contactPhoneE164?.trim() || null,
        },
      });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.studio_created',
        'Studio',
        studio.id,
        branchId,
      );
      return studio;
    });
  }

  async updateStudio(
    principal: SessionPrincipal,
    id: string,
    input: {
      name: string;
      equipmentText?: string | null;
      contactPhoneE164?: string | null;
      active?: boolean;
    },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    return this.db.$transaction(async (tx) => {
      const current = await tx.studio.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      this.access.ensureBranchScope(principal, current.branchId, true);
      const updated = await tx.studio.update({
        where: { id },
        data: {
          name: input.name?.trim(),
          equipmentText: input.equipmentText?.trim() || null,
          contactPhoneE164: input.contactPhoneE164?.trim() || null,
          active: input.active,
        },
      });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.studio_updated',
        'Studio',
        id,
        current.branchId,
      );
      return updated;
    });
  }

  async listRooms(principal: SessionPrincipal, studioId: string) {
    this.access.authorize(principal);
    const studio = await this.db.studio.findUnique({ where: { id: studioId } });
    if (!studio) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    this.access.ensureBranchScope(principal, studio.branchId);
    const items = await this.db.room.findMany({
      where: { studioId, historical: false },
      orderBy: [{ code: 'asc' }, { id: 'asc' }],
    });
    return { items, page: { hasMore: false, nextCursor: null } };
  }

  async createRoom(
    principal: SessionPrincipal,
    studioId: string,
    input: { code: string; name: string; capacity?: number | null },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    const studio = await this.db.studio.findUnique({ where: { id: studioId } });
    if (!studio) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    this.access.ensureBranchScope(principal, studio.branchId, true);
    const code = input.code?.trim().toUpperCase();
    const name = input.name?.trim();
    if (
      !/^[A-Z0-9_-]{2,64}$/u.test(code) ||
      name.length < 2 ||
      (input.capacity != null && input.capacity < 1)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.db.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: { id: newId(), studioId, code, name, capacity: input.capacity ?? null },
      });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.room_created',
        'Room',
        room.id,
        studio.branchId,
      );
      return room;
    });
  }

  async updateRoom(
    principal: SessionPrincipal,
    id: string,
    input: { name: string; capacity?: number | null; active?: boolean },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    return this.db.$transaction(async (tx) => {
      const current = await tx.room.findUnique({ where: { id }, include: { studio: true } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      this.access.ensureBranchScope(principal, current.studio.branchId, true);
      const updated = await tx.room.update({
        where: { id },
        data: { name: input.name?.trim(), capacity: input.capacity, active: input.active },
      });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.room_updated',
        'Room',
        id,
        current.studio.branchId,
      );
      return updated;
    });
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
                branchScopes: { some: { branchId: id, active: true } },
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
        await tx.accountingAccount.create({
          data: {
            branchId: branch.id,
            code: 'FINANCE_CORRECTION',
            name: 'Finance Correction',
            accountType: 'SYSTEM_CORRECTION',
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
        branchScopes: branchId
          ? { some: { branchId, active: true } }
          : scope.all
            ? scope.excluded.length
              ? { some: { branchId: { notIn: scope.excluded }, active: true } }
              : undefined
            : { some: { branchId: { in: scope.included }, active: true } },
      },
      include: { branchScopes: { include: { branch: true }, orderBy: { createdAt: 'asc' } } },
      orderBy: { code: 'asc' },
    });
    return { items, page: { nextCursor: null, hasMore: false } };
  }

  async createClassType(
    principal: SessionPrincipal,
    input: {
      code: string;
      name: string;
      description?: string | null;
      modality?: 'GROUP' | 'PRIVATE' | 'HYBRID' | 'UNKNOWN_LEGACY';
      defaultDurationMinutes?: number;
      defaultMinimumQuota?: number;
      defaultCapacity?: number;
      branchIds?: string[];
    },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    const branchIds = [...new Set(input.branchIds ?? [])];
    if (
      !/^[A-Z0-9_-]{2,30}$/.test(code) ||
      name.length < 2 ||
      name.length > 120 ||
      branchIds.some((id) => !/^[0-9a-f-]{36}$/iu.test(id))
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    for (const branchId of branchIds) this.access.ensureBranchScope(principal, branchId, true);
    try {
      return await this.db.$transaction(async (tx) => {
        if (branchIds.length) {
          const activeBranches = await tx.branch.count({
            where: { id: { in: branchIds }, active: true },
          });
          if (activeBranches !== branchIds.length)
            throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
        }
        const item = await tx.classType.create({
          data: {
            id: newId(),
            code,
            name,
            description: input.description?.trim() || null,
            modality: input.modality ?? 'GROUP',
            defaultDurationMinutes: input.defaultDurationMinutes ?? 60,
            defaultMinimumQuota: input.defaultMinimumQuota ?? 1,
            defaultCapacity: input.defaultCapacity ?? 1,
            branchScopes: {
              create: branchIds.map((branchId) => ({ id: newId(), branchId })),
            },
          },
          include: { branchScopes: true },
        });
        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_created',
          'ClassType',
          item.id,
          null,
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
        null,
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
          null,
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
          null,
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
        const current = await tx.classType.findUnique({ where: { id } });
        if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
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
          null,
          { active: false, version: current.version },
          { active: true, version: updated.version, reasonPresent: true },
        );
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as ClassType;
  }

  async replaceClassTypeScopes(
    principal: SessionPrincipal,
    id: string,
    input: { branchIds: string[]; expectedVersion: number; reason: string },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    const branchIds = [...new Set(input.branchIds ?? [])];
    if (!Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    for (const branchId of branchIds) this.access.ensureBranchScope(principal, branchId, true);
    return this.db.$transaction(async (tx) => {
      const current = await tx.classType.findUnique({
        where: { id },
        include: { branchScopes: true },
      });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const activeBranches = await tx.branch.count({
        where: { id: { in: branchIds }, active: true },
      });
      if (activeBranches !== branchIds.length)
        throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const changed = await tx.classType.updateMany({
        where: { id, version: input.expectedVersion },
        data: { version: { increment: 1 } },
      });
      if (!changed.count) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await tx.classTypeBranchScope.updateMany({
        where: { classTypeId: id, branchId: { notIn: branchIds } },
        data: { active: false },
      });
      for (const branchId of branchIds)
        await tx.classTypeBranchScope.upsert({
          where: { classTypeId_branchId: { classTypeId: id, branchId } },
          create: { id: newId(), classTypeId: id, branchId },
          update: { active: true, historical: false, sourceDeletedAt: null },
        });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.class_type_scopes_replaced',
        'ClassType',
        id,
        null,
        {
          branchIds: current.branchScopes
            .filter((scope) => scope.active)
            .map((scope) => scope.branchId),
        },
        { branchIds, reasonPresent: true },
      );
      return tx.classType.findUniqueOrThrow({
        where: { id },
        include: { branchScopes: { include: { branch: true } } },
      });
    });
  }
}

function isUnique(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
