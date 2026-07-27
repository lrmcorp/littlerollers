'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { AppNavigation } from './app-navigation';
import { useSessionContext } from './session-context';
import { routes } from './routes';
import { canReadPage, frontendPages } from './frontend-pages';
import { PublicExperience } from './components/public/public-experience';
import { NotificationCenter } from './components/notification-center';
import { CustomerNavigation } from './components/customer/customer-navigation';

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

const roleLabels: Record<string, string> = {
  SUPER_OWNER: 'Super Owner',
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  FINANCE: 'Finance',
  OPS: 'Operations',
  INSTRUCTOR: 'Instructor',
  CUSTOMER: 'Customer',
};

const accountPageLabels: Record<string, string> = {
  '/account/profile': 'Profil Saya',
  '/account/settings': 'Pengaturan',
  '/account/security': 'Keamanan akun',
  '/account/verification': 'Verifikasi identitas',
};

function pageForPath(pathname: string) {
  return [...frontendPages]
    .sort((left, right) => right.href.length - left.href.length)
    .find(
      (page) =>
        pathname === page.href ||
        (page.href !== '/workspace' && pathname.startsWith(`${page.href}/`)),
    );
}

export function ApplicationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const context = useSessionContext();
  const session = context?.session;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRoot = useRef<HTMLDivElement>(null);
  const profileTrigger = useRef<HTMLButtonElement>(null);
  const currentPage = pageForPath(pathname);
  const currentPageLabel = currentPage?.shortLabel ?? accountPageLabels[pathname];
  const canViewAllBranches = Boolean(session?.capabilities.includes('branch:all'));
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
      if (event.key === 'Escape') {
        setCommandOpen(false);
        setMobileOpen(false);
        if (profileOpen) profileTrigger.current?.focus();
        setProfileOpen(false);
      }
    };
    const outsideHandler = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!profileRoot.current?.contains(target)) setProfileOpen(false);
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('pointerdown', outsideHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('pointerdown', outsideHandler);
    };
  }, [profileOpen]);
  const customerOnly =
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER');
  const customerCatalog = customerOnly && (pathname === '/classes' || pathname === '/packages');
  if (publicPaths.includes(pathname) && !customerCatalog)
    return (
      <>
        {children}
        <PublicExperience />
      </>
    );
  if (customerOnly) {
    return (
      <div className="min-h-dvh bg-dd-canvas text-dd-ink" data-customer-shell>
        <a className="skip-link" href="#main-content">
          Langsung ke konten utama
        </a>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-dd-line/80 bg-dd-surface/95 backdrop-blur-xl">
            <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:min-h-[72px] lg:px-8">
              <button
                type="button"
                aria-label="Buka navigasi akun"
                aria-controls="customer-navigation"
                onClick={() => setMobileOpen(true)}
                className="grid size-10 min-h-0 place-items-center rounded-dd-md border border-dd-line bg-white p-0 text-dd-ink lg:hidden"
              >
                <Menu className="size-5" />
              </button>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-dd-muted">
                  Akun Daily Dose
                </span>
                <strong className="block truncate text-sm sm:text-base">
                  {currentPageLabel ?? 'Akun Saya'}
                </strong>
              </div>
              <Link
                href="/contact"
                aria-label="Bantuan customer"
                className="grid size-10 place-items-center rounded-dd-md border border-dd-line bg-white text-dd-muted no-underline"
              >
                <CircleHelp className="size-[18px]" />
              </Link>
              <NotificationCenter compact />
              <div className="relative" ref={profileRoot}>
                <button
                  ref={profileTrigger}
                  type="button"
                  aria-label={`Menu profil ${session?.displayName ?? 'customer'}`}
                  aria-expanded={profileOpen}
                  aria-controls="customer-profile-menu"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex min-h-10 items-center gap-2 rounded-dd-md border border-dd-line bg-white p-1.5 sm:pr-3"
                >
                  <span className="grid size-7 place-items-center rounded-dd-md bg-dd-sidebar text-white">
                    <UserRound className="size-4" />
                  </span>
                  <span className="hidden max-w-36 truncate text-sm font-bold sm:block">
                    {session?.displayName ?? 'Customer'}
                  </span>
                  <ChevronDown className="hidden size-3.5 text-dd-muted sm:block" />
                </button>
                {profileOpen && (
                  <div
                    id="customer-profile-menu"
                    role="region"
                    aria-label="Menu akun customer"
                    className="absolute right-0 mt-2 w-60 rounded-dd-lg border border-dd-line bg-white p-2 shadow-dd-float"
                  >
                    <Link
                      href="/account/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                    >
                      <UserRound className="size-4" />
                      Profil Saya
                    </Link>
                    <Link
                      href="/account/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                    >
                      <CircleHelp className="size-4" />
                      Pengaturan
                    </Link>
                    <Link
                      href={routes.security}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
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
                )}
              </div>
            </div>
            {session?.preferredBranch && (
              <div className="border-t border-dd-line px-4 py-2 text-xs text-dd-muted sm:px-6 lg:hidden">
                Studio aktif:{' '}
                <strong className="text-dd-ink">{session.preferredBranch.name}</strong>
              </div>
            )}
            <CustomerNavigation
              open={mobileOpen}
              approved={session?.identityVerificationStatus === 'APPROVED'}
              onClose={() => setMobileOpen(false)}
            />
          </header>
          <div
            className={
              customerCatalog
                ? 'min-w-0'
                : 'mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8'
            }
            id="main-content"
          >
            {children}
          </div>
        </div>
        <PublicExperience />
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
          <div className="grid min-h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 xl:px-8">
            <button
              type="button"
              aria-label="Buka navigasi"
              onClick={() => setMobileOpen(true)}
              className="grid size-10 min-h-0 place-items-center rounded-dd-md border border-dd-line bg-white p-0 text-dd-ink lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0">
              <div
                className="hidden min-w-0 items-center gap-2 text-xs text-dd-muted sm:flex"
                aria-label="Breadcrumb"
              >
                <Link href="/workspace" className="font-semibold text-dd-forest no-underline">
                  Workspace
                </Link>
                {pathname !== '/workspace' && (
                  <>
                    <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{currentPageLabel ?? 'Workspace'}</span>
                  </>
                )}
              </div>
              <strong className="block truncate text-sm text-dd-ink sm:mt-0.5 sm:text-base">
                {currentPageLabel ?? 'Dashboard'}
              </strong>
            </div>
            <div className="hidden min-w-0 justify-center xl:flex">
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="flex min-h-10 w-full max-w-sm items-center justify-start gap-2 rounded-dd-md border border-dd-line bg-dd-surface-muted px-3 text-sm font-medium text-dd-muted"
              >
                <Search className="size-4 shrink-0" />
                <span className="truncate">Cari atau jalankan perintah…</span>
                <kbd className="ml-auto rounded border border-dd-line bg-white px-1.5 py-0.5 text-[10px]">
                  ⌘K
                </kbd>
              </button>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-2">
              <button
                type="button"
                aria-label="Cari atau jalankan perintah"
                onClick={() => setCommandOpen(true)}
                className="grid size-10 min-h-0 shrink-0 place-items-center rounded-dd-md border border-dd-line bg-white p-0 text-dd-muted xl:hidden"
              >
                <Search className="size-[18px]" />
              </button>
              {session && (
                <label className="!hidden max-w-[210px] gap-1 text-[10px] font-bold uppercase tracking-wider text-dd-muted md:!grid">
                  <span className="sr-only">Cabang aktif</span>
                  <select
                    aria-label="Cabang aktif"
                    value={context?.activeBranchId ?? ''}
                    onChange={(event) => context?.setActiveBranchId(event.target.value)}
                    className="min-h-10 w-[clamp(150px,17vw,210px)] rounded-dd-md border-dd-line bg-white py-1.5 text-sm font-semibold normal-case tracking-normal text-dd-ink"
                  >
                    <option value="">{canViewAllBranches ? 'Semua cabang' : 'Pilih cabang'}</option>
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
                className="hidden size-10 shrink-0 place-items-center rounded-dd-md border border-dd-line bg-white text-dd-muted no-underline 2xl:grid"
              >
                <CircleHelp className="size-[18px]" />
              </Link>
              <NotificationCenter />
              <div className="relative" ref={profileRoot}>
                <button
                  ref={profileTrigger}
                  type="button"
                  aria-label={`Menu profil ${session?.displayName ?? 'internal'}`}
                  aria-expanded={profileOpen}
                  aria-controls="workspace-profile-menu"
                  onClick={() => {
                    setProfileOpen((open) => !open);
                  }}
                  className="flex min-h-0 items-center gap-2 rounded-dd-md border border-dd-line bg-white p-1.5 lg:pr-2 2xl:pr-3"
                >
                  <span className="grid size-8 place-items-center rounded-dd-md bg-dd-sidebar text-white">
                    <UserRound className="size-4" />
                  </span>
                  <span className="hidden max-w-28 truncate text-sm font-bold 2xl:block">
                    {session?.displayName ?? 'Internal workspace'}
                  </span>
                  <ChevronDown className="hidden size-3.5 text-dd-muted 2xl:block" />
                </button>
                {profileOpen && (
                  <div
                    id="workspace-profile-menu"
                    role="region"
                    aria-label="Menu akun internal"
                    className="absolute right-0 mt-2 w-64 rounded-dd-lg border border-dd-line bg-white p-2 shadow-dd-float"
                  >
                    <div className="border-b border-dd-line px-3 py-3">
                      <strong className="block text-sm">Akun internal</strong>
                      <span className="mt-1 block text-xs text-dd-muted">
                        {session?.roles.map((role) => roleLabels[role] ?? role).join(' · ')}
                      </span>
                    </div>
                    <Link
                      href="/account/profile"
                      onClick={() => setProfileOpen(false)}
                      className="mt-2 flex items-center gap-2 rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                    >
                      <UserRound className="size-4" />
                      Profil Saya
                    </Link>
                    <Link
                      href="/account/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                    >
                      <CircleHelp className="size-4" />
                      Pengaturan
                    </Link>
                    <Link
                      href={routes.security}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
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
                )}
              </div>
            </div>
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
                <option value="">
                  {canViewAllBranches ? 'Semua cabang' : 'Pilih cabang aktif'}
                </option>
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
