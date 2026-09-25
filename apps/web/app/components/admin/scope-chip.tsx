'use client';

import { MapPin } from 'lucide-react';
import { useSessionContext } from '../../session-context';
import { usePageMeta } from './page-meta';

/**
 * Chip "Cakupan: …" di header halaman. Halaman `topbar` menampilkan cabang aktif; halaman `global`
 * selalu mencakup semua cabang yang diizinkan (pemilih topbar dinonaktifkan di sana).
 */
export function ScopeChip() {
  const page = usePageMeta();
  const context = useSessionContext();
  const session = context?.session;
  if (!page || !session) return null;

  const allLabel = session.capabilities.includes('branch:all')
    ? 'Semua cabang'
    : 'Semua cabang penugasan';
  const label =
    page.branchScope === 'global' ? allLabel : (context?.activeBranch?.name ?? allLabel);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-dd-line bg-white px-2.5 py-1 text-xs font-semibold text-dd-muted"
      data-scope-chip
    >
      <MapPin className="size-3.5 text-dd-forest" aria-hidden="true" />
      Cakupan: <strong className="text-dd-ink">{label}</strong>
    </span>
  );
}
