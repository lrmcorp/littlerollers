import { HttpStatus, Injectable } from '@nestjs/common';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';
import { PrismaService } from '../database/prisma.service';

const DAY = 86_400_000;

function parseBoundary(value: string | undefined, fallback: Date, end = false) {
  if (!value) return fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  const date = new Date(`${value}T${end ? '23:59:59.999' : '00:00:00.000'}Z`);
  if (Number.isNaN(date.getTime()))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  return date;
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

@Injectable()
export class DashboardService {
  constructor(private readonly db: PrismaService) {}

  async customerOverview(principal: SessionPrincipal) {
    if (!principal.roles.some(({ role }) => role === 'CUSTOMER'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const now = new Date();
    const [upcomingBookings, packages, actionableOrders, documents, unreadNotifications] =
      await Promise.all([
        this.db.booking.findMany({
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
        this.db.customerPackage.findMany({
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
        this.db.purchase.findMany({
          where: {
            userId: principal.userId,
            status: { in: ['AWAITING_PAYMENT', 'ACTION_REQUIRED', 'PENDING'] },
          },
          include: { branch: { select: { name: true } } },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        }),
        this.db.identityVerificationDocument.findMany({
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
    const global = principal.capabilities.some((item) =>
      ['branch:all', 'finance:read', 'operations:read'].includes(item),
    );
    if (query.branchId && !global && !principal.branchIds.includes(query.branchId)) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const now = new Date();
    const until = parseBoundary(query.until, now, true);
    const from = parseBoundary(query.from, new Date(until.getTime() - 29 * DAY));
    if (from >= until || until.getTime() - from.getTime() > 366 * DAY) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const span = until.getTime() - from.getTime();
    const previousFrom = new Date(from.getTime() - span);
    const branchIds = query.branchId ? [query.branchId] : global ? undefined : principal.branchIds;
    const branchWhere = branchIds ? { in: branchIds } : undefined;
    const scoped = branchWhere ? { branchId: branchWhere } : {};
    const currentRange = { gte: from, lte: until };
    const previousRange = { gte: previousFrom, lt: from };

    const [
      currentRevenue,
      previousRevenue,
      currentBookings,
      previousBookings,
      activeCustomers,
      slots,
      pendingPurchases,
      pendingVerifications,
      pendingReschedules,
      pendingAdjustments,
      failedJobs,
      branches,
      trendPurchases,
      trendBookings,
      risks,
      activities,
      jobs,
    ] = await Promise.all([
      this.db.purchase.aggregate({
        where: { ...scoped, status: 'APPROVED', decidedAt: currentRange },
        _sum: { priceRpSnapshot: true },
      }),
      this.db.purchase.aggregate({
        where: { ...scoped, status: 'APPROVED', decidedAt: previousRange },
        _sum: { priceRpSnapshot: true },
      }),
      this.db.booking.count({ where: { ...scoped, createdAt: currentRange, status: 'BOOKED' } }),
      this.db.booking.count({ where: { ...scoped, createdAt: previousRange, status: 'BOOKED' } }),
      this.db.customerPackage.findMany({
        where: { ...scoped, status: 'ACTIVE' },
        distinct: ['customerUserId'],
        select: { customerUserId: true },
      }),
      this.db.classSlot.findMany({
        where: {
          ...scoped,
          startAt: currentRange,
          status: { in: ['PUBLISHED', 'CONFIRMED', 'COMPLETED'] },
        },
        select: { capacity: true, bookedCount: true },
      }),
      this.db.purchase.count({ where: { ...scoped, status: 'PENDING' } }),
      this.db.identityVerificationDocument.count({ where: { status: 'PENDING', deletedAt: null } }),
      this.db.reschedule.count({ where: { ...scoped, status: 'PENDING' } }),
      this.db.sessionAdjustment.count({
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
      this.db.branch.findMany({
        where: { active: true, ...(branchIds ? { id: branchWhere } : {}) },
        select: { id: true, code: true, name: true },
      }),
      this.db.purchase.findMany({
        where: { ...scoped, status: 'APPROVED', decidedAt: currentRange },
        select: { decidedAt: true, priceRpSnapshot: true },
      }),
      this.db.booking.findMany({
        where: { ...scoped, createdAt: currentRange, status: 'BOOKED' },
        select: { createdAt: true },
      }),
      this.db.classSlot.findMany({
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

    const revenue = currentRevenue._sum.priceRpSnapshot ?? 0;
    const previousRevenueValue = previousRevenue._sum.priceRpSnapshot ?? 0;
    const capacity = slots.reduce((sum, item) => sum + item.capacity, 0);
    const booked = slots.reduce((sum, item) => sum + item.bookedCount, 0);
    const trend = new Map<string, { revenue: number; bookings: number }>();
    for (let cursor = new Date(from); cursor <= until; cursor = new Date(cursor.getTime() + DAY))
      trend.set(cursor.toISOString().slice(0, 10), { revenue: 0, bookings: 0 });
    for (const item of trendPurchases)
      if (item.decidedAt) {
        const key = item.decidedAt.toISOString().slice(0, 10);
        const point = trend.get(key);
        if (point) point.revenue += item.priceRpSnapshot;
      }
    for (const item of trendBookings) {
      const key = item.createdAt.toISOString().slice(0, 10);
      const point = trend.get(key);
      if (point) point.bookings += 1;
    }

    const branchPerformance = await Promise.all(
      branches.map(async (branch) => {
        const [branchRevenue, branchSlots, branchBookings] = await Promise.all([
          this.db.purchase.aggregate({
            where: { branchId: branch.id, status: 'APPROVED', decidedAt: currentRange },
            _sum: { priceRpSnapshot: true },
          }),
          this.db.classSlot.findMany({
            where: { branchId: branch.id, startAt: currentRange },
            select: { capacity: true, bookedCount: true },
          }),
          this.db.booking.count({
            where: { branchId: branch.id, createdAt: currentRange, status: 'BOOKED' },
          }),
        ]);
        const branchCapacity = branchSlots.reduce((sum, item) => sum + item.capacity, 0);
        return {
          ...branch,
          revenueRp: branchRevenue._sum.priceRpSnapshot ?? 0,
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
        key: 'revenue',
        label: 'Pendapatan disetujui',
        value: revenue,
        unit: 'IDR',
        changePercent: percentChange(revenue, previousRevenueValue),
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
      EXECUTIVE: ['revenue', 'bookings', 'occupancy', 'customers', 'classes'],
      OWNER: ['revenue', 'bookings', 'occupancy', 'customers', 'classes'],
      BRANCH_OPERATIONS: ['bookings', 'occupancy', 'customers', 'classes'],
      FINANCE: ['revenue', 'bookings'],
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
      period: { from, until, previousFrom, previousUntil: from },
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
                      key: 'pending-payments',
                      label: 'Pembayaran pending',
                      value: pendingPurchases,
                      unit: 'COUNT',
                      changePercent: null,
                    },
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
}
