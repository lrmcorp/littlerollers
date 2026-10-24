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

export interface OtherCostUpdate {
  category?: string;
  description?: string;
  amountRp?: number;
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
  verifiedFeeRp: number;
  unverifiedFeeRp: number;
  unverifiedClassCount: number;
}

export interface InstructorSessionItem {
  slotId: string;
  startAt: string;
  endAt: string;
  branchId: string;
  branchName: string;
  classTypeId: string;
  classTypeName: string;
  instructorId: string;
  instructorName: string;
  teachingHours: number;
  feePerJamRp: number;
  feeRp: number;
  isManualFee: boolean;
  attendanceVerified: boolean;
  attendanceTime: string | null;
  latitude: number | null;
  longitude: number | null;
  distanceMeters: number | null;
  isWithinGeofence: boolean | null;
}

export interface InstructorCostRealtimeData {
  period: string;
  branchId: string;
  totalInstructorCostRp: number;
  /** Honor kelas yang presensi instrukturnya sudah tercatat (QR atau verifikasi manual). */
  totalVerifiedFeeRp: number;
  /** Honor kelas selesai yang presensi instrukturnya belum tercatat; tetap ada di total. */
  totalUnverifiedFeeRp: number;
  unverifiedClassCount: number;
  totalTeachingHours: number;
  instructorCount: number;
  instructors: InstructorCostBreakdown[];
  sessions?: InstructorSessionItem[];
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
  grossProfitRp?: number;
  grossMarginPercent?: number;
  otherCostRp: number;
  netProfitRealtimeRp: number;
  netMarginPercent?: number;
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
  getOtherCostReport?(branchId?: string, period?: string): Promise<OtherCostReportData>;
  getMonthlyProfit?(branchId?: string, period?: string): Promise<MonthlyProfitData>;

  // Aksi Finansial
  executeMonthlyClose?(branchId: string, period: string, reason?: string): Promise<any>;
  /** Alasan wajib (K4): biaya yang dihapus tidak dapat dipulihkan. */
  deleteOtherCost?(id: string, reason: string): Promise<{ id: string; deleted: boolean }>;
  updateOtherCost?(id: string, input: OtherCostUpdate): Promise<unknown>;
}

async function financeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { headers, ...restInit } = init ?? {};
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...restInit,
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
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
      financeFetch<LegacyFinancialEntryPage>(
        `/finance/reconciliation/legacy-cashflow?${params.toString()}`,
      ),
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
      financeFetch<Correction>('/finance/correction-journals', {
        method: 'POST',
        body: JSON.stringify({
          branchId: command.branchId,
          currentPeriod: command.currentPeriod,
          referencePeriod: command.referencePeriod,
          amountRp: command.amountRp,
          reason: command.reason,
        }),
      }),
      { label: 'Membuat permintaan koreksi…' },
    );
  },
  async decideCorrection(id, decision, reason) {
    const result = await appLoading.track(
      financeFetch<{ correction: Correction }>(
        `/finance/correction-journals/${encodeURIComponent(id)}/${decision}`,
        { method: 'POST', body: JSON.stringify({ reason }) },
      ),
      { label: 'Memutuskan koreksi…' },
    );
    return {
      id: result.correction.id,
      status: result.correction.status,
      decision: decision.toUpperCase(),
      decidedAt: new Date(),
    };
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

  async deleteOtherCost(id: string, reason: string) {
    return financeFetch<{ id: string; deleted: boolean }>(`/finance/other-costs/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  },

  async updateOtherCost(id: string, input: OtherCostUpdate) {
    return financeFetch<unknown>(`/finance/other-costs/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
};

const financeMessages: Record<string, string> = {
  PERIOD_ALREADY_LOCKED: 'Periode ini sudah ditutup, sehingga biaya tidak dapat diubah atau dihapus.',
  INVALID_AMOUNT: 'Nominal harus berupa rupiah bulat lebih dari nol.',
  VALIDATION_ERROR: 'Data belum valid. Periksa kategori, keterangan, dan nominal.',
  FORBIDDEN: 'Anda tidak memiliki izin mengelola biaya lain.',
  NOT_FOUND: 'Biaya tidak ditemukan. Muat ulang daftar.',
};

/** Pesan khusus alur koreksi periode; menggantikan pesan biaya lain untuk kode yang sama. */
const correctionMessages: Record<string, string> = {
  SEPARATION_OF_DUTIES: 'Pengaju koreksi tidak boleh memutus koreksinya sendiri. Minta Super Owner lain.',
  CORRECTION_ALREADY_DECIDED: 'Koreksi ini sudah diputuskan. Muat ulang antrean.',
  VALIDATION_ERROR:
    'Data koreksi belum valid. Periode referensi harus sebelum periode berjalan, selisih tidak boleh nol, dan alasan 3–500 karakter.',
  FORBIDDEN: 'Anda tidak memiliki izin untuk tindakan ini. Memutus koreksi hanya untuk Super Owner.',
  NOT_FOUND: 'Koreksi tidak ditemukan. Muat ulang antrean.',
};

/** Pesan Indonesia untuk kegagalan permintaan Finance. */
export function financeFailureMessage(error: unknown, context?: 'correction'): string {
  const response = (error as { response?: { status?: number; data?: { code?: string; error?: { code?: string } } } })
    ?.response;
  const code = response?.data?.code ?? response?.data?.error?.code;
  const messages = context === 'correction' ? { ...financeMessages, ...correctionMessages } : financeMessages;
  if (code && messages[code]) return messages[code]!;
  if (response?.status === 403) return messages.FORBIDDEN!;
  if (response?.status === 404) return messages.NOT_FOUND!;
  if (response?.status === 400 || response?.status === 422) return messages.VALIDATION_ERROR!;
  return 'Permintaan belum berhasil. Periksa koneksi lalu coba lagi.';
}
