import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from './identity.service';
import { ApiProblem, newId } from './security';
import { recordPilotRollbackOutbox } from '../migration/pilot-rollback-outbox.service';

@Injectable()
export class CustomerProfileService {
  constructor(private readonly db: PrismaService) {}

  async get(principal: SessionPrincipal) {
    const user = await this.db.user.findUnique({
      where: { id: principal.userId },
      include: {
        preferredBranch: {
          select: {
            id: true,
            code: true,
            name: true,
            timezone: true,
            supportWhatsappE164: true,
            active: true,
          },
        },
      },
    });
    if (!user || user.status !== 'ACTIVE')
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    return {
      id: user.id,
      displayName: user.displayName,
      emailMasked: maskEmail(user.email),
      phoneMasked: maskPhone(user.phoneE164),
      preferredBranch: user.preferredBranch?.active ? user.preferredBranch : null,
      version: user.version,
    };
  }

  async update(
    principal: SessionPrincipal,
    input: { displayName: string; preferredBranchId?: string | null; expectedVersion: number },
    correlationId: string,
  ) {
    const displayName = input.displayName?.trim();
    if (
      !displayName ||
      displayName.length < 2 ||
      displayName.length > 160 ||
      !Number.isInteger(input.expectedVersion)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const isCustomer = principal.roles.some(({ role }) => role === 'CUSTOMER');
    if (!isCustomer && input.preferredBranchId)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const branch = input.preferredBranchId
      ? await this.db.branch.findFirst({
          where: { id: input.preferredBranchId, active: true },
          select: { id: true },
        })
      : null;
    if (input.preferredBranchId && !branch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (isCustomer && input.preferredBranchId === null)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const before = await this.get(principal);
    await this.db.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: { id: principal.userId, version: input.expectedVersion, status: 'ACTIVE' },
        data: {
          displayName,
          ...(input.preferredBranchId !== undefined
            ? { preferredBranchId: input.preferredBranchId }
            : {}),
          version: { increment: 1 },
        },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await tx.auditLog.create({
        data: {
          id: newId(),
          actorType: 'USER',
          actorId: principal.userId,
          action: 'security.my_profile_updated',
          objectType: 'User',
          objectId: principal.userId,
          targetUserId: principal.userId,
          correlationId,
          beforeMasked: {
            displayName: before.displayName,
            preferredBranchId: before.preferredBranch?.id ?? null,
            version: before.version,
          },
          afterMasked: {
            displayName,
            preferredBranchId:
              input.preferredBranchId !== undefined
                ? input.preferredBranchId
                : (before.preferredBranch?.id ?? null),
            version: before.version + 1,
          },
        },
      });
      const rollbackBranchId =
        input.preferredBranchId !== undefined
          ? input.preferredBranchId
          : (before.preferredBranch?.id ?? null);
      if (rollbackBranchId)
        await recordPilotRollbackOutbox(tx, {
          branchId: rollbackBranchId,
          aggregateType: 'CustomerProfile',
          aggregateId: principal.userId,
          operation: 'UPDATE',
          correlationId,
          payload: {
            userId: principal.userId,
            displayName,
            preferredBranchId: rollbackBranchId,
            version: before.version + 1,
          },
        });
    });
    return this.get(principal);
  }
}

function maskEmail(value: string | null | undefined) {
  if (!value) return null;
  const [local, domain] = value.split('@');
  if (!local || !domain) return null;
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(2, local.length - 2))}@${domain}`;
}

function maskPhone(value: string | null | undefined) {
  if (!value) return null;
  return `${value.slice(0, Math.min(4, value.length))}${'*'.repeat(
    Math.max(2, value.length - 8),
  )}${value.slice(-4)}`;
}
