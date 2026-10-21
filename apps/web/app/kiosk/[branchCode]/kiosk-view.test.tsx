import { render, screen, waitFor } from '@testing-library/react';
import QRCode from 'qrcode';
import { describe, expect, it, vi } from 'vitest';
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
      studioName: 'Studio Pilates',
      roomName: 'Ruangan Reformer 1',
      instructorId: 'inst-1',
      instructorName: 'Coach Sarah Kartika',
      startAt: '2026-10-21T08:00:00.000Z',
      endAt: '2026-10-21T09:00:00.000Z',
      window: 'OPEN',
      isAttended: false,
      attendance: null,
      qrPayload: 'dd-checkin:v1:test-kiosk-token-payload',
      token: 'test-kiosk-token-payload',
    },
  ],
};

describe('KioskView Component', () => {
  it('renders branch name and active class slot info', async () => {
    const mockClient = {
      getKioskDisplay: vi.fn().mockResolvedValue(mockData),
    };

    render(<KioskView branchCode="seno" client={mockClient} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Daily Dose Senopati/i);
    });
    expect(screen.getByRole('heading', { level: 2, name: /Reformer Flow/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Coach Sarah Kartika/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/QR Code Presensi Instruktur Kiosk/i)).toBeInTheDocument();
  });

  it('renders verified presence badge when instructor has checked in', async () => {
    const attendedData: KioskDisplayData = {
      ...mockData,
      slots: [
        {
          ...mockData.slots[0]!,
          isAttended: true,
          attendance: {
            checkedInAt: '2026-10-21T07:45:00.000Z',
            method: 'QR_SCAN',
            distanceMeters: 12,
            isWithinGeofence: true,
          },
        },
      ],
    };

    const mockClient = {
      getKioskDisplay: vi.fn().mockResolvedValue(attendedData),
    };

    render(<KioskView branchCode="seno" client={mockClient} />);

    await waitFor(() => {
      expect(screen.getByText(/Presensi Terverifikasi!/i)).toBeInTheDocument();
      expect(screen.getByText(/Terdeteksi \(12m dari studio\)/i)).toBeInTheDocument();
    });
  });

  it('renders error view when getKioskDisplay fails', async () => {
    const mockClient = {
      getKioskDisplay: vi.fn().mockRejectedValue(new Error('Network error')),
    };

    render(<KioskView branchCode="invalid" client={mockClient} />);

    await waitFor(() => {
      expect(screen.getByText(/Layar Kiosk Tidak Tersedia/i)).toBeInTheDocument();
    });
  });
});
