/** Label bahasa biasa untuk kode aksi audit; kode mentah tidak boleh tampil di layar. */
const auditActionLabels: Record<string, string> = {
  'security.user_created': 'Akun staf dibuat',
  'security.user_profile_updated': 'Profil pengguna diubah',
  'security.user_roles_updated': 'Peran pengguna diubah',
  'security.user_password_reset': 'Kata sandi pengguna direset',
  'security.user_deactivated': 'Pengguna dinonaktifkan',
  'security.user_reactivated': 'Pengguna diaktifkan kembali',
  'booking.cancelled_by_staff': 'Pemesanan kelas dibatalkan staf',
  'booking.cancelled_by_customer': 'Pemesanan kelas dibatalkan pelanggan',
  'finance.payment_approved': 'Pembayaran paket disetujui',
  'finance.payment_rejected': 'Pembayaran paket ditolak',
  'operations.auto_cancel_triggered': 'Evaluasi auto-cancel dijalankan manual',
  'operations.reminders_dispatched': 'Batch pengingat WhatsApp dikirim',
  'class_slot.created': 'Jadwal kelas dibuat',
  'class_slot.cancelled': 'Jadwal kelas dibatalkan',
  'FINANCE_CORRECTION_APPROVED': 'Koreksi keuangan disetujui',
  'FINANCE_CORRECTION_REJECTED': 'Koreksi keuangan ditolak',
  'FINANCE_EXPORT': 'Ekspor data keuangan',
};

export function auditActionLabel(action: string): string {
  return (
    auditActionLabels[action] ??
    action
      .replace(/^security\./, '')
      .replace(/^booking\./, '')
      .replace(/^operations\./, '')
      .replace(/^finance\./, '')
      .replace(/[._]+/g, ' ')
      .trim()
      .replace(/^./, (char) => char.toUpperCase())
  );
}

/** Label bahasa Indonesia baku untuk metrik operasional & finansial; istilah bahasa Inggris mentah tidak boleh tampil. */
const dashboardMetricLabels: Record<string, string> = {
  'gross-sales': 'Penjualan kotor',
  grossSales: 'Penjualan kotor',
  revenue: 'Omzet bersih',
  projection: 'Proyeksi beban',
  instructor: 'Pendapatan instruktur',
  'instructor-realtime': 'Pendapatan instruktur',
  'other-cost': 'Pengeluaran lain',
  otherCost: 'Pengeluaran lain',
  profit: 'Profit operasional',
  correction: 'Koreksi (terpisah)',
  'pending-payments': 'Pembayaran pending',
  'finance-anomalies': 'Anomali Finance',
  bookings: 'Kehadiran & booking',
};

export function metricLabel(key: string, rawLabel?: string): string {
  if (dashboardMetricLabels[key]) return dashboardMetricLabels[key];
  if (!rawLabel) return key;
  return rawLabel
    .replace(/\bGross sales\b/i, 'Penjualan kotor')
    .replace(/\bProjection cost\b/i, 'Proyeksi beban')
    .replace(/\bCorrection\b/i, 'Koreksi');
}
