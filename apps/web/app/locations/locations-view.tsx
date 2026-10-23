'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { accountClient, type PreferredStudio } from '@/api-clients/account-client';
import { ArrowRight, ArrowUpRight, MapPin, Search } from 'lucide-react';
import { PublicFooter } from '../components/public/public-footer';
import { PublicHeader } from '../components/public/public-header';
import { PublicPageHero } from '../components/public/public-page';
import { SearchSelect, SelectInput } from '../components/forms';
import { useSessionContext } from '../session-context';
import { isCustomerOnlySession } from '@/lib/session-audience';
import { resolvePublicImageUrl } from '../lib/public-image-url';

const studioBenefits = [
  {
    title: 'Peralatan premium',
    description: 'Peralatan Pilates berkualitas untuk latihan yang terarah.',
  },
  {
    title: 'Kelas berukuran kecil',
    description: 'Suasana latihan yang nyaman dan lebih personal.',
  },
  {
    title: 'Instruktur berpengalaman',
    description: 'Pendampingan instruktur dalam setiap sesi.',
  },
  {
    title: 'Pilihan studio strategis',
    description: 'Pilihan studio aktif di Jakarta, Tangerang & Surabaya.',
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
    <div className="ed-scope min-w-0 overflow-hidden bg-ed-cream text-ed-ink">
      <a className="skip-link" href="#studios-main">
        Langsung ke daftar studio
      </a>
      {!inCustomerShell && <PublicHeader variant="editorial" />}

      <main id="studios-main">
        <PublicPageHero
          eyebrow="Daily Dose Pilates"
          title="Studio Kami"
          description="Temukan studio Daily Dose Pilates terdekat. Setiap ruang dirancang untuk menginspirasi gerak dan mendukung perjalanan wellness Anda."
          titleId="studio-hero-title"
          variant={inCustomerShell ? 'compact' : 'default'}
        />

        <section className="border-b border-ed-line bg-ed-mist/60 py-6" aria-label="Cari dan filter studio">
          <div className="ed-wrap grid grid-cols-[1fr_1fr_auto] items-end gap-4 max-[900px]:grid-cols-2 max-[540px]:grid-cols-1">
            <SearchSelect
              label="Wilayah"
              value={region === 'Semua lokasi' ? '' : region}
              placeholder="Semua lokasi"
              options={regions.map((item) => ({ id: item, label: item }))}
              onChange={(value) => setRegion(value || 'Semua lokasi')}
            />
            <div className="grid min-w-0 gap-1.5">
              <label htmlFor="studio-search-input" className="text-sm font-semibold text-ed-ink">
                Cari studio
              </label>
              <div className="relative min-w-0">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ed-muted"
                  aria-hidden="true"
                />
                <input
                  id="studio-search-input"
                  className="min-h-11 w-full rounded-none border border-ed-line bg-white py-2 pr-4 pl-9 text-sm text-ed-ink outline-none transition placeholder:text-ed-muted/75 hover:border-ed-green focus:border-ed-green"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari nama atau area"
                />
              </div>
            </div>
            <Link className="ed-button" href="/classes#schedule">
              Lihat Jadwal
            </Link>
          </div>
        </section>

        <section className="py-[clamp(48px,7vw,100px)]">
          <div className="ed-wrap">
            <div className="mb-6 flex items-center justify-between gap-4">
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
              <p className="m-0 border-y border-ed-line py-10 text-center text-ed-muted">
                Memuat studio aktif…
              </p>
            ) : loadError ? (
              <div className="border-y border-ed-line py-10 text-center">
                <h2 className="m-0 text-2xl font-medium tracking-[-0.04em]">
                  Studio belum dapat dimuat
                </h2>
                <p className="mt-2 text-ed-muted">{loadError}</p>
              </div>
            ) : visibleLocations.length ? (
              <ol className="m-0 list-none border-t border-ed-line p-0">
                {visibleLocations.map(({ code, id, name, publicProfile }, index) => {
                  if (!publicProfile) return null;
                  return (
                    <li
                      className="grid gap-x-8 gap-y-6 border-b border-ed-line py-8 transition-colors duration-200 hover:bg-ed-tint md:grid-cols-[40px_220px_minmax(0,1fr)_auto]"
                      key={code}
                    >
                      <span aria-hidden="true" className="hidden text-xs font-bold text-ed-green md:block">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ed-mist">
                        <Image
                          className="object-cover"
                          src={resolvePublicImageUrl(publicProfile.heroImageKey)}
                          fill
                          sizes="(max-width: 768px) 100vw, 220px"
                          alt={`Studio Daily Dose Pilates ${name}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="ed-eyebrow text-ed-green">Daily Dose Pilates</p>
                        <h2 className="m-0 mt-2 text-[clamp(24px,2.4vw,34px)] leading-[1.1] font-medium tracking-[-0.05em]">
                          {name}
                        </h2>
                        <p className="m-0 mt-3 flex items-center gap-1.5 text-sm text-ed-muted">
                          <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-ed-green" />
                          <span>{publicProfile.area}</span>
                        </p>
                        {publicProfile.address && (
                          <p className="m-0 mt-1 text-sm leading-6 text-ed-muted">
                            {publicProfile.address}
                          </p>
                        )}
                        <p className="m-0 mt-2 text-sm leading-6 text-ed-muted">
                          {publicProfile.description}
                        </p>
                        <p className="m-0 mt-2 text-sm text-ed-muted">
                          Jadwal tersedia pada halaman kelas
                        </p>
                        <ul
                          className="m-0 mt-4 flex list-none flex-wrap gap-x-5 gap-y-1 p-0 text-xs font-semibold text-ed-green"
                          aria-label={`Format latihan di ${name}`}
                        >
                          {['Reformer', 'Private', 'Semi Private', 'Group'].map((format) => (
                            <li key={format}>{format}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col items-start gap-4 md:items-end">
                        <Link
                          className="ed-button-compact"
                          href={`/classes?branch=${encodeURIComponent(id)}#schedule`}
                        >
                          Lihat Jadwal
                        </Link>
                        <Link
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-ed-green underline-offset-4 hover:underline"
                          href={`/locations/${publicProfile.slug}`}
                        >
                          <span>Lihat detail</span>
                          <ArrowUpRight aria-hidden="true" className="size-4" />
                        </Link>
                        <Link
                          className="inline-flex items-center gap-1.5 text-sm font-bold text-ed-green underline-offset-4 hover:underline"
                          href="/contact"
                        >
                          <span>Hubungi studio</span>
                          <ArrowUpRight aria-hidden="true" className="size-4" />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="border-y border-ed-line py-10 text-center">
                <h2 className="m-0 text-3xl font-medium tracking-[-0.04em]">Studio belum ditemukan</h2>
                <p className="mt-2 text-ed-muted">Coba ubah pencarian atau tampilkan semua lokasi.</p>
                <button
                  className="ed-button mt-5"
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setRegion('Semua lokasi');
                  }}
                >
                  Reset pencarian
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-ed-line py-[clamp(64px,8vw,120px)]" aria-labelledby="studio-why-title">
          <div className="ed-wrap">
            <h2
              className="ed-display text-[clamp(36px,4.6vw,64px)] text-balance"
              id="studio-why-title"
            >
              Mengapa <span className="ed-serif">Daily Dose?</span>
            </h2>
            <ul className="m-0 mt-12 grid list-none grid-cols-1 border-t border-ed-line p-0 sm:grid-cols-2 lg:grid-cols-4">
              {studioBenefits.map(({ title, description }, index) => (
                <li
                  className="border-b border-ed-line py-6 sm:pr-6 [&:nth-child(even)]:sm:border-l [&:nth-child(even)]:sm:pl-6 lg:border-l lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
                  key={title}
                >
                  <span className="text-xs font-bold text-ed-green">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="m-0 mt-8 text-[clamp(20px,1.8vw,26px)] leading-[1.15] font-medium tracking-[-0.04em]">
                    {title}
                  </h3>
                  <p className="m-0 mt-3 text-[15px] leading-[1.65] text-ed-muted">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-ed-forest py-[clamp(64px,8vw,110px)] text-ed-cream">
          <div className="ed-wrap grid items-end gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <h2 className="ed-display text-[clamp(34px,4.2vw,60px)] text-balance">
              Belum menemukan studio <span className="ed-serif">terdekat?</span>
            </h2>
            <div className="flex flex-col items-start gap-6">
              <p className="m-0 max-w-[440px] text-[17px] leading-[1.7] text-ed-mint">
                Sampaikan area Anda dan tim kami akan membantu menemukan pilihan terdekat.
              </p>
              <Link className="ed-link" href="/contact">
                <span>Hubungi kami</span>
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {!inCustomerShell && <PublicFooter variant="editorial" />}
    </div>
  );
}
