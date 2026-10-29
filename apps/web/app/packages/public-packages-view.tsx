'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Check, Clock, MapPin } from 'lucide-react';
import {
  browserPublicPackageCatalogClient,
  publicPackageFailure,
  type PublicPackageCatalogClient,
  type PublicPackage,
  type PublicPackageBranch,
} from '../public-package-catalog-client';
import { PackagePrice } from '../components/public/package-price';
import { PublicFooter } from '../components/public/public-footer';
import { PublicHeader } from '../components/public/public-header';
import { PublicPageHero, PublicStatePanel } from '../components/public/public-page';
import {
  publicContainer,
  publicPrimaryButton,
  publicSecondaryButton,
} from '../components/public/public-styles';
import { signInReturnTo } from '../routes';
import type { WebSession } from '../session-client';
import {
  isCustomerOnlySession,
  packageAudienceState,
  type PackageAudienceState,
} from '../session-audience';
import { useSessionContext } from '../session-context';
import { SearchSelect } from '../components/forms';

const packageBenefits = [
  'Prices are set per club',
  'Each package shows how long it stays valid',
  'Your session balance is in your account',
] as const;

type LengthFilter = '' | '60' | '120';

export function sessionLengthText(minutes: number | undefined) {
  return (minutes ?? 60) >= 120 ? '2 hours' : '1 hour';
}

export function recommendedPackageId(items: PublicPackage[]) {
  if (items.length < 2) return null;
  return [...items].sort(
    (left, right) =>
      right.sessionCount - left.sessionCount ||
      (left.effectivePriceRp ?? left.priceRp) / left.sessionCount -
        (right.effectivePriceRp ?? right.priceRp) / right.sessionCount ||
      left.id.localeCompare(right.id),
  )[0]!.id;
}

export function recommendedFirst(items: PublicPackage[], recommendedId: string | null) {
  if (!recommendedId) return items;
  const recommended = items.find((item) => item.id === recommendedId);
  return recommended ? [recommended, ...items.filter((item) => item.id !== recommendedId)] : items;
}

export function publicBranchLocation(branch: PublicPackageBranch) {
  const location = branch.name.replace(/^Little Rollers\s+/i, '').trim() || branch.name;
  const timezone = branch.timezone === 'Asia/Jakarta' ? 'WIB' : branch.timezone;
  return `${location} · ${timezone}`;
}

export function packageDescriptor(
  item: PublicPackage,
  items: PublicPackage[],
  recommendedId: string | null,
) {
  if (item.id === recommendedId) return 'Lowest price per session here';
  const minimumSessions = Math.min(...items.map((candidate) => candidate.sessionCount));
  return item.sessionCount === minimumSessions
    ? 'A short run to try the club'
    : 'For a regular weekly session';
}

export function packageCtaLabel(session: WebSession | null) {
  const audience = packageAudienceState(session);
  if (audience === 'GUEST') return 'Sign in to buy';
  if (audience === 'CUSTOMER_UNVERIFIED') return 'Verify to buy';
  if (audience === 'CUSTOMER_APPROVED') return 'Buy this package';
  return 'Open workspace';
}

export function packageJourneyCopy(session: WebSession | null) {
  const audience = packageAudienceState(session);
  if (audience === 'GUEST') return 'Sign in or create an account to buy a package.';
  if (audience === 'CUSTOMER_UNVERIFIED') return 'Finish verifying your account to buy a package.';
  if (audience === 'CUSTOMER_APPROVED') return 'Pick a package, then continue to payment.';
  return 'You are signed in as staff. Packages are bought from a parent account.';
}

export function packageCtaHref(audience: PackageAudienceState, purchase: string): string {
  if (audience === 'GUEST') return signInReturnTo(purchase);
  if (audience === 'CUSTOMER_UNVERIFIED')
    return `/account/verification?returnTo=${encodeURIComponent(purchase)}`;
  if (audience === 'CUSTOMER_APPROVED') return purchase;
  return '/workspace';
}

function syncCatalogQuery(branchId: string, classTypeId: string) {
  const query = new URLSearchParams(window.location.search);
  if (branchId) query.set('branch', branchId);
  else query.delete('branch');
  if (classTypeId) query.set('classType', classTypeId);
  else query.delete('classType');
  const search = query.toString();
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`,
  );
}

export function PublicPackagesView({
  client = browserPublicPackageCatalogClient,
}: {
  client?: PublicPackageCatalogClient;
}) {
  const session = useSessionContext()?.session;
  const inCustomerShell = isCustomerOnlySession(session);
  const audience = packageAudienceState(session);
  const [branches, setBranches] = useState<PublicPackageBranch[]>([]);
  const [items, setItems] = useState<PublicPackage[]>([]);
  const [branchId, setBranchId] = useState('');
  const [classTypeId, setClassTypeId] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [continuationSlot, setContinuationSlot] = useState('');
  const [length, setLength] = useState<LengthFilter>('');

  const loadBranch = async (selected: string) => {
    if (!selected) {
      setItems([]);
      setStatus('ready');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const result = await client.list(selected);
      setBranches(result.branches);
      setItems(result.items);
      setStatus('ready');
    } catch (error) {
      setItems([]);
      setStatus('error');
      setMessage(publicPackageFailure(error));
    }
  };

  const retryCatalog = async () => {
    if (branchId) {
      await loadBranch(branchId);
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const result = await client.list();
      setBranches(result.branches);
      setItems([]);
      setStatus('ready');
    } catch (error) {
      setMessage(publicPackageFailure(error));
      setStatus('error');
    }
  };

  useEffect(() => {
    let active = true;
    void client
      .list()
      .then(async (result) => {
        if (!active) return;
        setBranches(result.branches);
        const query = new URLSearchParams(window.location.search);
        const requestedBranch = query.get('branch');
        const requestedClassType = query.get('classType');
        setContinuationSlot(query.get('slot') ?? '');
        if (requestedClassType) setClassTypeId(requestedClassType);
        const initialBranch =
          requestedBranch && result.branches.some(({ id }) => id === requestedBranch)
            ? requestedBranch
            : result.branches.find(({ id }) => id === session?.preferredBranch?.id)?.id;
        if (initialBranch) {
          setBranchId(initialBranch);
          const selected = await client.list(initialBranch);
          if (!active) return;
          setBranches(selected.branches);
          setItems(selected.items);
        }
        setStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        setMessage(publicPackageFailure(error));
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [client, session?.preferredBranch?.id]);

  const selectBranch = async (selected: string) => {
    setBranchId(selected);
    setClassTypeId('');
    syncCatalogQuery(selected, '');
    await loadBranch(selected);
  };

  const classTypes = useMemo(
    () => [...new Map(items.map((item) => [item.classType.id, item.classType])).values()],
    [items],
  );
  const visible = items.filter(
    (item) =>
      (!classTypeId || item.classType.id === classTypeId) &&
      (!length || String(item.sessionDurationMinutes ?? 60) === length),
  );
  const recommendedId = recommendedPackageId(visible);
  const orderedVisible = recommendedFirst(visible, recommendedId);
  const ctaLabel = packageCtaLabel(session ?? null);
  const showCatalogState =
    status !== 'ready' || !branchId || (branchId.length > 0 && visible.length === 0);

  return (
    <div className="min-w-0 overflow-x-clip bg-dd-cream font-sans text-dd-ink">
      <a className="skip-link" href="#packages-main">
        Skip to packages
      </a>
      {!inCustomerShell && <PublicHeader />}
      <main id="packages-main">
        <PublicPageHero
          eyebrow="Packages"
          title="1-hour or 2-hour sessions, your choice."
          description="Choose your club, then compare packages. Each booking uses one session, and the package sets whether that session is 1 hour or 2 hours."
          variant="compact"
        >
          <ul className="grid max-w-3xl list-none gap-2 p-0 text-sm text-dd-muted sm:grid-cols-3 sm:gap-4">
            {packageBenefits.map((benefit) => (
              <li className="flex items-start gap-2" key={benefit}>
                <Check className="mt-0.5 size-4 shrink-0 text-dd-forest" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </PublicPageHero>

        <section className="py-0 sm:py-1" aria-labelledby="package-discovery-title">
          <div className={publicContainer}>
            <header className="mb-2 max-w-3xl">
              <h2
                className="m-0 font-display text-[clamp(1.75rem,3.2vw,2.25rem)] leading-tight text-dd-forest"
                id="package-discovery-title"
              >
                Which club will you visit?
              </h2>
              <p className="mt-1 max-w-2xl leading-6 text-dd-muted">
                Prices and packages depend on the club.
              </p>
            </header>

            {status === 'loading' && !branches.length ? (
              <div className="grid grid-cols-2 gap-3" role="status" aria-label="Loading clubs">
                {[0, 1].map((item) => (
                  <div
                    className="h-20 animate-pulse rounded-dd-md border border-dd-line bg-white"
                    key={item}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {branches.map((item) => {
                  const selected = item.id === branchId;
                  return (
                    <button
                      type="button"
                      className={`flex min-h-14 items-center gap-3 rounded-[15px] border p-3 text-left transition sm:p-4 ${
                        selected
                          ? 'border-dd-forest bg-dd-forest text-white'
                          : 'border-dd-line bg-white text-dd-ink hover:-translate-y-0.5 hover:border-dd-forest/50'
                      }`}
                      aria-pressed={selected}
                      key={item.id}
                      onClick={() => void selectBranch(item.id)}
                    >
                      <span
                        className={`hidden size-10 shrink-0 place-items-center rounded-full sm:grid ${
                          selected ? 'bg-white/15' : 'bg-dd-success-soft text-dd-forest'
                        }`}
                      >
                        <MapPin className="size-5" aria-hidden="true" />
                      </span>
                      <span>
                        <strong className="block text-sm sm:text-base">{item.name}</strong>
                        <span
                          className={`block text-xs sm:text-sm ${
                            selected ? 'text-white/80' : 'text-dd-muted'
                          }`}
                        >
                          {publicBranchLocation(item)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-3 grid gap-3 rounded-[15px] border border-dd-line bg-white p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
              <div className="min-w-0">
                <SearchSelect
                  label="Class"
                  compact
                  value={classTypeId}
                  disabled={!branchId}
                  placeholder="All classes"
                  options={classTypes.map((item) => ({ id: item.id, label: item.name }))}
                  onChange={(selected) => {
                    setClassTypeId(selected);
                    syncCatalogQuery(branchId, selected);
                  }}
                />
              </div>
              <fieldset className="m-0 grid gap-1.5 border-0 p-0">
                <legend className="mb-1.5 text-sm font-semibold">Session length</legend>
                <div className="flex gap-1 rounded-full bg-dd-surface-muted p-1">
                  {(
                    [
                      ['', 'Any'],
                      ['60', '1 hour'],
                      ['120', '2 hours'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      type="button"
                      key={value || 'any'}
                      aria-pressed={length === value}
                      disabled={!branchId}
                      onClick={() => setLength(value)}
                      className={`min-h-10 rounded-full px-4 text-sm font-medium ${
                        length === value ? 'bg-dd-forest text-white' : 'text-dd-forest'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
              {(classTypeId || length) && (
                <button
                  type="button"
                  className="min-h-12 rounded-full border border-dd-line bg-white px-5 text-sm font-medium text-dd-forest"
                  onClick={() => {
                    setClassTypeId('');
                    setLength('');
                    syncCatalogQuery(branchId, '');
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>

            {showCatalogState && (
              <div className="mt-3" aria-live="polite">
                {status === 'loading' && branchId && (
                  <div className="grid gap-5 md:grid-cols-2" role="status">
                    {[0, 1].map((item) => (
                      <div
                        className="h-72 animate-pulse rounded-[15px] border border-dd-line bg-white"
                        key={item}
                      />
                    ))}
                  </div>
                )}
                {status === 'error' && (
                  <PublicStatePanel title="Packages did not load" tone="error" role="alert">
                    <p>{message}</p>
                    <button
                      type="button"
                      className="mt-4 min-h-11 rounded-full border border-dd-danger/30 bg-white px-5 font-medium"
                      onClick={() => void retryCatalog()}
                    >
                      Try again
                    </button>
                  </PublicStatePanel>
                )}
                {status === 'ready' && !branchId && (
                  <PublicStatePanel title="Choose a club to see packages">
                    Prices, classes and how long each package lasts appear once you pick a club.
                  </PublicStatePanel>
                )}
                {status === 'ready' && branchId && visible.length === 0 && (
                  <PublicStatePanel title="No packages match">
                    Try another class or session length, or a different club.
                  </PublicStatePanel>
                )}
              </div>
            )}

            {status === 'ready' && visible.length > 0 && (
              <>
                <p className="mt-3 pr-20 text-sm text-dd-muted sm:pr-0">
                  {packageJourneyCopy(session ?? null)}
                </p>
                <div className="mt-3 grid gap-5 md:grid-cols-2" aria-label="Packages">
                  {orderedVisible.map((item) => {
                    const recommended = item.id === recommendedId;
                    const purchase = `/checkout?package=${item.id}&branch=${item.branchId}${classTypeId ? `&classType=${encodeURIComponent(classTypeId)}` : ''}${continuationSlot ? `&slot=${encodeURIComponent(continuationSlot)}` : ''}`;
                    const href = packageCtaHref(audience, purchase);
                    return (
                      <article
                        className={`flex min-h-[320px] flex-col rounded-[15px] border bg-white p-5 sm:p-6 ${
                          recommended ? 'border-lr-sun ring-2 ring-lr-sun/40' : 'border-dd-line'
                        }`}
                        key={item.id}
                      >
                        <div className="flex min-h-7 flex-wrap items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-dd-forest">
                            {item.classType.name}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-lr-sky px-3 py-1 text-xs font-semibold text-dd-forest">
                            <Clock className="size-3.5" aria-hidden="true" />
                            {sessionLengthText(item.sessionDurationMinutes)} per session
                          </span>
                        </div>
                        <h3 className="mt-2 font-display text-[1.5rem] leading-tight text-dd-forest sm:text-[1.75rem]">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-dd-muted">
                          {packageDescriptor(item, visible, recommendedId)}
                        </p>
                        <div className="mt-4">
                          <PackagePrice
                            priceRp={item.priceRp}
                            effectivePriceRp={item.effectivePriceRp ?? item.priceRp}
                            promotion={item.promotion}
                            sessionCount={item.sessionCount}
                          />
                        </div>
                        <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-dd-line py-4">
                          <div>
                            <dt className="text-xs text-dd-muted">Sessions</dt>
                            <dd className="mt-1 font-bold">{item.sessionCount}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-dd-muted">Each session</dt>
                            <dd className="mt-1 font-bold">
                              {sessionLengthText(item.sessionDurationMinutes)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-dd-muted">Valid for</dt>
                            <dd className="mt-1 font-bold">{item.durationDays} days</dd>
                          </div>
                        </dl>
                        <div className="mt-auto grid gap-3 pt-4">
                          <p className="flex items-center gap-2 text-xs text-dd-muted">
                            <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                            {item.effectiveUntil
                              ? `On sale until ${new Intl.DateTimeFormat('en-GB', {
                                  dateStyle: 'medium',
                                }).format(new Date(item.effectiveUntil))}`
                              : 'On sale now'}
                          </p>
                          {audience === 'STAFF' && (
                            <p className="rounded-dd-sm bg-dd-surface-muted px-3 py-2 text-xs leading-5 text-dd-muted">
                              Packages are bought from a parent account.
                            </p>
                          )}
                          <Link
                            className={`${publicSecondaryButton} w-full`}
                            href={`/packages/${item.id}`}
                          >
                            Package details
                          </Link>
                          <Link className={`${publicPrimaryButton} w-full`} href={href}>
                            {ctaLabel}
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="mt-6 grid gap-3 rounded-[15px] border border-dd-line bg-white p-4 text-sm text-dd-muted sm:grid-cols-3">
                  {[
                    'Timetable slots are 2-hour blocks. 1-hour packages use the first hour.',
                    'A package starts once we approve your payment.',
                    'Track the sessions you have left in your account.',
                  ].map((item) => (
                    <p className="flex items-start gap-2" key={item}>
                      <Check className="mt-0.5 size-4 shrink-0 text-dd-forest" aria-hidden="true" />
                      {item}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      {!inCustomerShell && <PublicFooter />}
    </div>
  );
}
