'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  customerBookingFailure,
  bookingProblem,
  browserBookingClient,
  type BookingClient,
  type BookingProblem,
  type CustomerBookingRecord,
  type CustomerRescheduleOptions,
} from '../../booking-client';
import { AlertBanner } from '../../components/app-feedback';
import { Button, ButtonLink } from '../../components/actions';
import { SearchSelect, SelectInput } from '../../components/forms';
import { useSessionContext } from '../../session-context';
import { isCustomerOnlySession } from '../../session-audience';
import { Skeleton } from '../../ui';

const statusLabels: Record<string, string> = {
  BOOKED: 'Booked',
  RESCHEDULE_PENDING: 'Reschedule requested',
  CANCELLED: 'Cancelled',
  ATTENDED: 'Attended',
  NO_SHOW: 'Missed',
};

const reasonLabels = {
  PERSONAL_UNAVAILABLE: 'We cannot make the original time',
  CUSTOMER_SCHEDULE_CONFLICT: 'It clashes with something else',
  WRONG_CLASS_SELECTED: 'I booked the wrong session',
} as const;

const dateTime = (value: Date, timezone: string) =>
  value.toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

const newIntentKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `reschedule-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function BookingDetailView({
  id,
  client = browserBookingClient,
}: {
  id: string;
  client?: BookingClient;
}) {
  const context = useSessionContext();
  const canLoadReschedule =
    context === null ||
    (context.status === 'authenticated' &&
      isCustomerOnlySession(context.session) &&
      context.hasCapability('reschedule:self:read'));
  const [booking, setBooking] = useState<CustomerBookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailError, setDetailError] = useState('');
  const [rescheduleUnavailable, setRescheduleUnavailable] = useState<BookingProblem | null>(null);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [mutationError, setMutationError] = useState('');
  const [options, setOptions] = useState<CustomerRescheduleOptions | null>(null);
  const [targetId, setTargetId] = useState('');
  const [reasonCode, setReasonCode] = useState<keyof typeof reasonLabels>('PERSONAL_UNAVAILABLE');
  const [showForm, setShowForm] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState('');
  const intentKey = useRef(newIntentKey());

  const loadRescheduleOptions = useCallback(async () => {
    if (!canLoadReschedule) {
      setOptions(null);
      setRescheduleUnavailable(null);
      return;
    }
    setRescheduleLoading(true);
    setRescheduleUnavailable(null);
    try {
      const optionResult = await client.rescheduleOptions(id);
      setOptions(optionResult);
      setTargetId(optionResult.targets[0]?.id ?? '');
    } catch (cause) {
      setOptions(null);
      setTargetId('');
      setRescheduleUnavailable(await bookingProblem(cause));
    } finally {
      setRescheduleLoading(false);
    }
  }, [canLoadReschedule, client, id]);

  const load = useCallback(async () => {
    setLoading(true);
    setDetailError('');
    setMutationError('');
    try {
      const bookingResult = await client.detail(id);
      setBooking(bookingResult);
      await loadRescheduleOptions();
    } catch (cause) {
      setBooking(null);
      setOptions(null);
      setRescheduleUnavailable(null);
      setDetailError(await customerBookingFailure(cause));
    } finally {
      setLoading(false);
    }
  }, [client, id, loadRescheduleOptions]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading)
    return (
      <section className="rounded-[22px] bg-white p-6">
        <Skeleton label="Loading booking" />
      </section>
    );
  if (!booking)
    return (
      <section className="rounded-[22px] bg-white p-6">
        <h1 className="m-0 font-display text-2xl text-dd-forest">Booking not available</h1>
        {detailError && (
          <div className="mt-4">
            <AlertBanner tone="danger" title="This booking did not load" message={detailError} />
          </div>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/bookings">Back to bookings</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact the club
          </ButtonLink>
        </div>
      </section>
    );

  return (
    <main className="space-y-6" aria-labelledby="booking-detail-title">
      <header>
        <Link
          href="/bookings"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-dd-forest no-underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          My bookings
        </Link>
        <h1
          id="booking-detail-title"
          className="mt-3 font-display text-3xl text-dd-forest sm:text-4xl"
        >
          {booking.classSlot?.classType.name ?? 'Session'}
        </h1>
        <p className="mt-2 text-sm text-dd-muted">
          {statusLabels[booking.status] ?? 'Booking'} ·{' '}
          {(booking.sessionDurationMinutes ?? 60) >= 120 ? '2 hours' : '1 hour'} · Reference •
          {booking.id.slice(-8)}
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[22px] bg-lr-sky p-5">
          <CalendarDays className="size-6 text-dd-forest" aria-hidden="true" />
          <h2 className="mt-3 mb-0 font-display text-xl text-dd-forest">When</h2>
          <p className="mt-2 text-sm leading-6 text-dd-ink">
            {booking.classSlot
              ? booking.classSlot.startAt.toLocaleString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: booking.classSlot.timezone,
                })
              : 'Time not available'}
          </p>
        </article>
        <article className="rounded-[22px] bg-white p-5">
          <MapPin className="size-6 text-dd-forest" aria-hidden="true" />
          <h2 className="mt-3 mb-0 font-display text-xl text-dd-forest">Club and package</h2>
          <p className="mt-2 text-sm leading-6 text-dd-ink">
            {booking.branch?.name ?? 'Little Rollers'}
            <br />
            {booking.package?.name ?? 'Your package'}
          </p>
        </article>
      </section>
      {booking.attendance && (
        <AlertBanner
          tone="success"
          title="Attendance recorded"
          message={`Checked in at ${booking.attendance.checkedInAt.toLocaleString('en-GB')}.`}
        />
      )}
      {booking.status === 'BOOKED' && (
        <AlertBanner
          tone="info"
          title="All set"
          message="Arrive a little early and show the check-in QR pass the club sends you."
        />
      )}
      {rescheduleUnavailable && (
        <section className="space-y-3" aria-label="Reschedule">
          <AlertBanner
            tone="info"
            title="Rescheduling is unavailable right now"
            message="Your booking is still active. Try again, or contact the club if you need to change the time."
          />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              loading={rescheduleLoading}
              loadingLabel="Loading sessions…"
              onClick={() => void loadRescheduleOptions()}
            >
              Try again
            </Button>
            <ButtonLink href="/contact" variant="secondary">
              Contact the club
            </ButtonLink>
          </div>
        </section>
      )}
      {options?.latestRequest && (
        <AlertBanner
          tone={
            options.latestRequest.status === 'APPROVED'
              ? 'success'
              : options.latestRequest.status === 'REJECTED'
                ? 'danger'
                : 'warning'
          }
          title={
            options.latestRequest.status === 'APPROVED'
              ? 'Reschedule approved'
              : options.latestRequest.status === 'REJECTED'
                ? 'Reschedule not approved'
                : 'Reschedule being reviewed'
          }
          message={
            options.latestRequest.status === 'PENDING'
              ? 'Your place stays in the original session until the club decides.'
              : options.latestRequest.status === 'APPROVED'
                ? 'Your booking has moved to the new session.'
                : 'Your booking stays in the original session. Contact the club if you need help.'
          }
        />
      )}
      {options?.supportAction === 'CONTACT_STUDIO' && (
        <div className="space-y-3">
          <AlertBanner
            tone="warning"
            title="Reschedules have closed"
            message={`Requests closed on ${dateTime(options.cutoffAt, booking.classSlot?.timezone ?? 'Asia/Jakarta')}. Contact the club for help.`}
          />
          <ButtonLink href="/contact" variant="secondary">
            Contact the club
          </ButtonLink>
        </div>
      )}
      {rescheduleMessage && (
        <AlertBanner tone="success" title="Request sent" message={rescheduleMessage} />
      )}
      {options?.canRequest && !showForm && (
        <section className="rounded-[22px] bg-white p-5">
          <h2 className="m-0 font-display text-xl text-dd-forest">Need a different time?</h2>
          <p className="mt-2 text-sm leading-6 text-dd-muted">
            You can ask up to 24 hours before the session. Your place stays here while the club
            reviews the request.
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              setMutationError('');
              setShowForm(true);
            }}
          >
            Ask to reschedule
          </Button>
        </section>
      )}
      {showForm && options?.canRequest && (
        <form
          className="space-y-5 rounded-[22px] bg-white p-5"
          aria-label="Reschedule request"
          onSubmit={(event) => {
            event.preventDefault();
            if (!targetId) return;
            if (!confirming) {
              setConfirming(true);
              return;
            }
            setSubmitting(true);
            setMutationError('');
            void client
              .requestReschedule(
                {
                  bookingId: booking.id,
                  targetClassSlotId: targetId,
                  reasonCode,
                  expectedBookingVersion: options.bookingVersion,
                },
                intentKey.current,
              )
              .then(async () => {
                intentKey.current = newIntentKey();
                setRescheduleMessage(
                  'The club will review the new session and let you know their decision.',
                );
                setShowForm(false);
                setConfirming(false);
                await load();
              })
              .catch(async (cause) => {
                setMutationError(await customerBookingFailure(cause));
                setConfirming(false);
              })
              .finally(() => setSubmitting(false));
          }}
        >
          <div>
            <h2 className="m-0 font-display text-xl text-dd-forest">Pick the new session</h2>
            <p className="mt-1 text-sm text-dd-muted">
              Only sessions with places that fit your booking length are shown.
            </p>
          </div>
          {options.targets.length ? (
            <>
              <SearchSelect
                label="New session"
                value={targetId}
                options={options.targets.map((target) => ({
                  id: target.id,
                  label: dateTime(target.startAt, target.timezone),
                  description: `${target.availableCapacity} places left`,
                }))}
                onChange={(value) => {
                  setTargetId(value);
                  setConfirming(false);
                }}
              />
              <SelectInput
                label="Reason"
                value={reasonCode}
                onChange={(event) => {
                  setReasonCode(event.target.value as keyof typeof reasonLabels);
                  setConfirming(false);
                }}
              >
                {Object.entries(reasonLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectInput>
              {confirming && (
                <AlertBanner
                  tone="warning"
                  title="Check the change"
                  message="After you send it, the original session stays booked until the club approves."
                />
              )}
              {mutationError && (
                <AlertBanner
                  tone="danger"
                  title="We could not send the request"
                  message={mutationError}
                />
              )}
              <div className="flex flex-wrap gap-3">
                <Button type="submit" loading={submitting} loadingLabel="Sending…">
                  {confirming ? 'Send request' : 'Review request'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setConfirming(false);
                    setMutationError('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <AlertBanner
              tone="warning"
              title="No other sessions available"
              message="No session for this class and club has places left right now."
            />
          )}
        </form>
      )}
    </main>
  );
}
