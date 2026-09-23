import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { hashPassword, normalizeEmail } from './credential-security';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { ApiProblem, newId } from './security';

type CustomerStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE';
type VerificationStatus = 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED';

function normalizePhone(value: string): string {
  const compact = value.replace(/[\s().-]/gu, '');
  const normalized = compact.startsWith('0') ? `+62${compact.slice(1)}` : compact;
  if (!/^\+[1-9]\d{7,14}$/u.test(normalized))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  return normalized;
}

@Injectable()
export class CustomerManagementService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    @Optional() private readonly idempotency?: IdempotencyService,
  ) {}

  private require(principal: SessionPrincipal, capability: string) {
    this.policy.requireCapability(principal.capabilities, capability);
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

    const where: Prisma.UserWhereInput = {
      role: { in: ['CUSTOMER', 'MEMBER'] },
      ...(filters.status ? { status: filters.status as any } : {}),
      ...(filters.preferredBranchId ? { preferredBranchId: filters.preferredBranchId } : {}),
      ...(q
        ? {
            OR: [
              { displayName: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
      ...(filters.cursor ? { id: { gt: filters.cursor } } : {}),
    };

    const users = await this.db.user.findMany({
      where,
      include: {
        profile: true,
        customerPackages: { where: { status: 'ACTIVE' } },
        _count: {
          select: {
            customerPackages: true,
            bookings: true,
            purchases: true,
          },
        },
      },
      orderBy: { id: 'asc' },
      take: 21,
    });

    const hasMore = users.length > 20;
    const page = users.slice(0, 20);

    return {
      items: page.map((u) => ({
        id: u.id,
        displayName: u.displayName,
        email: u.email,
        phoneE164: u.phone,
        status: u.status,
        preferredBranchId: u.preferredBranchId,
        verificationStatus: 'APPROVED' as const,
        activePackageCount: u.customerPackages.length,
        totalBookings: u._count.bookings,
        _count: {
          purchases: u._count.purchases,
          customerBookings: u._count.bookings,
        },
        profile: u.profile,
        createdAt: u.createdAt.toISOString(),
      })),
      summary: { total: users.length, active: users.length, inactive: 0 },
      page: { nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null, hasMore },
    };
  }

  async detail(principal: SessionPrincipal, id: string) {
    this.require(principal, 'customer:read');
    const customer = await this.db.user.findFirst({
      where: { id, role: { in: ['CUSTOMER', 'MEMBER'] } },
      include: {
        profile: true,
        customerPackages: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { package: true },
        },
        purchases: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { package: true, paymentProof: true, branch: true },
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            classSlot: {
              include: {
                classType: true,
                instructor: { select: { id: true, displayName: true } },
                branch: { select: { id: true, name: true } },
              },
            },
            attendance: true,
          },
        },
        _count: {
          select: {
            purchases: true,
            customerPackages: true,
            bookings: true,
          },
        },
      },
    });

    if (!customer) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const branch = customer.preferredBranchId
      ? await this.db.cabang.findUnique({
          where: { id: customer.preferredBranchId },
          select: { id: true, code: true, name: true },
        })
      : null;

    const identityDocuments = [];
    if (customer.profile?.ktpUrl) {
      identityDocuments.push({
        id: `doc-ktp-${customer.id}`,
        kind: 'KTP_FRONT',
        status: 'APPROVED',
        fileName: 'ktp.jpg',
        url: `/api/v1/identity-verifications/doc-ktp-${customer.id}/view-authorizations`,
        uploadedAt: customer.profile.updatedAt?.toISOString() ?? null,
        reviewedAt: customer.profile.updatedAt?.toISOString() ?? null,
      });
    }
    if (customer.profile?.selfieUrl) {
      identityDocuments.push({
        id: `doc-selfie-${customer.id}`,
        kind: 'SELFIE',
        status: 'APPROVED',
        fileName: 'selfie.jpg',
        url: `/api/v1/identity-verifications/doc-selfie-${customer.id}/view-authorizations`,
        uploadedAt: customer.profile.updatedAt?.toISOString() ?? null,
        reviewedAt: customer.profile.updatedAt?.toISOString() ?? null,
      });
    }

    const hasDocs = Boolean(customer.profile?.ktpUrl || customer.profile?.selfieUrl);
    const verificationStatus =
      customer.profile?.ktpUrl && customer.profile?.selfieUrl
        ? ('APPROVED' as const)
        : hasDocs
          ? ('PENDING' as const)
          : ('ACTION_REQUIRED' as const);

    return {
      id: customer.id,
      displayName: customer.displayName,
      email: customer.email,
      phoneE164: customer.phone,
      status: customer.status,
      stoppedAt: customer.stoppedAt?.toISOString() ?? null,
      isStopped: customer.stoppedAt !== null,
      version: 1,
      preferredBranch: branch,
      profile: customer.profile,
      verificationStatus,
      passwordCredential: { mustChangePassword: false },
      identities: [],
      identityDocuments,
      purchases: customer.purchases.map((p) => ({
        id: p.id,
        invoiceNumber: p.invoiceNumber,
        status: p.status,
        packageNameSnapshot: p.package.name,
        priceRpSnapshot: p.subtotalRp,
        payableAmountRpSnapshot: p.totalAmountRp,
        submittedAt: p.createdAt,
        decidedAt: p.paidAt,
        paymentMethod: p.paymentMethod,
        branchName: p.branch?.name ?? null,
        paymentProofUrl: p.paymentProof?.fileUrl ?? null,
      })),
      customerPackages: customer.customerPackages.map((cp) => ({
        id: cp.id,
        status: cp.status,
        sessionCountSnapshot: cp.totalSessions,
        remainingSessions: cp.remainingSessions,
        usedSessions: cp.usedSessions,
        activationDate: cp.validFrom,
        expiryAt: cp.validUntil,
        package: cp.package,
      })),
      customerBookings: customer.bookings.map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        status: b.status,
        classSlotId: b.classSlotId,
        createdAt: b.createdAt,
        cancelledAt: b.cancelledAt,
        classTypeName: b.classSlot?.classType?.name ?? 'Kelas Pilates',
        instructorName: b.classSlot?.instructor?.displayName ?? 'Instruktur',
        startAt: b.classSlot?.startAt,
        endAt: b.classSlot?.endAt,
        branchName: b.classSlot?.branch?.name ?? null,
        attendanceStatus: b.attendance ? 'HADIR' : b.status === 'CANCELLED' ? 'BATAL' : 'MENUNGGU',
        classSlot: b.classSlot,
      })),
      voucherRedemptions: [],
      notifications: [],
      _count: {
        purchases: customer._count.purchases,
        customerPackages: customer._count.customerPackages,
        customerBookings: customer._count.bookings,
        voucherRedemptions: 0,
        notifications: 0,
      },
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }

  async timeline(principal: SessionPrincipal, id: string, _cursor?: string) {
    this.require(principal, 'customer:read');
    return {
      items: [],
      page: { hasMore: false, nextCursor: null },
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
      reason?: string;
    },
    idempotencyKey: string,
    _stepUpToken: string,
    _correlationId: string,
  ) {
    this.require(principal, 'customer:credential:initialize');
    if (input.password !== input.passwordConfirmation)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const displayName = input.displayName?.trim();
    const email = normalizeEmail(input.email ?? '');
    const phoneE164 = normalizePhone(input.phoneE164 ?? '');

    if (!displayName || displayName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const passwordHash = await hashPassword(input.password);

    const action = async (tx: Prisma.TransactionClient) => {
      const existing = await tx.user.findFirst({
        where: { OR: [{ email }, { phone: phoneE164 }] },
      });
      if (existing) throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);

      const userId = newId();
      const user = await tx.user.create({
        data: {
          id: userId,
          displayName,
          email,
          phone: phoneE164,
          passwordHash,
          role: 'MEMBER',
          preferredBranchId: input.preferredBranchId ?? null,
          status: 'ACTIVE',
        },
      });

      if (input.profile) {
        await tx.profilPengguna.create({
          data: {
            id: newId(),
            userId,
            fullName: displayName,
            address: input.profile.address ?? null,
            gender: input.profile.genderCode ?? null,
            birthDate: input.profile.birthDate ? new Date(input.profile.birthDate) : null,
          },
        });
      }

      return {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        phoneE164: user.phone,
        status: user.status,
      };
    };

    if (!this.idempotency || !idempotencyKey) {
      return this.db.$transaction(action);
    }

    const result = await this.idempotency.execute(
      {
        scope: 'customer:create',
        key: idempotencyKey,
        payload: { email, phoneE164, displayName },
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async (tx) => {
        const body = await action(tx);
        return { status: HttpStatus.CREATED, body: body as unknown as Prisma.InputJsonValue };
      },
    );

    return result.body as any;
  }

  async updateProfile(
    principal: SessionPrincipal,
    id: string,
    input: {
      displayName: string;
      phoneE164?: string | null;
      preferredBranchId?: string | null;
      profile?: {
        address?: string | null;
        genderCode?: string | null;
        birthDate?: string | null;
      };
      expectedVersion?: number;
      reason?: string;
    },
    key: string,
    _stepUpToken?: string,
    _correlationId = 'unknown',
  ) {
    this.require(principal, 'customer:write');
    const displayName = input.displayName?.trim();
    if (!displayName || displayName.length < 2)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const phone = input.phoneE164?.trim() ? normalizePhone(input.phoneE164) : undefined;

    const action = async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

      const updated = await tx.user.update({
        where: { id },
        data: {
          displayName,
          ...(phone !== undefined ? { phone } : {}),
          ...(input.preferredBranchId !== undefined ? { preferredBranchId: input.preferredBranchId } : {}),
        },
      });

      if (input.profile) {
        await tx.profilPengguna.upsert({
          where: { userId: id },
          create: {
            id: newId(),
            userId: id,
            fullName: displayName,
            address: input.profile.address ?? null,
            gender: input.profile.genderCode ?? null,
            birthDate: input.profile.birthDate ? new Date(input.profile.birthDate) : null,
          },
          update: {
            fullName: displayName,
            address: input.profile.address ?? undefined,
            gender: input.profile.genderCode ?? undefined,
            birthDate: input.profile.birthDate ? new Date(input.profile.birthDate) : undefined,
          },
        });
      }

      return {
        id: updated.id,
        displayName: updated.displayName,
        email: updated.email,
        phoneE164: updated.phone,
        status: updated.status,
      };
    };

    if (!this.idempotency || !key) {
      return this.db.$transaction(action);
    }

    const result = await this.idempotency.execute(
      {
        scope: `customer:update:${id}`,
        key,
        payload: input,
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async (tx) => {
        const body = await action(tx);
        return { status: HttpStatus.OK, body: body as unknown as Prisma.InputJsonValue };
      },
    );

    return result.body as any;
  }

  async setStatus(
    principal: SessionPrincipal,
    id: string,
    activeOrInput: boolean | { status: CustomerStatus; reason?: string; expectedVersion?: number },
    bodyOrKey?: { expectedVersion?: number; reason?: string } | string,
    keyOrStepUp?: string,
    _stepUpToken?: string,
    _correlationId = 'unknown',
  ) {
    this.require(principal, 'customer:write');
    const isActive = typeof activeOrInput === 'boolean' ? activeOrInput : activeOrInput.status === 'ACTIVE';
    const key = typeof bodyOrKey === 'string' ? bodyOrKey : keyOrStepUp;

    const action = async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.update({
        where: { id },
        data: { status: isActive ? 'ACTIVE' : 'INACTIVE' },
      });
      return { id: user.id, status: user.status };
    };

    if (!this.idempotency || !key) {
      return this.db.$transaction(action);
    }

    const result = await this.idempotency.execute(
      {
        scope: `customer:status:${id}`,
        key,
        payload: { active: isActive },
        ttlMs: 86400000,
        leaseMs: 30000,
      },
      async (tx) => {
        const body = await action(tx);
        return { status: HttpStatus.OK, body: body as unknown as Prisma.InputJsonValue };
      },
    );

    return result.body as any;
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
    input: Parameters<CustomerManagementService['setStatus']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.setStatus(principal, id, input, key, correlationId);
  }

  async markStopped(
    principal: SessionPrincipal,
    id: string,
    _reason?: string,
  ) {
    this.require(principal, 'customer:write');
    const user = await this.db.user.findFirst({
      where: { id, role: { in: ['CUSTOMER', 'MEMBER'] } },
    });
    if (!user) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    if (
      user.preferredBranchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(user.preferredBranchId)
    ) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const updated = await this.db.user.update({
      where: { id },
      data: { stoppedAt: new Date() },
    });

    return {
      id: updated.id,
      stoppedAt: updated.stoppedAt?.toISOString() ?? null,
      isStopped: true,
      status: updated.status,
    };
  }

  async unmarkStopped(
    principal: SessionPrincipal,
    id: string,
  ) {
    this.require(principal, 'customer:write');
    const user = await this.db.user.findFirst({
      where: { id, role: { in: ['CUSTOMER', 'MEMBER'] } },
    });
    if (!user) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    if (
      user.preferredBranchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(user.preferredBranchId)
    ) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const updated = await this.db.user.update({
      where: { id },
      data: { stoppedAt: null },
    });

    return {
      id: updated.id,
      stoppedAt: null,
      isStopped: false,
      status: updated.status,
    };
  }
}
