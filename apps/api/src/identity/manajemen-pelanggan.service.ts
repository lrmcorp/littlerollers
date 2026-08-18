import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { canonicalEmailHash, hashPassword, normalizeEmail } from './credential-security';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { ApiProblem, digest, newId, safeEqual } from './security';

type CustomerStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE';
type VerificationStatus = 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED';

@Injectable()
export class CustomerManagementService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    @Optional() private readonly idempotency?: IdempotencyService,
  ) {}

  private normalizePhone(value: string): string {
    const compact = value.replace(/[\s().-]/gu, '');
    const normalized = compact.startsWith('0') ? `+62${compact.slice(1)}` : compact;
    if (!/^\+[1-9]\d{7,14}$/u.test(normalized))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return normalized;
  }

  private require(principal: SessionPrincipal, capability: string) {
    this.policy.requireGlobalCapability(principal, capability);
  }

  private async requireStepUp(principal: SessionPrincipal, token: string, reason: string) {
    if (!reason?.trim() || reason.trim().length < 3 || reason.length > 500)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const maxAge = Number(process.env.CUSTOMER_ADMIN_MFA_MAX_AGE_SECONDS ?? 900);
    if (!Number.isInteger(maxAge) || maxAge < 60 || maxAge > 3600)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE);
    const recentMfa = await this.db.authChallenge.findFirst({
      where: {
        userId: principal.userId,
        kind: 'OTP',
        status: 'VERIFIED',
        verifiedAt: { gte: new Date(Date.now() - maxAge * 1000) },
      },
      select: { id: true },
    });
    if (!recentMfa) throw new ApiProblem('MFA_REQUIRED', HttpStatus.UNAUTHORIZED);
    const expected = process.env.CUSTOMER_ADMIN_STEP_UP_TOKEN_HASH?.trim() ?? '';
    if (
      !expected ||
      !safeEqual(
        createHash('sha256')
          .update(token ?? '')
          .digest('hex'),
        expected,
      )
    )
      throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
  }

  private async runIdempotentMutation<T extends Record<string, unknown>>(
    scope: string,
    key: string,
    payload: unknown,
    perform: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T & { replay: boolean }> {
    if (this.idempotency) {
      const result = await this.idempotency.execute(
        { scope, key, payload, ttlMs: 86_400_000, leaseMs: 30_000 },
        async (tx) => ({
          status: 200,
          body: (await perform(tx)) as Prisma.InputJsonValue,
        }),
      );
      return { ...(result.body as unknown as T), replay: result.replay };
    }
    return { ...(await this.db.$transaction(perform)), replay: false };
  }

  async list(
    principal: SessionPrincipal,
    filters: {
      q?: string;
      cursor?: string;
      status?: CustomerStatus;
      verificationStatus?: VerificationStatus;
      preferredBranchId?: string;
      packageStatus?: 'ACTIVE' | 'INACTIVE';
      activity?: 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'NEVER';
    },
  ) {
    this.require(principal, 'customer:read');
    const q = filters.q?.trim();
    const now = new Date();
    const activitySince =
      filters.activity === 'LAST_30_DAYS'
        ? new Date(now.getTime() - 30 * 86_400_000)
        : filters.activity === 'LAST_90_DAYS'
          ? new Date(now.getTime() - 90 * 86_400_000)
          : null;
    const verification = verificationWhere(filters.verificationStatus);
    const where: Prisma.UserWhereInput = {
      historical: false,
      roles: {
        some: {
          role: 'CUSTOMER',
          activeFrom: { lte: now },
          OR: [{ activeUntil: null }, { activeUntil: { gt: now } }],
        },
      },
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.preferredBranchId ? { preferredBranchId: filters.preferredBranchId } : {}),
      ...(filters.packageStatus
        ? { customerPackages: { some: { status: filters.packageStatus } } }
        : {}),
      ...(activitySince ? { updatedAt: { gte: activitySince } } : {}),
      ...(filters.activity === 'NEVER'
        ? { purchases: { none: {} }, customerBookings: { none: {} } }
        : {}),
      ...verification,
      ...(q
        ? {
            OR: [
              { id: { contains: q } },
              { displayName: { contains: q } },
              { email: { contains: q.toLowerCase() } },
              { phoneE164: { contains: q } },
              { profile: { is: { barcode: { contains: q } } } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.db.user.findMany({
        where: { ...where, ...(filters.cursor ? { id: { gt: filters.cursor } } : {}) },
        orderBy: { id: 'asc' },
        take: 21,
        select: {
          id: true,
          displayName: true,
          email: true,
          phoneE164: true,
          status: true,
          version: true,
          updatedAt: true,
          preferredBranch: { select: { id: true, code: true, name: true } },
          profile: { select: { barcode: true } },
          passwordCredential: { select: { verifiedAt: true, mustChangePassword: true } },
          customerPackages: {
            where: { status: 'ACTIVE' },
            select: { id: true, sessionCountSnapshot: true },
          },
          identityDocuments: {
            where: { replacedById: null },
            select: { kind: true, status: true },
          },
          _count: { select: { purchases: true, customerBookings: true } },
        },
      }),
      this.db.user.count({ where }),
    ]);
    const hasMore = rows.length > 20;
    const page = rows.slice(0, 20);
    return {
      items: page.map((row) => ({
        ...row,
        emailVerified: Boolean(row.passwordCredential?.verifiedAt),
        mustChangePassword: row.passwordCredential?.mustChangePassword ?? false,
        verificationStatus: summarizeVerification(row.identityDocuments),
        activePackageCount: row.customerPackages.length,
        purchasedSessions: row.customerPackages.reduce(
          (sum, item) => sum + item.sessionCountSnapshot,
          0,
        ),
        updatedAt: row.updatedAt.toISOString(),
        passwordCredential: undefined,
        identityDocuments: undefined,
        customerPackages: undefined,
      })),
      summary: { total },
      page: { hasMore, nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null },
    };
  }

  async detail(principal: SessionPrincipal, id: string) {
    this.require(principal, 'customer:read');
    const customer = await this.db.user.findFirst({
      where: { id, roles: { some: { role: 'CUSTOMER' } } },
      select: {
        id: true,
        displayName: true,
        email: true,
        phoneE164: true,
        status: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        preferredBranch: { select: { id: true, code: true, name: true } },
        profile: true,
        passwordCredential: {
          select: { verifiedAt: true, passwordChangedAt: true, mustChangePassword: true },
        },
        identities: { select: { provider: true, verifiedAt: true, createdAt: true } },
        identityDocuments: {
          where: { replacedById: null },
          select: { kind: true, status: true, reviewedAt: true, rejectionReasonCode: true },
        },
        purchases: {
          orderBy: { submittedAt: 'desc' },
          take: 20,
          select: {
            id: true,
            status: true,
            packageNameSnapshot: true,
            priceRpSnapshot: true,
            payableAmountRpSnapshot: true,
            submittedAt: true,
            decidedAt: true,
          },
        },
        customerPackages: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            status: true,
            sessionCountSnapshot: true,
            projectionRateRp: true,
            salePriceRp: true,
            activationDate: true,
            expiryAt: true,
          },
        },
        customerBookings: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, status: true, classSlotId: true, createdAt: true, cancelledAt: true },
        },
        voucherRedemptions: {
          orderBy: { redeemedAt: 'desc' },
          take: 20,
          select: { id: true, voucherId: true, purchaseId: true, redeemedAt: true },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, category: true, title: true, readAt: true, createdAt: true },
        },
        _count: {
          select: {
            purchases: true,
            customerPackages: true,
            customerBookings: true,
            voucherRedemptions: true,
            notifications: true,
          },
        },
      },
    });
    if (!customer) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return {
      ...customer,
      verificationStatus: summarizeVerification(customer.identityDocuments),
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }

  async timeline(principal: SessionPrincipal, id: string, cursor?: string) {
    this.require(principal, 'customer:read');
    const exists = await this.db.userRole.findFirst({ where: { userId: id, role: 'CUSTOMER' } });
    if (!exists) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const rows = await this.db.auditLog.findMany({
      where: {
        OR: [{ targetUserId: id }, { actorId: id }, { objectType: 'User', objectId: id }],
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
      take: 21,
      select: {
        id: true,
        action: true,
        objectType: true,
        objectId: true,
        occurredAt: true,
        correlationId: true,
      },
    });
    const hasMore = rows.length > 20;
    const page = rows.slice(0, 20);
    return {
      items: page.map((row) => ({ ...row, occurredAt: row.occurredAt.toISOString() })),
      page: { hasMore, nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null },
    };
  }

  async create(
    principal: SessionPrincipal,
    input: {
      displayName: string;
      email: string;
      phoneE164: string;
      preferredBranchId?: string | null;
      password: string;
      passwordConfirmation: string;
      profile?: {
        address?: string | null;
        genderCode?: string | null;
        countryCode?: string | null;
        birthDate?: string | null;
        barcode?: string | null;
      };
      reason: string;
    },
    idempotencyKey: string,
    stepUpToken: string,
    correlationId: string,
  ) {
    this.require(principal, 'customer:credential:initialize');
    await this.requireStepUp(principal, stepUpToken, input.reason);
    if (!idempotencyKey?.trim() || input.password !== input.passwordConfirmation)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const displayName = input.displayName?.trim();
    const email = normalizeEmail(input.email ?? '');
    const phoneE164 = this.normalizePhone(input.phoneE164 ?? '');
    if (
      !displayName ||
      displayName.length < 2 ||
      displayName.length > 160 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (input.preferredBranchId) {
      const branch = await this.db.cabang.findFirst({
        where: { id: input.preferredBranchId, active: true },
        select: { id: true },
      });
      if (!branch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const passwordHash = await hashPassword(input.password);
    const emailHash = canonicalEmailHash(email);
    const perform = async (tx: Prisma.TransactionClient) => {
      const userId = newId();
      const user = await tx.user.create({
        data: {
          id: userId,
          displayName,
          email,
          phoneE164,
          preferredBranchId: input.preferredBranchId || null,
          status: 'ACTIVE',
          roles: { create: { role: 'CUSTOMER', activeFrom: new Date() } },
          passwordCredential: {
            create: {
              emailHash,
              passwordHash,
              passwordChangedAt: new Date(),
              mustChangePassword: true,
            },
          },
          identities: {
            create: { id: newId(), provider: 'EMAIL_PASSWORD', subjectHash: emailHash },
          },
          profile: input.profile
            ? {
                create: {
                  address: input.profile.address?.trim() || null,
                  genderCode: input.profile.genderCode?.trim() || null,
                  countryCode: input.profile.countryCode?.trim().toUpperCase() || null,
                  birthDate: input.profile.birthDate ? new Date(input.profile.birthDate) : null,
                  barcode: input.profile.barcode?.trim() || null,
                },
              }
            : undefined,
        },
        select: {
          id: true,
          displayName: true,
          email: true,
          phoneE164: true,
          status: true,
          version: true,
        },
      });
      await tx.auditLog.create({
        data: {
          id: newId(),
          actorType: 'USER',
          actorId: principal.userId,
          action: 'customer.created_by_admin',
          objectType: 'User',
          objectId: user.id,
          targetUserId: user.id,
          correlationId,
          afterMasked: {
            role: 'CUSTOMER',
            status: 'ACTIVE',
            mustChangePassword: true,
            preferredBranchConfigured: Boolean(input.preferredBranchId),
            reasonPresent: true,
          },
        },
      });
      return user;
    };
    try {
      if (this.idempotency) {
        const result = await this.idempotency.execute(
          {
            scope: `customer:create:${principal.userId}`,
            key: idempotencyKey,
            payload: {
              ...input,
              password: undefined,
              passwordConfirmation: undefined,
              credentialRequestHash: digest(input.password),
            },
            ttlMs: 86_400_000,
            leaseMs: 30_000,
          },
          async (tx) => ({ status: 201, body: await perform(tx) }),
        );
        return { ...(result.body as Record<string, unknown>), replay: result.replay };
      }
      return { ...(await this.db.$transaction(perform)), replay: false };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async updateProfile(
    principal: SessionPrincipal,
    id: string,
    input: {
      displayName: string;
      email: string;
      phoneE164: string;
      preferredBranchId?: string | null;
      expectedVersion: number;
      reason: string;
    },
    idempotencyKey: string,
    stepUpToken: string,
    correlationId: string,
  ) {
    this.require(principal, 'customer:manage');
    await this.requireStepUp(principal, stepUpToken, input.reason);
    if (!idempotencyKey?.trim() || !Number.isInteger(input.expectedVersion))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const displayName = input.displayName?.trim();
    const email = normalizeEmail(input.email ?? '');
    const phoneE164 = this.normalizePhone(input.phoneE164 ?? '');
    if (!displayName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (input.preferredBranchId) {
      const branch = await this.db.cabang.findFirst({
        where: { id: input.preferredBranchId, active: true },
        select: { id: true },
      });
      if (!branch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const perform = async (tx: Prisma.TransactionClient) => {
      const current = await tx.user.findFirst({
        where: { id, roles: { some: { role: 'CUSTOMER' } } },
        select: { email: true, preferredBranchId: true, version: true },
      });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const changed = await tx.user.updateMany({
        where: { id, version: input.expectedVersion },
        data: {
          displayName,
          email,
          phoneE164,
          preferredBranchId: input.preferredBranchId || null,
          version: { increment: 1 },
        },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      if (email !== current.email) {
        const emailHash = canonicalEmailHash(email);
        await tx.passwordCredential.update({
          where: { userId: id },
          data: { emailHash, verifiedAt: null, version: { increment: 1 } },
        });
        await tx.identitas.updateMany({
          where: { userId: id, provider: 'EMAIL_PASSWORD' },
          data: { subjectHash: emailHash, verifiedAt: null },
        });
      }
      await tx.auditLog.create({
        data: {
          id: newId(),
          actorType: 'USER',
          actorId: principal.userId,
          action: 'customer.profile_updated',
          objectType: 'User',
          objectId: id,
          targetUserId: id,
          correlationId,
          beforeMasked: {
            version: current.version,
            preferredBranchConfigured: Boolean(current.preferredBranchId),
          },
          afterMasked: {
            version: current.version + 1,
            preferredBranchConfigured: Boolean(input.preferredBranchId),
            reasonPresent: true,
          },
        },
      });
      return { id, version: current.version + 1 };
    };
    try {
      return await this.runIdempotentMutation(
        `customer:profile:${principal.userId}:${id}`,
        idempotencyKey,
        {
          displayName,
          email,
          phoneE164,
          preferredBranchId: input.preferredBranchId || null,
          expectedVersion: input.expectedVersion,
          reason: input.reason,
        },
        perform,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async setStatus(
    principal: SessionPrincipal,
    id: string,
    active: boolean,
    input: { expectedVersion: number; reason: string },
    idempotencyKey: string,
    stepUpToken: string,
    correlationId: string,
  ) {
    this.require(principal, 'customer:security:manage');
    await this.requireStepUp(principal, stepUpToken, input.reason);
    if (!idempotencyKey?.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.runIdempotentMutation(
      `customer:status:${principal.userId}:${id}`,
      idempotencyKey,
      { active, expectedVersion: input.expectedVersion, reason: input.reason },
      async (tx) => {
        const changed = await tx.user.updateMany({
          where: { id, version: input.expectedVersion, roles: { some: { role: 'CUSTOMER' } } },
          data: { status: active ? 'ACTIVE' : 'INACTIVE', version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        if (!active)
          await tx.userSession.updateMany({
            where: { userId: id, revokedAt: null },
            data: { revokedAt: new Date(), revocationReason: 'CUSTOMER_DISABLED_BY_ADMIN' },
          });
        await tx.auditLog.create({
          data: {
            id: newId(),
            actorType: 'USER',
            actorId: principal.userId,
            action: active ? 'customer.activated' : 'customer.deactivated',
            objectType: 'User',
            objectId: id,
            targetUserId: id,
            correlationId,
            afterMasked: { status: active ? 'ACTIVE' : 'INACTIVE', reasonPresent: true },
          },
        });
        return { id, status: active ? 'ACTIVE' : 'INACTIVE', version: input.expectedVersion + 1 };
      },
    );
  }

  // --- Indonesian Domain Aliases ---
  async daftarPelanggan(
    principal: SessionPrincipal,
    filters: Parameters<CustomerManagementService['list']>[1],
  ) {
    return this.list(principal, filters);
  }

  async detailPelanggan(principal: SessionPrincipal, id: string) {
    return this.detail(principal, id);
  }

  async perbaruiStatusPelanggan(
    principal: SessionPrincipal,
    id: string,
    active: boolean,
    input: { expectedVersion: number; reason: string },
    idempotencyKey: string,
    stepUpToken: string,
    correlationId: string,
  ) {
    return this.setStatus(principal, id, active, input, idempotencyKey, stepUpToken, correlationId);
  }
}

function summarizeVerification(
  documents: Array<{ kind: string; status: string }>,
): VerificationStatus {
  if (
    ['SELFIE', 'KTP_FRONT'].every((kind) =>
      documents.some((item) => item.kind === kind && item.status === 'APPROVED'),
    )
  )
    return 'APPROVED';
  return documents.some((item) => item.status === 'REJECTED') ? 'ACTION_REQUIRED' : 'PENDING';
}

function verificationWhere(status?: VerificationStatus): Prisma.UserWhereInput {
  if (!status) return {};
  const approved: Prisma.UserWhereInput = {
    AND: [
      { identityDocuments: { some: { replacedById: null, kind: 'SELFIE', status: 'APPROVED' } } },
      {
        identityDocuments: { some: { replacedById: null, kind: 'KTP_FRONT', status: 'APPROVED' } },
      },
    ],
  };
  if (status === 'APPROVED') return approved;
  if (status === 'ACTION_REQUIRED')
    return { identityDocuments: { some: { replacedById: null, status: 'REJECTED' } } };
  return { NOT: approved };
}
