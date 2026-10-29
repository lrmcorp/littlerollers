'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import { PublicFooter } from './public-footer';
import { PublicHeader } from './public-header';
import { PublicStatePanel } from './public-page';
import { publicContainer, publicPrimaryButton, publicSecondaryButton } from './public-styles';
import { useSessionContext } from '../../session-context';
import { isCustomerOnlySession, packageAudienceState } from '../../session-audience';

export function PublicDetailFrame({
  children,
  breadcrumb,
}: {
  children: ReactNode;
  breadcrumb: Array<{ label: string; href?: string }>;
}) {
  const session = useSessionContext()?.session;
  const customer = isCustomerOnlySession(session);
  return (
    <div className="min-w-0 bg-dd-cream text-dd-ink">
      {!customer && <PublicHeader />}
      <main id="public-detail-main">
        <nav
          aria-label="Breadcrumb"
          className={`${publicContainer} flex flex-wrap items-center gap-2 py-4 text-sm text-dd-muted`}
        >
          <Link href="/" className="font-semibold text-dd-forest no-underline">
            Home
          </Link>
          {breadcrumb.map((item) => (
            <span className="flex items-center gap-2" key={`${item.label}:${item.href ?? ''}`}>
              <span aria-hidden="true">/</span>
              {item.href ? (
                <Link href={item.href} className="font-semibold text-dd-forest no-underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
        {children}
      </main>
      {!customer && <PublicFooter />}
    </div>
  );
}

export function DetailLoading({ label }: { label: string }) {
  return (
    <div className={`${publicContainer} py-16`} aria-live="polite">
      <div className="h-4 w-32 animate-pulse rounded bg-dd-line" />
      <div className="mt-4 h-12 max-w-xl animate-pulse rounded bg-dd-line" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="min-h-80 animate-pulse rounded-[15px] bg-dd-line" />
        <div className="min-h-80 animate-pulse rounded-[15px] bg-dd-line" />
      </div>
      <span className="sr-only">Loading {label}</span>
    </div>
  );
}

export function DetailFailure({
  message,
  onRetry,
  listHref,
}: {
  message: string;
  onRetry(): void;
  listHref: string;
}) {
  return (
    <div className={`${publicContainer} py-16`}>
      <PublicStatePanel
        title={message === 'NOT_FOUND' ? 'Page not found' : 'This page did not load'}
        tone={message === 'NOT_FOUND' ? 'neutral' : 'error'}
      >
        <p>
          {message === 'NOT_FOUND'
            ? 'It may no longer be available, or the link is not right.'
            : message}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {message !== 'NOT_FOUND' && (
            <button type="button" className={publicPrimaryButton} onClick={onRetry}>
              Try again
            </button>
          )}
          <Link href={listHref} className={publicSecondaryButton}>
            Back to the list
          </Link>
        </div>
      </PublicStatePanel>
    </div>
  );
}

export function DetailHero({
  eyebrow,
  title,
  summary,
  imageKey,
  facts,
  actions,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  imageKey: string;
  facts?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="bg-lr-sky">
      <div
        className={`${publicContainer} grid items-center gap-8 py-8 lg:grid-cols-[1fr_0.88fr] lg:py-12`}
      >
        <div>
          <p className="font-display text-lg text-lr-sky-deep">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98] text-dd-forest">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-dd-ink/80 sm:text-lg">{summary}</p>
          {facts && <div className="mt-6">{facts}</div>}
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </div>
        <div className="relative min-h-[260px] overflow-hidden rounded-[22px] bg-dd-cream sm:min-h-[380px]">
          <Image
            src={`/images/public/${imageKey}`}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 44vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export function AudienceAction({
  kind,
  id,
  branchId,
  classType,
  disabled,
}: {
  kind: 'package' | 'schedule' | 'class' | 'studio';
  id: string;
  branchId?: string;
  classType?: string;
  disabled?: boolean;
}) {
  const session = useSessionContext()?.session;
  const audience = packageAudienceState(session);
  if (disabled)
    return (
      <span
        className="inline-flex min-h-11 items-center rounded-full bg-dd-line px-5 text-sm font-medium text-dd-ink"
        aria-disabled="true"
      >
        No places left
      </span>
    );
  if (audience === 'STAFF')
    return (
      <Link className={publicPrimaryButton} href="/workspace">
        Open workspace
      </Link>
    );
  const destination =
    kind === 'package'
      ? `/checkout?package=${encodeURIComponent(id)}${branchId ? `&branch=${encodeURIComponent(branchId)}` : ''}`
      : kind === 'schedule'
        ? `/bookings?slot=${encodeURIComponent(id)}`
        : `/classes?${new URLSearchParams({
            ...(branchId ? { branch: branchId } : {}),
            ...(classType ? { classType } : {}),
          }).toString()}#schedule`;
  if (audience === 'CUSTOMER_APPROVED')
    return (
      <Link className={publicPrimaryButton} href={destination}>
        {kind === 'package'
          ? 'Buy this package'
          : kind === 'schedule'
            ? 'Book this session'
            : 'See the timetable'}
      </Link>
    );
  if (audience === 'CUSTOMER_UNVERIFIED')
    return (
      <Link className={publicPrimaryButton} href="/account/verification">
        Verify to continue
      </Link>
    );
  return (
    <Link
      className={publicPrimaryButton}
      href={`/sign-in?returnTo=${encodeURIComponent(destination)}`}
    >
      Sign in to continue
    </Link>
  );
}

export function RelatedSchedules({
  items,
}: {
  items: Array<{
    id: string;
    startAt: string;
    timezone: string;
    available: number;
    branch?: { name: string };
  }>;
}) {
  if (!items.length)
    return <p className="text-sm text-dd-muted">No upcoming sessions are scheduled yet.</p>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/schedule/${item.id}`}
          className="flex min-h-16 items-center justify-between gap-4 rounded-[15px] border border-dd-line bg-white p-4 text-dd-ink no-underline hover:border-dd-forest"
        >
          <span>
            <strong className="flex items-center gap-2 text-sm">
              <CalendarDays className="size-4 text-dd-forest" aria-hidden="true" />
              {new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: item.timezone,
              }).format(new Date(item.startAt))}
            </strong>
            {item.branch && (
              <span className="mt-1 flex items-center gap-1 text-xs text-dd-muted">
                <MapPin className="size-3" aria-hidden="true" />
                {item.branch.name}
              </span>
            )}
          </span>
          <span className="text-xs font-bold text-dd-forest">
            {item.available === 1 ? '1 place' : `${item.available} places`}
          </span>
        </Link>
      ))}
    </div>
  );
}

export { publicContainer, publicPrimaryButton, publicSecondaryButton };
