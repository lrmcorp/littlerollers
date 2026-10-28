import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRCode from 'qrcode';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckInPassView, passWindow } from './check-in-pass-view';

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

  afterEach(() => {
    vi.unstubAllGlobals();
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

  describe('rincian kelas dan status aktif QR berasal dari server', () => {
    const minutes = (n: number) => new Date(Date.now() + n * 60_000).toISOString();
    const issued = (startOffset: number, endOffset: number) => ({
      qrPayload: 'dd-checkin:v1:issued-pass',
      className: 'Group Class',
      branchName: 'Daily Dose Green Garden',
      studioName: 'Studio 1',
      instructorName: 'Coach Clara',
      startAt: minutes(startOffset),
      endAt: minutes(endOffset),
      timezone: 'Asia/Jakarta',
    });
    const respond = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;

    it('menampilkan instruktur dan studio asli dari respons, bukan nilai contoh', async () => {
      window.history.replaceState({}, '', '/check-in-pass?bookingId=bk-1');
      vi.stubGlobal('fetch', vi.fn(async () => respond(issued(180, 240))));
      render(<CheckInPassView />);

      expect(await screen.findByRole('heading', { name: 'Group Class' })).toBeVisible();
      expect(screen.getByText('Coach Clara')).toBeVisible();
      expect(screen.getByText('Studio 1')).toBeVisible();
      expect(screen.queryByText('Instruktur Daily Dose')).not.toBeInTheDocument();
      expect(screen.queryByText('Reformer Flow')).not.toBeInTheDocument();
    });

    it('memberi tahu kapan QR mulai aktif bila kelas masih jauh', async () => {
      window.history.replaceState({}, '', '/check-in-pass?bookingId=bk-1');
      vi.stubGlobal('fetch', vi.fn(async () => respond(issued(180, 240))));
      render(<CheckInPassView />);

      const status = await screen.findByRole('status');
      expect(status).toHaveAttribute('data-pass-state', 'TOO_EARLY');
      expect(status).toHaveTextContent(/Belum aktif\. QR dapat dipindai mulai pukul \d{2}\.\d{2} WIB/);
    });

    it('menandai QR aktif saat jendela 30 menit terbuka dan selesai setelah kelas berakhir', async () => {
      window.history.replaceState({}, '', '/check-in-pass?bookingId=bk-1');
      vi.stubGlobal('fetch', vi.fn(async () => respond(issued(-10, 50))));
      const { unmount } = render(<CheckInPassView />);
      expect(await screen.findByRole('status')).toHaveAttribute('data-pass-state', 'OPEN');
      unmount();

      vi.stubGlobal('fetch', vi.fn(async () => respond(issued(-120, -60))));
      render(<CheckInPassView />);
      expect(await screen.findByRole('status')).toHaveAttribute('data-pass-state', 'ENDED');
    });

    it('tanpa booking terpilih memakai booking mendatang terdekat', async () => {
      const fetchMock = vi.fn(async (url: string) =>
        url.includes('/me/dashboard')
          ? respond({ upcomingBookings: [{ id: 'bk-near', status: 'BOOKED' }] })
          : respond(issued(180, 240)),
      );
      vi.stubGlobal('fetch', fetchMock);
      render(<CheckInPassView />);

      expect(await screen.findByRole('heading', { name: 'Group Class' })).toBeVisible();
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/bookings/bk-near/customer-check-in-links',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(QRCode.toCanvas).toHaveBeenCalledWith(
        expect.any(HTMLCanvasElement),
        'dd-checkin:v1:issued-pass',
        expect.anything(),
      );
    });

    it('tanpa booking mendatang menampilkan ajakan melihat jadwal, bukan pesan galat', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => respond({ upcomingBookings: [] })));
      render(<CheckInPassView />);

      expect(await screen.findByRole('heading', { name: 'Belum ada booking mendatang' })).toBeVisible();
      expect(screen.getByRole('link', { name: 'Lihat jadwal kelas' })).toHaveAttribute(
        'href',
        '/classes#schedule',
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('tautan dari staf yang hanya membawa token mengambil rincian kelas dari server', async () => {
      window.history.replaceState({}, '', '/check-in-pass#token=dd-checkin%3Av1%3Alink-pass');
      const fetchMock = vi.fn(async () => respond(issued(180, 240)));
      vi.stubGlobal('fetch', fetchMock);
      render(<CheckInPassView />);

      expect(await screen.findByRole('heading', { name: 'Group Class' })).toBeVisible();
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/v1/check-ins/customer-link-info?token=link-pass',
        expect.anything(),
      );
    });
  });

  it('passWindow mengikuti aturan 30 menit sebelum mulai hingga kelas selesai', () => {
    const base = new Date('2026-10-29T10:00:00.000Z');
    const info = { startAt: base.toISOString(), endAt: new Date(base.getTime() + 3_600_000).toISOString() };
    expect(passWindow(info, base.getTime() - 31 * 60_000)).toBe('TOO_EARLY');
    expect(passWindow(info, base.getTime() - 30 * 60_000)).toBe('OPEN');
    expect(passWindow(info, base.getTime() + 59 * 60_000)).toBe('OPEN');
    expect(passWindow(info, base.getTime() + 60 * 60_000)).toBe('ENDED');
    expect(passWindow({ startAt: '', endAt: '' }, 0)).toBeNull();
  });
});
