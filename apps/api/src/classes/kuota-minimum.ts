/**
 * Kuota minimum saat kelas mau mulai.
 *
 * Berbeda dari pembatalan otomatis H-24 yang menghitung jumlah booking jauh sebelum hari-H
 * (Keputusan Bisnis #4), aturan ini menghitung siapa yang benar-benar sudah memindai QR
 * menjelang kelas. Keduanya hidup berdampingan dan tidak saling menggantikan.
 *
 * Yang sengaja TIDAK dilakukan: membatalkan kelas secara otomatis. Pada menit itu peserta sudah
 * berada di studio dan instruktur sudah datang; aplikasi yang membatalkan sendiri akan terbaca
 * sebagai rusak, dan staf tetap harus menjelaskannya ke orang yang sudah berdiri di sana.
 * Sistem menandai, manusia memutuskan, dan keputusannya tercatat.
 */

/** Berapa lama sebelum kelas mulai keputusan harus sudah diambil. */
export const BATAS_KEPUTUSAN_MENIT = 5;

export type StatusKuota =
  /** Kuota minimum sudah terpenuhi, tidak ada yang perlu diputuskan. */
  | 'TERPENUHI'
  /** Masih kurang, tetapi batas keputusan belum lewat. */
  | 'KURANG'
  /** Masih kurang dan batas keputusan sudah lewat tanpa keputusan: kelas tetap berjalan. */
  | 'KURANG_LEWAT_BATAS'
  /** Kelas tidak memasang kuota minimum. */
  | 'TANPA_KUOTA';

export interface EvaluasiKuota {
  status: StatusKuota;
  hadir: number;
  minimum: number | null;
  kurang: number;
  /** Menit tersisa sampai keputusan harus diambil; negatif bila sudah lewat. */
  menitTersisa: number | null;
  /** True hanya saat staf benar-benar perlu menekan sesuatu. */
  perluKeputusan: boolean;
}

export function evaluasiKuota(params: {
  minQuota: number | null | undefined;
  hadir: number;
  startAt: Date;
  now: Date;
}): EvaluasiKuota {
  const { minQuota, hadir, startAt, now } = params;

  if (minQuota === null || minQuota === undefined || minQuota <= 0) {
    return {
      status: 'TANPA_KUOTA',
      hadir,
      minimum: null,
      kurang: 0,
      menitTersisa: null,
      perluKeputusan: false,
    };
  }

  const kurang = Math.max(0, minQuota - hadir);
  const batas = new Date(startAt.getTime() - BATAS_KEPUTUSAN_MENIT * 60_000);
  const menitTersisa = Math.floor((batas.getTime() - now.getTime()) / 60_000);

  if (kurang === 0) {
    return {
      status: 'TERPENUHI',
      hadir,
      minimum: minQuota,
      kurang: 0,
      menitTersisa,
      perluKeputusan: false,
    };
  }

  const lewat = now > batas;
  return {
    status: lewat ? 'KURANG_LEWAT_BATAS' : 'KURANG',
    hadir,
    minimum: minQuota,
    kurang,
    menitTersisa,
    perluKeputusan: !lewat,
  };
}

/**
 * Biaya menjalankan kelas di bawah kuota: honor instruktur tetap penuh sementara peserta kurang.
 * Dihitung per kursi yang kosong supaya laporan ke Super Owner menyebut angka, bukan kesan.
 */
export function selisihBeban(params: {
  honorInstrukturRp: number;
  minimum: number;
  hadir: number;
}): number {
  const { honorInstrukturRp, minimum, hadir } = params;
  if (minimum <= 0) return 0;
  const kurang = Math.max(0, minimum - hadir);
  return Math.round((honorInstrukturRp / minimum) * kurang);
}

/** Keputusan yang diambil staf saat kuota kurang; keduanya dicatat permanen. */
export type KeputusanKuota = 'TETAP_JALAN' | 'BATALKAN';

export interface CatatanKeputusan {
  action: string;
  classSlotId: string;
  decidedById: string;
  hadir: number;
  minimum: number;
  selisihBebanRp: number;
  reason: string;
}

export function catatanKeputusan(params: {
  keputusan: KeputusanKuota;
  classSlotId: string;
  decidedById: string;
  hadir: number;
  minimum: number;
  honorInstrukturRp: number;
  reason: string;
}): CatatanKeputusan {
  return {
    action:
      params.keputusan === 'TETAP_JALAN'
        ? 'class.below_quota_continued'
        : 'class.below_quota_cancelled',
    classSlotId: params.classSlotId,
    decidedById: params.decidedById,
    hadir: params.hadir,
    minimum: params.minimum,
    selisihBebanRp:
      params.keputusan === 'TETAP_JALAN'
        ? selisihBeban({
            honorInstrukturRp: params.honorInstrukturRp,
            minimum: params.minimum,
            hadir: params.hadir,
          })
        : 0,
    reason: params.reason,
  };
}
