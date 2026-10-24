import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { auditActionLabel, hasAuditActionLabel, hasAuditObjectLabel, metricLabel } from './audit-labels';

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
    expect(metricLabel('instructor-realtime')).toBe('Pendapatan instruktur');
    expect(metricLabel('other-cost')).toBe('Pengeluaran lain');
    expect(metricLabel('profit')).toBe('Profit operasional');
    expect(metricLabel('correction')).toBe('Koreksi (terpisah)');
  });

  it('membersihkan fallback istilah bahasa Inggris mentah bila API mengirim label lama', () => {
    expect(metricLabel('custom-1', 'Gross sales')).toBe('Penjualan kotor');
    expect(metricLabel('custom-3', 'Correction (terpisah)')).toBe('Koreksi (terpisah)');
  });
});

/** Semua berkas sumber API (bukan spec), untuk memeriksa kode audit yang benar-benar dikirim. */
function apiSources(dir = resolve(__dirname, '../../../api/src'), out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) apiSources(full, out);
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}

describe('setiap kode audit dari API punya label Indonesia', () => {
  const source = apiSources().map((file) => readFileSync(file, 'utf8')).join('\n');
  const literal = new Set<string>();
  // Hanya kode audit (HURUF_BESAR_UNDERSCORE atau bertitik); `action: 'activate'` dsb. milik hal lain.
  for (const match of source.matchAll(/\baction:\s*'([A-Za-z_.:-]+)'/gu))
    if (/^[A-Z][A-Z_]+$/u.test(match[1]!) || match[1]!.includes('.')) literal.add(match[1]!);
  for (const match of source.matchAll(
    /'((?:master|class_slot|assignment|owner_branch|access|customer|public_content|notification_template|package-promotion|lifecycle)\.[a-z_]+)'/gu,
  ))
    literal.add(match[1]!);

  it('kode yang tertulis langsung di kode API', () => {
    // Kode berawalan `security.`/`booking.`/`operations.` lama punya cadangan tebakan; sisanya wajib berlabel.
    const missing = [...literal].filter((code) => !hasAuditActionLabel(code) && !/^(security|booking|operations|finance)\./u.test(code));
    expect(missing).toEqual([]);
  });

  it('kode yang disusun dari jenis entitas (lifecycle.*_deleted / _archived dan transisi paket/voucher)', () => {
    const deleted = ['branch', 'studio', 'room', 'class_type', 'package', 'promotion', 'voucher', 'payment_account', 'min_quota', 'public_content', 'notification_template', 'user'];
    const archived = ['branch', 'class_type'];
    const codes = [
      ...deleted.map((kind) => `lifecycle.${kind}_deleted`),
      ...archived.map((kind) => `lifecycle.${kind}_archived`),
      ...['ACTIVE', 'PAUSED', 'ARCHIVED'].map((status) => `VOUCHER_${status}`),
      ...['ACTIVE', 'INACTIVE', 'ARCHIVED'].map((status) => `PACKAGE_${status}`),
      ...['extend', 'freeze', 'unfreeze'].map((action) => `CUSTOMER_PACKAGE_${action.toUpperCase()}`),
      ...['active', 'paused', 'archived'].map((status) => `package-promotion.${status}`),
    ];
    expect(codes.filter((code) => !hasAuditActionLabel(code))).toEqual([]);
  });

  it('jenis objek yang dikirim punya nama Indonesia', () => {
    const types = ['Branch', 'Studio', 'Room', 'ClassType', 'Package', 'PackagePromotion', 'Voucher', 'PaymentAccount', 'MinQuotaSetting', 'PublicContent', 'NotificationTemplate', 'User'];
    expect(types.filter((type) => !hasAuditObjectLabel(type))).toEqual([]);
  });
});
