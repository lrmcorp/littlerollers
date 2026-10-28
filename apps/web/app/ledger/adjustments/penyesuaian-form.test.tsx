import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AdjustmentEvidenceClient } from '@/api-clients/adjustment-evidence-client';
import { PenyesuaianForm } from './penyesuaian-form';

const paket = {
  id: 'pk-1',
  customerUserId: 'm-1',
  customer: { id: 'm-1', displayName: 'Lia Kusuma' },
  status: 'ACTIVE',
  available: 3,
  remainingSessions: 3,
  expiryAt: new Date('2026-12-12T00:00:00Z'),
  packageName: 'Private Group 10 sesi',
};

function client(): AdjustmentEvidenceClient {
  return {
    cariMember: vi.fn().mockResolvedValue([{ id: 'm-1', displayName: 'Lia Kusuma' }]),
    paketMember: vi.fn().mockResolvedValue([paket]),
    kirim: vi.fn().mockResolvedValue({ resultingBalance: 4, evidenceUrl: '/x' }),
    terakhir: vi.fn().mockResolvedValue([
      {
        id: 'adj-1',
        customerPackageId: 'pk-1',
        quantity: 2,
        reasonCode: 'PACKAGE_COMPENSATION',
        status: 'POSTED',
        version: 2,
        customer: { id: 'm-1', displayName: 'Lia Kusuma', phoneMasked: null },
        decisionNote: 'Kelas 14 Okt batal karena instruktur sakit.',
        decidedBy: { id: 'o', displayName: 'Rina' },
        decidedAt: new Date('2026-10-21T07:08:00Z'),
      },
    ]),
  };
}

const ALASAN = 'Salah catat hadir pada kelas 9 Okt, peserta sebenarnya datang.';

describe('PenyesuaianForm', () => {
  it('datang dari laporan tidak hadir: member, booking, dan jumlah sudah terisi', async () => {
    const c = client();
    const user = userEvent.setup();
    render(<PenyesuaianForm client={c} awal={{ memberId: 'm-1', bookingId: 'b-9', sesi: 1 }} />);

    expect(await screen.findByText('Lia Kusuma', { selector: 'span' })).toBeVisible();
    expect(await screen.findByText(/sisa 3/)).toBeVisible();
    expect(screen.getByText(/menjadi/)).toHaveTextContent('menjadi 4 sesi');

    const kirim = screen.getByRole('button', { name: 'Kirim penyesuaian' });
    expect(kirim).toBeDisabled();

    await user.type(screen.getByLabelText('Alasan, wajib diisi'), ALASAN);
    expect(kirim).toBeDisabled();
    const bukti = new File(['%PDF-'], 'surat.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText('Bukti pendukung'), bukti);
    expect(kirim).toBeEnabled();

    await user.click(kirim);

    expect(c.kirim).toHaveBeenCalledWith({
      customerPackageId: 'pk-1',
      quantity: 1,
      reason: ALASAN,
      bookingId: 'b-9',
      evidence: bukti,
    });
    expect(await screen.findByText(/Sisa sekarang 4 sesi/)).toBeVisible();
  });

  it('melewati nol saat mengubah jumlah, karena nol tidak mengubah apa pun', async () => {
    const user = userEvent.setup();
    render(<PenyesuaianForm client={client()} awal={{ memberId: 'm-1' }} />);
    await screen.findByText(/sisa 3/);

    await user.click(screen.getByRole('button', { name: 'Kurangi satu sesi' }));

    expect(screen.getByText('-1')).toBeVisible();
    expect(screen.getByText(/menjadi/)).toHaveTextContent('menjadi 2 sesi');
  });

  it('menolak pengurangan melebihi sisa sesi sebelum dikirim', async () => {
    const user = userEvent.setup();
    render(<PenyesuaianForm client={client()} awal={{ memberId: 'm-1', sesi: -4 }} />);
    await screen.findByText(/sisa 3/);

    expect(screen.getByText(/tidak cukup untuk dikurangi/)).toBeVisible();
    await user.type(screen.getByLabelText('Alasan, wajib diisi'), ALASAN);
    await user.upload(
      screen.getByLabelText('Bukti pendukung'),
      new File(['x'], 'a.png', { type: 'image/png' }),
    );
    expect(screen.getByRole('button', { name: 'Kirim penyesuaian' })).toBeDisabled();
  });

  it('menampilkan penyesuaian terakhir dengan tautan ke buktinya', async () => {
    render(<PenyesuaianForm client={client()} />);

    expect(await screen.findByText('+2 sesi · Lia Kusuma')).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Lihat bukti' })).toHaveAttribute(
        'href',
        '/api/v1/session-adjustments/adj-1/evidence',
      ),
    );
  });

  it('mencari member lewat server setelah dua huruf', async () => {
    const c = client();
    const user = userEvent.setup();
    render(<PenyesuaianForm client={c} />);

    await user.type(screen.getByLabelText('Member'), 'Li');
    await user.click(await screen.findByRole('button', { name: /Lia Kusuma/ }));

    expect(c.cariMember).toHaveBeenCalledWith('Li');
    expect(await screen.findByText(/Terpilih: Lia Kusuma/)).toBeVisible();
  });
});
