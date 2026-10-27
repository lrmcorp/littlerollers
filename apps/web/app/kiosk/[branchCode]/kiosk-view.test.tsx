import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ApiError } from '../../lib/api-client';
import QRCode from 'qrcode';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KioskView } from './kiosk-view';
import type { KioskDisplayData } from '../../api-clients/booking-client';

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined),
  },
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

    render(<KioskView branchCode="seno" client={mockClient as never} initialToken={null} />);

    expect(screen.getByRole('heading', { name: /Kunci Akses Tablet Kiosk/i })).toBeInTheDocument();
    expect(screen.getByText(/Masukkan 6 digit PIN otorisasi studio/i)).toBeInTheDocument();

    const pinInput = screen.getByLabelText(/PIN Otorisasi Studio/i);
    fireEvent.change(pinInput, { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /Aktifkan Layar Kiosk/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/PIN salah/i);
    expect(mockClient.getKioskDisplay).not.toHaveBeenCalled();

    fireEvent.change(pinInput, { target: { value: '482913' } });
    fireEvent.click(screen.getByRole('button', { name: /Aktifkan Layar Kiosk/i }));

    await waitFor(() => {
      expect(screen.getByText(/Daily Dose Pilates · Daily Dose Senopati/i)).toBeInTheDocument();
    });
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

  it('memenuhi spesifikasi tata letak 5.10 (jarak 2 meter, 40px, 22px, QR 280px, dan rotasi 60 detik)', async () => {
    const mockClient = clientWith();

    render(<KioskView branchCode="seno" client={mockClient as never} initialToken="tablet-token" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Daily Dose Senopati/i);
    });

    // 1. Tipografi 40 px: Nama kelas & Jam sesi
    const classNameHeading = screen.getByRole('heading', { level: 2, name: /Reformer Flow/i });
    expect(classNameHeading).toHaveClass('text-[40px]');
    const sessionTimeText = screen.getByText(/15[.:]00\s*–\s*16[.:]00/);
    expect(sessionTimeText).toBeInTheDocument();
    expect(sessionTimeText).toHaveClass('text-[40px]');

    // 2. Tipografi 22 px: Nama instruktur & studio
    const instructorStudioText = document.querySelector('.text-\\[22px\\]');
    expect(instructorStudioText).toBeInTheDocument();
    expect(instructorStudioText).toHaveTextContent(/Coach Sarah Kartika/i);
    expect(instructorStudioText).toHaveTextContent(/Studio Pilates Senopati/i);

    // 3. QR presensi 280 px pada kartu putih & teks keterangan rotasi 60 detik
    const qrCanvas = screen.getByLabelText(/QR Code Presensi Instruktur Kiosk/i);
    expect(qrCanvas).toBeInTheDocument();
    expect(qrCanvas).toHaveAttribute('width', '280');
    expect(qrCanvas).toHaveAttribute('height', '280');
    expect(screen.getByText(/Kode berganti otomatis setiap 60 detik/i)).toBeInTheDocument();

    // 4. Jumlah peserta terdaftar
    expect(screen.getByText(/8 dari 10 peserta/i)).toBeInTheDocument();

    // 5. Radius geofence dan koordinat studio tidak pernah ditampilkan di layar publik
    expect(document.body.textContent ?? '').not.toMatch(/geofence|radius|-6\.\d{3}/i);
  });

  it('menampilkan daftar presensi hari ini beserta jam scan kehadiran (Spec 5.10)', async () => {
    const mockClient = clientWith();

    render(<KioskView branchCode="seno" client={mockClient as never} initialToken="tablet-token" />);

    await waitFor(() => {
      expect(screen.getByText(/Daftar Presensi Hari Ini/i)).toBeInTheDocument();
    });

    // Sesi slot-2 yang sudah dihadiri Coach Budi Santoso
    expect(screen.getAllByText(/Coach Budi Santoso/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Mat Pilates Fundamentals/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/15m dari studio/i)).toBeInTheDocument();
  });

  it('menampilkan baris penutup wajib sesuai Spesifikasi 5.10', async () => {
    const mockClient = clientWith();

    render(<KioskView branchCode="seno" client={mockClient as never} initialToken="tablet-token" />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Presensi hanya tercatat jika instruktur terdaftar di sesi ini dan berada di area studio./i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('mendukung penguncian kembali perangkat tablet kiosk oleh staf studio', async () => {
    const mockClient = clientWith();

    render(<KioskView branchCode="seno" client={mockClient as never} initialToken="tablet-token" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Kunci Tablet Kiosk/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Kunci Tablet Kiosk/i }));

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
