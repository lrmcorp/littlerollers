import { HttpStatus, Inject, Injectable, Optional } from '@nestjs/common';
import type { IdentityDocumentKind } from '@prisma/client';
import { Readable } from 'node:stream';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from './identity.service';
import { PRIVATE_FILE_STORAGE, type PrivateFileStorage } from './private-file-storage';
import { PolicyService } from './policy.service';
import { ApiProblem, newId } from './security';

function isLegacyRemoteKey(key: string | null | undefined): boolean {
  if (!key) return false;
  return key.startsWith('http://') || key.startsWith('https://') || key.startsWith('legacy:');
}

function resolveLegacyUrl(key: string): string {
  if (key.startsWith('http://') || key.startsWith('https://')) return key;
  const rawPath = key.startsWith('legacy:') ? key.slice('legacy:'.length) : key;
  const baseUrl = (process.env.LEGACY_V1_MEDIA_BASE_URL || 'https://dailydosepilates.com').replace(
    /\/+$/,
    '',
  );
  const cleanPath = rawPath.replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
}

@Injectable()
export class IdentityDocumentAccessService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    @Inject(PRIVATE_FILE_STORAGE) private readonly storage: PrivateFileStorage,
    @Optional() private readonly runtimeConfig?: RuntimeConfigService,
  ) {}

  async authorizeReview(
    principal: SessionPrincipal,
    documentId: string,
    correlationId = 'unknown',
  ) {
    if (this.runtimeConfig && !this.runtimeConfig.value.identityReview.enabled)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
    this.policy.requireGlobalCapability(principal, 'identity-verification:read');
    const document = await this.db.dokumenVerifikasiIdentitas.findUnique({
      where: { id: documentId },
    });
    const isLegacy = isLegacyRemoteKey(document?.objectKey);
    if (
      !document?.objectKey ||
      ['DELETED', 'PENDING_DELETION'].includes(document.status) ||
      document.uploadStatus !== 'FINALIZED' ||
      document.scanStatus !== 'CLEAN' ||
      document.replacedById !== null ||
      (!isLegacy && !(await this.storage.exists(document.objectKey)))
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return this.createAuthorization(
      principal,
      document.id,
      document.userId,
      'REVIEW',
      correlationId,
    );
  }

  async authorizeSelf(
    principal: SessionPrincipal,
    kind: IdentityDocumentKind,
    correlationId = 'unknown',
  ) {
    this.policy.requireCustomerSelf(principal.roles, principal.capabilities);
    if (!['SELFIE', 'KTP_FRONT'].includes(kind))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const document = await this.db.dokumenVerifikasiIdentitas.findFirst({
      where: {
        userId: principal.userId,
        kind,
        replacedById: null,
        status: { notIn: ['DELETED', 'PENDING_DELETION'] },
        uploadStatus: 'FINALIZED',
        scanStatus: 'CLEAN',
        objectKey: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });
    const isLegacy = isLegacyRemoteKey(document?.objectKey);
    if (!document?.objectKey || (!isLegacy && !(await this.storage.exists(document.objectKey))))
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return this.createAuthorization(
      principal,
      document.id,
      principal.userId,
      'SELF_VIEW',
      correlationId,
    );
  }

  async read(principal: SessionPrincipal, authorizationId: string, correlationId = 'unknown') {
    const authorization = await this.db.otorisasiLihatDokumenIdentitas.findUnique({
      where: { id: authorizationId },
      include: { document: true },
    });
    if (
      !authorization ||
      authorization.viewerId !== principal.userId ||
      authorization.consumedAt ||
      authorization.expiresAt <= new Date() ||
      !authorization.document.objectKey ||
      ['DELETED', 'PENDING_DELETION'].includes(authorization.document.status) ||
      authorization.document.uploadStatus !== 'FINALIZED' ||
      authorization.document.scanStatus !== 'CLEAN' ||
      authorization.document.replacedById !== null
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (
      (authorization.purpose === 'REVIEW' &&
        !this.policy.hasGlobalCapability(principal, 'identity-verification:read')) ||
      (authorization.purpose === 'SELF_VIEW' && authorization.document.userId !== principal.userId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const claimed = await this.db.otorisasiLihatDokumenIdentitas.updateMany({
      where: { id: authorizationId, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() },
    });
    if (claimed.count !== 1) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    let stream: any;
    let mimeType = authorization.document.mimeType;

    if (isLegacyRemoteKey(authorization.document.objectKey)) {
      const legacyUrl = resolveLegacyUrl(authorization.document.objectKey);
      try {
        const response = await fetch(legacyUrl);
        if (!response.ok) {
          throw new Error(`Legacy media fetch failed with status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        stream = Readable.from(Buffer.from(arrayBuffer));
        const fetchedMime = response.headers.get('content-type');
        if (fetchedMime && fetchedMime.startsWith('image/')) {
          mimeType = fetchedMime;
        }
      } catch {
        throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      }
    } else {
      stream = await this.storage.read(authorization.document.objectKey);
    }

    await this.db.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: principal.userId,
        action: 'security.identity_document_viewed',
        objectType: 'IdentityVerificationDocument',
        objectId: authorization.document.id,
        targetUserId: authorization.document.userId,
        correlationId,
      },
    });
    return { stream, mimeType };
  }

  private async createAuthorization(
    principal: SessionPrincipal,
    documentId: string,
    targetUserId: string,
    purpose: 'SELF_VIEW' | 'REVIEW',
    correlationId: string,
  ) {
    const expiresAt = new Date(
      Date.now() +
        (this.runtimeConfig?.value.privateUploads.viewAuthorizationTtlSeconds ?? 300) * 1000,
    );
    const authorization = await this.db.otorisasiLihatDokumenIdentitas.create({
      data: {
        id: newId(),
        documentId,
        viewerId: principal.userId,
        purpose,
        expiresAt,
      },
    });
    await this.db.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: principal.userId,
        action:
          purpose === 'REVIEW'
            ? 'security.identity_document_view_authorized'
            : 'security.identity_document_self_view_authorized',
        objectType: 'IdentityVerificationDocument',
        objectId: documentId,
        targetUserId,
        correlationId,
        afterMasked: {
          purpose,
          expiresAt: expiresAt.toISOString(),
        },
      },
    });
    return {
      url: `/api/v1/identity-verification-files/${authorization.id}/content`,
      expiresAt: expiresAt.toISOString(),
    };
  }
}
