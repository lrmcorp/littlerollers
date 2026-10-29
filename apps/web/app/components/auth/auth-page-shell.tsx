import Link from 'next/link';
import { BrandMark } from '../public/brand-mark';
import { SceneBackdrop } from '../public/scene-backdrop';

export function AuthPageShell({
  eyebrow,
  title,
  description,
  children,
  compactMobileVisual = false,
  loginLabel = 'Back to sign in',
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  compactMobileVisual?: boolean;
  loginLabel?: string;
}) {
  return (
    <main
      className={`auth-page-shell grid min-h-svh w-full min-w-0 max-w-full grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)] bg-dd-cream max-[800px]:grid-cols-[minmax(0,1fr)] ${compactMobileVisual ? 'auth-page-shell--compact-mobile' : ''}`}
    >
      <section className="auth-visual-panel sticky top-0 isolate h-svh min-h-svh min-w-0 self-start overflow-hidden max-[800px]:relative max-[800px]:h-auto max-[800px]:min-h-[280px]">
        <SceneBackdrop />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(20,58,104,0.3)_0%,rgba(20,58,104,0.05)_45%,rgba(7,50,40,0.72)_100%)]" />
        <div className="auth-visual-copy absolute inset-x-8 bottom-10 text-white">
          <p className="font-display text-xl">LITTLE ROLLERS</p>
          <p className="auth-visual-tagline mt-2 max-w-md font-display text-[clamp(2.2rem,4vw,4rem)] leading-none">
            Kids Movement Club
          </p>
        </div>
      </section>
      <section className="grid min-w-0 place-items-center p-[clamp(24px,6vw,80px)]">
        <div className="w-full min-w-0 max-w-[560px] rounded-[22px] border border-dd-line bg-white p-[clamp(24px,5vw,48px)]">
          <div className="mb-10 flex min-w-0 flex-wrap items-center justify-between gap-5">
            <BrandMark priority />
            <Link
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-dd-forest"
              href="/sign-in"
            >
              {loginLabel}
            </Link>
          </div>
          <p className="font-display text-lg text-lr-sky-deep">{eyebrow}</p>
          <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-none text-dd-forest">
            {title}
          </h1>
          <p className="mt-4 leading-7 text-dd-muted">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
