'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Minus,
  X,
} from 'lucide-react';
import { Button } from '../actions';
import { EmptyState } from '../../ui';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const tones: Record<Tone, string> = {
  neutral: 'bg-dd-surface-muted text-dd-muted ring-dd-line',
  success: 'bg-dd-success-soft text-dd-success ring-dd-success/30',
  warning: 'bg-dd-warning-soft text-dd-warning ring-dd-warning/30',
  danger: 'bg-dd-danger-soft text-dd-danger ring-dd-danger/30',
  info: 'bg-dd-info-soft text-dd-info ring-dd-info/30',
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
      className={`rounded-dd-md border border-dd-line bg-dd-surface ${className}`}
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
  loading = false,
}: {
  label: string;
  value: string;
  change?: number | null;
  helper?: string;
  tone?: Tone;
  loading?: boolean;
}) {
  const ChangeIcon =
    change == null || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <Panel className="relative overflow-hidden p-5" aria-busy={loading}>
      <p className="flex items-center gap-1.5 text-[15px] font-bold text-dd-muted">
        {label}
        {/* Nada dipakai pemanggil untuk angka yang perlu ditindaklanjuti. Ditandai ikon dan kata,
            bukan sekadar warna, supaya tetap terbaca di cetakan hitam putih dan oleh pembaca
            yang sulit membedakan warna. */}
        {(tone === 'warning' || tone === 'danger') && !loading && (
          <span
            className={`inline-flex items-center gap-1 text-[13px] font-bold ${
              tone === 'danger' ? 'text-dd-danger' : 'text-dd-brass'
            }`}
          >
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            {tone === 'danger' ? 'perlu tindakan' : 'perlu dicek'}
          </span>
        )}
      </p>
      <div className="mt-3 flex items-end justify-between gap-3">
        {loading ? (
          <div className="h-8 w-24 rounded bg-dd-line/60" aria-label="Memuat nilai..." />
        ) : (
          <strong className="text-3xl font-semibold tracking-tight text-dd-ink">{value}</strong>
        )}
        {loading ? (
          <div className="h-4 w-12 rounded bg-dd-line/40" />
        ) : (
          change != null && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold ${change < 0 ? 'text-dd-danger' : change > 0 ? 'text-dd-success' : 'text-dd-muted'}`}
            >
              <ChangeIcon className="size-3.5" /> {Math.abs(change).toLocaleString('id-ID')}%
            </span>
          )
        )}
      </div>
      {loading ? (
        helper ? <div className="mt-2 h-4 w-32 rounded bg-dd-line/30" /> : null
      ) : (
        helper && <p className="mt-2 text-sm text-dd-muted">{helper}</p>
      )}
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

export const AdminEmptyState = EmptyState;
export { EmptyState };

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-dd-ink px-2 py-1 text-[13px] text-white shadow-lg group-hover:block group-focus-within:block"
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
  wrap = false,
}: {
  items: { value: string; label: string; count?: number }[];
  value: string;
  onChange(value: string): void;
  /** Bungkus ke baris berikutnya (untuk banyak tab) alih-alih menggulir mendatar. */
  wrap?: boolean;
}) {
  return (
    <div
      role="tablist"
      className={`flex gap-1 rounded-dd-md border border-dd-line bg-dd-surface-muted p-1 ${wrap ? 'flex-wrap' : 'overflow-x-auto'}`}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          onClick={() => onChange(item.value)}
          className={`min-h-11 whitespace-nowrap rounded-dd-sm border-0 px-3 text-sm font-bold ${item.value === value ? 'bg-white text-dd-forest' : 'bg-transparent text-dd-muted hover:text-dd-ink'}`}
        >
          {item.label}
          {item.count != null && (
            <span className="ml-2 rounded-full bg-dd-surface-muted px-1.5 py-0.5 text-[10px]">
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Kotak filter standar. Aturannya: pencarian dan status berlaku langsung tanpa tombol; filter berat
 * (mis. rentang tanggal) memakai `onApply` sehingga muncul tombol "Terapkan" (Enter juga menerapkan)
 * dan `onReset` untuk tombol "Reset".
 */
export function FilterBar({
  children,
  activeFilters,
  label,
  onApply,
  onReset,
  applying = false,
  showReset = true,
}: {
  children: ReactNode;
  activeFilters?: ReactNode;
  /** Nama form untuk pembaca layar; hanya dipakai bila `onApply` diberikan. */
  label?: string;
  onApply?(): void;
  onReset?(): void;
  applying?: boolean;
  /** Sembunyikan "Reset" saat tidak ada filter aktif. */
  showReset?: boolean;
}) {
  const className = 'rounded-dd-lg border border-dd-line bg-dd-surface p-4';
  const content = (
    <>
      <div className="flex flex-wrap items-end gap-3">
        {children}
        {(onApply || onReset) && (
          <div className="ml-auto flex items-end gap-2">
            {onReset && showReset && (
              <Button type="button" variant="ghost" onClick={onReset}>
                Reset
              </Button>
            )}
            {onApply && (
              <Button type="submit" variant="secondary" loading={applying}>
                Terapkan
              </Button>
            )}
          </div>
        )}
      </div>
      {activeFilters && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-dd-line pt-3">
          {activeFilters}
        </div>
      )}
    </>
  );
  if (!onApply) return <div className={className}>{content}</div>;
  return (
    <form
      className={className}
      aria-label={label}
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      {content}
    </form>
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
  cell(item: T, index?: number): ReactNode;
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
  emptyAction,
  onRowClick,
  rowClassName,
  mobileCardClassName,
  rowDescription,
  showRowNumbers = true,
  rowNumberOffset = 0,
  rowNumberHeader = 'No.',
}: {
  items: T[];
  columns: DataTableColumn<T>[];
  rowKey(item: T): string;
  mobileCard?(item: T, index?: number): ReactNode;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?(item: T): void;
  rowClassName?(item: T, index?: number): string;
  mobileCardClassName?(item: T, index?: number): string;
  rowDescription?(item: T, index?: number): string;
  showRowNumbers?: boolean;
  rowNumberOffset?: number;
  rowNumberHeader?: string;
}) {
  if (loading) return <AdminSkeleton rows={5} />;
  if (!items.length) return <AdminEmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  return (
    <div className="overflow-hidden rounded-dd-lg border border-dd-line bg-dd-surface">
      <div className={mobileCard ? 'hidden overflow-x-auto md:block' : 'overflow-x-auto'}>
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-dd-surface-muted text-[13px] text-dd-muted">
            <tr>
              {showRowNumbers && (
                <th
                  scope="col"
                  className="w-14 min-w-[3.5rem] border-b border-dd-line px-3 py-3 text-center text-[13px] font-bold text-dd-muted select-none"
                >
                  {rowNumberHeader}
                </th>
              )}
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
            {items.map((item, index) => (
              <tr
                key={rowKey(item)}
                onClick={() => onRowClick?.(item)}
                aria-label={rowDescription?.(item, index)}
                className={`${rowClassName?.(item, index) ?? ''} ${
                  onRowClick
                    ? 'cursor-pointer transition hover:brightness-[0.98] focus-within:ring-2 focus-within:ring-inset focus-within:ring-dd-forest'
                    : ''
                }`}
              >
                {showRowNumbers && (
                  <td className="w-14 min-w-[3.5rem] px-3 py-3 align-top text-center text-xs font-mono font-medium text-dd-muted bg-dd-surface-muted/20 select-none">
                    {rowNumberOffset + index + 1}
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-4 py-3 align-top text-dd-ink ${column.className ?? ''}`}
                  >
                    {column.cell(item, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mobileCard && (
        <div className="grid divide-y divide-dd-line md:hidden">
          {items.map((item, index) => (
            <div
              key={rowKey(item)}
              onClick={() => onRowClick?.(item)}
              aria-label={rowDescription?.(item, index)}
              className={`p-4 ${mobileCardClassName?.(item, index) ?? ''} ${onRowClick ? 'cursor-pointer active:brightness-[0.98]' : ''}`}
            >
              {showRowNumbers && (
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-dd-surface-muted px-2 py-0.5 text-[11px] font-bold text-dd-muted">
                    #{rowNumberOffset + index + 1}
                  </span>
                </div>
              )}
              {mobileCard(item, index)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getPageWindow(current: number, total: number, maxButtons = 7): (number | '...')[] {
  if (total <= maxButtons) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export function Pagination({
  hasPrevious,
  hasNext,
  totalLabel,
  previousAriaLabel,
  nextAriaLabel,
  onPrevious,
  onNext,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  showPageNumbers = true,
}: {
  hasPrevious: boolean;
  hasNext: boolean;
  totalLabel?: string;
  previousAriaLabel?: string;
  nextAriaLabel?: string;
  onPrevious(): void;
  onNext(): void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?(page: number): void;
  showPageNumbers?: boolean;
}) {
  const computedTotalPages =
    totalItems != null && pageSize != null ? Math.max(1, Math.ceil(totalItems / pageSize)) : undefined;
  const effectiveTotalPages = totalPages ?? computedTotalPages;
  const pageItems =
    showPageNumbers && effectiveTotalPages && currentPage && Boolean(onPageChange)
      ? getPageWindow(currentPage, effectiveTotalPages)
      : [];

  let displayLabel = totalLabel;
  if (!displayLabel) {
    if (currentPage != null && totalItems != null && pageSize != null) {
      const startItem = totalItems === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, totalItems);
      const endItem = Math.min(currentPage * pageSize, totalItems);
      displayLabel = `Menampilkan ${startItem.toLocaleString('id-ID')}–${endItem.toLocaleString('id-ID')} dari ${totalItems.toLocaleString('id-ID')} data`;
    } else if (currentPage != null && effectiveTotalPages != null) {
      displayLabel = `Halaman ${currentPage.toLocaleString('id-ID')} dari ${effectiveTotalPages.toLocaleString('id-ID')}`;
    } else if (currentPage != null) {
      displayLabel = `Halaman ${currentPage.toLocaleString('id-ID')}`;
    } else {
      displayLabel = 'Navigasi halaman';
    }
  } else if (currentPage != null && totalItems != null && pageSize != null && !displayLabel.startsWith('Menampilkan')) {
    if (/\bdari\b/.test(displayLabel)) {
      // Label sudah berbentuk "X dari Y paket": jangan dirangkai ulang agar tidak menjadi "dari 20 dari 20".
      if (!/ditampilkan/.test(displayLabel)) displayLabel = `Menampilkan ${displayLabel}`;
    } else {
      const suffix = displayLabel.replace(/^\d+[\s.,]?\d*\s*/, '').trim();
      const entity = suffix || 'data';
      if (totalItems <= pageSize) {
        displayLabel = `Menampilkan ${totalItems.toLocaleString('id-ID')} ${entity}`;
      } else {
        const startItem = totalItems === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, totalItems);
        const endItem = Math.min(currentPage * pageSize, totalItems);
        displayLabel = `Menampilkan ${startItem.toLocaleString('id-ID')}–${endItem.toLocaleString('id-ID')} dari ${totalItems.toLocaleString('id-ID')} ${entity}`;
      }
    }
  }

  // Cegah tampilan janggal "dari 0" bila data summary belum sinkron
  if (displayLabel) {
    displayLabel = displayLabel.replace(/\s+dari\s+0\s+/g, ' ');
  }

  const showPagePrefix =
    Boolean(totalLabel) &&
    currentPage != null &&
    !displayLabel.toLowerCase().includes('halaman');

  return (
    <nav
      aria-label="Paginasi data"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-dd-lg border border-dd-line/80 bg-white/95 px-4 py-3 backdrop-blur-sm"
    >
      <div className="text-xs sm:text-sm font-medium text-dd-muted">
        {showPagePrefix && (
          <span>
            Halaman {currentPage.toLocaleString('id-ID')}
            {effectiveTotalPages && effectiveTotalPages > 1
              ? ` dari ${effectiveTotalPages.toLocaleString('id-ID')}`
              : ''}{' '}
            ·{' '}
          </span>
        )}
        <span>{displayLabel}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <Button
          aria-label={previousAriaLabel}
          variant="secondary"
          size="sm"
          leadingIcon={<ChevronLeft className="size-4" aria-hidden="true" />}
          disabled={!hasPrevious}
          onClick={onPrevious}
        >
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        {pageItems.length > 0 && (
          <div className="flex items-center gap-1">
            {pageItems.map((item, idx) =>
              item === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 py-1 text-xs text-dd-muted select-none"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={`page-${item}`}
                  type="button"
                  aria-current={item === currentPage ? 'page' : undefined}
                  aria-label={`Halaman ${item}`}
                  disabled={item === currentPage || !onPageChange}
                  onClick={() => onPageChange?.(item)}
                  className={`size-11 flex items-center justify-center rounded-lg text-xs sm:text-sm font-semibold transition ${
                    item === currentPage
                      ? 'bg-dd-forest text-white shadow-dd-soft pointer-events-none'
                      : 'text-dd-ink hover:bg-dd-surface-muted hover:text-dd-forest border border-transparent cursor-pointer'
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
        )}

        <Button
          aria-label={nextAriaLabel}
          variant="secondary"
          size="sm"
          trailingIcon={<ChevronRight className="size-4" aria-hidden="true" />}
          disabled={!hasNext}
          onClick={onNext}
        >
          <span className="hidden sm:inline">Berikutnya</span>
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
    <div className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-dd-lg border border-dd-brass/40 bg-dd-ink px-4 py-3 text-white shadow-dd-float">
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
        <div key={index} className="h-12 rounded-dd-md bg-dd-surface-muted" />
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
      ? ['Akses tidak tersedia', 'Akun ini tidak memiliki izin untuk membuka data tersebut.']
      : kind === 'stale'
        ? ['Data telah berubah', 'Muat ulang data terbaru sebelum melanjutkan tindakan.']
        : ['Terjadi kendala', 'Data belum dapat dimuat. Silakan coba kembali.'];
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className="rounded-dd-lg border border-dd-line bg-white p-7 text-center"
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

export { TableActionMenu, type ActionMenuItem } from './table-action-menu';
