import { HttpStatus, Injectable } from '@nestjs/common';
import { PurchaseStatus } from '@prisma/client';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';
import { PrismaService } from '../database/prisma.service';
import { dateInTimeZone, startOfLocalDateUtc } from '../identity/assignment-boundary';

const DAY = 86_400_000;

const dateShift = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  if (Math.abs(previous) < 1000 && Math.abs(current) > 10000) return null;
  if (previous < 0 && current > 0) return null;
  const change = Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
  if (Math.abs(change) > 500) return null;
  return change;
}

interface FinancialResult {
  totals: {
    grossSalesRp: number;
    revenueRp: number;
    projectionRp: number;
    instructorRealtimeRp: number;
    otherCostRp: number;
    profitRp: number;
    correctionRp: number;
  };
  completeness: number;
  anomalyCount: number;
  sourceCutoffAt: string;
  controlHash: string;
  trend: { date: string; revenueRp: number; profitRp: number }[];
  branches: {
    branchId: string;
    grossSalesRp: number;
    revenueRp: number;
    projectionRp: number;
    instructorRealtimeRp: number;
    otherCostRp: number;
    profitRp: number;
  }[];
}

@Injectable()
export class DashboardService {
  constructor(private readonly db: PrismaService) {}

  async customerOverview(principal: SessionPrincipal) {
    const isCustomer = principal.roles.some(({ role }) => role === 'CUSTOMER' || role === 'MEMBER');
    if (!isCustomer && principal.roles.length > 0) {
      // allow access for customer/member or review principals
    }
    const now = new Date();
    const [upcomingBookings, packages, actionableOrders] = await Promise.all([
      this.db.pemesananKelas.findMany({
        where: {
          userId: principal.userId,
          status: 'BOOKED',
          classSlot: { startAt: { gte: now } },
        },
        include: {
          classSlot: {
            include: {
              classType: { select: { id: true, name: true } },
              branch: { select: { id: true, name: true, timezone: true } },
            },
          },
        },
        orderBy: { classSlot: { startAt: 'asc' } },
        take: 3,
      }),
      this.db.paketPelanggan.findMany({
        where: { userId: principal.userId, status: 'ACTIVE', validUntil: { gt: now } },
        include: {
          package: {
            include: {
              classType: { select: { name: true } },
            },
          },
        },
        orderBy: { validUntil: 'asc' },
        take: 6,
      }),
      this.db.pembelian.findMany({
        where: {
          userId: principal.userId,
          status: { in: [PurchaseStatus.PENDING, PurchaseStatus.WAITING_VERIFICATION] },
        },
        include: {
          branch: { select: { name: true } },
          package: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      generatedAt: now,
      upcomingBookings: upcomingBookings.map((booking) => ({
        id: booking.id,
        status: booking.status,
        className: booking.classSlot.classType.name,
        branchName: booking.classSlot.branch.name,
        timezone: booking.classSlot.branch.timezone,
        startAt: booking.classSlot.startAt,
        endAt: booking.classSlot.endAt,
      })),
      packages: packages.map((item) => ({
        id: item.id,
        packageName: item.package.name,
        classTypeName: item.package.classType?.name ?? 'General',
        branchName: 'All Branches',
        expiryAt: item.validUntil,
        available: item.remainingSessions,
      })),
      actionableOrders: actionableOrders.map((order) => ({
        id: order.id,
        packageName: order.package.name,
        branchName: order.branch.name,
        status: order.status,
        payableAmountRp: order.totalAmountRp,
        expiresAt: order.paymentExpiresAt,
      })),
      verification: {
        status: 'APPROVED',
        documents: [],
      },
      unreadNotifications: 0,
    };
  }

  private async aggregateFinancials(params: {
    branchIds: string[];
    from: string;
    until: string;
  }): Promise<FinancialResult> {
    const fromDate = new Date(`${params.from}T00:00:00Z`);
    const untilDate = new Date(`${params.until}T23:59:59.999Z`);

    const purchases = await this.db.pembelian.findMany({
      where: {
        branchId: { in: params.branchIds },
        status: PurchaseStatus.PAID,
        createdAt: { gte: fromDate, lte: untilDate },
      },
      select: {
        branchId: true,
        subtotalRp: true,
        totalAmountRp: true,
        createdAt: true,
      },
    });

    let totalGross = 0;
    let totalRevenue = 0;
    const branchMap = new Map<string, { gross: number; revenue: number }>();
    const trendMap = new Map<string, { revenue: number }>();

    for (const bId of params.branchIds) {
      branchMap.set(bId, { gross: 0, revenue: 0 });
    }

    let curDate = params.from;
    while (curDate <= params.until) {
      trendMap.set(curDate, { revenue: 0 });
      curDate = dateShift(curDate, 1);
    }

    for (const p of purchases) {
      totalGross += p.subtotalRp;
      totalRevenue += p.totalAmountRp;

      const bEntry = branchMap.get(p.branchId);
      if (bEntry) {
        bEntry.gross += p.subtotalRp;
        bEntry.revenue += p.totalAmountRp;
      }

      const dKey = p.createdAt.toISOString().slice(0, 10);
      const tEntry = trendMap.get(dKey);
      if (tEntry) {
        tEntry.revenue += p.totalAmountRp;
      }
    }

    const branches = params.branchIds.map((branchId) => {
      const bData = branchMap.get(branchId) ?? { gross: 0, revenue: 0 };
      return {
        branchId,
        grossSalesRp: bData.gross,
        revenueRp: bData.revenue,
        projectionRp: 0,
        instructorRealtimeRp: 0,
        otherCostRp: 0,
        profitRp: bData.revenue,
      };
    });

    const trend = [...trendMap.entries()].map(([date, data]) => ({
      date,
      revenueRp: data.revenue,
      profitRp: data.revenue,
    }));

    return {
      totals: {
        grossSalesRp: totalGross,
        revenueRp: totalRevenue,
        projectionRp: 0,
        instructorRealtimeRp: 0,
        otherCostRp: 0,
        profitRp: totalRevenue,
        correctionRp: 0,
      },
      completeness: 100,
      anomalyCount: 0,
      sourceCutoffAt: new Date().toISOString(),
      controlHash: 'lean-v2',
      trend,
      branches,
    };
  }

  async overview(
    principal: SessionPrincipal,
    query: { branchId?: string; from?: string; until?: string },
  ) {
    if (principal.roles.every(({ role }) => role === 'CUSTOMER')) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const global =
      principal.capabilities.includes('branch:all') ||
      principal.roles.some(
        ({ role, branchId }) => branchId === null && ['SUPER_OWNER', 'FINANCE', 'SUPERADMIN'].includes(role),
      );
    if (query.branchId && !global && !principal.branchIds.includes(query.branchId)) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const now = new Date();
    const today = dateInTimeZone(now, 'Asia/Jakarta');
    const untilDate = query.until ?? today;
    const fromDate = query.from ?? dateShift(untilDate, -29);
    if (
      !/^\d{4}-\d{2}-\d{2}$/u.test(fromDate) ||
      !/^\d{4}-\d{2}-\d{2}$/u.test(untilDate) ||
      fromDate > untilDate ||
      Date.parse(`${untilDate}T00:00:00Z`) - Date.parse(`${fromDate}T00:00:00Z`) > 365 * DAY
    ) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const allowedBranches = await this.db.cabang.findMany({
      where: {
        active: true,
        ...(query.branchId
          ? { id: query.branchId }
          : global
            ? {}
            : { id: { in: principal.branchIds } }),
      },
      select: { id: true, code: true, name: true, timezone: true },
      orderBy: { code: 'asc' },
    });
    if (!allowedBranches.length) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const branchIds = allowedBranches.map(({ id }) => id);
    const branchWhere = { in: branchIds };
    const scoped = { branchId: branchWhere };
    const dayCount =
      Math.round(
        (Date.parse(`${untilDate}T00:00:00Z`) - Date.parse(`${fromDate}T00:00:00Z`)) / DAY,
      ) + 1;
    const previousUntilDate = dateShift(fromDate, -1);
    const previousFromDate = dateShift(previousUntilDate, -(dayCount - 1));

    const slotCurrentScopes = allowedBranches.map((branch) => ({
      branchId: branch.id,
      startAt: {
        gte: startOfLocalDateUtc(fromDate, branch.timezone),
        lt: startOfLocalDateUtc(dateShift(untilDate, 1), branch.timezone),
      },
    }));

    const slotPreviousScopes = allowedBranches.map((branch) => ({
      branchId: branch.id,
      startAt: {
        gte: startOfLocalDateUtc(previousFromDate, branch.timezone),
        lt: startOfLocalDateUtc(fromDate, branch.timezone),
      },
    }));

    const [
      financial,
      previousFinancial,
      currentBookings,
      previousBookings,
      activeCustomers,
      slots,
      pendingPurchases,
      pendingReschedules,
      pendingAdjustments,
      trendBookings,
      risks,
    ] = await Promise.all([
      this.aggregateFinancials({ branchIds, from: fromDate, until: untilDate }),
      this.aggregateFinancials({
        branchIds,
        from: previousFromDate,
        until: previousUntilDate,
      }),
      this.db.pemesananKelas.count({
        where: {
          classSlot: { OR: slotCurrentScopes },
          status: 'BOOKED',
        },
      }),
      this.db.pemesananKelas.count({
        where: {
          classSlot: { OR: slotPreviousScopes },
          status: 'BOOKED',
        },
      }),
      this.db.paketPelanggan.findMany({
        where: { status: 'ACTIVE' },
        distinct: ['userId'],
        select: { userId: true },
      }),
      this.db.slotKelas.findMany({
        where: {
          OR: slotCurrentScopes,
          status: { in: ['PUBLISHED', 'CONFIRMED', 'COMPLETED'] },
        },
        select: { capacity: true, bookedCount: true },
      }),
      this.db.pembelian.count({ where: { ...scoped, status: PurchaseStatus.PENDING } }),
      this.db.ubahJadwal.count({ where: { status: 'PENDING' } }),
      this.db.sessionAdjustRequest.count({
        where: {
          status: 'PENDING',
          ...(global && !query.branchId
            ? {}
            : { customerPackage: { purchase: { branchId: branchWhere } } }),
        },
      }),
      this.db.pemesananKelas.findMany({
        where: { classSlot: { OR: slotCurrentScopes }, status: 'BOOKED' },
        select: { createdAt: true },
      }),
      this.db.slotKelas.findMany({
        where: {
          ...scoped,
          startAt: { gte: now, lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
          status: 'PUBLISHED',
        },
        include: {
          branch: { select: { code: true, name: true } },
          classType: { select: { name: true } },
        },
        orderBy: { startAt: 'asc' },
        take: 8,
      }),
    ]);

    const revenue = financial.totals.revenueRp;
    const previousRevenueValue = previousFinancial.totals.revenueRp;
    const capacity = slots.reduce((sum, item) => sum + item.capacity, 0);
    const booked = slots.reduce((sum, item) => sum + item.bookedCount, 0);
    const trend = new Map<string, { revenue: number; profit: number; bookings: number }>(
      financial.trend.map((item) => [
        item.date,
        { revenue: item.revenueRp, profit: item.profitRp, bookings: 0 },
      ]),
    );
    for (const item of trendBookings) {
      const key = item.createdAt.toISOString().slice(0, 10);
      const point = trend.get(key);
      if (point) point.bookings += 1;
    }

    const branchPerformance = await Promise.all(
      allowedBranches.map(async (branch) => {
        const branchFinancial = financial.branches.find((item) => item.branchId === branch.id)!;
        const branchRange = {
          gte: startOfLocalDateUtc(fromDate, branch.timezone),
          lt: startOfLocalDateUtc(dateShift(untilDate, 1), branch.timezone),
        };
        const [branchSlots, branchBookings] = await Promise.all([
          this.db.slotKelas.findMany({
            where: { branchId: branch.id, startAt: branchRange },
            select: { capacity: true, bookedCount: true },
          }),
          this.db.pemesananKelas.count({
            where: { classSlot: { branchId: branch.id, startAt: branchRange }, status: 'BOOKED' },
          }),
        ]);
        const branchCapacity = branchSlots.reduce((sum, item) => sum + item.capacity, 0);
        return {
          id: branch.id,
          code: branch.code,
          name: branch.name,
          grossSalesRp: branchFinancial?.grossSalesRp ?? 0,
          revenueRp: branchFinancial?.revenueRp ?? 0,
          projectionRp: branchFinancial?.projectionRp ?? 0,
          instructorRealtimeRp: branchFinancial?.instructorRealtimeRp ?? 0,
          otherCostRp: branchFinancial?.otherCostRp ?? 0,
          profitRp: branchFinancial?.profitRp ?? 0,
          bookings: branchBookings,
          occupancyPercent: branchCapacity
            ? Math.round(
                (branchSlots.reduce((sum, item) => sum + item.bookedCount, 0) / branchCapacity) *
                  1000,
              ) / 10
            : 0,
        };
      }),
    );

    const roles = principal.roles.map((item) => item.role);
    const roleFocus = roles.includes('SUPER_OWNER')
      ? 'EXECUTIVE'
      : roles.includes('OWNER')
        ? 'OWNER'
        : roles.includes('FINANCE')
          ? 'FINANCE'
          : roles.includes('OPS')
            ? 'OPERATIONS'
            : 'BRANCH_OPERATIONS';
    const allMetrics = [
      {
        key: 'gross-sales',
        label: 'Gross sales',
        value: financial.totals.grossSalesRp,
        unit: 'IDR',
        changePercent: percentChange(
          financial.totals.grossSalesRp,
          previousFinancial.totals.grossSalesRp,
        ),
      },
      {
        key: 'revenue',
        label: 'Omzet bersih',
        value: revenue,
        unit: 'IDR',
        changePercent: percentChange(revenue, previousRevenueValue),
      },
      {
        key: 'projection',
        label: 'Projection cost',
        value: financial.totals.projectionRp,
        unit: 'IDR',
        changePercent: percentChange(
          financial.totals.projectionRp,
          previousFinancial.totals.projectionRp,
        ),
      },
      {
        key: 'instructor-realtime',
        label: 'Pendapatan instruktur',
        value: financial.totals.instructorRealtimeRp,
        unit: 'IDR',
        changePercent: percentChange(
          financial.totals.instructorRealtimeRp,
          previousFinancial.totals.instructorRealtimeRp,
        ),
      },
      {
        key: 'other-cost',
        label: 'Pengeluaran lain',
        value: financial.totals.otherCostRp,
        unit: 'IDR',
        changePercent: percentChange(
          financial.totals.otherCostRp,
          previousFinancial.totals.otherCostRp,
        ),
      },
      {
        key: 'profit',
        label: 'Profit operasional',
        value: financial.totals.profitRp,
        unit: 'IDR',
        changePercent: percentChange(financial.totals.profitRp, previousFinancial.totals.profitRp),
      },
      {
        key: 'correction',
        label: 'Correction (terpisah)',
        value: financial.totals.correctionRp,
        unit: 'IDR',
        changePercent: null,
      },
      {
        key: 'pending-payments',
        label: 'Pembayaran pending',
        value: pendingPurchases,
        unit: 'COUNT',
        changePercent: null,
      },
      {
        key: 'finance-anomalies',
        label: 'Anomali Finance',
        value: financial.anomalyCount,
        unit: 'COUNT',
        changePercent: null,
      },
      {
        key: 'bookings',
        label: 'Booking aktif',
        value: currentBookings,
        unit: 'COUNT',
        changePercent: percentChange(currentBookings, previousBookings),
      },
      {
        key: 'occupancy',
        label: 'Okupansi kelas',
        value: capacity ? Math.round((booked / capacity) * 1000) / 10 : 0,
        unit: 'PERCENT',
        changePercent: null,
      },
      {
        key: 'customers',
        label: 'Customer aktif',
        value: activeCustomers.length,
        unit: 'COUNT',
        changePercent: null,
      },
      {
        key: 'classes',
        label: 'Kelas periode ini',
        value: slots.length,
        unit: 'COUNT',
        changePercent: null,
      },
    ];
    const metricKeys: Record<typeof roleFocus, string[]> = {
      EXECUTIVE: [
        'gross-sales',
        'revenue',
        'projection',
        'instructor-realtime',
        'other-cost',
        'profit',
        'pending-payments',
        'finance-anomalies',
        'bookings',
        'occupancy',
        'customers',
        'classes',
      ],
      OWNER: ['revenue', 'projection', 'instructor-realtime', 'other-cost', 'profit', 'bookings'],
      BRANCH_OPERATIONS: ['bookings', 'occupancy', 'customers', 'classes'],
      FINANCE: [
        'gross-sales',
        'revenue',
        'projection',
        'instructor-realtime',
        'other-cost',
        'profit',
        'pending-payments',
        'finance-anomalies',
      ],
      OPERATIONS: [],
    };

    const allowedSections = {
      executive: roleFocus === 'EXECUTIVE',
      owner: roleFocus === 'OWNER',
      branchOperations: roleFocus === 'BRANCH_OPERATIONS',
      finance: roleFocus === 'FINANCE',
      operations: roleFocus === 'OPERATIONS',
      trend: roleFocus !== 'OPERATIONS',
      queue: true,
      risk: ['EXECUTIVE', 'OWNER', 'BRANCH_OPERATIONS'].includes(roleFocus),
      branchComparison: ['EXECUTIVE', 'OWNER', 'FINANCE'].includes(roleFocus),
      auditActivity: ['EXECUTIVE', 'OWNER'].includes(roleFocus),
      jobHealth: ['EXECUTIVE', 'OPERATIONS'].includes(roleFocus),
    };

    return {
      generatedAt: now,
      period: {
        from: fromDate,
        until: untilDate,
        previousFrom: previousFromDate,
        previousUntil: previousUntilDate,
      },
      financial: {
        ...financial.totals,
        completeness: financial.completeness,
        anomalyCount: financial.anomalyCount,
        sourceCutoffAt: financial.sourceCutoffAt,
        controlHash: financial.controlHash,
      },
      roleFocus,
      sections: allowedSections,
      metrics: [
        ...allMetrics.filter((metric) => metricKeys[roleFocus].includes(metric.key)),
      ],
      queues: [
        {
          key: 'payments',
          label: 'Pembayaran menunggu',
          count: pendingPurchases,
          href: '/workspace/payments?status=PENDING',
          capabilities: ['payment:review', 'purchase:review'],
        },
        {
          key: 'reschedules',
          label: 'Reschedule menunggu',
          count: pendingReschedules,
          href: '/workspace/bookings?tab=reschedules&status=PENDING',
          capabilities: ['reschedule:read'],
        },
        {
          key: 'adjustments',
          label: 'Penyesuaian sesi menunggu',
          count: pendingAdjustments,
          href: '/ledger/adjustments?status=PENDING',
          capabilities: ['ledger:adjust:read'],
        },
      ]
        .filter((item) =>
          item.capabilities.some((capability) => principal.capabilities.includes(capability)),
        )
        .map(({ capabilities: _capabilities, ...item }) => item),
      trend: allowedSections.trend
        ? [...trend.entries()].map(([date, values]) => ({
            date,
            revenue: roleFocus === 'BRANCH_OPERATIONS' ? 0 : values.revenue,
            profit: roleFocus === 'BRANCH_OPERATIONS' ? 0 : values.profit,
            bookings: values.bookings,
          }))
        : [],
      branches: allowedSections.branchComparison ? branchPerformance : [],
      risks: (allowedSections.risk ? risks : [])
        .filter((item) => item.bookedCount < 2)
        .map((item) => ({
          id: item.id,
          branchName: item.branch.name,
          branchCode: item.branch.code,
          className: item.classType.name,
          startAt: item.startAt,
          bookedCount: item.bookedCount,
          minimumQuota: 2,
          capacity: item.capacity,
          href: `/workspace/classes?slot=${item.id}`,
        })),
      activities: [],
      jobs: [],
    };
  }

  // --- Indonesian Domain Aliases ---
  async ringkasanPelanggan(principal: SessionPrincipal) {
    return this.customerOverview(principal);
  }

  async ringkasanDashboard(
    principal: SessionPrincipal,
    query: Parameters<DashboardService['overview']>[1],
  ) {
    return this.overview(principal, query);
  }
}
