import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { financeRange } from '../packages/finance-range';
import { AKSI_TETAP_JALAN } from './check-in-desk.service';

/**
 * Laporan pengecualian untuk Owner: kelas yang tetap berjalan di bawah kuota minimum, dan pindaian
 * di studio yang ditolak karena tidak cocok dengan jadwal.
 *
 * Keduanya sudah tercatat di `audit_log` saat terjadi (keputusan meja check-in dan layar studio),
 * jadi laporan ini hanya membaca ulang catatan tersebut. Tidak ada tabel atau kolom baru.
 */

export const AKSI_PINDAI_DITOLAK = 'attendance.studio_scan_rejected';
const MAKS_BARIS = 200;

export interface KelasDiBawahKuota {
  classSlotId: string;
  branchId: string | null;
  namaKelas: string | null;
  mulai: string | null;
  namaInstruktur: string | null;
  hadir: number | null;
  minimum: number | null;
  /** Honor instruktur yang tetap dibayar walau peserta kurang dari minimum. */
  selisihBebanRp: number | null;
  alasan: string | null;
  diputuskanOleh: string | null;
  diputuskanPada: string;
}

export interface PindaiDitolak {
  alasan: string;
  jumlah: number;
}

export interface LaporanOwner {
  range: { from: string; until: string; label: string };
  dibawahKuota: { total: number; totalBebanRp: number; rows: KelasDiBawahKuota[] };
  pindaiDitolak: { total: number; perAlasan: PindaiDitolak[] };
}

interface BarisAudit {
  objectId: string | null;
  branchId: string | null;
  actorId: string | null;
  reason: string | null;
  detail: unknown;
  createdAt: Date;
}

const angka = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

function sesudah(detail: unknown): Record<string, unknown> {
  if (!detail || typeof detail !== 'object') return {};
  const after = (detail as { after?: unknown }).after;
  return after && typeof after === 'object' ? (after as Record<string, unknown>) : {};
}

@Injectable()
export class LaporanOwnerService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  async laporan(
    principal: SessionPrincipal,
    input: { branchId?: string; from?: string; until?: string; period?: string } = {},
    now = new Date(),
  ): Promise<LaporanOwner> {
    this.policy.requireCapability(principal.capabilities, 'dashboard:read');
    const global = principal.capabilities.includes('branch:all');
    if (input.branchId && !global && !principal.branchIds.includes(input.branchId)) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const range = financeRange(input, now);
    // Tanpa pilihan cabang, owner cabang hanya melihat cabangnya sendiri.
    const cabang = input.branchId
      ? { branchId: input.branchId }
      : global
        ? {}
        : { branchId: { in: principal.branchIds } };
    const waktu = { createdAt: { gte: range.fromDate, lt: range.untilExclusive } };

    const [keputusan, ditolak]: [
      BarisAudit[],
      { reason: string | null; _count: { _all: number } }[],
    ] = await Promise.all([
      this.db.auditLog.findMany({
        where: { action: AKSI_TETAP_JALAN, ...cabang, ...waktu },
        select: {
          objectId: true,
          branchId: true,
          actorId: true,
          reason: true,
          detail: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: MAKS_BARIS,
      }),
      this.db.auditLog.groupBy({
        by: ['reason'],
        where: { action: AKSI_PINDAI_DITOLAK, ...cabang, ...waktu },
        _count: { _all: true },
      }),
    ]);

    const slotIds = [...new Set(keputusan.map((k) => k.objectId).filter(Boolean))] as string[];
    const actorIds = [...new Set(keputusan.map((k) => k.actorId).filter(Boolean))] as string[];
    const [slots, actors] = await Promise.all([
      slotIds.length
        ? this.db.slotKelas.findMany({
            where: { id: { in: slotIds } },
            select: {
              id: true,
              startAt: true,
              classType: { select: { name: true } },
              instructor: { select: { displayName: true } },
            },
          })
        : [],
      actorIds.length
        ? this.db.user.findMany({
            where: { id: { in: actorIds } },
            select: { id: true, displayName: true },
          })
        : [],
    ]);
    const slotById = new Map(
      (
        slots as {
          id: string;
          startAt: Date;
          classType: { name: string } | null;
          instructor: { displayName: string } | null;
        }[]
      ).map((s) => [s.id, s]),
    );
    const namaAktor = new Map(
      (actors as { id: string; displayName: string }[]).map((a) => [a.id, a.displayName]),
    );

    const rows: KelasDiBawahKuota[] = keputusan.map((k) => {
      const after = sesudah(k.detail);
      const slot = k.objectId ? slotById.get(k.objectId) : undefined;
      return {
        classSlotId: k.objectId ?? '',
        branchId: k.branchId,
        namaKelas: slot?.classType?.name ?? null,
        mulai: slot ? slot.startAt.toISOString() : null,
        namaInstruktur: slot?.instructor?.displayName ?? null,
        hadir: angka(after.hadir),
        minimum: angka(after.minimum),
        selisihBebanRp: angka(after.selisihBebanRp),
        alasan: k.reason,
        diputuskanOleh: k.actorId ? (namaAktor.get(k.actorId) ?? null) : null,
        diputuskanPada: k.createdAt.toISOString(),
      };
    });

    const perAlasan = ditolak
      .map((d) => ({ alasan: d.reason ?? 'LAINNYA', jumlah: d._count._all }))
      .sort((a, b) => b.jumlah - a.jumlah);

    return {
      range: { from: range.from, until: range.until, label: range.label },
      dibawahKuota: {
        total: rows.length,
        totalBebanRp: rows.reduce((sum, r) => sum + (r.selisihBebanRp ?? 0), 0),
        rows,
      },
      pindaiDitolak: { total: perAlasan.reduce((s, p) => s + p.jumlah, 0), perAlasan },
    };
  }
}
