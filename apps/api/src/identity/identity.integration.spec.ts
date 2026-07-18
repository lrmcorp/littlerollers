import { PrismaClient } from '@prisma/client';
import { IdentityService } from './identity.service';
import { PolicyService } from './policy.service';
import {
  ConfigGatedGoogleProvider,
  ConfigGatedOtpProvider,
  ConfigGatedProofProvider,
} from './provider-adapters';
import { RateLimitService } from './rate-limit.service';
import { digest } from './security';
import { randomUUID } from 'node:crypto';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;

databaseDescribe('identity PostgreSQL integration', () => {
  const db = new PrismaClient();
  const namespace = `it-${Date.now()}`;
  const branchId = randomUUID();
  const inviterId = randomUUID();
  const targetId = randomUUID();
  const otpUserId = randomUUID();
  let service: IdentityService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.AUTH_SYNTHETIC_ENABLED = 'true';
    process.env.AUTH_SYNTHETIC_OTP_CODE = '123456';
    process.env.AUTH_SYNTHETIC_MFA_PROOF = 'mfa-proof';
    process.env.AUTH_SYNTHETIC_RECOVERY_PROOF = 'recovery-proof';
    await db.$connect();
    await db.rateLimitCounter.deleteMany({
      where: {
        subjectHash: { in: [digest('+628111111111'), digest('+628222222222')] },
      },
    });
    await db.branch.create({
      data: { id: branchId, code: namespace, name: namespace, timezone: 'Asia/Jakarta' },
    });
    await db.user.create({ data: { id: inviterId, displayName: 'Integration inviter' } });
    await db.userRole.create({
      data: { userId: inviterId, branchId, role: 'OWNER', activeFrom: new Date() },
    });
    await db.user.create({ data: { id: otpUserId, displayName: 'Integration OTP user' } });
    await db.identity.create({
      data: {
        id: randomUUID(),
        userId: otpUserId,
        provider: 'WHATSAPP_PHONE',
        subjectHash: digest('+628111111111'),
        verifiedAt: new Date(),
      },
    });
    service = new IdentityService(
      db as never,
      new PolicyService(),
      new ConfigGatedGoogleProvider(),
      new ConfigGatedOtpProvider(),
      new ConfigGatedProofProvider(),
      new RateLimitService(db as never),
    );
  });

  afterAll(async () => {
    const users = await db.user.findMany({
      where: { roles: { some: { branchId } } },
      select: { id: true },
    });
    const userIds = [...new Set([inviterId, targetId, otpUserId, ...users.map(({ id }) => id)])];
    await db.auditLog.deleteMany({
      where: { OR: [{ actorId: { in: userIds } }, { objectId: { in: userIds } }] },
    });
    await db.authChallenge.deleteMany({ where: { userId: { in: userIds } } });
    await db.userSession.deleteMany({ where: { userId: { in: userIds } } });
    await db.identity.deleteMany({ where: { userId: { in: userIds } } });
    await db.userInvitation.deleteMany({ where: { invitedById: inviterId } });
    await db.userRole.deleteMany({ where: { userId: { in: userIds } } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
    await db.branch.deleteMany({ where: { id: branchId } });
    await db.rateLimitCounter.deleteMany({
      where: {
        subjectHash: { in: [digest('+628111111111'), digest('+628222222222')] },
      },
    });
    await db.$disconnect();
  });

  const principal = {
    sessionId: 'pending',
    userId: inviterId,
    assurance: 'MFA' as const,
    roles: [{ role: 'OWNER' as const, branchId }],
    capabilities: ['user:read', 'user:admin'],
    branchIds: [branchId],
  };

  it('keeps invitation and concurrent Google identity unique', async () => {
    const email = `${namespace}@example.test`;
    const first = await service.inviteUser(
      principal,
      { email, roles: ['ADMIN'], branchIds: [branchId] },
      `${namespace}-invite-1`,
    );
    const replay = await service.inviteUser(
      principal,
      { email, roles: ['ADMIN'], branchIds: [branchId] },
      `${namespace}-invite-2`,
    );
    expect(replay.id).toBe(first.id);
    const results = await Promise.allSettled([
      service.authenticateGoogle(
        { idToken: email, nonce: 'one', channel: 'MOBILE' },
        `${namespace}-login-1`,
      ),
      service.authenticateGoogle(
        { idToken: email, nonce: 'two', channel: 'MOBILE' },
        `${namespace}-login-2`,
      ),
    ]);
    expect(results.some(({ status }) => status === 'fulfilled')).toBe(true);
    expect(
      await db.identity.count({
        where: { provider: 'GOOGLE', subjectHash: digest(`google:${email}`) },
      }),
    ).toBe(1);
    expect(
      await db.userInvitation.count({
        where: { identityProvider: 'GOOGLE', subjectHash: digest(`google:${email}`) },
      }),
    ).toBe(1);
  });

  it('enforces OTP lock/replay/rate limits, recovery and refresh reuse', async () => {
    const locked = await service.requestOtp('+628111111111', `${namespace}-otp-lock`);
    for (let attempt = 0; attempt < 5; attempt += 1)
      await expect(service.verifyOtp(locked.requestId, 'wrong')).rejects.toMatchObject({
        code: 'AUTHENTICATION_REQUIRED',
      });
    await expect(service.verifyOtp(locked.requestId, '123456')).rejects.toMatchObject({
      code: 'CHALLENGE_EXPIRED',
    });

    const valid = await service.requestOtp('+628111111111', `${namespace}-otp-valid`);
    const session = await service.verifyOtp(
      valid.requestId,
      '123456',
      'MOBILE',
      `${namespace}-otp-verify`,
    );
    await expect(service.verifyOtp(valid.requestId, '123456')).rejects.toMatchObject({
      code: 'CHALLENGE_EXPIRED',
    });
    const rotated = await service.refresh(session.refreshToken!, `${namespace}-refresh`);
    await expect(
      service.refresh(session.refreshToken!, `${namespace}-reuse`),
    ).rejects.toMatchObject({ code: 'SESSION_REVOKED' });
    expect(rotated.refreshToken).toBeTruthy();
    expect(
      await db.auditLog.count({
        where: {
          correlationId: `${namespace}-reuse`,
          action: 'security.refresh_reuse_detected',
        },
      }),
    ).toBe(1);

    const recovery = await service.requestRecovery(
      '+628111111111',
      'WHATSAPP',
      `${namespace}-recovery-request`,
    );
    await expect(service.verifyRecovery(recovery.requestId, 'wrong')).rejects.toMatchObject({
      code: 'IDENTITY_CONFLICT',
    });
    await service.verifyRecovery(
      recovery.requestId,
      'recovery-proof',
      `${namespace}-recovery-verify`,
    );
    expect(
      await db.auditLog.count({
        where: {
          correlationId: `${namespace}-recovery-verify`,
          action: 'security.recovery_verified',
        },
      }),
    ).toBe(1);

    const limitedPhone = '+628222222222';
    for (let attempt = 0; attempt < 5; attempt += 1) await service.requestOtp(limitedPhone);
    await expect(service.requestOtp(limitedPhone)).rejects.toMatchObject({ code: 'RATE_LIMITED' });
  });

  it('claims MFA once and deactivation revokes every session with masked audit', async () => {
    const issued = await service.issueSession(inviterId, 'MOBILE', 'BASE');
    const authenticated = await service.authenticateBearer(issued.accessToken!);
    const challenge = await service.createMfa(authenticated, 'STEP_UP');
    await service.verifyMfa(authenticated, challenge.id, 'mfa-proof');
    await expect(service.verifyMfa(authenticated, challenge.id, 'mfa-proof')).rejects.toMatchObject(
      { code: 'MFA_CHALLENGE_EXPIRED' },
    );

    await db.user.create({ data: { id: targetId, displayName: 'Integration target' } });
    await db.userRole.create({
      data: { userId: targetId, branchId, role: 'ADMIN', activeFrom: new Date() },
    });
    await service.issueSession(targetId, 'MOBILE', 'BASE');
    await service.deactivate(principal, targetId, 'integration reason', `${namespace}-deactivate`);
    expect(await db.userSession.count({ where: { userId: targetId, revokedAt: null } })).toBe(0);
    const audit = await db.auditLog.findFirstOrThrow({
      where: { correlationId: `${namespace}-deactivate` },
    });
    const serialized = JSON.stringify(audit);
    expect(serialized).not.toContain('integration reason');
    expect(serialized).not.toContain('mfa-proof');
  });

  it('enforces hidden branch and self-deactivation boundaries', async () => {
    await expect(
      service.listUsers({ ...principal, capabilities: ['user:read'] }, 'outside-branch'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      service.deactivate(principal, inviterId, 'self', `${namespace}-self`),
    ).rejects.toMatchObject({ code: 'SEPARATION_OF_DUTIES_VIOLATION' });
  });

  it('keeps concurrent linking unique and audit payloads free of raw credentials and PII', async () => {
    const token = `${namespace}-link@example.test`;
    const linked = await Promise.allSettled([
      service.linkIdentity(
        principal,
        { provider: 'GOOGLE', verifiedProviderToken: token, expectedUserId: inviterId },
        `${namespace}-link-1`,
      ),
      service.linkIdentity(
        principal,
        { provider: 'GOOGLE', verifiedProviderToken: token, expectedUserId: inviterId },
        `${namespace}-link-2`,
      ),
    ]);
    expect(linked.some(({ status }) => status === 'fulfilled')).toBe(true);
    expect(
      await db.identity.count({
        where: { provider: 'GOOGLE', subjectHash: digest(`google:${token}`) },
      }),
    ).toBe(1);
    await expect(
      service.linkIdentity(
        principal,
        { provider: 'GOOGLE', verifiedProviderToken: 'unused', expectedUserId: targetId },
        `${namespace}-mismatch`,
      ),
    ).rejects.toMatchObject({ code: 'IDENTITY_CONFLICT' });

    const auditText = JSON.stringify(
      await db.auditLog.findMany({ where: { correlationId: { startsWith: namespace } } }),
    );
    for (const raw of [
      token,
      '+628111111111',
      '+628222222222',
      '123456',
      'mfa-proof',
      'recovery-proof',
    ])
      expect(auditText).not.toContain(raw);
  });
});
