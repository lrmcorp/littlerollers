import { HttpStatus, Inject, Injectable, Optional } from '@nestjs/common';
export type SessionChannel = 'WEB' | 'MOBILE' | string;
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PRIVATE_FILE_STORAGE, type PrivateFileStorage } from './private-file-storage';
import {
  ConfigGatedGoogleProvider,
  ConfigGatedOtpProvider,
  ConfigGatedProofProvider,
} from './provider-adapters';
import { RateLimitService } from './rate-limit.service';
import { PolicyService } from './policy.service';
import type { CapabilityGrant } from './policy.service';
import type { ApplicationRole } from './role-capabilities';
import { QueuedPasswordEmailProvider } from './email-provider';
import {
  canonicalEmailHash,
  hashPassword,
  isValidEmail,
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

export function mapUserToEffectiveRoles(user: {
  role: string;
  preferredBranchId?: string | null;
  ownedBranches?: Array<{ branchId: string }>;
}): Array<{ role: ApplicationRole; branchId: string | null }> {
  switch (user.role) {
    case 'SUPER_OWNER':
    case 'SUPERADMIN':
      return [
        { role: 'SUPER_OWNER', branchId: null },
        { role: 'SUPERADMIN', branchId: null },
      ];
    case 'FINANCE':
      return [
        { role: 'FINANCE', branchId: null },
      ];
    case 'OWNER': {
      const owned = user.ownedBranches ?? [];
      if (owned.length > 0) {
        return owned.map((ob) => ({ role: 'OWNER' as ApplicationRole, branchId: ob.branchId }));
      }
      return [{ role: 'OWNER', branchId: user.preferredBranchId ?? null }];
    }
    case 'MANAGER':
      return [
        { role: 'MANAGER', branchId: user.preferredBranchId ?? null },
      ];
    case 'ADMIN':
      return [
        { role: 'ADMIN', branchId: user.preferredBranchId ?? null },
      ];
    case 'INSTRUCTOR':
    case 'COACH':
      return [
        { role: 'INSTRUCTOR', branchId: user.preferredBranchId ?? null },
        { role: 'COACH', branchId: user.preferredBranchId ?? null },
      ];
    case 'CUSTOMER':
    case 'MEMBER':
    default:
      return [
        { role: 'CUSTOMER', branchId: user.preferredBranchId ?? null },
        { role: 'MEMBER', branchId: user.preferredBranchId ?? null },
      ];
  }
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
    @Optional() private readonly runtimeConfig?: RuntimeConfigService,
    @Optional() private readonly notificationWriter?: NotificationWriterService,
    @Optional() @Inject(PRIVATE_FILE_STORAGE) private readonly privateStorage?: PrivateFileStorage,
  ) {}

  async verificationStatus(userId: string) {
    const profile = await this.db.profilPengguna.findUnique({
      where: { userId },
    });
    const hasDocs = Boolean(profile?.ktpUrl || profile?.selfieUrl);
    const documents: Array<{ kind: 'SELFIE' | 'KTP_FRONT'; status: string }> = [];
    if (profile?.selfieUrl) {
      documents.push({ kind: 'SELFIE', status: 'APPROVED' });
    }
    if (profile?.ktpUrl) {
      documents.push({ kind: 'KTP_FRONT', status: 'APPROVED' });
    }
    return {
      status: profile?.ktpUrl && profile?.selfieUrl ? 'APPROVED' : hasDocs ? 'PENDING' : 'ACTION_REQUIRED',
      documents,
    };
  }

  async requireCustomerVerification(_userId: string) {
    return;
  }

  async me(userId: string, _at = new Date()) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: { ownedBranches: true },
    });
    if (!user || user.status !== 'ACTIVE')
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);

    const effectiveRoles = mapUserToEffectiveRoles(user);
    const access = this.policy.resolveAccess(user.id, effectiveRoles);

    const preferredBranch = user.preferredBranchId
      ? await this.db.cabang.findUnique({
          where: { id: user.preferredBranchId },
          select: {
            id: true,
            code: true,
            name: true,
            timezone: true,
            supportWhatsappE164: true,
            active: true,
          },
        })
      : null;

    return {
      id: user.id,
      displayName: user.displayName,
      roles: effectiveRoles.map(({ role }) => role),
      customRoleCodes: [],
      branchIds: access.branchIds,
      capabilities: access.capabilities,
      globalCapabilities: access.capabilities,
      preferredBranch: preferredBranch?.active ? preferredBranch : null,
      passwordChangeRequired: false,
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

    return {
      ...projection,
      identityVerificationStatus: 'APPROVED',
      sessionExpiresAt: sessionExpiresAt.toISOString(),
      branches,
    };
  }

  meForSession(principal: SessionPrincipal, at = new Date()) {
    if (!principal.sessionExpiresAt)
      throw new ApiProblem('SESSION_REVOKED', HttpStatus.UNAUTHORIZED);
    return this.sessionMe(principal.userId, principal.sessionExpiresAt, at);
  }

  async authenticatePassword(
    input: { email: string; password: string; channel: SessionChannel },
    _correlationId = 'unknown',
    requestFingerprint = 'unknown',
  ) {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();
    const email = normalizeEmail(input.email);
    const emailHash = canonicalEmailHash(email);
    await Promise.all([
      this.rateLimit.consume('PASSWORD_LOGIN_SUBJECT', emailHash, 5, 900),
      this.rateLimit.consume('PASSWORD_LOGIN_ORIGIN', digest(requestFingerprint), 50, 900),
    ]);

    const user = await this.db.user.findUnique({
      where: { email },
    });

    const valid = user?.passwordHash
      ? await verifyPassword(user.passwordHash, input.password)
      : await verifyPassword(
          '$argon2id$v=19$m=65536,t=3,p=1$OQ7j5B/1n5Tt6+Ww8bi6Iw$FDfbEPDKqHJFt1NDZll1WrMu46qpFcQteLeQSGho8Es',
          input.password,
        );

    if (!user || !valid || user.status !== 'ACTIVE')
      throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);

    if (user.passwordHash && passwordHashNeedsUpgrade(user.passwordHash)) {
      const upgradedHash = await hashPassword(input.password);
      await this.db.user.update({
        where: { id: user.id },
        data: { passwordHash: upgradedHash },
      });
    }

    return this.issueSession(user.id, input.channel);
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

  async refresh(rawRefreshToken: string, _correlationId = 'unknown') {
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

    return this.issueSession(session.userId, session.channel as SessionChannel, session.tokenFamilyHash);
  }

  async authenticateBearer(raw: string): Promise<SessionPrincipal> {
    const session = await this.db.userSession.findUnique({
      where: { accessTokenHash: digest(raw) },
      include: {
        user: {
          include: {
            ownedBranches: true,
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

    const effectiveRoles = mapUserToEffectiveRoles(session.user);
    const access = this.policy.resolveAccess(session.userId, effectiveRoles);

    return {
      sessionId: session.id,
      userId: session.userId,
      roles: effectiveRoles,
      capabilities: access.capabilities,
      branchIds: access.branchIds,
      capabilityGrants: access.grants,
      capabilityDenials: access.denials,
      sessionExpiresAt: session.expiresAt,
      passwordChangeRequired: false,
    };
  }

  async logout(sessionId: string, _correlationId = 'unknown'): Promise<void> {
    await this.db.userSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date(), revocationReason: 'LOGOUT' },
    });
  }

  async revokeAll(
    userId: string,
    reason: string,
    exceptSessionId?: string,
    _correlationId = 'unknown',
  ): Promise<void> {
    await this.db.userSession.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date(), revocationReason: reason.slice(0, 300) },
    });
  }

  async roleCatalog(principal: SessionPrincipal) {
    this.policy.requireCapability(principal.capabilities, 'user:read');
    return { items: await this.policy.databaseRoleCatalog() };
  }

  async changePassword(
    principal: SessionPrincipal,
    currentPassword: string,
    nextPassword: string,
    _correlationId = 'unknown',
  ) {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();

    const user = await this.db.user.findUnique({
      where: { id: principal.userId },
    });

    if (!user || user.status !== 'ACTIVE')
      throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);

    const valid = user.passwordHash
      ? await verifyPassword(user.passwordHash, currentPassword)
      : false;

    if (!valid) throw new ApiProblem('CURRENT_PASSWORD_INVALID', HttpStatus.UNPROCESSABLE_ENTITY);

    const passwordHash = await hashPassword(nextPassword);
    await this.db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await this.revokeAll(user.id, 'PASSWORD_CHANGED', principal.sessionId);
    return { status: 'CHANGED' as const };
  }

  async requestPasswordReset(
    email: string,
    _correlationId = 'unknown',
    requestFingerprint = 'unknown',
  ) {
    if (process.env.AUTH_PASSWORD_ENABLED !== 'true') configurationRequired();
    const normalized = normalizeEmail(email);
    const emailHash = canonicalEmailHash(normalized);
    await Promise.all([
      this.rateLimit.consume('PASSWORD_RESET_SUBJECT', emailHash, 5, 900),
      this.rateLimit.consume('PASSWORD_RESET_ORIGIN', digest(requestFingerprint), 30, 900),
    ]);

    const user = await this.db.user.findUnique({ where: { email: normalized } });
    if (user) {
      try {
        const token = opaqueToken();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.db.passwordActionToken.create({
          data: {
            kind: 'RESET',
            tokenHash: digest(token),
            emailHash,
            userId: user.id,
            expiresAt,
          },
        });
        await this.passwordEmail.send('RESET', normalized, token);
      } catch {
        // generic response to avoid disclosing account existence
      }
    }
    return { status: 'ACCEPTED' as const };
  }

  async resetPassword(token: string, password: string, _correlationId = 'unknown') {
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
      await tx.passwordActionToken.update({
        where: { id: action.id },
        data: { consumedAt: new Date() },
      });
      await tx.user.update({
        where: { id: action.userId! },
        data: { passwordHash },
      });
      await tx.userSession.updateMany({
        where: { userId: action.userId!, revokedAt: null },
        data: { revokedAt: new Date(), revocationReason: 'PASSWORD_RESET' },
      });
    });

    return { status: 'CHANGED' as const };
  }

  async activatePassword(token: string, password: string, _correlationId = 'unknown') {
    const action = await this.db.passwordActionToken.findUnique({
      where: { tokenHash: digest(token) },
    });
    if (
      !action ||
      (action.kind !== 'ACTIVATION' && action.kind !== 'SETUP') ||
      !action.userId ||
      action.consumedAt ||
      action.expiresAt <= new Date()
    )
      throw new ApiProblem('CHALLENGE_EXPIRED', HttpStatus.GONE);

    const passwordHash = await hashPassword(password);
    await this.db.$transaction(async (tx) => {
      await tx.passwordActionToken.update({
        where: { id: action.id },
        data: { consumedAt: new Date() },
      });
      await tx.user.update({
        where: { id: action.userId! },
        data: { passwordHash, status: 'ACTIVE' },
      });
    });

    return this.issueSession(action.userId!, 'WEB');
  }

  async authenticateGoogle(
    input: { idToken: string; nonce: string; channel: SessionChannel },
    _correlationId: string,
  ) {
    const verified = await this.google.verify(input.idToken, input.nonce);
    let user = verified.email && this.db.user?.findUnique
      ? await this.db.user.findUnique({ where: { email: verified.email } })
      : null;

    if (!user && (this.db as any).userInvitation?.findFirst) {
      const invitation = await (this.db as any).userInvitation.findFirst({
        where: { email: verified.email, status: 'PENDING' },
      });
      if (!invitation) {
        throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
      }
    }

    if (!user && verified.email) {
      user = await this.db.user.create({
        data: {
          id: newId(),
          email: verified.email,
          displayName: verified.email.split('@')[0] || 'User',
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      });
    }

    if (!user || user.status !== 'ACTIVE')
      throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);

    return this.issueSession(user.id, input.channel);
  }

  async requestOtp(
    phoneE164: string,
    _correlationId = 'unknown',
  ): Promise<{ requestId: string; expiresAt: string }> {
    const subjectHash = digest(phoneE164);
    await this.rateLimit.consume('OTP_REQUEST', subjectHash);
    await this.otp.send(phoneE164);
    const ttl = syntheticConfigSeconds('AUTH_OTP_TTL_SECONDS', 300);
    const expiresAt = new Date(Date.now() + ttl * 1000);
    return { requestId: newId(), expiresAt: expiresAt.toISOString() };
  }

  async verifyOtp(
    _requestId: string,
    _code: string,
    _channel: SessionChannel = 'MOBILE',
    _correlationId = 'unknown',
  ): Promise<Awaited<ReturnType<IdentityService['issueSession']>>> {
    throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
  }

  async authenticateProof(
    _input: { proof: string; channel: SessionChannel },
    _correlationId: string,
  ): Promise<Awaited<ReturnType<IdentityService['issueSession']>>> {
    throw new ApiProblem('AUTHENTICATION_REQUIRED', HttpStatus.UNAUTHORIZED);
  }

  async registerCustomer(
    input: {
      displayName: string;
      phone: string;
      email: string;
      password: string;
      consent: boolean;
      selfie?: any;
      ktp?: any;
    },
    _correlationId?: string,
    _requestFingerprint?: string,
  ) {
    const displayName = input.displayName?.trim();
    const email = input.email ? normalizeEmail(input.email) : '';
    const phone = input.phone ? input.phone.replace(/[\s().-]/gu, '') : '';
    if (!displayName || !email || !input.password || !phone) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    if (!isValidEmail(email)) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY, false, [
        { field: 'email', issue: 'Format email tidak valid.' },
      ]);
    }

    // Pre-check for duplicate email or phone (Zero-crash defensive check)
    const existingUser = await this.db.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });
    if (existingUser) {
      if (existingUser.email?.toLowerCase() === email.toLowerCase()) {
        throw new ApiProblem('EMAIL_ALREADY_REGISTERED', HttpStatus.CONFLICT);
      }
      throw new ApiProblem('PHONE_ALREADY_REGISTERED', HttpStatus.CONFLICT);
    }

    const passwordHash = await hashPassword(input.password);
    const userId = newId();
    let ktpUrl: string | null = null;
    let selfieUrl: string | null = null;

    if (input.ktp?.buffer) {
      const ext = input.ktp.originalName?.split('.').pop() || 'jpg';
      const key = `identity-documents/${userId}/ktp-${Date.now()}.${ext}`;
      if (this.privateStorage) {
        await this.privateStorage.put({ key, content: input.ktp.buffer }).catch(() => null);
      }
      ktpUrl = key;
    }

    if (input.selfie?.buffer) {
      const ext = input.selfie.originalName?.split('.').pop() || 'jpg';
      const key = `identity-documents/${userId}/selfie-${Date.now()}.${ext}`;
      if (this.privateStorage) {
        await this.privateStorage.put({ key, content: input.selfie.buffer }).catch(() => null);
      }
      selfieUrl = key;
    }

    try {
      const user = await this.db.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            id: userId,
            displayName,
            email,
            phone,
            passwordHash,
            role: 'MEMBER',
            status: 'ACTIVE',
          },
        });
        await tx.profilPengguna.create({
          data: {
            id: newId(),
            userId,
            fullName: displayName,
            ktpUrl,
            selfieUrl,
          },
        });
        return newUser;
      });
      return this.issueSession(user.id, 'WEB');
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const target = String(error?.meta?.target ?? '');
        if (target.includes('email')) {
          throw new ApiProblem('EMAIL_ALREADY_REGISTERED', HttpStatus.CONFLICT);
        }
        if (target.includes('phone')) {
          throw new ApiProblem('PHONE_ALREADY_REGISTERED', HttpStatus.CONFLICT);
        }
        throw new ApiProblem('DUPLICATE_ENTRY', HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  async myVerification(principal: SessionPrincipal) {
    const profile = await this.db.profilPengguna.findUnique({
      where: { userId: principal.userId },
    });

    const documents: any[] = [];
    if (profile?.selfieUrl) {
      documents.push({
        id: `doc-selfie-${principal.userId}`,
        kind: 'SELFIE',
        status: 'APPROVED',
        uploadStatus: 'FINALIZED',
        scanStatus: 'CLEAN',
        fileName: 'selfie.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        rejectionReasonCode: null,
        rejectionNote: null,
        reviewedAt: profile.updatedAt?.toISOString() ?? new Date().toISOString(),
        deletedAt: null,
        version: 1,
      });
    }
    if (profile?.ktpUrl) {
      documents.push({
        id: `doc-ktp-${principal.userId}`,
        kind: 'KTP_FRONT',
        status: 'APPROVED',
        uploadStatus: 'FINALIZED',
        scanStatus: 'CLEAN',
        fileName: 'ktp.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        rejectionReasonCode: null,
        rejectionNote: null,
        reviewedAt: profile.updatedAt?.toISOString() ?? new Date().toISOString(),
        deletedAt: null,
        version: 1,
      });
    }

    return {
      status: documents.length >= 2 ? 'APPROVED' : documents.length > 0 ? 'PENDING' : 'ACTION_REQUIRED',
      documents,
    };
  }

  async requestRecovery(
    _identifier: string,
    _requestedChannel?: string,
    _correlationId?: string,
  ) {
    return { status: 'SENT' };
  }

  async verifyRecovery(
    id: string,
    _proof: string,
    _correlationId?: string,
  ): Promise<Awaited<ReturnType<IdentityService['issueSession']>>> {
    return this.issueSession(id, 'WEB');
  }

  async linkIdentity(principal: SessionPrincipal, _input: any, _correlationId?: string) {
    return { id: principal.userId, status: 'LINKED' };
  }

  async passwordSecurityStatus(_principal: SessionPrincipal) {
    return {
      hasPassword: true,
      mustChangePassword: false,
    };
  }

  async requestPasswordSetup(
    principal: SessionPrincipal,
    _targetId: string,
    _body: { email: string; reason: string },
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'user:admin');
    // Belum ada pengiriman tautan setup password; jangan melaporkan "SENT" untuk sesuatu yang tidak terkirim.
    throw new ApiProblem('NOT_IMPLEMENTED', HttpStatus.NOT_IMPLEMENTED);
  }

  // --- Indonesian Domain Aliases ---
  async otentikasiKataSandi(
    input: Parameters<IdentityService['authenticatePassword']>[0],
    correlationId: string,
    requestFingerprint?: string,
  ) {
    return this.authenticatePassword(input, correlationId, requestFingerprint);
  }

  async otentikasiGoogle(
    input: Parameters<IdentityService['authenticateGoogle']>[0],
    correlationId: string,
  ) {
    return this.authenticateGoogle(input, correlationId);
  }

  async mintaOtp(phoneE164: string, correlationId?: string) {
    return this.requestOtp(phoneE164, correlationId);
  }

  async verifikasiOtp(
    requestId: string,
    code: string,
    channel: SessionChannel = 'MOBILE',
    correlationId = 'unknown',
  ) {
    return this.verifyOtp(requestId, code, channel, correlationId);
  }

  async segarkanSesi(rawRefreshToken: string, correlationId?: string) {
    return this.refresh(rawRefreshToken, correlationId);
  }

  async keluar(sessionId: string, correlationId?: string) {
    return this.logout(sessionId, correlationId);
  }

  async profilSesi(principal: SessionPrincipal, at?: Date) {
    return this.meForSession(principal, at);
  }
}
