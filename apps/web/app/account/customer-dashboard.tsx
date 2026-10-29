'use client';

import Link from 'next/link';
import { CalendarDays, Clock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AlertBanner } from '../components/app-feedback';
import { ButtonLink } from '../components/actions';
import { orderStatusLabels } from '../order-presenters';
import { useSessionContext } from '../session-context';
import { Skeleton } from '../ui';

type CustomerDashboardOverview = {
  generatedAt: string;
  upcomingBookings: Array<{
    id: string;
    status: string;
    className: string;
    branchName: string;
    timezone: string;
    startAt: string;
    endAt: string;
  }>;
  packages: Array<{
    id: string;
    packageName: string;
    classTypeName: string;
    branchName: string;
    expiryAt: string;
    available: number;
  }>;
  actionableOrders: Array<{
    id: string;
    packageName: string;
    branchName: string;
    status: keyof typeof orderStatusLabels;
    payableAmountRp: number;
    expiresAt: string | null;
  }>;
  verification: { status: 'APPROVED' | 'ACTION_REQUIRED' | 'PENDING' };
  unreadNotifications: number;
};

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const dayTime = (value: string, timezone: string) =>
  new Date(value).toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

const time = (value: string, timezone: string) =>
  new Date(value).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

/**
 * A parent opens this page to answer "when is the next session?", so that answer is the
 * one focal block. Sessions left and unpaid orders follow; everything else is a link.
 */
export function CustomerDashboard() {
  const session = useSessionContext()?.session;
  const [overview, setOverview] = useState<CustomerDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetch('/api/v1/me/dashboard', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('DASHBOARD_UNAVAILABLE');
        return response.json() as Promise<CustomerDashboardOverview>;
      })
      .then(setOverview)
      .catch(() => setError('Your account summary did not load.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  if (!session) return null;
  if (loading)
    return (
      <section className="rounded-[22px] bg-white p-6">
        <Skeleton label="Loading your account" />
      </section>
    );

  const verificationStatus =
    overview?.verification.status ??
    (session.identityVerificationStatus === 'APPROVED' ? 'APPROVED' : 'PENDING');
  const next = overview?.upcomingBookings[0];
  const later = overview?.upcomingBookings.slice(1, 4) ?? [];

  return (
    <main className="grid gap-6" aria-labelledby="customer-dashboard-title">
      <h1 id="customer-dashboard-title" className="font-display text-3xl text-dd-forest sm:text-4xl">
        Hi, {session.displayName}
      </h1>

      {error && (
        <AlertBanner
          tone="danger"
          title="Something is missing"
          message={error}
          action={{ label: 'Try again', onSelect: () => load() }}
        />
      )}
      {verificationStatus !== 'APPROVED' && (
        <AlertBanner
          tone={verificationStatus === 'ACTION_REQUIRED' ? 'warning' : 'info'}
          title={
            verificationStatus === 'ACTION_REQUIRED'
              ? 'Your documents need a fix'
              : 'We are checking your documents'
          }
          message="You can buy packages and book sessions once we approve your selfie and KTP."
          action={{
            label: 'See verification',
            onSelect: () => window.location.assign('/account/verification'),
          }}
        />
      )}

      <section
        className="relative overflow-hidden rounded-[22px] bg-dd-forest p-6 text-dd-cream sm:p-8"
        aria-labelledby="next-session-title"
      >
        <span
          className="absolute -top-16 -right-10 hidden size-64 rounded-full bg-lr-sun md:block"
          aria-hidden="true"
        />
        <div className="relative max-w-md">
          <h2 className="m-0 font-display text-lg text-lr-sun" id="next-session-title">
            Next session
          </h2>
          {next ? (
            <>
              <p className="mt-2 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-tight">
                {next.className}
              </p>
              <p className="mt-2 flex items-center gap-2 text-dd-cream/90">
                <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                {dayTime(next.startAt, next.timezone)} to {time(next.endAt, next.timezone)}
              </p>
              <p className="mt-1 text-dd-cream/90">{next.branchName}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  className="inline-flex min-h-11 items-center rounded-full bg-lr-sun px-5 font-medium text-dd-forest no-underline"
                  href={`/bookings/${next.id}`}
                >
                  Booking and QR pass
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center rounded-full border border-dd-cream/40 px-5 font-medium text-dd-cream no-underline"
                  href="/classes#schedule"
                >
                  Book another
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 font-display text-[clamp(1.8rem,4vw,2.4rem)] leading-tight">
                Nothing booked yet
              </p>
              <p className="mt-2 text-dd-cream/90">
                Pick a 1-hour or 2-hour session from your club&apos;s timetable.
              </p>
              <Link
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-lr-sun px-5 font-medium text-dd-forest no-underline"
                href="/classes#schedule"
              >
                See the timetable
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-[22px] bg-white p-5 sm:p-6" aria-labelledby="packages-title">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 font-display text-2xl text-dd-forest" id="packages-title">
              Sessions left
            </h2>
            <Link className="inline-flex min-h-11 items-center text-sm font-medium" href="/account/packages">
              All packages
            </Link>
          </div>
          {overview?.packages.length ? (
            <ul className="m-0 mt-3 grid list-none gap-3 p-0">
              {overview.packages.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-[15px] bg-lr-sky p-4"
                >
                  <span>
                    <strong className="block">{item.packageName}</strong>
                    <span className="text-sm text-dd-ink/80">
                      {item.branchName} · until {new Date(item.expiryAt).toLocaleDateString('en-GB')}
                    </span>
                  </span>
                  <strong className="shrink-0 font-display text-3xl text-dd-forest">
                    {item.available}
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 rounded-[15px] bg-dd-surface-muted p-4">
              <p className="m-0 text-dd-muted">No active packages yet.</p>
              <ButtonLink className="mt-3" href="/packages" variant="secondary">
                Compare packages
              </ButtonLink>
            </div>
          )}
        </section>

        <section className="rounded-[22px] bg-white p-5 sm:p-6" aria-labelledby="orders-title">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 font-display text-2xl text-dd-forest" id="orders-title">
              Orders to finish
            </h2>
            <Link className="inline-flex min-h-11 items-center text-sm font-medium" href="/orders">
              All orders
            </Link>
          </div>
          {overview?.actionableOrders.length ? (
            <ul className="m-0 mt-3 grid list-none gap-3 p-0">
              {overview.actionableOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/checkout?order=${encodeURIComponent(order.id)}`}
                    className="flex items-center justify-between gap-3 rounded-[15px] border border-lr-sun bg-lr-sun-soft p-4 text-dd-ink no-underline"
                  >
                    <span>
                      <strong className="block">{order.packageName}</strong>
                      <span className="text-sm">
                        {order.branchName} · {orderStatusLabels[order.status]}
                      </span>
                    </span>
                    <strong className="shrink-0 text-dd-forest">
                      {rupiah.format(order.payableAmountRp)}
                    </strong>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-[15px] bg-dd-surface-muted p-4 text-dd-muted">
              Nothing to pay right now.
            </p>
          )}
        </section>
      </div>

      {later.length > 0 && (
        <section className="rounded-[22px] bg-white p-5 sm:p-6" aria-labelledby="later-title">
          <div className="flex items-center justify-between gap-3">
            <h2 className="m-0 font-display text-2xl text-dd-forest" id="later-title">
              Coming up
            </h2>
            <Link className="inline-flex min-h-11 items-center text-sm font-medium" href="/bookings">
              All bookings
            </Link>
          </div>
          <ul className="m-0 mt-2 grid list-none divide-y divide-dd-line p-0">
            {later.map((booking) => (
              <li key={booking.id}>
                <Link
                  href={`/bookings/${booking.id}`}
                  className="flex min-h-14 flex-wrap items-center justify-between gap-2 py-3 text-dd-ink no-underline"
                >
                  <span>
                    <strong className="block">{booking.className}</strong>
                    <span className="text-sm text-dd-muted">{booking.branchName}</span>
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="size-4 text-dd-forest" aria-hidden="true" />
                    {dayTime(booking.startAt, booking.timezone)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
