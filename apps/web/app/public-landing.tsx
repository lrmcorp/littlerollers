import Image from 'next/image';
import Link from 'next/link';

import { PublicFooter } from './components/public/public-footer';
import { PublicHeader } from './components/public/public-header';
import {
  publicContainer as container,
  publicPrimaryButton as primaryButton,
  publicSecondaryButton as secondaryButton,
} from './components/public/public-styles';
import { publicClasses, publicStudios } from './public-content';
import { routes } from './routes';

const benefits = [
  ['◎', 'Instruktur berpengalaman', 'Pendampingan yang terarah di setiap sesi'],
  ['◉', 'Kelas berukuran kecil', 'Perhatian personal dalam suasana yang nyaman'],
  ['▱', 'Peralatan premium', 'Peralatan Pilates berkualitas untuk latihan yang aman'],
  ['⌖', 'Dua pilihan studio', 'Berlatih di Jakarta atau BSD'],
  ['▦', 'Jadwal fleksibel', 'Pilih jadwal yang sesuai dengan ritme Anda'],
] as const;

const classCards = publicClasses;

export function PublicLanding() {
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
                className="m-0 font-serif text-[clamp(3.4rem,6vw,5.8rem)] leading-[0.9] font-semibold tracking-[-0.04em]"
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
                <Link className={secondaryButton} href={routes.locations}>
                  Jelajahi Studio <span aria-hidden="true">›</span>
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-3 px-3 text-sm font-bold text-dd-forest no-underline"
                  href={routes.packages}
                >
                  Lihat Paket <span aria-hidden="true">›</span>
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

        <section
          className={`${container} my-12 grid overflow-hidden rounded-dd-lg bg-dd-forest text-white shadow-dd-card lg:grid-cols-[0.42fr_0.58fr]`}
          id="about"
        >
          <div className="relative min-h-[300px]">
            <Image
              className="object-cover"
              src="/images/public/landing/studio-showcase.png"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              alt="Reception Daily Dose Pilates dengan interior hangat"
            />
          </div>
          <div className="grid gap-8 p-[clamp(28px,5vw,56px)] lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-white/75 uppercase">
                Studio kami
              </p>
              <h2 className="mt-3 font-serif text-[clamp(2.5rem,4vw,4rem)] leading-none font-semibold">
                Ruang tenang yang dirancang untuk bergerak
              </h2>
              <p className="mt-5 text-sm leading-6 text-white/80">
                Studio yang bersih, tenang, dan tertata untuk mendukung perjalanan Pilates Anda.
              </p>
              <Link
                className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-dd-sm border border-white/50 px-5 text-sm font-bold text-white"
                href={routes.locations}
              >
                Jelajahi Studio <span aria-hidden="true">›</span>
              </Link>
            </div>
            <dl className="grid grid-cols-2 border-l border-white/20 max-[640px]:border-t max-[640px]:border-l-0">
              {[
                ['Studio', `${publicStudios.length} lokasi`],
                ['Format', 'Personal & kelompok'],
                ['Durasi', '50 menit'],
                ['Area', 'Jakarta & BSD'],
              ].map(([term, value]) => (
                <div
                  className="grid place-content-center border-r border-b border-white/20 p-5 text-center"
                  key={term}
                >
                  <dt className="text-xs text-white/65 uppercase">{term}</dt>
                  <dd className="mt-2 font-serif text-2xl">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className={`${container} py-8`} aria-labelledby="popular-title">
          <div className="mb-6 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-dd-forest uppercase">
                Kelas populer
              </p>
              <h2
                className="mt-2 font-serif text-[clamp(2.4rem,4vw,3.6rem)] leading-none"
                id="popular-title"
              >
                Temukan kelas sesuai tujuan Anda
              </h2>
            </div>
            <Link className="text-sm font-bold text-dd-forest" href={routes.classes}>
              Lihat semua kelas ›
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {classCards.map(({ name, description, level, image }) => (
              <article
                className="min-w-0 overflow-hidden rounded-dd-md bg-white shadow-dd-card"
                key={name}
              >
                <div className="relative h-[150px]">
                  <Image
                    src={`/images/public/classes/${image}`}
                    fill
                    sizes="260px"
                    alt=""
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-xl font-semibold">{name}</h3>
                  <p className="mt-2 min-h-10 text-[13px] leading-5 text-dd-muted">{description}</p>
                  <span className="mt-3 inline-flex rounded-full bg-[#e7eee8] px-2.5 py-1 text-xs text-dd-forest">
                    {level}
                  </span>
                </div>
              </article>
            ))}
          </div>
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
            <blockquote className="m-0 p-6 font-serif text-2xl leading-8">
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

        <section
          className={`${container} my-8 overflow-hidden rounded-dd-lg border border-dd-line bg-white shadow-dd-card md:grid md:grid-cols-[0.9fr_1.1fr]`}
          aria-labelledby="package-cta-title"
        >
          <div className="p-7 sm:p-10">
            <p className="text-xs font-bold tracking-[0.13em] text-dd-forest uppercase">
              Paket Daily Dose
            </p>
            <h2
              className="mt-3 font-serif text-[clamp(2.4rem,5vw,3.8rem)] leading-none"
              id="package-cta-title"
            >
              Bangun rutinitas yang konsisten.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-dd-muted">
              Bandingkan paket berdasarkan studio, tipe kelas, jumlah sesi, dan masa berlaku.
              Seluruh harga ditampilkan langsung dari katalog aktif.
            </p>
            <Link className={`${primaryButton} mt-6`} href={routes.packages}>
              Pilih Paket <span aria-hidden="true">›</span>
            </Link>
          </div>
          <div className="grid grid-cols-3 border-t border-dd-line md:border-t-0 md:border-l">
            {[
              ['01', 'Pilih studio'],
              ['02', 'Bandingkan paket'],
              ['03', 'Booking kelas'],
            ].map(([number, label]) => (
              <div
                className="grid content-center border-r border-dd-line p-5 last:border-r-0"
                key={number}
              >
                <span className="text-xs font-bold text-dd-brass">{number}</span>
                <strong className="mt-2 text-sm">{label}</strong>
              </div>
            ))}
          </div>
        </section>

        <section
          className={`${container} my-8 grid items-center gap-8 rounded-dd-lg bg-dd-forest px-[clamp(28px,7vw,96px)] py-9 text-white md:grid-cols-2`}
        >
          <div>
            <h2 className="font-serif text-3xl">Temukan kelas Pilates yang sesuai untukmu</h2>
            <p className="mt-2 text-sm text-white/80">
              Lihat jadwal, pilih studio, dan temukan kelas yang sesuai dengan tujuanmu.
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
