'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Award, Calendar, ChevronRight, MapPin, Sparkles, Star, Users } from 'lucide-react';

import { accountClient, type PublicSiteConfig } from '@/api-clients/account-client';
import { PublicFooter } from './components/public/public-footer';
import { PublicHeader } from './components/public/public-header';
import {
  publicContainer as container,
  publicPrimaryButton as primaryButton,
  publicSecondaryButton as secondaryButton,
} from './components/public/public-styles';
import { HeroCarousel } from './components/public/hero-carousel';
import { routes } from '@/lib/routes';
import { resolvePublicImageUrl } from './lib/public-image-url';

export function studioAreaSummary(branches: PublicSiteConfig['branches']) {
  const areas = branches
    .map((branch) => {
      const configured = branch.publicProfile?.city || branch.publicProfile?.area;
      return configured?.trim() || branch.name.replace(/^Daily Dose\s+/iu, '').trim();
    })
    .filter(Boolean)
    .filter((area, index, values) => values.indexOf(area) === index);
  if (!areas.length) return 'Belum tersedia';
  if (areas.length === 1) return areas[0]!;
  if (areas.length === 2) return areas.join(' & ');
  return `${areas.slice(0, 2).join(', ')} +${areas.length - 2}`;
}

export function classDurationSummary(classes: PublicSiteConfig['classes']) {
  const durations = classes
    .map(({ durationMinutes }) => durationMinutes)
    .filter((duration) => Number.isFinite(duration) && duration > 0)
    .filter((duration, index, values) => values.indexOf(duration) === index)
    .sort((left, right) => left - right);
  if (!durations.length) return 'Bervariasi';
  if (durations.length === 1) return `${durations[0]} menit`;
  return `${durations[0]}–${durations.at(-1)} menit`;
}

const benefits = [
  {
    icon: Award,
    title: 'Instruktur berpengalaman',
    description: 'Pendampingan yang terarah di setiap sesi',
  },
  {
    icon: Users,
    title: 'Kelas berukuran kecil',
    description: 'Perhatian personal dalam suasana yang nyaman',
  },
  {
    icon: Sparkles,
    title: 'Peralatan premium',
    description: 'Peralatan Pilates berkualitas untuk latihan yang aman',
  },
  { icon: MapPin, title: '5 pilihan studio', description: 'Berlatih di Jakarta, Tangerang, atau Surabaya' },
  {
    icon: Calendar,
    title: 'Jadwal fleksibel',
    description: 'Pilih jadwal yang sesuai dengan ritme Anda',
  },
] as const;

export function PublicLanding() {
  const [siteConfig, setSiteConfig] = useState<PublicSiteConfig | null>(null);
  const [catalogError, setCatalogError] = useState('');

  useEffect(() => {
    let active = true;
    accountClient
      .siteConfig()
      .then((result) => {
        if (active) setSiteConfig(result);
      })
      .catch(() => {
        if (active) setCatalogError('Informasi studio belum dapat dimuat.');
      });
    return () => {
      active = false;
    };
  }, []);

  const classCards = siteConfig?.classes ?? [];
  const studioCount = siteConfig?.branches.length ?? 0;
  const studioAreas = siteConfig ? studioAreaSummary(siteConfig.branches) : 'Memuat…';
  const classDuration = siteConfig ? classDurationSummary(siteConfig.classes ?? []) : 'Memuat…';

  return (
    <div className="min-w-0 overflow-hidden bg-dd-cream font-sans text-dd-ink" id="top">
      <a className="skip-link" href="#public-main">
        Langsung ke konten utama
      </a>
      <PublicHeader />

      <main id="public-main">
        {/* Hero Carousel Section */}
        <HeroCarousel config={siteConfig?.heroCarousel} />

        {/* 4 Pillars of Studio Excellence (Replaces generic 5 icon boxes) */}
        <section
          className="border-y border-dd-line/70 bg-white/90 backdrop-blur-md py-12 sm:py-16"
          id="instructors"
          aria-label="Keunggulan studio"
        >
          <div className={container}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  number: '01',
                  title: 'Intimate Class Size',
                  subtitle: 'Kelas berukuran kecil',
                  description:
                    'Kapasitas kelas kecil maksimal 4 peserta untuk perhatian personal dalam suasana yang nyaman, aman, dan terarah.',
                },
                {
                  number: '02',
                  title: 'Certified Mastery',
                  subtitle: 'Instruktur berpengalaman',
                  description:
                    'Pendampingan yang terarah di setiap sesi oleh instruktur berdedikasi dan bersertifikasi.',
                },
                {
                  number: '03',
                  title: 'State-of-the-Art',
                  subtitle: 'Peralatan premium',
                  description:
                    'Peralatan Pilates berkualitas untuk latihan yang aman, halus, dan presisi.',
                },
                {
                  number: '04',
                  title: 'Sanctuary Atmosphere',
                  subtitle: '5 pilihan studio',
                  description:
                    'Berlatih di 5 studio kami di Jakarta, Tangerang, dan Surabaya dengan jadwal fleksibel yang sesuai ritme Anda.',
                },
              ].map(({ number, title, subtitle, description }) => (
                <article
                  key={number}
                  className="space-y-2.5 border-l-2 border-dd-brass/30 pl-5 transition hover:border-dd-forest"
                >
                  <span className="font-sans text-2xl sm:text-3xl font-bold text-dd-brass">
                    {number}
                  </span>
                  <div>
                    <strong className="block font-sans text-sm font-bold tracking-tight text-dd-ink">
                      {title}
                    </strong>
                    <p className="text-[11px] font-semibold text-dd-forest uppercase tracking-wider">
                      {subtitle}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-dd-muted">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Studio Showcase Section */}
        <section className={`${container} my-14 sm:my-20`} id="about">
          <div
            className="grid overflow-hidden rounded-2xl bg-dd-forest text-white shadow-dd-card lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
            data-testid="studio-showcase"
          >
            <div className="relative min-h-[300px] sm:min-h-[380px] lg:min-h-full">
              <Image
                className="object-cover"
                src="/images/public/landing/studio-showcase.png"
                fill
                sizes="(max-width: 1023px) 100vw, 45vw"
                alt="Reception Daily Dose Pilates dengan interior hangat"
              />
            </div>
            <div className="flex flex-col justify-between gap-8 p-7 sm:p-10 lg:p-12">
              <div className="space-y-4">
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider text-dd-brass uppercase backdrop-blur-md">
                  Studio kami
                </span>
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white tracking-tight">
                  Ruang tenang yang dirancang untuk <span className="italic">bergerak</span>
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-white/80 max-w-xl">
                  Studio yang bersih, tenang, dan tertata untuk mendukung perjalanan Pilates Anda
                  dengan kenyamanan maksimal dan privasi tinggi.
                </p>
                <div className="pt-2">
                  <Link
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-dd-sm border border-white/40 bg-white/10 px-5 text-xs sm:text-sm font-bold text-white transition hover:bg-white hover:text-dd-forest backdrop-blur-md"
                    href={routes.locations}
                  >
                    <span>Jelajahi Studio</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              {/* Stats Grid */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden m-0">
                {[
                  ['Studio', siteConfig ? `${studioCount} lokasi` : 'Memuat…'],
                  ['Format', 'Personal & kelompok'],
                  ['Durasi', classDuration],
                  ['Area', studioAreas],
                ].map(([term, value], index) => (
                  <div
                    className={`p-4 ${
                      index < 3 ? 'border-r border-white/15' : ''
                    } ${index < 2 ? 'border-b sm:border-b-0 border-white/15' : ''}`}
                    key={term}
                  >
                    <dt className="text-[11px] font-semibold tracking-wider text-white/60 uppercase">
                      {term}
                    </dt>
                    <dd className="mt-1 font-sans text-lg sm:text-xl font-semibold text-white">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Popular Classes Section */}
        <section className={`${container} py-10 sm:py-14`} aria-labelledby="popular-title">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-dd-forest/10 px-3 py-0.5 text-xs font-bold tracking-wider text-dd-forest uppercase">
                Kelas populer
              </span>
              <h2
                className="mt-2 font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-dd-ink"
                id="popular-title"
              >
                Temukan kelas sesuai <span className="italic text-dd-forest">tujuan Anda</span>
              </h2>
            </div>
            <Link
              className="inline-flex items-center gap-1 text-sm font-bold text-dd-forest hover:underline"
              href={routes.classes}
            >
              <span>Lihat semua kelas</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {catalogError ? (
            <div className="rounded-dd-md border border-dd-line bg-white p-6 text-sm text-dd-muted">
              {catalogError}
            </div>
          ) : classCards.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classCards.map(({ code, name, summary, level, heroImageKey, slug }) => (
                <article
                  className="group overflow-hidden rounded-2xl border border-dd-line bg-white shadow-dd-card transition hover:-translate-y-1 hover:shadow-dd-float"
                  key={code}
                >
                  <div className="relative h-[230px] sm:h-[250px] overflow-hidden">
                    {(() => {
                      const defaultClassImages: Record<string, string> = {
                        REFORMER: '/images/public/classes/reformer-pilates.png',
                        MAT: '/images/public/classes/mat-pilates.png',
                        CADILLAC: '/images/public/classes/cadillac-pilates.png',
                        CHAIR: '/images/public/classes/chair-pilates.png',
                        GROUP_CLASS: '/images/public/classes/reformer-pilates.png',
                        PRIVATE_CLASS: '/images/public/classes/cadillac-pilates.png',
                        SEMI_PRIVATE: '/images/public/classes/reformer-pilates.png',
                      };
                      const fallback = defaultClassImages[code] ?? '/images/public/classes/reformer-pilates.png';
                      const classImageSrc = resolvePublicImageUrl(heroImageKey, fallback);
                      return (
                        <Image
                          src={classImageSrc}
                          fill
                          sizes="340px"
                          alt={`${name} di Daily Dose Pilates`}
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      );
                    })()}
                    <div className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-dd-forest shadow-2xs backdrop-blur-md">
                      {level}
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="font-sans text-xl sm:text-2xl font-semibold text-dd-ink group-hover:text-dd-forest transition">
                      {name}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-dd-muted min-h-[40px]">
                      {summary}
                    </p>
                    <div className="pt-2 border-t border-dd-line/60 flex items-center justify-between">
                      <Link
                        className="inline-flex items-center gap-1 text-xs font-bold text-dd-forest group-hover:underline"
                        href={`/classes/${slug}`}
                      >
                        <span>Lihat detail</span>
                        <ChevronRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : siteConfig === null ? (
            <div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              aria-busy="true"
              aria-label="Memuat kelas"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-dd-line bg-white shadow-dd-card"
                  aria-hidden="true"
                >
                  <div className="h-[220px] animate-pulse bg-dd-line/60" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-3/4 animate-pulse rounded-full bg-dd-line/60" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-dd-line/40" />
                    <div className="h-4 w-5/6 animate-pulse rounded-full bg-dd-line/40" />
                    <div className="mt-4 h-6 w-1/3 animate-pulse rounded-full bg-dd-line/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-dd-md border border-dd-line bg-white p-6 text-sm text-dd-muted">
              Kelas aktif belum tersedia.
            </div>
          )}
        </section>

        {/* Voices of Practice (Testimoni Otentik Member & Filosofi Studio) */}
        <section
          className={`${container} py-14 sm:py-18`}
          id="testimonials"
          aria-labelledby="testimonials-title"
        >
          <div className="text-center space-y-2 mb-10">
            <span
              className="inline-block rounded-full border border-dd-forest/20 bg-dd-forest/5 px-4 py-1 text-xs font-semibold tracking-wider text-dd-forest uppercase"
              id="testimonials-title"
            >
              Cerita &amp; Pengalaman Member
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-dd-ink">
              Refined Movement. <span className="italic text-dd-forest">Real Transformation.</span>
            </h2>
            <p className="mx-auto max-w-xl text-xs sm:text-sm text-dd-muted">
              Pengalaman nyata member yang membangun rutinitas gerak berkualitas di studio Daily Dose.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                quote:
                  'Suasana kelas reformer di Daily Dose sangat nyaman dan privat. Instruktur sangat teliti mengoreksi postur tubuh saya dari sesi pertama.',
                name: 'Maya S.',
                role: 'Member Daily Dose Green Garden',
                studio: 'Jakarta Barat',
              },
              {
                quote:
                  'Peralatan reformer sangat mulus dan presisi. Jadwal kelas fleksibel dan terbukti sangat membantu meredakan keluhan sakit punggung saya.',
                name: 'Ronald K.',
                role: 'Member Daily Dose Muara Karang',
                studio: 'Jakarta Utara',
              },
              {
                quote:
                  'Sebagai pemula pilates, bimbingan Coach sangat sabar dan suportif. Suasana kelas kecil maksimal 4 orang membuat latihan terasa sangat personal.',
                name: 'Clarissa W.',
                role: 'Member Daily Dose Graha Family',
                studio: 'Surabaya',
              },
            ].map((t) => (
              <blockquote
                key={t.name}
                className="m-0 flex flex-col justify-between rounded-2xl border border-dd-line/80 bg-white p-6 sm:p-7 shadow-dd-card font-sans transition hover:border-dd-forest hover:shadow-dd-soft"
              >
                <div>
                  <span className="text-3xl text-dd-brass font-sans leading-none select-none">“</span>
                  <p className="my-3 text-xs sm:text-sm leading-relaxed text-dd-ink italic">
                    {t.quote}
                  </p>
                </div>
                <footer className="border-t border-dd-line/60 pt-3.5 mt-2">
                  <strong className="block text-xs font-bold text-dd-ink">{t.name}</strong>
                  <span className="block text-[11px] text-dd-muted">{t.role} · {t.studio}</span>
                </footer>
              </blockquote>
            ))}
          </div>

          <div className="mx-auto max-w-2xl text-center rounded-xl border border-dd-forest/15 bg-dd-forest/5 p-6 shadow-xs">
            <span className="text-2xl text-dd-brass font-sans leading-none">“</span>
            <p className="my-2 text-sm sm:text-base font-medium italic text-dd-ink">
              Consistency is not perfection. It is choosing to return to yourself.
            </p>
            <span className="text-[11px] font-bold tracking-wider text-dd-forest uppercase">
              Daily Dose Movement Philosophy
            </span>
          </div>
        </section>

        {/* Package CTA & Journey Steps */}
        <section className={`${container} my-10 sm:my-16`} aria-labelledby="package-cta-title">
          <div
            className="grid overflow-hidden rounded-2xl border border-dd-line bg-white shadow-dd-card lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]"
            data-testid="package-journey"
          >
            <div className="p-8 sm:p-12 space-y-4">
              <span className="inline-block rounded-full bg-dd-forest/10 px-3 py-0.5 text-xs font-bold tracking-wider text-dd-forest uppercase">
                Paket Daily Dose
              </span>
              <h2
                className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-dd-ink leading-tight"
                id="package-cta-title"
              >
                Bangun rutinitas yang <span className="italic text-dd-forest">konsisten</span>.
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-dd-muted max-w-lg">
                Bandingkan paket berdasarkan studio, tipe kelas, jumlah sesi, dan masa berlaku.
                Seluruh harga ditampilkan langsung dari katalog aktif.
              </p>
              <div className="pt-3">
                <Link className={`${primaryButton} inline-flex items-center gap-1.5`} href={routes.packages}>
                  <span>Pilih Paket</span>
                  <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <ol className="flex flex-col justify-center border-t border-dd-line bg-dd-surface-muted/30 lg:border-t-0 lg:border-l divide-y divide-dd-line/60 m-0 p-0 list-none">
              {[
                ['01', 'Pilih studio', 'Harga dan paket mengikuti lokasi tempat Anda berlatih.'],
                ['02', 'Bandingkan paket', 'Lihat jumlah sesi, masa berlaku, dan harga per sesi.'],
                ['03', 'Booking kelas', 'Gunakan paket aktif untuk memilih jadwal yang tersedia.'],
              ].map(([number, label, description]) => (
                <li
                  className="flex items-start gap-4 p-6 transition hover:bg-white/60"
                  key={number}
                >
                  <span className="font-sans grid size-9 shrink-0 place-items-center rounded-full border border-dd-brass/40 bg-dd-brass-soft text-sm font-bold text-dd-brass-dark">
                    {number}
                  </span>
                  <div className="space-y-0.5">
                    <strong className="text-sm font-bold text-dd-ink">{label}</strong>
                    <p className="text-xs leading-relaxed text-dd-muted m-0">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Bottom Banner */}
        <section
          className={`${container} my-12 sm:my-16 rounded-2xl bg-dd-forest p-8 sm:p-14 text-white shadow-dd-float`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-snug">
                Temukan kelas Pilates yang <span className="italic">sesuai untuk Anda</span>
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Lihat jadwal, pilih studio, dan temukan kelas yang sesuai dengan tujuan Anda.
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-2">
              <Link
                className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-1.5 rounded-dd-sm bg-white px-8 text-sm font-bold text-dd-forest shadow-dd-soft hover:bg-white/95 transition"
                href={`${routes.classes}#schedule`}
              >
                <span>Lihat Jadwal</span>
                <ChevronRight className="size-3.5" />
              </Link>
              <small className="text-xs text-white/60">
                Pilih kelas berdasarkan studio dan waktu yang tersedia.
              </small>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
