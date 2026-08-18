import { HttpStatus, Injectable } from '@nestjs/common';
import {PackageStatus, Prisma, type Paket } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { PackageAccessService } from './package-access.service';

@Injectable()
export class PackageCatalogService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: PackageAccessService,
    private readonly idempotency: IdempotencyService,
  ) {}

  private effectiveState(item: {
    status: PackageStatus;
    effectiveFrom: Date;
    effectiveUntil: Date | null;
  }) {
    const now = new Date();
    if (item.status === 'INACTIVE') return 'INACTIVE';
    if (item.effectiveFrom > now) return 'SCHEDULED';
    if (item.effectiveUntil && item.effectiveUntil <= now) return 'EXPIRED';
    return 'ACTIVE';
  }

  async list(
    principal: SessionPrincipal,
    query: {
      branchId?: string;
      classTypeId?: string;
      status?: string;
      effectiveState?: string;
      q?: string;
      from?: string;
      until?: string;
      cursor?: string;
      limit?: string;
      includeHistorical?: boolean;
    } = {},
  ) {
    this.access.catalog(principal);
    if (query.includeHistorical && !principal.capabilities.includes('migration:read'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const customer =
      principal.roles.some(({ role }) => role === 'CUSTOMER') &&
      !principal.capabilities.includes('branch:all') &&
      !principal.capabilities.includes('branch:operate') &&
      !principal.capabilities.includes('branch:manage');
    if (query.branchId && !customer) this.access.scope(principal, query.branchId, ['package:read']);
    if (query.branchId && customer) {
      const branch = await this.db.cabang.findUnique({ where: { id: query.branchId } });
      if (!branch?.active) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const now = new Date();
    const scope = this.access.branchScope(principal, 'package:read');
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 20)));
    if (!Number.isInteger(limit)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (query.status && !Object.values(PackageStatus).includes(query.status as PackageStatus))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (
      query.effectiveState &&
      !['ACTIVE', 'SCHEDULED', 'EXPIRED', 'INACTIVE'].includes(query.effectiveState)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/u;
    if ((query.from && !dateOnly.test(query.from)) || (query.until && !dateOnly.test(query.until)))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const from = query.from ? new Date(`${query.from}T00:00:00.000Z`) : undefined;
    const until = query.until ? new Date(`${query.until}T23:59:59.999Z`) : undefined;
    const stateWhere: Prisma.PaketWhereInput =
      query.effectiveState === 'ACTIVE'
        ? {
            status: 'ACTIVE',
            effectiveFrom: { lte: now },
            OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
          }
        : query.effectiveState === 'SCHEDULED'
          ? { status: 'ACTIVE', effectiveFrom: { gt: now } }
          : query.effectiveState === 'EXPIRED'
            ? { status: 'ACTIVE', effectiveUntil: { lte: now } }
            : query.effectiveState === 'INACTIVE'
              ? { status: 'INACTIVE' }
              : {};
    const baseWhere: Prisma.PaketWhereInput = {
      AND: [
        query.includeHistorical ? {} : { historical: false },
        query.branchId
          ? { branchScopes: { some: { branchId: query.branchId, active: true } } }
          : customer
            ? {}
            : scope.all
              ? scope.excluded.length
                ? { branchScopes: { some: { active: true, branchId: { notIn: scope.excluded } } } }
                : {}
              : { branchScopes: { some: { active: true, branchId: { in: scope.included } } } },
        query.classTypeId
          ? { classTypeScopes: { some: { classTypeId: query.classTypeId, active: true } } }
          : {},
        query.q?.trim()
          ? {
              OR: [
                { name: { contains: query.q.trim() } },
                { businessKey: { contains: query.q.trim().toUpperCase() } },
              ],
            }
          : {},
        query.status ? { status: query.status as PackageStatus } : {},
        stateWhere,
        from ? { OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: from } }] } : {},
        until ? { effectiveFrom: { lte: until } } : {},
        customer
          ? {
              status: 'ACTIVE',
              effectiveFrom: { lte: now },
              OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
            }
          : {},
      ],
    };
    let cursorWhere: Prisma.PaketWhereInput = {};
    if (query.cursor) {
      const cursor = await this.db.paket.findFirst({
        where: { id: query.cursor, ...baseWhere },
        select: { id: true, effectiveFrom: true },
      });
      if (!cursor) throw new ApiProblem('INVALID_CURSOR', HttpStatus.BAD_REQUEST);
      cursorWhere = {
        OR: [
          { effectiveFrom: { lt: cursor.effectiveFrom } },
          { effectiveFrom: cursor.effectiveFrom, id: { lt: cursor.id } },
        ],
      };
    }
    const summaryWhere: Prisma.PaketWhereInput = {
      AND: (baseWhere.AND as Prisma.PaketWhereInput[]).filter(
        (item) => item !== stateWhere && !('status' in item),
      ),
    };
    const scopedItems = await this.db.paket.findMany({
      where: summaryWhere,
      select: { status: true, effectiveFrom: true, effectiveUntil: true },
    });
    const items = await this.db.paket.findMany({
      where: { AND: [baseWhere, cursorWhere] },
      orderBy: [{ effectiveFrom: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        branchScopes: {
          where: { active: true },
          include: { branch: { select: { id: true, code: true, name: true } } },
        },
        classTypeScopes: {
          where: { active: true },
          include: { classType: { select: { id: true, code: true, name: true } } },
        },
        revisions: { orderBy: { revisionNumber: 'desc' }, take: 1 },
        promotions: {
          where: {
            status: 'ACTIVE',
            activeFrom: { lte: now },
            activeUntil: { gt: now },
          },
          select: { id: true },
          take: 1,
        },
        _count: { select: { purchases: true, customerPackages: true } },
      },
    });
    const hasMore = items.length > limit;
    const page = items.slice(0, limit);
    return {
      items: page.map(({ promotions, ...item }) => ({
        ...item,
        effectiveState: this.effectiveState(item),
        livePromotion: promotions.length > 0,
      })),
      summary: scopedItems.reduce<Record<string, number>>((result, item) => {
        const state = this.effectiveState(item);
        result[state] = (result[state] ?? 0) + 1;
        return result;
      }, {}),
      page: { hasMore, nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null },
    };
  }

  async create(
    principal: SessionPrincipal,
    input: any,
    key: string,
    correlationId: string,
  ): Promise<Paket> {
    this.access.catalog(principal, true);
    const branchIds = [
      ...new Set<string>(input.branchIds ?? (input.branchId ? [input.branchId] : [])),
    ];
    const classTypeIds = [
      ...new Set<string>(input.classTypeIds ?? (input.classTypeId ? [input.classTypeId] : [])),
    ];
    for (const branchId of branchIds) this.access.scope(principal, branchId, ['master:manage']);
    if (!key || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (
      !input.name ||
      branchIds.length === 0 ||
      classTypeIds.length === 0 ||
      !Number.isInteger(input.sessionCount) ||
      input.sessionCount < 1 ||
      !Number.isInteger(input.durationDays) ||
      input.durationDays < 1 ||
      !Number.isInteger(input.priceRp) ||
      input.priceRp < 1 ||
      !input.effectiveFrom
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (input.effectiveUntil && input.effectiveUntil <= input.effectiveFrom)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const businessKey = String(input.businessKey ?? input.name)
      .trim()
      .toUpperCase();
    const effectiveFrom = new Date(input.effectiveFrom);
    const effectiveUntil = input.effectiveUntil ? new Date(input.effectiveUntil) : null;
    try {
      const result = await this.idempotency.execute(
        {
          scope: `package-create:${principal.userId}`,
          key,
          payload: input,
          ttlMs: 86_400_000,
          leaseMs: 30_000,
        },
        async (tx) => {
          const [branchCount, classTypeCount, availabilityCount] = await Promise.all([
            tx.cabang.count({ where: { id: { in: branchIds }, active: true } }),
            tx.jenisKelas.count({ where: { id: { in: classTypeIds }, active: true } }),
            tx.cakupanCabangJenisKelas.count({
              where: {
                branchId: { in: branchIds },
                classTypeId: { in: classTypeIds },
                active: true,
              },
            }),
          ]);
          if (
            branchCount !== branchIds.length ||
            classTypeCount !== classTypeIds.length ||
            availabilityCount !== branchIds.length * classTypeIds.length
          )
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          const overlap = await tx.paket.findFirst({
            where: {
              businessKey,
            },
          });
          if (overlap) throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          const result = await tx.paket.create({
            data: {
              id: newId(),
              branchId: branchIds[0]!,
              classTypeId: classTypeIds[0]!,
              businessKey,
              name: input.name.trim(),
              sessionCount: input.sessionCount,
              durationDays: input.durationDays,
              priceRp: input.priceRp,
              effectiveFrom,
              effectiveUntil,
              revisions: {
                create: {
                  id: newId(),
                  revisionNumber: 1,
                  sessionCount: input.sessionCount,
                  durationDays: input.durationDays,
                  priceRp: input.priceRp,
                  effectiveFrom,
                  effectiveUntil,
                },
              },
              branchScopes: {
                create: branchIds.map((branchId) => ({ id: newId(), branchId })),
              },
              classTypeScopes: {
                create: classTypeIds.map((classTypeId) => ({ id: newId(), classTypeId })),
              },
            },
          });
          await this.access.audit(
            tx,
            principal,
            'PACKAGE_CREATED',
            'Package',
            result.id,
            branchIds[0]!,
            correlationId,
          );
          return { status: 201, body: result as unknown as Prisma.InputJsonValue };
        },
      );
      return result.body as unknown as Paket;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P2002', 'P2004', 'P2010'].includes(error.code)
      )
        throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }

  private async packageForManage(principal: SessionPrincipal, id: string) {
    this.access.catalog(principal, true);
    const item = await this.db.paket.findUnique({
      where: { id },
      include: {
        branchScopes: { where: { active: true } },
        classTypeScopes: { where: { active: true } },
        revisions: { orderBy: { revisionNumber: 'desc' }, take: 1 },
        _count: { select: { purchases: true, customerPackages: true } },
      },
    });
    if (!item) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    for (const scope of item.branchScopes)
      this.access.scope(principal, scope.branchId, ['master:manage']);
    return item;
  }

  private primaryBranchId(item: { branchScopes: { branchId: string }[] }) {
    const branchId = item.branchScopes[0]?.branchId;
    if (!branchId) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return branchId;
  }

  async update(
    principal: SessionPrincipal,
    id: string,
    input: any,
    key: string,
    correlationId: string,
  ): Promise<Paket> {
    const current = await this.packageForManage(principal, id);
    if (!key || !Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const commercialChange = [
      'sessionCount',
      'durationDays',
      'priceRp',
      'effectiveFrom',
      'effectiveUntil',
    ].some((field) => input[field] !== undefined);
    const referenced = current._count.purchases > 0 || current._count.customerPackages > 0;
    if (commercialChange && (referenced || current.effectiveFrom <= new Date()))
      throw new ApiProblem('PACKAGE_REVISION_REQUIRED', HttpStatus.CONFLICT);
    const result = await this.idempotency.execute(
      {
        scope: `package-update:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const changed = await tx.paket.updateMany({
          where: { id, version: input.expectedVersion },
          data: {
            name: input.name?.trim() || undefined,
            sessionCount: input.sessionCount,
            durationDays: input.durationDays,
            priceRp: input.priceRp,
            effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : undefined,
            effectiveUntil:
              input.effectiveUntil === undefined
                ? undefined
                : input.effectiveUntil
                  ? new Date(input.effectiveUntil)
                  : null,
            version: { increment: 1 },
          },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        if (commercialChange && current.revisions[0]) {
          await tx.revisiPaket.update({
            where: { id: current.revisions[0].id },
            data: {
              sessionCount: input.sessionCount,
              durationDays: input.durationDays,
              priceRp: input.priceRp,
              effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : undefined,
              effectiveUntil:
                input.effectiveUntil === undefined
                  ? undefined
                  : input.effectiveUntil
                    ? new Date(input.effectiveUntil)
                    : null,
            },
          });
        }
        const updated = await tx.paket.findUniqueOrThrow({ where: { id } });
        await this.access.audit(
          tx,
          principal,
          'PACKAGE_UPDATED',
          'Package',
          id,
          this.primaryBranchId(current),
          correlationId,
          { reasonPresent: true },
        );
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as Paket;
  }

  async revise(
    principal: SessionPrincipal,
    id: string,
    input: any,
    key: string,
    correlationId: string,
  ): Promise<Paket> {
    const current = await this.packageForManage(principal, id);
    if (!key || !Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const effectiveFrom = new Date(input.effectiveFrom);
    const effectiveUntil = input.effectiveUntil ? new Date(input.effectiveUntil) : null;
    if (
      !Number.isFinite(effectiveFrom.getTime()) ||
      effectiveFrom <= current.effectiveFrom ||
      (effectiveUntil && effectiveUntil <= effectiveFrom) ||
      !Number.isInteger(input.sessionCount) ||
      input.sessionCount < 1 ||
      !Number.isInteger(input.durationDays) ||
      input.durationDays < 1 ||
      !Number.isInteger(input.priceRp) ||
      input.priceRp < 1
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const result = await this.idempotency.execute(
      {
        scope: `package-revision:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM \`Paket\` WHERE id = ${id} FOR UPDATE`;
        const changed = await tx.paket.updateMany({
          where: { id, version: input.expectedVersion },
          data: {
            effectiveUntil:
              !current.effectiveUntil || current.effectiveUntil > effectiveFrom
                ? effectiveFrom
                : current.effectiveUntil,
            version: { increment: 1 },
          },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const latestRevision = current.revisions[0];
        if (latestRevision) {
          await tx.revisiPaket.update({
            where: { id: latestRevision.id },
            data: {
              effectiveUntil:
                !latestRevision.effectiveUntil || latestRevision.effectiveUntil > effectiveFrom
                  ? effectiveFrom
                  : latestRevision.effectiveUntil,
            },
          });
        }
        const revision = await tx.revisiPaket.create({
          data: {
            id: newId(),
            packageId: id,
            revisionNumber: (latestRevision?.revisionNumber ?? 0) + 1,
            sessionCount: input.sessionCount,
            durationDays: input.durationDays,
            priceRp: input.priceRp,
            effectiveFrom,
            effectiveUntil,
          },
        });
        const updated = await tx.paket.update({
          where: { id },
          data: {
            name: input.name?.trim() || current.name,
            sessionCount: input.sessionCount,
            durationDays: input.durationDays,
            priceRp: input.priceRp,
            effectiveFrom,
            effectiveUntil,
          },
        });
        await this.access.audit(
          tx,
          principal,
          'PACKAGE_REVISION_CREATED',
          'Package',
          id,
          this.primaryBranchId(current),
          correlationId,
          { revisionId: revision.id, revisionNumber: revision.revisionNumber, reasonPresent: true },
        );
        return { status: 201, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as Paket;
  }

  async replaceScopes(
    principal: SessionPrincipal,
    id: string,
    input: { branchIds: string[]; classTypeIds: string[]; expectedVersion: number; reason: string },
    key: string,
    correlationId: string,
  ): Promise<Paket> {
    await this.packageForManage(principal, id);
    const branchIds = [...new Set(input.branchIds ?? [])];
    const classTypeIds = [...new Set(input.classTypeIds ?? [])];
    if (
      !key ||
      !Number.isInteger(input.expectedVersion) ||
      input.reason?.trim().length < 3 ||
      branchIds.length === 0 ||
      classTypeIds.length === 0
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    for (const branchId of branchIds) this.access.scope(principal, branchId, ['master:manage']);
    const result = await this.idempotency.execute(
      {
        scope: `package-scopes:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const [branchCount, classTypeCount, availabilityCount] = await Promise.all([
          tx.cabang.count({ where: { id: { in: branchIds }, active: true } }),
          tx.jenisKelas.count({ where: { id: { in: classTypeIds }, active: true } }),
          tx.cakupanCabangJenisKelas.count({
            where: {
              branchId: { in: branchIds },
              classTypeId: { in: classTypeIds },
              active: true,
            },
          }),
        ]);
        if (
          branchCount !== branchIds.length ||
          classTypeCount !== classTypeIds.length ||
          availabilityCount !== branchIds.length * classTypeIds.length
        )
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        const changed = await tx.paket.updateMany({
          where: { id, version: input.expectedVersion },
          data: {
            branchId: branchIds[0]!,
            classTypeId: classTypeIds[0]!,
            version: { increment: 1 },
          },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        await Promise.all([
          tx.cakupanCabangPaket.updateMany({
            where: { packageId: id, branchId: { notIn: branchIds } },
            data: { active: false },
          }),
          tx.cakupanJenisKelasPaket.updateMany({
            where: { packageId: id, classTypeId: { notIn: classTypeIds } },
            data: { active: false },
          }),
          ...branchIds.map((branchId) =>
            tx.cakupanCabangPaket.upsert({
              where: { packageId_branchId: { packageId: id, branchId } },
              create: { id: newId(), packageId: id, branchId },
              update: { active: true, historical: false, sourceDeletedAt: null },
            }),
          ),
          ...classTypeIds.map((classTypeId) =>
            tx.cakupanJenisKelasPaket.upsert({
              where: { packageId_classTypeId: { packageId: id, classTypeId } },
              create: { id: newId(), packageId: id, classTypeId },
              update: { active: true, historical: false, sourceDeletedAt: null },
            }),
          ),
        ]);
        const updated = await tx.paket.findUniqueOrThrow({ where: { id } });
        await this.access.audit(
          tx,
          principal,
          'PACKAGE_SCOPES_REPLACED',
          'Package',
          id,
          branchIds[0]!,
          correlationId,
          {
            branchCount: branchIds.length,
            classTypeCount: classTypeIds.length,
            reasonPresent: true,
          },
        );
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as Paket;
  }

  async transition(
    principal: SessionPrincipal,
    id: string,
    status: PackageStatus,
    input: { expectedVersion: number; reason: string },
    key: string,
    correlationId: string,
  ): Promise<Paket> {
    const current = await this.packageForManage(principal, id);
    if (!key || !Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    const activeBranchIds = current.branchScopes.map((scope) => scope.branchId);
    const activeClassTypeIds = current.classTypeScopes.map((scope) => scope.classTypeId);
    if (activeBranchIds.length === 0 || activeClassTypeIds.length === 0)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const result = await this.idempotency.execute(
      {
        scope: `package-transition:${id}`,
        key,
        payload: { status, ...input },
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        if (status === 'ACTIVE') {
          const overlap = await tx.paket.findFirst({
            where: {
              id: { not: id },
              status: 'ACTIVE',
              businessKey: current.businessKey,
              effectiveFrom: current.effectiveUntil ? { lt: current.effectiveUntil } : undefined,
              OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: current.effectiveFrom } }],
              AND: [
                {
                  branchScopes: {
                    some: {
                      branchId: { in: activeBranchIds },
                      active: true,
                    },
                  },
                },
                {
                  classTypeScopes: {
                    some: {
                      classTypeId: { in: activeClassTypeIds },
                      active: true,
                    },
                  },
                },
              ],
            },
          });
          if (overlap) throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);
        }
        const changed = await tx.paket.updateMany({
          where: { id, version: input.expectedVersion },
          data: { status, version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const updated = await tx.paket.findUniqueOrThrow({ where: { id } });
        await this.access.audit(
          tx,
          principal,
          status === 'ACTIVE' ? 'PACKAGE_REACTIVATED' : 'PACKAGE_DEACTIVATED',
          'Package',
          id,
          this.primaryBranchId(current),
          correlationId,
          { reasonPresent: true },
        );
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as Paket;
  }

  // --- Indonesian Domain Aliases ---
  async daftarPaket(
    principal: SessionPrincipal,
    options: Parameters<PackageCatalogService['list']>[1],
  ) {
    return this.list(principal, options);
  }

  async buatPaket(
    principal: SessionPrincipal,
    input: Parameters<PackageCatalogService['create']>[1],
    key: string,
    correlationId: string,
  ) {
    return this.create(principal, input, key, correlationId);
  }

  async perbaruiPaket(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<PackageCatalogService['update']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.update(principal, id, input, key, correlationId);
  }

  async revisiPaket(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<PackageCatalogService['revise']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.revise(principal, id, input, key, correlationId);
  }

  async perbaruiCakupanPaket(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<PackageCatalogService['replaceScopes']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.replaceScopes(principal, id, input, key, correlationId);
  }

  async ubahStatusPaket(
    principal: SessionPrincipal,
    id: string,
    status: Parameters<PackageCatalogService['transition']>[2],
    input: Parameters<PackageCatalogService['transition']>[3],
    key: string,
    correlationId: string,
  ) {
    return this.transition(principal, id, status, input, key, correlationId);
  }
}
