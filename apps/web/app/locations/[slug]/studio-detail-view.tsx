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

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

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
            eyebrow={`${item.publicProfile.area} · ${item.publicProfile.city}`}
            title={item.name}
            summary={item.publicProfile.description ?? ''}
            imageKey={item.publicProfile.heroImageKey}
            facts={
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-4 py-2">
                  <MapPin className="size-4 text-dd-forest" />
                  {item.publicProfile.address}
                </span>
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
          <section className={`${publicContainer} grid gap-8 py-10 lg:grid-cols-[1fr_0.72fr]`}>
            <div>
              <h2 className="text-3xl font-semibold">Galeri studio</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {(item.publicProfile.galleryImageKeys ?? []).map((key, index) => (
                  <div
                    className={`relative min-h-56 overflow-hidden rounded-dd-lg border border-dd-line ${index === 0 ? 'sm:col-span-2 sm:min-h-80' : ''}`}
                    key={key}
                  >
                    <Image
                      src={`/images/public/${key}`}
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
              <div className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card">
                <Clock3 className="size-6 text-dd-forest" />
                <h2 className="mt-4 text-xl font-semibold">Jam buka</h2>
                <dl className="mt-4 grid gap-3 text-sm">
                  {(item.publicProfile.openingHours ?? []).map((row) => (
                    <div className="flex justify-between gap-4" key={row.days}>
                      <dt className="text-dd-muted">{row.days}</dt>
                      <dd className="font-semibold">{row.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-dd-lg border border-dd-line bg-dd-paper p-6">
                <h2 className="text-xl font-semibold">Fasilitas</h2>
                <ul className="mt-4 grid list-none gap-3 p-0 text-sm">
                  {(item.publicProfile.amenities ?? []).map((value) => (
                    <li className="flex gap-2" key={value}>
                      <Check className="size-4 text-dd-forest" />
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-dd-lg border border-dd-line bg-white p-6">
                <h2 className="text-xl font-semibold">Petunjuk kedatangan</h2>
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
              <h2 className="text-3xl font-semibold">Kelas di studio ini</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {item.classes.map((entry) => (
                  <article
                    className="rounded-dd-lg border border-dd-line bg-dd-cream p-5"
                    key={entry.code}
                  >
                    <p className="text-xs font-bold text-dd-forest uppercase">
                      {entry.profile.level}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{entry.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-dd-muted">{entry.profile.summary}</p>
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
          <section className={`${publicContainer} grid gap-10 py-10 lg:grid-cols-2`}>
            <div>
              <h2 className="text-3xl font-semibold">Jadwal berikutnya</h2>
              <div className="mt-5">
                <RelatedSchedules items={item.schedules} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-semibold">Paket tersedia</h2>
              <div className="mt-5 grid gap-3">
                {item.packages.slice(0, 4).map((pkg) => (
                  <Link
                    className="flex items-center justify-between gap-4 rounded-dd-md border border-dd-line bg-white p-4 text-dd-ink no-underline"
                    href={`/packages/${pkg.id}`}
                    key={pkg.id}
                  >
                    <span>
                      <strong className="block">{pkg.name}</strong>
                      <small className="text-dd-muted">
                        {pkg.sessionCount} sesi · {pkg.durationDays} hari
                      </small>
                    </span>
                    <strong>{rupiah.format(pkg.priceRp)}</strong>
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
