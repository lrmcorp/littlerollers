'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  X,
} from 'lucide-react';
import { Button } from '../actions';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const tones: Record<Tone, string> = {
  neutral: 'bg-stone-100 text-stone-700 ring-stone-200',
  success: 'bg-dd-success-soft text-dd-success ring-emerald-200',
  warning: 'bg-dd-warning-soft text-dd-warning ring-amber-200',
  danger: 'bg-dd-danger-soft text-dd-danger ring-red-200',
  info: 'bg-dd-info-soft text-dd-info ring-sky-200',
};

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${tones[tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function Panel({ children, className = '', ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-dd-lg border border-dd-line bg-dd-surface shadow-dd-card ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  change,
  helper,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  change?: number | null;
  helper?: string;
  tone?: Tone;
}) {
  const ChangeIcon =
    change == null || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <Panel className="relative overflow-hidden p-5">
      <span
        className={`absolute inset-x-0 top-0 h-0.5 ${tone === 'warning' ? 'bg-dd-brass' : tone === 'danger' ? 'bg-dd-danger' : 'bg-dd-forest'}`}
      />
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-muted">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <strong className="text-2xl font-semibold tracking-tight text-dd-ink">{value}</strong>
        {change != null && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-bold ${change < 0 ? 'text-dd-danger' : change > 0 ? 'text-dd-success' : 'text-dd-muted'}`}
          >
            <ChangeIcon className="size-3.5" /> {Math.abs(change).toLocaleString('id-ID')}%
          </span>
        )}
      </div>
      {helper && <p className="mt-2 text-sm text-dd-muted">{helper}</p>}
    </Panel>
  );
}

export function FilterChip({ children, onRemove }: { children: ReactNode; onRemove?(): void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dd-line bg-white px-3 py-1.5 text-xs font-semibold text-dd-ink">
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Hapus filter"
          className="grid size-5 min-h-0 place-items-center border-0 bg-transparent p-0 text-dd-muted hover:text-dd-ink"
        >
          <X className="size-3.5" />
        </button>
      )}
    </span>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid min-h-52 place-items-center rounded-dd-lg border border-dashed border-dd-line bg-dd-surface-muted p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-4 grid size-10 place-items-center rounded-full bg-dd-brass-soft text-dd-brass">
          ○
        </div>
        <strong className="text-base text-dd-ink">{title}</strong>
        <p className="mt-2 text-sm leading-6 text-dd-muted">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-dd-sidebar px-2 py-1 text-xs text-white shadow-lg group-hover:block group-focus-within:block"
      >
        {label}
      </span>
    </span>
  );
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: { value: string; label: string; count?: number }[];
  value: string;
  onChange(value: string): void;
}) {
  return (
    <div
      role="tablist"
      className="flex gap-1 overflow-x-auto rounded-dd-md border border-dd-line bg-dd-surface-muted p-1"
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          onClick={() => onChange(item.value)}
          className={`min-h-9 whitespace-nowrap rounded-dd-sm border-0 px-3 text-sm font-bold ${item.value === value ? 'bg-white text-dd-forest shadow-sm' : 'bg-transparent text-dd-muted hover:text-dd-ink'}`}
        >
          {item.label}
          {item.count != null && (
            <span className="ml-2 rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px]">
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function FilterBar({
  children,
  activeFilters,
}: {
  children: ReactNode;
  activeFilters?: ReactNode;
}) {
  return (
    <div className="rounded-dd-lg border border-dd-line bg-dd-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">{children}</div>
      {activeFilters && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-dd-line pt-3">
          {activeFilters}
        </div>
      )}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="rounded-dd-lg border border-dd-line bg-dd-surface-muted p-4 sm:p-5">
      <legend className="px-2 text-sm font-bold text-dd-ink">{title}</legend>
      {description && <p className="mb-4 text-sm text-dd-muted">{description}</p>}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell(item: T): ReactNode;
  className?: string;
};

export function DataTable<T>({
  items,
  columns,
  rowKey,
  mobileCard,
  loading = false,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Data akan muncul di sini setelah tersedia.',
  onRowClick,
  rowClassName,
  mobileCardClassName,
  rowDescription,
}: {
  items: T[];
  columns: DataTableColumn<T>[];
  rowKey(item: T): string;
  mobileCard?(item: T): ReactNode;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?(item: T): void;
  rowClassName?(item: T): string;
  mobileCardClassName?(item: T): string;
  rowDescription?(item: T): string;
}) {
  if (loading) return <AdminSkeleton rows={5} />;
  if (!items.length) return <AdminEmptyState title={emptyTitle} description={emptyDescription} />;
  return (
    <div className="overflow-hidden rounded-dd-lg border border-dd-line bg-dd-surface shadow-sm">
      <div className={mobileCard ? 'hidden overflow-x-auto md:block' : 'overflow-x-auto'}>
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-dd-surface-muted text-xs uppercase tracking-[0.08em] text-dd-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={`border-b border-dd-line px-4 py-3 font-bold ${column.className ?? ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dd-line">
            {items.map((item) => (
              <tr
                key={rowKey(item)}
                onClick={() => onRowClick?.(item)}
                aria-label={rowDescription?.(item)}
                className={`${rowClassName?.(item) ?? ''} ${
                  onRowClick
                    ? 'cursor-pointer transition hover:brightness-[0.98] focus-within:ring-2 focus-within:ring-inset focus-within:ring-dd-forest'
                    : ''
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-4 py-3 align-top text-dd-ink ${column.className ?? ''}`}
                  >
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mobileCard && (
        <div className="grid divide-y divide-dd-line md:hidden">
          {items.map((item) => (
            <div
              key={rowKey(item)}
              onClick={() => onRowClick?.(item)}
              aria-label={rowDescription?.(item)}
              className={`p-4 ${mobileCardClassName?.(item) ?? ''} ${onRowClick ? 'cursor-pointer active:brightness-[0.98]' : ''}`}
            >
              {mobileCard(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Pagination({
  hasPrevious,
  hasNext,
  totalLabel,
  previousAriaLabel,
  nextAriaLabel,
  onPrevious,
  onNext,
}: {
  hasPrevious: boolean;
  hasNext: boolean;
  totalLabel?: string;
  previousAriaLabel?: string;
  nextAriaLabel?: string;
  onPrevious(): void;
  onNext(): void;
}) {
  return (
    <nav
      aria-label="Paginasi data"
      className="flex flex-wrap items-center justify-between gap-3 rounded-dd-md border border-dd-line bg-white px-4 py-3"
    >
      <span className="text-sm text-dd-muted">{totalLabel ?? 'Navigasi halaman'}</span>
      <div className="flex gap-2">
        <Button
          aria-label={previousAriaLabel}
          variant="secondary"
          leadingIcon={<ChevronLeft className="size-4" aria-hidden="true" />}
          disabled={!hasPrevious}
          onClick={onPrevious}
        >
          Sebelumnya
        </Button>
        <Button
          aria-label={nextAriaLabel}
          variant="secondary"
          trailingIcon={<ChevronRight className="size-4" aria-hidden="true" />}
          disabled={!hasNext}
          onClick={onNext}
        >
          Berikutnya
        </Button>
      </div>
    </nav>
  );
}

export function BulkActionBar({
  count,
  children,
  onClear,
}: {
  count: number;
  children: ReactNode;
  onClear(): void;
}) {
  if (!count) return null;
  return (
    <div className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-dd-lg border border-dd-brass/40 bg-dd-sidebar px-4 py-3 text-white shadow-dd-float">
      <strong className="text-sm">{count.toLocaleString('id-ID')} dipilih</strong>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onClear}>
          Batalkan
        </Button>
      </div>
    </div>
  );
}

export function AdminSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Memuat data"
      className="grid gap-3 rounded-dd-lg border border-dd-line bg-white p-5"
    >
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-dd-md bg-stone-100" />
      ))}
      <span className="sr-only">Memuat data</span>
    </div>
  );
}

export function AdminPageState({
  kind,
  title,
  description,
  action,
}: {
  kind: 'error' | 'forbidden' | 'stale';
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  const copy =
    kind === 'forbidden'
      ? ['Akses tidak tersedia', 'Akun ini tidak memiliki capability untuk membuka data tersebut.']
      : kind === 'stale'
        ? ['Data telah berubah', 'Muat ulang data terbaru sebelum melanjutkan tindakan.']
        : ['Terjadi kendala', 'Data belum dapat dimuat. Silakan coba kembali.'];
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className="rounded-dd-lg border border-dd-line bg-white p-7 text-center shadow-sm"
    >
      <AlertTriangle
        className={`mx-auto size-8 ${kind === 'error' ? 'text-dd-danger' : 'text-dd-brass'}`}
      />
      <h2 className="mt-3 text-lg font-semibold text-dd-ink">{title ?? copy[0]}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-dd-muted">
        {description ?? copy[1]}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
