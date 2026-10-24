import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandMark } from '../public/brand-mark';

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  compactMobileVisual = false,
  visualSrc = '/images/public/landing/studio-showcase.png',
  loginLabel = 'Kembali masuk',
  loginHref = '/sign-in',
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  compactMobileVisual?: boolean;
  visualSrc?: string;
  loginLabel?: string;
  loginHref?: string;
}) {
  return (
    <main
      className="ed-scope grid min-h-svh w-full grid-cols-1 lg:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)] bg-ed-cream text-ed-ink"
    >
      {/* Left Visual Panel */}
      <section
        className={`auth-visual-panel relative isolate flex flex-col justify-between overflow-hidden p-8 sm:p-12 min-h-svh sticky top-0 self-start border-r border-ed-line ${
          compactMobileVisual
            ? 'max-[800px]:h-[140px] max-[800px]:min-h-[140px] max-[800px]:max-h-[140px] max-[800px]:p-4 max-[800px]:border-r-0 max-[800px]:border-b'
            : 'hidden lg:flex'
        }`}
      >
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            className="object-cover object-center"
            src={visualSrc}
            alt="Daily Dose Studio Atmosphere"
            fill
            priority
            sizes="(max-width: 800px) 100vw, 45vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ed-deep/95 via-ed-forest/80 to-ed-forest/50" />
        </div>

        {/* Top Brand Tag */}
        <div className="flex items-center gap-2 text-white/90">
          <span className="text-xs font-bold tracking-[0.16em] uppercase text-ed-mint">
            Daily Dose Pilates Studio
          </span>
        </div>

        {/* Bottom Editorial Copy (hidden on compact mobile) */}
        <div className={`space-y-4 text-white max-w-lg ${compactMobileVisual ? 'max-[800px]:hidden' : ''}`}>
          <div className="space-y-2">
            <p className="ed-eyebrow text-ed-mint tracking-[0.18em]">
              Move better, live better
            </p>
            <h2 className="ed-display text-3xl xl:text-4xl font-normal leading-[1.05] tracking-[-0.04em] text-ed-cream">
              Bergerak tenang,{' '}
              <span className="ed-serif italic text-ed-mint">terhubung dengan aman.</span>
            </h2>
            <p className="text-sm leading-relaxed text-ed-cream/80 max-w-md">
              Rasakan pengalaman Pilates yang terkurasi dengan pendampingan instruktur profesional
              di ruang latihan yang dirancang untuk kenyamanan tubuh Anda.
            </p>
          </div>

          <div
            className="flex items-center gap-4 text-xs font-medium text-ed-cream/75 pt-3 border-t border-white/10"
            aria-label="Keunggulan keamanan"
          >
            <span>Studio Privat &amp; Semi-Privat</span>
            <span>•</span>
            <span>Instruktur Tersertifikasi</span>
          </div>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="grid min-w-0 place-items-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-[560px] rounded-none border border-ed-line bg-white p-6 sm:p-10 shadow-none">
          {/* Header Bar */}
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-ed-line pb-5">
            <BrandMark className="w-32 sm:w-36" priority />
            <Link
              className="inline-flex min-h-[44px] items-center gap-2 rounded-none px-3 text-xs font-bold uppercase tracking-wider text-ed-forest hover:bg-ed-tint transition-colors no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ed-forest"
              href={loginHref}
            >
              <span>{loginLabel}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Form Eyebrow & Title */}
          <div className="space-y-2">
            <p className="ed-eyebrow text-ed-green">
              {eyebrow}
            </p>
            <h1 className="ed-display text-2xl sm:text-3xl font-normal tracking-[-0.04em] text-ed-ink">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-ed-muted">{description}</p>
          </div>

          {/* Form Content */}
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
