import { HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, digest, newId } from '../identity/security';
import { PackageAccessService } from './package-access.service';
import {
  ConfigGatedMalwareScanProvider,
  ConfigGatedObjectStorageProvider,
} from './proof-providers';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { recordPilotRollbackOutbox } from '../migration/pilot-rollback-outbox.service';

@Injectable()
export class PaymentProofService {
  constructor(
    private readonly db: PrismaService,
    private readonly storage: ConfigGatedObjectStorageProvider,
    private readonly scanner: ConfigGatedMalwareScanProvider,
    private readonly access: PackageAccessService,
    private readonly config: RuntimeConfigService,
  ) {}

  async issue(principal: SessionPrincipal, input: any, correlationId: string) {
    this.access.catalog(principal);
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
    const maxBytes = this.config.value.paymentProof.maxBytes;
    if (!Number.isInteger(maxBytes) || maxBytes < 1)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    if (input.sizeBytes > maxBytes)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const branch = await this.db.branch.findUnique({ where: { id: input.branchId } });
    if (!branch?.active) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (input.packageId) {
      const pkg = await this.db.package.findUnique({
        where: { id: input.packageId },
        select: {
          id: true,
          branchScopes: {
            where: { active: true },
            select: { branchId: true },
          },
        },
      });

      if (
        !pkg ||
        !pkg.branchScopes.some((scope) => scope.branchId === input.branchId)
      )
        throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (input.orderId) {
      const order = await this.db.purchase.findFirst({
        where: { id: input.orderId, userId: principal.userId },
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
      const created = await tx.paymentProof.create({
        data: {
          id,
          userId: principal.userId,
          branchId: input.branchId,
          packageId: input.packageId,
          objectKey: upload.objectKey,
          checksum: digest(input.checksum ?? input.sha256),
          fileName: input.fileName,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
        },
      });
      await this.access.audit(
        tx,
        principal,
        'PAYMENT_PROOF_ISSUED',
        'PaymentProof',
        id,
        input.branchId,
        correlationId,
      );
      return created;
    });
    return {
      id: proof.id,
      status: proof.uploadStatus,
      scanStatus: proof.scanStatus,
      uploadReference: upload.uploadReference,
    };
  }

  async uploadContent(principal: SessionPrincipal, id: string, bytes: Buffer) {
    this.access.catalog(principal);
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
    if (!proof || proof.userId !== principal.userId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (proof.uploadStatus === 'UPLOADED' || proof.uploadStatus === 'FINALIZED')
      return { id: proof.id, uploadStatus: proof.uploadStatus, scanStatus: proof.scanStatus };
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
    try {
      await this.storage.storePrivateObject(proof.objectKey, bytes);
    } catch {
      throw new ApiProblem(
        'PAYMENT_PROOF_STORAGE_UNAVAILABLE',
        HttpStatus.SERVICE_UNAVAILABLE,
        true,
      );
    }
    let updated;
    try {
      updated = await this.db.paymentProof.update({
        where: { id },
        data: {
          uploadStatus: 'UPLOADED',
          uploadedAt: new Date(),
          providerReferenceHash: digest(`${proof.objectKey}:${sha256}:${bytes.length}`),
          version: { increment: 1 },
        },
      });
    } catch (error) {
      await this.storage.deletePrivateObject(proof.objectKey).catch(() => undefined);
      throw error;
    }
    return { id: updated.id, uploadStatus: updated.uploadStatus, scanStatus: updated.scanStatus };
  }

  async finalize(
    principal: SessionPrincipal,
    id: string,
    input: { sha256: string; sizeBytes: number },
    correlationId: string,
  ) {
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
    if (!proof || proof.userId !== principal.userId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (proof.uploadStatus === 'FINALIZED')
      return {
        id: proof.id,
        uploadStatus: proof.uploadStatus,
        scanStatus: proof.scanStatus,
        fileName: proof.fileName,
        mimeType: proof.mimeType,
        sizeBytes: proof.sizeBytes,
        version: proof.version,
      };
    if (proof.uploadStatus !== 'UPLOADED' || !proof.providerReferenceHash)
      throw new ApiProblem('UPLOAD_NOT_COMPLETE', HttpStatus.CONFLICT);
    if (
      !input ||
      input.sizeBytes !== proof.sizeBytes ||
      !/^[a-fA-F0-9]{64}$/.test(input.sha256) ||
      digest(input.sha256) !== proof.checksum
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const scanStatus = await this.scanner.scanPrivateObject(proof.objectKey);
    const updated = await this.db.$transaction(async (tx) => {
      const record = await tx.paymentProof.update({
        where: { id },
        data: {
          uploadStatus: 'FINALIZED',
          scanStatus,
          uploadedAt: new Date(),
          finalizedAt: new Date(),
        },
      });
      await this.access.audit(
        tx,
        principal,
        'PAYMENT_PROOF_FINALIZED',
        'PaymentProof',
        id,
        proof.branchId,
        correlationId,
      );
      await recordPilotRollbackOutbox(tx, {
        branchId: proof.branchId,
        aggregateType: 'PaymentProof',
        aggregateId: proof.id,
        operation: 'FINALIZE',
        correlationId,
        occurredAt: record.finalizedAt ?? new Date(),
        payload: {
          paymentProofId: proof.id,
          checksum: input.sha256.toLowerCase(),
          mimeType: proof.mimeType,
          sizeBytes: proof.sizeBytes,
          kind: 'PAYMENT_PROOF',
          version: record.version,
        },
      });
      return record;
    });
    return {
      id: updated.id,
      uploadStatus: updated.uploadStatus,
      scanStatus: updated.scanStatus,
      fileName: updated.fileName,
      mimeType: updated.mimeType,
      sizeBytes: updated.sizeBytes,
      version: updated.version,
    };
  }

  async status(principal: SessionPrincipal, id: string) {
    this.access.catalog(principal);
    const proof = await this.db.paymentProof.findUnique({ where: { id } });
    if (!proof || proof.userId !== principal.userId)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return {
      id: proof.id,
      uploadStatus: proof.uploadStatus,
      scanStatus: proof.scanStatus,
      fileName: proof.fileName,
      mimeType: proof.mimeType,
      sizeBytes: proof.sizeBytes,
      replacedById: proof.replacedById,
      version: proof.version,
    };
  }

  async replace(
    principal: SessionPrincipal,
    purchaseId: string,
    input: any,
    correlationId: string,
  ) {
    this.access.catalog(principal);
    const nextId = input.paymentProofId ?? input.newPaymentProofUploadId;
    const next = await this.db.paymentProof.findUnique({ where: { id: nextId } });
    const current = await this.db.purchase.findUnique({ where: { id: purchaseId } });
    if (
      !current ||
      current.userId !== principal.userId ||
      !next ||
      next.userId !== principal.userId
    )
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
        await this.access.audit(
          tx,
          principal,
          'PAYMENT_PROOF_REPLACED',
          'Purchase',
          purchaseId,
          current.branchId,
          correlationId,
        );
        await recordPilotRollbackOutbox(tx, {
          branchId: current.branchId,
          aggregateType: 'PaymentProof',
          aggregateId: next.id,
          operation: 'ATTACH_TO_PURCHASE',
          correlationId,
          payload: {
            paymentProofId: next.id,
            purchaseId,
            checksumReference: next.checksum,
            mimeType: next.mimeType,
            sizeBytes: next.sizeBytes,
            kind: 'PAYMENT_PROOF',
            version: changed.version,
          },
        });
        return changed;
      });
    } catch {
      throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
    }
  }
}
