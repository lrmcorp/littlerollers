import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';

@Injectable()
export class PackageAccessService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  catalog(principal: SessionPrincipal, mutation = false) {
    this.policy.requireCapability(
      principal.capabilities,
      mutation ? 'master:manage' : 'package:read',
    );
  }

  paymentAccount(principal: SessionPrincipal, mutation = false) {
    this.policy.requireCapability(
      principal.capabilities,
      mutation ? 'payment-account:manage' : 'payment-account:read',
    );
  }

  review(principal: SessionPrincipal, mutation = false) {
    const current = mutation ? 'payment:decide' : 'payment:review';
    const legacy = mutation ? 'purchase:decide' : 'purchase:review';
    if (!principal.capabilities.includes(current) && !principal.capabilities.includes(legacy))
      this.policy.requireCapability(principal.capabilities, current);
  }

  scope(principal: SessionPrincipal, branchId: string, capabilities: string[]) {
    if (
      !this.policy.hasCapability(principal, 'branch:all', branchId) &&
      !this.policy.hasCapability(principal, 'finance:reconcile', branchId) &&
      !capabilities.some((capability) => this.policy.hasCapability(principal, capability, branchId))
    )
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  branchScope(principal: SessionPrincipal, capability: string) {
    return this.policy.capabilityBranchScope(principal, capability);
  }

  async requireVerifiedCustomer(principal: SessionPrincipal) {
    if (!principal.roles.some(({ role }) => role === 'CUSTOMER')) return;
    const approved = await this.db.identityVerificationDocument.groupBy({
      by: ['kind'],
      where: { userId: principal.userId, status: 'APPROVED', replacedById: null },
    });
    if (!['SELFIE', 'KTP_FRONT'].every((kind) => approved.some((item) => item.kind === kind)))
      throw new ApiProblem('IDENTITY_VERIFICATION_REQUIRED', HttpStatus.FORBIDDEN);
  }

  audit(
    tx: Prisma.TransactionClient,
    principal: SessionPrincipal,
    action: string,
    type: string,
    id: string,
    branchId: string,
    correlationId: string,
    evidence?: Prisma.InputJsonObject,
  ) {
    return tx.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: principal.userId,
        action,
        objectType: type,
        objectId: id,
        branchId,
        correlationId,
        afterMasked: { status: 'masked', ...(evidence ?? {}) },
      },
    });
  }
}
