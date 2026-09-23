'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { accountClient, type PreferredStudio } from '@/api-clients/account-client';
import {
  Award,
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  Layers,
  MapPin,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { PublicFooter } from '../components/public/public-footer';
import { PublicHeader } from '../components/public/public-header';
import { SearchSelect, SelectInput } from '../components/forms';
import { useSessionContext } from '../session-context';
import { isCustomerOnlySession } from '@/lib/session-audience';
import {
  publicContainer as container,
  publicPrimaryButton as primary,
  publicSecondaryButton as secondary,
} from '../components/public/public-styles';
import { resolvePublicImageUrl } from '../lib/public-image-url';

const studioBenefits = [
  {
    icon: <Sparkles className="size-5 text-dd-forest" />,
    title: 'Peralatan premium',
    description: 'Peralatan Pilates berkualitas untuk latihan yang terarah.',
  },
  {
    icon: <Users className="size-5 text-dd-forest" />,
    title: 'Kelas berukuran kecil',
    description: 'Suasana latihan yang nyaman dan lebih personal.',
  },
  {
    icon: <Award className="size-5 text-dd-forest" />,
    title: 'Instruktur berpengalaman',
    description: 'Pendampingan instruktur dalam setiap sesi.',
  },
  {
    icon: <Building2 className="size-5 text-dd-forest" />,
    title: 'Dua pilihan studio',
    description: 'Pilihan studio aktif di Jakarta dan BSD.',
  },
] as const;

export function LocationsView() {
  const session = useSessionContext()?.session;
  const inCustomerShell = isCustomerOnlySession(session);
  const [studios, setStudios] = useState<PreferredStudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [region, setRegion] = useState('Semua lokasi');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recommended' | 'az'>('recommended');

  useEffect(() => {
    let active = true;
    accountClient
      .siteConfig()
      .then((result) => {
        if (active) setStudios(result.branches.filter((branch) => branch.publicProfile));
      })
      .catch(() => {
        if (active) setLoadError('Daftar studio belum dapat dimuat. Silakan coba lagi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const regions = useMemo(
    () =>
      Array.from(
        new Set(
          studios.flatMap((studio) => (studio.publicProfile ? [studio.publicProfile.area] : [])),
        ),
      ),
    [studios],
  );

  const visibleLocations = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('id-ID');
    const filtered = studios.filter(
      ({ name, publicProfile }) =>
        publicProfile &&
        (region === 'Semua lokasi' || publicProfile.area === region) &&
        (!normalized ||
          `${name} ${publicProfile.area} ${publicProfile.city}`
            .toLocaleLowerCase('id-ID')
            .includes(normalized)),
    );
    return sort === 'az'
      ? [...filtered].sort((left, right) => left.name.localeCompare(right.name, 'id-ID'))
      : filtered;
  }, [query, region, sort, studios]);

  return (
    <div className="min-w-0 overflow-hidden bg-dd-cream font-sans text-dd-ink">
      <a className="skip-link" href="#studios-main">
        Langsung ke daftar studio
      </a>
      {!inCustomerShell && <PublicHeader />}

      <main id="studios-main">
        <section
          className="relative isolate min-h-[360px] overflow-hidden"
          aria-labelledby="studio-hero-title"
        >
          <Image
            className="-z-20 object-cover object-[68%_53%]"
            src="/images/public/studios/studio-reception.png"
            fill
            priority
            sizes="100vw"
            alt="Interior studio Daily Dose Pilates yang hangat dan terang"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(248,246,241,0.98)_0%,rgba(248,246,241,0.9)_39%,rgba(248,246,241,0.12)_72%)]" />
          <div className={`${container} flex min-h-[360px] items-center`}>
            <div className="max-w-[520px] py-12">
              <p className="text-xs font-bold tracking-[0.13em] text-dd-forest uppercase">
                Daily Dose Pilates
              </p>
              <h1
                className="mt-3 font-sans text-[clamp(3.6rem,7vw,6rem)] leading-none font-semibold"
                id="studio-hero-title"
              >
                Studio Kami
              </h1>
              <p className="mt-5 text-base leading-7">
                Temukan studio Daily Dose Pilates terdekat. Setiap ruang dirancang untuk
                menginspirasi gerak dan mendukung perjalanan wellness Anda.
              </p>
            </div>
          </div>
        </section>

        <section
          className="border-y border-dd-line bg-white/65 py-5"
          aria-label="Cari dan filter studio"
        >
          <div
            className={`${container} grid grid-cols-[1fr_1fr_1fr_auto] gap-4 max-[900px]:grid-cols-2 max-[540px]:grid-cols-1`}
          >
            <SearchSelect
              label="Wilayah"
              value={region === 'Semua lokasi' ? '' : region}
              placeholder="Semua lokasi"
              options={regions.map((item) => ({ id: item, label: item }))}
              onChange={(value) => setRegion(value || 'Semua lokasi')}
            />
            <label className="flex min-h-[50px] items-center gap-3 rounded-dd-md border border-dd-line bg-white px-4">
              <Search className="size-4 text-dd-muted shrink-0" aria-hidden="true" />
              <span className="sr-only">Cari studio</span>
              <input
                className="min-h-11 w-full border-0 bg-transparent text-sm focus:outline-none"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama atau area"
              />
            </label>
            <div className="flex min-h-[50px] items-center gap-2.5 rounded-dd-md border border-dd-line bg-white px-4 text-sm text-dd-muted">
              <Layers className="size-4 text-dd-forest shrink-0" aria-hidden="true" />
              <span>Private · Semi Private · Group</span>
            </div>
            <Link className={`${primary} inline-flex items-center gap-1.5 justify-center`} href="/classes#schedule">
              <span>Lihat Jadwal</span>
              <Calendar className="size-4" />
            </Link>
          </div>
        </section>

        <section className={`${container} grid gap-7 py-10 lg:grid-cols-[minmax(0,1fr)_280px]`}>
          <div>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="m-0 text-sm">
                <strong>{visibleLocations.length}</strong> studio tersedia
              </p>
              <SelectInput
                compact
                wrapperClassName="min-w-48"
                label="Urutkan"
                value={sort}
                onChange={(event) => setSort(event.target.value as 'recommended' | 'az')}
              >
                <option value="recommended">Rekomendasi</option>
                <option value="az">A–Z</option>
              </SelectInput>
            </div>

            {loading ? (
              <div className="rounded-dd-lg border border-dd-line bg-white p-10 text-center text-dd-muted">
                Memuat studio aktif…
              </div>
            ) : loadError ? (
              <div className="rounded-dd-lg border border-dd-line bg-white p-10 text-center">
                <h2 className="font-sans text-2xl font-semibold">Studio belum dapat dimuat</h2>
                <p className="mt-2 text-dd-muted">{loadError}</p>
              </div>
            ) : visibleLocations.length ? (
              <div className="grid gap-4">
                {visibleLocations.map(({ code, id, name, publicProfile }) => {
                  if (!publicProfile) return null;
                  return (
                    <article
                      className="grid overflow-hidden rounded-dd-md border border-dd-line bg-white shadow-dd-card md:grid-cols-[220px_minmax(0,1fr)_170px]"
                      key={code}
                    >
                      <div className="relative min-h-[190px]">
                        <Image
                          className="object-cover"
                          src={resolvePublicImageUrl(publicProfile.heroImageKey)}
                          fill
                          sizes="(max-width: 768px) 100vw, 220px"
                          alt={`Studio Daily Dose Pilates ${name}`}
                        />
                      </div>
                      <div className="p-5">
                        <p className="text-xs font-bold tracking-wider text-dd-forest uppercase">
                          Daily Dose Pilates
                        </p>
                        <h2 className="mt-1 font-sans text-2xl font-semibold">{name}</h2>
                        <p className="mt-3 flex items-center gap-1.5 text-sm text-dd-muted">
                          <MapPin className="size-3.5 text-dd-forest shrink-0" />
                          <span>{publicProfile.area}</span>
                        </p>
                        <p className="mt-2 text-sm leading-6 text-dd-muted">
                          {publicProfile.description}
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-dd-muted">
                          <Clock className="size-3.5 text-dd-muted shrink-0" />
                          <span>Jadwal tersedia pada halaman kelas</span>
                        </p>
                        <ul
                          className="mt-4 flex list-none flex-wrap gap-2 p-0 text-xs text-dd-muted"
                          aria-label={`Format latihan di ${name}`}
                        >
                          {['Reformer', 'Private', 'Semi Private', 'Group'].map((format) => (
                            <li className="rounded-full bg-[#edf1ec] px-2.5 py-1" key={format}>
                              {format}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid content-center gap-3 border-l border-dd-line p-4 max-[768px]:grid-cols-2 max-[768px]:border-t max-[768px]:border-l-0">
                        <Link className={`${secondary} inline-flex items-center gap-1 justify-center`} href={`/locations/${publicProfile.slug}`}>
                          <span>Lihat detail</span>
                          <ChevronRight className="size-3.5" />
                        </Link>
                        <Link className={`${secondary} inline-flex items-center gap-1 justify-center`} href="/contact">
                          <span>Hubungi studio</span>
                          <ChevronRight className="size-3.5" />
                        </Link>
                        <Link
                          className={`${primary} inline-flex items-center gap-1.5 justify-center`}
                          href={`/classes?branch=${encodeURIComponent(id)}#schedule`}
                        >
                          <span>Lihat Jadwal</span>
                          <Calendar className="size-4" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-dd-lg border border-dd-line bg-white p-10 text-center">
                <h2 className="font-sans text-3xl">Studio belum ditemukan</h2>
                <p className="mt-2 text-dd-muted">
                  Coba ubah pencarian atau tampilkan semua lokasi.
                </p>
                <button
                  className={`${secondary} mt-5`}
                  onClick={() => {
                    setQuery('');
                    setRegion('Semua lokasi');
                  }}
                >
                  Reset pencarian
                </button>
              </div>
            )}

            <p className="mt-6 rounded-dd-md border border-dd-line bg-white/60 p-4 text-[13px] leading-6 text-dd-muted">
              Alamat lengkap, jam operasional, dan petunjuk kedatangan belum ditampilkan sebelum
              sumber operasionalnya disetujui. Hubungi tim Daily Dose untuk konfirmasi kunjungan.
            </p>
          </div>

          <aside className="grid content-start gap-5" aria-label="Informasi studio">
            <div className="relative min-h-[210px] overflow-hidden rounded-dd-lg border border-dd-line bg-[#eef0e8]">
              <span className="absolute top-1/2 left-0 h-2 w-full -rotate-12 bg-white" />
              <span className="absolute top-0 left-1/2 h-full w-2 rotate-12 bg-white" />
              {['top-12 left-16', 'top-24 right-16', 'bottom-10 left-1/2'].map((position) => (
                <span
                  className={`absolute ${position} size-3.5 rounded-full bg-dd-forest ring-4 ring-white shadow-sm`}
                  key={position}
                  aria-hidden="true"
                />
              ))}
              <strong className="absolute inset-x-4 bottom-4 text-sm">Jakarta · BSD</strong>
            </div>

            <div className="rounded-dd-lg bg-white p-5 shadow-dd-card">
              <h2 className="font-sans text-2xl font-semibold">Mengapa Daily Dose?</h2>
              <div className="mt-5 grid gap-5">
                {studioBenefits.map(({ icon, title, description }) => (
                  <article className="grid grid-cols-[36px_1fr] items-start gap-3" key={title}>
                    <span className="grid size-9 place-items-center rounded-lg bg-dd-surface-muted text-dd-forest shrink-0 mt-0.5" aria-hidden="true">
                      {icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-dd-ink">{title}</h3>
                      <p className="mt-1 text-[13px] leading-5 text-dd-muted">{description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-dd-lg bg-dd-forest p-6 text-white">
              <h2 className="font-sans text-2xl">Belum menemukan studio terdekat?</h2>
              <p className="mt-3 text-sm leading-6 text-white/80">
                Sampaikan area Anda dan tim kami akan membantu menemukan pilihan terdekat.
              </p>
              <Link
                className="mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-dd-sm border border-white/50 px-5 text-sm font-bold text-white transition hover:bg-white/10"
                href="/contact"
              >
                <span>Hubungi kami</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </aside>
        </section>
      </main>

      {!inCustomerShell && <PublicFooter />}
    </div>
  );
}
