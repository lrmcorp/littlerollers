import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRCode from 'qrcode';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckInPassView } from './check-in-pass-view';

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('check-in pass (Tiket T-08 / Spesifikasi 5.8)', () => {
  beforeEach(() => {
    vi.mocked(QRCode.toCanvas).mockClear();
    window.history.replaceState({}, '', '/check-in-pass');
  });

  it('renders QR Pass on dark background #24483a with QR >= 230px, 1-line instruction, class details, and Simpan ke galeri button', async () => {
    window.history.replaceState(
      {},
      '',
      '/check-in-pass?class=Reformer+Flow&branch=Studio+Senopati+-+Studio+1&instructor=Sarah+Jenkins&holder=Maria+Angelica#token=dd-checkin%3Av1%3Atest-pass',
    );

    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,cXI=',
    );

    const requestWakeLock = vi.fn().mockResolvedValue({ release: vi.fn() });
    vi.stubGlobal('navigator', {
      ...window.navigator,
      wakeLock: { request: requestWakeLock },
    });

    const { container } = render(<CheckInPassView />);

    // 1. Dark canvas background #24483a
    const mainEl = container.querySelector('main');
    expect(mainEl).toHaveClass('bg-[#24483a]');

    // 2. Satu baris instruksi pemindaian
    expect(
      screen.getByText('Tunjukkan QR ini ke pemindai tablet di meja resepsionis atau kiosk studio.'),
    ).toBeVisible();

    // 3. QR Code width minimal 230 px
    expect(QRCode.toCanvas).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      'dd-checkin:v1:test-pass',
      expect.objectContaining({
        width: expect.any(Number),
      }),
    );
    const callArgs = vi.mocked(QRCode.toCanvas).mock.calls[0];
    expect((callArgs?.[2] as { width: number })?.width).toBeGreaterThanOrEqual(230);

    // 4. Detail kelas, studio, instruktur, pemegang pass
    expect(screen.getByRole('heading', { name: 'Reformer Flow' })).toBeVisible();
    expect(screen.getByText('Studio Senopati - Studio 1')).toBeVisible();
    expect(screen.getByText('Sarah Jenkins')).toBeVisible();
    expect(screen.getByText('Maria Angelica')).toBeVisible();

    // 5. Keterangan masa berlaku kode
    expect(
      screen.getByText('Kode berlaku mulai 30 menit sebelum sesi dimulai hingga kelas selesai.'),
    ).toBeVisible();

    // 6. Tombol Simpan ke galeri
    const downloadBtn = await screen.findByRole('button', { name: 'Simpan ke galeri' });
    expect(downloadBtn).toHaveClass('min-h-[44px]', 'bg-[#396552]', 'text-white');

    await userEvent.click(downloadBtn);
    expect(click).toHaveBeenCalledTimes(1);

    // Feedback visual tersimpan
    expect(screen.getByText('Tersimpan di galeri ✓')).toBeVisible();

    // 7. Screen wake lock called
    expect(requestWakeLock).toHaveBeenCalledWith('screen');
  });

  it('does not expose a download action for an invalid token and provides return to beranda link', async () => {
    render(<CheckInPassView />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Pass QR tidak valid atau sudah tidak tersedia.',
    );
    expect(screen.queryByRole('button', { name: 'Simpan ke galeri' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke Beranda' })).toHaveAttribute(
      'href',
      '/account',
    );
  });
});
