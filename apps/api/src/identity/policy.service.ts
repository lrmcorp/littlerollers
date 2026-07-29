import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import type { ApplicationRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from './security';

export const ROLE_CAPABILITIES: Record<ApplicationRole, readonly string[]> = {
  CUSTOMER: [
    'customer:self',
    'package:read',
    'voucher:redeem',
    'ledger:read',
    'class-slot:read',
    'booking:self:read',
    'booking:self:create',
    'reschedule:self:read',
    'reschedule:self:request',
  ],
  INSTRUCTOR: [
    'class:assigned:read',
    'attendance:self',
    'availability:self:read',
    'availability:self:create',
    'class-slot:read',
  ],
  ADMIN: [
    'branch:operate',
    'user:read',
    'payment:review',
    'ledger:read',
    'ledger:adjust:read',
    'ledger:adjust:request',
    'class-slot:read',
    'class-slot:manage',
    'booking:read',
    'booking:create:assisted',
    'reschedule:read',
    'reschedule:decide',
    'attendance:read',
    'attendance:manage',
  ],
  MANAGER: [
    'branch:manage',
    'user:read',
    'ledger:read',
    'ledger:adjust:read',
    'ledger:adjust:decide',
    'class-slot:read',
    'class-slot:manage',
    'booking:read',
    'booking:create:assisted',
    'attendance:read',
    'attendance:manage',
  ],
  OWNER: [
    'branch:own',
    'dashboard:read',
    'user:read',
    'audit:read',
    'finance:read',
    'voucher:read',
    'package:read',
    'package-promotion:read',
    'ledger:read',
    'class-slot:read',
    'booking:read',
    'reschedule:read',
    'attendance:read',
  ],
  SUPER_OWNER: [
    'role-permission:manage',
    'audit:read',
    'user:read',
    'user:admin',
    'branch:all',
    'session:revoke',
    'assignment:read',
    'assignment:manage',
    'master:read',
    'master:manage',
    'voucher:read',
    'voucher:manage',
    'package-promotion:read',
    'package-promotion:manage',
    'payment-account:read',
    'payment-account:manage',
    'package:read',
    'payment:review',
    'payment:decide',
    'finance:read',
    'voucher:read',
    'finance:manage',
    'finance:reconcile',
    'finance:export',
    // Compatibility aliases retained until every external consumer migrates.
    'purchase:review',
    'purchase:decide',
    'ledger:read',
    'ledger:adjust:read',
    'ledger:adjust:decide',
    'class-slot:read',
    'class-slot:manage',
    'operations:read',
    'operations:recover',
    'booking:read',
    'booking:create:assisted',
    'attendance:read',
    'attendance:manage',
    'reschedule:read',
    'reschedule:decide',
    'identity-verification:read',
    'identity-verification:decide',
    'identity-verification:delete',
  ],
  FINANCE: [
    'finance:read',
    'finance:manage',
    'finance:reconcile',
    'finance:export',
    'payment:review',
    'payment:decide',
    'package:read',
    'voucher:read',
    'ledger:read',
    'ledger:adjust:read',
  ],
  OPS: ['operations:read', 'operations:recover'],
};

export interface EffectiveRole {
  role: ApplicationRole;
  branchId: string | null;
}

export interface CapabilityGrant {
  capability: string;
  branchId: string | null;
  source: 'SYSTEM_ROLE' | 'CUSTOM_ROLE' | 'USER_OVERRIDE';
  sourceId: string;
}

export interface EffectiveAccess {
  capabilities: string[];
  branchIds: string[];
  roleCodes: string[];
  grants: CapabilityGrant[];
  denials: Array<{ capability: string; branchId: string | null; sourceId: string }>;
}

type PrincipalAccess = {
  capabilities: string[];
  branchIds: string[];
  grants?: CapabilityGrant[];
  denials?: Array<{ capability: string; branchId: string | null; sourceId: string }>;
  capabilityGrants?: CapabilityGrant[];
  capabilityDenials?: Array<{ capability: string; branchId: string | null; sourceId: string }>;
};

@Injectable()
export class PolicyService {
  constructor(@Optional() private readonly db?: PrismaService) {}

  capabilities(roles: readonly EffectiveRole[]): string[] {
    return [...new Set(roles.flatMap(({ role }) => ROLE_CAPABILITIES[role]))].sort();
  }

  private staticAccess(roles: readonly EffectiveRole[]): EffectiveAccess {
    const grants = roles.flatMap(({ role, branchId }) =>
      ROLE_CAPABILITIES[role].map((capability) => ({
        capability,
        branchId,
        source: 'SYSTEM_ROLE' as const,
        sourceId: role,
      })),
    );
    return {
      capabilities: [...new Set(grants.map(({ capability }) => capability))].sort(),
      branchIds: this.branches(roles),
      roleCodes: [...new Set(roles.map(({ role }) => role))].sort(),
      grants,
      denials: [],
    };
  }

  async resolveAccess(
    userId: string,
    roles: readonly EffectiveRole[],
    at = new Date(),
  ): Promise<EffectiveAccess> {
    const fallback = this.staticAccess(roles);
    const source = process.env.RBAC_POLICY_SOURCE?.trim() || 'static';
    if (source === 'static' || !this.db) return fallback;
    try {
      const [definitions, customAssignments, overrides] = await Promise.all([
        this.db.roleDefinition.findMany({
          where: {
            active: true,
            systemRole: { in: [...new Set(roles.map(({ role }) => role))] },
          },
          include: {
            capabilities: {
              where: { capability: { active: true } },
              select: { capabilityKey: true, capability: { select: { globalOnly: true } } },
            },
          },
        }),
        this.db.accessRoleAssignment.findMany({
          where: {
            userId,
            activeFrom: { lte: at },
            OR: [{ activeUntil: null }, { activeUntil: { gt: at } }],
            role: { active: true, system: false },
          },
          include: {
            role: {
              include: {
                capabilities: {
                  where: { capability: { active: true } },
                  select: { capabilityKey: true, capability: { select: { globalOnly: true } } },
                },
              },
            },
          },
        }),
        this.db.userCapabilityOverride.findMany({
          where: {
            userId,
            revokedAt: null,
            capability: { active: true },
          },
          select: {
            id: true,
            capabilityKey: true,
            branchId: true,
            effect: true,
            capability: { select: { globalOnly: true } },
          },
        }),
      ]);
      const bySystemRole = new Map(
        definitions.flatMap((definition) =>
          definition.systemRole ? [[definition.systemRole, definition] as const] : [],
        ),
      );
      const grants: CapabilityGrant[] = roles.flatMap(({ role, branchId }) => {
        const definition = bySystemRole.get(role);
        if (!definition) return [];
        return definition.capabilities.flatMap(({ capabilityKey, capability }) =>
          capability.globalOnly && branchId
            ? []
            : [
                {
                  capability: capabilityKey,
                  branchId,
                  source: 'SYSTEM_ROLE' as const,
                  sourceId: definition.id,
                },
              ],
        );
      });
      for (const assignment of customAssignments)
        for (const { capabilityKey, capability } of assignment.role.capabilities) {
          if (capability.globalOnly && assignment.branchId) continue;
          grants.push({
            capability: capabilityKey,
            branchId: assignment.branchId,
            source: 'CUSTOM_ROLE',
            sourceId: assignment.roleId,
          });
        }
      const denials = overrides
        .filter(({ capability, branchId }) => !capability.globalOnly || branchId === null)
        .filter(({ effect }) => effect === 'DENY')
        .map(({ id, capabilityKey, branchId }) => ({
          capability: capabilityKey,
          branchId,
          sourceId: id,
        }));
      for (const override of overrides)
        if (
          override.effect === 'GRANT' &&
          (!override.capability.globalOnly || override.branchId === null)
        )
          grants.push({
            capability: override.capabilityKey,
            branchId: override.branchId,
            source: 'USER_OVERRIDE',
            sourceId: override.id,
          });
      const globallyDenied = new Set(
        denials.filter(({ branchId }) => !branchId).map(({ capability }) => capability),
      );
      const access: EffectiveAccess = {
        capabilities: [
          ...new Set(
            grants
              .map(({ capability }) => capability)
              .filter((capability) => !globallyDenied.has(capability)),
          ),
        ].sort(),
        branchIds: [
          ...new Set([
            ...roles.flatMap(({ branchId }) => (branchId ? [branchId] : [])),
            ...customAssignments.flatMap(({ branchId }) => (branchId ? [branchId] : [])),
            ...overrides.flatMap(({ branchId }) => (branchId ? [branchId] : [])),
          ]),
        ].sort(),
        roleCodes: [
          ...new Set([
            ...roles.map(({ role }) => role),
            ...customAssignments.map(({ role }) => role.code),
          ]),
        ].sort(),
        grants,
        denials,
      };
      if (source === 'shadow') {
        if (
          JSON.stringify(access.capabilities) !== JSON.stringify(fallback.capabilities) ||
          JSON.stringify(access.branchIds) !== JSON.stringify(fallback.branchIds)
        )
          console.warn('rbac_shadow_mismatch', { userId });
        return fallback;
      }
      return access;
    } catch (error) {
      if (source === 'shadow') {
        console.warn('rbac_shadow_unavailable', { userId });
        return fallback;
      }
      throw error;
    }
  }

  roleCatalog() {
    const assignable = new Set<ApplicationRole>(['ADMIN', 'MANAGER', 'FINANCE', 'OPS']);
    const branchScoped = new Set<ApplicationRole>(['INSTRUCTOR', 'ADMIN', 'MANAGER', 'OWNER']);
    return (Object.keys(ROLE_CAPABILITIES) as ApplicationRole[]).map((role) => ({
      role,
      capabilities: [...ROLE_CAPABILITIES[role]],
      assignable: assignable.has(role),
      readOnly: !ROLE_CAPABILITIES[role].some((capability) =>
        /:(manage|create|request|decide|review|revoke|recover|export)$/.test(capability),
      ),
      scope: branchScoped.has(role) ? ('BRANCH' as const) : ('GLOBAL' as const),
    }));
  }

  async databaseRoleCatalog() {
    if (!this.db || (process.env.RBAC_POLICY_SOURCE?.trim() || 'static') === 'static')
      return this.roleCatalog();
    const assignable = new Set<ApplicationRole>(['ADMIN', 'MANAGER', 'FINANCE', 'OPS']);
    const roles = await this.db.roleDefinition.findMany({
      where: { active: true, systemRole: { not: null } },
      include: { capabilities: { orderBy: { capabilityKey: 'asc' } } },
      orderBy: { code: 'asc' },
    });
    return roles.flatMap((role) =>
      role.systemRole
        ? [
            {
              role: role.systemRole,
              capabilities: role.capabilities.map(({ capabilityKey }) => capabilityKey),
              assignable: assignable.has(role.systemRole),
              readOnly: !role.capabilities.some(({ capabilityKey }) =>
                /:(manage|create|request|decide|review|revoke|recover|export)$/.test(capabilityKey),
              ),
              scope: role.scope,
            },
          ]
        : [],
    );
  }

  branches(roles: readonly EffectiveRole[]): string[] {
    return [...new Set(roles.flatMap(({ branchId }) => (branchId ? [branchId] : [])))].sort();
  }

  requireCapability(capabilities: readonly string[], required: string): void {
    if (!capabilities.includes(required)) throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  hasCapability(principal: PrincipalAccess, required: string, branchId?: string | null): boolean {
    if (!branchId) return principal.capabilities.includes(required);
    const denials = principal.denials ?? principal.capabilityDenials ?? [];
    const grants = principal.grants ?? principal.capabilityGrants;
    if (!grants)
      return (
        principal.capabilities.includes(required) &&
        (principal.capabilities.includes('branch:all') || principal.branchIds.includes(branchId))
      );
    if (
      denials.some(
        (item) =>
          item.capability === required && (item.branchId === null || item.branchId === branchId),
      )
    )
      return false;
    return grants.some(
      (item) =>
        item.capability === required && (item.branchId === null || item.branchId === branchId),
    );
  }

  requireScopedCapability(
    principal: PrincipalAccess,
    required: string,
    branchId?: string | null,
  ): void {
    if (!this.hasCapability(principal, required, branchId))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  hasGlobalCapability(principal: PrincipalAccess, required: string): boolean {
    const grants = principal.grants ?? principal.capabilityGrants;
    const denials = principal.denials ?? principal.capabilityDenials ?? [];
    if (denials.some(({ capability, branchId }) => capability === required && branchId === null))
      return false;
    if (grants)
      return grants.some(
        ({ capability, branchId }) => capability === required && branchId === null,
      );
    return (
      principal.capabilities.includes(required) && principal.capabilities.includes('branch:all')
    );
  }

  requireGlobalCapability(principal: PrincipalAccess, required: string): void {
    if (!this.hasGlobalCapability(principal, required))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  capabilityBranchScope(
    principal: PrincipalAccess,
    required: string,
  ): { all: boolean; included: string[]; excluded: string[] } {
    const grants = principal.grants ?? principal.capabilityGrants;
    const denials = principal.denials ?? principal.capabilityDenials ?? [];
    if (!grants) {
      return principal.capabilities.includes('branch:all')
        ? { all: true, included: [], excluded: [] }
        : {
            all: false,
            included: principal.capabilities.includes(required) ? [...principal.branchIds] : [],
            excluded: [],
          };
    }
    const globalDenied = denials.some(
      ({ capability, branchId }) => capability === required && branchId === null,
    );
    if (globalDenied) return { all: false, included: [], excluded: [] };
    const globallyGranted = grants.some(
      ({ capability, branchId }) =>
        branchId === null && (capability === required || capability === 'branch:all'),
    );
    const excluded = [
      ...new Set(
        denials.flatMap(({ capability, branchId }) =>
          capability === required && branchId ? [branchId] : [],
        ),
      ),
    ].sort();
    if (globallyGranted) return { all: true, included: [], excluded };
    const included = [
      ...new Set(
        grants.flatMap(({ capability, branchId }) =>
          capability === required && branchId ? [branchId] : [],
        ),
      ),
    ]
      .filter((branchId) => !excluded.includes(branchId))
      .sort();
    return { all: false, included, excluded: [] };
  }

  requireCustomerSelf(roles: readonly EffectiveRole[], capabilities: readonly string[]): void {
    const customerOnly = roles.length > 0 && roles.every(({ role }) => role === 'CUSTOMER');
    if (!customerOnly || !capabilities.includes('customer:self'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }
}
