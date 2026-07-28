import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationShell } from './application-shell';
import { Dashboard } from './dashboard';
import { PublicHeader } from './components/public/public-header';
import { AppFeedbackProvider } from './components/app-feedback';
import {
  defaultSessionDestination,
  forbiddenSessionDestination,
  canAccessSessionPath,
  resolveSessionDestination,
  safeReturnTo,
  SessionProvider,
  useSessionContext,
} from './session-context';
import type { SessionClient, WebSession } from './session-client';

const navigation = vi.hoisted(() => ({ pathname: '/workspace', replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => new URLSearchParams(),
}));

const adminSession: WebSession = {
  id: 'user-1',
  displayName: 'Admin Jakarta',
  roles: ['ADMIN'],
  branchIds: ['branch-1', 'branch-2'],
  capabilities: ['user:read', 'ledger:read', 'booking:read'],
  sessionExpiresAt: new Date(Date.now() + 60_000),
  branches: [
    { id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' },
    { id: 'branch-2', code: 'BDG', name: 'Bandung', timezone: 'Asia/Jakarta' },
  ],
};

const customerSession: WebSession = {
  id: 'customer-1',
  displayName: 'Nadia Customer',
  roles: ['CUSTOMER'],
  branchIds: [],
  capabilities: [
    'customer:self',
    'package:read',
    'ledger:read',
    'class-slot:read',
    'booking:self:read',
    'booking:self:create',
  ],
  identityVerificationStatus: 'PENDING',
  sessionExpiresAt: new Date(Date.now() + 60_000),
  branches: [],
};

function ContextProbe() {
  const context = useSessionContext();
  return <output>{context?.activeBranch?.name ?? 'Belum dipilih'}</output>;
}

describe('capability-aware session shell', () => {
  beforeEach(() => {
    navigation.pathname = '/workspace';
    navigation.replace.mockReset();
    sessionStorage.clear();
  });

  it('loads authoritative context, filters navigation and requires explicit branch selection', async () => {
    const client: SessionClient = { me: vi.fn().mockResolvedValue(adminSession), logout: vi.fn() };
    render(
      <SessionProvider client={client}>
        <ApplicationShell>
          <ContextProbe />
        </ApplicationShell>
      </SessionProvider>,
    );
    expect(screen.getByRole('status', { name: 'Memuat sesi' })).toBeInTheDocument();
    expect(await screen.findByText('Admin Jakarta')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ledger' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Operations H-24' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Cabang aktif')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Cabang aktif'), { target: { value: 'branch-2' } });
    expect(screen.getByText('Bandung')).toBeInTheDocument();
    expect(sessionStorage.getItem('dd_active_branch')).toBe('branch-2');

    fireEvent.click(screen.getByRole('button', { name: 'Notifikasi' }));
    expect(screen.getByRole('region', { name: 'Pusat notifikasi' })).toBeVisible();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('region', { name: 'Pusat notifikasi' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Menu profil Admin Jakarta' }));
    expect(screen.getByRole('region', { name: 'Menu akun internal' })).toBeVisible();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('region', { name: 'Menu akun internal' })).not.toBeInTheDocument();
  });

  it('clears an unauthorized stored branch and redirects a protected route on 401', async () => {
    navigation.pathname = '/ledger';
    sessionStorage.setItem('dd_active_branch', 'foreign');
    const client: SessionClient = {
      me: vi.fn().mockRejectedValue({ response: { status: 401 } }),
      logout: vi.fn(),
    };
    render(
      <SessionProvider client={client}>
        <div>Protected</div>
      </SessionProvider>,
    );
    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith('/sign-in?returnTo=%2Fledger'),
    );
    expect(sessionStorage.getItem('dd_active_branch')).toBeNull();
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('routes staff away from the customer verification page to the reviewer queue', async () => {
    navigation.pathname = '/account/verification';
    const reviewer = {
      ...adminSession,
      roles: ['SUPER_OWNER'],
      capabilities: [...adminSession.capabilities, 'identity-verification:read'],
    };
    const client: SessionClient = { me: vi.fn().mockResolvedValue(reviewer), logout: vi.fn() };
    render(
      <SessionProvider client={client}>
        <div>Customer verification</div>
      </SessionProvider>,
    );

    expect(await screen.findByText(/Halaman verifikasi akun hanya untuk customer/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Buka antrean verifikasi' })).toHaveAttribute(
      'href',
      '/identity-verifications',
    );
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('/identity-verifications'));
  });

  it('accepts only same-origin relative return targets', () => {
    expect(safeReturnTo('/ledger?cursor=one')).toBe('/ledger?cursor=one');
    expect(safeReturnTo('/classes?studio=Green%20Garden#schedule')).toBe(
      '/classes?studio=Green%20Garden#schedule',
    );
    expect(safeReturnTo('/sign-in?returnTo=/sign-in')).toBe('/workspace');
    expect(safeReturnTo('//evil.example/path')).toBe('/workspace');
    expect(safeReturnTo('https://evil.example/path')).toBe('/workspace');
  });

  it('resolves role-aware defaults and verification-gated return targets', () => {
    expect(canAccessSessionPath(customerSession, '/ledger')).toBe(false);
    expect(canAccessSessionPath(adminSession, '/ledger')).toBe(true);
    expect(canAccessSessionPath(adminSession, '/health')).toBe(false);
    expect(
      canAccessSessionPath(
        { ...adminSession, capabilities: [...adminSession.capabilities, 'operations:read'] },
        '/health',
      ),
    ).toBe(true);
    expect(defaultSessionDestination(customerSession)).toBe('/account/verification');
    expect(
      defaultSessionDestination({
        ...customerSession,
        identityVerificationStatus: 'APPROVED',
      }),
    ).toBe('/classes#schedule');
    expect(defaultSessionDestination(adminSession)).toBe('/workspace');
    expect(
      forbiddenSessionDestination(
        {
          ...adminSession,
          roles: ['SUPER_OWNER'],
          capabilities: [...adminSession.capabilities, 'identity-verification:read'],
        },
        '/account/verification',
      ),
    ).toBe('/identity-verifications');
    expect(forbiddenSessionDestination(adminSession, '/account/verification')).toBe('/workspace');
    expect(
      resolveSessionDestination(
        {
          ...customerSession,
          roles: ['CUSTOMER', 'ADMIN'],
          capabilities: [...customerSession.capabilities, 'identity-verification:read'],
        },
        '/account/verification',
      ),
    ).toBe('/workspace');
    expect(
      defaultSessionDestination({
        ...customerSession,
        roles: ['CUSTOMER', 'ADMIN'],
      }),
    ).toBe('/workspace');

    expect(resolveSessionDestination(customerSession, '/classes?slot=one')).toBe(
      '/classes?slot=one',
    );
    expect(resolveSessionDestination(customerSession, '/bookings')).toBe('/account/verification');
    expect(resolveSessionDestination(customerSession, '/purchases?package=one')).toBe(
      '/account/verification',
    );
    expect(resolveSessionDestination(customerSession, '//evil.example/path')).toBe(
      '/account/verification',
    );
    expect(
      resolveSessionDestination(
        { ...customerSession, identityVerificationStatus: 'APPROVED' },
        '/bookings',
      ),
    ).toBe('/bookings');
  });

  it('renders a role-aware dashboard without exposing unavailable workspaces', async () => {
    const client: SessionClient = { me: vi.fn().mockResolvedValue(adminSession), logout: vi.fn() };
    render(
      <SessionProvider client={client}>
        <Dashboard />
      </SessionProvider>,
    );
    expect(
      await screen.findByRole('heading', { name: 'Selamat datang, Admin Jakarta' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Booking & reschedule/ })).toBeVisible();
    expect(screen.getByRole('link', { name: /Ledger & adjustment/ })).toBeVisible();
    expect(screen.queryByRole('link', { name: /Operations H-24/ })).not.toBeInTheDocument();
    expect(screen.getByText('Pilih cabang aktif di bagian atas', { exact: false })).toBeVisible();
  });

  it('keeps logged-in customers inside the customer shell on the public catalog routes', async () => {
    navigation.pathname = '/classes';
    const client: SessionClient = {
      me: vi.fn().mockResolvedValue({
        ...customerSession,
        identityVerificationStatus: 'APPROVED',
        preferredBranch: {
          id: 'branch-1',
          code: 'JKT',
          name: 'Jakarta',
          timezone: 'Asia/Jakarta',
        },
      }),
      logout: vi.fn(),
    };
    const view = render(
      <SessionProvider client={client}>
        <ApplicationShell>
          <div>Katalog kelas customer</div>
        </ApplicationShell>
      </SessionProvider>,
    );
    expect(
      await screen.findByRole('navigation', { name: 'Navigasi customer' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jadwal' })).toHaveAttribute('aria-current', 'page');
    expect(view.container.querySelector('[data-customer-shell]')).toBeInTheDocument();
    expect(view.container.querySelector('[data-admin-shell]')).not.toBeInTheDocument();
  });

  it('separates the customer dashboard from the public landing destination', async () => {
    navigation.pathname = '/account';
    const client: SessionClient = {
      me: vi.fn().mockResolvedValue({
        ...customerSession,
        identityVerificationStatus: 'APPROVED',
      }),
      logout: vi.fn(),
    };
    render(
      <SessionProvider client={client}>
        <ApplicationShell>
          <div>Dashboard customer</div>
        </ApplicationShell>
      </SessionProvider>,
    );

    const customerNav = await screen.findByRole('navigation', { name: 'Navigasi customer' });
    expect(
      customerNav.querySelector<HTMLAnchorElement>('a[aria-current="page"]'),
    ).toHaveTextContent('Dashboard');
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/account');
    expect(
      screen.getByRole('link', { name: 'Daily Dose Pilates — Kembali ke situs utama' }),
    ).toHaveAttribute('href', '/');

    fireEvent.click(screen.getByRole('button', { name: 'Menu profil Nadia Customer' }));
    expect(
      screen.getByRole('region', { name: 'Menu akun customer' }).querySelector('a[href="/"]'),
    ).toHaveTextContent('Kunjungi situs utama');

    fireEvent.click(screen.getByRole('button', { name: 'Buka navigasi akun' }));
    const mobileNav = screen.getByRole('navigation', { name: 'Navigasi akun' });
    expect(mobileNav).toHaveAttribute('aria-hidden', 'false');
    expect(within(mobileNav).getByRole('link', { name: 'Kunjungi situs utama' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(within(mobileNav).getByRole('button', { name: 'Keluar' })).toBeVisible();
  });

  it('keeps the public landing header aware of an authenticated customer', async () => {
    navigation.pathname = '/';
    const client: SessionClient = {
      me: vi.fn().mockResolvedValue(customerSession),
      logout: vi.fn(),
    };
    render(
      <SessionProvider client={client}>
        <PublicHeader />
      </SessionProvider>,
    );

    expect(await screen.findByRole('link', { name: 'Buka akun saya' })).toHaveAttribute(
      'href',
      '/account',
    );
    expect(screen.queryByRole('link', { name: 'Masuk ke akun' })).not.toBeInTheDocument();
  });

  it('keeps the session active and uses global feedback when logout fails', async () => {
    navigation.pathname = '/account';
    const client: SessionClient = {
      me: vi.fn().mockResolvedValue(customerSession),
      logout: vi.fn().mockRejectedValue(new Error('network unavailable')),
    };
    render(
      <AppFeedbackProvider>
        <SessionProvider client={client}>
          <ApplicationShell>
            <div>Dashboard customer</div>
          </ApplicationShell>
        </SessionProvider>
      </AppFeedbackProvider>,
    );

    await screen.findByRole('navigation', { name: 'Navigasi customer' });
    fireEvent.click(screen.getByRole('button', { name: 'Menu profil Nadia Customer' }));
    fireEvent.click(
      within(screen.getByRole('region', { name: 'Menu akun customer' })).getByRole('button', {
        name: 'Keluar',
      }),
    );

    expect(await screen.findByRole('heading', { name: 'Keluar belum berhasil' })).toBeVisible();
    expect(client.logout).toHaveBeenCalledOnce();
    expect(navigation.replace).not.toHaveBeenCalledWith('/sign-in');
    expect(screen.getByText('Dashboard customer')).toBeVisible();
  });
});
