/**
 * Kamus Sistem Terpusat Daily Dose Pilates v2
 * Sumber kebenaran untuk penerjemahan kode sistem internal, database, dan API
 * ke dalam bahasa manusia yang ramah, santun, dan bebas jargon.
 * Sesuai spesifikasi 02-SPEC-DESAIN.md (Bagian 6 & 7).
 */

export interface VerificationStatusInfo {
  code: string;
  label: string;
  description: string;
  variant: 'info' | 'warning' | 'success' | 'danger';
}

const STUDIO_DICTIONARY: Record<string, { full: string; short: string }> = {
  'DD-GG': { full: 'Daily Dose Green Garden', short: 'Green Garden' },
  'green-garden': { full: 'Daily Dose Green Garden', short: 'Green Garden' },
  'DD-MK': { full: 'Daily Dose Muara Karang', short: 'Muara Karang' },
  'muara-karang': { full: 'Daily Dose Muara Karang', short: 'Muara Karang' },
  'DD-SBY': { full: 'Daily Dose Graha Family Surabaya', short: 'Graha Family Surabaya' },
  'graha-family': { full: 'Daily Dose Graha Family Surabaya', short: 'Graha Family Surabaya' },
  'DD-PIK2': { full: 'Daily Dose Orange Groves PIK 2', short: 'Orange Groves PIK 2' },
  'orange-groves-pik2': { full: 'Daily Dose Orange Groves PIK 2', short: 'Orange Groves PIK 2' },
  'DD-UNTAR': { full: 'Daily Dose Untar Kampus 2', short: 'Untar Kampus 2' },
  'untar': { full: 'Daily Dose Untar Kampus 2', short: 'Untar Kampus 2' },
};

const CLASS_TYPE_DICTIONARY: Record<string, string> = {
  ALL: 'Semua Tipe',
  ALL_TYPES: 'Semua Tipe',
  PRIVATE: 'Private',
  PRIVATE_GROUP: 'Private Group',
  SEMI_PRIVATE: 'Semi Private',
  GROUP: 'Group',
};

const CLASS_LEVEL_DICTIONARY: Record<string, string> = {
  ALL: 'Semua Level',
  ALL_LEVELS: 'Semua Level',
  BEGINNER: 'Pemula',
  INTERMEDIATE: 'Menengah',
  ADVANCED: 'Lanjutan',
};

const TIMEZONE_DICTIONARY: Record<string, string> = {
  'Asia/Jakarta': 'WIB',
  'Asia/Pontianak': 'WIB',
  'Asia/Makassar': 'WITA',
  'Asia/Jayapura': 'WIT',
  WIB: 'WIB',
  WITA: 'WITA',
  WIT: 'WIT',
};

const BOOKING_STATUS_DICTIONARY: Record<string, string> = {
  PENDING: 'Menunggu Konfirmasi',
  CONFIRMED: 'Terkonfirmasi',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  NO_SHOW: 'Tidak Hadir',
};

const ORDER_STATUS_DICTIONARY: Record<string, string> = {
  PENDING: 'Menunggu Pembayaran',
  UNPAID: 'Menunggu Pembayaran',
  WAITING_FOR_PAYMENT: 'Menunggu Pembayaran',
  WAITING_FOR_CONFIRMATION: 'Menunggu Verifikasi Pembayaran',
  PENDING_REVIEW: 'Menunggu Verifikasi Pembayaran',
  PAID: 'Lunas',
  COMPLETED: 'Selesai',
  REJECTED: 'Pembayaran Ditolak',
  CANCELLED: 'Pesanan Dibatalkan',
  EXPIRED: 'Kedaluwarsa',
};

/**
 * Format nama studio manusia (menghilangkan kode teknis DD-GG, DD-MK, dsb).
 */
export function formatStudioName(
  identifier: string | null | undefined,
  mode: 'full' | 'short' = 'full',
): string {
  if (!identifier) return 'Studio Daily Dose';
  const trimmed = identifier.trim();
  const normalizedKey = trimmed.toUpperCase();
  const lowerKey = trimmed.toLowerCase();

  const found = STUDIO_DICTIONARY[normalizedKey] || STUDIO_DICTIONARY[lowerKey];
  if (found) {
    return mode === 'short' ? found.short : found.full;
  }

  // Jika sudah berupa nama studio tanpa kode
  if (trimmed.startsWith('Daily Dose ')) {
    return mode === 'short' ? trimmed.replace('Daily Dose ', '') : trimmed;
  }

  // Bersihkan prefix DD- jika ada kode tak terdaftar
  if (trimmed.startsWith('DD-')) {
    const raw = trimmed.replace(/^DD-/, '').replace(/[-_]/g, ' ');
    const titleCase = raw
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
    return mode === 'short' ? titleCase : `Daily Dose ${titleCase}`;
  }

  return trimmed;
}

/**
 * Format tipe kelas (misal: PRIVATE_GROUP -> Private Group).
 */
export function formatClassType(type: string | null | undefined): string {
  if (!type) return 'Kelas Studio';
  const key = type.trim().toUpperCase();
  if (CLASS_TYPE_DICTIONARY[key]) {
    return CLASS_TYPE_DICTIONARY[key];
  }
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format tingkat kemahiran kelas (misal: ALL_LEVELS -> Semua Level).
 */
export function formatClassLevel(level: string | null | undefined): string {
  if (!level) return 'Semua Level';
  const key = level.trim().toUpperCase();
  if (CLASS_LEVEL_DICTIONARY[key]) {
    return CLASS_LEVEL_DICTIONARY[key];
  }
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format zona waktu (misal: Asia/Jakarta -> WIB).
 */
export function formatTimezone(tz: string | null | undefined): string {
  if (!tz) return 'WIB';
  const key = tz.trim();
  return TIMEZONE_DICTIONARY[key] || key;
}

/**
 * Format status verifikasi identitas customer ke bahasa manusia dengan deskripsi jelas.
 */
export function formatVerificationStatus(status: string | null | undefined): VerificationStatusInfo {
  const normalized = (status || 'UNVERIFIED').trim().toUpperCase();

  switch (normalized) {
    case 'APPROVED':
    case 'VERIFIED':
    case 'VERIFIED_BY_STUDIO':
      return {
        code: normalized,
        label: 'Terverifikasi',
        description: 'Identitas Anda telah terverifikasi resmi oleh studio Daily Dose.',
        variant: 'success',
      };
    case 'PENDING':
    case 'IN_REVIEW':
      return {
        code: normalized,
        label: 'Sedang Diperiksa',
        description: 'Data kamu sedang diperiksa tim studio. Kami kabari lewat WhatsApp kalau sudah selesai.',
        variant: 'warning',
      };
    case 'REJECTED':
      return {
        code: normalized,
        label: 'Verifikasi Ditolak',
        description: 'Data verifikasi ditolak oleh tim studio. Silakan periksa dan kirim ulang data Anda.',
        variant: 'danger',
      };
    case 'CUSTOMER_VERIFICATION_REQUIRED':
    case 'UNVERIFIED':
    default:
      return {
        code: normalized,
        label: 'Belum Terverifikasi',
        description:
          'Verifikasi identitas diperlukan sebelum membeli paket dan booking kelas. Sekitar 2 menit.',
        variant: 'info',
      };
  }
}

/**
 * Format status booking.
 */
export function formatBookingStatus(status: string | null | undefined): string {
  if (!status) return 'Menunggu';
  const key = status.trim().toUpperCase();
  return BOOKING_STATUS_DICTIONARY[key] || key;
}

/**
 * Format status pesanan / pembayaran.
 */
export function formatOrderStatus(status: string | null | undefined): string {
  if (!status) return 'Menunggu';
  const key = status.trim().toUpperCase();
  return ORDER_STATUS_DICTIONARY[key] || key;
}

/**
 * Format tanggal dengan kepastian menyertakan tahun jika bukan tahun kalender berjalan.
 * Sesuai aturan spesifikasi (T-16 & Bagian 2).
 */
export function formatTanggalHuman(
  value: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) return '-';
  const date = typeof value === 'object' && value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();
  const includeYear = dateYear !== currentYear || (options && 'year' in options);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
    ...options,
  };

  return new Intl.DateTimeFormat('id-ID', defaultOptions).format(date);
}

/**
 * Format ringkasan jumlah pesanan / item (menghilangkan format membingungkan "1 dari 0").
 */
export function formatCountLabel(count: number, itemNoun: string = 'pesanan'): string {
  if (count <= 0) return `Belum ada ${itemNoun}`;
  return `Menampilkan ${count} ${itemNoun}`;
}

/**
 * Pembersih teks antarmuka dari istilah teknis dan jargon mentah.
 */
export function sanitizeUserFacingText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\bKYC\b/gi, 'Verifikasi Identitas')
    .replace(/\bCUSTOMER_VERIFICATION_REQUIRED\b/gi, 'Verifikasi identitas diperlukan')
    .replace(/dd-checkin:v1:[a-zA-Z0-9_\-:]+/gi, 'QR Presensi Studio')
    .replace(/\bpayload\b/gi, 'data QR')
    .replace(/\bAsia\/Jakarta\b/gi, 'WIB')
    .replace(/\bALL_LEVELS\b/gi, 'Semua Level')
    .replace(/\bPRIVATE_GROUP\b/gi, 'Private Group')
    .replace(/\bSEMI_PRIVATE\b/gi, 'Semi Private');
}
