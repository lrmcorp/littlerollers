import { Configuration, PackagesApi } from '@dailydose/api-client-ts/generated';
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
    ).status;
  },
};
export function purchaseFailure(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 503) return 'CONFIGURATION_REQUIRED';
  if (status === 409) return 'PAYMENT_PROOF_NOT_CLEAN_OR_DUPLICATE';
  if (status === 404) return 'RESOURCE_NOT_FOUND';
  if (status === 403) return 'FORBIDDEN';
  return 'OFFLINE_OR_PROVIDER_FAILURE';
}
