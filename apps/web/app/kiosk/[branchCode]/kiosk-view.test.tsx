import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    latitude: -6.2297,
    longitude: 106.8166,
    hasGeofence: true,
    geofenceRadiusMeters: 100,
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

  it('menampilkan layar otorisasi PIN jika tablet belum dipasangkan/diotorisasi', async () => {
    const mockClient = {
      getKioskDisplay: vi.fn().mockResolvedValue(mockData),
    };

    render(<KioskView branchCode="seno" client={mockClient} initialAuthorized={false} />);

    expect(screen.getByRole('heading', { name: /Kunci Akses Tablet Kiosk/i })).toBeInTheDocument();
    expect(screen.getByText(/Masukkan 6 digit PIN otorisasi studio/i)).toBeInTheDocument();

    // Input PIN salah
    const pinInput = screen.getByLabelText(/PIN Otorisasi Studio/i);
    fireEvent.change(pinInput, { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /Aktifkan Layar Kiosk/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /PIN otorisasi studio salah. Masukkan 6 digit PIN resmi cabang./i,
    );

    // Input PIN benar default: 123456
    fireEvent.change(pinInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Aktifkan Layar Kiosk/i }));

    await waitFor(() => {
      expect(screen.getByText(/Daily Dose Pilates · Daily Dose Senopati/i)).toBeInTheDocument();
    });
  });

  it('memenuhi spesifikasi tata letak 5.10 (jarak 2 meter, 40px, 22px, QR 280px, dan rotasi 60 detik)', async () => {
    const mockClient = {
      getKioskDisplay: vi.fn().mockResolvedValue(mockData),
    };

    render(<KioskView branchCode="seno" client={mockClient} initialAuthorized={true} />);

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

    // 5. Geofence radius studio badge
    expect(screen.getByText(/Radius Geofence: 100m dari studio/i)).toBeInTheDocument();
  });

  it('menampilkan daftar presensi hari ini beserta jam scan kehadiran (Spec 5.10)', async () => {
    const mockClient = {
      getKioskDisplay: vi.fn().mockResolvedValue(mockData),
    };

    render(<KioskView branchCode="seno" client={mockClient} initialAuthorized={true} />);

    await waitFor(() => {
      expect(screen.getByText(/Daftar Presensi Hari Ini/i)).toBeInTheDocument();
    });

    // Sesi slot-2 yang sudah dihadiri Coach Budi Santoso
    expect(screen.getAllByText(/Coach Budi Santoso/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Mat Pilates Fundamentals/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/15m dari studio/i)).toBeInTheDocument();
  });

  it('menampilkan baris penutup wajib sesuai Spesifikasi 5.10', async () => {
    const mockClient = {
      getKioskDisplay: vi.fn().mockResolvedValue(mockData),
    };

    render(<KioskView branchCode="seno" client={mockClient} initialAuthorized={true} />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Presensi hanya tercatat jika instruktur terdaftar di sesi ini dan berada di area studio./i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('mendukung penguncian kembali perangkat tablet kiosk oleh staf studio', async () => {
    const mockClient = {
      getKioskDisplay: vi.fn().mockResolvedValue(mockData),
    };

    render(<KioskView branchCode="seno" client={mockClient} initialAuthorized={true} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Kunci Tablet Kiosk/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Kunci Tablet Kiosk/i }));

    expect(screen.getByRole('heading', { name: /Kunci Akses Tablet Kiosk/i })).toBeInTheDocument();
  });

  it('menampilkan tampilan error informatif saat getKioskDisplay gagal', async () => {
    const mockClient = {
      getKioskDisplay: vi.fn().mockRejectedValue(new Error('Koneksi terputus')),
    };

    render(<KioskView branchCode="invalid" client={mockClient} initialAuthorized={true} />);

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
