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

    expect(await screen.findByRole('heading', { name: 'Halo, Nadia' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Data kamu sedang diperiksa' })).toBeVisible();
    expect(
      screen.getByText(
        'Data kamu sedang diperiksa tim studio. Kami kabari lewat WhatsApp kalau sudah selesai.',
      ),
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

    expect(await screen.findByRole('heading', { name: 'Halo, Nadia' })).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Identitas kamu belum diverifikasi' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Verifikasi diperlukan sebelum kamu bisa membeli paket dan booking kelas. Satu halaman, sekitar 2 menit.',
      ),
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

    expect(await screen.findByRole('heading', { name: 'Halo, Nadia' })).toBeVisible();
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

    expect(await screen.findByRole('heading', { name: 'Halo, Nadia' })).toBeVisible();
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
    expect(await screen.findByRole('heading', { name: 'Halo, Nadia' })).toBeVisible();

    // 2. Kartu booking terdekat di paling atas
    const nearestSection = screen.getByLabelText('Booking terdekat');
    expect(within(nearestSection).getByText('Booking terdekat')).toBeVisible();
    expect(
      within(nearestSection).getByRole('heading', { name: 'Reformer Flow Level 1' }),
    ).toBeVisible();
    expect(within(nearestSection).getByText('Studio Senopati - Studio 1')).toBeVisible();

    // 3. QR Pass statis: QR yang sama setiap datang, studio yang memindai.
    expect(within(nearestSection).getByRole('link', { name: 'Lihat QR Pass' })).toHaveAttribute(
      'href',
      '/check-in-pass',
    );
    expect(
      within(nearestSection).getByRole('link', { name: 'Batalkan booking ini' }),
    ).toHaveAttribute('href', '/bookings/booking-xyz-123');

    // 4. Tanpa kartu statistik pasif.
    expect(screen.queryByText('Notifikasi belum dibaca')).toBeNull();
  });

  it('menampilkan kelas minggu ini di studio utama dan membuka lembar booking kelas itu', async () => {
    session.identityVerificationStatus = 'APPROVED';
    (session as Record<string, unknown>).preferredBranch = {
      id: 'branch-gg',
      name: 'Green Garden',
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          generatedAt: '2026-10-28T00:00:00.000Z',
          upcomingBookings: [],
          packages: [
            {
              id: 'p',
              packageName: 'Group 10',
              classTypeName: 'Group',
              branchName: 'Green Garden',
              expiryAt: '2026-12-31T00:00:00.000Z',
              available: 4,
            },
          ],
          actionableOrders: [],
          verification: { status: 'APPROVED' },
          unreadNotifications: 0,
        }),
      }),
    );
    const classCatalogClient = {
      list: vi.fn().mockResolvedValue({
        branches: [],
        range: { from: '', until: '' },
        items: [
          {
            id: 'slot-7',
            timezone: 'Asia/Jakarta',
            status: 'PUBLISHED',
            capacity: 8,
            available: 3,
            canBook: true,
            branchId: 'branch-gg',
            startAt: '2026-10-29T00:00:00.000Z',
            endAt: '2026-10-29T00:55:00.000Z',
            classType: { name: 'Semi Private Reformer' },
            instructor: { displayName: 'Devi' },
          },
        ],
      }),
    };

    render(<CustomerDashboard classCatalogClient={classCatalogClient as never} />);

    const week = await screen.findByRole('region', { name: 'Kelas minggu ini di Green Garden' });
    expect(within(week).getByText('3 slot tersisa')).toBeVisible();
    expect(within(week).getByRole('link', { name: /Semi Private Reformer/ })).toHaveAttribute(
      'href',
      '/classes?branch=branch-gg&slot=slot-7',
    );
    expect(classCatalogClient.list).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: 'branch-gg' }),
    );
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

    expect(await screen.findByRole('heading', { name: 'Halo, Nadia' })).toBeVisible();
    expect(
      screen.getByText('Belum ada booking mendatang. Pilih jadwal kelas untuk mulai latihan.'),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Lihat jadwal kelas' })).toBeVisible();
  });
  describe('tujuan tombol "Booking kelas"', () => {
    const stubOverview = (packages: unknown[]) =>
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            generatedAt: '2026-07-28T00:00:00.000Z',
            upcomingBookings: [],
            packages,
            actionableOrders: [],
            verification: { status: 'APPROVED', documents: [] },
            unreadNotifications: 0,
          }),
        }),
      );

    it('tanpa paket aktif membuka jadwal studio utama', async () => {
      (session as Record<string, unknown>).preferredBranch = {
        id: 'branch-mk',
        name: 'Muara Karang',
      };
      stubOverview([]);
      render(<CustomerDashboard />);
      await screen.findByRole('heading', { name: 'Halo, Nadia' });
      expect(screen.getByRole('link', { name: 'Booking kelas' })).toHaveAttribute(
        'href',
        '/classes?branch=branch-mk',
      );
    });

    it('dengan paket aktif membuka jadwal tanpa memaksa studio utama (halaman jadwal memilih studio paket)', async () => {
      (session as Record<string, unknown>).preferredBranch = {
        id: 'branch-mk',
        name: 'Muara Karang',
      };
      stubOverview([
        {
          id: 'cp-1',
          packageName: 'Paket Green Garden',
          classTypeName: 'Group',
          branchName: 'Green Garden',
          expiryAt: '2026-12-20T00:00:00.000Z',
          available: 5,
        },
      ]);
      render(<CustomerDashboard />);
      await screen.findByRole('heading', { name: 'Halo, Nadia' });
      expect(screen.getByRole('link', { name: 'Booking kelas' })).toHaveAttribute(
        'href',
        '/classes',
      );
    });
  });
});
