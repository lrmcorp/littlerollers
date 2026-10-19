import { describe, expect, it } from 'vitest';
import { auditActionLabel, metricLabel } from './audit-labels';

describe('auditActionLabel', () => {
  it('menerjemahkan aksi akun staf', () => {
    expect(auditActionLabel('security.user_password_reset')).toBe('Kata sandi pengguna direset');
    expect(auditActionLabel('security.user_roles_updated')).toBe('Peran pengguna diubah');
  });

  it('menerjemahkan aksi operasional booking, finance, dan otomasi', () => {
    expect(auditActionLabel('booking.cancelled_by_staff')).toBe('Pemesanan kelas dibatalkan staf');
    expect(auditActionLabel('booking.cancelled_by_customer')).toBe('Pemesanan kelas dibatalkan pelanggan');
    expect(auditActionLabel('finance.payment_approved')).toBe('Pembayaran paket disetujui');
    expect(auditActionLabel('operations.auto_cancel_triggered')).toBe('Evaluasi auto-cancel dijalankan manual');
  });

  it('tidak menampilkan kode mentah untuk aksi baru', () => {
    expect(auditActionLabel('security.user_unlocked')).toBe('User unlocked');
  });
});

describe('metricLabel', () => {
  it('menstandarkan metrik finansial dan operasional ke bahasa Indonesia baku', () => {
    expect(metricLabel('gross-sales')).toBe('Penjualan kotor');
    expect(metricLabel('grossSales')).toBe('Penjualan kotor');
    expect(metricLabel('revenue')).toBe('Omzet bersih');
    expect(metricLabel('projection')).toBe('Proyeksi beban');
    expect(metricLabel('instructor-realtime')).toBe('Pendapatan instruktur');
    expect(metricLabel('other-cost')).toBe('Pengeluaran lain');
    expect(metricLabel('profit')).toBe('Profit operasional');
    expect(metricLabel('correction')).toBe('Koreksi (terpisah)');
  });

  it('membersihkan fallback istilah bahasa Inggris mentah bila API mengirim label lama', () => {
    expect(metricLabel('custom-1', 'Gross sales')).toBe('Penjualan kotor');
    expect(metricLabel('custom-2', 'Projection cost')).toBe('Proyeksi beban');
    expect(metricLabel('custom-3', 'Correction (terpisah)')).toBe('Koreksi (terpisah)');
  });
});
