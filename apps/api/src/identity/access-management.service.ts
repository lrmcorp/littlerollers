import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { ApiProblem, newId } from './security';
import { ROLE_CAPABILITIES, type ApplicationRole } from './role-capabilities';

@Injectable()
export class AccessManagementService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly idempotency: IdempotencyService,
  ) {}

  private authorize(principal: SessionPrincipal) {
    this.policy.requireScopedCapability(principal, 'role-permission:manage');
  }

  async listCapabilities(
    principal: SessionPrincipal,
    _query: { q?: string; category?: string; sensitive?: boolean; active?: boolean } = {},
  ) {
    this.authorize(principal);
    const allCapabilities = new Set<string>();
    for (const caps of Object.values(ROLE_CAPABILITIES)) {
      for (const cap of caps) allCapabilities.add(cap);
    }
    const items = Array.from(allCapabilities).sort().map((key) => ({
      key,
      name: key.replace(/[:-]/g, ' ').toUpperCase(),
      category: key.split(':')[0] || 'GENERAL',
      isSensitive: key.includes('manage') || key.includes('admin'),
      active: true,
    }));
    return { items, summary: { total: items.length, active: items.length, inactive: 0 } };
  }

  async listRoles(
    principal: SessionPrincipal,
    _query: { q?: string; scope?: 'GLOBAL' | 'BRANCH'; active?: boolean } = {},
  ) {
    this.authorize(principal);
    const roles: ApplicationRole[] = ['SUPERADMIN', 'ADMIN', 'COACH', 'MEMBER'];
    const items = roles.map((code) => ({
      id: code,
      code,
      displayName: code,
      description: `Default system role for ${code}`,
      scope: code === 'SUPERADMIN' ? 'GLOBAL' : 'BRANCH',
      active: true,
      version: 1,
      capabilities: (ROLE_CAPABILITIES[code] || []).map((key) => ({
        capabilityKey: key,
        capability: { key, name: key, category: key.split(':')[0] || 'GENERAL' },
      })),
    }));
    return { items, summary: { total: items.length, active: items.length, inactive: 0 } };
  }

  async createRole(
    principal: SessionPrincipal,
    body: {
      code: string;
      displayName: string;
      description: string;
      scope: 'GLOBAL' | 'BRANCH';
      capabilityKeys: string[];
      reasonCode: string;
      note?: string;
    },
    key: string,
    _correlationId: string,
  ) {
    this.authorize(principal);
    return this.idempotency.execute(
      {
        scope: 'access:create-role',
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async () => {
        const item = {
          id: body.code.toUpperCase(),
          code: body.code.toUpperCase(),
          displayName: body.displayName,
          description: body.description,
          scope: body.scope,
          active: true,
          version: 1,
        };
        return { status: HttpStatus.OK, body: item as unknown as Prisma.InputJsonValue };
      },
    );
  }

  async getRole(principal: SessionPrincipal, id: string) {
    this.authorize(principal);
    const code = id.toUpperCase() as ApplicationRole;
    return {
      id: code,
      code,
      displayName: code,
      description: `System role for ${code}`,
      scope: code === 'SUPERADMIN' ? 'GLOBAL' : 'BRANCH',
      active: true,
      version: 1,
      capabilities: (ROLE_CAPABILITIES[code] || []).map((key) => ({
        capabilityKey: key,
        capability: { key, name: key, category: key.split(':')[0] || 'GENERAL' },
      })),
    };
  }

  async updateRole(
    principal: SessionPrincipal,
    id: string,
    body: {
      displayName: string;
      description: string;
      expectedVersion: number;
      reasonCode: string;
      note?: string;
    },
    key: string,
    _correlationId: string,
  ) {
    this.authorize(principal);
    return this.idempotency.execute(
      {
        scope: `access:update-role:${id}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async () => {
        const role = await this.getRole(principal, id);
        return {
          status: HttpStatus.OK,
          body: { ...role, displayName: body.displayName, description: body.description },
        };
      },
    );
  }

  async replaceRoleCapabilities(
    principal: SessionPrincipal,
    id: string,
    body: { capabilityKeys: string[]; expectedVersion: number; reasonCode: string; note?: string },
    key: string,
    _correlationId: string,
  ) {
    this.authorize(principal);
    return this.idempotency.execute(
      {
        scope: `access:replace-role-caps:${id}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async () => {
        const role = await this.getRole(principal, id);
        return { status: HttpStatus.OK, body: role as unknown as Prisma.InputJsonValue };
      },
    );
  }

  async deprecateRole(
    principal: SessionPrincipal,
    id: string,
    body: { expectedVersion: number; reasonCode: string; note?: string },
    key: string,
    _correlationId: string,
  ) {
    this.authorize(principal);
    return this.idempotency.execute(
      {
        scope: `access:deprecate-role:${id}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async () => {
        const role = await this.getRole(principal, id);
        return { status: HttpStatus.OK, body: { ...role, active: false } };
      },
    );
  }

  async reactivateRole(
    principal: SessionPrincipal,
    id: string,
    body: { expectedVersion: number; reasonCode: string; note?: string },
    key: string,
    _correlationId: string,
  ) {
    this.authorize(principal);
    return this.idempotency.execute(
      {
        scope: `access:reactivate-role:${id}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async () => {
        const role = await this.getRole(principal, id);
        return { status: HttpStatus.OK, body: { ...role, active: true } };
      },
    );
  }

  async deactivateRole(
    principal: SessionPrincipal,
    id: string,
    body: { expectedVersion: number; reasonCode: string; note?: string },
    key: string,
    _correlationId: string,
  ) {
    this.authorize(principal);
    return this.idempotency.execute(
      {
        scope: `access:deactivate-role:${id}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async () => {
        const role = await this.getRole(principal, id);
        return { status: HttpStatus.OK, body: { ...role, active: false } };
      },
    );
  }

  async listAssignments(
    principal: SessionPrincipal,
    query: { userId?: string; roleId?: string; branchId?: string; active?: boolean } = {},
  ) {
    this.authorize(principal);
    const users = await this.db.user.findMany({
      where: {
        ...(query.userId ? { id: query.userId } : {}),
        ...(query.roleId ? { role: query.roleId as any } : {}),
        status: query.active === false ? 'INACTIVE' : 'ACTIVE',
      },
      take: 50,
    });

    const items = users.map((u) => ({
      id: u.id,
      userId: u.id,
      roleId: u.role,
      branchId: u.preferredBranchId ?? null,
      status: u.status === 'ACTIVE' ? 'ACTIVE' : 'REVOKED',
      user: { id: u.id, displayName: u.displayName, email: u.email },
      role: { id: u.role, code: u.role, displayName: u.role },
      createdAt: u.createdAt,
    }));

    return { items, summary: { total: items.length, active: items.length, revoked: 0 } };
  }

  async assignRole(
    principal: SessionPrincipal,
    body: {
      userId: string;
      roleId: string;
      branchId?: string | null;
      reasonCode: string;
      note?: string;
    },
    key: string,
    _correlationId: string,
  ) {
    this.authorize(principal);
    return this.idempotency.execute(
      {
        scope: `access:assign-role:${body.userId}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async (tx) => {
        const user = await tx.user.findUnique({ where: { id: body.userId } });
        if (!user) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

        const updated = await tx.user.update({
          where: { id: body.userId },
          data: {
            role: body.roleId.toUpperCase() as any,
            preferredBranchId: body.branchId ?? user.preferredBranchId,
          },
        });

        const item = {
          id: updated.id,
          userId: updated.id,
          roleId: updated.role,
          branchId: updated.preferredBranchId,
          status: 'ACTIVE',
        };
        return { status: HttpStatus.OK, body: item as unknown as Prisma.InputJsonValue };
      },
    );
  }

  async revokeAssignment(
    principal: SessionPrincipal,
    id: string,
    body: { expectedVersion?: number; reasonCode: string; note?: string },
    key: string,
    _correlationId: string,
  ) {
    this.authorize(principal);
    return this.idempotency.execute(
      {
        scope: `access:revoke-assignment:${id}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async (tx) => {
        const updated = await tx.user.update({
          where: { id },
          data: { role: 'MEMBER' },
        });
        return {
          status: HttpStatus.OK,
          body: { id: updated.id, status: 'REVOKED' } as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async getUserAccess(principal: SessionPrincipal, userId: string) {
    this.authorize(principal);
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const role = user.role as ApplicationRole;
    const capabilities = ROLE_CAPABILITIES[role] || [];
    return {
      userId: user.id,
      roles: [
        {
          id: user.id,
          roleId: role,
          role: { code: role, displayName: role, scope: role === 'SUPERADMIN' ? 'GLOBAL' : 'BRANCH' },
          branchId: user.preferredBranchId,
          status: 'ACTIVE',
        },
      ],
      effectiveCapabilities: capabilities,
      overrides: [],
    };
  }

  async replaceUserRoles(
    principal: SessionPrincipal,
    userId: string,
    body: {
      roles: Array<{ roleId: string; branchId?: string | null }>;
      expectedVersion?: number;
      reasonCode: string;
      note?: string;
    },
    key: string,
    _correlationId: string,
  ) {
    this.authorize(principal);
    return this.idempotency.execute(
      {
        scope: `access:replace-user-roles:${userId}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

        const primaryRole = (body.roles?.[0]?.roleId?.toUpperCase() as any) || 'MEMBER';
        const primaryBranch = body.roles?.[0]?.branchId ?? user.preferredBranchId;

        const updated = await tx.user.update({
          where: { id: userId },
          data: {
            role: primaryRole,
            preferredBranchId: primaryBranch,
          },
        });

        return {
          status: HttpStatus.OK,
          body: {
            userId: updated.id,
            role: updated.role,
            status: 'UPDATED',
          } as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  async listOverrides(
    principal: SessionPrincipal,
    _query: { userId?: string; capabilityKey?: string; branchId?: string; active?: boolean } = {},
  ) {
    this.authorize(principal);
    return { items: [], summary: { total: 0, active: 0, revoked: 0 } };
  }

  async createOverride(
    principal: SessionPrincipal,
    userId: string,
    body: {
      capabilityKey: string;
      effect: 'GRANT' | 'DENY';
      branchId?: string | null;
      reasonCode: string;
      note?: string;
    },
    key: string,
    _correlationId: string,
  ) {
    this.authorize(principal);
    return this.idempotency.execute(
      {
        scope: `access:create-override:${userId}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async () => {
        const item = {
          id: newId(),
          userId,
          ...body,
          status: 'ACTIVE',
          version: 1,
        };
        return { status: HttpStatus.OK, body: item as unknown as Prisma.InputJsonValue };
      },
    );
  }

  async revokeOverride(
    principal: SessionPrincipal,
    userId: string,
    overrideId: string,
    body: { expectedVersion?: number; reasonCode: string; note?: string },
    key: string,
    _correlationId: string,
  ) {
    this.authorize(principal);
    return this.idempotency.execute(
      {
        scope: `access:revoke-override:${overrideId}`,
        key,
        payload: body,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async () => {
        return {
          status: HttpStatus.OK,
          body: { id: overrideId, userId, status: 'REVOKED' } as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }
}
