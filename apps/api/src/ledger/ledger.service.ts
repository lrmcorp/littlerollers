import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type CustomerPackage, type LedgerEntry } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { IdempotencyService } from '../foundation/idempotency.service';
import { randomUUID } from 'node:crypto';

type Cursor = { at: string; id: string };
const PAGE_SIZE = 20;

function encodeCursor(at: Date, id: string): string {
  return Buffer.from(JSON.stringify({ at: at.toISOString(), id })).toString('base64url');
}

function decodeCursor(value?: string): Cursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Cursor;
    if (
      typeof parsed.at !== 'string' ||
      Number.isNaN(Date.parse(parsed.at)) ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parsed.id)
    )
      throw new Error('invalid');
    return parsed;
  } catch {
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }
}

@Injectable()
export class LedgerService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly idempotency: IdempotencyService,
  ) {}

  private authorize(principal: SessionPrincipal) {
    this.policy.requireCapability(principal.capabilities, 'ledger:read');
  }

  private isCustomer(principal: SessionPrincipal) {
    return principal.capabilities.includes('customer:self') &&
      !principal.capabilities.includes('branch:all') &&
      !principal.capabilities.includes('branch:operate') &&
      !principal.capabilities.includes('branch:manage') &&
      !principal.capabilities.includes('branch:own') &&
      !principal.capabilities.includes('finance:read')
      ? true
      : false;
  }

  private scopeWhere(
    principal: SessionPrincipal,
    branchId?: string,
  ): Prisma.CustomerPackageWhereInput {
    if (this.isCustomer(principal))
      return { customerUserId: principal.userId, ...(branchId ? { branchId } : {}) };
    if (
      branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(branchId)
    )
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return {
      ...(branchId
        ? { branchId }
        : !principal.capabilities.includes('branch:all')
          ? { branchId: { in: principal.branchIds } }
          : {}),
    };
  }

  private async balance(tx: Prisma.TransactionClient, customerPackage: CustomerPackage) {
    const [ledger, activeReservation] = await Promise.all([
      tx.ledgerEntry.groupBy({
        by: ['type'],
        where: { customerPackageId: customerPackage.id },
        _sum: { quantity: true },
        _count: { _all: true },
      }),
      tx.sessionReservation.aggregate({
        where: { customerPackageId: customerPackage.id, status: 'ACTIVE' },
        _sum: { quantity: true },
      }),
    ]);
    const ledgerBalance = ledger.reduce((sum, row) => sum + (row._sum.quantity ?? 0), 0);
    const reserved = activeReservation._sum.quantity ?? 0;
    const openings = ledger.find(({ type }) => type === 'MIGRATION_OPENING')?._count._all ?? 0;
    const purchases = ledger.find(({ type }) => type === 'PURCHASE')?._count._all ?? 0;
    if (
      ledgerBalance < 0 ||
      reserved > ledgerBalance ||
      openings > 1 ||
      (openings > 0 && purchases > 0)
    )
      throw new ApiProblem('LEDGER_INVARIANT_VIOLATION', HttpStatus.CONFLICT);
    const expired = customerPackage.expiryAt.getTime() <= Date.now();
    const status =
      customerPackage.status === 'INACTIVE' ? 'INACTIVE' : expired ? 'EXPIRED' : 'ACTIVE';
    return {
      id: customerPackage.id,
      branchId: customerPackage.branchId,
      customerUserId: customerPackage.customerUserId,
      packageId: customerPackage.packageId,
      classTypeId: customerPackage.classTypeId,
      status,
      activationDate: customerPackage.activationDate.toISOString().slice(0, 10),
      expiryAt: customerPackage.expiryAt,
      ledgerBalance,
      reserved,
      available: status === 'ACTIVE' ? ledgerBalance - reserved : 0,
      salePriceRp: customerPackage.salePriceRp,
      sessionCountSnapshot: customerPackage.sessionCountSnapshot,
      durationDaysSnapshot: customerPackage.durationDaysSnapshot,
      projectionRateRp: customerPackage.projectionRateRp,
      version: customerPackage.version,
    };
  }

  private adjustmentScope(principal: SessionPrincipal, branchId: string) {
    if (!principal.capabilities.includes('branch:all') && !principal.branchIds.includes(branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  async listAdjustments(
    principal: SessionPrincipal,
    branchId?: string,
    status?: 'PENDING' | 'POSTED' | 'REJECTED',
    cursorValue?: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'ledger:adjust:read');
    if (status && !['PENDING', 'POSTED', 'REJECTED'].includes(status))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (branchId) this.adjustmentScope(principal, branchId);
    const cursor = decodeCursor(cursorValue);
    const items = await this.db.sessionAdjustment.findMany({
      where: {
        ...(status ? { status } : {}),
        customerPackage: {
          ...(branchId
            ? { branchId }
            : principal.capabilities.includes('branch:all')
              ? {}
              : { branchId: { in: principal.branchIds } }),
        },
        ...(cursor
          ? {
              OR: [
                { createdAt: { lt: new Date(cursor.at) } },
                { createdAt: new Date(cursor.at), id: { lt: cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
    });
    const hasMore = items.length > PAGE_SIZE;
    const pageItems = items.slice(0, PAGE_SIZE);
    const last = pageItems.at(-1);
    return {
      items: pageItems,
      page: { hasMore, nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null },
    };
  }

  async requestAdjustment(
    principal: SessionPrincipal,
    input: { customerPackageId: string; quantity: number; reasonCode: string },
    key: string,
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'ledger:adjust:request');
    const reasons = [
      'MIGRATION_CORRECTION',
      'ATTENDANCE_CORRECTION',
      'PACKAGE_COMPENSATION',
      'SUPPORT_RECONCILIATION',
    ] as const;
    if (
      !key ||
      !Number.isSafeInteger(input.quantity) ||
      input.quantity === 0 ||
      !reasons.includes(input.reasonCode as never)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.idempotency
      .execute(
        {
          scope: `session-adjustment-request:${principal.userId}`,
          key,
          payload: input,
          ttlMs: 86400000,
          leaseMs: 30000,
        },
        async (tx) => {
          const customerPackage = await tx.customerPackage.findUnique({
            where: { id: input.customerPackageId },
          });
          if (!customerPackage) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          this.adjustmentScope(principal, customerPackage.branchId);
          if (customerPackage.status !== 'ACTIVE' || customerPackage.expiryAt <= new Date())
            throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          const existing = await tx.sessionAdjustment.findFirst({
            where: { customerPackageId: customerPackage.id, status: 'PENDING' },
          });
          if (existing) throw new ApiProblem('PENDING_ADJUSTMENT_EXISTS', HttpStatus.CONFLICT);
          const adjustment = await tx.sessionAdjustment.create({
            data: {
              id: randomUUID(),
              customerPackageId: customerPackage.id,
              quantity: input.quantity,
              reasonCode: input.reasonCode as (typeof reasons)[number],
              requestedById: principal.userId,
            },
          });
          await Promise.all([
            tx.auditLog.create({
              data: {
                id: randomUUID(),
                actorType: 'USER',
                actorId: principal.userId,
                action: 'session.adjustment.requested',
                objectType: 'SessionAdjustment',
                objectId: adjustment.id,
                branchId: customerPackage.branchId,
                correlationId,
                afterMasked: {
                  status: 'PENDING',
                  quantity: input.quantity,
                  reasonCode: input.reasonCode,
                },
              },
            }),
            tx.outboxEvent.create({
              data: {
                id: randomUUID(),
                eventType: 'session.adjustment_requested.v1',
                aggregateType: 'SessionAdjustment',
                aggregateId: adjustment.id,
                payload: { adjustmentId: adjustment.id, branchId: customerPackage.branchId },
                correlationId,
              },
            }),
          ]);
          return {
            status: HttpStatus.CREATED,
            body: adjustment as unknown as Prisma.InputJsonValue,
          };
        },
      )
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
          throw new ApiProblem('PENDING_ADJUSTMENT_EXISTS', HttpStatus.CONFLICT);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')
          throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
        throw error;
      });
  }

  async decideAdjustment(
    principal: SessionPrincipal,
    id: string,
    decision: 'approve' | 'reject',
    input: { reasonCode: string; expectedVersion: number },
    key: string,
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'ledger:adjust:decide');
    const valid =
      decision === 'approve'
        ? ['CORRECTION_VERIFIED']
        : ['INVALID_EVIDENCE', 'DUPLICATE_REQUEST', 'OUT_OF_SCOPE'];
    if (
      !key ||
      !valid.includes(input.reasonCode) ||
      !Number.isSafeInteger(input.expectedVersion) ||
      input.expectedVersion < 0
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.idempotency
      .execute(
        {
          scope: `session-adjustment-decision:${id}`,
          key,
          payload: { decision, ...input },
          ttlMs: 86400000,
          leaseMs: 30000,
        },
        async (tx) => {
          const adjustment = await tx.sessionAdjustment.findUnique({
            where: { id },
            include: { customerPackage: true },
          });
          if (!adjustment) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          this.adjustmentScope(principal, adjustment.customerPackage.branchId);
          if (adjustment.requestedById === principal.userId)
            throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.FORBIDDEN);
          if (adjustment.status !== 'PENDING')
            throw new ApiProblem('ADJUSTMENT_ALREADY_DECIDED', HttpStatus.CONFLICT);
          if (adjustment.version !== input.expectedVersion)
            throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          if (
            adjustment.customerPackage.status !== 'ACTIVE' ||
            adjustment.customerPackage.expiryAt <= new Date()
          )
            throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          let ledgerEntry = null;
          if (decision === 'approve') {
            const current = await this.balance(tx, adjustment.customerPackage);
            const resulting = current.ledgerBalance + adjustment.quantity;
            if (resulting < 0 || resulting < current.reserved)
              throw new ApiProblem('LEDGER_INVARIANT_VIOLATION', HttpStatus.CONFLICT);
            ledgerEntry = await tx.ledgerEntry.create({
              data: {
                id: randomUUID(),
                customerPackageId: adjustment.customerPackageId,
                type: 'ADJUST_MANUAL',
                quantity: adjustment.quantity,
                referenceType: 'SESSION_ADJUSTMENT',
                referenceId: adjustment.id,
                sessionAdjustmentId: adjustment.id,
              },
            });
          }
          const status = decision === 'approve' ? 'POSTED' : 'REJECTED';
          const updated = await tx.sessionAdjustment.update({
            where: { id, version: input.expectedVersion },
            data: {
              status,
              decisionCode: input.reasonCode as never,
              decidedById: principal.userId,
              decidedAt: new Date(),
              version: { increment: 1 },
            },
          });
          const events =
            decision === 'approve'
              ? ['session.adjustment_approved.v1', 'session.adjustment_posted.v1']
              : ['session.adjustment_rejected.v1'];
          await Promise.all([
            tx.auditLog.create({
              data: {
                id: randomUUID(),
                actorType: 'USER',
                actorId: principal.userId,
                action: `session.adjustment.${status.toLowerCase()}`,
                objectType: 'SessionAdjustment',
                objectId: id,
                branchId: adjustment.customerPackage.branchId,
                correlationId,
                beforeMasked: { status: 'PENDING', version: adjustment.version },
                afterMasked: { status, version: updated.version, decisionCode: input.reasonCode },
              },
            }),
            ...events.map((eventType) =>
              tx.outboxEvent.create({
                data: {
                  id: randomUUID(),
                  eventType,
                  aggregateType: 'SessionAdjustment',
                  aggregateId: id,
                  payload: { adjustmentId: id, branchId: adjustment.customerPackage.branchId },
                  correlationId,
                },
              }),
            ),
          ]);
          return {
            status: HttpStatus.OK,
            body: {
              adjustment: updated,
              ledgerEntry,
              resultingBalance: ledgerEntry
                ? (await this.balance(tx, adjustment.customerPackage)).ledgerBalance
                : null,
            } as unknown as Prisma.InputJsonValue,
          };
        },
      )
      .catch((error: unknown) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === 'P2002' || error.code === 'P2034')
        )
          throw new ApiProblem('ADJUSTMENT_ALREADY_DECIDED', HttpStatus.CONFLICT);
        throw error;
      });
  }

  async list(principal: SessionPrincipal, branchId?: string, cursorValue?: string) {
    this.authorize(principal);
    const cursor = decodeCursor(cursorValue);
    return this.db.$transaction(
      async (tx) => {
        const items = await tx.customerPackage.findMany({
          where: {
            ...this.scopeWhere(principal, branchId),
            ...(cursor
              ? {
                  OR: [
                    { createdAt: { lt: new Date(cursor.at) } },
                    { createdAt: new Date(cursor.at), id: { lt: cursor.id } },
                  ],
                }
              : {}),
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: PAGE_SIZE + 1,
          include: { branch: true, package: true, classType: true },
        });
        const hasMore = items.length > PAGE_SIZE;
        const pageItems = items.slice(0, PAGE_SIZE);
        const balances = await Promise.all(
          pageItems.map(async (item) => ({
            ...(await this.balance(tx, item)),
            packageName: item.package.name,
            branchName: item.branch.name,
            classTypeName: item.classType.name,
          })),
        );
        const last = pageItems.at(-1);
        return {
          items: balances,
          page: {
            hasMore,
            nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
          },
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async detail(principal: SessionPrincipal, id: string, cursorValue?: string) {
    this.authorize(principal);
    const cursor = decodeCursor(cursorValue);
    return this.db.$transaction(
      async (tx) => {
        const customerPackage = await tx.customerPackage.findFirst({
          where: { id, ...this.scopeWhere(principal) },
        });
        if (!customerPackage) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        const entries = await tx.ledgerEntry.findMany({
          where: {
            customerPackageId: id,
            ...(cursor
              ? {
                  OR: [
                    { occurredAt: { lt: new Date(cursor.at) } },
                    { occurredAt: new Date(cursor.at), id: { lt: cursor.id } },
                  ],
                }
              : {}),
          },
          orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
          take: PAGE_SIZE + 1,
        });
        const hasMore = entries.length > PAGE_SIZE;
        const pageEntries = entries.slice(0, PAGE_SIZE);
        const last = pageEntries.at(-1);
        const balance = await this.balance(tx, customerPackage);
        return {
          balance,
          reservations: { activeQuantity: balance.reserved },
          entries: pageEntries.map((entry: LedgerEntry) => ({ ...entry })),
          page: {
            hasMore,
            nextCursor: hasMore && last ? encodeCursor(last.occurredAt, last.id) : null,
          },
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }
}
