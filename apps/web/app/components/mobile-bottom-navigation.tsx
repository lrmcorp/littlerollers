'use client';

import {
  BookOpenCheck,
  CalendarDays,
  CreditCard,
  Gauge,
  House,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Menu,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCustomerBadges } from './customer/use-customer-badges';
import { isCustomerNavigationActive } from './customer/customer-navigation';

export interface MobileBottomNavigationProps {
  customerOnly: boolean;
  approved?: boolean;
  onOpenMenu?(): void;
  queueCounts?: Record<string, number>;
}

export function MobileBottomNavigation({
  customerOnly,
  approved = true,
  onOpenMenu,
  queueCounts = {},
}: MobileBottomNavigationProps) {
  const pathname = usePathname();
  const customerBadges = useCustomerBadges();

  if (customerOnly) {
    const tabs = [
      { href: '/account', label: 'Beranda', icon: House },
      { href: '/classes', label: 'Jadwal', icon: CalendarDays },
      { href: '/packages', label: 'Paket', icon: ListChecks },
      {
        href: '/bookings',
        label: 'Booking',
        icon: BookOpenCheck,
        badge: customerBadges.upcomingBookingsCount,
        badgeColor: 'bg-dd-forest',
        requiresApproval: true,
      },
      {
        href: '/orders',
        label: 'Pesanan',
        icon: CreditCard,
        badge: customerBadges.actionableOrdersCount,
        badgeColor: 'bg-dd-brass',
        requiresApproval: true,
      },
    ];

    return (
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-dd-line/80 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1.5 px-2"
      >
        <div className="grid grid-cols-5 items-center justify-around gap-1 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const active = isCustomerNavigationActive(pathname, tab.href);
            const locked = Boolean(tab.requiresApproval && !approved);
            const href = locked
              ? `/account/verification?returnTo=${encodeURIComponent(tab.href)}`
              : tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-dd-md text-[11px] font-semibold transition-all select-none ${
                  active
                    ? 'text-dd-forest font-bold bg-dd-forest/8'
                    : 'text-dd-muted hover:text-dd-forest hover:bg-dd-surface-muted/60'
                }`}
              >
                <div className="relative shrink-0 mb-0.5">
                  <Icon
                    className={`size-5 transition-transform ${active ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`}
                    aria-hidden="true"
                  />
                  {tab.badge && tab.badge > 0 ? (
                    <span
                      className={`absolute -top-1.5 -right-2 grid min-h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold text-white leading-none shadow-xs ${tab.badgeColor}`}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  ) : null}
                  {locked && (
                    <LockKeyhole
                      className="absolute -bottom-1 -right-1 size-3 text-dd-muted"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className="truncate max-w-[64px] tracking-tight">{tab.label}</span>
                {active && (
                  <span className="w-4 h-0.5 mt-0.5 rounded-full bg-dd-forest" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // Workspace / Staff Mobile Navigation
  const staffTabs = [
    { href: '/workspace', label: 'Beranda', icon: LayoutDashboard },
    {
      href: '/workspace/bookings',
      label: 'Booking',
      icon: BookOpenCheck,
      badge: queueCounts['reschedules'] ?? 0,
      badgeColor: 'bg-dd-forest',
    },
    {
      href: '/workspace/payments',
      label: 'Pembayaran',
      icon: CreditCard,
      badge: queueCounts['payments'] ?? 0,
      badgeColor: 'bg-dd-brass',
    },
    { href: '/workspace/classes', label: 'Kelas', icon: CalendarDays },
  ];

  const hasAnyOtherQueue =
    (queueCounts['verifications'] ?? 0) > 0 ||
    (queueCounts['adjustments'] ?? 0) > 0 ||
    (queueCounts['jobs'] ?? 0) > 0;

  return (
    <nav
      aria-label="Navigasi Bawah Workspace"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-dd-line/80 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1.5 px-2"
    >
      <div className="grid grid-cols-5 items-center justify-around gap-1 max-w-lg mx-auto">
        {staffTabs.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href !== '/workspace' && pathname.startsWith(`${tab.href}/`));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-dd-md text-[11px] font-semibold transition-all select-none ${
                active
                  ? 'text-dd-forest font-bold bg-dd-forest/8'
                  : 'text-dd-muted hover:text-dd-forest hover:bg-dd-surface-muted/60'
              }`}
            >
              <div className="relative shrink-0 mb-0.5">
                <Icon
                  className={`size-5 transition-transform ${active ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`}
                  aria-hidden="true"
                />
                {tab.badge && tab.badge > 0 ? (
                  <span
                    className={`absolute -top-1.5 -right-2.5 grid min-h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold text-white leading-none shadow-xs ${tab.badgeColor}`}
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="truncate max-w-[64px] tracking-tight">{tab.label}</span>
              {active && (
                <span className="w-4 h-0.5 mt-0.5 rounded-full bg-dd-forest" aria-hidden="true" />
              )}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Buka semua menu navigasi"
          className="flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-dd-md text-[11px] font-semibold text-dd-muted hover:text-dd-forest hover:bg-dd-surface-muted/60 transition-all select-none"
        >
          <div className="relative shrink-0 mb-0.5">
            <Menu className="size-5 stroke-[1.8]" aria-hidden="true" />
            {hasAnyOtherQueue && (
              <span
                className="absolute -top-1 -right-1 size-2 rounded-full bg-dd-brass ring-2 ring-white"
                aria-label="Ada antrean baru di menu lain"
              />
            )}
          </div>
          <span className="truncate max-w-[64px] tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
