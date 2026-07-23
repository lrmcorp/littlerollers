import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplicationShell } from './application-shell';
import { Dashboard } from './dashboard';
import { safeReturnTo, SessionProvider, useSessionContext } from './session-context';
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
  assurance: 'BASE',
  sessionExpiresAt: new Date(Date.now() + 60_000),
  branches: [
    { id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' },
    { id: 'branch-2', code: 'BDG', name: 'Bandung', timezone: 'Asia/Jakarta' },
  ],
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

  it('accepts only same-origin relative return targets', () => {
    expect(safeReturnTo('/ledger?cursor=one')).toBe('/ledger?cursor=one');
    expect(safeReturnTo('//evil.example/path')).toBe('/workspace');
    expect(safeReturnTo('https://evil.example/path')).toBe('/workspace');
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
});
