import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { browserLedgerClient } from '@/api-clients/ledger-client';
import { CustomerPackagesView } from './packages-view';

describe('customer packages actions', () => {
  it('uses a secondary action for adding a package', async () => {
    vi.spyOn(browserLedgerClient, 'list').mockResolvedValue({
      items: [],
      summary: { packageCount: 0, ledgerBalance: 0, reserved: 0, available: 0 },
      nextCursor: null,
    });
    render(<CustomerPackagesView />);

    const addPackage = screen.getByRole('link', { name: 'Tambah paket' });
    expect(addPackage).toHaveAttribute('href', '/packages');
    expect(addPackage).toHaveClass('min-h-10', 'border-dd-forest/25', 'bg-white', 'text-dd-forest');
    expect(await screen.findByText('Belum ada paket aktif')).toBeVisible();
  });

  it('replaces the current page when navigating twenty-five packages', async () => {
    const item = (index: number) => ({
      id: `cp-${index}`,
      branchId: 'branch-1',
      status: 'ACTIVE' as const,
      activationDate: new Date('2026-01-01'),
      expiryAt: new Date('2026-12-01'),
      ledgerBalance: 10,
      reserved: 0,
      available: 10,
      packageName: `Paket ${index}`,
      branchName: 'Jakarta',
    });
    vi.spyOn(browserLedgerClient, 'list').mockImplementation((_branch, cursor) =>
      Promise.resolve({
        items: cursor
          ? Array.from({ length: 5 }, (_, index) => item(index + 21))
          : Array.from({ length: 20 }, (_, index) => item(index + 1)),
        summary: { packageCount: 25, ledgerBalance: 250, reserved: 0, available: 250 },
        nextCursor: cursor ? null : 'package-20',
      }),
    );

    render(<CustomerPackagesView />);
    expect(await screen.findByText('Paket 1')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Berikutnya' }));
    expect(await screen.findByText('Paket 21')).toBeVisible();
    expect(screen.queryByText('Paket 1')).not.toBeInTheDocument();
    expect(screen.getByText('5 dari 25 paket')).toBeVisible();
  });

  it('separates active and expired packages, marks unused sessions as Hangus, and hides booking button on expired packages', async () => {
    vi.spyOn(browserLedgerClient, 'list').mockResolvedValue({
      items: [
        {
          id: 'pkg-active',
          branchId: 'branch-1',
          status: 'ACTIVE' as const,
          activationDate: new Date('2026-01-01'),
          expiryAt: new Date('2027-01-01'),
          ledgerBalance: 10,
          reserved: 0,
          available: 8,
          packageName: 'Paket Reformer Aktif',
          branchName: 'Jakarta',
        },
        {
          id: 'pkg-expired',
          branchId: 'branch-1',
          status: 'ACTIVE' as const,
          activationDate: new Date('2024-01-01'),
          expiryAt: new Date('2025-01-01'),
          ledgerBalance: 5,
          reserved: 0,
          available: 2,
          packageName: 'Paket Mat Kedaluwarsa',
          branchName: 'Jakarta',
        },
      ],
      summary: { packageCount: 2, ledgerBalance: 15, reserved: 0, available: 10 },
      nextCursor: null,
    });

    render(<CustomerPackagesView />);

    // Di Tab "Paket Aktif":
    expect(await screen.findByText('Paket Reformer Aktif')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Booking kelas' })).toBeVisible();
    expect(screen.getByText('Tersedia')).toBeVisible();
    expect(screen.queryByText('Paket Mat Kedaluwarsa')).not.toBeInTheDocument();

    // Beralih ke Tab "Riwayat Paket":
    await userEvent.click(screen.getByRole('tab', { name: 'Riwayat Paket' }));
    expect(await screen.findByText('Paket Mat Kedaluwarsa')).toBeVisible();
    expect(screen.getByText('Hangus')).toBeVisible();
    expect(screen.getByText('Kedaluwarsa')).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Booking kelas' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Beli paket baru' })).toHaveAttribute('href', '/packages');
    expect(screen.queryByText('Paket Reformer Aktif')).not.toBeInTheDocument();
  });
});
