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
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 id={titleId}>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {context && <div className="context-bar">{context}</div>}
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
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function Feedback({
  kind,
  children,
}: {
  kind: 'status' | 'error' | 'warning' | 'info';
  children: ReactNode;
}) {
  const role = kind === 'error' ? 'alert' : 'status';
  return (
    <div
      className={`feedback feedback-${kind}`}
      role={role}
      aria-live={kind === 'error' ? 'assertive' : 'polite'}
    >
      <span className="feedback-mark" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <span className="empty-state-mark" aria-hidden="true">
        ○
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export function Skeleton({ label = 'Memuat konten' }: { label?: string }) {
  return (
    <div className="skeleton-stack" role="status" aria-label={label}>
      <span className="skeleton-line skeleton-wide" />
      <span className="skeleton-line" />
      <span className="skeleton-line skeleton-short" />
    </div>
  );
}

export function ConfirmationPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="confirmation-panel" aria-label={title}>
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}

export function DataRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="data-region" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}
