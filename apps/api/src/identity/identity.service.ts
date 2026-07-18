import { HttpStatus, Injectable } from '@nestjs/common';
import type { ApplicationRole, SessionChannel } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ConfigGatedGoogleProvider, ConfigGatedOtpProvider } from './provider-adapters';
import { PolicyService } from './policy.service';
import {
  ApiProblem,
  digest,
  newId,
  opaqueToken,
  positiveConfigSeconds,
  safeEqual,
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
  ) {}

  private activeRoleWhere(now = new Date()) {
    return { activeFrom: { lte: now }, OR: [{ activeUntil: null }, { activeUntil: { gt: now } }] };
  }

  async me(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { roles: { where: this.activeRoleWhere() } },
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

  async authenticateGoogle(input: { idToken: string; nonce: string; channel: SessionChannel }) {
    const verified = await this.google.verify(input.idToken, input.nonce);
    const user = await this.db.$transaction(async (tx) => {
      const existing = await tx.identity.findUnique({
        where: {
          provider_subjectHash: { provider: verified.provider, subjectHash: verified.subjectHash },
        },
        include: { user: true },
      });
      if (existing) return existing.user;
      const created = await tx.user.create({
        data: { id: newId(), displayName: 'Verified customer' },
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
      await tx.userRole.create({
        data: { userId: created.id, role: 'CUSTOMER', activeFrom: new Date() },
      });
      return created;
    });
    return this.issueSession(user.id, input.channel, 'BASE');
  }

  async requestOtp(phoneE164: string): Promise<{ requestId: string }> {
    const { proofHash } = await this.otp.send(phoneE164);
    const ttl = positiveConfigSeconds('AUTH_OTP_TTL_SECONDS');
    const maxAttempts = positiveConfigSeconds('AUTH_OTP_MAX_ATTEMPTS');
    const challenge = await this.db.authChallenge.create({
      data: {
        kind: 'OTP',
        purpose: 'SIGN_IN',
        subjectHash: digest(phoneE164),
        proofHash,
        maxAttempts,
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    });
    return { requestId: challenge.id };
  }

  async verifyOtp(requestId: string, code: string, channel: SessionChannel = 'MOBILE') {
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
    await this.db.authChallenge.update({
      where: { id: requestId },
      data: { status: 'VERIFIED', verifiedAt: new Date() },
    });
    return this.issueSession(identity.userId, channel, 'BASE');
  }

  async issueSession(
    userId: string,
    channel: SessionChannel,
    assurance: 'BASE' | 'MFA',
    existingFamilyHash?: string,
  ) {
    const accessTtl = positiveConfigSeconds('AUTH_ACCESS_TTL_SECONDS');
    const refreshTtl = positiveConfigSeconds('AUTH_REFRESH_TTL_SECONDS');
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
    };
  }

  async refresh(rawRefreshToken: string) {
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

  async logout(sessionId: string): Promise<void> {
    await this.db.userSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date(), revocationReason: 'LOGOUT' },
    });
  }

  async revokeAll(userId: string, reason: string, exceptSessionId?: string): Promise<void> {
    await this.db.userSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date(), revocationReason: reason.slice(0, 300) },
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
}
