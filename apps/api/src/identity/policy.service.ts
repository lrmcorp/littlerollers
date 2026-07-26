import { HttpStatus, Injectable } from '@nestjs/common';
import type { ApplicationRole } from '@prisma/client';
import { ApiProblem } from './security';

export const ROLE_CAPABILITIES: Record<ApplicationRole, readonly string[]> = {
  CUSTOMER: [
    'customer:self',
    'package:read',
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
    'identity-verification:review',
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
    'ledger:read',
    'class-slot:read',
    'booking:read',
    'reschedule:read',
    'attendance:read',
  ],
  SUPER_OWNER: [
    'audit:read',
    'user:read',
    'user:admin',
    'branch:all',
    'session:revoke',
    'assignment:read',
    'assignment:manage',
    'master:read',
    'master:manage',
    'payment-account:read',
    'payment-account:manage',
    'package:read',
    'payment:review',
    'payment:decide',
    'finance:read',
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
    'identity-verification:review',
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
    'ledger:read',
    'ledger:adjust:read',
  ],
  OPS: ['operations:read', 'operations:recover'],
};

export interface EffectiveRole {
  role: ApplicationRole;
  branchId: string | null;
}

@Injectable()
export class PolicyService {
  capabilities(roles: readonly EffectiveRole[]): string[] {
    return [...new Set(roles.flatMap(({ role }) => ROLE_CAPABILITIES[role]))].sort();
  }

  roleCatalog() {
    const assignable = new Set<ApplicationRole>(['ADMIN', 'MANAGER', 'FINANCE', 'OPS']);
    const branchScoped = new Set<ApplicationRole>(['INSTRUCTOR', 'ADMIN', 'MANAGER', 'OWNER']);
    return (Object.keys(ROLE_CAPABILITIES) as ApplicationRole[]).map((role) => ({
      role,
      capabilities: [...ROLE_CAPABILITIES[role]],
      assignable: assignable.has(role),
      readOnly: !assignable.has(role),
      scope: branchScoped.has(role) ? ('BRANCH' as const) : ('GLOBAL' as const),
    }));
  }

  branches(roles: readonly EffectiveRole[]): string[] {
    return [...new Set(roles.flatMap(({ branchId }) => (branchId ? [branchId] : [])))].sort();
  }

  requireCapability(capabilities: readonly string[], required: string): void {
    if (!capabilities.includes(required)) throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }
}
