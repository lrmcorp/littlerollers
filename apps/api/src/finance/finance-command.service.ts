import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';

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

const money = (amountMinor: number) => ({ amountMinor, currency: 'IDR' as const });

@Injectable()
export class FinanceCommandService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly idempotency: IdempotencyService,
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
    const rows = await this.db.otherCost.findMany({
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

  createOtherCost(
    principal: SessionPrincipal,
    input: {
      branchId: string;
      period: string;
      description: string;
      amountRp: number;
      evidenceUploadId?: string;
    },
    key: string,
    correlationId: string,
  ) {
    this.authorize(principal, input.branchId, 'finance:manage');
    periodRange(input.period);
    if (
      !UUID.test(input.branchId) ||
      !Number.isSafeInteger(input.amountRp) ||
      input.amountRp < 1 ||
      input.description?.trim().length < 1 ||
      input.description.trim().length > 300 ||
      (input.evidenceUploadId && !UUID.test(input.evidenceUploadId))
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.execute(
      `finance:other-cost:create:${input.branchId}`,
      key,
      input,
      HttpStatus.CREATED,
      async (tx) => {
        await this.requireOpenPeriod(tx, input.branchId, input.period);
        const item = await tx.otherCost.create({
          data: {
            branchId: input.branchId,
            period: input.period,
            description: input.description.trim(),
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
    const rows = await this.db.financePeriod.findMany({
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
        await tx.$queryRaw`SELECT \`id\` FROM \`Branch\` WHERE \`id\` = ${input.branchId} FOR UPDATE`;
        const calculated = await this.controlHash(tx, input.branchId, input.period);
        if (calculated !== input.controlHash)
          throw new ApiProblem('FINANCE_CONTROL_MISMATCH', HttpStatus.CONFLICT);
        let period = await tx.financePeriod.findUnique({
          where: { branchId_period: { branchId: input.branchId, period: input.period } },
        });
        if (!period) {
          if (input.expectedVersion !== 0)
            throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
          period = await tx.financePeriod.create({
            data: { branchId: input.branchId, period: input.period, controlHash: calculated },
          });
        }
        if (period.version !== input.expectedVersion)
          throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        if (period.status !== 'OPEN')
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        period = await tx.financePeriod.update({
          where: { id: period.id },
          data: {
            status: 'CLOSED',
            controlHash: calculated,
            closedAt: now,
            closedById: principal.userId,
            version: { increment: 1 },
          },
        });
        const auditLogId = await this.audit(
          tx,
          principal,
          input.branchId,
          'finance.period.closed',
          period.id,
          { period: input.period, controlHash: calculated, reasonPresent: true },
          correlationId,
        );
        return { period, snapshotIds: [], auditLogId, closedAt: now.toISOString() };
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
        await this.requireOpenPeriod(tx, input.branchId, input.currentPeriod);
        const correction = await tx.financeCorrection.create({
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
        await tx.$queryRaw`SELECT \`id\` FROM \`FinanceCorrection\` WHERE \`id\` = ${id} FOR UPDATE`;
        const correction = await tx.financeCorrection.findUnique({ where: { id } });
        if (!correction) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.authorize(principal, correction.branchId, 'finance:manage');
        if (correction.requestedById === principal.userId)
          throw new ApiProblem('SEPARATION_OF_DUTIES', HttpStatus.CONFLICT);
        if (correction.status !== 'PENDING')
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        await this.requireOpenPeriod(tx, correction.branchId, correction.currentPeriod);
        const approved = decision === 'approve';
        const updated = await tx.financeCorrection.update({
          where: { id },
          data: {
            status: approved ? 'POSTED' : 'REJECTED',
            decidedById: principal.userId,
            decisionReason: input.reason.trim(),
            decidedAt: now,
            postedAt: approved ? now : null,
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
          journalReferenceId: approved ? updated.id : null,
          auditLogId,
        };
      },
    );
  }

  async report(principal: SessionPrincipal, reportType: string, branchId: string, period: string) {
    this.authorize(principal, branchId, 'finance:read');
    const allowed = ['revenue', 'instructor-realtime', 'projection', 'other-cost', 'profit'];
    if (!allowed.includes(reportType) || !UUID.test(branchId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const { from, until } = periodRange(period);
    const [purchases, costs] = await Promise.all([
      this.db.purchase.findMany({
        where: { branchId, status: 'APPROVED', submittedAt: { gte: from, lt: until } },
        select: { priceAfterDiscountRpSnapshot: true, priceRpSnapshot: true },
      }),
      this.db.otherCost.findMany({
        where: { branchId, period, status: 'ACTIVE' },
        select: { id: true, description: true, amountRp: true, createdAt: true },
      }),
    ]);
    const revenueRp = purchases.reduce(
      (sum, item) => sum + (item.priceAfterDiscountRpSnapshot ?? item.priceRpSnapshot),
      0,
    );
    const otherCostRp = costs.reduce((sum, item) => sum + item.amountRp, 0);
    const controlHash = await this.controlHash(this.db, branchId, period);
    return {
      report: {
        reportType: reportType.replaceAll('-', '_').toUpperCase(),
        branchId,
        period,
        generatedAt: new Date().toISOString(),
        controlHash,
        totals: {
          revenue: money(revenueRp),
          otherCost: money(otherCostRp),
          profit: money(revenueRp - otherCostRp),
        },
        sourceVersion: 'runtime-v1',
      },
      items: reportType === 'other-cost' ? costs : [],
      page: { hasMore: false, nextCursor: null },
    };
  }

  private async requireOpenPeriod(tx: Tx, branchId: string, period: string) {
    const record = await tx.financePeriod.findUnique({
      where: { branchId_period: { branchId, period } },
    });
    if (record?.status === 'CLOSED')
      throw new ApiProblem('FINANCE_PERIOD_CLOSED', HttpStatus.LOCKED);
  }

  private async controlHash(db: Tx | PrismaService, branchId: string, period: string) {
    const { from, until } = periodRange(period);
    const [purchases, costs, corrections] = await Promise.all([
      db.purchase.findMany({
        where: { branchId, status: 'APPROVED', submittedAt: { gte: from, lt: until } },
        select: {
          id: true,
          priceAfterDiscountRpSnapshot: true,
          priceRpSnapshot: true,
          version: true,
        },
        orderBy: { id: 'asc' },
      }),
      db.otherCost.findMany({
        where: { branchId, period, status: 'ACTIVE' },
        select: { id: true, amountRp: true, version: true },
        orderBy: { id: 'asc' },
      }),
      db.financeCorrection.findMany({
        where: { branchId, currentPeriod: period, status: 'POSTED' },
        select: { id: true, amountRp: true, version: true },
        orderBy: { id: 'asc' },
      }),
    ]);
    return createHash('sha256')
      .update(JSON.stringify({ branchId, period, purchases, costs, corrections }))
      .digest('hex');
  }

  private otherCostView(item: {
    id: string;
    branchId: string;
    period: string;
    description: string;
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
}
