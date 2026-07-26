'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, ChevronRight, CircleHelp, Menu, Search, ShieldCheck, UserRound } from 'lucide-react';
import { AppNavigation } from './app-navigation';
import { useSessionContext } from './session-context';
import { routes } from './routes';
import { canReadPage, frontendPages } from './frontend-pages';

const publicPaths = [
  '/',
  '/classes',
  '/packages',
  '/locations',
  '/contact',
  '/sign-in',
  '/register',
  '/activate-account',
  '/forgot-password',
  '/reset-password',
  '/check-in-pass',
];

const titleForPath = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  return segments.at(-1)?.replaceAll('-', ' ') ?? 'Dashboard';
};

export function ApplicationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const context = useSessionContext();
  const session = context?.session;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const commandPages = useMemo(
    () =>
      session
        ? frontendPages
            .filter((page) => canReadPage(session.capabilities, page))
            .filter((page) =>
              `${page.label} ${page.description}`
                .toLowerCase()
                .includes(commandQuery.toLowerCase()),
            )
        : [],
    [commandQuery, session],
  );
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  const customerOnly =
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER');
  if (publicPaths.includes(pathname)) return children;
  if (customerOnly) {
    return (
      <div className="shell">
        <AppNavigation />
        <div className="workspace">
          <main className="content" id="main-content">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-dd-canvas text-dd-ink lg:flex" data-admin-shell>
      <a className="skip-link" href="#main-content">
        Langsung ke konten utama
      </a>
      <AppNavigation
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onCollapse={() => setCollapsed((value) => !value)}
      />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-dd-line/80 bg-dd-surface/95 backdrop-blur-xl">
          <div className="flex min-h-[72px] items-center gap-3 px-4 sm:px-6 xl:px-8">
            <button
              type="button"
              aria-label="Buka navigasi"
              onClick={() => setMobileOpen(true)}
              className="grid size-10 min-h-0 place-items-center rounded-dd-md border border-dd-line bg-white p-0 text-dd-ink lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div
              className="hidden min-w-0 items-center gap-2 text-sm text-dd-muted sm:flex"
              aria-label="Breadcrumb"
            >
              <Link href="/workspace" className="font-semibold text-dd-forest no-underline">
                Workspace
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <span className="truncate capitalize">{titleForPath(pathname)}</span>
            </div>
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="ml-auto hidden min-h-10 w-full max-w-xs items-center justify-start gap-2 rounded-dd-md border border-dd-line bg-dd-surface-muted px-3 text-sm font-medium text-dd-muted xl:flex"
            >
              <Search className="size-4" />
              Cari atau jalankan perintah…{' '}
              <kbd className="ml-auto rounded border border-dd-line bg-white px-1.5 py-0.5 text-[10px]">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              aria-label="Cari atau jalankan perintah"
              onClick={() => setCommandOpen(true)}
              className="ml-auto grid size-10 min-h-0 shrink-0 place-items-center rounded-dd-md border border-dd-line bg-white p-0 text-dd-muted xl:hidden"
            >
              <Search className="size-[18px]" />
            </button>
            {session && (
              <label className="branch-context-field !hidden min-w-52 gap-1 text-[10px] font-bold uppercase tracking-wider text-dd-muted md:!grid">
                Cabang aktif
                <select
                  aria-label="Cabang aktif"
                  value={context?.activeBranchId ?? ''}
                  onChange={(event) => context?.setActiveBranchId(event.target.value)}
                  className="min-h-9 rounded-dd-md border-dd-line bg-white py-1.5 text-sm font-semibold normal-case tracking-normal text-dd-ink"
                >
                  <option value="">Pilih cabang</option>
                  {session.branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.code} · {branch.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Link
              href="/health"
              aria-label="Bantuan dan status"
              className="hidden size-10 place-items-center rounded-dd-md border border-dd-line bg-white text-dd-muted no-underline sm:grid"
            >
              <CircleHelp className="size-[18px]" />
            </Link>
            <details className="relative">
              <summary
                aria-label="Notifikasi"
                className="relative grid size-10 cursor-pointer list-none place-items-center rounded-dd-md border border-dd-line bg-white text-dd-muted"
              >
                <Bell className="size-[18px]" />
              </summary>
              <div className="absolute right-0 mt-2 w-72 rounded-dd-lg border border-dd-line bg-white p-4 shadow-dd-float">
                <strong className="text-sm">Notifikasi</strong>
                <p className="mt-3 rounded-dd-md bg-dd-surface-muted p-4 text-center text-xs leading-5 text-dd-muted">
                  Belum ada notifikasi baru. Antrean aktif tersedia pada dashboard.
                </p>
              </div>
            </details>
            <details className="relative">
              <summary
                aria-label={`Menu profil ${session?.displayName ?? 'internal'}`}
                className="flex cursor-pointer list-none items-center gap-2 rounded-dd-md border border-dd-line bg-white p-1.5 pr-3"
              >
                <span className="grid size-8 place-items-center rounded-dd-md bg-dd-sidebar text-white">
                  <UserRound className="size-4" />
                </span>
                <span className="hidden max-w-36 truncate text-sm font-bold lg:block">
                  {session?.displayName ?? 'Internal workspace'}
                </span>
              </summary>
              <div className="absolute right-0 mt-2 w-64 rounded-dd-lg border border-dd-line bg-white p-2 shadow-dd-float">
                <div className="border-b border-dd-line px-3 py-3">
                  <strong className="block text-sm">Akun internal</strong>
                  <span className="mt-1 block text-xs text-dd-muted">
                    {session?.roles.join(' · ')}
                  </span>
                </div>
                <Link
                  href={routes.security}
                  className="mt-2 flex items-center gap-2 rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                >
                  <ShieldCheck className="size-4" />
                  Keamanan akun
                </Link>
                <button
                  className="mt-1 flex min-h-10 w-full items-center rounded-dd-md border-0 bg-transparent px-3 text-sm font-semibold text-dd-danger hover:bg-dd-danger-soft"
                  onClick={() => void context?.logout()}
                >
                  Keluar
                </button>
              </div>
            </details>
          </div>
          {session && (
            <div className="border-t border-dd-line px-4 py-2 md:hidden">
              <label className="sr-only" htmlFor="mobile-branch">
                Cabang aktif mobile
              </label>
              <select
                id="mobile-branch"
                aria-label="Cabang aktif mobile"
                value={context?.activeBranchId ?? ''}
                onChange={(event) => context?.setActiveBranchId(event.target.value)}
                className="min-h-10 w-full rounded-dd-md border-dd-line bg-white text-sm font-semibold"
              >
                <option value="">Pilih cabang aktif</option>
                {session.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.code} · {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </header>
        <main
          className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
          id="main-content"
        >
          {children}
        </main>
      </div>
      {commandOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-start bg-dd-sidebar/55 p-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={(event) => event.target === event.currentTarget && setCommandOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Pencarian panel"
            className="mx-auto w-full max-w-2xl overflow-hidden rounded-dd-xl border border-dd-line bg-white shadow-dd-float"
          >
            <label className="flex items-center gap-3 border-b border-dd-line px-4">
              <Search className="size-5 text-dd-muted" />
              <span className="sr-only">Cari halaman</span>
              <input
                autoFocus
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Cari halaman atau pekerjaan…"
                className="min-h-14 flex-1 border-0 bg-transparent px-0 shadow-none outline-none"
              />
            </label>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {commandPages.length ? (
                commandPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    onClick={() => setCommandOpen(false)}
                    className="block rounded-dd-md px-4 py-3 text-dd-ink no-underline hover:bg-dd-surface-muted"
                  >
                    <strong className="block text-sm">{page.label}</strong>
                    <span className="mt-1 block text-xs text-dd-muted">{page.description}</span>
                  </Link>
                ))
              ) : (
                <p className="p-8 text-center text-sm text-dd-muted">
                  Tidak ada halaman yang cocok atau dapat Anda akses.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
