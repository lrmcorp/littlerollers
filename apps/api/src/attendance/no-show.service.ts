import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { financeRange } from '../packages/finance-range';

/**
 * Laporan peserta yang tidak hadir dan sesinya hangus.
 *
 * Pemotongan sesinya sendiri sudah berjalan di `SlotKelasService.complete`: saat kelas ditutup,
 * sesi terpotong baik peserta hadir maupun mangkir. Yang belum ada adalah tempat melihatnya,
 * padahal justru di situ koreksi bermula. Sesi hangus karena kelalaian member itu wajar, tetapi
 * sesi hangus karena kesalahan studio harus bisa ditemukan dan dikembalikan.
 */

export interface NoShowRow {
  bookingId: string;
  userId: string;
  nama: string;
  phone: string | null;
  classSlotId: string;
  namaKelas: string | null;
  branchId: string;
  mulai: string;
  /** Sisa sesi paket setelah pemotongan, agar staf tahu dampaknya ke member. */
  sisaSesi: number | null;
  /** True bila sudah ada penyesuaian manual yang mengembalikan sesi ini. */
  sudahDikoreksi: boolean;
}

export interface NoShowReport {
  range: { from: string; until: string; label: string };
  branchId: string;
  total: number;
  /** Jumlah member berbeda; satu orang bisa mangkir beberapa kali. */
  totalMember: number;
  sudahDikoreksi: number;
  rows: NoShowRow[];
}

interface NoShowQuery {
  branchId?: string;
  from?: string;
  until?: string;
  period?: string;
}

interface BookingRow {
  id: string;
  userId: string;
  customerPackageId: string | null;
  user: { displayName: string; phone: string | null } | null;
  customerPackage: { remainingSessions: number } | null;
  classSlot: {
    id: string;
    branchId: string;
    startAt: Date;
    classType: { name: string } | null;
  };
}

@Injectable()
export class NoShowService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  private ensureBranchAccess(principal: SessionPrincipal, targetBranchId?: string) {
    if (principal.capabilities.includes('branch:all')) return;
    if (!targetBranchId || !principal.branchIds.includes(targetBranchId)) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
  }

  async report(
    principal: SessionPrincipal,
    input: NoShowQuery = {},
    now = new Date(),
  ): Promise<NoShowReport> {
    this.policy.requireCapability(principal.capabilities, 'attendance:read');
    this.ensureBranchAccess(principal, input.branchId);

    const range = financeRange(input, now);

    const bookings: BookingRow[] = await this.db.pemesananKelas.findMany({
      where: {
        status: 'NO_SHOW',
        classSlot: {
          startAt: { gte: range.fromDate, lt: range.untilExclusive },
          ...(input.branchId ? { branchId: input.branchId } : {}),
        },
      },
      include: {
        user: { select: { displayName: true, phone: true } },
        customerPackage: { select: { remainingSessions: true } },
        classSlot: {
          select: {
            id: true,
            branchId: true,
            startAt: true,
            classType: { select: { name: true } },
          },
        },
      },
      orderBy: { classSlot: { startAt: 'desc' } },
    });

    const terlihat = bookings.filter((b) =>
      principal.capabilities.includes('branch:all')
        ? true
        : principal.branchIds.includes(b.classSlot.branchId),
    );

    // Sesi yang sudah dikembalikan lewat penyesuaian manual ditandai agar tidak dikoreksi dua kali.
    const koreksi = terlihat.length
      ? await this.db.sessionLedger.findMany({
          where: {
            referenceId: { in: terlihat.map((b) => b.id) },
            type: 'ADJUST_MANUAL',
          },
          select: { referenceId: true },
        })
      : [];
    const sudah = new Set(
      koreksi.map((k: { referenceId: string | null }) => k.referenceId).filter(Boolean),
    );

    const rows: NoShowRow[] = terlihat.map((b) => ({
      bookingId: b.id,
      userId: b.userId,
      nama: b.user?.displayName ?? '',
      phone: b.user?.phone ?? null,
      classSlotId: b.classSlot.id,
      namaKelas: b.classSlot.classType?.name ?? null,
      branchId: b.classSlot.branchId,
      mulai: b.classSlot.startAt.toISOString(),
      sisaSesi: b.customerPackage?.remainingSessions ?? null,
      sudahDikoreksi: sudah.has(b.id),
    }));

    return {
      range: { from: range.from, until: range.until, label: range.label },
      branchId: input.branchId ?? 'ALL',
      total: rows.length,
      totalMember: new Set(rows.map((r) => r.userId)).size,
      sudahDikoreksi: rows.filter((r) => r.sudahDikoreksi).length,
      rows,
    };
  }
}
