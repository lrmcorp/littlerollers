'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  bookingFailure,
  browserBookingClient,
  type CustomerBookingRecord,
} from '../../booking-client';
import { AlertBanner } from '../../components/app-feedback';
import { ButtonLink } from '../../components/actions';
import { Skeleton } from '../../ui';

const statusLabels: Record<string, string> = {
  BOOKED: 'Terjadwal',
  RESCHEDULE_PENDING: 'Perubahan jadwal diproses',
  CANCELLED: 'Dibatalkan',
  ATTENDED: 'Hadir',
  NO_SHOW: 'Tidak hadir',
};

export function BookingDetailView({ id }: { id: string }) {
  const [booking, setBooking] = useState<CustomerBookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    browserBookingClient
      .detail(id)
      .then(setBooking)
      .catch(async (cause) => setError(await bookingFailure(cause)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <section className="rounded-dd-xl border border-dd-line bg-white p-6">
        <Skeleton label="Memuat detail booking" />
      </section>
    );
  if (!booking)
    return (
      <section className="rounded-dd-xl border border-dd-line bg-white p-6">
        <h1 className="text-2xl font-semibold">Booking tidak tersedia</h1>
        {error && (
          <div className="mt-4">
            <AlertBanner tone="danger" title="Detail belum dapat dimuat" message={error} />
          </div>
        )}
        <ButtonLink href="/bookings" className="mt-5">
          Kembali
        </ButtonLink>
      </section>
    );

  return (
    <main className="space-y-6" aria-labelledby="booking-detail-title">
      <header>
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-dd-forest no-underline"
        >
          <ArrowLeft className="size-4" />
          Booking Saya
        </Link>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
          Detail booking
        </p>
        <h1 id="booking-detail-title" className="mt-2 text-2xl font-semibold sm:text-3xl">
          {booking.classSlot?.classType.name ?? 'Kelas Daily Dose'}
        </h1>
        <p className="mt-2 text-sm text-dd-muted">
          {statusLabels[booking.status] ?? 'Status booking'} · Booking •{booking.id.slice(-8)}
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card">
          <CalendarDays className="size-6 text-dd-forest" />
          <h2 className="mt-4 text-lg font-semibold">Waktu kelas</h2>
          <p className="mt-2 text-sm leading-6 text-dd-muted">
            {booking.classSlot
              ? booking.classSlot.startAt.toLocaleString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: booking.classSlot.timezone,
                })
              : 'Jadwal tidak tersedia'}
          </p>
        </article>
        <article className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card">
          <MapPin className="size-6 text-dd-forest" />
          <h2 className="mt-4 text-lg font-semibold">Studio dan paket</h2>
          <p className="mt-2 text-sm leading-6 text-dd-muted">
            {booking.branch?.name ?? 'Studio Daily Dose'}
            <br />
            {booking.package?.name ?? 'Paket customer'}
          </p>
        </article>
      </section>
      {booking.attendance && (
        <AlertBanner
          tone="success"
          title="Kehadiran tercatat"
          message={`Check-in pada ${booking.attendance.checkedInAt.toLocaleString('id-ID')}.`}
        />
      )}
      {booking.status === 'BOOKED' && (
        <AlertBanner
          tone="info"
          title="Siap untuk kelas"
          message="Datang lebih awal dan tunjukkan QR check-in yang dikirim oleh studio."
        />
      )}
    </main>
  );
}
