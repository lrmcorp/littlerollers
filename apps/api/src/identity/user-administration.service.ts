import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { type ApplicationRole, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { canonicalEmailHash, normalizeEmail } from './credential-security';
import { ResendPasswordEmailProvider } from './email-provider';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { RateLimitService } from './rate-limit.service';
import { ApiProblem, digest, newId, opaqueToken, syntheticConfigSeconds } from './security';

@Injectable()
export class UserAdministrationService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly rateLimit: RateLimitService,
    private readonly passwordEmail: ResendPasswordEmailProvider,
    @Optional() private readonly idempotency?: IdempotencyService,
  ) {}

  private audit(
    tx: Prisma.TransactionClient | PrismaService,
    input: {
      actorId?: string;
      action: string;
      objectType: string;
      objectId: string;
      targetUserId?: string;
      correlationId: string;
      branchId?: string;
      before?: Prisma.InputJsonValue;
      after?: Prisma.InputJsonValue;
    },
  ) {
    return tx.auditLog.create({
      data: {
        id: newId(),
        actorType: input.actorId ? 'USER' : 'SYSTEM',
        actorId: input.actorId,
        branchId: input.branchId,
        action: input.action,
        objectType: input.objectType,
        objectId: input.objectId,
        targetUserId: input.targetUserId,
        beforeMasked: input.before,
        afterMasked: input.after,
        correlationId: input.correlationId,
      },
    });
  }

  private activeRoleWhere(now = new Date()) {
    return { activeFrom: { lte: now }, OR: [{ activeUntil: null }, { activeUntil: { gt: now } }] };
  }

  private roleBranches(role: ApplicationRole, branchIds: string[]): Array<string | null> {
    return role === 'ADMIN' || role === 'MANAGER' ? branchIds : [null];
  }

  private normalizePhone(value: string): string {
    const compact = value.replace(/[\s().-]/g, '');
    const normalized = compact.startsWith('0') ? `+62${compact.slice(1)}` : compact;
    if (!/^\+[1-9]\d{7,14}$/u.test(normalized))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return normalized;
  }

  async listUsers(
    principal: SessionPrincipal,
    filters: {
      branchId?: string;
      cursor?: string;
      search?: string;
      status?: 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE';
      role?: ApplicationRole;
    },
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:read');
    const { branchId, cursor, search, status, role } = filters;
    if (
      branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const allowedBranches = branchId ? [branchId] : principal.branchIds;
    const roleWhere = {
      ...this.activeRoleWhere(),
      ...(role ? { role } : {}),
      ...(branchId ? { OR: [{ branchId }, { branchId: null }] } : {}),
    };
    const scopedWhere: Prisma.UserWhereInput = {
      ...(search?.trim() ? { displayName: { contains: search.trim() } } : {}),
      ...(principal.capabilities.includes('branch:all')
        ? role || branchId
          ? { roles: { some: roleWhere } }
          : {}
        : {
            roles: {
              some: {
                ...roleWhere,
                branchId: { in: allowedBranches },
              },
            },
          }),
    };
    const [users, total, active, pendingActivation, inactive] = await Promise.all([
      this.db.user.findMany({
        where: {
          ...scopedWhere,
          ...(status ? { status } : {}),
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        include: {
          roles: {
            where: this.activeRoleWhere(),
            include: { branch: { select: { id: true, code: true, name: true } } },
            orderBy: [{ role: 'asc' }, { branchId: 'asc' }],
          },
        },
        take: 21,
        orderBy: { id: 'asc' },
      }),
      this.db.user.count({ where: scopedWhere }),
      this.db.user.count({ where: { ...scopedWhere, status: 'ACTIVE' } }),
      this.db.user.count({ where: { ...scopedWhere, status: 'PENDING_ACTIVATION' } }),
      this.db.user.count({ where: { ...scopedWhere, status: 'INACTIVE' } }),
    ]);
    const hasMore = users.length > 20;
    const page = users.slice(0, 20);
    return {
      items: page.map((user) => this.userView(user)),
      page: { nextCursor: hasMore ? page.at(-1)?.id : null, hasMore },
      summary: { total, active, pendingActivation, inactive },
    };
  }

  async lookupUsers(
    principal: SessionPrincipal,
    filters: {
      q?: string;
      branchId?: string;
      cursor?: string;
      limit?: number;
      instructorsOnly?: boolean;
    },
  ) {
    const allowed = filters.instructorsOnly
      ? ['master:read', 'class-slot:manage', 'class-slot:read']
      : ['user:read', 'audit:read'];
    if (!allowed.some((capability) => principal.capabilities.includes(capability)))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const limit = filters.limit ?? 20;
    if (!Number.isInteger(limit) || limit < 1 || limit > 50)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (
      filters.branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(filters.branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const branchIds = filters.branchId ? [filters.branchId] : principal.branchIds;
    const scopedRole = {
      ...this.activeRoleWhere(),
      ...(filters.instructorsOnly ? { role: 'INSTRUCTOR' as const } : {}),
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
    };
    const users = await this.db.user.findMany({
      where: {
        status: 'ACTIVE',
        ...(filters.q?.trim() ? { displayName: { contains: filters.q.trim() } } : {}),
        ...(filters.cursor ? { id: { gt: filters.cursor } } : {}),
        ...(principal.capabilities.includes('branch:all')
          ? filters.instructorsOnly || filters.branchId
            ? { roles: { some: scopedRole } }
            : {}
          : {
              roles: {
                some: {
                  ...scopedRole,
                  branchId: { in: branchIds },
                },
              },
            }),
      },
      include: {
        roles: {
          where: this.activeRoleWhere(),
          include: { branch: { select: { id: true, code: true, name: true } } },
          orderBy: [{ role: 'asc' }, { branchId: 'asc' }],
        },
      },
      orderBy: { id: 'asc' },
      take: limit + 1,
    });
    const hasMore = users.length > limit;
    const page = users.slice(0, limit);
    return {
      items: page.map((user) => ({
        id: user.id,
        label: user.displayName,
        description: user.roles
          .map(({ role, branch }) => `${role}${branch ? ` · ${branch.code}` : ''}`)
          .join(', '),
        metadata: {
          roles: user.roles.map(({ role }) => role),
          branchIds: user.roles.flatMap(({ branchId }) => (branchId ? [branchId] : [])),
        },
      })),
      page: { nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null, hasMore },
    };
  }

  async getUser(principal: SessionPrincipal, targetId: string) {
    this.policy.requireCapability(principal.capabilities, 'user:read');
    const user = await this.db.user.findUnique({
      where: { id: targetId },
      include: {
        roles: {
          where: this.activeRoleWhere(),
          include: { branch: { select: { id: true, code: true, name: true } } },
          orderBy: [{ role: 'asc' }, { branchId: 'asc' }],
        },
      },
    });
    if (
      !user ||
      (!principal.capabilities.includes('branch:all') &&
        !user.roles.some(({ branchId }) => branchId && principal.branchIds.includes(branchId)))
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return this.userView(user);
  }

  async updateUserProfile(
    principal: SessionPrincipal,
    targetId: string,
    input: {
      displayName: string;
      phoneE164?: string | null;
      expectedVersion: number;
      reason: string;
    },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    const visible = await this.getUser(principal, targetId);
    const displayName = input.displayName?.trim();
    const reason = input.reason?.trim();
    const phoneE164 = input.phoneE164?.trim() ? this.normalizePhone(input.phoneE164) : null;
    if (
      !displayName ||
      displayName.length < 2 ||
      displayName.length > 160 ||
      !reason ||
      reason.length < 3 ||
      !Number.isInteger(input.expectedVersion)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (visible.roles.every(({ role }) => role === 'CUSTOMER'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    return this.db.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: { id: targetId, version: input.expectedVersion },
        data: { displayName, phoneE164, version: { increment: 1 } },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await this.audit(tx, {
        actorId: principal.userId,
        action: 'security.user_profile_updated',
        objectType: 'User',
        objectId: targetId,
        targetUserId: targetId,
        correlationId,
        before: {
          displayName: visible.displayName,
          phoneConfigured: Boolean(visible.phoneE164),
          version: visible.version,
        },
        after: {
          displayName,
          phoneConfigured: Boolean(phoneE164),
          reasonPresent: true,
          version: visible.version + 1,
          sessionsRevoked: false,
        },
      });
      const updated = await tx.user.findUnique({
        where: { id: targetId },
        include: {
          roles: {
            where: this.activeRoleWhere(),
            include: { branch: { select: { id: true, code: true, name: true } } },
            orderBy: [{ role: 'asc' }, { branchId: 'asc' }],
          },
        },
      });
      if (!updated) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      return this.userView(updated);
    });
  }

  async inviteUser(
    principal: SessionPrincipal,
    input: {
      email: string;
      displayName?: string;
      roles?: ApplicationRole[];
      branchIds?: string[];
      roleAssignments?: { role: ApplicationRole; branchId?: string | null }[];
    },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    const legacyBranchIds = [...new Set(input.branchIds ?? [])];
    const roleAssignments = input.roleAssignments?.length
      ? input.roleAssignments.map(({ role, branchId }) => ({ role, branchId: branchId ?? null }))
      : (input.roles ?? []).flatMap((role) =>
          this.roleBranches(role, legacyBranchIds).map((branchId) => ({ role, branchId })),
        );
    const branchIds = [
      ...new Set(roleAssignments.flatMap(({ branchId }) => (branchId ? [branchId] : []))),
    ];
    if (
      !principal.capabilities.includes('branch:all') &&
      branchIds.some((id) => !principal.branchIds.includes(id))
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const allowed = new Set<ApplicationRole>(['ADMIN', 'MANAGER', 'FINANCE', 'OPS']);
    if (
      !roleAssignments.length ||
      roleAssignments.some(
        ({ role, branchId }) =>
          !allowed.has(role) ||
          (['ADMIN', 'MANAGER'].includes(role) ? !branchId : Boolean(branchId)),
      )
    )
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const roleKeys = roleAssignments.map(({ role, branchId }) => `${role}:${branchId ?? ''}`);
    if (new Set(roleKeys).size !== roleKeys.length)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (
      branchIds.length &&
      (await this.db.branch.count({ where: { id: { in: branchIds }, active: true } })) !==
        branchIds.length
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const normalizedEmail = normalizeEmail(input.email);
    const emailHash = canonicalEmailHash(normalizedEmail);
    const subjectHash = digest(`google:${normalizedEmail}`);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(normalizedEmail))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    await this.rateLimit.consume('USER_INVITE', digest(principal.userId));
    const [existingIdentity, existingPassword, acceptedInvitation] = await Promise.all([
      this.db.identity.findUnique({
        where: { provider_subjectHash: { provider: 'GOOGLE', subjectHash } },
      }),
      this.db.passwordCredential.findUnique({ where: { emailHash } }),
      this.db.userInvitation.findFirst({ where: { emailHash, status: 'ACCEPTED' } }),
    ]);
    if (existingIdentity || existingPassword || acceptedInvitation)
      throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
    const existing = await this.db.userInvitation.findFirst({
      where: {
        emailHash,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });
    if (existing) {
      if (process.env.AUTH_PASSWORD_ENABLED === 'true')
        await this.sendPasswordAction('ACTIVATION', normalizedEmail, {
          emailHash,
          userId: existing.userId ?? undefined,
          invitationId: existing.id,
        });
      return { id: existing.id, status: 'EXISTS' as const };
    }
    const expiresAt = new Date(
      Date.now() + syntheticConfigSeconds('AUTH_INVITATION_TTL_SECONDS', 604_800) * 1000,
    );
    try {
      const invitation = await this.db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            id: newId(),
            displayName: input.displayName?.trim() || 'Internal user',
            email: normalizedEmail,
            status: 'PENDING_ACTIVATION',
          },
        });
        for (const item of roleAssignments)
          await tx.userRole.create({
            data: {
              userId: user.id,
              role: item.role,
              branchId: item.branchId,
              activeFrom: new Date(),
            },
          });
        const created = await tx.userInvitation.create({
          data: {
            invitedById: principal.userId,
            userId: user.id,
            subjectHash,
            emailHash,
            displayName: user.displayName,
            roles: roleAssignments.map(({ role }) => role),
            branchIds,
            expiresAt,
          },
        });
        await this.audit(tx, {
          actorId: principal.userId,
          action: 'security.user_created',
          objectType: 'UserInvitation',
          objectId: created.id,
          targetUserId: user.id,
          correlationId,
          after: { roles: roleAssignments, branchCount: branchIds.length, activation: 'PENDING' },
        });
        return created;
      });
      if (process.env.AUTH_PASSWORD_ENABLED === 'true')
        await this.sendPasswordAction('ACTIVATION', normalizedEmail, {
          emailHash,
          userId: invitation.userId ?? undefined,
          invitationId: invitation.id,
        });
      return { id: invitation.id, status: invitation.status };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const concurrent = await this.db.userInvitation.findFirst({
          where: { emailHash, status: 'PENDING' },
        });
        if (concurrent) return { id: concurrent.id, status: concurrent.status };
      }
      throw error;
    }
  }

  private async sendPasswordAction(
    kind: 'ACTIVATION' | 'RESET' | 'SETUP',
    email: string,
    target: { emailHash: string; userId?: string; invitationId?: string },
  ) {
    const token = opaqueToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.db.passwordActionToken.create({
      data: {
        kind,
        tokenHash: digest(token),
        emailHash: target.emailHash,
        userId: target.userId,
        invitationId: target.invitationId,
        expiresAt,
      },
    });
    await this.passwordEmail.send(kind, email, token);
    return { expiresAt: expiresAt.toISOString() };
  }

  async updateUserRoles(
    principal: SessionPrincipal,
    targetId: string,
    input: {
      roles: { role: ApplicationRole; branchId?: string | null }[];
      expectedVersion: number;
      reason: string;
    },
    correlationId: string,
    idempotencyKey?: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    if (!idempotencyKey?.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (targetId === principal.userId)
      throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.CONFLICT);
    if (!Number.isInteger(input.expectedVersion) || !input.reason.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const assignable = new Set<ApplicationRole>(['ADMIN', 'MANAGER', 'FINANCE', 'OPS']);
    if (
      !input.roles.length ||
      input.roles.some(
        ({ role, branchId }) =>
          !assignable.has(role) ||
          (['ADMIN', 'MANAGER'].includes(role) ? !branchId : Boolean(branchId)),
      )
    )
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const keys = input.roles.map(({ role, branchId }) => `${role}:${branchId ?? ''}`);
    if (new Set(keys).size !== keys.length)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const branchIds = input.roles.flatMap(({ branchId }) => (branchId ? [branchId] : []));
    const branches = await this.db.branch.count({
      where: { id: { in: branchIds }, active: true },
    });
    if (branches !== new Set(branchIds).size)
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const perform = async (tx: Prisma.TransactionClient) => {
      const now = new Date();
      const before = await tx.user.findUnique({
        where: { id: targetId },
        include: { roles: { where: this.activeRoleWhere(now) } },
      });
      if (!before) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const updated = await tx.user.updateMany({
        where: { id: targetId, version: input.expectedVersion },
        data: { version: { increment: 1 } },
      });
      if (updated.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await tx.userRole.updateMany({
        where: {
          userId: targetId,
          role: { in: ['ADMIN', 'MANAGER', 'FINANCE', 'OPS'] },
          activeUntil: null,
        },
        data: { activeUntil: now },
      });
      for (const item of input.roles)
        await tx.userRole.create({
          data: {
            userId: targetId,
            role: item.role,
            branchId: item.branchId ?? null,
            activeFrom: now,
          },
        });
      await tx.userSession.updateMany({
        where: { userId: targetId, revokedAt: null },
        data: { revokedAt: now, revocationReason: 'ROLE_CHANGED' },
      });
      await this.audit(tx, {
        actorId: principal.userId,
        action: 'security.user_roles_changed',
        objectType: 'User',
        objectId: targetId,
        targetUserId: targetId,
        correlationId,
        before: {
          roles: before.roles.map(({ role, branchId }) => ({ role, branchId })),
          version: before.version,
        },
        after: { roles: input.roles, reasonPresent: true, version: before.version + 1 },
      });
      const after = await tx.user.findUnique({
        where: { id: targetId },
        include: {
          roles: {
            where: this.activeRoleWhere(now),
            include: { branch: { select: { id: true, code: true, name: true } } },
            orderBy: [{ role: 'asc' }, { branchId: 'asc' }],
          },
        },
      });
      if (!after) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      return this.userView(after);
    };

    if (!this.idempotency) return this.db.$transaction((tx) => perform(tx));

    const result = await this.idempotency.execute(
      {
        scope: `identity.user-roles:${principal.userId}:${targetId}`,
        key: idempotencyKey,
        payload: input,
        ttlMs: 24 * 60 * 60 * 1000,
        leaseMs: 30_000,
      },
      async (tx) => ({
        status: 200,
        body: (await perform(tx)) as unknown as Prisma.InputJsonObject,
      }),
    );
    return result.body as unknown as Awaited<ReturnType<typeof perform>>;
  }

  async deactivate(
    principal: SessionPrincipal,
    targetId: string,
    reason: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    if (targetId === principal.userId)
      throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.CONFLICT);
    if (!reason.trim() || !Number.isInteger(expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.db.$transaction(async (tx) => {
      const before = await tx.user.findUnique({ where: { id: targetId } });
      if (!before) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const changed = await tx.user.updateMany({
        where: { id: targetId, version: expectedVersion, status: { not: 'INACTIVE' } },
        data: { status: 'INACTIVE', version: { increment: 1 } },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      const user = { ...before, status: 'INACTIVE' as const, version: before.version + 1 };
      await tx.userSession.updateMany({
        where: { userId: targetId, revokedAt: null },
        data: { revokedAt: new Date(), revocationReason: 'USER_DEACTIVATED' },
      });
      await tx.auditLog.create({
        data: {
          id: newId(),
          actorType: 'USER',
          actorId: principal.userId,
          action: 'security.user_deactivated',
          objectType: 'User',
          objectId: targetId,
          targetUserId: targetId,
          beforeMasked: { status: before.status },
          afterMasked: { status: user.status, reasonPresent: Boolean(reason) },
          correlationId,
        },
      });
      return { id: user.id, status: user.status };
    });
  }

  async reactivate(
    principal: SessionPrincipal,
    targetId: string,
    reason: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    if (targetId === principal.userId)
      throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.CONFLICT);
    if (!reason.trim() || !Number.isInteger(expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.db.$transaction(async (tx) => {
      const before = await tx.user.findUnique({ where: { id: targetId } });
      if (!before) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      if (before.status === 'ACTIVE')
        throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
      const changed = await tx.user.updateMany({
        where: { id: targetId, version: expectedVersion, status: { not: 'ACTIVE' } },
        data: { status: 'ACTIVE', version: { increment: 1 } },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      const user = { ...before, status: 'ACTIVE' as const, version: before.version + 1 };
      await this.audit(tx, {
        actorId: principal.userId,
        action: 'security.user_reactivated',
        objectType: 'User',
        objectId: targetId,
        targetUserId: targetId,
        correlationId,
        before: { status: before.status, version: before.version },
        after: { status: user.status, reasonPresent: Boolean(reason), version: user.version },
      });
      return { id: user.id, status: user.status, version: user.version };
    });
  }

  async listUserAudit(principal: SessionPrincipal, targetId: string, cursor?: string) {
    this.policy.requireCapability(principal.capabilities, 'audit:read');
    await this.getUser(principal, targetId);
    const items = await this.db.auditLog.findMany({
      where: {
        OR: [{ targetUserId: targetId }, { objectType: 'User', objectId: targetId }],
        ...(cursor ? { id: { gt: cursor } } : {}),
      },
      orderBy: { id: 'asc' },
      take: 21,
    });
    const hasMore = items.length > 20;
    const page = items.slice(0, 20);
    return {
      items: page,
      page: { nextCursor: hasMore ? page.at(-1)?.id : null, hasMore },
    };
  }

  async listAuditLogs(
    principal: SessionPrincipal,
    filters: {
      actorId?: string;
      targetUserId?: string;
      action?: string;
      branchId?: string;
      correlationId?: string;
      from?: string;
      until?: string;
      cursor?: string;
    },
  ) {
    this.policy.requireCapability(principal.capabilities, 'audit:read');
    const { actorId, targetUserId, action, branchId, correlationId, from, until, cursor } = filters;
    const fromDate = from ? new Date(from) : undefined;
    const untilDate = until ? new Date(until) : undefined;
    if (
      (fromDate && Number.isNaN(fromDate.getTime())) ||
      (untilDate && Number.isNaN(untilDate.getTime())) ||
      (fromDate && untilDate && fromDate >= untilDate)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (
      branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const items = await this.db.auditLog.findMany({
      where: {
        ...(actorId ? { actorId } : {}),
        ...(targetUserId
          ? {
              OR: [{ targetUserId }, { objectType: 'User', objectId: targetUserId }],
            }
          : {}),
        ...(action?.trim() ? { action: { contains: action.trim() } } : {}),
        ...(branchId ? { branchId } : {}),
        ...(correlationId?.trim() ? { correlationId: correlationId.trim() } : {}),
        ...(fromDate || untilDate
          ? {
              occurredAt: {
                ...(fromDate ? { gte: fromDate } : {}),
                ...(untilDate ? { lt: untilDate } : {}),
              },
            }
          : {}),
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      take: 21,
    });
    const hasMore = items.length > 20;
    const page = items.slice(0, 20);
    return {
      items: page,
      page: { nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null, hasMore },
    };
  }

  private userView(user: {
    id: string;
    displayName: string;
    phoneE164?: string | null;
    status: 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE';
    version: number;
    createdAt: Date;
    updatedAt: Date;
    roles: {
      role: ApplicationRole;
      branchId: string | null;
      sourceAssignmentId: string | null;
      branch: { id: string; code: string; name: string } | null;
    }[];
  }) {
    const roles = user.roles.map(({ role, branchId, sourceAssignmentId, branch }) => ({
      role,
      branchId,
      branch,
      source: sourceAssignmentId ? ('ASSIGNMENT' as const) : ('DIRECT' as const),
    }));
    return {
      id: user.id,
      displayName: user.displayName,
      phoneE164: user.phoneE164 ?? null,
      status: user.status,
      version: user.version,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      roles,
      directRoles: roles.filter(({ source }) => source === 'DIRECT'),
      assignmentRoles: roles.filter(({ source }) => source === 'ASSIGNMENT'),
      effectiveCapabilities: this.policy.capabilities(user.roles),
    };
  }
}
