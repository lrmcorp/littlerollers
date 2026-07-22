import { Configuration, PackagesApi } from '@dailydose/api-client-ts/generated';
import { notifySessionFailure } from './session-client';
export type PurchasePackage = {
  id: string;
  branchId: string;
  name: string;
  sessionCount: number;
  durationDays: number;
  priceRp: number;
};
export interface PurchaseClient {
  list(branchId: string): Promise<PurchasePackage[]>;
  issue(input: {
    branchId: string;
    packageId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    sha256: string;
  }): Promise<string>;
  finalize(
    id: string,
    sha256: string,
    sizeBytes: number,
  ): Promise<'PENDING' | 'CLEAN' | 'REJECTED' | 'INFECTED' | 'ERROR'>;
  submit(packageId: string, proofId: string, key: string): Promise<'PENDING'>;
}
export type ReviewPurchase = {
  id: string;
  branchId: string;
  userId: string;
  paymentProofId: string;
  packageNameSnapshot: string;
  priceRpSnapshot: number;
  sessionCountSnapshot: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  version: number;
};
export interface PurchaseReviewClient {
  list(branchId: string): Promise<ReviewPurchase[]>;
  authorizeProof(proofId: string): Promise<{ url: string; expiresAt: Date }>;
  approve(id: string, expectedVersion: number, key: string): Promise<'APPROVED'>;
  reject(
    id: string,
    expectedVersion: number,
    reasonCode:
      'PROOF_INVALID' | 'AMOUNT_MISMATCH' | 'DUPLICATE_PURCHASE' | 'OTHER_REVIEW_REQUIRED',
    key: string,
  ): Promise<'REJECTED'>;
}
const api = new PackagesApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
export const browserPurchaseClient: PurchaseClient = {
  async list(branchId) {
    return (await api.listPackages({ branchId })).items;
  },
  async issue(input) {
    return (await api.createPaymentProofUpload({ createPaymentProofUploadRequest: input })).id;
  },
  async finalize(id, sha256, sizeBytes) {
    return (
      await api.finalizePaymentProofUpload({
        id,
        idempotencyKey: crypto.randomUUID(),
        finalizeUploadCommand: { sha256, sizeBytes },
      })
    ).scanStatus;
  },
  async submit(packageId, paymentProofUploadId, idempotencyKey) {
    return (
      await api.submitPurchase({
        idempotencyKey,
        submitPurchaseRequest: { packageId, paymentProofUploadId },
      })
    ).status as 'PENDING';
  },
};
export const browserPurchaseReviewClient: PurchaseReviewClient = {
  async list(branchId) {
    return (await api.listPurchases({ branchId })).items as ReviewPurchase[];
  },
  async authorizeProof(id) {
    return api.authorizePaymentProofDownload({ id });
  },
  async approve(id, expectedVersion, idempotencyKey) {
    return (
      await api.approvePurchase({
        id,
        idempotencyKey,
        approvePurchaseRequest: { reasonCode: 'PAYMENT_VERIFIED', expectedVersion },
      })
    ).purchase.status as 'APPROVED';
  },
  async reject(id, expectedVersion, reasonCode, idempotencyKey) {
    return (
      await api.rejectPurchase({
        id,
        idempotencyKey,
        approvePurchaseRequest: { reasonCode, expectedVersion },
      })
    ).status as 'REJECTED';
  },
};
export function purchaseFailure(error: unknown) {
  notifySessionFailure(error);
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 503) return 'CONFIGURATION_REQUIRED';
  if (status === 409) return 'PAYMENT_PROOF_NOT_CLEAN_OR_DUPLICATE';
  if (status === 404) return 'RESOURCE_NOT_FOUND';
  if (status === 403) return 'FORBIDDEN';
  if (status === 401) return 'SESSION_EXPIRED';
  return 'OFFLINE_OR_PROVIDER_FAILURE';
}
