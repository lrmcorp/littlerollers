'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  browserSessionClient,
  sessionFailure,
  type SessionClient,
  type SessionStatus,
  type WebSession,
} from './session-client';
import { Feedback, Skeleton } from './ui';

const ACTIVE_BRANCH_KEY = 'dd_active_branch';
const publicPaths = new Set(['/sign-in', '/health']);

const routeCapabilities: Array<[string, string[]]> = [
  ['/users', ['user:read']],
  ['/assignments', ['assignment:read']],
  ['/master', ['master:read']],
  ['/purchases', ['package:read', 'purchase:review']],
  ['/ledger', ['ledger:read']],
  ['/classes', ['class-slot:read']],
  ['/operations', ['operations:read']],
  ['/bookings', ['booking:read']],
];

interface SessionContextValue {
  status: SessionStatus;
  session: WebSession | null;
  activeBranchId: string;
  activeBranch: WebSession['branches'][number] | null;
  setActiveBranchId(id: string): void;
  hasCapability(...required: string[]): boolean;
  refresh(): Promise<WebSession | null>;
  completeSignIn(returnTo: string): Promise<boolean>;
  logout(): Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, 'http://local.invalid');
    return url.origin === 'http://local.invalid' ? `${url.pathname}${url.search}${url.hash}` : '/';
  } catch {
    return '/';
  }
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
  const router = useRouter();

  const setActiveBranchId = useCallback(
    (id: string) => {
      const valid = session?.branches.some((branch) => branch.id === id) ? id : '';
      setBranch(valid);
      if (valid) sessionStorage.setItem(ACTIVE_BRANCH_KEY, valid);
      else sessionStorage.removeItem(ACTIVE_BRANCH_KEY);
    },
    [session],
  );

  const refresh = useCallback(async () => {
    setStatus('loading');
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
  }, [client]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!session) return;
    const remaining = session.sessionExpiresAt.getTime() - Date.now();
    const timer = window.setTimeout(
      () => {
        setSession(null);
        setBranch('');
        sessionStorage.removeItem(ACTIVE_BRANCH_KEY);
        setStatus('expired');
      },
      Math.min(remaining, 2_147_483_647),
    );
    return () => window.clearTimeout(timer);
  }, [session]);

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
    if (publicPaths.has(pathname) || status === 'loading' || status === 'dependency-error') return;
    if (status !== 'authenticated') {
      const returnTo = encodeURIComponent(`${pathname}${window.location.search}`);
      router.replace(`/sign-in?returnTo=${returnTo}`);
    }
  }, [pathname, router, status]);

  const logout = useCallback(async () => {
    try {
      await client.logout();
    } finally {
      setSession(null);
      setBranch('');
      sessionStorage.removeItem(ACTIVE_BRANCH_KEY);
      setStatus('unauthenticated');
      router.replace('/sign-in');
    }
  }, [client, router]);

  const completeSignIn = useCallback(
    async (returnTo: string) => {
      const current = await refresh();
      if (!current) return false;
      router.replace(safeReturnTo(returnTo));
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

  const required = routeCapabilities.find(([route]) => pathname.startsWith(route))?.[1];
  const publicRoute = publicPaths.has(pathname);
  const allowed = !required || required.some((item) => session?.capabilities.includes(item));

  return (
    <SessionContext.Provider value={value}>
      {!publicRoute && status === 'loading' ? (
        <main className="content session-state">
          <Skeleton label="Memuat sesi" />
        </main>
      ) : !publicRoute && status === 'dependency-error' ? (
        <main className="content session-state">
          <Feedback kind="error">Konteks sesi tidak dapat dimuat.</Feedback>
          <button onClick={() => void refresh()}>Coba lagi</button>
        </main>
      ) : !publicRoute && status === 'authenticated' && !allowed ? (
        <main className="content session-state">
          <Feedback kind="error">Anda tidak memiliki akses ke area ini.</Feedback>
          <a href="/">Kembali ke ringkasan</a>
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
  const [branchId, setBranchId] = useState(context?.activeBranchId ?? '');
  useEffect(() => {
    if (context) setBranchId(context.activeBranchId);
  }, [context, context?.activeBranchId]);
  return [branchId, setBranchId];
}
