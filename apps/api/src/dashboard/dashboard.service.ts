import { HttpStatus, Injectable } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';
import { PrismaService } from '../database/prisma.service';
import { dateInTimeZone, startOfLocalDateUtc } from '../identity/assignment-boundary';
import { FinancialAggregationService } from '../finance/agregasi-keuangan.service';

const DAY = 86_400_000;

const dateShift = (date: string, days: number) =>
  new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  // If baseline is tiny (e.g. negligible rounding difference or < 1000 IDR), baseline is too small for meaningful percentage
  if (Math.abs(previous) < 1000 && Math.abs(current) > 10000) return null;
  if (previous < 0 && current > 0) return null;
  const change = Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
  if (Math.abs(change) > 500) return null; // Avoid absurd percentages like +1414384.1%
  return change;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly db: PrismaService,
    private readonly financialAggregation: FinancialAggregationService,
  ) {}

  async customerOverview(principal: SessionPrincipal) {
    if (!principal.roles.some(({ role }) => role === 'CUSTOMER'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const now = new Date();
    const [upcomingBookings, packages, actionableOrders, documents, unreadNotifications] =
      await Promise.all([
        this.db.pemesananKelas.findMany({
          where: {
            customerUserId: principal.userId,
            status: 'BOOKED',
            classSlot: { startAt: { gte: now } },
          },
          include: {
            branch: { select: { id: true, name: true, timezone: true } },
            classSlot: {
              include: { classType: { select: { id: true, name: true } } },
            },
          },
          orderBy: { classSlot: { startAt: 'asc' } },
          take: 3,
        }),
        this.db.paketPelanggan.findMany({
          where: { customerUserId: principal.userId, status: 'ACTIVE', expiryAt: { gt: now } },
          include: {
            branch: { select: { id: true, name: true } },
            package: { select: { name: true } },
            classType: { select: { name: true } },
            ledgerEntries: { select: { quantity: true } },
            reservations: { where: { status: 'ACTIVE' }, select: { quantity: true } },
          },
          orderBy: { expiryAt: 'asc' },
          take: 6,
        }),
        this.db.pembelian.findMany({
          where: {
            userId: principal.userId,
            status: { in: ['AWAITING_PAYMENT', 'ACTION_REQUIRED', 'PENDING'] },
          },
          include: { branch: { select: { name: true } } },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        }),
        this.db.dokumenVerifikasiIdentitas.findMany({
          where: { userId: principal.userId, replacedById: null },
          select: { kind: true, status: true, updatedAt: true },
        }),
        this.db.userNotification.count({
          where: {
            userId: principal.userId,
            readAt: null,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        }),
      ]);
    return {
      generatedAt: now,
      upcomingBookings: upcomingBookings.map((booking) => ({
        id: booking.id,
        status: booking.status,
        className: booking.classSlot.classType.name,
        branchName: booking.branch.name,
        timezone: booking.branch.timezone,
        startAt: booking.classSlot.startAt,
        endAt: booking.classSlot.endAt,
      })),
      packages: packages.map((item) => ({
        id: item.id,
        packageName: item.package.name,
        classTypeName: item.classType.name,
        branchName: item.branch.name,
        expiryAt: item.expiryAt,
        available:
          item.ledgerEntries.reduce((sum, entry) => sum + entry.quantity, 0) -
          item.reservations.reduce((sum, reservation) => sum + reservation.quantity, 0),
      })),
      actionableOrders: actionableOrders.map((order) => ({
        id: order.id,
        packageName: order.packageNameSnapshot,
        branchName: order.branch.name,
        status: order.status,
        payableAmountRp: order.payableAmountRpSnapshot ?? order.priceRpSnapshot,
        expiresAt: order.paymentExpiresAt,
      })),
      verification: {
        status: ['SELFIE', 'KTP_FRONT'].every((kind) =>
          documents.some((document) => document.kind === kind && document.status === 'APPROVED'),
        )
          ? 'APPROVED'
          : documents.some(({ status }) => status === 'REJECTED')
            ? 'ACTION_REQUIRED'
            : 'PENDING',
        documents,
      },
      unreadNotifications,
    };
  }

  async overview(
    principal: SessionPrincipal,
    query: { branchId?: string; from?: string; until?: string },
  ) {
    if (principal.roles.every(({ role }) => role === 'CUSTOMER' || role === 'INSTRUCTOR')) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const global =
      principal.capabilities.includes('branch:all') ||
      principal.roles.some(
        ({ role, branchId }) => branchId === null && ['SUPER_OWNER', 'FINANCE'].includes(role),
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
    const scoped = branchWhere ? { branchId: branchWhere } : {};
    const dayCount =
      Math.round(
        (Date.parse(`${untilDate}T00:00:00Z`) - Date.parse(`${fromDate}T00:00:00Z`)) / DAY,
      ) + 1;
    const previousUntilDate = dateShift(fromDate, -1);
    const previousFromDate = dateShift(previousUntilDate, -(dayCount - 1));
    const bookingCurrentScopes = allowedBranches.map((branch) => ({
      branchId: branch.id,
      createdAt: {
        gte: startOfLocalDateUtc(fromDate, branch.timezone),
        lt: startOfLocalDateUtc(dateShift(untilDate, 1), branch.timezone),
      },
    }));
    const bookingPreviousScopes = allowedBranches.map((branch) => ({
      branchId: branch.id,
      createdAt: {
        gte: startOfLocalDateUtc(previousFromDate, branch.timezone),
        lt: startOfLocalDateUtc(fromDate, branch.timezone),
      },
    }));
    const slotCurrentScopes = allowedBranches.map((branch) => ({
      branchId: branch.id,
      startAt: {
        gte: startOfLocalDateUtc(fromDate, branch.timezone),
        lt: startOfLocalDateUtc(dateShift(untilDate, 1), branch.timezone),
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
      pendingVerifications,
      pendingReschedules,
      pendingAdjustments,
      failedJobs,
      trendBookings,
      risks,
      activities,
      jobs,
    ] = await Promise.all([
      this.financialAggregation.aggregate({ branchIds, from: fromDate, until: untilDate }),
      this.financialAggregation.aggregate({
        branchIds,
        from: previousFromDate,
        until: previousUntilDate,
      }),
      this.db.pemesananKelas.count({ where: { OR: bookingCurrentScopes, status: 'BOOKED' } }),
      this.db.pemesananKelas.count({
        where: {
          OR: bookingPreviousScopes,
          status: 'BOOKED',
        },
      }),
      this.db.paketPelanggan.findMany({
        where: { ...scoped, status: 'ACTIVE' },
        distinct: ['customerUserId'],
        select: { customerUserId: true },
      }),
      this.db.slotKelas.findMany({
        where: {
          OR: slotCurrentScopes,
          status: { in: ['PUBLISHED', 'CONFIRMED', 'COMPLETED'] },
        },
        select: { capacity: true, bookedCount: true },
      }),
      this.db.pembelian.count({ where: { ...scoped, status: 'PENDING' } }),
      this.db.dokumenVerifikasiIdentitas.count({ where: { status: 'PENDING', deletedAt: null } }),
      this.db.ubahJadwal.count({ where: { ...scoped, status: 'PENDING' } }),
      this.db.penyesuaianSesi.count({
        where: {
          status: 'PENDING',
          ...(branchWhere ? { customerPackage: { branchId: branchWhere } } : {}),
        },
      }),
      this.db.quotaEvaluationJob.count({
        where: {
          status: { in: ['FAILED', 'RETRYING'] },
          ...(branchWhere ? { classSlot: { branchId: branchWhere } } : {}),
        },
      }),
      this.db.pemesananKelas.findMany({
        where: { OR: bookingCurrentScopes, status: 'BOOKED' },
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
      this.db.auditLog.findMany({
        where: branchWhere ? { OR: [{ branchId: branchWhere }, { branchId: null }] } : {},
        orderBy: { occurredAt: 'desc' },
        take: 8,
        select: {
          id: true,
          occurredAt: true,
          action: true,
          objectType: true,
          branchId: true,
          actorId: true,
        },
      }),
      this.db.quotaEvaluationJob.findMany({
        where: { ...(branchWhere ? { classSlot: { branchId: branchWhere } } : {}) },
        orderBy: { updatedAt: 'desc' },
        take: 6,
        select: {
          id: true,
          status: true,
          dueAt: true,
          attempts: true,
          maxAttempts: true,
          lastErrorCode: true,
          nextAttemptAt: true,
          createdAt: true,
          version: true,
        },
      }),
    ]);

    const revenue = financial.totals.revenueRp;
    const previousRevenueValue = previousFinancial.totals.revenueRp;
    const capacity = slots.reduce((sum, item) => sum + item.capacity, 0);
    const booked = slots.reduce((sum, item) => sum + item.bookedCount, 0);
    const trend = new Map(
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
            where: { branchId: branch.id, createdAt: branchRange, status: 'BOOKED' },
          }),
        ]);
        const branchCapacity = branchSlots.reduce((sum, item) => sum + item.capacity, 0);
        return {
          id: branch.id,
          code: branch.code,
          name: branch.name,
          grossSalesRp: branchFinancial.grossSalesRp,
          revenueRp: branchFinancial.revenueRp,
          projectionRp: branchFinancial.projectionRp,
          instructorRealtimeRp: branchFinancial.instructorRealtimeRp,
          otherCostRp: branchFinancial.otherCostRp,
          profitRp: branchFinancial.profitRp,
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
    const mappedJobs = principal.capabilities.includes('operations:read')
      ? jobs.map((job) => ({
          id: job.id,
          type: 'H24_QUOTA_EVALUATION',
          status: job.status,
          attemptCount: job.attempts,
          maxAttempts: job.maxAttempts,
          progress: job.status === 'SUCCEEDED' ? 100 : 0,
          dueAt: job.dueAt,
          nextAttemptAt: job.nextAttemptAt,
          lastErrorCode: job.lastErrorCode,
          createdAt: job.createdAt,
          version: job.version,
        }))
      : [];
    const operationMetrics = [
      {
        key: 'jobs-attention',
        label: 'Job perlu perhatian',
        value: failedJobs,
        unit: 'COUNT',
        changePercent: null,
      },
      {
        key: 'jobs-succeeded',
        label: 'Job berhasil terbaru',
        value: mappedJobs.filter((job) => job.status === 'SUCCEEDED').length,
        unit: 'COUNT',
        changePercent: null,
      },
      {
        key: 'recovery-rate',
        label: 'Recovery rate',
        value: mappedJobs.length
          ? Math.round(
              (mappedJobs.filter((job) => job.status === 'SUCCEEDED').length / mappedJobs.length) *
                1000,
            ) / 10
          : 100,
        unit: 'PERCENT',
        changePercent: null,
      },
    ];
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
      metrics:
        roleFocus === 'OPERATIONS'
          ? operationMetrics
          : [
              ...allMetrics.filter((metric) => metricKeys[roleFocus].includes(metric.key)),
              ...(roleFocus === 'FINANCE'
                ? [
                    {
                      key: 'pending-adjustments',
                      label: 'Adjustment pending',
                      value: pendingAdjustments,
                      unit: 'COUNT',
                      changePercent: null,
                    },
                  ]
                : []),
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
          key: 'verifications',
          label: 'Verifikasi identitas',
          count: pendingVerifications,
          href: '/identity-verifications?status=PENDING',
          capabilities: ['identity-verification:read'],
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
          label: 'Adjustment menunggu',
          count: pendingAdjustments,
          href: '/ledger/adjustments?status=PENDING',
          capabilities: ['ledger:adjust:read'],
        },
        {
          key: 'jobs',
          label: 'Job perlu perhatian',
          count: failedJobs,
          href: '/operations?status=FAILED',
          capabilities: ['operations:read'],
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
        .filter((item) => item.bookedCount < item.minimumQuota)
        .map((item) => ({
          id: item.id,
          branchName: item.branch.name,
          branchCode: item.branch.code,
          className: item.classType.name,
          startAt: item.startAt,
          bookedCount: item.bookedCount,
          minimumQuota: item.minimumQuota,
          capacity: item.capacity,
          href: `/workspace/classes?slot=${item.id}`,
        })),
      activities: allowedSections.auditActivity ? activities : [],
      jobs: allowedSections.jobHealth ? mappedJobs : [],
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
