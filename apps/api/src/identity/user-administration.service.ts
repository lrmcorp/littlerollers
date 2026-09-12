import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma, type Role, type UserStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { RateLimitService } from './rate-limit.service';
import { ApiProblem, newId } from './security';
import type { ApplicationRole } from './role-capabilities';

function normalizePhone(value: string): string {
  const compact = value.replace(/[\s().-]/g, '');
  const normalized = compact.startsWith('0') ? `+62${compact.slice(1)}` : compact;
  if (!/^\+[1-9]\d{7,14}$/u.test(normalized))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  return normalized;
}

@Injectable()
export class UserAdministrationService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly rateLimit: RateLimitService,
    @Optional() private readonly idempotency?: IdempotencyService,
  ) {}

  private userView(user: any) {
    const role: ApplicationRole = user.role as ApplicationRole;
    const branch = user.preferredBranchId ? { id: user.preferredBranchId, code: 'BRANCH', name: 'Branch' } : null;
    const roles = [
      {
        role,
        branchId: user.preferredBranchId ?? null,
        branch,
        source: 'DIRECT' as const,
      },
    ];
    const audience = role === 'MEMBER' ? 'CUSTOMER' : 'STAFF';

    return {
      id: user.id,
      email: user.email ?? null,
      displayName: user.displayName,
      phoneE164: user.phone ?? null,
      phone: user.phone ?? null,
      status: user.status,
      version: 1,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      roles,
      directRoles: roles,
      assignmentRoles: [],
      effectiveCapabilities: this.policy.capabilities(roles),
      audience,
      profile: user.profile ?? null,
    };
  }

  async listUsers(
    principal: SessionPrincipal,
    filters: {
      branchId?: string;
      cursor?: string;
      search?: string;
      status?: string;
      role?: string;
      audience?: 'STAFF' | 'CUSTOMER';
      verificationStatus?: string;
      includeHistorical?: boolean;
    },
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:read');

    const where: Prisma.UserWhereInput = {
      ...(filters.branchId ? { preferredBranchId: filters.branchId } : {}),
      ...(filters.status ? { status: filters.status as UserStatus } : {}),
      ...(filters.role ? { role: filters.role as Role } : {}),
      ...(filters.audience === 'CUSTOMER'
        ? { role: 'MEMBER' }
        : filters.audience === 'STAFF'
          ? { role: { in: ['SUPERADMIN', 'ADMIN', 'COACH'] } }
          : {}),
      ...(filters.search?.trim()
        ? {
            OR: [
              { displayName: { contains: filters.search.trim() } },
              { email: { contains: filters.search.trim() } },
              { phone: { contains: filters.search.trim() } },
            ],
          }
        : {}),
      ...(filters.cursor ? { id: { gt: filters.cursor } } : {}),
    };

    const users = await this.db.user.findMany({
      where,
      include: { profile: true },
      orderBy: { id: 'asc' },
      take: 21,
    });

    const hasMore = users.length > 20;
    const page = users.slice(0, 20);

    return {
      items: page.map((u) => this.userView(u)),
      summary: { total: users.length, active: users.length, inactive: 0 },
      page: { nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null, hasMore },
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
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));

    const where: Prisma.UserWhereInput = {
      status: 'ACTIVE',
      ...(filters.instructorsOnly ? { role: 'COACH' } : {}),
      ...(filters.branchId ? { preferredBranchId: filters.branchId } : {}),
      ...(filters.q?.trim()
        ? {
            OR: [
              { displayName: { contains: filters.q.trim() } },
              { email: { contains: filters.q.trim() } },
              { phone: { contains: filters.q.trim() } },
            ],
          }
        : {}),
      ...(filters.cursor ? { id: { gt: filters.cursor } } : {}),
    };

    const users = await this.db.user.findMany({
      where,
      orderBy: { id: 'asc' },
      take: limit + 1,
    });

    const hasMore = users.length > limit;
    const page = users.slice(0, limit);

    return {
      items: page.map((user) => ({
        id: user.id,
        label: user.displayName,
        description: `${user.role}${user.phone ? ` · ${user.phone}` : ''}`,
        metadata: {
          roles: [user.role],
          branchIds: user.preferredBranchId ? [user.preferredBranchId] : [],
        },
      })),
      page: { nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null, hasMore },
    };
  }

  async lookupCustomers(
    principal: SessionPrincipal,
    filters: {
      q?: string;
      branchId?: string;
      cursor?: string;
      limit?: number;
    },
  ) {
    this.policy.requireCapability(principal.capabilities, 'booking:create:assisted');
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));

    const where: Prisma.UserWhereInput = {
      role: 'MEMBER',
      status: 'ACTIVE',
      ...(filters.q?.trim()
        ? {
            OR: [
              { displayName: { contains: filters.q.trim() } },
              { phone: { contains: filters.q.trim() } },
              { email: { contains: filters.q.trim() } },
            ],
          }
        : {}),
      ...(filters.cursor ? { id: { gt: filters.cursor } } : {}),
      customerPackages: {
        some: {
          status: 'ACTIVE',
          remainingSessions: { gt: 0 },
          validUntil: { gt: new Date() },
        },
      },
    };

    const users = await this.db.user.findMany({
      where,
      include: {
        customerPackages: {
          where: {
            status: 'ACTIVE',
            remainingSessions: { gt: 0 },
            validUntil: { gt: new Date() },
          },
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
        description: user.phone || 'Nomor belum tersedia',
        metadata: {
          verificationStatus: 'APPROVED' as const,
          eligiblePackageCount: user.customerPackages.length,
          branchId: filters.branchId,
        },
      })),
      page: { nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null, hasMore },
    };
  }

  async getUser(principal: SessionPrincipal, targetId: string) {
    this.policy.requireCapability(principal.capabilities, 'user:read');
    const user = await this.db.user.findUnique({
      where: { id: targetId },
      include: { profile: true },
    });
    if (!user) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return this.userView(user);
  }

  async updateUserProfile(
    principal: SessionPrincipal,
    targetId: string,
    input: {
      displayName: string;
      phoneE164?: string | null;
      expectedVersion?: number;
      reason?: string;
    },
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    const displayName = input.displayName?.trim();
    if (!displayName || displayName.length < 2)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const phone = input.phoneE164?.trim() ? normalizePhone(input.phoneE164) : undefined;

    const updated = await this.db.user.update({
      where: { id: targetId },
      data: {
        displayName,
        ...(phone !== undefined ? { phone } : {}),
      },
      include: { profile: true },
    });

    return this.userView(updated);
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
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    const email = input.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const existing = await this.db.user.findUnique({ where: { email } });
    if (existing) throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);

    const roleName = input.roles?.[0] || input.roleAssignments?.[0]?.role || 'ADMIN';
    const role: Role = roleName === 'COACH' ? 'COACH' : roleName === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN';
    const branchId = input.branchIds?.[0] || input.roleAssignments?.[0]?.branchId || null;

    const user = await this.db.user.create({
      data: {
        id: newId(),
        email,
        displayName: input.displayName?.trim() || email.split('@')[0] || 'User',
        role,
        preferredBranchId: branchId,
        status: 'ACTIVE',
      },
      include: { profile: true },
    });

    return { id: user.id, status: 'CREATED', user: this.userView(user) };
  }

  async updateUserRoles(
    principal: SessionPrincipal,
    targetId: string,
    input: {
      roles: { role: ApplicationRole; branchId?: string | null }[];
      expectedVersion?: number;
      reason?: string;
    },
    _correlationId: string,
    _idempotencyKey?: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    const roleName = input.roles[0]?.role || 'ADMIN';
    const role: Role = roleName === 'COACH' ? 'COACH' : roleName === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN';
    const branchId = input.roles[0]?.branchId || null;

    const updated = await this.db.user.update({
      where: { id: targetId },
      data: {
        role,
        preferredBranchId: branchId,
      },
      include: { profile: true },
    });

    return this.userView(updated);
  }

  async deactivate(
    principal: SessionPrincipal,
    targetId: string,
    _reason: string,
    _expectedVersion?: number,
    _correlationId?: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    if (targetId === principal.userId)
      throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.CONFLICT);

    const user = await this.db.user.update({
      where: { id: targetId },
      data: { status: 'INACTIVE' },
    });

    return { id: user.id, status: user.status };
  }

  async reactivate(
    principal: SessionPrincipal,
    targetId: string,
    _reason: string,
    _expectedVersion?: number,
    _correlationId?: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');

    const user = await this.db.user.update({
      where: { id: targetId },
      data: { status: 'ACTIVE' },
    });

    return { id: user.id, status: user.status, version: 1 };
  }

  async listUserAudit(
    _principal: SessionPrincipal,
    _targetId: string,
    _cursor?: string | { cursor?: string; limit?: number },
    _includeHistorical?: boolean,
  ) {
    return { items: [], page: { hasMore: false, nextCursor: null } };
  }

  async listAuditLogs(
    _principal: SessionPrincipal,
    _filters: {
      actorId?: string;
      targetUserId?: string;
      action?: string;
      branchId?: string;
      correlationId?: string;
      from?: string;
      until?: string;
      cursor?: string;
      includeHistorical?: boolean;
      limit?: number;
    } = {},
  ) {
    return { items: [], summary: { total: 0 }, page: { hasMore: false, nextCursor: null } };
  }

  // --- Indonesian Domain Aliases ---
  async daftarPengguna(
    principal: SessionPrincipal,
    filters: Parameters<UserAdministrationService['listUsers']>[1],
  ) {
    return this.listUsers(principal, filters);
  }

  async detailPengguna(principal: SessionPrincipal, targetId: string) {
    return this.getUser(principal, targetId);
  }

  async undangPengguna(
    principal: SessionPrincipal,
    input: Parameters<UserAdministrationService['inviteUser']>[1],
    correlationId: string,
  ) {
    return this.inviteUser(principal, input, correlationId);
  }

  async perbaruiProfilPengguna(
    principal: SessionPrincipal,
    targetId: string,
    input: Parameters<UserAdministrationService['updateUserProfile']>[2],
    correlationId: string,
  ) {
    return this.updateUserProfile(principal, targetId, input, correlationId);
  }

  async perbaruiPeranPengguna(
    principal: SessionPrincipal,
    targetId: string,
    input: Parameters<UserAdministrationService['updateUserRoles']>[2],
    correlationId: string,
    idempotencyKey?: string,
  ) {
    return this.updateUserRoles(principal, targetId, input, correlationId, idempotencyKey);
  }

  async nonaktifkanPengguna(
    principal: SessionPrincipal,
    targetId: string,
    reason: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    return this.deactivate(principal, targetId, reason, expectedVersion, correlationId);
  }

  async aktifkanKembaliPengguna(
    principal: SessionPrincipal,
    targetId: string,
    reason: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    return this.reactivate(principal, targetId, reason, expectedVersion, correlationId);
  }

  async daftarJejakAudit(
    principal: SessionPrincipal,
    filters: Parameters<UserAdministrationService['listAuditLogs']>[1],
  ) {
    return this.listAuditLogs(principal, filters);
  }
}
