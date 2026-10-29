'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarCheck2, CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  browserBookingClient,
  customerBookingFailure,
  type Booking,
  type BookingClient,
  type CustomerBookingOptions,
} from '../../booking-client';
import { EmptyState, Feedback, Skeleton } from '../../ui';
import { Button } from '../../components/actions';

const dateLabel = (value: Date, timezone: string) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: timezone }).format(value);

const timeLabel = (value: Date, timezone: string) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: timezone,
  }).format(value);

const eligibilityCopy = {
  IDENTITY_VERIFICATION_REQUIRED: {
    title: 'Identity check needed',
    description: 'We need to approve your selfie and KTP before you can book sessions.',
  },
  MATCHING_PACKAGE_REQUIRED: {
    title: 'You need a package for this class',
    description: 'You have no active package for this club and class yet.',
  },
  INSUFFICIENT_AVAILABLE_SESSION: {
    title: 'No sessions left to book',
    description: 'Your matching packages are used up or already booked.',
  },
  SLOT_FULL: {
    title: 'This session is full',
    description: 'Pick another session from the timetable.',
  },
  SLOT_UNAVAILABLE: {
    title: 'This session is not open',
    description: 'The session changed and can no longer be booked.',
  },
  BOOKING_CUTOFF_PASSED: {
    title: 'Booking has closed',
    description: 'Contact your club if you need help with this session.',
  },
} as const;

type Length = 60 | 120;

const createIntent = () => ({ signature: '', key: crypto.randomUUID() });

export function lengthLabel(minutes: number) {
  return minutes >= 120 ? '2 hours' : '1 hour';
}

/** Lengths that fit this slot: a 1-hour session uses the first hour of a longer block. */
export function lengthsForSlot(slot: { startAt: Date; endAt: Date }): Length[] {
  const minutes = (slot.endAt.getTime() - slot.startAt.getTime()) / 60_000;
  return ([60, 120] as const).filter((length) => length <= minutes);
}

export function CustomerBookingFlow({ client = browserBookingClient }: { client?: BookingClient }) {
  const [options, setOptions] = useState<CustomerBookingOptions | null>(null);
  const [length, setLength] = useState<Length | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [step, setStep] = useState<'select' | 'review'>('select');
  const [status, setStatus] = useState<'loading' | 'ready' | 'submitting' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const intent = useRef(createIntent());

  useEffect(() => {
    const slot = new URLSearchParams(window.location.search).get('slot');
    if (!slot) {
      setStatus('ready');
      return;
    }
    client
      .options(slot)
      .then((result) => {
        setOptions(result);
        // Start on the length the parent already owns; 2 hours if they own both.
        const owned = new Set(result.packages.map((item) => item.sessionDurationMinutes ?? 60));
        const initial: Length | null = owned.has(120) ? 120 : owned.has(60) ? 60 : null;
        setLength(initial);
        setSelectedPackageId(
          result.packages.find((item) => (item.sessionDurationMinutes ?? 60) === initial)?.id ??
            '',
        );
        setStatus('ready');
      })
      .catch(async (error) => {
        setMessage(await customerBookingFailure(error));
        setStatus('error');
      });
  }, [client]);

  if (status === 'loading') return <Skeleton label="Loading booking options" />;
  if (!options)
    return (
      <section className="space-y-5">
        <EmptyState
          title={status === 'error' ? 'This session could not open' : 'Pick a session first'}
          description={message || 'Open the timetable and choose the session you want to book.'}
        />
        <div className="flex flex-wrap gap-3">
          <Link className="customer-card-action" href="/classes#schedule">
            Back to the timetable
          </Link>
          {status === 'error' && (
            <Link className="customer-card-action" href="/contact">
              Contact the club
            </Link>
          )}
        </div>
      </section>
    );

  const { slot } = options;
  const lengths = lengthsForSlot(slot);
  const packagesForLength = options.packages.filter(
    (item) => (item.sessionDurationMinutes ?? 60) === length,
  );
  const selectedPackage = options.packages.find(({ id }) => id === selectedPackageId);
  const sessionEnd = length ? new Date(slot.startAt.getTime() + length * 60_000) : slot.endAt;
  const purchaseUrl = `/packages?branch=${encodeURIComponent(slot.branchId)}&classType=${encodeURIComponent(slot.classTypeId)}&slot=${encodeURIComponent(slot.id)}`;
  const eligibility = options.eligibility;
  const eligibilityMessage = eligibility.reasonCode
    ? eligibilityCopy[eligibility.reasonCode]
    : null;

  const chooseLength = (value: Length) => {
    setLength(value);
    const first = options.packages.find((item) => (item.sessionDurationMinutes ?? 60) === value);
    setSelectedPackageId(first?.id ?? '');
    intent.current = createIntent();
  };

  return (
    <section className="grid gap-6" aria-labelledby="customer-booking-title">
      <header className="rounded-[22px] bg-dd-forest p-6 text-dd-cream sm:p-8">
        <p className="font-display text-lg text-lr-sun">{slot.branch.name}</p>
        <h1 className="mt-1 font-display text-[clamp(2rem,4vw,3rem)] leading-none" id="customer-booking-title">
          {slot.classType.name}
        </h1>
        <p className="mt-3 text-dd-cream/85">
          {dateLabel(slot.startAt, slot.timezone)} · block {timeLabel(slot.startAt, slot.timezone)}
          {' to '}
          {timeLabel(slot.endAt, slot.timezone)}
        </p>
        <p className="mt-1 text-sm text-dd-cream/85">
          {slot.available === 1 ? '1 place left' : `${slot.available} places left`}
        </p>
      </header>

      {!eligibility.canBook && eligibilityMessage ? (
        <div className="rounded-[15px] border border-dd-line bg-white p-5">
          <Feedback kind="warning">
            <strong className="block text-dd-ink">{eligibilityMessage.title}</strong>
            <span className="mt-1 block">{eligibilityMessage.description}</span>
          </Feedback>
          <div className="mt-4 flex flex-wrap gap-3">
            {eligibility.requiredAction === 'COMPLETE_IDENTITY_VERIFICATION' && (
              <Link className="customer-card-action" href="/account/verification">
                Finish verification
              </Link>
            )}
            {eligibility.requiredAction === 'BUY_MATCHING_PACKAGE' && (
              <Link className="customer-card-action" href={purchaseUrl}>
                See packages for this class
              </Link>
            )}
            {eligibility.requiredAction === 'CONTACT_STUDIO' && (
              <Link className="customer-card-action" href="/contact">
                Contact the club
              </Link>
            )}
            <Link className="customer-card-action" href="/classes#schedule">
              Pick another session
            </Link>
          </div>
        </div>
      ) : booking ? (
        <section className="rounded-[22px] bg-lr-sun-soft p-6 sm:p-8" aria-live="polite">
          <CheckCircle2 className="size-9 text-dd-forest" aria-hidden="true" />
          <h2 className="mt-3 font-display text-3xl text-dd-forest">You are booked in</h2>
          <p className="mt-2 leading-7 text-dd-ink">
            {slot.classType.name} at {slot.branch.name},{' '}
            {dateLabel(slot.startAt, slot.timezone)},{' '}
            {timeLabel(slot.startAt, slot.timezone)} to {timeLabel(sessionEnd, slot.timezone)} (
            {lengthLabel(length ?? 60)}).
          </p>
          <dl className="mt-5 grid gap-3 rounded-[15px] bg-white p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-dd-muted">Booking reference</dt>
              <dd className="mt-1 font-semibold">•{booking.id.slice(-8)}</dd>
            </div>
            <div>
              <dt className="text-dd-muted">Sessions left on the package</dt>
              <dd className="mt-1 font-semibold">{selectedPackage?.projectedAvailable ?? 0}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="customer-card-action" href={`/bookings/${booking.id}`}>
              Booking details
            </Link>
            <Link className="customer-card-action" href="/classes#schedule">
              Back to the timetable
            </Link>
          </div>
        </section>
      ) : (
        <form
          className="grid gap-6"
          aria-label="Book this session"
          onSubmit={(event) => {
            event.preventDefault();
            if (!selectedPackageId) return;
            if (step === 'select') {
              setStep('review');
              return;
            }
            setStatus('submitting');
            setMessage('');
            const signature = `${slot.id}:${selectedPackageId}`;
            if (intent.current.signature !== signature) {
              intent.current = { signature, key: crypto.randomUUID() };
            }
            void client
              .create(
                { classSlotId: slot.id, customerPackageId: selectedPackageId, source: 'SELF' },
                intent.current.key,
              )
              .then((result) => {
                setBooking(result);
                setStatus('ready');
              })
              .catch(async (error) => {
                setMessage(await customerBookingFailure(error));
                setStatus('error');
              });
          }}
        >
          <ol className="m-0 grid list-none grid-cols-2 gap-2 p-0 text-sm" aria-label="Steps">
            <li
              aria-current={step === 'select' ? 'step' : undefined}
              className={`rounded-full px-4 py-2 font-semibold ${step === 'select' ? 'bg-dd-forest text-white' : 'bg-lr-sky text-dd-forest'}`}
            >
              1. Length and package
            </li>
            <li
              aria-current={step === 'review' ? 'step' : undefined}
              className={`rounded-full px-4 py-2 font-semibold ${step === 'review' ? 'bg-dd-forest text-white' : 'bg-white text-dd-muted'}`}
            >
              2. Check and confirm
            </li>
          </ol>

          {step === 'select' ? (
            <>
              <fieldset className="m-0 grid gap-3 border-0 p-0">
                <legend className="mb-3 font-display text-2xl text-dd-forest">
                  How long will your child stay?
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {lengths.map((value) => {
                    const owned = options.packages.filter(
                      (item) => (item.sessionDurationMinutes ?? 60) === value,
                    );
                    const end = new Date(slot.startAt.getTime() + value * 60_000);
                    const selected = length === value;
                    return (
                      <label
                        key={value}
                        className={`flex min-h-24 cursor-pointer items-start gap-3 rounded-[15px] border-2 p-4 ${
                          selected ? 'border-dd-forest bg-white' : 'border-dd-line bg-white/70'
                        }`}
                      >
                        <input
                          type="radio"
                          name="sessionLength"
                          className="mt-1 size-5 accent-dd-forest"
                          checked={selected}
                          onChange={() => chooseLength(value)}
                        />
                        <span className="grid gap-1">
                          <strong className="flex items-center gap-2 font-display text-xl text-dd-forest">
                            <Clock className="size-5" aria-hidden="true" />
                            {lengthLabel(value)}
                          </strong>
                          <span className="text-sm">
                            {timeLabel(slot.startAt, slot.timezone)} to{' '}
                            {timeLabel(end, slot.timezone)}
                          </span>
                          <span className="text-sm text-dd-muted">
                            {owned.length
                              ? `${owned.length} ${owned.length === 1 ? 'package' : 'packages'} you can use`
                              : `No ${lengthLabel(value)} package yet`}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {length && (
                <fieldset className="m-0 grid gap-3 border-0 p-0">
                  <legend className="mb-3 font-display text-2xl text-dd-forest">
                    Which package pays for it?
                  </legend>
                  {packagesForLength.length === 0 ? (
                    <div className="rounded-[15px] border border-dd-line bg-white p-5">
                      <p className="m-0">
                        You have no {lengthLabel(length)} package for this class. Packages are sold
                        per length, so a {lengthLabel(length)} session needs a{' '}
                        {lengthLabel(length)} package.
                      </p>
                      <Link className="customer-card-action mt-4" href={purchaseUrl}>
                        Buy a {lengthLabel(length)} package
                      </Link>
                    </div>
                  ) : (
                    packagesForLength.map((item) => (
                      <label
                        className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-[15px] border-2 bg-white p-4 ${
                          selectedPackageId === item.id ? 'border-dd-forest' : 'border-dd-line'
                        }`}
                        key={item.id}
                      >
                        <input
                          className="mt-1 size-5 accent-dd-forest"
                          type="radio"
                          name="customerPackageId"
                          value={item.id}
                          checked={selectedPackageId === item.id}
                          onChange={() => {
                            setSelectedPackageId(item.id);
                            intent.current = createIntent();
                          }}
                        />
                        <span className="grid gap-1">
                          <strong>{item.name}</strong>
                          <small className="text-sm text-dd-muted">
                            {item.available} left · {item.projectedAvailable} after this booking ·
                            valid until {item.expiryAt.toLocaleDateString('en-GB')}
                          </small>
                        </span>
                      </label>
                    ))
                  )}
                </fieldset>
              )}

              <Button
                disabled={!selectedPackageId}
                type="submit"
                trailingIcon={<CalendarCheck2 className="size-4" aria-hidden="true" />}
              >
                Check booking
              </Button>
            </>
          ) : (
            <section
              className="rounded-[22px] bg-lr-sky p-5 sm:p-6"
              aria-labelledby="booking-review-title"
            >
              <h2 className="m-0 font-display text-2xl text-dd-forest" id="booking-review-title">
                Check your booking
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-dd-ink/75">Class and club</dt>
                  <dd className="m-0 font-semibold">
                    {slot.classType.name} · {slot.branch.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-dd-ink/75">When</dt>
                  <dd className="m-0 font-semibold">
                    {dateLabel(slot.startAt, slot.timezone)},{' '}
                    {timeLabel(slot.startAt, slot.timezone)} to {timeLabel(sessionEnd, slot.timezone)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-dd-ink/75">Length</dt>
                  <dd className="m-0 font-semibold">{lengthLabel(length ?? 60)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dd-ink/75">Package</dt>
                  <dd className="m-0 font-semibold">
                    {selectedPackage?.name} ({selectedPackage?.available} →{' '}
                    {selectedPackage?.projectedAvailable} left)
                  </dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-dd-forest/15 pt-3 text-sm">
                This uses one session from the package. You can ask to reschedule up to 24 hours
                before the session.
              </p>
              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={status === 'submitting'}
                  leadingIcon={<ArrowLeft className="size-4" aria-hidden="true" />}
                  onClick={() => setStep('select')}
                >
                  Change length or package
                </Button>
                <Button
                  disabled={status === 'submitting'}
                  loading={status === 'submitting'}
                  loadingLabel="Booking…"
                  type="submit"
                  leadingIcon={<CalendarCheck2 className="size-4" aria-hidden="true" />}
                >
                  Confirm booking
                </Button>
              </div>
            </section>
          )}
        </form>
      )}

      {message && <Feedback kind="error">{message}</Feedback>}
      {!booking && (
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-dd-forest no-underline hover:underline"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Need help? Contact the club
        </Link>
      )}
    </section>
  );
}
