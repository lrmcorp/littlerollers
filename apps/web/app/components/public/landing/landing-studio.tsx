import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { routes } from '@/lib/routes';
import { Reveal } from './reveal';

export type LandingStudioStat = readonly [term: string, value: string];

// Garis pemisah antarkolom bergantung pada jumlah kolom (2 → 4), jadi diatur per indeks.
const statLayout = [
  '',
  'border-l border-ed-mint/25 pl-5 lg:pl-6',
  'lg:border-l lg:border-ed-mint/25 lg:pl-6',
  'border-l border-ed-mint/25 pl-5 lg:pl-6',
] as const;

/**
 * Showcase studio: foto + pengantar (split 50/50) di atas pita hijau tua, diikuti baris
 * statistik bergaris tipis. `data-testid="studio-showcase"` dan anchor `#about` dipertahankan
 * (dipakai e2e dan tautan footer).
 */
export function LandingStudio({ stats }: { stats: readonly LandingStudioStat[] }) {
  return (
    <section
      className="ed-scope bg-ed-forest text-ed-cream"
      id="about"
      aria-labelledby="studio-showcase-title"
    >
      <div className="ed-wrap ed-section" data-testid="studio-showcase">
        <Reveal className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:min-h-[520px]">
            <Image
              className="object-cover"
              src="/images/public/landing/studio-showcase.png"
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              alt="Reception Daily Dose Pilates dengan interior hangat"
            />
          </div>

          <div className="flex flex-col justify-center gap-8 lg:py-6">
            <span className="ed-eyebrow text-ed-mint">Studio kami</span>
            <h2
              className="ed-display text-[clamp(36px,4vw,58px)] text-balance"
              id="studio-showcase-title"
            >
              Ruang tenang yang dirancang untuk <span className="ed-serif">bergerak.</span>
            </h2>
            <p className="m-0 max-w-[460px] text-[17px] leading-[1.7] text-ed-mint">
              Studio yang bersih, tenang, dan tertata untuk mendukung perjalanan Pilates Anda
              dengan kenyamanan maksimal dan privasi tinggi.
            </p>
            <div>
              <Link className="ed-link" href={routes.locations}>
                <span>Jelajahi Studio</span>
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <dl className="m-0 mt-14 grid grid-cols-2 border-t border-ed-mint/25 sm:mt-[75px] lg:grid-cols-4">
            {stats.map(([term, value], index) => (
              <div
                className={`border-b border-ed-mint/25 py-6 pr-4 ${statLayout[index] ?? ''}`}
                key={term}
              >
                <dt className="ed-eyebrow text-ed-mint">{term}</dt>
                <dd className="mt-3 text-[clamp(20px,2vw,28px)] leading-[1.25] font-medium tracking-[-0.015em]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
