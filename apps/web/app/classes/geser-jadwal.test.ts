import { describe, expect, it } from 'vitest';
import { geserJadwal } from './class-slot-presenters';

/** Selasa 09.15–10.15 WIB. */
const kelas = {
  startAt: new Date('2026-10-27T02:15:00.000Z'),
  endAt: new Date('2026-10-27T03:15:00.000Z'),
  hariAsal: '2026-10-27',
  jamAsal: 9,
};

describe('geserJadwal', () => {
  it('memindahkan ke jam lain pada hari yang sama', () => {
    const hasil = geserJadwal({ ...kelas, hariTujuan: '2026-10-27', jamTujuan: 11 })!;

    expect(hasil.startAt.toISOString()).toBe('2026-10-27T04:15:00.000Z');
    expect(hasil.endAt.toISOString()).toBe('2026-10-27T05:15:00.000Z');
  });

  it('mempertahankan menit mulai, bukan membulatkannya ke awal jam', () => {
    const hasil = geserJadwal({ ...kelas, hariTujuan: '2026-10-27', jamTujuan: 14 })!;

    // 09.15 diseret ke baris 14.00 menjadi 14.15 WIB, yaitu 07.15 UTC.
    expect(hasil.startAt.toISOString()).toBe('2026-10-27T07:15:00.000Z');
  });

  it('mempertahankan lama kelas', () => {
    const hasil = geserJadwal({ ...kelas, hariTujuan: '2026-10-30', jamTujuan: 20 })!;

    expect(hasil.endAt.getTime() - hasil.startAt.getTime()).toBe(3_600_000);
  });

  it('memindahkan ke hari lain pada jam yang sama', () => {
    const hasil = geserJadwal({ ...kelas, hariTujuan: '2026-10-30', jamTujuan: 9 })!;

    expect(hasil.startAt.toISOString()).toBe('2026-10-30T02:15:00.000Z');
  });

  it('bisa memindahkan ke hari sebelumnya', () => {
    const hasil = geserJadwal({ ...kelas, hariTujuan: '2026-10-26', jamTujuan: 9 })!;

    expect(hasil.startAt.toISOString()).toBe('2026-10-26T02:15:00.000Z');
  });

  it('tidak menyimpan apa pun bila dilepas di tempatnya sendiri', () => {
    expect(geserJadwal({ ...kelas, hariTujuan: '2026-10-27', jamTujuan: 9 })).toBeNull();
  });

  it('melewati pergantian bulan tanpa salah hitung', () => {
    const akhirBulan = {
      startAt: new Date('2026-10-31T02:00:00.000Z'),
      endAt: new Date('2026-10-31T03:00:00.000Z'),
      hariAsal: '2026-10-31',
      jamAsal: 9,
    };

    const hasil = geserJadwal({ ...akhirBulan, hariTujuan: '2026-11-02', jamTujuan: 9 })!;

    expect(hasil.startAt.toISOString()).toBe('2026-11-02T02:00:00.000Z');
  });

  it('menggeser kelas yang melewati tengah malam secara utuh', () => {
    const malam = {
      startAt: new Date('2026-10-27T15:00:00.000Z'), // 22.00 WIB
      endAt: new Date('2026-10-27T16:00:00.000Z'), // 23.00 WIB
      hariAsal: '2026-10-27',
      jamAsal: 22,
    };

    const hasil = geserJadwal({ ...malam, hariTujuan: '2026-10-28', jamTujuan: 9 })!;

    expect(hasil.startAt.toISOString()).toBe('2026-10-28T02:00:00.000Z');
    expect(hasil.endAt.toISOString()).toBe('2026-10-28T03:00:00.000Z');
  });
});
