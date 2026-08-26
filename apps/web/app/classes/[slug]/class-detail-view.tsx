'use client';

import Link from 'next/link';
import {
  CalendarDays,
  Check,
  Clock3,
  Dumbbell,
  Gauge,
  HeartPulse,
  HelpCircle,
  Info,
  MapPin,
  Sparkles,
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

  const classNameFormatted = item
    ? item.profile.code === 'BARRE'
      ? 'Barre'
      : item.profile.code === 'MAT'
        ? 'Mat Pilates'
        : item.profile.code === 'REFORMER'
          ? 'Reformer Pilates'
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
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-3.5 py-2 font-medium text-dd-ink shadow-xs">
                  <Gauge className="size-4 text-dd-forest" />
                  {item.profile.level}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-forest/30 bg-emerald-50 px-3.5 py-2 font-semibold text-dd-forest shadow-xs">
                  <Timer className="size-4 text-dd-forest" />
                  Durasi {item.profile.durationMinutes} Menit
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-dd-line bg-white px-3.5 py-2 font-medium text-dd-ink shadow-xs">
                  <MapPin className="size-4 text-dd-forest" />
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
          <section className={`${publicContainer} grid gap-10 py-12 lg:grid-cols-[1fr_0.85fr]`}>
            <article className="space-y-8">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">
                  Tentang Kelas
                </p>
                <h2 className="mt-2 text-2xl font-bold text-dd-ink sm:text-3xl">
                  Bergerak dengan Presisi & Tujuan
                </h2>
                <p className="mt-4 text-base leading-relaxed text-dd-muted">
                  {item.profile.description}
                </p>
              </div>

              {/* Fokus Latihan */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-dd-lg border border-dd-line bg-white p-5 shadow-xs">
                  <div className="flex size-9 items-center justify-center rounded-dd-sm bg-emerald-50 text-dd-forest">
                    <HeartPulse className="size-5" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-dd-ink">Kekuatan Inti (Core)</h3>
                  <p className="mt-1 text-xs leading-relaxed text-dd-muted">
                    Melatih otot penopang tubuh bagian dalam untuk stabilitas maksimal.
                  </p>
                </div>
                <div className="rounded-dd-lg border border-dd-line bg-white p-5 shadow-xs">
                  <div className="flex size-9 items-center justify-center rounded-dd-sm bg-emerald-50 text-dd-forest">
                    <Dumbbell className="size-5" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-dd-ink">Postur & Keselarasan</h3>
                  <p className="mt-1 text-xs leading-relaxed text-dd-muted">
                    Memperbaiki pola gerak harian dan meredakan ketegangan otot leher serta
                    punggung.
                  </p>
                </div>
              </div>

              {/* Manfaat Kelas */}
              {item.profile.benefits && item.profile.benefits.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold text-dd-ink">
                    <Sparkles className="size-5 text-dd-forest" />
                    Manfaat Utama Latihan
                  </h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {item.profile.benefits.map((benefit) => (
                      <li
                        className="flex items-start gap-3 rounded-dd-md border border-dd-line bg-white p-4 shadow-xs"
                        key={benefit}
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-dd-forest" />
                        <span className="text-sm font-medium text-dd-ink">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            {/* Sidebar Kanan: Perlengkapan & Studio */}
            <aside className="space-y-6">
              {/* Perlengkapan */}
              <div className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card">
                <h3 className="flex items-center gap-2 text-lg font-bold text-dd-ink">
                  <Info className="size-5 text-dd-forest" />
                  Perlengkapan Sesi
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-dd-muted">
                  Studio menyediakan seluruh peralatan utama. Peserta disarankan membawa
                  perlengkapan pribadi berikut:
                </p>
                <ul className="mt-4 space-y-2.5">
                  {item.profile.equipment.map((value) => (
                    <li key={value} className="flex items-center gap-2.5 text-sm text-dd-ink">
                      <span className="size-2 rounded-full bg-dd-forest" />
                      {value}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Studio Tersedia */}
              <div className="rounded-dd-lg border border-dd-line bg-dd-paper p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-dd-ink">
                  <MapPin className="size-5 text-dd-forest" />
                  Studio yang Menyediakan Kelas Ini
                </h3>
                <div className="mt-4 space-y-2.5">
                  {item.studios.map((studio) => (
                    <Link
                      className="block rounded-dd-md border border-dd-line bg-white p-4 no-underline transition-colors hover:border-dd-forest"
                      href={`/locations/${studio.publicProfile.slug}`}
                      key={studio.id}
                    >
                      <strong className="block text-sm font-semibold text-dd-ink">
                        {studio.name}
                      </strong>
                      <span className="mt-1 block text-xs text-dd-muted">
                        {studio.publicProfile.area}, {studio.publicProfile.city}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          {/* Section 2: Paket Kelas Terkait */}
          {item.packages.length > 0 && (
            <section className="border-y border-dd-line bg-white py-12">
              <div className={publicContainer}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">
                      Pilihan Paket
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-dd-ink sm:text-3xl">
                      Paket Terkait Kelas Ini
                    </h2>
                  </div>
                  <Link className={publicSecondaryButton} href="/packages">
                    Lihat semua paket →
                  </Link>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {item.packages.slice(0, 6).map((pkg) => (
                    <article
                      className="flex flex-col justify-between rounded-dd-lg border border-dd-line bg-dd-paper p-6 shadow-xs transition-shadow hover:shadow-dd-card"
                      key={`${pkg.id}:${pkg.branch.id}`}
                    >
                      <div>
                        <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 uppercase">
                          {pkg.branch.name}
                        </span>
                        <h3 className="mt-3 text-xl font-bold text-dd-ink">{pkg.name}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-dd-muted">
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
                      <div className="mt-6 border-t border-dd-line pt-4">
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
            <section className={`${publicContainer} py-12`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">
                    Jadwal Terdekat
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-dd-ink sm:text-3xl">
                    Sesi {classNameFormatted} Mendatang
                  </h2>
                </div>
                <Link className={publicSecondaryButton} href="/classes#schedule">
                  Buka kalender jadwal →
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
                      className="group flex flex-col justify-between rounded-dd-lg border border-dd-line bg-white p-5 no-underline shadow-xs transition-all hover:border-dd-forest hover:shadow-dd-card"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-dd-forest">
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
                                ? 'bg-red-100 text-red-700'
                                : schedule.available <= 2
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {schedule.available < 1 ? 'Penuh' : `${schedule.available} tempat`}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-dd-ink">
                          <Clock3 className="size-4 text-dd-muted" />
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
                          <span className="text-xs text-dd-muted">({sDuration}m)</span>
                        </div>
                        {schedule.branch && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-dd-muted">
                            <MapPin className="size-3.5" />
                            <span>{schedule.branch.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 border-t border-dd-line pt-3 text-right">
                        <span className="text-xs font-bold text-dd-forest group-hover:underline">
                          Detail & Booking →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 4: Panduan & FAQ */}
          <section className="border-t border-dd-line bg-dd-paper py-12">
            <div className={`${publicContainer} max-w-4xl`}>
              <div className="text-center">
                <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">
                  Panduan Kelas
                </p>
                <h2 className="mt-1 text-2xl font-bold text-dd-ink sm:text-3xl">
                  Pertanyaan Seputar Kelas Ini
                </h2>
              </div>
              <div className="mt-8 space-y-4">
                <div className="rounded-dd-lg border border-dd-line bg-white p-5 shadow-xs">
                  <h3 className="flex items-center gap-2 text-base font-bold text-dd-ink">
                    <HelpCircle className="size-4 text-dd-forest" />
                    Apakah kelas ini cocok untuk pemula yang belum pernah mencoba?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dd-muted">
                    Ya, instruktur kami akan memberikan panduan penyesuaian gerakan (modifikasi)
                    sesuai tingkat fleksibilitas dan kenyamanan tubuh Anda.
                  </p>
                </div>
                <div className="rounded-dd-lg border border-dd-line bg-white p-5 shadow-xs">
                  <h3 className="flex items-center gap-2 text-base font-bold text-dd-ink">
                    <HelpCircle className="size-4 text-dd-forest" />
                    Apa yang harus saya siapkan sebelum kelas dimulai?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dd-muted">
                    Kenakan pakaian olahraga yang nyaman dan grip socks (kaos kaki antiselip).
                    Datang 15 menit lebih awal untuk persiapan check-in dan pengenalan studio.
                  </p>
                </div>
                <div className="rounded-dd-lg border border-dd-line bg-white p-5 shadow-xs">
                  <h3 className="flex items-center gap-2 text-base font-bold text-dd-ink">
                    <HelpCircle className="size-4 text-dd-forest" />
                    Bagaimana jika saya perlu membatalkan atau mengubah jadwal?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dd-muted">
                    Pembatalan dan permohonan reschedule dapat dilakukan secara mandiri melalui menu
                    Dashboard akun Anda sebelum batas waktu yang ditentukan pada paket Anda.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </PublicDetailFrame>
  );
}
