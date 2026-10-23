import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';
import { AuditService } from '../foundation/audit.service';

@Injectable()
export class MasterAccessService {
  constructor(
    private readonly policy: PolicyService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

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

  /**
   * Baca-saja katalog tipe kelas dan studio untuk form jadwal. Pelaku penjadwalan (`class-slot:manage`)
   * cukup dengan itu, sehingga tidak perlu `master:read` yang juga membuka Data Master (tarif/fee).
   */
  authorizeCatalogRead(principal: SessionPrincipal) {
    this.policy.requireAnyCapability(principal.capabilities, ['master:read', 'class-slot:manage']);
  }

  ensureCatalogBranchScope(principal: SessionPrincipal, branchId: string) {
    if (
      !this.policy.hasCapability(principal, 'branch:all', branchId) &&
      !this.policy.hasCapability(principal, 'master:read', branchId) &&
      !this.policy.hasCapability(principal, 'class-slot:manage', branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  branchScope(principal: SessionPrincipal, mutation = false) {
    return this.policy.capabilityBranchScope(principal, mutation ? 'master:manage' : 'master:read');
  }

  /** Jejak audit permanen untuk perubahan data master; ikut transaksi pemanggil. */
  async audit(
    tx: Prisma.TransactionClient,
    principal: SessionPrincipal,
    correlationId: string,
    action: string,
    objectType: string,
    objectId: string,
    branchId: string | null,
    before?: Prisma.InputJsonValue,
    after?: Prisma.InputJsonValue,
    reason?: string | null,
  ) {
    await this.auditService?.catat(tx, {
      actorId: principal.userId,
      branchId,
      correlationId,
      action,
      objectType,
      objectId,
      reason,
      beforeMasked: before,
      afterMasked: after,
    });
  }
}
