import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  parsePass,
  passBelongsTo,
  scanWindowFor,
  SCAN_OPENS_MINUTES_BEFORE,
} from './check-in-pass';

/**
 * Pemindaian di studio: perangkat cabang memindai QR tetap milik member atau instruktur.
 *
 * Arahnya sengaja dibalik dari rancangan lama, saat instruktur memindai QR tablet studio dengan
 * ponselnya sendiri. Perangkat yang memindai sekarang milik studio dan berada di cabangnya, jadi
 * lokasi ikut terbukti tanpa geofence terpisah, dan honor instruktur tidak lagi dihitung dari
 * perangkat yang dikuasai orang yang dibayar.
 *
 * Layanan ini hanya memutuskan, tidak menulis. Pencatatan kehadiran dan pemotongan sesi tetap
 * lewat layanan kehadiran supaya hanya ada satu pintu yang menyentuh buku besar sesi.
 */

export type ScanRejection =
  | 'PASS_TIDAK_DIKENALI'
  | 'AKUN_BERHENTI'
  | 'TIDAK_ADA_KELAS'
  | 'BELUM_WAKTUNYA'
  | 'KELAS_SUDAH_LEWAT'
  | 'SUDAH_TERCATAT';

export interface ScanPerson {
  userId: string;
  nama: string;
  peran: 'MEMBER' | 'INSTRUKTUR';
  /** Selfie saat mendaftar, ditampilkan ke staf untuk dicocokkan dengan orang di depannya. */
  fotoUrl: string | null;
}

export interface ScanClass {
  classSlotId: string;
  bookingId: string | null;
  namaKelas: string | null;
  studio: string | null;
  mulai: string;
  selesai: string;
}

export interface ScanResult {
  diterima: boolean;
  alasan?: ScanRejection;
  /** Terisi begitu pass dikenali, walau pindaiannya ditolak, supaya staf tahu siapa yang mencoba. */
  orang?: ScanPerson;
  kelas?: ScanClass;
  bukaPadaMenitSebelum?: number;
}

const PERAN_INSTRUKTUR = new Set(['INSTRUCTOR', 'COACH']);
/** Sejauh mana ke belakang dan ke depan sebuah kelas masih dianggap "kelas orang ini hari ini". */
const RENTANG_JAM = 6;

@Injectable()
export class StudioScanService {
  constructor(private readonly db: PrismaService) {}

  async resolve(scanned: string, branchId: string, now = new Date()): Promise<ScanResult> {
    const body = parsePass(scanned);
    if (!body) return { diterima: false, alasan: 'PASS_TIDAK_DIKENALI' };

    const pemilik = await this.cariPemilik(body);
    if (!pemilik) return { diterima: false, alasan: 'PASS_TIDAK_DIKENALI' };

    const orang: ScanPerson = {
      userId: pemilik.id,
      nama: pemilik.displayName,
      peran: PERAN_INSTRUKTUR.has(pemilik.role) ? 'INSTRUKTUR' : 'MEMBER',
      fotoUrl: pemilik.profile?.selfieUrl ?? null,
    };

    if (pemilik.stoppedAt) return { diterima: false, alasan: 'AKUN_BERHENTI', orang };

    const kelas =
      orang.peran === 'INSTRUKTUR'
        ? await this.kelasInstruktur(orang.userId, branchId, now)
        : await this.kelasMember(orang.userId, branchId, now);

    if (!kelas) return { diterima: false, alasan: 'TIDAK_ADA_KELAS', orang };

    const jendela = scanWindowFor(kelas.startAt, kelas.endAt, now);
    if (jendela !== 'OPEN') {
      return {
        diterima: false,
        alasan: jendela === 'TOO_EARLY' ? 'BELUM_WAKTUNYA' : 'KELAS_SUDAH_LEWAT',
        orang,
        kelas: bentukKelas(kelas),
        bukaPadaMenitSebelum: SCAN_OPENS_MINUTES_BEFORE,
      };
    }

    if (kelas.sudahTercatat) {
      return { diterima: false, alasan: 'SUDAH_TERCATAT', orang, kelas: bentukKelas(kelas) };
    }

    return { diterima: true, orang, kelas: bentukKelas(kelas) };
  }

  /**
   * Pass adalah HMAC dari userId, jadi tidak bisa dibalik. Pemiliknya dicari dengan menurunkan
   * ulang pass tiap kandidat lalu membandingkannya dalam waktu tetap.
   *
   * Kandidatnya hanya id akun aktif, bukan baris penuh, dan lima cabang berarti ribuan baris, bukan
   * jutaan. Bila jumlah member nanti melewati puluhan ribu, simpan hasil HMAC pada kolom User
   * ber-indeks unik dan ganti perulangan ini dengan satu query.
   */
  private async cariPemilik(body: string) {
    const kandidat: Array<{ id: string }> = await this.db.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    });

    const cocok = kandidat.find((u) => passBelongsTo(u.id, body));
    if (!cocok) return null;

    return this.db.user.findUnique({
      where: { id: cocok.id },
      select: {
        id: true,
        displayName: true,
        role: true,
        stoppedAt: true,
        profile: { select: { selfieUrl: true } },
      },
    });
  }

  private async kelasInstruktur(userId: string, branchId: string, now: Date) {
    const slot = await this.db.slotKelas.findFirst({
      where: {
        instructorId: userId,
        branchId,
        startAt: rentang(now),
        status: { in: ['PUBLISHED', 'CONFIRMED'] },
      },
      orderBy: { startAt: 'asc' },
      include: { classType: { select: { name: true } }, studio: { select: { name: true } } },
    });
    if (!slot) return null;

    const hadir = await this.db.kehadiranInstruktur.findUnique({
      where: { classSlotId: slot.id },
      select: { id: true },
    });
    return { ...ringkas(slot), bookingId: null, sudahTercatat: Boolean(hadir) };
  }

  private async kelasMember(userId: string, branchId: string, now: Date) {
    const booking = await this.db.pemesananKelas.findFirst({
      where: {
        userId,
        status: 'BOOKED',
        classSlot: {
          branchId,
          startAt: rentang(now),
          status: { in: ['PUBLISHED', 'CONFIRMED'] },
        },
      },
      orderBy: { classSlot: { startAt: 'asc' } },
      include: {
        classSlot: {
          include: { classType: { select: { name: true } }, studio: { select: { name: true } } },
        },
      },
    });
    if (!booking) return null;

    const hadir = await this.db.kehadiranPelanggan.findUnique({
      where: { bookingId: booking.id },
      select: { id: true },
    });
    return { ...ringkas(booking.classSlot), bookingId: booking.id, sudahTercatat: Boolean(hadir) };
  }
}

function rentang(now: Date) {
  return {
    gte: new Date(now.getTime() - RENTANG_JAM * 3_600_000),
    lte: new Date(now.getTime() + RENTANG_JAM * 3_600_000),
  };
}

interface SlotRingkas {
  id: string;
  startAt: Date;
  endAt: Date;
  classType: { name: string } | null;
  studio: { name: string } | null;
}

function ringkas(slot: SlotRingkas) {
  return {
    id: slot.id,
    startAt: slot.startAt,
    endAt: slot.endAt,
    namaKelas: slot.classType?.name ?? null,
    studio: slot.studio?.name ?? null,
  };
}

function bentukKelas(k: ReturnType<typeof ringkas> & { bookingId: string | null }): ScanClass {
  return {
    classSlotId: k.id,
    bookingId: k.bookingId,
    namaKelas: k.namaKelas,
    studio: k.studio,
    mulai: k.startAt.toISOString(),
    selesai: k.endAt.toISOString(),
  };
}
