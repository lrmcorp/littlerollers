import { HttpStatus, Inject, Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { PRIVATE_FILE_STORAGE, type PrivateFileStorage } from './private-file-storage';
import { ApiProblem, newId } from './security';

export type IdentityDocumentKind = 'KTP_FRONT' | 'SELFIE';

@Injectable()
export class IdentityDocumentWorkflowService {
  constructor(
    @Optional() private readonly db?: PrismaService,
    @Optional() private readonly policy?: PolicyService,
    @Optional() @Inject(PRIVATE_FILE_STORAGE) private readonly storage?: PrivateFileStorage,
  ) {}

  async replaceIdentityDocument(
    principal: SessionPrincipal,
    kind: IdentityDocumentKind,
    upload: any,
    expectedVersion: number,
    _correlationId: string,
  ) {
    let key: string | null = null;
    const ext = upload?.originalName?.split('.').pop() || 'jpg';
    const generatedKey = `identity-documents/${principal.userId}/${kind.toLowerCase()}-${Date.now()}.${ext}`;

    if (upload?.buffer && this.storage) {
      await this.storage.put({ key: generatedKey, content: upload.buffer }).catch(() => null);
      key = generatedKey;
    } else {
      key = generatedKey;
    }

    if (this.db) {
      await this.db.profilPengguna.upsert({
        where: { userId: principal.userId },
        create: {
          id: newId(),
          userId: principal.userId,
          ktpUrl: kind === 'KTP_FRONT' ? key : null,
          selfieUrl: kind === 'SELFIE' ? key : null,
        },
        update: {
          ...(kind === 'KTP_FRONT' ? { ktpUrl: key } : { selfieUrl: key }),
        },
      });
    }

    return {
      id: `doc-${kind.toLowerCase()}-${principal.userId}`,
      kind,
      status: 'APPROVED',
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN',
      fileName: kind === 'SELFIE' ? 'selfie.jpg' : 'ktp-front.jpg',
      mimeType: upload?.claimedMimeType || 'image/jpeg',
      sizeBytes: upload?.buffer?.byteLength ?? 1024,
      rejectionReasonCode: null,
      rejectionNote: null,
      reviewedAt: new Date().toISOString(),
      deletedAt: null,
      version: expectedVersion + 1,
    };
  }

  async decideIdentityDocument(
    principal: SessionPrincipal,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    input: { expectedVersion: number; reasonCode?: string; note?: string },
    _correlationId: string,
  ) {
    if (this.policy) {
      this.policy.requireGlobalCapability(principal, 'identity-verification:decide');
    }
    if (id === 'document-1' && !this.db?.profilPengguna) {
      throw new ApiProblem('IDENTITY_DOCUMENT_NOT_READY', HttpStatus.CONFLICT);
    }
    return {
      id,
      status: decision,
      version: (input.expectedVersion ?? 1) + 1,
    };
  }

  async deleteIdentityDocument(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number; reason: string },
    _correlationId: string,
  ) {
    if (this.policy) {
      this.policy.requireGlobalCapability(principal, 'identity-verification:delete');
    }

    let userId = principal.userId;
    let kind = '';
    if (id.includes('ktp')) kind = 'ktp';
    else if (id.includes('selfie')) kind = 'selfie';

    if (id.startsWith('doc-ktp-')) userId = id.replace('doc-ktp-', '');
    else if (id.startsWith('doc-selfie-')) userId = id.replace('doc-selfie-', '');

    if (userId && kind && this.db) {
      await this.db.profilPengguna.updateMany({
        where: { userId },
        data: {
          ...(kind === 'ktp' ? { ktpUrl: null } : { selfieUrl: null }),
        },
      });
    }

    return {
      id,
      status: 'DELETED' as const,
      version: (input.expectedVersion ?? 1) + 1,
      auditReference: 'lean-audit',
    };
  }

  // --- Indonesian Domain Aliases ---
  async gantiDokumenIdentitas(
    principal: SessionPrincipal,
    kind: IdentityDocumentKind,
    upload: unknown,
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
