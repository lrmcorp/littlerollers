import {
  Configuration,
  PackagesApi,
  type ApprovalResult,
  type Package,
  type PaymentReviewDetail,
  type PaymentReviewItem,
  type PaymentReviewPage,
  type PaymentReviewSummary,
  type PaymentProof,
  type Purchase,
} from '@dailydose/api-client-ts/generated';
import { appLoading, foregroundFetch } from './components/app-loading';
import { notifySessionFailure } from './session-client';

export type PurchasePackage = Package;
type VoucherPaymentSnapshot = {
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
  submit(packageId: string, proofId: string, key: string): Promise<Purchase>;
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

const configuration = new Configuration({ basePath: '/api/v1', credentials: 'include' });
const api = new PackagesApi(configuration);

const proofFromInstruction = (value: { id: string; status: unknown; scanStatus: unknown }) => ({
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
    const result = await api.listPackages({ branchId, cursor });
    return { items: result.items, nextCursor: result.page.nextCursor };
  },
  async issue(input) {
    return proofFromInstruction(
      await api.createPaymentProofUpload({ createPaymentProofUploadRequest: input }),
    );
  },
  finalize(id, sha256, sizeBytes) {
    return api.finalizePaymentProofUpload({
      id,
      idempotencyKey: crypto.randomUUID(),
      finalizeUploadCommand: { sha256, sizeBytes },
    });
  },
  status(id) {
    return api.getPaymentProofStatus({ id });
  },
  async replace(id, newPaymentProofUploadId, expectedVersion, idempotencyKey) {
    await api.replacePurchasePaymentProof({
      id,
      idempotencyKey,
      replacePaymentProofCommand: {
        newPaymentProofUploadId,
        expectedVersion,
        reason: 'CUSTOMER_REPLACEMENT',
      },
    });
  },
  submit(packageId, paymentProofUploadId, idempotencyKey) {
    return api.submitPurchase({
      idempotencyKey,
      submitPurchaseRequest: { packageId, paymentProofUploadId },
    });
  },
};

export const browserPurchaseReviewClient: PurchaseReviewClient = {
  list(filters = {}) {
    return appLoading.track(api.listPurchases(filters), { label: 'Memuat pembayaran…' });
  },
  detail(id, usageCursor) {
    return appLoading.track(api.getPaymentReviewDetail({ id, usageCursor }), {
      label: 'Memuat detail pembayaran…',
    });
  },
  async loadProof(id) {
    const authorization = await appLoading.track(api.authorizePaymentProofDownload({ id }), {
      label: 'Menyiapkan bukti pembayaran…',
    });
    const response = await foregroundFetch(
      authorization.url,
      {
        credentials: 'include',
        headers: { Accept: 'image/*,application/pdf' },
      },
      'Memuat bukti pembayaran…',
    );
    if (!response.ok) throw { response: { status: response.status } };
    return response.blob();
  },
  async approve(id, expectedVersion, idempotencyKey, note) {
    return appLoading.track(
      api.approvePurchase({
        id,
        idempotencyKey,
        approvePurchaseRequest: { reasonCode: 'PAYMENT_VERIFIED', expectedVersion, note },
      }),
      { label: 'Menyetujui pembayaran…' },
    );
  },
  reject(id, expectedVersion, reasonCode, idempotencyKey, note) {
    return appLoading.track(
      api.rejectPurchase({
        id,
        idempotencyKey,
        approvePurchaseRequest: { reasonCode, expectedVersion, note },
      }),
      { label: 'Memproses keputusan pembayaran…' },
    );
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
    CONFIGURATION_REQUIRED: 'Layanan penyimpanan atau pemindaian belum dikonfigurasi.',
    PAYMENT_PROOF_NOT_CLEAN: 'Bukti belum dinyatakan bersih dan belum dapat digunakan.',
    PAYMENT_PROOF_UNSAFE: 'Bukti ditolak karena hasil pemeriksaan keamanan.',
    PAYMENT_PROOF_SCAN_UNAVAILABLE:
      'Pemindai bukti sedang tidak tersedia. Coba kembali beberapa saat lagi.',
    PRIVATE_STORAGE_UNAVAILABLE: 'File bukti tidak ditemukan pada penyimpanan privat.',
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
