export type OrderStatus =
  'AWAITING_PAYMENT' | 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface CheckoutOptions {
  package: {
    id: string;
    name: string;
    priceRp: number;
    sessionCount: number;
    durationDays: number;
    branchId: string;
    branchName: string;
    classTypeId: string;
    classTypeName: string;
  };
  paymentAccount: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    paymentWindowHours: number;
  };
}

export interface CustomerOrder {
  id: string;
  branchId: string;
  branchName?: string;
  packageId: string;
  packageName: string;
  priceRp: number;
  sessionCount: number;
  durationDays: number;
  status: OrderStatus;
  submittedAt: Date;
  expiresAt: Date | null;
  continuationSlotId: string | null;
  paymentProofId: string | null;
  decisionReasonCode: string | null;
  version: number;
  paymentAccount: null | {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { credentials: 'include', ...init });
  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as {
      code?: string;
      error?: { code?: string };
    };
    throw new Error(problem.error?.code || problem.code || `HTTP_${response.status}`);
  }
  return response.json() as Promise<T>;
}

const orderDates = (
  order: Omit<CustomerOrder, 'submittedAt' | 'expiresAt'> & {
    submittedAt: string;
    expiresAt: string | null;
  },
): CustomerOrder => ({
  ...order,
  submittedAt: new Date(order.submittedAt),
  expiresAt: order.expiresAt ? new Date(order.expiresAt) : null,
});

export const browserOrderClient = {
  checkout(packageId: string) {
    return request<CheckoutOptions>(`/checkout/options?packageId=${encodeURIComponent(packageId)}`);
  },
  async create(packageId: string, slotId?: string | null) {
    const value = await request<any>('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({ packageId, ...(slotId ? { slotId } : {}) }),
    });
    return orderDates(value);
  },
  async list(status?: string) {
    const value = await request<{ items: any[] }>(`/orders${status ? `?status=${status}` : ''}`);
    return value.items.map(orderDates);
  },
  async detail(id: string) {
    return orderDates(await request<any>(`/orders/${encodeURIComponent(id)}`));
  },
  async uploadProof(order: CustomerOrder, file: File, sha256: string) {
    const issued = await request<{ id: string }>('/uploads/payment-proofs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        branchId: order.branchId,
        packageId: order.packageId,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        sha256,
      }),
    });
    await request(`/uploads/payment-proofs/${issued.id}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: file,
    });
    await request(`/uploads/payment-proofs/${issued.id}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha256, sizeBytes: file.size }),
    });
    return orderDates(
      await request<any>(`/orders/${encodeURIComponent(order.id)}/payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentProofId: issued.id, expectedVersion: order.version }),
      }),
    );
  },
};

export async function sha256Upload(file: File) {
  const hash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function orderError(error: unknown) {
  const code = error instanceof Error ? error.message : '';
  const labels: Record<string, string> = {
    IDENTITY_VERIFICATION_REQUIRED: 'Selesaikan verifikasi identitas sebelum membuat pesanan.',
    PAYMENT_ACCOUNT_UNAVAILABLE: 'Rekening pembayaran cabang belum tersedia.',
    ORDER_EXPIRED: 'Batas pembayaran sudah berakhir. Buat pesanan baru.',
    PAYMENT_PROOF_MIME_MISMATCH: 'Isi file tidak sesuai dengan tipe file yang dipilih.',
    PAYMENT_PROOF_CHECKSUM_MISMATCH: 'File berubah saat diunggah. Silakan pilih ulang.',
    PAYMENT_PROOF_NOT_CLEAN: 'Bukti pembayaran belum lolos pemeriksaan keamanan.',
    UPLOAD_NOT_COMPLETE: 'Upload belum lengkap. Silakan coba kembali.',
    RESOURCE_NOT_FOUND: 'Data pesanan atau paket tidak ditemukan.',
    CONFLICT: 'Data berubah. Muat ulang halaman lalu coba kembali.',
  };
  return labels[code] ?? 'Layanan pesanan belum dapat memproses permintaan. Silakan coba kembali.';
}
