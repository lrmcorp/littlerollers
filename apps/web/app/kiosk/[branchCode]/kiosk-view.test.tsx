import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '../../lib/api-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KioskView } from './kiosk-view';
import type { KioskDisplayData, KioskScanResult } from '../../api-clients/booking-client';

vi.mock('@zxing/browser', () => ({
  BrowserMultiFormatReader: vi.fn().mockImplementation(() => ({
    decodeFromConstraints: vi.fn().mockRejectedValue(new Error('tanpa kamera di tes')),
  })),
}));

const mockData: KioskDisplayData = {
  branch: {
    id: 'branch-1',
    code: 'SENO',
    name: 'Daily Dose Senopati',
    address: 'Jl. Senopati No. 10',
    timezone: 'Asia/Jakarta',
  },
  serverTime: '2026-10-21T08:00:00.000Z',
  slots: [
    {
      id: 'slot-1',
      classTypeName: 'Reformer Flow',
      studioName: 'Studio Pilates Senopati',
      roomName: 'Ruangan Reformer 1',
      instructorId: 'inst-1',
      instructorName: 'Sarah Kartika',
      startAt: '2026-10-21T08:00:00.000Z',
      endAt: '2026-10-21T09:00:00.000Z',
      capacity: 10,
      bookedCount: 8,
      window: 'OPEN',
      isAttended: false,
      attendance: null,
      qrPayload: 'dd-checkin:v1:test-kiosk-token-payload',
      token: 'test-kiosk-token-payload',
    },
    {
      id: 'slot-2',
      classTypeName: 'Mat Pilates Fundamentals',
      studioName: 'Studio Pilates Senopati',
      roomName: 'Ruangan Mat',
      instructorId: 'inst-2',
      instructorName: 'Budi Santoso',
      startAt: '2026-10-21T07:00:00.000Z',
      endAt: '2026-10-21T08:00:00.000Z',
      capacity: 12,
      bookedCount: 12,
      window: 'OPEN',
      isAttended: true,
      attendance: {
        checkedInAt: '2026-10-21T06:55:00.000Z',
        method: 'QR_SCAN',
        distanceMeters: 15,
        isWithinGeofence: true,
      },
      qrPayload: null,
      token: null,
    },
  ],
};

describe('KioskView Component', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockStorage[key] ?? null),
        setItem: vi.fn((key: string, val: string) => {
          mockStorage[key] = val;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockStorage[key];
        }),
        clear: vi.fn(() => {
          mockStorage = {};
        }),
      },
      configurable: true,
      writable: true,
    });
  });

  const scanner = (hasil?: Partial<KioskScanResult>, galat?: unknown) => ({
    scanAtKiosk: galat
      ? vi.fn().mockRejectedValue(galat)
      : vi.fn().mockResolvedValue({
          diterima: true,
          tercatat: true,
          orang: { userId: 'm-1', nama: 'Sari Dewi', peran: 'MEMBER' },
          kelas: {
            classSlotId: 'slot-1',
            bookingId: 'b-1',
            namaKelas: 'Private Group Reformer',
            studio: 'Studio 2',
            mulai: '2026-10-21T02:00:00.000Z',
            selesai: '2026-10-21T02:55:00.000Z',
          },
          tercatatPada: '2026-10-21T02:14:00.000Z',
          namaCabang: 'Daily Dose Senopati',
          timezone: 'Asia/Jakarta',
          ...hasil,
        }),
    getKioskToday: vi.fn().mockResolvedValue([
      { nama: 'Asrida Putri', peran: 'INSTRUKTUR', tercatatPada: '2026-10-21T01:47:00.000Z' },
      { nama: 'Maya Putri', peran: 'MEMBER', tercatatPada: '2026-10-21T01:52:00.000Z' },
    ]),
  });

  /** Pemindai genggam bekerja seperti papan ketik: mengetik isi QR lalu Enter. */
  const pindaiGenggam = (isi: string) => {
    for (const huruf of isi) fireEvent.keyDown(window, { key: huruf });
    fireEvent.keyDown(window, { key: 'Enter' });
  };

  const bukaPemindai = async (sc = scanner()) => {
    render(
      <KioskView
        branchCode="seno"
        client={clientWith() as never}
        initialToken="tablet-token"
        scannerClient={sc}
        kameraAktif={false}
      />,
    );
    await screen.findByRole('heading', { name: 'Tunjukkan QR Anda ke kamera' });
    return sc;
  };

  const clientWith = (overrides: Record<string, unknown> = {}) => ({
    getKioskDisplay: vi.fn().mockResolvedValue(mockData),
    unlockKiosk: vi.fn().mockResolvedValue({ token: 'tablet-token', expiresAt: '2026-11-20T00:00:00.000Z' }),
    ...overrides,
  });

  it('meminta PIN cabang ke server; PIN salah ditolak, PIN benar menyimpan token tablet dan membuka layar', async () => {
    const unlockKiosk = vi
      .fn()
      .mockRejectedValueOnce(new ApiError('Forbidden', 403, { error: { code: 'KIOSK_PIN_INVALID' } }))
      .mockResolvedValueOnce({ token: 'tablet-token', expiresAt: '2026-11-20T00:00:00.000Z' });
    const mockClient = clientWith({ unlockKiosk });

    render(
      <KioskView
        branchCode="seno"
        client={mockClient as never}
        initialToken={null}
        scannerClient={scanner()}
        kameraAktif={false}
      />,
    );

    expect(screen.getByRole('heading', { name: /Kunci Akses Tablet Kiosk/i })).toBeInTheDocument();
    expect(screen.getByText(/Masukkan 6 digit PIN otorisasi studio/i)).toBeInTheDocument();

    const pinInput = screen.getByLabelText(/PIN Otorisasi Studio/i);
    fireEvent.change(pinInput, { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /Aktifkan Layar Kiosk/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/PIN salah/i);
    expect(mockClient.getKioskDisplay).not.toHaveBeenCalled();

    fireEvent.change(pinInput, { target: { value: '482913' } });
    fireEvent.click(screen.getByRole('button', { name: /Aktifkan Layar Kiosk/i }));

    expect(
      await screen.findByRole('heading', { name: 'Tunjukkan QR Anda ke kamera' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Daily Dose Senopati' })).toBeInTheDocument();
    expect(mockClient.unlockKiosk).toHaveBeenLastCalledWith('seno', '482913');
    expect(mockClient.getKioskDisplay).toHaveBeenCalledWith('seno', 'tablet-token');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('dd_kiosk_token_seno', 'tablet-token');
  });

  it('tidak lagi memakai PIN bawaan di browser dan menjelaskan kiosk yang belum diberi PIN', async () => {
    const unlockKiosk = vi
      .fn()
      .mockRejectedValue(new ApiError('Forbidden', 403, { error: { code: 'KIOSK_NOT_CONFIGURED' } }));
    render(<KioskView branchCode="seno" client={clientWith({ unlockKiosk }) as never} initialToken={null} />);
    fireEvent.change(screen.getByLabelText(/PIN Otorisasi Studio/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Aktifkan Layar Kiosk/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/belum dibuat/i);
    expect(screen.getByRole('heading', { name: /Kunci Akses Tablet Kiosk/i })).toBeInTheDocument();
  });

  it('kembali ke layar PIN bila server menolak token (PIN diganti atau token kedaluwarsa)', async () => {
    const getKioskDisplay = vi.fn().mockRejectedValue(new ApiError('Unauthorized', 401, { error: { code: 'KIOSK_LOCKED' } }));
    render(<KioskView branchCode="seno" client={clientWith({ getKioskDisplay }) as never} initialToken="lama" />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/PIN cabang diganti/i);
    expect(screen.getByRole('heading', { name: /Kunci Akses Tablet Kiosk/i })).toBeInTheDocument();
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('dd_kiosk_token_seno');
  });

  it('mencatat kehadiran dari pemindai genggam dan menampilkan nama serta kelasnya', async () => {
    const sc = await bukaPemindai();

    act(() => pindaiGenggam('dd-pass:v1:abc'));

    await waitFor(() =>
      expect(sc.scanAtKiosk).toHaveBeenCalledWith('seno', 'tablet-token', 'dd-pass:v1:abc'),
    );
    expect(await screen.findByRole('heading', { name: 'Kehadiran tercatat' })).toBeInTheDocument();
    expect(screen.getByText('Sari Dewi')).toBeInTheDocument();
    expect(screen.getByText(/Private Group Reformer, 09.00 sampai 09.55 · Studio 2/)).toBeInTheDocument();
  });

  it('mengabaikan ketikan yang bukan pass Daily Dose', async () => {
    const sc = await bukaPemindai();

    act(() => pindaiGenggam('12345'));

    expect(sc.scanAtKiosk).not.toHaveBeenCalled();
  });

  it('tidak mengirim kode yang sama dua kali dalam beberapa detik', async () => {
    const sc = await bukaPemindai();

    act(() => pindaiGenggam('dd-pass:v1:abc'));
    await screen.findByRole('heading', { name: 'Kehadiran tercatat' });
    act(() => pindaiGenggam('dd-pass:v1:abc'));

    expect(sc.scanAtKiosk).toHaveBeenCalledTimes(1);
  });

  it('menyebut alasan penolakan dengan kalimat yang bisa dipahami orang di depan layar', async () => {
    await bukaPemindai(
      scanner({ diterima: false, tercatat: false, alasan: 'TIDAK_ADA_KELAS', kelas: undefined }),
    );

    act(() => pindaiGenggam('dd-pass:v1:abc'));

    expect(await screen.findByRole('heading', { name: 'Tidak ada kelas' })).toBeInTheDocument();
    expect(
      screen.getByText(/Sari Dewi tidak punya kelas di Daily Dose Senopati sekitar jam ini/),
    ).toBeInTheDocument();
  });

  it('kembali ke layar PIN bila token tablet ditolak saat memindai', async () => {
    await bukaPemindai(
      scanner(undefined, new ApiError('Unauthorized', 401, { error: { code: 'KIOSK_LOCKED' } })),
    );

    act(() => pindaiGenggam('dd-pass:v1:abc'));

    expect(
      await screen.findByRole('heading', { name: /Kunci Akses Tablet Kiosk/i }, { timeout: 4000 }),
    ).toBeInTheDocument();
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('dd_kiosk_token_seno');
  });

  it('menampilkan daftar tercatat hari ini hanya dengan nama dan jam, tanpa foto', async () => {
    await bukaPemindai();

    const daftar = await screen.findByRole('region', { name: 'Tercatat hari ini' });
    expect(await within(daftar).findByText('Asrida Putri · instruktur')).toBeInTheDocument();
    expect(within(daftar).getByText('08.47')).toBeInTheDocument();
    expect(within(daftar).queryByRole('img')).toBeNull();
  });

  it('menampilkan aturan jendela waktu di bawah layar', async () => {
    await bukaPemindai();

    expect(
      screen.getByText(/Kehadiran hanya tercatat jika orangnya punya kelas di cabang ini/),
    ).toBeInTheDocument();
  });

  it('mendukung penguncian kembali perangkat tablet kiosk oleh staf studio', async () => {
    const mockClient = clientWith();

    render(
      <KioskView
        branchCode="seno"
        client={mockClient as never}
        initialToken="tablet-token"
        scannerClient={scanner()}
        kameraAktif={false}
      />,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Kunci tablet' }));

    expect(screen.getByRole('heading', { name: /Kunci Akses Tablet Kiosk/i })).toBeInTheDocument();
  });

  it('menampilkan tampilan error informatif saat getKioskDisplay gagal', async () => {
    const mockClient = clientWith({ getKioskDisplay: vi.fn().mockRejectedValue(new Error('Koneksi terputus')) });

    render(<KioskView branchCode="invalid" client={mockClient as never} initialToken="tablet-token" />);

    await waitFor(() => {
      expect(screen.getByText(/Layar Kiosk Tidak Tersedia/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /Layar Kiosk belum dapat memuat jadwal cabang ini. Periksa kode cabang atau koneksi studio./i,
        ),
      ).toBeInTheDocument();
    });
  });
});
