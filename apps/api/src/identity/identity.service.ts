import { HttpStatus, Injectable } from '@nestjs/common';
import {
  type ApplicationRole,
  type AssignmentType,
  Prisma,
  type SessionChannel,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  ConfigGatedGoogleProvider,
  ConfigGatedOtpProvider,
  ConfigGatedProofProvider,
} from './provider-adapters';
import { RateLimitService } from './rate-limit.service';
import { assertIsoDate, dateInTimeZone, startOfLocalDateUtc } from './assignment-boundary';
import { PolicyService } from './policy.service';
import {
  ApiProblem,
  digest,
  newId,
  opaqueToken,
  safeEqual,
  syntheticConfigSeconds,
} from './security';

export interface SessionPrincipal {
  sessionId: string;
  userId: string;
  assurance: 'BASE' | 'MFA';
  roles: { role: ApplicationRole; branchId: string | null }[];
  capabilities: string[];
  branchIds: string[];
}

@Injectable()
export class IdentityService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly google: ConfigGatedGoogleProvider,
    private readonly otp: ConfigGatedOtpProvider,
    private readonly proof: ConfigGatedProofProvider,
    private readonly rateLimit: RateLimitService,
  ) {}

  private audit(
    tx: Prisma.TransactionClient | PrismaService,
    input: {
      actorId?: string;
      action: string;
      objectType: string;
      objectId: string;
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
        beforeMasked: input.before,
        afterMasked: input.after,
        correlationId: input.correlationId,
      },
    });
  }

  private activeRoleWhere(now = new Date()) {
    return { activeFrom: { lte: now }, OR: [{ activeUntil: null }, { activeUntil: { gt: now } }] };
  }

  async me(userId: string, at = new Date()) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { roles: { where: this.activeRoleWhere(at) } },
    });
    if (!user || user.status !== 'ACTIVE')
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    return {
      id: user.id,
      displayName: user.displayName,
      roles: [...new Set(user.roles.map(({ role }) => role))],
      branchIds: this.policy.branches(user.roles),
      capabilities: this.policy.capabilities(user.roles),
    };
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
          subjectHash: verified.subjectHash,
          status: 'PENDING',
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'asc' },
      });
      if (!invitation) throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
      const created = await tx.user.create({
        data: { id: newId(), displayName: 'Invited internal user' },
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
        const scopedBranches = role === 'SUPER_OWNER' ? [null] : branchIds;
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
    const session = await this.issueSession(user.id, input.channel, 'BASE');
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
    const session = await this.issueSession(identity.userId, channel, 'BASE');
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

  async issueSession(
    userId: string,
    channel: SessionChannel,
    assurance: 'BASE' | 'MFA',
    existingFamilyHash?: string,
  ) {
    const accessTtl = syntheticConfigSeconds('AUTH_ACCESS_TTL_SECONDS', 900);
    const refreshTtl = syntheticConfigSeconds('AUTH_REFRESH_TTL_SECONDS', 2_592_000);
    const accessToken = opaqueToken();
    const refreshToken = channel === 'MOBILE' ? opaqueToken() : null;
    const familyHash = existingFamilyHash ?? digest(opaqueToken());
    const expiresAt = new Date(Date.now() + accessTtl * 1000);
    const refreshExpiresAt = new Date(Date.now() + refreshTtl * 1000);
    await this.db.userSession.create({
      data: {
        userId,
        channel,
        assurance,
        tokenFamilyHash: familyHash,
        accessTokenHash: digest(accessToken),
        refreshTokenHash: refreshToken ? digest(refreshToken) : null,
        expiresAt,
        refreshExpiresAt,
      },
    });
    return {
      accessToken: channel === 'MOBILE' ? accessToken : null,
      refreshToken,
      user: await this.me(userId),
      assurance,
      channel,
      expiresAt: expiresAt.toISOString(),
      refreshExpiresAt: refreshExpiresAt.toISOString(),
      webCookieToken: channel === 'WEB' ? accessToken : null,
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
    await this.db.userSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date(), revocationReason: 'ROTATED', rotatedAt: new Date() },
    });
    return this.issueSession(
      session.userId,
      session.channel,
      session.assurance,
      session.tokenFamilyHash,
    );
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
      assurance: session.assurance,
      roles: session.user.roles,
      capabilities: this.policy.capabilities(session.user.roles),
      branchIds: this.policy.branches(session.user.roles),
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

  async listUsers(principal: SessionPrincipal, branchId?: string) {
    this.policy.requireCapability(principal.capabilities, 'user:read');
    if (
      branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const allowedBranches = branchId ? [branchId] : principal.branchIds;
    const users = await this.db.user.findMany({
      where: principal.capabilities.includes('branch:all')
        ? undefined
        : { roles: { some: { branchId: { in: allowedBranches }, ...this.activeRoleWhere() } } },
      take: 50,
      orderBy: { createdAt: 'asc' },
    });
    return {
      items: users.map((user) => ({
        id: user.id,
        status: user.status,
        attributes: { displayName: user.displayName },
      })),
      page: { nextCursor: null, hasMore: false },
    };
  }

  async inviteUser(
    principal: SessionPrincipal,
    input: { email: string; roles: ApplicationRole[]; branchIds?: string[] },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    this.policy.requireMfa(principal.assurance);
    const branchIds = [...new Set(input.branchIds ?? [])];
    if (
      !principal.capabilities.includes('branch:all') &&
      branchIds.some((id) => !principal.branchIds.includes(id))
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const allowed = new Set<ApplicationRole>([
      'INSTRUCTOR',
      'ADMIN',
      'MANAGER',
      'OWNER',
      'FINANCE',
      'OPS',
    ]);
    if (!input.roles.length || input.roles.some((role) => !allowed.has(role)))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const subjectHash = digest(`google:${input.email.trim().toLowerCase()}`);
    await this.rateLimit.consume('USER_INVITE', digest(principal.userId));
    const existingIdentity = await this.db.identity.findUnique({
      where: { provider_subjectHash: { provider: 'GOOGLE', subjectHash } },
    });
    if (existingIdentity) throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
    const existing = await this.db.userInvitation.findFirst({
      where: {
        identityProvider: 'GOOGLE',
        subjectHash,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });
    if (existing) return { id: existing.id, status: existing.status };
    const expiresAt = new Date(
      Date.now() + syntheticConfigSeconds('AUTH_INVITATION_TTL_SECONDS', 604_800) * 1000,
    );
    try {
      const invitation = await this.db.$transaction(async (tx) => {
        const created = await tx.userInvitation.create({
          data: {
            invitedById: principal.userId,
            subjectHash,
            roles: input.roles,
            branchIds,
            expiresAt,
          },
        });
        await this.audit(tx, {
          actorId: principal.userId,
          action: 'security.user_invited',
          objectType: 'UserInvitation',
          objectId: created.id,
          correlationId,
          after: { roles: input.roles, branchCount: branchIds.length },
        });
        return created;
      });
      return { id: invitation.id, status: invitation.status };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const concurrent = await this.db.userInvitation.findFirst({
          where: { identityProvider: 'GOOGLE', subjectHash, status: 'PENDING' },
        });
        if (concurrent) return { id: concurrent.id, status: concurrent.status };
      }
      throw error;
    }
  }

  async createMfa(principal: SessionPrincipal, purpose: string, correlationId = 'unknown') {
    await this.rateLimit.consume('MFA_CHALLENGE', digest(principal.userId));
    const ttl = syntheticConfigSeconds('AUTH_MFA_TTL_SECONDS', 300);
    const maxAttempts = syntheticConfigSeconds('AUTH_MFA_MAX_ATTEMPTS', 5);
    const subjectHash = digest(principal.userId);
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const challenge = await this.db.authChallenge.create({
      data: {
        userId: principal.userId,
        kind: 'MFA',
        purpose,
        subjectHash,
        proofHash: this.proof.proofHash('MFA', subjectHash),
        maxAttempts,
        expiresAt,
      },
    });
    await this.audit(this.db, {
      actorId: principal.userId,
      action: 'security.mfa_requested',
      objectType: 'AuthChallenge',
      objectId: challenge.id,
      correlationId,
      after: { purpose },
    });
    return {
      id: challenge.id,
      purpose,
      methodHint: 'synthetic-non-production',
      expiresAt: expiresAt.toISOString(),
    };
  }

  async verifyMfa(
    principal: SessionPrincipal,
    challengeId: string,
    proof: string,
    correlationId = 'unknown',
  ) {
    const challenge = await this.db.authChallenge.findUnique({ where: { id: challengeId } });
    if (
      !challenge ||
      challenge.userId !== principal.userId ||
      challenge.kind !== 'MFA' ||
      challenge.status !== 'PENDING' ||
      challenge.expiresAt <= new Date()
    )
      throw new ApiProblem('MFA_CHALLENGE_EXPIRED', HttpStatus.GONE);
    if (!this.proof.verify('MFA', challenge.subjectHash, proof)) {
      const attempts = challenge.attempts + 1;
      await this.db.authChallenge.update({
        where: { id: challenge.id },
        data: { attempts, status: attempts >= challenge.maxAttempts ? 'LOCKED' : 'PENDING' },
      });
      throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
    }
    const current = await this.db.userSession.findUnique({ where: { id: principal.sessionId } });
    if (!current) throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    await this.db.$transaction(async (tx) => {
      const claimed = await tx.authChallenge.updateMany({
        where: { id: challenge.id, status: 'PENDING' },
        data: { status: 'VERIFIED', verifiedAt: new Date() },
      });
      if (claimed.count !== 1) throw new ApiProblem('MFA_CHALLENGE_EXPIRED', HttpStatus.GONE);
      await tx.userSession.update({
        where: { id: current.id },
        data: { revokedAt: new Date(), revocationReason: 'MFA_ROTATED' },
      });
      await this.audit(tx, {
        actorId: principal.userId,
        action: 'security.mfa_verified',
        objectType: 'AuthChallenge',
        objectId: challenge.id,
        correlationId,
        after: { assurance: 'MFA' },
      });
    });
    return this.issueSession(principal.userId, current.channel, 'MFA', current.tokenFamilyHash);
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
    return this.issueSession(challenge.userId, 'MOBILE', 'MFA');
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
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    this.policy.requireMfa(principal.assurance);
    if (targetId === principal.userId)
      throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.CONFLICT);
    return this.db.$transaction(async (tx) => {
      const before = await tx.user.findUnique({ where: { id: targetId } });
      if (!before) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      const user = await tx.user.update({ where: { id: targetId }, data: { status: 'INACTIVE' } });
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
          beforeMasked: { status: before.status },
          afterMasked: { status: user.status, reasonPresent: Boolean(reason) },
          correlationId,
        },
      });
      return { id: user.id, status: user.status };
    });
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
    this.policy.requireMfa(principal.assurance);
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
    this.policy.requireMfa(principal.assurance);
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
