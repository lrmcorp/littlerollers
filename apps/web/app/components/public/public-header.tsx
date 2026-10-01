'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Menu, UserRound, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { BrandMark } from './brand-mark';
import { publicNavigation, routes } from '@/lib/routes';
import { isCustomerOnlySession } from '@/lib/session-audience';
import { useSessionContext } from '../../session-context';
import { useStudioPreference } from './public-experience';
import { useOverlayInteraction, useOverlayPresence } from '../app-feedback';
import { IconButton } from '../actions';

function isCurrent(pathname: string, hash: string, href: string) {
  if (href === '/classes#schedule')
    return (pathname === '/classes' && hash === '#schedule') || pathname.startsWith('/schedule/');
  if (href === '/classes')
    return (pathname === '/classes' && hash !== '#schedule') || pathname.startsWith('/classes/');
  const [target, targetHash = ''] = href.split('#');
  const route = target || '/';
  return (
    (pathname === route || (route !== '/' && pathname.startsWith(`${route}/`))) &&
    (!targetHash || hash === `#${targetHash}`)
  );
}

export function PublicHeader() {
  const pathname = usePathname() ?? '/';
  const sessionContext = useSessionContext();
  const session = sessionContext?.session;
  const customerOnly = isCustomerOnlySession(session);
  const studioPreference = useStudioPreference();
  const [open, setOpen] = useState(false);
  const drawer = useOverlayPresence(open, 'drawer');
  const [hash, setHash] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [pathname]);

  const close = () => setOpen(false);
  useOverlayInteraction({ open, onClose: close, panelRef: drawerRef });

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-dd-line/80 bg-dd-paper/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] w-full max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:min-h-[78px] lg:px-8">
          <BrandMark className="w-[142px] shrink-0 sm:w-40" priority />

          <nav
            className="ml-auto hidden items-center gap-[clamp(1rem,1.8vw,2rem)] lg:flex"
            aria-label="Navigasi publik"
          >
            {publicNavigation.map((item) => (
              <Link
                className={`relative inline-flex min-h-11 min-w-11 items-center justify-center whitespace-nowrap py-2 text-sm font-semibold no-underline transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:bg-dd-forest after:transition-transform ${
                  isCurrent(pathname, hash, item.href)
                    ? 'text-dd-forest after:scale-x-100'
                    : 'text-dd-ink after:scale-x-0 hover:text-dd-forest hover:after:scale-x-100'
                }`}
                key={`${item.href}-${item.label}`}
                href={item.href}
                aria-current={isCurrent(pathname, hash, item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-2">
            {!session ? (
              <Link
                className="grid size-11 place-items-center rounded-full border border-dd-line bg-white text-dd-forest no-underline transition hover:border-dd-forest sm:hidden"
                href={routes.signIn}
                aria-label="Masuk ke akun"
              >
                <UserRound className="size-5" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                className="grid size-11 place-items-center rounded-full border border-dd-line bg-white text-dd-forest no-underline transition hover:border-dd-forest sm:hidden"
                href={customerOnly ? routes.account : routes.workspace}
                aria-label={customerOnly ? 'Akun Saya' : 'Buka workspace'}
              >
                <UserRound className="size-5" aria-hidden="true" />
              </Link>
            )}
            {!session ? (
              <Link
                className="hidden min-h-11 items-center justify-center rounded-dd-sm px-3 text-sm font-bold text-dd-forest no-underline hover:bg-white sm:inline-flex"
                href={routes.signIn}
              >
                Masuk
              </Link>
            ) : (
              <details className="relative hidden sm:block">
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-dd-sm border border-dd-line bg-white px-3 text-sm font-bold text-dd-forest">
                  <UserRound className="size-4" /> {customerOnly ? 'Akun Saya' : 'Staf Panel'}
                </summary>
                <div className="absolute right-0 mt-2 grid w-56 gap-1 rounded-dd-lg border border-dd-line bg-white p-2 shadow-dd-float">
                  {customerOnly ? (
                    <>
                      <Link
                        href="/account"
                        className="flex min-h-10 items-center rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                      >
                        Dashboard Saya
                      </Link>
                      <Link
                        href="/bookings"
                        className="flex min-h-10 items-center rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                      >
                        Booking Saya
                      </Link>
                      <Link
                        href="/account/packages"
                        className="flex min-h-10 items-center rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                      >
                        Paket Saya
                      </Link>
                      <Link
                        href="/orders"
                        className="flex min-h-10 items-center rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                      >
                        Riwayat Pesanan
                      </Link>
                      <Link
                        href="/account/profile"
                        className="flex min-h-10 items-center rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                      >
                        Profil Saya
                      </Link>
                      <button
                        type="button"
                        onClick={() => studioPreference?.openStudioPreference()}
                        className="flex min-h-10 items-center rounded-dd-md border-0 bg-transparent px-3 text-left text-sm font-semibold text-dd-ink hover:bg-dd-surface-muted"
                      >
                        Ganti studio
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/workspace"
                        className="flex min-h-10 items-center rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                      >
                        Buka Workspace
                      </Link>
                      <Link
                        href="/account/profile"
                        className="flex min-h-10 items-center rounded-dd-md px-3 py-2 text-sm font-semibold text-dd-ink no-underline hover:bg-dd-surface-muted"
                      >
                        Profil Saya
                      </Link>
                    </>
                  )}
                  <div className="mt-1 border-t border-dd-line pt-1">
                    <button
                      type="button"
                      onClick={() => void sessionContext?.logout()}
                      className="flex min-h-10 w-full items-center rounded-dd-md border-0 bg-transparent px-3 text-left text-sm font-semibold text-dd-danger hover:bg-dd-danger-soft"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              </details>
            )}
            {!session && (
              <Link
                className="hidden min-h-11 items-center justify-center rounded-dd-sm border border-dd-forest/40 bg-white px-3 text-sm font-bold text-dd-forest no-underline hover:border-dd-forest sm:inline-flex"
                href={routes.register}
              >
                Daftar
              </Link>
            )}
            <Link
              className="hidden min-h-11 items-center justify-center rounded-dd-sm border border-dd-forest bg-dd-forest px-5 text-sm font-bold text-white no-underline shadow-dd-soft transition hover:-translate-y-px hover:bg-dd-forest-dark lg:inline-flex"
              href={routes.packages}
            >
              Lihat Paket
            </Link>
            <IconButton
              ref={triggerRef}
              label="Buka menu navigasi"
              variant="secondary"
              className="rounded-full border-dd-line bg-white text-dd-forest shadow-none lg:hidden"
              aria-expanded={open}
              aria-controls="public-mobile-navigation"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </header>

      {drawer.rendered && (
        <div
          data-navigation-overlay-phase={drawer.phase}
          className={`fixed inset-0 z-[100] bg-dd-sidebar/45 backdrop-blur-sm transition-opacity duration-[160ms] ease-out motion-reduce:duration-75 lg:hidden ${
            drawer.visible ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) close();
          }}
        >
          <div
            ref={drawerRef}
            id="public-mobile-navigation"
            className={`ml-auto flex h-dvh w-[min(88vw,380px)] flex-col overflow-y-auto bg-dd-paper pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-5 pr-[max(1.25rem,env(safe-area-inset-right))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-dd-float transition-transform duration-[220ms] ease-out motion-reduce:transform-none motion-reduce:duration-75 ${
              drawer.visible ? 'translate-x-0' : 'translate-x-full'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
          >
            <div className="flex items-center justify-between gap-4 border-b border-dd-line pb-5">
              <BrandMark className="w-36" />
              <IconButton
                label="Tutup menu navigasi"
                variant="secondary"
                className="rounded-full border-dd-line bg-white text-dd-forest shadow-none"
                onClick={() => {
                  close();
                  triggerRef.current?.focus();
                }}
              >
                <X className="size-5" aria-hidden="true" />
              </IconButton>
            </div>

            <nav className="grid py-6" aria-label="Navigasi publik mobile">
              {publicNavigation.map((item) => (
                <Link
                  className={`flex min-h-14 items-center justify-between border-b border-dd-line/75 text-base font-semibold no-underline ${
                    isCurrent(pathname, hash, item.href) ? 'text-dd-forest' : 'text-dd-ink'
                  }`}
                  key={`${item.href}-${item.label}-mobile`}
                  href={item.href}
                  aria-current={isCurrent(pathname, hash, item.href) ? 'page' : undefined}
                  onClick={close}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="size-4 text-dd-muted" aria-hidden="true" />
                </Link>
              ))}
            </nav>

            <div className="mt-auto grid gap-3 border-t border-dd-line pt-5">
              {!session && (
                <>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-dd-sm border border-dd-line bg-white px-5 text-sm font-bold text-dd-forest no-underline"
                    href={routes.signIn}
                    onClick={close}
                  >
                    Masuk
                  </Link>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-dd-sm border border-dd-forest/40 bg-white px-5 text-sm font-bold text-dd-forest no-underline"
                    href={routes.register}
                    onClick={close}
                  >
                    Daftar
                  </Link>
                </>
              )}
              {session && customerOnly ? (
                <>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-dd-sm border border-dd-line bg-white px-5 text-sm font-bold text-dd-forest no-underline"
                    href="/account"
                    onClick={close}
                  >
                    Dashboard Saya
                  </Link>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-dd-sm border border-dd-line bg-white px-5 text-sm font-bold text-dd-forest no-underline"
                    href="/bookings"
                    onClick={close}
                  >
                    Booking Saya
                  </Link>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-dd-sm border border-dd-line bg-white px-5 text-sm font-bold text-dd-forest no-underline"
                    href="/account/packages"
                    onClick={close}
                  >
                    Paket Saya
                  </Link>
                  <button
                    type="button"
                    className="min-h-12 rounded-dd-sm border border-dd-line bg-white px-5 text-sm font-bold text-dd-forest"
                    onClick={() => {
                      close();
                      studioPreference?.openStudioPreference();
                    }}
                  >
                    Ganti studio
                  </button>
                </>
              ) : session ? (
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-dd-sm border border-dd-line bg-white px-5 text-sm font-bold text-dd-forest no-underline"
                  href="/workspace"
                  onClick={close}
                >
                  Buka Workspace
                </Link>
              ) : null}
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-dd-sm border border-dd-forest bg-dd-forest px-5 text-sm font-bold text-white no-underline shadow-dd-soft transition hover:bg-dd-forest-dark"
                href={routes.packages}
                onClick={close}
              >
                Lihat Paket
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-dd-sm border border-dd-forest/40 bg-white px-5 text-sm font-bold text-dd-forest no-underline transition hover:border-dd-forest"
                href={`${routes.classes}#schedule`}
                onClick={close}
              >
                Lihat Jadwal
              </Link>
              {session && (
                <button
                  type="button"
                  className="min-h-12 rounded-dd-sm border border-dd-danger/30 bg-white px-5 text-sm font-bold text-dd-danger transition hover:bg-dd-danger-soft"
                  onClick={() => void sessionContext?.logout()}
                >
                  Keluar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
