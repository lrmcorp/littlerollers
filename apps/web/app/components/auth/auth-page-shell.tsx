import Image from 'next/image';
import Link from 'next/link';
import { BrandMark } from '../public/brand-mark';

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-page-shell grid min-h-svh w-full min-w-0 max-w-full grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)] bg-dd-cream max-[800px]:grid-cols-[minmax(0,1fr)]">
      <section className="auth-visual-panel relative isolate min-h-svh min-w-0 overflow-hidden max-[800px]:min-h-[280px]">
        <Image
          className="auth-visual-image -z-20 object-cover"
          src="/images/public/landing/studio-showcase.png"
          alt=""
          fill
          priority
          sizes="(max-width: 800px) 100vw, 40vw"
        />
        <div className="auth-visual-overlay absolute inset-0 -z-10" />
        <div className="absolute inset-x-8 bottom-10 text-white">
          <p className="text-xs font-bold tracking-[0.14em] uppercase">Daily Dose Pilates</p>
          <p className="max-w-md font-sans text-[clamp(2.3rem,4vw,4.5rem)] leading-none">
            Bergerak tenang, terhubung dengan aman.
          </p>
          <div className="auth-trust-row" aria-label="Keunggulan keamanan">
            <span>Privat</span>
            <span>Terverifikasi</span>
            <span>Terlindungi</span>
          </div>
        </div>
      </section>
      <section className="grid min-w-0 place-items-center p-[clamp(24px,6vw,80px)]">
        <div className="w-full min-w-0 max-w-[560px] rounded-dd-lg border border-dd-line bg-white/80 p-[clamp(24px,5vw,48px)] shadow-dd-card">
          <div className="mb-10 flex min-w-0 flex-wrap items-center justify-between gap-5">
            <BrandMark className="w-32 sm:w-40" priority />
            <Link className="text-sm font-bold text-dd-forest" href="/sign-in">
              Kembali masuk
            </Link>
          </div>
          <p className="text-xs font-bold tracking-[0.12em] text-dd-forest uppercase">{eyebrow}</p>
          <h1 className="mt-2 font-sans text-[clamp(2.4rem,5vw,3.8rem)] leading-none font-semibold">
            {title}
          </h1>
          <p className="mt-4 leading-7 text-dd-muted">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
