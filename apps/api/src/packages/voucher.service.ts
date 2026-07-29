import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type VoucherDiscountType, type VoucherStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { PackageAccessService } from './package-access.service';

const normalizeCode = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toUpperCase();

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
};

@Injectable()
export class VoucherService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: PackageAccessService,
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
    if (Number.isNaN(date.getTime())) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return date;
  }

  private validateInput(input: VoucherInput, partial = false) {
    const code = normalizeCode(input.code);
    if (!partial && (!code || !/^[A-Z0-9][A-Z0-9_-]{2,63}$/u.test(code)))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (!partial && !input.name?.trim()) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (
      input.discountType &&
      (!['PERCENTAGE', 'FIXED_AMOUNT'] as string[]).includes(input.discountType)
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
  ) {
    if (branchId) this.access.scope(principal, branchId, ['voucher:read']);
    if (packageIds.length) {
      const packages = await this.db.package.findMany({
        where: { id: { in: packageIds } },
        select: { id: true, branchId: true },
      });
      if (packages.length !== packageIds.length || (branchId && packages.some((p) => p.branchId !== branchId)))
        throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
      for (const item of packages) this.access.scope(principal, item.branchId, ['voucher:read']);
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
      version: voucher.version,
      createdAt: voucher.createdAt,
      updatedAt: voucher.updatedAt,
    };
  }

  async list(principal: SessionPrincipal, query: { q?: string; status?: string; branchId?: string; cursor?: string; limit?: string } = {}) {
    this.requireRead(principal);
    if (query.branchId) this.access.scope(principal, query.branchId, ['voucher:read']);
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 20)));
    if (!Number.isInteger(limit)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const scope = this.access.branchScope(principal, 'voucher:read');
    const q = query.q?.trim();
    const where: Prisma.VoucherWhereInput = {
      ...(query.status ? { status: query.status as VoucherStatus } : {}),
      ...(q ? { OR: [{ code: { contains: q.toUpperCase() } }, { name: { contains: q } }] } : {}),
      ...(query.branchId
        ? { branchId: query.branchId }
        : scope.all
          ? {}
          : { OR: [{ branchId: { in: scope.included } }, { branchId: null }] }),
    };
    const items = await this.db.voucher.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        branch: { select: { id: true, name: true } },
        classType: { select: { id: true, name: true } },
        packages: { select: { packageId: true } },
        _count: { select: { redemptions: true } },
      },
    });
    const hasMore = items.length > limit;
    const page = items.slice(0, limit);
    return { items: page.map((item) => this.view(item)), page: { hasMore, nextCursor: hasMore ? page.at(-1)?.id ?? null : null } };
  }

  async detail(principal: SessionPrincipal, id: string) {
    this.requireRead(principal);
    const voucher = await this.db.voucher.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true } },
        classType: { select: { id: true, name: true } },
        packages: { select: { packageId: true } },
        _count: { select: { redemptions: true } },
      },
    });
    if (!voucher) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (voucher.branchId) this.access.scope(principal, voucher.branchId, ['voucher:read']);
    return this.view(voucher);
  }

  async create(principal: SessionPrincipal, input: VoucherInput, correlationId: string) {
    this.requireManage(principal, input.branchId);
    const parsed = this.validateInput(input);
    await this.ensureScope(principal, input.branchId, input.packageIds);
    const voucher = await this.db.$transaction(async (tx) => {
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
          afterMasked: { code: created.code, status: created.status },
        },
      });
      return created;
    });
    return this.view(voucher);
  }

  async transition(principal: SessionPrincipal, id: string, status: VoucherStatus, input: { expectedVersion: number; reason: string }, correlationId: string) {
    this.requireManage(principal);
    if (!Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.db.$transaction(async (tx) => {
      const current = await tx.voucher.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
      this.requireManage(principal, current.branchId);
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
      return this.view({ ...current, status, version: current.version + 1 });
    });
  }

  async preview(principal: SessionPrincipal, input: { packageId: string; branchId?: string; code: string }) {
    this.access.requireVerifiedCustomer(principal);
    if (!principal.capabilities.includes('voucher:redeem'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const pkg = await this.db.package.findFirst({
      where: { id: input.packageId, status: 'ACTIVE', branch: { active: true } },
      include: { branch: true },
    });
    if (!pkg || (input.branchId && pkg.branchId !== input.branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const code = normalizeCode(input.code);
    const now = new Date();
    const voucher = await this.db.voucher.findFirst({
      where: {
        code,
        status: 'ACTIVE',
        activeFrom: { lte: now },
        OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
        AND: [
          { OR: [{ branchId: null }, { branchId: pkg.branchId }] },
          { OR: [{ classTypeId: null }, { classTypeId: pkg.classTypeId }] },
          { OR: [{ packages: { none: {} } }, { packages: { some: { packageId: pkg.id } } }] },
        ],
      },
      include: { _count: { select: { redemptions: true } } },
    });
    if (!voucher) throw new ApiProblem('VOUCHER_INVALID', HttpStatus.UNPROCESSABLE_ENTITY);
    if (pkg.priceRp < voucher.minimumPurchaseRp)
      throw new ApiProblem('VOUCHER_MINIMUM_NOT_MET', HttpStatus.UNPROCESSABLE_ENTITY);
    const customerUsage = await this.db.voucherRedemption.count({
      where: { voucherId: voucher.id, customerUserId: principal.userId, releasedAt: null },
    });
    if (voucher.totalUsageLimit !== null && voucher._count.redemptions >= voucher.totalUsageLimit)
      throw new ApiProblem('VOUCHER_EXHAUSTED', HttpStatus.UNPROCESSABLE_ENTITY);
    if (voucher.perCustomerUsageLimit !== null && customerUsage >= voucher.perCustomerUsageLimit)
      throw new ApiProblem('VOUCHER_CUSTOMER_LIMIT', HttpStatus.UNPROCESSABLE_ENTITY);
    const rawDiscount =
      voucher.discountType === 'PERCENTAGE'
        ? Math.floor((pkg.priceRp * voucher.discountValue) / 100)
        : voucher.discountValue;
    const discountRp = Math.min(rawDiscount, voucher.maxDiscountRp ?? rawDiscount, pkg.priceRp);
    return { valid: true, voucherId: voucher.id, code: voucher.code, baseAmountRp: pkg.priceRp, discountRp, priceAfterDiscountRp: pkg.priceRp - discountRp };
  }
}
