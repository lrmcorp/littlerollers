'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Clock3, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  publicDetailClient,
  publicDetailFailure,
  type PublicStudioDetail,
} from '@/api-clients/public-detail-client';
import {
  AudienceAction,
  DetailFactTag,
  DetailFailure,
  DetailHero,
  DetailLoading,
  PublicDetailFrame,
  RelatedSchedules,
  publicSecondaryButton,
} from '../../components/public/public-detail-shared';
import { PackagePrice } from '../../components/public/package-price';
import { resolvePublicImageUrl } from '../../lib/public-image-url';
import { classLevelLabel } from '../../lib/class-level';

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
      breadcrumb={[{ label: 'Studio', href: '/locations' }, { label: item?.name ?? 'Detail' }]}
    >
      {!item && !failure && <DetailLoading label="studio" />}
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
            eyebrow={[item.publicProfile.area, item.publicProfile.city].filter(Boolean).join(' · ')}
            title={item.name}
            summary={item.publicProfile.description ?? ''}
            imageKey={item.publicProfile.heroImageKey}
            facts={
              <div className="flex flex-wrap gap-3 text-sm">
                <DetailFactTag icon={MapPin}>
                  {item.publicProfile.address}
                </DetailFactTag>
              </div>
            }
            actions={
              <>
                <AudienceAction kind="studio" id={item.publicProfile.slug} branchId={item.id} />
                <Link className={publicSecondaryButton} href="/contact">
                  Hubungi studio
                </Link>
              </>
            }
          />
          <section className="ed-wrap grid gap-8 py-10 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ed-ink sm:text-3xl">Galeri studio</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {(item.publicProfile.galleryImageKeys ?? [])
                  .filter((k): k is string => Boolean(k) && k !== 'null')
                  .map((key, index) => (
                    <div
                      className={`relative min-h-56 overflow-hidden rounded-none border border-ed-line ${index === 0 ? 'sm:col-span-2 sm:min-h-80' : ''}`}
                      key={key}
                    >
                      <Image
                        src={resolvePublicImageUrl(key)}
                        alt={`${item.name}, galeri ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
              </div>
            </div>
            <aside className="grid content-start gap-5">
              <div className="rounded-none border border-ed-line bg-white p-6 shadow-none">
                <Clock3 className="size-5 text-ed-green" />
                <h2 className="mt-3 text-lg font-bold text-ed-ink">Jam buka</h2>
                <dl className="mt-4 grid gap-3 text-sm">
                  {(item.publicProfile.openingHours ?? []).map((row) => (
                    <div className="flex justify-between gap-4" key={row.days}>
                      <dt className="text-ed-muted">{row.days}</dt>
                      <dd className="font-semibold text-ed-ink">{row.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-none border border-ed-line bg-ed-tint/60 p-6 shadow-none">
                <h2 className="text-lg font-bold text-ed-ink">Fasilitas</h2>
                <ul className="mt-4 grid list-none gap-3 p-0 text-sm">
                  {(item.publicProfile.amenities ?? []).map((value) => (
                    <li className="flex gap-2 text-ed-ink" key={value}>
                      <Check className="size-4 shrink-0 text-ed-green" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-none border border-ed-line bg-white p-6 shadow-none">
                <h2 className="text-lg font-bold text-ed-ink">Petunjuk kedatangan</h2>
                <p className="mt-3 text-sm leading-relaxed text-ed-muted">
                  {item.publicProfile.arrivalInformation}
                </p>
                {item.publicProfile.parkingInformation && (
                  <p className="mt-3 text-sm leading-relaxed text-ed-muted">
                    {item.publicProfile.parkingInformation}
                  </p>
                )}
              </div>
            </aside>
          </section>
          <section className="border-y border-ed-line bg-white py-10">
            <div className="ed-wrap">
              <h2 className="text-2xl font-bold tracking-tight text-ed-ink sm:text-3xl">Kelas di studio ini</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {item.classes.map((entry) => (
                  <article
                    className="rounded-none border border-ed-line bg-ed-tint/40 p-5 shadow-none"
                    key={entry.code}
                  >
                    <p className="ed-eyebrow text-ed-green">
                      {classLevelLabel(entry.profile.level)}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-ed-ink">{entry.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ed-muted">{entry.profile.summary}</p>
                    <Link
                      className={`${publicSecondaryButton} mt-4`}
                      href={`/classes/${entry.profile.slug}`}
                    >
                      Lihat detail
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section className="ed-wrap grid gap-10 py-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ed-ink sm:text-3xl">Jadwal berikutnya</h2>
              <div className="mt-5">
                <RelatedSchedules items={item.schedules} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ed-ink sm:text-3xl">Paket tersedia</h2>
              <div className="mt-5 grid gap-3">
                {item.packages.slice(0, 4).map((pkg) => (
                  <Link
                    className="flex items-center justify-between gap-4 rounded-none border border-ed-line bg-white p-4 text-ed-ink no-underline transition-colors hover:border-ed-green shadow-none"
                    href={`/packages/${pkg.id}`}
                    key={pkg.id}
                  >
                    <span>
                      <strong className="block text-sm font-bold text-ed-ink">{pkg.name}</strong>
                      <small className="text-xs text-ed-muted">
                        {pkg.sessionCount} sesi · {pkg.durationDays} hari
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
