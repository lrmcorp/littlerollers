import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, digest, newId, syntheticConfigSeconds } from '../identity/security';
import { PackageAccessService } from './package-access.service';
import { decryptAccountNumber } from './payment-account-security';

@Injectable()
export class CustomerOrderService {
  constructor(
    private readonly db: PrismaService,
    private readonly idem: IdempotencyService,
    private readonly access: PackageAccessService,
  ) {}
  async checkoutOptions(p: SessionPrincipal, packageId: string, branchId?: string) {
    this.access.catalog(p);
    await this.access.requireVerifiedCustomer(p);
    const now = new Date();
    const pkg = await this.db.package.findFirst({
      where: {
        id: packageId,
        status: 'ACTIVE',
        effectiveFrom: { lte: now },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
      },
      include: { branch: true, classType: true },
    });
    if (!pkg?.branch.active) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (branchId && pkg.branchId !== branchId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const account = await this.db.paymentAccount.findFirst({
      where: { branchId: pkg.branchId, active: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!account) throw new ApiProblem('PAYMENT_ACCOUNT_UNAVAILABLE', HttpStatus.CONFLICT);
    return {
      package: {
        id: pkg.id,
        name: pkg.name,
        priceRp: pkg.priceRp,
        sessionCount: pkg.sessionCount,
        durationDays: pkg.durationDays,
        branchId: pkg.branchId,
        branchName: pkg.branch.name,
        classTypeId: pkg.classTypeId,
        classTypeName: pkg.classType.name,
      },
      paymentAccount: {
        id: account.id,
        bankName: account.bankName,
        accountNumber: decryptAccountNumber(account.accountNumberEncrypted),
        accountHolderName: account.accountHolderName,
        paymentWindowHours: account.paymentWindowHours,
      },
    };
  }

  private async expireOwnOrders(userId: string) {
    const expired = await this.db.purchase.findMany({
      where: {
        userId,
        status: { in: ['AWAITING_PAYMENT', 'ACTION_REQUIRED'] },
        paymentExpiresAt: { lte: new Date() },
      },
      select: { id: true },
    });
    if (!expired.length) return;
    const ids = expired.map(({ id }) => id);
    await this.db.$transaction([
      this.db.purchase.updateMany({
        where: { id: { in: ids } },
        data: { status: 'EXPIRED', version: { increment: 1 } },
      }),
      this.db.paymentUniqueCodeReservation.deleteMany({ where: { purchaseId: { in: ids } } }),
    ]);
  }

  private orderView(order: any, revealAccount = false) {
    const payableAmountRp = order.payableAmountRpSnapshot ?? order.priceRpSnapshot;
    return {
      id: order.id,
      branchId: order.branchId,
      branchName: order.branch?.name,
      packageId: order.packageId,
      packageName: order.packageNameSnapshot,
      priceRp: order.priceRpSnapshot,
      baseAmountRp: order.priceRpSnapshot,
      paymentUniqueCode: order.paymentUniqueCode,
      payableAmountRp,
      sessionCount: order.sessionCountSnapshot,
      durationDays: order.durationDaysSnapshot,
      status: order.status,
      submittedAt: order.submittedAt,
      expiresAt: order.paymentExpiresAt,
      continuationSlotId: order.continuationClassSlotId,
      paymentProofId: order.paymentProofId,
      paymentProofStatus: order.paymentProof
        ? {
            uploadStatus: order.paymentProof.uploadStatus,
            scanStatus: order.paymentProof.scanStatus,
          }
        : null,
      decisionReasonCode: order.decisionReasonCode,
      version: order.version,
      paymentAccount: order.paymentBankNameSnapshot
        ? {
            bankName: order.paymentBankNameSnapshot,
            accountNumber:
              revealAccount && order.paymentAccountNumberSnapshotEncrypted
                ? decryptAccountNumber(order.paymentAccountNumberSnapshotEncrypted)
                : `•••• ${order.paymentAccountLast4Snapshot}`,
            accountHolderName: order.paymentAccountHolderSnapshot,
          }
        : null,
    };
  }

  private async reserveUniqueCode(
    tx: Prisma.TransactionClient,
    input: {
      purchaseId: string;
      paymentAccountId: string;
      priceRp: number;
      expiresAt: Date;
    },
  ) {
    await tx.$queryRaw(
      Prisma.sql`SELECT id FROM PaymentAccount WHERE id = ${input.paymentAccountId} FOR UPDATE`,
    );
    const used = new Set(
      (
        await tx.paymentUniqueCodeReservation.findMany({
          where: { paymentAccountId: input.paymentAccountId },
          select: { code: true },
        })
      ).map(({ code }) => code),
    );
    const start = (Number.parseInt(digest(input.purchaseId).slice(0, 8), 16) % 999) + 1;
    let code: number | undefined;
    for (let offset = 0; offset < 999; offset += 1) {
      const candidate = ((start - 1 + offset) % 999) + 1;
      if (!used.has(candidate)) {
        code = candidate;
        break;
      }
    }
    if (!code) throw new ApiProblem('PAYMENT_UNIQUE_CODE_UNAVAILABLE', HttpStatus.CONFLICT);
    const payableAmountRp = input.priceRp + code;
    if (!Number.isSafeInteger(payableAmountRp))
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    await tx.paymentUniqueCodeReservation.create({
      data: {
        id: newId(),
        paymentAccountId: input.paymentAccountId,
        purchaseId: input.purchaseId,
        code,
        expiresAt: input.expiresAt,
      },
    });
    return { code, payableAmountRp };
  }

  async createOrder(p: SessionPrincipal, input: any, key: string, correlationId: string) {
    this.access.catalog(p);
    await this.access.requireVerifiedCustomer(p);
    if (!key || !input?.packageId) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.idem.execute(
      { scope: `order:${p.userId}`, key, payload: input, ttlMs: 86400000, leaseMs: 30000 },
      async (tx) => {
        const now = new Date();
        const pkg = await tx.package.findFirst({
          where: {
            id: input.packageId,
            status: 'ACTIVE',
            effectiveFrom: { lte: now },
            OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
          },
        });
        if (!pkg) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (input.branchId && input.branchId !== pkg.branchId)
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        const account = await tx.paymentAccount.findFirst({
          where: { branchId: pkg.branchId, active: true },
          orderBy: { createdAt: 'desc' },
        });
        if (!account) throw new ApiProblem('PAYMENT_ACCOUNT_UNAVAILABLE', HttpStatus.CONFLICT);
        if (input.slotId) {
          const slot = await tx.classSlot.findUnique({ where: { id: input.slotId } });
          if (!slot || slot.branchId !== pkg.branchId || slot.classTypeId !== pkg.classTypeId)
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        }
        const purchaseId = newId();
        const expiresAt = new Date(now.getTime() + account.paymentWindowHours * 3600000);
        await tx.purchase.create({
          data: {
            id: purchaseId,
            userId: p.userId,
            branchId: pkg.branchId,
            packageId: pkg.id,
            paymentAccountId: account.id,
            paymentBankNameSnapshot: account.bankName,
            paymentAccountNumberSnapshotEncrypted: account.accountNumberEncrypted,
            paymentAccountLast4Snapshot: account.accountNumberLast4,
            paymentAccountHolderSnapshot: account.accountHolderName,
            paymentExpiresAt: expiresAt,
            continuationClassSlotId: input.slotId || null,
            packageNameSnapshot: pkg.name,
            priceRpSnapshot: pkg.priceRp,
            sessionCountSnapshot: pkg.sessionCount,
            durationDaysSnapshot: pkg.durationDays,
            status: 'AWAITING_PAYMENT',
            idempotencyKeyHash: digest(key),
          },
        });
        const uniquePayment = await this.reserveUniqueCode(tx, {
          purchaseId,
          paymentAccountId: account.id,
          priceRp: pkg.priceRp,
          expiresAt,
        });
        const purchase = await tx.purchase.update({
          where: { id: purchaseId },
          data: {
            paymentUniqueCode: uniquePayment.code,
            payableAmountRpSnapshot: uniquePayment.payableAmountRp,
          },
          include: { branch: true, paymentProof: true },
        });
        await tx.outboxEvent.create({
          data: {
            id: newId(),
            eventType: 'order.created.v1',
            aggregateType: 'Purchase',
            aggregateId: purchase.id,
            payload: { orderId: purchase.id, status: 'AWAITING_PAYMENT' },
            correlationId,
          },
        });
        await this.access.audit(
          tx,
          p,
          'ORDER_CREATED',
          'Purchase',
          purchase.id,
          pkg.branchId,
          correlationId,
        );
        return { status: 201, body: this.orderView(purchase, true) as Prisma.InputJsonValue };
      },
    );
  }

  async listOrders(p: SessionPrincipal, status?: string) {
    this.access.catalog(p);
    await this.expireOwnOrders(p.userId);
    const allowed = [
      'AWAITING_PAYMENT',
      'PENDING',
      'ACTION_REQUIRED',
      'APPROVED',
      'REJECTED',
      'EXPIRED',
    ];
    if (status && !allowed.includes(status))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const items = await this.db.purchase.findMany({
      where: { userId: p.userId, ...(status ? { status: status as any } : {}) },
      include: { branch: true, paymentProof: true },
      orderBy: { submittedAt: 'desc' },
    });
    return {
      items: items.map((item) => this.orderView(item, false)),
      page: { hasMore: false, nextCursor: null },
    };
  }

  async orderDetail(p: SessionPrincipal, id: string) {
    this.access.catalog(p);
    await this.expireOwnOrders(p.userId);
    const order = await this.db.purchase.findFirst({
      where: { id, userId: p.userId },
      include: { branch: true, paymentProof: true },
    });
    if (!order) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return this.orderView(order, true);
  }
  async attachOrderProof(p: SessionPrincipal, orderId: string, input: any, correlationId: string) {
    this.access.catalog(p);
    if (!input?.paymentProofId || !Number.isInteger(input.expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const [order, proof] = await Promise.all([
      this.db.purchase.findFirst({
        where: { id: orderId, userId: p.userId },
        include: { branch: true, paymentProof: true },
      }),
      this.db.paymentProof.findFirst({ where: { id: input.paymentProofId, userId: p.userId } }),
    ]);
    if (!order || !proof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (order.status === 'PENDING' && order.paymentProofId === proof.id)
      return this.orderView(order, true);
    if (
      !['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status) ||
      order.version !== input.expectedVersion
    )
      throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
    if (!order.paymentExpiresAt || order.paymentExpiresAt <= new Date()) {
      await this.db.purchase.updateMany({
        where: { id: order.id, version: order.version },
        data: { status: 'EXPIRED', version: { increment: 1 } },
      });
      throw new ApiProblem('ORDER_EXPIRED', HttpStatus.CONFLICT);
    }
    if (
      proof.branchId !== order.branchId ||
      proof.packageId !== order.packageId ||
      proof.uploadStatus !== 'FINALIZED' ||
      proof.scanStatus !== 'CLEAN' ||
      !proof.providerReferenceHash
    )
      throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
    return this.db.$transaction(async (tx) => {
      const updated = await tx.purchase.update({
        where: { id: order.id, version: order.version },
        data: {
          paymentProofId: proof.id,
          status: 'PENDING',
          decisionReasonCode: null,
          decidedAt: null,
          decidedById: null,
          version: { increment: 1 },
        },
        include: { branch: true, paymentProof: true },
      });
      if (order.paymentProofId)
        await tx.paymentProof.update({
          where: { id: order.paymentProofId },
          data: { replacedById: proof.id },
        });
      await tx.outboxEvent.create({
        data: {
          id: newId(),
          eventType: 'order.payment-proof.submitted.v1',
          aggregateType: 'Purchase',
          aggregateId: order.id,
          payload: { orderId: order.id, status: 'PENDING' },
          correlationId,
        },
      });
      await this.access.audit(
        tx,
        p,
        'ORDER_PAYMENT_SUBMITTED',
        'Purchase',
        order.id,
        order.branchId,
        correlationId,
      );
      return this.orderView(updated, true);
    });
  }
  async submit(p: SessionPrincipal, input: any, key: string, correlationId: string) {
    this.access.catalog(p);
    await this.access.requireVerifiedCustomer(p);
    if (!key) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    syntheticConfigSeconds('PURCHASE_IDEMPOTENCY_TTL_SECONDS', 86400);
    return this.idem.execute(
      { scope: `purchase:${p.userId}`, key, payload: input, ttlMs: 86400000, leaseMs: 30000 },
      async (tx) => {
        const proofId = input.paymentProofId ?? input.paymentProofUploadId;
        const pkg = await tx.package.findUnique({ where: { id: input.packageId } });
        const proof = await tx.paymentProof.findUnique({ where: { id: proofId } });
        const now = new Date();
        if (
          !pkg ||
          pkg.status !== 'ACTIVE' ||
          pkg.effectiveFrom > now ||
          (pkg.effectiveUntil && pkg.effectiveUntil <= now)
        )
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (
          !proof ||
          proof.userId !== p.userId ||
          proof.branchId !== pkg.branchId ||
          proof.scanStatus !== 'CLEAN' ||
          proof.uploadStatus !== 'FINALIZED'
        )
          throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
        const purchase = await tx.purchase.create({
          data: {
            id: newId(),
            userId: p.userId,
            branchId: pkg.branchId,
            packageId: pkg.id,
            paymentProofId: proof.id,
            packageNameSnapshot: pkg.name,
            priceRpSnapshot: pkg.priceRp,
            sessionCountSnapshot: pkg.sessionCount,
            durationDaysSnapshot: pkg.durationDays,
            idempotencyKeyHash: digest(key),
          },
        });
        await tx.outboxEvent.create({
          data: {
            id: newId(),
            eventType: 'purchase.submitted.v1',
            aggregateType: 'Purchase',
            aggregateId: purchase.id,
            payload: { purchaseId: purchase.id, status: 'PENDING' },
            correlationId,
          },
        });
        await this.access.audit(
          tx,
          p,
          'PURCHASE_SUBMITTED',
          'Purchase',
          purchase.id,
          pkg.branchId,
          correlationId,
        );
        return { status: 201, body: purchase as unknown as Prisma.InputJsonValue };
      },
    );
  }
}
