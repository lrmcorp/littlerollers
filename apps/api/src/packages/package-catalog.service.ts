import { HttpStatus, Injectable } from '@nestjs/common';
import { PackageStatus, Prisma, type Package } from '@prisma/client';
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
    } = {},
  ) {
    this.access.catalog(principal);
    const customer =
      principal.roles.some(({ role }) => role === 'CUSTOMER') &&
      !principal.capabilities.includes('branch:all') &&
      !principal.capabilities.includes('branch:operate') &&
      !principal.capabilities.includes('branch:manage');
    if (query.branchId && !customer) this.access.scope(principal, query.branchId, ['package:read']);
    if (query.branchId && customer) {
      const branch = await this.db.branch.findUnique({ where: { id: query.branchId } });
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
    const stateWhere: Prisma.PackageWhereInput =
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
    const baseWhere: Prisma.PackageWhereInput = {
      AND: [
        query.branchId
          ? { branchId: query.branchId }
          : customer
            ? {}
            : scope.all
              ? scope.excluded.length
                ? { branchId: { notIn: scope.excluded } }
                : {}
              : { branchId: { in: scope.included } },
        query.classTypeId ? { classTypeId: query.classTypeId } : {},
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
    let cursorWhere: Prisma.PackageWhereInput = {};
    if (query.cursor) {
      const cursor = await this.db.package.findFirst({
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
    const summaryWhere: Prisma.PackageWhereInput = {
      AND: (baseWhere.AND as Prisma.PackageWhereInput[]).filter(
        (item) => item !== stateWhere && !('status' in item),
      ),
    };
    const scopedItems = await this.db.package.findMany({
      where: summaryWhere,
      select: { status: true, effectiveFrom: true, effectiveUntil: true },
    });
    const items = await this.db.package.findMany({
      where: { AND: [baseWhere, cursorWhere] },
      orderBy: [{ effectiveFrom: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        branch: { select: { id: true, code: true, name: true } },
        classType: { select: { id: true, code: true, name: true } },
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
  ): Promise<Package> {
    this.access.catalog(principal, true);
    this.access.scope(principal, input.branchId, ['master:manage']);
    if (!key || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (
      !input.name ||
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
          await tx.$queryRaw`
            SELECT \`id\`
            FROM \`ClassType\`
            WHERE \`id\` = ${input.classTypeId}
            FOR UPDATE
          `;
          const [branch, classType] = await Promise.all([
            tx.branch.findUnique({ where: { id: input.branchId } }),
            tx.classType.findUnique({ where: { id: input.classTypeId } }),
          ]);
          if (!branch?.active || !classType?.active || classType.branchId !== input.branchId)
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          const overlap = await tx.package.findFirst({
            where: {
              branchId: input.branchId,
              classTypeId: input.classTypeId,
              businessKey,
              effectiveFrom: effectiveUntil ? { lt: effectiveUntil } : undefined,
              OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: effectiveFrom } }],
            },
          });
          if (overlap) throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          const result = await tx.package.create({
            data: {
              id: newId(),
              branchId: input.branchId,
              classTypeId: input.classTypeId,
              businessKey,
              name: input.name.trim(),
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
            'PACKAGE_CREATED',
            'Package',
            result.id,
            result.branchId,
            correlationId,
          );
          return { status: 201, body: result as unknown as Prisma.InputJsonValue };
        },
      );
      return result.body as unknown as Package;
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
    const item = await this.db.package.findUnique({
      where: { id },
      include: { _count: { select: { purchases: true, customerPackages: true } } },
    });
    if (!item) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.access.scope(principal, item.branchId, ['master:manage']);
    return item;
  }

  async update(
    principal: SessionPrincipal,
    id: string,
    input: any,
    key: string,
    correlationId: string,
  ): Promise<Package> {
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
        const changed = await tx.package.updateMany({
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
        const updated = await tx.package.findUniqueOrThrow({ where: { id } });
        await this.access.audit(
          tx,
          principal,
          'PACKAGE_UPDATED',
          'Package',
          id,
          current.branchId,
          correlationId,
          { reasonPresent: true },
        );
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as Package;
  }

  async revise(
    principal: SessionPrincipal,
    id: string,
    input: any,
    key: string,
    correlationId: string,
  ): Promise<Package> {
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
        await tx.$queryRaw`SELECT id FROM Package WHERE id = ${id} FOR UPDATE`;
        const changed = await tx.package.updateMany({
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
        const overlap = await tx.package.findFirst({
          where: {
            id: { not: id },
            branchId: current.branchId,
            classTypeId: current.classTypeId,
            businessKey: current.businessKey,
            effectiveFrom: effectiveUntil ? { lt: effectiveUntil } : undefined,
            OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: effectiveFrom } }],
          },
        });
        if (overlap) throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);
        const revision = await tx.package.create({
          data: {
            id: newId(),
            branchId: current.branchId,
            classTypeId: current.classTypeId,
            businessKey: current.businessKey,
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
          revision.id,
          current.branchId,
          correlationId,
          { previousPackageId: id, reasonPresent: true },
        );
        return { status: 201, body: revision as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as Package;
  }

  async transition(
    principal: SessionPrincipal,
    id: string,
    status: PackageStatus,
    input: { expectedVersion: number; reason: string },
    key: string,
    correlationId: string,
  ): Promise<Package> {
    const current = await this.packageForManage(principal, id);
    if (!key || !Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
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
          const overlap = await tx.package.findFirst({
            where: {
              id: { not: id },
              status: 'ACTIVE',
              branchId: current.branchId,
              classTypeId: current.classTypeId,
              businessKey: current.businessKey,
              effectiveFrom: current.effectiveUntil ? { lt: current.effectiveUntil } : undefined,
              OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: current.effectiveFrom } }],
            },
          });
          if (overlap) throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);
        }
        const changed = await tx.package.updateMany({
          where: { id, version: input.expectedVersion },
          data: { status, version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const updated = await tx.package.findUniqueOrThrow({ where: { id } });
        await this.access.audit(
          tx,
          principal,
          status === 'ACTIVE' ? 'PACKAGE_REACTIVATED' : 'PACKAGE_DEACTIVATED',
          'Package',
          id,
          current.branchId,
          correlationId,
          { reasonPresent: true },
        );
        return { status: 200, body: updated as unknown as Prisma.InputJsonValue };
      },
    );
    return result.body as unknown as Package;
  }
}
