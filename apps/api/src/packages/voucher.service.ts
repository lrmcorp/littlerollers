import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, VoucherStatus, type VoucherDiscountType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { PackageAccessService } from './package-access.service';
import { PackagePricingService } from './kalkulasi-harga-paket.service';

export const normalizeVoucherCode = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toUpperCase();

export function calculateVoucherDiscount(input: {
  priceRp: number;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountRp?: number | null;
}) {
  const raw =
    input.discountType === 'PERCENTAGE'
      ? Math.floor((input.priceRp * input.discountValue) / 100)
      : input.discountValue;
  return Math.min(raw, input.maxDiscountRp ?? raw, input.priceRp);
}

type VoucherInput = {
  code: string;
  name: string;
  description?: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountRp?: number | null;
  minimumPurchaseRp?: number;
  activeFrom: string;
  activeUntil?: string | null;
  totalUsageLimit?: number | null;
  perCustomerUsageLimit?: number | null;
  branchId?: string | null;
  classTypeId?: string | null;
  packageIds?: string[];
  reason?: string;
};

@Injectable()
export class VoucherService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: PackageAccessService,
    private readonly idempotency: IdempotencyService,
    private readonly pricing: PackagePricingService,
  ) {}

  private requireRead(principal: SessionPrincipal) {
    if (
      !principal.capabilities.includes('voucher:read') &&
      !principal.capabilities.includes('voucher:manage')
    )
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  private requireManage(principal: SessionPrincipal, branchId?: string | null) {
    if (!principal.capabilities.includes('voucher:manage'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    if (branchId) this.access.scope(principal, branchId, ['voucher:manage']);
  }

  private parseDate(value: unknown, required = true) {
    if (!value && !required) return null;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime()))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return date;
  }

  private validateInput(input: VoucherInput, partial = false) {
    const code = normalizeVoucherCode(input.code);
    if (!partial && (!code || !/^[A-Z0-9][A-Z0-9_-]{2,63}$/u.test(code)))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (!partial && !input.name?.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (
      input.discountType &&
      !(['PERCENTAGE', 'FIXED_AMOUNT'] as string[]).includes(input.discountType)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (
      input.discountValue !== undefined &&
      (!Number.isInteger(input.discountValue) || input.discountValue < 1)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (
      input.discountType === 'PERCENTAGE' &&
      input.discountValue !== undefined &&
      input.discountValue > 100
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    for (const value of [
      input.minimumPurchaseRp,
      input.maxDiscountRp,
      input.totalUsageLimit,
      input.perCustomerUsageLimit,
    ]) {
      if (value !== undefined && value !== null && (!Number.isInteger(value) || value < 0))
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }
    const from = input.activeFrom ? this.parseDate(input.activeFrom) : undefined;
    const until = input.activeUntil ? this.parseDate(input.activeUntil, false) : undefined;
    if (from && until && from >= until)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return { code, from, until };
  }

  private async ensureScope(
    principal: SessionPrincipal,
    branchId: string | null | undefined,
    packageIds: string[] = [],
    classTypeId?: string | null,
  ) {
    if (branchId) this.access.scope(principal, branchId, ['voucher:manage']);
    if (packageIds.length) {
      const packages = await this.db.paket.findMany({
        where: { id: { in: packageIds } },
        select: {
          id: true,
          branchScopes: { where: { active: true }, select: { branchId: true } },
        },
      });
      if (
        packages.length !== packageIds.length ||
        (branchId &&
          packages.some((item) => !item.branchScopes.some((scope) => scope.branchId === branchId)))
      )
        throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
      for (const item of packages)
        for (const scope of item.branchScopes)
          this.access.scope(principal, scope.branchId, ['voucher:manage']);
    }
    if (classTypeId) {
      const classType = await this.db.jenisKelas.findUnique({
        where: { id: classTypeId },
        select: { branchScopes: { where: { active: true }, select: { branchId: true } } },
      });
      if (
        !classType ||
        (branchId && !classType.branchScopes.some((scope) => scope.branchId === branchId))
      )
        throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
      if (!branchId)
        for (const scope of classType.branchScopes)
          this.access.scope(principal, scope.branchId, ['voucher:manage']);
    }
  }

  private view(voucher: any) {
    return {
      id: voucher.id,
      code: voucher.code,
      name: voucher.name,
      description: voucher.description,
      status: voucher.status,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      maxDiscountRp: voucher.maxDiscountRp,
      minimumPurchaseRp: voucher.minimumPurchaseRp,
      activeFrom: voucher.activeFrom,
      activeUntil: voucher.activeUntil,
      totalUsageLimit: voucher.totalUsageLimit,
      perCustomerUsageLimit: voucher.perCustomerUsageLimit,
      redeemedCount: voucher._count?.redemptions ?? voucher.redemptions?.length ?? 0,
      branch: voucher.branch ? { id: voucher.branch.id, name: voucher.branch.name } : null,
      classType: voucher.classType
        ? { id: voucher.classType.id, name: voucher.classType.name }
        : null,
      packageIds: voucher.packages?.map((item: any) => item.packageId) ?? [],
      packages:
        voucher.packages?.map((item: any) => ({
          id: item.packageId,
          name: item.package?.name ?? item.packageId,
        })) ?? [],
      version: voucher.version,
      createdAt: voucher.createdAt,
      updatedAt: voucher.updatedAt,
    };
  }

  async list(
    principal: SessionPrincipal,
    query: {
      q?: string;
      status?: string;
      branchId?: string;
      cursor?: string;
      limit?: string;
      from?: string;
      until?: string;
      includeHistorical?: boolean;
    } = {},
  ) {
    this.requireRead(principal);
    if (query.includeHistorical && !principal.capabilities.includes('migration:read'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    if (query.branchId) this.access.scope(principal, query.branchId, ['voucher:read']);
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 20)));
    if (!Number.isInteger(limit)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const scope = this.access.branchScope(principal, 'voucher:read');
    const q = query.q?.trim();
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
    if ((query.from && !dateOnly.test(query.from)) || (query.until && !dateOnly.test(query.until)))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const from = query.from ? new Date(`${query.from}T00:00:00.000Z`) : undefined;
    const until = query.until ? new Date(`${query.until}T23:59:59.999Z`) : undefined;
    if (from && until && from > until)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (query.status && !Object.values(VoucherStatus).includes(query.status as VoucherStatus))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const scopeWhere: Prisma.VoucherWhereInput = {
      AND: [
        ...(query.includeHistorical ? [] : [{ historical: false }]),
        ...(q
          ? [{ OR: [{ code: { contains: q.toUpperCase() } }, { name: { contains: q } }] }]
          : []),
        ...(query.branchId
          ? [{ branchId: query.branchId }]
          : scope.all
            ? []
            : [{ OR: [{ branchId: { in: scope.included } }, { branchId: null }] }]),
        ...(until || from
          ? [
              {
                activeFrom: until ? { lte: until } : undefined,
                activeUntil: from ? { gt: from } : undefined,
              },
            ]
          : []),
      ],
    };
    const baseWhere: Prisma.VoucherWhereInput = {
      ...scopeWhere,
      ...(query.status ? { status: query.status as VoucherStatus } : {}),
    };
    let cursorWhere: Prisma.VoucherWhereInput = {};
    if (query.cursor) {
      const cursor = await this.db.voucher.findFirst({
        where: { id: query.cursor, ...baseWhere },
        select: { id: true, createdAt: true },
      });
      if (!cursor) throw new ApiProblem('INVALID_CURSOR', HttpStatus.BAD_REQUEST);
      cursorWhere = {
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          { createdAt: cursor.createdAt, id: { lt: cursor.id } },
        ],
      };
    }
    const where: Prisma.VoucherWhereInput = { AND: [baseWhere, cursorWhere] };
    const summaryRows = await this.db.voucher.groupBy({
      by: ['status'],
      where: scopeWhere,
      _count: { _all: true },
    });
    const items = await this.db.voucher.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        branch: { select: { id: true, name: true } },
        classType: { select: { id: true, name: true } },
        packages: { select: { packageId: true, package: { select: { name: true } } } },
        _count: { select: { redemptions: true } },
      },
    });
    const hasMore = items.length > limit;
    const page = items.slice(0, limit);
    return {
      items: page.map((item) => this.view(item)),
      summary: Object.fromEntries(summaryRows.map((row) => [row.status, row._count._all])),
      page: { hasMore, nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null },
    };
  }

  async detail(principal: SessionPrincipal, id: string) {
    this.requireRead(principal);
    const [voucher, auditActivity] = await Promise.all([
      this.db.voucher.findUnique({
        where: { id },
        include: {
          branch: { select: { id: true, name: true } },
          classType: { select: { id: true, name: true } },
          packages: { select: { packageId: true, package: { select: { name: true } } } },
          _count: { select: { redemptions: true } },
        },
      }),
      this.db.auditLog.findMany({
        where: { objectType: 'Voucher', objectId: id },
        orderBy: { occurredAt: 'desc' },
        take: 20,
        select: { id: true, action: true, occurredAt: true },
      }),
    ]);
    if (!voucher) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (voucher.branchId) this.access.scope(principal, voucher.branchId, ['voucher:read']);
    return { ...this.view(voucher), auditActivity };
  }

  async create(
    principal: SessionPrincipal,
    input: VoucherInput,
    key: string,
    correlationId: string,
  ) {
    this.requireManage(principal, input.branchId);
    if (!key || (input.reason?.trim().length ?? 0) < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const parsed = this.validateInput(input);
    await this.ensureScope(principal, input.branchId, input.packageIds, input.classTypeId);
    const result = await this.idempotency.execute(
      {
        scope: `voucher-create:${principal.userId}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const created = await tx.voucher.create({
          data: {
            id: newId(),
            code: parsed.code,
            name: input.name.trim(),
            description: input.description?.trim() || null,
            discountType: input.discountType,
            discountValue: input.discountValue,
            maxDiscountRp: input.maxDiscountRp ?? null,
            minimumPurchaseRp: input.minimumPurchaseRp ?? 0,
            activeFrom: parsed.from!,
            activeUntil: parsed.until,
            totalUsageLimit: input.totalUsageLimit ?? null,
            perCustomerUsageLimit: input.perCustomerUsageLimit ?? null,
            branchId: input.branchId ?? null,
            classTypeId: input.classTypeId ?? null,
            createdById: principal.userId,
            packages: input.packageIds?.length
              ? { create: input.packageIds.map((packageId) => ({ id: newId(), packageId })) }
              : undefined,
          },
          include: { packages: true },
        });
        await tx.auditLog.create({
          data: {
            id: newId(),
            actorType: 'USER',
            actorId: principal.userId,
            branchId: input.branchId ?? null,
            action: 'voucher.created',
            objectType: 'Voucher',
            objectId: created.id,
            correlationId,
            afterMasked: { code: created.code, status: created.status, reasonPresent: true },
          },
        });
        return { status: 201, body: this.view(created) as Prisma.InputJsonValue };
      },
    );
    return result.body;
  }

  async update(
    principal: SessionPrincipal,
    id: string,
    input: Partial<VoucherInput> & {
      expectedVersion: number;
      reason: string;
    },
    key: string,
    correlationId: string,
  ) {
    this.requireManage(principal);
    if (!key || !Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const current = await this.db.voucher.findUnique({
      where: { id },
      include: { packages: { select: { packageId: true } } },
    });
    if (!current) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.requireManage(principal, current.branchId);
    const merged: VoucherInput = {
      code: input.code ?? current.code,
      name: input.name ?? current.name,
      description: input.description ?? current.description ?? undefined,
      discountType: input.discountType ?? current.discountType,
      discountValue: input.discountValue ?? current.discountValue,
      maxDiscountRp:
        input.maxDiscountRp === undefined ? current.maxDiscountRp : input.maxDiscountRp,
      minimumPurchaseRp: input.minimumPurchaseRp ?? current.minimumPurchaseRp,
      activeFrom: input.activeFrom ?? current.activeFrom.toISOString(),
      activeUntil:
        input.activeUntil === undefined ? current.activeUntil?.toISOString() : input.activeUntil,
      totalUsageLimit:
        input.totalUsageLimit === undefined ? current.totalUsageLimit : input.totalUsageLimit,
      perCustomerUsageLimit:
        input.perCustomerUsageLimit === undefined
          ? current.perCustomerUsageLimit
          : input.perCustomerUsageLimit,
      branchId: input.branchId === undefined ? current.branchId : input.branchId,
      classTypeId: input.classTypeId === undefined ? current.classTypeId : input.classTypeId,
      packageIds: input.packageIds ?? current.packages.map((item) => item.packageId),
    };
    const parsed = this.validateInput(merged);
    await this.ensureScope(principal, merged.branchId, merged.packageIds, merged.classTypeId);
    const result = await this.idempotency.execute(
      {
        scope: `voucher-update:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const changed = await tx.voucher.updateMany({
          where: { id, version: input.expectedVersion },
          data: {
            code: parsed.code,
            name: merged.name.trim(),
            description: merged.description?.trim() || null,
            discountType: merged.discountType,
            discountValue: merged.discountValue,
            maxDiscountRp: merged.maxDiscountRp ?? null,
            minimumPurchaseRp: merged.minimumPurchaseRp ?? 0,
            activeFrom: parsed.from!,
            activeUntil: parsed.until,
            totalUsageLimit: merged.totalUsageLimit ?? null,
            perCustomerUsageLimit: merged.perCustomerUsageLimit ?? null,
            branchId: merged.branchId ?? null,
            classTypeId: merged.classTypeId ?? null,
            version: { increment: 1 },
          },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        await tx.cakupanPaketVoucher.deleteMany({ where: { voucherId: id } });
        if (merged.packageIds?.length)
          await tx.cakupanPaketVoucher.createMany({
            data: merged.packageIds.map((packageId) => ({
              id: newId(),
              voucherId: id,
              packageId,
            })),
          });
        await tx.auditLog.create({
          data: {
            id: newId(),
            actorType: 'USER',
            actorId: principal.userId,
            branchId: merged.branchId ?? null,
            action: 'voucher.updated',
            objectType: 'Voucher',
            objectId: id,
            correlationId,
            afterMasked: { code: parsed.code, reasonPresent: true },
          },
        });
        const updated = await tx.voucher.findUniqueOrThrow({
          where: { id },
          include: {
            branch: { select: { id: true, name: true } },
            classType: { select: { id: true, name: true } },
            packages: { select: { packageId: true, package: { select: { name: true } } } },
            _count: { select: { redemptions: true } },
          },
        });
        return { status: 200, body: this.view(updated) as Prisma.InputJsonValue };
      },
    );
    return result.body;
  }

  async transition(
    principal: SessionPrincipal,
    id: string,
    status: VoucherStatus,
    input: { expectedVersion: number; reason: string },
    key: string,
    correlationId: string,
  ) {
    this.requireManage(principal);
    if (!key || !Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const result = await this.idempotency.execute(
      {
        scope: `voucher-transition:${id}`,
        key,
        payload: { status, ...input },
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const current = await tx.voucher.findUnique({ where: { id } });
        if (!current) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.requireManage(principal, current.branchId);
        if (current.status === 'ARCHIVED')
          throw new ApiProblem('VOUCHER_ARCHIVED', HttpStatus.CONFLICT);
        if (status === 'PAUSED' && current.status !== 'ACTIVE')
          throw new ApiProblem('VOUCHER_INVALID_STATUS', HttpStatus.CONFLICT);
        if (status === 'ACTIVE') {
          const now = new Date();
          if (
            current.status === 'EXPIRED' ||
            current.status === 'EXHAUSTED' ||
            (current.activeUntil && current.activeUntil <= now)
          )
            throw new ApiProblem('VOUCHER_INVALID_STATUS', HttpStatus.CONFLICT);
          const claimed = await tx.penukaranVoucher.count({
            where: { voucherId: id, releasedAt: null },
          });
          if (current.totalUsageLimit !== null && claimed >= current.totalUsageLimit)
            throw new ApiProblem('VOUCHER_EXHAUSTED', HttpStatus.CONFLICT);
        }
        const updated = await tx.voucher.updateMany({
          where: { id, version: input.expectedVersion },
          data: { status, version: { increment: 1 } },
        });
        if (updated.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        await tx.auditLog.create({
          data: {
            id: newId(),
            actorType: 'USER',
            actorId: principal.userId,
            branchId: current.branchId,
            action: `voucher.${status.toLowerCase()}`,
            objectType: 'Voucher',
            objectId: id,
            correlationId,
            afterMasked: { status, reasonPresent: true },
          },
        });
        return {
          status: 200,
          body: this.view({
            ...current,
            status,
            version: current.version + 1,
          }) as Prisma.InputJsonValue,
        };
      },
    );
    return result.body;
  }

  async redemptions(principal: SessionPrincipal, id: string, cursor?: string, rawLimit?: string) {
    const voucher = await this.detail(principal, id);
    const limit = Math.min(50, Math.max(1, Number(rawLimit ?? 20)));
    if (!Number.isInteger(limit)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const rows = await this.db.penukaranVoucher.findMany({
      where: { voucherId: id },
      orderBy: [{ redeemedAt: 'desc' }, { id: 'desc' }],
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      include: {
        customer: { select: { displayName: true } },
        purchase: {
          select: {
            id: true,
            status: true,
            branch: { select: { id: true, name: true } },
            package: { select: { name: true } },
          },
        },
      },
    });
    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit);
    return {
      voucher: { id: voucher.id, code: voucher.code },
      items: page.map((row) => ({
        id: row.id,
        customer: { displayName: row.customer.displayName },
        purchase: row.purchase,
        discountRp: row.discountRp,
        redeemedAt: row.redeemedAt,
        releasedAt: row.releasedAt,
      })),
      page: { hasMore, nextCursor: hasMore ? page.at(-1)?.id : null },
    };
  }

  async preview(
    principal: SessionPrincipal,
    input: { packageId: string; branchId: string; classTypeId: string; code: string },
  ) {
    this.access.requireVerifiedCustomer(principal);
    if (!principal.capabilities.includes('voucher:redeem'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const pkg = await this.db.paket.findFirst({
      where: { id: input.packageId, status: 'ACTIVE' },
      include: {
        promotions: {
          where: { status: 'ACTIVE' },
          orderBy: [{ activeFrom: 'desc' }],
          take: 1,
        },
      },
    });
    if (!pkg) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    // Jenis kelas checkout wajib berasal dari pilihan customer.
    // Package.classTypeId tidak lagi menjadi fallback voucher modern.
    const effectiveBranchId = typeof input.branchId === 'string' ? input.branchId.trim() : '';
    const effectiveClassTypeId =
      typeof input.classTypeId === 'string' ? input.classTypeId.trim() : '';

    if (!effectiveBranchId || !effectiveClassTypeId)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    const [branch, packageBranchScope, packageClassTypeScope, classTypeBranchScope] =
      await Promise.all([
        this.db.cabang.findFirst({
          where: { id: effectiveBranchId, active: true },
          select: { id: true },
        }),
        this.db.cakupanCabangPaket.findFirst({
          where: { packageId: pkg.id, branchId: effectiveBranchId, active: true },
          select: { id: true },
        }),
        this.db.cakupanJenisKelasPaket.findFirst({
          where: { packageId: pkg.id, classTypeId: effectiveClassTypeId, active: true },
          select: { id: true },
        }),
        this.db.cakupanCabangJenisKelas.findFirst({
          where: {
            branchId: effectiveBranchId,
            classTypeId: effectiveClassTypeId,
            active: true,
          },
          select: { id: true },
        }),
      ]);

    if (!branch || !packageBranchScope || !packageClassTypeScope || !classTypeBranchScope)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const code = normalizeVoucherCode(input.code);
    const now = new Date();
    const activePromotion = pkg.promotions.find(
      (item) => item.activeFrom <= now && item.activeUntil > now,
    );
    const packagePricing = this.pricing.calculate(pkg.priceRp, activePromotion, now);
    const voucher = await this.db.voucher.findFirst({
      where: {
        code,
        status: 'ACTIVE',
        activeFrom: { lte: now },
        OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
        AND: [
          { OR: [{ branchId: null }, { branchId: effectiveBranchId }] },
          { OR: [{ classTypeId: null }, { classTypeId: effectiveClassTypeId }] },
          { OR: [{ packages: { none: {} } }, { packages: { some: { packageId: pkg.id } } }] },
        ],
      },
      include: { _count: { select: { redemptions: { where: { releasedAt: null } } } } },
    });
    if (!voucher) throw new ApiProblem('VOUCHER_INVALID', HttpStatus.UNPROCESSABLE_ENTITY);
    if (packagePricing.effectivePriceRp < voucher.minimumPurchaseRp)
      throw new ApiProblem('VOUCHER_MINIMUM_NOT_MET', HttpStatus.UNPROCESSABLE_ENTITY);
    const customerUsage = await this.db.penukaranVoucher.count({
      where: { voucherId: voucher.id, customerUserId: principal.userId, releasedAt: null },
    });
    if (voucher.totalUsageLimit !== null && voucher._count.redemptions >= voucher.totalUsageLimit)
      throw new ApiProblem('VOUCHER_EXHAUSTED', HttpStatus.UNPROCESSABLE_ENTITY);
    if (voucher.perCustomerUsageLimit !== null && customerUsage >= voucher.perCustomerUsageLimit)
      throw new ApiProblem('VOUCHER_CUSTOMER_LIMIT', HttpStatus.UNPROCESSABLE_ENTITY);
    const discountRp = calculateVoucherDiscount({
      priceRp: packagePricing.effectivePriceRp,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      maxDiscountRp: voucher.maxDiscountRp,
    });
    return {
      valid: true,
      voucherId: voucher.id,
      code: voucher.code,
      packagePriceRp: pkg.priceRp,
      packagePromotionDiscountRp: packagePricing.promotion?.discountRp ?? 0,
      promotionalPriceRp: packagePricing.effectivePriceRp,
      baseAmountRp: packagePricing.effectivePriceRp,
      discountRp,
      priceAfterDiscountRp: packagePricing.effectivePriceRp - discountRp,
    };
  }

  // --- Indonesian Domain Aliases ---
  async daftarVoucher(principal: SessionPrincipal, filters: Parameters<VoucherService['list']>[1]) {
    return this.list(principal, filters);
  }

  async detailVoucher(principal: SessionPrincipal, id: string) {
    return this.detail(principal, id);
  }

  async buatVoucher(
    principal: SessionPrincipal,
    input: Parameters<VoucherService['create']>[1],
    key: string,
    correlationId: string,
  ) {
    return this.create(principal, input, key, correlationId);
  }

  async perbaruiVoucher(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<VoucherService['update']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.update(principal, id, input, key, correlationId);
  }

  async ubahStatusVoucher(
    principal: SessionPrincipal,
    id: string,
    status: Parameters<VoucherService['transition']>[2],
    input: Parameters<VoucherService['transition']>[3],
    key: string,
    correlationId: string,
  ) {
    return this.transition(principal, id, status, input, key, correlationId);
  }

  async riwayatKlaimVoucher(
    principal: SessionPrincipal,
    id: string,
    cursor?: string,
    rawLimit?: string,
  ) {
    return this.redemptions(principal, id, cursor, rawLimit);
  }

  async pratinjauVoucher(
    principal: SessionPrincipal,
    input: Parameters<VoucherService['preview']>[1],
  ) {
    return this.preview(principal, input);
  }
}
