'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  browserPublicClassCatalogClient,
  publicCatalogFailure,
  type PublicBranch,
  type PublicClassCatalogClient,
  type PublicClassSlot,
} from '../public-class-catalog-client';
import { PublicFooter } from '../components/public/public-footer';
import { PublicHeader } from '../components/public/public-header';
import { PublicPageHero, PublicSectionHeading } from '../components/public/public-page';
import {
  publicContainer,
  publicField,
  publicPrimaryButton,
  publicSecondaryButton,
} from '../components/public/public-styles';
import { useSessionContext } from '../session-context';
import { SearchSelect } from '../components/forms';
import { accountClient } from '../account-client';

function dayKey(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function dateLabel(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(value));
}

function timeLabel(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value));
}

function durationLabel(startAt: string, endAt: string) {
  const minutes = Math.max(
    0,
    Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60_000),
  );
  if (minutes > 0 && minutes % 60 === 0) return minutes === 60 ? '1-hour block' : `${minutes / 60}-hour block`;
  return `${minutes} min`;
}

/** Which package lengths fit a slot: 1-hour packages use the first hour of a longer block. */
function lengthsLabel(startAt: string, endAt: string) {
  const minutes = (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60_000;
  if (minutes >= 120) return 'Book 1 hour or 2 hours';
  if (minutes >= 60) return 'Book 1 hour';
  return null;
}

export function PublicClassesView({
  client = browserPublicClassCatalogClient,
}: {
  client?: PublicClassCatalogClient;
}) {
  const session = useSessionContext()?.session;
  const inCustomerShell = Boolean(
    session?.roles.includes('CUSTOMER') && session.roles.every((role) => role === 'CUSTOMER'),
  );
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [branchId, setBranchId] = useState('');
  const [slots, setSlots] = useState<PublicClassSlot[]>([]);
  const [day, setDay] = useState('');
  const [classType, setClassType] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [classSlugs, setClassSlugs] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    accountClient
      .siteConfig()
      .then((config) => {
        if (active)
          setClassSlugs(Object.fromEntries(config.classes.map(({ code, slug }) => [code, slug])));
      })
      // Without the lookup the timetable still works; rows just omit the class link.
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void client
      .list({})
      .then((result) => {
        if (!active) return;
        setBranches(result.branches);
        setStatus('ready');
        const query = new URLSearchParams(window.location.search);
        setDay(query.get('date') ?? '');
        setClassType(query.get('classType') ?? '');
        const requestedBranchId = query.get('branch');
        const requestedStudio = query.get('studio');
        const requestedBranch = result.branches.find(
          ({ id, name }) =>
            id === requestedBranchId ||
            name.toLocaleLowerCase('en-GB') === requestedStudio?.toLocaleLowerCase('en-GB'),
        );
        const preferredBranch =
          requestedBranch ?? result.branches.find(({ id }) => id === session?.preferredBranch?.id);
        if (preferredBranch) {
          setBranchId(preferredBranch.id);
          void load(preferredBranch.id);
        }
      })
      .catch((error) => {
        if (!active) return;
        setMessage(publicCatalogFailure(error));
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [client, session?.preferredBranch?.id]);

  const load = async (selectedBranch = branchId) => {
    if (!selectedBranch) return;
    setStatus('loading');
    setMessage('');
    try {
      const from = new Date();
      const until = new Date(from.getTime() + 14 * 86_400_000);
      const result = await client.list({ branchId: selectedBranch, from, until });
      setBranches(result.branches);
      setSlots(result.items);
      setStatus('ready');
    } catch (error) {
      setSlots([]);
      setMessage(publicCatalogFailure(error));
      setStatus('error');
    }
  };

  const branch = branches.find((item) => item.id === branchId);
  const classTypes = useMemo(
    () => [...new Map(slots.map((slot) => [slot.classType.id, slot.classType])).values()],
    [slots],
  );
  const visible = slots.filter(
    (slot) =>
      (!day || dayKey(slot.startAt, slot.timezone) === day) &&
      (!classType || slot.classType.id === classType),
  );
  const grouped = visible.reduce<Record<string, PublicClassSlot[]>>((groups, slot) => {
    const key = dayKey(slot.startAt, slot.timezone);
    groups[key] = [...(groups[key] ?? []), slot];
    return groups;
  }, {});
  const availableDays = [
    ...new Set(slots.map((slot) => dayKey(slot.startAt, slot.timezone))),
  ].slice(0, 14);
  const updateQuery = (updates: Record<string, string>) => {
    const query = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) query.set(key, value);
      else query.delete(key);
    });
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${query.size ? `?${query}` : ''}${window.location.hash}`,
    );
  };

  return (
    <div className="min-w-0 overflow-x-clip bg-dd-cream font-sans text-dd-ink">
      <a className="skip-link" href="#catalog-main">
        Skip to the timetable
      </a>
      {!inCustomerShell && <PublicHeader />}

      <main id="catalog-main">
        <PublicPageHero
          eyebrow="Timetable"
          title="Find a session that fits your week."
          description="Choose your club to see the next two weeks. Every slot is a 2-hour block: 1-hour packages use the first hour, 2-hour packages the whole block."
          variant={inCustomerShell ? 'compact' : 'default'}
        />
        <section
          className={inCustomerShell ? 'py-7 sm:py-10' : 'py-12 sm:py-16'}
          id="schedule"
          aria-labelledby="catalog-filter-title"
        >
          <div className={publicContainer}>
            <PublicSectionHeading
              eyebrow="Next two weeks"
              title="Pick a session"
              titleId="catalog-filter-title"
              description="Filter by club, date and class."
              aside={
                inCustomerShell ? undefined : branch ? (
                  <p className="rounded-[15px] border border-dd-line bg-white px-4 py-3 text-sm">
                    <strong className="block">{branch.name}</strong>
                    <span className="text-dd-muted">{branch.timezone}</span>
                  </p>
                ) : (
                  <p className="text-sm text-dd-muted">Choose a club to start.</p>
                )
              }
            />

            {branchId && availableDays.length > 0 && (
              <div
                className="mb-4 flex gap-2 overflow-x-auto pb-1"
                role="group"
                aria-label="Quick date"
              >
                <button
                  type="button"
                  className={`${!day ? 'border-dd-forest bg-dd-forest text-white' : 'border-dd-line bg-white text-dd-ink'} min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold`}
                  onClick={() => {
                    setDay('');
                    updateQuery({ date: '' });
                  }}
                >
                  All dates
                </button>
                {availableDays.map((date) => (
                  <button
                    type="button"
                    key={date}
                    className={`${day === date ? 'border-dd-forest bg-dd-forest text-white' : 'border-dd-line bg-white text-dd-ink'} min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold`}
                    onClick={() => {
                      setDay(date);
                      updateQuery({ date });
                    }}
                  >
                    {dateLabel(
                      slots.find((slot) => dayKey(slot.startAt, slot.timezone) === date)!.startAt,
                      branch?.timezone ?? 'Asia/Jakarta',
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-4 rounded-[15px] border border-dd-line bg-white p-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
              <SearchSelect
                label="Club"
                value={branchId}
                placeholder="Choose a club"
                options={branches.map((item) => ({
                  id: item.id,
                  label: item.name,
                  description: item.code,
                }))}
                onChange={(value) => {
                  setBranchId(value);
                  setSlots([]);
                  setDay('');
                  setClassType('');
                  updateQuery({ branch: value, studio: '', date: '', classType: '' });
                  if (value) void load(value);
                }}
              />
              <label className="grid gap-2 text-sm font-semibold">
                Date
                <input
                  className={publicField}
                  aria-label="Date"
                  type="date"
                  value={day}
                  disabled={!branchId}
                  onChange={(event) => {
                    setDay(event.target.value);
                    updateQuery({ date: event.target.value });
                  }}
                />
              </label>
              <SearchSelect
                label="Class"
                value={classType}
                disabled={!branchId}
                placeholder="All classes"
                options={classTypes.map((item) => ({ id: item.id, label: item.name }))}
                onChange={(value) => {
                  setClassType(value);
                  updateQuery({ classType: value });
                }}
              />
              <button
                className={publicSecondaryButton}
                type="button"
                disabled={!day && !classType}
                onClick={() => {
                  setDay('');
                  setClassType('');
                  updateQuery({ date: '', classType: '' });
                }}
              >
                Clear filters
              </button>
            </div>

            {status === 'loading' ? (
              <div
                className="mt-8 rounded-[15px] border border-dd-line bg-white p-10 text-center"
                role="status"
              >
                Loading the timetable…
              </div>
            ) : status === 'error' ? (
              <div
                className="mt-8 rounded-[15px] border border-dd-danger/30 bg-dd-danger-soft p-10 text-center"
                role="alert"
              >
                <strong className="font-display text-2xl">The timetable did not load</strong>
                <p className="mt-2">{message}</p>
                <button
                  className={`${publicSecondaryButton} mt-5`}
                  type="button"
                  onClick={() =>
                    void (branchId
                      ? load()
                      : client.list({}).then((result) => {
                          setBranches(result.branches);
                          setStatus('ready');
                        }))
                  }
                >
                  Try again
                </button>
              </div>
            ) : !branchId ? (
              <div className="mt-8 rounded-[15px] border border-dd-line bg-white p-10 text-center">
                <strong className="font-display text-2xl text-dd-forest">
                  Choose a club to see sessions
                </strong>
                <p className="mt-2 text-dd-muted">
                  Pick the club you will visit and its next two weeks appear here.
                </p>
              </div>
            ) : visible.length === 0 ? (
              <div className="mt-8 rounded-[15px] border border-dd-line bg-white p-10 text-center">
                <strong className="font-display text-2xl text-dd-forest">
                  No sessions match these filters
                </strong>
                <p className="mt-2 text-dd-muted">Try another date or class.</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6" aria-live="polite">
                {Object.entries(grouped).map(([date, items]) => (
                  <section
                    className="overflow-hidden rounded-[15px] border border-dd-line bg-white"
                    aria-labelledby={`day-${date}`}
                    key={date}
                  >
                    <header className="border-b border-dd-line bg-lr-sky px-5 py-4">
                      <h3 className="font-display text-2xl text-dd-forest" id={`day-${date}`}>
                        {dateLabel(items[0]!.startAt, items[0]!.timezone)}
                      </h3>
                    </header>
                    <div className="divide-y divide-dd-line">
                      {items.map((slot) => (
                        <article
                          className="grid gap-4 p-5 sm:grid-cols-[100px_minmax(0,1fr)_120px_auto] sm:items-center"
                          key={slot.id}
                        >
                          <div>
                            <strong className="block text-lg">
                              {timeLabel(slot.startAt, slot.timezone)}
                            </strong>
                            <span className="text-sm text-dd-muted">
                              to {timeLabel(slot.endAt, slot.timezone)} ·{' '}
                              {durationLabel(slot.startAt, slot.endAt)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-display text-xl text-dd-forest">
                              {slot.classType.name}
                            </h4>
                            <p className="mt-1 text-sm text-dd-muted">
                              {slot.status === 'CONFIRMED' ? 'Confirmed' : 'Open for booking'}
                              {lengthsLabel(slot.startAt, slot.endAt) &&
                                ` · ${lengthsLabel(slot.startAt, slot.endAt)}`}
                            </p>
                            {slot.instructor?.displayName && (
                              <p className="mt-1 text-xs font-semibold text-dd-muted">
                                Coach · {slot.instructor.displayName}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
                              <Link
                                href={`/schedule/${slot.id}`}
                                className="text-dd-forest underline-offset-4 hover:underline"
                              >
                                Session details
                              </Link>
                              {classSlugs[slot.classType.code] && (
                                <Link
                                  href={`/classes/${classSlugs[slot.classType.code]}`}
                                  className="text-dd-forest underline-offset-4 hover:underline"
                                >
                                  About this class
                                </Link>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="block text-xs text-dd-muted">Places</span>
                            <strong className="mt-1 block">
                              {slot.available > 0
                                ? `${slot.available} of ${slot.capacity} left`
                                : `Full · 0 of ${slot.capacity}`}
                            </strong>
                          </div>
                          <a
                            className={`${slot.available > 0 ? publicPrimaryButton : `${publicSecondaryButton} pointer-events-none opacity-50`} w-full sm:w-auto`}
                            aria-disabled={slot.available < 1}
                            href={
                              slot.available > 0
                                ? session?.roles.some((role) => role !== 'CUSTOMER')
                                  ? '/workspace/classes'
                                  : session?.identityVerificationStatus === 'APPROVED'
                                    ? `/bookings/new?slot=${slot.id}`
                                    : session
                                      ? '/account/verification'
                                      : `/sign-in?returnTo=${encodeURIComponent(`/bookings/new?slot=${slot.id}`)}`
                                : undefined
                            }
                          >
                            {slot.available < 1
                              ? 'Full'
                              : session?.roles.some((role) => role !== 'CUSTOMER')
                                ? 'Open class workspace'
                                : session && session.identityVerificationStatus !== 'APPROVED'
                                  ? 'Finish verification'
                                  : 'Book this session'}
                          </a>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      {!inCustomerShell && <PublicFooter />}
    </div>
  );
}
