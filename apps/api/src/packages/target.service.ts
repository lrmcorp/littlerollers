import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { hitungPace, kalimatPace, type Pace } from './target-pace';

const PERIODE = /^\d{4}-(0[1-9]|1[0-2])$/;

export interface PaceQuery {
  /** Null atau tidak diisi berarti gabungan semua cabang yang boleh dilihat pemanggil. */
  branchId?: string | null;
  /** `YYYY-MM`. Tanpa isi memakai bulan berjalan. */
  period?: string;
  /** Target yang dipasang Super Owner, dikirim oleh pemanggil. */
  targetRp: number;
}

export interface PaceResult {
  branchId: string | null;
  period: string;
  pace: Pace;
  /** Satu kalimat siap tempel yang menyebut angka harian, bukan hanya persentase. */
  ringkasan: string;
}

/**
 * Laju pencapaian target omzet.
 *
 * Layanan ini sengaja TIDAK menyimpan apa pun. Nilai targetnya dikirim pemanggil, dan satu-satunya
 * yang dibaca dari basis data adalah tabel `pembelian` yang sudah ada. Tidak ada tabel baru, tidak
 * ada kolom baru, tidak ada tulisan ke basis data.
 *
 * Omzet dihitung dari pembelian berstatus PAID dengan `paidAt` di dalam periode, sumber yang sama
 * dengan laporan omzet keuangan, supaya dasbor target dan laporan keuangan tidak pernah
 * menampilkan dua angka berbeda untuk hal yang sama.
 */
@Injectable()
export class TargetService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  private wajibAksesCabang(principal: SessionPrincipal, branchId: string | null) {
    if (principal.capabilities.includes('branch:all')) return;
    if (!branchId || !principal.branchIds.includes(branchId)) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
  }

  private wajibPeriode(period: string) {
    if (!PERIODE.test(period)) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
        { field: 'period', issue: 'INVALID_PERIOD' },
      ]);
    }
  }

  private wajibTarget(targetRp: number) {
    if (!Number.isInteger(targetRp) || targetRp < 0) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
        { field: 'targetRp', issue: 'MUST_BE_NON_NEGATIVE_INTEGER' },
      ]);
    }
  }

  /** Laju satu cabang, atau gabungan cabang yang boleh dilihat pemanggil. */
  async pace(principal: SessionPrincipal, input: PaceQuery, now = new Date()): Promise<PaceResult> {
    this.policy.requireCapability(principal.capabilities, 'finance:read');

    const period = input.period ?? now.toISOString().slice(0, 7);
    this.wajibPeriode(period);
    this.wajibTarget(input.targetRp);

    const branchId = input.branchId ?? null;
    this.wajibAksesCabang(principal, branchId);

    const tercapaiRp = await this.omzetPeriode(principal, branchId, period);
    const pace = hitungPace({ period, targetRp: input.targetRp, tercapaiRp, now });

    return { branchId, period, pace, ringkasan: kalimatPace(pace, rupiah) };
  }

  /**
   * Omzet satu periode. Memakai `paidAt`, bukan `createdAt`, agar pesanan yang dibuat akhir bulan
   * lalu tetapi dibayar bulan ini dihitung pada bulan uangnya benar-benar masuk.
   *
   * Tanpa `branch:all`, penjumlahan dibatasi pada cabang milik pemanggil, sehingga target gabungan
   * pun tidak pernah membocorkan omzet cabang lain.
   */
  private async omzetPeriode(
    principal: SessionPrincipal,
    branchId: string | null,
    period: string,
  ): Promise<number> {
    const awal = new Date(`${period}-01T00:00:00.000Z`);
    const akhir = new Date(awal);
    akhir.setUTCMonth(akhir.getUTCMonth() + 1);

    const cabang = branchId
      ? { branchId }
      : principal.capabilities.includes('branch:all')
        ? {}
        : { branchId: { in: principal.branchIds } };

    const hasil = await this.db.pembelian.aggregate({
      _sum: { totalAmountRp: true },
      where: { status: 'PAID', paidAt: { gte: awal, lt: akhir }, ...cabang },
    });
    return hasil._sum.totalAmountRp ?? 0;
  }
}

function rupiah(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`;
}
