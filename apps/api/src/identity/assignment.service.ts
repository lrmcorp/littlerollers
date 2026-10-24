import { requireReason } from '../foundation/reason';
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../foundation/audit.service';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { ApiProblem, newId } from './security';

export type AssignmentType = 'OWNER' | 'INSTRUCTOR';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    @Optional() private readonly audit?: AuditService,
  ) {}

  async list(
    principal: SessionPrincipal,
    input: {
      branchId?: string;
      q?: string;
      type?: AssignmentType;
      status?: 'ACTIVE' | 'ENDED';
      cursor?: string;
      limit?: number;
    } = {},
  ) {
    this.policy.requireCapability(principal.capabilities, 'assignment:read');
    this.ensureScope(principal, input.branchId);

    const limit = Math.min(100, Math.max(1, input.limit ?? 20));
    const scopeWhere: Prisma.PenugasanInstrukturWhereInput = input.branchId
      ? { branchId: input.branchId }
      : principal.capabilities.includes('branch:all')
        ? {}
        : { branchId: { in: principal.branchIds } };

    const query = input.q?.trim();
    const where: Prisma.PenugasanInstrukturWhereInput = {
      ...scopeWhere,
      active: input.status === 'ACTIVE' ? true : input.status === 'ENDED' ? false : undefined,
      ...(query
        ? {
            OR: [
              { id: query },
              { coachId: query },
              { coach: { displayName: { contains: query } } },
              { coach: { phone: { contains: query } } },
              { branch: { name: { contains: query } } },
              { branch: { code: { contains: query } } },
            ],
          }
        : {}),
    };

    if (input.type === 'OWNER') {
      const scopeWhere: Prisma.OwnerCabangWhereInput = input.branchId
        ? { branchId: input.branchId }
        : principal.capabilities.includes('branch:all')
          ? {}
          : { branchId: { in: principal.branchIds } };

      const [rows, total] = await Promise.all([
        this.db.ownerCabang.findMany({
          where: {
            ...scopeWhere,
            ...(query
              ? {
                  OR: [
                    { owner: { displayName: { contains: query } } },
                    { owner: { email: { contains: query } } },
                    { branch: { name: { contains: query } } },
                    { branch: { code: { contains: query } } },
                  ],
                }
              : {}),
          },
          include: {
            owner: { select: { id: true, displayName: true, phone: true } },
            branch: { select: { id: true, code: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: limit + 1,
        }),
        this.db.ownerCabang.count({ where: scopeWhere }),
      ]);

      const hasMore = rows.length > limit;
      const items = rows.slice(0, limit);

      return {
        items: items.map((item) => ({
          id: item.id,
          userId: item.ownerId,
          branchId: item.branchId,
          assignmentType: 'OWNER' as AssignmentType,
          activeFrom: item.createdAt.toISOString().slice(0, 10),
          activeUntil: null,
          status: 'ACTIVE' as const,
          version: 1,
          user: {
            id: item.owner.id,
            displayName: item.owner.displayName,
            phoneE164: item.owner.phone,
          },
          branch: item.branch,
        })),
        summary: { total, active: total, ended: 0 },
        page: {
          hasMore,
          nextCursor: hasMore && items.at(-1) ? items.at(-1)!.id : null,
        },
      };
    }

    const [rows, total, active, ended] = await Promise.all([
      this.db.penugasanInstruktur.findMany({
        where,
        include: {
          coach: { select: { id: true, displayName: true, phone: true } },
          branch: { select: { id: true, code: true, name: true } },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
      }),
      this.db.penugasanInstruktur.count({ where: scopeWhere }),
      this.db.penugasanInstruktur.count({ where: { ...scopeWhere, active: true } }),
      this.db.penugasanInstruktur.count({ where: { ...scopeWhere, active: false } }),
    ]);

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);

    return {
      items: items.map((item) => ({
        id: item.id,
        userId: item.coachId,
        branchId: item.branchId,
        assignmentType: 'INSTRUCTOR' as AssignmentType,
        activeFrom: item.createdAt.toISOString().slice(0, 10),
        activeUntil: null,
        status: item.active ? 'ACTIVE' : 'ENDED',
        version: 1,
        user: {
          id: item.coach.id,
          displayName: item.coach.displayName,
          phoneE164: item.coach.phone,
        },
        branch: item.branch,
      })),
      summary: { total, active, ended },
      page: {
        hasMore,
        nextCursor: hasMore && items.at(-1) ? items.at(-1)!.id : null,
      },
    };
  }

  async create(
    principal: SessionPrincipal,
    input: {
      userId: string;
      branchId: string;
      assignmentType: AssignmentType;
      activeFrom: string;
      activeUntil?: string | null;
      reason: string;
    },
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'assignment:manage');
    this.ensureScope(principal, input.branchId);

    const [user, branch] = await Promise.all([
      this.db.user.findUnique({ where: { id: input.userId } }),
      this.db.cabang.findUnique({ where: { id: input.branchId } }),
    ]);

    if (!user || user.status !== 'ACTIVE' || !branch || !branch.active)
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    if (input.assignmentType === 'OWNER') {
      const isSuperOwner = principal.roles.some((r) =>
        ['SUPER_OWNER', 'SUPERADMIN'].includes(r.role as string),
      );
      if (!isSuperOwner) throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);

      const promotedToOwner =
        user.role !== 'OWNER' && user.role !== 'SUPER_OWNER' && (user.role as any) !== 'SUPERADMIN';
      if (promotedToOwner) {
        await this.db.user.update({
          where: { id: user.id },
          data: { role: 'OWNER' },
        });
      }

      const assignment = await this.db.ownerCabang.upsert({
        where: {
          ownerId_branchId: {
            ownerId: input.userId,
            branchId: input.branchId,
          },
        },
        create: {
          id: newId(),
          ownerId: input.userId,
          branchId: input.branchId,
        },
        update: {},
      });

      await this.audit?.catat(null, {
        actorId: principal.userId,
        branchId: input.branchId,
        correlationId: _correlationId,
        action: 'assignment.created',
        objectType: 'Assignment',
        objectId: assignment.id,
        beforeMasked: promotedToOwner ? { role: user.role } : undefined,
        afterMasked: {
          type: 'OWNER',
          userId: input.userId,
          activeFrom: input.activeFrom,
          activeUntil: input.activeUntil ?? null,
          reason: input.reason,
          ...(promotedToOwner ? { role: 'OWNER' } : {}),
        },
      });
      return { id: assignment.id, status: 'ACTIVE', version: 1 };
    }

    const assignment = await this.db.penugasanInstruktur.upsert({
      where: {
        coachId_branchId: {
          coachId: input.userId,
          branchId: input.branchId,
        },
      },
      create: {
        id: newId(),
        coachId: input.userId,
        branchId: input.branchId,
        active: true,
      },
      update: {
        active: true,
      },
    });

    await this.audit?.catat(null, {
      actorId: principal.userId,
      branchId: input.branchId,
      correlationId: _correlationId,
      action: 'assignment.created',
      objectType: 'Assignment',
      objectId: assignment.id,
      afterMasked: {
        type: 'INSTRUCTOR',
        userId: input.userId,
        activeFrom: input.activeFrom,
        activeUntil: input.activeUntil ?? null,
        reason: input.reason,
      },
    });
    return { id: assignment.id, status: 'ACTIVE', version: 1 };
  }

  async end(
    principal: SessionPrincipal,
    assignmentId: string,
    input: { effectiveAt: string; reason: string; expectedVersion?: number },
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'assignment:manage');
    const reason = requireReason(input?.reason);

    const ownerBranch = await this.db.ownerCabang.findUnique({ where: { id: assignmentId } });
    if (ownerBranch) {
      const isSuperOwner = principal.roles.some((r) =>
        ['SUPER_OWNER', 'SUPERADMIN'].includes(r.role as string),
      );
      if (!isSuperOwner) throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);

      await this.db.ownerCabang.delete({ where: { id: assignmentId } });
      await this.audit?.catat(null, {
        actorId: principal.userId,
        branchId: ownerBranch.branchId,
        correlationId: _correlationId,
        action: 'assignment.ended',
        objectType: 'Assignment',
        objectId: assignmentId,
        reason,
        beforeMasked: { type: 'OWNER', userId: ownerBranch.ownerId, branchId: ownerBranch.branchId },
        afterMasked: { effectiveAt: input?.effectiveAt },
      });
      return { id: assignmentId, status: 'ENDED', version: 1 };
    }

    const assignment = await this.db.penugasanInstruktur.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    this.ensureScope(principal, assignment.branchId);

    await this.db.penugasanInstruktur.update({
      where: { id: assignmentId },
      data: { active: false },
    });

    await this.audit?.catat(null, {
      actorId: principal.userId,
      branchId: assignment.branchId,
      correlationId: _correlationId,
      action: 'assignment.ended',
      objectType: 'Assignment',
      objectId: assignmentId,
      reason,
      beforeMasked: { type: 'INSTRUCTOR', userId: assignment.coachId, branchId: assignment.branchId },
      afterMasked: { effectiveAt: input?.effectiveAt },
    });
    return { id: assignmentId, status: 'ENDED', version: 1 };
  }

  private ensureScope(principal: SessionPrincipal, branchId?: string) {
    if (
      branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
