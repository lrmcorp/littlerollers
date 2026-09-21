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

// ============================================================================
// 5 LAPORAN INTI KEUANGAN TYPED INTERFACES
// ============================================================================

export interface OmsetTransaction {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  packageName: string;
  customerName: string;
  totalAmountRp: number;
  paymentMethod: string;
  paidAt: string;
  branchName: string;
}

export interface OmsetReportData {
  period: string;
  branchId: string;
  totalOmsetRp: number;
  totalTransactionCount: number;
  byPaymentMethod: Record<string, { count: number; amountRp: number }>;
  transactions: OmsetTransaction[];
}

export interface InstructorCostBreakdown {
  instructorId: string;
  instructorName: string;
  groupHours: number;
  groupFeeRp: number;
  semiPrivateHours: number;
  semiPrivateFeeRp: number;
  privateHours: number;
  privateFeeRp: number;
  totalHours: number;
  totalFeeRp: number;
}

export interface InstructorCostRealtimeData {
  period: string;
  branchId: string;
  totalInstructorCostRp: number;
  totalTeachingHours: number;
  instructorCount: number;
  instructors: InstructorCostBreakdown[];
}

export interface ProjectionClassTypeBreakdown {
  classTypeId: string;
  sessionsSold: number;
  ratePerSesiRp: number;
  totalCostRp: number;
}

export interface InstructorCostProjectionData {
  period: string;
  branchId: string;
  totalSessionsSold: number;
  totalProjectionCostRp: number;
  breakdown: ProjectionClassTypeBreakdown[];
}

export interface OtherCostItem {
  id: string;
  branchId: string;
  branchName: string;
  period: string;
  category: string;
  description: string;
  amountRp: number;
  createdByName: string;
  createdAt: string;
}

export interface OtherCostReportData {
  period: string;
  branchId: string;
  totalOtherCostRp: number;
  byCategory: Record<string, { count: number; amountRp: number }>;
  items: OtherCostItem[];
}

export interface MonthlyProfitData {
  period: string;
  branchId: string;
  isLocked: boolean;
  status: string;
  closedAt: string | null;
  closedByName: string | null;
  omsetRp: number;
  costRealtimeRp: number;
  costProjectionRp: number;
  otherCostRp: number;
  netProfitRealtimeRp: number;
  netProfitProjectionRp: number;
  totalCorrectionAdjustmentRp: number;
  adjustedNetProfitRealtimeRp: number;
}

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
  corrections?(
    branchId: string,
    period?: string,
    status?: string,
  ): Promise<{ items: Correction[]; page: { hasMore: boolean; nextCursor: string | null } }>;

  // 5 Laporan Finansial Methods
  getOmsetReport?(branchId?: string, period?: string): Promise<OmsetReportData>;
  getInstructorCostRealtime?(branchId?: string, period?: string): Promise<InstructorCostRealtimeData>;
  getInstructorCostProjection?(branchId?: string, period?: string): Promise<InstructorCostProjectionData>;
  getOtherCostReport?(branchId?: string, period?: string): Promise<OtherCostReportData>;
  getMonthlyProfit?(branchId?: string, period?: string): Promise<MonthlyProfitData>;

  // Aksi Finansial
  executeMonthlyClose?(branchId: string, period: string, reason?: string): Promise<any>;
  deleteOtherCost?(id: string): Promise<{ id: string; deleted: boolean }>;
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
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (status) params.set('status', status);
    if (period) params.set('period', period);
    const response = await fetch(`/api/v1/finance/correction-journals?${params}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('CORRECTION_QUEUE_UNAVAILABLE');
    return response.json();
  },

  // ============================================================================
  // 5 LAPORAN INTI
  // ============================================================================

  async getOmsetReport(branchId?: string, period?: string): Promise<OmsetReportData> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (period) params.set('period', period);
    const res = await fetch(`/api/v1/finance/reports/omset?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Gagal memuat laporan omset');
    return res.json();
  },

  async getInstructorCostRealtime(branchId?: string, period?: string): Promise<InstructorCostRealtimeData> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (period) params.set('period', period);
    const res = await fetch(`/api/v1/finance/reports/instructor-cost-realtime?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Gagal memuat laporan cost instruktur realtime');
    return res.json();
  },

  async getInstructorCostProjection(branchId?: string, period?: string): Promise<InstructorCostProjectionData> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (period) params.set('period', period);
    const res = await fetch(`/api/v1/finance/reports/instructor-cost-projection?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Gagal memuat laporan cost instruktur projeksi');
    return res.json();
  },

  async getOtherCostReport(branchId?: string, period?: string): Promise<OtherCostReportData> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (period) params.set('period', period);
    const res = await fetch(`/api/v1/finance/reports/other-costs?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Gagal memuat laporan biaya operasional');
    return res.json();
  },

  async getMonthlyProfit(branchId?: string, period?: string): Promise<MonthlyProfitData> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (period) params.set('period', period);
    const res = await fetch(`/api/v1/finance/reports/profit-summary?${params}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Gagal memuat ringkasan laba bersih');
    return res.json();
  },

  async executeMonthlyClose(branchId: string, period: string, reason?: string) {
    const res = await fetch('/api/v1/finance/monthly-closes/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ branchId, period, reason }),
    });
    if (!res.ok) throw new Error('Gagal mengeksekusi tutup buku');
    return res.json();
  },

  async deleteOtherCost(id: string) {
    const res = await fetch(`/api/v1/finance/other-costs/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      if (res.status === 409) {
        throw new Error('Periode telah ditutup (LOCKED). Biaya tidak dapat dihapus.');
      }
      throw new Error('Gagal menghapus biaya');
    }
    return res.json();
  },
};
