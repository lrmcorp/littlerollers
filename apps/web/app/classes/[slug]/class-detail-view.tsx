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
        { label: 'Kelas', href: '/classes' },
        {
          label: item?.profile.slug
            ? item.profile.code === 'BARRE'
              ? 'Barre'
              : item.profile.code === 'MAT'
                ? 'Mat Pilates'
                : 'Reformer Pilates'
            : 'Detail',
        },
      ]}
    >
      {!item && !failure && <DetailLoading label="kelas" />}
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
            eyebrow="Kelas Daily Dose"
            title={
              item.profile.code === 'BARRE'
                ? 'Barre'
                : item.profile.code === 'MAT'
                  ? 'Mat Pilates'
                  : 'Reformer Pilates'
            }
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
                  {item.profile.durationMinutes} menit
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <MapPin className="size-4 text-dd-forest" />
                  {item.studios.length} studio
                </span>
              </div>
            }
            actions={
              <>
                <AudienceAction kind="class" id={item.profile.slug} classType={item.profile.code} />
                <Link className={publicSecondaryButton} href="/packages">
                  Lihat paket
                </Link>
              </>
            }
          />
          <section className={`${publicContainer} grid gap-10 py-10 lg:grid-cols-[1fr_0.8fr]`}>
            <article>
              <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">
                Tentang kelas
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Bergerak dengan tujuan</h2>
              <p className="mt-4 leading-7 text-dd-muted">{item.profile.description}</p>
              <h3 className="mt-8 text-xl font-semibold">Manfaat</h3>
              <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
                {item.profile.benefits.map((benefit) => (
                  <li
                    className="flex gap-3 rounded-dd-md border border-dd-line bg-white p-4"
                    key={benefit}
                  >
                    <Check className="size-4 shrink-0 text-dd-forest" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </article>
            <aside className="rounded-dd-lg border border-dd-line bg-dd-paper p-6">
              <h2 className="text-xl font-semibold">Perlengkapan</h2>
              <ul className="mt-4 grid gap-3 pl-5 text-sm text-dd-muted">
                {item.profile.equipment.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
              <h2 className="mt-8 text-xl font-semibold">Studio tersedia</h2>
              <div className="mt-4 grid gap-2">
                {item.studios.map((studio) => (
                  <Link
                    className="rounded-dd-sm border border-dd-line bg-white px-4 py-3 text-sm font-semibold text-dd-ink no-underline"
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
              <h2 className="text-3xl font-semibold">Paket terkait</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {item.packages.slice(0, 4).map((pkg) => (
                  <article
                    className="rounded-dd-lg border border-dd-line bg-dd-cream p-5"
                    key={pkg.id}
                  >
                    <p className="text-xs font-bold text-dd-forest uppercase">{pkg.branch.name}</p>
                    <h3 className="mt-2 text-xl font-semibold">{pkg.name}</h3>
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
                      Lihat detail
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section className={`${publicContainer} py-10`}>
            <h2 className="text-3xl font-semibold">Jadwal berikutnya</h2>
            <div className="mt-5">
              <RelatedSchedules items={item.schedules} />
            </div>
          </section>
        </>
      )}
    </PublicDetailFrame>
  );
}
