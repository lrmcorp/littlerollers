'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  bookingFailure,
  browserBookingClient,
  type Booking,
  type BookingClient,
} from '../booking-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';

export function CustomerBookingsView({
  client = browserBookingClient,
}: {
  client?: BookingClient;
}) {
  const [items, setItems] = useState<Booking[]>([]);
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
            <article className="card" key={item.id}>
              <StatusBadge tone={item.status === 'BOOKED' ? 'success' : 'neutral'}>
                {item.status}
              </StatusBadge>
              <strong>Booking •{item.id.slice(-6)}</strong>
              <span>Dibuat {item.createdAt.toLocaleString('id-ID')}</span>
            </article>
          ))}
        </div>
      )}
      {message && <Feedback kind="error">{message}</Feedback>}
    </section>
  );
}
