'use client';

import Link from 'next/link';
import { Check, Clock3, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  publicDetailClient,
  publicDetailFailure,
  type PublicPackageDetail,
} from '../../public-detail-client';
import {
  AudienceAction,
  DetailFailure,
  DetailHero,
  DetailLoading,
  PublicDetailFrame,
  RelatedSchedules,
  publicContainer,
  publicSecondaryButton,
} from '../../components/public/public-detail-shared';
import { PackagePrice } from '../../components/public/package-price';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function PackageDetailView({
  id,
  initialData = null,
}: {
  id: string;
  initialData?: PublicPackageDetail | null;
}) {
  const [item, setItem] = useState<PublicPackageDetail | null>(initialData);
  const [failure, setFailure] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (initialData && attempt === 0) return;
    setFailure('');
    publicDetailClient
      .package(id)
      .then((value) => active && setItem(value))
      .catch((error) => active && setFailure(publicDetailFailure(error)));
    return () => {
      active = false;
    };
  }, [attempt, id, initialData]);

  return (
    <PublicDetailFrame
      breadcrumb={[{ label: 'Packages', href: '/packages' }, { label: item?.name ?? 'Details' }]}
    >
      {!item && !failure && <DetailLoading label="package" />}
      {failure && (
        <DetailFailure
          message={failure}
          listHref="/packages"
          onRetry={() => setAttempt((value) => value + 1)}
        />
      )}
      {item && (
        <>
          <DetailHero
            eyebrow={`${item.classType.name} · ${item.branch.publicProfile.area}`}
            title={item.name}
            summary={item.publicProfile.summary}
            imageKey={item.branch.publicProfile.heroImageKey}
            facts={
              <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  ['Price', rupiah.format(item.effectivePriceRp)],
                  ['Per session', rupiah.format(item.pricePerSessionRp)],
                  ['Sessions', String(item.sessionCount)],
                  ['Each session', (item.sessionDurationMinutes ?? 60) >= 120 ? '2 hours' : '1 hour'],
                  ['Valid for', `${item.durationDays} days`],
                ].map(([label, value]) => (
                  <div className="rounded-[12px] border border-dd-line bg-white p-3" key={label}>
                    <span className="text-xs text-dd-muted">{label}</span>
                    <strong className="mt-1 block text-sm">{value}</strong>
                  </div>
                ))}
              </div>
            }
            actions={
              <>
                <AudienceAction kind="package" id={item.id} branchId={item.branch.id} />
                <Link
                  className={publicSecondaryButton}
                  href={`/locations/${item.branch.publicProfile.slug}`}
                >
                  <MapPin className="size-4" aria-hidden="true" /> Club details
                </Link>
              </>
            }
          />
          {item.promotion && (
            <section className={`${publicContainer} pt-8`} aria-label="Current offer">
              <div className="flex flex-col gap-4 rounded-[15px] border border-lr-sun bg-lr-sun-soft p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-dd-brass-dark">
                    {item.promotion.label}
                  </p>
                  <p className="mt-1 text-sm text-dd-muted">
                    Offer ends{' '}
                    {new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(
                      new Date(item.promotion.activeUntil),
                    )}
                    .
                  </p>
                </div>
                <PackagePrice
                  priceRp={item.priceRp}
                  effectivePriceRp={item.effectivePriceRp}
                  promotion={item.promotion}
                  sessionCount={item.sessionCount}
                />
              </div>
            </section>
          )}
          <section className={`${publicContainer} grid gap-8 py-10 lg:grid-cols-[1fr_0.78fr]`}>
            <div className="grid gap-8">
              <article>
                <h2 className="font-display text-3xl text-dd-forest">About this package</h2>
                <p className="mt-4 leading-7 text-dd-muted">{item.publicProfile.description}</p>
                <ul className="mt-6 grid list-none gap-3 p-0 sm:grid-cols-2">
                  {item.publicProfile.highlights.map((highlight) => (
                    <li
                      className="flex items-start gap-3 rounded-[15px] border border-dd-line bg-white p-4"
                      key={highlight}
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-dd-forest" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </article>
              <article>
                <h2 className="font-display text-2xl text-dd-forest">Upcoming sessions</h2>
                <div className="mt-4">
                  <RelatedSchedules
                    items={item.schedules.map((schedule) => ({ ...schedule, branch: item.branch }))}
                  />
                </div>
              </article>
            </div>
            <aside className="grid content-start gap-5">
              <div className="rounded-[15px] bg-lr-sky p-6">
                <Clock3 className="size-6 text-dd-forest" aria-hidden="true" />
                <h2 className="mt-4 font-display text-xl text-dd-forest">How to use it</h2>
                <p className="mt-3 text-sm leading-6 text-dd-ink">
                  {item.publicProfile.usageGuidance}
                </p>
              </div>
              <div className="rounded-[15px] border border-dd-line bg-dd-paper p-6">
                <h2 className="font-display text-xl text-dd-forest">Package terms</h2>
                <ul className="mt-4 grid gap-3 pl-5 text-sm leading-6 text-dd-muted">
                  {item.publicProfile.terms.map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </section>
        </>
      )}
    </PublicDetailFrame>
  );
}
