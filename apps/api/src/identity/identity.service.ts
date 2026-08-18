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
import type { CapabilityGrant } from './policy.service';
import { QueuedPasswordEmailProvider } from './email-provider';
import {
  canonicalEmailHash,
  hashPassword,
  normalizeEmail,
  passwordHashNeedsUpgrade,
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
import { NotificationWriterService } from '../notifications/notification-writer.service';

export interface SessionPrincipal {
  sessionId: string;
  userId: string;
  roles: { role: ApplicationRole; branchId: string | null }[];
  capabilities: string[];
  branchIds: string[];
  capabilityGrants?: CapabilityGrant[];
  capabilityDenials?: Array<{ capability: string; branchId: string | null; sourceId: string }>;
  sessionExpiresAt?: Date;
  passwordChangeRequired?: boolean;
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
    private readonly passwordEmail: QueuedPasswordEmailProvider,
    @Optional() private readonly idempotency?: IdempotencyService,
    @Inject(PRIVATE_FILE_STORAGE) @Optional() private readonly privateFiles?: PrivateFileStorage,
    @Optional() private readonly runtimeConfig?: RuntimeConfigService,
    @Optional() private readonly notificationWriter?: NotificationWriterService,
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
    const documents = await this.db.dokumenVerifikasiIdentitas.findMany({
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
        passwordCredential: { select: { mustChangePassword: true } },
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
    const access = await this.policy.resolveAccess(user.id, user.roles, at);
    return {
      id: user.id,
      displayName: user.displayName,
      roles: [...new Set(user.roles.map(({ role }) => role))],
      customRoleCodes: access.roleCodes.filter(
        (code) => !user.roles.some(({ role }) => role === code),
      ),
      branchIds: access.branchIds,
      capabilities: access.capabilities,
      globalCapabilities: access.capabilities.filter((capability) =>
        this.policy.hasGlobalCapability(access, capability),
      ),
      preferredBranch: user.preferredBranch?.active ? user.preferredBranch : null,
      passwordChangeRequired: user.passwordCredential?.mustChangePassword ?? false,
    };
  }

  private async sessionMe(userId: string, sessionExpiresAt: Date, at = new Date()) {
    const projection = await this.me(userId, at);
    const branchScope = projection.capabilities.includes('branch:all')
      ? undefined
      : { in: projection.branchIds };
    const branches = await this.db.cabang.findMany({
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
      const existing = await tx.identitas.findUnique({
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
        await tx.identitas.create({
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
      await tx.identitas.create({
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
    const identity = await this.db.identitas.findUnique({
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
      include: {
        user: {
          include: {
            roles: { where: this.activeRoleWhere() },
            passwordCredential: { select: { mustChangePassword: true } },
          },
        },
      },
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.status !== 'ACTIVE'
    )
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    const access = await this.policy.resolveAccess(session.userId, session.user.roles);
    return {
      sessionId: session.id,
      userId: session.userId,
      roles: session.user.roles,
      capabilities: access.capabilities,
      branchIds: access.branchIds,
      capabilityGrants: access.grants,
      capabilityDenials: access.denials,
      sessionExpiresAt: session.expiresAt,
      passwordChangeRequired: session.user.passwordCredential?.mustChangePassword ?? false,
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

  async roleCatalog(principal: SessionPrincipal) {
    this.policy.requireCapability(principal.capabilities, 'user:read');
    return { items: await this.policy.databaseRoleCatalog() };
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
    if (passwordHashNeedsUpgrade(credential.passwordHash)) {
      const upgradedHash = await hashPassword(input.password);
      await this.db.$transaction(async (tx) => {
        const upgraded = await tx.passwordCredential.updateMany({
          where: {
            id: credential.id,
            version: credential.version,
            passwordHash: credential.passwordHash,
          },
          data: {
            passwordHash: upgradedHash,
            passwordChangedAt: new Date(),
            version: { increment: 1 },
          },
        });
        if (upgraded.count === 1)
          await this.audit(tx, {
            actorId: credential.userId,
            action: 'security.password_hash_upgraded',
            objectType: 'PasswordCredential',
            objectId: credential.id,
            correlationId,
            after: { algorithm: 'ARGON2ID', previousAlgorithm: 'BCRYPT' },
          });
      });
    }
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
      await tx.identitas.create({
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
    if (await this.passwordMutationLockedForPilot()) {
      await this.audit(this.db, {
        action: 'security.password_reset_deferred_for_migration',
        objectType: 'PasswordActionToken',
        objectId: digest(`${emailHash}:${correlationId}`),
        correlationId,
        after: { accepted: true, reasonCode: 'PILOT_ROLLBACK_PROTECTION' },
      });
      return { status: 'ACCEPTED' as const };
    }
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
    if (await this.passwordMutationLockedForPilot())
      throw new ApiProblem('PILOT_PASSWORD_CHANGE_LOCKED', HttpStatus.LOCKED, true);
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
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          mustChangePassword: false,
          version: { increment: 1 },
        },
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
    if (await this.passwordMutationLockedForPilot())
      throw new ApiProblem('PILOT_PASSWORD_CHANGE_LOCKED', HttpStatus.LOCKED, true);
    const credential = await this.db.passwordCredential.findUnique({
      where: { userId: principal.userId },
    });
    if (!credential || !(await verifyPassword(credential.passwordHash, currentPassword)))
      throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
    const passwordHash = await hashPassword(nextPassword);
    await this.db.$transaction(async (tx) => {
      await tx.passwordCredential.update({
        where: { userId: principal.userId },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          mustChangePassword: false,
          version: { increment: 1 },
        },
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

  private async passwordMutationLockedForPilot(): Promise<boolean> {
    return (
      (await this.db.migrationBranchCutover.count({
        where: { status: { in: ['FREEZING', 'DRAINING', 'V2_ACTIVE', 'ROLLING_BACK'] } },
      })) > 0
    );
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
      passwordChangeRequired: password?.mustChangePassword ?? false,
    };
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
    const identity = await this.db.identitas.findFirst({ where: { subjectHash } });
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
    const existing = await this.db.identitas.findUnique({
      where: { provider_subjectHash: { provider: input.provider, subjectHash } },
    });
    if (existing?.userId === principal.userId) return { id: existing.id, status: 'LINKED' };
    if (existing) throw new ApiProblem('IDENTITY_CONFLICT', HttpStatus.CONFLICT);
    try {
      const identity = await this.db.$transaction(async (tx) => {
        const created = await tx.identitas.create({
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
        await tx.identitas.create({
          data: {
            id: newId(),
            userId: user.id,
            provider: 'EMAIL_PASSWORD',
            subjectHash: emailHash,
            verifiedAt: new Date(),
          },
        });
        for (const { id, kind, document, objectKey } of prepared) {
          await tx.dokumenVerifikasiIdentitas.create({
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
        // Notifikasi in-app: sambut customer baru dan minta verifikasi dokumen
        if (this.notificationWriter) {
          await this.notificationWriter.writeForUser(tx, {
            userId: user.id,
            eventKey: `customer.registered:${user.id}`,
            category: 'VERIFICATION',
            tone: 'INFO',
            title: 'Selamat datang! Verifikasi dokumen diperlukan.',
            message:
              'Akun Anda berhasil dibuat. Dokumen KTP dan Selfie Anda sedang menunggu peninjauan oleh tim kami.',
            href: '/account/verification',
            expiresInDays: 30,
          });
          // Notifikasi in-app ke staf: customer baru menunggu review
          const reviewers = await tx.userRole.findMany({
            where: {
              role: { in: ['SUPER_OWNER', 'OWNER', 'ADMIN'] },
              OR: [{ activeUntil: null }, { activeUntil: { gt: new Date() } }],
            },
            select: { userId: true },
            distinct: ['userId'],
          });
          if (reviewers.length > 0) {
            const { randomUUID } = await import('crypto');
            await tx.userNotification.createMany({
              data: reviewers.map(({ userId: staffUserId }) => ({
                id: randomUUID(),
                userId: staffUserId,
                eventKey: `customer.registered.review:${user.id}:${staffUserId}`,
                category: 'VERIFICATION' as const,
                tone: 'INFO' as const,
                title: 'Customer baru mendaftar',
                message: `${displayName} telah mendaftar dan dokumen identitasnya menunggu peninjauan.`,
                href: '/identity-verifications',
                expiresInDays: undefined,
                expiresAt: new Date(Date.now() + 7 * 86_400_000),
              })),
              skipDuplicates: true,
            });
          }
        }
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
    this.policy.requireCustomerSelf(principal.roles, principal.capabilities);
    return this.verificationStatus(principal.userId);
  }
}
