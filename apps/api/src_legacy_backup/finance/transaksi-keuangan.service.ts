import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { FinancialAggregationService } from './agregasi-keuangan.service';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/u;
const PAGE_SIZE = 20;
type Tx = Prisma.TransactionClient;

function periodRange(period: string) {
  if (!PERIOD.test(period))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  const [year, month] = period.split('-').map(Number) as [number, number];
  return {
    from: new Date(Date.UTC(year, month - 1, 1)),
    until: new Date(Date.UTC(year, month, 1)),
  };
}

function periodDates(period: string) {
  const { from, until } = periodRange(period);
  return {
    from: from.toISOString().slice(0, 10),
    until: new Date(until.getTime() - 86_400_000).toISOString().slice(0, 10),
  };
}

const money = (amountMinor: number) => ({ amountMinor, currency: 'IDR' as const });

@Injectable()
export class FinanceCommandService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly idempotency: IdempotencyService,
    private readonly aggregation: FinancialAggregationService,
  ) {}

  private authorize(principal: SessionPrincipal, branchId: string, capability: string) {
    this.policy.requireCapability(principal.capabilities, capability);
    if (
      !this.policy.hasCapability(principal, 'branch:all', branchId) &&
      !this.policy.hasCapability(principal, capability, branchId)
    )
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  private validateKey(key: string) {
    if (!key || key.length < 16 || key.length > 128)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  }

  private execute(
    scope: string,
    key: string,
    payload: unknown,
    status: number,
    action: (tx: Tx) => Promise<object>,
  ) {
    this.validateKey(key);
    return this.idempotency.execute(
      { scope, key, payload, ttlMs: 86_400_000, leaseMs: 30_000 },
      async (tx) => ({
        status,
        body: (await action(tx)) as Prisma.InputJsonValue,
      }),
    );
  }

  async listOtherCosts(
    principal: SessionPrincipal,
    query: { branchId: string; period: string; cursor?: string },
  ) {
    this.authorize(principal, query.branchId, 'finance:read');
    periodRange(query.period);
    if (query.cursor && !UUID.test(query.cursor))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const rows = await this.db.biayaLain.findMany({
      where: { branchId: query.branchId, period: query.period },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });
    const items = rows.slice(0, PAGE_SIZE);
    return {
      items: items.map((item) => this.otherCostView(item)),
      page: {
        hasMore: rows.length > PAGE_SIZE,
        nextCursor: rows.length > PAGE_SIZE ? (items.at(-1)?.id ?? null) : null,
      },
    };
  }

  async listCorrections(
    principal: SessionPrincipal,
    query: {
      branchId: string;
      period?: string;
      status?: 'PENDING' | 'APPROVED' | 'POSTED' | 'REJECTED';
      q?: string;
      cursor?: string;
    },
  ) {
    this.authorize(principal, query.branchId, 'finance:read');
    if (query.period) periodRange(query.period);
    if (query.cursor && !UUID.test(query.cursor))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const rows = await this.db.koreksiKeuangan.findMany({
      where: {
        branchId: query.branchId,
        ...(query.period ? { currentPeriod: query.period } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.q?.trim()
          ? {
              OR: [
                { reason: { contains: query.q.trim() } },
                { referencePeriod: { contains: query.q.trim() } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });
    const items = rows.slice(0, PAGE_SIZE);
    return {
      items: items.map((item) => this.correctionView(item)),
      page: {
        hasMore: rows.length > PAGE_SIZE,
        nextCursor: rows.length > PAGE_SIZE ? (items.at(-1)?.id ?? null) : null,
      },
    };
  }

  createOtherCost(
    principal: SessionPrincipal,
    input: {
      branchId: string;
      period: string;
      occurredOn: string;
      categoryCode: string;
      description: string;
      reason: string;
      amountRp: number;
      evidenceUploadId?: string;
    },
    key: string,
    correlationId: string,
  ) {
    this.authorize(principal, input.branchId, 'finance:manage');
    periodRange(input.period);
    const occurredOn = new Date(`${input.occurredOn}T00:00:00.000Z`);
    if (
      !UUID.test(input.branchId) ||
      !/^\d{4}-\d{2}-\d{2}$/u.test(input.occurredOn) ||
      Number.isNaN(occurredOn.getTime()) ||
      input.occurredOn.slice(0, 7) !== input.period ||
      !/^[A-Z][A-Z0-9_]{1,63}$/u.test(input.categoryCode) ||
      !Number.isSafeInteger(input.amountRp) ||
      input.amountRp < 1 ||
      input.description?.trim().length < 1 ||
      input.description.trim().length > 300 ||
      input.reason?.trim().length < 3 ||
      input.reason.trim().length > 500 ||
      (input.evidenceUploadId && !UUID.test(input.evidenceUploadId))
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.execute(
      `finance:other-cost:create:${input.branchId}`,
      key,
      input,
      HttpStatus.CREATED,
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`Cabang\` WHERE \`id\` = ${input.branchId} FOR UPDATE`;
        await this.requireOpenPeriod(tx, input.branchId, input.period);
        const item = await tx.biayaLain.create({
          data: {
            branchId: input.branchId,
            period: input.period,
            occurredOn,
            categoryCode: input.categoryCode,
            description: input.description.trim(),
            reason: input.reason.trim(),
            amountRp: input.amountRp,
            evidenceUploadId: input.evidenceUploadId,
            createdById: principal.userId,
          },
        });
        await this.audit(
          tx,
          principal,
          input.branchId,
          'finance.other_cost.created',
          item.id,
          {
            period: input.period,
            amountRp: input.amountRp,
          },
          correlationId,
        );
        return this.otherCostView(item);
      },
    );
  }

  async listPeriods(principal: SessionPrincipal, branchId: string, cursor?: string) {
    this.authorize(principal, branchId, 'finance:read');
    if (!UUID.test(branchId) || (cursor && !UUID.test(cursor)))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const rows = await this.db.periodeKeuangan.findMany({
      where: { branchId },
      orderBy: [{ period: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const items = rows.slice(0, PAGE_SIZE);
    return {
      items,
      page: {
        hasMore: rows.length > PAGE_SIZE,
        nextCursor: rows.length > PAGE_SIZE ? (items.at(-1)?.id ?? null) : null,
      },
    };
  }

  closeMonth(
    principal: SessionPrincipal,
    input: {
      branchId: string;
      period: string;
      controlHash: string;
      reason: string;
      expectedVersion: number;
    },
    key: string,
    correlationId: string,
    now = new Date(),
  ) {
    this.authorize(principal, input.branchId, 'finance:manage');
    periodRange(input.period);
    if (
      !UUID.test(input.branchId) ||
      !/^[a-f0-9]{64}$/iu.test(input.controlHash) ||
      !Number.isInteger(input.expectedVersion) ||
      input.expectedVersion < 0 ||
      input.reason?.trim().length < 3 ||
      input.reason.trim().length > 500
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.execute(
      `finance:period:close:${input.branchId}:${input.period}`,
      key,
      input,
      HttpStatus.CREATED,
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`Cabang\` WHERE \`id\` = ${input.branchId} FOR UPDATE`;
        const dates = periodDates(input.period);
        const aggregate = await this.aggregation.aggregate({
          branchIds: [input.branchId],
          ...dates,
          strict: true,
          db: tx,
        });
        if (aggregate.controlHash !== input.controlHash)
          throw new ApiProblem('FINANCE_CONTROL_MISMATCH', HttpStatus.CONFLICT);
        let period = await tx.periodeKeuangan.findUnique({
          where: { branchId_period: { branchId: input.branchId, period: input.period } },
        });
        if (!period) {
          if (input.expectedVersion !== 0)
            throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
          period = await tx.periodeKeuangan.create({
            data: {
              branchId: input.branchId,
              period: input.period,
              controlHash: aggregate.controlHash,
            },
          });
        }
        if (period.version !== input.expectedVersion)
          throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        if (period.status !== 'OPEN')
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        period = await tx.periodeKeuangan.update({
          where: { id: period.id },
          data: {
            status: 'CLOSED',
            controlHash: aggregate.controlHash,
            closedAt: now,
            closedById: principal.userId,
            version: { increment: 1 },
          },
        });
        const snapshot = await tx.snapshotTutupBukuKeuangan.create({
          data: {
            financePeriodId: period.id,
            branchId: input.branchId,
            period: input.period,
            grossSalesRp: aggregate.totals.grossSalesRp,
            packagePromotionDiscountRp: aggregate.totals.packagePromotionDiscountRp,
            voucherDiscountRp: aggregate.totals.voucherDiscountRp,
            revenueRp: aggregate.totals.revenueRp,
            projectionRp: aggregate.totals.projectionRp,
            instructorRealtimeRp: aggregate.totals.instructorRealtimeRp,
            otherCostRp: aggregate.totals.otherCostRp,
            correctionRp: aggregate.totals.correctionRp,
            profitRp: aggregate.totals.profitRp,
            sourceCutoffAt: aggregate.sourceCutoffAt,
            sourceVersion: aggregate.sourceVersion,
            controlHash: aggregate.controlHash,
          },
        });
        const auditLogId = await this.audit(
          tx,
          principal,
          input.branchId,
          'finance.period.closed',
          period.id,
          { period: input.period, controlHash: aggregate.controlHash, reasonPresent: true },
          correlationId,
        );
        return {
          period,
          snapshotIds: [snapshot.id],
          snapshot,
          auditLogId,
          closedAt: now.toISOString(),
        };
      },
    );
  }

  requestCorrection(
    principal: SessionPrincipal,
    input: {
      branchId: string;
      currentPeriod: string;
      referencePeriod: string;
      amountRp: number;
      reason: string;
    },
    key: string,
    correlationId: string,
  ) {
    this.authorize(principal, input.branchId, 'finance:manage');
    periodRange(input.currentPeriod);
    periodRange(input.referencePeriod);
    if (
      !UUID.test(input.branchId) ||
      !Number.isSafeInteger(input.amountRp) ||
      input.amountRp === 0 ||
      input.reason?.trim().length < 3 ||
      input.reason.trim().length > 500
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.execute(
      `finance:correction:request:${principal.userId}`,
      key,
      input,
      HttpStatus.CREATED,
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`Cabang\` WHERE \`id\` = ${input.branchId} FOR UPDATE`;
        await this.requireOpenPeriod(tx, input.branchId, input.currentPeriod);
        const correction = await tx.koreksiKeuangan.create({
          data: { ...input, reason: input.reason.trim(), requestedById: principal.userId },
        });
        await this.audit(
          tx,
          principal,
          input.branchId,
          'finance.correction.requested',
          correction.id,
          { currentPeriod: input.currentPeriod, amountRp: input.amountRp },
          correlationId,
        );
        return this.correctionView(correction);
      },
    );
  }

  decideCorrection(
    principal: SessionPrincipal,
    id: string,
    decision: string,
    input: { reason: string },
    key: string,
    correlationId: string,
    now = new Date(),
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:manage');
    if (
      !UUID.test(id) ||
      !['approve', 'reject'].includes(decision) ||
      input.reason?.trim().length < 3 ||
      input.reason.trim().length > 500
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.execute(
      `finance:correction:decide:${id}`,
      key,
      { decision, ...input },
      HttpStatus.OK,
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`KoreksiKeuangan\` WHERE \`id\` = ${id} FOR UPDATE`;
        const correction = await tx.koreksiKeuangan.findUnique({ where: { id } });
        if (!correction) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.authorize(principal, correction.branchId, 'finance:manage');
        if (correction.requestedById === principal.userId)
          throw new ApiProblem('SEPARATION_OF_DUTIES', HttpStatus.CONFLICT);
        if (correction.status !== 'PENDING')
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        await tx.$queryRaw`SELECT \`id\` FROM \`Cabang\` WHERE \`id\` = ${correction.branchId} FOR UPDATE`;
        await this.requireOpenPeriod(tx, correction.branchId, correction.currentPeriod);
        const approved = decision === 'approve';
        let journalReferenceId: string | null = null;
        if (approved) {
          const account = await tx.akunAkuntansi.findFirst({
            where: {
              branchId: correction.branchId,
              code: 'FINANCE_CORRECTION',
              active: true,
              historical: false,
            },
            select: { id: true },
          });
          if (!account)
            throw new ApiProblem('FINANCE_CONFIGURATION_INCOMPLETE', HttpStatus.CONFLICT);
          const journal = await tx.entriJurnal.create({
            data: {
              branchId: correction.branchId,
              accountId: account.id,
              actorUserId: principal.userId,
              referenceNumber: correction.id,
              description: `Finance correction ${correction.currentPeriod}`,
              debitRp: correction.amountRp > 0 ? correction.amountRp : 0,
              creditRp: correction.amountRp < 0 ? Math.abs(correction.amountRp) : 0,
              occurredAt: now,
              statusCode: 'POSTED_CORRECTION',
            },
          });
          journalReferenceId = journal.id;
        }
        const updated = await tx.koreksiKeuangan.update({
          where: { id },
          data: {
            status: approved ? 'POSTED' : 'REJECTED',
            decidedById: principal.userId,
            decisionReason: input.reason.trim(),
            decidedAt: now,
            postedAt: approved ? now : null,
            postingJournalId: journalReferenceId,
            version: { increment: 1 },
          },
        });
        const auditLogId = await this.audit(
          tx,
          principal,
          correction.branchId,
          approved ? 'finance.correction.posted' : 'finance.correction.rejected',
          id,
          { amountRp: correction.amountRp, reasonPresent: true },
          correlationId,
        );
        return {
          correction: this.correctionView(updated),
          journalReferenceId,
          auditLogId,
        };
      },
    );
  }

  async report(
    principal: SessionPrincipal,
    reportType: string,
    branchId: string,
    period: string,
    cursor?: string,
  ) {
    this.authorize(principal, branchId, 'finance:read');
    const allowed = ['revenue', 'instructor-realtime', 'projection', 'other-cost', 'profit'];
    if (!allowed.includes(reportType) || !UUID.test(branchId) || (cursor && !UUID.test(cursor)))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const aggregate = await this.aggregation.aggregate({
      branchIds: [branchId],
      ...periodDates(period),
    });
    const closedPeriod = await this.db.periodeKeuangan.findUnique({
      where: { branchId_period: { branchId, period } },
      include: { closeSnapshot: true },
    });
    if (closedPeriod?.status === 'CLOSED' && !closedPeriod.closeSnapshot)
      throw new ApiProblem('FINANCE_CONFIGURATION_INCOMPLETE', HttpStatus.CONFLICT);
    const closed = closedPeriod?.status === 'CLOSED' ? closedPeriod.closeSnapshot : null;
    const reportTotals = closed
      ? {
          grossSalesRp: closed.grossSalesRp,
          packagePromotionDiscountRp: closed.packagePromotionDiscountRp,
          voucherDiscountRp: closed.voucherDiscountRp,
          revenueRp: closed.revenueRp,
          projectionRp: closed.projectionRp,
          instructorRealtimeRp: closed.instructorRealtimeRp,
          otherCostRp: closed.otherCostRp,
          correctionRp: closed.correctionRp,
          profitRp: closed.profitRp,
        }
      : aggregate.totals;
    const instructorBreakdown = [
      ...aggregate.details.instructorCompensations
        .reduce((groups, item) => {
          const groupKey = `${item.instructorUserId}:${item.feeRpSnapshot}`;
          const existing = groups.get(groupKey);
          if (existing) {
            existing.matchedClassCount += 1;
            existing.amountRp += item.amountRp;
          } else {
            groups.set(groupKey, {
              id: item.id,
              branchId: item.branchId,
              instructorUserId: item.instructorUserId,
              feeRpSnapshot: item.feeRpSnapshot,
              matchedClassCount: 1,
              amountRp: item.amountRp,
            });
          }
          return groups;
        }, new Map<string, { id: string; branchId: string; instructorUserId: string; feeRpSnapshot: number; matchedClassCount: number; amountRp: number }>())
        .values(),
    ];
    const itemMap = {
      revenue: aggregate.details.purchases,
      projection: aggregate.details.purchases.map((item) => ({
        id: item.id,
        branchId: item.branchId,
        decidedAt: item.decidedAt,
        projectionRp: item.projectionRp,
      })),
      'instructor-realtime': instructorBreakdown,
      'other-cost': aggregate.details.otherCosts,
      profit: aggregate.branches,
    } as const;
    const allItems = itemMap[reportType as keyof typeof itemMap];
    const cursorIndex = cursor
      ? allItems.findIndex((item) => ('id' in item ? item.id : item.branchId) === cursor)
      : -1;
    if (cursor && cursorIndex < 0)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const pageItems = allItems.slice(cursorIndex + 1, cursorIndex + 1 + PAGE_SIZE);
    const hasMore = cursorIndex + 1 + pageItems.length < allItems.length;
    const last = pageItems.at(-1);
    return {
      report: {
        reportType: reportType.replaceAll('-', '_').toUpperCase(),
        branchId,
        period,
        generatedAt: new Date().toISOString(),
        sourceCutoffAt: closed?.sourceCutoffAt ?? aggregate.sourceCutoffAt,
        completeness: closed ? 'COMPLETE' : aggregate.completeness,
        anomalyCount: closed ? 0 : aggregate.anomalyCount,
        controlHash: closed?.controlHash ?? aggregate.controlHash,
        totals: {
          grossSales: money(reportTotals.grossSalesRp),
          packagePromotionDiscount: money(reportTotals.packagePromotionDiscountRp),
          voucherDiscount: money(reportTotals.voucherDiscountRp),
          revenue: money(reportTotals.revenueRp),
          projection: money(reportTotals.projectionRp),
          instructorRealtime: money(reportTotals.instructorRealtimeRp),
          otherCost: money(reportTotals.otherCostRp),
          correction: money(reportTotals.correctionRp),
          profit: money(reportTotals.profitRp),
        },
        sourceVersion: closed?.sourceVersion ?? aggregate.sourceVersion,
      },
      items: pageItems,
      page: {
        hasMore,
        nextCursor: hasMore && last ? ('id' in last ? last.id : last.branchId) : null,
      },
    };
  }

  async exportReport(
    principal: SessionPrincipal,
    input: { branchId?: string; from: string; until: string },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'finance:export');
    const global =
      principal.capabilities.includes('branch:all') ||
      principal.roles.some(
        ({ role, branchId }) => branchId === null && ['SUPER_OWNER', 'FINANCE'].includes(role),
      );
    if (input.branchId && !global && !principal.branchIds.includes(input.branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const branchIds = input.branchId
      ? [input.branchId]
      : global
        ? (
            await this.db.cabang.findMany({
              where: { active: true },
              select: { id: true },
              orderBy: { id: 'asc' },
            })
          ).map(({ id }) => id)
        : principal.branchIds;
    const aggregate = await this.aggregation.aggregate({
      branchIds,
      from: input.from,
      until: input.until,
      strict: true,
    });
    const rows = [
      [
        'branch_code',
        'branch_name',
        'gross_sales_rp',
        'revenue_rp',
        'projection_rp',
        'instructor_realtime_rp',
        'other_cost_rp',
        'profit_rp',
        'correction_rp',
      ],
      ...aggregate.branches.map((branch) => [
        branch.branchCode,
        branch.branchName,
        branch.grossSalesRp,
        branch.revenueRp,
        branch.projectionRp,
        branch.instructorRealtimeRp,
        branch.otherCostRp,
        branch.profitRp,
        branch.correctionRp,
      ]),
    ];
    const content = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const auditLogId = randomUUID();
    await this.db.auditLog.create({
      data: {
        id: auditLogId,
        actorType: 'USER',
        actorId: principal.userId,
        branchId: input.branchId,
        action: 'finance.report.exported',
        objectType: 'FinancialAggregation',
        objectId: aggregate.controlHash,
        afterMasked: {
          from: input.from,
          until: input.until,
          branchCount: branchIds.length,
          controlHash: aggregate.controlHash,
        },
        correlationId,
      },
    });
    return {
      fileName: `finance-authoritative-${input.from}-${input.until}.csv`,
      mimeType: 'text/csv;charset=utf-8',
      content,
      controlHash: aggregate.controlHash,
      sourceCutoffAt: aggregate.sourceCutoffAt,
      completeness: aggregate.completeness,
      auditLogId,
    };
  }

  private async requireOpenPeriod(tx: Tx, branchId: string, period: string) {
    const record = await tx.periodeKeuangan.findUnique({
      where: { branchId_period: { branchId, period } },
    });
    if (record?.status === 'CLOSED')
      throw new ApiProblem('FINANCE_PERIOD_CLOSED', HttpStatus.LOCKED);
  }

  private otherCostView(item: {
    id: string;
    branchId: string;
    period: string;
    description: string;
    categoryCode: string;
    occurredOn: Date;
    reason: string;
    amountRp: number;
    evidenceUploadId: string | null;
    status: string;
    version: number;
  }) {
    return { ...item, amount: money(item.amountRp) };
  }

  private correctionView(item: {
    id: string;
    branchId: string;
    currentPeriod: string;
    referencePeriod: string;
    amountRp: number;
    reason: string;
    requestedById: string;
    decidedById: string | null;
    status: string;
    version: number;
  }) {
    return {
      id: item.id,
      branchId: item.branchId,
      currentPeriod: item.currentPeriod,
      referencePeriod: item.referencePeriod,
      amount: money(item.amountRp),
      reason: item.reason,
      requestedBy: item.requestedById,
      decidedBy: item.decidedById,
      status: item.status,
      version: item.version,
    };
  }

  private async audit(
    tx: Tx,
    principal: SessionPrincipal,
    branchId: string,
    action: string,
    objectId: string,
    afterMasked: object,
    correlationId: string,
  ) {
    const id = randomUUID();
    await tx.auditLog.create({
      data: {
        id,
        actorType: 'USER',
        actorId: principal.userId,
        branchId,
        action,
        objectType: 'FinanceCommand',
        objectId,
        afterMasked: afterMasked as Prisma.InputJsonValue,
        correlationId,
      },
    });
    return id;
  }

  // --- Indonesian Domain Aliases ---
  async catatBiayaOperasional(
    principal: SessionPrincipal,
    input: Parameters<FinanceCommandService['createOtherCost']>[1],
    key: string,
    correlationId: string,
  ) {
    return this.createOtherCost(principal, input, key, correlationId);
  }

  async ajukanKoreksiKeuangan(
    principal: SessionPrincipal,
    input: Parameters<FinanceCommandService['requestCorrection']>[1],
    key: string,
    correlationId: string,
  ) {
    return this.requestCorrection(principal, input, key, correlationId);
  }

  async putuskanKoreksiKeuangan(
    principal: SessionPrincipal,
    id: string,
    decision: string,
    input: Parameters<FinanceCommandService['decideCorrection']>[3],
    key: string,
    correlationId: string,
    now = new Date(),
  ) {
    return this.decideCorrection(principal, id, decision, input, key, correlationId, now);
  }

  async tutupBukuPeriode(
    principal: SessionPrincipal,
    input: Parameters<FinanceCommandService['closeMonth']>[1],
    key: string,
    correlationId: string,
    now = new Date(),
  ) {
    return this.closeMonth(principal, input, key, correlationId, now);
  }

  async laporanKeuangan(
    principal: SessionPrincipal,
    reportType: string,
    branchId: string,
    period: string,
    cursor?: string,
  ) {
    return this.report(principal, reportType, branchId, period, cursor);
  }

  async eksporLaporanKeuangan(
    principal: SessionPrincipal,
    input: Parameters<FinanceCommandService['exportReport']>[1],
    correlationId: string,
  ) {
    return this.exportReport(principal, input, correlationId);
  }

  async daftarBiayaLain(
    principal: SessionPrincipal,
    query: Parameters<FinanceCommandService['listOtherCosts']>[1],
  ) {
    return this.listOtherCosts(principal, query);
  }

  async daftarKoreksi(
    principal: SessionPrincipal,
    query: Parameters<FinanceCommandService['listCorrections']>[1],
  ) {
    return this.listCorrections(principal, query);
  }

  async daftarPeriode(principal: SessionPrincipal, branchId: string, cursor?: string) {
    return this.listPeriods(principal, branchId, cursor);
  }
}
