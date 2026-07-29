import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { PackageAccessService } from './package-access.service';
import {
  encryptAccountNumber,
  maskedAccountNumber,
  normalizeAccountNumber,
} from './payment-account-security';

@Injectable()
export class PaymentAccountService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: PackageAccessService,
    private readonly idempotency: IdempotencyService,
  ) {}

  async list(principal: SessionPrincipal, branchId?: string) {
    this.access.paymentAccount(principal);
    if (branchId) this.access.scope(principal, branchId, ['payment-account:read']);
    const scope = this.access.branchScope(principal, 'payment-account:read');
    const items = await this.db.paymentAccount.findMany({
      where: branchId
        ? { branchId }
        : scope.all
          ? scope.excluded.length
            ? { branchId: { notIn: scope.excluded } }
            : {}
          : { branchId: { in: scope.included } },
      orderBy: [{ branchId: 'asc' }, { createdAt: 'desc' }],
    });
    return { items: items.map(paymentAccountView) };
  }

  async create(principal: SessionPrincipal, input: any, correlationId: string) {
    this.access.paymentAccount(principal, true);
    if (
      !input.branchId ||
      !input.bankCode?.trim() ||
      !input.bankName?.trim() ||
      !input.accountHolderName?.trim() ||
      !Number.isInteger(input.paymentWindowHours) ||
      input.paymentWindowHours < 1 ||
      input.paymentWindowHours > 168 ||
      !input.reason?.trim()
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    this.access.scope(principal, input.branchId, ['payment-account:manage']);
    const accountNumber = normalizeAccountNumber(input.accountNumber);
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`Branch\` WHERE \`id\` = ${input.branchId} FOR UPDATE`;
        const branch = await tx.branch.findUnique({ where: { id: input.branchId } });
        if (!branch?.active) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        const active = await tx.paymentAccount.findFirst({
          where: { branchId: input.branchId, active: true },
        });
        if (active) throw new ApiProblem('ACTIVE_PAYMENT_ACCOUNT_EXISTS', HttpStatus.CONFLICT);
        const account = await tx.paymentAccount.create({
          data: {
            id: newId(),
            branchId: input.branchId,
            activeBranchKey: input.branchId,
            bankCode: input.bankCode.trim().toUpperCase(),
            bankName: input.bankName.trim(),
            accountNumberEncrypted: encryptAccountNumber(accountNumber),
            accountNumberLast4: accountNumber.slice(-4),
            accountHolderName: input.accountHolderName.trim(),
            paymentWindowHours: input.paymentWindowHours,
          },
        });
        await tx.auditLog.create({
          data: {
            id: newId(),
            actorType: 'USER',
            actorId: principal.userId,
            action: 'PAYMENT_ACCOUNT_CREATED',
            objectType: 'PaymentAccount',
            objectId: account.id,
            branchId: account.branchId,
            correlationId,
            afterMasked: {
              bankName: account.bankName,
              accountNumber: maskedAccountNumber(accountNumber.slice(-4)),
              holder: account.accountHolderName,
              reason: input.reason.trim(),
            },
          },
        });
        return paymentAccountView(account);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async detail(principal: SessionPrincipal, id: string) {
    this.access.paymentAccount(principal);
    const account = await this.db.paymentAccount.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, code: true, name: true, active: true } },
        _count: { select: { purchases: true } },
      },
    });
    if (!account) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.access.scope(principal, account.branchId, ['payment-account:read']);
    return {
      ...paymentAccountView(account),
      branch: account.branch,
      purchaseCount: account._count.purchases,
    };
  }

  async deactivate(principal: SessionPrincipal, id: string, input: any, correlationId: string) {
    this.access.paymentAccount(principal, true);
    if (!Number.isInteger(input?.expectedVersion) || !input?.reason?.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.db.$transaction(
      async (tx) => {
        const account = await tx.paymentAccount.findUnique({ where: { id } });
        if (!account) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.access.scope(principal, account.branchId, ['payment-account:manage']);
        if (!account.active || account.version !== input.expectedVersion)
          throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
        const openOrder = await tx.purchase.findFirst({
          where: {
            paymentAccountId: id,
            status: 'AWAITING_PAYMENT',
            paymentExpiresAt: { gt: new Date() },
          },
          select: { id: true },
        });
        if (openOrder) throw new ApiProblem('PAYMENT_ACCOUNT_HAS_OPEN_ORDERS', HttpStatus.CONFLICT);
        const updated = await tx.paymentAccount.update({
          where: { id, version: input.expectedVersion },
          data: { active: false, activeBranchKey: null, version: { increment: 1 } },
        });
        await tx.auditLog.create({
          data: {
            id: newId(),
            actorType: 'USER',
            actorId: principal.userId,
            action: 'PAYMENT_ACCOUNT_DEACTIVATED',
            objectType: 'PaymentAccount',
            objectId: id,
            branchId: account.branchId,
            correlationId,
            beforeMasked: { active: true },
            afterMasked: { active: false, reason: input.reason.trim() },
          },
        });
        return paymentAccountView(updated);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async deactivateIdempotent(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number; reason: string },
    key: string,
    correlationId: string,
  ) {
    this.access.paymentAccount(principal, true);
    if (!key || !Number.isInteger(input?.expectedVersion) || input?.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const result = await this.idempotency.execute(
      {
        scope: `payment-account-deactivate:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const account = await tx.paymentAccount.findUnique({ where: { id } });
        if (!account) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.access.scope(principal, account.branchId, ['payment-account:manage']);
        if (!account.active) throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
        if (account.version !== input.expectedVersion)
          throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const openOrder = await tx.purchase.findFirst({
          where: {
            paymentAccountId: id,
            status: 'AWAITING_PAYMENT',
            paymentExpiresAt: { gt: new Date() },
          },
          select: { id: true },
        });
        if (openOrder) throw new ApiProblem('PAYMENT_ACCOUNT_HAS_OPEN_ORDERS', HttpStatus.CONFLICT);
        const updated = await tx.paymentAccount.update({
          where: { id, version: input.expectedVersion },
          data: { active: false, activeBranchKey: null, version: { increment: 1 } },
        });
        await tx.auditLog.create({
          data: {
            id: newId(),
            actorType: 'USER',
            actorId: principal.userId,
            action: 'PAYMENT_ACCOUNT_DEACTIVATED',
            objectType: 'PaymentAccount',
            objectId: id,
            branchId: account.branchId,
            correlationId,
            beforeMasked: { active: true, version: account.version },
            afterMasked: {
              active: false,
              version: updated.version,
              reasonPresent: true,
            },
          },
        });
        return { status: 200, body: paymentAccountView(updated) as Prisma.InputJsonValue };
      },
    );
    return result.body;
  }

  async reactivate(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number; reason: string },
    key: string | undefined,
    correlationId: string,
  ) {
    this.access.paymentAccount(principal, true);
    if (!key || !Number.isInteger(input?.expectedVersion) || input?.reason?.trim().length < 3)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const result = await this.idempotency.execute(
      {
        scope: `payment-account-reactivate:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`PaymentAccount\` WHERE \`id\` = ${id} FOR UPDATE`;
        const account = await tx.paymentAccount.findUnique({
          where: { id },
          include: { branch: { select: { active: true } } },
        });
        if (!account) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.access.scope(principal, account.branchId, ['payment-account:manage']);
        if (!account.branch.active)
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (account.active) throw new ApiProblem('INVALID_STATE', HttpStatus.CONFLICT);
        if (account.version !== input.expectedVersion)
          throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const active = await tx.paymentAccount.findFirst({
          where: { branchId: account.branchId, active: true, id: { not: id } },
          select: { id: true },
        });
        if (active) throw new ApiProblem('ACTIVE_PAYMENT_ACCOUNT_EXISTS', HttpStatus.CONFLICT);
        const updated = await tx.paymentAccount.update({
          where: { id, version: input.expectedVersion },
          data: {
            active: true,
            activeBranchKey: account.branchId,
            version: { increment: 1 },
          },
        });
        await tx.auditLog.create({
          data: {
            id: newId(),
            actorType: 'USER',
            actorId: principal.userId,
            action: 'PAYMENT_ACCOUNT_REACTIVATED',
            objectType: 'PaymentAccount',
            objectId: id,
            branchId: account.branchId,
            correlationId,
            beforeMasked: { active: false, version: account.version },
            afterMasked: {
              active: true,
              version: updated.version,
              reasonPresent: true,
            },
          },
        });
        return { status: 200, body: paymentAccountView(updated) as Prisma.InputJsonValue };
      },
    );
    return result.body;
  }
}

function paymentAccountView(account: {
  id: string;
  branchId: string;
  bankCode: string;
  bankName: string;
  accountNumberLast4: string;
  accountHolderName: string;
  paymentWindowHours: number;
  active: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: account.id,
    branchId: account.branchId,
    bankCode: account.bankCode,
    bankName: account.bankName,
    maskedAccountNumber: `•••• ${account.accountNumberLast4}`,
    accountHolderName: account.accountHolderName,
    paymentWindowHours: account.paymentWindowHours,
    active: account.active,
    version: account.version,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}
