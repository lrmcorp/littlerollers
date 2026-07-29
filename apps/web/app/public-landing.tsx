'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { accountClient, type PublicSiteConfig } from './account-client';
import { PublicFooter } from './components/public/public-footer';
import { PublicHeader } from './components/public/public-header';
import {
  publicContainer as container,
  publicPrimaryButton as primaryButton,
  publicSecondaryButton as secondaryButton,
} from './components/public/public-styles';
import { routes } from './routes';

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
  ['◎', 'Instruktur berpengalaman', 'Pendampingan yang terarah di setiap sesi'],
  ['◉', 'Kelas berukuran kecil', 'Perhatian personal dalam suasana yang nyaman'],
  ['▱', 'Peralatan premium', 'Peralatan Pilates berkualitas untuk latihan yang aman'],
  ['⌖', 'Dua pilihan studio', 'Berlatih di Jakarta atau BSD'],
  ['▦', 'Jadwal fleksibel', 'Pilih jadwal yang sesuai dengan ritme Anda'],
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
        <section
          className="relative isolate min-h-[520px] overflow-hidden max-[780px]:min-h-[600px]"
          aria-labelledby="marketing-hero-title"
        >
          <Image
            className="-z-20 object-cover object-[62%_center]"
            src="/images/public/landing/hero-pilates.png"
            fill
            priority
            sizes="100vw"
            alt="Kelas Reformer Pilates di studio yang terang dan tenang"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(248,246,241,0.98)_0%,rgba(248,246,241,0.92)_31%,rgba(248,246,241,0.2)_68%,transparent_100%)] max-[780px]:bg-[linear-gradient(90deg,rgba(248,246,241,0.98)_0%,rgba(248,246,241,0.88)_58%,rgba(248,246,241,0.3)_100%)]" />
          <div
            className={`${container} flex min-h-[520px] items-center py-16 max-[780px]:min-h-[600px]`}
          >
            <div className="max-w-[510px]">
              <p className="mb-3 text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">
                Move better, live better
              </p>
              <h1
                aria-label="Stronger Body. Calmer Mind."
                className="m-0 font-sans text-[clamp(3.4rem,6vw,5.8rem)] leading-[0.9] font-semibold tracking-[-0.04em]"
                id="marketing-hero-title"
              >
                Stronger Body.
                <br />
                Calmer Mind.
              </h1>
              <p className="mt-6 max-w-[460px] text-base leading-7">
                Daily Dose Pilates adalah studio modern yang membantu Anda merasa lebih kuat,
                bergerak lebih baik, dan menjalani hari dengan lebih seimbang.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link className={primaryButton} href={`${routes.classes}#schedule`}>
                  Lihat Jadwal <span aria-hidden="true">›</span>
                </Link>
                <Link className={secondaryButton} href={routes.packages}>
                  Lihat Paket <span aria-hidden="true">›</span>
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-2 px-1 text-sm font-bold text-dd-forest no-underline underline-offset-4 hover:underline"
                  href={routes.locations}
                >
                  Jelajahi Studio <span aria-hidden="true">›</span>
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-dd-muted">
                <span>Latihan personal dan kelompok kecil</span>
                <strong className="tracking-wider text-[#eda82f]" aria-label="Lima bintang">
                  ★★★★★
                </strong>
                <span>Move with intention</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="grid grid-cols-5 border-y border-dd-line bg-white/65 max-[780px]:grid-cols-2"
          id="instructors"
          aria-label="Keunggulan studio"
        >
          {benefits.map(([icon, title, description], index) => (
            <article
              className={`grid min-h-[160px] place-items-center border-dd-line px-5 py-7 text-center ${
                index < 4 ? 'border-r' : ''
              } max-[780px]:border-r max-[780px]:border-b max-[780px]:last:col-span-2`}
              key={title}
            >
              <span className="text-4xl text-dd-forest" aria-hidden="true">
                {icon}
              </span>
              <strong className="mt-2 text-sm">{title}</strong>
              <p className="m-0 max-w-[190px] text-[13px] leading-5 text-dd-muted">{description}</p>
            </article>
          ))}
        </section>

        <section className={`${container} my-12`} id="about">
          <div
            className="grid overflow-hidden rounded-dd-lg bg-dd-forest text-white shadow-dd-card lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)] xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
            data-testid="studio-showcase"
          >
            <div className="relative min-h-[300px] sm:min-h-[360px] lg:min-h-[480px]">
              <Image
                className="object-cover"
                src="/images/public/landing/studio-showcase.png"
                fill
                sizes="(max-width: 1023px) 100vw, 44vw"
                alt="Reception Daily Dose Pilates dengan interior hangat"
              />
            </div>
            <div className="grid min-w-0 content-between gap-6 p-[clamp(28px,3vw,40px)]">
              <div className="max-w-[620px] min-w-0">
                <p className="text-xs font-bold tracking-[0.13em] text-white/75 uppercase">
                  Studio kami
                </p>
                <h2 className="mt-3 max-w-[18ch] font-sans text-[clamp(2.25rem,3.5vw,3rem)] leading-[1.06] font-semibold text-balance">
                  Ruang tenang yang dirancang untuk bergerak
                </h2>
                <p className="mt-5 max-w-[58ch] text-sm leading-6 text-white/80">
                  Studio yang bersih, tenang, dan tertata untuk mendukung perjalanan Pilates Anda.
                </p>
                <Link
                  className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-dd-sm border border-white/50 px-5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
                  href={routes.locations}
                >
                  Jelajahi Studio <span aria-hidden="true">›</span>
                </Link>
              </div>
              <dl className="grid grid-cols-2 overflow-hidden rounded-dd-md border border-white/20 xl:grid-cols-4">
                {[
                  ['Studio', siteConfig ? `${studioCount} lokasi` : 'Memuat…'],
                  ['Format', 'Personal & kelompok'],
                  ['Durasi', classDuration],
                  ['Area', studioAreas],
                ].map(([term, value], index) => (
                  <div
                    className={`min-w-0 p-4 ${
                      index === 0
                        ? 'border-r border-b border-white/20 xl:border-b-0'
                        : index === 1
                          ? 'border-b border-white/20 xl:border-r xl:border-b-0'
                          : index === 2
                            ? 'border-r border-white/20'
                            : ''
                    }`}
                    key={term}
                  >
                    <dt className="text-[11px] font-semibold tracking-[0.08em] text-white/65 uppercase">
                      {term}
                    </dt>
                    <dd className="mt-2 text-lg leading-6 font-semibold text-pretty sm:text-xl">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className={`${container} py-8`} aria-labelledby="popular-title">
          <div className="mb-6 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-dd-forest uppercase">
                Kelas populer
              </p>
              <h2
                className="mt-2 font-sans text-[clamp(2.4rem,4vw,3.6rem)] leading-none"
                id="popular-title"
              >
                Temukan kelas sesuai tujuan Anda
              </h2>
            </div>
            <Link className="text-sm font-bold text-dd-forest" href={routes.classes}>
              Lihat semua kelas ›
            </Link>
          </div>
          {catalogError ? (
            <div className="rounded-dd-md border border-dd-line bg-white p-6 text-sm text-dd-muted">
              {catalogError}
            </div>
          ) : classCards.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {classCards.map(({ code, name, summary, level, heroImageKey, slug }) => (
                <article
                  className="min-w-0 overflow-hidden rounded-dd-md bg-white shadow-dd-card"
                  key={code}
                >
                  <div className="relative h-[150px]">
                    <Image
                      src={`/images/public/${heroImageKey}`}
                      fill
                      sizes="260px"
                      alt={`${name} di Daily Dose Pilates`}
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-sans text-xl font-semibold">{name}</h3>
                    <p className="mt-2 min-h-10 text-[13px] leading-5 text-dd-muted">{summary}</p>
                    <span className="mt-3 inline-flex rounded-full bg-[#e7eee8] px-2.5 py-1 text-xs text-dd-forest">
                      {level}
                    </span>
                    <Link
                      className="mt-4 block text-sm font-bold text-dd-forest"
                      href={`/classes/${slug}`}
                    >
                      Lihat detail ›
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-dd-md border border-dd-line bg-white p-6 text-sm text-dd-muted">
              Kelas aktif belum tersedia.
            </div>
          )}
        </section>

        <section
          className={`${container} py-10`}
          id="testimonials"
          aria-labelledby="testimonials-title"
        >
          <p
            className="text-center text-xs font-bold tracking-[0.13em] text-dd-forest uppercase"
            id="testimonials-title"
          >
            Prinsip gerak kami
          </p>
          <div className="mt-6 grid grid-cols-3 divide-x divide-dd-line max-[760px]:grid-cols-1 max-[760px]:divide-y max-[760px]:divide-x-0">
            <blockquote className="m-0 p-6 font-sans text-2xl leading-8">
              “Consistency is not perfection. It is choosing to return to yourself.”
            </blockquote>
            {[
              ['Move with confidence', 'Temukan progres melalui gerak yang terarah dan konsisten.'],
              [
                'Train at your pace',
                'Pilih format latihan yang sesuai dengan kebutuhan tubuh Anda.',
              ],
            ].map(([title, copy]) => (
              <article className="p-6" key={title}>
                <strong>{title}</strong>
                <p className="mt-2 text-sm leading-6 text-dd-muted">{copy}</p>
                <span className="text-[#eda82f]" aria-label="Lima bintang">
                  ★★★★★
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className={`${container} my-8`} aria-labelledby="package-cta-title">
          <div
            className="grid overflow-hidden rounded-dd-lg border border-dd-line bg-white shadow-dd-card lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]"
            data-testid="package-journey"
          >
            <div className="min-w-0 p-7 sm:p-10">
              <p className="text-xs font-bold tracking-[0.13em] text-dd-forest uppercase">
                Paket Daily Dose
              </p>
              <h2
                className="mt-3 max-w-[16ch] font-sans text-[clamp(2.25rem,4vw,3rem)] leading-[1.06] font-semibold text-balance"
                id="package-cta-title"
              >
                Bangun rutinitas yang konsisten.
              </h2>
              <p className="mt-4 max-w-[58ch] leading-7 text-dd-muted">
                Bandingkan paket berdasarkan studio, tipe kelas, jumlah sesi, dan masa berlaku.
                Seluruh harga ditampilkan langsung dari katalog aktif.
              </p>
              <Link className={`${primaryButton} mt-6`} href={routes.packages}>
                Pilih Paket <span aria-hidden="true">›</span>
              </Link>
            </div>
            <ol className="grid border-t border-dd-line bg-dd-paper lg:border-t-0 lg:border-l">
              {[
                ['01', 'Pilih studio', 'Harga dan paket mengikuti lokasi tempat Anda berlatih.'],
                ['02', 'Bandingkan paket', 'Lihat jumlah sesi, masa berlaku, dan harga per sesi.'],
                ['03', 'Booking kelas', 'Gunakan paket aktif untuk memilih jadwal yang tersedia.'],
              ].map(([number, label, description], index) => (
                <li
                  className={`grid min-w-0 grid-cols-[44px_minmax(0,1fr)] items-start gap-4 p-5 ${
                    index < 2 ? 'border-b border-dd-line' : ''
                  }`}
                  key={number}
                >
                  <span className="grid size-10 place-items-center rounded-full border border-dd-brass/35 bg-dd-brass-soft text-xs font-bold text-dd-brass-dark">
                    {number}
                  </span>
                  <div className="min-w-0 pt-1">
                    <strong className="text-base text-dd-ink">{label}</strong>
                    <p className="mt-1 text-sm leading-6 text-dd-muted">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className={`${container} my-8 grid items-center gap-8 rounded-dd-lg bg-dd-forest px-[clamp(28px,7vw,96px)] py-9 text-white md:grid-cols-2`}
        >
          <div>
            <h2 className="font-sans text-3xl">Temukan kelas Pilates yang sesuai untuk Anda</h2>
            <p className="mt-2 text-sm text-white/80">
              Lihat jadwal, pilih studio, dan temukan kelas yang sesuai dengan tujuan Anda.
            </p>
          </div>
          <div className="grid justify-items-center gap-2">
            <Link
              className="inline-flex min-h-11 w-full max-w-[320px] items-center justify-center rounded-dd-sm bg-white font-bold text-dd-forest"
              href={`${routes.classes}#schedule`}
            >
              Lihat Jadwal <span aria-hidden="true">›</span>
            </Link>
            <small>Pilih kelas berdasarkan studio dan waktu yang tersedia.</small>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
