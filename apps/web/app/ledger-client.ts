import { Configuration, LedgerApi } from '@dailydose/api-client-ts/generated';
import { appLoading } from './components/app-loading';
import { notifySessionFailure } from './session-client';

export type LedgerBalance = {
  id: string;
  branchId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
  activationDate: Date;
  expiryAt: Date;
  ledgerBalance: number;
  reserved: number;
  available: number;
  packageName?: string;
  branchName?: string;
  classTypeName?: string;
  customer?: { id: string; displayName: string; phoneMasked: string | null };
};
export type LedgerHistory = {
  balance: LedgerBalance;
  entries: Array<{
    id: string;
    type: string;
    quantity: number;
    occurredAt: Date;
    referenceType?: string | null;
    referenceId?: string | null;
  }>;
  nextCursor?: string | null;
};
export type LedgerSummary = {
  packageCount: number;
  ledgerBalance: number;
  reserved: number;
  available: number;
};
export type Adjustment = {
  id: string;
  customerPackageId: string;
  quantity: number;
  reasonCode: string;
  status: 'PENDING' | 'POSTED' | 'REJECTED';
  version: number;
  createdAt?: Date;
  decidedAt?: Date | null;
  ledgerBalanceAtRequest?: number | null;
  reservedAtRequest?: number | null;
  customer?: { id: string; displayName: string; phoneMasked: string | null };
  branch?: { id: string; name: string };
  package?: { id: string; name: string };
  classType?: { id: string; name: string };
  requestedBy?: { id: string; displayName: string };
  decidedBy?: { id: string; displayName: string } | null;
  currentBalance?: number;
  currentReserved?: number;
  currentAvailable?: number;
  projectedLedgerBalance?: number;
  projectedAvailable?: number;
  eligibleForApproval?: boolean;
  eligibilityReason?: string | null;
  ledgerEntryId?: string | null;
  resultingBalance?: number | null;
};
export interface LedgerClient {
  list(
    branchId?: string,
    cursor?: string,
    search?: string,
    status?: 'ACTIVE' | 'EXPIRED' | 'INACTIVE',
  ): Promise<{
    items: LedgerBalance[];
    summary: LedgerSummary;
    nextCursor?: string | null;
  }>;
  detail(id: string, cursor?: string): Promise<LedgerHistory>;
  listAdjustments(
    branchId?: string,
    status?: 'PENDING' | 'POSTED' | 'REJECTED' | 'HISTORY',
    cursor?: string,
  ): Promise<{ items: Adjustment[]; nextCursor?: string | null }>;
  requestAdjustment(
    input: { customerPackageId: string; quantity: number; reasonCode: string },
    key: string,
  ): Promise<Adjustment>;
  decideAdjustment(
    id: string,
    decision: 'approve' | 'reject',
    input: { reasonCode: string; expectedVersion: number },
    key: string,
  ): Promise<Adjustment>;
}

const api = new LedgerApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
export const browserLedgerClient: LedgerClient = {
  async list(branchId, cursor, search, status) {
    const query = new URLSearchParams();
    if (branchId) query.set('branchId', branchId);
    if (cursor) query.set('cursor', cursor);
    if (search) query.set('search', search);
    if (status) query.set('status', status);
    const httpResponse = await appLoading.track(
      fetch(`/api/v1/customer-packages${query.size ? `?${query.toString()}` : ''}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      }),
      { label: 'Memuat ledger…' },
    );
    if (!httpResponse.ok) throw { response: httpResponse };
    const response = (await httpResponse.json()) as {
      items: LedgerBalance[];
      summary?: LedgerSummary;
      page: { nextCursor?: string | null };
    };
    return {
      items: response.items,
      summary: response.summary ?? {
        packageCount: response.items.length,
        ledgerBalance: response.items.reduce((sum, item) => sum + item.ledgerBalance, 0),
        reserved: response.items.reduce((sum, item) => sum + item.reserved, 0),
        available: response.items.reduce((sum, item) => sum + item.available, 0),
      },
      nextCursor: response.page.nextCursor,
    };
  },
  async detail(id, cursor) {
    const result = await appLoading.track(api.getPackageLedger({ id, cursor }), {
      label: 'Memuat histori sesi…',
    });
    return {
      balance: result.balance as LedgerBalance,
      entries: result.entries,
      nextCursor: result.page.nextCursor,
    };
  },
  async listAdjustments(branchId, status, cursor) {
    const result = await appLoading.track(
      api.listSessionAdjustments({ branchId, status: status as never, cursor }),
      {
        label: 'Memuat adjustment…',
      },
    );
    return {
      items: result.items as Adjustment[],
      nextCursor: result.page.nextCursor,
    };
  },
  async requestAdjustment(input, key) {
    return appLoading.track(
      api.requestSessionAdjustment({
        idempotencyKey: key,
        adjustmentCommand: input as never,
      }) as unknown as Promise<Adjustment>,
      { label: 'Mengajukan adjustment…' },
    );
  },
  async decideAdjustment(id, decision, input, key) {
    const result = await appLoading.track(
      api.decideSessionAdjustment({
        id,
        decision,
        idempotencyKey: key,
        sessionAdjustmentDecisionCommand: input as never,
      }),
      { label: 'Memproses keputusan adjustment…' },
    );
    return {
      ...(result.adjustment as unknown as Adjustment),
      ledgerEntryId: result.ledgerEntry?.id ?? null,
      resultingBalance: result.resultingBalance,
    };
  },
};

export async function ledgerFailure(error: unknown) {
  notifySessionFailure(error);
  const typed = error as { response?: Response & { status?: number }; message?: string };
  const status = typed.response?.status;
  const known = [
    'PENDING_ADJUSTMENT_EXISTS',
    'SEPARATION_OF_DUTIES_VIOLATION',
    'ADJUSTMENT_ALREADY_DECIDED',
    'STALE_VERSION',
    'IDEMPOTENCY_KEY_REUSED',
    'LEDGER_INVARIANT_VIOLATION',
    'CONFIGURATION_REQUIRED',
    'CONFLICT',
  ];
  let responseCode: string | undefined;
  if (typed.response?.clone) {
    const body = (await typed.response
      .clone()
      .json()
      .catch(() => undefined)) as { code?: string; error?: { code?: string } } | undefined;
    responseCode = body?.error?.code ?? body?.code;
  }
  const fromMessage = known.find((code) => responseCode === code || typed.message?.includes(code));
  const messages: Record<string, string> = {
    PENDING_ADJUSTMENT_EXISTS:
      'Paket ini sudah memiliki penyesuaian yang menunggu keputusan. Buka antrean sebelum membuat permintaan baru.',
    SEPARATION_OF_DUTIES_VIOLATION:
      'Permintaan harus diputuskan oleh Manager atau Super Owner yang berbeda dari requester.',
    ADJUSTMENT_ALREADY_DECIDED:
      'Permintaan sudah diputuskan. Muat ulang antrean untuk melihat hasil terbaru.',
    STALE_VERSION: 'Data penyesuaian telah berubah. Perbarui data sebelum mengambil keputusan.',
    IDEMPOTENCY_KEY_REUSED:
      'Isi permintaan berubah setelah konfirmasi. Tinjau ulang sebelum mengirim.',
    LEDGER_INVARIANT_VIOLATION:
      'Perubahan akan membuat saldo tidak cukup untuk sesi yang masih tertahan.',
    CONFIGURATION_REQUIRED:
      'Penyesuaian sesi belum diaktifkan pada environment ini. Ledger tetap dapat dibaca.',
    CONFLICT: 'Data berubah. Perbarui saldo dan antrean sebelum mencoba lagi.',
  };
  if (fromMessage) return messages[fromMessage] ?? fromMessage;
  if (status === 409) return messages.CONFLICT!;
  if (status === 404) return 'Data tidak ditemukan atau berada di luar cakupan cabang Anda.';
  if (status === 403) return 'Anda tidak memiliki permission atau cakupan cabang yang diperlukan.';
  if (status === 401) return 'Sesi Anda telah berakhir. Silakan masuk kembali.';
  if (status === 422 || status === 400)
    return 'Data belum valid. Periksa pilihan paket, jumlah sesi, dan alasan.';
  return 'Layanan belum dapat dijangkau. Coba kembali dengan permintaan yang sama.';
}
