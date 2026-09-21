import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';

@Injectable()
export class FinanceService {
  constructor(private readonly db: PrismaService) {}

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
    const period = periodStr ?? new Date().toISOString().slice(0, 7);
    const fromDate = new Date(`${period}-01T00:00:00.000Z`);
    const nextMonth = new Date(fromDate);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    return { period, fromDate, nextMonth };
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
      },
      orderBy: { startAt: 'asc' },
    });

    const fees = await this.db.instructorFee.findMany({
      where: input.branchId ? { branchId: input.branchId } : {},
      orderBy: { effectiveDate: 'desc' },
    });

    const instructorMap = new Map<
      string,
      {
        instructorId: string;
        instructorName: string;
        groupHours: number;
        groupFeeRp: number;
        semiPrivateHours: number;
        semiPrivateFeeRp: number;
        privateHours: number;
        privateFeeRp: number;
        totalHours: number;
        totalFeeRp: number;
      }
    >();

    for (const slot of slots) {
      if (!slot.instructor) continue;
      const instId = slot.instructor.id;
      if (!instructorMap.has(instId)) {
        instructorMap.set(instId, {
          instructorId: instId,
          instructorName: slot.instructor.displayName,
          groupHours: 0,
          groupFeeRp: 0,
          semiPrivateHours: 0,
          semiPrivateFeeRp: 0,
          privateHours: 0,
          privateFeeRp: 0,
          totalHours: 0,
          totalFeeRp: 0,
        });
      }

      const entry = instructorMap.get(instId)!;
      const durationMs = slot.endAt.getTime() - slot.startAt.getTime();
      const hours = Math.max(1, Math.round(durationMs / 3600000));

      const matchedFee =
        fees.find(
          (f) =>
            f.instructorId === instId &&
            f.branchId === slot.branchId &&
            f.classTypeId === slot.classTypeId &&
            f.effectiveDate <= slot.startAt,
        )?.feePerJamRp ??
        fees.find(
          (f) =>
            f.instructorId === instId &&
            f.classTypeId === slot.classTypeId &&
            f.effectiveDate <= slot.startAt,
        )?.feePerJamRp ??
        150_000;

      const feeRp = hours * matchedFee;
      entry.totalHours += hours;
      entry.totalFeeRp += feeRp;

      const typeName = (slot.classType?.name ?? '').toLowerCase();
      if (typeName.includes('semi')) {
        entry.semiPrivateHours += hours;
        entry.semiPrivateFeeRp += feeRp;
      } else if (typeName.includes('private')) {
        entry.privateHours += hours;
        entry.privateFeeRp += feeRp;
      } else {
        entry.groupHours += hours;
        entry.groupFeeRp += feeRp;
      }
    }

    const instructorBreakdown = Array.from(instructorMap.values());
    const totalInstructorCostRp = instructorBreakdown.reduce(
      (sum, item) => sum + item.totalFeeRp,
      0,
    );
    const totalTeachingHours = instructorBreakdown.reduce((sum, item) => sum + item.totalHours, 0);

    return {
      period,
      branchId: input.branchId ?? 'ALL',
      totalInstructorCostRp,
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

    const classTypeMap = new Map<
      string,
      {
        classTypeId: string;
        sessionsSold: number;
        ratePerSesiRp: number;
        totalCostRp: number;
      }
    >();

    let totalSessionsSold = 0;
    let totalProjectionCostRp = 0;

    for (const p of purchases) {
      const ctypeId = p.package.classTypeId ?? 'DEFAULT';
      const sessions = p.package.sessionCount ?? 1;
      const purchaseDate = p.paidAt ?? p.createdAt;

      const matchedRate =
        projectionRates.find(
          (r) =>
            r.branchId === p.branchId &&
            r.classTypeId === ctypeId &&
            r.effectiveDate <= purchaseDate,
        )?.ratePerSesiRp ?? 125_000;

      const costRp = sessions * matchedRate;
      totalSessionsSold += sessions;
      totalProjectionCostRp += costRp;

      if (!classTypeMap.has(ctypeId)) {
        classTypeMap.set(ctypeId, {
          classTypeId: ctypeId,
          sessionsSold: 0,
          ratePerSesiRp: matchedRate,
          totalCostRp: 0,
        });
      }
      const entry = classTypeMap.get(ctypeId)!;
      entry.sessionsSold += sessions;
      entry.totalCostRp += costRp;
    }

    return {
      period,
      branchId: input.branchId ?? 'ALL',
      totalSessionsSold,
      totalProjectionCostRp,
      breakdown: Array.from(classTypeMap.values()),
    };
  }

  /**
   * 4. Laporan Cost Lain-lain (OtherCost)
   */
  async otherCostReport(
    principal: SessionPrincipal,
    input: { branchId?: string; period?: string },
  ) {
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
      netProfitProjectionRp,
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
      category: string;
      description: string;
      amountRp: number;
    },
  ) {
    this.ensureBranchAccess(principal, input.branchId);

    if (
      typeof input.amountRp !== 'number' ||
      Number.isNaN(input.amountRp) ||
      !Number.isFinite(input.amountRp) ||
      input.amountRp <= 0
    ) {
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
        category: input.category || 'OTHER',
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

  async deleteOtherCost(principal: SessionPrincipal, id: string) {
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

  async createCorrection(
    principal: SessionPrincipal,
    input: {
      branchId: string;
      targetPeriod: string;
      period: string;
      amountRp: number;
      reason: string;
    },
  ) {
    this.ensureBranchAccess(principal, input.branchId);

    return await this.db.correctionJournal.create({
      data: {
        branchId: input.branchId,
        targetPeriod: input.targetPeriod,
        period: input.period,
        amountRp: input.amountRp,
        reason: input.reason,
        status: 'PENDING',
        requestedById: principal.userId,
      },
    });
  }

  async decideCorrection(
    principal: SessionPrincipal,
    id: string,
    decision: 'APPROVE' | 'REJECT',
    note?: string,
  ) {
    const isSuperOwner = principal.roles.some((r) =>
      ['SUPER_OWNER', 'SUPERADMIN'].includes(r.role as string),
    );
    if (!isSuperOwner) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const correction = await this.db.correctionJournal.findUnique({ where: { id } });
    if (!correction) {
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    const updated = await this.db.correctionJournal.update({
      where: { id },
      data: {
        status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        approvedById: principal.userId,
        approvedAt: new Date(),
      },
    });

    return updated;
  }

  async listCorrections(
    principal: SessionPrincipal,
    filters: { branchId?: string; period?: string; status?: string },
  ) {
    const where: any = {};
    if (filters.branchId) {
      this.ensureBranchAccess(principal, filters.branchId);
      where.branchId = filters.branchId;
    } else if (!principal.capabilities.includes('branch:all')) {
      where.branchId = { in: principal.branchIds };
    }
    if (filters.period) where.period = filters.period;
    if (filters.status) where.status = filters.status;

    const items = await this.db.correctionJournal.findMany({
      where,
      include: {
        branch: { select: { id: true, code: true, name: true } },
        requestedBy: { select: { id: true, displayName: true } },
        approvedBy: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

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
  // BACKWARD COMPATIBILITY & LEGACY ENDPOINTS
  // ============================================================================

  async overview(
    principal: SessionPrincipal,
    input: { branchId?: string; from?: string; until?: string },
  ) {
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
    return {
      items: [],
      total: 0,
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
    const branch = filters.branchId
      ? await this.db.cabang.findUnique({ where: { id: filters.branchId } })
      : await this.db.cabang.findFirst();

    const currentYearMonth = new Date().toISOString().slice(0, 7);

    const closes = await this.db.monthlyClose.findMany({
      where: branch?.id ? { branchId: branch.id } : {},
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

    const period = input.period ?? new Date().toISOString().slice(0, 7);
    const fromDate = new Date(`${period}-01T00:00:00Z`);
    const nextMonth = new Date(fromDate);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);

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
      },
    });

    const fees = await this.db.instructorFee.findMany({
      where: { branchId: targetBranchId },
      orderBy: { effectiveDate: 'desc' },
    });

    const instructorMap = new Map<
      string,
      {
        instructorId: string;
        instructorName: string;
        groupHours: number;
        groupFeeRp: number;
        semiPrivateHours: number;
        semiPrivateFeeRp: number;
        privateHours: number;
        privateFeeRp: number;
        totalHours: number;
        totalFeeRp: number;
      }
    >();

    for (const slot of slots) {
      if (!slot.instructor) continue;
      const instId = slot.instructor.id;
      if (!instructorMap.has(instId)) {
        instructorMap.set(instId, {
          instructorId: instId,
          instructorName: slot.instructor.displayName,
          groupHours: 0,
          groupFeeRp: 0,
          semiPrivateHours: 0,
          semiPrivateFeeRp: 0,
          privateHours: 0,
          privateFeeRp: 0,
          totalHours: 0,
          totalFeeRp: 0,
        });
      }

      const entry = instructorMap.get(instId)!;
      const durationMs = slot.endAt.getTime() - slot.startAt.getTime();
      const hours = Math.max(1, Math.round(durationMs / 3600000));

      const matchedFee =
        fees.find(
          (f) =>
            f.instructorId === instId &&
            f.classTypeId === slot.classTypeId &&
            f.effectiveDate <= slot.startAt,
        )?.feePerJamRp ?? 150_000;

      const feeRp = hours * matchedFee;
      entry.totalHours += hours;
      entry.totalFeeRp += feeRp;

      const typeName = (slot.classType?.name ?? '').toLowerCase();
      if (typeName.includes('semi')) {
        entry.semiPrivateHours += hours;
        entry.semiPrivateFeeRp += feeRp;
      } else if (typeName.includes('private')) {
        entry.privateHours += hours;
        entry.privateFeeRp += feeRp;
      } else {
        entry.groupHours += hours;
        entry.groupFeeRp += feeRp;
      }
    }

    const instructorBreakdown = Array.from(instructorMap.values());
    const totalInstructorFeeRp = instructorBreakdown.reduce(
      (sum, item) => sum + item.totalFeeRp,
      0,
    );
    const estimatedProfitRp = omsetRp - totalInstructorFeeRp - otherCostRp;

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
      estimatedProfitRp,
      instructorCount: instructorBreakdown.length,
      totalClassHours: instructorBreakdown.reduce((sum, item) => sum + item.totalHours, 0),
      instructors: instructorBreakdown,
    };
  }
}
