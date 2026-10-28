import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { hitungPace, type Pace } from './target-pace';

const PERIODE = /^\d{4}-(0[1-9]|1[0-2])$/;

export interface SetTargetInput {
  /** Null berarti target gabungan semua cabang. */
  branchId?: string | null;
  period: string;
  targetRp: number;
  note?: string;
}

export interface TargetDenganPace {
  branchId: string | null;
  branchName: string | null;
  period: string;
  targetRp: number;
  note: string | null;
  pace: Pace;
}

/**
 * Target omzet dipasang Super Owner, dibaca oleh cabang yang bersangkutan.
 *
 * Omzet yang dibandingkan adalah pembelian berstatus PAID dengan `paidAt` di dalam periode,
 * sumber yang sama dengan laporan omzet keuangan, supaya dasbor target dan laporan keuangan
 * tidak pernah menampilkan dua angka berbeda untuk hal yang sama.
 */
@Injectable()
export class TargetService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  /** Hanya Super Owner yang boleh memasang target; cabang tidak menetapkan targetnya sendiri. */
  private wajibSuperOwner(principal: SessionPrincipal) {
    const boleh = principal.roles.some((r) => (r.role as string) === 'SUPER_OWNER');
    if (!boleh) throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

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

  async setTarget(principal: SessionPrincipal, input: SetTargetInput) {
    this.policy.requireCapability(principal.capabilities, 'finance:manage');
    this.wajibSuperOwner(principal);
    this.wajibPeriode(input.period);

    if (!Number.isInteger(input.targetRp) || input.targetRp < 0) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
        { field: 'targetRp', issue: 'MUST_BE_NON_NEGATIVE_INTEGER' },
      ]);
    }

    const branchId = input.branchId ?? null;
    const data = {
      branchId,
      period: input.period,
      targetRp: input.targetRp,
      note: input.note?.trim() || null,
      setById: principal.userId,
    };

    // Keunikan per (cabang, periode) ditegakkan di sini, bukan di basis data: MySQL menganggap
    // tiap NULL berbeda, sehingga batasan unik tidak akan menjaga baris target gabungan.
    const ada = await this.db.targetOmzet.findFirst({
      where: { branchId, period: input.period },
      select: { id: true },
    });

    if (ada) {
      return this.db.targetOmzet.update({
        where: { id: ada.id },
        data: { targetRp: data.targetRp, note: data.note, setById: data.setById },
      });
    }
    return this.db.targetOmzet.create({ data });
  }

  /** Target satu cabang pada satu periode, lengkap dengan lajunya. */
  async paceUntuk(
    principal: SessionPrincipal,
    params: { branchId?: string | null; period: string },
    now = new Date(),
  ): Promise<TargetDenganPace | null> {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    this.wajibPeriode(params.period);
    const branchId = params.branchId ?? null;
    this.wajibAksesCabang(principal, branchId);

    const target = await this.db.targetOmzet.findFirst({
      where: { branchId, period: params.period },
      include: { branch: { select: { name: true } } },
    });
    if (!target) return null;

    const tercapaiRp = await this.omzetPeriode(branchId, params.period);

    return {
      branchId: target.branchId,
      branchName: target.branch?.name ?? null,
      period: target.period,
      targetRp: target.targetRp,
      note: target.note,
      pace: hitungPace({
        period: params.period,
        targetRp: target.targetRp,
        tercapaiRp,
        now,
      }),
    };
  }

  /** Semua target satu periode; dipakai Super Owner untuk membandingkan cabang. */
  async semuaPace(
    principal: SessionPrincipal,
    period: string,
    now = new Date(),
  ): Promise<TargetDenganPace[]> {
    this.wajibPeriode(period);
    this.policy.requireCapability(principal.capabilities, 'finance:read');

    const semua = await this.db.targetOmzet.findMany({
      where: { period },
      include: { branch: { select: { name: true } } },
      orderBy: { branchId: 'asc' },
    });

    const terlihat = principal.capabilities.includes('branch:all')
      ? semua
      : semua.filter(
          (t: { branchId: string | null }) =>
            t.branchId !== null && principal.branchIds.includes(t.branchId),
        );

    const hasil: TargetDenganPace[] = [];
    for (const t of terlihat) {
      const tercapaiRp = await this.omzetPeriode(t.branchId, period);
      hasil.push({
        branchId: t.branchId,
        branchName: t.branch?.name ?? null,
        period: t.period,
        targetRp: t.targetRp,
        note: t.note,
        pace: hitungPace({ period, targetRp: t.targetRp, tercapaiRp, now }),
      });
    }
    return hasil;
  }

  /**
   * Omzet satu periode: pembelian PAID dengan `paidAt` di dalam bulan itu. Sengaja memakai
   * `paidAt`, bukan `createdAt`, supaya pesanan yang dibuat akhir bulan lalu tetapi dibayar
   * bulan ini dihitung pada bulan uangnya benar-benar masuk.
   */
  private async omzetPeriode(branchId: string | null, period: string): Promise<number> {
    const awal = new Date(`${period}-01T00:00:00.000Z`);
    const akhir = new Date(awal);
    akhir.setUTCMonth(akhir.getUTCMonth() + 1);

    const hasil = await this.db.pembelian.aggregate({
      _sum: { totalAmountRp: true },
      where: {
        status: 'PAID',
        paidAt: { gte: awal, lt: akhir },
        ...(branchId ? { branchId } : {}),
      },
    });
    return hasil._sum.totalAmountRp ?? 0;
  }
}
