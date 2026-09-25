import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileBottomNavigation } from './mobile-bottom-navigation';

let capabilities: string[] = [];
let pathname = '/workspace';

vi.mock('next/navigation', () => ({ usePathname: () => pathname }));
vi.mock('./customer/use-customer-badges', () => ({
  useCustomerBadges: () => ({
    actionableOrdersCount: 0,
    upcomingBookingsCount: 0,
    verificationActionRequired: false,
    expiringPackagesCount: 0,
  }),
}));
vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    session: { capabilities },
    hasCapability: (...required: string[]) =>
      required.some((capability) => capabilities.includes(capability)),
  }),
}));

const tabs = () =>
  within(screen.getByRole('navigation', { name: 'Navigasi Bawah Workspace' }))
    .getAllByRole('link')
    .map((link) => link.textContent);

describe('MobileBottomNavigation (staff)', () => {
  beforeEach(() => {
    pathname = '/workspace';
    capabilities = [];
  });

  it('only shows tabs the account may open', () => {
    capabilities = ['finance:reconcile', 'payment:review'];
    render(<MobileBottomNavigation customerOnly={false} />);
    expect(tabs()).toEqual(['Beranda', 'Pembayaran', 'Keuangan']);
    expect(screen.getByRole('button', { name: 'Buka semua menu navigasi' })).toBeVisible();
  });

  it('keeps at most four tabs plus the menu, in priority order', () => {
    capabilities = [
      'booking:read',
      'payment:review',
      'class-slot:read',
      'finance:reconcile',
      'ledger:adjust:read',
    ];
    render(<MobileBottomNavigation customerOnly={false} />);
    expect(tabs()).toEqual(['Beranda', 'Booking', 'Pembayaran', 'Kelas']);
  });

  it('shows queue badges from the shared queue counts', () => {
    capabilities = ['booking:read', 'payment:review'];
    render(
      <MobileBottomNavigation
        customerOnly={false}
        queueCounts={{ reschedules: 2, payments: 120 }}
      />,
    );
    expect(screen.getByLabelText('2 antrean')).toHaveTextContent('2');
    expect(screen.getByLabelText('120 antrean')).toHaveTextContent('99+');
  });

  it('marks the menu when a queue lives in a page that is not a tab', () => {
    capabilities = ['booking:read', 'payment:review', 'class-slot:read', 'ledger:adjust:read'];
    render(<MobileBottomNavigation customerOnly={false} queueCounts={{ adjustments: 3 }} />);
    expect(tabs()).toEqual(['Beranda', 'Booking', 'Pembayaran', 'Kelas']);
    expect(screen.getByLabelText('Ada antrean baru di menu lain')).toBeInTheDocument();
  });

  it('does not mark the menu for queues the account cannot open', () => {
    capabilities = ['booking:read'];
    render(<MobileBottomNavigation customerOnly={false} queueCounts={{ adjustments: 3 }} />);
    expect(screen.queryByLabelText('Ada antrean baru di menu lain')).not.toBeInTheDocument();
  });
});
