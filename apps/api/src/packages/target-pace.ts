/**
 * Target omzet dan lajunya.
 *
 * Persentase tercapai menjelaskan posisi, bukan tindakan: "50% dari 1 juta" pada tanggal 28
 * berarti gawat, pada tanggal 5 berarti bagus, dan angkanya sama persis. Yang mengubah perilaku
 * adalah laju: berapa per hari yang masih dibutuhkan, dibanding berapa per hari yang selama ini
 * benar-benar terjadi.
 */

export interface Pace {
  /** Target satu periode, rupiah. */
  targetRp: number;
  /** Yang sudah masuk sampai hari ini, rupiah. */
  tercapaiRp: number;
  /** Sisa yang perlu dikejar; nol bila target sudah terlampaui. */
  sisaRp: number;
  /** Persentase tercapai, dibulatkan satu desimal. */
  tercapaiPersen: number;
  hariTerpakai: number;
  hariTersisa: number;
  /** Rata-rata harian yang sudah terjadi. */
  lajuSekarangRp: number;
  /** Rata-rata harian yang dibutuhkan untuk sisa hari; null bila hari habis. */
  lajuDibutuhkanRp: number | null;
  status: StatusPace;
}

export type StatusPace =
  /** Laju sekarang sudah cukup untuk mencapai target bila dipertahankan. */
  | 'DI_JALUR'
  /** Perlu naik, tetapi masih mungkin. */
  | 'PERLU_NAIK'
  /** Target sudah tercapai atau terlampaui. */
  | 'TERCAPAI'
  /** Periode sudah habis dan target tidak tercapai. */
  | 'PERIODE_HABIS';

const HARI_MS = 86_400_000;

/** Jumlah hari dalam satu periode `YYYY-MM`. */
export function hariDalamPeriode(period: string): number {
  const [tahun, bulan] = period.split('-').map(Number);
  if (!tahun || !bulan || bulan < 1 || bulan > 12) throw new Error(`Periode tidak sah: ${period}`);
  return new Date(Date.UTC(tahun, bulan, 0)).getUTCDate();
}

/**
 * Menghitung laju. `now` menentukan sudah berapa hari berjalan; hari berjalan dihitung penuh,
 * karena omzet hari ini masih bisa bertambah sampai studio tutup.
 */
export function hitungPace(params: {
  period: string;
  targetRp: number;
  tercapaiRp: number;
  now: Date;
}): Pace {
  const { period, targetRp, tercapaiRp, now } = params;
  const totalHari = hariDalamPeriode(period);

  const awal = new Date(`${period}-01T00:00:00.000Z`);
  const lewat = Math.floor((now.getTime() - awal.getTime()) / HARI_MS);
  const hariTerpakai = Math.min(totalHari, Math.max(1, lewat + 1));
  const hariTersisa = Math.max(0, totalHari - hariTerpakai);

  const sisaRp = Math.max(0, targetRp - tercapaiRp);
  const tercapaiPersen = targetRp <= 0 ? 0 : Math.round((tercapaiRp / targetRp) * 1000) / 10;
  const lajuSekarangRp = Math.round(tercapaiRp / hariTerpakai);
  const lajuDibutuhkanRp = hariTersisa === 0 ? null : Math.round(sisaRp / hariTersisa);

  let status: StatusPace;
  if (sisaRp === 0) status = 'TERCAPAI';
  else if (hariTersisa === 0) status = 'PERIODE_HABIS';
  else if (lajuSekarangRp >= (lajuDibutuhkanRp ?? 0)) status = 'DI_JALUR';
  else status = 'PERLU_NAIK';

  return {
    targetRp,
    tercapaiRp,
    sisaRp,
    tercapaiPersen,
    hariTerpakai,
    hariTersisa,
    lajuSekarangRp,
    lajuDibutuhkanRp,
    status,
  };
}

/**
 * Satu kalimat untuk ditempel apa adanya di dasbor. Sengaja menyebut angka harian, bukan hanya
 * persentase, supaya pembacanya tahu apa yang harus dilakukan hari ini.
 */
export function kalimatPace(pace: Pace, rupiah: (n: number) => string): string {
  switch (pace.status) {
    case 'TERCAPAI':
      return `Target tercapai. Masuk ${rupiah(pace.tercapaiRp)} dari target ${rupiah(pace.targetRp)}.`;
    case 'PERIODE_HABIS':
      return `Periode berakhir dengan ${rupiah(pace.tercapaiRp)} dari target ${rupiah(pace.targetRp)}, kurang ${rupiah(pace.sisaRp)}.`;
    case 'DI_JALUR':
      return `Di jalur. Sisa ${rupiah(pace.sisaRp)} dalam ${pace.hariTersisa} hari, butuh ${rupiah(pace.lajuDibutuhkanRp ?? 0)} per hari, sedangkan rata-rata sekarang ${rupiah(pace.lajuSekarangRp)} per hari.`;
    default:
      return `Perlu naik. Sisa ${rupiah(pace.sisaRp)} dalam ${pace.hariTersisa} hari, butuh ${rupiah(pace.lajuDibutuhkanRp ?? 0)} per hari, sedangkan rata-rata sekarang baru ${rupiah(pace.lajuSekarangRp)} per hari.`;
  }
}
