import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { LaporanOwner, OwnerReportClient } from '@/api-clients/owner-report-client';
import { OwnerExceptionsPanel } from './owner-exceptions-panel';

const laporan = (over: Partial<LaporanOwner> = {}): LaporanOwner => ({
  range: { from: '2026-10-01', until: '2026-10-28', label: '2026-10-01/2026-10-28' },
  dibawahKuota: {
    total: 2,
    totalBebanRp: 300000,
    rows: [
      {
        classSlotId: 'slot-1',
        branchId: 'b-1',
        namaKelas: 'Reformer Flow',
        mulai: '2026-10-20T11:00:00.000Z',
        namaInstruktur: 'Dewi',
        hadir: 2,
        minimum: 4,
        selisihBebanRp: 150000,
        alasan: 'Peserta sudah datang jauh-jauh.',
        diputuskanOleh: 'Sari',
        diputuskanPada: '2026-10-20T11:05:00.000Z',
      },
      {
        classSlotId: 'slot-2',
        branchId: 'b-1',
        namaKelas: null,
        mulai: null,
        namaInstruktur: null,
        hadir: null,
        minimum: null,
        selisihBebanRp: null,
        alasan: null,
        diputuskanOleh: null,
        diputuskanPada: '2026-10-12T11:05:00.000Z',
      },
    ],
  },
  pindaiDitolak: { total: 3, perAlasan: [{ alasan: 'TIDAK_ADA_KELAS', jumlah: 3 }] },
  ...over,
});

const client = (hasil: LaporanOwner | Error): OwnerReportClient => ({
  laporan: vi.fn(() => (hasil instanceof Error ? Promise.reject(hasil) : Promise.resolve(hasil))),
});

describe('OwnerExceptionsPanel', () => {
  it('menampilkan total honor, kelas, dan siapa yang memutuskan', async () => {
    const c = client(laporan());
    render(<OwnerExceptionsPanel from="2026-10-01" until="2026-10-28" branchId="b-1" client={c} />);

    expect(await screen.findByText(/300\.000/)).toBeVisible();
    expect(c.laporan).toHaveBeenCalledWith({
      from: '2026-10-01',
      until: '2026-10-28',
      branchId: 'b-1',
    });
    const baris = screen.getByText('Reformer Flow').closest('tr')!;
    expect(within(baris).getByText('2 dari 4')).toBeVisible();
    expect(within(baris).getByText('Diputuskan oleh Sari')).toBeVisible();
    // Catatan yang tidak lengkap mengatakan begitu, bukan menampilkan angka nol.
    expect(screen.getByText('Tidak tercatat')).toBeVisible();
    expect(screen.getByText('Kelas sudah dihapus', { exact: false })).toBeVisible();
    expect(screen.getByText('Tidak punya kelas hari ini')).toBeVisible();
  });

  it('mengatakan terus terang bila tidak ada pengecualian', async () => {
    render(
      <OwnerExceptionsPanel
        from="2026-10-01"
        until="2026-10-28"
        client={client(
          laporan({
            dibawahKuota: { total: 0, totalBebanRp: 0, rows: [] },
            pindaiDitolak: { total: 0, perAlasan: [] },
          }),
        )}
      />,
    );
    expect(await screen.findByText(/Tidak ada kelas yang berjalan di bawah kuota/)).toBeVisible();
    expect(screen.queryByText(/Rp/)).toBeNull();
  });

  it('memberi tahu saat laporan gagal dimuat', async () => {
    render(
      <OwnerExceptionsPanel from="2026-10-01" until="2026-10-28" client={client(new Error('x'))} />,
    );
    expect(await screen.findByText(/belum dapat dimuat/)).toBeVisible();
  });
});
