import type { ReactNode } from 'react';
import { publicContainer } from './public-styles';

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
      className={`relative isolate overflow-hidden border-b border-dd-line bg-dd-paper ${
        compact ? 'py-5' : 'py-16 sm:py-20 lg:py-24'
      }`}
    >
      <div className={`${publicContainer} relative z-10`}>
        <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">{eyebrow}</p>
        <h1
          className={`font-sans font-semibold tracking-[-0.035em] ${
            compact
              ? 'mt-1 max-w-5xl text-[clamp(2.15rem,3.2vw,2.8rem)] leading-[1.02]'
              : 'mt-3 max-w-4xl text-[clamp(3rem,7vw,5.5rem)] leading-[0.93]'
          }`}
          id={titleId}
        >
          {title}
        </h1>
        <p
          className={`text-base text-dd-muted sm:text-lg ${
            compact ? 'mt-2 max-w-4xl leading-6 sm:leading-7' : 'mt-5 max-w-2xl leading-7'
          }`}
        >
          {description}
        </p>
        {children && <div className={compact ? 'mt-3' : 'mt-7'}>{children}</div>}
      </div>
      <span
        className="absolute -top-20 right-[-8rem] -z-10 size-[28rem] rounded-full border border-dd-forest/10"
        aria-hidden="true"
      />
      <span
        className="absolute top-14 right-[-2rem] -z-10 size-56 rounded-full border border-dd-brass/20"
        aria-hidden="true"
      />
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
        <p className="text-xs font-bold tracking-[0.14em] text-dd-forest uppercase">{eyebrow}</p>
        <h2
          className="mt-2 font-sans text-[clamp(2.25rem,5vw,3.75rem)] leading-none font-semibold"
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
      className={`rounded-dd-lg border p-8 text-center shadow-dd-card ${
        tone === 'error'
          ? 'border-dd-danger/30 bg-dd-danger-soft text-dd-danger'
          : 'border-dd-line bg-white text-dd-muted'
      }`}
      role={role}
    >
      {title && <h3 className="font-sans text-2xl font-semibold text-dd-ink">{title}</h3>}
      <div className={title ? 'mt-2' : ''}>{children}</div>
    </div>
  );
}
