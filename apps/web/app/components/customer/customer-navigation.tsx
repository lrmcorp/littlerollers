'use client';

import {
  BookOpenCheck,
  CalendarDays,
  CreditCard,
  Gauge,
  ListChecks,
  LockKeyhole,
  PackageCheck,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { BrandMark } from '../public/brand-mark';

const links = [
  { href: '/account', label: 'Dashboard', icon: Gauge },
  { href: '/classes', label: 'Jadwal', icon: CalendarDays },
  { href: '/packages', label: 'Paket', icon: ListChecks },
  { href: '/bookings', label: 'Booking', icon: BookOpenCheck, approved: true },
  { href: '/orders', label: 'Pesanan', icon: CreditCard, approved: true },
  { href: '/account/packages', label: 'Paket Saya', icon: PackageCheck, approved: true },
  { href: '/account/verification', label: 'Verifikasi', icon: ShieldCheck },
  { href: '/account/profile', label: 'Profil', icon: UserRound },
  { href: '/account/settings', label: 'Pengaturan', icon: Settings },
  { href: '/account/security', label: 'Keamanan', icon: LockKeyhole },
] as const;

export function CustomerNavigation({
  open,
  approved,
  onClose,
}: {
  open: boolean;
  approved: boolean;
  onClose(): void;
}) {
  const pathname = usePathname();
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('a,button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const items = panel.current?.querySelectorAll<HTMLElement>('a,button:not([disabled])');
      if (!items?.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = before;
      window.removeEventListener('keydown', keydown);
    };
  }, [onClose, open]);
  const active = (href: string) =>
    pathname === href || (href !== '/account' && pathname.startsWith(`${href}/`));
  const visible = links.filter((link) => !('approved' in link) || !link.approved || approved);
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Tutup navigasi akun"
          className="fixed inset-0 z-40 min-h-0 w-full rounded-none border-0 bg-dd-sidebar/55 p-0 lg:hidden"
          onClick={onClose}
        />
      )}
      <nav
        ref={panel}
        id="customer-navigation"
        aria-label="Navigasi akun"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(320px,88vw)] flex-col bg-dd-sidebar p-5 text-white shadow-dd-float transition-transform lg:static lg:w-auto lg:translate-x-0 lg:flex-row lg:items-center lg:overflow-x-auto lg:border-t lg:border-dd-line lg:bg-white lg:px-6 lg:py-2 lg:text-dd-ink lg:shadow-none ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <BrandMark className="w-40 brightness-0 invert" href="/account" />
          <button
            type="button"
            aria-label="Tutup navigasi akun"
            onClick={onClose}
            className="grid size-10 place-items-center border-white/20 bg-transparent text-white"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto lg:flex-row lg:gap-1 lg:overflow-visible">
          {visible.map((item) => {
            const Icon = item.icon;
            const selected = active(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={selected ? 'page' : undefined}
                onClick={onClose}
                className={`flex min-h-10 shrink-0 items-center gap-2 rounded-dd-sm px-3 text-sm font-semibold no-underline ${selected ? 'bg-white text-dd-sidebar lg:bg-dd-sidebar lg:text-white' : 'text-white/75 hover:bg-white/10 hover:text-white lg:text-dd-muted lg:hover:bg-dd-surface-muted lg:hover:text-dd-ink'}`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
