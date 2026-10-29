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
  BOOKED: 'Booked',
  RESCHEDULE_PENDING: 'Reschedule requested',
  CANCELLED: 'Cancelled',
  ATTENDED: 'Attended',
  NO_SHOW: 'Missed',
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
        variant="customer"
        eyebrow="Bookings"
        title="Your sessions"
        titleId="customer-bookings-title"
        description="Upcoming bookings and past sessions on your account."
        context={<ButtonLink href="/classes#schedule">Book a session</ButtonLink>}
      />
      <div
        className="my-5 inline-flex rounded-full border border-dd-line bg-white p-1"
        role="tablist"
        aria-label="Bookings timeline"
      >
        {(['UPCOMING', 'HISTORY'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={timeline === value}
            className={`min-h-10 rounded-full px-5 text-sm font-semibold transition ${
              timeline === value
                ? 'bg-dd-forest text-white'
                : 'bg-transparent text-dd-muted hover:bg-dd-surface-muted hover:text-dd-ink'
            }`}
            onClick={() => setTimeline(value)}
          >
            {value === 'UPCOMING' ? 'Upcoming' : 'Past'}
          </button>
        ))}
      </div>
      {loading ? (
        <Skeleton label="Loading your bookings" />
      ) : items.length === 0 ? (
        <EmptyState
          title={timeline === 'UPCOMING' ? 'No upcoming sessions' : 'No past sessions yet'}
          description={
            timeline === 'UPCOMING'
              ? 'Pick a session from the timetable to book your next one.'
              : 'Finished and cancelled bookings will show here.'
          }
        />
      ) : (
        <>
          <div className="customer-booking-list">
            {items.map((item) => (
              <Link
                href={`/bookings/${encodeURIComponent(item.id)}`}
                className="rounded-[22px] border border-dd-line bg-white p-5 text-dd-ink no-underline transition hover:-translate-y-0.5 hover:border-dd-forest motion-reduce:transform-none"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block font-display text-xl text-dd-forest">
                      {item.classSlot?.classType.name ?? 'Session'}
                    </strong>
                    <span className="mt-1 block text-sm text-dd-muted">
                      {item.branch?.name ?? 'Little Rollers'} ·{' '}
                      {(item.sessionDurationMinutes ?? 60) >= 120 ? '2 hours' : '1 hour'}
                    </span>
                  </div>
                  <StatusBadge
                    tone={statusTones[item.status as keyof typeof statusTones] ?? 'neutral'}
                  >
                    {item.status === 'BOOKED' &&
                    item.classSlot &&
                    item.classSlot.endAt.getTime() < Date.now()
                      ? 'Attendance being recorded'
                      : (statusLabels[item.status] ?? 'Booking')}
                  </StatusBadge>
                </div>
                <time className="mt-5 block text-sm font-semibold text-dd-forest">
                  {item.classSlot
                    ? item.classSlot.startAt.toLocaleString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: item.classSlot.timezone,
                      })
                    : `Booked ${item.createdAt.toLocaleString('en-GB')}`}
                </time>
                <span className="mt-4 block text-sm font-semibold text-dd-forest">
                  Details and QR pass
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-5">
            <Pagination
              hasPrevious={cursorHistory.length > 0 && !loading}
              hasNext={Boolean(nextCursor) && !loading}
              totalLabel={`Page ${cursorHistory.length + 1} · ${items.length} of ${total} bookings`}
              labels={{ navigation: 'Pages', previous: 'Previous', next: 'Next' }}
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
