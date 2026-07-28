import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type ApplicationRole } from '@prisma/client';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { ApiProblem, newId } from './security';

const CORE_SUPER_OWNER_CAPABILITIES = [
  'role-permission:manage',
  'user:admin',
  'audit:read',
  'branch:all',
] as const;

const REASON_CODES = new Set([
  'POLICY_UPDATE',
  'DUTY_CHANGE',
  'SECURITY_HARDENING',
  'ACCESS_CORRECTION',
  'TEMPORARY_DUTY',
  'ACCESS_EXCEPTION',
  'SECURITY_RESTRICTION',
  'ROLE_REPLACEMENT',
]);

const SYSTEM_DIRECT_ROLES = new Set<ApplicationRole>([
  'ADMIN',
  'MANAGER',
  'FINANCE',
  'OPS',
  'SUPER_OWNER',
]);

const roleInclude = {
  capabilities: {
    include: {
      capability: true,
    },
    orderBy: { capabilityKey: 'asc' as const },
  },
} satisfies Prisma.RoleDefinitionInclude;

type RoleWithCapabilities = Prisma.RoleDefinitionGetPayload<{ include: typeof roleInclude }>;
type Database = PrismaService | Prisma.TransactionClient;

@Injectable()
export class AccessManagementService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly idempotency: IdempotencyService,
    private readonly config: RuntimeConfigService,
  ) {}

  private authorize(principal: SessionPrincipal) {
    this.policy.requireScopedCapability(principal, 'role-permission:manage');
  }

  private authorizeMutation(principal: SessionPrincipal) {
    this.authorize(principal);
    if (!this.config.value.rbac.managementEnabled)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE, true);
  }

  private validateKey(key: string) {
    if (!key?.trim() || key.length < 16 || key.length > 128)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  }

  private validateReason(reasonCode: string, note?: string | null) {
    if (!REASON_CODES.has(reasonCode))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (note && (note.trim().length < 3 || note.trim().length > 500))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  }

  private audit(
    tx: Database,
    principal: SessionPrincipal,
    correlationId: string,
    action: string,
    objectType: string,
    objectId: string,
    input: {
      targetUserId?: string;
      branchId?: string | null;
      before?: Prisma.InputJsonValue;
      after?: Prisma.InputJsonValue;
    },
  ) {
    return tx.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: principal.userId,
        action,
        objectType,
        objectId,
        targetUserId: input.targetUserId,
        branchId: input.branchId,
        beforeMasked: input.before,
        afterMasked: input.after,
        correlationId,
      },
    });
  }

  private async execute<T extends Prisma.InputJsonValue>(
    principal: SessionPrincipal,
    scope: string,
    key: string,
    payload: unknown,
    action: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    this.authorizeMutation(principal);
    this.validateKey(key);
    const result = await this.idempotency.execute(
      {
        scope: `access:${principal.userId}:${scope}`,
        key,
        payload,
        ttlMs: 24 * 60 * 60 * 1000,
        leaseMs: 30_000,
      },
      async (tx) => ({ status: 200, body: await action(tx) }),
    );
    return result.body as T;
  }

  private roleView(role: RoleWithCapabilities, affectedUsers: number) {
    return {
      id: role.id,
      code: role.code,
      displayName: role.displayName,
      description: role.description,
      scope: role.scope,
      systemRole: role.systemRole,
      system: role.system,
      protected: role.protected,
      active: role.active,
      version: role.version,
      affectedUsers,
      capabilities: role.capabilities.map(({ capability }) => ({
        key: capability.key,
        label: capability.label,
        category: capability.category,
        sensitive: capability.sensitive,
        systemOnly: capability.systemOnly,
        globalOnly: capability.globalOnly,
      })),
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  }

  private async affectedUserIds(database: Database, role: RoleWithCapabilities, at = new Date()) {
    if (role.systemRole) {
      const assignments = await database.userRole.findMany({
        where: {
          role: role.systemRole,
          activeFrom: { lte: at },
          OR: [{ activeUntil: null }, { activeUntil: { gt: at } }],
          user: { status: 'ACTIVE' },
        },
        distinct: ['userId'],
        select: { userId: true },
      });
      return assignments.map(({ userId }) => userId);
    }
    const assignments = await database.accessRoleAssignment.findMany({
      where: {
        roleId: role.id,
        activeFrom: { lte: at },
        OR: [{ activeUntil: null }, { activeUntil: { gt: at } }],
        user: { status: 'ACTIVE' },
      },
      distinct: ['userId'],
      select: { userId: true },
    });
    return assignments.map(({ userId }) => userId);
  }

  async listCapabilities(
    principal: SessionPrincipal,
    filters: { q?: string; category?: string; sensitive?: boolean; active?: boolean },
  ) {
    this.authorize(principal);
    const q = filters.q?.trim();
    const items = await this.db.capabilityDefinition.findMany({
      where: {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.sensitive !== undefined ? { sensitive: filters.sensitive } : {}),
        ...(filters.active !== undefined ? { active: filters.active } : {}),
        ...(q
          ? {
              OR: [
                { key: { contains: q } },
                { label: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
    return {
      items: items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  }

  async listRoles(
    principal: SessionPrincipal,
    filters: { q?: string; scope?: 'GLOBAL' | 'BRANCH'; active?: boolean },
  ) {
    this.authorize(principal);
    const q = filters.q?.trim();
    const roles = await this.db.roleDefinition.findMany({
      where: {
        ...(filters.scope ? { scope: filters.scope } : {}),
        ...(filters.active !== undefined ? { active: filters.active } : {}),
        ...(q
          ? {
              OR: [
                { code: { contains: q } },
                { displayName: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {}),
      },
      include: roleInclude,
      orderBy: [{ system: 'desc' }, { code: 'asc' }],
    });
    return {
      items: await Promise.all(
        roles.map(async (role) =>
          this.roleView(role, (await this.affectedUserIds(this.db, role)).length),
        ),
      ),
    };
  }

  async getRole(principal: SessionPrincipal, id: string) {
    this.authorize(principal);
    const role = await this.db.roleDefinition.findUnique({
      where: { id },
      include: roleInclude,
    });
    if (!role) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return this.roleView(role, (await this.affectedUserIds(this.db, role)).length);
  }

  async createRole(
    principal: SessionPrincipal,
    input: {
      code: string;
      displayName: string;
      description: string;
      scope: 'GLOBAL' | 'BRANCH';
      capabilityKeys: string[];
      reasonCode: string;
      note?: string;
    },
    key: string,
    correlationId: string,
  ) {
    const code = input.code.trim().toUpperCase();
    this.validateReason(input.reasonCode, input.note);
    if (
      !/^[A-Z][A-Z0-9_]{2,63}$/.test(code) ||
      input.displayName.trim().length < 2 ||
      input.displayName.trim().length > 160 ||
      input.description.trim().length < 3 ||
      input.description.trim().length > 500
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.execute(principal, `role:create:${code}`, key, input, async (tx) => {
      const capabilityKeys = [...new Set(input.capabilityKeys)].sort();
      const definitions = await tx.capabilityDefinition.findMany({
        where: { key: { in: capabilityKeys }, active: true },
      });
      if (
        definitions.length !== capabilityKeys.length ||
        definitions.some(
          ({ systemOnly, globalOnly }) => systemOnly || (globalOnly && input.scope !== 'GLOBAL'),
        )
      )
        throw new ApiProblem('PROTECTED_CAPABILITY', HttpStatus.CONFLICT);
      const existing = await tx.roleDefinition.findUnique({ where: { code } });
      if (existing) throw new ApiProblem('ROLE_CODE_CONFLICT', HttpStatus.CONFLICT);
      const role = await tx.roleDefinition.create({
        data: {
          id: newId(),
          code,
          displayName: input.displayName.trim(),
          description: input.description.trim(),
          scope: input.scope,
          capabilities: {
            createMany: { data: capabilityKeys.map((capabilityKey) => ({ capabilityKey })) },
          },
        },
        include: roleInclude,
      });
      await this.audit(
        tx,
        principal,
        correlationId,
        'security.access_role_created',
        'RoleDefinition',
        role.id,
        {
          after: {
            code,
            scope: input.scope,
            capabilityKeys,
            reasonCode: input.reasonCode,
            notePresent: Boolean(input.note),
          },
        },
      );
      return this.roleView(role, 0) as unknown as Prisma.InputJsonValue;
    });
  }

  async updateRole(
    principal: SessionPrincipal,
    id: string,
    input: {
      displayName: string;
      description: string;
      expectedVersion: number;
      reasonCode: string;
      note?: string;
    },
    key: string,
    correlationId: string,
  ) {
    this.validateReason(input.reasonCode, input.note);
    if (
      input.displayName.trim().length < 2 ||
      input.displayName.trim().length > 160 ||
      input.description.trim().length < 3 ||
      input.description.trim().length > 500 ||
      !Number.isInteger(input.expectedVersion)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.execute(principal, `role:update:${id}`, key, input, async (tx) => {
      const before = await tx.roleDefinition.findUnique({ where: { id }, include: roleInclude });
      if (!before) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const changed = await tx.roleDefinition.updateMany({
        where: { id, version: input.expectedVersion },
        data: {
          displayName: input.displayName.trim(),
          description: input.description.trim(),
          version: { increment: 1 },
        },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      const after = await tx.roleDefinition.findUniqueOrThrow({
        where: { id },
        include: roleInclude,
      });
      const affectedUserIds = await this.affectedUserIds(tx, after);
      if (affectedUserIds.length)
        await tx.userSession.updateMany({
          where: { userId: { in: affectedUserIds }, revokedAt: null },
          data: { revokedAt: new Date(), revocationReason: 'ROLE_METADATA_CHANGED' },
        });
      await this.audit(
        tx,
        principal,
        correlationId,
        'security.access_role_updated',
        'RoleDefinition',
        id,
        {
          before: { displayName: before.displayName, version: before.version },
          after: {
            displayName: after.displayName,
            version: after.version,
            affectedUserCount: affectedUserIds.length,
            reasonCode: input.reasonCode,
            notePresent: Boolean(input.note),
          },
        },
      );
      return this.roleView(after, affectedUserIds.length) as unknown as Prisma.InputJsonValue;
    });
  }

  async replaceRoleCapabilities(
    principal: SessionPrincipal,
    id: string,
    input: {
      capabilityKeys: string[];
      expectedVersion: number;
      reasonCode: string;
      note?: string;
    },
    key: string,
    correlationId: string,
  ) {
    this.validateReason(input.reasonCode, input.note);
    if (!Number.isInteger(input.expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.execute(principal, `role:capabilities:${id}`, key, input, async (tx) => {
      const before = await tx.roleDefinition.findUnique({ where: { id }, include: roleInclude });
      if (!before) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const capabilityKeys = [...new Set(input.capabilityKeys)].sort();
      const definitions = await tx.capabilityDefinition.findMany({
        where: { key: { in: capabilityKeys }, active: true },
      });
      if (definitions.length !== capabilityKeys.length)
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
      if (definitions.some(({ systemOnly }) => systemOnly) && before.systemRole !== 'SUPER_OWNER')
        throw new ApiProblem('PROTECTED_CAPABILITY', HttpStatus.CONFLICT);
      if (before.scope === 'BRANCH' && definitions.some(({ globalOnly }) => globalOnly))
        throw new ApiProblem('PROTECTED_CAPABILITY', HttpStatus.CONFLICT);
      if (
        before.systemRole === 'SUPER_OWNER' &&
        CORE_SUPER_OWNER_CAPABILITIES.some((capability) => !capabilityKeys.includes(capability))
      )
        throw new ApiProblem('PROTECTED_ROLE_CHANGE', HttpStatus.CONFLICT);
      const changed = await tx.roleDefinition.updateMany({
        where: { id, version: input.expectedVersion },
        data: { version: { increment: 1 } },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await tx.roleCapability.deleteMany({ where: { roleId: id } });
      if (capabilityKeys.length)
        await tx.roleCapability.createMany({
          data: capabilityKeys.map((capabilityKey) => ({ roleId: id, capabilityKey })),
        });
      const affectedUserIds = await this.affectedUserIds(tx, before);
      if (affectedUserIds.length)
        await tx.userSession.updateMany({
          where: { userId: { in: affectedUserIds }, revokedAt: null },
          data: { revokedAt: new Date(), revocationReason: 'ROLE_PERMISSION_CHANGED' },
        });
      const after = await tx.roleDefinition.findUniqueOrThrow({
        where: { id },
        include: roleInclude,
      });
      await this.audit(
        tx,
        principal,
        correlationId,
        'security.role_capabilities_changed',
        'RoleDefinition',
        id,
        {
          before: {
            capabilityKeys: before.capabilities.map(({ capabilityKey }) => capabilityKey),
            version: before.version,
          },
          after: {
            capabilityKeys,
            version: after.version,
            affectedUserCount: affectedUserIds.length,
            reasonCode: input.reasonCode,
            notePresent: Boolean(input.note),
          },
        },
      );
      return this.roleView(after, affectedUserIds.length) as unknown as Prisma.InputJsonValue;
    });
  }

  async deactivateRole(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number; reasonCode: string; note?: string },
    key: string,
    correlationId: string,
  ) {
    this.validateReason(input.reasonCode, input.note);
    return this.execute(principal, `role:deactivate:${id}`, key, input, async (tx) => {
      const role = await tx.roleDefinition.findUnique({ where: { id }, include: roleInclude });
      if (!role) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      if (role.system) throw new ApiProblem('PROTECTED_ROLE_CHANGE', HttpStatus.CONFLICT);
      const affectedUserIds = await this.affectedUserIds(tx, role);
      if (affectedUserIds.length) throw new ApiProblem('ROLE_IN_USE', HttpStatus.CONFLICT);
      const changed = await tx.roleDefinition.updateMany({
        where: { id, version: input.expectedVersion, active: true },
        data: { active: false, version: { increment: 1 } },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await this.audit(
        tx,
        principal,
        correlationId,
        'security.access_role_deactivated',
        'RoleDefinition',
        id,
        {
          before: { active: true, version: role.version },
          after: {
            active: false,
            version: role.version + 1,
            reasonCode: input.reasonCode,
            notePresent: Boolean(input.note),
          },
        },
      );
      return { id, active: false, version: role.version + 1 };
    });
  }

  async getUserAccess(principal: SessionPrincipal, userId: string) {
    this.authorize(principal);
    const now = new Date();
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          where: {
            activeFrom: { lte: now },
            OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
          },
          include: { branch: { select: { id: true, code: true, name: true } } },
        },
        accessRoleAssignments: {
          where: {
            activeFrom: { lte: now },
            OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
          },
          include: {
            role: { include: roleInclude },
            branch: { select: { id: true, code: true, name: true } },
          },
        },
        capabilityOverrides: {
          where: { revokedAt: null },
          include: {
            capability: true,
            branch: { select: { id: true, code: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const access = await this.policy.resolveAccess(user.id, user.roles, now);
    const definitions = await this.db.roleDefinition.findMany({
      where: { systemRole: { in: [...new Set(user.roles.map(({ role }) => role))] } },
      select: { id: true, systemRole: true, code: true, displayName: true, scope: true },
    });
    const byRole = new Map(
      definitions.flatMap((item) => (item.systemRole ? [[item.systemRole, item] as const] : [])),
    );
    return {
      user: {
        id: user.id,
        displayName: user.displayName,
        status: user.status,
        version: user.version,
      },
      roleAssignments: [
        ...user.roles.map((item) => ({
          id: item.id,
          roleId: byRole.get(item.role)?.id ?? null,
          roleCode: item.role,
          displayName: byRole.get(item.role)?.displayName ?? item.role,
          scope: byRole.get(item.role)?.scope ?? (item.branchId ? 'BRANCH' : 'GLOBAL'),
          branchId: item.branchId,
          branch: item.branch,
          source: item.sourceAssignmentId ? 'ASSIGNMENT' : 'DIRECT',
        })),
        ...user.accessRoleAssignments.map((item) => ({
          id: item.id,
          roleId: item.roleId,
          roleCode: item.role.code,
          displayName: item.role.displayName,
          scope: item.role.scope,
          branchId: item.branchId,
          branch: item.branch,
          source: 'DIRECT',
        })),
      ],
      overrides: user.capabilityOverrides.map((item) => ({
        id: item.id,
        capabilityKey: item.capabilityKey,
        capabilityLabel: item.capability.label,
        effect: item.effect,
        branchId: item.branchId,
        branch: item.branch,
        reasonCode: item.reasonCode,
        version: item.version,
        createdAt: item.createdAt.toISOString(),
      })),
      effective: {
        capabilities: access.capabilities,
        branches: access.branchIds,
        grants: access.grants,
        denials: access.denials,
      },
    };
  }

  async replaceUserRoles(
    principal: SessionPrincipal,
    userId: string,
    input: {
      roles: Array<{ roleId: string; branchId?: string | null }>;
      expectedVersion: number;
      reasonCode: string;
      note?: string;
    },
    key: string,
    correlationId: string,
  ) {
    this.validateReason(input.reasonCode, input.note);
    if (userId === principal.userId)
      throw new ApiProblem('SELF_ACCESS_CHANGE_FORBIDDEN', HttpStatus.CONFLICT);
    if (!Number.isInteger(input.expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.execute(principal, `user:roles:${userId}`, key, input, async (tx) => {
      const target = await tx.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            where: {
              sourceAssignmentId: null,
              activeUntil: null,
              role: { in: [...SYSTEM_DIRECT_ROLES] },
            },
          },
          accessRoleAssignments: { where: { activeUntil: null } },
        },
      });
      if (!target) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const roleIds = [...new Set(input.roles.map(({ roleId }) => roleId))];
      const assignmentKeys = input.roles.map(
        ({ roleId, branchId }) => `${roleId}:${branchId ?? 'GLOBAL'}`,
      );
      if (new Set(assignmentKeys).size !== assignmentKeys.length)
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
      const definitions = await tx.roleDefinition.findMany({
        where: { id: { in: roleIds }, active: true },
      });
      if (definitions.length !== roleIds.length)
        throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const byId = new Map(definitions.map((item) => [item.id, item]));
      for (const assignment of input.roles) {
        const role = byId.get(assignment.roleId)!;
        if (
          (role.systemRole && !SYSTEM_DIRECT_ROLES.has(role.systemRole)) ||
          (role.scope === 'BRANCH' ? !assignment.branchId : Boolean(assignment.branchId))
        )
          throw new ApiProblem('PROTECTED_ROLE_CHANGE', HttpStatus.CONFLICT);
      }
      const branchIds = input.roles.flatMap(({ branchId }) => (branchId ? [branchId] : []));
      if (
        branchIds.length &&
        (await tx.branch.count({
          where: { id: { in: [...new Set(branchIds)] }, active: true },
        })) !== new Set(branchIds).size
      )
        throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const currentlySuperOwner = target.roles.some(({ role }) => role === 'SUPER_OWNER');
      const remainsSuperOwner = input.roles.some(
        ({ roleId }) => byId.get(roleId)?.systemRole === 'SUPER_OWNER',
      );
      if (currentlySuperOwner && !remainsSuperOwner) {
        const others = await tx.userRole.findMany({
          where: {
            userId: { not: userId },
            role: 'SUPER_OWNER',
            activeFrom: { lte: new Date() },
            OR: [{ activeUntil: null }, { activeUntil: { gt: new Date() } }],
            user: { status: 'ACTIVE' },
          },
          distinct: ['userId'],
          select: { userId: true },
        });
        if (!others.length) throw new ApiProblem('LAST_SUPER_OWNER', HttpStatus.CONFLICT);
      }
      const changed = await tx.user.updateMany({
        where: { id: userId, version: input.expectedVersion },
        data: { version: { increment: 1 } },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      const now = new Date();
      await Promise.all([
        tx.userRole.updateMany({
          where: {
            userId,
            sourceAssignmentId: null,
            activeUntil: null,
            role: { in: [...SYSTEM_DIRECT_ROLES] },
          },
          data: { activeUntil: now },
        }),
        tx.accessRoleAssignment.updateMany({
          where: { userId, activeUntil: null },
          data: { activeUntil: now },
        }),
      ]);
      for (const assignment of input.roles) {
        const role = byId.get(assignment.roleId)!;
        if (role.systemRole)
          await tx.userRole.create({
            data: {
              userId,
              role: role.systemRole,
              branchId: assignment.branchId ?? null,
              activeFrom: now,
            },
          });
        else
          await tx.accessRoleAssignment.create({
            data: {
              userId,
              roleId: role.id,
              branchId: assignment.branchId ?? null,
              activeFrom: now,
            },
          });
      }
      await tx.userSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now, revocationReason: 'ROLE_CHANGED' },
      });
      await this.audit(
        tx,
        principal,
        correlationId,
        'security.user_roles_changed',
        'User',
        userId,
        {
          targetUserId: userId,
          before: {
            roleCount: target.roles.length + target.accessRoleAssignments.length,
            version: target.version,
          },
          after: {
            roles: input.roles.map(({ roleId, branchId }) => ({
              roleCode: byId.get(roleId)?.code,
              branchId: branchId ?? null,
            })),
            version: target.version + 1,
            reasonCode: input.reasonCode,
            notePresent: Boolean(input.note),
          },
        },
      );
      return { userId, version: target.version + 1, sessionRevoked: true };
    });
  }

  async createOverride(
    principal: SessionPrincipal,
    userId: string,
    input: {
      capabilityKey: string;
      branchId?: string | null;
      effect: 'GRANT' | 'DENY';
      reasonCode: string;
      note?: string;
    },
    key: string,
    correlationId: string,
  ) {
    this.validateReason(input.reasonCode, input.note);
    if (userId === principal.userId)
      throw new ApiProblem('SELF_ACCESS_CHANGE_FORBIDDEN', HttpStatus.CONFLICT);
    return this.execute(
      principal,
      `user:override:${userId}:${input.capabilityKey}:${input.branchId ?? 'GLOBAL'}`,
      key,
      input,
      async (tx) => {
        const [target, capability, branch, existing] = await Promise.all([
          tx.user.findUnique({
            where: { id: userId },
            include: {
              roles: {
                where: {
                  role: 'SUPER_OWNER',
                  activeFrom: { lte: new Date() },
                  OR: [{ activeUntil: null }, { activeUntil: { gt: new Date() } }],
                },
              },
            },
          }),
          tx.capabilityDefinition.findUnique({ where: { key: input.capabilityKey } }),
          input.branchId
            ? tx.branch.findFirst({ where: { id: input.branchId, active: true } })
            : Promise.resolve(null),
          tx.userCapabilityOverride.findFirst({
            where: {
              userId,
              capabilityKey: input.capabilityKey,
              branchId: input.branchId ?? null,
              revokedAt: null,
            },
          }),
        ]);
        if (!target || (input.branchId && !branch))
          throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
        if (!capability?.active) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
        if (
          capability.systemOnly ||
          (capability.globalOnly && Boolean(input.branchId)) ||
          (target.roles.length > 0 &&
            CORE_SUPER_OWNER_CAPABILITIES.includes(
              input.capabilityKey as (typeof CORE_SUPER_OWNER_CAPABILITIES)[number],
            ))
        )
          throw new ApiProblem('PROTECTED_CAPABILITY', HttpStatus.CONFLICT);
        if (existing) throw new ApiProblem('PERMISSION_OVERRIDE_EXISTS', HttpStatus.CONFLICT);
        const override = await tx.userCapabilityOverride.create({
          data: {
            userId,
            capabilityKey: input.capabilityKey,
            branchId: input.branchId ?? null,
            effect: input.effect,
            reasonCode: input.reasonCode,
            note: input.note?.trim() || null,
            createdById: principal.userId,
          },
        });
        await tx.userSession.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date(), revocationReason: 'PERMISSION_OVERRIDE_CHANGED' },
        });
        await this.audit(
          tx,
          principal,
          correlationId,
          input.effect === 'GRANT'
            ? 'security.user_permission_override_granted'
            : 'security.user_permission_override_denied',
          'UserCapabilityOverride',
          override.id,
          {
            targetUserId: userId,
            branchId: input.branchId,
            after: {
              capabilityKey: input.capabilityKey,
              effect: input.effect,
              branchId: input.branchId ?? null,
              reasonCode: input.reasonCode,
              notePresent: Boolean(input.note),
            },
          },
        );
        return {
          id: override.id,
          userId,
          capabilityKey: override.capabilityKey,
          branchId: override.branchId,
          effect: override.effect,
          reasonCode: override.reasonCode,
          version: override.version,
          createdAt: override.createdAt.toISOString(),
        };
      },
    );
  }

  async revokeOverride(
    principal: SessionPrincipal,
    userId: string,
    overrideId: string,
    input: { expectedVersion: number; reasonCode: string; note?: string },
    key: string,
    correlationId: string,
  ) {
    this.validateReason(input.reasonCode, input.note);
    if (userId === principal.userId)
      throw new ApiProblem('SELF_ACCESS_CHANGE_FORBIDDEN', HttpStatus.CONFLICT);
    return this.execute(principal, `user:override:revoke:${overrideId}`, key, input, async (tx) => {
      const before = await tx.userCapabilityOverride.findFirst({
        where: { id: overrideId, userId, revokedAt: null },
      });
      if (!before) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const revokedAt = new Date();
      const changed = await tx.userCapabilityOverride.updateMany({
        where: { id: overrideId, userId, version: input.expectedVersion, revokedAt: null },
        data: {
          revokedAt,
          revokedById: principal.userId,
          revokeReason: input.reasonCode,
          version: { increment: 1 },
        },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await tx.userSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt, revocationReason: 'PERMISSION_OVERRIDE_REVOKED' },
      });
      await this.audit(
        tx,
        principal,
        correlationId,
        'security.user_permission_override_revoked',
        'UserCapabilityOverride',
        overrideId,
        {
          targetUserId: userId,
          branchId: before.branchId,
          before: {
            capabilityKey: before.capabilityKey,
            effect: before.effect,
            version: before.version,
          },
          after: {
            revoked: true,
            version: before.version + 1,
            reasonCode: input.reasonCode,
            notePresent: Boolean(input.note),
          },
        },
      );
      return { id: overrideId, revoked: true, version: before.version + 1 };
    });
  }
}
