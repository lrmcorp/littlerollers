import { HttpStatus, Injectable } from '@nestjs/common';
import { Readable } from 'node:stream';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { ApiProblem, newId } from './security';

@Injectable()
export class IdentityDocumentAccessService {
  constructor(private readonly policy: PolicyService) {}

  async authorizeReview(
    principal: SessionPrincipal,
    documentId: string,
    _correlationId = 'unknown',
  ) {
    this.policy.requireGlobalCapability(principal, 'identity-verification:read');
    return {
      authorizationId: newId(),
      documentId,
      expiresAt: new Date(Date.now() + 300000).toISOString(),
    };
  }

  async authorizeSelf(
    principal: SessionPrincipal,
    documentId: string,
    _correlationId = 'unknown',
  ) {
    return {
      authorizationId: newId(),
      documentId,
      expiresAt: new Date(Date.now() + 300000).toISOString(),
    };
  }

  async read(
    _principal: SessionPrincipal,
    _authorizationId: string,
    _correlationId = 'unknown',
  ): Promise<{ mimeType: string; stream: Readable }> {
    throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
