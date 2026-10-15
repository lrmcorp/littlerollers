import { HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../foundation/audit.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { periodRange, summarizeInstructorFees } from './instructor-fee-calculator';
import { projectionCostFor } from './projection-cost';

const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/;
const EXPORT_MAX_DAYS = 366;
const EXPORT_MAX_ROWS = 50_000;

/** Uang pada kontrak API memakai satuan minor (sen). */
const toMoney = (rupiah: number) => ({ amountMinor: rupiah * 100, currency: 'IDR' });

const problem = (code: string, status: HttpStatus, field?: string) =>
  new ApiProblem(code, status, false, field ? [{ field, issue: code }] : []);

/** Sel teks CSV: dikutip bila perlu dan dinetralkan dari injeksi rumus spreadsheet. */
function csvText(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

@Injectable()
export class FinanceService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly audit: AuditService,
  ) {}

  private ensureBranchAccess(principal: SessionPrincipal, targetBranchId?: string) {
    const isGlobal =
      principal.capabilities.includes('branch:all') ||
      principal.roles.some((r) =>
        ['SUPER_OWNER', 'SUPERADMIN', 'FINANCE'].includes(r.role as string),
      );
    if (isGlobal) return;

    if (!targetBranchId || !principal.branchIds.includes(targetBranchId)) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
  }

  private parsePeriod(periodStr?: string) {
    return periodRange(periodStr);
  }

  // ============================================================================
  // 5 LAPORAN INTI KEUANGAN
  // ============================================================================

  /**
   * 1. Laporan Omset Penjualan Paket
   */
  async omsetReport(
    principal: SessionPrincipal,
    input: { branchId?: string; period?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    this.ensureBranchAccess(principal, input.branchId);
    const { period, fromDate, nextMonth } = this.parsePeriod(input.period);

    const isGlobal =
      principal.capabilities.includes('branch:all') ||
      principal.roles.some((r) =>
        ['SUPER_OWNER', 'SUPERADMIN', 'FINANCE'].includes(r.role as string),
      );

    const branchFilter = input.branchId
      ? { branchId: input.branchId }
      : isGlobal
      ? {}
      : { branchId: { in: principal.branchIds } };

    const purchases = await this.db.pembelian.findMany({
      where: {
        ...branchFilter,
        status: 'PAID',
        paidAt: { gte: fromDate, lt: nextMonth },
      },
      include: {
        branch: { select: { id: true, code: true, name: true } },
        user: { select: { id: true, displayName: true, email: true } },
        package: { select: { id: true, name: true, sessionCount: true } },
      },
      orderBy: { paidAt: 'desc' },
    });

    const totalOmsetRp = purchases.reduce((sum, p) => sum + p.totalAmountRp, 0);

    const byPaymentMethod: Record<string, { count: number; amountRp: number }> = {};
    for (const p of purchases) {
      const method = p.paymentMethod || 'UNKNOWN';
      if (!byPaymentMethod[method]) {
        byPaymentMethod[method] = { count: 0, amountRp: 0 };
      }
      byPaymentMethod[method].count += 1;
      byPaymentMethod[method].amountRp += p.totalAmountRp;
    }

    return {
      period,
      branchId: input.branchId ?? 'ALL',
      totalOmsetRp,
      totalTransactionCount: purchases.length,
      byPaymentMethod,
      transactions: purchases.map((p) => ({
        id: p.id,
        orderNumber: p.invoiceNumber,
        invoiceNumber: p.invoiceNumber,
        packageName: p.package.name,
        customerName: p.user.displayName,
        totalAmountRp: p.totalAmountRp,
        paymentMethod: p.paymentMethod,
        paidAt: p.paidAt ? p.paidAt.toISOString() : p.createdAt.toISOString(),
        branchName: p.branch.name,
      })),
    };
  }

  /**
   * 2. Laporan Cost Instruktur Realtime (Jam Mengajar Aktual via QR x Fee/Jam Effective Date)
   */
  async realtimeInstructorCostReport(
    principal: SessionPrincipal,
    input: { branchId?: string; period?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    this.ensureBranchAccess(principal, input.branchId);
    const { period, fromDate, nextMonth } = this.parsePeriod(input.period);

    const isGlobal =
      principal.capabilities.includes('branch:all') ||
      principal.roles.some((r) =>
        ['SUPER_OWNER', 'SUPERADMIN', 'FINANCE'].includes(r.role as string),
      );

    const branchFilter = input.branchId
      ? { branchId: input.branchId }
      : isGlobal
      ? {}
      : { branchId: { in: principal.branchIds } };

    const slots = await this.db.slotKelas.findMany({
      where: {
        ...branchFilter,
        startAt: { gte: fromDate, lt: nextMonth },
        status: 'COMPLETED',
      },
      include: {
        instructor: true,
        classType: true,
        branch: true,
        instructorAttendance: { select: { id: true } },
      },
      orderBy: { startAt: 'asc' },
    });

    const fees = await this.db.instructorFee.findMany({
      where: input.branchId ? { branchId: input.branchId } : {},
      orderBy: { effectiveDate: 'desc' },
    });

    const instructorBreakdown = summarizeInstructorFees(slots, fees);
    const totalInstructorCostRp = instructorBreakdown.reduce(
      (sum, item) => sum + item.totalFeeRp,
      0,
    );
    const totalTeachingHours = instructorBreakdown.reduce((sum, item) => sum + item.totalHours, 0);
    const totalUnverifiedFeeRp = instructorBreakdown.reduce(
      (sum, item) => sum + item.unverifiedFeeRp,
      0,
    );
    const unverifiedClassCount = instructorBreakdown.reduce(
      (sum, item) => sum + item.unverifiedClassCount,
      0,
    );

    return {
      period,
      branchId: input.branchId ?? 'ALL',
      totalInstructorCostRp,
      totalVerifiedFeeRp: totalInstructorCostRp - totalUnverifiedFeeRp,
      totalUnverifiedFeeRp,
      unverifiedClassCount,
      totalTeachingHours,
      instructorCount: instructorBreakdown.length,
      instructors: instructorBreakdown,
    };
  }

  /**
   * 3. Laporan Cost Instruktur Projection (Sesi Terjual x Projection Rate per Sesi)
   */
  async projectionInstructorCostReport(
    principal: SessionPrincipal,
    input: { branchId?: string; period?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    this.ensureBranchAccess(principal, input.branchId);
    const { period, fromDate, nextMonth } = this.parsePeriod(input.period);

    const isGlobal =
      principal.capabilities.includes('branch:all') ||
      principal.roles.some((r) =>
        ['SUPER_OWNER', 'SUPERADMIN', 'FINANCE'].includes(r.role as string),
      );

    const branchFilter = input.branchId
      ? { branchId: input.branchId }
      : isGlobal
      ? {}
      : { branchId: { in: principal.branchIds } };

    const purchases = await this.db.pembelian.findMany({
      where: {
        ...branchFilter,
        status: 'PAID',
        paidAt: { gte: fromDate, lt: nextMonth },
      },
      include: {
        package: { select: { id: true, name: true, sessionCount: true, classTypeId: true } },
      },
    });

    const projectionRates = await this.db.projectionRate.findMany({
      where: input.branchId ? { branchId: input.branchId } : {},
      orderBy: { effectiveDate: 'desc' },
    });

    const projection = projectionCostFor(purchases, projectionRates);
    const totalSessionsSold = projection.totalSessionsSold;
    const totalProjectionCostRp = projection.totalProjectionCostRp;

    return {
      period,
      branchId: input.branchId ?? 'ALL',
      totalSessionsSold,
      totalProjectionCostRp,
      breakdown: projection.breakdown,
    };
  }

  /**
   * 4. Laporan Cost Lain-lain (OtherCost)
   */
  async otherCostReport(
    principal: SessionPrincipal,
    input: { branchId?: string; period?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    this.ensureBranchAccess(principal, input.branchId);
    const period = input.period ?? new Date().toISOString().slice(0, 7);

    const isGlobal =
      principal.capabilities.includes('branch:all') ||
      principal.roles.some((r) =>
        ['SUPER_OWNER', 'SUPERADMIN', 'FINANCE'].includes(r.role as string),
      );

    const branchFilter = input.branchId
      ? { branchId: input.branchId }
      : isGlobal
      ? {}
      : { branchId: { in: principal.branchIds } };

    const costs = await this.db.otherCost.findMany({
      where: {
        ...branchFilter,
        period,
      },
      include: {
        branch: { select: { id: true, code: true, name: true } },
        createdBy: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalOtherCostRp = costs.reduce((sum, c) => sum + c.amountRp, 0);

    const byCategory: Record<string, { count: number; amountRp: number }> = {};
    for (const c of costs) {
      const cat = c.category;
      if (!byCategory[cat]) {
        byCategory[cat] = { count: 0, amountRp: 0 };
      }
      byCategory[cat].count += 1;
      byCategory[cat].amountRp += c.amountRp;
    }

    return {
      period,
      branchId: input.branchId ?? 'ALL',
      totalOtherCostRp,
      byCategory,
      items: costs.map((c) => ({
        id: c.id,
        branchId: c.branchId,
        branchName: c.branch.name,
        period: c.period,
        category: c.category,
        description: c.description,
        amountRp: c.amountRp,
        createdByName: c.createdBy?.displayName ?? '-',
        createdAt: c.createdAt.toISOString(),
      })),
    };
  }

  /**
   * 5. Laporan Laba Bersih Bulanan
   */
  async monthlyProfitReport(
    principal: SessionPrincipal,
    input: { branchId?: string; period?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    this.ensureBranchAccess(principal, input.branchId);
    const period = input.period ?? new Date().toISOString().slice(0, 7);

    const [omsetRes, realtimeRes, projectionRes, otherCostRes] = await Promise.all([
      this.omsetReport(principal, { branchId: input.branchId, period }),
      this.realtimeInstructorCostReport(principal, { branchId: input.branchId, period }),
      this.projectionInstructorCostReport(principal, { branchId: input.branchId, period }),
      this.otherCostReport(principal, { branchId: input.branchId, period }),
    ]);

    const omsetRp = omsetRes.totalOmsetRp;
    const costRealtimeRp = realtimeRes.totalInstructorCostRp;
    const costProjectionRp = projectionRes.totalProjectionCostRp;
    const otherCostRp = otherCostRes.totalOtherCostRp;

    const netProfitRealtimeRp = omsetRp - costRealtimeRp - otherCostRp;
    const netProfitProjectionRp = omsetRp - costProjectionRp - otherCostRp;

    let monthlyCloseRecord: any = null;
    if (input.branchId) {
      monthlyCloseRecord = await this.db.monthlyClose.findUnique({
        where: { branchId_period: { branchId: input.branchId, period } },
        include: { closedBy: { select: { displayName: true } } },
      });
    }

    const branchFilter = input.branchId ? { branchId: input.branchId } : {};
    const approvedCorrections = await this.db.correctionJournal.findMany({
      where: {
        ...branchFilter,
        period,
        status: 'APPROVED',
      },
    });
    const totalCorrectionRp = approvedCorrections.reduce((sum, c) => sum + c.amountRp, 0);

    const isLocked = monthlyCloseRecord?.status === 'LOCKED';

    return {
      period,
      branchId: input.branchId ?? 'ALL',
      isLocked,
      status: monthlyCloseRecord?.status ?? 'OPEN',
      closedAt: monthlyCloseRecord?.closedAt?.toISOString() ?? null,
      closedByName: monthlyCloseRecord?.closedBy?.displayName ?? null,
      omsetRp: isLocked ? monthlyCloseRecord.omsetRp : omsetRp,
      costRealtimeRp: isLocked ? monthlyCloseRecord.costRealtimeRp : costRealtimeRp,
      costProjectionRp: isLocked ? monthlyCloseRecord.costProjectionRp : costProjectionRp,
      otherCostRp: isLocked ? monthlyCloseRecord.otherCostRp : otherCostRp,
      netProfitRealtimeRp: isLocked ? monthlyCloseRecord.profitRp : netProfitRealtimeRp,
      netProfitProjectionRp: isLocked
        ? monthlyCloseRecord.omsetRp - monthlyCloseRecord.costProjectionRp - monthlyCloseRecord.otherCostRp
        : netProfitProjectionRp,
      totalCorrectionAdjustmentRp: totalCorrectionRp,
      adjustedNetProfitRealtimeRp:
        (isLocked ? monthlyCloseRecord.profitRp : netProfitRealtimeRp) + totalCorrectionRp,
    };
  }

  // ============================================================================
  // OTHER COST CRUD (DENGAN LOCK GUARD)
  // ============================================================================

  async createOtherCost(
    principal: SessionPrincipal,
    input: {
      branchId: string;
      period: string;
      category?: string;
      categoryCode?: string;
      description: string;
      amountRp: number;
    },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:manage');
    this.ensureBranchAccess(principal, input.branchId);

    if (!Number.isInteger(input.amountRp) || input.amountRp <= 0) {
      throw new ApiProblem('INVALID_AMOUNT', HttpStatus.BAD_REQUEST);
    }

    // PERIOD LOCK CHECK (Keputusan Bisnis #8)
    const close = await this.db.monthlyClose.findUnique({
      where: { branchId_period: { branchId: input.branchId, period: input.period } },
    });
    if (close?.status === 'LOCKED') {
      throw new ApiProblem('PERIOD_ALREADY_LOCKED', HttpStatus.CONFLICT);
    }

    return await this.db.otherCost.create({
      data: {
        branchId: input.branchId,
        period: input.period,
        category: (input.categoryCode ?? input.category)?.trim().toUpperCase() || 'OTHER',
        description: input.description,
        amountRp: input.amountRp,
        createdById: principal.userId,
      },
    });
  }

  async listOtherCosts(
    principal: SessionPrincipal,
    query: { branchId?: string; period?: string; cursor?: string },
  ) {
    const report = await this.otherCostReport(principal, query);
    return {
      items: report.items,
      total: report.items.length,
      page: { hasMore: false, nextCursor: null },
    };
  }

  /** Ubah kategori, keterangan, atau nominal biaya lain. Periode tidak dapat dipindah (hapus lalu catat ulang). */
  async updateOtherCost(
    principal: SessionPrincipal,
    id: string,
    input: { category?: string; categoryCode?: string; description?: string; amountRp?: number },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:manage');
    const existing = await this.db.otherCost.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    this.ensureBranchAccess(principal, existing.branchId);

    const data: { category?: string; description?: string; amountRp?: number } = {};
    const rawCategory = input.categoryCode ?? input.category;
    if (rawCategory !== undefined) {
      const category = String(rawCategory).trim().toUpperCase();
      if (!/^[A-Z][A-Z0-9_]{1,63}$/u.test(category))
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
          { field: 'category', issue: 'INVALID' },
        ]);
      data.category = category;
    }
    if (input.description !== undefined) {
      const description = String(input.description).trim();
      if (description.length < 1 || description.length > 2000)
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
          { field: 'description', issue: 'INVALID' },
        ]);
      data.description = description;
    }
    if (input.amountRp !== undefined) {
      if (!Number.isInteger(input.amountRp) || input.amountRp <= 0)
        throw new ApiProblem('INVALID_AMOUNT', HttpStatus.BAD_REQUEST);
      data.amountRp = input.amountRp;
    }
    if (Object.keys(data).length === 0)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    // PERIOD LOCK CHECK
    const close = await this.db.monthlyClose.findUnique({
      where: { branchId_period: { branchId: existing.branchId, period: existing.period } },
    });
    if (close?.status === 'LOCKED') {
      throw new ApiProblem('PERIOD_ALREADY_LOCKED', HttpStatus.CONFLICT);
    }

    return await this.db.otherCost.update({ where: { id }, data });
  }

  async deleteOtherCost(principal: SessionPrincipal, id: string) {
    this.policy.requireCapability(principal.capabilities, 'finance:manage');
    const existing = await this.db.otherCost.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    this.ensureBranchAccess(principal, existing.branchId);

    // PERIOD LOCK CHECK
    const close = await this.db.monthlyClose.findUnique({
      where: { branchId_period: { branchId: existing.branchId, period: existing.period } },
    });
    if (close?.status === 'LOCKED') {
      throw new ApiProblem('PERIOD_ALREADY_LOCKED', HttpStatus.CONFLICT);
    }

    await this.db.otherCost.delete({ where: { id } });
    return { id, deleted: true };
  }

  // ============================================================================
  // TUTUP BUKU BULANAN (MONTHLY CLOSE)
  // ============================================================================

  async executeMonthlyClose(
    principal: SessionPrincipal,
    input: { branchId: string; period: string; reason?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:manage');
    const canClose = principal.roles.some((r) =>
      ['SUPER_OWNER', 'SUPERADMIN', 'FINANCE'].includes(r.role as string),
    );
    if (!canClose) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    this.ensureBranchAccess(principal, input.branchId);

    const existing = await this.db.monthlyClose.findUnique({
      where: { branchId_period: { branchId: input.branchId, period: input.period } },
    });
    if (existing?.status === 'LOCKED') {
      return existing;
    }

    const [omsetRes, realtimeRes, projectionRes, otherCostRes] = await Promise.all([
      this.omsetReport(principal, { branchId: input.branchId, period: input.period }),
      this.realtimeInstructorCostReport(principal, { branchId: input.branchId, period: input.period }),
      this.projectionInstructorCostReport(principal, { branchId: input.branchId, period: input.period }),
      this.otherCostReport(principal, { branchId: input.branchId, period: input.period }),
    ]);

    const omsetRp = omsetRes.totalOmsetRp;
    const costRealtimeRp = realtimeRes.totalInstructorCostRp;
    const costProjectionRp = projectionRes.totalProjectionCostRp;
    const otherCostRp = otherCostRes.totalOtherCostRp;
    const profitRp = omsetRp - costRealtimeRp - otherCostRp;

    const controlHash = `hash-${input.branchId}-${input.period}-${Date.now()}`;

    const closed = await this.db.monthlyClose.upsert({
      where: { branchId_period: { branchId: input.branchId, period: input.period } },
      create: {
        branchId: input.branchId,
        period: input.period,
        omsetRp,
        costRealtimeRp,
        costProjectionRp,
        otherCostRp,
        profitRp,
        status: 'LOCKED',
        controlHash,
        closedById: principal.userId,
        closedAt: new Date(),
      },
      update: {
        omsetRp,
        costRealtimeRp,
        costProjectionRp,
        otherCostRp,
        profitRp,
        status: 'LOCKED',
        controlHash,
        closedById: principal.userId,
        closedAt: new Date(),
      },
    });

    return closed;
  }

  // ============================================================================
  // JURNAL KOREKSI PASCA-LOCK (RULE #8)
  // ============================================================================

  private correctionView(row: {
    id: string;
    branchId: string;
    period: string;
    targetPeriod: string;
    amountRp: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedById: string;
    approvedById: string | null;
    decisionReason?: string | null;
    version?: number;
  }) {
    return {
      id: row.id,
      branchId: row.branchId,
      currentPeriod: row.period,
      referencePeriod: row.targetPeriod,
      amount: toMoney(row.amountRp),
      reason: row.reason,
      requestedBy: row.requestedById,
      decidedBy: row.approvedById,
      decisionReason: row.decisionReason ?? null,
      status: row.status,
      version: row.version ?? 1,
    };
  }

  async createCorrection(
    principal: SessionPrincipal,
    input: {
      branchId: string;
      currentPeriod?: string;
      referencePeriod?: string;
      /** Nama lama (`period`/`targetPeriod`) tetap diterima. */
      period?: string;
      targetPeriod?: string;
      amountRp: number;
      reason: string;
    },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:manage');
    const currentPeriod = input?.currentPeriod ?? input?.period ?? '';
    const referencePeriod = input?.referencePeriod ?? input?.targetPeriod ?? '';
    const reason = typeof input?.reason === 'string' ? input.reason.trim() : '';
    if (!input?.branchId) throw problem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, 'branchId');
    if (!PERIOD.test(currentPeriod))
      throw problem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, 'currentPeriod');
    // Koreksi dicatat pada bulan berjalan dan mengacu ke bulan sebelumnya (Aturan Bisnis #8).
    if (!PERIOD.test(referencePeriod) || referencePeriod >= currentPeriod)
      throw problem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, 'referencePeriod');
    if (
      !Number.isInteger(input.amountRp) ||
      input.amountRp === 0 ||
      Math.abs(input.amountRp) > 1_000_000_000
    )
      throw problem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, 'amountRp');
    if (reason.length < 3 || reason.length > 500)
      throw problem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, 'reason');
    this.ensureBranchAccess(principal, input.branchId);

    const created = await this.db.correctionJournal.create({
      data: {
        branchId: input.branchId,
        period: currentPeriod,
        targetPeriod: referencePeriod,
        amountRp: input.amountRp,
        reason,
        status: 'PENDING',
        requestedById: principal.userId,
      },
    });
    await this.audit.catat(null, {
      actorId: principal.userId,
      branchId: created.branchId,
      action: 'FINANCE_CORRECTION_REQUESTED',
      objectType: 'CorrectionJournal',
      objectId: created.id,
      afterMasked: { currentPeriod, referencePeriod, amountRp: created.amountRp },
    });
    return this.correctionView(created);
  }

  async decideCorrection(
    principal: SessionPrincipal,
    id: string,
    decision: string | undefined,
    body: { reason?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:manage');
    const isSuperOwner = principal.roles.some((r) =>
      ['SUPER_OWNER', 'SUPERADMIN'].includes(r.role as string),
    );
    if (!isSuperOwner) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const normalized = decision?.toLowerCase();
    if (normalized !== 'approve' && normalized !== 'reject')
      throw problem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST, 'decision');
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';
    if (reason.length < 3 || reason.length > 500)
      throw problem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, 'reason');

    const correction = await this.db.correctionJournal.findUnique({ where: { id } });
    if (!correction) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    // Super Owner dan Superadmin berhak menyetujui koreksi yang diajukan sendiri maupun diajukan staf keuangan.
    // Pemisahan tugas (Maker-Checker) hanya berlaku jika aktor bukan Super Owner/Superadmin.
    if (!isSuperOwner && correction.requestedById === principal.userId)
      throw problem('SEPARATION_OF_DUTIES', HttpStatus.FORBIDDEN);
    if (correction.status !== 'PENDING')
      throw problem('CORRECTION_ALREADY_DECIDED', HttpStatus.CONFLICT);

    const claimed = await this.db.correctionJournal.updateMany({
      where: { id, status: 'PENDING', version: correction.version },
      data: {
        status: normalized === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedById: principal.userId,
        approvedAt: new Date(),
        decisionReason: reason,
        version: { increment: 1 },
      },
    });
    if (claimed.count !== 1) throw problem('CORRECTION_ALREADY_DECIDED', HttpStatus.CONFLICT);

    const updated = await this.db.correctionJournal.findUniqueOrThrow({ where: { id } });
    await this.audit.catat(null, {
      actorId: principal.userId,
      branchId: updated.branchId,
      action: normalized === 'approve' ? 'FINANCE_CORRECTION_APPROVED' : 'FINANCE_CORRECTION_REJECTED',
      objectType: 'CorrectionJournal',
      objectId: id,
    });
    return {
      correction: this.correctionView(updated),
      journalReferenceId: null,
      // Audit belum disimpan permanen (AuditService hanya mencatat ke log), jadi tidak ada id audit.
      auditLogId: null,
      idempotentReplay: false,
    };
  }

  async listCorrections(
    principal: SessionPrincipal,
    filters: { branchId?: string; period?: string; status?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    const where: any = {};
    if (filters.branchId) {
      this.ensureBranchAccess(principal, filters.branchId);
      where.branchId = filters.branchId;
    } else if (!principal.capabilities.includes('branch:all')) {
      where.branchId = { in: principal.branchIds };
    }
    if (filters.period) where.period = filters.period;
    if (filters.status) where.status = filters.status;

    const rows = await this.db.correctionJournal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    const items = rows.map((row) => this.correctionView(row));

    return {
      items,
      summary: {
        total: items.length,
        pending: items.filter((i) => i.status === 'PENDING').length,
        approved: items.filter((i) => i.status === 'APPROVED').length,
        rejected: items.filter((i) => i.status === 'REJECTED').length,
      },
      page: { hasMore: false, nextCursor: null },
    };
  }

  // ============================================================================
  // EKSPOR FINANCE (CSV)
  // ============================================================================

  async exportReport(
    principal: SessionPrincipal,
    input: { branchId?: string; from?: string | Date; until?: string | Date },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:export');
    const from = input?.from ? new Date(input.from) : null;
    const until = input?.until ? new Date(input.until) : null;
    if (!from || !until || Number.isNaN(from.getTime()) || Number.isNaN(until.getTime()))
      throw problem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, 'from');
    if (from > until) throw problem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, 'until');
    if ((until.getTime() - from.getTime()) / 86_400_000 > EXPORT_MAX_DAYS)
      throw problem('EXPORT_RANGE_TOO_LARGE', HttpStatus.UNPROCESSABLE_ENTITY, 'until');
    this.ensureBranchAccess(principal, input.branchId);

    const isGlobal =
      principal.capabilities.includes('branch:all') ||
      principal.roles.some((r) =>
        ['SUPER_OWNER', 'SUPERADMIN', 'FINANCE'].includes(r.role as string),
      );
    const branchFilter = input.branchId
      ? { branchId: input.branchId }
      : isGlobal
        ? {}
        : { branchId: { in: principal.branchIds } };

    // `until` adalah tanggal (inklusif), sehingga batas atas query = hari berikutnya.
    const endExclusive = new Date(until.getTime() + 86_400_000);
    const months = new Set<string>();
    for (
      const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
      cursor <= until;
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
    )
      months.add(cursor.toISOString().slice(0, 7));

    const [purchases, costs, branch] = await Promise.all([
      this.db.pembelian.findMany({
        where: { ...branchFilter, status: 'PAID', paidAt: { gte: from, lt: endExclusive } },
        include: {
          branch: { select: { code: true } },
          package: { select: { name: true } },
        },
        orderBy: [{ paidAt: 'asc' }, { id: 'asc' }],
        take: EXPORT_MAX_ROWS + 1,
      }),
      this.db.otherCost.findMany({
        where: { ...branchFilter, period: { in: [...months] } },
        include: { branch: { select: { code: true } } },
        orderBy: [{ period: 'asc' }, { id: 'asc' }],
        take: EXPORT_MAX_ROWS + 1,
      }),
      input.branchId
        ? this.db.cabang.findUnique({ where: { id: input.branchId }, select: { code: true } })
        : Promise.resolve(null),
    ]);
    const truncated = purchases.length > EXPORT_MAX_ROWS || costs.length > EXPORT_MAX_ROWS;
    const salesRows = purchases.slice(0, EXPORT_MAX_ROWS);
    const costRows = costs.slice(0, EXPORT_MAX_ROWS);

    const day = (date: Date | null | undefined) => (date ?? new Date(0)).toISOString().slice(0, 10);
    const lines = ['tanggal,cabang,jenis,referensi,keterangan,jumlah_rp'];
    let salesTotal = 0;
    for (const p of salesRows) {
      salesTotal += p.totalAmountRp;
      lines.push(
        [
          day(p.paidAt ?? p.createdAt),
          csvText(p.branch.code),
          'PENJUALAN_PAKET',
          csvText(p.invoiceNumber ?? p.id),
          csvText(p.package.name),
          String(p.totalAmountRp),
        ].join(','),
      );
    }
    let costTotal = 0;
    for (const c of costRows) {
      costTotal += c.amountRp;
      lines.push(
        [
          `${c.period}-01`,
          csvText(c.branch.code),
          'BIAYA_LAIN',
          csvText(c.id),
          csvText(`${c.category}: ${c.description}`),
          String(c.amountRp),
        ].join(','),
      );
    }
    lines.push(`,,TOTAL_PENJUALAN,,Penjualan paket lunas,${salesTotal}`);
    lines.push(`,,TOTAL_BIAYA_LAIN,,Biaya lain dihitung per bulan periode,${costTotal}`);
    lines.push(`,,SELISIH,,Penjualan dikurangi biaya lain,${salesTotal - costTotal}`);

    const content = `\uFEFF${lines.join('\r\n')}\r\n`;
    await this.audit.catat(null, {
      actorId: principal.userId,
      branchId: input.branchId ?? null,
      action: 'FINANCE_EXPORT',
      objectType: 'FinanceExport',
      objectId: `${day(from)}..${day(until)}`,
      afterMasked: { rows: salesRows.length + costRows.length, truncated },
    });
    return {
      fileName: `finance-${branch?.code ?? 'semua-cabang'}-${day(from)}-${day(until)}.csv`,
      mimeType: 'text/csv;charset=utf-8',
      content,
      controlHash: createHash('sha256').update(content).digest('hex'),
      sourceCutoffAt: new Date().toISOString(),
      completeness: truncated ? 'INCOMPLETE' : 'COMPLETE',
      auditLogId: null,
    };
  }

  // ============================================================================
  // BACKWARD COMPATIBILITY & LEGACY ENDPOINTS
  // ============================================================================

  async overview(
    principal: SessionPrincipal,
    input: { branchId?: string; from?: string; until?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    const branch = input.branchId
      ? await this.db.cabang.findUnique({ where: { id: input.branchId } })
      : await this.db.cabang.findFirst();

    const purchases = await this.db.pembelian.findMany({
      where: {
        ...(branch ? { branchId: branch.id } : {}),
        status: 'PAID',
      },
    });

    const revenue = purchases.reduce((sum, p) => sum + p.totalAmountRp, 0);

    const fromDate = input.from ? new Date(input.from) : new Date(Date.now() - 30 * 86400000);
    const untilDate = input.until ? new Date(input.until) : new Date();

    const branchItem = {
      id: branch?.id ?? 'branch-1',
      code: branch?.code ?? 'JKT',
      name: branch?.name ?? 'Daily Dose Studio',
      expectedRp: revenue,
      receivedRp: revenue,
      approvedRp: revenue,
      identificationAmountRp: 0,
      reconciliationDifferenceRp: 0,
      anomalousTransactionCount: 0,
    };

    return {
      generatedAt: new Date().toISOString(),
      period: {
        from: fromDate.toISOString(),
        until: untilDate.toISOString(),
      },
      metrics: {
        expectedRp: revenue,
        receivedRp: revenue,
        approvedRp: revenue,
        identificationAmountRp: 0,
        reconciliationDifferenceRp: 0,
        anomalousTransactionCount: 0,
      },
      branches: [branchItem],
    };
  }

  async anomalies(
    principal: SessionPrincipal,
    input: { branchId?: string; from?: string; until?: string; limit?: number; cursor?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    const limit = input.limit ? Math.min(input.limit, 100) : 50;

    // 1. Bank mutations requiring manual review or unmatched
    const flaggedMutations = await this.db.mutasiBank.findMany({
      where: {
        status: { in: ['MANUAL_REVIEW', 'UNMATCHED'] },
      },
      take: limit,
      orderBy: { transactionDate: 'desc' },
    });

    const mutationItems = flaggedMutations.map((m) => ({
      purchaseId: m.id,
      branchId: '',
      branchCode: m.bankName,
      amountRp: m.amountRp,
      submittedAt: m.transactionDate,
      code: m.status === 'MANUAL_REVIEW' ? 'MUTASI_AMBIGU' : 'MUTASI_BELUM_COCOK',
      severity: m.status === 'MANUAL_REVIEW' ? ('ERROR' as const) : ('WARNING' as const),
      message: m.notes || `Mutasi ${m.bankName} Rp ${m.amountRp.toLocaleString('id-ID')}`,
      href: `/workspace/payments?q=${encodeURIComponent(m.referenceNumber || '')}`,
    }));

    // 2. Purchases waiting verification aging > 24 hours
    const agingCutoff = new Date(Date.now() - 24 * 3600 * 1000);
    const agingPurchases = await this.db.pembelian.findMany({
      where: {
        status: 'WAITING_VERIFICATION',
        createdAt: { lt: agingCutoff },
        ...(input.branchId ? { branchId: input.branchId } : {}),
      },
      include: {
        branch: { select: { code: true } },
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    const purchaseItems = agingPurchases.map((p) => ({
      purchaseId: p.id,
      branchId: p.branchId,
      branchCode: p.branch?.code || '—',
      amountRp: p.totalAmountRp,
      submittedAt: p.createdAt,
      code: 'VERIFIKASI_TERTAHAN',
      severity: 'WARNING' as const,
      message: `Tagihan #${p.invoiceNumber} menunggu verifikasi > 24 jam`,
      href: `/workspace/payments/${p.id}`,
    }));

    const allItems = [...mutationItems, ...purchaseItems].slice(0, limit);

    return {
      items: allItems,
      total: allItems.length,
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async legacyCashflow(
    principal: SessionPrincipal,
    input: { branchId?: string; from?: string; until?: string; limit?: number; cursor?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    return {
      items: [],
      total: 0,
      summary: {
        TOTAL: { amountRp: 0, count: 0 },
      },
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async correctionJournals(
    principal: SessionPrincipal,
    filters: { period?: string; branchId?: string; status?: string; q?: string; cursor?: string },
  ) {
    return this.listCorrections(principal, filters);
  }

  async reports(
    principal: SessionPrincipal,
    reportType: string,
    filters: { period?: string; branchId?: string; cursor?: string },
  ) {
    const type = reportType.toLowerCase();
    if (type === 'omset') {
      return this.omsetReport(principal, filters);
    }
    if (type === 'instructor-cost-realtime' || type === 'cost-realtime') {
      return this.realtimeInstructorCostReport(principal, filters);
    }
    if (type === 'instructor-cost-projection' || type === 'cost-projection') {
      return this.projectionInstructorCostReport(principal, filters);
    }
    if (type === 'other-cost' || type === 'other-costs') {
      return this.otherCostReport(principal, filters);
    }
    if (type === 'profit' || type === 'profit-summary') {
      const summary = await this.monthlyProfitReport(principal, filters);
      const moneyZero = { amountMinor: 0, currency: 'IDR' };
      const money = (val: number) => ({ amountMinor: val * 100, currency: 'IDR' });
      return {
        report: {
          reportType: 'PROFIT',
          branchId: summary.branchId,
          period: summary.period,
          generatedAt: new Date().toISOString(),
          sourceCutoffAt: new Date().toISOString(),
          completeness: 'COMPLETE',
          anomalyCount: 0,
          controlHash: 'hash-ctrl-baseline-001',
          totals: {
            grossSales: money(summary.omsetRp),
            packagePromotionDiscount: moneyZero,
            voucherDiscount: moneyZero,
            revenue: money(summary.omsetRp),
            projection: money(summary.costProjectionRp),
            instructorRealtime: money(summary.costRealtimeRp),
            otherCost: money(summary.otherCostRp),
            correction: money(summary.totalCorrectionAdjustmentRp),
            profit: money(summary.netProfitRealtimeRp),
          },
          sourceVersion: 'v2',
        },
        items: [],
        page: { hasMore: false, nextCursor: null },
      };
    }

    const summary = await this.monthlyProfitReport(principal, filters);
    const moneyZero = { amountMinor: 0, currency: 'IDR' };
    const money = (val: number) => ({ amountMinor: val * 100, currency: 'IDR' });
    return {
      report: {
        reportType: 'REVENUE',
        branchId: summary.branchId,
        period: summary.period,
        generatedAt: new Date().toISOString(),
        sourceCutoffAt: new Date().toISOString(),
        completeness: 'COMPLETE',
        anomalyCount: 0,
        controlHash: 'hash-ctrl-baseline-001',
        totals: {
          grossSales: money(summary.omsetRp),
          packagePromotionDiscount: moneyZero,
          voucherDiscount: moneyZero,
          revenue: money(summary.omsetRp),
          projection: money(summary.costProjectionRp),
          instructorRealtime: money(summary.costRealtimeRp),
          otherCost: money(summary.otherCostRp),
          correction: money(summary.totalCorrectionAdjustmentRp),
          profit: money(summary.netProfitRealtimeRp),
        },
        sourceVersion: 'v2',
      },
      items: [],
      page: { hasMore: false, nextCursor: null },
    };
  }

  async periods(
    principal: SessionPrincipal,
    filters: { branchId?: string; cursor?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    // Tanpa cabang dipilih: pemegang akses global melihat semua cabang, selain itu cabangnya sendiri.
    if (filters.branchId) this.ensureBranchAccess(principal, filters.branchId);
    const isGlobal =
      principal.capabilities.includes('branch:all') ||
      principal.roles.some((r) =>
        ['SUPER_OWNER', 'SUPERADMIN', 'FINANCE'].includes(r.role as string),
      );
    const branch = filters.branchId
      ? await this.db.cabang.findUnique({ where: { id: filters.branchId } })
      : null;

    const currentYearMonth = new Date().toISOString().slice(0, 7);

    const closes = await this.db.monthlyClose.findMany({
      where: filters.branchId
        ? { branchId: filters.branchId }
        : isGlobal
          ? {}
          : { branchId: { in: principal.branchIds } },
      orderBy: { period: 'desc' },
    });

    const hasCurrent = closes.some((c) => c.period === currentYearMonth);
    const items = closes.map((c) => ({
      id: c.id,
      branchId: c.branchId,
      period: c.period,
      status: c.status,
      controlHash: c.controlHash ?? 'hash-ctrl-baseline-001',
      version: 1,
      closedAt: c.closedAt?.toISOString() ?? null,
    }));

    if (!hasCurrent && branch?.id) {
      items.unshift({
        id: `period-${currentYearMonth}`,
        branchId: branch.id,
        period: currentYearMonth,
        status: 'OPEN',
        controlHash: 'hash-ctrl-baseline-001',
        version: 1,
        closedAt: null,
      });
    }

    return {
      items,
      page: {
        hasMore: false,
        nextCursor: null,
      },
    };
  }

  async closeMonth(
    principal: SessionPrincipal,
    body: { branchId: string; period: string; controlHash?: string; reason?: string },
  ) {
    const closed = await this.executeMonthlyClose(principal, body);
    return {
      branchId: closed.branchId,
      period: closed.period,
      status: closed.status,
      closedAt: closed.closedAt ? closed.closedAt.toISOString() : new Date().toISOString(),
    };
  }

  async otherCosts(
    principal: SessionPrincipal,
    filters: { period?: string; branchId?: string; cursor?: string },
  ) {
    return this.listOtherCosts(principal, filters);
  }

  // ============================================================================
  // OWNER BRANCH PERFORMANCE (RULE #10)
  // ============================================================================

  async ownerBranchPerformance(
    principal: SessionPrincipal,
    input: { branchId?: string; period?: string },
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:read');
    const isOwnerOrSuper = principal.roles.some((r) =>
      ['SUPER_OWNER', 'SUPERADMIN', 'OWNER', 'FINANCE'].includes(r.role as string),
    );
    if (!isOwnerOrSuper) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const isGlobal = principal.capabilities.includes('branch:all');
    let targetBranchId = input.branchId;

    if (!targetBranchId) {
      if (isGlobal) {
        const firstBranch = await this.db.cabang.findFirst({ where: { active: true } });
        targetBranchId = firstBranch?.id;
      } else if (principal.branchIds.length > 0) {
        targetBranchId = principal.branchIds[0];
      }
    }

    if (!targetBranchId) {
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (!isGlobal && !principal.branchIds.includes(targetBranchId)) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const branch = await this.db.cabang.findUnique({
      where: { id: targetBranchId },
    });
    if (!branch) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const { period, fromDate, nextMonth } = periodRange(input.period);

    const purchases = await this.db.pembelian.findMany({
      where: {
        branchId: targetBranchId,
        status: 'PAID',
        createdAt: { gte: fromDate, lt: nextMonth },
      },
    });
    const omsetRp = purchases.reduce((sum, p) => sum + p.totalAmountRp, 0);

    const otherCosts = await this.db.otherCost.findMany({
      where: {
        branchId: targetBranchId,
        period,
      },
    });
    const otherCostRp = otherCosts.reduce((sum, c) => sum + c.amountRp, 0);

    const slots = await this.db.slotKelas.findMany({
      where: {
        branchId: targetBranchId,
        startAt: { gte: fromDate, lt: nextMonth },
        status: 'COMPLETED',
      },
      include: {
        instructor: true,
        classType: true,
        instructorAttendance: { select: { id: true } },
      },
    });

    const fees = await this.db.instructorFee.findMany({
      where: { branchId: targetBranchId },
      orderBy: { effectiveDate: 'desc' },
    });

    const instructorBreakdown = summarizeInstructorFees(slots, fees);
    const totalInstructorFeeRp = instructorBreakdown.reduce(
      (sum, item) => sum + item.totalFeeRp,
      0,
    );
    const estimatedProfitRp = omsetRp - totalInstructorFeeRp - otherCostRp;
    const totalUnverifiedFeeRp = instructorBreakdown.reduce(
      (sum, item) => sum + item.unverifiedFeeRp,
      0,
    );

    return {
      branch: {
        id: branch.id,
        code: branch.code,
        name: branch.name,
      },
      period,
      omsetRp,
      otherCostRp,
      totalInstructorFeeRp,
      totalUnverifiedFeeRp,
      unverifiedClassCount: instructorBreakdown.reduce(
        (sum, item) => sum + item.unverifiedClassCount,
        0,
      ),
      estimatedProfitRp,
      instructorCount: instructorBreakdown.length,
      totalClassHours: instructorBreakdown.reduce((sum, item) => sum + item.totalHours, 0),
      instructors: instructorBreakdown,
    };
  }
}
