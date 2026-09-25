'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarDays, QrCode, RefreshCw, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bookingFailure,
  browserBookingClient,
  type BookingClient,
  type CheckInIssue,
  type CustomerBookingRecord,
} from '@/api-clients/booking-client';
import { AlertBanner } from '../../../components/app-feedback';
import { useSearchParams } from 'next/navigation';
import { Button } from '../../../components/actions';
import { Badge, Panel, StatCard } from '../../../components/admin/admin-ui';
import { Skeleton } from '../../../ui';
import { AdminPageHeader } from '../../../components/admin/admin-page-header';
import { useSessionContext } from '../../../session-context';

const statusLabels: Record<string, string> = {
  BOOKED: 'Aktif',
  RESCHEDULE_PENDING: 'Menunggu reschedule',
  CANCELLED: 'Dibatalkan',
  ATTENDED: 'Sudah hadir',
  NO_SHOW: 'Tidak hadir',
};

const sourceLabels: Record<string, string> = {
  SELF: 'Dibuat pelanggan',
  ADMIN_ASSISTED: 'Booking bantuan staf',
};

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/workspace/bookings') || value.startsWith('//'))
    return '/workspace/bookings';
  try {
    const parsed = new URL(value, 'http://local.invalid');
    return parsed.origin === 'http://local.invalid'
      ? `${parsed.pathname}${parsed.search}`
      : '/workspace/bookings';
  } catch {
    return '/workspace/bookings';
  }
}

function formatDate(value: Date, timezone = 'Asia/Jakarta') {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(value);
}

export function StaffBookingDetailView({
  id,
  client = browserBookingClient,
}: {
  id: string;
  client?: BookingClient;
}) {
  const params = useSearchParams();
  const context = useSessionContext();
  const [booking, setBooking] = useState<CustomerBookingRecord | null>(null);
  const [issue, setIssue] = useState<CheckInIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const returnTo = useMemo(() => safeReturnTo(params.get('returnTo')), [params]);
  const canManageAttendance = Boolean(
    context?.status === 'authenticated' &&
    context.hasCapability('attendance:manage') &&
    context.activeBranchId,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setBooking(await client.detail(id));
    } catch (cause) {
      setBooking(null);
      setError(await bookingFailure(cause));
    } finally {
      setLoading(false);
    }
  }, [client, id]);

  useEffect(() => void load(), [load]);

  const issueQr = async () => {
    if (!booking || !client.issueCheckIn || !canManageAttendance) return;
    setBusy(true);
    setError('');
    try {
      setIssue(await client.issueCheckIn(booking.id, booking.version, crypto.randomUUID()));
      await load();
    } catch (cause) {
      setError(await bookingFailure(cause));
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <Panel className="p-6">
        <Skeleton label="Memuat detail booking staf" />
      </Panel>
    );

  if (!booking)
    return (
      <Panel className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Booking tidak tersedia</h1>
        {error && <AlertBanner tone="danger" title="Detail gagal dimuat" message={error} />}
        <Link className="font-semibold text-dd-forest" href={returnTo}>
          Kembali ke daftar booking
        </Link>
      </Panel>
    );

  const timezone = booking.classSlot?.timezone ?? booking.branch?.timezone ?? 'Asia/Jakarta';
  return (
    <section className="space-y-6" aria-labelledby="staff-booking-title">
      <Link
        href={returnTo}
        className="inline-flex items-center gap-2 text-sm font-semibold text-dd-forest no-underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke antrean
      </Link>
      <AdminPageHeader
        title={booking.classSlot?.classType.name ?? 'Booking pelanggan'}
        titleId="staff-booking-title"
        description={`${booking.customer?.displayName ?? 'Pelanggan'} · ${booking.branch?.name ?? 'Cabang'} · ${statusLabels[booking.status] ?? 'Status booking'}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={
                booking.status === 'ATTENDED'
                  ? 'success'
                  : booking.status === 'CANCELLED' || booking.status === 'NO_SHOW'
                    ? 'danger'
                    : booking.status === 'RESCHEDULE_PENDING'
                      ? 'warning'
                      : 'info'
              }
            >
              {statusLabels[booking.status] ?? 'Status booking'}
            </Badge>
            <Button
              variant="secondary"
              disabled={busy}
              leadingIcon={<RefreshCw className="size-4" aria-hidden="true" />}
              onClick={() => void load()}
            >
              Segarkan
            </Button>
          </div>
        }
      />

      {error && <AlertBanner tone="danger" title="Tindakan belum berhasil" message={error} />}
      {!context?.activeBranchId && context?.hasCapability('attendance:manage') && (
        <AlertBanner
          tone="info"
          title="Mode baca global"
          message="Pilih cabang dari topbar untuk menerbitkan QR atau mencatat kehadiran."
        />
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Saldo ledger"
          value={(booking.sessionBalance?.ledgerBalance ?? 0).toLocaleString('id-ID')}
        />
        <StatCard
          label="Sesi direservasi"
          value={(booking.sessionBalance?.reserved ?? booking.reservedQuantity ?? 1).toLocaleString(
            'id-ID',
          )}
          tone="warning"
        />
        <StatCard
          label="Sesi tersedia"
          value={(booking.sessionBalance?.available ?? 0).toLocaleString('id-ID')}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <UserRound className="size-6 text-dd-forest" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold">Pelanggan dan paket</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-dd-muted">Pelanggan</dt>
              <dd className="font-semibold">{booking.customer?.displayName ?? 'Pelanggan'}</dd>
            </div>
            <div>
              <dt className="text-dd-muted">Kontak</dt>
              <dd className="font-semibold">{booking.customer?.phoneMasked ?? 'Termasking'}</dd>
            </div>
            <div>
              <dt className="text-dd-muted">Paket</dt>
              <dd className="font-semibold">{booking.package?.name ?? 'Paket pelanggan'}</dd>
            </div>
            <div>
              <dt className="text-dd-muted">Sumber booking</dt>
              <dd className="font-semibold">{sourceLabels[booking.source] ?? 'Sumber tercatat'}</dd>
            </div>
            <div>
              <dt className="text-dd-muted">Dibuat</dt>
              <dd className="font-semibold">{formatDate(booking.createdAt, timezone)}</dd>
            </div>
          </dl>
        </Panel>
        <Panel className="p-5">
          <CalendarDays className="size-6 text-dd-forest" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold">Kelas dan kehadiran</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-dd-muted">Jadwal</dt>
              <dd className="font-semibold">
                {booking.classSlot
                  ? formatDate(booking.classSlot.startAt, timezone)
                  : 'Jadwal tidak tersedia'}
              </dd>
            </div>
            <div>
              <dt className="text-dd-muted">Status kelas</dt>
              <dd className="font-semibold">{booking.classSlot?.status ?? 'Tidak tersedia'}</dd>
            </div>
            <div>
              <dt className="text-dd-muted">Kehadiran</dt>
              <dd className="font-semibold">
                {booking.attendance
                  ? `Tercatat ${formatDate(booking.attendance.checkedInAt, timezone)}`
                  : 'Belum tercatat'}
              </dd>
            </div>
            <div>
              <dt className="text-dd-muted">QR check-in</dt>
              <dd className="font-semibold">
                {booking.checkInToken?.status === 'ACTIVE'
                  ? `Aktif sampai ${formatDate(booking.checkInToken.expiresAt, timezone)}`
                  : booking.checkInToken?.status === 'USED'
                    ? 'Sudah digunakan'
                    : booking.checkInToken?.status === 'REVOKED'
                      ? 'Dicabut'
                      : 'Belum diterbitkan'}
              </dd>
            </div>
          </dl>
          {booking.status === 'BOOKED' && context?.hasCapability('attendance:manage') && (
            <Button
              className="mt-5"
              leadingIcon={<QrCode className="size-4" aria-hidden="true" />}
              disabled={!canManageAttendance || busy}
              onClick={issueQr}
            >
              Buat/Kirim QR
            </Button>
          )}
          {issue?.whatsappUrl && (
            <a
              className="mt-3 inline-flex min-h-10 items-center rounded-dd-md border border-dd-line px-4 text-sm font-semibold text-dd-forest no-underline"
              href={issue.whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              Buka WhatsApp
            </a>
          )}
        </Panel>
      </div>

      <Panel className="p-5">
        <h2 className="text-lg font-semibold">Riwayat reschedule</h2>
        {booking.reschedules?.length ? (
          <ol className="mt-4 grid gap-3">
            {booking.reschedules.map((item) => (
              <li
                key={item.id}
                className="rounded-dd-md border border-dd-line bg-dd-surface-muted p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{item.status === 'PENDING' ? 'Menunggu keputusan' : item.status}</strong>
                  <span className="text-xs text-dd-muted">
                    {formatDate(item.requestedAt, timezone)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-dd-muted">
                  {formatDate(item.sourceClassSlot.startAt, timezone)} →{' '}
                  {formatDate(item.targetClassSlot.startAt, timezone)}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-dd-muted">Belum ada pengajuan reschedule.</p>
        )}
      </Panel>
    </section>
  );
}
