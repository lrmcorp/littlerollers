import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { AuditService } from '../foundation/audit.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { PackageAccessService } from './package-access.service';
import {
  maskedAccountNumber,
  normalizeAccountNumber,
} from './payment-account-security';

@Injectable()
export class PaymentAccountService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: PackageAccessService,
    private readonly idempotency: IdempotencyService,
    private readonly auditService: AuditService,
  ) {}

  async list(principal: SessionPrincipal, branchId?: string) {
    this.access.paymentAccount(principal);
    if (branchId) this.access.scope(principal, branchId, ['payment-account:read']);
    const scope = this.access.branchScope(principal, 'payment-account:read');
    const items = await this.db.rekeningPembayaran.findMany({
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
      !input.bankName?.trim() ||
      !input.accountHolderName?.trim() ||
      !input.accountNumber?.trim() ||
      input.bankName.trim().length > 64 ||
      input.accountHolderName.trim().length > 128
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    this.access.scope(principal, input.branchId, ['payment-account:manage']);
    const accountNumber = normalizeAccountNumber(input.accountNumber);

    return this.db.$transaction(
      async (tx) => {
        const branch = await tx.cabang.findUnique({ where: { id: input.branchId } });
        if (!branch?.active) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

        const account = await tx.rekeningPembayaran.create({
          data: {
            id: newId(),
            branchId: input.branchId,
            bankName: input.bankName.trim(),
            accountNumber,
            accountHolder: input.accountHolderName.trim(),
            active: true,
          },
        });

        this.auditService.record({
          action: 'PAYMENT_ACCOUNT_CREATED',
          resourceType: 'PaymentAccount',
          resourceId: account.id,
          branchId: account.branchId,
          actorUserId: principal.userId,
          correlationId,
          details: {
            bankName: account.bankName,
            accountNumber: maskedAccountNumber(accountNumber.slice(-4)),
            holder: account.accountHolder,
          },
        });

        return paymentAccountView(account);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /** Ubah nama bank, nama pemilik, dan (opsional) nomor rekening. Nomor kosong = tidak diubah. */
  async update(principal: SessionPrincipal, id: string, input: any, correlationId: string) {
    this.access.paymentAccount(principal, true);
    const bankName = typeof input?.bankName === 'string' ? input.bankName.trim() : '';
    const holder =
      typeof input?.accountHolderName === 'string' ? input.accountHolderName.trim() : '';
    if (!bankName || bankName.length > 64 || !holder || holder.length > 128)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const rawNumber = typeof input?.accountNumber === 'string' ? input.accountNumber.trim() : '';
    const accountNumber = rawNumber ? normalizeAccountNumber(rawNumber) : undefined;

    return this.db.$transaction(
      async (tx) => {
        const account = await tx.rekeningPembayaran.findUnique({ where: { id } });
        if (!account) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (account.branchId)
          this.access.scope(principal, account.branchId, ['payment-account:manage']);

        const updated = await tx.rekeningPembayaran.update({
          where: { id },
          data: { bankName, accountHolder: holder, ...(accountNumber ? { accountNumber } : {}) },
        });

        this.auditService.record({
          action: 'PAYMENT_ACCOUNT_UPDATED',
          resourceType: 'PaymentAccount',
          resourceId: id,
          branchId: account.branchId,
          actorUserId: principal.userId,
          correlationId,
          details: {
            bankName,
            holder,
            accountNumberChanged: Boolean(accountNumber),
            accountNumber: maskedAccountNumber(updated.accountNumber.slice(-4)),
          },
        });

        return paymentAccountView(updated);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async detail(principal: SessionPrincipal, id: string) {
    this.access.paymentAccount(principal);
    const account = await this.db.rekeningPembayaran.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, code: true, name: true, active: true } },
      },
    });
    if (!account) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (account.branchId) this.access.scope(principal, account.branchId, ['payment-account:read']);
    return {
      ...paymentAccountView(account),
      branch: account.branch,
      purchaseCount: 0,
    };
  }

  async deactivate(principal: SessionPrincipal, id: string, input: any, correlationId: string) {
    this.access.paymentAccount(principal, true);
    return this.db.$transaction(
      async (tx) => {
        const account = await tx.rekeningPembayaran.findUnique({ where: { id } });
        if (!account) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (account.branchId) this.access.scope(principal, account.branchId, ['payment-account:manage']);

        const updated = await tx.rekeningPembayaran.update({
          where: { id },
          data: { active: false },
        });

        this.auditService.record({
          action: 'PAYMENT_ACCOUNT_DEACTIVATED',
          resourceType: 'PaymentAccount',
          resourceId: id,
          branchId: account.branchId,
          actorUserId: principal.userId,
          correlationId,
        });

        return paymentAccountView(updated);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async deactivateIdempotent(
    principal: SessionPrincipal,
    id: string,
    input: any,
    key: string | undefined,
    correlationId: string,
  ) {
    if (!key) return this.deactivate(principal, id, input, correlationId);
    return this.idempotency.execute(
      {
        scope: `payment-account-deactivate:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async () => {
        const result = await this.deactivate(principal, id, input, correlationId);
        return {
          status: HttpStatus.OK,
          body: result as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async reactivate(
    principal: SessionPrincipal,
    id: string,
    input: any,
    key: string | undefined,
    correlationId: string,
  ) {
    this.access.paymentAccount(principal, true);
    const execute = async (tx: Prisma.TransactionClient) => {
      const account = await tx.rekeningPembayaran.findUnique({
        where: { id },
        include: { branch: true },
      });
      if (!account) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
      if (account.branchId) this.access.scope(principal, account.branchId, ['payment-account:manage']);

      const updated = await tx.rekeningPembayaran.update({
        where: { id },
        data: { active: true },
      });

      this.auditService.record({
        action: 'PAYMENT_ACCOUNT_REACTIVATED',
        resourceType: 'PaymentAccount',
        resourceId: id,
        branchId: account.branchId,
        actorUserId: principal.userId,
        correlationId,
      });

      return paymentAccountView(updated);
    };

    if (!key) {
      return this.db.$transaction(execute, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    }

    return this.idempotency.execute(
      {
        scope: `payment-account-reactivate:${id}`,
        key,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        const result = await execute(tx);
        return {
          status: HttpStatus.OK,
          body: result as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }
}

function paymentAccountView(account: {
  id: string;
  branchId: string | null;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  active: boolean;
  createdAt: Date;
}) {
  const last4 = account.accountNumber.slice(-4);
  return {
    id: account.id,
    branchId: account.branchId,
    bankCode: account.bankName.toUpperCase().replace(/\s+/g, '_'),
    bankName: account.bankName,
    accountNumber: account.accountNumber,
    maskedAccountNumber: `•••• ${last4}`,
    accountHolderName: account.accountHolder,
    paymentWindowHours: 24,
    active: account.active,
    version: 1,
    createdAt: account.createdAt,
    updatedAt: account.createdAt,
  };
}
