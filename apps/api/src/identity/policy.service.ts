import { HttpStatus, Injectable } from '@nestjs/common';
import type { ApplicationRole, AssuranceLevel } from '@prisma/client';
import { ApiProblem } from './security';

const CAPABILITIES: Record<ApplicationRole, readonly string[]> = {
  CUSTOMER: ['customer:self', 'package:read'],
  INSTRUCTOR: ['class:assigned:read', 'attendance:self'],
  ADMIN: ['branch:operate', 'user:read'],
  MANAGER: ['branch:manage', 'user:read', 'purchase:review', 'purchase:decide'],
  OWNER: ['branch:own', 'user:read'],
  SUPER_OWNER: [
    'user:admin',
    'branch:all',
    'session:revoke',
    'assignment:read',
    'assignment:manage',
    'master:read',
    'master:manage',
    'package:read',
    'purchase:review',
    'purchase:decide',
  ],
  FINANCE: ['finance:read', 'finance:manage'],
  OPS: ['operations:read', 'operations:recover'],
};

export interface EffectiveRole {
  role: ApplicationRole;
  branchId: string | null;
}

@Injectable()
export class PolicyService {
  capabilities(roles: readonly EffectiveRole[]): string[] {
    return [...new Set(roles.flatMap(({ role }) => CAPABILITIES[role]))].sort();
  }

  branches(roles: readonly EffectiveRole[]): string[] {
    return [...new Set(roles.flatMap(({ branchId }) => (branchId ? [branchId] : [])))].sort();
  }

  requireCapability(capabilities: readonly string[], required: string): void {
    if (!capabilities.includes(required)) throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
  }

  requireMfa(assurance: AssuranceLevel): void {
    if (assurance !== 'MFA') throw new ApiProblem('MFA_REQUIRED', HttpStatus.FORBIDDEN);
  }
}
