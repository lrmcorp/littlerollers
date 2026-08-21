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
  sessionCountSnapshot?: number;
  usage?: {
    initialSessions: number;
    usedSessions: number;
    reversedSessions: number;
    adjustmentDelta: number;
  };
  packageName?: string;
  branchName?: string;
  classTypeName?: string;
  customer?: { id: string; displayName: string; phoneMasked: string | null };
};
export type LedgerHistory = {
  balance: LedgerBalance;
  reservations: {
    activeQuantity: number;
    items: Array<{
      id: string;
      quantity: number;
      createdAt: Date;
      bookingId?: string | null;
      bookingStatus?: string | null;
      className?: string | null;
      branchName?: string | null;
      startsAt?: Date | null;
    }>;
  };
  entries: Array<{
    id: string;
    type: string;
    quantity: number;
    occurredAt: Date;
    referenceType?: string | null;
    referenceId?: string | null;
    referenceLabel?: string | null;
    bookingId?: string | null;
    balanceAfter?: number | null;
  }>;
  nextCursor?: string | null;
  previousCursor?: string | null;
};
export type LedgerSummary = {
  packageCount: number;
  activePackageCount?: number;
  ledgerBalance: number;
  reserved: number;
  available: number;
  usedSessions?: number;
  reversedSessions?: number;
  adjustmentDelta?: number;
  expiringSoon?: number;
};
export type AdjustmentSummary = {
  total: number;
  pending: number;
  posted: number;
  rejected: number;
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
  decisionCode?: string | null;
  decisionNote?: string | null;
  auditReference?: string | null;
};
export interface LedgerClient {
  list(
    branchId?: string,
    cursor?: string,
    search?: string,
    status?: 'ACTIVE' | 'EXPIRED' | 'INACTIVE',
    customerUserId?: string,
  ): Promise<{
    items: LedgerBalance[];
    summary: LedgerSummary;
    nextCursor?: string | null;
    previousCursor?: string | null;
  }>;
  detail(id: string, cursor?: string): Promise<LedgerHistory>;
  listAdjustments(
    branchId?: string,
    status?: 'PENDING' | 'POSTED' | 'REJECTED' | 'HISTORY',
    cursor?: string,
    q?: string,
    customerUserId?: string,
    from?: string,
    until?: string,
    limit?: number,
  ): Promise<{
    items: Adjustment[];
    summary?: AdjustmentSummary;
    nextCursor?: string | null;
    previousCursor?: string | null;
  }>;
  getAdjustment(id: string): Promise<Adjustment>;
  requestAdjustment(
    input: { customerPackageId: string; quantity: number; reasonCode: string },
    key: string,
  ): Promise<Adjustment>;
  decideAdjustment(
    id: string,
    decision: 'approve' | 'reject',
    input: { reasonCode: string; note?: string; expectedVersion: number },
    key: string,
  ): Promise<Adjustment>;
}

const api = new LedgerApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
const mapLedgerBalance = (
  value: Omit<LedgerBalance, 'activationDate' | 'expiryAt'> & {
    activationDate: Date | string;
    expiryAt: Date | string;
  },
): LedgerBalance => ({
  ...value,
  activationDate: new Date(value.activationDate),
  expiryAt: new Date(value.expiryAt),
});
const mapAdjustment = (value: Adjustment): Adjustment => ({
  ...value,
  createdAt: value.createdAt ? new Date(value.createdAt) : undefined,
  decidedAt: value.decidedAt ? new Date(value.decidedAt) : null,
});

export const browserLedgerClient: LedgerClient = {
  async list(branchId, cursor, search, status, customerUserId) {
    const response = await appLoading.track(
      api.listCustomerPackages({
        branchId,
        cursor,
        search,
        status: status as never,
        customerUserId,
      }),
      { label: 'Memuat ledger…' },
    );
    const items = response.items.map((item) =>
      mapLedgerBalance(item as unknown as Parameters<typeof mapLedgerBalance>[0]),
    );
    return {
      items,
      summary: response.summary ?? {
        packageCount: items.length,
        ledgerBalance: items.reduce((sum, item) => sum + item.ledgerBalance, 0),
        reserved: items.reduce((sum, item) => sum + item.reserved, 0),
        available: items.reduce((sum, item) => sum + item.available, 0),
      },
      nextCursor: response.page.nextCursor,
      previousCursor: response.page.previousCursor,
    };
  },
  async detail(id, cursor) {
    const result = await appLoading.track(api.getPackageLedger({ id, cursor }), {
      label: 'Memuat histori sesi…',
    });
    return {
      balance: mapLedgerBalance(result.balance as Parameters<typeof mapLedgerBalance>[0]),
      reservations: {
        activeQuantity: result.reservations.activeQuantity,
        items: result.reservations.items.map((reservation) => ({
          ...reservation,
          createdAt: new Date(reservation.createdAt),
          startsAt: reservation.startsAt ? new Date(reservation.startsAt) : null,
        })),
      },
      entries: result.entries.map((entry) => ({
        ...entry,
        occurredAt: new Date(entry.occurredAt),
      })),
      nextCursor: result.page.nextCursor,
      previousCursor: result.page.previousCursor,
    };
  },
  async listAdjustments(branchId, status, cursor, q, customerUserId, from, until, limit) {
    const result = await appLoading.track(
      api.listSessionAdjustments({
        branchId,
        status: status as never,
        cursor,
        q,
        customerUserId,
        from: from ? new Date(from) : undefined,
        until: until ? new Date(until) : undefined,
        limit,
      }),
      { label: 'Memuat adjustment…' },
    );
    return {
      items: result.items.map((item) => mapAdjustment(item as unknown as Adjustment)),
      summary: result.summary as AdjustmentSummary,
      nextCursor: result.page.nextCursor,
      previousCursor: result.page.previousCursor,
    };
  },
  async getAdjustment(id) {
    const response = await appLoading.track(api.getSessionAdjustment({ id }), {
      label: 'Memuat detail penyesuaian…',
    });
    return mapAdjustment(response as unknown as Adjustment);
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
      auditReference: result.auditReference ?? null,
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
      'Permintaan harus diputuskan oleh Manager atau Super Admin yang berbeda dari requester.',
    ADJUSTMENT_ALREADY_DECIDED:
      'Permintaan sudah diputuskan. Muat ulang antrean untuk melihat hasil terbaru.',
    STALE_VERSION: 'Data penyesuaian telah berubah. Perbarui data sebelum mengambil keputusan.',
    IDEMPOTENCY_KEY_REUSED:
      'Isi permintaan berubah setelah konfirmasi. Tinjau ulang sebelum mengirim.',
    LEDGER_INVARIANT_VIOLATION:
      'Perubahan akan membuat saldo tidak cukup untuk sesi yang masih tertahan.',
    CONFIGURATION_REQUIRED: 'Penyesuaian sesi sementara tidak tersedia. Saldo tetap dapat dilihat.',
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
