import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { JurnalKas, KeuanganClient } from '@/api-clients/keuangan-client';
import { bacaNominal, KasView } from './kas-view';

const ctx = vi.hoisted(() => ({
  caps: ['expense:create'] as string[],
  branchId: 'gg' as string,
}));
vi.mock('../../session-context', () => ({
  useSessionContext: () => ({
    session: { branches: [{ id: 'gg', name: 'Green Garden' }] },
    activeBranchId: ctx.branchId,
    activeBranch: ctx.branchId
      ? { id: 'gg', name: 'Green Garden', timezone: 'Asia/Jakarta' }
      : null,
    hasCapability: (c: string) => ctx.caps.includes(c),
  }),
}));

const NOW = new Date('2026-10-28T03:00:00Z').getTime();
const jurnal = (): JurnalKas => ({
  period: '2026-10',
  branchId: 'gg',
  masukRp: 1_850_000,
  keluarRp: 450_000,
  selisihRp: 1_400_000,
  rows: [
    {
      id: 'out-1',
      tanggal: '2026-10-22',
      arah: 'KELUAR',
      keterangan: 'Handuk 10 pcs',
      kategori: 'PEMBELIAN_BARANG',
      amountRp: 450_000,
      dicatatOleh: 'Rina',
      branchId: 'gg',
    },
    {
      id: 'in-1',
      tanggal: '2026-10-21',
      arah: 'MASUK',
      keterangan: 'Group 10 sesi · Lia (INV-1)',
      kategori: 'BANK_TRANSFER',
      amountRp: 1_850_000,
      dicatatOleh: null,
      branchId: 'gg',
    },
  ],
});
const client = () =>
  ({
    jurnalKas: vi.fn().mockResolvedValue(jurnal()),
    catatPengeluaran: vi.fn().mockResolvedValue({}),
  }) as unknown as KeuanganClient;

describe('KasView', () => {
  beforeEach(() => {
    ctx.caps = ['expense:create'];
    ctx.branchId = 'gg';
  });

  it('menampilkan uang masuk, keluar, dan selisih beserta baris jurnal', async () => {
    render(<KasView now={NOW} client={client()} />);
    expect(await screen.findByText('Rp 1.400.000')).toBeVisible();
    const tabel = screen.getByRole('table');
    const baris = within(tabel).getAllByRole('row').slice(1);
    expect(within(baris[0]!).getByText('Handuk 10 pcs')).toBeVisible();
    expect(within(baris[0]!).getByText(/Pembelian barang · Rina/)).toBeVisible();
    expect(within(baris[1]!).getByText(/Transfer bank/)).toBeVisible();
  });

  it('admin mencatat pembelian barang dan jurnal dimuat ulang', async () => {
    const user = userEvent.setup();
    const c = client();
    render(<KasView now={NOW} client={c} />);
    await screen.findByText('Rp 1.400.000');

    const simpan = screen.getByRole('button', { name: 'Simpan pengeluaran' });
    expect(simpan).toBeDisabled();
    await user.type(screen.getByLabelText('Keterangan'), 'Matras 2 pcs');
    await user.type(screen.getByLabelText('Nominal (Rp)'), 'Rp 1.200.000');
    await user.click(simpan);

    expect(c.catatPengeluaran).toHaveBeenCalledWith({
      branchId: 'gg',
      incurredOn: '2026-10-28',
      categoryCode: 'PEMBELIAN_BARANG',
      description: 'Matras 2 pcs',
      amountRp: 1_200_000,
    });
    expect(
      await screen.findByText(/Pembelian barang Rp 1.200.000 tercatat untuk Green Garden/),
    ).toBeVisible();
    expect(c.jurnalKas).toHaveBeenCalledTimes(2);
  });

  it('tidak menampilkan formulir bagi yang hanya membaca, dan meminta cabang untuk mencatat', async () => {
    ctx.caps = ['finance:read'];
    const { unmount } = render(<KasView now={NOW} client={client()} />);
    await screen.findByText('Rp 1.400.000');
    expect(screen.queryByRole('button', { name: 'Simpan pengeluaran' })).toBeNull();
    unmount();

    ctx.caps = ['expense:create'];
    ctx.branchId = '';
    render(<KasView now={NOW} client={client()} />);
    expect(
      await screen.findByText(/Pilih cabang di bagian atas untuk mencatat pengeluaran/),
    ).toBeVisible();
  });
});

describe('bacaNominal', () => {
  it('membaca nominal yang diketik dengan titik atau Rp', () => {
    expect(bacaNominal('450.000')).toBe(450_000);
    expect(bacaNominal('Rp 1.200.000')).toBe(1_200_000);
    expect(bacaNominal('0')).toBeNull();
    expect(bacaNominal('')).toBeNull();
  });
});
