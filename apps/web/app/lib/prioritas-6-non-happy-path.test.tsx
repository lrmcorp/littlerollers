import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { auditActionLabel, metricLabel } from './audit-labels';
import { classLevelLabel } from './class-level';
import { Pagination } from '../components/admin/admin-ui';
import { Drawer } from '../components/app-feedback';

describe('PRIORITAS 6 NON-HAPPY-PATH: Poin 23 — Format Metrik, Level & Audit Action', () => {
  describe('metricLabel - Adversarial & Legacy Fallback Testing', () => {
    it('menangani input normal metrik finansial & operasional', () => {
      expect(metricLabel('gross-sales')).toBe('Penjualan kotor');
      expect(metricLabel('grossSales')).toBe('Penjualan kotor');
      expect(metricLabel('revenue')).toBe('Omzet bersih');
      expect(metricLabel('instructor-realtime')).toBe('Pendapatan instruktur');
      expect(metricLabel('other-cost')).toBe('Pengeluaran lain');
      expect(metricLabel('profit')).toBe('Profit operasional');
      expect(metricLabel('correction')).toBe('Koreksi (terpisah)');
      expect(metricLabel('pending-payments')).toBe('Pembayaran pending');
      expect(metricLabel('finance-anomalies')).toBe('Anomali Finance');
      expect(metricLabel('bookings')).toBe('Kehadiran & booking');
    });

    it('membersihkan string legacy bahasa Inggris dari API lama secara case-insensitive', () => {
      expect(metricLabel('unknown_1', 'Gross sales')).toBe('Penjualan kotor');
      expect(metricLabel('unknown_2', 'GROSS SALES')).toBe('Penjualan kotor');
      expect(metricLabel('unknown_5', 'Correction (terpisah)')).toBe('Koreksi (terpisah)');
      expect(metricLabel('unknown_6', 'Correction')).toBe('Koreksi');
    });

    it('menangani edge cases: key kosong, key aneh, rawLabel undefined/null/simbol', () => {
      expect(metricLabel('', '')).toBe('');
      expect(metricLabel('unknown-custom-metric')).toBe('unknown-custom-metric');
      expect(metricLabel('unknown-key', 'Custom Metric')).toBe('Custom Metric');
      expect(metricLabel('random_key', undefined)).toBe('random_key');
      expect(metricLabel('sql_injection', "SELECT * FROM users WHERE '1'='1'")).toBe(
        "SELECT * FROM users WHERE '1'='1'",
      );
    });
  });

  describe('classLevelLabel - Adversarial Edge Cases', () => {
    it('menangani input falsy, null, undefined, dan whitespace kosong', () => {
      expect(classLevelLabel(null)).toBe('');
      expect(classLevelLabel(undefined)).toBe('');
      expect(classLevelLabel('')).toBe('');
      expect(classLevelLabel('   ')).toBe('');
    });

    it('memetakan variasi penulisan enum resmi (casing, spasi, tanda minus)', () => {
      expect(classLevelLabel('ALL_LEVELS')).toBe('Semua Level');
      expect(classLevelLabel('all_levels')).toBe('Semua Level');
      expect(classLevelLabel('all-levels')).toBe('Semua Level');
      expect(classLevelLabel('  ALL_LEVELS  ')).toBe('Semua Level');
      expect(classLevelLabel('BEGINNER')).toBe('Pemula');
      expect(classLevelLabel('beginner')).toBe('Pemula');
      expect(classLevelLabel('INTERMEDIATE')).toBe('Menengah');
      expect(classLevelLabel('ADVANCED')).toBe('Lanjutan');
    });

    it('menangani custom/unknown class level tanpa melempar error dan memformat rapi', () => {
      expect(classLevelLabel('REHAB_SPECIAL')).toBe('Rehab special');
      expect(classLevelLabel('PRENATAL')).toBe('Prenatal');
      expect(classLevelLabel('intense_flow_pro')).toBe('Intense flow pro');
    });
  });

  describe('auditActionLabel - Non-Happy-Path Malformed Actions', () => {
    it('menerjemahkan aksi terdaftar', () => {
      expect(auditActionLabel('security.user_created')).toBe('Akun staf dibuat');
      expect(auditActionLabel('booking.cancelled_by_staff')).toBe('Pemesanan kelas dibatalkan staf');
      expect(auditActionLabel('FINANCE_EXPORT')).toBe('Ekspor data keuangan');
    });

    it('menangani aksi tidak terdaftar dengan menghapus prefix domain teknis', () => {
      expect(auditActionLabel('security.custom_unlocked')).toBe('Custom unlocked');
      expect(auditActionLabel('finance.auto_reconcile_failed')).toBe('Auto reconcile failed');
      expect(auditActionLabel('booking.slot_swapped')).toBe('Slot swapped');
      expect(auditActionLabel('operations.worker_reset')).toBe('Worker reset');
    });

    it('menangani aksi anomali dengan titik ganda atau underscore', () => {
      expect(auditActionLabel('security..role_override')).toBe('Role override');
      expect(auditActionLabel('custom_orphan_action')).toBe('Custom orphan action');
    });
  });
});

describe('PRIORITAS 6 NON-HAPPY-PATH: Poin 26 — Boundary Conditions Pagination', () => {
  it('skenario 0 item: tidak menghasilkan angka negatif, NaN, atau pembagian nol', async () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={0}
        pageSize={20}
        hasPrevious={false}
        hasNext={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    // T-16: tidak pernah menulis "dari 0"; satu halaman penuh cukup "Menampilkan N data".
    expect(screen.getByText('Menampilkan 0–0 data')).toBeInTheDocument();
    expect((await axe(container)).violations).toHaveLength(0);
  });

  it('skenario currentPage di luar batas atas (currentPage: 999 dengan totalItems: 15): startItem dan endItem ter-clamp', () => {
    render(
      <Pagination
        currentPage={999}
        totalPages={1}
        totalItems={15}
        pageSize={20}
        hasPrevious={true}
        hasNext={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    // Math.min memastikan startItem tidak melebihi totalItems dan endItem ter-clamp di 15
    expect(screen.getByText('Menampilkan 15–15 dari 15 data')).toBeInTheDocument();
  });

  it('skenario label sudah memuat kata "dari": anti-duplikasi "dari 20 dari 20"', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={20}
        pageSize={20}
        totalLabel="20 dari 20 paket"
        hasPrevious={false}
        hasNext={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const text = container.textContent ?? '';
    expect(text).toContain('Menampilkan 20 dari 20 paket');
    expect(text).not.toMatch(/dari 20 dari/);
    expect(text).not.toMatch(/dari 1 · Menampilkan/); // totalPages === 1 tidak menambahkan "dari 1"
  });

  it('skenario label sudah diawali "Menampilkan": tidak menduplikasi kata "Menampilkan"', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={2}
        totalItems={40}
        pageSize={20}
        totalLabel="Menampilkan 20 dari 40 sesi aktif"
        hasPrevious={false}
        hasNext={true}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    const text = container.textContent ?? '';
    expect(text).not.toMatch(/Menampilkan Menampilkan/);
  });

  it('skenario multi-halaman (totalPages > 1): menyertakan nomor halaman dan lolos axe a11y', async () => {
    const { container } = render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={100}
        pageSize={20}
        totalLabel="100 pelanggan"
        hasPrevious={true}
        hasNext={true}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByText('Halaman 2 dari 5 ·')).toBeInTheDocument();
    expect(screen.getByText('Menampilkan 21–40 dari 100 pelanggan')).toBeInTheDocument();
    expect((await axe(container)).violations).toHaveLength(0);
  });
});

describe('PRIORITAS 6 NON-HAPPY-PATH: Poin 23 & 24 — Drawer Sesi Bebas SessionLedger & Jargon Scanner', () => {
  it('drawer penyesuaian sesi mode langsung (Manager/Owner) menggunakan teks ramah "saldo sesi member"', () => {
    const isDirect = true;
    const description = isDirect
      ? 'Penyesuaian sesi akan langsung diterapkan ke saldo sesi member secara instan tanpa perlu persetujuan lain.'
      : 'Permintaan koreksi sesi akan diajukan ke manajer/staf berwenang untuk disetujui.';

    render(
      <Drawer
        open
        title="Penyesuaian sesi langsung (Manager/Owner)"
        description={description}
        onClose={vi.fn()}
      >
        <p>Konten Form</p>
      </Drawer>,
    );

    expect(screen.getByText(/saldo sesi member secara instan/)).toBeInTheDocument();
    expect(screen.queryByText(/SessionLedger/i)).toBeNull();
  });

  it('drawer penyesuaian sesi mode staf biasa (dengan persetujuan) menggunakan teks ramah', () => {
    const isDirect = false;
    const description = isDirect
      ? 'Penyesuaian sesi akan langsung diterapkan ke saldo sesi member secara instan tanpa perlu persetujuan lain.'
      : 'Permintaan koreksi sesi akan diajukan ke manajer/staf berwenang untuk disetujui.';

    render(
      <Drawer
        open
        title="Buat permintaan penyesuaian"
        description={description}
        onClose={vi.fn()}
      >
        <p>Konten Form</p>
      </Drawer>,
    );

    expect(screen.getByText(/diajukan ke manajer\/staf berwenang/)).toBeInTheDocument();
    expect(screen.queryByText(/SessionLedger/i)).toBeNull();
  });

  it('pemindaian statis mendalam: ZERO VIOLATIONS dari 20 pola istilah programmer di seluruh UI', () => {
    const appRoot = resolve(process.cwd(), 'app');

    function walk(dir: string): string[] {
      return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) return name === 'api-clients' ? [] : walk(path);
        return /\.tsx?$/.test(name) && !/\.test\./.test(name) ? [path] : [];
      });
    }

    const forbidden: Array<[RegExp, string]> = [
      [/Rules? #\d/, 'nomor aturan internal'],
      [/Keputusan Bisnis #?\d/, 'nomor keputusan bisnis internal'],
      [/ledger authoritative/i, 'istilah ledger authoritative'],
      [/Optimistic locking/i, 'istilah optimistic locking'],
      [/Role (&|&amp;) Scope/, 'Role & Scope'],
      [/\(Other Cost\)/i, '(Other Cost)'],
      [/\(Realtime\)/i, '(Realtime)'],
      [/Projection (Cost|Rate)/i, 'Projection Cost/Rate'],
      [/Gross Sales/, 'Gross Sales'],
      [/Our Studios/, 'Our Studios'],
      [/tanpa pilihan otomatis/, 'teks developer jadwal'],
      [/selalu kosong/, 'catatan pratinjau developer'],
      [/sumber operasionalnya disetujui/, 'catatan developer studio'],
      [/persetujuan berbelit/, 'kalimat Penyesuaian Sesi yang bertentangan'],
      [/ReminderLog/i, 'istilah ReminderLog'],
      [/Intimate Class Size/i, 'judul pilar bahasa Inggris'],
      [/Certified Mastery/i, 'judul pilar bahasa Inggris'],
      [/Sanctuary Atmosphere/i, 'judul pilar bahasa Inggris'],
      [/Terkirim \(SENT\)/i, 'kode enum SENT di label UI'],
      [/Gagal \(FAILED\)/i, 'kode enum FAILED di label UI'],
      [/Dokumen Identitas \(KYC\)/i, 'istilah KYC di profil'],
      [/Verifikasi KYC/i, 'istilah KYC di profil'],
      [/SessionLedger/i, 'nama model database SessionLedger'],
    ];

    const literal = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`|>([^<>{};=]+)</gs;
    const violations: string[] = [];

    for (const file of walk(appRoot)) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(literal)) {
        const text = match[1] ?? match[2] ?? match[3] ?? match[4] ?? '';
        for (const [pattern, name] of forbidden) {
          if (pattern.test(text)) {
            violations.push(`${relative(appRoot, file)}: "${text.trim().slice(0, 70)}" → ${name}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
