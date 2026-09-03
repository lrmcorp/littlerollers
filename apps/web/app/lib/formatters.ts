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
