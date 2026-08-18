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
import { recordPilotRollbackOutbox } from '../migration/pilot-rollback-outbox.service';
import { NotificationWriterService } from '../notifications/notification-writer.service';
import { EmailNotificationService } from '../email/email-notification.service';

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
    @Optional() private readonly notificationWriter?: NotificationWriterService,
    @Optional() private readonly emails?: EmailNotificationService,
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
    const current = await this.db.dokumenVerifikasiIdentitas.findFirst({
      where: { userId: principal.userId, kind, replacedById: null },
      orderBy: { createdAt: 'desc' },
    });
    const owner = await this.db.user.findUnique({
      where: { id: principal.userId },
      select: { preferredBranchId: true },
    });
    const pilotCutover = owner?.preferredBranchId
      ? await this.db.migrationBranchCutover.findUnique({
          where: { branchId: owner.preferredBranchId },
          select: { status: true },
        })
      : null;
    const pilotMediaImmutable = ['V2_ACTIVE', 'ROLLING_BACK'].includes(pilotCutover?.status ?? '');
    if (!current || current.status !== 'REJECTED' || current.version !== expectedVersion)
      throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    const replacementId = newId();
    const objectKey = `identity/${principal.userId}/${kind.toLowerCase()}/${replacementId}`;
    await this.identityStorage().put({ key: objectKey, content: input.buffer });
    try {
      return await this.db.$transaction(async (tx) => {
        const replacement = await tx.dokumenVerifikasiIdentitas.create({
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
        const claimed = await tx.dokumenVerifikasiIdentitas.updateMany({
          where: { id: current.id, version: expectedVersion, replacedById: null },
          data: {
            replacedById: replacement.id,
            ...(current.objectKey && !pilotMediaImmutable
              ? { status: 'PENDING_DELETION' as const }
              : {}),
            version: { increment: 1 },
          },
        });
        if (claimed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        if (current.objectKey && !pilotMediaImmutable) {
          const retentionDays = this.runtimeConfig?.value.privateUploads.retentionDays ?? 30;
          await tx.antreanHapusDokumenIdentitas.create({
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
            priorFileRetentionDays: pilotMediaImmutable
              ? null
              : (this.runtimeConfig?.value.privateUploads.retentionDays ?? 30),
            pilotMediaImmutable,
          },
        });
        if (owner?.preferredBranchId)
          await recordPilotRollbackOutbox(tx, {
            branchId: owner.preferredBranchId,
            aggregateType: 'IdentityDocument',
            aggregateId: replacement.id,
            operation: 'FINALIZE_REPLACEMENT',
            correlationId,
            occurredAt: replacement.finalizedAt ?? new Date(),
            payload: {
              documentId: replacement.id,
              userId: principal.userId,
              kind,
              checksum: replacement.checksum,
              mimeType: replacement.mimeType,
              sizeBytes: replacement.sizeBytes,
              version: replacement.version,
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
    const current = await this.db.dokumenVerifikasiIdentitas.findUnique({
      where: { id },
      include: { user: { select: { preferredBranchId: true } } },
    });
    if (!current || current.replacedById) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (current.version !== input.expectedVersion || current.status !== 'PENDING')
      throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    if (current.scanStatus !== 'CLEAN' || current.uploadStatus !== 'FINALIZED')
      throw new ApiProblem('IDENTITY_DOCUMENT_NOT_READY', HttpStatus.CONFLICT);
    let auditReference = '';
    await this.db.$transaction(async (tx) => {
      const changed = await tx.dokumenVerifikasiIdentitas.updateMany({
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
      if (decision === 'APPROVED' && current.user.preferredBranchId)
        await recordPilotRollbackOutbox(tx, {
          branchId: current.user.preferredBranchId,
          aggregateType: 'IdentityDocument',
          aggregateId: current.id,
          operation: 'APPROVE',
          correlationId,
          payload: {
            documentId: current.id,
            userId: current.userId,
            kind: current.kind,
            checksum: current.checksum,
            mimeType: current.mimeType,
            sizeBytes: current.sizeBytes,
            version: input.expectedVersion + 1,
          },
        });
      // Notifikasi in-app ke customer: hasil keputusan verifikasi
      if (this.notificationWriter) {
        const nextVersion = input.expectedVersion + 1;
        await this.notificationWriter.writeForUser(tx, {
          userId: current.userId,
          eventKey: `identity.verification.${decision.toLowerCase()}:${id}:v${nextVersion}`,
          category: 'VERIFICATION',
          tone: decision === 'APPROVED' ? 'SUCCESS' : 'WARNING',
          title:
            decision === 'APPROVED'
              ? 'Verifikasi identitas disetujui!'
              : 'Verifikasi identitas memerlukan perbaikan',
          message:
            decision === 'APPROVED'
              ? 'Dokumen identitas Anda telah diverifikasi. Anda kini dapat menggunakan seluruh fitur aplikasi.'
              : `Dokumen Anda perlu diperbaiki (${input.reasonCode ?? 'lihat detail'})${input.note ? `: ${input.note}` : ''}. Silakan unggah ulang dokumen Anda.`,
          href: decision === 'APPROVED' ? '/account' : '/account/verification',
          expiresInDays: 30,
        });
      }
    });
    // Kirim email notifikasi ke customer (di luar transaksi)
    if (this.emails) {
      const user = await this.db.user.findUnique({
        where: { id: current.userId },
        select: { email: true },
      });
      if (user?.email) {
        const publicBaseUrl = process.env.PUBLIC_WEB_BASE_URL?.trim();
        if (publicBaseUrl) {
          await this.emails
            .enqueue(
              decision === 'APPROVED'
                ? {
                    eventType: 'identity.verification.approved.v1',
                    templateKey: 'IDENTITY_APPROVED_V1',
                    recipient: user.email,
                    variables: {
                      href: `${publicBaseUrl}/account`,
                      detail: 'Anda sekarang dapat mengakses seluruh fitur aplikasi.',
                    },
                    correlationId,
                    occurrenceParts: ['identity-approved', current.userId, id],
                    userId: current.userId,
                  }
                : {
                    eventType: 'identity.verification.rejected.v1',
                    templateKey: 'IDENTITY_ACTION_REQUIRED_V1',
                    recipient: user.email,
                    variables: {
                      href: `${publicBaseUrl}/account/verification`,
                      detail:
                        input.reasonCode === 'OTHER_REQUIRES_NOTE' && input.note
                          ? input.note
                          : `Alasan: ${input.reasonCode ?? 'lihat aplikasi'}`,
                    },
                    correlationId,
                    occurrenceParts: ['identity-rejected', current.userId, id],
                    userId: current.userId,
                  },
            )
            .catch(() => undefined); // jangan gagalkan request utama jika email gagal
        }
      }
    }
    return {
      ...this.documentView(
        (await this.db.dokumenVerifikasiIdentitas.findUnique({ where: { id } }))!,
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
    const document = await this.db.dokumenVerifikasiIdentitas.findUnique({
      where: { id },
      include: { user: { select: { preferredBranchId: true } } },
    });
    if (!document || document.replacedById || document.status === 'DELETED')
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (document.version !== input.expectedVersion)
      throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    if (document.user.preferredBranchId) {
      const cutover = await this.db.migrationBranchCutover.findUnique({
        where: { branchId: document.user.preferredBranchId },
        select: { status: true },
      });
      if (['V2_ACTIVE', 'ROLLING_BACK'].includes(cutover?.status ?? ''))
        throw new ApiProblem('PILOT_MEDIA_IMMUTABLE', HttpStatus.CONFLICT);
    }
    if (!document.objectKey) {
      return this.db.$transaction(async (tx) => {
        const changed = await tx.dokumenVerifikasiIdentitas.updateMany({
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
      const changed = await tx.dokumenVerifikasiIdentitas.updateMany({
        where: { id, version: input.expectedVersion, status: { not: 'DELETED' } },
        data: {
          status: 'PENDING_DELETION',
          deletedById: principal.userId,
          deletionReason: input.reason.trim(),
          version: { increment: 1 },
        },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await tx.antreanHapusDokumenIdentitas.upsert({
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
        await tx.dokumenVerifikasiIdentitas.update({
          where: { id },
          data: {
            status: 'DELETED',
            objectKey: null,
            providerReferenceHash: null,
            deletedAt: new Date(),
            version: { increment: 1 },
          },
        });
        await tx.antreanHapusDokumenIdentitas.update({
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
        await tx.dokumenVerifikasiIdentitas.update({
          where: { id },
          data: { status: 'DELETE_FAILED', version: { increment: 1 } },
        });
        await tx.antreanHapusDokumenIdentitas.update({
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

  // --- Indonesian Domain Aliases ---
  async gantiDokumenIdentitas(
    principal: SessionPrincipal,
    kind: IdentityDocumentKind,
    upload: IdentityDocumentUpload,
    expectedVersion: number,
    correlationId: string,
  ) {
    return this.replaceIdentityDocument(principal, kind, upload, expectedVersion, correlationId);
  }

  async putuskanVerifikasiDokumen(
    principal: SessionPrincipal,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    input: { expectedVersion: number; reasonCode?: string; note?: string },
    correlationId: string,
  ) {
    return this.decideIdentityDocument(principal, id, decision, input, correlationId);
  }

  async hapusDokumenIdentitas(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<IdentityDocumentWorkflowService['deleteIdentityDocument']>[2],
    correlationId: string,
  ) {
    return this.deleteIdentityDocument(principal, id, input, correlationId);
  }
}
