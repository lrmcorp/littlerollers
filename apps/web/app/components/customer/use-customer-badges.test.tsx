import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCustomerBadges } from './use-customer-badges';

const session = vi.hoisted(() => ({ roles: ['CUSTOMER'] as string[] }));

vi.mock('../../session-context', () => ({
  useSessionContext: () => ({ session }),
}));

function Badge({ id }: { id: string }) {
  const badges = useCustomerBadges();
  return <span data-testid={id}>{badges.upcomingBookingsCount}</span>;
}

const dashboard = {
  ok: true,
  json: async () => ({
    upcomingBookings: [{ id: 'b1' }, { id: 'b2' }],
    actionableOrders: [],
    packages: [],
    verification: { status: 'APPROVED' },
  }),
};

describe('useCustomerBadges', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    session.roles = ['CUSTOMER'];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(dashboard));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('memakai satu permintaan dashboard untuk banyak komponen dan membagikan hasilnya', async () => {
    render(
      <>
        <Badge id="a" />
        <Badge id="b" />
        <Badge id="c" />
      </>,
    );
    expect(await screen.findAllByText('2')).toHaveLength(3);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('tidak memuat ulang saat fokus datang beruntun, tetapi memuat ulang lewat interval 60 detik', async () => {
    render(<Badge id="a" />);
    await screen.findByText('2');
    expect(fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new Event('focus'));
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('berhenti dan membersihkan badge saat pemakai terakhir pergi', async () => {
    const first = render(<Badge id="a" />);
    await screen.findByText('2');
    first.unmount();

    await act(async () => {
      vi.advanceTimersByTime(120_000);
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    render(<Badge id="again" />);
    // Badge sesi sebelumnya tidak ikut terbawa sebelum data baru tiba.
    expect(screen.getByTestId('again')).toHaveTextContent('0');
    expect(await screen.findByText('2')).toBeVisible();
  });

  it('tidak memanggil API untuk akun staf', async () => {
    session.roles = ['ADMIN'];
    render(<Badge id="a" />);
    expect(screen.getByTestId('a')).toHaveTextContent('0');
    expect(fetch).not.toHaveBeenCalled();
  });
});
