'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  browserSessionClient,
  sessionFailure,
  type SessionClient,
  type SessionStatus,
  type WebSession,
} from '@/api-clients/session-client';
import { Feedback, Skeleton } from './ui';
import { isPublicExperiencePath } from '@/lib/session-audience';
import { useOptionalAppFeedback } from './components/app-feedback';
import { useTrackedRouter } from './components/app-loading';
import { ActionGroup, Button, ButtonLink } from './components/actions';

const ACTIVE_BRANCH_KEY = 'dd_active_branch';
const anonymousEntryPaths = new Set([
  '/sign-in',
  '/register',
  '/activate-account',
  '/forgot-password',
  '/reset-password',
]);

const routeCapabilities: Array<[string, string[]]> = [
  ['/account/verification', ['customer:self']],
  ['/account/profile', []],
  ['/account/settings', []],
  ['/account/security', []],
  ['/account', ['customer:self']],
  ['/identity-verifications', ['identity-verification:read']],
  ['/audit', ['audit:read']],
  ['/migrations', ['migration:read']],
  ['/data-import', ['migration:read', 'migration:resolve', 'user:admin', 'master:manage']],
  ['/users/roles-permissions', ['user:admin']],
  ['/users', ['user:read']],
  ['/customers', ['customer:read']],
  ['/instructors', ['assignment:read']],
  ['/notification-management', ['notification:manage']],
  ['/public-content-management', ['public-content:read']],
  ['/support-cases', ['support:read']],
  ['/assignments', ['assignment:read']],
  ['/master', ['master:read']],
  ['/checkout', ['customer:self']],
  ['/orders', ['customer:self']],
  ['/account/packages', ['customer:self']],
  ['/workspace/payments', ['payment:review', 'purchase:review']],
  ['/workspace/bookings', ['booking:read', 'reschedule:read']],
  ['/workspace/branches', ['master:read', 'master:manage']],
  ['/workspace/packages', ['package-promotion:read', 'package-promotion:manage']],
  ['/workspace/vouchers', ['voucher:read', 'voucher:manage']],
  ['/purchases', ['package:read', 'payment:review', 'purchase:review']],
  ['/finance', ['finance:reconcile']],
  ['/ledger', ['ledger:read']],
  ['/health', ['operations:read']],
  ['/workspace/classes', ['class-slot:read']],
  ['/operations', ['operations:read']],
  ['/bookings', ['booking:self:read']],
  ['/check-in-scanner', ['attendance:manage']],
];

interface SessionContextValue {
  status: SessionStatus;
  session: WebSession | null;
  activeBranchId: string;
  activeBranch: WebSession['branches'][number] | null;
  setActiveBranchId(id: string): void;
  hasCapability(...required: string[]): boolean;
  refresh(options?: { quiet?: boolean }): Promise<WebSession | null>;
  completeSignIn(returnTo: string): Promise<boolean>;
  logout(): Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/workspace';
  try {
    const url = new URL(value, 'http://local.invalid');
    if (url.origin !== 'http://local.invalid') return '/workspace';
    if (
      [
        '/sign-in',
        '/register',
        '/activate-account',
        '/forgot-password',
        '/reset-password',
      ].includes(url.pathname)
    )
      return '/workspace';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/workspace';
  }
}

const internalRoles = new Set([
  'INSTRUCTOR',
  'ADMIN',
  'MANAGER',
  'OWNER',
  'SUPER_OWNER',
  'FINANCE',
  'OPS',
]);

export function defaultSessionDestination(session: WebSession): string {
  if (session.passwordChangeRequired) return '/account/security?required=true';
  if (session.roles.some((role) => internalRoles.has(role))) return '/workspace';
  if (session.roles.includes('CUSTOMER'))
    return session.identityVerificationStatus === 'APPROVED'
      ? '/classes#schedule'
      : '/account/verification';
  return '/workspace';
}

export function forbiddenSessionDestination(session: WebSession, pathname: string): string {
  const customerOnly =
    session.roles.includes('CUSTOMER') && !session.roles.some((role) => internalRoles.has(role));
  if (customerOnly && pathname.startsWith('/workspace/bookings'))
    return `/bookings${pathname.slice('/workspace/bookings'.length)}`;
  if (!customerOnly && (pathname === '/bookings' || pathname.startsWith('/bookings/')))
    return `/workspace/bookings${pathname.slice('/bookings'.length)}`;
  if (pathname === '/account/verification' && session.roles.some((role) => internalRoles.has(role)))
    return session.capabilities.includes('identity-verification:read')
      ? '/identity-verifications'
      : '/workspace';
  return defaultSessionDestination(session);
}

export function canAccessSessionPath(session: WebSession, value: string): boolean {
  const path = new URL(value, 'http://local.invalid').pathname;
  if (isPublicExperiencePath(path)) return true;
  if (session.passwordChangeRequired) return path === '/account/security';
  const customerOnly =
    session.roles.includes('CUSTOMER') && !session.roles.some((role) => internalRoles.has(role));
  if (!customerOnly && (path === '/bookings' || path.startsWith('/bookings/'))) return false;
  if (customerOnly && (path === '/workspace/bookings' || path.startsWith('/workspace/bookings/')))
    return false;
  if (customerOnly && path === '/ledger') return false;
  if (path === '/account/verification' && !customerOnly) return false;
  if (
    customerOnly &&
    session.identityVerificationStatus !== 'APPROVED' &&
    (path === '/bookings' ||
      path.startsWith('/bookings/') ||
      path === '/checkout' ||
      path.startsWith('/checkout/') ||
      path === '/orders' ||
      path.startsWith('/orders/') ||
      path === '/purchases' ||
      path.startsWith('/purchases/'))
  )
    return false;
  if (path === '/workspace') return session.roles.some((role) => internalRoles.has(role));
  const rule = routeCapabilities.find(([route]) => path === route || path.startsWith(`${route}/`));
  if (!rule) return false;
  const required = rule[1];
  return (
    required.length === 0 ||
    required.some((capability) => session.capabilities.includes(capability))
  );
}

export function resolveSessionDestination(
  session: WebSession,
  requestedReturnTo?: string | null,
): string {
  const fallback = defaultSessionDestination(session);
  if (!requestedReturnTo) return fallback;
  const safe = safeReturnTo(requestedReturnTo);
  if (safe === '/workspace' && requestedReturnTo !== '/workspace') return fallback;
  if (!canAccessSessionPath(session, safe)) return fallback;
  return safe;
}

export function SessionProvider({
  children,
  client = browserSessionClient,
}: {
  children: React.ReactNode;
  client?: SessionClient;
}) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [session, setSession] = useState<WebSession | null>(null);
  const [activeBranchId, setBranch] = useState('');
  const pathname = usePathname();
  const router = useTrackedRouter();
  const feedback = useOptionalAppFeedback();

  const setActiveBranchId = useCallback(
    (id: string) => {
      const valid = session?.branches.some((branch) => branch.id === id) ? id : '';
      setBranch(valid);
      if (valid) sessionStorage.setItem(ACTIVE_BRANCH_KEY, valid);
      else sessionStorage.removeItem(ACTIVE_BRANCH_KEY);
    },
    [session],
  );

  const refresh = useCallback(
    async (options?: { quiet?: boolean }) => {
      if (!options?.quiet) setStatus('loading');
      try {
        const current = await client.me();
        if (
          !Number.isFinite(current.sessionExpiresAt.getTime()) ||
          current.sessionExpiresAt <= new Date()
        ) {
          setSession(null);
          setStatus('expired');
          sessionStorage.removeItem(ACTIVE_BRANCH_KEY);
          return null;
        }
        setSession(current);
        const stored = sessionStorage.getItem(ACTIVE_BRANCH_KEY) ?? '';
        setBranch(current.branches.some(({ id }) => id === stored) ? stored : '');
        if (stored && !current.branches.some(({ id }) => id === stored))
          sessionStorage.removeItem(ACTIVE_BRANCH_KEY);
        setStatus('authenticated');
        return current;
      } catch (error) {
        setSession(null);
        setBranch('');
        sessionStorage.removeItem(ACTIVE_BRANCH_KEY);
        setStatus(sessionFailure(error));
        return null;
      }
    },
    [client],
  );

  useEffect(() => {
    if (anonymousEntryPaths.has(pathname)) {
      setStatus('unauthenticated');
      return;
    }
    void refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    if (!session) return;
    const remaining = session.sessionExpiresAt.getTime() - Date.now();
    const timer = window.setTimeout(
      () => {
        void refresh();
      },
      Math.min(remaining, 2_147_483_647),
    );
    return () => window.clearTimeout(timer);
  }, [refresh, session]);

  useEffect(() => {
    const revoked = () => {
      setSession(null);
      setBranch('');
      sessionStorage.removeItem(ACTIVE_BRANCH_KEY);
      setStatus('expired');
    };
    window.addEventListener('dd-session-revoked', revoked);
    return () => window.removeEventListener('dd-session-revoked', revoked);
  }, []);

  useEffect(() => {
    if (isPublicExperiencePath(pathname) || status === 'loading' || status === 'dependency-error')
      return;
    if (status !== 'authenticated') {
      const returnTo = encodeURIComponent(
        `${pathname}${window.location.search}${window.location.hash}`,
      );
      router.replace(`/sign-in?returnTo=${returnTo}`);
    }
  }, [pathname, router, status]);

  const logout = useCallback(async () => {
    try {
      await client.logout();
    } catch {
      feedback?.showAlert({
        tone: 'danger',
        title: 'Keluar belum berhasil',
        message:
          'Sesi belum dapat ditutup dengan aman. Periksa koneksi lalu coba kembali sebelum meninggalkan perangkat ini.',
      });
      return;
    }
    setSession(null);
    setBranch('');
    sessionStorage.removeItem(ACTIVE_BRANCH_KEY);
    setStatus('unauthenticated');
    router.replace('/sign-in');
  }, [client, feedback, router]);

  const completeSignIn = useCallback(
    async (returnTo: string) => {
      const current = await refresh();
      if (!current) return false;
      router.replace(resolveSessionDestination(current, returnTo));
      return true;
    },
    [refresh, router],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      session,
      activeBranchId,
      activeBranch: session?.branches.find(({ id }) => id === activeBranchId) ?? null,
      setActiveBranchId,
      hasCapability: (...required) =>
        required.some((capability) => session?.capabilities.includes(capability)),
      refresh,
      completeSignIn,
      logout,
    }),
    [activeBranchId, completeSignIn, logout, refresh, session, setActiveBranchId, status],
  );

  const required = routeCapabilities.find(
    ([route]) => pathname === route || pathname.startsWith(`${route}/`),
  )?.[1];
  const publicRoute = isPublicExperiencePath(pathname);
  const allowed = session ? canAccessSessionPath(session, pathname) : !required;
  const fallback = session ? forbiddenSessionDestination(session, pathname) : '/workspace';
  const staffVerificationRedirect = Boolean(
    session &&
    pathname === '/account/verification' &&
    session.roles.some((role) => internalRoles.has(role)),
  );

  useEffect(() => {
    if (status === 'authenticated' && session && !publicRoute && !allowed) router.replace(fallback);
  }, [allowed, fallback, publicRoute, router, session, status]);

  return (
    <SessionContext.Provider value={value}>
      {!publicRoute && status === 'loading' ? (
        <main className="content session-state">
          <Skeleton label="Memuat sesi" />
        </main>
      ) : !publicRoute && status === 'dependency-error' ? (
        <main className="content session-state space-y-4">
          <Feedback kind="error">Konteks sesi tidak dapat dimuat.</Feedback>
          <ActionGroup>
            <Button onClick={() => void refresh()}>Coba lagi</Button>
            <ButtonLink variant="secondary" href="/">
              Kunjungi situs utama
            </ButtonLink>
          </ActionGroup>
        </main>
      ) : !publicRoute && status === 'authenticated' && !allowed ? (
        <main className="content session-state space-y-4">
          <Feedback kind={staffVerificationRedirect ? 'info' : 'error'}>
            {staffVerificationRedirect
              ? 'Halaman verifikasi akun hanya untuk customer. Anda sedang diarahkan ke antrean reviewer.'
              : 'Anda tidak memiliki akses ke area ini.'}
          </Feedback>
          <ActionGroup>
            <ButtonLink href={fallback}>
              {staffVerificationRedirect ? 'Buka antrean verifikasi' : 'Kembali ke ringkasan'}
            </ButtonLink>
          </ActionGroup>
        </main>
      ) : !publicRoute && status !== 'authenticated' ? (
        <main className="content session-state">
          <Skeleton label="Mengarahkan ke halaman masuk" />
        </main>
      ) : (
        children
      )}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  return useContext(SessionContext);
}

export function useActiveBranchState(): [string, (id: string) => void] {
  const context = useSessionContext();
  const [localBranchId, setLocalBranchId] = useState('');
  return context
    ? [context.activeBranchId, context.setActiveBranchId]
    : [localBranchId, setLocalBranchId];
}
