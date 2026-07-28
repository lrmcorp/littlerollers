'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  bookingFailure,
  browserBookingClient,
  type CustomerBookingRecord,
  type BookingClient,
} from '../booking-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';

const statusLabels: Record<string, string> = {
  BOOKED: 'Terjadwal',
  RESCHEDULE_PENDING: 'Perubahan jadwal diproses',
  CANCELLED: 'Dibatalkan',
  ATTENDED: 'Hadir',
  NO_SHOW: 'Tidak hadir',
};

export function CustomerBookingsView({
  client = browserBookingClient,
}: {
  client?: BookingClient;
}) {
  const [items, setItems] = useState<CustomerBookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    client
      .list({})
      .then(({ items: result }) => setItems(result))
      .catch(async (error) => setMessage(await bookingFailure(error)))
      .finally(() => setLoading(false));
  }, [client]);

  return (
    <section aria-labelledby="customer-bookings-title">
      <PageHeader
        eyebrow="Booking saya"
        title="Jadwal latihan Anda"
        titleId="customer-bookings-title"
        description="Lihat booking aktif dan riwayat kelas yang dibuat menggunakan akun Anda."
        context={<Link href="/classes#schedule">Booking kelas baru</Link>}
      />
      {loading ? (
        <Skeleton label="Memuat booking customer" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada booking"
          description="Pilih kelas dari jadwal untuk membuat booking pertama Anda."
        />
      ) : (
        <div className="customer-booking-list">
          {items.map((item) => (
            <Link
              href={`/bookings/${encodeURIComponent(item.id)}`}
              className="rounded-dd-xl border border-dd-line bg-white p-5 text-dd-ink no-underline shadow-dd-card"
              key={item.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="block text-base">
                    {item.classSlot?.classType.name ?? 'Kelas Daily Dose'}
                  </strong>
                  <span className="mt-1 block text-xs text-dd-muted">
                    {item.branch?.name ?? 'Studio Daily Dose'}
                  </span>
                </div>
                <StatusBadge tone={item.status === 'BOOKED' ? 'success' : 'neutral'}>
                  {statusLabels[item.status] ?? 'Status booking'}
                </StatusBadge>
              </div>
              <time className="mt-5 block text-sm font-semibold text-dd-forest">
                {item.classSlot
                  ? item.classSlot.startAt.toLocaleString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: item.classSlot.timezone,
                    })
                  : `Dibuat ${item.createdAt.toLocaleString('id-ID')}`}
              </time>
              <span className="mt-4 block text-xs font-semibold text-dd-forest">
                Lihat detail →
              </span>
            </Link>
          ))}
        </div>
      )}
      {message && <Feedback kind="error">{message}</Feedback>}
    </section>
  );
}
