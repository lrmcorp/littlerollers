import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { KeuanganClient } from '@/api-clients/keuangan-client';
import type { ClassSlotClient } from '@/api-clients/class-slot-client';
import { geserJam, KoreksiJamView } from './koreksi-jam-view';

vi.mock('../../session-context', () => ({
  useSessionContext: () => ({
    activeBranchId: 'gg',
    activeBranch: { id: 'gg', name: 'Green Garden', timezone: 'Asia/Jakarta' },
    hasCapability: () => true,
  }),
}));

const NOW = new Date('2026-10-28T03:00:00Z').getTime();
const ALASAN = 'QR instruktur tidak terpindai, kelas berjalan penuh.';

const slotClient = {
  discover: vi.fn().mockResolvedValue({
    slots: [
      {
        id: 's-1',
        classTypeId: 'ct',
        instructorUserId: 'i-a',
        startAt: new Date('2026-10-28T02:00:00Z'),
        endAt: new Date('2026-10-28T02:55:00Z'),
        status: 'COMPLETED',
      },
    ],
    classTypes: [{ id: 'ct', code: 'G', name: 'Group' }],
    instructors: [
      { id: 'i-a', displayName: 'Asrida' },
      { id: 'i-b', displayName: 'Devi' },
    ],
    studios: [],
  }),
} as unknown as ClassSlotClient;

const client = () =>
  ({
    daftarKoreksiJam: vi.fn().mockResolvedValue({ items: [] }),
    kirimKoreksiJam: vi
      .fn()
      .mockResolvedValue({ hours: 1.5, instructorName: 'Devi', amountRp: 300_000 }),
  }) as unknown as KeuanganClient;

describe('KoreksiJamView', () => {
  it('mengoreksi jam instruktur pengganti pada satu kelas dengan alasan dan bukti', async () => {
    const user = userEvent.setup();
    const c = client();
    render(<KoreksiJamView now={NOW} client={c} slotClient={slotClient} />);

    await user.click(await screen.findByRole('radio', { name: /09.00 – 09.55 · Group/ }));
    await user.selectOptions(screen.getByLabelText('Instruktur yang dikoreksi'), 'i-b');
    await user.click(screen.getByRole('button', { name: 'Tambah setengah jam' }));
    expect(screen.getByText('+1,5 jam')).toBeVisible();

    const simpan = screen.getByRole('button', { name: 'Simpan koreksi' });
    await user.type(screen.getByLabelText(/Alasan, wajib diisi/), ALASAN);
    expect(simpan).toBeDisabled();
    const bukti = new File(['%PDF-'], 'jadwal.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText(/Bukti pendukung/), bukti);
    await user.click(simpan);

    expect(c.kirimKoreksiJam).toHaveBeenCalledWith({
      classSlotId: 's-1',
      instructorId: 'i-b',
      hours: 1.5,
      reason: ALASAN,
      evidence: bukti,
    });
    expect(await screen.findByText(/\+1,5 jam untuk Devi tercatat: \+Rp 300.000/)).toBeVisible();
  });
});

describe('geserJam', () => {
  it('melompati nol dan dibatasi delapan jam', () => {
    expect(geserJam(0.5, -1)).toBe(-0.5);
    expect(geserJam(-0.5, 1)).toBe(0.5);
    expect(geserJam(8, 1)).toBe(8);
    expect(geserJam(1, 1)).toBe(1.5);
  });
});
