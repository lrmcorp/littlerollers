'use client';

import Link from 'next/link';
import { Check, Clock3, Gauge, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  publicDetailClient,
  publicDetailFailure,
  type PublicClassDetail,
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
import { accountClient } from '../../account-client';

/** The profile has no display name; use the site catalogue name, then a session's class name. */
export function classDisplayName(item: PublicClassDetail, catalogueName?: string) {
  const named = catalogueName ?? item.schedules[0]?.classType?.name;
  if (named) return named;
  const code = item.profile.code.toLowerCase();
  return code.charAt(0).toUpperCase() + code.slice(1);
}

export function ClassDetailView({
  slug,
  initialData = null,
}: {
  slug: string;
  initialData?: PublicClassDetail | null;
}) {
  const [item, setItem] = useState<PublicClassDetail | null>(initialData);
  const [failure, setFailure] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [catalogueName, setCatalogueName] = useState<string>();
  useEffect(() => {
    let active = true;
    accountClient
      .siteConfig()
      .then((config) => {
        if (active) setCatalogueName(config.classes.find((entry) => entry.slug === slug)?.name);
      })
      // The page still renders with the fallback name if the catalogue is unavailable.
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [slug]);
  useEffect(() => {
    let active = true;
    if (initialData && attempt === 0) return;
    setFailure('');
    publicDetailClient
      .classType(slug)
      .then((value) => active && setItem(value))
      .catch((error) => active && setFailure(publicDetailFailure(error)));
    return () => {
      active = false;
    };
  }, [attempt, slug, initialData]);
  return (
    <PublicDetailFrame
      breadcrumb={[
        { label: 'Classes', href: '/classes' },
        { label: item ? classDisplayName(item, catalogueName) : 'Class' },
      ]}
    >
      {!item && !failure && <DetailLoading label="class" />}
      {failure && (
        <DetailFailure
          message={failure}
          listHref="/classes"
          onRetry={() => setAttempt((value) => value + 1)}
        />
      )}
      {item && (
        <>
          <DetailHero
            eyebrow="Class"
            title={classDisplayName(item, catalogueName)}
            summary={item.profile.summary}
            imageKey={item.profile.heroImageKey}
            facts={
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <Gauge className="size-4 text-dd-forest" />
                  {item.profile.level}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <Clock3 className="size-4 text-dd-forest" />
                  {item.profile.durationMinutes % 60 === 0
                    ? `${item.profile.durationMinutes / 60}-hour sessions`
                    : `${item.profile.durationMinutes} min sessions`}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <MapPin className="size-4 text-dd-forest" />
                  {item.studios.length} {item.studios.length === 1 ? 'club' : 'clubs'}
                </span>
              </div>
            }
            actions={
              <>
                <AudienceAction kind="class" id={item.profile.slug} classType={item.profile.code} />
                <Link className={publicSecondaryButton} href="/packages">
                  See packages
                </Link>
              </>
            }
          />
          <section className={`${publicContainer} grid gap-10 py-10 lg:grid-cols-[1fr_0.8fr]`}>
            <article>
              <h2 className="m-0 font-display text-3xl text-dd-forest">About this class</h2>
              <p className="mt-4 leading-7 text-dd-muted">{item.profile.description}</p>
              <h3 className="mt-8 font-display text-xl text-dd-forest">What children practise</h3>
              <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
                {item.profile.benefits.map((benefit) => (
                  <li
                    className="flex gap-3 rounded-[15px] border border-dd-line bg-white p-4"
                    key={benefit}
                  >
                    <Check className="size-4 shrink-0 text-dd-forest" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </article>
            <aside className="rounded-[15px] bg-lr-sky p-6">
              <h2 className="m-0 font-display text-xl text-dd-forest">What to bring</h2>
              <ul className="mt-4 grid gap-3 pl-5 text-sm text-dd-ink">
                {item.profile.equipment.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
              <h2 className="mt-8 font-display text-xl text-dd-forest">Where it runs</h2>
              <div className="mt-4 grid gap-2">
                {item.studios.map((studio) => (
                  <Link
                    className="flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-medium text-dd-forest no-underline"
                    href={`/locations/${studio.publicProfile.slug}`}
                    key={studio.id}
                  >
                    {studio.name} · {studio.publicProfile.area}
                  </Link>
                ))}
              </div>
            </aside>
          </section>
          <section className="border-y border-dd-line bg-white py-10">
            <div className={publicContainer}>
              <h2 className="m-0 font-display text-3xl text-dd-forest">Packages for this class</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {item.packages.slice(0, 4).map((pkg) => (
                  <article
                    className="rounded-[15px] border border-dd-line bg-dd-cream p-5"
                    key={pkg.id}
                  >
                    <p className="text-sm font-semibold text-dd-forest">{pkg.branch.name}</p>
                    <h3 className="mt-1 font-display text-xl text-dd-forest">{pkg.name}</h3>
                    <p className="mt-2 text-sm text-dd-muted">{pkg.publicProfile.summary}</p>
                    <div className="mt-4">
                      <PackagePrice
                        priceRp={pkg.priceRp}
                        effectivePriceRp={pkg.effectivePriceRp}
                        promotion={pkg.promotion}
                        sessionCount={pkg.sessionCount}
                      />
                    </div>
                    <Link className={`${publicSecondaryButton} mt-4`} href={`/packages/${pkg.id}`}>
                      Package details
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section className={`${publicContainer} py-10`}>
            <h2 className="m-0 font-display text-3xl text-dd-forest">Next sessions</h2>
            <div className="mt-5">
              <RelatedSchedules items={item.schedules} />
            </div>
          </section>
        </>
      )}
    </PublicDetailFrame>
  );
}
