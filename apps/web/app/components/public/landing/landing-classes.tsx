import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import type { PublicSiteConfig } from '@/api-clients/account-client';
import { classLevelLabel } from '@/lib/class-level';
import { resolvePublicImageUrl } from '@/lib/public-image-url';
import { routes } from '@/lib/routes';
import { Reveal } from './reveal';

type PublicClass = PublicSiteConfig['classes'][number];

const defaultClassImages: Record<string, string> = {
  REFORMER: '/images/public/classes/reformer-pilates.png',
  MAT: '/images/public/classes/mat-pilates.png',
  CADILLAC: '/images/public/classes/cadillac-pilates.png',
  CHAIR: '/images/public/classes/chair-pilates.png',
  GROUP_CLASS: '/images/public/classes/reformer-pilates.png',
  PRIVATE_CLASS: '/images/public/classes/cadillac-pilates.png',
  SEMI_PRIVATE: '/images/public/classes/reformer-pilates.png',
};

const fallbackClassImage = '/images/public/classes/reformer-pilates.png';

// Satu definisi kolom dipakai baris kelas dan placeholder agar tinggi/lebar tidak melompat.
const rowGrid =
  'grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-5 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-x-7 lg:grid-cols-[40px_160px_minmax(0,1fr)] lg:gap-x-8';
const rowBody =
  'grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] lg:items-center lg:gap-8';

function ClassRow({ item, index }: { item: PublicClass; index: number }) {
  const { code, name, summary, level, heroImageKey, slug } = item;
  const imageSrc = resolvePublicImageUrl(heroImageKey, defaultClassImages[code] ?? fallbackClassImage);
  return (
    <li
      className={`${rowGrid} relative border-b border-ed-line py-6 transition-colors duration-200 hover:bg-ed-tint lg:py-7`}
    >
      <span aria-hidden="true" className="hidden text-xs font-bold text-ed-green lg:block">
        {String(index + 1).padStart(2, '0')}
      </span>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ed-mist">
        <Image
          src={imageSrc}
          fill
          sizes="(max-width: 639px) 88px, 160px"
          alt={`${name} di Daily Dose Pilates`}
          className="object-cover"
        />
      </div>
      <div className={rowBody}>
        <div>
          <h3 className="m-0 text-[clamp(22px,2.2vw,30px)] leading-[1.1] font-medium tracking-[-0.05em]">
            {name}
          </h3>
          <p className="ed-eyebrow mt-2 mb-0 text-ed-green">{classLevelLabel(level)}</p>
        </div>
        <p className="m-0 text-[15px] leading-[1.65] text-ed-muted">{summary}</p>
        <Link
          aria-label={`Lihat detail ${name}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ed-green underline-offset-4 after:absolute after:inset-0 hover:underline"
          href={`/classes/${slug}`}
        >
          <span>Lihat detail</span>
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </li>
  );
}

function ClassRowSkeleton() {
  return (
    <li
      aria-hidden="true"
      className={`${rowGrid} border-b border-ed-line py-6 lg:py-7`}
    >
      <span className="hidden lg:block" />
      <div className="aspect-[4/3] w-full animate-pulse bg-ed-mist" />
      <div className="space-y-3">
        <div className="h-6 w-2/3 animate-pulse bg-ed-mist" />
        <div className="h-4 w-full animate-pulse bg-ed-tint" />
        <div className="h-4 w-4/5 animate-pulse bg-ed-tint" />
      </div>
    </li>
  );
}

function ClassesNotice({ children }: { children: string }) {
  return (
    <p className="m-0 border-y border-ed-line py-8 text-[15px] leading-[1.65] text-ed-muted">
      {children}
    </p>
  );
}

/** Jumlah kelas yang ditampilkan di landing; selebihnya lewat halaman daftar kelas. */
export const LANDING_CLASS_LIMIT = 6;

export interface LandingClassesProps {
  /** `null` selama konfigurasi situs belum selesai dimuat. */
  classes: readonly PublicClass[] | null;
  error?: string;
}

/** Kelas populer sebagai daftar baris bergaris (nomor, foto kecil, nama, ringkasan, tautan). */
export function LandingClasses({ classes, error }: LandingClassesProps) {
  const visibleClasses = classes?.slice(0, LANDING_CLASS_LIMIT) ?? null;
  const hasMore = (classes?.length ?? 0) > LANDING_CLASS_LIMIT;
  return (
    <section
      className="ed-scope bg-ed-cream text-ed-ink"
      aria-labelledby="popular-title"
    >
      <div className="ed-wrap ed-section">
        <Reveal className="flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <span className="ed-eyebrow text-ed-green">Kelas populer</span>
            <h2
              className="ed-display mt-6 text-[clamp(40px,5vw,72px)] text-balance"
              id="popular-title"
            >
              Temukan kelas sesuai <span className="ed-serif">tujuan Anda.</span>
            </h2>
          </div>
          <Link className="ed-link shrink-0 text-ed-green" href={routes.classes}>
            <span>Lihat semua kelas</span>
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Reveal>

        <div className="mt-12 sm:mt-[75px]">
          {error ? (
            <ClassesNotice>{error}</ClassesNotice>
          ) : classes === null ? (
            <ol
              aria-busy="true"
              aria-label="Memuat kelas"
              className="m-0 list-none border-t border-ed-line p-0"
            >
              {[1, 2, 3].map((key) => (
                <ClassRowSkeleton key={key} />
              ))}
            </ol>
          ) : visibleClasses && visibleClasses.length ? (
            <Reveal>
              <ol className="m-0 list-none border-t border-ed-line p-0">
                {visibleClasses.map((item, index) => (
                  <ClassRow index={index} item={item} key={item.code} />
                ))}
              </ol>
              {hasMore ? (
                <div className="mt-10">
                  <Link className="ed-link text-ed-green" href={routes.classes}>
                    <span>Lihat semua {classes!.length} kelas</span>
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              ) : null}
            </Reveal>
          ) : (
            <ClassesNotice>Kelas aktif belum tersedia.</ClassesNotice>
          )}
        </div>
      </div>
    </section>
  );
}
