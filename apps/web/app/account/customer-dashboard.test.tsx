import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomerDashboard } from './customer-dashboard';

const session = vi.hoisted(() => ({
  displayName: 'Nadia Customer',
  roles: ['CUSTOMER'],
  identityVerificationStatus: 'PENDING',
}));

vi.mock('../session-context', () => ({
  useSessionContext: () => ({ session }),
}));

describe('customer dashboard (Tiket T-02)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    session.identityVerificationStatus = 'PENDING';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          generatedAt: '2026-07-28T00:00:00.000Z',
          upcomingBookings: [],
          packages: [],
          actionableOrders: [
            {
              id: 'order-1',
              packageName: 'Reformer 10',
              branchName: 'Daily Dose Jakarta',
              status: 'AWAITING_PAYMENT',
              payableAmountRp: 1_600_123,
              expiresAt: '2026-07-29T00:00:00.000Z',
            },
          ],
          verification: { status: 'PENDING', documents: [] },
          unreadNotifications: 2,
        }),
      }),
    );
  });

  it('shows pending verification banner when verification is PENDING', async () => {
    render(<CustomerDashboard />);

    expect(await screen.findByRole('heading', { name: 'Halo, Nadia Customer' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Data kamu sedang diperiksa' })).toBeVisible();
    expect(
      screen.getByText('Data kamu sedang diperiksa tim studio. Kami kabari lewat WhatsApp kalau sudah selesai.'),
    ).toBeVisible();
    const btn = screen.getByRole('link', { name: 'Lihat status verifikasi' });
    expect(btn).toBeVisible();
    expect(btn.getAttribute('href')).toBe('/account/verification?returnTo=%2Faccount');
  });

  it('shows unverified banner with prompt to complete verification (ACTION_REQUIRED)', async () => {
    session.identityVerificationStatus = 'ACTION_REQUIRED';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          generatedAt: '2026-07-28T00:00:00.000Z',
          upcomingBookings: [],
          packages: [],
          actionableOrders: [],
          verification: { status: 'ACTION_REQUIRED', documents: [] },
          unreadNotifications: 0,
        }),
      }),
    );

    render(<CustomerDashboard />);

    expect(await screen.findByRole('heading', { name: 'Halo, Nadia Customer' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Identitas kamu belum diverifikasi' })).toBeVisible();
    expect(
      screen.getByText('Verifikasi diperlukan sebelum kamu bisa membeli paket dan booking kelas. Satu halaman, sekitar 2 menit.'),
    ).toBeVisible();
    const btn = screen.getByRole('link', { name: 'Isi data verifikasi' });
    expect(btn).toBeVisible();
    expect(btn.getAttribute('href')).toBe('/account/verification?returnTo=%2Faccount');
  });

  it('shows rejected verification banner with reason when verification is REJECTED', async () => {
    session.identityVerificationStatus = 'REJECTED';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          generatedAt: '2026-07-28T00:00:00.000Z',
          upcomingBookings: [],
          packages: [],
          actionableOrders: [],
          verification: {
            status: 'REJECTED',
            rejectionReason: 'Foto KTP terlalu buram',
            documents: [],
          },
          unreadNotifications: 0,
        }),
      }),
    );

    render(<CustomerDashboard />);

    expect(await screen.findByRole('heading', { name: 'Halo, Nadia Customer' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Verifikasi identitas ditolak' })).toBeVisible();
    expect(
      screen.getByText('Data ditolak: Foto KTP terlalu buram. Perbaiki lalu kirim lagi.'),
    ).toBeVisible();
    const btn = screen.getByRole('link', { name: 'Perbaiki data' });
    expect(btn).toBeVisible();
    expect(btn.getAttribute('href')).toBe('/account/verification?returnTo=%2Faccount');
  });

  it('hides verification banner completely when verification is APPROVED', async () => {
    session.identityVerificationStatus = 'APPROVED';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          generatedAt: '2026-07-28T00:00:00.000Z',
          upcomingBookings: [],
          packages: [],
          actionableOrders: [],
          verification: { status: 'APPROVED', documents: [] },
          unreadNotifications: 0,
        }),
      }),
    );

    render(<CustomerDashboard />);

    expect(await screen.findByRole('heading', { name: 'Halo, Nadia Customer' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Identitas kamu belum diverifikasi' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Data kamu sedang diperiksa' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Verifikasi identitas ditolak' })).toBeNull();
  });

  it('renders Booking Terdekat card at top of dashboard with 1-tap Lihat QR Pass button (Tiket T-08)', async () => {
    session.identityVerificationStatus = 'APPROVED';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          generatedAt: '2026-07-28T00:00:00.000Z',
          upcomingBookings: [
            {
              id: 'booking-xyz-123',
              status: 'BOOKED',
              className: 'Reformer Flow Level 1',
              branchName: 'Studio Senopati - Studio 1',
              timezone: 'Asia/Jakarta',
              startAt: '2026-07-29T02:00:00.000Z',
              endAt: '2026-07-29T02:50:00.000Z',
            },
          ],
          packages: [
            {
              id: 'pkg-1',
              packageName: 'Reformer 10 Sesi',
              classTypeName: 'Reformer',
              branchName: 'Daily Dose Jakarta',
              expiryAt: '2026-12-31T00:00:00.000Z',
              available: 8,
            },
          ],
          actionableOrders: [],
          verification: { status: 'APPROVED', documents: [] },
          unreadNotifications: 1,
        }),
      }),
    );

    render(<CustomerDashboard />);

    // 1. Heading greeting
    expect(await screen.findByRole('heading', { name: 'Halo, Nadia Customer' })).toBeVisible();

    // 2. Booking Terdekat highlight card at top
    const nearestSection = screen.getByLabelText('Booking terdekat');
    expect(nearestSection).toBeVisible();
    expect(within(nearestSection).getByText(/Jadwal Terdekat/i)).toBeVisible();
    expect(within(nearestSection).getByRole('heading', { name: 'Reformer Flow Level 1' })).toBeVisible();
    expect(within(nearestSection).getByText('Studio Senopati - Studio 1')).toBeVisible();

    // 3. Tombol Lihat QR Pass (1 tap ke /check-in-pass)
    const qrPassBtn = screen.getByRole('link', { name: 'Lihat QR Pass' });
    expect(qrPassBtn).toBeVisible();
    expect(qrPassBtn.getAttribute('href')).toContain('/check-in-pass?bookingId=booking-xyz-123');
    expect(qrPassBtn.getAttribute('href')).toContain('class=Reformer%20Flow%20Level%201');

    // 4. Quick QR Pass link in upcoming bookings list
    const quickQrLinks = screen.getAllByRole('link', { name: 'QR Pass' });
    expect(quickQrLinks.length).toBeGreaterThanOrEqual(1);
    expect(quickQrLinks[0]?.getAttribute('href')).toContain('/check-in-pass?bookingId=booking-xyz-123');
  });

  it('renders friendly empty state when member has no upcoming bookings per Spec 6 (Tiket T-08)', async () => {
    session.identityVerificationStatus = 'APPROVED';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          generatedAt: '2026-07-28T00:00:00.000Z',
          upcomingBookings: [],
          packages: [
            {
              id: 'pkg-1',
              packageName: 'Mat Pilates 5',
              classTypeName: 'Mat',
              branchName: 'Daily Dose Jakarta',
              expiryAt: '2026-12-31T00:00:00.000Z',
              available: 5,
            },
          ],
          actionableOrders: [],
          verification: { status: 'APPROVED', documents: [] },
          unreadNotifications: 0,
        }),
      }),
    );

    render(<CustomerDashboard />);

    expect(await screen.findByRole('heading', { name: 'Halo, Nadia Customer' })).toBeVisible();
    expect(
      screen.getByText('Belum ada booking mendatang. Pilih jadwal kelas untuk mulai latihan.'),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Lihat jadwal kelas' })).toBeVisible();
  });
});
