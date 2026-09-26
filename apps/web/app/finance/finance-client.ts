import { appLoading } from '../components/app-loading';

export interface Money {
  amountMinor: number;
  currency: string;
}

export interface Correction {
  id: string;
  branchId: string;
  currentPeriod: string;
  referencePeriod: string;
  amount: Money;
  reason: string;
  requestedBy: string;
  decidedBy?: string | null;
  status: 'PENDING' | 'APPROVED' | 'POSTED' | 'REJECTED' | string;
  version: number;
}

export interface CorrectionDecisionResult {
  id: string;
  status: string;
  decidedAt: Date;
  decision: 'APPROVE' | 'REJECT' | string;
}

export interface FinanceAnomaly {
  purchaseId: string;
  branchId: string;
  branchCode: string;
  amountRp: number;
  submittedAt: Date;
  code: string;
  message?: string;
}

export interface FinanceReconciliationOverview {
  generatedAt: Date;
  period: { from: string; until: string };
  financial: {
    collectedRp: number;
    recognizedRp: number;
    unearnedRp: number;
    discrepancyRp: number;
  };
  metrics?: any;
  branches?: any[];
}

export interface LegacyFinancialEntryPage {
  items: any[];
  total: number;
  page: { hasMore: boolean; nextCursor: string | null };
}

export interface BranchPeriodPage {
  items: Array<{
    id: string;
    branchId: string;
    period: string;
    status: string;
    closedAt?: Date | null;
    controlHash?: string | null;
    version: number;
  }>;
  page: { hasMore: boolean; nextCursor: string | null };
}

export interface CloseResult {
  period: string;
  branchId: string;
  status: string;
  closedAt: Date;
  controlHash?: string;
}

export interface FinancialReportPage {
  report: {
    period: string;
    controlHash: string;
    netProfitRp?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface FinanceExportResult {
  fileName: string;
  mimeType: any;
  content: string;
  controlHash: string;
  sourceCutoffAt: Date;
  completeness: string;
  exportId?: string;
  downloadUrl?: string;
  expiresAt?: Date;
}

export interface OtherCost {
  id: string;
  branchId: string;
  period: string;
  costDate: string;
  category: string;
  amountRp: number;
  description: string;
  receiptKey?: string | null;
  version: number;
}

export interface OtherCostCommand {
  branchId: string;
  period: string;
  amountRp: number;
  description: string;
  occurredOn?: Date;
  categoryCode?: string;
  reason?: string;
  costDate?: string;
  category?: string;
  receiptKey?: string | null;
}

export interface OtherCostPage {
  items: OtherCost[];
  total: number;
  page: { hasMore: boolean; nextCursor: string | null };
}

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

async function financeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    ...init,
  });
  if (!response.ok) {
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = undefined;
    }
    const error = new Error(`Finance request failed: ${response.status}`);
    (error as any).response = { status: response.status, data };
    throw error;
  }
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  return response.json() as Promise<T>;
}

export const browserFinanceClient: FinanceClient = {
  async overview(input) {
    const params = new URLSearchParams({
      from: `${input.from}T00:00:00.000Z`,
      until: `${input.until}T00:00:00.000Z`,
    });
    if (input.branchId) params.set('branchId', input.branchId);

    return appLoading.track(
      financeFetch<FinanceReconciliationOverview>(
        `/finance/reconciliation/overview?${params.toString()}`,
      ),
      { label: 'Memuat rekonsiliasi…' },
    );
  },
  async anomalies(input, cursor) {
    const params = new URLSearchParams({
      from: `${input.from}T00:00:00.000Z`,
      until: `${input.until}T00:00:00.000Z`,
      limit: '20',
    });
    if (input.branchId) params.set('branchId', input.branchId);
    if (cursor) params.set('cursor', cursor);

    const result = await appLoading.track(
      financeFetch<any>(`/finance/reconciliation/anomalies?${params.toString()}`),
      { label: 'Memuat anomali rekonsiliasi…' },
    );
    return {
      items: result.items || [],
      total: result.total || 0,
      page: {
        hasMore: result.page?.hasMore || false,
        nextCursor: result.page?.nextCursor ?? null,
      },
    };
  },
  legacyCashflow(input, cursor) {
    const params = new URLSearchParams({
      from: `${input.from}T00:00:00.000Z`,
      until: `${input.until}T00:00:00.000Z`,
      limit: '20',
    });
    if (input.branchId) params.set('branchId', input.branchId);
    if (cursor) params.set('cursor', cursor);

    return appLoading.track(
      financeFetch<LegacyFinancialEntryPage>(`/finance/legacy-cashflow?${params.toString()}`),
      { label: 'Memuat legacy cashflow…' },
    );
  },
  financialReport(branchId, period) {
    const params = new URLSearchParams({ reportType: 'profit', branchId, period });
    return appLoading.track(
      financeFetch<FinancialReportPage>(`/reports/financial?${params.toString()}`),
      { label: 'Memuat kontrol periode…' },
    );
  },
  exportReport(input) {
    return appLoading.track(
      financeFetch<FinanceExportResult>('/finance-exports', {
        method: 'POST',
        body: JSON.stringify({
          branchId: input.branchId,
          from: `${input.from}T00:00:00.000Z`,
          until: `${input.until}T00:00:00.000Z`,
        }),
      }),
      { label: 'Membuat export Finance…' },
    );
  },
  otherCosts(branchId, period, cursor) {
    const params = new URLSearchParams({ branchId, period });
    if (cursor) params.set('cursor', cursor);
    return appLoading.track(
      financeFetch<OtherCostPage>(`/other-costs?${params.toString()}`),
      { label: 'Memuat biaya lain…' },
    );
  },
  createOtherCost(command) {
    return appLoading.track(
      financeFetch<OtherCost>('/other-costs', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(command),
      }),
      { label: 'Mencatat biaya lain…' },
    );
  },
  periods(branchId, cursor) {
    const params = new URLSearchParams({ branchId });
    if (cursor) params.set('cursor', cursor);
    return appLoading.track(
      financeFetch<BranchPeriodPage>(`/periods?${params.toString()}`),
      { label: 'Memuat periode Finance…' },
    );
  },
  closeMonth(command) {
    return appLoading.track(
      financeFetch<CloseResult>('/monthly-closes', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(command),
      }),
      { label: 'Menutup periode…' },
    );
  },
  requestCorrection(command) {
    return appLoading.track(
      financeFetch<Correction>('/corrections', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({
          branchId: command.branchId,
          currentPeriod: command.currentPeriod,
          referencePeriod: command.referencePeriod,
          amount: { amountMinor: Math.round(command.amountRp * 100), currency: 'IDR' },
          reason: command.reason,
        }),
      }),
      { label: 'Membuat permintaan koreksi…' },
    );
  },
  decideCorrection(id, decision, reason) {
    return appLoading.track(
      financeFetch<CorrectionDecisionResult>(`/corrections/${id}/decision`, {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ decision: decision.toUpperCase(), reason }),
      }),
      { label: 'Memutuskan koreksi…' },
    );
  },
  async corrections(branchId, period, status = 'PENDING') {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (status) params.set('status', status);
    if (period) params.set('period', period);
    return financeFetch<{
      items: Correction[];
      page: { hasMore: boolean; nextCursor: string | null };
    }>(`/finance/correction-journals?${params.toString()}`);
  },

  // ============================================================================
  // 5 LAPORAN INTI
  // ============================================================================

  async getOmsetReport(branchId?: string, period?: string): Promise<OmsetReportData> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (period) params.set('period', period);
    return financeFetch<OmsetReportData>(`/finance/reports/omset?${params.toString()}`);
  },

  async getInstructorCostRealtime(
    branchId?: string,
    period?: string,
  ): Promise<InstructorCostRealtimeData> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (period) params.set('period', period);
    return financeFetch<InstructorCostRealtimeData>(
      `/finance/reports/instructor-cost-realtime?${params.toString()}`,
    );
  },

  async getInstructorCostProjection(
    branchId?: string,
    period?: string,
  ): Promise<InstructorCostProjectionData> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (period) params.set('period', period);
    return financeFetch<InstructorCostProjectionData>(
      `/finance/reports/instructor-cost-projection?${params.toString()}`,
    );
  },

  async getOtherCostReport(branchId?: string, period?: string): Promise<OtherCostReportData> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (period) params.set('period', period);
    return financeFetch<OtherCostReportData>(`/finance/reports/other-costs?${params.toString()}`);
  },

  async getMonthlyProfit(branchId?: string, period?: string): Promise<MonthlyProfitData> {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (period) params.set('period', period);
    return financeFetch<MonthlyProfitData>(`/finance/reports/profit-summary?${params.toString()}`);
  },

  async executeMonthlyClose(branchId: string, period: string, reason?: string) {
    return financeFetch<any>('/finance/monthly-closes/execute', {
      method: 'POST',
      body: JSON.stringify({ branchId, period, reason }),
    });
  },

  async deleteOtherCost(id: string) {
    return financeFetch<{ id: string; deleted: boolean }>(`/finance/other-costs/${id}`, {
      method: 'DELETE',
    });
  },
};
