import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../foundation/audit.service';
import { dateInTimeZone, startOfLocalDateUtc } from '../identity/assignment-boundary';
import { ApiProblem } from '../identity/security';
import { KioskAccessService } from './kiosk-access.service';
import { StudioScanService, type ScanResult } from './studio-scan.service';

/**
 * Mencatat kehadiran dari pindaian perangkat studio.
 *
 * `StudioScanService` memutuskan apakah pass itu milik orang yang punya kelas sekarang; layanan ini
 * yang menulis. Penulisan diulang-periksa di dalam transaksi karena dua pindaian beruntun bisa
 * datang hampir bersamaan dari antrean di pintu, dan baris kehadiran yang unik per booking (atau
 * per kelas untuk instruktur) menjadi pengaman terakhir: pindaian kedua dijawab "sudah tercatat",
 * bukan galat.
 *
 * Pindaian yang ditolak ikut dicatat di audit, supaya "datang tanpa kelas yang cocok" bisa
 * dilaporkan, bukan hilang begitu saja.
 */

/** Kelas yang masih boleh menerima kehadiran; kuota minimum dinilai saat check-in, bukan sebelumnya. */
const STATUS_TERBUKA = new Set(['PUBLISHED', 'CONFIRMED']);

export interface HasilPindaiStudio extends ScanResult {
  tercatat: boolean;
  tercatatPada?: string;
  namaCabang: string;
  timezone: string;
}

export interface CatatanKiosk {
  nama: string;
  peran: 'MEMBER' | 'INSTRUKTUR';
  tercatatPada: string;
}

@Injectable()
export class StudioCheckInService {
  constructor(
    private readonly db: PrismaService,
    private readonly scan: StudioScanService,
    private readonly kiosk: KioskAccessService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  private async cabang(branchCode: string, token: string | undefined, now: Date) {
    const akses = await this.kiosk.requireAccess(branchCode, token, now);
    const detail = await this.db.cabang.findUnique({
      where: { id: akses.id },
      select: { id: true, name: true, timezone: true },
    });
    if (!detail) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return detail;
  }

  async pindai(
    branchCode: string,
    token: string | undefined,
    pass: unknown,
    now = new Date(),
  ): Promise<HasilPindaiStudio> {
    const cabang = await this.cabang(branchCode, token, now);
    const dasar = { namaCabang: cabang.name, timezone: cabang.timezone };

    const hasil = await this.scan.resolve(typeof pass === 'string' ? pass : '', cabang.id, now);
    if (!hasil.diterima || !hasil.orang || !hasil.kelas) {
      await this.catatPenolakan(cabang.id, hasil);
      return { ...hasil, ...dasar, tercatat: false };
    }

    const sudahAda = await this.tulis(hasil, now);
    if (sudahAda) {
      return { ...hasil, ...dasar, diterima: false, alasan: 'SUDAH_TERCATAT', tercatat: false };
    }

    await this.audit?.catat(null, {
      actorType: 'KIOSK',
      branchId: cabang.id,
      action: 'attendance.studio_scan',
      objectType: hasil.orang.peran === 'INSTRUKTUR' ? 'ClassSlot' : 'Booking',
      objectId: hasil.kelas.bookingId ?? hasil.kelas.classSlotId,
      targetUserId: hasil.orang.userId,
      afterMasked: { peran: hasil.orang.peran, classSlotId: hasil.kelas.classSlotId },
    });

    return { ...hasil, ...dasar, tercatat: true, tercatatPada: now.toISOString() };
  }

  /** Menulis kehadiran; `true` berarti ternyata sudah tercatat oleh pindaian lain. */
  private async tulis(hasil: ScanResult, now: Date): Promise<boolean> {
    const { orang, kelas } = hasil;
    try {
      return await this.db.$transaction(
        async (tx) => {
          const slot = await tx.slotKelas.findUnique({
            where: { id: kelas!.classSlotId },
            select: { status: true },
          });
          if (!slot || !STATUS_TERBUKA.has(slot.status)) {
            throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
          }

          if (orang!.peran === 'INSTRUKTUR') {
            const ada = await tx.kehadiranInstruktur.findUnique({
              where: { classSlotId: kelas!.classSlotId },
              select: { id: true },
            });
            if (ada) return true;
            await tx.kehadiranInstruktur.create({
              data: {
                id: randomUUID(),
                classSlotId: kelas!.classSlotId,
                instructorId: orang!.userId,
                method: 'QR_SCAN',
                checkedInAt: now,
                // Perangkat yang memindai milik cabang dan berada di studionya, jadi lokasinya pasti.
                isWithinGeofence: true,
                notes: 'Dipindai perangkat studio',
              },
            });
            return false;
          }

          const booking = await tx.pemesananKelas.findUnique({
            where: { id: kelas!.bookingId! },
            select: { status: true, attendance: { select: { id: true } } },
          });
          if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          if (booking.attendance) return true;
          if (booking.status !== 'BOOKED') {
            throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
          }
          await tx.kehadiranPelanggan.create({
            data: {
              id: randomUUID(),
              bookingId: kelas!.bookingId!,
              method: 'QR_SCAN',
              checkedInAt: now,
            },
          });
          await tx.pemesananKelas.update({
            where: { id: kelas!.bookingId! },
            data: { status: 'ATTENDED' },
          });
          return false;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      // Baris kehadiran unik per booking atau per kelas: pindaian kedua yang balapan kalah di sini.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        return true;
      throw error;
    }
  }

  private async catatPenolakan(branchId: string, hasil: ScanResult) {
    if (hasil.alasan === 'SUDAH_TERCATAT') return;
    await this.audit?.catat(null, {
      actorType: 'KIOSK',
      branchId,
      action: 'attendance.studio_scan_rejected',
      objectType: 'Branch',
      objectId: branchId,
      targetUserId: hasil.orang?.userId ?? null,
      reason: hasil.alasan ?? null,
      afterMasked: { alasan: hasil.alasan, classSlotId: hasil.kelas?.classSlotId ?? null },
    });
  }

  /**
   * Daftar singkat untuk layar studio: nama, peran, dan jam. Sengaja tanpa foto dan tanpa nomor
   * telepon, karena layar ini terlihat oleh siapa pun yang lewat di depan meja.
   */
  async hariIni(
    branchCode: string,
    token: string | undefined,
    now = new Date(),
  ): Promise<CatatanKiosk[]> {
    const cabang = await this.cabang(branchCode, token, now);
    const awal = startOfLocalDateUtc(dateInTimeZone(now, cabang.timezone), cabang.timezone);
    const akhir = new Date(awal.getTime() + 24 * 3_600_000);

    const [member, instruktur] = await Promise.all([
      this.db.kehadiranPelanggan.findMany({
        where: {
          checkedInAt: { gte: awal, lt: akhir },
          booking: { classSlot: { branchId: cabang.id } },
        },
        select: {
          checkedInAt: true,
          booking: { select: { user: { select: { displayName: true } } } },
        },
        orderBy: { checkedInAt: 'desc' },
        take: 10,
      }),
      this.db.kehadiranInstruktur.findMany({
        where: { checkedInAt: { gte: awal, lt: akhir }, classSlot: { branchId: cabang.id } },
        select: { checkedInAt: true, instructor: { select: { displayName: true } } },
        orderBy: { checkedInAt: 'desc' },
        take: 10,
      }),
    ]);

    return [
      ...member.map((m) => ({
        nama: m.booking.user.displayName,
        peran: 'MEMBER' as const,
        tercatatPada: m.checkedInAt.toISOString(),
      })),
      ...instruktur.map((i) => ({
        nama: i.instructor.displayName,
        peran: 'INSTRUKTUR' as const,
        tercatatPada: i.checkedInAt.toISOString(),
      })),
    ]
      .sort((a, b) => b.tercatatPada.localeCompare(a.tercatatPada))
      .slice(0, 10);
  }
}
