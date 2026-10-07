import { CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

export function DetailSection({
  id,
  title,
  description,
  tone = 'default',
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  tone?: 'default' | 'muted' | 'danger';
  children: ReactNode;
}) {
  const toneClasses = {
    default: 'border-dd-line bg-dd-surface',
    muted: 'border-dd-line bg-dd-surface-muted',
    danger: 'border-dd-danger/30 bg-dd-danger-soft',
  };
  return (
    <section
      aria-labelledby={id}
      className={`grid gap-4 rounded-dd-lg border p-4 sm:p-5 ${toneClasses[tone]}`}
    >
      <div className="grid gap-1">
        <h3
          id={id}
          className={`text-base font-semibold ${tone === 'danger' ? 'text-dd-danger' : 'text-dd-ink'}`}
        >
          {title}
        </h3>
        {description && <div className="text-sm leading-6 text-dd-muted">{description}</div>}
      </div>
      {children}
    </section>
  );
}

export function InfoItem({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-xs font-medium text-dd-muted">{label}</dt>
      <dd className="m-0 mt-0.5 break-words text-sm font-semibold text-dd-ink">{children}</dd>
    </div>
  );
}

export function CapacityMeter({
  booked,
  capacity,
  minimum,
}: {
  booked: number;
  capacity: number;
  minimum: number;
}) {
  const isOvercapacity = booked > capacity;
  const isFull = booked >= capacity;
  const percent = capacity > 0 ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;
  return (
    <div className="grid gap-1.5">
      <span className={isOvercapacity ? 'font-semibold text-red-600 flex items-center gap-1.5' : ''}>
        {isOvercapacity && (
          <span className="rounded bg-red-100 text-red-700 text-xs px-1.5 py-0.5 font-bold">
            LEWAT KAPASITAS
          </span>
        )}
        {booked} dari {capacity} terisi
        <span className="font-normal text-dd-muted"> · minimum {minimum}</span>
      </span>
      <div
        role="progressbar"
        aria-label="Keterisian kelas"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={Math.min(booked, capacity)}
        className="h-1.5 overflow-hidden rounded-full bg-dd-line"
      >
        <div
          className={`h-full rounded-full ${isOvercapacity ? 'bg-red-600' : isFull ? 'bg-amber-600' : 'bg-dd-forest'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-dd-md border border-dd-line bg-dd-surface-muted p-3">
      <span className="block text-xs text-dd-muted">{label}</span>
      <strong className="mt-1 block text-lg text-dd-ink">{value}</strong>
    </div>
  );
}

export function ActionRow({
  title,
  description,
  done = false,
  children,
}: {
  title: string;
  description?: string;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3 rounded-dd-md border border-dd-line bg-dd-surface-muted p-3 sm:p-4">
      <div className="grid gap-0.5">
        <h4 className="m-0 flex items-center gap-1.5 text-sm font-semibold text-dd-ink">
          {done && <CheckCircle2 className="size-4 text-dd-success" aria-hidden="true" />}
          {title}
        </h4>
        {description && <p className="m-0 text-sm leading-6 text-dd-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}
