'use client';

import {
  BookOpenCheck,
  CalendarDays,
  CreditCard,
  Gauge,
  House,
  ListChecks,
  LockKeyhole,
  LogOut,
  MapPin,
  PackageCheck,
  ShieldCheck,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { IconButton } from '../actions';
import { useOverlayInteraction, type OverlayPhase } from '../app-feedback';
import { BrandMark } from '../public/brand-mark';
import { useStudioPreference } from '../public/public-experience';

export type CustomerNavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  requiresApproval?: boolean;
};

export const CUSTOMER_PRIMARY_NAVIGATION: CustomerNavigationItem[] = [
  { href: '/account', label: 'Home', icon: Gauge },
  { href: '/classes', label: 'Timetable', icon: CalendarDays },
  { href: '/packages', label: 'Packages', icon: ListChecks },
  { href: '/bookings', label: 'Bookings', icon: BookOpenCheck, requiresApproval: true },
  { href: '/orders', label: 'Orders', icon: CreditCard, requiresApproval: true },
];

export const CUSTOMER_ACCOUNT_NAVIGATION: CustomerNavigationItem[] = [
  {
    href: '/account/packages',
    label: 'My packages',
    icon: PackageCheck,
    requiresApproval: true,
  },
  { href: '/account/verification', label: 'Verification', icon: ShieldCheck },
  { href: '/account/profile', label: 'Profile', icon: UserRound },
  { href: '/account/security', label: 'Security', icon: LockKeyhole },
];

export function isCustomerNavigationActive(pathname: string, href: string) {
  if (href === '/account') return pathname === '/account';
  if (href === '/orders') return pathname === '/checkout' || pathname.startsWith('/orders');
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navigationHref(item: CustomerNavigationItem, approved: boolean) {
  return item.requiresApproval && !approved
    ? `/account/verification?returnTo=${encodeURIComponent(item.href)}`
    : item.href;
}

export function CustomerNavigation({
  open,
  rendered,
  phase,
  approved,
  onClose,
  onLogout,
}: {
  open: boolean;
  rendered: boolean;
  phase: OverlayPhase;
  approved: boolean;
  onClose(): void;
  onLogout(): void | Promise<void>;
}) {
  const pathname = usePathname();
  const studioPreference = useStudioPreference();
  const panel = useRef<HTMLElement>(null);
  useOverlayInteraction({ open, onClose, panelRef: panel });
  const visible = phase === 'open';

  return (
    <>
      {rendered && (
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-40 bg-dd-sidebar/55 transition-opacity duration-[160ms] ease-out motion-reduce:duration-75 lg:hidden ${visible ? 'opacity-100' : 'opacity-0'}`}
          onMouseDown={onClose}
        />
      )}
      <nav
        ref={panel}
        id="customer-navigation"
        aria-label="Account menu"
        aria-hidden={!rendered}
        aria-modal={rendered ? 'true' : undefined}
        inert={!rendered}
        role={rendered ? 'dialog' : undefined}
        data-overlay-phase={rendered ? phase : undefined}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(320px,88vw)] flex-col bg-dd-sidebar pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-5 pt-[max(1.25rem,env(safe-area-inset-top))] text-white shadow-dd-float transition-transform duration-[220ms] ease-out motion-reduce:transform-none motion-reduce:duration-75 lg:hidden ${
          visible ? 'translate-x-0 visible' : '-translate-x-full'
        } ${rendered ? 'pointer-events-auto' : 'invisible pointer-events-none'}`}
      >
        <div className="mb-7 flex items-center justify-between">
          <BrandMark tone="light" href="/" ariaLabel="Little Rollers, back to the main site" />
          <IconButton
            label="Close account menu"
            variant="ghost"
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </IconButton>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
          {[
            ['Club', CUSTOMER_PRIMARY_NAVIGATION],
            ['Account', CUSTOMER_ACCOUNT_NAVIGATION],
          ].map(([group, items]) => (
            <div key={group as string}>
              <p className="mb-2 px-3 font-display text-sm text-lr-sun">
                {group as string}
              </p>
              <div className="space-y-1">
                {(items as CustomerNavigationItem[]).map((item) => {
                  const Icon = item.icon;
                  const selected = isCustomerNavigationActive(pathname, item.href);
                  const locked = Boolean(item.requiresApproval && !approved);
                  return (
                    <Link
                      key={item.href}
                      href={navigationHref(item, approved)}
                      aria-current={open && selected ? 'page' : undefined}
                      aria-label={locked ? `${item.label}, needs verification` : item.label}
                      onClick={onClose}
                      className={`flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium no-underline ${
                        selected
                          ? 'bg-lr-sun text-dd-forest'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1">{item.label}</span>
                      {locked && (
                        <LockKeyhole
                          className={selected ? 'size-3.5 text-dd-forest' : 'size-3.5 text-white/60'}
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {!approved && (
          <div className="mt-5 rounded-[15px] border border-white/15 bg-white/5 p-3 text-xs leading-5 text-white/80">
            Finish verification to book sessions and buy packages.
          </div>
        )}
        <div className="mt-5 grid gap-1 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              studioPreference?.openStudioPreference();
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-full border-0 bg-transparent px-4 text-left text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
          >
            <MapPin className="size-[18px] shrink-0" aria-hidden="true" />
            Change club
          </button>
          <Link
            href="/"
            onClick={onClose}
            className="flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium text-white/80 no-underline hover:bg-white/10 hover:text-white"
          >
            <House className="size-[18px] shrink-0" aria-hidden="true" />
            Main site
          </Link>
          <button
            type="button"
            onClick={() => {
              onClose();
              void onLogout();
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-full border-0 bg-transparent px-4 text-left text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-[18px] shrink-0" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </nav>
    </>
  );
}
