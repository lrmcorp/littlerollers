'use client';

import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { usePageMeta } from './page-meta';
import { ScopeChip } from './scope-chip';

/**
 * Header standar halaman panel staf: eyebrow = nama grup menu, judul, deskripsi, lalu aksi.
 * Polos (tanpa kartu) dan `actions` boleh membungkus sehingga judul tidak terjepit.
 */
export function AdminPageHeader({
  title,
  titleId,
  description,
  eyebrow,
  actions,
  badges,
}: {
  title: string;
  titleId?: string;
  description?: ReactNode;
  /** Bawaan: nama grup menu dari registry halaman. */
  eyebrow?: string;
  actions?: ReactNode;
  badges?: ReactNode;
}) {
  const page = usePageMeta();
  const resolvedEyebrow = eyebrow ?? page?.group;
  const preview = page?.maturity === 'preview';
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-4 border-b border-dd-line pb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          {resolvedEyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
              {resolvedEyebrow}
            </p>
          )}
          <h1
            id={titleId}
            className="mt-1 text-2xl font-semibold tracking-tight text-dd-ink sm:text-3xl"
          >
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-dd-muted">{description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 empty:hidden">
            <ScopeChip />
            {preview && (
              <span
                data-preview-badge
                className="inline-flex items-center rounded-full border border-dd-brass/40 bg-dd-brass/10 px-2.5 py-1 text-xs font-semibold text-dd-ink"
              >
                Pratinjau
              </span>
            )}
            {badges}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 xl:shrink-0 xl:justify-end">
            {actions}
          </div>
        )}
      </header>
      {preview && page?.previewNote && (
        <p
          role="note"
          data-preview-note
          className="flex items-start gap-2 rounded-dd-md border border-dd-brass/40 bg-dd-brass/10 px-4 py-3 text-sm text-dd-ink"
        >
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{page.previewNote}</span>
        </p>
      )}
    </div>
  );
}
