import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, digest, newId, syntheticConfigSeconds } from '../identity/security';
import { dateInTimeZone, startOfLocalDateUtc } from '../identity/assignment-boundary';
import {
  ConfigGatedMalwareScanProvider,
  ConfigGatedObjectStorageProvider,
} from './proof-providers';
import {
  decryptAccountNumber,
  encryptAccountNumber,
  maskedAccountNumber,
  normalizeAccountNumber,
} from './payment-account-security';

@Injectable()
export class PackagesService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly idem: IdempotencyService,
    private readonly storage: ConfigGatedObjectStorageProvider,
    private readonly scanner: ConfigGatedMalwareScanProvider,
  ) {}
  private auth(p: SessionPrincipal, mutation = false) {
    this.policy.requireCapability(p.capabilities, mutation ? 'master:manage' : 'package:read');
  }
  private reviewAuth(p: SessionPrincipal, mutation = false) {
    const current = mutation ? 'payment:decide' : 'payment:review';
    const legacy = mutation ? 'purchase:decide' : 'purchase:review';
    if (!p.capabilities.includes(current) && !p.capabilities.includes(legacy))
      this.policy.requireCapability(p.capabilities, current);
  }
  private paymentAccountAuth(p: SessionPrincipal, mutation = false) {
    this.policy.requireCapability(
      p.capabilities,
      mutation ? 'payment-account:manage' : 'payment-account:read',
    );
  }
  private scope(p: SessionPrincipal, branchId: string) {
    if (
      !p.capabilities.includes('branch:all') &&
      !p.capabilities.includes('finance:reconcile') &&
      !p.branchIds.includes(branchId)
    )
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
  private async requireVerifiedCustomer(p: SessionPrincipal) {
    if (!p.roles.some(({ role }) => role === 'CUSTOMER')) return;
    const approved = await this.db.identityVerificationDocument.groupBy({
      by: ['kind'],
      where: { userId: p.userId, status: 'APPROVED', replacedById: null },
    });
    if (!['SELFIE', 'KTP_FRONT'].every((kind) => approved.some((item) => item.kind === kind)))
      throw new ApiProblem('IDENTITY_VERIFICATION_REQUIRED', HttpStatus.FORBIDDEN);
  }
  private audit(
    tx: Prisma.TransactionClient,
    p: SessionPrincipal,
    action: string,
    type: string,
    id: string,
    branchId: string,
    correlationId: string,
  ) {
    return tx.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: p.userId,
        action,
        objectType: type,
        objectId: id,
        branchId,
        correlationId,
        afterMasked: { status: 'masked' },
      },
    });
  }
  async listPackages(p: SessionPrincipal, branchId?: string) {
    this.auth(p);
    const customer =
      p.roles.some(({ role }) => role === 'CUSTOMER') &&
      !p.capabilities.includes('branch:all') &&
      !p.capabilities.includes('branch:operate') &&
      !p.capabilities.includes('branch:manage');
    if (branchId && !customer) this.scope(p, branchId);
    if (branchId && customer) {
      const branch = await this.db.branch.findUnique({ where: { id: branchId } });
      if (!branch?.active) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const now = new Date();
    const items = await this.db.package.findMany({
      where: {
        ...(branchId
          ? { branchId }
          : customer
            ? {}
            : p.capabilities.includes('branch:all')
              ? {}
              : { branchId: { in: p.branchIds } }),
        status: 'ACTIVE',
        effectiveFrom: { lte: now },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
      },
      orderBy: [{ branchId: 'asc' }, { effectiveFrom: 'desc' }],
    });
    return { items, page: { nextCursor: null, hasMore: false } };
  }
  async createPackage(p: SessionPrincipal, input: any, correlationId: string) {
    this.auth(p, true);
    this.scope(p, input.branchId);
    if (
      !input.name ||
      !Number.isInteger(input.sessionCount) ||
      input.sessionCount < 1 ||
      !Number.isInteger(input.durationDays) ||
      input.durationDays < 1 ||
      !Number.isInteger(input.priceRp) ||
      input.priceRp < 1 ||
      !input.effectiveFrom
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (input.effectiveUntil && input.effectiveUntil <= input.effectiveFrom)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const businessKey = String(input.businessKey ?? input.name)
      .trim()
      .toUpperCase();
    const effectiveFrom = new Date(input.effectiveFrom);
    const effectiveUntil = input.effectiveUntil ? new Date(input.effectiveUntil) : null;
    try {
      return await this.db.$transaction(
        async (tx) => {
          await tx.$queryRaw`
            SELECT \`id\`
            FROM \`ClassType\`
            WHERE \`id\` = ${input.classTypeId}
            FOR UPDATE
          `;
          const b = await tx.branch.findUnique({ where: { id: input.branchId } });
          const c = await tx.classType.findUnique({ where: { id: input.classTypeId } });
          if (!b?.active || !c?.active || c.branchId !== input.branchId)
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          const overlap = await tx.package.findFirst({
            where: {
              branchId: input.branchId,
              classTypeId: input.classTypeId,
              businessKey,
              effectiveFrom: effectiveUntil ? { lt: effectiveUntil } : undefined,
              OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: effectiveFrom } }],
            },
          });
          if (overlap) throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          const x = await tx.package.create({
            data: {
              id: newId(),
              branchId: input.branchId,
              classTypeId: input.classTypeId,
              businessKey,
              name: input.name.trim(),
              sessionCount: input.sessionCount,
              durationDays: input.durationDays,
              priceRp: input.priceRp,
              effectiveFrom,
              effectiveUntil,
            },
          });
          await this.audit(tx, p, 'PACKAGE_CREATED', 'Package', x.id, x.branchId, correlationId);
          return x;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        ['P2002', 'P2004', 'P2010'].includes(e.code)
      )
        throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
      throw e;
    }
  }
  private paymentAccountView(account: {
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

  async listPaymentAccounts(p: SessionPrincipal, branchId?: string) {
    this.paymentAccountAuth(p);
    if (branchId) this.scope(p, branchId);
    const items = await this.db.paymentAccount.findMany({
      where: {
        ...(branchId
          ? { branchId }
          : p.capabilities.includes('branch:all')
            ? {}
            : { branchId: { in: p.branchIds } }),
      },
      orderBy: [{ branchId: 'asc' }, { createdAt: 'desc' }],
    });
    return { items: items.map((item) => this.paymentAccountView(item)) };
  }

  async createPaymentAccount(p: SessionPrincipal, input: any, correlationId: string) {
    this.paymentAccountAuth(p, true);
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
    this.scope(p, input.branchId);
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
            actorId: p.userId,
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
        return this.paymentAccountView(account);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async deactivatePaymentAccount(
    p: SessionPrincipal,
    id: string,
    input: any,
    correlationId: string,
  ) {
    this.paymentAccountAuth(p, true);
    if (!Number.isInteger(input?.expectedVersion) || !input?.reason?.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.db.$transaction(
      async (tx) => {
        const account = await tx.paymentAccount.findUnique({ where: { id } });
        if (!account) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.scope(p, account.branchId);
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
            actorId: p.userId,
            action: 'PAYMENT_ACCOUNT_DEACTIVATED',
            objectType: 'PaymentAccount',
            objectId: id,
            branchId: account.branchId,
            correlationId,
            beforeMasked: { active: true },
            afterMasked: { active: false, reason: input.reason.trim() },
          },
        });
        return this.paymentAccountView(updated);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async checkoutOptions(p: SessionPrincipal, packageId: string) {
    this.auth(p);
    await this.requireVerifiedCustomer(p);
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
    await this.db.purchase.updateMany({
      where: {
        userId,
        status: { in: ['AWAITING_PAYMENT', 'ACTION_REQUIRED'] },
        paymentExpiresAt: { lte: new Date() },
      },
      data: { status: 'EXPIRED', version: { increment: 1 } },
    });
  }

  private orderView(order: any, revealAccount = false) {
    return {
      id: order.id,
      branchId: order.branchId,
      branchName: order.branch?.name,
      packageId: order.packageId,
      packageName: order.packageNameSnapshot,
      priceRp: order.priceRpSnapshot,
      sessionCount: order.sessionCountSnapshot,
      durationDays: order.durationDaysSnapshot,
      status: order.status,
      submittedAt: order.submittedAt,
      expiresAt: order.paymentExpiresAt,
      continuationSlotId: order.continuationClassSlotId,
      paymentProofId: order.paymentProofId,
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

  async createOrder(p: SessionPrincipal, input: any, key: string, correlationId: string) {
    this.auth(p);
    await this.requireVerifiedCustomer(p);
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
        const purchase = await tx.purchase.create({
          data: {
            id: newId(),
            userId: p.userId,
            branchId: pkg.branchId,
            packageId: pkg.id,
            paymentAccountId: account.id,
            paymentBankNameSnapshot: account.bankName,
            paymentAccountNumberSnapshotEncrypted: account.accountNumberEncrypted,
            paymentAccountLast4Snapshot: account.accountNumberLast4,
            paymentAccountHolderSnapshot: account.accountHolderName,
            paymentExpiresAt: new Date(now.getTime() + account.paymentWindowHours * 3600000),
            continuationClassSlotId: input.slotId || null,
            packageNameSnapshot: pkg.name,
            priceRpSnapshot: pkg.priceRp,
            sessionCountSnapshot: pkg.sessionCount,
            durationDaysSnapshot: pkg.durationDays,
            status: 'AWAITING_PAYMENT',
            idempotencyKeyHash: digest(key),
          },
          include: { branch: true },
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
        await this.audit(
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
    this.auth(p);
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
      include: { branch: true },
      orderBy: { submittedAt: 'desc' },
    });
    return {
      items: items.map((item) => this.orderView(item, false)),
      page: { hasMore: false, nextCursor: null },
    };
  }

  async orderDetail(p: SessionPrincipal, id: string) {
    this.auth(p);
    await this.expireOwnOrders(p.userId);
    const order = await this.db.purchase.findFirst({
      where: { id, userId: p.userId },
      include: { branch: true },
    });
    if (!order) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return this.orderView(order, true);
  }
  async issueProof(p: SessionPrincipal, input: any, correlationId: string) {
    this.auth(p);
    const upload = this.storage.issuePrivateUpload();
    if (
      !input.branchId ||
      !input.fileName ||
      !input.mimeType ||
      !Number.isInteger(input.sizeBytes) ||
      input.sizeBytes < 1 ||
      !/^[a-fA-F0-9]{64}$/.test(input.checksum ?? input.sha256 ?? '')
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(input.mimeType))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (!/\.(png|jpe?g|pdf)$/i.test(input.fileName))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const maxBytes = Number(
      process.env.PAYMENT_PROOF_SYNTHETIC_MAX_BYTES ??
        (process.env.NODE_ENV === 'production' ? 0 : 10 * 1024 * 1024),
    );
    if (!Number.isInteger(maxBytes) || maxBytes < 1)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    if (input.sizeBytes > maxBytes)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const branch = await this.db.branch.findUnique({ where: { id: input.branchId } });
    if (!branch?.active) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (input.packageId) {
      const pkg = await this.db.package.findUnique({ where: { id: input.packageId } });
      if (!pkg || pkg.branchId !== input.branchId)
        throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (input.orderId) {
      const order = await this.db.purchase.findFirst({
        where: { id: input.orderId, userId: p.userId },
      });
      if (
        !order ||
        order.branchId !== input.branchId ||
        (input.packageId && order.packageId !== input.packageId) ||
        !['AWAITING_PAYMENT', 'ACTION_REQUIRED'].includes(order.status) ||
        !order.paymentExpiresAt ||
        order.paymentExpiresAt <= new Date()
      )
        throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const id = newId();
    const proof = await this.db.$transaction(async (tx) => {
      const x = await tx.paymentProof.create({
        data: {
          id,
          userId: p.userId,
          branchId: input.branchId,
          packageId: input.packageId,
          objectKey: upload.objectKey,
          checksum: digest(input.checksum ?? input.sha256),
          fileName: input.fileName,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
        },
      });
      await this.audit(
        tx,
        p,
        'PAYMENT_PROOF_ISSUED',
        'PaymentProof',
        id,
        input.branchId,
        correlationId,
      );
      return x;
    });
    return {
      id: proof.id,
      status: proof.uploadStatus,
      scanStatus: proof.scanStatus,
      uploadReference: upload.uploadReference,
    };
  }

  async uploadProofContent(p: SessionPrincipal, id: string, bytes: Buffer) {
    this.auth(p);
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
    if (!proof || proof.userId !== p.userId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (proof.uploadStatus !== 'ISSUED') throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
    if (!Buffer.isBuffer(bytes) || bytes.length !== proof.sizeBytes)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const signatureMatches =
      (proof.mimeType === 'image/jpeg' &&
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff) ||
      (proof.mimeType === 'image/png' &&
        bytes
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) ||
      (proof.mimeType === 'application/pdf' && bytes.subarray(0, 5).toString('ascii') === '%PDF-');
    if (!signatureMatches)
      throw new ApiProblem('PAYMENT_PROOF_MIME_MISMATCH', HttpStatus.BAD_REQUEST);
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    if (digest(sha256) !== proof.checksum)
      throw new ApiProblem('PAYMENT_PROOF_CHECKSUM_MISMATCH', HttpStatus.BAD_REQUEST);
    await this.storage.storePrivateObject(proof.objectKey, bytes);
    const updated = await this.db.paymentProof.update({
      where: { id },
      data: {
        uploadStatus: 'UPLOADED',
        uploadedAt: new Date(),
        providerReferenceHash: digest(`${proof.objectKey}:${sha256}:${bytes.length}`),
        version: { increment: 1 },
      },
    });
    return { id: updated.id, uploadStatus: updated.uploadStatus, scanStatus: updated.scanStatus };
  }
  async finalizeProof(
    p: SessionPrincipal,
    id: string,
    input: { sha256: string; sizeBytes: number },
    correlationId: string,
  ) {
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
    if (!proof || proof.userId !== p.userId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (proof.uploadStatus !== 'UPLOADED' || !proof.providerReferenceHash)
      throw new ApiProblem('UPLOAD_NOT_COMPLETE', HttpStatus.CONFLICT);
    if (
      !input ||
      input.sizeBytes !== proof.sizeBytes ||
      !/^[a-fA-F0-9]{64}$/.test(input.sha256) ||
      digest(input.sha256) !== proof.checksum
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const scanStatus = this.scanner.scanPrivateObject(proof.objectKey);
    const x = await this.db.$transaction(async (tx) => {
      const updated = await tx.paymentProof.update({
        where: { id },
        data: {
          uploadStatus: 'FINALIZED',
          scanStatus,
          uploadedAt: new Date(),
          finalizedAt: new Date(),
        },
      });
      await this.audit(
        tx,
        p,
        'PAYMENT_PROOF_FINALIZED',
        'PaymentProof',
        id,
        proof.branchId,
        correlationId,
      );
      return updated;
    });
    return {
      id: x.id,
      uploadStatus: x.uploadStatus,
      scanStatus: x.scanStatus,
      fileName: x.fileName,
      mimeType: x.mimeType,
      sizeBytes: x.sizeBytes,
      version: x.version,
    };
  }
  async status(p: SessionPrincipal, id: string) {
    this.auth(p);
    const x = await this.db.paymentProof.findUnique({ where: { id } });
    if (!x || x.userId !== p.userId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return {
      id: x.id,
      uploadStatus: x.uploadStatus,
      scanStatus: x.scanStatus,
      fileName: x.fileName,
      mimeType: x.mimeType,
      sizeBytes: x.sizeBytes,
      replacedById: x.replacedById,
      version: x.version,
    };
  }
  async replaceProof(p: SessionPrincipal, purchaseId: string, input: any, correlationId: string) {
    this.auth(p);
    const nextId = input.paymentProofId ?? input.newPaymentProofUploadId;
    const next = await this.db.paymentProof.findUnique({ where: { id: nextId } });
    const current = await this.db.purchase.findUnique({ where: { id: purchaseId } });
    if (!current || current.userId !== p.userId || !next || next.userId !== p.userId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (next.scanStatus !== 'CLEAN' || next.uploadStatus !== 'FINALIZED')
      throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
    try {
      return await this.db.$transaction(async (tx) => {
        const changed = await tx.purchase.update({
          where: { id: purchaseId, version: input.expectedVersion },
          data: { paymentProofId: next.id, version: { increment: 1 } },
        });
        if (current.paymentProofId)
          await tx.paymentProof.update({
            where: { id: current.paymentProofId },
            data: { replacedById: next.id },
          });
        await this.audit(
          tx,
          p,
          'PAYMENT_PROOF_REPLACED',
          'Purchase',
          purchaseId,
          current.branchId,
          correlationId,
        );
        return changed;
      });
    } catch {
      throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
    }
  }
  async attachOrderProof(p: SessionPrincipal, orderId: string, input: any, correlationId: string) {
    this.auth(p);
    if (!input?.paymentProofId || !Number.isInteger(input.expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const [order, proof] = await Promise.all([
      this.db.purchase.findFirst({ where: { id: orderId, userId: p.userId } }),
      this.db.paymentProof.findFirst({ where: { id: input.paymentProofId, userId: p.userId } }),
    ]);
    if (!order || !proof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
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
        include: { branch: true },
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
      await this.audit(
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
    this.auth(p);
    await this.requireVerifiedCustomer(p);
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
        await this.audit(
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
  async listPurchases(p: SessionPrincipal, branchId?: string) {
    const reviewer =
      p.capabilities.includes('payment:review') || p.capabilities.includes('purchase:review');
    if (reviewer) this.reviewAuth(p);
    else this.auth(p);
    if (branchId) this.scope(p, branchId);
    const items = await this.db.purchase.findMany({
      where: {
        ...(!reviewer ? { userId: p.userId } : {}),
        ...(branchId
          ? { branchId }
          : reviewer &&
              !p.capabilities.includes('branch:all') &&
              !p.capabilities.includes('finance:reconcile')
            ? { branchId: { in: p.branchIds } }
            : {}),
      },
      orderBy: { submittedAt: 'desc' },
    });
    return {
      items: items.map(({ paymentAccountNumberSnapshotEncrypted, ...item }) => {
        void paymentAccountNumberSnapshotEncrypted;
        return item;
      }),
      page: { nextCursor: null, hasMore: false },
    };
  }

  async authorizeProofDownload(p: SessionPrincipal, id: string) {
    this.reviewAuth(p);
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
    if (!proof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.scope(p, proof.branchId);
    if (proof.uploadStatus !== 'FINALIZED' || proof.scanStatus !== 'CLEAN')
      throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
    const ttl = syntheticConfigSeconds('PAYMENT_PROOF_TTL_SECONDS', 900);
    return {
      url: `/api/v1/uploads/payment-proofs/${id}/content-view`,
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    };
  }

  async viewProofContent(p: SessionPrincipal, id: string) {
    this.reviewAuth(p);
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
    if (!proof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.scope(p, proof.branchId);
    if (proof.uploadStatus !== 'FINALIZED' || proof.scanStatus !== 'CLEAN')
      throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
    return {
      bytes: await this.storage.readPrivateObject(proof.objectKey),
      mimeType: proof.mimeType,
    };
  }

  async decidePurchase(
    p: SessionPrincipal,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    input: { reasonCode?: string; expectedVersion?: number },
    key: string,
    correlationId: string,
  ) {
    this.reviewAuth(p, true);
    if (!key || !Number.isInteger(input?.expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const approvalReasons = ['PAYMENT_VERIFIED'];
    const rejectionReasons = [
      'PROOF_INVALID',
      'AMOUNT_MISMATCH',
      'DUPLICATE_PURCHASE',
      'OTHER_REVIEW_REQUIRED',
    ];
    if (!(decision === 'APPROVED' ? approvalReasons : rejectionReasons).includes(input.reasonCode!))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    syntheticConfigSeconds('PURCHASE_DECISION_IDEMPOTENCY_TTL_SECONDS', 86400);
    try {
      return await this.idem.execute(
        {
          scope: `purchase-decision:${id}`,
          key,
          payload: {
            decision,
            reasonCode: input.reasonCode,
            expectedVersion: input.expectedVersion,
          },
          ttlMs: 86400000,
          leaseMs: 30000,
        },
        async (tx) => {
          const purchase = await tx.purchase.findUnique({
            where: { id },
            include: { paymentProof: true, package: true, branch: true },
          });
          if (!purchase) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          this.scope(p, purchase.branchId);
          if (purchase.userId === p.userId)
            throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.FORBIDDEN);
          if (purchase.status !== 'PENDING')
            throw new ApiProblem('PURCHASE_ALREADY_DECIDED', HttpStatus.CONFLICT);
          if (purchase.version !== input.expectedVersion)
            throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          if (
            !purchase.paymentProof ||
            purchase.paymentProof.uploadStatus !== 'FINALIZED' ||
            purchase.paymentProof.scanStatus !== 'CLEAN'
          )
            throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);

          const decidedAt = new Date();
          const nextStatus =
            decision === 'REJECTED' && input.reasonCode !== 'DUPLICATE_PURCHASE'
              ? ('ACTION_REQUIRED' as const)
              : decision;
          const updated = await tx.purchase.update({
            where: { id, status: 'PENDING', version: input.expectedVersion },
            data: {
              status: nextStatus,
              decidedAt,
              decidedById: p.userId,
              decisionReasonCode: input.reasonCode!,
              version: { increment: 1 },
            },
          });
          let customerPackage = null;
          let ledgerEntry = null;
          if (decision === 'APPROVED') {
            const activationDate = dateInTimeZone(decidedAt, purchase.branch.timezone);
            const [year, month, day] = activationDate.split('-').map(Number);
            const expiryDate = new Date(
              Date.UTC(year!, month! - 1, day! + purchase.durationDaysSnapshot),
            )
              .toISOString()
              .slice(0, 10);
            const effectiveDate = new Date(`${activationDate}T00:00:00Z`);
            const projection = await tx.effectiveConfiguration.findFirst({
              where: {
                kind: 'PROJECTION_RATE',
                branchId: purchase.branchId,
                classTypeId: purchase.package.classTypeId,
                effectiveFrom: { lte: effectiveDate },
                OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: effectiveDate } }],
              },
              orderBy: { effectiveFrom: 'desc' },
            });
            const rate = (projection?.value as { rateRp?: unknown } | undefined)?.rateRp;
            if (!Number.isSafeInteger(rate) || Number(rate) < 0)
              throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
            customerPackage = await tx.customerPackage.create({
              data: {
                id: newId(),
                purchaseId: purchase.id,
                customerUserId: purchase.userId,
                branchId: purchase.branchId,
                packageId: purchase.packageId,
                classTypeId: purchase.package.classTypeId,
                activationDate: effectiveDate,
                expiryAt: startOfLocalDateUtc(expiryDate, purchase.branch.timezone),
                salePriceRp: purchase.priceRpSnapshot,
                sessionCountSnapshot: purchase.sessionCountSnapshot,
                durationDaysSnapshot: purchase.durationDaysSnapshot,
                projectionRateRp: Number(rate),
              },
            });
            ledgerEntry = await tx.ledgerEntry.create({
              data: {
                id: newId(),
                customerPackageId: customerPackage.id,
                type: 'PURCHASE',
                quantity: purchase.sessionCountSnapshot,
                referenceType: 'PURCHASE',
                referenceId: purchase.id,
              },
            });
          }
          await tx.outboxEvent.create({
            data: {
              id: newId(),
              eventType:
                nextStatus === 'APPROVED'
                  ? 'purchase.approved.v1'
                  : nextStatus === 'ACTION_REQUIRED'
                    ? 'order.action-required.v1'
                    : 'purchase.rejected.v1',
              aggregateType: 'Purchase',
              aggregateId: purchase.id,
              payload: {
                purchaseId: purchase.id,
                status: nextStatus,
                reasonCode: input.reasonCode!,
              },
              correlationId,
            },
          });
          await this.audit(
            tx,
            p,
            nextStatus === 'APPROVED'
              ? 'PURCHASE_APPROVED'
              : nextStatus === 'ACTION_REQUIRED'
                ? 'ORDER_ACTION_REQUIRED'
                : 'PURCHASE_REJECTED',
            'Purchase',
            purchase.id,
            purchase.branchId,
            correlationId,
          );
          return {
            status: 200,
            body: (decision === 'APPROVED'
              ? { purchase: updated, customerPackage, ledgerEntry, idempotentReplay: false }
              : updated) as unknown as Prisma.InputJsonValue,
          };
        },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')
        throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }
}
