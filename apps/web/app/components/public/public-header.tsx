'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, UserRound, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { BrandMark } from './brand-mark';
import { publicNavigation, routes } from '../../routes';
import { isCustomerOnlySession } from '../../session-audience';
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

const pillLink =
  'inline-flex min-h-11 items-center justify-center rounded-full px-5 text-[15px] font-medium no-underline transition motion-reduce:transition-none';
const drawerButton =
  'inline-flex min-h-12 items-center justify-center rounded-full border px-5 text-[15px] font-medium no-underline';

/**
 * Header for every public page except the home page, which draws its own nav over the
 * hillside scene. The sky band and sage pill carry the hero's daylight onto inner pages.
 */
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
  const accountHref = customerOnly ? routes.account : routes.workspace;
  const accountLabel = customerOnly ? 'My account' : 'Open workspace';

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
      <header className="sticky top-0 z-50 border-b border-dd-forest/10 bg-lr-sky pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex min-h-16 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:min-h-[76px] lg:px-8">
          <BrandMark className="shrink-0" priority />

          <nav
            className="mx-auto hidden min-h-[50px] items-center gap-1 rounded-full bg-[rgba(173,196,174,0.45)] px-2 backdrop-blur-md lg:flex"
            aria-label="Main"
          >
            {publicNavigation.map((item) => {
              const current = isCurrent(pathname, hash, item.href);
              return (
                <Link
                  className={`${pillLink} px-4 whitespace-nowrap text-dd-forest ${
                    current ? 'bg-white' : 'hover:bg-white/60'
                  }`}
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  aria-current={current ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            <Link
              className="grid size-11 place-items-center rounded-full bg-white text-dd-forest no-underline sm:hidden"
              href={session ? accountHref : routes.signIn}
              aria-label={session ? accountLabel : 'Sign in'}
            >
              <UserRound className="size-5" aria-hidden="true" />
            </Link>
            {!session ? (
              <>
                <Link
                  className={`${pillLink} hidden text-dd-forest hover:bg-white/60 sm:inline-flex`}
                  href={routes.signIn}
                >
                  Sign in
                </Link>
                <Link
                  className={`${pillLink} hidden bg-dd-forest text-white hover:-translate-y-0.5 hover:bg-dd-forest-dark motion-reduce:transform-none sm:inline-flex`}
                  href={routes.register}
                >
                  Join us
                </Link>
              </>
            ) : (
              <details className="relative hidden sm:block">
                <summary
                  className={`${pillLink} cursor-pointer list-none gap-2 bg-white text-dd-forest`}
                >
                  <UserRound className="size-4" aria-hidden="true" /> My account
                </summary>
                <div className="absolute right-0 mt-2 grid w-56 gap-1 rounded-[15px] border border-dd-line bg-white p-2 shadow-dd-float">
                  <Link
                    href={accountHref}
                    className="rounded-dd-md px-3 py-2.5 text-sm font-medium text-dd-ink no-underline hover:bg-dd-surface-muted"
                  >
                    {accountLabel}
                  </Link>
                  <Link
                    href="/account/profile"
                    className="rounded-dd-md px-3 py-2.5 text-sm font-medium text-dd-ink no-underline hover:bg-dd-surface-muted"
                  >
                    My profile
                  </Link>
                  {customerOnly && (
                    <button
                      type="button"
                      onClick={() => studioPreference?.openStudioPreference()}
                      className="min-h-10 rounded-dd-md border-0 bg-transparent px-3 text-left text-sm font-medium text-dd-ink hover:bg-dd-surface-muted"
                    >
                      Change club
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void sessionContext?.logout()}
                    className="min-h-10 rounded-dd-md border-0 bg-transparent px-3 text-left text-sm font-medium text-dd-danger hover:bg-dd-danger-soft"
                  >
                    Sign out
                  </button>
                </div>
              </details>
            )}
            <IconButton
              ref={triggerRef}
              label="Open menu"
              variant="secondary"
              className="rounded-full border-transparent bg-white text-dd-forest shadow-none lg:hidden"
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
            aria-label="Menu"
          >
            <div className="flex items-center justify-between gap-4 border-b border-dd-line pb-5">
              <BrandMark />
              <IconButton
                label="Close menu"
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

            <nav className="grid py-6" aria-label="Main menu">
              {publicNavigation.map((item) => {
                const current = isCurrent(pathname, hash, item.href);
                return (
                  <Link
                    className={`flex min-h-14 items-center justify-between border-b border-dd-line/75 font-display text-xl no-underline ${
                      current ? 'text-dd-forest' : 'text-dd-ink'
                    }`}
                    key={`${item.href}-${item.label}-mobile`}
                    href={item.href}
                    aria-current={current ? 'page' : undefined}
                    onClick={close}
                  >
                    {item.label}
                    <span aria-hidden="true">›</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto grid gap-3 border-t border-dd-line pt-5">
              {!session ? (
                <>
                  <Link
                    className={`${drawerButton} border-dd-forest bg-dd-forest text-white`}
                    href={routes.register}
                    onClick={close}
                  >
                    Join us
                  </Link>
                  <Link
                    className={`${drawerButton} border-dd-line bg-white text-dd-forest`}
                    href={routes.signIn}
                    onClick={close}
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <Link
                  className={`${drawerButton} border-dd-forest bg-dd-forest text-white`}
                  href={accountHref}
                  onClick={close}
                >
                  {accountLabel}
                </Link>
              )}
              {customerOnly && (
                <button
                  type="button"
                  className={`${drawerButton} border-dd-line bg-white text-dd-forest`}
                  onClick={() => {
                    close();
                    studioPreference?.openStudioPreference();
                  }}
                >
                  Change club
                </button>
              )}
              {session && (
                <button
                  type="button"
                  className={`${drawerButton} border-dd-danger/30 bg-white text-dd-danger`}
                  onClick={() => void sessionContext?.logout()}
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
