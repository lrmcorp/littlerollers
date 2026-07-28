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

  ensureBranchScope(principal: SessionPrincipal, branchId: string) {
    if (!principal.capabilities.includes('branch:all') && !principal.branchIds.includes(branchId))
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  audit(
    tx: Prisma.TransactionClient,
    principal: SessionPrincipal,
    correlationId: string,
    action: string,
    objectType: string,
    objectId: string,
    branchId: string,
    before?: Prisma.InputJsonValue,
    after?: Prisma.InputJsonValue,
  ) {
    return tx.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: principal.userId,
        branchId,
        action,
        objectType,
        objectId,
        beforeMasked: before,
        afterMasked: after,
        correlationId,
      },
    });
  }
}
