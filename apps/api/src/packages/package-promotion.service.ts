import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { AuditService } from '../foundation/audit.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { PackageAccessService } from './package-access.service';
import {
  calculatePackagePromotion,
  promotionEffectiveState,
  type PromotionPricingSource,
} from './kalkulasi-harga-paket.service';

export type PackagePromotionStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
export type VoucherDiscountType = 'PERCENTAGE' | 'FIXED' | 'FIXED_AMOUNT';

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
    private readonly auditService: AuditService,
  ) {}

  private requireRead(principal: SessionPrincipal) {
    if (
      !principal.capabilities.includes('package-promotion:read') &&
      !principal.capabilities.includes('package-promotion:manage')
    )
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  private requireManage(principal: SessionPrincipal, _branchId?: string) {
    if (!principal.capabilities.includes('package-promotion:manage'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  private async packageOrThrow(principal: SessionPrincipal, packageId: string, manage = false) {
    if (manage) this.requireManage(principal);
    else this.requireRead(principal);

    const pkg = await this.db.paket.findUnique({
      where: { id: packageId },
      include: {
        classType: { select: { id: true, code: true, name: true } },
        _count: { select: { purchases: true, customerPackages: true } },
      },
    });
    if (!pkg) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return pkg;
  }

  async packageDetail(principal: SessionPrincipal, packageId: string) {
    const pkg = await this.packageOrThrow(principal, packageId);
    const detail = {
      id: pkg.id,
      code: pkg.code,
      businessKey: pkg.code,
      name: pkg.name,
      description: pkg.description ?? '',
      priceRp: pkg.priceRp,
      sessionCount: pkg.sessionCount,
      durationDays: pkg.validityDays,
      validityDays: pkg.validityDays,
      status: pkg.status,
      effectiveState: pkg.status === 'ACTIVE' ? 'LIVE' : pkg.status,
      effectiveFrom: pkg.createdAt.toISOString(),
      effectiveUntil: null,
      branchScopes: [],
      classTypeScopes: pkg.classType ? [{ classType: pkg.classType }] : [],
      classType: pkg.classType ?? null,
      classTypeId: pkg.classTypeId ?? null,
      version: 1,
      revisions: [
        {
          id: `${pkg.id}-r1`,
          revisionNumber: 1,
          name: pkg.name,
          priceRp: pkg.priceRp,
          sessionCount: pkg.sessionCount,
          durationDays: pkg.validityDays,
          validityDays: pkg.validityDays,
          effectiveFrom: pkg.createdAt.toISOString(),
        },
      ],
      publicProfile: null,
    };
    return {
      ...detail,
      package: detail,
      promotions: [],
      auditActivity: [],
    };
  }

  async list(
    principal: SessionPrincipal,
    packageId: string,
    _cursor?: string,
    _limit?: string,
  ) {
    await this.packageOrThrow(principal, packageId);
    return {
      items: [],
      nextCursor: null,
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async create(
    principal: SessionPrincipal,
    packageId: string,
    body: PromotionCommand,
    key: string,
    correlationId: string,
  ) {
    const pkg = await this.packageOrThrow(principal, packageId, true);
    return this.idempotency.execute(
      {
        scope: `package-promotions:create:${packageId}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async () => {
        const item = {
          id: newId(),
          packageId,
          name: body.name,
          label: body.label,
          discountType: body.discountType,
          discountValue: body.discountValue,
          status: 'ACTIVE' as PackagePromotionStatus,
          activeFrom: new Date(body.activeFrom),
          activeUntil: new Date(body.activeUntil),
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          package: pkg,
        };
        this.auditService.record({
          action: 'package-promotion.create',
          resourceType: 'PackagePromotion',
          resourceId: item.id,
          actorUserId: principal.userId,
          correlationId,
        });
        return {
          status: HttpStatus.CREATED,
          body: item as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async update(
    principal: SessionPrincipal,
    id: string,
    body: Partial<PromotionCommand> & { expectedVersion?: number },
    key: string,
    correlationId: string,
  ) {
    this.requireManage(principal);
    return this.idempotency.execute(
      {
        scope: `package-promotions:update:${id}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async () => {
        this.auditService.record({
          action: 'package-promotion.update',
          resourceType: 'PackagePromotion',
          resourceId: id,
          actorUserId: principal.userId,
          correlationId,
        });
        return {
          status: HttpStatus.OK,
          body: {
            id,
            status: 'UPDATED',
            ...body,
          } as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async transition(
    principal: SessionPrincipal,
    id: string,
    status: PackagePromotionStatus,
    body: { expectedVersion?: number; reason?: string },
    key: string,
    correlationId: string,
  ) {
    this.requireManage(principal);
    return this.idempotency.execute(
      {
        scope: `package-promotions:transition:${id}`,
        key,
        payload: { status, ...body },
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async () => {
        this.auditService.record({
          action: `package-promotion.${status.toLowerCase()}`,
          resourceType: 'PackagePromotion',
          resourceId: id,
          actorUserId: principal.userId,
          correlationId,
        });
        return {
          status: HttpStatus.OK,
          body: {
            id,
            status,
          } as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async orders(
    principal: SessionPrincipal,
    _id: string,
    _cursor?: string,
    _limit?: string,
  ) {
    this.requireRead(principal);
    return {
      items: [],
      nextCursor: null,
    };
  }
}
