import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';

@Injectable()
export class MasterAccessService {
  constructor(private readonly policy: PolicyService) {}

  authorize(principal: SessionPrincipal, mutation = false) {
    this.policy.requireCapability(
      principal.capabilities,
      mutation ? 'master:manage' : 'master:read',
    );
  }

  ensureBranchScope(principal: SessionPrincipal, branchId: string, mutation = false) {
    const capability = mutation ? 'master:manage' : 'master:read';
    if (
      !this.policy.hasCapability(principal, 'branch:all', branchId) &&
      !this.policy.hasCapability(principal, capability, branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  branchScope(principal: SessionPrincipal, mutation = false) {
    return this.policy.capabilityBranchScope(principal, mutation ? 'master:manage' : 'master:read');
  }

  async audit(
    _tx: Prisma.TransactionClient,
    _principal: SessionPrincipal,
    _correlationId: string,
    _action: string,
    _objectType: string,
    _objectId: string,
    _branchId: string | null,
    _before?: Prisma.InputJsonValue,
    _after?: Prisma.InputJsonValue,
  ) {
    return Promise.resolve();
  }
}
