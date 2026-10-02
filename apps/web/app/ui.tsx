'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { Inbox, X } from 'lucide-react';

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
  withDot = false,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  withDot?: boolean;
}) {
  const classes = {
    neutral: 'bg-dd-surface-muted text-dd-muted ring-dd-line',
    info: 'bg-dd-info-soft text-dd-info ring-dd-info/30',
    success: 'bg-dd-success-soft text-dd-success ring-dd-success/30',
    warning: 'bg-dd-warning-soft text-dd-warning ring-dd-warning/40',
    danger: 'bg-dd-danger-soft text-dd-danger ring-dd-danger/30',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${classes[tone]}`}
    >
      {withDot && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Feedback({
  kind,
  children,
  onDismiss,
  autoDismiss,
  durationMs = 5000,
}: {
  kind: 'status' | 'error' | 'warning' | 'info';
  children: ReactNode;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  durationMs?: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
  }, [children]);

  useEffect(() => {
    const shouldAutoDismiss = autoDismiss ?? (kind === 'status');
    if (!shouldAutoDismiss) return;

    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [autoDismiss, children, durationMs, kind, onDismiss]);

  if (!visible) return null;

  const role = kind === 'error' ? 'alert' : 'status';
  const classes = {
    status: 'border-dd-success/30 bg-dd-success-soft text-dd-success',
    error: 'border-dd-danger/30 bg-dd-danger-soft text-dd-danger',
    warning: 'border-dd-warning/40 bg-dd-warning-soft text-dd-warning',
    info: 'border-dd-info/30 bg-dd-info-soft text-dd-info',
  };

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-dd-md border p-3.5 text-sm leading-6 transition-all duration-200 ${classes[kind]}`}
      role={role}
      aria-live={kind === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3 min-w-0">
        <span className="mt-2 size-2 shrink-0 rounded-full bg-current" aria-hidden="true" />
        <div className="min-w-0 break-words font-medium">{children}</div>
      </div>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
        className="ml-2 -mr-1 -mt-1 p-1 rounded-dd-sm text-current opacity-60 hover:opacity-100 hover:bg-black/5 transition cursor-pointer"
        aria-label="Tutup pemberitahuan"
      >
        <X className="size-4" />
      </button>
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
          <Inbox className="size-5" />
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
      <span className="h-5 w-4/5 animate-pulse rounded bg-dd-surface-muted" />
      <span className="h-5 animate-pulse rounded bg-dd-surface-muted" />
      <span className="h-5 w-2/5 animate-pulse rounded bg-dd-surface-muted" />
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
