import type { ReactNode } from 'react';
import { publicContainer } from './public-styles';

/**
 * Inner-page opener: continues the header's sky band and ends on a meadow curve,
 * so each page starts where the home page hillside left off.
 */
export function PublicPageHero({
  eyebrow,
  title,
  description,
  children,
  titleId,
  variant = 'default',
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  titleId?: string;
  variant?: 'default' | 'compact';
}) {
  const compact = variant === 'compact';
  return (
    <section
      className={`relative isolate overflow-hidden bg-lr-sky ${
        compact ? 'pt-4 pb-10' : 'pt-12 pb-20 sm:pt-16 sm:pb-24'
      }`}
    >
      <div className={`${publicContainer} relative z-10`}>
        <p className="font-display text-lg text-lr-sky-deep">{eyebrow}</p>
        <h1
          className={`font-display text-dd-forest ${
            compact
              ? 'mt-1 max-w-5xl text-[clamp(2rem,3.2vw,2.6rem)] leading-[1.02]'
              : 'mt-3 max-w-4xl text-[clamp(2.6rem,6.5vw,5rem)] leading-[0.95]'
          }`}
          id={titleId}
        >
          {title}
        </h1>
        <p
          className={`text-base text-dd-ink/80 sm:text-lg ${
            compact ? 'mt-2 max-w-4xl leading-6 sm:leading-7' : 'mt-5 max-w-2xl leading-7'
          }`}
        >
          {description}
        </p>
        {children && <div className={compact ? 'mt-3' : 'mt-7'}>{children}</div>}
      </div>
      <svg
        className="absolute inset-x-0 bottom-0 -z-0 block h-8 w-full text-dd-cream sm:h-12"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 48 V30 C 300 4 640 0 980 18 S 1440 34 1440 34 V48 Z" fill="currentColor" />
      </svg>
    </section>
  );
}

export function PublicSectionHeading({
  eyebrow,
  title,
  description,
  titleId,
  aside,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  titleId?: string;
  aside?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div className="max-w-3xl">
        <p className="font-display text-lg text-dd-forest">{eyebrow}</p>
        <h2
          className="mt-2 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-none text-dd-forest"
          id={titleId}
        >
          {title}
        </h2>
        {description && <p className="mt-4 max-w-2xl leading-7 text-dd-muted">{description}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}

export function PublicStatePanel({
  title,
  children,
  tone = 'neutral',
  role,
}: {
  title?: string;
  children: ReactNode;
  tone?: 'neutral' | 'error';
  role?: 'status' | 'alert';
}) {
  return (
    <div
      className={`rounded-[15px] border p-8 text-center ${
        tone === 'error'
          ? 'border-dd-danger/30 bg-dd-danger-soft text-dd-danger'
          : 'border-dd-line bg-white text-dd-muted'
      }`}
      role={role}
    >
      {title && <h3 className="font-display text-2xl text-dd-forest">{title}</h3>}
      <div className={title ? 'mt-2' : ''}>{children}</div>
    </div>
  );
}
