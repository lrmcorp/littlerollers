'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
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
          className={`${publicContainer} flex flex-wrap items-center gap-2 py-4 text-xs text-dd-muted`}
        >
          <Link href="/" className="font-semibold text-dd-forest no-underline">
            Beranda
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
        <div className="min-h-80 animate-pulse rounded-dd-lg bg-dd-line" />
        <div className="min-h-80 animate-pulse rounded-dd-lg bg-dd-line" />
      </div>
      <span className="sr-only">Memuat {label}</span>
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
        title={message === 'NOT_FOUND' ? 'Detail tidak ditemukan' : 'Belum dapat memuat detail'}
        tone={message === 'NOT_FOUND' ? 'neutral' : 'error'}
      >
        <p>
          {message === 'NOT_FOUND'
            ? 'Konten mungkin sudah tidak aktif atau alamat yang Anda buka tidak valid.'
            : message}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {message !== 'NOT_FOUND' && (
            <button type="button" className={publicPrimaryButton} onClick={onRetry}>
              Coba lagi
            </button>
          )}
          <Link href={listHref} className={publicSecondaryButton}>
            Kembali ke daftar
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
    <section className="border-y border-dd-line bg-dd-paper">
      <div
        className={`${publicContainer} grid items-center gap-8 py-8 lg:grid-cols-[1fr_0.88fr] lg:py-12`}
      >
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2.5rem,5vw,4.8rem)] leading-[0.98] font-semibold tracking-[-0.04em]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-dd-muted sm:text-lg">{summary}</p>
          {facts && <div className="mt-6">{facts}</div>}
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-dd-lg border border-dd-line bg-dd-surface-muted shadow-dd-card sm:min-h-[400px]">
          <Image
            src={`/images/public/${imageKey}`}
            alt={`Visual ${title}`}
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
        className="inline-flex min-h-11 items-center rounded-dd-sm bg-dd-line px-5 text-sm font-bold text-dd-muted"
        aria-disabled="true"
      >
        Tempat tidak tersedia
      </span>
    );
  if (audience === 'STAFF')
    return (
      <Link className={publicPrimaryButton} href="/workspace">
        Buka Workspace <ArrowRight className="size-4" />
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
          ? 'Pilih paket'
          : kind === 'schedule'
            ? 'Booking kelas'
            : 'Lihat jadwal'}{' '}
        <ArrowRight className="size-4" />
      </Link>
    );
  if (audience === 'CUSTOMER_UNVERIFIED')
    return (
      <Link className={publicPrimaryButton} href="/account/verification">
        Verifikasi untuk melanjutkan <ArrowRight className="size-4" />
      </Link>
    );
  return (
    <Link
      className={publicPrimaryButton}
      href={`/sign-in?returnTo=${encodeURIComponent(destination)}`}
    >
      Masuk untuk melanjutkan <ArrowRight className="size-4" />
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
    return <p className="text-sm text-dd-muted">Jadwal berikutnya belum tersedia.</p>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/schedule/${item.id}`}
          className="flex items-center justify-between gap-4 rounded-dd-md border border-dd-line bg-white p-4 text-dd-ink no-underline hover:border-dd-forest"
        >
          <span>
            <strong className="flex items-center gap-2 text-sm">
              <CalendarDays className="size-4 text-dd-forest" />
              {new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: item.timezone,
              }).format(new Date(item.startAt))}
            </strong>
            {item.branch && (
              <span className="mt-1 flex items-center gap-1 text-xs text-dd-muted">
                <MapPin className="size-3" />
                {item.branch.name}
              </span>
            )}
          </span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              item.available < 1
                ? 'border border-red-200 bg-red-50 text-red-700'
                : item.available <= 2
                  ? 'border border-amber-200 bg-amber-50 text-amber-800'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {item.available < 1 ? 'Penuh' : `Sisa ${item.available} tempat`}
          </span>
        </Link>
      ))}
    </div>
  );
}

export { publicContainer, publicPrimaryButton, publicSecondaryButton };
