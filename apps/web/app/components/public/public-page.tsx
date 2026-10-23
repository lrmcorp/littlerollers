import type { ReactNode } from 'react';

/**
 * Hero halaman publik (gaya "Editorial Calm"): pita hijau tua, eyebrow, judul display, paragraf.
 * `compact` dipakai pelanggan yang membuka halaman ini di dalam shell aplikasi pelanggan.
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
    <section className="ed-scope bg-ed-forest text-ed-cream">
      <div className={`ed-wrap ${compact ? 'py-6 sm:py-8' : 'py-[clamp(64px,9vw,120px)]'}`}>
        <p className="ed-eyebrow text-ed-mint">{eyebrow}</p>
        <h1
          className={`ed-display text-balance ${
            compact
              ? 'mt-2 max-w-[900px] text-[clamp(30px,3.4vw,46px)]'
              : 'mt-6 max-w-[1000px] text-[clamp(44px,6.4vw,96px)]'
          }`}
          id={titleId}
        >
          {title}
        </h1>
        <p
          className={`m-0 max-w-[600px] text-ed-mint ${
            compact ? 'mt-3 text-base leading-[1.55]' : 'mt-8 text-[17px] leading-[1.7]'
          }`}
        >
          {description}
        </p>
        {children && <div className={compact ? 'mt-3' : 'mt-8'}>{children}</div>}
      </div>
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
    <header className="ed-scope mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="max-w-3xl">
        <p className="ed-eyebrow text-ed-green">{eyebrow}</p>
        <h2
          className="ed-display mt-5 text-[clamp(36px,4.6vw,64px)] text-balance text-ed-ink"
          id={titleId}
        >
          {title}
        </h2>
        {description && (
          <p className="m-0 mt-5 max-w-[560px] text-[17px] leading-[1.7] text-ed-muted">
            {description}
          </p>
        )}
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
      className={`border-y p-8 text-center ${
        tone === 'error'
          ? 'border-dd-danger/40 bg-dd-danger-soft text-dd-danger'
          : 'border-ed-line bg-ed-tint text-ed-muted'
      }`}
      role={role}
    >
      {title && (
        <h3 className="m-0 text-2xl font-medium tracking-[-0.04em] text-ed-ink">{title}</h3>
      )}
      <div className={title ? 'mt-2' : ''}>{children}</div>
    </div>
  );
}
