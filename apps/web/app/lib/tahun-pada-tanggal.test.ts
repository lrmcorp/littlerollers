import { describe, expect, it } from 'vitest';
import { formatBranchDay } from './class-time';
import { formatTanggalSingkat } from './formatters';

const now = new Date('2026-10-27T05:00:00Z');

describe('tahun pada tanggal (T-16)', () => {
  it('formatBranchDay menulis tahun bila bukan tahun berjalan, supaya tahun lalu tidak terbaca sebagai minggu ini', () => {
    expect(formatBranchDay('2026-11-02', 'Asia/Jakarta', now)).toBe('Sen, 2 Nov');
    expect(formatBranchDay('2025-11-03', 'Asia/Jakarta', now)).toBe('Sen, 3 Nov 2025');
    expect(formatBranchDay('2027-01-04', 'Asia/Jakarta', now)).toBe('Sen, 4 Jan 2027');
  });

  it('memakai tahun berjalan menurut zona waktu cabang, bukan zona perangkat', () => {
    // 31 Des 2026 18.00 UTC sudah 1 Jan 2027 di Jakarta (WIB)
    const newYear = new Date('2026-12-31T18:00:00Z');
    expect(formatBranchDay('2026-12-31', 'Asia/Jakarta', newYear)).toBe('Kam, 31 Des 2026');
    expect(formatBranchDay('2027-01-01', 'Asia/Jakarta', newYear)).toBe('Jum, 1 Jan');
  });

  it('formatTanggalSingkat menulis tahun hanya bila bukan tahun berjalan', () => {
    expect(formatTanggalSingkat('2026-10-30T03:00:00Z', { timeZone: 'Asia/Jakarta', now })).toBe('30 Okt');
    expect(formatTanggalSingkat('2025-10-30T03:00:00Z', { timeZone: 'Asia/Jakarta', now })).toBe('30 Okt 2025');
    expect(formatTanggalSingkat('2026-10-30T03:00:00Z', { timeZone: 'Asia/Jakarta', weekday: 'long', month: 'long', now })).toBe('Jumat, 30 Oktober');
    expect(formatTanggalSingkat('2025-10-30T03:00:00Z', { timeZone: 'Asia/Jakarta', weekday: 'short', now })).toBe('Kam, 30 Okt 2025');
  });

  it('tanggal kosong atau tidak valid menjadi tanda hubung', () => {
    expect(formatTanggalSingkat(null)).toBe('-');
    expect(formatTanggalSingkat('bukan tanggal')).toBe('-');
  });
});
