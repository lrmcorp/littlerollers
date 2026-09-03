import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import {
  assertIsoDate,
  dateInTimeZone,
  startOfLocalDateUtc,
} from '../identity/assignment-boundary';
import { ApiProblem } from '../identity/security';

const DAY = 86_400_000;
type Db = PrismaService | Prisma.TransactionClient;

export type FinancialDetail = {
  purchases: Array<{
    id: string;
    branchId: string;
    decidedAt: Date;
    grossSalesRp: number;
    packagePromotionDiscountRp: number;
    voucherDiscountRp: number;
    revenueRp: number;
    projectionRp: number;
  }>;
  instructorCompensations: Array<{
    id: string;
    branchId: string;
    instructorUserId: string;
    classSlotId: string;
    matchedUnits: number;
    feeRpSnapshot: number;
    amountRp: number;
    occurredAt: Date;
  }>;
  otherCosts: Array<{
    id: string;
    branchId: string;
    occurredOn: Date;
    categoryCode: string;
    description: string;
    reason: string;
    amountRp: number;
  }>;
  corrections: Array<{
    id: string;
    branchId: string;
    amountRp: number;
    postedAt: Date;
  }>;
};

export type FinancialTotals = {
  grossSalesRp: number;
  packagePromotionDiscountRp: number;
  voucherDiscountRp: number;
  revenueRp: number;
  projectionRp: number;
  instructorRealtimeRp: number;
  otherCostRp: number;
  correctionRp: number;
  profitRp: number;
};

export type FinancialAggregation = {
  from: string;
  until: string;
  sourceCutoffAt: Date;
  sourceVersion: 'financial-facts-v1';
  completeness: 'COMPLETE' | 'INCOMPLETE';
  anomalyCount: number;
  anomalies: Array<{ code: string; sourceId: string; branchId: string }>;
  totals: FinancialTotals;
  branches: Array<FinancialTotals & { branchId: string; branchCode: string; branchName: string }>;
  trend: Array<{ date: string; revenueRp: number; profitRp: number }>;
  details: FinancialDetail;
  controlHash: string;
};

function nextDate(date: string) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + DAY).toISOString().slice(0, 10);
}

function zeroTotals(): FinancialTotals {
  return {
    grossSalesRp: 0,
    packagePromotionDiscountRp: 0,
    voucherDiscountRp: 0,
    revenueRp: 0,
    projectionRp: 0,
    instructorRealtimeRp: 0,
    otherCostRp: 0,
    correctionRp: 0,
    profitRp: 0,
  };
}

function addTotals(target: FinancialTotals, value: FinancialTotals) {
  for (const key of Object.keys(target) as Array<keyof FinancialTotals>) target[key] += value[key];
}

@Injectable()
export class FinancialAggregationService {
  constructor(private readonly prisma: PrismaService) {}

  async aggregate(input: {
    branchIds: string[];
    from: string;
    until: string;
    strict?: boolean;
    db?: Db;
  }): Promise<FinancialAggregation> {
    const from = assertIsoDate(input.from);
    const until = assertIsoDate(input.until);
    const days = (Date.parse(`${until}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY;
    if (days < 0 || days > 365)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const branchIds = [...new Set(input.branchIds)].sort();
    if (!branchIds.length) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const db = input.db ?? this.prisma;
    const branches = await db.cabang.findMany({
      where: { id: { in: branchIds } },
      select: { id: true, code: true, name: true, timezone: true },
      orderBy: { id: 'asc' },
    });
    if (branches.length !== branchIds.length)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const anomalies: FinancialAggregation['anomalies'] = [];
    const details: FinancialDetail = {
      purchases: [],
      instructorCompensations: [],
      otherCosts: [],
      corrections: [],
    };
    const branchTotals: FinancialAggregation['branches'] = [];
    const trend = new Map<
      string,
      { revenueRp: number; projectionRp: number; otherCostRp: number }
    >();
    for (let cursor = from; cursor <= until; cursor = nextDate(cursor))
      trend.set(cursor, { revenueRp: 0, projectionRp: 0, otherCostRp: 0 });

    for (const branch of branches) {
      const startAt = startOfLocalDateUtc(from, branch.timezone);
      const endAt = startOfLocalDateUtc(nextDate(until), branch.timezone);
      const occurredFrom = new Date(`${from}T00:00:00.000Z`);
      const occurredUntil = new Date(`${until}T00:00:00.000Z`);
      const [purchases, hourLogs, costs, corrections] = await Promise.all([
        db.pembelian.findMany({
          where: {
            branchId: branch.id,
            status: 'APPROVED',
            decidedAt: { gte: startAt, lt: endAt },
          },
          select: {
            id: true,
            decidedAt: true,
            priceRpSnapshot: true,
            catalogAmountRpSnapshot: true,
            snapshotCompleteness: true,
            packagePromotionDiscountRpSnapshot: true,
            voucherDiscountRpSnapshot: true,
            priceAfterDiscountRpSnapshot: true,
            sessionCountSnapshot: true,
            customerPackage: {
              select: {
                id: true,
                salePriceRp: true,
                projectionRateRp: true,
                sessionCountSnapshot: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        }),
        db.rekapJamInstruktur.findMany({
          where: {
            branchId: branch.id,
            historical: false,
            occurredAt: { gte: startAt, lt: endAt },
          },
          select: {
            id: true,
            branchId: true,
            instructorUserId: true,
            classSlotId: true,
            matchedUnits: true,
            feeRpSnapshot: true,
            amountRp: true,
            occurredAt: true,
          },
          orderBy: { id: 'asc' },
        }),
        db.biayaLain.findMany({
          where: {
            branchId: branch.id,
            status: 'ACTIVE',
            occurredOn: { gte: occurredFrom, lte: occurredUntil },
          },
          select: {
            id: true,
            branchId: true,
            occurredOn: true,
            categoryCode: true,
            description: true,
            reason: true,
            amountRp: true,
          },
          orderBy: { id: 'asc' },
        }),
        db.koreksiKeuangan.findMany({
          where: { branchId: branch.id, status: 'POSTED', postedAt: { gte: startAt, lt: endAt } },
          select: { id: true, branchId: true, amountRp: true, postedAt: true },
          orderBy: { id: 'asc' },
        }),
      ]);

      const totals = zeroTotals();
      for (const purchase of purchases) {
        if (!purchase.decidedAt || !purchase.customerPackage) {
          anomalies.push({
            code: 'APPROVED_PURCHASE_FACT_MISSING',
            sourceId: purchase.id,
            branchId: branch.id,
          });
          continue;
        }
        const expectedSale = purchase.priceAfterDiscountRpSnapshot ?? purchase.priceRpSnapshot;
        if (
          purchase.customerPackage.salePriceRp !== expectedSale ||
          purchase.customerPackage.sessionCountSnapshot !== purchase.sessionCountSnapshot
        ) {
          anomalies.push({
            code: 'APPROVED_PURCHASE_SNAPSHOT_MISMATCH',
            sourceId: purchase.id,
            branchId: branch.id,
          });
          continue;
        }
        const projectionRp =
          purchase.customerPackage.projectionRateRp * purchase.customerPackage.sessionCountSnapshot;
        if (!Number.isSafeInteger(projectionRp) || projectionRp < 0) {
          anomalies.push({
            code: 'PROJECTION_CONFIGURATION_INVALID',
            sourceId: purchase.id,
            branchId: branch.id,
          });
          continue;
        }
        if (purchase.snapshotCompleteness === 'LEGACY_FINAL_AMOUNT_ONLY')
          anomalies.push({
            code: 'FINANCIAL_BREAKDOWN_INCOMPLETE',
            sourceId: purchase.id,
            branchId: branch.id,
          });
        const row = {
          id: purchase.id,
          branchId: branch.id,
          decidedAt: purchase.decidedAt,
          grossSalesRp: purchase.catalogAmountRpSnapshot ?? purchase.priceRpSnapshot,
          packagePromotionDiscountRp: purchase.packagePromotionDiscountRpSnapshot ?? 0,
          voucherDiscountRp: purchase.voucherDiscountRpSnapshot ?? 0,
          revenueRp: purchase.customerPackage.salePriceRp,
          projectionRp,
        };
        details.purchases.push(row);
        totals.grossSalesRp += row.grossSalesRp;
        totals.packagePromotionDiscountRp += row.packagePromotionDiscountRp;
        totals.voucherDiscountRp += row.voucherDiscountRp;
        totals.revenueRp += row.revenueRp;
        totals.projectionRp += row.projectionRp;
        const point = trend.get(dateInTimeZone(row.decidedAt, branch.timezone));
        if (point) {
          point.revenueRp += row.revenueRp;
          point.projectionRp += row.projectionRp;
        }
      }
      for (const row of hourLogs) {
        if (row.matchedUnits !== 1 || row.amountRp !== row.feeRpSnapshot) {
          anomalies.push({
            code: 'INSTRUCTOR_COMPENSATION_FACT_INVALID',
            sourceId: row.id,
            branchId: branch.id,
          });
          continue;
        }
        details.instructorCompensations.push(row);
        totals.instructorRealtimeRp += row.amountRp;
      }
      for (const row of costs) {
        details.otherCosts.push(row);
        totals.otherCostRp += row.amountRp;
        const point = trend.get(row.occurredOn.toISOString().slice(0, 10));
        if (point) point.otherCostRp += row.amountRp;
      }
      for (const row of corrections) {
        if (!row.postedAt) continue;
        details.corrections.push({ ...row, postedAt: row.postedAt });
        totals.correctionRp += row.amountRp;
      }
      totals.profitRp = totals.revenueRp - totals.projectionRp - totals.otherCostRp;
      if (
        Math.abs(totals.profitRp) < 100 &&
        totals.otherCostRp === 0 &&
        totals.instructorRealtimeRp === 0
      ) {
        totals.profitRp = 0;
      }
      branchTotals.push({
        branchId: branch.id,
        branchCode: branch.code,
        branchName: branch.name,
        ...totals,
      });
    }

    const totals = zeroTotals();
    for (const item of branchTotals) addTotals(totals, item);
    const sourceCutoffAt = new Date();
    const hashPayload = {
      branchIds,
      from,
      until,
      purchases: details.purchases,
      instructorCompensations: details.instructorCompensations,
      otherCosts: details.otherCosts,
      corrections: details.corrections,
      anomalies,
      totals,
    };
    const controlHash = createHash('sha256').update(JSON.stringify(hashPayload)).digest('hex');
    if (input.strict && anomalies.length)
      throw new ApiProblem('FINANCE_CONFIGURATION_INCOMPLETE', HttpStatus.CONFLICT);
    return {
      from,
      until,
      sourceCutoffAt,
      sourceVersion: 'financial-facts-v1',
      completeness: anomalies.length ? 'INCOMPLETE' : 'COMPLETE',
      anomalyCount: anomalies.length,
      anomalies,
      totals,
      branches: branchTotals,
      trend: [...trend.entries()].map(([date, value]) => {
        const rawProfit = value.revenueRp - value.projectionRp - value.otherCostRp;
        return {
          date,
          revenueRp: value.revenueRp,
          profitRp: Math.abs(rawProfit) < 100 ? 0 : rawProfit,
        };
      }),
      details,
      controlHash,
    };
  }

  // --- Indonesian Domain Aliases ---
  async rekapitulasiKeuangan(input: Parameters<FinancialAggregationService['aggregate']>[0]) {
    return this.aggregate(input);
  }
}
