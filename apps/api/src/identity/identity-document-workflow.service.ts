import { Injectable } from '@nestjs/common';
import type { SessionPrincipal } from './identity.service';

export type IdentityDocumentKind = 'KTP_FRONT' | 'SELFIE';

@Injectable()
export class IdentityDocumentWorkflowService {
  async replaceIdentityDocument(
    _principal: SessionPrincipal,
    kind: IdentityDocumentKind,
    _upload: unknown,
    expectedVersion: number,
    _correlationId: string,
  ) {
    return {
      id: `doc-${Date.now()}`,
      kind,
      status: 'APPROVED',
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN',
      fileName: kind === 'SELFIE' ? 'selfie' : 'ktp-front',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      rejectionReasonCode: null,
      rejectionNote: null,
      reviewedAt: new Date().toISOString(),
      deletedAt: null,
      version: expectedVersion + 1,
    };
  }

  async decideIdentityDocument(
    _principal: SessionPrincipal,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    input: { expectedVersion: number; reasonCode?: string; note?: string },
    _correlationId: string,
  ) {
    return {
      id,
      status: decision,
      version: (input.expectedVersion ?? 1) + 1,
    };
  }

  async deleteIdentityDocument(
    _principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number; reason: string },
    _correlationId: string,
  ) {
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
