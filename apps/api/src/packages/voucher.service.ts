import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { AuditService } from '../foundation/audit.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { PackageAccessService } from './package-access.service';
import { PackagePricingService } from './kalkulasi-harga-paket.service';

export type VoucherDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type VoucherStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type VoucherInput = {
  code: string;
  name: string;
  description?: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscountRp?: number | null;
  minimumPurchaseRp?: number;
  activeFrom?: string | Date;
  activeUntil?: string | Date | null;
  totalUsageLimit?: number | null;
  perCustomerUsageLimit?: number | null;
  branchId?: string | null;
  classTypeId?: string | null;
  packageIds?: string[];
};

const PAGE_SIZE = 20;

export function normalizeVoucherCode(code: string) {
  return (code ?? '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

export function calculateVoucherDiscount(input: {
  priceRp: number;
  discountType: string;
  discountValue: number;
  maxDiscountRp?: number | null;
}) {
  const isPercent = input.discountType === 'PERCENTAGE';
  const raw = isPercent
    ? Math.floor((input.priceRp * input.discountValue) / 100)
    : input.discountValue;
  const capped =
    input.maxDiscountRp && input.maxDiscountRp > 0
      ? Math.min(raw, input.maxDiscountRp)
      : raw;
  return Math.min(capped, Math.max(0, input.priceRp - 1));
}

@Injectable()
export class VoucherService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: PackageAccessService,
    private readonly pricing: PackagePricingService,
    private readonly idempotency: IdempotencyService,
    private readonly auditService: AuditService,
  ) {}

  private requireRead(principal: SessionPrincipal) {
    if (
      !principal.capabilities.includes('voucher:read') &&
      !principal.capabilities.includes('voucher:manage')
    )
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  private requireManage(principal: SessionPrincipal) {
    if (!principal.capabilities.includes('voucher:manage'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  private view(voucher: any) {
    const isPercent = voucher.discountType === 'PERCENTAGE';
    const status: VoucherStatus = voucher.active ? 'ACTIVE' : 'PAUSED';
    return {
      id: voucher.id,
      code: voucher.code,
      name: voucher.name,
      description: '',
      status,
      discountType: isPercent ? 'PERCENTAGE' : 'FIXED_AMOUNT',
      discountValue: voucher.discountValue,
      maxDiscountRp: voucher.maxDiscountRp ?? null,
      minimumPurchaseRp: voucher.minSpendRp,
      minSpendRp: voucher.minSpendRp,
      activeFrom: voucher.createdAt,
      activeUntil: voucher.validUntil ?? null,
      validUntil: voucher.validUntil ?? null,
      totalUsageLimit: voucher.quota,
      quota: voucher.quota,
      perCustomerUsageLimit: 1,
      redeemedCount: voucher.usedCount,
      usedCount: voucher.usedCount,
      branch: null,
      classType: null,
      packageIds: [],
      packages: [],
      version: 1,
      createdAt: voucher.createdAt,
      updatedAt: voucher.createdAt,
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
    const limit = query.limit ? Math.min(Number(query.limit), 100) : PAGE_SIZE;

    const where: Prisma.VoucherWhereInput = {
      ...(query.status === 'ACTIVE'
        ? { active: true }
        : query.status === 'PAUSED' || query.status === 'ARCHIVED'
          ? { active: false }
          : {}),
      ...(query.q?.trim()
        ? {
            OR: [
              { code: { contains: query.q.trim() } },
              { name: { contains: query.q.trim() } },
            ],
          }
        : {}),
    };

    const items = await this.db.voucher.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    });

    const hasNext = items.length > limit;
    const pageItems = hasNext ? items.slice(0, limit) : items;

    return {
      items: pageItems.map((v) => this.view(v)),
      nextCursor: hasNext ? pageItems[pageItems.length - 1]?.id ?? null : null,
      page: {
        hasMore: hasNext,
        nextCursor: hasNext ? pageItems[pageItems.length - 1]?.id ?? null : null,
      },
      summary: {
        total: items.length,
        active: items.filter((v) => v.active).length,
      },
    };
  }

  async detail(principal: SessionPrincipal, id: string) {
    this.requireRead(principal);
    const voucher = await this.db.voucher.findUnique({
      where: { id },
      include: {
        purchases: {
          select: { id: true, invoiceNumber: true, totalAmountRp: true, createdAt: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!voucher) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return {
      ...this.view(voucher),
      redemptions: (voucher.purchases ?? []).map((p: any) => ({
        id: p.id,
        orderId: p.id,
        orderNumber: p.invoiceNumber,
        redeemedAt: p.createdAt,
      })),
    };
  }

  async create(
    principal: SessionPrincipal,
    input: VoucherInput,
    key: string,
    correlationId: string,
  ) {
    this.requireManage(principal);
    const code = normalizeVoucherCode(input.code);
    const name = (input.name ?? '').trim();
    if (!code || !name) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    return this.idempotency.execute(
      {
        scope: `voucher-create:${code}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const existing = await tx.voucher.findUnique({ where: { code } });
        if (existing) throw new ApiProblem('RESOURCE_EXISTS', HttpStatus.CONFLICT);

        const discountType = input.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'NOMINAL';
        const discountValue = Number(input.discountValue ?? 0);
        const minSpendRp = Number(input.minimumPurchaseRp ?? 0);
        const maxDiscountRp = input.maxDiscountRp ? Number(input.maxDiscountRp) : null;
        const quota = Number(input.totalUsageLimit ?? 100);
        const validUntil = input.activeUntil ? new Date(input.activeUntil) : null;

        const created = await tx.voucher.create({
          data: {
            id: newId(),
            code,
            name,
            discountType,
            discountValue,
            minSpendRp,
            maxDiscountRp,
            quota,
            usedCount: 0,
            validUntil,
            active: true,
          },
        });

        this.auditService.record({
          action: 'VOUCHER_CREATED',
          resourceType: 'Voucher',
          resourceId: created.id,
          actorUserId: principal.userId,
          correlationId,
        });

        return {
          status: HttpStatus.CREATED,
          body: this.view(created) as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async update(
    principal: SessionPrincipal,
    id: string,
    input: Partial<VoucherInput> & { expectedVersion?: number },
    key: string,
    correlationId: string,
  ) {
    this.requireManage(principal);
    return this.idempotency.execute(
      {
        scope: `voucher-update:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const voucher = await tx.voucher.findUnique({ where: { id } });
        if (!voucher) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

        const updated = await tx.voucher.update({
          where: { id },
          data: {
            name: input.name !== undefined ? input.name.trim() : undefined,
            discountType:
              input.discountType !== undefined
                ? input.discountType === 'PERCENTAGE'
                  ? 'PERCENTAGE'
                  : 'NOMINAL'
                : undefined,
            discountValue:
              input.discountValue !== undefined ? Number(input.discountValue) : undefined,
            minSpendRp:
              input.minimumPurchaseRp !== undefined
                ? Number(input.minimumPurchaseRp)
                : undefined,
            maxDiscountRp:
              input.maxDiscountRp !== undefined
                ? input.maxDiscountRp
                  ? Number(input.maxDiscountRp)
                  : null
                : undefined,
            quota:
              input.totalUsageLimit !== undefined ? Number(input.totalUsageLimit) : undefined,
            validUntil:
              input.activeUntil !== undefined
                ? input.activeUntil
                  ? new Date(input.activeUntil)
                  : null
                : undefined,
          },
        });

        this.auditService.record({
          action: 'VOUCHER_UPDATED',
          resourceType: 'Voucher',
          resourceId: id,
          actorUserId: principal.userId,
          correlationId,
        });

        return {
          status: HttpStatus.OK,
          body: this.view(updated) as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async transition(
    principal: SessionPrincipal,
    id: string,
    status: VoucherStatus,
    body: { expectedVersion?: number; reason?: string },
    key: string,
    correlationId: string,
  ) {
    this.requireManage(principal);
    return this.idempotency.execute(
      {
        scope: `voucher-transition:${id}`,
        key,
        payload: { status, ...body },
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const voucher = await tx.voucher.findUnique({ where: { id } });
        if (!voucher) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

        const updated = await tx.voucher.update({
          where: { id },
          data: { active: status === 'ACTIVE' },
        });

        this.auditService.record({
          action: `VOUCHER_${status}`,
          resourceType: 'Voucher',
          resourceId: id,
          actorUserId: principal.userId,
          correlationId,
        });

        return {
          status: HttpStatus.OK,
          body: this.view(updated) as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async redemptions(
    principal: SessionPrincipal,
    id: string,
    _cursor?: string,
    _rawLimit?: string,
  ) {
    this.requireRead(principal);
    const voucher = await this.db.voucher.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            user: { select: { id: true, displayName: true, email: true } },
            package: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: PAGE_SIZE,
        },
      },
    });
    if (!voucher) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    return {
      items: (voucher.purchases ?? []).map((p: any) => ({
        id: p.id,
        orderId: p.id,
        orderNumber: p.invoiceNumber,
        customer: p.user,
        package: p.package,
        discountRp: p.discountRp,
        finalPriceRp: p.totalAmountRp,
        redeemedAt: p.createdAt,
      })),
      nextCursor: null,
    };
  }

  async preview(
    principal: SessionPrincipal,
    input: { packageId: string; branchId: string; classTypeId?: string; code: string },
  ) {
    await this.access.requireVerifiedCustomer(principal);
    const pkg = await this.db.paket.findFirst({
      where: { id: input.packageId, status: 'ACTIVE' },
    });
    if (!pkg) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const code = normalizeVoucherCode(input.code);
    const now = new Date();

    const voucher = await this.db.voucher.findFirst({
      where: {
        code,
        active: true,
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
      },
    });

    if (!voucher) throw new ApiProblem('VOUCHER_INVALID', HttpStatus.UNPROCESSABLE_ENTITY);
    if (pkg.priceRp < voucher.minSpendRp)
      throw new ApiProblem('VOUCHER_MINIMUM_NOT_MET', HttpStatus.UNPROCESSABLE_ENTITY);
    if (voucher.quota !== null && voucher.usedCount >= voucher.quota)
      throw new ApiProblem('VOUCHER_EXHAUSTED', HttpStatus.UNPROCESSABLE_ENTITY);

    const discountRp = calculateVoucherDiscount({
      priceRp: pkg.priceRp,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      maxDiscountRp: voucher.maxDiscountRp,
    });

    return {
      valid: true,
      voucherId: voucher.id,
      code: voucher.code,
      name: voucher.name,
      discountType: voucher.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
      discountValue: voucher.discountValue,
      discountRp,
      finalPriceRp: pkg.priceRp - discountRp,
      packageId: pkg.id,
      voucher: this.view(voucher),
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
    body: Parameters<VoucherService['transition']>[3],
    key: string,
    correlationId: string,
  ) {
    return this.transition(principal, id, status, body, key, correlationId);
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
