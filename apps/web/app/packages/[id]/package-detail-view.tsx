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
import { formatRupiah } from '../../lib/formatters';

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
      breadcrumb={[{ label: 'Paket', href: '/packages' }, { label: item?.name ?? 'Detail' }]}
    >
      {!item && !failure && <DetailLoading label="paket" />}
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
              <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Harga', formatRupiah(item.effectivePriceRp)],
                  ['Per sesi', formatRupiah(item.pricePerSessionRp)],
                  ['Jumlah', `${item.sessionCount} sesi`],
                  ['Berlaku', `${item.durationDays} hari`],
                ].map(([label, value]) => (
                  <div className="rounded-dd-md border border-dd-line bg-white/80 p-3" key={label}>
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
                  <MapPin className="size-4" /> Detail studio
                </Link>
              </>
            }
          />
          {item.promotion && (
            <section className={`${publicContainer} pt-8`} aria-label="Promo paket aktif">
              <div className="flex flex-col gap-4 rounded-dd-lg border border-dd-brass/50 bg-dd-brass-soft p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-dd-brass-dark uppercase">
                    {item.promotion.label}
                  </p>
                  <p className="mt-1 text-sm text-dd-muted">
                    Promo berlaku sampai{' '}
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(
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
                <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">
                  Tentang paket
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Ritme latihan yang lebih konsisten</h2>
                <p className="mt-4 leading-7 text-dd-muted">{item.publicProfile.description}</p>
                <ul className="mt-6 grid list-none gap-3 p-0 sm:grid-cols-2">
                  {item.publicProfile.highlights.map((highlight) => (
                    <li
                      className="flex items-start gap-3 rounded-dd-md border border-dd-line bg-white p-4"
                      key={highlight}
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-dd-forest" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </article>
              <article>
                <h2 className="text-2xl font-semibold">Jadwal terkait</h2>
                <div className="mt-4">
                  <RelatedSchedules
                    items={item.schedules.map((schedule) => ({ ...schedule, branch: item.branch }))}
                  />
                </div>
              </article>
            </div>
            <aside className="grid content-start gap-5">
              <div className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card">
                <Clock3 className="size-6 text-dd-forest" />
                <h2 className="mt-4 text-xl font-semibold">Cara menggunakan</h2>
                <p className="mt-3 text-sm leading-6 text-dd-muted">
                  {item.publicProfile.usageGuidance}
                </p>
              </div>
              <div className="rounded-dd-lg border border-dd-line bg-dd-paper p-6">
                <h2 className="text-xl font-semibold">Ketentuan paket</h2>
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
