import { HttpStatus, Inject, Injectable, Optional } from '@nestjs/common';
import { type IdentityDocumentKind, Prisma } from '@prisma/client';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import {
  type IdentityDocumentUpload,
  validateIdentityDocumentUpload,
} from './identity-document-upload';
import type { SessionPrincipal } from './identity.service';
import { PRIVATE_FILE_STORAGE, type PrivateFileStorage } from './private-file-storage';
import { PolicyService } from './policy.service';
import { ApiProblem, configurationRequired, digest, newId } from './security';

const IDENTITY_REJECTION_REASONS = new Set([
  'BLURRY',
  'GLARE',
  'CROPPED',
  'DOCUMENT_UNREADABLE',
  'FACE_MISMATCH',
  'WRONG_DOCUMENT',
  'OTHER_REQUIRES_NOTE',
]);

@Injectable()
export class IdentityDocumentWorkflowService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    @Inject(PRIVATE_FILE_STORAGE) @Optional() private readonly privateFiles?: PrivateFileStorage,
    @Optional() private readonly runtimeConfig?: RuntimeConfigService,
  ) {}

  private audit(
    tx: Prisma.TransactionClient | PrismaService,
    input: {
      actorId?: string;
      action: string;
      objectType: string;
      objectId: string;
      targetUserId?: string;
      correlationId: string;
      branchId?: string;
      before?: Prisma.InputJsonValue;
      after?: Prisma.InputJsonValue;
    },
  ) {
    return tx.auditLog.create({
      data: {
        id: newId(),
        actorType: input.actorId ? 'USER' : 'SYSTEM',
        actorId: input.actorId,
        branchId: input.branchId,
        action: input.action,
        objectType: input.objectType,
        objectId: input.objectId,
        targetUserId: input.targetUserId,
        beforeMasked: input.before,
        afterMasked: input.after,
        correlationId: input.correlationId,
      },
    });
  }

  private identityStorage(): PrivateFileStorage {
    if (!this.privateFiles) configurationRequired();
    return this.privateFiles!;
  }

  private uploadLimit(): number {
    return this.runtimeConfig?.value.privateUploads.maxBytes ?? 8_000_000;
  }

  private safeOriginalName(value: string): string {
    return value.split(/[\\/]/u).at(-1)?.trim().slice(0, 160) || 'identity-document';
  }

  private documentView(document: {
    id: string;
    kind: IdentityDocumentKind;
    status: string;
    uploadStatus: string;
    scanStatus: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    rejectionReasonCode: string | null;
    rejectionNote: string | null;
    reviewedAt: Date | null;
    deletedAt: Date | null;
    version: number;
  }) {
    return {
      id: document.id,
      kind: document.kind,
      status: document.status,
      uploadStatus: document.uploadStatus,
      scanStatus: document.scanStatus,
      fileName: document.kind === 'SELFIE' ? 'selfie' : 'ktp-front',
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      rejectionReasonCode: document.rejectionReasonCode,
      rejectionNote: document.rejectionNote,
      reviewedAt: document.reviewedAt?.toISOString() ?? null,
      deletedAt: document.deletedAt?.toISOString() ?? null,
      version: document.version,
    };
  }

  async replaceIdentityDocument(
    principal: SessionPrincipal,
    kind: IdentityDocumentKind,
    upload: IdentityDocumentUpload,
    expectedVersion: number,
    correlationId: string,
  ) {
    this.policy.requireCustomerSelf(principal.roles, principal.capabilities);
    if (!['SELFIE', 'KTP_FRONT'].includes(kind))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const input = validateIdentityDocumentUpload(upload, this.uploadLimit());
    const current = await this.db.identityVerificationDocument.findFirst({
      where: { userId: principal.userId, kind, replacedById: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!current || current.status !== 'REJECTED' || current.version !== expectedVersion)
      throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    const replacementId = newId();
    const objectKey = `identity/${principal.userId}/${kind.toLowerCase()}/${replacementId}`;
    await this.identityStorage().put({ key: objectKey, content: input.buffer });
    try {
      return await this.db.$transaction(async (tx) => {
        const replacement = await tx.identityVerificationDocument.create({
          data: {
            id: replacementId,
            userId: principal.userId,
            kind,
            objectKey,
            checksum: input.checksum,
            fileName: this.safeOriginalName(input.originalName),
            mimeType: input.mimeType,
            sizeBytes: input.sizeBytes,
            uploadStatus: 'FINALIZED',
            scanStatus: 'CLEAN',
            providerReferenceHash: digest(objectKey),
            uploadedAt: new Date(),
            finalizedAt: new Date(),
          },
        });
        const claimed = await tx.identityVerificationDocument.updateMany({
          where: { id: current.id, version: expectedVersion, replacedById: null },
          data: {
            replacedById: replacement.id,
            ...(current.objectKey ? { status: 'PENDING_DELETION' as const } : {}),
            version: { increment: 1 },
          },
        });
        if (claimed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        if (current.objectKey) {
          const retentionDays = this.runtimeConfig?.value.privateUploads.retentionDays ?? 30;
          await tx.identityDocumentDeletionJob.create({
            data: {
              id: newId(),
              documentId: current.id,
              requestedById: principal.userId,
              objectKey: current.objectKey,
              status: 'QUEUED',
              nextAttemptAt: new Date(Date.now() + retentionDays * 86_400_000),
            },
          });
        }
        await this.audit(tx, {
          actorId: principal.userId,
          action: 'security.identity_document_replaced',
          objectType: 'IdentityVerificationDocument',
          objectId: replacement.id,
          correlationId,
          after: {
            kind,
            priorFileRetentionDays: this.runtimeConfig?.value.privateUploads.retentionDays ?? 30,
          },
        });
        return this.documentView(replacement);
      });
    } catch (error) {
      await this.identityStorage()
        .delete(objectKey)
        .catch(() => undefined);
      throw error;
    }
  }

  async decideIdentityDocument(
    principal: SessionPrincipal,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    input: { expectedVersion: number; reasonCode?: string; note?: string },
    correlationId: string,
  ) {
    if (this.runtimeConfig && !this.runtimeConfig.value.identityReview.enabled)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    this.policy.requireGlobalCapability(principal, 'identity-verification:decide');
    if (
      decision === 'REJECTED' &&
      (!input.reasonCode ||
        !IDENTITY_REJECTION_REASONS.has(input.reasonCode) ||
        (input.reasonCode === 'OTHER_REQUIRES_NOTE' && !input.note?.trim()))
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const current = await this.db.identityVerificationDocument.findUnique({ where: { id } });
    if (!current || current.replacedById) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (current.version !== input.expectedVersion || current.status !== 'PENDING')
      throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    if (current.scanStatus !== 'CLEAN' || current.uploadStatus !== 'FINALIZED')
      throw new ApiProblem('IDENTITY_DOCUMENT_NOT_READY', HttpStatus.CONFLICT);
    let auditReference = '';
    await this.db.$transaction(async (tx) => {
      const changed = await tx.identityVerificationDocument.updateMany({
        where: {
          id,
          status: 'PENDING',
          version: input.expectedVersion,
          replacedById: null,
          scanStatus: 'CLEAN',
          uploadStatus: 'FINALIZED',
        },
        data: {
          status: decision,
          reviewedAt: new Date(),
          reviewedById: principal.userId,
          rejectionReasonCode: decision === 'REJECTED' ? input.reasonCode : null,
          rejectionNote: decision === 'REJECTED' ? input.note?.trim() || null : null,
          version: { increment: 1 },
        },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      const audit = await this.audit(tx, {
        actorId: principal.userId,
        action: `security.identity_document_${decision.toLowerCase()}`,
        objectType: 'IdentityVerificationDocument',
        objectId: id,
        correlationId,
        after: { decision, reasonCode: input.reasonCode ?? null },
      });
      auditReference = audit.id;
      await tx.outboxEvent.create({
        data: {
          id: newId(),
          eventType:
            decision === 'APPROVED'
              ? 'identity.verification.approved.v1'
              : 'identity.verification.rejected.v1',
          aggregateType: 'IdentityVerificationDocument',
          aggregateId: id,
          payload: { documentId: id, decision },
          correlationId,
        },
      });
    });
    return {
      ...this.documentView(
        (await this.db.identityVerificationDocument.findUnique({ where: { id } }))!,
      ),
      auditReference,
    };
  }

  async deleteIdentityDocument(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number; reason: string },
    correlationId: string,
  ) {
    if (this.runtimeConfig && !this.runtimeConfig.value.identityReview.enabled)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    this.policy.requireGlobalCapability(principal, 'identity-verification:delete');
    if (!input.reason?.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const document = await this.db.identityVerificationDocument.findUnique({ where: { id } });
    if (!document || document.replacedById || document.status === 'DELETED')
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (document.version !== input.expectedVersion)
      throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    if (!document.objectKey) {
      return this.db.$transaction(async (tx) => {
        const changed = await tx.identityVerificationDocument.updateMany({
          where: { id, version: input.expectedVersion },
          data: {
            status: 'DELETED',
            providerReferenceHash: null,
            deletedAt: new Date(),
            deletedById: principal.userId,
            deletionReason: input.reason.trim(),
            version: { increment: 1 },
          },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        const audit = await this.audit(tx, {
          actorId: principal.userId,
          action: 'security.identity_document_deleted',
          objectType: 'IdentityVerificationDocument',
          objectId: id,
          targetUserId: document.userId,
          correlationId,
          after: { reasonPresent: true, storageObjectPresent: false },
        });
        return {
          id,
          status: 'DELETED' as const,
          version: input.expectedVersion + 1,
          auditReference: audit.id,
        };
      });
    }
    const jobId = newId();
    let auditReference = '';
    await this.db.$transaction(async (tx) => {
      const changed = await tx.identityVerificationDocument.updateMany({
        where: { id, version: input.expectedVersion, status: { not: 'DELETED' } },
        data: {
          status: 'PENDING_DELETION',
          deletedById: principal.userId,
          deletionReason: input.reason.trim(),
          version: { increment: 1 },
        },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await tx.identityDocumentDeletionJob.upsert({
        where: { documentId: id },
        update: {
          requestedById: principal.userId,
          objectKey: document.objectKey!,
          status: 'RUNNING',
          attempts: { increment: 1 },
          lastErrorCode: null,
          nextAttemptAt: null,
        },
        create: {
          id: jobId,
          documentId: id,
          requestedById: principal.userId,
          objectKey: document.objectKey!,
          status: 'RUNNING',
          attempts: 1,
        },
      });
      const audit = await this.audit(tx, {
        actorId: principal.userId,
        action: 'security.identity_document_deletion_requested',
        objectType: 'IdentityVerificationDocument',
        objectId: id,
        targetUserId: document.userId,
        correlationId,
        after: { reasonPresent: true },
      });
      auditReference = audit.id;
    });
    try {
      await this.identityStorage().delete(document.objectKey);
      await this.db.$transaction(async (tx) => {
        await tx.identityVerificationDocument.update({
          where: { id },
          data: {
            status: 'DELETED',
            objectKey: null,
            providerReferenceHash: null,
            deletedAt: new Date(),
            version: { increment: 1 },
          },
        });
        await tx.identityDocumentDeletionJob.update({
          where: { documentId: id },
          data: { status: 'SUCCEEDED', completedAt: new Date(), lastErrorCode: null },
        });
        const audit = await this.audit(tx, {
          actorId: principal.userId,
          action: 'security.identity_document_deleted',
          objectType: 'IdentityVerificationDocument',
          objectId: id,
          targetUserId: document.userId,
          correlationId,
          after: { reasonPresent: true },
        });
        auditReference = audit.id;
      });
      return {
        id,
        status: 'DELETED' as const,
        version: input.expectedVersion + 2,
        auditReference,
      };
    } catch {
      const nextAttemptAt = new Date(Date.now() + 5 * 60_000);
      await this.db.$transaction(async (tx) => {
        await tx.identityVerificationDocument.update({
          where: { id },
          data: { status: 'DELETE_FAILED', version: { increment: 1 } },
        });
        await tx.identityDocumentDeletionJob.update({
          where: { documentId: id },
          data: { status: 'FAILED', lastErrorCode: 'PRIVATE_STORAGE_DELETE_FAILED', nextAttemptAt },
        });
        const audit = await this.audit(tx, {
          actorId: principal.userId,
          action: 'security.identity_document_deletion_failed',
          objectType: 'IdentityVerificationDocument',
          objectId: id,
          targetUserId: document.userId,
          correlationId,
          after: { retryable: true },
        });
        auditReference = audit.id;
      });
      return {
        id,
        status: 'DELETE_FAILED' as const,
        version: input.expectedVersion + 2,
        nextAttemptAt,
        auditReference,
      };
    }
  }
}
