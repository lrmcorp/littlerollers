import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, digest, newId, syntheticConfigSeconds } from '../identity/security';
import { PilotRollbackOutboxService } from '../migration/pilot-rollback-outbox.service';
import { PackageAccessService } from './package-access.service';
import { decryptAccountNumber } from './payment-account-security';
import { PackagePricingService } from './package-pricing.service';

const orderStatuses = [
  'AWAITING_PAYMENT',
  'PENDING',
  'ACTION_REQUIRED',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
] as const;

@Injectable()
export class CustomerOrderService {
  constructor(
    private readonly db: PrismaService,
    private readonly idem: IdempotencyService,
    private readonly access: PackageAccessService,
    private readonly pricing: PackagePricingService,
    @Optional() private readonly pilotOutbox?: PilotRollbackOutboxService,
  ) {}
  async checkoutOptions(p: SessionPrincipal, packageId: string, branchId?: string) {
    this.access.catalog(p);
    await this.access.requireVerifiedCustomer(p);
    const now = new Date();
    const pkg = await this.db.package.findFirst({
      where: {
        id: packageId,
        status: 'ACTIVE',
        effectiveFrom: { lte: now },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
      },
      include: {
        branch: true,
        classType: true,
        promotions: {
          where: { status: 'ACTIVE', activeFrom: { lte: now }, activeUntil: { gt: now } },
          orderBy: [{ activeFrom: 'desc' }],
          take: 1,
        },
      },
    });
    if (!pkg?.branch.active) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (branchId && pkg.branchId !== branchId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const account = await this.db.paymentAccount.findFirst({
      where: { branchId: pkg.branchId, active: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!account) throw new ApiProblem('PAYMENT_ACCOUNT_UNAVAILABLE', HttpStatus.CONFLICT);
    const packagePricing = this.pricing.calculate(pkg.priceRp, pkg.promotions[0], now);
    return {
      package: {
        id: pkg.id,
        name: pkg.name,
        priceRp: pkg.priceRp,
        effectivePriceRp: packagePricing.effectivePriceRp,
        promotion: packagePricing.promotion,
        version: pkg.version,
        sessionCount: pkg.sessionCount,
        durationDays: pkg.durationDays,
        branchId: pkg.branchId,
        branchName: pkg.branch.name,
        classTypeId: pkg.classTypeId,
        classTypeName: pkg.classType.name,
      },
      paymentAccount: {
        id: account.id,
        bankName: account.bankName,
        accountNumber: decryptAccountNumber(account.accountNumberEncrypted),
        accountHolderName: account.accountHolderName,
        paymentWindowHours: account.paymentWindowHours,
      },
    };
  }

  private async expireOwnOrders(userId: string) {
    const expired = await this.db.purchase.findMany({
      where: {
        userId,
        status: { in: ['AWAITING_PAYMENT', 'ACTION_REQUIRED'] },
        paymentExpiresAt: { lte: new Date() },
      },
      select: { id: true, paymentExpiresAt: true },
    });
    if (!expired.length) return;
    const ids = expired.map(({ id }) => id);
    await this.db.$transaction(async (tx) => {
      await tx.purchase.updateMany({
        where: { id: { in: ids } },
        data: { status: 'EXPIRED', version: { increment: 1 } },
      });
      await tx.paymentUniqueCodeReservation.deleteMany({ where: { purchaseId: { in: ids } } });
      await tx.voucherRedemption.updateMany({
        where: { purchaseId: { in: ids }, releasedAt: null },
        data: { releasedAt: new Date() },
      });
      await tx.purchaseTimelineEvent.createMany({
        data: expired.map((item) => ({
          id: newId(),
          purchaseId: item.id,
          eventType: 'ORDER_EXPIRED',
          sourceKey: `${item.id}:expired:${item.paymentExpiresAt?.toISOString() ?? 'unknown'}`,
          occurredAt: item.paymentExpiresAt ?? new Date(),
        })),
        skipDuplicates: true,
      });
    });
  }

  private orderView(order: any, revealAccount = false) {
    const payableAmountRp = order.payableAmountRpSnapshot ?? order.priceRpSnapshot;
    return {
      id: order.id,
      branchId: order.branchId,
      branchName: order.branch?.name,
      branchTimezone: order.branch?.timezone,
      packageId: order.packageId,
      packageName: order.packageNameSnapshot,
      priceRp: order.priceRpSnapshot,
      baseAmountRp: order.priceRpSnapshot,
      voucher: order.voucherId
        ? {
            id: order.voucherId,
            code: order.voucherCodeSnapshot,
            discountType: order.voucherDiscountTypeSnapshot,
            discountValue: order.voucherDiscountValueSnapshot,
            discountRp: order.voucherDiscountRpSnapshot,
          }
        : null,
      promotion: order.packagePromotionId
        ? {
            id: order.packagePromotionId,
            name: order.packagePromotionNameSnapshot,
            discountType: order.packagePromotionDiscountTypeSnapshot,
            discountValue: order.packagePromotionDiscountValueSnapshot,
            discountRp: order.packagePromotionDiscountRpSnapshot,
          }
        : null,
      promotionalPriceRp: order.promotionalPriceRpSnapshot ?? order.priceRpSnapshot,
      priceAfterDiscountRp: order.priceAfterDiscountRpSnapshot ?? order.priceRpSnapshot,
      paymentUniqueCode: order.paymentUniqueCode,
      payableAmountRp,
      sessionCount: order.sessionCountSnapshot,
      durationDays: order.durationDaysSnapshot,
      status: order.status,
      submittedAt: order.submittedAt,
      decidedAt: order.decidedAt ?? null,
      expiresAt: order.paymentExpiresAt,
      continuationSlotId: order.continuationClassSlotId,
      paymentProofId: order.paymentProofId,
      paymentProofStatus: order.paymentProof
        ? {
            uploadStatus: order.paymentProof.uploadStatus,
            scanStatus: order.paymentProof.scanStatus,
          }
        : null,
      decisionReasonCode: order.decisionReasonCode,
      timelineComplete: Boolean(order.timelineComplete),
      version: order.version,
      activation: order.customerPackage
        ? {
            customerPackageId: order.customerPackage.id,
            status: order.customerPackage.status,
            activationDate: order.customerPackage.activationDate,
            expiryAt: order.customerPackage.expiryAt,
            sessionCount: order.customerPackage.sessionCountSnapshot,
          }
        : null,
      timeline: order.timelineEvents
        ? {
            items: order.timelineEvents.map((event: any) => ({
              id: event.id,
              type: event.eventType,
              reasonCode: event.reasonCode ?? null,
              occurredAt: event.occurredAt,
              derived: event.derived,
            })),
            page: { hasMore: false, nextCursor: null },
          }
        : undefined,
      paymentAccount: order.paymentBankNameSnapshot
        ? {
            bankName: order.paymentBankNameSnapshot,
            accountNumber:
              revealAccount && order.paymentAccountNumberSnapshotEncrypted
                ? decryptAccountNumber(order.paymentAccountNumberSnapshotEncrypted)
                : `•••• ${order.paymentAccountLast4Snapshot}`,
            accountHolderName: order.paymentAccountHolderSnapshot,
          }
        : null,
    };
  }

  private async reserveUniqueCode(
    tx: Prisma.TransactionClient,
    input: {
      purchaseId: string;
      paymentAccountId: string;
      priceRp: number;
      expiresAt: Date;
    },
  ) {
    await tx.$queryRaw(
      Prisma.sql`SELECT id FROM PaymentAccount WHERE id = ${input.paymentAccountId} FOR UPDATE`,
    );
    const used = new Set(
      (
        await tx.paymentUniqueCodeReservation.findMany({
          where: { paymentAccountId: input.paymentAccountId },
          select: { code: true },
        })
      ).map(({ code }) => code),
    );
    const start = (Number.parseInt(digest(input.purchaseId).slice(0, 8), 16) % 999) + 1;
    let code: number | undefined;
    for (let offset = 0; offset < 999; offset += 1) {
      const candidate = ((start - 1 + offset) % 999) + 1;
      if (!used.has(candidate)) {
        code = candidate;
        break;
      }
    }
    if (!code) throw new ApiProblem('PAYMENT_UNIQUE_CODE_UNAVAILABLE', HttpStatus.CONFLICT);
    const payableAmountRp = input.priceRp + code;
    if (!Number.isSafeInteger(payableAmountRp))
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    await tx.paymentUniqueCodeReservation.create({
      data: {
        id: newId(),
        paymentAccountId: input.paymentAccountId,
        purchaseId: input.purchaseId,
        code,
        expiresAt: input.expiresAt,
      },
    });
    return { code, payableAmountRp };
  }

  async createOrder(p: SessionPrincipal, input: any, key: string, correlationId: string) {
    this.access.catalog(p);
    await this.access.requireVerifiedCustomer(p);
    if (!key || !input?.packageId) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.idem.execute(
      { scope: `order:${p.userId}`, key, payload: input, ttlMs: 86400000, leaseMs: 30000 },
      async (tx) => {
        const now = new Date();
        const pkg = await tx.package.findFirst({
          where: {
            id: input.packageId,
            status: 'ACTIVE',
            effectiveFrom: { lte: now },
            OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
          },
        });
        if (!pkg) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (input.branchId && input.branchId !== pkg.branchId)
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        const account = await tx.paymentAccount.findFirst({
          where: { branchId: pkg.branchId, active: true },
          orderBy: { createdAt: 'desc' },
        });
        if (!account) throw new ApiProblem('PAYMENT_ACCOUNT_UNAVAILABLE', HttpStatus.CONFLICT);
        if (input.slotId) {
          const slot = await tx.classSlot.findUnique({ where: { id: input.slotId } });
          if (!slot || slot.branchId !== pkg.branchId || slot.classTypeId !== pkg.classTypeId)
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        }
        const activePromotion = await this.pricing.activePromotion(tx, pkg.id, now);
        const packagePricing = this.pricing.calculate(pkg.priceRp, activePromotion, now);
        if (
          (input.expectedPackageVersion !== undefined &&
            input.expectedPackageVersion !== pkg.version) ||
          (Object.prototype.hasOwnProperty.call(input, 'expectedPromotionId') &&
            (input.expectedPromotionId ?? null) !== (activePromotion?.id ?? null)) ||
          (input.expectedPromotionVersion !== undefined &&
            input.expectedPromotionVersion !== activePromotion?.version)
        )
          throw new ApiProblem('PRICE_CHANGED', HttpStatus.CONFLICT);
        let voucher:
          | {
              id: string;
              code: string;
              discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
              discountValue: number;
              discountRp: number;
              priceAfterDiscountRp: number;
            }
          | undefined;
        const voucherCode = String(input.voucherCode ?? '')
          .trim()
          .toUpperCase();
        if (voucherCode) {
          await tx.$queryRaw(
            Prisma.sql`SELECT id FROM Voucher WHERE code = ${voucherCode} FOR UPDATE`,
          );
          const candidate = await tx.voucher.findFirst({
            where: {
              code: voucherCode,
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
          if (!candidate) throw new ApiProblem('VOUCHER_INVALID', HttpStatus.UNPROCESSABLE_ENTITY);
          if (packagePricing.effectivePriceRp < candidate.minimumPurchaseRp)
            throw new ApiProblem('VOUCHER_MINIMUM_NOT_MET', HttpStatus.UNPROCESSABLE_ENTITY);
          const [totalUsage, customerUsage] = await Promise.all([
            tx.voucherRedemption.count({
              where: { voucherId: candidate.id, releasedAt: null },
            }),
            tx.voucherRedemption.count({
              where: { voucherId: candidate.id, customerUserId: p.userId, releasedAt: null },
            }),
          ]);
          if (candidate.totalUsageLimit !== null && totalUsage >= candidate.totalUsageLimit)
            throw new ApiProblem('VOUCHER_EXHAUSTED', HttpStatus.UNPROCESSABLE_ENTITY);
          if (
            candidate.perCustomerUsageLimit !== null &&
            customerUsage >= candidate.perCustomerUsageLimit
          )
            throw new ApiProblem('VOUCHER_CUSTOMER_LIMIT', HttpStatus.UNPROCESSABLE_ENTITY);
          const rawDiscount =
            candidate.discountType === 'PERCENTAGE'
              ? Math.floor((packagePricing.effectivePriceRp * candidate.discountValue) / 100)
              : candidate.discountValue;
          const discountRp = Math.min(
            rawDiscount,
            candidate.maxDiscountRp ?? rawDiscount,
            packagePricing.effectivePriceRp,
          );
          voucher = {
            id: candidate.id,
            code: candidate.code,
            discountType: candidate.discountType,
            discountValue: candidate.discountValue,
            discountRp,
            priceAfterDiscountRp: packagePricing.effectivePriceRp - discountRp,
          };
        }
        const purchaseId = newId();
        const expiresAt = new Date(now.getTime() + account.paymentWindowHours * 3600000);
        await tx.purchase.create({
          data: {
            id: purchaseId,
            userId: p.userId,
            branchId: pkg.branchId,
            packageId: pkg.id,
            paymentAccountId: account.id,
            paymentBankNameSnapshot: account.bankName,
            paymentAccountNumberSnapshotEncrypted: account.accountNumberEncrypted,
            paymentAccountLast4Snapshot: account.accountNumberLast4,
            paymentAccountHolderSnapshot: account.accountHolderName,
            paymentExpiresAt: expiresAt,
            continuationClassSlotId: input.slotId || null,
            packageNameSnapshot: pkg.name,
            priceRpSnapshot: pkg.priceRp,
            packagePromotionId: packagePricing.promotion?.id,
            packagePromotionNameSnapshot: packagePricing.promotion?.name,
            packagePromotionDiscountTypeSnapshot: packagePricing.promotion?.discountType,
            packagePromotionDiscountValueSnapshot: packagePricing.promotion?.discountValue,
            packagePromotionDiscountRpSnapshot: packagePricing.promotion?.discountRp,
            promotionalPriceRpSnapshot: packagePricing.effectivePriceRp,
            voucherId: voucher?.id,
            voucherCodeSnapshot: voucher?.code,
            voucherDiscountTypeSnapshot: voucher?.discountType,
            voucherDiscountValueSnapshot: voucher?.discountValue,
            voucherDiscountRpSnapshot: voucher?.discountRp,
            priceAfterDiscountRpSnapshot:
              voucher?.priceAfterDiscountRp ?? packagePricing.effectivePriceRp,
            sessionCountSnapshot: pkg.sessionCount,
            durationDaysSnapshot: pkg.durationDays,
            status: 'AWAITING_PAYMENT',
            timelineComplete: true,
            idempotencyKeyHash: digest(key),
          },
        });
        const uniquePayment = await this.reserveUniqueCode(tx, {
          purchaseId,
          paymentAccountId: account.id,
          priceRp: voucher?.priceAfterDiscountRp ?? packagePricing.effectivePriceRp,
          expiresAt,
        });
        const purchase = await tx.purchase.update({
          where: { id: purchaseId },
          data: {
            paymentUniqueCode: uniquePayment.code,
            payableAmountRpSnapshot: uniquePayment.payableAmountRp,
          },
          include: { branch: true, paymentProof: true },
        });
        const voucherRedemption = voucher
          ? await tx.voucherRedemption.create({
              data: {
                id: newId(),
                voucherId: voucher.id,
                purchaseId: purchase.id,
                customerUserId: p.userId,
                discountRp: voucher.discountRp,
              },
            })
          : null;
        await tx.purchaseTimelineEvent.createMany({
          data: [
            {
              id: newId(),
              purchaseId: purchase.id,
              eventType: 'ORDER_CREATED',
              sourceKey: `${purchase.id}:created`,
              occurredAt: purchase.submittedAt,
            },
            {
              id: newId(),
              purchaseId: purchase.id,
              eventType: 'PAYMENT_DEADLINE_SET',
              sourceKey: `${purchase.id}:deadline`,
              occurredAt: purchase.submittedAt,
            },
          ],
        });
        await tx.outboxEvent.create({
          data: {
            id: newId(),
            eventType: 'order.created.v1',
            aggregateType: 'Purchase',
            aggregateId: purchase.id,
            payload: { orderId: purchase.id, status: 'AWAITING_PAYMENT' },
            correlationId,
          },
        });
        await this.access.audit(
          tx,
          p,
          'ORDER_CREATED',
          'Purchase',
          purchase.id,
          pkg.branchId,
          correlationId,
        );
        await this.pilotOutbox?.record(tx, {
          branchId: pkg.branchId,
          aggregateType: 'Purchase',
          aggregateId: purchase.id,
          operation: 'CREATE',
          correlationId,
          occurredAt: purchase.submittedAt,
          payload: {
            purchaseId: purchase.id,
            customerUserId: p.userId,
            packageId: pkg.id,
            status: purchase.status,
            payableAmountRp: purchase.payableAmountRpSnapshot,
            voucherId: voucher?.id ?? null,
          },
        });
        if (voucher && voucherRedemption) {
          await this.pilotOutbox?.record(tx, {
            branchId: pkg.branchId,
            aggregateType: 'VoucherRedemption',
            aggregateId: voucherRedemption.id,
            operation: 'REDEEM',
            correlationId,
            occurredAt: purchase.submittedAt,
            payload: {
              purchaseId: purchase.id,
              voucherId: voucher.id,
              customerUserId: p.userId,
              discountRp: voucher.discountRp,
            },
          });
        }
        return { status: 201, body: this.orderView(purchase, true) as Prisma.InputJsonValue };
      },
    );
  }

  async listOrders(
    p: SessionPrincipal,
    filters: {
      status?: string;
      q?: string;
      from?: string;
      until?: string;
      cursor?: string;
      limit?: string;
      includeHistorical?: boolean;
    } = {},
  ) {
    this.access.catalog(p);
    if (filters.includeHistorical && !p.capabilities.includes('migration:read'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    await this.expireOwnOrders(p.userId);
    if (filters.status && !orderStatuses.includes(filters.status as (typeof orderStatuses)[number]))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const q = filters.q?.trim();
    if (q && q.length > 120) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const from = filters.from ? new Date(filters.from) : undefined;
    const until = filters.until ? new Date(filters.until) : undefined;
    if (until && /^\d{4}-\d{2}-\d{2}$/.test(filters.until ?? '')) {
      until.setUTCDate(until.getUTCDate() + 1);
    }
    if (
      (from && Number.isNaN(from.getTime())) ||
      (until && Number.isNaN(until.getTime())) ||
      (from && until && from >= until)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const limit = filters.limit ? Number(filters.limit) : 20;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const cursor = filters.cursor
      ? await this.db.purchase.findFirst({
          where: { id: filters.cursor, userId: p.userId },
          select: { id: true, submittedAt: true },
        })
      : null;
    if (filters.cursor && !cursor) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const baseWhere: Prisma.PurchaseWhereInput = {
      userId: p.userId,
      ...(filters.includeHistorical ? {} : { historical: false }),
      ...(q
        ? {
            OR: [{ packageNameSnapshot: { contains: q } }, { branch: { name: { contains: q } } }],
          }
        : {}),
      ...(from || until
        ? { submittedAt: { ...(from ? { gte: from } : {}), ...(until ? { lt: until } : {}) } }
        : {}),
    };
    const cursorWhere: Prisma.PurchaseWhereInput | undefined = cursor
      ? {
          OR: [
            { submittedAt: { lt: cursor.submittedAt } },
            { submittedAt: cursor.submittedAt, id: { lt: cursor.id } },
          ],
        }
      : undefined;
    const where: Prisma.PurchaseWhereInput = {
      AND: [
        baseWhere,
        ...(filters.status ? [{ status: filters.status as any }] : []),
        ...(cursorWhere ? [cursorWhere] : []),
      ],
    };
    const [records, grouped, total] = await Promise.all([
      this.db.purchase.findMany({
        where,
        include: { branch: true, paymentProof: true },
        orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
      }),
      this.db.purchase.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { _all: true },
      }),
      this.db.purchase.count({ where: baseWhere }),
    ]);
    const hasMore = records.length > limit;
    const items = records.slice(0, limit);
    const counts = Object.fromEntries(grouped.map((item) => [item.status, item._count._all]));
    return {
      items: items.map((item) => this.orderView(item, false)),
      summary: {
        total,
        awaitingPayment: counts.AWAITING_PAYMENT ?? 0,
        pending: counts.PENDING ?? 0,
        actionRequired: counts.ACTION_REQUIRED ?? 0,
        approved: counts.APPROVED ?? 0,
        rejected: counts.REJECTED ?? 0,
        expired: counts.EXPIRED ?? 0,
      },
      page: {
        hasMore,
        nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null,
      },
    };
  }

  async orderDetail(p: SessionPrincipal, id: string) {
    this.access.catalog(p);
    await this.expireOwnOrders(p.userId);
    const order = await this.db.purchase.findFirst({
      where: { id, userId: p.userId },
      include: {
        branch: true,
        paymentProof: true,
        customerPackage: true,
        timelineEvents: { orderBy: [{ occurredAt: 'asc' }, { id: 'asc' }] },
      },
    });
    if (!order) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return this.orderView(order, true);
  }
  async attachOrderProof(p: SessionPrincipal, orderId: string, input: any, correlationId: string) {
    this.access.catalog(p);
    if (!input?.paymentProofId || !Number.isInteger(input.expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const [order, proof] = await Promise.all([
      this.db.purchase.findFirst({
        where: { id: orderId, userId: p.userId },
        include: { branch: true, paymentProof: true },
      }),
      this.db.paymentProof.findFirst({ where: { id: input.paymentProofId, userId: p.userId } }),
    ]);
    if (!order || !proof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (order.status === 'PENDING' && order.paymentProofId === proof.id)
      return this.orderView(order, true);
    if (
      !['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status) ||
      order.version !== input.expectedVersion
    )
      throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
    if (!order.paymentExpiresAt || order.paymentExpiresAt <= new Date()) {
      await this.db.$transaction(async (tx) => {
        const changed = await tx.purchase.updateMany({
          where: { id: order.id, version: order.version },
          data: { status: 'EXPIRED', version: { increment: 1 } },
        });
        if (changed.count)
          await tx.purchaseTimelineEvent.create({
            data: {
              id: newId(),
              purchaseId: order.id,
              eventType: 'ORDER_EXPIRED',
              sourceKey: `${order.id}:expired:${order.paymentExpiresAt!.toISOString()}`,
              occurredAt: order.paymentExpiresAt!,
            },
          });
        if (changed.count)
          await tx.voucherRedemption.updateMany({
            where: { purchaseId: order.id, releasedAt: null },
            data: { releasedAt: new Date() },
          });
      });
      throw new ApiProblem('ORDER_EXPIRED', HttpStatus.CONFLICT);
    }
    if (
      proof.branchId !== order.branchId ||
      proof.packageId !== order.packageId ||
      proof.uploadStatus !== 'FINALIZED' ||
      proof.scanStatus !== 'CLEAN' ||
      !proof.providerReferenceHash
    )
      throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
    return this.db.$transaction(async (tx) => {
      const updated = await tx.purchase.update({
        where: { id: order.id, version: order.version },
        data: {
          paymentProofId: proof.id,
          status: 'PENDING',
          decisionReasonCode: null,
          decidedAt: null,
          decidedById: null,
          version: { increment: 1 },
        },
        include: { branch: true, paymentProof: true },
      });
      if (order.paymentProofId)
        await tx.paymentProof.update({
          where: { id: order.paymentProofId },
          data: { replacedById: proof.id },
        });
      await tx.purchaseTimelineEvent.createMany({
        data: [
          {
            id: newId(),
            purchaseId: order.id,
            eventType: 'PROOF_SUBMITTED',
            sourceKey: `${order.id}:proof:${proof.id}:submitted`,
            occurredAt: proof.uploadedAt ?? proof.finalizedAt ?? new Date(),
          },
          {
            id: newId(),
            purchaseId: order.id,
            eventType: 'PROOF_SCAN_COMPLETED',
            sourceKey: `${order.id}:proof:${proof.id}:scan`,
            occurredAt: proof.finalizedAt ?? new Date(),
          },
        ],
        skipDuplicates: true,
      });
      await tx.outboxEvent.create({
        data: {
          id: newId(),
          eventType: 'order.payment-proof.submitted.v1',
          aggregateType: 'Purchase',
          aggregateId: order.id,
          payload: { orderId: order.id, status: 'PENDING' },
          correlationId,
        },
      });
      await this.access.audit(
        tx,
        p,
        'ORDER_PAYMENT_SUBMITTED',
        'Purchase',
        order.id,
        order.branchId,
        correlationId,
      );
      await this.pilotOutbox?.record(tx, {
        branchId: order.branchId,
        aggregateType: 'PaymentProof',
        aggregateId: proof.id,
        operation: 'ATTACH_TO_PURCHASE',
        correlationId,
        occurredAt: proof.finalizedAt ?? new Date(),
        payload: {
          paymentProofId: proof.id,
          purchaseId: order.id,
          checksumReference: proof.checksum,
          mimeType: proof.mimeType,
          sizeBytes: proof.sizeBytes,
          kind: 'PAYMENT_PROOF',
          version: updated.version,
        },
      });
      return this.orderView(updated, true);
    });
  }
  async submit(p: SessionPrincipal, input: any, key: string, correlationId: string) {
    this.access.catalog(p);
    await this.access.requireVerifiedCustomer(p);
    if (!key) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    syntheticConfigSeconds('PURCHASE_IDEMPOTENCY_TTL_SECONDS', 86400);
    return this.idem.execute(
      { scope: `purchase:${p.userId}`, key, payload: input, ttlMs: 86400000, leaseMs: 30000 },
      async (tx) => {
        const proofId = input.paymentProofId ?? input.paymentProofUploadId;
        const pkg = await tx.package.findUnique({ where: { id: input.packageId } });
        const proof = await tx.paymentProof.findUnique({ where: { id: proofId } });
        const now = new Date();
        if (
          !pkg ||
          pkg.status !== 'ACTIVE' ||
          pkg.effectiveFrom > now ||
          (pkg.effectiveUntil && pkg.effectiveUntil <= now)
        )
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (
          !proof ||
          proof.userId !== p.userId ||
          proof.branchId !== pkg.branchId ||
          proof.scanStatus !== 'CLEAN' ||
          proof.uploadStatus !== 'FINALIZED'
        )
          throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
        const purchase = await tx.purchase.create({
          data: {
            id: newId(),
            userId: p.userId,
            branchId: pkg.branchId,
            packageId: pkg.id,
            paymentProofId: proof.id,
            packageNameSnapshot: pkg.name,
            priceRpSnapshot: pkg.priceRp,
            sessionCountSnapshot: pkg.sessionCount,
            durationDaysSnapshot: pkg.durationDays,
            timelineComplete: true,
            idempotencyKeyHash: digest(key),
          },
        });
        await tx.purchaseTimelineEvent.createMany({
          data: [
            {
              id: newId(),
              purchaseId: purchase.id,
              eventType: 'ORDER_CREATED',
              sourceKey: `${purchase.id}:created`,
              occurredAt: purchase.submittedAt,
            },
            {
              id: newId(),
              purchaseId: purchase.id,
              eventType: 'PROOF_SUBMITTED',
              sourceKey: `${purchase.id}:proof:${proof.id}:submitted`,
              occurredAt: proof.uploadedAt ?? proof.finalizedAt ?? purchase.submittedAt,
            },
            {
              id: newId(),
              purchaseId: purchase.id,
              eventType: 'PROOF_SCAN_COMPLETED',
              sourceKey: `${purchase.id}:proof:${proof.id}:scan`,
              occurredAt: proof.finalizedAt ?? purchase.submittedAt,
            },
          ],
        });
        await tx.outboxEvent.create({
          data: {
            id: newId(),
            eventType: 'purchase.submitted.v1',
            aggregateType: 'Purchase',
            aggregateId: purchase.id,
            payload: { purchaseId: purchase.id, status: 'PENDING' },
            correlationId,
          },
        });
        await this.access.audit(
          tx,
          p,
          'PURCHASE_SUBMITTED',
          'Purchase',
          purchase.id,
          pkg.branchId,
          correlationId,
        );
        await this.pilotOutbox?.record(tx, {
          branchId: pkg.branchId,
          aggregateType: 'Purchase',
          aggregateId: purchase.id,
          operation: 'CREATE',
          correlationId,
          occurredAt: purchase.submittedAt,
          payload: {
            purchaseId: purchase.id,
            customerUserId: p.userId,
            packageId: pkg.id,
            status: purchase.status,
            payableAmountRp: purchase.payableAmountRpSnapshot ?? purchase.priceRpSnapshot,
            voucherId: null,
          },
        });
        await this.pilotOutbox?.record(tx, {
          branchId: pkg.branchId,
          aggregateType: 'PaymentProof',
          aggregateId: proof.id,
          operation: 'ATTACH_TO_PURCHASE',
          correlationId,
          occurredAt: proof.finalizedAt ?? purchase.submittedAt,
          payload: {
            paymentProofId: proof.id,
            purchaseId: purchase.id,
            checksumReference: proof.checksum,
            mimeType: proof.mimeType,
            sizeBytes: proof.sizeBytes,
            kind: 'PAYMENT_PROOF',
            version: purchase.version,
          },
        });
        return { status: 201, body: purchase as unknown as Prisma.InputJsonValue };
      },
    );
  }
}
