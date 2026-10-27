export const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Rp 0';
  }
  const rounded = Math.round(value);
  if (rounded === 0 || Object.is(rounded, -0)) {
    return 'Rp 0';
  }
  return rupiahFormatter.format(rounded);
}

export function formatTanggal(
  value: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) return '-';
  const date = typeof value === 'object' ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    ...options,
  }).format(date);
}

export function formatWaktu(
  value: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) return '-';
  const date = typeof value === 'object' ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(date);
}

export function formatTanggalWaktu(value: Date | string | number | null | undefined): string {
  if (!value) return '-';
  const date = typeof value === 'object' ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatPersentase(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0%';
  }
  return `${Math.round(value * 10) / 10}%`;
}

/**
 * Tanggal pendek "2 Nov" (atau "Sen, 2 Nov" dengan `weekday`), ditambah tahun bila bukan tahun berjalan di
 * zona waktu itu. Dipakai untuk daftar yang bisa memuat riwayat, supaya tahun lalu tidak terbaca sebagai minggu ini.
 */
export function formatTanggalSingkat(
  value: Date | string | number | null | undefined,
  options: { timeZone?: string; weekday?: 'short' | 'long'; month?: 'short' | 'long'; now?: Date } = {},
): string {
  if (!value) return '-';
  const date = typeof value === 'object' ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const { timeZone, weekday, month = 'short', now = new Date() } = options;
  const yearOf = (instant: Date) =>
    Number(new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric' }).format(instant));
  return new Intl.DateTimeFormat('id-ID', {
    timeZone,
    ...(weekday ? { weekday } : {}),
    day: 'numeric',
    month,
    ...(yearOf(date) !== yearOf(now) ? { year: 'numeric' } : {}),
  }).format(date);
}
