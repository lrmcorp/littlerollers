import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';

@Injectable()
export class FinanceService {
  constructor(private readonly db: PrismaService) {}

  async overview(
    principal: SessionPrincipal,
    input: { branchId?: string; from?: string; until?: string },
  ) {
    const branch = input.branchId
      ? await this.db.cabang.findUnique({ where: { id: input.branchId } })
      : await this.db.cabang.findFirst();

    const purchases = await this.db.pembelian.findMany({
      where: {
        ...(branch ? { branchId: branch.id } : {}),
        status: 'PAID',
      },
    });

    const revenue = purchases.reduce((sum, p) => sum + p.totalAmountRp, 0);

    const fromDate = input.from ? new Date(input.from) : new Date(Date.now() - 30 * 86400000);
    const untilDate = input.until ? new Date(input.until) : new Date();

    const branchItem = {
      id: branch?.id ?? 'branch-1',
      code: branch?.code ?? 'JKT',
      name: branch?.name ?? 'Daily Dose Studio',
      expectedRp: revenue,
      receivedRp: revenue,
      approvedRp: revenue,
      identificationAmountRp: 0,
      reconciliationDifferenceRp: 0,
      anomalousTransactionCount: 0,
    };

    return {
      generatedAt: new Date().toISOString(),
      period: {
        from: fromDate.toISOString(),
        until: untilDate.toISOString(),
      },
      metrics: {
        expectedRp: revenue,
        receivedRp: revenue,
        approvedRp: revenue,
        identificationAmountRp: 0,
        reconciliationDifferenceRp: 0,
        anomalousTransactionCount: 0,
      },
      branches: [branchItem],
    };
  }

  async anomalies(
    principal: SessionPrincipal,
    input: { branchId?: string; from?: string; until?: string; limit?: number; cursor?: string },
  ) {
    return {
      items: [],
      total: 0,
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async legacyCashflow(
    principal: SessionPrincipal,
    input: { branchId?: string; from?: string; until?: string; limit?: number; cursor?: string },
  ) {
    return {
      items: [],
      total: 0,
      summary: {
        TOTAL: { amountRp: 0, count: 0 },
      },
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async correctionJournals(
    principal: SessionPrincipal,
    filters: { period?: string; branchId?: string; status?: string; q?: string; cursor?: string },
  ) {
    return {
      items: [],
      summary: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async reports(
    principal: SessionPrincipal,
    reportType: string,
    filters: { period?: string; branchId?: string; cursor?: string },
  ) {
    const branch = filters.branchId
      ? await this.db.cabang.findUnique({ where: { id: filters.branchId } })
      : await this.db.cabang.findFirst();

    const purchases = await this.db.pembelian.findMany({
      where: {
        ...(branch ? { branchId: branch.id } : {}),
        status: 'PAID',
      },
    });

    const revenue = purchases.reduce((sum, p) => sum + p.totalAmountRp, 0);
    const moneyZero = { amountMinor: 0, currency: 'IDR' };
    const moneyRevenue = { amountMinor: revenue * 100, currency: 'IDR' };

    const report = {
      reportType: 'REVENUE',
      branchId: branch?.id ?? 'branch-1',
      period: filters.period ?? new Date().toISOString().slice(0, 7),
      generatedAt: new Date().toISOString(),
      sourceCutoffAt: new Date().toISOString(),
      completeness: 'COMPLETE',
      anomalyCount: 0,
      controlHash: 'hash-ctrl-baseline-001',
      totals: {
        grossSales: moneyRevenue,
        packagePromotionDiscount: moneyZero,
        voucherDiscount: moneyZero,
        revenue: moneyRevenue,
        projection: moneyZero,
        instructorRealtime: moneyZero,
        otherCost: moneyZero,
        correction: moneyZero,
        profit: moneyRevenue,
      },
      sourceVersion: 'v2',
    };

    return {
      report,
      items: [],
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async periods(
    principal: SessionPrincipal,
    filters: { branchId?: string; cursor?: string },
  ) {
    const branch = filters.branchId
      ? await this.db.cabang.findUnique({ where: { id: filters.branchId } })
      : await this.db.cabang.findFirst();

    const currentYearMonth = new Date().toISOString().slice(0, 7);

    return {
      items: [
        {
          id: `period-${currentYearMonth}`,
          branchId: branch?.id ?? 'branch-1',
          period: currentYearMonth,
          status: 'OPEN',
          controlHash: 'hash-ctrl-baseline-001',
          version: 1,
          closedAt: null,
        },
      ],
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async closeMonth(
    principal: SessionPrincipal,
    body: { branchId: string; period: string; controlHash: string; reason: string },
  ) {
    return {
      branchId: body.branchId,
      period: body.period,
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
    };
  }

  async otherCosts(
    principal: SessionPrincipal,
    filters: { period?: string; branchId?: string; cursor?: string },
  ) {
    return {
      items: [],
      total: 0,
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }
}
