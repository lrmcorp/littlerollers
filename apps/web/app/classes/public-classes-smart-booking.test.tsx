import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicClassesView } from '@/classes/public-classes-view';
import type { PublicClassCatalogClient } from '@/api-clients/public-class-catalog-client';
import type { LedgerClient, LedgerBalance } from '@/api-clients/ledger-client';

const session = vi.hoisted(() => ({
  displayName: 'Nadia Customer',
  roles: ['CUSTOMER'],
  identityVerificationStatus: 'APPROVED',
  user: { verificationStatus: 'APPROVED' },
}));

vi.mock('../session-context', () => ({
  useSessionContext: () => ({ session }),
}));

const branchKemang = { id: 'branch-kemang', code: 'KM', name: 'Daily Dose Kemang', timezone: 'Asia/Jakarta' };
const branchBSD = { id: 'branch-bsd', code: 'BSD', name: 'Daily Dose BSD', timezone: 'Asia/Jakarta' };

const typeGroup = { id: 'type-group', code: 'GROUP_CLASS', name: 'Group Reformer' };
const typePrivate = { id: 'type-private', code: 'PRIVATE_CLASS', name: 'Private Pilates' };

describe('Customer Smart Booking on Public Classes Catalog', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  const matchingPackage: LedgerBalance = {
    id: 'cpkg-1',
    branchId: branchKemang.id,
    packageBranchId: branchKemang.id,
    status: 'ACTIVE',
    activationDate: new Date('2026-01-01'),
    expiryAt: new Date('2026-12-31'),
    ledgerBalance: 5,
    reserved: 0,
    available: 5,
    packageName: '5x Group Reformer Kemang',
    branchName: branchKemang.name,
    classTypeName: typeGroup.name,
    classTypeId: typeGroup.id,
  };

  it('differentiates buttons: shows "Lanjutkan booking" for matching slots and "Beli paket untuk kelas ini" for non-matching slots', async () => {
    const itemsList = [
      {
        id: 'slot-matching',
        branchId: branchKemang.id,
        classTypeId: typeGroup.id,
        classType: typeGroup,
        startAt: '2026-07-25T03:00:00.000Z',
        endAt: '2026-07-25T03:50:00.000Z',
        timezone: branchKemang.timezone,
        status: 'PUBLISHED',
        capacity: 6,
        available: 4,
        canBook: true,
      },
      {
        id: 'slot-nonmatching',
        branchId: branchKemang.id,
        classTypeId: typePrivate.id,
        classType: typePrivate,
        startAt: '2026-07-25T05:00:00.000Z',
        endAt: '2026-07-25T05:50:00.000Z',
        timezone: branchKemang.timezone,
        status: 'PUBLISHED',
        capacity: 1,
        available: 1,
        canBook: true,
      },
    ];

    const client: PublicClassCatalogClient = {
      list: vi.fn().mockImplementation((input: { branchId?: string }) => {
        if (input?.branchId) {
          return Promise.resolve({
            branches: [branchKemang, branchBSD],
            range: { from: '2026-07-23T00:00:00.000Z', until: '2026-08-06T00:00:00.000Z' },
            items: itemsList,
          });
        }
        return Promise.resolve({
          branches: [branchKemang, branchBSD],
          items: [],
          range: { from: '', until: '' },
        });
      }),
    };

    const mockLedgerClient: LedgerClient = {
      list: vi.fn().mockResolvedValue({
        items: [matchingPackage],
        summary: { packageCount: 1, ledgerBalance: 5, reserved: 0, available: 5 },
        page: {},
      }),
      detail: vi.fn(),
      listAdjustments: vi.fn(),
      getAdjustment: vi.fn(),
      requestAdjustment: vi.fn(),
      decideAdjustment: vi.fn(),
    };

    render(<PublicClassesView client={client} ledgerClient={mockLedgerClient} />);

    // 1. Active package banner should be visible and studio auto-selected from customer package
    expect(await screen.findByText(/Paket Aktif:/)).toBeVisible();
    expect(screen.getByText('5x Group Reformer Kemang')).toBeVisible();
    expect(screen.getByText('5 sesi')).toBeVisible();

    // 2. Both classes should be loaded automatically via auto-select
    expect(await screen.findByText('Group Reformer')).toBeVisible();
    expect(screen.getByText('Private Pilates')).toBeVisible();

    // 3. Slot 1 (Matching Group Reformer) should have "Lanjutkan booking" and "Paket Sesuai" badge
    const continueBtn = screen.getByRole('link', { name: 'Lanjutkan booking' });
    expect(continueBtn).toHaveAttribute('href', '/bookings/new?slot=slot-matching');
    expect(screen.getByText(/Paket Sesuai \(5 sesi\)/)).toBeVisible();

    // 4. Slot 2 (Private class) should have "Beli paket untuk kelas ini" and warning badge
    const buyPackageBtn = screen.getByRole('link', { name: 'Beli paket untuk kelas ini' });
    expect(buyPackageBtn).toHaveAttribute(
      'href',
      expect.stringContaining(`/packages?branch=${branchKemang.id}&classType=${typePrivate.id}`),
    );
    expect(screen.getByText('Perlu paket studio/kelas ini')).toBeVisible();
  });

  it('filters out non-matching classes when "Hanya kelas sesuai paket saya" toggle is checked', async () => {
    const itemsList = [
      {
        id: 'slot-1',
        branchId: branchKemang.id,
        classTypeId: typeGroup.id,
        classType: typeGroup,
        startAt: '2026-07-25T03:00:00.000Z',
        endAt: '2026-07-25T03:50:00.000Z',
        timezone: branchKemang.timezone,
        status: 'PUBLISHED',
        capacity: 6,
        available: 4,
        canBook: true,
      },
      {
        id: 'slot-2',
        branchId: branchKemang.id,
        classTypeId: typePrivate.id,
        classType: typePrivate,
        startAt: '2026-07-25T05:00:00.000Z',
        endAt: '2026-07-25T05:50:00.000Z',
        timezone: branchKemang.timezone,
        status: 'PUBLISHED',
        capacity: 1,
        available: 1,
        canBook: true,
      },
    ];

    const client: PublicClassCatalogClient = {
      list: vi.fn().mockImplementation((input: { branchId?: string }) => {
        if (input?.branchId) {
          return Promise.resolve({
            branches: [branchKemang],
            range: { from: '2026-07-23T00:00:00.000Z', until: '2026-08-06T00:00:00.000Z' },
            items: itemsList,
          });
        }
        return Promise.resolve({
          branches: [branchKemang],
          items: [],
          range: { from: '', until: '' },
        });
      }),
    };

    const mockLedgerClient: LedgerClient = {
      list: vi.fn().mockResolvedValue({
        items: [matchingPackage],
        summary: { packageCount: 1, ledgerBalance: 5, reserved: 0, available: 5 },
        page: {},
      }),
      detail: vi.fn(),
      listAdjustments: vi.fn(),
      getAdjustment: vi.fn(),
      requestAdjustment: vi.fn(),
      decideAdjustment: vi.fn(),
    };

    render(<PublicClassesView client={client} ledgerClient={mockLedgerClient} />);

    // Both should be visible initially via auto-select
    expect(await screen.findByText('Group Reformer')).toBeVisible();
    expect(screen.getByText('Private Pilates')).toBeVisible();

    // Toggle filter
    const toggle = screen.getByRole('checkbox', { name: 'Hanya kelas sesuai paket saya' });
    await userEvent.click(toggle);

    // Now Private Pilates should be filtered out
    expect(screen.getByText('Group Reformer')).toBeVisible();
    expect(screen.queryByText('Private Pilates')).not.toBeInTheDocument();
  });

  it('opens confirmation bottom sheet in-place when "Lanjutkan booking" is clicked (3-Tap Flow)', async () => {
    const itemsList = [
      {
        id: 'slot-tap2',
        branchId: branchKemang.id,
        classTypeId: typeGroup.id,
        classType: typeGroup,
        startAt: '2026-07-25T03:00:00.000Z',
        endAt: '2026-07-25T03:50:00.000Z',
        timezone: branchKemang.timezone,
        status: 'PUBLISHED',
        capacity: 6,
        available: 4,
        canBook: true,
      },
    ];

    const client: PublicClassCatalogClient = {
      list: vi.fn().mockImplementation((input: { branchId?: string }) => {
        if (input?.branchId) {
          return Promise.resolve({
            branches: [branchKemang],
            range: { from: '2026-07-23T00:00:00.000Z', until: '2026-08-06T00:00:00.000Z' },
            items: itemsList,
          });
        }
        return Promise.resolve({
          branches: [branchKemang],
          items: [],
          range: { from: '', until: '' },
        });
      }),
    };

    const mockLedgerClient: LedgerClient = {
      list: vi.fn().mockResolvedValue({
        items: [matchingPackage],
        summary: { packageCount: 1, ledgerBalance: 5, reserved: 0, available: 5 },
        page: {},
      }),
      detail: vi.fn(),
      listAdjustments: vi.fn(),
      getAdjustment: vi.fn(),
      requestAdjustment: vi.fn(),
      decideAdjustment: vi.fn(),
    };

    const mockBookingClient = {
      create: vi.fn().mockResolvedValue({
        id: 'bk-tap3',
        bookingNumber: 'BK-3TAP-SUCCESS',
        status: 'BOOKED',
        createdAt: new Date(),
        version: 1,
      }),
      list: vi.fn(),
      get: vi.fn(),
      cancel: vi.fn(),
      reschedule: vi.fn(),
      requestAdjustment: vi.fn(),
      listAdjustments: vi.fn(),
      getAdjustment: vi.fn(),
      decideAdjustment: vi.fn(),
      getCheckInPass: vi.fn(),
      verifyAttendance: vi.fn(),
    };

    render(
      <PublicClassesView
        client={client}
        ledgerClient={mockLedgerClient}
        bookingClient={mockBookingClient as any}
      />,
    );

    // Ensure customer package is loaded and matching badge is visible
    expect(await screen.findByText(/Paket Aktif:/)).toBeVisible();
    expect(await screen.findByText(/Paket Sesuai \(5 sesi\)/)).toBeVisible();

    // Tap 2: Click "Lanjutkan booking"
    const continueBtn = screen.getByRole('link', { name: 'Lanjutkan booking' });
    fireEvent.click(continueBtn);

    // Bottom sheet opens in-place
    expect(await screen.findByRole('dialog', { name: 'Group Reformer' })).toBeVisible();
    expect(screen.getByText('Konfirmasi Booking')).toBeVisible();
    expect(screen.getByText('Daily Dose Kemang')).toBeVisible();

    // Tap 3: Click "Konfirmasi booking sekarang"
    const confirmBtn = screen.getByRole('button', { name: 'Konfirmasi booking sekarang' });
    await userEvent.click(confirmBtn);

    // Booking success in-place
    expect(await screen.findByText('Booking berhasil')).toBeVisible();
    expect(screen.getByText('BK-3TAP-SUCCESS')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Lihat QR Pass' })).toBeVisible();
  });
});
