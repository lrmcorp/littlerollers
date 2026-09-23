'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  Bell,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  Database,
  FileSpreadsheet,
  Globe,
  HeartPulse,
  LayoutDashboard,
  Landmark,
  LifeBuoy,
  ListChecks,
  PackageIcon,
  ScrollText,
  ShieldCheck,
  Sliders,
  TicketPercent,
  UserCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { frontendPageGroups, frontendPages } from '@/lib/frontend-pages';
import { isCustomerOnlySession } from '@/lib/session-audience';
import { useSessionContext } from './session-context';
import { BrandMark } from './components/public/brand-mark';
import { browserDashboardClient } from '@/api-clients/dashboard-client';
import { useOverlayInteraction, type OverlayPhase } from './components/app-feedback';
import { IconButton } from './components/actions';

const pageIcons: Record<string, LucideIcon> = {
  '/workspace': LayoutDashboard,
  '/workspace/classes': CalendarDays,
  '/workspace/bookings': BookOpenCheck,
  '/check-in-scanner': ClipboardCheck,
  '/support-cases': LifeBuoy,
  '/customers': Users,
  '/ledger': CircleDollarSign,
  '/identity-verifications': ShieldCheck,
  '/ledger/adjustments': ListChecks,
  '/workspace/payments': CreditCard,
  '/workspace/packages': PackageIcon,
  '/workspace/vouchers': TicketPercent,
  '/finance': Landmark,
  '/workspace/branches': Building2,
  '/instructors': UserCheck,
  '/users': Users,
  '/users/roles-permissions': ShieldCheck,
  '/assignments': ClipboardCheck,
  '/master': Database,
  '/data-import': FileSpreadsheet,
  '/migrations': Database,
  '/audit': ScrollText,
  '/notification-management': Bell,
  '/public-content-management': Globe,
  '/operations': Activity,
  '/health': HeartPulse,
};

export function AppNavigation({
  mobileOpen = false,
  mobileRendered = false,
  mobilePhase = 'exiting',
  collapsed = false,
  onClose,
  onCollapse,
}: {
  mobileOpen?: boolean;
  mobileRendered?: boolean;
  mobilePhase?: OverlayPhase;
  collapsed?: boolean;
  onClose?(): void;
  onCollapse?(): void;
}) {
  const pathname = usePathname();
  const context = useSessionContext();
  const session = context?.session;
  const activeHref = [...frontendPages]
    .sort((left, right) => right.href.length - left.href.length)
    .find(
      (item) =>
        pathname === item.href ||
        (item.href !== '/workspace' && pathname.startsWith(`${item.href}/`)),
    )?.href;
  const [queueCounts, setQueueCounts] = useState<Record<string, number>>({});
  const [mobileViewport, setMobileViewport] = useState<boolean | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const advancedPages = frontendPages
    .filter((item) => item.isAdvanced && !item.isDormant)
    .filter(
      (item) =>
        item.capabilities.length === 0 ||
        context?.hasCapability(...item.capabilities),
    )
    .sort((a, b) => a.priority - b.priority);

  const isCurrentInAdvanced = advancedPages.some((item) => item.href === activeHref);
  const showAdvanced = advancedOpen || isCurrentInAdvanced;

  const customerOnly = isCustomerOnlySession(session);
  const customerLinks = [
    { href: '/classes', label: 'Jadwal', icon: CalendarDays },
    ...(session?.identityVerificationStatus === 'APPROVED'
      ? [{ href: '/bookings', label: 'Booking Saya', icon: BookOpenCheck }]
      : []),
    { href: '/packages', label: 'Paket', icon: ListChecks },
    ...(session?.identityVerificationStatus === 'APPROVED'
      ? [
          { href: '/orders', label: 'Pesanan', icon: CreditCard },
          { href: '/account/packages', label: 'Paket Saya', icon: CircleDollarSign },
        ]
      : []),
    { href: '/account/verification', label: 'Verifikasi', icon: ShieldCheck },
    { href: '/account/profile', label: 'Profil Saya', icon: Users },
    { href: '/account', label: 'Akun Saya', icon: Users },
  ];
  const navigationRef = useRef<HTMLElement>(null);
  const mobileVisible = mobilePhase === 'open';
  const mobileClosed = mobileViewport === true && !mobileRendered;
  const navClass = `fixed inset-y-0 left-0 z-50 flex w-[min(320px,88vw)] flex-col border-r border-white/10 bg-dd-sidebar text-white shadow-dd-float transition-transform duration-[220ms] ease-out motion-reduce:transform-none motion-reduce:duration-75 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 lg:visible lg:pointer-events-auto ${mobileVisible ? 'translate-x-0 visible' : '-translate-x-full'} ${mobileRendered ? 'pointer-events-auto' : 'invisible pointer-events-none'} ${!customerOnly && collapsed ? 'lg:w-[84px]' : 'lg:w-[264px]'}`;

  useOverlayInteraction({
    open: mobileOpen,
    onClose: () => onClose?.(),
    panelRef: navigationRef,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setMobileViewport(false);
      return;
    }
    const query = window.matchMedia('(max-width: 1023px)');
    const update = () => setMobileViewport(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!session || customerOnly) return;
    let active = true;
    browserDashboardClient
      .overview({ branchId: context?.activeBranchId || undefined })
      .then((overview) => {
        if (active)
          setQueueCounts(Object.fromEntries(overview.queues.map((item) => [item.key, item.count])));
      })
      .catch(() => {
        if (active) setQueueCounts({});
      });
    return () => {
      active = false;
    };
  }, [context?.activeBranchId, customerOnly, session]);

  const linkClass = (active: boolean) =>
    `group flex min-h-10 items-center gap-3 rounded-dd-md px-3 py-2 text-sm font-semibold transition ${active ? 'bg-white text-dd-sidebar shadow-sm' : 'text-white/72 hover:bg-white/8 hover:text-white'}`;

  return (
    <>
      {mobileRendered && (
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-40 bg-dd-sidebar/55 transition-opacity duration-[160ms] ease-out motion-reduce:duration-75 lg:hidden ${mobileVisible ? 'opacity-100' : 'opacity-0'}`}
          onMouseDown={() => onClose?.()}
        />
      )}
      <nav
        ref={navigationRef}
        id={customerOnly ? 'customer-navigation' : 'workspace-navigation'}
        className={navClass}
        aria-label="Navigasi utama"
        aria-hidden={mobileClosed || undefined}
        aria-modal={mobileViewport === true && mobileRendered ? 'true' : undefined}
        role={mobileViewport === true && mobileRendered ? 'dialog' : undefined}
        inert={mobileClosed || undefined}
        data-overlay-phase={mobileRendered ? mobilePhase : undefined}
      >
        <div
          className={`flex min-h-24 items-center border-b border-white/10 pl-[max(1.25rem,env(safe-area-inset-left))] pr-5 pt-[env(safe-area-inset-top)] ${collapsed ? 'lg:justify-center lg:px-2 lg:pt-0' : 'justify-between'}`}
        >
          <div className={collapsed ? 'lg:w-10 lg:overflow-hidden' : ''}>
            <BrandMark
              ariaLabel={`Daily Dose Pilates — ${customerOnly ? 'Dashboard Saya' : 'Dashboard'}`}
              className="h-auto w-[166px] brightness-0 invert"
              href={customerOnly ? '/account' : '/workspace'}
              priority
            />
            {!collapsed && !customerOnly && (
              <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.24em] text-white/48">
                Studio operations
              </span>
            )}
          </div>
          {
            <IconButton
              label="Tutup navigasi"
              variant="ghost"
              onClick={onClose}
              className="rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="size-4" />
            </IconButton>
          }
        </div>
        <div className="workspace-navigation-scroll min-h-0 flex-1 space-y-6 overflow-x-hidden overflow-y-auto px-3 py-5">
          {customerOnly ? (
            <section className="space-y-1" aria-labelledby="nav-customer">
              <h2
                id="nav-customer"
                className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/44"
              >
                Akun Saya
              </h2>
              {customerLinks.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== '/account' && pathname.startsWith(`${item.href}/`));
                const Icon = item.icon;
                return (
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    key={item.href}
                    onClick={onClose}
                    className={linkClass(active)}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </section>
          ) : (
            <>
              {frontendPageGroups.map((group) => {
                const pagesInGroup = frontendPages
                  .filter((item) => item.group === group)
                  .filter((item) => !item.isDormant && !item.isAdvanced)
                  .filter(
                    (item) =>
                      item.capabilities.length === 0 ||
                      context?.hasCapability(...item.capabilities),
                  )
                  .sort((a, b) => a.priority - b.priority);

                if (pagesInGroup.length === 0) return null;

                return (
                  <section className="space-y-1 pt-2 first:pt-0" aria-labelledby={`nav-${group}`} key={group}>
                    {!collapsed && (
                      <h2
                        id={`nav-${group}`}
                        className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/44"
                      >
                        {group}
                      </h2>
                    )}
                    {pagesInGroup.map((item) => {
                      const active = item.href === activeHref;
                      const Icon = pageIcons[item.href] ?? ListChecks;
                      return (
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          key={item.href}
                          title={
                            collapsed
                              ? `${item.shortLabel}${item.queueBadgeSource && (queueCounts[item.queueBadgeSource] ?? 0) > 0 ? ` (${queueCounts[item.queueBadgeSource]})` : ''}`
                              : undefined
                          }
                          onClick={onClose}
                          className={linkClass(active)}
                        >
                          <div className="relative shrink-0">
                            <Icon className="size-[18px]" aria-hidden="true" />
                            {collapsed &&
                              item.queueBadgeSource &&
                              (queueCounts[item.queueBadgeSource] ?? 0) > 0 && (
                                <span
                                  aria-label={`${queueCounts[item.queueBadgeSource]} antrean`}
                                  className="absolute -top-1 -right-1 size-2.5 rounded-full bg-dd-brass ring-2 ring-dd-sidebar"
                                />
                              )}
                          </div>
                          {!collapsed && <span className="truncate">{item.shortLabel}</span>}
                          {!collapsed &&
                            item.queueBadgeSource &&
                            (queueCounts[item.queueBadgeSource] ?? 0) > 0 && (
                              <span className="ml-auto rounded-full bg-dd-brass px-2 py-0.5 text-[10px] font-bold text-dd-sidebar">
                                {queueCounts[item.queueBadgeSource]}
                              </span>
                            )}
                        </Link>
                      );
                    })}
                  </section>
                );
              })}

              {advancedPages.length > 0 && (
                <section className="pt-3 border-t border-white/10 space-y-1" aria-label="Alat dan sistem lanjutan">
                  {!collapsed ? (
                    <button
                      type="button"
                      onClick={() => setAdvancedOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/44 hover:text-white/80 transition"
                      aria-expanded={showAdvanced}
                    >
                      <span className="flex items-center gap-2">
                        <Sliders className="size-3.5" />
                        <span>Alat & Sistem Lanjutan</span>
                      </span>
                      <ChevronDown
                        className={`size-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
                      />
                    </button>
                  ) : (
                    <div className="my-1 border-t border-white/10" />
                  )}

                  {(collapsed || showAdvanced) && (
                    <div className="space-y-1">
                      {advancedPages.map((item) => {
                        const active = item.href === activeHref;
                        const Icon = pageIcons[item.href] ?? ListChecks;
                        return (
                          <Link
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            key={item.href}
                            title={
                              collapsed
                                ? `${item.shortLabel}${item.queueBadgeSource && (queueCounts[item.queueBadgeSource] ?? 0) > 0 ? ` (${queueCounts[item.queueBadgeSource]})` : ''}`
                                : undefined
                            }
                            onClick={onClose}
                            className={linkClass(active)}
                          >
                            <div className="relative shrink-0">
                              <Icon className="size-[18px]" aria-hidden="true" />
                              {collapsed &&
                                item.queueBadgeSource &&
                                (queueCounts[item.queueBadgeSource] ?? 0) > 0 && (
                                  <span
                                    aria-label={`${queueCounts[item.queueBadgeSource]} antrean`}
                                    className="absolute -top-1 -right-1 size-2.5 rounded-full bg-dd-brass ring-2 ring-dd-sidebar"
                                  />
                                )}
                            </div>
                            {!collapsed && <span className="truncate">{item.shortLabel}</span>}
                            {!collapsed &&
                              item.queueBadgeSource &&
                              (queueCounts[item.queueBadgeSource] ?? 0) > 0 && (
                                <span className="ml-auto rounded-full bg-dd-brass px-2 py-0.5 text-[10px] font-bold text-dd-sidebar">
                                  {queueCounts[item.queueBadgeSource]}
                                </span>
                              )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
        {!customerOnly && (
          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              onClick={onCollapse}
              className="hidden min-h-10 w-full items-center gap-3 rounded-dd-md border-0 bg-white/6 px-3 text-sm text-white/72 hover:bg-white/10 lg:flex"
            >
              <ChevronLeft className={`size-4 transition ${collapsed ? 'rotate-180' : ''}`} />
              {!collapsed && 'Ciutkan sidebar'}
            </button>
            {!collapsed && (
              <p className="mt-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/38">
                Akses berbasis permission
              </p>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
