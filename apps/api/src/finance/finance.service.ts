import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';

function boundaries(query: { from?: string; until?: string }) {
  const valid = /^\d{4}-\d{2}-\d{2}$/;
  if ((query.from && !valid.test(query.from)) || (query.until && !valid.test(query.until)))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  const until = query.until ? new Date(`${query.until}T23:59:59.999Z`) : new Date();
  const from = query.from
    ? new Date(`${query.from}T00:00:00.000Z`)
    : new Date(until.getTime() - 29 * 86_400_000);
  if (from >= until || until.getTime() - from.getTime() > 366 * 86_400_000)
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  return { from, until };
}

@Injectable()
export class FinanceService {
  constructor(private readonly db: PrismaService) {}

  private scope(principal: SessionPrincipal, branchId?: string) {
    if (!principal.capabilities.includes('finance:reconcile'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    if (
      branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.capabilities.includes('finance:reconcile') &&
      !principal.branchIds.includes(branchId)
    )
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    return branchId ? { branchId } : {};
  }

  private async records(
    principal: SessionPrincipal,
    query: { branchId?: string; from?: string; until?: string },
  ) {
    const range = boundaries(query);
    const scope = this.scope(principal, query.branchId);
    const purchases = await this.db.purchase.findMany({
      where: { ...scope, submittedAt: { gte: range.from, lte: range.until } },
      include: {
        branch: { select: { id: true, code: true, name: true } },
        paymentProof: { select: { uploadStatus: true, scanStatus: true } },
        customerPackage: { select: { id: true, salePriceRp: true } },
      },
      orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
    });
    return { range, purchases };
  }

  async overview(
    principal: SessionPrincipal,
    query: { branchId?: string; from?: string; until?: string },
  ) {
    const { range, purchases } = await this.records(principal, query);
    const reconcilableStatuses = [
      'AWAITING_PAYMENT',
      'PENDING',
      'ACTION_REQUIRED',
      'APPROVED',
      'REJECTED',
    ];
    const payable = (item: (typeof purchases)[number]) =>
      item.payableAmountRpSnapshot ?? item.priceRpSnapshot;
    const amount = (statuses: string[]) =>
      purchases
        .filter((item) => statuses.includes(item.status))
        .reduce((sum, item) => sum + payable(item), 0);
    const received = purchases.filter(
      (item) =>
        item.paymentProof?.uploadStatus === 'FINALIZED' && item.paymentProof.scanStatus === 'CLEAN',
    );
    const expectedRp = amount(reconcilableStatuses);
    const approvedRp = purchases
      .filter((item) => item.status === 'APPROVED')
      .reduce((sum, item) => sum + (item.priceAfterDiscountRpSnapshot ?? item.priceRpSnapshot), 0);
    const approvedPurchases = purchases.filter((item) => item.status === 'APPROVED');
    const grossSalesRp = approvedPurchases.reduce((sum, item) => sum + item.priceRpSnapshot, 0);
    const voucherDiscountRp = approvedPurchases.reduce(
      (sum, item) => sum + (item.voucherDiscountRpSnapshot ?? 0),
      0,
    );
    const packagePromotionDiscountRp = approvedPurchases.reduce(
      (sum, item) => sum + (item.packagePromotionDiscountRpSnapshot ?? 0),
      0,
    );
    const voucherRedemptionCount = approvedPurchases.filter(
      (item) => item.voucherId !== null,
    ).length;
    const identificationAmountRp = purchases
      .filter((item) => reconcilableStatuses.includes(item.status))
      .reduce((sum, item) => sum + (item.paymentUniqueCode ?? 0), 0);
    const ledgerRecognizedRp = purchases.reduce(
      (sum, item) => sum + (item.customerPackage?.salePriceRp ?? 0),
      0,
    );
    const branchMap = new Map<
      string,
      {
        id: string;
        code: string;
        name: string;
        expectedRp: number;
        receivedRp: number;
        approvedRp: number;
        identificationAmountRp: number;
        grossSalesRp: number;
        voucherDiscountRp: number;
        packagePromotionDiscountRp: number;
        netSalesRp: number;
        voucherRedemptionCount: number;
        pendingCount: number;
        anomalyCount: number;
      }
    >();
    for (const item of purchases) {
      const row = branchMap.get(item.branchId) ?? {
        ...item.branch,
        expectedRp: 0,
        receivedRp: 0,
        approvedRp: 0,
        identificationAmountRp: 0,
        grossSalesRp: 0,
        voucherDiscountRp: 0,
        packagePromotionDiscountRp: 0,
        netSalesRp: 0,
        voucherRedemptionCount: 0,
        pendingCount: 0,
        anomalyCount: 0,
      };
      if (reconcilableStatuses.includes(item.status)) row.expectedRp += payable(item);
      if (
        item.paymentProof?.uploadStatus === 'FINALIZED' &&
        item.paymentProof.scanStatus === 'CLEAN'
      )
        row.receivedRp += payable(item);
      if (item.status === 'APPROVED') {
        row.grossSalesRp += item.priceRpSnapshot;
        row.voucherDiscountRp += item.voucherDiscountRpSnapshot ?? 0;
        row.packagePromotionDiscountRp += item.packagePromotionDiscountRpSnapshot ?? 0;
        row.netSalesRp += item.priceAfterDiscountRpSnapshot ?? item.priceRpSnapshot;
        row.approvedRp += item.priceAfterDiscountRpSnapshot ?? item.priceRpSnapshot;
        if (item.voucherId) row.voucherRedemptionCount += 1;
      }
      if (reconcilableStatuses.includes(item.status))
        row.identificationAmountRp += item.paymentUniqueCode ?? 0;
      if (item.status === 'PENDING') row.pendingCount += 1;
      if (
        (item.status === 'APPROVED' && !item.customerPackage) ||
        (item.status === 'PENDING' && !item.paymentProof)
      )
        row.anomalyCount += 1;
      branchMap.set(item.branchId, row);
    }
    return {
      generatedAt: new Date(),
      period: range,
      metrics: {
        expectedRp,
        receivedRp: received.reduce((sum, item) => sum + payable(item), 0),
        approvedRp,
        pendingRp: amount(['PENDING']),
        rejectedRp: amount(['REJECTED', 'ACTION_REQUIRED']),
        identificationAmountRp,
        grossSalesRp,
        voucherDiscountRp,
        packagePromotionDiscountRp,
        netSalesRp: grossSalesRp - packagePromotionDiscountRp - voucherDiscountRp,
        voucherRedemptionCount,
        ledgerDeltaRp: approvedRp - ledgerRecognizedRp,
        unreconciledCount: purchases.filter(
          (item) =>
            item.status === 'PENDING' || (item.status === 'APPROVED' && !item.customerPackage),
        ).length,
      },
      branches: [...branchMap.values()],
    };
  }

  async anomalies(
    principal: SessionPrincipal,
    query: { branchId?: string; from?: string; until?: string; cursor?: string; limit?: string },
  ) {
    const { purchases } = await this.records(principal, query);
    const staleBefore = Date.now() - 24 * 60 * 60 * 1000;
    const items = purchases.flatMap((item) => {
      const base = {
        purchaseId: item.id,
        branchId: item.branchId,
        branchCode: item.branch.code,
        amountRp: item.payableAmountRpSnapshot ?? item.priceRpSnapshot,
        submittedAt: item.submittedAt,
        href: `/workspace/payments?purchaseId=${item.id}`,
      };
      if (item.status === 'APPROVED' && !item.customerPackage)
        return [{ ...base, code: 'APPROVED_WITHOUT_LEDGER', severity: 'CRITICAL' }];
      if (item.status === 'PENDING' && item.submittedAt.getTime() < staleBefore)
        return [{ ...base, code: 'STALE_PENDING_PAYMENT', severity: 'WARNING' }];
      if (
        item.status === 'PENDING' &&
        (!item.paymentProof || item.paymentProof.scanStatus !== 'CLEAN')
      )
        return [{ ...base, code: 'PROOF_NOT_READY', severity: 'WARNING' }];
      return [];
    });
    const limit = query.limit === undefined ? 20 : Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const start = query.cursor
      ? items.findIndex((item) => item.purchaseId === query.cursor) + 1
      : 0;
    if (query.cursor && start === 0)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const pageItems = items.slice(start, start + limit);
    const hasMore = start + pageItems.length < items.length;
    return {
      generatedAt: new Date(),
      items: pageItems,
      total: items.length,
      page: {
        hasMore,
        nextCursor: hasMore ? (pageItems.at(-1)?.purchaseId ?? null) : null,
      },
    };
  }
}
