import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma, type Role, type UserStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { RateLimitService } from './rate-limit.service';
import { ApiProblem, newId } from './security';
import { hashPassword } from './credential-security';
import type { ApplicationRole } from './role-capabilities';
import { buildPhoneSearchVariants } from './manajemen-pelanggan.service';

/** Halaman staf yang memakai pemilih user: penugasan, master, hak akses, audit. */
const USER_LOOKUP_CAPABILITIES = [
  'assignment:manage',
  'master:manage',
  'user:admin',
  'audit:read',
  'role-permission:manage',
] as const;
const INSTRUCTOR_LOOKUP_CAPABILITIES = [
  'class-slot:manage',
  'assignment:manage',
  'master:manage',
] as const;

function normalizePhone(value: string): string {
  const compact = value.replace(/[\s().-]/g, '');
  const normalized = compact.startsWith('0') ? `+62${compact.slice(1)}` : compact;
  if (!/^\+[1-9]\d{7,14}$/u.test(normalized))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  return normalized;
}

function toDbRole(roleName?: string): Role {
  if (!roleName) return 'ADMIN';
  if (roleName === 'COACH' || roleName === 'INSTRUCTOR') return 'COACH';
  if (roleName === 'SUPERADMIN' || roleName === 'SUPER_OWNER') return 'SUPER_OWNER';
  if (roleName === 'MANAGER') return 'MANAGER';
  if (roleName === 'FINANCE') return 'FINANCE';
  if (roleName === 'OWNER') return 'OWNER';
  if (roleName === 'CUSTOMER' || roleName === 'MEMBER') return 'MEMBER';
  return 'ADMIN';
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
      phoneE164: user.phoneE164 ?? user.phone ?? null,
      phone: user.phone ?? user.phoneE164 ?? null,
      status: user.status,
      version: user.version ?? 1,
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

    const hasGlobalBranch = principal.capabilities.includes('branch:all');
    let preferredBranchCondition: string | { in: string[] } | undefined = filters.branchId;

    if (!hasGlobalBranch) {
      const allowedBranches = principal.branchIds ?? [];
      if (filters.branchId) {
        if (!allowedBranches.includes(filters.branchId)) {
          throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
        }
        preferredBranchCondition = filters.branchId;
      } else {
        preferredBranchCondition = { in: allowedBranches };
      }
    }

    const q = filters.search?.trim();
    const phoneVariants = q ? buildPhoneSearchVariants(q) : [];

    const where: Prisma.UserWhereInput = {
      ...(preferredBranchCondition ? { preferredBranchId: preferredBranchCondition } : {}),
      ...(filters.status ? { status: filters.status as UserStatus } : {}),
      ...(filters.role ? { role: filters.role as Role } : {}),
      ...(filters.audience === 'CUSTOMER'
        ? { role: { in: ['CUSTOMER', 'MEMBER'] } }
        : filters.audience === 'STAFF'
          ? {
              role: {
                in: [
                  'SUPER_OWNER',
                  'OWNER',
                  'MANAGER',
                  'FINANCE',
                  'ADMIN',
                  'INSTRUCTOR',
                  'SUPERADMIN',
                  'COACH',
                ],
              },
            }
          : {}),
      ...(q
        ? {
            OR: [
              { displayName: { contains: q } },
              { email: { contains: q } },
              ...phoneVariants.map((v) => ({ phone: { contains: v } })),
            ],
          }
        : {}),
      ...(filters.cursor ? { id: { gt: filters.cursor } } : {}),
    };

    const [users, statusCounts] = await Promise.all([
      this.db.user.findMany({
        where,
        include: { profile: true },
        orderBy: { id: 'asc' },
        take: 21,
      }),
      this.db.user.groupBy({
        by: ['status'],
        where: {
          role: filters.role
            ? (filters.role as any)
            : { notIn: ['CUSTOMER', 'MEMBER'] },
        },
        _count: { _all: true },
      }),
    ]);

    const hasMore = users.length > 20;
    const page = users.slice(0, 20);

    const countsMap = new Map(statusCounts.map((sc) => [sc.status, sc._count._all]));
    const activeCount = countsMap.get('ACTIVE') ?? 0;
    const inactiveCount = (countsMap.get('INACTIVE') ?? 0) + (countsMap.get('SUSPENDED') ?? 0);
    const pendingCount = 0;
    const totalCount = Array.from(countsMap.values()).reduce((a, b) => a + b, 0);

    return {
      items: page.map((u) => this.userView(u)),
      summary: { total: totalCount, active: activeCount, pendingActivation: pendingCount, inactive: inactiveCount },
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
    // Pemilih user hanya untuk halaman staf yang benar-benar membutuhkannya (penugasan, master,
    // hak akses, audit); pelanggan dan role tanpa halaman tersebut tidak boleh menyisir direktori.
    this.policy.requireAnyCapability(
      principal.capabilities,
      filters.instructorsOnly ? INSTRUCTOR_LOOKUP_CAPABILITIES : USER_LOOKUP_CAPABILITIES,
    );
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20));

    const andClauses: Prisma.UserWhereInput[] = [];

    if (filters.instructorsOnly) {
      andClauses.push({ role: 'COACH' });
    }

    if (filters.branchId) {
      andClauses.push({
        OR: [
          { preferredBranchId: filters.branchId },
          { role: { in: ['COACH', 'SUPER_OWNER', 'SUPERADMIN', 'ADMIN', 'OWNER'] } },
        ],
      });
    }

    if (filters.q?.trim()) {
      const q = filters.q.trim();
      const phoneVariants = buildPhoneSearchVariants(q);
      andClauses.push({
        OR: [
          { displayName: { contains: q } },
          { email: { contains: q } },
          ...phoneVariants.map((v) => ({ phone: { contains: v } })),
        ],
      });
    }

    if (filters.cursor) {
      andClauses.push({ id: { gt: filters.cursor } });
    }

    const where: Prisma.UserWhereInput = {
      status: 'ACTIVE',
      ...(andClauses.length > 0 ? { AND: andClauses } : {}),
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
        description: user.role,
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

    const q = filters.q?.trim();
    const phoneVariants = q ? buildPhoneSearchVariants(q) : [];

    const where: Prisma.UserWhereInput = {
      role: 'MEMBER',
      status: 'ACTIVE',
      ...(q
        ? {
            OR: [
              { displayName: { contains: q } },
              { email: { contains: q } },
              ...phoneVariants.map((v) => ({ phone: { contains: v } })),
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

    const hasGlobalBranch = principal.capabilities.includes('branch:all');
    if (
      !hasGlobalBranch &&
      user.preferredBranchId &&
      !principal.branchIds?.includes(user.preferredBranchId)
    ) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

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

    const existing = await this.db.user.findUnique({ where: { id: targetId } });
    if (!existing) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const updated = await this.db.user.update({
      where: { id: targetId },
      data: {
        displayName,
        ...(phone !== undefined ? { phone } : {}),
      },
      include: { profile: true },
    });

    if ((this.db as any).auditLog?.create) {
      await (this.db as any).auditLog.create({
        data: {
          action: 'security.user_profile_updated',
          actorId: principal.userId,
          targetUserId: targetId,
          correlationId: _correlationId,
          reason: input.reason ?? null,
        },
      });
    }

    return this.userView(updated ?? existing);
  }

  async inviteUser(
    principal: SessionPrincipal,
    input: {
      email: string;
      displayName?: string;
      phone?: string;
      phoneE164?: string;
      password?: string;
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
    const role: Role = toDbRole(roleName);
    const branchId = input.branchIds?.[0] || input.roleAssignments?.[0]?.branchId || null;

    let phone = input.phoneE164 || input.phone;
    if (phone) {
      try {
        phone = normalizePhone(phone);
      } catch {
        phone = phone.trim();
      }
      const existingPhone = await this.db.user.findFirst({
        where: { phone },
      });
      if (existingPhone) {
        throw new ApiProblem('PHONE_ALREADY_EXISTS', HttpStatus.CONFLICT, false, [
          { field: 'phone', issue: 'Nomor telepon/WhatsApp sudah terdaftar pada pengguna lain.' },
        ]);
      }
    }

    let passwordHash: string | null = null;
    if (input.password && input.password.trim()) {
      passwordHash = await hashPassword(input.password.trim());
    }

    const user = await this.db.user.create({
      data: {
        id: newId(),
        email,
        phone: phone || null,
        displayName: input.displayName?.trim() || email.split('@')[0] || 'User',
        passwordHash,
        role,
        preferredBranchId: branchId,
        status: 'ACTIVE',
      },
      include: { profile: true },
    });

    return { id: user.id, status: 'CREATED', user: this.userView(user) };
  }

  async resetPasswordDirect(
    principal: SessionPrincipal,
    targetId: string,
    newPassword: string,
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    if (!newPassword || newPassword.trim().length < 8) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const user = await this.db.user.findUnique({ where: { id: targetId } });
    if (!user) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const passwordHash = await hashPassword(newPassword.trim());

    await this.db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetId },
        data: { passwordHash },
      });
      await tx.userSession.updateMany({
        where: { userId: targetId, revokedAt: null },
        data: { revokedAt: new Date(), revocationReason: 'ADMIN_PASSWORD_RESET' },
      });
    });

    return { id: targetId, status: 'PASSWORD_RESET_SUCCESS' };
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
    const role: Role = toDbRole(roleName);
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
    _reason?: string,
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
    _reason?: string,
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
    principal: SessionPrincipal,
    _targetId: string,
    _cursor?: string | { cursor?: string; limit?: number },
    _includeHistorical?: boolean,
  ) {
    this.policy.requireCapability(principal.capabilities, 'audit:read');
    return { items: [], page: { hasMore: false, nextCursor: null } };
  }

  async listAuditLogs(
    principal: SessionPrincipal,
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
    this.policy.requireCapability(principal.capabilities, 'audit:read');
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
