'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { accountClient, type PreferredStudio } from '../account-client';
import { PublicFooter } from '../components/public/public-footer';
import { PublicHeader } from '../components/public/public-header';
import { PublicPageHero, PublicStatePanel } from '../components/public/public-page';
import { SearchSelect } from '../components/forms';
import {
  publicContainer as container,
  publicPrimaryButton as primary,
  publicSecondaryButton as secondary,
} from '../components/public/public-styles';

const ALL_AREAS = '';

export function LocationsView() {
  const [studios, setStudios] = useState<PreferredStudio[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [region, setRegion] = useState(ALL_AREAS);
  const [query, setQuery] = useState('');

  const load = useCallback(() => {
    let active = true;
    setState('loading');
    accountClient
      .siteConfig()
      .then((result) => {
        if (!active) return;
        setStudios(result.branches.filter((branch) => branch.publicProfile));
        setState('ready');
      })
      .catch(() => {
        if (active) setState('error');
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => load(), [load]);

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
    const normalized = query.trim().toLocaleLowerCase('en-GB');
    return studios.filter(
      ({ name, publicProfile }) =>
        publicProfile &&
        (region === ALL_AREAS || publicProfile.area === region) &&
        (!normalized ||
          `${name} ${publicProfile.area} ${publicProfile.city}`
            .toLocaleLowerCase('en-GB')
            .includes(normalized)),
    );
  }, [query, region, studios]);

  return (
    <div className="min-w-0 overflow-hidden bg-dd-cream font-sans text-dd-ink">
      <a className="skip-link" href="#studios-main">
        Skip to the club list
      </a>
      <PublicHeader />

      <main id="studios-main">
        <PublicPageHero
          eyebrow="Clubs"
          title="Find your club"
          titleId="studio-hero-title"
          description="Each club has its own timetable and packages. Pick the one you will visit to see sessions and prices."
        />

        <section className={`${container} py-8`} aria-label="Search clubs">
          <div className="grid gap-4 rounded-[15px] border border-dd-line bg-white p-4 sm:grid-cols-2">
            <SearchSelect
              label="Area"
              value={region}
              placeholder="All areas"
              options={regions.map((item) => ({ id: item, label: item }))}
              onChange={(value) => setRegion(value || ALL_AREAS)}
            />
            <label className="grid gap-2 text-sm font-semibold">
              Search
              <input
                className="min-h-12 w-full rounded-dd-md border border-dd-line bg-white px-4 text-sm font-normal"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Club name or area"
              />
            </label>
          </div>

          <div className="mt-6" aria-live="polite">
            {state === 'loading' ? (
              <PublicStatePanel role="status">Loading clubs…</PublicStatePanel>
            ) : state === 'error' ? (
              <PublicStatePanel title="The clubs did not load" tone="error" role="alert">
                <p>Check your connection and try again.</p>
                <button type="button" className={`${secondary} mt-4`} onClick={() => load()}>
                  Try again
                </button>
              </PublicStatePanel>
            ) : studios.length === 0 ? (
              <PublicStatePanel title="No clubs are open yet">
                <p>
                  <Link href="/contact">Contact us</Link> to hear when a club opens near you.
                </p>
              </PublicStatePanel>
            ) : visibleLocations.length === 0 ? (
              <PublicStatePanel title="No clubs match your search">
                <button
                  type="button"
                  className={`${secondary} mt-2`}
                  onClick={() => {
                    setQuery('');
                    setRegion(ALL_AREAS);
                  }}
                >
                  Show all clubs
                </button>
              </PublicStatePanel>
            ) : (
              <ul className="m-0 grid list-none gap-5 p-0">
                {visibleLocations.map(({ code, id, name, publicProfile }) => {
                  if (!publicProfile) return null;
                  return (
                    <li key={code}>
                      <article className="grid overflow-hidden rounded-[15px] border border-dd-line bg-white md:grid-cols-[260px_minmax(0,1fr)_200px]">
                        <div className="relative min-h-[180px] bg-lr-sky">
                          <Image
                            className="object-cover"
                            src={`/images/public/${publicProfile.heroImageKey}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 260px"
                            alt=""
                          />
                        </div>
                        <div className="p-5 sm:p-6">
                          <h2 className="font-display text-2xl text-dd-forest">{name}</h2>
                          <p className="mt-2 flex items-start gap-2 text-sm text-dd-muted">
                            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            {publicProfile.address}
                          </p>
                          <p className="mt-3 leading-7">{publicProfile.description}</p>
                        </div>
                        <div className="grid content-center gap-3 border-t border-dd-line p-5 md:border-t-0 md:border-l">
                          <Link
                            className={primary}
                            href={`/classes?branch=${encodeURIComponent(id)}#schedule`}
                          >
                            Timetable
                          </Link>
                          <Link className={secondary} href={`/locations/${publicProfile.slug}`}>
                            Club details
                          </Link>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className={`${container} pb-4`}>
          <div className="flex flex-col items-start justify-between gap-4 rounded-[22px] bg-dd-forest p-6 text-dd-cream sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="font-display text-2xl">No club near you yet?</h2>
              <p className="mt-2 text-dd-cream/85">Tell us your area and we will let you know.</p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center rounded-full bg-lr-sun px-6 font-medium text-dd-forest no-underline"
              href="/contact"
            >
              Contact us
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
