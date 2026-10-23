'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Gauge,
  HeartPulse,
  Info,
  MapPin,
  Timer,
  UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  publicDetailClient,
  publicDetailFailure,
  type PublicClassDetail,
} from '@/api-clients/public-detail-client';
import {
  AudienceAction,
  DetailFailure,
  DetailHero,
  DetailLoading,
  PublicDetailFrame,
  publicSecondaryButton,
} from '../../components/public/public-detail-shared';
import { PackagePrice } from '../../components/public/package-price';
import { accountClient, type PublicFaqPayload } from '@/api-clients/account-client';
import { ClassFaqSection } from './class-faq-section';
import { classLevelLabel } from '../../lib/class-level';

export function ClassDetailView({
  slug,
  initialData = null,
  initialFaq = null,
}: {
  slug: string;
  initialData?: PublicClassDetail | null;
  initialFaq?: PublicFaqPayload | null;
}) {
  const [item, setItem] = useState<PublicClassDetail | null>(initialData);
  const [faq, setFaq] = useState<PublicFaqPayload | null>(initialFaq);
  const [failure, setFailure] = useState('');
  const [attempt, setAttempt] = useState(0);

  // FAQ dikelola staf; bila gagal dimuat, bagian FAQ memakai pertanyaan bawaan.
  useEffect(() => {
    if (initialFaq) return;
    let active = true;
    accountClient
      .siteConfig()
      .then((config) => active && setFaq(config.faq ?? null))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [initialFaq]);

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

  const classNameFormatted = item
    ? item.profile.code === 'GROUP_CLASS'
      ? 'Group Class'
      : item.profile.code === 'PRIVATE_CLASS'
        ? 'Private Class'
        : item.profile.code === 'SEMI_PRIVATE'
          ? 'Semi Private Class'
          : item.profile.code === 'PRIVATE_GROUP'
            ? 'Private Group'
            : item.profile.slug
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ')
    : 'Detail';

  return (
    <PublicDetailFrame
      breadcrumb={[{ label: 'Kelas', href: '/classes' }, { label: classNameFormatted }]}
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
            title={classNameFormatted}
            summary={item.profile.summary}
            imageKey={item.profile.heroImageKey}
            facts={
              <div className="flex flex-wrap gap-2.5 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-ed-line bg-white px-3.5 py-2 font-medium text-ed-ink ">
                  <Gauge className="size-4 text-ed-green" />
                  {classLevelLabel(item.profile.level)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-ed-green/30 bg-dd-success-soft px-3.5 py-2 font-semibold text-ed-green ">
                  <Timer className="size-4 text-ed-green" />
                  Durasi {item.profile.durationMinutes} Menit
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-ed-line bg-white px-3.5 py-2 font-medium text-ed-ink ">
                  <MapPin className="size-4 text-ed-green" />
                  {item.studios.length} Studio Tersedia
                </span>
              </div>
            }
            actions={
              <>
                <AudienceAction kind="class" id={item.profile.slug} classType={item.profile.code} />
                <Link className={publicSecondaryButton} href="/packages">
                  Lihat paket kelas
                </Link>
                <Link className={publicSecondaryButton} href="/classes#schedule">
                  Lihat jadwal lengkap
                </Link>
              </>
            }
          />

          {/* Section 1: Tentang Kelas & Manfaat */}
          <section className={`ed-wrap grid gap-10 py-12 lg:grid-cols-[1fr_0.85fr]`}>
            <article className="space-y-8">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-ed-green uppercase">
                  Tentang Kelas
                </p>
                <h2 className="mt-2 text-2xl font-bold text-ed-ink sm:text-3xl">
                  Bergerak dengan Presisi & Tujuan
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ed-muted">
                  {item.profile.description}
                </p>
              </div>

              {/* Fokus Latihan */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-none border border-ed-line bg-white p-5 ">
                  <div className="flex size-9 items-center justify-center rounded-none bg-ed-green/10 text-ed-green">
                    <HeartPulse className="size-5" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-ed-ink">Kekuatan Inti (Core)</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ed-muted">
                    Melatih otot penopang tubuh bagian dalam untuk stabilitas maksimal.
                  </p>
                </div>
                <div className="rounded-none border border-ed-line bg-white p-5 ">
                  <div className="flex size-9 items-center justify-center rounded-none bg-ed-green/10 text-ed-green">
                    <Dumbbell className="size-5" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-ed-ink">Postur & Keselarasan</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ed-muted">
                    Memperbaiki pola gerak harian dan meredakan ketegangan otot leher serta
                    punggung.
                  </p>
                </div>
              </div>

              {/* Manfaat Kelas */}
              {item.profile.benefits && item.profile.benefits.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-ed-ink">
                    <CheckCircle2 className="size-5 text-ed-green" />
                    Manfaat Utama Latihan
                  </h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {item.profile.benefits.map((benefit) => (
                      <li
                        className="flex items-start gap-3 rounded-none border border-ed-line bg-white p-4 "
                        key={benefit}
                      >
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ed-green" />
                        <span className="text-sm font-medium text-ed-ink">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            {/* Sidebar Kanan: Perlengkapan & Studio */}
            <aside className="space-y-6">
              {/* Perlengkapan */}
              <div className="rounded-none border border-ed-line bg-white p-6 ">
                <h3 className="flex items-center gap-2 text-lg font-bold text-ed-ink">
                  <Info className="size-5 text-ed-green" />
                  Peralatan Kelas
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-ed-muted">
                  Peralatan berikut disediakan oleh studio untuk kelas ini:
                </p>
                <ul className="mt-4 space-y-2.5">
                  {item.profile.equipment.map((value) => (
                    <li key={value} className="flex items-center gap-2.5 text-sm text-ed-ink">
                      <span className="size-2 rounded-full bg-ed-green" />
                      {value}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-none border border-ed-line/80 bg-ed-cream p-3 text-xs leading-relaxed text-ed-muted">
                  <strong className="block font-semibold text-ed-ink">Perlengkapan Peserta:</strong>
                  Peralatan reformer dan perlengkapan latihan disediakan lengkap oleh studio. Anda cukup membawa kaus kaki antiselip (<em>grip socks</em>) dan pakaian olahraga yang nyaman.
                </div>
              </div>

              {/* Studio Tersedia */}
              <div className="rounded-none border border-ed-line bg-ed-cream p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-ed-ink">
                  <MapPin className="size-5 text-ed-green" />
                  Studio yang Menyediakan Kelas Ini
                </h3>
                <div className="mt-4 space-y-2.5">
                  {item.studios.map((studio) => (
                    <Link
                      className="block rounded-none border border-ed-line bg-white p-4 no-underline transition-colors hover:border-ed-green"
                      href={`/locations/${studio.publicProfile.slug}`}
                      key={studio.id}
                    >
                      <strong className="block text-sm font-semibold text-ed-ink">
                        {studio.name}
                      </strong>
                      <span className="mt-1 block text-xs text-ed-muted">
                        {[studio.publicProfile.area, studio.publicProfile.city].filter(Boolean).join(', ')}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          {/* Section 2: Paket Kelas Terkait */}
          {item.packages.length > 0 && (
            <section className="border-y border-ed-line bg-white py-12">
              <div className="ed-wrap">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-ed-green uppercase">
                      Pilihan Paket
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-ed-ink sm:text-3xl">
                      Paket Terkait Kelas Ini
                    </h2>
                  </div>
                  <Link className={`${publicSecondaryButton} inline-flex items-center gap-1.5`} href="/packages">
                    <span>Lihat semua paket</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {item.packages.slice(0, 6).map((pkg) => (
                    <article
                      className="flex flex-col justify-between rounded-none border border-ed-line bg-ed-cream p-6 transition-shadow hover:"
                      key={`${pkg.id}:${pkg.branch.id}`}
                    >
                      <div>
                        <span className="inline-block rounded-full bg-dd-success-soft px-2.5 py-0.5 text-[11px] font-bold text-dd-success uppercase">
                          {pkg.branch.name}
                        </span>
                        <h3 className="mt-3 text-xl font-bold text-ed-ink">{pkg.name}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-ed-muted">
                          {pkg.publicProfile.summary}
                        </p>
                        <div className="mt-4">
                          <PackagePrice
                            priceRp={pkg.priceRp}
                            effectivePriceRp={pkg.effectivePriceRp}
                            promotion={pkg.promotion}
                            sessionCount={pkg.sessionCount}
                          />
                        </div>
                      </div>
                      <div className="mt-6 border-t border-ed-line pt-4">
                        <Link
                          className={`${publicSecondaryButton} w-full justify-center`}
                          href={`/packages/${pkg.id}`}
                        >
                          Lihat detail paket
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Section 3: Jadwal Mendatang */}
          {item.schedules.length > 0 && (
            <section className={`ed-wrap py-12`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-ed-green uppercase">
                    Jadwal Terdekat
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-ed-ink sm:text-3xl">
                    Sesi {classNameFormatted} Mendatang
                  </h2>
                </div>
                <Link className={`${publicSecondaryButton} inline-flex items-center gap-1.5`} href="/classes#schedule">
                  <span>Buka kalender jadwal</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {item.schedules.map((schedule) => {
                  const sStart = new Date(schedule.startAt);
                  const sEnd = new Date(schedule.endAt);
                  const sDuration = Math.max(
                    15,
                    Math.round((sEnd.getTime() - sStart.getTime()) / 60_000),
                  );
                  return (
                    <Link
                      key={schedule.id}
                      href={`/schedule/${schedule.id}`}
                      className="group flex flex-col justify-between rounded-none border border-ed-line bg-white p-5 no-underline transition-all hover:border-ed-green hover:"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ed-green">
                            <CalendarDays className="size-4" />
                            {new Intl.DateTimeFormat('id-ID', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              timeZone: schedule.timezone,
                            }).format(sStart)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                              schedule.available < 1
                                ? 'bg-dd-danger-soft text-dd-danger'
                                : schedule.available <= 2
                                  ? 'bg-dd-warning-soft text-dd-warning'
                                  : 'bg-dd-success-soft text-dd-success'
                            }`}
                          >
                            {schedule.available < 1 ? 'Penuh' : `${schedule.available} tempat`}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ed-ink">
                          <Clock3 className="size-4 text-ed-muted" />
                          <span>
                            {new Intl.DateTimeFormat('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: schedule.timezone,
                            }).format(sStart)}{' '}
                            –{' '}
                            {new Intl.DateTimeFormat('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: schedule.timezone,
                            }).format(sEnd)}{' '}
                            WIB
                          </span>
                          <span className="text-xs text-ed-muted">({sDuration}m)</span>
                        </div>
                        {schedule.branch && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-ed-muted">
                            <MapPin className="size-3.5" />
                            <span>{schedule.branch.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 border-t border-ed-line pt-3 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-ed-green group-hover:underline">
                          <span>Detail & Booking</span>
                          <ArrowRight className="size-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 4: Panduan & FAQ (dikelola di Konten Publik; bawaan bila belum ada yang terbit) */}
          <ClassFaqSection items={faq?.items} />
        </>
      )}
    </PublicDetailFrame>
  );
}
