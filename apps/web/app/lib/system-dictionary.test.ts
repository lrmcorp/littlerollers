import { describe, expect, it } from 'vitest';
import {
  formatBookingStatus,
  formatClassLevel,
  formatClassType,
  formatCountLabel,
  formatOrderStatus,
  formatStudioName,
  formatTanggalHuman,
  formatTimezone,
  formatVerificationStatus,
  sanitizeUserFacingText,
} from './system-dictionary';

describe('system-dictionary', () => {
  describe('formatStudioName', () => {
    it('translates known branch codes to full studio names by default', () => {
      expect(formatStudioName('DD-GG')).toBe('Daily Dose Green Garden');
      expect(formatStudioName('DD-MK')).toBe('Daily Dose Muara Karang');
      expect(formatStudioName('DD-SBY')).toBe('Daily Dose Graha Family Surabaya');
      expect(formatStudioName('DD-PIK2')).toBe('Daily Dose Orange Groves PIK 2');
      expect(formatStudioName('DD-UNTAR')).toBe('Daily Dose Untar Kampus 2');
    });

    it('translates branch codes to short studio names when requested', () => {
      expect(formatStudioName('DD-GG', 'short')).toBe('Green Garden');
      expect(formatStudioName('DD-MK', 'short')).toBe('Muara Karang');
      expect(formatStudioName('DD-SBY', 'short')).toBe('Graha Family Surabaya');
      expect(formatStudioName('DD-PIK2', 'short')).toBe('Orange Groves PIK 2');
      expect(formatStudioName('DD-UNTAR', 'short')).toBe('Untar Kampus 2');
    });

    it('supports lower-case slug identifiers', () => {
      expect(formatStudioName('green-garden')).toBe('Daily Dose Green Garden');
      expect(formatStudioName('muara-karang', 'short')).toBe('Muara Karang');
      expect(formatStudioName('orange-groves-pik2')).toBe('Daily Dose Orange Groves PIK 2');
    });

    it('handles studio name that already has full brand prefix cleanly', () => {
      expect(formatStudioName('Daily Dose Green Garden', 'short')).toBe('Green Garden');
      expect(formatStudioName('Daily Dose Green Garden', 'full')).toBe('Daily Dose Green Garden');
    });

    it('falls back safely for null, undefined, or empty values', () => {
      expect(formatStudioName(null)).toBe('Studio Daily Dose');
      expect(formatStudioName(undefined)).toBe('Studio Daily Dose');
      expect(formatStudioName('')).toBe('Studio Daily Dose');
    });

    it('strips DD- prefix cleanly for unknown codes', () => {
      expect(formatStudioName('DD-BALI_SANUR')).toBe('Daily Dose Bali Sanur');
      expect(formatStudioName('DD-BALI_SANUR', 'short')).toBe('Bali Sanur');
    });
  });

  describe('formatClassType', () => {
    it('translates database class types to human readable labels', () => {
      expect(formatClassType('PRIVATE_GROUP')).toBe('Private Group');
      expect(formatClassType('SEMI_PRIVATE')).toBe('Semi Private');
      expect(formatClassType('PRIVATE')).toBe('Private');
      expect(formatClassType('GROUP')).toBe('Group');
      expect(formatClassType('ALL_TYPES')).toBe('Semua Tipe');
      expect(formatClassType('ALL')).toBe('Semua Tipe');
    });

    it('falls back gracefully on null or unrecognized types', () => {
      expect(formatClassType(null)).toBe('Kelas Studio');
      expect(formatClassType(undefined)).toBe('Kelas Studio');
      expect(formatClassType('SPECIAL_REFORMER')).toBe('Special Reformer');
    });
  });

  describe('formatClassLevel', () => {
    it('translates database levels to Indonesian terms', () => {
      expect(formatClassLevel('ALL_LEVELS')).toBe('Semua Level');
      expect(formatClassLevel('BEGINNER')).toBe('Pemula');
      expect(formatClassLevel('INTERMEDIATE')).toBe('Menengah');
      expect(formatClassLevel('ADVANCED')).toBe('Lanjutan');
    });

    it('falls back gracefully for null or unknown levels', () => {
      expect(formatClassLevel(null)).toBe('Semua Level');
      expect(formatClassLevel(undefined)).toBe('Semua Level');
      expect(formatClassLevel('MASTER_CLASS')).toBe('Master Class');
    });
  });

  describe('formatTimezone', () => {
    it('translates standard IANA timezones to Indonesian abbreviations', () => {
      expect(formatTimezone('Asia/Jakarta')).toBe('WIB');
      expect(formatTimezone('Asia/Pontianak')).toBe('WIB');
      expect(formatTimezone('Asia/Makassar')).toBe('WITA');
      expect(formatTimezone('Asia/Jayapura')).toBe('WIT');
    });

    it('defaults to WIB on empty values', () => {
      expect(formatTimezone(null)).toBe('WIB');
      expect(formatTimezone(undefined)).toBe('WIB');
      expect(formatTimezone('')).toBe('WIB');
    });
  });

  describe('formatVerificationStatus', () => {
    it('maps APPROVED to success variant with clear description', () => {
      const res = formatVerificationStatus('APPROVED');
      expect(res.label).toBe('Terverifikasi');
      expect(res.variant).toBe('success');
      expect(res.description).toContain('terverifikasi resmi');
    });

    it('maps PENDING to warning variant with WhatsApp follow-up hint', () => {
      const res = formatVerificationStatus('PENDING');
      expect(res.label).toBe('Sedang Diperiksa');
      expect(res.variant).toBe('warning');
      expect(res.description).toContain('WhatsApp');
    });

    it('maps REJECTED to danger variant with resubmission guidance', () => {
      const res = formatVerificationStatus('REJECTED');
      expect(res.label).toBe('Verifikasi Ditolak');
      expect(res.variant).toBe('danger');
      expect(res.description).toContain('kirim ulang');
    });

    it('maps UNVERIFIED and CUSTOMER_VERIFICATION_REQUIRED to info variant with 2 minute estimate', () => {
      const res = formatVerificationStatus('CUSTOMER_VERIFICATION_REQUIRED');
      expect(res.label).toBe('Belum Terverifikasi');
      expect(res.variant).toBe('info');
      expect(res.description).toContain('2 menit');
    });
  });

  describe('formatBookingStatus', () => {
    it('translates booking states into polite Indonesian verbs', () => {
      expect(formatBookingStatus('CONFIRMED')).toBe('Terkonfirmasi');
      expect(formatBookingStatus('COMPLETED')).toBe('Selesai');
      expect(formatBookingStatus('CANCELLED')).toBe('Dibatalkan');
      expect(formatBookingStatus('NO_SHOW')).toBe('Tidak Hadir');
      expect(formatBookingStatus('PENDING')).toBe('Menunggu Konfirmasi');
    });
  });

  describe('formatOrderStatus', () => {
    it('translates order states accurately', () => {
      expect(formatOrderStatus('WAITING_FOR_PAYMENT')).toBe('Menunggu Pembayaran');
      expect(formatOrderStatus('WAITING_FOR_CONFIRMATION')).toBe('Menunggu Verifikasi Pembayaran');
      expect(formatOrderStatus('PAID')).toBe('Lunas');
      expect(formatOrderStatus('CANCELLED')).toBe('Pesanan Dibatalkan');
      expect(formatOrderStatus('EXPIRED')).toBe('Kedaluwarsa');
    });
  });

  describe('formatTanggalHuman', () => {
    it('returns "-" for null or invalid date', () => {
      expect(formatTanggalHuman(null)).toBe('-');
      expect(formatTanggalHuman('invalid-date')).toBe('-');
    });

    it('includes the year if the date is not in the current calendar year', () => {
      const pastDate = new Date(2025, 9, 2); // 2 Okt 2025
      const formatted = formatTanggalHuman(pastDate);
      expect(formatted).toContain('2025');
    });

    it('supports custom options if provided', () => {
      const date = new Date(2025, 9, 2);
      const formatted = formatTanggalHuman(date, { month: 'long' });
      expect(formatted).toContain('Oktober');
      expect(formatted).toContain('2025');
    });
  });

  describe('formatCountLabel', () => {
    it('prevents confusing "1 dari 0" format', () => {
      expect(formatCountLabel(0)).toBe('Belum ada pesanan');
      expect(formatCountLabel(1)).toBe('Menampilkan 1 pesanan');
      expect(formatCountLabel(5, 'kelas')).toBe('Menampilkan 5 kelas');
    });
  });

  describe('sanitizeUserFacingText', () => {
    it('purges technical jargon from sentences', () => {
      const raw = 'Silakan lakukan KYC dan selesaikan payload dd-checkin:v1:abc di Asia/Jakarta untuk kelas ALL_LEVELS';
      const clean = sanitizeUserFacingText(raw);
      expect(clean).not.toContain('KYC');
      expect(clean).toContain('Verifikasi Identitas');
      expect(clean).not.toContain('dd-checkin:v1:abc');
      expect(clean).toContain('QR Presensi Studio');
      expect(clean).not.toContain('Asia/Jakarta');
      expect(clean).toContain('WIB');
      expect(clean).not.toContain('ALL_LEVELS');
      expect(clean).toContain('Semua Level');
    });
  });
});
