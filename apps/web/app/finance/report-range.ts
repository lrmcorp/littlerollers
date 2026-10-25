import type { FinanceRange } from './finance-client';

const DAY_MS = 86_400_000;
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

/** Rentang laporan paling lebar yang diterima server (hari). */
export const MAX_REPORT_RANGE_DAYS = 366;

export type RangePreset = 'THIS_MONTH' | 'LAST_MONTH' | 'LAST_30_DAYS' | 'THIS_YEAR';

export const RANGE_PRESETS: Array<{ id: RangePreset; label: string }> = [
  { id: 'THIS_MONTH', label: 'Bulan ini' },
  { id: 'LAST_MONTH', label: 'Bulan lalu' },
  { id: 'LAST_30_DAYS', label: '30 hari terakhir' },
  { id: 'THIS_YEAR', label: 'Tahun ini' },
];

/** Rentang pintas (hari dihitung UTC, sama dengan server). */
export function presetRange(preset: RangePreset, now: Date = new Date()): FinanceRange {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  switch (preset) {
    case 'THIS_MONTH':
      return { from: isoDay(new Date(Date.UTC(year, month, 1))), until: isoDay(now) };
    case 'LAST_MONTH':
      return {
        from: isoDay(new Date(Date.UTC(year, month - 1, 1))),
        until: isoDay(new Date(Date.UTC(year, month, 0))),
      };
    case 'LAST_30_DAYS':
      return { from: isoDay(new Date(now.getTime() - 29 * DAY_MS)), until: isoDay(now) };
    case 'THIS_YEAR':
      return { from: isoDay(new Date(Date.UTC(year, 0, 1))), until: isoDay(now) };
  }
}

/** Pesan galat untuk rentang yang tidak bisa diminta ke server; `undefined` bila rentang sah. */
export function rangeProblem({ from, until }: FinanceRange): string | undefined {
  const day = /^\d{4}-\d{2}-\d{2}$/;
  if (!day.test(from) || !day.test(until)) return 'Isi tanggal awal dan tanggal akhir.';
  if (from > until) return 'Tanggal akhir tidak boleh sebelum tanggal awal.';
  const days = (Date.parse(`${until}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS + 1;
  if (days > MAX_REPORT_RANGE_DAYS) return `Rentang terlalu lebar. Pilih paling lama ${MAX_REPORT_RANGE_DAYS} hari.`;
  return undefined;
}

/** Tanggal `YYYY-MM-DD` dalam format Indonesia, mis. 15 Sep 2026. */
export function formatDay(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}
