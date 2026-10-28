'use client';

import Link from 'next/link';
import { Bell, CalendarDays, CreditCard, House, PackageCheck, QrCode, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AlertBanner } from '../components/app-feedback';
import { ButtonLink } from '../components/actions';
import { orderStatusLabels } from '@/lib/order-presenters';
import { useSessionContext } from '../session-context';
import { Skeleton } from '../ui';

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
      time: `${startTime} - ${endTime} WIB`,
      full: `${dateFormatted} · ${startTime} - ${endTime} WIB`,
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

export function CustomerDashboard() {
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

  const activeBranchId =
    session.preferredBranch?.id ??
    session.branches?.[0]?.id ??
    '';
  // Member dengan paket aktif dibiarkan memilih studio di halaman jadwal: halaman itu membuka studio paketnya
  // bila studio utamanya tidak punya paket yang cocok. Tanpa paket, jadwal studio utama yang dibuka.
  const bookingHref =
    activeBranchId && !overview?.packages.length
      ? `/classes?branch=${encodeURIComponent(activeBranchId)}`
      : '/classes';

  const nearestBooking = overview?.upcomingBookings?.[0];

  return (
    <main className="space-y-7" aria-labelledby="customer-dashboard-title">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-bold text-ed-green">
            Beranda Member
          </p>
          <h1 id="customer-dashboard-title" className="font-serif mt-2 text-2xl font-normal tracking-tight text-ed-ink sm:text-3xl">
            Halo, {session.displayName}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ed-muted">
            Jadwal, paket, dan pembayaran yang perlu Anda perhatikan.
          </p>
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

      {/* Kartu Booking Terdekat di Paling Atas (Tiket T-08 / Spesifikasi 5.8) */}
      {loading ? (
        <section
          aria-label="Memuat booking terdekat"
          className="rounded-none border border-ed-line bg-white p-5 sm:p-6"
        >
          <div className="h-5 w-32 rounded bg-ed-tint/60" />
          <div className="mt-3 h-7 w-48 rounded bg-ed-tint/40" />
          <div className="mt-2 h-4 w-64 rounded bg-ed-tint/30" />
        </section>
      ) : nearestBooking ? (
        <section
          aria-label="Booking terdekat"
          className="rounded-none border-2 border-ed-forest bg-white p-5 shadow-none sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 border border-ed-line bg-ed-tint px-2 py-0.5 text-[13px] font-bold text-ed-forest">
                  <span className="size-1.5 rounded-full bg-ed-forest" />
                  Jadwal Terdekat
                </span>
                <span className="text-xs text-ed-muted">
                  {nearestBooking.branchName}
                </span>
              </div>
              <h2 className="font-serif text-xl font-normal tracking-tight text-ed-ink sm:text-2xl">
                {nearestBooking.className}
              </h2>
              <p className="text-sm text-ed-muted">
                {formatBookingSchedule(
                  nearestBooking.startAt,
                  nearestBooking.endAt,
                  nearestBooking.timezone,
                ).full}
              </p>
            </div>
            <div className="shrink-0 pt-2 sm:pt-0">
              <Link
                href={`/check-in-pass?bookingId=${encodeURIComponent(nearestBooking.id)}&class=${encodeURIComponent(nearestBooking.className)}&branch=${encodeURIComponent(nearestBooking.branchName)}&start=${encodeURIComponent(nearestBooking.startAt)}&end=${encodeURIComponent(nearestBooking.endAt)}&tz=${encodeURIComponent(nearestBooking.timezone)}`}
                className="inline-flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-none bg-ed-forest px-6 text-sm font-bold text-white shadow-none transition hover:bg-ed-green sm:w-auto"
              >
                <QrCode className="size-4" />
                <span>Lihat QR Pass</span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section
          aria-label="Booking terdekat"
          className="rounded-none border border-dashed border-ed-line bg-ed-tint/30 p-5 text-center sm:p-6"
        >
          <p className="text-sm text-ed-muted">
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan akun">
        <MetricCard
          icon={CalendarDays}
          label="Booking mendatang"
          value={overview ? String(overview.upcomingBookings.length) : undefined}
          loading={loading || !overview}
          href="/bookings"
        />
        <MetricCard
          icon={PackageCheck}
          label="Paket aktif"
          value={overview ? String(overview.packages.length) : undefined}
          loading={loading || !overview}
          href="/account/packages"
        />
        <MetricCard
          icon={CreditCard}
          label="Pesanan aktif"
          value={overview ? String(overview.actionableOrders.length) : undefined}
          loading={loading || !overview}
          href="/orders"
        />
        <MetricCard
          icon={Bell}
          label="Notifikasi belum dibaca"
          value={overview ? String(overview.unreadNotifications) : undefined}
          loading={loading || !overview}
          href="/account"
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <DashboardSection
          title="Jadwal berikutnya"
          description="Kelas yang sudah Anda booking."
          href="/bookings"
          empty="Belum ada booking mendatang."
          hasItems={Boolean(overview?.upcomingBookings.length)}
        >
          {overview?.upcomingBookings.map((booking) => (
            <article
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-ed-line py-4 first:border-t-0"
            >
              <div>
                <strong className="block text-sm text-ed-ink">{booking.className}</strong>
                <span className="mt-1 block text-xs text-ed-muted">{booking.branchName}</span>
              </div>
              <div className="flex items-center gap-3">
                <time className="font-serif text-right text-sm font-normal text-ed-forest">
                  {(() => {
                    const date = new Date(booking.startAt);
                    const showYear = date.getFullYear() !== new Date().getFullYear();
                    return date.toLocaleString('id-ID', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      ...(showYear ? { year: 'numeric' } : {}),
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: booking.timezone,
                    });
                  })()}
                </time>
                <Link
                  href={`/check-in-pass?bookingId=${encodeURIComponent(booking.id)}&class=${encodeURIComponent(booking.className)}&branch=${encodeURIComponent(booking.branchName)}&start=${encodeURIComponent(booking.startAt)}&end=${encodeURIComponent(booking.endAt)}&tz=${encodeURIComponent(booking.timezone)}`}
                  className="inline-flex h-11 min-h-[44px] items-center gap-1 border border-ed-forest bg-white px-3 text-xs font-semibold text-ed-forest transition hover:bg-ed-forest hover:text-white"
                >
                  <QrCode className="size-3.5" />
                  <span>QR Pass</span>
                </Link>
              </div>
            </article>
          ))}
        </DashboardSection>

        <DashboardSection
          title="Pesanan perlu perhatian"
          description="Lanjutkan transfer atau pantau pemeriksaan Finance."
          href="/orders"
          empty="Tidak ada pesanan yang perlu ditindak."
          hasItems={Boolean(overview?.actionableOrders.length)}
        >
          {overview?.actionableOrders.map((order) => (
            <Link
              href={`/checkout?order=${encodeURIComponent(order.id)}`}
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t border-ed-line py-4 text-ed-ink no-underline transition-colors hover:bg-ed-tint/30 first:border-t-0"
            >
              <div>
                <strong className="block text-sm text-ed-ink">{order.packageName}</strong>
                <span className="mt-1 block text-xs text-ed-muted">
                  {order.branchName} · {orderStatusLabels[order.status]}
                </span>
              </div>
              <strong className="font-serif text-sm font-normal text-ed-forest">
                {formatRupiah(order.payableAmountRp)}
              </strong>
            </Link>
          ))}
        </DashboardSection>
      </div>

      <DashboardSection
        title="Paket yang dapat digunakan"
        description="Saldo sesi dan masa berlaku paket aktif."
        href="/account/packages"
        empty="Belum ada paket aktif."
        hasItems={Boolean(overview?.packages.length)}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {overview?.packages.map((item) => (
            <article key={item.id} className="rounded-none border border-ed-line bg-ed-tint/40 p-4">
              <span className="text-[13px] font-bold text-ed-muted">{item.branchName}</span>
              <strong className="mt-1 block font-serif text-base font-normal text-ed-ink">{item.packageName}</strong>
              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="text-xs text-ed-muted">
                  Berlaku sampai {new Date(item.expiryAt).toLocaleDateString('id-ID')}
                </span>
                <strong className="font-serif text-xl font-normal text-ed-forest">{item.available} sesi</strong>
              </div>
            </article>
          ))}
        </div>
      </DashboardSection>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  loading = false,
  href,
}: {
  icon: typeof CalendarDays;
  label: string;
  value?: string;
  loading?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-none border border-ed-line bg-white p-5 text-ed-ink no-underline shadow-none transition-colors hover:border-ed-forest hover:bg-ed-tint/20"
      aria-busy={loading}
    >
      <span className="grid size-10 place-items-center rounded-none border border-ed-line bg-ed-tint text-ed-forest">
        <Icon className="size-5" />
      </span>
      {loading ? (
        <span
          className="mt-4 block h-9 w-16 rounded bg-ed-tint/60"
          aria-label={`Memuat ${label}...`}
        />
      ) : (
        <strong className="mt-4 block font-serif text-3xl font-normal tracking-tight text-ed-ink">{value}</strong>
      )}
      <span className="mt-1 block text-[13px] font-medium text-ed-muted">{label}</span>
    </Link>
  );
}

function DashboardSection({
  title,
  description,
  href,
  empty,
  hasItems,
  children,
}: {
  title: string;
  description: string;
  href: string;
  empty: string;
  hasItems: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-none border border-ed-line bg-white p-5 shadow-none sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-normal tracking-tight text-ed-ink">{title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-ed-muted">{description}</p>
        </div>
        <Link href={href} className="shrink-0 text-[13px] font-bold text-ed-forest hover:text-ed-green">
          Lihat semua
        </Link>
      </header>
      <div className="mt-4">
        {hasItems ? (
          children
        ) : (
          <p className="rounded-none border border-ed-line bg-ed-tint/40 p-4 text-sm text-ed-muted">{empty}</p>
        )}
      </div>
    </section>
  );
}
