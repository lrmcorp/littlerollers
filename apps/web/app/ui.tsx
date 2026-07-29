import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  context,
  titleId,
}: {
  eyebrow: string;
  title: string;
  description: string;
  context?: ReactNode;
  titleId?: string;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-dd-line pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">{eyebrow}</p>
        <h1
          id={titleId}
          className="mt-1 text-2xl font-semibold tracking-tight text-dd-ink sm:text-3xl"
        >
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-dd-muted">{description}</p>
      </div>
      {context && <div className="flex shrink-0 flex-wrap items-center gap-2">{context}</div>}
    </header>
  );
}

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
}) {
  const classes = {
    neutral: 'bg-stone-100 text-stone-700 ring-stone-200',
    info: 'bg-dd-info-soft text-dd-info ring-sky-200',
    success: 'bg-dd-success-soft text-dd-success ring-emerald-200',
    warning: 'bg-dd-warning-soft text-dd-warning ring-amber-200',
    danger: 'bg-dd-danger-soft text-dd-danger ring-red-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${classes[tone]}`}
    >
      {children}
    </span>
  );
}

export function Feedback({
  kind,
  children,
}: {
  kind: 'status' | 'error' | 'warning' | 'info';
  children: ReactNode;
}) {
  const role = kind === 'error' ? 'alert' : 'status';
  const classes = {
    status: 'border-emerald-200 bg-dd-success-soft text-dd-success',
    error: 'border-red-200 bg-dd-danger-soft text-dd-danger',
    warning: 'border-amber-200 bg-dd-warning-soft text-dd-warning',
    info: 'border-sky-200 bg-dd-info-soft text-dd-info',
  };
  return (
    <div
      className={`flex gap-3 rounded-dd-md border p-4 text-sm leading-6 ${classes[kind]}`}
      role={role}
      aria-live={kind === 'error' ? 'assertive' : 'polite'}
    >
      <span className="mt-2 size-2 shrink-0 rounded-full bg-current" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid min-h-52 place-items-center rounded-dd-lg border border-dashed border-dd-line bg-dd-surface-muted p-8 text-center">
      <div className="max-w-md">
        <span
          className="mx-auto mb-4 grid size-10 place-items-center rounded-full bg-dd-brass-soft text-dd-brass"
          aria-hidden="true"
        >
          ○
        </span>
        <strong className="text-base text-dd-ink">{title}</strong>
        <p className="mt-2 text-sm leading-6 text-dd-muted">{description}</p>
      </div>
    </div>
  );
}

export function Skeleton({ label = 'Memuat konten' }: { label?: string }) {
  return (
    <div
      className="grid gap-3 rounded-dd-lg border border-dd-line bg-white p-5"
      role="status"
      aria-label={label}
    >
      <span className="h-5 w-4/5 animate-pulse rounded bg-stone-100" />
      <span className="h-5 animate-pulse rounded bg-stone-100" />
      <span className="h-5 w-2/5 animate-pulse rounded bg-stone-100" />
    </div>
  );
}

export function DataRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="overflow-x-auto rounded-dd-lg border border-dd-line bg-white"
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
