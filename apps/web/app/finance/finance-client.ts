import {
  Configuration,
  FinanceApi,
  type FinanceAnomaly,
  type FinanceReconciliationOverview,
  type LegacyFinancialEntryPage,
  type BranchPeriodPage,
  type CloseResult,
  type Correction,
  type CorrectionDecisionResult,
  type FinancialReportPage,
  type FinanceExportResult,
  type OtherCost,
  type OtherCostCommand,
  type OtherCostPage,
} from '@dailydose/api-client-ts/generated';
import { appLoading } from '../components/app-loading';

export type FinanceAnomalyPage = {
  items: FinanceAnomaly[];
  total: number;
  page: { hasMore: boolean; nextCursor: string | null };
};
export type FinanceData = {
  overview: FinanceReconciliationOverview;
  anomalies: FinanceAnomalyPage;
  legacyCashflow: LegacyFinancialEntryPage;
};
export interface FinanceClient {
  overview(input: {
    branchId?: string;
    from: string;
    until: string;
  }): Promise<FinanceReconciliationOverview>;
  anomalies(
    input: { branchId?: string; from: string; until: string },
    cursor?: string,
  ): Promise<FinanceAnomalyPage>;
  legacyCashflow(
    input: { branchId?: string; from: string; until: string },
    cursor?: string,
  ): Promise<LegacyFinancialEntryPage>;
  financialReport?(branchId: string, period: string): Promise<FinancialReportPage>;
  exportReport?(input: {
    branchId?: string;
    from: string;
    until: string;
  }): Promise<FinanceExportResult>;
  otherCosts?(branchId: string, period: string, cursor?: string): Promise<OtherCostPage>;
  createOtherCost?(command: OtherCostCommand): Promise<OtherCost>;
  periods?(branchId: string, cursor?: string): Promise<BranchPeriodPage>;
  closeMonth?(command: {
    branchId: string;
    period: string;
    controlHash: string;
    reason: string;
    expectedVersion: number;
  }): Promise<CloseResult>;
  requestCorrection?(command: {
    branchId: string;
    currentPeriod: string;
    referencePeriod: string;
    amountRp: number;
    reason: string;
  }): Promise<Correction>;
  decideCorrection?(
    id: string,
    decision: 'approve' | 'reject',
    reason: string,
  ): Promise<CorrectionDecisionResult>;
  corrections?(branchId: string, period?: string, status?: string): Promise<{ items: Correction[]; page: { hasMore: boolean; nextCursor: string | null } }>;
}

const api = new FinanceApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
export const browserFinanceClient: FinanceClient = {
  async overview(input) {
    const request = {
      branchId: input.branchId,
      from: new Date(`${input.from}T00:00:00.000Z`),
      until: new Date(`${input.until}T00:00:00.000Z`),
    };
    return appLoading.track(api.getFinanceReconciliationOverview(request), {
      label: 'Memuat rekonsiliasi…',
    });
  },
  async anomalies(input, cursor) {
    const result = await appLoading.track(
      api.getFinanceReconciliationAnomalies({
        branchId: input.branchId,
        from: new Date(`${input.from}T00:00:00.000Z`),
        until: new Date(`${input.until}T00:00:00.000Z`),
        cursor,
        limit: 20,
      }),
      { label: 'Memuat anomali rekonsiliasi…' },
    );
    return {
      items: result.items,
      total: result.total,
      page: {
        hasMore: result.page.hasMore,
        nextCursor: result.page.nextCursor ?? null,
      },
    };
  },
  legacyCashflow(input, cursor) {
    return appLoading.track(
      api.listLegacyFinancialEntries({
        branchId: input.branchId,
        from: new Date(`${input.from}T00:00:00.000Z`),
        until: new Date(`${input.until}T00:00:00.000Z`),
        cursor,
        limit: 20,
      }),
      { label: 'Memuat legacy cashflow…' },
    );
  },
  financialReport(branchId, period) {
    return appLoading.track(api.getFinancialReport({ reportType: 'profit', branchId, period }), {
      label: 'Memuat kontrol periode…',
    });
  },
  exportReport(input) {
    return appLoading.track(
      api.exportAuthoritativeFinanceReport({
        exportAuthoritativeFinanceReportRequest: {
          branchId: input.branchId,
          from: new Date(`${input.from}T00:00:00.000Z`),
          until: new Date(`${input.until}T00:00:00.000Z`),
        },
      }),
      { label: 'Membuat export Finance…' },
    );
  },
  otherCosts(branchId, period, cursor) {
    return appLoading.track(api.listOtherCosts({ branchId, period, cursor }), {
      label: 'Memuat biaya lain…',
    });
  },
  createOtherCost(command) {
    return appLoading.track(
      api.createOtherCost({ idempotencyKey: crypto.randomUUID(), otherCostCommand: command }),
      { label: 'Mencatat biaya lain…' },
    );
  },
  periods(branchId, cursor) {
    return appLoading.track(api.listPeriods({ branchId, cursor }), {
      label: 'Memuat periode Finance…',
    });
  },
  closeMonth(command) {
    return appLoading.track(
      api.closeMonth({ idempotencyKey: crypto.randomUUID(), closeMonthRequest: command }),
      { label: 'Menutup periode…' },
    );
  },
  requestCorrection(command) {
    return appLoading.track(
      api.requestCorrection({ idempotencyKey: crypto.randomUUID(), correctionCommand: command }),
      { label: 'Membuat correction request…' },
    );
  },
  decideCorrection(id, decision, reason) {
    return appLoading.track(
      api.decideCorrection({
        id,
        decision,
        idempotencyKey: crypto.randomUUID(),
        reasonCommand: { reason },
      }),
      { label: 'Memutuskan correction…' },
    );
  },
  async corrections(branchId, period, status = 'PENDING') {
    const params = new URLSearchParams({ branchId, status });
    if (period) params.set('period', period);
    const response = await fetch(`/api/v1/correction-journals?${params}`, { credentials: 'include' });
    if (!response.ok) throw new Error('CORRECTION_QUEUE_UNAVAILABLE');
    return response.json();
  },
};
