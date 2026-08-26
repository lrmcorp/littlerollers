import type { CustomerOrderTimelineType, OrderStatus } from '@/api-clients/order-client';

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

export const orderTimelineLabels: Record<
  CustomerOrderTimelineType,
  { title: string; description: string }
> = {
  ORDER_CREATED: {
    title: 'Pesanan dibuat',
    description: 'Harga, paket, dan studio dicatat untuk pesanan ini.',
  },
  PAYMENT_DEADLINE_SET: {
    title: 'Batas pembayaran ditetapkan',
    description: 'Pembayaran perlu diselesaikan sebelum masa pesanan berakhir.',
  },
  PROOF_SUBMITTED: {
    title: 'Bukti pembayaran diterima',
    description: 'File pembayaran berhasil diterima melalui penyimpanan privat.',
  },
  PROOF_SCAN_COMPLETED: {
    title: 'Pemeriksaan file selesai',
    description: 'Pemeriksaan keamanan file selesai dan bukti siap ditinjau.',
  },
  ACTION_REQUIRED: {
    title: 'Perbaikan bukti diminta',
    description: 'Tim Finance meminta bukti pembayaran diperbaiki.',
  },
  PAYMENT_APPROVED: {
    title: 'Pembayaran disetujui',
    description: 'Pembayaran telah dikonfirmasi oleh tim yang berwenang.',
  },
  PAYMENT_REJECTED: {
    title: 'Pembayaran ditolak',
    description: 'Pesanan ditutup berdasarkan hasil pemeriksaan pembayaran.',
  },
  ORDER_EXPIRED: {
    title: 'Pesanan kedaluwarsa',
    description: 'Batas pembayaran telah berakhir.',
  },
  PACKAGE_ACTIVATED: {
    title: 'Paket diaktifkan',
    description: 'Sesi paket telah ditambahkan ke akun customer.',
  },
};
