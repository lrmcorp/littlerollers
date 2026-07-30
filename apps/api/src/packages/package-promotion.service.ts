import { HttpStatus, Injectable } from '@nestjs/common';
import { PackagePromotionStatus, Prisma, type VoucherDiscountType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { PackageAccessService } from './package-access.service';
import { calculatePackagePromotion, promotionEffectiveState } from './package-pricing.service';

type PromotionCommand = {
  name: string;
  label: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  activeFrom: string;
  activeUntil: string;
};

@Injectable()
export class PackagePromotionService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: PackageAccessService,
    private readonly idempotency: IdempotencyService,
  ) {}

  private requireRead(principal: SessionPrincipal) {
    if (
      !principal.capabilities.includes('package-promotion:read') &&
      !principal.capabilities.includes('package-promotion:manage')
    )
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  private requireManage(principal: SessionPrincipal, branchId: string) {
    if (!principal.capabilities.includes('package-promotion:manage'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    this.access.scope(principal, branchId, ['package-promotion:manage']);
  }

  private scope(principal: SessionPrincipal, branchId: string) {
    this.access.scope(principal, branchId, ['package-promotion:read', 'package-promotion:manage']);
  }

  private parse(input: PromotionCommand) {
    const activeFrom = new Date(input.activeFrom);
    const activeUntil = new Date(input.activeUntil);
    if (
      !input.name?.trim() ||
      !input.label?.trim() ||
      input.name.trim().length > 160 ||
      input.label.trim().length > 80 ||
      !['PERCENTAGE', 'FIXED_AMOUNT'].includes(input.discountType) ||
      !Number.isInteger(input.discountValue) ||
      input.discountValue < 1 ||
      (input.discountType === 'PERCENTAGE' && input.discountValue > 100) ||
      !Number.isFinite(activeFrom.getTime()) ||
      !Number.isFinite(activeUntil.getTime()) ||
      activeFrom >= activeUntil
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return { activeFrom, activeUntil };
  }

  private assertDiscountLeavesPositivePrice(
    priceRp: number,
    discountType: VoucherDiscountType,
    discountValue: number,
  ) {
    const discountRp =
      discountType === 'PERCENTAGE' ? Math.floor((priceRp * discountValue) / 100) : discountValue;
    if (discountRp < 1 || discountRp >= priceRp)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }

  private view(item: any, now = new Date()) {
    const rawDiscount =
      item.discountType === 'PERCENTAGE'
        ? Math.floor((item.package.priceRp * item.discountValue) / 100)
        : item.discountValue;
    const discountRp = Math.min(rawDiscount, Math.max(0, item.package.priceRp - 1));
    return {
      id: item.id,
      packageId: item.packageId,
      name: item.name,
      label: item.label,
      status: item.status,
      effectiveState: promotionEffectiveState(item, now),
      discountType: item.discountType,
      discountValue: item.discountValue,
      discountRp,
      promotionalPriceRp: item.package.priceRp - discountRp,
      activeFrom: item.activeFrom,
      activeUntil: item.activeUntil,
      version: item.version,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      package: item.package,
      usageCount: item._count?.purchases ?? undefined,
    };
  }

  private async packageOrThrow(principal: SessionPrincipal, packageId: string, manage = false) {
    if (manage) {
      if (!principal.capabilities.includes('package-promotion:manage'))
        throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    } else this.requireRead(principal);
    const pkg = await this.db.package.findUnique({
      where: { id: packageId },
      include: {
        branch: { select: { id: true, code: true, name: true } },
        classType: true,
        publicProfile: true,
        _count: { select: { purchases: true, customerPackages: true } },
      },
    });
    if (!pkg) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (manage) this.requireManage(principal, pkg.branchId);
    else this.scope(principal, pkg.branchId);
    return pkg;
  }

  async packageDetail(principal: SessionPrincipal, packageId: string) {
    const pkg = await this.packageOrThrow(principal, packageId);
    const [promotions, revisions, auditActivity] = await Promise.all([
      this.db.packagePromotion.findMany({
        where: { packageId },
        include: { package: true, _count: { select: { purchases: true } } },
        orderBy: [{ activeFrom: 'desc' }, { id: 'desc' }],
      }),
      this.db.package.findMany({
        where: {
          branchId: pkg.branchId,
          classTypeId: pkg.classTypeId,
          businessKey: pkg.businessKey,
        },
        orderBy: [{ effectiveFrom: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          name: true,
          sessionCount: true,
          durationDays: true,
          priceRp: true,
          status: true,
          effectiveFrom: true,
          effectiveUntil: true,
          version: true,
        },
      }),
      this.db.auditLog.findMany({
        where: {
          objectType: 'Package',
          objectId: packageId,
        },
        orderBy: { occurredAt: 'desc' },
        take: 20,
        select: { id: true, action: true, occurredAt: true },
      }),
    ]);
    return {
      ...pkg,
      promotions: promotions.map((item) => this.view(item)),
      revisions,
      auditActivity,
    };
  }

  async list(principal: SessionPrincipal, packageId: string, cursor?: string, rawLimit?: string) {
    await this.packageOrThrow(principal, packageId);
    const limit = Math.min(50, Math.max(1, Number(rawLimit ?? 20)));
    if (!Number.isInteger(limit)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const rows = await this.db.packagePromotion.findMany({
      where: { packageId },
      include: { package: true, _count: { select: { purchases: true } } },
      orderBy: [{ activeFrom: 'desc' }, { id: 'desc' }],
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
    });
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    return {
      items: items.map((item) => this.view(item)),
      page: { hasMore, nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null },
    };
  }

  private async assertNoOverlap(
    tx: Prisma.TransactionClient,
    packageId: string,
    activeFrom: Date,
    activeUntil: Date,
    excludeId?: string,
  ) {
    const overlap = await tx.packagePromotion.findFirst({
      where: {
        packageId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { not: 'ARCHIVED' },
        activeFrom: { lt: activeUntil },
        activeUntil: { gt: activeFrom },
      },
      select: { id: true },
    });
    if (overlap) throw new ApiProblem('PROMOTION_PERIOD_OVERLAP', HttpStatus.CONFLICT);
  }

  async create(
    principal: SessionPrincipal,
    packageId: string,
    input: PromotionCommand & { reason: string },
    key: string,
    correlationId: string,
  ) {
    const pkg = await this.packageOrThrow(principal, packageId, true);
    if (!key || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const dates = this.parse(input);
    this.assertDiscountLeavesPositivePrice(pkg.priceRp, input.discountType, input.discountValue);
    const preview = calculatePackagePromotion({
      priceRp: pkg.priceRp,
      promotion: {
        id: 'preview',
        name: input.name,
        label: input.label,
        status: 'ACTIVE',
        discountType: input.discountType,
        discountValue: input.discountValue,
        activeFrom: dates.activeFrom,
        activeUntil: dates.activeUntil,
        version: 0,
      },
      now: dates.activeFrom,
    });
    if (preview.effectivePriceRp < 1 || preview.effectivePriceRp >= pkg.priceRp)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const result = await this.idempotency.execute(
      {
        scope: `package-promotion-create:${packageId}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM Package WHERE id = ${packageId} FOR UPDATE`;
        await this.assertNoOverlap(tx, packageId, dates.activeFrom, dates.activeUntil);
        const created = await tx.packagePromotion.create({
          data: {
            id: newId(),
            packageId,
            name: input.name.trim(),
            label: input.label.trim(),
            discountType: input.discountType,
            discountValue: input.discountValue,
            activeFrom: dates.activeFrom,
            activeUntil: dates.activeUntil,
            createdById: principal.userId,
          },
          include: { package: true, _count: { select: { purchases: true } } },
        });
        await tx.auditLog.create({
          data: {
            id: newId(),
            actorType: 'USER',
            actorId: principal.userId,
            branchId: pkg.branchId,
            action: 'package_promotion.created',
            objectType: 'PackagePromotion',
            objectId: created.id,
            correlationId,
            afterMasked: { packageId, status: created.status, reasonPresent: true },
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
    input: Partial<PromotionCommand> & { expectedVersion: number; reason: string },
    key: string,
    correlationId: string,
  ) {
    if (!key || !Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const current = await this.db.packagePromotion.findUnique({
      where: { id },
      include: { package: true },
    });
    if (!current) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.requireManage(principal, current.package.branchId);
    if (current.status === 'ARCHIVED')
      throw new ApiProblem('PROMOTION_ARCHIVED', HttpStatus.CONFLICT);
    const merged: PromotionCommand = {
      name: input.name ?? current.name,
      label: input.label ?? current.label,
      discountType: input.discountType ?? current.discountType,
      discountValue: input.discountValue ?? current.discountValue,
      activeFrom: input.activeFrom ?? current.activeFrom.toISOString(),
      activeUntil: input.activeUntil ?? current.activeUntil.toISOString(),
    };
    const dates = this.parse(merged);
    this.assertDiscountLeavesPositivePrice(
      current.package.priceRp,
      merged.discountType,
      merged.discountValue,
    );
    const preview = calculatePackagePromotion({
      priceRp: current.package.priceRp,
      promotion: { ...current, ...merged, ...dates, status: 'ACTIVE' },
      now: dates.activeFrom,
    });
    if (preview.effectivePriceRp < 1 || preview.effectivePriceRp >= current.package.priceRp)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const result = await this.idempotency.execute(
      {
        scope: `package-promotion-update:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM Package WHERE id = ${current.packageId} FOR UPDATE`;
        await this.assertNoOverlap(tx, current.packageId, dates.activeFrom, dates.activeUntil, id);
        const changed = await tx.packagePromotion.updateMany({
          where: { id, version: input.expectedVersion, status: { not: 'ARCHIVED' } },
          data: {
            name: merged.name.trim(),
            label: merged.label.trim(),
            discountType: merged.discountType,
            discountValue: merged.discountValue,
            activeFrom: dates.activeFrom,
            activeUntil: dates.activeUntil,
            version: { increment: 1 },
          },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const updated = await tx.packagePromotion.findUniqueOrThrow({
          where: { id },
          include: { package: true, _count: { select: { purchases: true } } },
        });
        await tx.auditLog.create({
          data: {
            id: newId(),
            actorType: 'USER',
            actorId: principal.userId,
            branchId: current.package.branchId,
            action: 'package_promotion.updated',
            objectType: 'PackagePromotion',
            objectId: id,
            correlationId,
            afterMasked: { reasonPresent: true, version: updated.version },
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
    status: PackagePromotionStatus,
    input: { expectedVersion: number; reason: string },
    key: string,
    correlationId: string,
  ) {
    if (!key || !Number.isInteger(input.expectedVersion) || input.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const current = await this.db.packagePromotion.findUnique({
      where: { id },
      include: { package: true },
    });
    if (!current) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.requireManage(principal, current.package.branchId);
    if (current.status === 'ARCHIVED' || (status === 'PAUSED' && current.status !== 'ACTIVE'))
      throw new ApiProblem('PROMOTION_INVALID_STATUS', HttpStatus.CONFLICT);
    if (status === 'ACTIVE' && current.activeUntil <= new Date())
      throw new ApiProblem('PROMOTION_EXPIRED', HttpStatus.CONFLICT);
    const result = await this.idempotency.execute(
      {
        scope: `package-promotion-transition:${id}`,
        key,
        payload: { status, ...input },
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const changed = await tx.packagePromotion.updateMany({
          where: { id, version: input.expectedVersion },
          data: { status, version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const updated = await tx.packagePromotion.findUniqueOrThrow({
          where: { id },
          include: { package: true, _count: { select: { purchases: true } } },
        });
        await tx.auditLog.create({
          data: {
            id: newId(),
            actorType: 'USER',
            actorId: principal.userId,
            branchId: current.package.branchId,
            action: `package_promotion.${status.toLowerCase()}`,
            objectType: 'PackagePromotion',
            objectId: id,
            correlationId,
            afterMasked: { status, reasonPresent: true },
          },
        });
        return { status: 200, body: this.view(updated) as Prisma.InputJsonValue };
      },
    );
    return result.body;
  }

  async orders(principal: SessionPrincipal, id: string, cursor?: string, rawLimit?: string) {
    this.requireRead(principal);
    const promotion = await this.db.packagePromotion.findUnique({
      where: { id },
      include: { package: true },
    });
    if (!promotion) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.scope(principal, promotion.package.branchId);
    const limit = Math.min(50, Math.max(1, Number(rawLimit ?? 20)));
    const rows = await this.db.purchase.findMany({
      where: { packagePromotionId: id },
      orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: limit + 1,
      select: {
        id: true,
        status: true,
        packagePromotionDiscountRpSnapshot: true,
        promotionalPriceRpSnapshot: true,
        voucherDiscountRpSnapshot: true,
        priceAfterDiscountRpSnapshot: true,
        submittedAt: true,
        user: { select: { displayName: true } },
        branch: { select: { id: true, name: true } },
      },
    });
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    return {
      items,
      page: { hasMore, nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null },
    };
  }
}
