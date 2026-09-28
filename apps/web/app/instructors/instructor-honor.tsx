import { formatRupiah } from '../lib/formatters';

/** Honor bulan berjalan; `null` berarti peran ini tidak berhak melihat nominal (bukan Rp 0). */
export function InstructorHonor({
  total,
  unverified,
}: {
  total: number | null;
  unverified: number | null;
}) {
  if (total === null) {
    return (
      <span className="text-dd-muted" title="Nominal honor hanya untuk peran dengan akses honor.">
        —
      </span>
    );
  }
  return (
    <span className="grid">
      <span className="font-semibold text-dd-ink">{formatRupiah(total)}</span>
      {unverified ? (
        <span className="text-xs font-medium text-dd-warning">
          {formatRupiah(unverified)} belum terverifikasi
        </span>
      ) : null}
    </span>
  );
}
