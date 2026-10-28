'use client';

import Link from 'next/link';
import { ChevronRight, House, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AlertBanner } from '../components/app-feedback';
import { ButtonLink } from '../components/actions';
import { orderStatusLabels } from '@/lib/order-presenters';
import { useSessionContext } from '../session-context';
import { Skeleton } from '../ui';
import {
  browserPublicClassCatalogClient,
  type PublicClassCatalogClient,
  type PublicClassSlot,
} from '../api-clients/public-class-catalog-client';

function formatBookingSchedule(startAt: string, endAt: string, timezone: string) {
  try {
    const dateFormatted = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: timezone,
    }).format(new Date(startAt));

    const startTime = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: timezone,
    }).format(new Date(startAt));

    const endTime = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: timezone,
    }).format(new Date(endAt));

    return {
      date: dateFormatted,
      time: `${startTime} sampai ${endTime} WIB`,
      full: `${dateFormatted} · ${startTime} sampai ${endTime} WIB`,
    };
  } catch {
    return {
      date: startAt,
      time: `${startAt} - ${endAt}`,
      full: `${startAt} - ${endAt}`,
    };
  }
}

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
  verification: {
    status: 'APPROVED' | 'ACTION_REQUIRED' | 'PENDING' | 'REJECTED' | string;
    rejectionReason?: string | null;
  };
  unreadNotifications: number;
};

import { formatRupiah } from '../lib/formatters';
import { VerificationStatusBanner } from '../components/verification-status-banner';

export function CustomerDashboard({
  classCatalogClient = browserPublicClassCatalogClient,
}: { classCatalogClient?: PublicClassCatalogClient } = {}) {
  const session = useSessionContext()?.session;
  const [overview, setOverview] = useState<CustomerDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/v1/me/dashboard', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('DASHBOARD_UNAVAILABLE');
        return response.json() as Promise<CustomerDashboardOverview>;
      })
      .then(setOverview)
      .catch(() => setError('Ringkasan akun belum dapat dimuat. Silakan coba kembali.'))
      .finally(() => setLoading(false));
  }, []);

  if (!session) return null;
  if (loading)
    return (
      <section className="rounded-none border border-ed-line bg-white p-6 shadow-none">
        <Skeleton label="Menyiapkan dashboard" />
      </section>
    );

  const verificationStatus =
    overview?.verification?.status ??
    (session.identityVerificationStatus === 'APPROVED'
      ? 'APPROVED'
      : session.identityVerificationStatus === 'PENDING'
        ? 'PENDING'
        : session.identityVerificationStatus === 'REJECTED'
          ? 'REJECTED'
          : 'ACTION_REQUIRED');
  const rejectionReason = overview?.verification?.rejectionReason;

  const activeBranchId = session.preferredBranch?.id ?? session.branches?.[0]?.id ?? '';
  // Member dengan paket aktif dibiarkan memilih studio di halaman jadwal: halaman itu membuka studio paketnya
  // bila studio utamanya tidak punya paket yang cocok. Tanpa paket, jadwal studio utama yang dibuka.
  const bookingHref =
    activeBranchId && !overview?.packages.length
      ? `/classes?branch=${encodeURIComponent(activeBranchId)}`
      : '/classes';

  const nearestBooking = overview?.upcomingBookings?.[0];
  const otherBookings = overview?.upcomingBookings?.slice(1) ?? [];
  const firstName = session.displayName.trim().split(/\s+/)[0] ?? session.displayName;
  const homeStudio = session.preferredBranch?.name ?? session.branches?.[0]?.name;
  const nearest = nearestBooking
    ? formatBookingSchedule(nearestBooking.startAt, nearestBooking.endAt, nearestBooking.timezone)
    : null;

  return (
    <main className="space-y-6 font-sans" aria-labelledby="customer-dashboard-title">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            id="customer-dashboard-title"
            className="m-0 text-[26px] font-semibold tracking-[-0.02em] text-dd-ink sm:text-[30px]"
          >
            Halo, {firstName}
          </h1>
        </div>
        <ButtonLink href={bookingHref}>Booking kelas</ButtonLink>
      </header>

      {error && (
        <div className="grid gap-3">
          <AlertBanner tone="danger" title="Dashboard belum lengkap" message={error} />
          <div>
            <ButtonLink href="/" variant="secondary" leadingIcon={<House className="size-4" />}>
              Kunjungi situs utama
            </ButtonLink>
          </div>
        </div>
      )}

      <VerificationStatusBanner
        status={verificationStatus}
        rejectionReason={rejectionReason}
        returnTo="/account"
      />

      {overview?.actionableOrders.map((order) => (
        <Link
          href={`/checkout?order=${encodeURIComponent(order.id)}`}
          key={order.id}
          className="flex items-center justify-between gap-3 rounded-dd-lg border border-dd-warning-line/60 bg-dd-warning-soft p-4 text-dd-ink no-underline"
        >
          <span>
            <strong className="block text-[15px]">{order.packageName}</strong>
            <span className="block text-sm text-dd-muted">
              {order.branchName} · {orderStatusLabels[order.status]}
            </span>
          </span>
          <strong className="shrink-0 text-[15px] text-dd-warning">
            {formatRupiah(order.payableAmountRp)}
          </strong>
        </Link>
      ))}

      {nearestBooking && nearest ? (
        <section
          aria-label="Booking terdekat"
          className="rounded-dd-xl border border-dd-line bg-white p-5 sm:p-6"
        >
          <p className="m-0 text-sm font-semibold text-dd-forest">Booking terdekat</p>
          <h2 className="m-0 mt-1 text-[22px] font-semibold text-dd-ink">
            {nearestBooking.className}
          </h2>
          <p className="m-0 mt-2 text-[17px] text-dd-ink">{nearest.date}</p>
          <p className="m-0 text-[17px] text-dd-ink">{nearest.time}</p>
          <p className="m-0 mt-1 text-[15px] text-dd-muted">{nearestBooking.branchName}</p>
          {/* QR yang sama dipakai setiap datang; studio yang memindainya. */}
          <Link
            href="/check-in-pass"
            className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-dd-lg bg-dd-forest px-6 text-base font-semibold text-white no-underline transition hover:bg-dd-forest-dark"
          >
            <QrCode className="size-5" aria-hidden="true" />
            <span>Lihat QR Pass</span>
          </Link>
          <Link
            href={`/bookings/${encodeURIComponent(nearestBooking.id)}`}
            className="mt-3 block text-center text-[15px] font-semibold text-dd-forest underline"
          >
            Batalkan booking ini
          </Link>
        </section>
      ) : (
        <section
          aria-label="Booking terdekat"
          className="rounded-dd-xl border border-dashed border-dd-line bg-white p-5 text-center sm:p-6"
        >
          <p className="m-0 text-[15px] text-dd-muted">
            {overview?.packages.length
              ? 'Belum ada booking mendatang. Pilih jadwal kelas untuk mulai latihan.'
              : 'Belum ada paket aktif. Kamu perlu paket sesi sebelum bisa booking kelas.'}
          </p>
          <div className="mt-3">
            <ButtonLink
              href={overview?.packages.length ? bookingHref : '/packages'}
              variant="secondary"
              className="min-h-[44px]"
            >
              {overview?.packages.length ? 'Lihat jadwal kelas' : 'Lihat pilihan paket'}
            </ButtonLink>
          </div>
        </section>
      )}

      {otherBookings.length > 0 && (
        <section aria-labelledby="other-bookings" className="space-y-3">
          <h2 id="other-bookings" className="m-0 text-xl font-semibold text-dd-ink">
            Booking lainnya
          </h2>
          <ul className="m-0 grid list-none gap-2 p-0">
            {otherBookings.map((booking) => {
              const jadwal = formatBookingSchedule(
                booking.startAt,
                booking.endAt,
                booking.timezone,
              );
              return (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${encodeURIComponent(booking.id)}`}
                    className="flex items-center justify-between gap-3 rounded-dd-lg border border-dd-line bg-white p-4 text-dd-ink no-underline hover:border-dd-forest"
                  >
                    <span>
                      <strong className="block text-[15px]">{booking.className}</strong>
                      <span className="block text-sm text-dd-muted">
                        {jadwal.date} · {jadwal.time}
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-dd-muted" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {homeStudio && activeBranchId && (
        <WeekClasses
          branchId={activeBranchId}
          studioName={homeStudio}
          client={classCatalogClient}
          canBook={Boolean(overview?.packages.length)}
        />
      )}

      {overview && overview.packages.length > 0 && (
        <section aria-labelledby="my-packages" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="my-packages" className="m-0 text-xl font-semibold text-dd-ink">
              Paket saya
            </h2>
            <Link href="/account/packages" className="text-sm font-semibold text-dd-forest">
              Lihat semua
            </Link>
          </div>
          <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
            {overview.packages.map((item) => (
              <li
                key={item.id}
                className="flex items-end justify-between gap-3 rounded-dd-lg border border-dd-line bg-white p-4"
              >
                <span>
                  <strong className="block text-[15px] text-dd-ink">{item.packageName}</strong>
                  <span className="block text-sm text-dd-muted">
                    {item.branchName} · berlaku sampai{' '}
                    {new Date(item.expiryAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </span>
                <strong className="shrink-0 text-xl font-semibold text-dd-forest">
                  {item.available} sesi
                </strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

/** Kelas tujuh hari ke depan di studio utama, supaya booking berikutnya cukup satu ketukan. */
function WeekClasses({
  branchId,
  studioName,
  client,
  canBook,
}: {
  branchId: string;
  studioName: string;
  client: PublicClassCatalogClient;
  canBook: boolean;
}) {
  const [slots, setSlots] = useState<PublicClassSlot[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const from = new Date();
    Promise.resolve()
      .then(() => client.list({ branchId, from, until: new Date(from.getTime() + 7 * 86_400_000) }))
      .then((result) => {
        if (!cancelled) setSlots(Array.isArray(result?.items) ? result.items.slice(0, 5) : []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      });
    return () => {
      cancelled = true;
    };
  }, [branchId, client]);

  if (!slots || slots.length === 0) return null;

  return (
    <section aria-labelledby="week-classes" className="space-y-3">
      <h2 id="week-classes" className="m-0 text-xl font-semibold text-dd-ink">
        Kelas minggu ini di {studioName}
      </h2>
      <ul className="m-0 grid list-none gap-2 p-0">
        {slots.map((slot) => {
          const start = new Date(slot.startAt);
          const jam = new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
            timeZone: slot.timezone,
          }).format(start);
          const hari = new Intl.DateTimeFormat('id-ID', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            timeZone: slot.timezone,
          }).format(start);
          const href = canBook
            ? `/classes?branch=${encodeURIComponent(branchId)}&slot=${encodeURIComponent(slot.id)}`
            : '/packages';
          return (
            <li key={slot.id}>
              <Link
                href={href}
                className="flex items-center gap-4 rounded-dd-lg border border-dd-line bg-white p-4 text-dd-ink no-underline hover:border-dd-forest"
              >
                <span className="w-16 shrink-0">
                  <strong className="block text-xl font-semibold tabular-nums">{jam}</strong>
                  <span className="block text-xs text-dd-muted">{hari}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-[15px]">{slot.classType.name}</strong>
                  {slot.instructor?.displayName && (
                    <span className="block text-sm text-dd-muted">
                      {slot.instructor.displayName}
                    </span>
                  )}
                  <span
                    className={`block text-sm font-semibold ${slot.available > 0 ? 'text-dd-forest' : 'text-dd-muted'}`}
                  >
                    {slot.available > 0 ? `${slot.available} slot tersisa` : 'Penuh'}
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-dd-muted" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
