import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../components/app-feedback';
import type { ClassSlotClient, ClassWorkspace } from '../api-clients/class-slot-client';
import type { BookingClient } from '../api-clients/booking-client';
import type { DashboardClient } from '../api-clients/dashboard-client';
import { FrontDeskTodayView } from '../workspace/front-desk-today-view';

const capabilities = vi.hoisted(() => ({
  list: ['attendance:manage', 'class-slot:read', 'booking:read'] as string[],
}));
const branch = {
  id: 'branch-senopati',
  code: 'DD-SNP',
  name: 'Daily Dose Senopati',
  timezone: 'Asia/Jakarta',
};

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    session: {
      id: 'u-frontdesk',
      displayName: 'Petugas Meja Depan',
      roles: ['ADMIN'],
      branches: [branch],
    },
    activeBranchId: 'branch-senopati',
    activeBranch: branch,
    hasCapability: (cap: string) => capabilities.list.includes(cap),
  }),
}));

// Waktu uji: 27 Oktober 2026, 08.42 WIB = 01.42 UTC
const now = new Date('2026-10-27T01:42:00.000Z');

const slot = (
  id: string,
  startUtc: string,
  endUtc: string,
  overrides: Record<string, unknown> = {},
) => ({
  id,
  branchId: 'branch-senopati',
  classTypeId: 'type-group',
  studioId: 'studio-1',
  instructorUserId: 'coach-sarah',
  startAt: new Date(startUtc),
  endAt: new Date(endUtc),
  timezone: 'Asia/Jakarta',
  status: 'CONFIRMED',
  minimumQuota: 2,
  capacity: 4,
  bookedCount: 3,
  version: 1,
  ...overrides,
});

const workspaceFixture = (slots = [
  // Berjalan sekarang: 08.00 - 09.00 WIB (01.00 - 02.00 UTC)
  slot('running', '2026-10-27T01:00:00Z', '2026-10-27T02:00:00Z', {
    classTypeId: 'type-group',
    bookedCount: 3,
    capacity: 4,
  }),
  // Mulai 18 menit lagi: 09.00 - 10.00 WIB (02.00 - 03.00 UTC)
  slot('next-18m', '2026-10-27T02:00:00Z', '2026-10-27T03:00:00Z', {
    classTypeId: 'type-intro',
    instructorUserId: 'coach-budi',
    bookedCount: 6,
    capacity: 6,
  }),
  // Sisa kelas: overcapacity 6 dari 4
  slot('overcap', '2026-10-27T04:00:00Z', '2026-10-27T05:00:00Z', {
    classTypeId: 'type-chair',
    bookedCount: 6,
    capacity: 4,
  }),
]): ClassWorkspace => ({
  slots: slots as never,
  classTypes: [
    { id: 'type-group', code: 'PG', name: 'Private Group' },
    { id: 'type-intro', code: 'RI', name: 'Reformer Intro' },
    { id: 'type-chair', code: 'CP', name: 'Chair Pilates' },
  ],
  instructors: [
    { id: 'coach-sarah', displayName: 'Coach Sarah' },
    { id: 'coach-budi', displayName: 'Coach Budi' },
  ],
  studios: [
    { id: 'studio-1', branchId: 'branch-senopati', code: 'S1', name: 'Studio 1', rooms: [] },
    { id: 'studio-2', branchId: 'branch-senopati', code: 'S2', name: 'Studio 2', rooms: [] },
  ],
});

const bookingFixture = (id: string, name: string, overrides: Record<string, unknown> = {}) => ({
  id,
  version: 1,
  status: 'BOOKED',
  customer: { id: `c-${id}`, displayName: name, phoneMasked: null },
  package: { id: 'pkg-1', name: 'Paket 10 Sesi' },
  sessionBalance: { ledgerBalance: 8, reserved: 0, available: 8 },
  ...overrides,
});

const createTestClients = (overrides: {
  slots?: ClassWorkspace;
  bookings?: unknown[];
  queues?: unknown[];
} = {}) => {
  const classClient = {
    discover: vi.fn().mockResolvedValue(overrides.slots ?? workspaceFixture()),
  } as unknown as ClassSlotClient;

  const bookingClient = {
    list: vi.fn().mockResolvedValue({
      items: overrides.bookings ?? [
        bookingFixture('b1', 'Amanda Manopo', {
          attendance: { checkedInAt: new Date('2026-10-27T00:54:00.000Z'), source: 'QR' },
          status: 'ATTENDED',
        }),
        bookingFixture('b2', 'Budi Hartono', { status: 'BOOKED' }),
      ],
    }),
    backfillAttendance: vi.fn().mockResolvedValue({ ok: true }),
  } as unknown as BookingClient;

  const dashboardClient = {
    overview: vi.fn().mockResolvedValue({
      queues: overrides.queues ?? [
        { key: 'payments', label: 'Pembayaran menunggu', count: 2, href: '/workspace/payments?status=PENDING' },
      ],
    }),
  } as unknown as DashboardClient;

  return { classClient, bookingClient, dashboardClient };
};

const renderView = (c: ReturnType<typeof createTestClients>) =>
  render(
    <AppFeedbackProvider>
      <FrontDeskTodayView
        client={c.classClient}
        bookingClient={c.bookingClient}
        dashboardClient={c.dashboardClient}
        initialNow={now}
      />
    </AppFeedbackProvider>,
  );

describe('Tiket T-20: Halaman Hari Ini untuk Front Desk (Papan 14)', () => {
  beforeEach(() => {
    capabilities.list = ['attendance:manage', 'class-slot:read', 'booking:read'];
  });

  it('1. Menampilkan header real-time dengan jam digital 08.42 WIB dan nama cabang', async () => {
    renderView(createTestClients());
    const clock = await screen.findByLabelText('Jam digital');
    expect(within(clock).getByText('08.42')).toBeVisible();
    expect(within(clock).getByText('WIB')).toBeVisible();
    expect(screen.getByText(/Daily Dose Senopati/)).toBeVisible();
  });

  it('2. Menampilkan dua kartu atas: Berjalan sekarang dan Mulai 18 menit lagi (Penuh)', async () => {
    renderView(createTestClients());
    const running = await screen.findByRole('region', { name: 'Berjalan sekarang' });
    expect(within(running).getByText('08.00 – 09.00')).toBeVisible();
    expect(within(running).getByText('Private Group')).toBeVisible();
    expect(within(running).getByText(/Coach Sarah · Studio 1/)).toBeVisible();
    expect(within(running).getByText('Terisi 3 dari 4')).toBeVisible();
    expect(within(running).getByRole('button', { name: 'Buka daftar hadir' })).toBeVisible();
    expect(within(running).getByRole('button', { name: 'Tampilkan QR check-in' })).toBeVisible();

    const next = screen.getByRole('region', { name: 'Berikutnya' });
    expect(within(next).getByText('Mulai 18 menit lagi')).toBeVisible();
    expect(within(next).getByText('09.00 – 10.00')).toBeVisible();
    expect(within(next).getByText('Reformer Intro')).toBeVisible();
    expect(within(next).getByText('Terisi 6 dari 6 (Penuh)')).toBeVisible();
    expect(within(next).getByRole('button', { name: 'Buka daftar hadir' })).toBeVisible();
  });

  it('3. Membuka modal QR check-in saat tombol Tampilkan QR check-in diklik', async () => {
    const user = userEvent.setup();
    renderView(createTestClients());
    const running = await screen.findByRole('region', { name: 'Berjalan sekarang' });
    const qrBtn = within(running).getByRole('button', { name: 'Tampilkan QR check-in' });
    await user.click(qrBtn);

    const dialog = await screen.findByRole('dialog', { name: 'QR Check-in Meja Depan' });
    expect(within(dialog).getByText(/Arahkan pelanggan untuk memindai kode QR/)).toBeVisible();
    expect(within(dialog).getByRole('button', { name: 'Tutup' })).toBeVisible();
  });

  it('4. Menampilkan daftar hadir in-place dengan jam kehadiran 07.54 dan tombol tandai hadir', async () => {
    const user = userEvent.setup();
    const c = createTestClients();
    renderView(c);

    expect(await screen.findByText('Amanda Manopo')).toBeVisible();
    expect(screen.getByText('Hadir')).toBeVisible();
    expect(screen.getByText('07.54')).toBeVisible();

    expect(screen.getByText('Budi Hartono')).toBeVisible();
    const markBtn = screen.getByRole('button', { name: 'Tandai hadir' });
    expect(markBtn).toBeVisible();

    await user.click(markBtn);
    const dialog = await screen.findByRole('dialog', { name: 'Tandai hadir' });
    expect(within(dialog).getByText(/Pilih alasan, atau tulis sendiri/)).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Petugas melihat langsung pelanggan mengikuti kelas' }));
    await user.click(within(dialog).getByRole('button', { name: 'Catat kehadiran' }));

    await waitFor(() => {
      expect(c.bookingClient.backfillAttendance).toHaveBeenCalledWith(
        'b2',
        'Petugas melihat langsung pelanggan mengikuti kelas',
        1,
        expect.any(String),
      );
    });
  });

  it('5. Mendeteksi kelas kelebihan kapasitas di daftar Semua kelas hari ini dan kartu masalah cabang', async () => {
    renderView(createTestClients());
    const all = await screen.findByRole('region', { name: 'Semua kelas hari ini' });
    expect(within(all).getByText(/Kelebihan kapasitas \(6\/4\)/)).toBeVisible();
    expect(within(all).getAllByText('Lihat detail').length).toBeGreaterThan(0);

    const problems = screen.getByRole('region', { name: /Perlu dibereskan di cabang ini/ });
    expect(within(problems).getByText(/1 kelas kelebihan kapasitas/)).toBeVisible();
    expect(within(problems).getByRole('link', { name: /Pembayaran menunggu/ })).toBeVisible();
  });

  it('6. Menampilkan 3 aksi besar di sebelah kanan dan bebas dari kartu statistik pasif', async () => {
    renderView(createTestClients());
    expect(await screen.findByRole('link', { name: /Buat booking manual/ })).toHaveAttribute(
      'href',
      '/workspace/bookings',
    );
    expect(screen.getByRole('link', { name: /Pindahkan jadwal booking/ })).toHaveAttribute(
      'href',
      '/workspace/bookings?tab=reschedules',
    );
    expect(screen.getByRole('link', { name: /Cari pelanggan/ })).toHaveAttribute(
      'href',
      '/customers',
    );

    // Memastikan tidak ada kartu statistik pasif hiasan
    expect(screen.queryByText(/Total Omzet|Pendapatan Harian|Rata-rata/i)).toBeNull();
  });
});
