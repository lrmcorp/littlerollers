import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from './identity.service';
import { ApiProblem } from './security';

@Injectable()
export class CustomerProfileService {
  constructor(private readonly db: PrismaService) {}

  async get(principal: SessionPrincipal) {
    const user = await this.db.user.findUnique({
      where: { id: principal.userId },
    });
    if (!user || user.status !== 'ACTIVE')
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);

    const preferredBranch = user.preferredBranchId
      ? await this.db.cabang.findUnique({
          where: { id: user.preferredBranchId },
          select: {
            id: true,
            code: true,
            name: true,
            timezone: true,
            supportWhatsappE164: true,
            active: true,
          },
        })
      : null;

    return {
      id: user.id,
      displayName: user.displayName,
      emailMasked: maskEmail(user.email),
      phoneMasked: maskPhone(user.phone),
      preferredBranch: preferredBranch?.active ? preferredBranch : null,
      version: 1,
    };
  }

  async update(
    principal: SessionPrincipal,
    input: { displayName: string; preferredBranchId?: string | null; expectedVersion?: number },
    _correlationId?: string,
  ) {
    const displayName = input.displayName?.trim();
    if (!displayName || displayName.length < 2 || displayName.length > 160)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const isCustomer = principal.roles.some(({ role }) => role === 'CUSTOMER' || role === 'MEMBER');
    if (!isCustomer && input.preferredBranchId)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const branch = input.preferredBranchId
      ? await this.db.cabang.findFirst({
          where: { id: input.preferredBranchId, active: true },
          select: { id: true },
        })
      : null;
    if (input.preferredBranchId && !branch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (isCustomer && input.preferredBranchId === null)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const existing = await this.db.user.findUnique({ where: { id: principal.userId } });
    if (!existing || existing.status !== 'ACTIVE')
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);

    const updated = await this.db.user.update({
      where: { id: principal.userId },
      data: {
        displayName,
        ...(input.preferredBranchId !== undefined
          ? { preferredBranchId: input.preferredBranchId }
          : {}),
      },
    });

    if ((this.db as any).auditLog?.create) {
      await (this.db as any).auditLog.create({
        data: {
          action: 'security.my_profile_updated',
          actorId: principal.userId,
          targetUserId: principal.userId,
          correlationId: _correlationId,
        },
      });
    }

    const preferredBranch =
      (updated as any)?.preferredBranch ??
      (input.preferredBranchId
        ? await ((this.db.cabang as any)?.findUnique?.({ where: { id: input.preferredBranchId } }) ?? branch)
        : null);

    return {
      id: updated?.id ?? existing.id,
      displayName: updated?.displayName ?? existing.displayName,
      emailMasked: maskEmail(updated?.email ?? existing.email),
      phoneMasked: maskPhone((updated as any)?.phone ?? (updated as any)?.phoneE164 ?? (existing as any)?.phone ?? (existing as any)?.phoneE164),
      preferredBranch: preferredBranch?.active ? preferredBranch : (preferredBranch ?? null),
      version: (updated as any)?.version ?? (existing as any)?.version ?? 1,
    };
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
