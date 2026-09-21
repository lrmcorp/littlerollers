import { Injectable } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';
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
          effectiveDate: r.effectiveDate.toISOString().slice(0, 10),
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
          effectiveDate: r.effectiveDate.toISOString().slice(0, 10),
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
      const feePerJamRp = input.feeRp ?? 150_000;
      const effectiveDate = new Date(input.effectiveFrom || Date.now());
      const instructorId = input.instructorUserId ?? principal.userId;
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
      const ratePerSesiRp = input.rateRp ?? 125_000;
      const effectiveDate = new Date(input.effectiveFrom || Date.now());
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
