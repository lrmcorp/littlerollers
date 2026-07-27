import { HttpStatus, Inject, Injectable, Optional } from '@nestjs/common';
import {
  type ApplicationRole,
  type AssignmentType,
  type IdentityDocumentKind,
  Prisma,
  type SessionChannel,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PRIVATE_FILE_STORAGE, type PrivateFileStorage } from './private-file-storage';
import {
  type IdentityDocumentUpload,
  validateIdentityDocumentUpload,
} from './identity-document-upload';
import {
  ConfigGatedGoogleProvider,
  ConfigGatedOtpProvider,
  ConfigGatedProofProvider,
} from './provider-adapters';
import { RateLimitService } from './rate-limit.service';
import { assertIsoDate, dateInTimeZone, startOfLocalDateUtc } from './assignment-boundary';
import { PolicyService } from './policy.service';
import { ResendPasswordEmailProvider } from './email-provider';
import {
  canonicalEmailHash,
  hashPassword,
  normalizeEmail,
  verifyPassword,
} from './credential-security';
import {
  ApiProblem,
  configurationRequired,
  digest,
  newId,
  opaqueToken,
  safeEqual,
  syntheticConfigSeconds,
} from './security';

export interface SessionPrincipal {
  sessionId: string;
  userId: string;
  roles: { role: ApplicationRole; branchId: string | null }[];
  capabilities: string[];
  branchIds: string[];
  sessionExpiresAt?: Date;
}

const IDENTITY_REJECTION_REASONS = new Set([
  'BLURRY',
  'GLARE',
  'CROPPED',
  'DOCUMENT_UNREADABLE',
  'FACE_MISMATCH',
  'WRONG_DOCUMENT',
  'OTHER_REQUIRES_NOTE',
]);

@Injectable()
export class IdentityService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly google: ConfigGatedGoogleProvider,
    private readonly otp: ConfigGatedOtpProvider,
    private readonly proof: ConfigGatedProofProvider,
    private readonly rateLimit: RateLimitService,
    private readonly passwordEmail: ResendPasswordEmailProvider,
    @Optional() private readonly idempotency?: IdempotencyService,
    @Inject(PRIVATE_FILE_STORAGE) @Optional() private readonly privateFiles?: PrivateFileStorage,
    @Optional() private readonly runtimeConfig?: RuntimeConfigService,
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

  private maskEmail(value: string | null | undefined) {
    if (!value) return null;
    const [local, domain] = value.split('@');
    if (!local || !domain) return null;
    return `${local.slice(0, 2)}${'*'.repeat(Math.max(2, local.length - 2))}@${domain}`;
  }

  private maskPhone(value: string | null | undefined) {
    if (!value) return null;
    return `${value.slice(0, Math.min(4, value.length))}${'*'.repeat(Math.max(2, value.length - 8))}${value.slice(-4)}`;
  }

  private identityStorage(): PrivateFileStorage {
    if (!this.privateFiles) configurationRequired();
    return this.privateFiles!;
  }

  private uploadLimit(): number {
    return this.runtimeConfig?.value.privateUploads.maxBytes ?? 8_000_000;
  }

  private safeOriginalName(value: string): string {
    return value.split(/[\\/]/u).at(-1)?.trim().slice(0, 160) || 'identity-document';
  }

  private documentView(document: {
    id: string;
    kind: IdentityDocumentKind;
    status: string;
    uploadStatus: string;
    scanStatus: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    rejectionReasonCode: string | null;
    rejectionNote: string | null;
    reviewedAt: Date | null;
    deletedAt: Date | null;
    version: number;
  }) {
    return {
      id: document.id,
      kind: document.kind,
      status: document.status,
      uploadStatus: document.uploadStatus,
      scanStatus: document.scanStatus,
      fileName: document.kind === 'SELFIE' ? 'selfie' : 'ktp-front',
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      rejectionReasonCode: document.rejectionReasonCode,
      rejectionNote: document.rejectionNote,
      reviewedAt: document.reviewedAt?.toISOString() ?? null,
      deletedAt: document.deletedAt?.toISOString() ?? null,
      version: document.version,
    };
  }

  async verificationStatus(userId: string) {
    const documents = await this.db.identityVerificationDocument.findMany({
      where: { userId, replacedById: null },
      orderBy: [{ kind: 'asc' }, { createdAt: 'desc' }],
    });
    const current = [...new Map(documents.map((item) => [item.kind, item])).values()];
    return {
      status: ['SELFIE', 'KTP_FRONT'].every((kind) =>
        current.some((item) => item.kind === kind && item.status === 'APPROVED'),
      )
        ? 'APPROVED'
        : current.some((item) => item.status === 'REJECTED')
          ? 'ACTION_REQUIRED'
          : 'PENDING',
      documents: current.map((item) => this.documentView(item)),
    };
  }

  async requireCustomerVerification(userId: string) {
    const customer = await this.db.userRole.findFirst({
      where: { userId, role: 'CUSTOMER', ...this.activeRoleWhere() },
    });
    if (!customer) return;
    const status = await this.verificationStatus(userId);
    if (status.status !== 'APPROVED')
      throw new ApiProblem('IDENTITY_VERIFICATION_REQUIRED', HttpStatus.FORBIDDEN);
  }

  async me(userId: string, at = new Date()) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        roles: { where: this.activeRoleWhere(at) },
        preferredBranch: {
          select: {
            id: true,
            code: true,
            name: true,
            timezone: true,
            supportWhatsappE164: true,
            active: true,
          },
        },
      },
    });
    if (!user || user.status !== 'ACTIVE')
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    return {
      id: user.id,
      displayName: user.displayName,
      roles: [...new Set(user.roles.map(({ role }) => role))],
      branchIds: this.policy.branches(user.roles),
      capabilities: this.policy.capabilities(user.roles),
      preferredBranch: user.preferredBranch?.active ? user.preferredBranch : null,
    };
  }

  private async sessionMe(userId: string, sessionExpiresAt: Date, at = new Date()) {
    const projection = await this.me(userId, at);
    const branchScope = projection.capabilities.includes('branch:all')
      ? undefined
      : { in: projection.branchIds };
    const branches = await this.db.branch.findMany({
      where: { active: true, ...(branchScope ? { id: branchScope } : {}) },
      orderBy: [{ code: 'asc' }, { id: 'asc' }],
      select: { id: true, code: true, name: true, timezone: true },
    });
    const verification = projection.roles.includes('CUSTOMER')
      ? await this.verificationStatus(userId)
      : { status: 'NOT_REQUIRED', documents: [] };
    return {
      ...projection,
      identityVerificationStatus: verification.status,
      sessionExpiresAt: sessionExpiresAt.toISOString(),
      branches,
    };
  }

  meForSession(principal: SessionPrincipal, at = new Date()) {
    if (!principal.sessionExpiresAt)
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    return this.sessionMe(principal.userId, principal.sessionExpiresAt, at);
  }

  async authenticateGoogle(
    input: { idToken: string; nonce: string; channel: SessionChannel },
    correlationId: string,
  ) {
    const verified = await this.google.verify(input.idToken, input.nonce);
    const user = await this.db.$transaction(async (tx) => {
      const existing = await tx.identity.findUnique({
        where: {
          provider_subjectHash: { provider: verified.provider, subjectHash: verified.subjectHash },
        },
        include: { user: true },
      });
      if (existing) {
        if (existing.user.status !== 'ACTIVE')
          throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
        return existing.user;
      }
      const invitation = await tx.userInvitation.findFirst({
        where: {
          identityProvider: verified.provider,
          status: 'PENDING',
          expiresAt: { gt: new Date() },
          OR: [
            ...(verified.emailHash ? [{ emailHash: verified.emailHash }] : []),
            { subjectHash: verified.subjectHash },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
      if (!invitation) throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
      if (invitation.userId) {
        const pending = await tx.user.findUnique({ where: { id: invitation.userId } });
        if (!pending || pending.status !== 'PENDING_ACTIVATION')
          throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
        await tx.identity.create({
          data: {
            id: newId(),
            userId: pending.id,
            provider: verified.provider,
            subjectHash: verified.subjectHash,
            verifiedAt: new Date(),
          },
        });
        await tx.user.update({
          where: { id: pending.id },
          data: { status: 'ACTIVE', version: { increment: 1 } },
        });
        await tx.userInvitation.update({
          where: { id: invitation.id },
          data: { status: 'ACCEPTED', acceptedAt: new Date() },
        });
        return pending;
      }
      const created = await tx.user.create({
        data: { id: newId(), displayName: invitation.displayName ?? 'Invited internal user' },
      });
      await tx.identity.create({
        data: {
          id: newId(),
          userId: created.id,
          provider: verified.provider,
          subjectHash: verified.subjectHash,
          verifiedAt: new Date(),
        },
      });
      const roles = invitation.roles as ApplicationRole[];
      const branchIds = invitation.branchIds as string[];
      for (const role of roles) {
        const scopedBranches = this.roleBranches(role, branchIds);
        for (const branchId of scopedBranches)
          await tx.userRole.create({
            data: { userId: created.id, role, branchId, activeFrom: new Date() },
          });
      }
      await tx.userInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      });
      return created;
    });
    const session = await this.issueSession(user.id, input.channel);
    await this.audit(this.db, {
      actorId: user.id,
      action: 'security.login_succeeded',
      objectType: 'UserSession',
      objectId: user.id,
      correlationId,
      after: { provider: 'GOOGLE', channel: input.channel },
    });
    return session;
  }

  async requestOtp(
    phoneE164: string,
    correlationId = 'unknown',
  ): Promise<{ requestId: string; expiresAt: string }> {
    const subjectHash = digest(phoneE164);
    await this.rateLimit.consume('OTP_REQUEST', subjectHash);
    const { proofHash } = await this.otp.send(phoneE164);
    const ttl = syntheticConfigSeconds('AUTH_OTP_TTL_SECONDS', 300);
    const maxAttempts = syntheticConfigSeconds('AUTH_OTP_MAX_ATTEMPTS', 5);
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const challenge = await this.db.authChallenge.create({
      data: {
        kind: 'OTP',
        purpose: 'SIGN_IN',
        subjectHash,
        proofHash,
        maxAttempts,
        expiresAt,
      },
    });
    await this.audit(this.db, {
      action: 'security.otp_requested',
      objectType: 'AuthChallenge',
      objectId: challenge.id,
      correlationId,
      after: { kind: 'OTP' },
    });
    return { requestId: challenge.id, expiresAt: expiresAt.toISOString() };
  }

  async verifyOtp(
    requestId: string,
    code: string,
    channel: SessionChannel = 'MOBILE',
    correlationId = 'unknown',
  ) {
    const challenge = await this.db.authChallenge.findUnique({ where: { id: requestId } });
    if (!challenge || challenge.kind !== 'OTP' || challenge.status !== 'PENDING')
      throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);
    if (challenge.expiresAt <= new Date()) {
      await this.db.authChallenge.update({ where: { id: requestId }, data: { status: 'EXPIRED' } });
      throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);
    }
    if (!safeEqual(challenge.proofHash, digest(`${challenge.subjectHash}:${code}`))) {
      const attempts = challenge.attempts + 1;
      await this.db.authChallenge.update({
        where: { id: requestId },
        data: { attempts, status: attempts >= challenge.maxAttempts ? 'LOCKED' : 'PENDING' },
      });
      throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
    }
    const identity = await this.db.identity.findUnique({
      where: {
        provider_subjectHash: { provider: 'WHATSAPP_PHONE', subjectHash: challenge.subjectHash },
      },
    });
    if (!identity) throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
    const claimed = await this.db.authChallenge.updateMany({
      where: { id: requestId, status: 'PENDING' },
      data: { status: 'VERIFIED', verifiedAt: new Date(), userId: identity.userId },
    });
    if (claimed.count !== 1) throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);
    const session = await this.issueSession(identity.userId, channel);
    await this.audit(this.db, {
      actorId: identity.userId,
      action: 'security.otp_verified',
      objectType: 'AuthChallenge',
      objectId: requestId,
      correlationId,
      after: { channel },
    });
    return session;
  }

  async issueSession(userId: string, channel: SessionChannel, existingFamilyHash?: string) {
    const accessTtl = syntheticConfigSeconds('AUTH_ACCESS_TTL_SECONDS', 900);
    const refreshTtl = syntheticConfigSeconds('AUTH_REFRESH_TTL_SECONDS', 2_592_000);
    const accessToken = opaqueToken();
    const refreshToken = opaqueToken();
    const familyHash = existingFamilyHash ?? digest(opaqueToken());
    const expiresAt = new Date(Date.now() + accessTtl * 1000);
    const refreshExpiresAt = new Date(Date.now() + refreshTtl * 1000);
    await this.db.userSession.create({
      data: {
        userId,
        channel,
        tokenFamilyHash: familyHash,
        accessTokenHash: digest(accessToken),
        refreshTokenHash: digest(refreshToken),
        expiresAt,
        refreshExpiresAt,
      },
    });
    return {
      accessToken: channel === 'MOBILE' ? accessToken : null,
      refreshToken: channel === 'MOBILE' ? refreshToken : null,
      user: await this.sessionMe(userId, expiresAt),
      channel,
      expiresAt: expiresAt.toISOString(),
      refreshExpiresAt: refreshExpiresAt.toISOString(),
      webCookieToken: channel === 'WEB' ? accessToken : null,
      webRefreshToken: channel === 'WEB' ? refreshToken : null,
    };
  }

  async refresh(rawRefreshToken: string, correlationId = 'unknown') {
    const session = await this.db.userSession.findUnique({
      where: { refreshTokenHash: digest(rawRefreshToken) },
      include: { user: true },
    });
    if (!session || session.refreshExpiresAt === null || session.refreshExpiresAt <= new Date())
      throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
    if (session.revokedAt) {
      await this.db.userSession.updateMany({
        where: { tokenFamilyHash: session.tokenFamilyHash, revokedAt: null },
        data: { revokedAt: new Date(), revocationReason: 'REFRESH_REUSE_DETECTED' },
      });
      await this.audit(this.db, {
        actorId: session.userId,
        action: 'security.refresh_reuse_detected',
        objectType: 'UserSession',
        objectId: session.id,
        correlationId,
        after: { familyRevoked: true },
      });
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    }
    if (session.user.status !== 'ACTIVE')
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    const claimed = await this.db.userSession.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date(), revocationReason: 'ROTATED', rotatedAt: new Date() },
    });
    if (claimed.count !== 1) {
      await this.db.userSession.updateMany({
        where: { tokenFamilyHash: session.tokenFamilyHash, revokedAt: null },
        data: { revokedAt: new Date(), revocationReason: 'REFRESH_REUSE_DETECTED' },
      });
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    }
    return this.issueSession(session.userId, session.channel, session.tokenFamilyHash);
  }

  async authenticateBearer(raw: string): Promise<SessionPrincipal> {
    const session = await this.db.userSession.findUnique({
      where: { accessTokenHash: digest(raw) },
      include: { user: { include: { roles: { where: this.activeRoleWhere() } } } },
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.status !== 'ACTIVE'
    )
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    return {
      sessionId: session.id,
      userId: session.userId,
      roles: session.user.roles,
      capabilities: this.policy.capabilities(session.user.roles),
      branchIds: this.policy.branches(session.user.roles),
      sessionExpiresAt: session.expiresAt,
    };
  }

  async logout(sessionId: string, correlationId = 'unknown'): Promise<void> {
    await this.db.userSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date(), revocationReason: 'LOGOUT' },
    });
    await this.audit(this.db, {
      action: 'security.logout',
      objectType: 'UserSession',
      objectId: sessionId,
      correlationId,
    });
  }

  async revokeAll(
    userId: string,
    reason: string,
    exceptSessionId?: string,
    correlationId = 'unknown',
  ): Promise<void> {
    await this.db.userSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date(), revocationReason: reason.slice(0, 300) },
    });
    await this.audit(this.db, {
      actorId: userId,
      action: 'security.sessions_revoked',
      objectType: 'User',
      objectId: userId,
      correlationId,
      after: { reasonPresent: Boolean(reason), exceptCurrent: Boolean(exceptSessionId) },
    });
  }

  roleCatalog(principal: SessionPrincipal) {
    this.policy.requireCapability(principal.capabilities, 'user:read');
    return { items: this.policy.roleCatalog() };
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

  async authenticatePassword(
    input: { email: string; password: string; channel: SessionChannel },
    correlationId = 'unknown',
    requestFingerprint = 'unknown',
  ) {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();
    const emailHash = canonicalEmailHash(input.email);
    await Promise.all([
      this.rateLimit.consume('PASSWORD_LOGIN_SUBJECT', emailHash, 5, 900),
      this.rateLimit.consume('PASSWORD_LOGIN_ORIGIN', digest(requestFingerprint), 50, 900),
    ]);
    const credential = await this.db.passwordCredential.findUnique({
      where: { emailHash },
      include: { user: true },
    });
    const valid = credential
      ? await verifyPassword(credential.passwordHash, input.password)
      : await verifyPassword(
          '$argon2id$v=19$m=65536,t=3,p=1$OQ7j5B/1n5Tt6+Ww8bi6Iw$FDfbEPDKqHJFt1NDZll1WrMu46qpFcQteLeQSGho8Es',
          input.password,
        );
    if (!credential || !valid || credential.user.status !== 'ACTIVE')
      throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
    const session = await this.issueSession(credential.userId, input.channel);
    await this.audit(this.db, {
      actorId: credential.userId,
      action: 'security.login_succeeded',
      objectType: 'UserSession',
      objectId: credential.userId,
      correlationId,
      after: { provider: 'EMAIL_PASSWORD', channel: input.channel },
    });
    return session;
  }

  async activatePassword(token: string, password: string, correlationId = 'unknown') {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();
    const action = await this.db.passwordActionToken.findUnique({
      where: { tokenHash: digest(token) },
      include: { invitation: true, user: true },
    });
    if (
      !action ||
      !['ACTIVATION', 'SETUP'].includes(action.kind) ||
      action.consumedAt ||
      action.expiresAt <= new Date()
    )
      throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);
    const passwordHash = await hashPassword(password);
    const userId = await this.db.$transaction(async (tx) => {
      const claimed = await tx.passwordActionToken.updateMany({
        where: { id: action.id, consumedAt: null, expiresAt: { gt: new Date() } },
        data: { consumedAt: new Date() },
      });
      if (claimed.count !== 1) throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);
      let targetUserId = action.userId;
      if (!targetUserId) {
        const invitation = action.invitation;
        if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt <= new Date())
          throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);
        const user = await tx.user.create({
          data: {
            id: newId(),
            displayName: invitation.displayName ?? 'Invited internal user',
          },
        });
        targetUserId = user.id;
        for (const role of invitation.roles as ApplicationRole[]) {
          const scopedBranches = this.roleBranches(role, invitation.branchIds as string[]);
          for (const branchId of scopedBranches)
            await tx.userRole.create({
              data: { userId: user.id, role, branchId, activeFrom: new Date() },
            });
        }
        await tx.userInvitation.update({
          where: { id: invitation.id },
          data: { status: 'ACCEPTED', acceptedAt: new Date() },
        });
      } else if (action.invitationId) {
        const invitation = action.invitation;
        if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt <= new Date())
          throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);
        await tx.userInvitation.update({
          where: { id: invitation.id },
          data: { status: 'ACCEPTED', acceptedAt: new Date() },
        });
      }
      await tx.passwordCredential.create({
        data: {
          userId: targetUserId,
          emailHash: action.emailHash,
          passwordHash,
          verifiedAt: new Date(),
          passwordChangedAt: new Date(),
        },
      });
      await tx.identity.create({
        data: {
          id: newId(),
          userId: targetUserId,
          provider: 'EMAIL_PASSWORD',
          subjectHash: action.emailHash,
          verifiedAt: new Date(),
        },
      });
      await tx.user.updateMany({
        where: { id: targetUserId, status: 'PENDING_ACTIVATION' },
        data: { status: 'ACTIVE', version: { increment: 1 } },
      });
      await this.audit(tx, {
        actorId: targetUserId,
        action: 'security.password_activated',
        objectType: 'User',
        objectId: targetUserId,
        targetUserId,
        correlationId,
        after: { provider: 'EMAIL_PASSWORD' },
      });
      return targetUserId;
    });
    return this.issueSession(userId, 'WEB');
  }

  async requestPasswordReset(
    email: string,
    correlationId = 'unknown',
    requestFingerprint = 'unknown',
  ) {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();
    this.passwordEmail.assertConfigured();
    const normalized = normalizeEmail(email);
    const emailHash = canonicalEmailHash(normalized);
    await Promise.all([
      this.rateLimit.consume('PASSWORD_RESET_SUBJECT', emailHash, 5, 900),
      this.rateLimit.consume('PASSWORD_RESET_ORIGIN', digest(requestFingerprint), 30, 900),
    ]);
    const credential = await this.db.passwordCredential.findUnique({ where: { emailHash } });
    if (credential)
      try {
        await this.sendPasswordAction('RESET', normalized, {
          emailHash,
          userId: credential.userId,
        });
      } catch {
        // The public response remains generic to avoid disclosing account existence.
      }
    await this.audit(this.db, {
      action: 'security.password_reset_requested',
      objectType: 'PasswordActionToken',
      objectId: digest(`${emailHash}:${correlationId}`),
      correlationId,
      after: { accepted: true },
    });
    return { status: 'ACCEPTED' as const };
  }

  async resetPassword(token: string, password: string, correlationId = 'unknown') {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();
    const action = await this.db.passwordActionToken.findUnique({
      where: { tokenHash: digest(token) },
    });
    if (
      !action ||
      action.kind !== 'RESET' ||
      !action.userId ||
      action.consumedAt ||
      action.expiresAt <= new Date()
    )
      throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);
    const passwordHash = await hashPassword(password);
    await this.db.$transaction(async (tx) => {
      const claimed = await tx.passwordActionToken.updateMany({
        where: { id: action.id, consumedAt: null, expiresAt: { gt: new Date() } },
        data: { consumedAt: new Date() },
      });
      if (claimed.count !== 1) throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);
      await tx.passwordCredential.update({
        where: { userId: action.userId! },
        data: { passwordHash, passwordChangedAt: new Date(), version: { increment: 1 } },
      });
      await tx.userSession.updateMany({
        where: { userId: action.userId!, revokedAt: null },
        data: { revokedAt: new Date(), revocationReason: 'PASSWORD_RESET' },
      });
      await this.audit(tx, {
        actorId: action.userId!,
        action: 'security.password_reset',
        objectType: 'User',
        objectId: action.userId!,
        correlationId,
        after: { sessionsRevoked: true },
      });
    });
    return { status: 'CHANGED' as const };
  }

  async changePassword(
    principal: SessionPrincipal,
    currentPassword: string,
    nextPassword: string,
    correlationId = 'unknown',
  ) {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();
    const credential = await this.db.passwordCredential.findUnique({
      where: { userId: principal.userId },
    });
    if (!credential || !(await verifyPassword(credential.passwordHash, currentPassword)))
      throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
    const passwordHash = await hashPassword(nextPassword);
    await this.db.$transaction(async (tx) => {
      await tx.passwordCredential.update({
        where: { userId: principal.userId },
        data: { passwordHash, passwordChangedAt: new Date(), version: { increment: 1 } },
      });
      await tx.userSession.updateMany({
        where: { userId: principal.userId, id: { not: principal.sessionId }, revokedAt: null },
        data: { revokedAt: new Date(), revocationReason: 'PASSWORD_CHANGED' },
      });
      await this.audit(tx, {
        actorId: principal.userId,
        action: 'security.password_changed',
        objectType: 'User',
        objectId: principal.userId,
        correlationId,
        after: { otherSessionsRevoked: true },
      });
    });
    return { status: 'CHANGED' as const };
  }

  async requestPasswordSetup(
    principal: SessionPrincipal,
    targetId: string,
    input: { email: string; reason: string },
    correlationId = 'unknown',
  ) {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    if (!input.reason.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const target = await this.db.user.findUnique({
      where: { id: targetId },
      include: { passwordCredential: true },
    });
    if (!target || target.status !== 'ACTIVE')
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (target.passwordCredential) throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
    const normalized = normalizeEmail(input.email);
    const emailHash = canonicalEmailHash(normalized);
    const conflict = await this.db.passwordCredential.findUnique({ where: { emailHash } });
    if (conflict) throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
    const result = await this.sendPasswordAction('SETUP', normalized, {
      emailHash,
      userId: targetId,
    });
    await this.audit(this.db, {
      actorId: principal.userId,
      action: 'security.password_setup_requested',
      objectType: 'User',
      objectId: targetId,
      correlationId,
      after: { reasonPresent: true },
    });
    return result;
  }

  async passwordSecurityStatus(principal: SessionPrincipal) {
    const password = await this.db.passwordCredential.findUnique({
      where: { userId: principal.userId },
    });
    return {
      passwordEnabled: Boolean(password),
      passwordChangedAt: password?.passwordChangedAt.toISOString() ?? null,
    };
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

  async requestRecovery(
    identifier: string,
    requestedChannel: 'WHATSAPP' | 'GOOGLE' | 'SUPPORT',
    correlationId = 'unknown',
  ) {
    const normalized = identifier.trim().toLowerCase();
    const subjectHash =
      requestedChannel === 'GOOGLE' ? digest(`google:${normalized}`) : digest(normalized);
    await this.rateLimit.consume('RECOVERY_REQUEST', subjectHash);
    const identity = await this.db.identity.findFirst({ where: { subjectHash } });
    const expiresAt = new Date(
      Date.now() + syntheticConfigSeconds('AUTH_RECOVERY_TTL_SECONDS', 900) * 1000,
    );
    const challenge = await this.db.authChallenge.create({
      data: {
        userId: identity?.userId,
        kind: 'RECOVERY',
        purpose: 'RECOVERY',
        subjectHash,
        proofHash: this.proof.proofHash('RECOVERY', subjectHash),
        maxAttempts: 5,
        expiresAt,
      },
    });
    await this.audit(this.db, {
      action: 'security.recovery_requested',
      objectType: 'AuthChallenge',
      objectId: challenge.id,
      correlationId,
      after: { requestedChannel },
    });
    return { requestId: challenge.id, expiresAt: expiresAt.toISOString() };
  }

  async verifyRecovery(id: string, proof: string, correlationId = 'unknown') {
    const challenge = await this.db.authChallenge.findUnique({ where: { id } });
    if (
      !challenge ||
      challenge.kind !== 'RECOVERY' ||
      challenge.status !== 'PENDING' ||
      challenge.expiresAt <= new Date()
    )
      throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);
    if (!challenge.userId || !this.proof.verify('RECOVERY', challenge.subjectHash, proof)) {
      const attempts = challenge.attempts + 1;
      await this.db.authChallenge.update({
        where: { id },
        data: { attempts, status: attempts >= challenge.maxAttempts ? 'LOCKED' : 'PENDING' },
      });
      throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
    }
    await this.db.$transaction(async (tx) => {
      const claimed = await tx.authChallenge.updateMany({
        where: { id, status: 'PENDING' },
        data: { status: 'VERIFIED', verifiedAt: new Date() },
      });
      if (claimed.count !== 1) throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);
      await tx.userSession.updateMany({
        where: { userId: challenge.userId!, revokedAt: null },
        data: { revokedAt: new Date(), revocationReason: 'ACCOUNT_RECOVERY' },
      });
      await this.audit(tx, {
        actorId: challenge.userId!,
        action: 'security.recovery_verified',
        objectType: 'AuthChallenge',
        objectId: id,
        correlationId,
        after: { sessionsRevoked: true },
      });
    });
    return this.issueSession(challenge.userId, 'MOBILE');
  }

  async linkIdentity(
    principal: SessionPrincipal,
    input: {
      provider: 'GOOGLE' | 'WHATSAPP_PHONE';
      verifiedProviderToken: string;
      expectedUserId?: string;
    },
    correlationId: string,
  ) {
    if (input.expectedUserId && input.expectedUserId !== principal.userId)
      throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
    let subjectHash: string;
    if (input.provider === 'GOOGLE')
      subjectHash = (await this.google.verify(input.verifiedProviderToken, 'synthetic-link'))
        .subjectHash;
    else {
      const challenge = await this.db.authChallenge.findUnique({
        where: { id: input.verifiedProviderToken },
      });
      if (
        !challenge ||
        challenge.kind !== 'OTP' ||
        challenge.status !== 'VERIFIED' ||
        challenge.userId !== principal.userId
      )
        throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
      subjectHash = challenge.subjectHash;
    }
    const existing = await this.db.identity.findUnique({
      where: { provider_subjectHash: { provider: input.provider, subjectHash } },
    });
    if (existing?.userId === principal.userId) return { id: existing.id, status: 'LINKED' };
    if (existing) throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
    try {
      const identity = await this.db.$transaction(async (tx) => {
        const created = await tx.identity.create({
          data: {
            id: newId(),
            userId: principal.userId,
            provider: input.provider,
            subjectHash,
            verifiedAt: new Date(),
          },
        });
        await this.audit(tx, {
          actorId: principal.userId,
          action: 'security.identity_linked',
          objectType: 'Identity',
          objectId: created.id,
          correlationId,
          after: { provider: input.provider },
        });
        return created;
      });
      return { id: identity.id, status: 'LINKED' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
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

  async listAssignments(principal: SessionPrincipal, branchId?: string) {
    this.policy.requireCapability(principal.capabilities, 'assignment:read');
    if (
      branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const assignments = await this.db.assignment.findMany({
      where: branchId
        ? { branchId }
        : principal.capabilities.includes('branch:all')
          ? undefined
          : { branchId: { in: principal.branchIds } },
      orderBy: [{ activeFrom: 'desc' }, { id: 'asc' }],
      take: 50,
    });
    return {
      items: assignments.map((assignment) => this.assignmentView(assignment)),
      page: { nextCursor: null, hasMore: false },
    };
  }

  async createAssignment(
    principal: SessionPrincipal,
    input: {
      userId: string;
      branchId: string;
      assignmentType: AssignmentType;
      activeFrom: string;
      activeUntil?: string | null;
      reason: string;
    },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'assignment:manage');
    if (
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(input.branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (!['OWNER', 'INSTRUCTOR'].includes(input.assignmentType))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (input.userId === principal.userId)
      throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.CONFLICT);
    const activeFrom = assertIsoDate(input.activeFrom);
    const activeUntil = input.activeUntil ? assertIsoDate(input.activeUntil) : null;
    if (activeUntil && activeUntil <= activeFrom)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    try {
      return await this.db.$transaction(
        async (tx) => {
          await tx.$queryRaw`
            SELECT \`id\`
            FROM \`User\`
            WHERE \`id\` = ${input.userId}
            FOR UPDATE
          `;
          const [user, branch] = await Promise.all([
            tx.user.findUnique({ where: { id: input.userId } }),
            tx.branch.findUnique({ where: { id: input.branchId } }),
          ]);
          if (!user || user.status !== 'ACTIVE' || !branch || !branch.active)
            throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
          const overlap = await tx.assignment.findFirst({
            where: {
              userId: input.userId,
              branchId: input.branchId,
              type: input.assignmentType,
              activeFrom: activeUntil ? { lt: new Date(`${activeUntil}T00:00:00Z`) } : undefined,
              OR: [
                { activeUntil: null },
                { activeUntil: { gt: new Date(`${activeFrom}T00:00:00Z`) } },
              ],
            },
          });
          if (overlap) throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);
          const id = newId();
          const assignment = await tx.assignment.create({
            data: {
              id,
              userId: input.userId,
              branchId: input.branchId,
              type: input.assignmentType,
              activeFrom: new Date(`${activeFrom}T00:00:00Z`),
              activeUntil: activeUntil ? new Date(`${activeUntil}T00:00:00Z`) : null,
            },
          });
          await tx.userRole.create({
            data: {
              userId: input.userId,
              role: input.assignmentType,
              branchId: input.branchId,
              activeFrom: startOfLocalDateUtc(activeFrom, branch.timezone),
              activeUntil: activeUntil ? startOfLocalDateUtc(activeUntil, branch.timezone) : null,
              sourceAssignmentId: id,
            },
          });
          await this.audit(tx, {
            actorId: principal.userId,
            action: 'master.assignment_created',
            objectType: 'Assignment',
            objectId: id,
            targetUserId: input.userId,
            branchId: input.branchId,
            correlationId,
            after: {
              assignmentType: input.assignmentType,
              activeFrom,
              activeUntil,
              reasonPresent: Boolean(input.reason),
              version: 0,
            },
          });
          return { id: assignment.id, status: 'ACTIVE', version: assignment.version };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (this.isAssignmentConflict(error))
        throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async endAssignment(
    principal: SessionPrincipal,
    assignmentId: string,
    input: { effectiveAt: string; reason: string; expectedVersion: number },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'assignment:manage');
    if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 0)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const effectiveInstant = new Date(input.effectiveAt);
    if (Number.isNaN(effectiveInstant.getTime()))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    try {
      return await this.db.$transaction(
        async (tx) => {
          const assignment = await tx.assignment.findUnique({
            where: { id: assignmentId },
            include: { branch: true, projectedRole: true },
          });
          if (!assignment) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
          if (
            !principal.capabilities.includes('branch:all') &&
            !principal.branchIds.includes(assignment.branchId)
          )
            throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
          const effectiveDate = dateInTimeZone(effectiveInstant, assignment.branch.timezone);
          const from = assignment.activeFrom.toISOString().slice(0, 10);
          if (effectiveDate <= from)
            throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
          if (assignment.activeUntil || assignment.version !== input.expectedVersion)
            throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
          const updated = await tx.assignment.updateMany({
            where: { id: assignment.id, version: input.expectedVersion, activeUntil: null },
            data: {
              activeUntil: new Date(`${effectiveDate}T00:00:00Z`),
              version: { increment: 1 },
            },
          });
          if (updated.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
          if (!assignment.projectedRole)
            throw new ApiProblem('ASSIGNMENT_PROJECTION_MISSING', HttpStatus.CONFLICT);
          await tx.userRole.update({
            where: { sourceAssignmentId: assignment.id },
            data: { activeUntil: startOfLocalDateUtc(effectiveDate, assignment.branch.timezone) },
          });
          await this.audit(tx, {
            actorId: principal.userId,
            action: 'master.assignment_ended',
            objectType: 'Assignment',
            objectId: assignment.id,
            targetUserId: assignment.userId,
            branchId: assignment.branchId,
            correlationId,
            before: { activeUntil: null, version: assignment.version },
            after: {
              activeUntil: effectiveDate,
              version: assignment.version + 1,
              reasonPresent: Boolean(input.reason),
            },
          });
          return { id: assignment.id, status: 'ENDED', version: assignment.version + 1 };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (this.isSerializationConflict(error))
        throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async registerCustomer(
    input: {
      displayName: string;
      phone: string;
      email: string;
      password: string;
      consent: boolean;
      selfie: IdentityDocumentUpload;
      ktp: IdentityDocumentUpload;
    },
    correlationId: string,
    requestFingerprint: string,
  ) {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();
    const displayName = input.displayName?.trim();
    const email = normalizeEmail(input.email);
    const emailHash = canonicalEmailHash(email);
    const phoneE164 = this.normalizePhone(input.phone);
    if (!input.consent || !displayName || displayName.length > 160)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const selfie = validateIdentityDocumentUpload(input.selfie, this.uploadLimit());
    const ktp = validateIdentityDocumentUpload(input.ktp, this.uploadLimit());
    await Promise.all([
      this.rateLimit.consume('CUSTOMER_REGISTER_SUBJECT', emailHash, 3, 3600),
      this.rateLimit.consume('CUSTOMER_REGISTER_ORIGIN', digest(requestFingerprint), 20, 3600),
    ]);
    const passwordHash = await hashPassword(input.password);
    const userId = newId();
    const prepared = [
      { id: newId(), kind: 'SELFIE' as const, document: selfie },
      { id: newId(), kind: 'KTP_FRONT' as const, document: ktp },
    ].map((item) => ({
      ...item,
      objectKey: `identity/${userId}/${item.kind.toLowerCase()}/${item.id}`,
    }));
    const storedKeys: string[] = [];
    let committed = false;
    try {
      for (const item of prepared) {
        await this.identityStorage().put({ key: item.objectKey, content: item.document.buffer });
        storedKeys.push(item.objectKey);
      }
      await this.db.$transaction(async (tx) => {
        const user = await tx.user.create({ data: { id: userId, displayName, email, phoneE164 } });
        await tx.userRole.create({
          data: { userId: user.id, role: 'CUSTOMER', branchId: null, activeFrom: new Date() },
        });
        await tx.passwordCredential.create({
          data: {
            userId: user.id,
            emailHash,
            passwordHash,
            verifiedAt: new Date(),
            passwordChangedAt: new Date(),
          },
        });
        await tx.identity.create({
          data: {
            id: newId(),
            userId: user.id,
            provider: 'EMAIL_PASSWORD',
            subjectHash: emailHash,
            verifiedAt: new Date(),
          },
        });
        for (const { id, kind, document, objectKey } of prepared) {
          await tx.identityVerificationDocument.create({
            data: {
              id,
              userId: user.id,
              kind,
              objectKey,
              checksum: document.checksum,
              fileName: this.safeOriginalName(document.originalName),
              mimeType: document.mimeType,
              sizeBytes: document.sizeBytes,
              uploadStatus: 'FINALIZED',
              scanStatus: 'CLEAN',
              providerReferenceHash: digest(objectKey),
              uploadedAt: new Date(),
              finalizedAt: new Date(),
            },
          });
        }
        await this.audit(tx, {
          actorId: user.id,
          action: 'security.customer_registered',
          objectType: 'User',
          objectId: user.id,
          correlationId,
          after: { role: 'CUSTOMER', documentKinds: ['SELFIE', 'KTP_FRONT'], consent: true },
        });
      });
      committed = true;
    } catch (error) {
      if (!committed)
        await Promise.allSettled(storedKeys.map((key) => this.identityStorage().delete(key)));
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
        throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
    return this.issueSession(userId, 'WEB');
  }

  async myVerification(principal: SessionPrincipal) {
    return this.verificationStatus(principal.userId);
  }

  async myProfile(principal: SessionPrincipal) {
    const user = await this.db.user.findUnique({
      where: { id: principal.userId },
      include: {
        preferredBranch: {
          select: {
            id: true,
            code: true,
            name: true,
            timezone: true,
            supportWhatsappE164: true,
            active: true,
          },
        },
      },
    });
    if (!user || user.status !== 'ACTIVE')
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    const preferredBranch = user.preferredBranch?.active ? user.preferredBranch : null;
    return {
      id: user.id,
      displayName: user.displayName,
      emailMasked: this.maskEmail(user.email),
      phoneMasked: this.maskPhone(user.phoneE164),
      preferredBranch,
      version: user.version,
    };
  }

  async updateMyProfile(
    principal: SessionPrincipal,
    input: { displayName: string; preferredBranchId?: string | null; expectedVersion: number },
    correlationId: string,
  ) {
    const displayName = input.displayName?.trim();
    if (
      !displayName ||
      displayName.length < 2 ||
      displayName.length > 160 ||
      !Number.isInteger(input.expectedVersion)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const isCustomer = principal.roles.some(({ role }) => role === 'CUSTOMER');
    if (!isCustomer && input.preferredBranchId)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const branch = input.preferredBranchId
      ? await this.db.branch.findFirst({
          where: { id: input.preferredBranchId, active: true },
          select: { id: true },
        })
      : null;
    if (input.preferredBranchId && !branch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (isCustomer && input.preferredBranchId === null)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const before = await this.myProfile(principal);
    await this.db.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: { id: principal.userId, version: input.expectedVersion, status: 'ACTIVE' },
        data: {
          displayName,
          ...(input.preferredBranchId !== undefined
            ? { preferredBranchId: input.preferredBranchId }
            : {}),
          version: { increment: 1 },
        },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await this.audit(tx, {
        actorId: principal.userId,
        action: 'security.my_profile_updated',
        objectType: 'User',
        objectId: principal.userId,
        targetUserId: principal.userId,
        correlationId,
        before: {
          displayName: before.displayName,
          preferredBranchId: before.preferredBranch?.id ?? null,
          version: before.version,
        },
        after: {
          displayName,
          preferredBranchId:
            input.preferredBranchId !== undefined
              ? input.preferredBranchId
              : (before.preferredBranch?.id ?? null),
          version: before.version + 1,
        },
      });
    });
    return this.myProfile(principal);
  }

  async publicSiteConfig() {
    const branches = await this.db.branch.findMany({
      where: { active: true },
      select: {
        id: true,
        code: true,
        name: true,
        timezone: true,
        supportWhatsappE164: true,
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    return {
      branches,
      fallbackWhatsappE164: this.runtimeConfig?.value.publicSupportWhatsappE164 ?? null,
    };
  }

  async replaceIdentityDocument(
    principal: SessionPrincipal,
    kind: IdentityDocumentKind,
    upload: IdentityDocumentUpload,
    expectedVersion: number,
    correlationId: string,
  ) {
    if (!['SELFIE', 'KTP_FRONT'].includes(kind))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const input = validateIdentityDocumentUpload(upload, this.uploadLimit());
    const current = await this.db.identityVerificationDocument.findFirst({
      where: { userId: principal.userId, kind, replacedById: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!current || current.status !== 'REJECTED' || current.version !== expectedVersion)
      throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    const replacementId = newId();
    const objectKey = `identity/${principal.userId}/${kind.toLowerCase()}/${replacementId}`;
    await this.identityStorage().put({ key: objectKey, content: input.buffer });
    try {
      return await this.db.$transaction(async (tx) => {
        const replacement = await tx.identityVerificationDocument.create({
          data: {
            id: replacementId,
            userId: principal.userId,
            kind,
            objectKey,
            checksum: input.checksum,
            fileName: this.safeOriginalName(input.originalName),
            mimeType: input.mimeType,
            sizeBytes: input.sizeBytes,
            uploadStatus: 'FINALIZED',
            scanStatus: 'CLEAN',
            providerReferenceHash: digest(objectKey),
            uploadedAt: new Date(),
            finalizedAt: new Date(),
          },
        });
        const claimed = await tx.identityVerificationDocument.updateMany({
          where: { id: current.id, version: expectedVersion, replacedById: null },
          data: {
            replacedById: replacement.id,
            ...(current.objectKey ? { status: 'PENDING_DELETION' as const } : {}),
            version: { increment: 1 },
          },
        });
        if (claimed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        if (current.objectKey) {
          const retentionDays = this.runtimeConfig?.value.privateUploads.retentionDays ?? 30;
          await tx.identityDocumentDeletionJob.create({
            data: {
              id: newId(),
              documentId: current.id,
              requestedById: principal.userId,
              objectKey: current.objectKey,
              status: 'QUEUED',
              nextAttemptAt: new Date(Date.now() + retentionDays * 86_400_000),
            },
          });
        }
        await this.audit(tx, {
          actorId: principal.userId,
          action: 'security.identity_document_replaced',
          objectType: 'IdentityVerificationDocument',
          objectId: replacement.id,
          correlationId,
          after: {
            kind,
            priorFileRetentionDays: this.runtimeConfig?.value.privateUploads.retentionDays ?? 30,
          },
        });
        return this.documentView(replacement);
      });
    } catch (error) {
      await this.identityStorage()
        .delete(objectKey)
        .catch(() => undefined);
      throw error;
    }
  }

  async listIdentityReview(principal: SessionPrincipal, status?: string) {
    this.policy.requireCapability(principal.capabilities, 'identity-verification:review');
    const allowed = ['PENDING', 'APPROVED', 'REJECTED', 'DELETED'];
    if (status && !allowed.includes(status))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const documents = await this.db.identityVerificationDocument.findMany({
      where: { replacedById: null, ...(status ? { status: status as never } : {}) },
      include: { user: { select: { id: true, displayName: true, phoneE164: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    return { items: documents.map((item) => ({ ...this.documentView(item), user: item.user })) };
  }

  async authorizeIdentityDocument(
    principal: SessionPrincipal,
    id: string,
    correlationId = 'unknown',
  ) {
    this.policy.requireCapability(principal.capabilities, 'identity-verification:review');
    const document = await this.db.identityVerificationDocument.findUnique({ where: { id } });
    if (!document?.objectKey || ['DELETED', 'PENDING_DELETION'].includes(document.status))
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (!(await this.identityStorage().exists(document.objectKey)))
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const expiresAt = new Date(
      Date.now() +
        (this.runtimeConfig?.value.privateUploads.viewAuthorizationTtlSeconds ?? 300) * 1000,
    );
    const authorization = await this.db.identityDocumentViewAuthorization.create({
      data: {
        id: newId(),
        documentId: id,
        viewerId: principal.userId,
        purpose: 'REVIEW',
        expiresAt,
      },
    });
    await this.audit(this.db, {
      actorId: principal.userId,
      action: 'security.identity_document_view_authorized',
      objectType: 'IdentityVerificationDocument',
      objectId: id,
      targetUserId: document.userId,
      correlationId,
      after: { expiresAt: expiresAt.toISOString() },
    });
    return {
      url: `/api/v1/identity-verification-files/${authorization.id}/content`,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async authorizeMyIdentityDocument(
    principal: SessionPrincipal,
    kind: IdentityDocumentKind,
    correlationId = 'unknown',
  ) {
    if (!principal.roles.some(({ role }) => role === 'CUSTOMER'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    if (!['SELFIE', 'KTP_FRONT'].includes(kind))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const document = await this.db.identityVerificationDocument.findFirst({
      where: {
        userId: principal.userId,
        kind,
        replacedById: null,
        status: { notIn: ['DELETED', 'PENDING_DELETION'] },
        objectKey: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!document?.objectKey || !(await this.identityStorage().exists(document.objectKey)))
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const expiresAt = new Date(
      Date.now() +
        (this.runtimeConfig?.value.privateUploads.viewAuthorizationTtlSeconds ?? 300) * 1000,
    );
    const authorization = await this.db.identityDocumentViewAuthorization.create({
      data: {
        id: newId(),
        documentId: document.id,
        viewerId: principal.userId,
        purpose: 'SELF_VIEW',
        expiresAt,
      },
    });
    await this.audit(this.db, {
      actorId: principal.userId,
      action: 'security.identity_document_self_view_authorized',
      objectType: 'IdentityVerificationDocument',
      objectId: document.id,
      targetUserId: principal.userId,
      correlationId,
      after: { kind, expiresAt: expiresAt.toISOString() },
    });
    return {
      url: `/api/v1/identity-verification-files/${authorization.id}/content`,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async readAuthorizedIdentityDocument(
    principal: SessionPrincipal,
    authorizationId: string,
    correlationId = 'unknown',
  ) {
    const authorization = await this.db.identityDocumentViewAuthorization.findUnique({
      where: { id: authorizationId },
      include: { document: true },
    });
    if (
      !authorization ||
      authorization.viewerId !== principal.userId ||
      authorization.consumedAt ||
      authorization.expiresAt <= new Date() ||
      !authorization.document.objectKey ||
      ['DELETED', 'PENDING_DELETION'].includes(authorization.document.status)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (
      (authorization.purpose === 'REVIEW' &&
        !principal.capabilities.includes('identity-verification:review')) ||
      (authorization.purpose === 'SELF_VIEW' && authorization.document.userId !== principal.userId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const claimed = await this.db.identityDocumentViewAuthorization.updateMany({
      where: { id: authorizationId, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() },
    });
    if (claimed.count !== 1) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const stream = await this.identityStorage().read(authorization.document.objectKey);
    await this.audit(this.db, {
      actorId: principal.userId,
      action: 'security.identity_document_viewed',
      objectType: 'IdentityVerificationDocument',
      objectId: authorization.document.id,
      targetUserId: authorization.document.userId,
      correlationId,
    });
    return {
      stream,
      mimeType: authorization.document.mimeType,
    };
  }

  async decideIdentityDocument(
    principal: SessionPrincipal,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    input: { expectedVersion: number; reasonCode?: string; note?: string },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'identity-verification:review');
    if (
      decision === 'REJECTED' &&
      (!input.reasonCode ||
        !IDENTITY_REJECTION_REASONS.has(input.reasonCode) ||
        (input.reasonCode === 'OTHER_REQUIRES_NOTE' && !input.note?.trim()))
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    await this.db.$transaction(async (tx) => {
      const changed = await tx.identityVerificationDocument.updateMany({
        where: {
          id,
          status: 'PENDING',
          version: input.expectedVersion,
          replacedById: null,
          scanStatus: 'CLEAN',
          uploadStatus: 'FINALIZED',
        },
        data: {
          status: decision,
          reviewedAt: new Date(),
          reviewedById: principal.userId,
          rejectionReasonCode: decision === 'REJECTED' ? input.reasonCode : null,
          rejectionNote: decision === 'REJECTED' ? input.note?.trim() || null : null,
          version: { increment: 1 },
        },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await this.audit(tx, {
        actorId: principal.userId,
        action: `security.identity_document_${decision.toLowerCase()}`,
        objectType: 'IdentityVerificationDocument',
        objectId: id,
        correlationId,
        after: { decision, reasonCode: input.reasonCode ?? null },
      });
      await tx.outboxEvent.create({
        data: {
          id: newId(),
          eventType:
            decision === 'APPROVED'
              ? 'identity.verification.approved.v1'
              : 'identity.verification.rejected.v1',
          aggregateType: 'IdentityVerificationDocument',
          aggregateId: id,
          payload: { documentId: id, decision },
          correlationId,
        },
      });
    });
    return this.documentView(
      (await this.db.identityVerificationDocument.findUnique({ where: { id } }))!,
    );
  }

  async deleteIdentityDocument(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number; reason: string },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'identity-verification:delete');
    if (!input.reason?.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const document = await this.db.identityVerificationDocument.findUnique({ where: { id } });
    if (!document || document.replacedById || document.status === 'DELETED')
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    if (document.version !== input.expectedVersion)
      throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    if (!document.objectKey) {
      const changed = await this.db.identityVerificationDocument.updateMany({
        where: { id, version: input.expectedVersion },
        data: {
          status: 'DELETED',
          providerReferenceHash: null,
          deletedAt: new Date(),
          deletedById: principal.userId,
          deletionReason: input.reason.trim(),
          version: { increment: 1 },
        },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      return { id, status: 'DELETED', version: input.expectedVersion + 1 };
    }
    const jobId = newId();
    await this.db.$transaction(async (tx) => {
      const changed = await tx.identityVerificationDocument.updateMany({
        where: { id, version: input.expectedVersion, status: { not: 'DELETED' } },
        data: {
          status: 'PENDING_DELETION',
          deletedById: principal.userId,
          deletionReason: input.reason.trim(),
          version: { increment: 1 },
        },
      });
      if (changed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      await tx.identityDocumentDeletionJob.upsert({
        where: { documentId: id },
        update: {
          requestedById: principal.userId,
          objectKey: document.objectKey!,
          status: 'RUNNING',
          attempts: { increment: 1 },
          lastErrorCode: null,
          nextAttemptAt: null,
        },
        create: {
          id: jobId,
          documentId: id,
          requestedById: principal.userId,
          objectKey: document.objectKey!,
          status: 'RUNNING',
          attempts: 1,
        },
      });
      await this.audit(tx, {
        actorId: principal.userId,
        action: 'security.identity_document_deletion_requested',
        objectType: 'IdentityVerificationDocument',
        objectId: id,
        correlationId,
        after: { reasonPresent: true },
      });
    });
    try {
      await this.identityStorage().delete(document.objectKey);
      await this.db.$transaction(async (tx) => {
        await tx.identityVerificationDocument.update({
          where: { id },
          data: {
            status: 'DELETED',
            objectKey: null,
            providerReferenceHash: null,
            deletedAt: new Date(),
            version: { increment: 1 },
          },
        });
        await tx.identityDocumentDeletionJob.update({
          where: { documentId: id },
          data: { status: 'SUCCEEDED', completedAt: new Date(), lastErrorCode: null },
        });
        await this.audit(tx, {
          actorId: principal.userId,
          action: 'security.identity_document_deleted',
          objectType: 'IdentityVerificationDocument',
          objectId: id,
          correlationId,
          after: { reasonPresent: true },
        });
      });
      return { id, status: 'DELETED', version: input.expectedVersion + 2 };
    } catch {
      const nextAttemptAt = new Date(Date.now() + 5 * 60_000);
      await this.db.$transaction(async (tx) => {
        await tx.identityVerificationDocument.update({
          where: { id },
          data: { status: 'DELETE_FAILED', version: { increment: 1 } },
        });
        await tx.identityDocumentDeletionJob.update({
          where: { documentId: id },
          data: { status: 'FAILED', lastErrorCode: 'PRIVATE_STORAGE_DELETE_FAILED', nextAttemptAt },
        });
        await this.audit(tx, {
          actorId: principal.userId,
          action: 'security.identity_document_deletion_failed',
          objectType: 'IdentityVerificationDocument',
          objectId: id,
          correlationId,
          after: { retryable: true },
        });
      });
      return { id, status: 'DELETE_FAILED', version: input.expectedVersion + 2, nextAttemptAt };
    }
  }

  private assignmentView(assignment: {
    id: string;
    userId: string;
    branchId: string;
    type: AssignmentType;
    activeFrom: Date;
    activeUntil: Date | null;
    version: number;
  }) {
    return {
      id: assignment.id,
      userId: assignment.userId,
      branchId: assignment.branchId,
      assignmentType: assignment.type,
      activeFrom: assignment.activeFrom.toISOString().slice(0, 10),
      activeUntil: assignment.activeUntil?.toISOString().slice(0, 10) ?? null,
      version: assignment.version,
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

  private isAssignmentConflict(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return (
      message.includes('Assignment_no_overlap') ||
      message.includes('23P01') ||
      this.isSerializationConflict(error)
    );
  }

  private isSerializationConflict(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2034' || error.code === 'P2002')
    );
  }
}
