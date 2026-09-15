import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type Cabang, type JenisKelas } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { MasterAccessService } from './master-access.service';

function isUnique(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2002';
}

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

    const where: Prisma.CabangWhereInput = {
      ...branchScope,
      active: query.status === 'ACTIVE' ? true : query.status === 'INACTIVE' ? false : undefined,
      OR: query.q?.trim()
        ? [
            { code: { contains: query.q.trim() } },
            { name: { contains: query.q.trim() } },
          ]
        : undefined,
    };

    const [rows, active, inactive] = await Promise.all([
      this.db.cabang.findMany({
        where,
        orderBy: [{ code: 'asc' }, { id: 'asc' }],
        cursor: query.cursor ? { id: query.cursor } : undefined,
        skip: query.cursor ? 1 : undefined,
        take: limit + 1,
      }),
      this.db.cabang.count({ where: { ...where, active: true } }),
      this.db.cabang.count({ where: { ...where, active: false } }),
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
    const branch = await this.db.cabang.findUnique({
      where: { id },
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
    ] = await Promise.all([
      this.db.penugasanInstruktur.count({
        where: { branchId: id, active: true },
      }),
      this.db.slotKelas.count({
        where: {
          branchId: id,
          endAt: { gt: now },
          status: { in: ['DRAFT', 'PUBLISHED', 'CONFIRMED'] },
        },
      }),
      this.db.paket.count({
        where: { status: 'ACTIVE' },
      }),
      this.db.rekeningPembayaran.count({ where: { branchId: id, active: true } }),
      this.db.jenisKelas.count({ where: { active: true } }),
      this.db.user.count({
        where: {
          preferredBranchId: id,
          status: 'ACTIVE',
        },
      }),
    ]);

    return {
      ...branch,
      dependencies: { assignments, futureClasses, packages, paymentAccounts, classTypes, staff },
      auditActivity: [],
    };
  }

  async listStudios(principal: SessionPrincipal, branchId: string) {
    this.access.authorize(principal);
    this.access.ensureBranchScope(principal, branchId);
    const items = await this.db.studio.findMany({
      where: { branchId, active: true },
      include: { rooms: { where: { active: true }, orderBy: { code: 'asc' } } },
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
      const branch = await tx.cabang.findUnique({ where: { id: branchId } });
      if (!branch?.active) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

      const studio = await tx.studio.create({
        data: {
          id: newId(),
          branchId,
          code,
          name,
          description: input.equipmentText?.trim() || null,
          active: true,
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
          description: input.equipmentText?.trim() || null,
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

    const items = await this.db.ruangan.findMany({
      where: { studioId, active: true },
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
      const room = await tx.ruangan.create({
        data: {
          id: newId(),
          studioId,
          code,
          name,
          capacityBed: input.capacity ?? 1,
          active: true,
        },
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
      const current = await tx.ruangan.findUnique({ where: { id }, include: { studio: true } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      this.access.ensureBranchScope(principal, current.studio.branchId, true);

      const updated = await tx.ruangan.update({
        where: { id },
        data: {
          name: input.name?.trim(),
          capacityBed: input.capacity ?? undefined,
          active: input.active,
        },
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
      expectedVersion?: number;
      reason?: string;
    },
    key: string | undefined,
    correlationId: string,
  ): Promise<Cabang> {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, id, true);
    const name = input.name?.trim();
    if (!name || name.length < 2)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    try {
      new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format();
    } catch {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }
    if (input.supportWhatsappE164 && !/^\+[1-9]\d{7,14}$/.test(input.supportWhatsappE164.trim()))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    const updateAction = async (tx: Prisma.TransactionClient) => {
      const current = await tx.cabang.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

      const updated = await tx.cabang.update({
        where: { id },
        data: {
          name,
          timezone: input.timezone,
          supportWhatsappE164: input.supportWhatsappE164?.trim() || null,
        },
      });

      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.branch_updated',
        'Branch',
        id,
        id,
        { name: current.name, timezone: current.timezone },
        { name: updated.name, timezone: updated.timezone },
      );
      return updated;
    };

    if (!key) {
      return this.db.$transaction(updateAction);
    }

    const result = await this.idempotency.execute(
      {
        scope: `branch-update:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const updated = await updateAction(tx);
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as Cabang;
  }

  async transitionBranch(
    principal: SessionPrincipal,
    id: string,
    status: 'ACTIVE' | 'INACTIVE',
    input: { expectedVersion?: number; reason?: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<Cabang> {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, id, true);

    const transitionAction = async (tx: Prisma.TransactionClient) => {
      const current = await tx.cabang.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

      const updated = await tx.cabang.update({
        where: { id },
        data: { active: status === 'ACTIVE' },
      });

      await this.access.audit(
        tx,
        principal,
        correlationId,
        status === 'ACTIVE' ? 'master.branch_activated' : 'master.branch_deactivated',
        'Branch',
        id,
        id,
        { active: current.active },
        { active: updated.active },
      );
      return updated;
    };

    if (!key) {
      return this.db.$transaction(transitionAction);
    }

    const result = await this.idempotency.execute(
      {
        scope: `branch-transition:${id}`,
        key,
        payload: { status, ...input },
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const updated = await transitionAction(tx);
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as Cabang;
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
  ): Promise<Cabang> {
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
        const branch = await tx.cabang.create({
          data: {
            id: newId(),
            code,
            name,
            timezone: input.timezone,
            supportWhatsappE164: input.supportWhatsappE164?.trim() || null,
            active: true,
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
          { code, timezone: input.timezone, active: true },
        );
        return branch;
      };

      if (!key) return await this.db.$transaction(create);

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
      return result.body as unknown as Cabang;
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
    return this.transitionBranch(
      principal,
      id,
      'INACTIVE',
      { expectedVersion, reason: 'Deactivated via API' },
      undefined,
      correlationId,
    );
  }

  async listClassTypes(principal: SessionPrincipal, branchId?: string) {
    this.access.authorize(principal);
    if (branchId) this.access.ensureBranchScope(principal, branchId);

    const branches = await this.db.cabang.findMany({
      where: { active: true },
      select: { id: true, code: true, name: true, active: true },
    });

    const items = await this.db.jenisKelas.findMany({
      where: { active: true },
      orderBy: { code: 'asc' },
    });

    const mapped = items.map((item) => ({
      ...item,
      version: 1,
      branchScopes: branches.map((b) => ({
        branchId: b.id,
        active: true,
        branch: b,
      })),
    }));

    return { items: mapped, page: { nextCursor: null, hasMore: false } };
  }

  async createClassType(
    principal: SessionPrincipal,
    input: {
      code: string;
      name: string;
      description?: string | null;
      modality?: string;
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

    if (
      !/^[A-Z0-9_-]{2,30}$/.test(code) ||
      name.length < 2 ||
      name.length > 120
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    try {
      return await this.db.$transaction(async (tx) => {
        const item = await tx.jenisKelas.create({
          data: {
            id: newId(),
            code,
            name,
            description: input.description?.trim() || null,
            modality: (input.modality as any) ?? 'GROUP',
            durationMinutes: input.defaultDurationMinutes ?? 50,
            defaultCapacity: input.defaultCapacity ?? 8,
            active: true,
          },
        });

        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_created',
          'ClassType',
          item.id,
          null,
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
    _expectedVersion: number,
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    return this.db.$transaction(async (tx) => {
      const item = await tx.jenisKelas.findUnique({ where: { id } });
      if (!item) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

      const result = await tx.jenisKelas.update({
        where: { id },
        data: { active: false },
      });

      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.class_type_deactivated',
        'ClassType',
        id,
        null,
      );
      return result;
    });
  }

  async deactivateClassTypeIdempotent(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion?: number; reason?: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<JenisKelas> {
    this.access.authorize(principal, true);
    const action = async (tx: Prisma.TransactionClient) => {
      const current = await tx.jenisKelas.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

      const updated = await tx.jenisKelas.update({
        where: { id },
        data: { active: false },
      });

      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.class_type_deactivated',
        'ClassType',
        id,
        null,
      );
      return updated;
    };

    if (!key) return this.db.$transaction(action);

    const result = await this.idempotency.execute(
      {
        scope: `class-type-deactivate:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const updated = await action(tx);
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as JenisKelas;
  }

  async updateClassType(
    principal: SessionPrincipal,
    id: string,
    input: { name: string; expectedVersion?: number; reason?: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<JenisKelas> {
    this.access.authorize(principal, true);
    const name = input.name?.trim();
    if (!name || name.length < 2 || name.length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    const action = async (tx: Prisma.TransactionClient) => {
      const current = await tx.jenisKelas.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

      const updated = await tx.jenisKelas.update({
        where: { id },
        data: { name },
      });

      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.class_type_updated',
        'ClassType',
        id,
        null,
      );
      return updated;
    };

    if (!key) return this.db.$transaction(action);

    const result = await this.idempotency.execute(
      {
        scope: `class-type-update:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const updated = await action(tx);
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as JenisKelas;
  }

  async reactivateClassType(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion?: number; reason?: string },
    key: string | undefined,
    correlationId: string,
  ): Promise<JenisKelas> {
    this.access.authorize(principal, true);
    const action = async (tx: Prisma.TransactionClient) => {
      const current = await tx.jenisKelas.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

      const updated = await tx.jenisKelas.update({
        where: { id },
        data: { active: true },
      });

      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.class_type_reactivated',
        'ClassType',
        id,
        null,
      );
      return updated;
    };

    if (!key) return this.db.$transaction(action);

    const result = await this.idempotency.execute(
      {
        scope: `class-type-reactivate:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const updated = await action(tx);
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as JenisKelas;
  }

  async replaceClassTypeScopes(
    principal: SessionPrincipal,
    id: string,
    input: { branchIds: string[]; expectedVersion?: number; reason?: string },
    _correlationId: string,
  ) {
    this.access.authorize(principal, true);
    return this.db.jenisKelas.findUniqueOrThrow({
      where: { id },
    });
  }

  // --- Indonesian Domain Aliases ---
  async daftarCabang(
    principal: SessionPrincipal,
    query?: Parameters<MasterCatalogService['listBranches']>[1],
  ) {
    return this.listBranches(principal, query);
  }

  async detailCabang(principal: SessionPrincipal, id: string) {
    return this.branchDetail(principal, id);
  }

  async buatCabang(
    principal: SessionPrincipal,
    input: Parameters<MasterCatalogService['createBranch']>[1],
    correlationId: string,
    key?: string,
  ) {
    return this.createBranch(principal, input, correlationId, key);
  }

  async perbaruiCabang(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<MasterCatalogService['updateBranch']>[2],
    key: string | undefined,
    correlationId: string,
  ) {
    return this.updateBranch(principal, id, input, key, correlationId);
  }

  async nonaktifkanCabang(
    principal: SessionPrincipal,
    id: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    return this.deactivateBranch(principal, id, expectedVersion, correlationId);
  }

  async daftarStudio(principal: SessionPrincipal, branchId: string) {
    return this.listStudios(principal, branchId);
  }

  async buatStudio(
    principal: SessionPrincipal,
    branchId: string,
    input: Parameters<MasterCatalogService['createStudio']>[2],
    correlationId: string,
  ) {
    return this.createStudio(principal, branchId, input, correlationId);
  }

  async perbaruiStudio(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<MasterCatalogService['updateStudio']>[2],
    correlationId: string,
  ) {
    return this.updateStudio(principal, id, input, correlationId);
  }

  async daftarRuangan(principal: SessionPrincipal, studioId: string) {
    return this.listRooms(principal, studioId);
  }

  async buatRuangan(
    principal: SessionPrincipal,
    studioId: string,
    input: Parameters<MasterCatalogService['createRoom']>[2],
    correlationId: string,
  ) {
    return this.createRoom(principal, studioId, input, correlationId);
  }

  async perbaruiRuangan(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<MasterCatalogService['updateRoom']>[2],
    correlationId: string,
  ) {
    return this.updateRoom(principal, id, input, correlationId);
  }

  async daftarJenisKelas(principal: SessionPrincipal, branchId?: string) {
    return this.listClassTypes(principal, branchId);
  }

  async buatJenisKelas(
    principal: SessionPrincipal,
    input: Parameters<MasterCatalogService['createClassType']>[1],
    correlationId: string,
  ) {
    return this.createClassType(principal, input, correlationId);
  }

  async perbaruiJenisKelas(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<MasterCatalogService['updateClassType']>[2],
    key: string | undefined,
    correlationId: string,
  ) {
    return this.updateClassType(principal, id, input, key, correlationId);
  }

  async nonaktifkanJenisKelas(
    principal: SessionPrincipal,
    id: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    return this.deactivateClassType(principal, id, expectedVersion, correlationId);
  }

  async aktifkanKembaliJenisKelas(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<MasterCatalogService['reactivateClassType']>[2],
    key: string | undefined,
    correlationId: string,
  ) {
    return this.reactivateClassType(principal, id, input, key, correlationId);
  }
}
