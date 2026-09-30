/**
 * Glosarium teks UI panel staf. Satu istilah baku per konsep agar layar tidak berganti-ganti
 * bahasa (mis. "Customer" di satu halaman dan "Pelanggan" di menu). Hanya untuk teks yang dibaca
 * staf: nama role, kolom DB, endpoint, dan tampilan customer tidak berubah.
 *
 * `terminology-guard.test.ts` memakai daftar ini untuk menolak istilah lama pada literal string dan
 * teks JSX di folder panel staf. Kata serapan yang sudah lazim dipertahankan: Dashboard, Booking,
 * Check-in, Voucher, Timetable, QR.
 */
export const glossary = [
  { avoid: 'Customer', use: 'Pelanggan' },
  { avoid: 'Assignment', use: 'Penugasan' },
  { avoid: 'Approve', use: 'Setujui' },
  { avoid: 'Reject', use: 'Tolak' },
  { avoid: 'Refresh', use: 'Segarkan' },
  { avoid: 'Scope', use: 'Cakupan' },
  { avoid: 'Permission', use: 'Hak akses' },
  { avoid: 'Capability', use: 'Izin' },
  { avoid: 'Support', use: 'Bantuan / kasus bantuan' },
  { avoid: 'Recovery', use: 'Pemulihan' },
  { avoid: 'Legacy cashflow', use: 'Arus kas lama (v1)' },
  { avoid: 'Dead-letter', use: 'Antrean gagal' },
  { avoid: 'Requester', use: 'Staf pemohon' },
  { avoid: 'Approver', use: 'Staf penyetuju' },
] as const;

/** Label tombol aksi baku. */
export const actionLabels = {
  refresh: 'Segarkan',
  viewDetail: 'Lihat detail',
  applyFilter: 'Terapkan',
  resetFilter: 'Reset',
} as const;
