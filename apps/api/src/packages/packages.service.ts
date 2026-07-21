import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    if (mutation) this.policy.requireMfa(p.assurance);
  }
  private reviewAuth(p: SessionPrincipal, mutation = false) {
    this.policy.requireCapability(p.capabilities, mutation ? 'purchase:decide' : 'purchase:review');
    if (mutation) this.policy.requireMfa(p.assurance);
  }
  private scope(p: SessionPrincipal, branchId: string) {
    if (!p.capabilities.includes('branch:all') && !p.branchIds.includes(branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
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
    if (branchId) this.scope(p, branchId);
    const now = new Date();
    const items = await this.db.package.findMany({
      where: {
        ...(branchId
          ? { branchId }
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
    try {
      return await this.db.$transaction(
        async (tx) => {
          const b = await tx.branch.findUnique({ where: { id: input.branchId } });
          const c = await tx.classType.findUnique({ where: { id: input.classTypeId } });
          if (!b?.active || !c?.active || c.branchId !== input.branchId)
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          const x = await tx.package.create({
            data: {
              id: newId(),
              branchId: input.branchId,
              classTypeId: input.classTypeId,
              businessKey: String(input.businessKey ?? input.name)
                .trim()
                .toUpperCase(),
              name: input.name.trim(),
              sessionCount: input.sessionCount,
              durationDays: input.durationDays,
              priceRp: input.priceRp,
              effectiveFrom: new Date(input.effectiveFrom),
              effectiveUntil: input.effectiveUntil ? new Date(input.effectiveUntil) : null,
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
  async issueProof(p: SessionPrincipal, input: any, correlationId: string) {
    const upload = this.storage.issuePrivateUpload();
    this.auth(p);
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
    const maxBytes = Number(process.env.PAYMENT_PROOF_SYNTHETIC_MAX_BYTES ?? 0);
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
  async finalizeProof(
    p: SessionPrincipal,
    id: string,
    input: { sha256: string; sizeBytes: number },
    correlationId: string,
  ) {
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
    if (!proof || proof.userId !== p.userId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (proof.uploadStatus !== 'ISSUED') throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
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
  async submit(p: SessionPrincipal, input: any, key: string, correlationId: string) {
    this.auth(p);
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
    const reviewer = p.capabilities.includes('purchase:review');
    if (reviewer) this.reviewAuth(p);
    else this.auth(p);
    if (branchId) this.scope(p, branchId);
    const items = await this.db.purchase.findMany({
      where: {
        ...(!reviewer ? { userId: p.userId } : {}),
        ...(branchId
          ? { branchId }
          : reviewer && !p.capabilities.includes('branch:all')
            ? { branchId: { in: p.branchIds } }
            : {}),
      },
      orderBy: { submittedAt: 'desc' },
    });
    return { items, page: { nextCursor: null, hasMore: false } };
  }

  async authorizeProofDownload(p: SessionPrincipal, id: string) {
    this.reviewAuth(p, true);
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
    if (!proof) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.scope(p, proof.branchId);
    if (proof.uploadStatus !== 'FINALIZED' || proof.scanStatus !== 'CLEAN')
      throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);
    return this.storage.authorizePrivateDownload(proof.objectKey);
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
            purchase.paymentProof.uploadStatus !== 'FINALIZED' ||
            purchase.paymentProof.scanStatus !== 'CLEAN'
          )
            throw new ApiProblem('PAYMENT_PROOF_NOT_CLEAN', HttpStatus.CONFLICT);

          const decidedAt = new Date();
          const updated = await tx.purchase.update({
            where: { id, status: 'PENDING', version: input.expectedVersion },
            data: {
              status: decision,
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
              eventType: decision === 'APPROVED' ? 'purchase.approved.v1' : 'purchase.rejected.v1',
              aggregateType: 'Purchase',
              aggregateId: purchase.id,
              payload: { purchaseId: purchase.id, status: decision, reasonCode: input.reasonCode! },
              correlationId,
            },
          });
          await this.audit(
            tx,
            p,
            decision === 'APPROVED' ? 'PURCHASE_APPROVED' : 'PURCHASE_REJECTED',
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
