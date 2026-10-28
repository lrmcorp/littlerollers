import {
  BATAS_KEPUTUSAN_MENIT,
  catatanKeputusan,
  evaluasiKuota,
  selisihBeban,
} from './kuota-minimum';

const MULAI = new Date('2026-10-28T17:30:00.000Z');
const menitSebelum = (m: number) => new Date(MULAI.getTime() - m * 60_000);

describe('evaluasi kuota minimum saat kelas mau mulai', () => {
  it('diam saja ketika kuota sudah terpenuhi', () => {
    const hasil = evaluasiKuota({ minQuota: 3, hadir: 3, startAt: MULAI, now: menitSebelum(20) });

    expect(hasil.status).toBe('TERPENUHI');
    expect(hasil.perluKeputusan).toBe(false);
    expect(hasil.kurang).toBe(0);
  });

  it('diam saja ketika peserta melebihi minimum', () => {
    const hasil = evaluasiKuota({ minQuota: 3, hadir: 7, startAt: MULAI, now: menitSebelum(20) });

    expect(hasil.status).toBe('TERPENUHI');
    expect(hasil.kurang).toBe(0);
  });

  it('meminta keputusan ketika masih kurang dan batas belum lewat', () => {
    const hasil = evaluasiKuota({ minQuota: 3, hadir: 2, startAt: MULAI, now: menitSebelum(20) });

    expect(hasil.status).toBe('KURANG');
    expect(hasil.perluKeputusan).toBe(true);
    expect(hasil.kurang).toBe(1);
    expect(hasil.menitTersisa).toBe(20 - BATAS_KEPUTUSAN_MENIT);
  });

  it('berhenti meminta keputusan setelah batas lewat, kelas tetap berjalan', () => {
    const hasil = evaluasiKuota({ minQuota: 3, hadir: 2, startAt: MULAI, now: menitSebelum(1) });

    expect(hasil.status).toBe('KURANG_LEWAT_BATAS');
    expect(hasil.perluKeputusan).toBe(false);
    expect(hasil.menitTersisa).toBeLessThan(0);
  });

  it('tepat pada batas keputusan masih dianggap belum lewat', () => {
    const hasil = evaluasiKuota({
      minQuota: 3,
      hadir: 2,
      startAt: MULAI,
      now: menitSebelum(BATAS_KEPUTUSAN_MENIT),
    });

    expect(hasil.status).toBe('KURANG');
    expect(hasil.menitTersisa).toBe(0);
  });

  it('tidak menuntut apa pun dari kelas yang memang tanpa kuota minimum', () => {
    for (const minQuota of [null, undefined, 0]) {
      const hasil = evaluasiKuota({ minQuota, hadir: 0, startAt: MULAI, now: menitSebelum(20) });
      expect(hasil.status).toBe('TANPA_KUOTA');
      expect(hasil.perluKeputusan).toBe(false);
      expect(hasil.minimum).toBeNull();
    }
  });

  it('tidak pernah melaporkan kekurangan negatif', () => {
    const hasil = evaluasiKuota({ minQuota: 2, hadir: 9, startAt: MULAI, now: menitSebelum(10) });

    expect(hasil.kurang).toBe(0);
  });
});

describe('selisih beban saat kelas tetap dijalankan', () => {
  it('menghitung per kursi yang kosong', () => {
    expect(selisihBeban({ honorInstrukturRp: 300_000, minimum: 3, hadir: 2 })).toBe(100_000);
    expect(selisihBeban({ honorInstrukturRp: 300_000, minimum: 3, hadir: 1 })).toBe(200_000);
  });

  it('nol ketika kuota terpenuhi', () => {
    expect(selisihBeban({ honorInstrukturRp: 300_000, minimum: 3, hadir: 3 })).toBe(0);
    expect(selisihBeban({ honorInstrukturRp: 300_000, minimum: 3, hadir: 5 })).toBe(0);
  });

  it('nol ketika kelas tidak memasang kuota', () => {
    expect(selisihBeban({ honorInstrukturRp: 300_000, minimum: 0, hadir: 0 })).toBe(0);
  });

  it('membulatkan ke rupiah utuh', () => {
    expect(
      Number.isInteger(selisihBeban({ honorInstrukturRp: 100_000, minimum: 3, hadir: 1 })),
    ).toBe(true);
  });
});

describe('catatan keputusan untuk laporan ke Super Owner', () => {
  const dasar = {
    classSlotId: '00000000-0000-4000-8000-000000000090',
    decidedById: '00000000-0000-4000-8000-000000000010',
    hadir: 2,
    minimum: 3,
    honorInstrukturRp: 300_000,
    reason: 'Dua peserta sudah berada di studio',
  };

  it('mencatat keputusan tetap jalan beserta selisih bebannya', () => {
    const catatan = catatanKeputusan({ ...dasar, keputusan: 'TETAP_JALAN' });

    expect(catatan.action).toBe('class.below_quota_continued');
    expect(catatan.selisihBebanRp).toBe(100_000);
    expect(catatan.decidedById).toBe(dasar.decidedById);
    expect(catatan.reason).toBe(dasar.reason);
  });

  it('tidak membebankan apa pun ketika kelas dibatalkan', () => {
    const catatan = catatanKeputusan({ ...dasar, keputusan: 'BATALKAN' });

    expect(catatan.action).toBe('class.below_quota_cancelled');
    expect(catatan.selisihBebanRp).toBe(0);
  });

  it('selalu membawa siapa yang memutuskan, supaya laporan tidak anonim', () => {
    for (const keputusan of ['TETAP_JALAN', 'BATALKAN'] as const) {
      const catatan = catatanKeputusan({ ...dasar, keputusan });
      expect(catatan.decidedById).toBeTruthy();
      expect(catatan.classSlotId).toBeTruthy();
    }
  });
});
