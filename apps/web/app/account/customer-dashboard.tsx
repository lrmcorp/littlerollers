'use client';

import Link from 'next/link';
import { Bell, CalendarDays, CreditCard, House, PackageCheck, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AlertBanner } from '../components/app-feedback';
import { ButtonLink } from '../components/actions';
import { orderStatusLabels } from '@/lib/order-presenters';
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

import { formatRupiah } from '../lib/formatters';

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
      <section className="rounded-dd-xl border border-dd-line bg-white p-6">
        <Skeleton label="Menyiapkan dashboard" />
      </section>
    );

  const verificationStatus =
    overview?.verification.status ??
    (session.identityVerificationStatus === 'APPROVED' ? 'APPROVED' : 'PENDING');

  return (
    <main className="space-y-7" aria-labelledby="customer-dashboard-title">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
            Beranda Member
          </p>
          <h1 id="customer-dashboard-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
            Halo, {session.displayName}
          </h1>
          <p className="mt-2 text-sm leading-6 text-dd-muted">
            Jadwal, paket, dan pembayaran yang perlu Anda perhatikan.
          </p>
        </div>
        <ButtonLink href="/classes#schedule">Booking kelas</ButtonLink>
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
      {verificationStatus !== 'APPROVED' && (
        <AlertBanner
          tone={verificationStatus === 'ACTION_REQUIRED' ? 'warning' : 'info'}
          title={
            verificationStatus === 'ACTION_REQUIRED'
              ? 'Dokumen perlu diperbaiki'
              : 'Verifikasi sedang berlangsung'
          }
          message="Pembelian paket dan booking terbuka setelah Selfie serta KTP disetujui."
          action={{
            label: 'Lihat verifikasi',
            onSelect: () => window.location.assign('/account/verification'),
          }}
        />
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Ringkasan akun">
        <MetricCard
          icon={CalendarDays}
          label="Booking mendatang"
          value={String(overview?.upcomingBookings.length ?? 0)}
          href="/bookings"
        />
        <MetricCard
          icon={PackageCheck}
          label="Paket aktif"
          value={String(overview?.packages.length ?? 0)}
          href="/account/packages"
        />
        <MetricCard
          icon={CreditCard}
          label="Pesanan aktif"
          value={String(overview?.actionableOrders.length ?? 0)}
          href="/orders"
        />
        <MetricCard
          icon={Bell}
          label="Notifikasi belum dibaca"
          value={String(overview?.unreadNotifications ?? 0)}
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
              className="flex flex-wrap items-center justify-between gap-3 border-t border-dd-line py-4 first:border-t-0"
            >
              <div>
                <strong className="block text-sm">{booking.className}</strong>
                <span className="mt-1 block text-xs text-dd-muted">{booking.branchName}</span>
              </div>
              <time className="text-right text-sm font-semibold">
                {new Date(booking.startAt).toLocaleString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: booking.timezone,
                })}
              </time>
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
              className="flex flex-wrap items-center justify-between gap-3 border-t border-dd-line py-4 text-dd-ink no-underline first:border-t-0"
            >
              <div>
                <strong className="block text-sm">{order.packageName}</strong>
                <span className="mt-1 block text-xs text-dd-muted">
                  {order.branchName} · {orderStatusLabels[order.status]}
                </span>
              </div>
              <strong className="text-sm text-dd-forest">
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
            <article key={item.id} className="rounded-dd-lg bg-dd-surface-muted p-4">
              <span className="text-xs font-semibold text-dd-muted">{item.branchName}</span>
              <strong className="mt-1 block">{item.packageName}</strong>
              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="text-sm text-dd-muted">
                  Berlaku sampai {new Date(item.expiryAt).toLocaleDateString('id-ID')}
                </span>
                <strong className="text-xl text-dd-forest">{item.available} sesi</strong>
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
  href,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-dd-xl border border-dd-line bg-white p-5 text-dd-ink no-underline shadow-dd-card transition hover:-translate-y-0.5"
    >
      <span className="grid size-10 place-items-center rounded-dd-lg bg-dd-surface-muted text-dd-forest">
        <Icon className="size-5" />
      </span>
      <strong className="mt-4 block text-2xl">{value}</strong>
      <span className="mt-1 block text-xs text-dd-muted">{label}</span>
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
    <section className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-dd-muted">{description}</p>
        </div>
        <Link href={href} className="shrink-0 text-xs font-semibold text-dd-forest">
          Lihat semua
        </Link>
      </header>
      <div className="mt-4">
        {hasItems ? (
          children
        ) : (
          <p className="rounded-dd-lg bg-dd-surface-muted p-4 text-sm text-dd-muted">{empty}</p>
        )}
      </div>
    </section>
  );
}
