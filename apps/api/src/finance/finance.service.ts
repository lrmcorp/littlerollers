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
      orderBy: { submittedAt: 'desc' },
    });
    return { range, purchases };
  }

  async overview(
    principal: SessionPrincipal,
    query: { branchId?: string; from?: string; until?: string },
  ) {
    const { range, purchases } = await this.records(principal, query);
    const amount = (statuses: string[]) =>
      purchases
        .filter((item) => statuses.includes(item.status))
        .reduce((sum, item) => sum + item.priceRpSnapshot, 0);
    const received = purchases.filter(
      (item) =>
        item.paymentProof?.uploadStatus === 'FINALIZED' && item.paymentProof.scanStatus === 'CLEAN',
    );
    const expectedRp = amount([
      'AWAITING_PAYMENT',
      'PENDING',
      'ACTION_REQUIRED',
      'APPROVED',
      'REJECTED',
    ]);
    const approvedRp = amount(['APPROVED']);
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
        pendingCount: 0,
        anomalyCount: 0,
      };
      row.expectedRp += item.priceRpSnapshot;
      if (
        item.paymentProof?.uploadStatus === 'FINALIZED' &&
        item.paymentProof.scanStatus === 'CLEAN'
      )
        row.receivedRp += item.priceRpSnapshot;
      if (item.status === 'APPROVED') row.approvedRp += item.priceRpSnapshot;
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
        receivedRp: received.reduce((sum, item) => sum + item.priceRpSnapshot, 0),
        approvedRp,
        pendingRp: amount(['PENDING']),
        rejectedRp: amount(['REJECTED', 'ACTION_REQUIRED']),
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
    query: { branchId?: string; from?: string; until?: string },
  ) {
    const { purchases } = await this.records(principal, query);
    const staleBefore = Date.now() - 24 * 60 * 60 * 1000;
    const items = purchases.flatMap((item) => {
      const base = {
        purchaseId: item.id,
        branchId: item.branchId,
        branchCode: item.branch.code,
        amountRp: item.priceRpSnapshot,
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
    return { generatedAt: new Date(), items, total: items.length };
  }
}
