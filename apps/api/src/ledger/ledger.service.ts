import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type CustomerPackage, type LedgerEntry } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';

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
        });
        const hasMore = items.length > PAGE_SIZE;
        const pageItems = items.slice(0, PAGE_SIZE);
        const balances = await Promise.all(pageItems.map((item) => this.balance(tx, item)));
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
