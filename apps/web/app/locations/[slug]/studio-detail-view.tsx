'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Clock3, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  publicDetailClient,
  publicDetailFailure,
  type PublicStudioDetail,
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

export function StudioDetailView({
  slug,
  initialData = null,
}: {
  slug: string;
  initialData?: PublicStudioDetail | null;
}) {
  const [item, setItem] = useState<PublicStudioDetail | null>(initialData);
  const [failure, setFailure] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    if (initialData && attempt === 0) return;
    setFailure('');
    publicDetailClient
      .studio(slug)
      .then((value) => active && setItem(value))
      .catch((error) => active && setFailure(publicDetailFailure(error)));
    return () => {
      active = false;
    };
  }, [attempt, slug, initialData]);
  return (
    <PublicDetailFrame
      breadcrumb={[{ label: 'Clubs', href: '/locations' }, { label: item?.name ?? 'Details' }]}
    >
      {!item && !failure && <DetailLoading label="club" />}
      {failure && (
        <DetailFailure
          message={failure}
          listHref="/locations"
          onRetry={() => setAttempt((value) => value + 1)}
        />
      )}
      {item && (
        <>
          <DetailHero
            eyebrow={`${item.publicProfile.area} · ${item.publicProfile.city}`}
            title={item.name}
            summary={item.publicProfile.description ?? ''}
            imageKey={item.publicProfile.heroImageKey}
            facts={
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <MapPin className="size-4 text-dd-forest" aria-hidden="true" />
                  {item.publicProfile.address}
                </span>
              </div>
            }
            actions={
              <>
                <AudienceAction kind="studio" id={item.publicProfile.slug} branchId={item.id} />
                <Link className={publicSecondaryButton} href="/contact">
                  Contact the club
                </Link>
              </>
            }
          />
          <section className={`${publicContainer} grid gap-8 py-10 lg:grid-cols-[1fr_0.72fr]`}>
            <div>
              <h2 className="m-0 font-display text-3xl text-dd-forest">The club</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {(item.publicProfile.galleryImageKeys ?? []).map((key, index) => (
                  <div
                    className={`relative min-h-56 overflow-hidden rounded-[15px] bg-lr-sky ${index === 0 ? 'sm:col-span-2 sm:min-h-80' : ''}`}
                    key={key}
                  >
                    <Image
                      src={`/images/public/${key}`}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            <aside className="grid content-start gap-5">
              <div className="rounded-[15px] bg-lr-sky p-6">
                <Clock3 className="size-6 text-dd-forest" aria-hidden="true" />
                <h2 className="mt-4 font-display text-xl text-dd-forest">Opening hours</h2>
                <dl className="mt-4 grid gap-3 text-sm">
                  {(item.publicProfile.openingHours ?? []).map((row) => (
                    <div className="flex justify-between gap-4" key={row.days}>
                      <dt>{row.days}</dt>
                      <dd className="font-semibold">{row.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-[15px] border border-dd-line bg-dd-paper p-6">
                <h2 className="m-0 font-display text-xl text-dd-forest">At the club</h2>
                <ul className="mt-4 grid list-none gap-3 p-0 text-sm">
                  {(item.publicProfile.amenities ?? []).map((value) => (
                    <li className="flex gap-2" key={value}>
                      <Check className="size-4 text-dd-forest" aria-hidden="true" />
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[15px] border border-dd-line bg-white p-6">
                <h2 className="m-0 font-display text-xl text-dd-forest">Getting here</h2>
                <p className="mt-3 text-sm leading-6 text-dd-muted">
                  {item.publicProfile.arrivalInformation}
                </p>
                {item.publicProfile.parkingInformation && (
                  <p className="mt-3 text-sm leading-6 text-dd-muted">
                    {item.publicProfile.parkingInformation}
                  </p>
                )}
              </div>
            </aside>
          </section>
          <section className="border-y border-dd-line bg-white py-10">
            <div className={publicContainer}>
              <h2 className="m-0 font-display text-3xl text-dd-forest">Classes at this club</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {item.classes.map((entry) => (
                  <article
                    className="rounded-[15px] border border-dd-line bg-dd-cream p-5"
                    key={entry.code}
                  >
                    <p className="text-sm font-semibold text-dd-forest">{entry.profile.level}</p>
                    <h3 className="mt-1 font-display text-xl text-dd-forest">{entry.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-dd-muted">{entry.profile.summary}</p>
                    <Link
                      className={`${publicSecondaryButton} mt-4`}
                      href={`/classes/${entry.profile.slug}`}
                    >
                      About this class
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section className={`${publicContainer} grid gap-10 py-10 lg:grid-cols-2`}>
            <div>
              <h2 className="m-0 font-display text-3xl text-dd-forest">Next sessions</h2>
              <div className="mt-5">
                <RelatedSchedules items={item.schedules} />
              </div>
            </div>
            <div>
              <h2 className="m-0 font-display text-3xl text-dd-forest">Packages</h2>
              <div className="mt-5 grid gap-3">
                {item.packages.slice(0, 4).map((pkg) => (
                  <Link
                    className="flex items-center justify-between gap-4 rounded-[15px] border border-dd-line bg-white p-4 text-dd-ink no-underline"
                    href={`/packages/${pkg.id}`}
                    key={pkg.id}
                  >
                    <span>
                      <strong className="block">{pkg.name}</strong>
                      <small className="text-dd-muted">
                        {pkg.sessionCount} sessions of{' '}
                        {(pkg.sessionDurationMinutes ?? 60) >= 120 ? '2 hours' : '1 hour'} · valid{' '}
                        {pkg.durationDays} days
                      </small>
                    </span>
                    <PackagePrice
                      priceRp={pkg.priceRp}
                      effectivePriceRp={pkg.effectivePriceRp}
                      promotion={pkg.promotion}
                      compact
                    />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </PublicDetailFrame>
  );
}
