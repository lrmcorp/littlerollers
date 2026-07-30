'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  Database,
  HeartPulse,
  LayoutDashboard,
  Landmark,
  ListChecks,
  PackageIcon,
  ScrollText,
  ShieldCheck,
  TicketPercent,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { frontendPageGroups, frontendPages } from './frontend-pages';
import { useSessionContext } from './session-context';
import { BrandMark } from './components/public/brand-mark';
import { browserDashboardClient } from './dashboard-client';
import { useOverlayInteraction } from './components/app-feedback';

const pageIcons: Record<string, LucideIcon> = {
  '/workspace': LayoutDashboard,
  '/workspace/bookings': BookOpenCheck,
  '/check-in-scanner': ClipboardCheck,
  '/workspace/classes': CalendarDays,
  '/workspace/payments': CreditCard,
  '/finance': Landmark,
  '/ledger': CircleDollarSign,
  '/users': Users,
  '/users/roles-permissions': ShieldCheck,
  '/identity-verifications': ShieldCheck,
  '/audit': ScrollText,
  '/assignments': ClipboardCheck,
  '/master': Database,
  '/workspace/branches': Building2,
  '/workspace/packages': PackageIcon,
  '/workspace/vouchers': TicketPercent,
  '/operations': Activity,
  '/health': HeartPulse,
};

export function AppNavigation({
  mobileOpen = false,
  collapsed = false,
  onClose,
  onCollapse,
}: {
  mobileOpen?: boolean;
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
  const customerOnly =
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER');
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
  const navClass = `fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-white/10 bg-dd-sidebar text-white shadow-dd-float transition-transform duration-[220ms] ease-out motion-reduce:transform-none motion-reduce:duration-75 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${!customerOnly && collapsed ? 'lg:w-[84px]' : 'lg:w-[264px]'}`;

  useOverlayInteraction({
    open: mobileOpen,
    onClose: () => onClose?.(),
    panelRef: navigationRef,
  });

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
      {mobileOpen && (
        <button
          aria-label="Tutup navigasi"
          className="fixed inset-0 z-40 min-h-0 w-full rounded-none border-0 bg-dd-sidebar/55 p-0 lg:hidden"
          onClick={onClose}
        />
      )}
      <nav
        ref={navigationRef}
        id={customerOnly ? 'customer-navigation' : 'workspace-navigation'}
        className={navClass}
        aria-label="Navigasi utama"
      >
        <div
          className={`flex min-h-24 items-center border-b border-white/10 px-5 ${collapsed ? 'lg:justify-center lg:px-2' : 'justify-between'}`}
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
            <button
              type="button"
              aria-label="Tutup navigasi"
              onClick={onClose}
              className="grid size-9 min-h-0 place-items-center rounded-full border border-white/15 bg-transparent p-0 text-white lg:hidden"
            >
              <X className="size-4" />
            </button>
          }
        </div>
        <div className="nav-scroll flex-1 space-y-6 overflow-y-auto px-3 py-5">
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
            frontendPageGroups.map((group) => (
              <section className="space-y-1" aria-labelledby={`nav-${group}`} key={group}>
                {!collapsed && (
                  <h2
                    id={`nav-${group}`}
                    className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/44"
                  >
                    {group}
                  </h2>
                )}
                {frontendPages
                  .filter((item) => item.group === group)
                  .filter(
                    (item) =>
                      item.capabilities.length === 0 ||
                      context?.hasCapability(...item.capabilities),
                  )
                  .map((item) => {
                    const active = item.href === activeHref;
                    const Icon = pageIcons[item.href] ?? ListChecks;
                    return (
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        key={item.href}
                        title={collapsed ? item.shortLabel : undefined}
                        onClick={onClose}
                        className={linkClass(active)}
                      >
                        <Icon className="size-[18px] shrink-0" aria-hidden="true" />
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
            ))
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
