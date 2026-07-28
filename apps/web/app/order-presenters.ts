import type { OrderStatus } from './order-client';

export const orderStatusLabels: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: 'Menunggu pembayaran',
  PENDING: 'Sedang diperiksa',
  ACTION_REQUIRED: 'Perlu diperbaiki',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  EXPIRED: 'Kedaluwarsa',
};

export const orderReasonLabels: Record<string, string> = {
  PROOF_INVALID: 'Bukti pembayaran tidak valid. Unggah foto atau dokumen yang lebih jelas.',
  AMOUNT_MISMATCH: 'Nominal transfer tidak sesuai dengan total pembayaran.',
  DUPLICATE_PURCHASE: 'Pesanan terdeteksi sebagai transaksi duplikat.',
  OTHER_REVIEW_REQUIRED: 'Bukti memerlukan pemeriksaan atau perbaikan tambahan.',
};

export function formatPaymentCode(code: number | null) {
  return code == null ? null : String(code).padStart(3, '0');
}
