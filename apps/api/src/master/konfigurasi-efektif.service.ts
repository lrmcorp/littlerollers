import { HttpStatus, Injectable } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, ENTITY_ID_REGEX } from '../identity/security';
import { MasterAccessService } from './master-access.service';
import { PrismaService } from '../database/prisma.service';

export type SettingKind = 'INSTRUCTOR_FEE' | 'PROJECTION_RATE' | 'QUOTA_CAPACITY';
export type SettingInput = {
  kind: SettingKind;
  branchId: string;
  classTypeId: string;
  instructorUserId?: string;
  feeRp?: number;
  rateRp?: number;
  minimumQuota?: number;
  cutoffHours?: number;
  defaultCapacity?: number;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  reason: string;
};

const MAX_RATE_RP = 10_000_000;

/** Tanggal hari ini (YYYY-MM-DD) menurut waktu bisnis; tarif efektif dicatat per tanggal. */
const todayKey = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
const dateKey = (value: Date) => value.toISOString().slice(0, 10);

function requireAmount(value: unknown, field: string) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > MAX_RATE_RP)
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
      { field, issue: 'REQUIRED_POSITIVE_INTEGER' },
    ]);
  return value;
}

function requireEffectiveDate(value: unknown) {
  const date = typeof value === 'string' && value.trim() ? new Date(value) : null;
  if (!date || !Number.isFinite(date.getTime()))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
      { field: 'effectiveFrom', issue: 'INVALID_DATE' },
    ]);
  return date;
}

@Injectable()
export class EffectiveSettingsService {
  constructor(
    private readonly access: MasterAccessService,
    private readonly db: PrismaService,
  ) {}

  async list(principal: SessionPrincipal, _kind: SettingKind, branchId?: string) {
    this.access.authorize(principal);
    if (branchId) this.access.ensureBranchScope(principal, branchId);

    if (_kind === 'QUOTA_CAPACITY') {
      const scopeWhere: any = {};
      if (branchId) {
        scopeWhere.branchId = branchId;
      } else if (!principal.capabilities.includes('branch:all')) {
        scopeWhere.branchId = { in: principal.branchIds };
      }
      const rows = await this.db.minQuotaSetting.findMany({
        where: scopeWhere,
        include: {
          branch: { select: { id: true, code: true, name: true } },
          classType: { select: { id: true, name: true } },
        },
      });
      return {
        items: rows.map((r) => ({
          id: r.id,
          branchId: r.branchId,
          classTypeId: r.classTypeId,
          minimumQuota: r.minQuota,
          cutoffHours: r.cutoffHours,
          branch: r.branch,
          classType: r.classType,
          createdAt: r.createdAt.toISOString(),
        })),
        page: { nextCursor: null, hasMore: false },
      };
    }

    if (_kind === 'INSTRUCTOR_FEE') {
      const scopeWhere: any = {};
      if (branchId) {
        scopeWhere.branchId = branchId;
      } else if (!principal.capabilities.includes('branch:all')) {
        scopeWhere.branchId = { in: principal.branchIds };
      }
      const rows = await this.db.instructorFee.findMany({
        where: scopeWhere,
        include: {
          instructor: { select: { id: true, displayName: true, email: true } },
          branch: { select: { id: true, code: true, name: true } },
          classType: { select: { id: true, name: true } },
        },
        orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
      });
      return {
        items: rows.map((r) => ({
          id: r.id,
          instructorId: r.instructorId,
          instructorName: r.instructor?.displayName ?? '-',
          branchId: r.branchId,
          branch: r.branch,
          classTypeId: r.classTypeId,
          classType: r.classType,
          feePerJamRp: r.feePerJamRp,
          effectiveDate: dateKey(r.effectiveDate),
          deletable: dateKey(r.effectiveDate) > todayKey(),
          createdAt: r.createdAt.toISOString(),
        })),
        page: { nextCursor: null, hasMore: false },
      };
    }

    if (_kind === 'PROJECTION_RATE') {
      const scopeWhere: any = {};
      if (branchId) {
        scopeWhere.branchId = branchId;
      } else if (!principal.capabilities.includes('branch:all')) {
        scopeWhere.branchId = { in: principal.branchIds };
      }
      const rows = await this.db.projectionRate.findMany({
        where: scopeWhere,
        include: {
          branch: { select: { id: true, code: true, name: true } },
          classType: { select: { id: true, name: true } },
        },
        orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
      });
      return {
        items: rows.map((r) => ({
          id: r.id,
          branchId: r.branchId,
          branch: r.branch,
          classTypeId: r.classTypeId,
          classType: r.classType,
          ratePerSesiRp: r.ratePerSesiRp,
          effectiveDate: dateKey(r.effectiveDate),
          deletable: dateKey(r.effectiveDate) > todayKey(),
          createdAt: r.createdAt.toISOString(),
        })),
        page: { nextCursor: null, hasMore: false },
      };
    }

    return { items: [], page: { nextCursor: null, hasMore: false } };
  }

  async create(principal: SessionPrincipal, input: SettingInput, _correlationId: string) {
    this.access.authorize(principal, true);

    if (input.kind === 'QUOTA_CAPACITY') {
      const minQuota = input.minimumQuota ?? 3;
      const cutoffHours = input.cutoffHours ?? 24;
      const row = await this.db.minQuotaSetting.upsert({
        where: {
          branchId_classTypeId: {
            branchId: input.branchId,
            classTypeId: input.classTypeId,
          },
        },
        create: {
          branchId: input.branchId,
          classTypeId: input.classTypeId,
          minQuota,
          cutoffHours,
        },
        update: {
          minQuota,
          cutoffHours,
        },
        include: {
          branch: { select: { id: true, code: true, name: true } },
          classType: { select: { id: true, name: true } },
        },
      });
      return {
        id: row.id,
        branchId: row.branchId,
        classTypeId: row.classTypeId,
        minimumQuota: row.minQuota,
        cutoffHours: row.cutoffHours,
        branch: row.branch,
        classType: row.classType,
        createdAt: row.createdAt.toISOString(),
      };
    }

    if (input.kind === 'INSTRUCTOR_FEE') {
      const feePerJamRp = requireAmount(input.feeRp, 'feeRp');
      const effectiveDate = requireEffectiveDate(input.effectiveFrom);
      if (!input.instructorUserId || !ENTITY_ID_REGEX.test(input.instructorUserId))
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
          { field: 'instructorUserId', issue: 'REQUIRED' },
        ]);
      const instructorId = input.instructorUserId;
      const row = await this.db.instructorFee.create({
        data: {
          instructorId,
          branchId: input.branchId,
          classTypeId: input.classTypeId,
          feePerJamRp,
          effectiveDate,
        },
        include: {
          instructor: { select: { id: true, displayName: true } },
          branch: { select: { id: true, code: true, name: true } },
          classType: { select: { id: true, name: true } },
        },
      });
      return {
        id: row.id,
        instructorId: row.instructorId,
        instructorName: row.instructor?.displayName ?? '-',
        branchId: row.branchId,
        branch: row.branch,
        classTypeId: row.classTypeId,
        classType: row.classType,
        feePerJamRp: row.feePerJamRp,
        effectiveDate: row.effectiveDate.toISOString().slice(0, 10),
        createdAt: row.createdAt.toISOString(),
      };
    }

    if (input.kind === 'PROJECTION_RATE') {
      const ratePerSesiRp = requireAmount(input.rateRp, 'rateRp');
      const effectiveDate = requireEffectiveDate(input.effectiveFrom);
      const row = await this.db.projectionRate.create({
        data: {
          branchId: input.branchId,
          classTypeId: input.classTypeId,
          ratePerSesiRp,
          effectiveDate,
        },
        include: {
          branch: { select: { id: true, code: true, name: true } },
          classType: { select: { id: true, name: true } },
        },
      });
      return {
        id: row.id,
        branchId: row.branchId,
        classTypeId: row.classTypeId,
        branch: row.branch,
        classType: row.classType,
        ratePerSesiRp: row.ratePerSesiRp,
        effectiveDate: row.effectiveDate.toISOString().slice(0, 10),
        createdAt: row.createdAt.toISOString(),
      };
    }

    return {
      id: `setting-${Date.now()}`,
      ...input,
      effectiveUntil: input.effectiveUntil ?? null,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Hapus tarif yang BELUM berlaku (tanggal efektif di masa depan). Tarif yang sudah berlaku tidak
   * boleh hilang karena dipakai perhitungan honor/proyeksi; koreksinya dengan menambah tarif baru.
   */
  async remove(
    principal: SessionPrincipal,
    kind: 'INSTRUCTOR_FEE' | 'PROJECTION_RATE',
    id: string,
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    if (!principal.capabilities.includes('finance:manage'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    if (!ENTITY_ID_REGEX.test(id)) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    return this.db.$transaction(async (tx) => {
      const row =
        kind === 'INSTRUCTOR_FEE'
          ? await tx.instructorFee.findUnique({ where: { id } })
          : await tx.projectionRate.findUnique({ where: { id } });
      if (!row) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      this.access.ensureBranchScope(principal, row.branchId, true);
      if (dateKey(row.effectiveDate) <= todayKey())
        throw new ApiProblem('RATE_IN_EFFECT', HttpStatus.CONFLICT);

      if (kind === 'INSTRUCTOR_FEE') await tx.instructorFee.delete({ where: { id } });
      else await tx.projectionRate.delete({ where: { id } });

      await this.access.audit(
        tx,
        principal,
        correlationId,
        kind === 'INSTRUCTOR_FEE' ? 'master.instructor_fee_deleted' : 'master.projection_rate_deleted',
        kind === 'INSTRUCTOR_FEE' ? 'InstructorFee' : 'ProjectionRate',
        id,
        row.branchId,
      );
      return { id, deleted: true };
    });
  }

  async getEffectiveInstructorFee(
    instructorId: string,
    branchId: string,
    classTypeId: string,
    targetDate: Date,
  ): Promise<number> {
    const fee = await this.db.instructorFee.findFirst({
      where: {
        instructorId,
        branchId,
        classTypeId,
        effectiveDate: { lte: targetDate },
      },
      orderBy: { effectiveDate: 'desc' },
    });
    return fee?.feePerJamRp ?? 150_000;
  }

  async getEffectiveProjectionRate(
    branchId: string,
    classTypeId: string,
    targetDate: Date,
  ): Promise<number> {
    const rate = await this.db.projectionRate.findFirst({
      where: {
        branchId,
        classTypeId,
        effectiveDate: { lte: targetDate },
      },
      orderBy: { effectiveDate: 'desc' },
    });
    return rate?.ratePerSesiRp ?? 125_000;
  }

  async deactivate(principal: SessionPrincipal, id: string, _correlationId: string) {
    this.access.authorize(principal, true);
    return { id, deactivated: true };
  }

  // --- Indonesian Domain Aliases ---
  async ambilPengaturanEfektif(
    principal: SessionPrincipal,
    kind: Parameters<EffectiveSettingsService['list']>[1],
    branchId?: string,
  ) {
    return this.list(principal, kind, branchId);
  }

  async buatPengaturanEfektif(
    principal: SessionPrincipal,
    input: Parameters<EffectiveSettingsService['create']>[1],
    correlationId: string,
  ) {
    return this.create(principal, input, correlationId);
  }

  async nonaktifkanPengaturanEfektif(
    principal: SessionPrincipal,
    id: string,
    correlationId: string,
  ) {
    return this.deactivate(principal, id, correlationId);
  }
}
