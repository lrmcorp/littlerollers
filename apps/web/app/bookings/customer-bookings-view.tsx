'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  bookingFailure,
  browserBookingClient,
  type CustomerBookingRecord,
  type BookingClient,
} from '../booking-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { ButtonLink } from '../components/actions';
import { Pagination } from '../components/admin/admin-ui';

const statusLabels: Record<string, string> = {
  BOOKED: 'Terjadwal',
  RESCHEDULE_PENDING: 'Perubahan jadwal diproses',
  CANCELLED: 'Dibatalkan',
  ATTENDED: 'Hadir',
  NO_SHOW: 'Tidak hadir',
};

const statusTones = {
  BOOKED: 'success',
  RESCHEDULE_PENDING: 'warning',
  CANCELLED: 'danger',
  ATTENDED: 'success',
  NO_SHOW: 'danger',
} as const;

export function CustomerBookingsView({
  client = browserBookingClient,
}: {
  client?: BookingClient;
}) {
  const [items, setItems] = useState<CustomerBookingRecord[]>([]);
  const [timeline, setTimeline] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [cursor, setCursor] = useState<string>();
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [total, setTotal] = useState(0);

  const loadPage = useCallback(
    async (pageCursor?: string) => {
      setLoading(true);
      setMessage('');
      try {
        const page = await client.list({ timeline, cursor: pageCursor, limit: 20 });
        setItems(page.items);
        setNextCursor(page.nextCursor);
        setTotal(page.summary?.total ?? page.items.length);
        setCursor(pageCursor);
        return true;
      } catch (error) {
        setMessage(await bookingFailure(error));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [client, timeline],
  );

  useEffect(() => {
    setCursorHistory([]);
    void loadPage();
  }, [loadPage]);

  return (
    <section aria-labelledby="customer-bookings-title">
      <PageHeader
        eyebrow="Booking saya"
        title="Jadwal latihan Anda"
        titleId="customer-bookings-title"
        description="Lihat booking aktif dan riwayat kelas yang dibuat menggunakan akun Anda."
        context={<ButtonLink href="/classes#schedule">Booking kelas baru</ButtonLink>}
      />
      <div
        className="my-5 inline-flex rounded-dd-md border border-dd-line bg-white p-1"
        role="tablist"
        aria-label="Linimasa booking"
      >
        {(['UPCOMING', 'HISTORY'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={timeline === value}
            className={`min-h-10 rounded-dd-sm px-4 text-sm font-semibold transition ${
              timeline === value
                ? 'bg-dd-forest text-white'
                : 'bg-transparent text-dd-muted hover:bg-dd-surface-muted hover:text-dd-ink'
            }`}
            onClick={() => setTimeline(value)}
          >
            {value === 'UPCOMING' ? 'Mendatang' : 'Riwayat'}
          </button>
        ))}
      </div>
      {loading ? (
        <Skeleton label="Memuat booking customer" />
      ) : items.length === 0 ? (
        <EmptyState
          title={
            timeline === 'UPCOMING' ? 'Belum ada jadwal mendatang' : 'Belum ada riwayat booking'
          }
          description={
            timeline === 'UPCOMING'
              ? 'Pilih kelas dari jadwal untuk membuat booking berikutnya.'
              : 'Booking yang selesai atau dibatalkan akan tampil di sini.'
          }
        />
      ) : (
        <>
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
                  <StatusBadge
                    tone={statusTones[item.status as keyof typeof statusTones] ?? 'neutral'}
                  >
                    {item.status === 'BOOKED' &&
                    item.classSlot &&
                    item.classSlot.endAt.getTime() < Date.now()
                      ? 'Status kehadiran sedang diproses'
                      : (statusLabels[item.status] ?? 'Status booking')}
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
          <div className="mt-5">
            <Pagination
              hasPrevious={cursorHistory.length > 0 && !loading}
              hasNext={Boolean(nextCursor) && !loading}
              totalLabel={`Halaman ${cursorHistory.length + 1} · ${items.length.toLocaleString('id-ID')} data dari ${total.toLocaleString('id-ID')} booking`}
              onPrevious={() => {
                const previous = cursorHistory.at(-1) ?? '';
                void loadPage(previous || undefined).then((loaded) => {
                  if (loaded) setCursorHistory((current) => current.slice(0, -1));
                });
              }}
              onNext={() => {
                if (!nextCursor) return;
                void loadPage(nextCursor).then((loaded) => {
                  if (loaded) setCursorHistory((current) => [...current, cursor ?? '']);
                });
              }}
            />
          </div>
        </>
      )}
      {message && <Feedback kind="error">{message}</Feedback>}
    </section>
  );
}
