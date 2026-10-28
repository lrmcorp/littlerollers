import { hariDalamPeriode, hitungPace, kalimatPace } from './target-pace';

const rp = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
const hari = (periode: string, tanggal: number) =>
  new Date(`${periode}-${String(tanggal).padStart(2, '0')}T10:00:00.000Z`);

describe('hariDalamPeriode', () => {
  it('mengenali panjang bulan yang berbeda', () => {
    expect(hariDalamPeriode('2026-01')).toBe(31);
    expect(hariDalamPeriode('2026-02')).toBe(28);
    expect(hariDalamPeriode('2026-04')).toBe(30);
  });

  it('mengenali Februari tahun kabisat', () => {
    expect(hariDalamPeriode('2028-02')).toBe(29);
  });

  it('menolak periode yang tidak sah', () => {
    expect(() => hariDalamPeriode('2026-13')).toThrow();
    expect(() => hariDalamPeriode('bukan-periode')).toThrow();
  });
});

describe('hitungPace', () => {
  it('angka yang sama berarti berbeda di awal dan di akhir bulan', () => {
    const awal = hitungPace({
      period: '2026-10',
      targetRp: 1_000_000,
      tercapaiRp: 500_000,
      now: hari('2026-10', 5),
    });
    const akhir = hitungPace({
      period: '2026-10',
      targetRp: 1_000_000,
      tercapaiRp: 500_000,
      now: hari('2026-10', 28),
    });

    expect(awal.tercapaiPersen).toBe(50);
    expect(akhir.tercapaiPersen).toBe(50);
    expect(awal.status).toBe('DI_JALUR');
    expect(akhir.status).toBe('PERLU_NAIK');
  });

  it('menghitung laju yang dibutuhkan untuk sisa hari', () => {
    const pace = hitungPace({
      period: '2026-10',
      targetRp: 1_000_000,
      tercapaiRp: 500_000,
      now: hari('2026-10', 28),
    });

    expect(pace.hariTerpakai).toBe(28);
    expect(pace.hariTersisa).toBe(3);
    expect(pace.sisaRp).toBe(500_000);
    expect(pace.lajuDibutuhkanRp).toBe(Math.round(500_000 / 3));
  });

  it('menghitung laju yang sudah terjadi dari hari yang sudah lewat', () => {
    const pace = hitungPace({
      period: '2026-10',
      targetRp: 1_000_000,
      tercapaiRp: 280_000,
      now: hari('2026-10', 14),
    });

    expect(pace.hariTerpakai).toBe(14);
    expect(pace.lajuSekarangRp).toBe(20_000);
  });

  it('menandai tercapai dan tidak meminta laju tambahan', () => {
    const pace = hitungPace({
      period: '2026-10',
      targetRp: 1_000_000,
      tercapaiRp: 1_200_000,
      now: hari('2026-10', 20),
    });

    expect(pace.status).toBe('TERCAPAI');
    expect(pace.sisaRp).toBe(0);
    expect(pace.tercapaiPersen).toBe(120);
  });

  it('menandai periode habis ketika hari terakhir dan target belum tercapai', () => {
    const pace = hitungPace({
      period: '2026-10',
      targetRp: 1_000_000,
      tercapaiRp: 700_000,
      now: hari('2026-10', 31),
    });

    expect(pace.hariTersisa).toBe(0);
    expect(pace.lajuDibutuhkanRp).toBeNull();
    expect(pace.status).toBe('PERIODE_HABIS');
  });

  it('hari pertama dihitung penuh, bukan nol, supaya laju tidak membagi dengan nol', () => {
    const pace = hitungPace({
      period: '2026-10',
      targetRp: 1_000_000,
      tercapaiRp: 50_000,
      now: hari('2026-10', 1),
    });

    expect(pace.hariTerpakai).toBe(1);
    expect(pace.lajuSekarangRp).toBe(50_000);
    expect(Number.isFinite(pace.lajuSekarangRp)).toBe(true);
  });

  it('tidak pecah ketika belum ada omzet sama sekali', () => {
    const pace = hitungPace({
      period: '2026-10',
      targetRp: 1_000_000,
      tercapaiRp: 0,
      now: hari('2026-10', 3),
    });

    expect(pace.tercapaiPersen).toBe(0);
    expect(pace.lajuSekarangRp).toBe(0);
    expect(pace.status).toBe('PERLU_NAIK');
  });

  it('tidak pecah ketika target belum diisi', () => {
    const pace = hitungPace({
      period: '2026-10',
      targetRp: 0,
      tercapaiRp: 250_000,
      now: hari('2026-10', 10),
    });

    expect(pace.tercapaiPersen).toBe(0);
    expect(pace.status).toBe('TERCAPAI');
  });

  it('tidak melaporkan sisa negatif saat target terlampaui', () => {
    const pace = hitungPace({
      period: '2026-10',
      targetRp: 500_000,
      tercapaiRp: 900_000,
      now: hari('2026-10', 10),
    });

    expect(pace.sisaRp).toBe(0);
  });
});

describe('kalimatPace', () => {
  it('menyebut angka harian, bukan hanya persentase', () => {
    const pace = hitungPace({
      period: '2026-10',
      targetRp: 1_000_000,
      tercapaiRp: 500_000,
      now: hari('2026-10', 28),
    });
    const kalimat = kalimatPace(pace, rp);

    expect(kalimat).toContain('per hari');
    expect(kalimat).toContain('3 hari');
    expect(kalimat).toContain('Perlu naik');
  });

  it('berbeda bunyinya saat sudah tercapai', () => {
    const pace = hitungPace({
      period: '2026-10',
      targetRp: 1_000_000,
      tercapaiRp: 1_000_000,
      now: hari('2026-10', 20),
    });

    expect(kalimatPace(pace, rp)).toContain('Target tercapai');
  });

  it('tidak menyebut laju yang mustahil saat periode sudah habis', () => {
    const pace = hitungPace({
      period: '2026-10',
      targetRp: 1_000_000,
      tercapaiRp: 700_000,
      now: hari('2026-10', 31),
    });
    const kalimat = kalimatPace(pace, rp);

    expect(kalimat).toContain('Periode berakhir');
    expect(kalimat).not.toContain('per hari');
  });
});
