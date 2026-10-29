import { render, screen } from '@testing-library/react';
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

describe('customer dashboard', () => {
  beforeEach(() => {
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
              branchName: 'Little Rollers Jakarta',
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

  it('shows actionable customer data and verification gate', async () => {
    render(<CustomerDashboard />);

    expect(await screen.findByRole('heading', { name: 'Halo, Nadia Customer' })).toBeVisible();
    expect(screen.getByText('Verifikasi sedang berlangsung')).toBeVisible();
    expect(screen.getByText('Reformer 10')).toBeVisible();
    expect(screen.getByText('Rp 1.600.123')).toBeVisible();
    expect(screen.getByRole('link', { name: /Paket aktif/ })).toHaveAttribute(
      'href',
      '/account/packages',
    );
  });
});
