import { apiFetch } from '../lib/api-client';
import { appLoading, foregroundFetch } from '../components/app-loading';
import { notifySessionFailure } from './session-client';

export interface PackageBranchScope {
  id?: string;
  branchId: string;
  active: boolean;
  branch?: { id: string; code: string; name: string };
}

export interface PackageClassTypeScope {
  id: string;
  classTypeId: string;
  active: boolean;
  classType?: { id: string; code: string; name: string };
}

export interface Package {
  id: string;
  businessKey?: string;
  name: string;
  sessionCount: number;
  durationDays: number;
  priceRp: number;
  status: string;
  effectiveState?: string;
  livePromotion?: boolean;
  effectiveFrom: Date;
  effectiveUntil?: Date | null;
  branchScopes?: Array<PackageBranchScope>;
  classTypeScopes?: Array<PackageClassTypeScope>;
  revisions?: Array<any>;
  version?: number;
}

export interface PaymentProof {
  id: string;
  uploadStatus: 'ISSUED' | 'UPLOADED' | 'FAILED' | 'FINALIZED' | string;
  scanStatus: 'PENDING' | 'CLEAN' | 'INFECTED' | 'FAILED' | string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  version?: number;
  finalizedAt?: Date | null;
}

export interface Purchase {
  id: string;
  orderNumber?: string;
  branchId: string;
  userId: string;
  packageId: string;
  paymentProofId?: string | null;
  packageNameSnapshot: string;
  priceRpSnapshot: number;
  sessionCountSnapshot?: number;
  durationDaysSnapshot?: number;
  packagePromotionId?: string | null;
  packagePromotionNameSnapshot?: string | null;
  packagePromotionDiscountRpSnapshot?: number | null;
  promotionalPriceRpSnapshot?: number | null;
  voucherId?: string | null;
  voucherCodeSnapshot?: string | null;
  voucherDiscountRpSnapshot?: number | null;
  priceAfterDiscountRpSnapshot?: number | null;
  paymentUniqueCode?: number | null;
  payableAmountRpSnapshot?: number | null;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'AWAITING_PAYMENT' | 'ACTION_REQUIRED' | 'EXPIRED' | string;
  auditReference?: string | null;
  createdAt?: Date;
  submittedAt?: Date;
  decidedAt?: Date | null;
  version: number;
  branch?: { id: string; code: string; name: string };
  user?: { id: string; displayName: string; email?: string; phoneMasked?: string | null };
  package?: { id: string; name: string; sessionCount?: number };
}

export interface CustomerPackageBalanceSnapshot {
  id?: string;
  customerPackageId?: string;
  packageName?: string;
  available: number;
  sessionCount?: number;
  used?: number;
  status?: string;
  [key: string]: any;
}

export interface LedgerEntrySnapshot {
  id: string;
  type?: string;
  amount?: number;
  [key: string]: any;
}

export interface ApprovalResult {
  purchase: Purchase;
  customerPackage: CustomerPackageBalanceSnapshot;
  ledgerEntry: LedgerEntrySnapshot;
  idempotentReplay?: boolean;
  id?: string;
  status?: string;
  version?: number;
  decidedAt?: Date;
  customerPackageId?: string;
}

export interface PaymentReviewCustomer {
  id: string;
  displayName: string;
  phoneMasked: string | null;
  email?: string | null;
}

export interface PaymentReviewBranch {
  id: string;
  code: string;
  name: string;
  timezone: string;
}

export interface PaymentReviewProof {
  id: string;
  uploadStatus: string;
  scanStatus: string;
  mimeType: string;
  sizeBytes: number;
  finalizedAt?: Date | null;
}

export interface PaymentActivationSummary {
  customerPackageId: string;
  status: string;
  activationDate: Date;
  expiryAt: Date;
  sessionCount: number;
  ledgerBalance: number;
  reserved: number;
  available: number;
  used: number;
}

export interface PaymentActivationResult {
  customerPackageId: string;
  packageId: string;
  packageName: string;
  status: string;
  sessionCount: number;
  activationDate: Date;
  expiryAt: Date;
  ledgerEntryId: string | null;
  ledgerQuantity?: number | null;
  ledgerOccurredAt?: Date | null;
}

export interface PaymentReviewTimeline {
  submittedAt: Date;
  proofFinalizedAt: Date | null;
  decidedAt: Date | null;
}

export interface PaymentUsageHistoryItem {
  id: string;
  type: string;
  label: string;
  quantity: number;
  balanceAfter: number;
  occurredAt: Date;
  auditReference?: string | null;
}

export interface PaymentUsageHistoryPage {
  items: Array<PaymentUsageHistoryItem>;
  page: { nextCursor?: string | null; hasMore?: boolean; previousCursor?: string | null };
}

export interface PaymentReviewItem {
  id: string;
  branchId: string;
  userId: string;
  packageId: string;
  paymentProofId?: string;
  packageNameSnapshot: string;
  priceRpSnapshot: number;
  packagePromotionId?: string;
  packagePromotionNameSnapshot?: string;
  packagePromotionDiscountTypeSnapshot?: string | null;
  packagePromotionDiscountValueSnapshot?: number;
  packagePromotionDiscountRpSnapshot?: number;
  promotionalPriceRpSnapshot?: number;
  voucherId?: string;
  voucherCodeSnapshot?: string;
  voucherDiscountTypeSnapshot?: string | null;
  voucherDiscountValueSnapshot?: number;
  voucherDiscountRpSnapshot?: number;
  priceAfterDiscountRpSnapshot?: number;
  paymentUniqueCode?: number;
  payableAmountRpSnapshot?: number;
  sessionCountSnapshot: number;
  durationDaysSnapshot: number;
  status: string;
  submittedAt: Date;
  paymentExpiresAt?: Date;
  decidedAt?: Date | null;
  decidedById?: string | null;
  decisionReasonCode?: string | null;
  auditReference: string | null;
  version: number;
  customer: PaymentReviewCustomer;
  branch: PaymentReviewBranch;
  paymentProof: PaymentReviewProof | null;
  activationSummary: PaymentActivationSummary | null;
  recordedById?: string | null;
  recordedBy?: { id: string; displayName: string } | null;
}

export interface PaymentReviewSummary {
  pending: number;
  actionRequired: number;
  approved: number;
  rejected: number;
  expired: number;
  totalAmountRp: number;
  agingOver24Hours?: number;
  totalCount?: number;
  total?: number;
}

export interface PaymentReviewPage {
  items: PaymentReviewItem[];
  page: { nextCursor: string | null; hasMore?: boolean; previousCursor?: string | null };
  summary: PaymentReviewSummary;
  generatedAt: Date;
}

export interface PaymentReviewDetail {
  purchase: PaymentReviewItem;
  timeline: PaymentReviewTimeline;
  decisionActorMasked: string | null;
  activation: PaymentActivationResult | null;
  balance: PaymentActivationSummary | null;
  usageHistory: PaymentUsageHistoryPage;
}

export type PurchasePackage = Package;
type VoucherPaymentSnapshot = {
  packagePromotionId?: string | null;
  packagePromotionNameSnapshot?: string | null;
  packagePromotionDiscountRpSnapshot?: number | null;
  promotionalPriceRpSnapshot?: number | null;
  voucherId?: string | null;
  voucherCodeSnapshot?: string | null;
  voucherDiscountRpSnapshot?: number | null;
  priceAfterDiscountRpSnapshot?: number | null;
};
export type ReviewPurchase = PaymentReviewItem & VoucherPaymentSnapshot;
export type ReviewSummary = PaymentReviewSummary;
export type ReviewDetail = Omit<PaymentReviewDetail, 'purchase'> & {
  purchase: PaymentReviewDetail['purchase'] & VoucherPaymentSnapshot;
};
export type ReviewApprovalResult = ApprovalResult;

export interface PaymentReviewFilters {
  branchId?: string;
  status?: string;
  cursor?: string;
  limit?: number;
  q?: string;
  from?: Date;
  until?: Date;
  purchaseId?: string;
}

export interface PurchaseDiscovery {
  items: PurchasePackage[];
  nextCursor?: string | null;
}

export interface PurchaseClient {
  list(branchId: string, cursor?: string): Promise<PurchaseDiscovery>;
  issue(input: {
    branchId: string;
    packageId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
  }): Promise<PaymentProof>;
  finalize(id: string, sha256: string, sizeBytes: number): Promise<PaymentProof>;
  status(id: string): Promise<PaymentProof>;
  replace(purchaseId: string, proofId: string, expectedVersion: number, key: string): Promise<void>;
  submit(
    packageId: string,
    proofId: string,
    branchId: string,
    classTypeId: string,
    key: string,
  ): Promise<Purchase>;
}

export interface PurchaseReviewClient {
  list(filters?: PaymentReviewFilters): Promise<PaymentReviewPage>;
  detail(id: string, usageCursor?: string): Promise<PaymentReviewDetail>;
  loadProof(proofId: string): Promise<Blob>;
  approve(id: string, expectedVersion: number, key: string, note?: string): Promise<ApprovalResult>;
  reject(
    id: string,
    expectedVersion: number,
    reasonCode:
      'PROOF_INVALID' | 'AMOUNT_MISMATCH' | 'DUPLICATE_PURCHASE' | 'OTHER_REVIEW_REQUIRED',
    key: string,
    note?: string,
  ): Promise<Purchase>;
}

export function toDate(val: string | Date | undefined | null): Date {
  return val instanceof Date ? val : new Date(val ?? 0);
}

export function toOptionalDate(val: string | Date | undefined | null): Date | null {
  if (!val) return null;
  return val instanceof Date ? val : new Date(val);
}

export function mapPackage(raw: any): PurchasePackage {
  if (!raw) return raw;
  return {
    ...raw,
    effectiveFrom: toDate(raw.effectiveFrom),
    effectiveUntil: toOptionalDate(raw.effectiveUntil),
  };
}

export function mapPaymentProof(raw: any): PaymentProof {
  if (!raw) return raw;
  return {
    ...raw,
    finalizedAt: toOptionalDate(raw.finalizedAt),
  };
}

export function mapPurchase(raw: any): Purchase {
  if (!raw) return raw;
  return {
    ...raw,
    createdAt: toOptionalDate(raw.createdAt) ?? undefined,
    submittedAt: toOptionalDate(raw.submittedAt) ?? undefined,
    decidedAt: toOptionalDate(raw.decidedAt),
  };
}

export function mapActivationSummary(raw: any): PaymentActivationSummary | null {
  if (!raw) return null;
  return {
    ...raw,
    activationDate: toDate(raw.activationDate),
    expiryAt: toDate(raw.expiryAt),
  };
}

export function mapReviewProof(raw: any): PaymentReviewProof | null {
  if (!raw) return null;
  return {
    ...raw,
    finalizedAt: toOptionalDate(raw.finalizedAt),
  };
}

export function mapReviewItem(raw: any): PaymentReviewItem {
  if (!raw) return raw;
  return {
    ...raw,
    submittedAt: toDate(raw.submittedAt),
    decidedAt: toOptionalDate(raw.decidedAt),
    paymentExpiresAt: toOptionalDate(raw.paymentExpiresAt) ?? undefined,
    paymentProof: mapReviewProof(raw.paymentProof),
    activationSummary: mapActivationSummary(raw.activationSummary),
  };
}

export function mapReviewDetail(raw: any): PaymentReviewDetail {
  if (!raw) return raw;
  return {
    ...raw,
    purchase: mapReviewItem(raw.purchase),
    timeline: {
      submittedAt: toDate(raw.timeline?.submittedAt),
      proofFinalizedAt: toOptionalDate(raw.timeline?.proofFinalizedAt),
      decidedAt: toOptionalDate(raw.timeline?.decidedAt),
    },
    activation: raw.activation
      ? {
          ...raw.activation,
          activationDate: toDate(raw.activation.activationDate),
          expiryAt: toDate(raw.activation.expiryAt),
          ledgerOccurredAt: toOptionalDate(raw.activation.ledgerOccurredAt),
        }
      : null,
    balance: mapActivationSummary(raw.balance),
    usageHistory: {
      ...raw.usageHistory,
      items: (raw.usageHistory?.items ?? []).map((item: any) => ({
        ...item,
        occurredAt: toDate(item.occurredAt),
      })),
    },
  };
}

export function mapApprovalResult(raw: any): ApprovalResult {
  if (!raw) return raw;
  return {
    ...raw,
    purchase: mapPurchase(raw.purchase),
    decidedAt: toOptionalDate(raw.decidedAt) ?? undefined,
  };
}

const proofFromInstruction = (value: { id: string; status?: unknown; scanStatus?: unknown }) => ({
  id: value.id,
  uploadStatus: String(value.status ?? 'ISSUED') as PaymentProof['uploadStatus'],
  scanStatus: String(value.scanStatus ?? 'PENDING') as PaymentProof['scanStatus'],
  fileName: '',
  mimeType: '',
  sizeBytes: 0,
  version: 0,
});

export const browserPurchaseClient: PurchaseClient = {
  async list(branchId, cursor) {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    if (cursor) params.set('cursor', cursor);
    const result = await apiFetch<{ items: any[]; page: { nextCursor: string | null } }>(
      `/packages?${params.toString()}`,
      { label: 'Memuat katalog paket…' },
    );
    return {
      items: (result.items ?? []).map(mapPackage),
      nextCursor: result.page?.nextCursor ?? null,
    };
  },
  async issue(input) {
    const result = await apiFetch<{ id: string; status?: unknown; scanStatus?: unknown }>(
      '/uploads/payment-proofs',
      {
        method: 'POST',
        body: JSON.stringify(input),
        label: 'Mengunggah bukti pembayaran…',
      },
    );
    return proofFromInstruction(result);
  },
  finalize(id, sha256, sizeBytes) {
    return apiFetch<PaymentProof>(`/uploads/payment-proofs/${encodeURIComponent(id)}/finalize`, {
      method: 'POST',
      idempotent: true,
      headers: { 'idempotency-key': crypto.randomUUID() },
      body: JSON.stringify({ sha256, sizeBytes }),
      label: 'Memfinalisasi bukti…',
    }).then(mapPaymentProof);
  },
  status(id) {
    return apiFetch<PaymentProof>(`/uploads/payment-proofs/${encodeURIComponent(id)}`, {
      label: 'Memeriksa status bukti…',
    }).then(mapPaymentProof);
  },
  async replace(id, newPaymentProofUploadId, expectedVersion, idempotencyKey) {
    await apiFetch(`/purchases/${encodeURIComponent(id)}/payment-proof-replacements`, {
      method: 'POST',
      idempotent: true,
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify({
        newPaymentProofUploadId,
        expectedVersion,
        reason: 'CUSTOMER_REPLACEMENT',
      }),
      label: 'Mengganti bukti pembayaran…',
    });
  },
  submit(packageId, paymentProofUploadId, branchId, classTypeId, idempotencyKey) {
    return apiFetch<Purchase>('/purchases', {
      method: 'POST',
      idempotent: true,
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify({
        packageId,
        branchId,
        classTypeId,
        paymentProofUploadId,
      }),
      label: 'Mengirim pesanan…',
    }).then(mapPurchase);
  },
};

export const browserPurchaseReviewClient: PurchaseReviewClient = {
  async list(filters = {}) {
    const params = new URLSearchParams();
    if (filters.branchId) params.set('branchId', filters.branchId);
    if (filters.status) params.set('status', filters.status);
    if (filters.cursor) params.set('cursor', filters.cursor);
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.q) params.set('q', filters.q);
    if (filters.purchaseId) params.set('purchaseId', filters.purchaseId);
    if (filters.from) params.set('from', filters.from.toISOString());
    if (filters.until) params.set('until', filters.until.toISOString());
    const result = await apiFetch<any>(`/purchases?${params.toString()}`, {
      label: 'Memuat pembayaran…',
    });
    return {
      ...result,
      items: (result.items ?? []).map(mapReviewItem),
      generatedAt: toDate(result.generatedAt),
    };
  },
  detail(id, usageCursor) {
    const params = new URLSearchParams();
    if (usageCursor) params.set('usageCursor', usageCursor);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<PaymentReviewDetail>(`/purchases/${encodeURIComponent(id)}${query}`, {
      label: 'Memuat detail pembayaran…',
    }).then(mapReviewDetail);
  },
  async loadProof(id) {
    const authorization = await apiFetch<{ url: string }>(
      `/uploads/payment-proofs/${encodeURIComponent(id)}/download-authorizations`,
      {
        method: 'POST',
        label: 'Menyiapkan bukti pembayaran…',
      },
    );
    let targetUrl = authorization.url;
    if (targetUrl.includes('/uploads/payment-proofs/') && !targetUrl.includes('/view-authorizations/')) {
      targetUrl = `/api/v1/uploads/payment-proofs/view-authorizations/${encodeURIComponent(id)}/content`;
    } else if (targetUrl.startsWith('/') && !targetUrl.startsWith('/api/v1')) {
      targetUrl = `/api/v1${targetUrl}`;
    }
    const response = await foregroundFetch(
      targetUrl,
      {
        credentials: 'include',
        headers: { Accept: 'image/*,application/pdf' },
      },
      'Memuat bukti pembayaran…',
    );
    if (!response.ok) throw { response: { status: response.status } };
    return response.blob();
  },
  approve(id, expectedVersion, idempotencyKey, note) {
    return apiFetch<ApprovalResult>(`/purchases/${encodeURIComponent(id)}/approve`, {
      method: 'POST',
      idempotent: true,
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify({ reasonCode: 'PAYMENT_VERIFIED', expectedVersion, note }),
      label: 'Menyetujui pembayaran…',
    }).then(mapApprovalResult);
  },
  reject(id, expectedVersion, reasonCode, idempotencyKey, note) {
    return apiFetch<Purchase>(`/purchases/${encodeURIComponent(id)}/reject`, {
      method: 'POST',
      idempotent: true,
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify({ reasonCode, expectedVersion, note }),
      label: 'Memproses keputusan pembayaran…',
    }).then(mapPurchase);
  },
};

export async function sha256File(file: File) {
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

export function purchaseFailure(error: unknown): string {
  notifySessionFailure(error);
  const response = (
    error as {
      response?: { status?: number; data?: { error?: { code?: string } } };
    }
  )?.response;
  const code = response?.data?.error?.code;
  const messages: Record<string, string> = {
    CONFIGURATION_REQUIRED: 'Bukti pembayaran sementara belum dapat diproses.',
    PAYMENT_PROOF_NOT_CLEAN: 'Bukti belum dinyatakan bersih dan belum dapat digunakan.',
    PAYMENT_PROOF_UNSAFE: 'Bukti ditolak karena hasil pemeriksaan keamanan.',
    PAYMENT_PROOF_SCAN_UNAVAILABLE:
      'Pemindai bukti sedang tidak tersedia. Coba kembali beberapa saat lagi.',
    PRIVATE_STORAGE_UNAVAILABLE: 'File bukti belum tersedia. Silakan unggah kembali.',
    VALIDATION_ERROR: 'File atau data purchase belum valid.',
    IDEMPOTENCY_KEY_REUSED: 'Intent yang sama sudah digunakan dengan data berbeda.',
    IDEMPOTENCY_IN_PROGRESS: 'Permintaan sebelumnya masih diproses. Coba lagi tanpa mengubah data.',
    PURCHASE_ALREADY_DECIDED: 'Purchase ini sudah memiliki keputusan.',
    STALE_VERSION: 'Data purchase berubah. Muat ulang sebelum mengambil keputusan.',
    SEPARATION_OF_DUTIES_VIOLATION: 'Purchase tidak boleh diputus oleh requestor yang sama.',
    RESOURCE_NOT_FOUND: 'Data tidak tersedia dalam cabang yang dipilih.',
  };
  if (code && messages[code]) return messages[code];
  if (response?.status === 503) return messages.CONFIGURATION_REQUIRED!;
  if (response?.status === 409) return 'Purchase atau bukti mengalami konflik. Muat ulang.';
  if (response?.status === 404) return messages.RESOURCE_NOT_FOUND!;
  if (response?.status === 403) return 'Anda tidak memiliki izin untuk tindakan ini.';
  if (response?.status === 401) return 'Sesi berakhir. Silakan masuk kembali.';
  if (response?.status === 400 || response?.status === 422) return messages.VALIDATION_ERROR!;
  return 'Layanan purchase tidak dapat dijangkau. Periksa koneksi lalu coba lagi.';
}
