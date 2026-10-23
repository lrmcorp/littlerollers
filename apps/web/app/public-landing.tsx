'use client';

import { useEffect, useState } from 'react';

import { accountClient, type PublicSiteConfig } from '@/api-clients/account-client';
import { PublicFooter } from './components/public/public-footer';
import { PublicHeader } from './components/public/public-header';
import { HeroCarousel } from './components/public/hero-carousel';
import { LandingClasses } from './components/public/landing/landing-classes';
import { LandingIntro } from './components/public/landing/landing-intro';
import { LandingPackages } from './components/public/landing/landing-packages';
import { LandingStudio } from './components/public/landing/landing-studio';
import { LandingTestimonials } from './components/public/landing/landing-testimonials';

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
    <div className="ed-scope min-w-0 overflow-hidden bg-ed-cream text-ed-ink" id="top">
      <a className="skip-link" href="#public-main">
        Langsung ke konten utama
      </a>
      <PublicHeader variant="editorial" />

      <main id="public-main">
        {/* Hero Carousel Section */}
        <HeroCarousel config={siteConfig?.heroCarousel} />

        {/* Intro + 4 keunggulan studio (Editorial Calm) */}
        <LandingIntro />

        {/* Studio showcase (Editorial Calm) */}
        <LandingStudio
          stats={[
            ['Studio', siteConfig ? `${studioCount} lokasi` : 'Memuat…'],
            ['Format', 'Personal & kelompok'],
            ['Durasi', classDuration],
            ['Area', studioAreas],
          ]}
        />

        {/* Kelas populer */}
        <LandingClasses classes={siteConfig === null ? null : classCards} error={catalogError} />

        {/* Testimoni member & filosofi studio */}
        <LandingTestimonials />

        {/* Paket + ajakan penutup */}
        <LandingPackages />
      </main>

      <PublicFooter variant="editorial" />
    </div>
  );
}
