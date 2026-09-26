/**
 * Penanda kecil "Pratinjau" untuk halaman yang belum memakai penyimpanan/sumber data permanen
 * (lihat `maturity` di `lib/frontend-pages.ts`). `tone="dark"` untuk sidebar gelap.
 */
export function PreviewTag({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <span
      data-preview-tag
      className={`ml-auto shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
        tone === 'dark'
          ? 'border-white/30 text-white/70'
          : 'border-dd-line bg-dd-surface-muted text-dd-muted'
      }`}
    >
      Pratinjau
    </span>
  );
}
