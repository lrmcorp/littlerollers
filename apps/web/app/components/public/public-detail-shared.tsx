'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { PublicFooter } from './public-footer';
import { PublicHeader } from './public-header';
import { PublicStatePanel } from './public-page';
import { publicPrimaryButton, publicSecondaryButton } from './public-styles';
import { useSessionContext } from '../../session-context';
import { isCustomerOnlySession, packageAudienceState } from '@/lib/session-audience';
import { resolvePublicImageUrl } from '../../lib/public-image-url';

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
    <div className="ed-scope min-w-0 bg-ed-cream text-ed-ink">
      {!customer && <PublicHeader variant="editorial" />}
      <main id="public-detail-main">
        <nav
          aria-label="Breadcrumb"
          className={`ed-wrap flex flex-wrap items-center gap-2 py-4 text-xs text-ed-muted`}
        >
          <Link href="/" className="font-semibold text-ed-green no-underline">
            Beranda
          </Link>
          {breadcrumb.map((item) => (
            <span className="flex items-center gap-2" key={`${item.label}:${item.href ?? ''}`}>
              <span aria-hidden="true">/</span>
              {item.href ? (
                <Link href={item.href} className="font-semibold text-ed-green no-underline">
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
      {!customer && <PublicFooter variant="editorial" />}
    </div>
  );
}

export function DetailLoading({ label }: { label: string }) {
  return (
    <div className={`ed-wrap py-16`} aria-live="polite">
      <div className="h-4 w-32 animate-pulse rounded bg-ed-line" />
      <div className="mt-4 h-12 max-w-xl animate-pulse rounded bg-ed-line" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="min-h-80 animate-pulse rounded-none bg-ed-line" />
        <div className="min-h-80 animate-pulse rounded-none bg-ed-line" />
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
    <div className={`ed-wrap py-16`}>
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
    <section className="border-y border-ed-line bg-ed-cream">
      <div
        className={`ed-wrap grid items-center gap-8 py-8 lg:grid-cols-[1fr_0.88fr] lg:py-12`}
      >
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-ed-green uppercase">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2.5rem,5vw,4.8rem)] leading-[0.98] font-semibold tracking-[-0.04em]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ed-muted sm:text-lg">{summary}</p>
          {facts && <div className="mt-6">{facts}</div>}
          {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
        </div>
        <div className="relative min-h-[300px] overflow-hidden rounded-none border border-ed-line bg-ed-tint sm:min-h-[400px]">
          <Image
            src={resolvePublicImageUrl(imageKey)}
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
  disabledLabel = 'Tempat tidak tersedia',
}: {
  kind: 'package' | 'schedule' | 'class' | 'studio';
  id: string;
  branchId?: string;
  classType?: string;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const session = useSessionContext()?.session;
  const audience = packageAudienceState(session);
  if (disabled)
    return (
      <span
        className="inline-flex min-h-11 items-center rounded-none bg-ed-line px-5 text-sm font-bold text-ed-muted"
        aria-disabled="true"
      >
        {disabledLabel}
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
    return <p className="text-sm text-ed-muted">Jadwal berikutnya belum tersedia.</p>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/schedule/${item.id}`}
          className="flex items-center justify-between gap-4 rounded-none border border-ed-line bg-white p-4 text-ed-ink no-underline hover:border-ed-green"
        >
          <span>
            <strong className="flex items-center gap-2 text-sm">
              <CalendarDays className="size-4 text-ed-green" />
              {new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: item.timezone,
              }).format(new Date(item.startAt))}
            </strong>
            {item.branch && (
              <span className="mt-1 flex items-center gap-1 text-xs text-ed-muted">
                <MapPin className="size-3" />
                {item.branch.name}
              </span>
            )}
          </span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              item.available < 1
                ? 'border border-dd-danger/30 bg-dd-danger-soft text-dd-danger'
                : item.available <= 2
                  ? 'border border-dd-warning/30 bg-dd-warning-soft text-dd-warning'
                  : 'border border-dd-success/30 bg-dd-success-soft text-dd-success'
            }`}
          >
            {item.available < 1 ? 'Penuh' : `Sisa ${item.available} tempat`}
          </span>
        </Link>
      ))}
    </div>
  );
}

export { publicPrimaryButton, publicSecondaryButton };
