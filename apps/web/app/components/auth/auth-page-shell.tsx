import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { BrandMark } from '../public/brand-mark';

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  compactMobileVisual = false,
  visualSrc = '/images/public/landing/studio-showcase.png',
  loginLabel = 'Kembali masuk',
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  compactMobileVisual?: boolean;
  visualSrc?: string;
  loginLabel?: string;
}) {
  return (
    <main
      className={`grid min-h-svh w-full grid-cols-1 lg:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)] bg-dd-cream font-sans text-dd-ink ${
        compactMobileVisual ? '' : ''
      }`}
    >
      {/* Left Visual Panel */}
      <section className="relative isolate hidden lg:flex flex-col justify-between overflow-hidden p-10 min-h-svh sticky top-0 self-start">
        <div className="absolute inset-0 -z-10">
          <Image
            className="object-cover object-center"
            src={visualSrc}
            alt="Daily Dose Studio Atmosphere"
            fill
            priority
            sizes="45vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dd-forest-dark/95 via-dd-forest-dark/70 to-dd-forest-dark/40" />
        </div>

        {/* Top Brand Tag */}
        <div className="flex items-center gap-2 text-white/90">
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="size-3.5 text-dd-brass" /> Daily Dose Pilates Studio
          </span>
        </div>

        {/* Bottom Tagline & Trust Row */}
        <div className="space-y-6 text-white">
          <div className="space-y-3">
            <p className="text-xs font-bold tracking-[0.16em] text-dd-brass uppercase">
              Move better, live better
            </p>
            <h2 className="font-sans text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
              Bergerak tenang, terhubung dengan aman.
            </h2>
            <p className="text-sm leading-relaxed text-white/75 max-w-md">
              Rasakan pengalaman Pilates yang terkurasi dengan pendampingan instruktur profesional
              di ruang latihan yang dirancang untuk kenyamanan Anda.
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/90 pt-2"
            aria-label="Keunggulan keamanan"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
              <ShieldCheck className="size-3.5 text-dd-brass" /> Privat &amp; Enkripsi
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
              <UserCheck className="size-3.5 text-dd-brass" /> Terverifikasi
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-dd-brass" /> Kualitas Terjamin
            </span>
          </div>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="grid min-w-0 place-items-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-[560px] rounded-2xl border border-dd-line/80 bg-white/95 p-6 sm:p-10 shadow-dd-card backdrop-blur-md">
          {/* Header Bar */}
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-dd-line/60 pb-5">
            <BrandMark className="w-32 sm:w-36" priority />
            <Link
              className="inline-flex min-h-10 items-center gap-1.5 rounded-dd-sm px-3 text-xs font-bold text-dd-forest hover:bg-dd-surface-muted transition no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dd-forest"
              href="/sign-in"
            >
              <span>{loginLabel}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Form Eyebrow & Title */}
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-dd-forest/10 px-3 py-0.5 text-[11px] font-bold tracking-wider text-dd-forest uppercase">
              {eyebrow}
            </span>
            <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-dd-ink">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-dd-muted">{description}</p>
          </div>

          {/* Form Content */}
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
