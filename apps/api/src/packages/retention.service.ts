import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { financeRange } from './finance-range';

/**
 * Jendela renewal: pembelian berbayar dalam 60 hari setelah paket habis dihitung sebagai renewal,
 * di cabang mana pun. Member yang pindah cabang tidak dihitung sebagai hilang.
 */
export const RENEWAL_WINDOW_DAYS = 60;

const DAY_MS = 86_400_000;

export interface RetentionQuery {
  branchId?: string;
  from?: string;
  until?: string;
  /** `YYYY-MM`, singkatan satu bulan penuh. */
  period?: string;
}

/**
 * Alasan paket berhenti terpakai. Keduanya peluang renewal, tetapi percakapannya berbeda:
 * `EXPIRED` sudah lewat tanggal, `HOT` justru memakai habis sesinya lebih cepat dari masa berlaku.
 */
export type EndReason = 'EXPIRED' | 'HOT';

export interface RetentionRow {
  customerPackageId: string;
  userId: string;
  customerName: string | null;
  phone: string | null;
  packageName: string | null;
  branchId: string | null;
  endReason: EndReason;
  validUntil: string;
  remainingSessions: number;
  /** Nilai yang benar-benar dibayar untuk paket ini; `null` bila tidak ada pembelian tercatat. */
  paidRp: number | null;
  renewed: boolean;
  renewedAt: string | null;
}

/** Bentuk baris yang dibaca dari `paketPelanggan.findMany` di bawah, dengan relasi yang dipilih. */
interface CohortPackage {
  id: string;
  userId: string;
  status: string;
  validUntil: Date;
  remainingSessions: number;
  user: {
    id: string;
    displayName: string | null;
    phone: string | null;
    stoppedAt: Date | null;
  } | null;
  package: { name: string | null } | null;
  purchase: { totalAmountRp: number; branchId: string | null; status: string } | null;
}

export interface SegmentSummary {
  customers: number;
  packages: number;
  paidRp: number;
  /**
   * Nilai rata-rata satu member dalam kelompok ini. Total rupiah terasa besar tetapi abstrak;
   * angka per orang langsung menjawab apakah menelepon sepuluh member sepadan dengan waktu staf.
   * `null` bila tidak ada member, supaya tidak tampil sebagai Rp 0.
   */
  paidPerCustomerRp: number | null;
  /** Paket tanpa pembelian tercatat (mis. penjualan asistensi lama), jadi nilainya tidak masuk `paidRp`. */
  packagesWithoutValue: number;
}

@Injectable()
export class RetentionService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  private ensureBranchAccess(principal: SessionPrincipal, targetBranchId?: string) {
    const isGlobal =
      principal.capabilities.includes('branch:all') ||
      principal.roles.some((r) => ['SUPER_OWNER', 'FINANCE'].includes(r.role as string));
    if (isGlobal) return;

    if (!targetBranchId || !principal.branchIds.includes(targetBranchId)) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Kohort paket yang habis dalam satu rentang tanggal, berapa yang sudah renew, dan berapa nilai
   * yang belum kembali. Paket `FROZEN` tidak dihitung karena masa berlakunya masih ditambah saat dibuka.
   */
  async expiryCohort(principal: SessionPrincipal, input: RetentionQuery = {}, now = new Date()) {
    this.policy.requireCapability(principal.capabilities, 'package:read');
    this.ensureBranchAccess(principal, input.branchId);

    const range = financeRange(input, now);

    const packages = await this.db.paketPelanggan.findMany({
      where: {
        status: { in: ['EXPIRED', 'DEPLETED'] },
        validUntil: { gte: range.fromDate, lt: range.untilExclusive },
      },
      include: {
        user: { select: { id: true, displayName: true, phone: true, stoppedAt: true } },
        package: { select: { name: true } },
        purchase: { select: { totalAmountRp: true, branchId: true, status: true } },
      },
      orderBy: { validUntil: 'asc' },
    });

    const scoped: CohortPackage[] = packages.filter((cp: CohortPackage) => {
      const branchId = cp.purchase?.branchId ?? null;
      if (input.branchId) return branchId === input.branchId;
      if (principal.capabilities.includes('branch:all')) return true;
      // Tanpa akses global, paket tanpa cabang tercatat tidak ditampilkan agar tidak bocor lintas cabang.
      return branchId !== null && principal.branchIds.includes(branchId);
    });

    const userIds = [...new Set(scoped.map((cp: CohortPackage) => cp.userId))];
    // Renewal hanya mungkin setelah paket paling awal habis, sampai jendela paket paling akhir tutup.
    // Tanpa batas ini query menarik seluruh riwayat pembelian setiap member.
    const renewalWindowCloses = new Date(
      range.untilExclusive.getTime() + RENEWAL_WINDOW_DAYS * DAY_MS,
    );
    const renewals = userIds.length
      ? await this.db.pembelian.findMany({
          where: {
            userId: { in: userIds },
            status: 'PAID',
            paidAt: { gt: range.fromDate, lte: renewalWindowCloses },
          },
          select: { userId: true, paidAt: true, totalAmountRp: true },
          orderBy: { paidAt: 'asc' },
        })
      : [];

    const paidByUser = new Map<string, Date[]>();
    for (const purchase of renewals) {
      if (!purchase.paidAt) continue;
      const list = paidByUser.get(purchase.userId) ?? [];
      list.push(purchase.paidAt);
      paidByUser.set(purchase.userId, list);
    }

    const rows: RetentionRow[] = scoped.map((cp: CohortPackage) => {
      const windowEnd = new Date(cp.validUntil.getTime() + RENEWAL_WINDOW_DAYS * DAY_MS);
      const renewedAt =
        paidByUser
          .get(cp.userId)
          ?.find((paidAt) => paidAt > cp.validUntil && paidAt <= windowEnd) ?? null;

      return {
        customerPackageId: cp.id,
        userId: cp.userId,
        customerName: cp.user?.displayName ?? null,
        phone: cp.user?.phone ?? null,
        packageName: cp.package?.name ?? null,
        branchId: cp.purchase?.branchId ?? null,
        endReason: cp.status === 'DEPLETED' ? 'HOT' : 'EXPIRED',
        validUntil: cp.validUntil.toISOString(),
        remainingSessions: cp.remainingSessions,
        paidRp: cp.purchase?.totalAmountRp ?? null,
        renewed: renewedAt !== null,
        renewedAt: renewedAt ? renewedAt.toISOString() : null,
      };
    });

    const expired = summarize(rows.filter((r) => r.endReason === 'EXPIRED'));
    const hot = summarize(rows.filter((r) => r.endReason === 'HOT'));
    const renewedRows = rows.filter((r) => r.renewed);
    const openRows = rows.filter((r) => !r.renewed);

    const totalCustomers = countCustomers(rows);
    const renewedCustomers = countCustomers(renewedRows);

    return {
      range: { from: range.from, until: range.until, label: range.label },
      branchId: input.branchId ?? 'ALL',
      renewalWindowDays: RENEWAL_WINDOW_DAYS,
      segments: { expired, hot },
      total: summarize(rows),
      renewed: summarize(renewedRows),
      /** Nilai yang belum kembali: jumlah yang dulu dibayar oleh member yang belum renew. */
      potentialLoss: summarize(openRows),
      renewalRatePct:
        totalCustomers === 0 ? null : round1((renewedCustomers / totalCustomers) * 100),
      rows,
    };
  }

  /**
   * Tiga bulan terakhir (termasuk bulan berjalan) supaya tren renewal terlihat, bukan satu angka lepas.
   */
  async retentionTrend(
    principal: SessionPrincipal,
    input: { branchId?: string; months?: number } = {},
    now = new Date(),
  ) {
    const months = clampMonths(input.months);
    const periods: string[] = [];
    for (let back = months - 1; back >= 0; back -= 1) {
      const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
      periods.push(cursor.toISOString().slice(0, 7));
    }

    const cohorts = [];
    for (const period of periods) {
      const cohort = await this.expiryCohort(principal, { branchId: input.branchId, period }, now);
      cohorts.push({
        period,
        label: cohort.range.label,
        total: cohort.total,
        segments: cohort.segments,
        renewed: cohort.renewed,
        potentialLoss: cohort.potentialLoss,
        renewalRatePct: cohort.renewalRatePct,
      });
    }

    return { branchId: input.branchId ?? 'ALL', months, cohorts };
  }
}

function summarize(rows: RetentionRow[]): SegmentSummary {
  const customers = countCustomers(rows);
  const paidRp = rows.reduce((sum, row) => sum + (row.paidRp ?? 0), 0);
  return {
    customers,
    packages: rows.length,
    paidRp,
    paidPerCustomerRp: customers === 0 ? null : Math.round(paidRp / customers),
    packagesWithoutValue: rows.filter((row) => row.paidRp === null).length,
  };
}

/** Satu member bisa memegang beberapa paket; angka utama selalu jumlah orang, bukan jumlah paket. */
function countCustomers(rows: RetentionRow[]): number {
  return new Set(rows.map((row) => row.userId)).size;
}

function clampMonths(months?: number): number {
  if (!months || !Number.isFinite(months)) return 3;
  return Math.min(12, Math.max(1, Math.trunc(months)));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}
