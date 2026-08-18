import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma, type PaketPelanggan, type EntriBukuBesar } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';
import { IdempotencyService } from '../foundation/idempotency.service';
import { randomUUID } from 'node:crypto';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PilotRollbackOutboxService } from '../migration/pilot-rollback-outbox.service';

type Cursor = { at: string; id: string; previousCursor?: string };
const PAGE_SIZE = 20;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function encodeCursor(at: Date, id: string, previousCursor = ''): string {
  return Buffer.from(JSON.stringify({ at: at.toISOString(), id, previousCursor })).toString(
    'base64url',
  );
}

function decodeCursor(value?: string): Cursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Cursor;
    if (
      typeof parsed.at !== 'string' ||
      Number.isNaN(Date.parse(parsed.at)) ||
      (parsed.previousCursor !== undefined && typeof parsed.previousCursor !== 'string') ||
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
    private readonly config?: RuntimeConfigService,
    @Optional() private readonly pilotOutbox?: PilotRollbackOutboxService,
  ) {}

  private requireAdjustmentEnabled() {
    const enabled = this.config
      ? this.config.value.sessionAdjustment.enabled
      : process.env.NODE_ENV !== 'production' && process.env.SESSION_ADJUSTMENT_ENABLED !== 'false';
    if (!enabled) throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE);
  }

  private maskPhone(value: string | null | undefined) {
    if (!value) return null;
    return `${value.slice(0, Math.min(4, value.length))}${'*'.repeat(Math.max(4, value.length - 6))}${value.slice(-2)}`;
  }

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
  ): Prisma.PaketPelangganWhereInput {
    if (this.isCustomer(principal))
      return { customerUserId: principal.userId, ...(branchId ? { branchId } : {}) };
    if (branchId) {
      if (
        !this.policy.hasCapability(principal, 'branch:all', branchId) &&
        !this.policy.hasCapability(principal, 'ledger:read', branchId)
      )
        throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
      return { branchId };
    }
    const branchScope = this.policy.capabilityBranchScope(principal, 'ledger:read');
    return {
      ...(branchScope.all
        ? branchScope.excluded.length
          ? { branchId: { notIn: branchScope.excluded } }
          : {}
        : { branchId: { in: branchScope.included } }),
    };
  }

  private async balance(tx: Prisma.TransactionClient, customerPackage: PaketPelanggan) {
    const [ledger, activeReservation] = await Promise.all([
      tx.entriBukuBesar.groupBy({
        by: ['type'],
        where: { customerPackageId: customerPackage.id },
        _sum: { quantity: true },
        _count: { _all: true },
      }),
      tx.reservasiSesi.aggregate({
        where: { customerPackageId: customerPackage.id, status: 'ACTIVE' },
        _sum: { quantity: true },
      }),
    ]);
    const ledgerBalance = ledger.reduce((sum, row) => sum + (row._sum.quantity ?? 0), 0);
    const quantity = (type: string) => ledger.find((row) => row.type === type)?._sum.quantity ?? 0;
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
      usage: {
        initialSessions: quantity('PURCHASE') + quantity('MIGRATION_OPENING'),
        usedSessions: Math.abs(Math.min(0, quantity('ATTEND'))),
        reversedSessions: Math.max(0, quantity('REVERSAL')),
        adjustmentDelta: quantity('ADJUST_MANUAL'),
      },
      salePriceRp: customerPackage.salePriceRp,
      sessionCountSnapshot: customerPackage.sessionCountSnapshot,
      durationDaysSnapshot: customerPackage.durationDaysSnapshot,
      projectionRateRp: customerPackage.projectionRateRp,
      version: customerPackage.version,
    };
  }

  private adjustmentScope(principal: SessionPrincipal, branchId: string, capability: string) {
    if (
      !this.policy.hasCapability(principal, 'branch:all', branchId) &&
      !this.policy.hasCapability(principal, capability, branchId)
    )
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  async listAdjustments(
    principal: SessionPrincipal,
    branchId?: string,
    status?: 'PENDING' | 'POSTED' | 'REJECTED' | 'HISTORY',
    cursorValue?: string,
    q?: string,
    customerUserId?: string,
    from?: string,
    until?: string,
    limitValue?: string,
    adjustmentId?: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'ledger:adjust:read');
    if (status && !['PENDING', 'POSTED', 'REJECTED', 'HISTORY'].includes(status))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (branchId) this.adjustmentScope(principal, branchId, 'ledger:adjust:read');
    if (customerUserId && !UUID.test(customerUserId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (adjustmentId && !UUID.test(adjustmentId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (q && q.trim().length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const fromDate = from ? new Date(from) : null;
    const untilDate = until ? new Date(until) : null;
    if (
      (fromDate && Number.isNaN(fromDate.getTime())) ||
      (untilDate && Number.isNaN(untilDate.getTime())) ||
      (fromDate && untilDate && fromDate >= untilDate)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const limit = limitValue ? Number(limitValue) : PAGE_SIZE;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const cursor = decodeCursor(cursorValue);
    const branchScope = this.policy.capabilityBranchScope(principal, 'ledger:adjust:read');
    return this.db.$transaction(
      async (tx) => {
        const normalizedSearch = q?.trim();
        const baseWhere: Prisma.PenyesuaianSesiWhereInput = {
          ...(adjustmentId ? { id: adjustmentId } : {}),
          ...(fromDate || untilDate
            ? {
                createdAt: {
                  ...(fromDate ? { gte: fromDate } : {}),
                  ...(untilDate ? { lt: untilDate } : {}),
                },
              }
            : {}),
          customerPackage: {
            ...(customerUserId ? { customerUserId } : {}),
            ...(branchId
              ? { branchId }
              : branchScope.all
                ? branchScope.excluded.length
                  ? { branchId: { notIn: branchScope.excluded } }
                  : {}
                : { branchId: { in: branchScope.included } }),
            ...(normalizedSearch
              ? {
                  OR: [
                    { customer: { displayName: { contains: normalizedSearch } } },
                    { package: { name: { contains: normalizedSearch } } },
                    { branch: { name: { contains: normalizedSearch } } },
                  ],
                }
              : {}),
          },
        };
        const items = await tx.penyesuaianSesi.findMany({
          where: {
            ...baseWhere,
            ...(status === 'HISTORY'
              ? { status: { in: ['POSTED', 'REJECTED'] } }
              : status
                ? { status }
                : {}),
            ...(cursor
              ? {
                  OR: [
                    { createdAt: { lt: new Date(cursor.at) } },
                    { createdAt: new Date(cursor.at), id: { lt: cursor.id } },
                  ],
                }
              : {}),
          },
          include: {
            customerPackage: {
              include: { customer: true, branch: true, package: true, classType: true },
            },
            requestedBy: { select: { id: true, displayName: true } },
            decidedBy: { select: { id: true, displayName: true } },
            ledgerEntry: { select: { id: true } },
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: limit + 1,
        });
        const hasMore = items.length > limit;
        const pageItems = items.slice(0, limit);
        const auditRows = pageItems.length
          ? await tx.auditLog.findMany({
              where: {
                objectType: 'SessionAdjustment',
                objectId: { in: pageItems.map((item) => item.id) },
              },
              orderBy: { occurredAt: 'desc' },
              select: { objectId: true, correlationId: true },
            })
          : [];
        const auditByAdjustment = new Map<string, string>();
        for (const audit of auditRows)
          if (!auditByAdjustment.has(audit.objectId))
            auditByAdjustment.set(audit.objectId, audit.correlationId);
        const views = await Promise.all(
          pageItems.map(async (item) => {
            const current = await this.balance(tx, item.customerPackage);
            const projectedLedgerBalance = current.ledgerBalance + item.quantity;
            const packageEligible =
              item.customerPackage.status === 'ACTIVE' &&
              item.customerPackage.expiryAt > new Date();
            const balanceEligible =
              projectedLedgerBalance >= 0 && projectedLedgerBalance >= current.reserved;
            const eligibilityReason =
              item.status !== 'PENDING'
                ? 'ADJUSTMENT_ALREADY_DECIDED'
                : !packageEligible
                  ? 'PACKAGE_NOT_ACTIVE'
                  : !balanceEligible
                    ? 'LEDGER_INVARIANT_VIOLATION'
                    : null;
            return {
              ...item,
              customer: {
                id: item.customerPackage.customer.id,
                displayName: item.customerPackage.customer.displayName,
                phoneMasked: this.maskPhone(item.customerPackage.customer.phoneE164),
              },
              branch: {
                id: item.customerPackage.branch.id,
                name: item.customerPackage.branch.name,
              },
              package: {
                id: item.customerPackage.package.id,
                name: item.customerPackage.package.name,
              },
              classType: {
                id: item.customerPackage.classType.id,
                name: item.customerPackage.classType.name,
              },
              currentBalance: current.ledgerBalance,
              currentReserved: current.reserved,
              currentAvailable: current.available,
              projectedLedgerBalance,
              projectedAvailable: packageEligible
                ? Math.max(0, projectedLedgerBalance - current.reserved)
                : 0,
              eligibleForApproval: item.status === 'PENDING' && packageEligible && balanceEligible,
              eligibilityReason,
              ledgerEntryId: item.ledgerEntry?.id ?? null,
              auditReference: auditByAdjustment.get(item.id) ?? null,
              customerPackage: undefined,
            };
          }),
        );
        const last = pageItems.at(-1);
        const [pending, posted, rejected] = await Promise.all([
          tx.penyesuaianSesi.count({ where: { ...baseWhere, status: 'PENDING' } }),
          tx.penyesuaianSesi.count({ where: { ...baseWhere, status: 'POSTED' } }),
          tx.penyesuaianSesi.count({ where: { ...baseWhere, status: 'REJECTED' } }),
        ]);
        return {
          items: views,
          summary: { total: pending + posted + rejected, pending, posted, rejected },
          page: {
            hasMore,
            nextCursor:
              hasMore && last ? encodeCursor(last.createdAt, last.id, cursorValue ?? '') : null,
            previousCursor: cursor ? (cursor.previousCursor ?? '') : null,
          },
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async adjustmentDetail(principal: SessionPrincipal, id: string) {
    const page = await this.listAdjustments(
      principal,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      '1',
      id,
    );
    const item = page.items[0];
    if (!item) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return item;
  }

  async requestAdjustment(
    principal: SessionPrincipal,
    input: { customerPackageId: string; quantity: number; reasonCode: string },
    key: string,
    correlationId: string,
  ) {
    this.requireAdjustmentEnabled();
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
          const customerPackage = await tx.paketPelanggan.findUnique({
            where: { id: input.customerPackageId },
          });
          if (!customerPackage) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          this.adjustmentScope(principal, customerPackage.branchId, 'ledger:adjust:request');
          if (customerPackage.status !== 'ACTIVE' || customerPackage.expiryAt <= new Date())
            throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          const requestBalance = await this.balance(tx, customerPackage);
          const existing = await tx.penyesuaianSesi.findFirst({
            where: { customerPackageId: customerPackage.id, status: 'PENDING' },
          });
          if (existing) throw new ApiProblem('PENDING_ADJUSTMENT_EXISTS', HttpStatus.CONFLICT);
          const adjustment = await tx.penyesuaianSesi.create({
            data: {
              id: randomUUID(),
              customerPackageId: customerPackage.id,
              quantity: input.quantity,
              ledgerBalanceAtRequest: requestBalance.ledgerBalance,
              reservedAtRequest: requestBalance.reserved,
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
                payload: {
                  adjustmentId: adjustment.id,
                  customerPackageId: customerPackage.id,
                  branchId: customerPackage.branchId,
                  quantity: input.quantity,
                  requestorId: principal.userId,
                },
                correlationId,
              },
            }),
          ]);
          await this.pilotOutbox?.record(tx, {
            branchId: customerPackage.branchId,
            aggregateType: 'SessionAdjustment',
            aggregateId: adjustment.id,
            operation: 'REQUEST',
            correlationId,
            payload: {
              adjustmentId: adjustment.id,
              customerPackageId: customerPackage.id,
              quantity: adjustment.quantity,
              reasonCode: adjustment.reasonCode,
            },
          });
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
    input: { reasonCode: string; note?: string; expectedVersion: number },
    key: string,
    correlationId: string,
  ) {
    this.requireAdjustmentEnabled();
    this.policy.requireCapability(principal.capabilities, 'ledger:adjust:decide');
    const valid =
      decision === 'approve'
        ? ['CORRECTION_VERIFIED']
        : ['INVALID_EVIDENCE', 'DUPLICATE_REQUEST', 'OUT_OF_SCOPE'];
    if (
      !key ||
      !valid.includes(input.reasonCode) ||
      (input.note !== undefined && input.note.trim().length > 500) ||
      !Number.isSafeInteger(input.expectedVersion) ||
      input.expectedVersion < 0
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const preflight = await this.db.penyesuaianSesi.findUnique({
      where: { id },
      select: { requestedById: true, customerPackage: { select: { branchId: true } } },
    });
    if (!preflight) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.adjustmentScope(principal, preflight.customerPackage.branchId, 'ledger:adjust:decide');
    if (preflight.requestedById === principal.userId) {
      await this.db.auditLog.create({
        data: {
          id: randomUUID(),
          actorType: 'USER',
          actorId: principal.userId,
          action: 'session.adjustment.self_approval_denied',
          objectType: 'SessionAdjustment',
          objectId: id,
          branchId: preflight.customerPackage.branchId,
          correlationId,
          afterMasked: { reasonCode: 'SEPARATION_OF_DUTIES_VIOLATION' },
        },
      });
      throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.FORBIDDEN);
    }
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
          const adjustment = await tx.penyesuaianSesi.findUnique({
            where: { id },
            include: { customerPackage: true },
          });
          if (!adjustment) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          this.adjustmentScope(
            principal,
            adjustment.customerPackage.branchId,
            'ledger:adjust:decide',
          );
          if (adjustment.requestedById === principal.userId)
            throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.FORBIDDEN);
          if (adjustment.status !== 'PENDING')
            throw new ApiProblem('ADJUSTMENT_ALREADY_DECIDED', HttpStatus.CONFLICT);
          if (adjustment.version !== input.expectedVersion)
            throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          if (
            decision === 'approve' &&
            (adjustment.customerPackage.status !== 'ACTIVE' ||
              adjustment.customerPackage.expiryAt <= new Date())
          )
            throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          let ledgerEntry = null;
          if (decision === 'approve') {
            const current = await this.balance(tx, adjustment.customerPackage);
            const resulting = current.ledgerBalance + adjustment.quantity;
            if (resulting < 0 || resulting < current.reserved)
              throw new ApiProblem('LEDGER_INVARIANT_VIOLATION', HttpStatus.CONFLICT);
            ledgerEntry = await tx.entriBukuBesar.create({
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
          const updated = await tx.penyesuaianSesi.update({
            where: { id, version: input.expectedVersion },
            data: {
              status,
              decisionCode: input.reasonCode as never,
              decisionNote: input.note?.trim() || null,
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
                afterMasked: {
                  status,
                  version: updated.version,
                  decisionCode: input.reasonCode,
                  noteProvided: Boolean(input.note?.trim()),
                },
              },
            }),
            ...events.map((eventType) =>
              tx.outboxEvent.create({
                data: {
                  id: randomUUID(),
                  eventType,
                  aggregateType: 'SessionAdjustment',
                  aggregateId: id,
                  payload: {
                    adjustmentId: id,
                    customerPackageId: adjustment.customerPackageId,
                    branchId: adjustment.customerPackage.branchId,
                    approverId: principal.userId,
                    ...(eventType === 'session.adjustment_posted.v1'
                      ? { ledgerEntryId: ledgerEntry?.id, quantity: adjustment.quantity }
                      : {}),
                    ...(eventType === 'session.adjustment_rejected.v1'
                      ? { reasonCode: input.reasonCode }
                      : {}),
                  },
                  correlationId,
                },
              }),
            ),
          ]);
          await this.pilotOutbox?.record(tx, {
            branchId: adjustment.customerPackage.branchId,
            aggregateType: 'SessionAdjustment',
            aggregateId: adjustment.id,
            operation: decision === 'approve' ? 'POST' : 'REJECT',
            correlationId,
            payload: {
              adjustmentId: adjustment.id,
              customerPackageId: adjustment.customerPackageId,
              quantity: adjustment.quantity,
              status,
              reasonCode: input.reasonCode,
            },
          });
          return {
            status: HttpStatus.OK,
            body: {
              adjustment: updated,
              ledgerEntry,
              resultingBalance: ledgerEntry
                ? (await this.balance(tx, adjustment.customerPackage)).ledgerBalance
                : null,
              auditReference: correlationId,
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

  async list(
    principal: SessionPrincipal,
    branchId?: string,
    cursorValue?: string,
    search?: string,
    status?: 'ACTIVE' | 'EXPIRED' | 'INACTIVE',
    customerUserId?: string,
  ) {
    this.authorize(principal);
    const customerCaller = this.isCustomer(principal);
    if (customerUserId && !UUID.test(customerUserId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (customerCaller && customerUserId && customerUserId !== principal.userId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (status && !['ACTIVE', 'EXPIRED', 'INACTIVE'].includes(status))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (search && search.trim().length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const cursor = decodeCursor(cursorValue);
    const normalizedSearch = search?.trim();
    const baseWhere: Prisma.PaketPelangganWhereInput = {
      ...this.scopeWhere(principal, branchId),
      ...(customerUserId ? { customerUserId } : {}),
      ...(normalizedSearch
        ? {
            OR: [
              { customer: { displayName: { contains: normalizedSearch } } },
              { package: { name: { contains: normalizedSearch } } },
              { classType: { name: { contains: normalizedSearch } } },
            ],
          }
        : {}),
      ...(status === 'INACTIVE'
        ? { status: 'INACTIVE' }
        : status === 'EXPIRED'
          ? { status: 'ACTIVE', expiryAt: { lte: new Date() } }
          : status === 'ACTIVE'
            ? { status: 'ACTIVE', expiryAt: { gt: new Date() } }
            : {}),
    };
    return this.db.$transaction(
      async (tx) => {
        const [items, summaryPackages, ledgerGroups, reservationGroups] = await Promise.all([
          tx.paketPelanggan.findMany({
            where: {
              ...baseWhere,
              ...(cursor
                ? {
                    AND: [
                      {
                        OR: [
                          { createdAt: { lt: new Date(cursor.at) } },
                          { createdAt: new Date(cursor.at), id: { lt: cursor.id } },
                        ],
                      },
                    ],
                  }
                : {}),
            },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: PAGE_SIZE + 1,
            include: { branch: true, package: true, classType: true, customer: true },
          }),
          tx.paketPelanggan.findMany({
            where: baseWhere,
            select: { id: true, status: true, expiryAt: true },
          }),
          tx.entriBukuBesar.groupBy({
            by: ['customerPackageId', 'type'],
            where: { customerPackage: baseWhere },
            _sum: { quantity: true },
            _count: { _all: true },
          }),
          tx.reservasiSesi.groupBy({
            by: ['customerPackageId'],
            where: { status: 'ACTIVE', customerPackage: baseWhere },
            _sum: { quantity: true },
          }),
        ]);
        const hasMore = items.length > PAGE_SIZE;
        const pageItems = items.slice(0, PAGE_SIZE);
        const ledgerByPackage = new Map<string, number>();
        const initialByPackage = new Map<string, number>();
        const usedByPackage = new Map<string, number>();
        const reversedByPackage = new Map<string, number>();
        const adjustmentByPackage = new Map<string, number>();
        const openingCount = new Map<string, number>();
        const purchaseCount = new Map<string, number>();
        for (const group of ledgerGroups) {
          ledgerByPackage.set(
            group.customerPackageId,
            (ledgerByPackage.get(group.customerPackageId) ?? 0) + (group._sum.quantity ?? 0),
          );
          if (group.type === 'MIGRATION_OPENING')
            openingCount.set(group.customerPackageId, group._count._all);
          if (group.type === 'PURCHASE')
            purchaseCount.set(group.customerPackageId, group._count._all);
          if (group.type === 'MIGRATION_OPENING' || group.type === 'PURCHASE')
            initialByPackage.set(
              group.customerPackageId,
              (initialByPackage.get(group.customerPackageId) ?? 0) + (group._sum.quantity ?? 0),
            );
          if (group.type === 'ATTEND')
            usedByPackage.set(
              group.customerPackageId,
              Math.abs(Math.min(0, group._sum.quantity ?? 0)),
            );
          if (group.type === 'REVERSAL')
            reversedByPackage.set(group.customerPackageId, Math.max(0, group._sum.quantity ?? 0));
          if (group.type === 'ADJUST_MANUAL')
            adjustmentByPackage.set(group.customerPackageId, group._sum.quantity ?? 0);
        }
        const reservedByPackage = new Map(
          reservationGroups.map((group) => [group.customerPackageId, group._sum.quantity ?? 0]),
        );
        const balances = pageItems.map((item) => {
          const ledgerBalance = ledgerByPackage.get(item.id) ?? 0;
          const reserved = reservedByPackage.get(item.id) ?? 0;
          if (
            ledgerBalance < 0 ||
            reserved > ledgerBalance ||
            (openingCount.get(item.id) ?? 0) > 1 ||
            ((openingCount.get(item.id) ?? 0) > 0 && (purchaseCount.get(item.id) ?? 0) > 0)
          )
            throw new ApiProblem('LEDGER_INVARIANT_VIOLATION', HttpStatus.CONFLICT);
          const expired = item.expiryAt.getTime() <= Date.now();
          const effectiveStatus =
            item.status === 'INACTIVE' ? 'INACTIVE' : expired ? 'EXPIRED' : 'ACTIVE';
          return {
            id: item.id,
            branchId: item.branchId,
            customerUserId: item.customerUserId,
            packageId: item.packageId,
            classTypeId: item.classTypeId,
            status: effectiveStatus,
            activationDate: item.activationDate.toISOString().slice(0, 10),
            expiryAt: item.expiryAt,
            ledgerBalance,
            reserved,
            available: effectiveStatus === 'ACTIVE' ? ledgerBalance - reserved : 0,
            usage: {
              initialSessions: initialByPackage.get(item.id) ?? 0,
              usedSessions: usedByPackage.get(item.id) ?? 0,
              reversedSessions: reversedByPackage.get(item.id) ?? 0,
              adjustmentDelta: adjustmentByPackage.get(item.id) ?? 0,
            },
            salePriceRp: item.salePriceRp,
            sessionCountSnapshot: item.sessionCountSnapshot,
            durationDaysSnapshot: item.durationDaysSnapshot,
            projectionRateRp: item.projectionRateRp,
            version: item.version,
            packageName: item.package.name,
            branchName: item.branch.name,
            classTypeName: item.classType.name,
            ...(customerCaller
              ? {}
              : {
                  customer: {
                    id: item.customer.id,
                    displayName: item.customer.displayName,
                    phoneMasked: this.maskPhone(item.customer.phoneE164),
                  },
                }),
          };
        });
        const summary = summaryPackages.reduce(
          (total, item) => {
            const ledgerBalance = ledgerByPackage.get(item.id) ?? 0;
            const reserved = reservedByPackage.get(item.id) ?? 0;
            if (
              ledgerBalance < 0 ||
              reserved > ledgerBalance ||
              (openingCount.get(item.id) ?? 0) > 1 ||
              ((openingCount.get(item.id) ?? 0) > 0 && (purchaseCount.get(item.id) ?? 0) > 0)
            )
              throw new ApiProblem('LEDGER_INVARIANT_VIOLATION', HttpStatus.CONFLICT);
            const active = item.status === 'ACTIVE' && item.expiryAt.getTime() > Date.now();
            total.packageCount += 1;
            if (active) total.activePackageCount += 1;
            total.ledgerBalance += ledgerBalance;
            total.reserved += reserved;
            total.available += active ? ledgerBalance - reserved : 0;
            total.usedSessions += usedByPackage.get(item.id) ?? 0;
            total.reversedSessions += reversedByPackage.get(item.id) ?? 0;
            total.adjustmentDelta += adjustmentByPackage.get(item.id) ?? 0;
            if (active && item.expiryAt.getTime() <= Date.now() + 30 * 24 * 60 * 60 * 1000)
              total.expiringSoon += 1;
            return total;
          },
          {
            packageCount: 0,
            activePackageCount: 0,
            ledgerBalance: 0,
            reserved: 0,
            available: 0,
            usedSessions: 0,
            reversedSessions: 0,
            adjustmentDelta: 0,
            expiringSoon: 0,
          },
        );
        const last = pageItems.at(-1);
        return {
          items: balances,
          summary,
          page: {
            hasMore,
            nextCursor:
              hasMore && last ? encodeCursor(last.createdAt, last.id, cursorValue ?? '') : null,
            previousCursor: cursor ? (cursor.previousCursor ?? '') : null,
          },
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async detail(principal: SessionPrincipal, id: string, cursorValue?: string) {
    this.authorize(principal);
    const customerCaller = this.isCustomer(principal);
    const cursor = decodeCursor(cursorValue);
    return this.db.$transaction(
      async (tx) => {
        const customerPackage = await tx.paketPelanggan.findFirst({
          where: { id, ...this.scopeWhere(principal) },
          include: { branch: true, package: true, classType: true, customer: true },
        });
        if (!customerPackage) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        const [entries, allEntries, reservations] = await Promise.all([
          tx.entriBukuBesar.findMany({
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
          }),
          tx.entriBukuBesar.findMany({
            where: { customerPackageId: id },
            orderBy: [{ occurredAt: 'asc' }, { id: 'asc' }],
            select: { id: true, quantity: true },
          }),
          tx.reservasiSesi.findMany({
            where: { customerPackageId: id, status: 'ACTIVE' },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            include: {
              classSlot: { include: { classType: true, branch: true } },
              booking: { select: { id: true, status: true } },
            },
          }),
        ]);
        const hasMore = entries.length > PAGE_SIZE;
        const pageEntries = entries.slice(0, PAGE_SIZE);
        const last = pageEntries.at(-1);
        let runningBalance = 0;
        const balanceAfter = new Map<string, number>();
        for (const entry of allEntries) {
          runningBalance += entry.quantity;
          balanceAfter.set(entry.id, runningBalance);
        }
        const rawBalance = await this.balance(tx, customerPackage);
        const balance = {
          ...rawBalance,
          packageName: customerPackage.package.name,
          branchName: customerPackage.branch.name,
          classTypeName: customerPackage.classType.name,
          ...(customerCaller
            ? {}
            : {
                customer: {
                  id: customerPackage.customer.id,
                  displayName: customerPackage.customer.displayName,
                  phoneMasked: this.maskPhone(customerPackage.customer.phoneE164),
                },
              }),
        };
        return {
          balance,
          reservations: {
            activeQuantity: balance.reserved,
            items: reservations.map((reservation) => ({
              id: reservation.id,
              quantity: reservation.quantity,
              createdAt: reservation.createdAt,
              bookingId: reservation.booking?.id ?? null,
              bookingStatus: reservation.booking?.status ?? null,
              className: reservation.classSlot?.classType.name ?? null,
              branchName: reservation.classSlot?.branch.name ?? null,
              startsAt: reservation.classSlot?.startAt ?? null,
            })),
          },
          entries: pageEntries.map((entry: EntriBukuBesar) => ({
            ...entry,
            balanceAfter: balanceAfter.get(entry.id) ?? null,
            referenceLabel:
              entry.type === 'PURCHASE' || entry.type === 'MIGRATION_OPENING'
                ? 'Aktivasi paket'
                : entry.type === 'ATTEND'
                  ? 'Kehadiran kelas'
                  : entry.type === 'REVERSAL'
                    ? 'Pengembalian sesi'
                    : 'Penyesuaian sesi',
            bookingId: entry.referenceType === 'BOOKING' ? entry.referenceId : null,
          })),
          page: {
            hasMore,
            nextCursor:
              hasMore && last ? encodeCursor(last.occurredAt, last.id, cursorValue ?? '') : null,
            previousCursor: cursor ? (cursor.previousCursor ?? '') : null,
          },
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  // --- Indonesian Domain Aliases ---
  async cekSaldoSesi(
    tx: Prisma.TransactionClient,
    customerPackage: Parameters<LedgerService['balance']>[1],
  ) {
    return this.balance(tx, customerPackage);
  }

  async riwayatBukuBesar(
    principal: SessionPrincipal,
    customerPackageId: string,
    cursorValue?: string,
  ) {
    return this.detail(principal, customerPackageId, cursorValue);
  }

  async ajukanPenyesuaianSesi(
    principal: SessionPrincipal,
    input: Parameters<LedgerService['requestAdjustment']>[1],
    key: string,
    correlationId: string,
  ) {
    return this.requestAdjustment(principal, input, key, correlationId);
  }

  async putuskanPenyesuaianSesi(
    principal: SessionPrincipal,
    id: string,
    decision: 'approve' | 'reject',
    input: Parameters<LedgerService['decideAdjustment']>[3],
    key: string,
    correlationId: string,
  ) {
    return this.decideAdjustment(principal, id, decision, input, key, correlationId);
  }
}
