/**
 * Label status untuk tampilan staf. Halaman boleh punya peta sendiri untuk arti khusus, tetapi
 * nilai yang tidak dikenal harus melewati `statusLabel` agar enum mentah (mis. WAITING_VERIFICATION)
 * tidak pernah tampil di layar.
 */
const labels: Record<string, string> = {
  // Pembayaran dan pesanan
  AWAITING_PAYMENT: 'Menunggu pembayaran',
  WAITING_VERIFICATION: 'Menunggu pemeriksaan',
  PAYMENT_SUBMITTED: 'Menunggu pemeriksaan',
  ACTION_REQUIRED: 'Perlu perbaikan',
  APPROVED: 'Disetujui',
  VERIFIED: 'Terverifikasi',
  PAID: 'Lunas',
  REJECTED: 'Ditolak',
  CANCELLED: 'Dibatalkan',
  EXPIRED: 'Kedaluwarsa',
  // Umum
  PENDING: 'Menunggu',
  ACTIVE: 'Aktif',
  INACTIVE: 'Nonaktif',
  PENDING_ACTIVATION: 'Menunggu aktivasi',
  PAUSED: 'Dijeda',
  EXHAUSTED: 'Kuota habis',
  DRAFT: 'Draf',
  PUBLISHED: 'Terbit',
  ARCHIVED: 'Diarsipkan',
  // Kasus bantuan
  OPEN: 'Terbuka',
  IN_PROGRESS: 'Diproses',
  WAITING_CUSTOMER: 'Menunggu pelanggan',
  RESOLVED: 'Selesai',
  CLOSED: 'Ditutup',
  // Pengiriman dan job
  QUEUED: 'Menunggu',
  RUNNING: 'Berjalan',
  SUCCEEDED: 'Berhasil',
  FAILED: 'Gagal',
  SENT: 'Terkirim',
};

function humanize(value: string) {
  const words = value
    .trim()
    .split(/[\s_:-]+/u)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
  if (!words.length) return '—';
  const text = words.join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function statusLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return labels[value] ?? humanize(value);
}
