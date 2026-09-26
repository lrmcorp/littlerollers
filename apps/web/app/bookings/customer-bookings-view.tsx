'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  bookingFailure,
  browserBookingClient,
  type CustomerBookingRecord,
  type BookingClient,
} from '@/api-clients/booking-client';
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
          <div className="customer-booking-list space-y-4">
            {items.map((item, index) => {
              const availablePlaces =
                item.classSlot?.capacity !== undefined && item.classSlot?.bookedCount !== undefined
                  ? Math.max(0, item.classSlot.capacity - item.classSlot.bookedCount)
                  : undefined;
              return (
                <Link
                  href={`/bookings/${encodeURIComponent(item.id)}`}
                  className="block rounded-dd-xl border border-dd-line bg-white p-5 text-dd-ink no-underline shadow-dd-card hover:border-dd-forest/40 transition-colors"
                  key={item.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-dd-surface-muted text-xs font-bold text-dd-muted mt-0.5">
                        #{cursorHistory.length * 20 + index + 1}
                      </span>
                      <div>
                        <strong className="block text-lg font-semibold text-dd-ink">
                          {item.classSlot?.classType.name ?? 'Kelas Daily Dose'}
                        </strong>
                        <span className="mt-1 block text-xs text-dd-muted">
                          {item.classSlot?.studio?.name
                            ? `${item.classSlot.studio.name} · ${item.branch?.name}`
                            : (item.branch?.name ?? 'Studio Daily Dose')}
                        </span>
                      </div>
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

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 rounded-dd-lg bg-dd-surface-muted p-3.5 text-xs text-dd-muted">
                    <div>
                      <span className="block text-[11px] uppercase tracking-wider font-semibold text-dd-forest">
                        Waktu Sesi
                      </span>
                      <strong className="mt-0.5 block text-xs font-semibold text-dd-ink">
                        {item.classSlot
                          ? item.classSlot.startAt.toLocaleString('id-ID', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: item.classSlot.timezone,
                            })
                          : `Dibuat ${item.createdAt.toLocaleString('id-ID')}`}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-[11px] uppercase tracking-wider font-semibold text-dd-forest">
                        Instruktur
                      </span>
                      <strong className="mt-0.5 block text-xs font-semibold text-dd-ink truncate">
                        {item.classSlot?.instructor?.displayName ?? 'Tim Daily Dose'}
                      </strong>
                    </div>

                    <div>
                      <span className="block text-[11px] uppercase tracking-wider font-semibold text-dd-forest">
                        Ketersediaan Slot
                      </span>
                      <strong className="mt-0.5 block text-xs font-semibold text-dd-ink">
                        {item.classSlot?.capacity
                          ? `${item.classSlot.bookedCount ?? 1}/${item.classSlot.capacity} terisi (${availablePlaces ?? 0} sisa tempat)`
                          : 'Tersedia'}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-dd-muted pt-2 border-t border-dd-line/50">
                    <span className="truncate max-w-xs sm:max-w-md">
                      Paket: <strong className="font-medium text-dd-ink">{item.package?.name ?? 'Paket Customer'}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-dd-forest shrink-0">
                      <span>Lihat detail & QR Pass</span>
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-5">
            <Pagination
              hasPrevious={cursorHistory.length > 0 && !loading}
              hasNext={Boolean(nextCursor) && !loading}
              totalLabel={`${items.length.toLocaleString('id-ID')} dari ${total.toLocaleString('id-ID')} booking`}
              currentPage={cursorHistory.length + 1}
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
