'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  CircleHelp,
  House,
  LockKeyhole,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { AppNavigation } from './app-navigation';
import { useSessionContext } from './session-context';
import { routes } from './routes';
import { canReadPage, frontendPages } from './frontend-pages';
import { useStudioPreference } from './components/public/public-experience';
import { NotificationCenter } from './components/notification-center';
import { SearchSelect } from './components/forms';
import { Modal, useOverlayPresence } from './components/app-feedback';
import { IconButton } from './components/actions';
import {
  CUSTOMER_ACCOUNT_NAVIGATION,
  CUSTOMER_PRIMARY_NAVIGATION,
  CustomerNavigation,
  isCustomerNavigationActive,
} from './components/customer/customer-navigation';
import { BrandMark } from './components/public/brand-mark';
import {
  isCustomerCatalogPath,
  isCustomerOnlySession,
  isPublicExperiencePath,
} from './session-audience';

const roleLabels: Record<string, string> = {
  SUPER_OWNER: 'Super Admin',
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  FINANCE: 'Finance',
  OPS: 'Operations',
  INSTRUCTOR: 'Instructor',
  CUSTOMER: 'Customer',
};

const accountPageLabels: Record<string, string> = {
  '/account': 'Dashboard',
  '/account/profile': 'Profil Saya',
  '/account/security': 'Keamanan akun',
  '/account/verification': 'Verifikasi identitas',
  '/checkout': 'Checkout',
  '/orders': 'Pesanan',
  '/bookings': 'Booking',
  '/workspace/bookings': 'Booking',
};

function accountPageLabelForPath(pathname: string) {
  return Object.entries(accountPageLabels)
    .sort(([left], [right]) => right.length - left.length)
    .find(
      ([href]) => pathname === href || (href !== '/account' && pathname.startsWith(`${href}/`)),
    )?.[1];
}

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
  const studioPreference = useStudioPreference();
  const session = context?.session;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const mobileOverlay = useOverlayPresence(mobileOpen, 'drawer');
  const profileRoot = useRef<HTMLDivElement>(null);
  const profileTrigger = useRef<HTMLButtonElement>(null);
  const currentPage = pageForPath(pathname);
  const currentPageLabel = accountPageLabelForPath(pathname) ?? currentPage?.shortLabel;
  const canViewAllBranches = Boolean(session?.capabilities.includes('branch:all'));
  const primaryRole = session?.roles.find((role) => role !== 'CUSTOMER');
  const activeScopeLabel = context?.activeBranch
    ? context.activeBranch.name
    : canViewAllBranches
      ? 'Semua cabang'
      : session?.branches.length
        ? 'Cabang assignment'
        : 'Scope belum tersedia';
  const canViewAssignedBranches = Boolean(
    !canViewAllBranches && (session?.branches.length ?? 0) > 1,
  );
  const aggregateBranchLabel = canViewAllBranches
    ? 'Semua cabang'
    : canViewAssignedBranches
      ? 'Semua cabang assignment'
      : null;
  const branchOptions = session
    ? [
        ...(aggregateBranchLabel
          ? [
              {
                id: '__ALL_BRANCHES__',
                label: aggregateBranchLabel,
                description: 'Mode baca lintas cabang',
              },
            ]
          : []),
        ...session.branches.map((branch) => ({
          id: branch.id,
          label: branch.name,
          description: `${branch.code} · ${roleLabels[primaryRole ?? ''] ?? primaryRole ?? 'Staf'} · ${activeScopeLabel}`,
        })),
      ]
    : [];
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
        setMobileOpen(false);
        setProfileOpen(false);
        setNotificationOpen(false);
        setCommandOpen(true);
      }
      if (event.key === 'Escape') {
        setCommandOpen(false);
        setMobileOpen(false);
        setNotificationOpen(false);
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
  const customerOnly = isCustomerOnlySession(session);
  const customerCatalog = customerOnly && isCustomerCatalogPath(pathname);
  if (isPublicExperiencePath(pathname) && !customerCatalog) return children;
  if (customerOnly) {
    const approved = session?.identityVerificationStatus === 'APPROVED';
    return (
      <div className="min-h-dvh bg-dd-canvas text-dd-ink" data-customer-shell>
        <a className="skip-link" href="#main-content">
          Langsung ke konten utama
        </a>
        <CustomerNavigation
          open={mobileOpen}
          rendered={mobileOverlay.rendered}
          phase={mobileOverlay.phase}
          approved={approved}
          onClose={() => setMobileOpen(false)}
          onLogout={() => context?.logout()}
        />
        <header
          className="sticky top-0 z-30 border-b border-dd-line/80 bg-dd-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl"
          aria-hidden={mobileOverlay.rendered || undefined}
          inert={mobileOverlay.rendered || undefined}
        >
          <div className="mx-auto flex min-h-16 w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:min-h-[72px] lg:px-8">
            <IconButton
              label="Buka navigasi akun"
              variant="secondary"
              aria-controls="customer-navigation"
              onClick={() => {
                setProfileOpen(false);
                setNotificationOpen(false);
                setCommandOpen(false);
                setMobileOpen(true);
              }}
              className="rounded-dd-md border-dd-line bg-white text-dd-ink shadow-none lg:hidden"
            >
              <Menu className="size-5" />
            </IconButton>
            <BrandMark
              href="/"
              priority
              className="hidden w-40 shrink-0 lg:inline-flex xl:w-44"
              ariaLabel="Daily Dose Pilates — Kembali ke situs utama"
            />
            <nav
              aria-label="Navigasi customer"
              className="hidden min-w-0 items-center gap-1 lg:flex xl:ml-3"
            >
              {CUSTOMER_PRIMARY_NAVIGATION.map((item) => {
                const selected = isCustomerNavigationActive(pathname, item.href);
                const locked = Boolean(item.requiresApproval && !approved);
                const href = locked
                  ? `/account/verification?returnTo=${encodeURIComponent(item.href)}`
                  : item.href;
                return (
                  <Link
                    key={item.href}
                    href={href}
                    aria-current={!mobileOpen && selected ? 'page' : undefined}
                    aria-label={locked ? `${item.label}, memerlukan verifikasi` : item.label}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-dd-md px-3 text-xs font-semibold no-underline xl:text-sm ${
                      selected
                        ? 'bg-dd-forest text-white shadow-dd-soft'
                        : 'text-dd-muted hover:bg-dd-surface-muted hover:text-dd-forest'
                    }`}
                  >
                    {item.label}
                    {locked && <LockKeyhole className="size-3" aria-hidden="true" />}
                  </Link>
                );
              })}
            </nav>
            <div className="min-w-0 flex-1 lg:hidden">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-dd-muted">
                Akun Daily Dose
              </span>
              <strong className="block truncate text-sm sm:text-base">
                {currentPageLabel ?? 'Akun Saya'}
              </strong>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {session?.preferredBranch && (
                <button
                  type="button"
                  onClick={() => studioPreference?.openStudioPreference()}
                  className="hidden min-h-10 max-w-48 items-center gap-2 truncate rounded-dd-md border border-dd-line bg-white px-3 py-2 text-xs font-semibold text-dd-ink xl:flex"
                >
                  <MapPin className="size-4 shrink-0 text-dd-forest" aria-hidden="true" />
                  Studio: {session.preferredBranch.name}
                </button>
              )}
              <Link
                href="/contact"
                aria-label="Bantuan customer"
                className="hidden size-10 place-items-center rounded-dd-md border border-dd-line bg-white text-dd-muted no-underline sm:grid"
              >
                <CircleHelp className="size-[18px]" />
              </Link>
              <NotificationCenter
                compact
                open={notificationOpen}
                onOpenChange={(open) => {
                  setNotificationOpen(open);
                  if (open) {
                    setProfileOpen(false);
                    setCommandOpen(false);
                  }
                }}
              />
              <span className="hidden max-w-40 truncate text-sm font-semibold text-dd-ink xl:block">
                {session?.displayName}
              </span>
              <div className="relative" ref={profileRoot}>
                <IconButton
                  ref={profileTrigger}
                  label={`Menu profil ${session?.displayName ?? 'customer'}`}
                  variant="secondary"
                  aria-expanded={profileOpen}
                  aria-controls="customer-profile-menu"
                  onClick={() => {
                    setNotificationOpen(false);
                    setCommandOpen(false);
                    setProfileOpen((open) => !open);
                  }}
                  className="rounded-dd-md border-dd-line bg-white text-dd-ink shadow-none"
                >
                  <span className="grid size-8 place-items-center rounded-dd-md bg-dd-sidebar text-white">
                    <UserRound className="size-4" />
                  </span>
                </IconButton>
                {profileOpen && (
                  <div
                    id="customer-profile-menu"
                    role="region"
                    aria-label="Menu akun customer"
                    className="absolute right-0 z-[90] mt-2 w-[min(16rem,calc(100vw-2rem))] rounded-dd-lg border border-dd-line bg-white p-2 shadow-dd-float"
                  >
                    <div className="mb-2 border-b border-dd-line px-3 py-3">
                      <strong className="block truncate text-sm">
                        {session?.displayName ?? 'Akun customer'}
                      </strong>
                      <span className="mt-1 block text-xs text-dd-muted">
                        Customer · {session?.preferredBranch?.name ?? 'Studio belum dipilih'}
                      </span>
                    </div>
                    {CUSTOMER_ACCOUNT_NAVIGATION.map((item) => {
                      const Icon = item.icon;
                      const locked = Boolean(item.requiresApproval && !approved);
                      return (
                        <Link
                          key={item.href}
                          href={
                            locked
                              ? `/account/verification?returnTo=${encodeURIComponent(item.href)}`
                              : item.href
                          }
                          onClick={() => setProfileOpen(false)}
                          aria-label={locked ? `${item.label}, memerlukan verifikasi` : item.label}
                          className="flex min-h-10 items-center gap-2 rounded-dd-md px-3 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                        >
                          <Icon className="size-4" aria-hidden="true" />
                          <span className="flex-1">{item.label}</span>
                          {locked && (
                            <LockKeyhole className="size-3.5 text-dd-muted" aria-hidden="true" />
                          )}
                        </Link>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        studioPreference?.openStudioPreference();
                      }}
                      className="flex min-h-10 w-full items-center gap-2 rounded-dd-md border-0 bg-transparent px-3 text-left text-sm font-semibold text-dd-ink hover:bg-dd-surface-muted"
                    >
                      <MapPin className="size-4" aria-hidden="true" />
                      Ganti studio
                    </button>
                    <div className="mt-1 border-t border-dd-line pt-1">
                      <Link
                        href="/"
                        onClick={() => setProfileOpen(false)}
                        className="flex min-h-10 items-center gap-2 rounded-dd-md px-3 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                      >
                        <House className="size-4" aria-hidden="true" />
                        Kunjungi situs utama
                      </Link>
                    </div>
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
          {session?.preferredBranch && (
            <button
              type="button"
              onClick={() => studioPreference?.openStudioPreference()}
              className="flex min-h-9 w-full items-center gap-1.5 rounded-none border-x-0 border-b-0 border-t border-dd-line bg-transparent px-4 py-2 text-left text-xs text-dd-muted sm:px-6 xl:hidden"
            >
              <MapPin className="size-3.5 shrink-0 text-dd-forest" aria-hidden="true" />
              Studio aktif:{' '}
              <strong className="truncate text-dd-ink">{session.preferredBranch.name}</strong>
              <span className="ml-auto font-semibold text-dd-forest">Ganti</span>
            </button>
          )}
        </header>
        <div
          className={
            customerCatalog
              ? 'min-w-0'
              : 'mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8'
          }
          id="main-content"
          aria-hidden={mobileOverlay.rendered || undefined}
          inert={mobileOverlay.rendered || undefined}
        >
          {children}
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
        mobileRendered={mobileOverlay.rendered}
        mobilePhase={mobileOverlay.phase}
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        onCollapse={() => setCollapsed((value) => !value)}
      />
      <div
        className="min-w-0 flex-1"
        aria-hidden={mobileOverlay.rendered || undefined}
        inert={mobileOverlay.rendered || undefined}
      >
        <header className="sticky top-0 z-30 border-b border-dd-line/80 bg-dd-surface/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
          <div className="grid min-h-[72px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 xl:px-8">
            <IconButton
              label="Buka navigasi"
              variant="secondary"
              onClick={() => {
                setProfileOpen(false);
                setNotificationOpen(false);
                setCommandOpen(false);
                setMobileOpen(true);
              }}
              className="rounded-dd-md border-dd-line bg-white text-dd-ink shadow-none lg:hidden"
            >
              <Menu className="size-5" />
            </IconButton>
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
                onClick={() => {
                  setProfileOpen(false);
                  setNotificationOpen(false);
                  setCommandOpen(true);
                }}
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
              <IconButton
                label="Cari atau jalankan perintah"
                variant="secondary"
                onClick={() => {
                  setProfileOpen(false);
                  setNotificationOpen(false);
                  setCommandOpen(true);
                }}
                className="rounded-dd-md border-dd-line bg-white text-dd-muted shadow-none xl:hidden"
              >
                <Search className="size-[18px]" />
              </IconButton>
              {session && (
                <div className="!hidden max-w-[220px] md:!block">
                  <SearchSelect
                    label="Cabang aktif"
                    compact
                    wrapperClassName="w-[clamp(160px,18vw,220px)] [&>label]:sr-only"
                    value={context?.activeBranchId ?? ''}
                    placeholder={aggregateBranchLabel ?? 'Pilih cabang'}
                    clearable={false}
                    options={branchOptions}
                    onChange={(branchId) =>
                      context?.setActiveBranchId(branchId === '__ALL_BRANCHES__' ? '' : branchId)
                    }
                  />
                </div>
              )}
              <Link
                href="/health"
                aria-label="Bantuan dan status"
                className="hidden size-10 shrink-0 place-items-center rounded-dd-md border border-dd-line bg-white text-dd-muted no-underline 2xl:grid"
              >
                <CircleHelp className="size-[18px]" />
              </Link>
              <NotificationCenter
                open={notificationOpen}
                onOpenChange={(open) => {
                  setNotificationOpen(open);
                  if (open) {
                    setProfileOpen(false);
                    setCommandOpen(false);
                  }
                }}
              />
              <span className="hidden max-w-40 truncate text-sm font-semibold text-dd-ink xl:block">
                {session?.displayName}
              </span>
              <div className="relative" ref={profileRoot}>
                <IconButton
                  ref={profileTrigger}
                  label={`Menu profil ${session?.displayName ?? 'internal'}`}
                  variant="secondary"
                  aria-expanded={profileOpen}
                  aria-controls="workspace-profile-menu"
                  onClick={() => {
                    setNotificationOpen(false);
                    setCommandOpen(false);
                    setProfileOpen((open) => !open);
                  }}
                  className="rounded-dd-md border-dd-line bg-white text-dd-ink shadow-none"
                >
                  <span className="grid size-8 place-items-center rounded-dd-md bg-dd-sidebar text-white">
                    <UserRound className="size-4" />
                  </span>
                </IconButton>
                {profileOpen && (
                  <div
                    id="workspace-profile-menu"
                    role="region"
                    aria-label="Menu akun internal"
                    className="absolute right-0 z-[90] mt-2 w-[min(16rem,calc(100vw-2rem))] rounded-dd-lg border border-dd-line bg-white p-2 shadow-dd-float"
                  >
                    <div className="border-b border-dd-line px-3 py-3">
                      <strong className="block truncate text-sm">
                        {session?.displayName ?? 'Akun internal'}
                      </strong>
                      <span className="mt-1 block text-xs text-dd-muted">
                        {session?.roles.map((role) => roleLabels[role] ?? role).join(' · ')}
                      </span>
                      <span className="mt-2 inline-flex rounded-full bg-dd-surface-muted px-2.5 py-1 text-[11px] font-semibold text-dd-forest">
                        {context?.activeBranch
                          ? `Operasional cabang · ${context.activeBranch.name}`
                          : canViewAllBranches
                            ? 'Baca global · Semua cabang'
                            : `Scope assignment · ${session?.branches.length ?? 0} cabang`}
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
              <SearchSelect
                label="Cabang aktif mobile"
                compact
                wrapperClassName="[&>label]:sr-only"
                value={context?.activeBranchId ?? ''}
                placeholder={aggregateBranchLabel ?? 'Pilih cabang aktif'}
                clearable={false}
                options={branchOptions.map((option) => ({
                  ...option,
                  description:
                    option.id === '__ALL_BRANCHES__'
                      ? option.description
                      : session.branches.find((branch) => branch.id === option.id)?.code,
                }))}
                onChange={(branchId) =>
                  context?.setActiveBranchId(branchId === '__ALL_BRANCHES__' ? '' : branchId)
                }
              />
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
      <Modal
        open={commandOpen}
        title="Pencarian panel"
        description="Buka halaman yang tersedia sesuai capability akun Anda."
        className="max-w-2xl"
        bodyClassName="p-0 sm:p-0"
        onClose={() => setCommandOpen(false)}
      >
        <label className="flex items-center gap-3 border-b border-dd-line px-4">
          <Search className="size-5 text-dd-muted" aria-hidden="true" />
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
      </Modal>
    </div>
  );
}
