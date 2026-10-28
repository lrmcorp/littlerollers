/**
 * Kapan sebuah bukti transfer dianggap tertinggal.
 *
 * Aturannya: bukti yang belum diperiksa lebih dari dua hari sejak diunggah dihitung telat.
 * Jamnya memakai jam dinding sejak unggah, bukan hari kalender, supaya bukti yang masuk
 * Senin malam tidak langsung terhitung telat begitu Rabu dini hari tiba.
 *
 * Yang ditunggu bukan sekadar kerapian antrean: selama bukti belum disetujui, paket member
 * belum aktif dan dia belum bisa booking. Keterlambatan di sini langsung terasa oleh member.
 */

/** Batas pemeriksaan, dalam hari sejak bukti diunggah. */
export const BATAS_PERIKSA_HARI = 2;

const JAM_MS = 3_600_000;

export type StatusAntreanBukti =
  /** Sudah diperiksa, keluar dari antrean. */
  | 'SUDAH_DIPERIKSA'
  /** Belum diperiksa, masih dalam batas dua hari. */
  | 'MENUNGGU'
  /** Belum diperiksa dan sudah melewati batas. */
  | 'TELAT';

export interface AntreanBukti {
  status: StatusAntreanBukti;
  /** Lama menunggu sejak diunggah, dalam jam penuh. */
  umurJam: number;
  /** Berapa jam melewati batas; nol bila belum telat atau sudah diperiksa. */
  telatJam: number;
  /** Batas waktu pemeriksaan, agar antarmuka dapat menampilkan tenggatnya. */
  batasPeriksa: Date;
}

export function antreanBukti(params: {
  uploadedAt: Date;
  /** Waktu pembelian disetujui atau ditolak; null berarti belum diperiksa. */
  verifiedAt?: Date | null;
  now: Date;
  batasHari?: number;
}): AntreanBukti {
  const { uploadedAt, verifiedAt, now } = params;
  const batasHari = params.batasHari ?? BATAS_PERIKSA_HARI;
  const batasPeriksa = new Date(uploadedAt.getTime() + batasHari * 24 * JAM_MS);

  if (verifiedAt) {
    return {
      status: 'SUDAH_DIPERIKSA',
      umurJam: jamAntara(uploadedAt, verifiedAt),
      telatJam: 0,
      batasPeriksa,
    };
  }

  const umurJam = jamAntara(uploadedAt, now);
  const telat = now > batasPeriksa;

  return {
    status: telat ? 'TELAT' : 'MENUNGGU',
    umurJam,
    telatJam: telat ? jamAntara(batasPeriksa, now) : 0,
    batasPeriksa,
  };
}

/**
 * Mengurutkan antrean dari yang paling lama menunggu, bukan dari yang paling baru masuk.
 * Itu yang membedakan daftar tugas dari tumpukan masuk.
 */
export function urutTertinggalDulu<T>(baris: readonly T[], umur: (baris: T) => AntreanBukti): T[] {
  return [...baris].sort((a, b) => umur(b).umurJam - umur(a).umurJam);
}

/** Ringkasan antrean untuk kartu di dasbor. */
export function ringkasAntrean(semua: readonly AntreanBukti[]) {
  const menunggu = semua.filter((a) => a.status !== 'SUDAH_DIPERIKSA');
  const telat = menunggu.filter((a) => a.status === 'TELAT');
  return {
    menunggu: menunggu.length,
    telat: telat.length,
    /** Umur bukti yang paling lama menunggu; nol bila antrean bersih. */
    tertuaJam: menunggu.reduce((maks, a) => Math.max(maks, a.umurJam), 0),
  };
}

function jamAntara(dari: Date, sampai: Date): number {
  return Math.max(0, Math.floor((sampai.getTime() - dari.getTime()) / JAM_MS));
}
