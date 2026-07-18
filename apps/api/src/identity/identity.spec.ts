import { HttpStatus } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { ConfigGatedGoogleProvider, ConfigGatedOtpProvider } from './provider-adapters';
import { ApiProblem, digest, safeEqual } from './security';
import { IdentityService } from './identity.service';

describe('identity security foundation', () => {
  const original = process.env;
  afterEach(() => {
    process.env = { ...original };
  });

  it('maps all eight application roles without treating assignments as permissions', () => {
    const policy = new PolicyService();
    const roles = [
      'CUSTOMER',
      'INSTRUCTOR',
      'ADMIN',
      'MANAGER',
      'OWNER',
      'SUPER_OWNER',
      'FINANCE',
      'OPS',
    ] as const;
    const capabilities = policy.capabilities(roles.map((role) => ({ role, branchId: 'branch-a' })));
    expect(capabilities).toEqual(
      expect.arrayContaining([
        'customer:self',
        'attendance:self',
        'branch:operate',
        'branch:manage',
        'branch:own',
        'user:admin',
        'finance:manage',
        'operations:recover',
      ]),
    );
    expect(policy.branches(roles.map((role) => ({ role, branchId: 'branch-a' })))).toEqual([
      'branch-a',
    ]);
  });

  it('denies missing capability and insufficient assurance', () => {
    const policy = new PolicyService();
    expect(() => policy.requireCapability(['user:read'], 'user:admin')).toThrow('FORBIDDEN');
    expect(() => policy.requireMfa('BASE')).toThrow('MFA_REQUIRED');
  });

  it('uses constant-time digest comparison semantics', () => {
    expect(safeEqual('proof', 'proof')).toBe(true);
    expect(safeEqual('proof', 'different')).toBe(false);
    expect(digest('secret')).not.toContain('secret');
  });

  it('fails closed when a real provider is not configured', async () => {
    process.env = { ...original, NODE_ENV: 'production', AUTH_SYNTHETIC_ENABLED: 'true' };
    await expect(new ConfigGatedGoogleProvider().verify('token', 'nonce')).rejects.toMatchObject({
      code: 'CONFIGURATION_REQUIRED',
      status: HttpStatus.SERVICE_UNAVAILABLE,
    });
    await expect(new ConfigGatedOtpProvider().send('+628123456789')).rejects.toBeInstanceOf(
      ApiProblem,
    );
  });

  it('allows deterministic synthetic adapters only outside production', async () => {
    process.env = {
      ...original,
      NODE_ENV: 'test',
      AUTH_SYNTHETIC_ENABLED: 'true',
      AUTH_SYNTHETIC_OTP_CODE: '123456',
    };
    await expect(
      new ConfigGatedGoogleProvider().verify('opaque-test-token', 'nonce'),
    ).resolves.toMatchObject({ provider: 'GOOGLE' });
    const otp = await new ConfigGatedOtpProvider().send('+628123456789');
    expect(otp.proofHash).toBe(digest(`${digest('+628123456789')}:123456`));
  });

  it('rotates refresh tokens within one family and revokes reused families', async () => {
    process.env = {
      ...original,
      AUTH_ACCESS_TTL_SECONDS: '60',
      AUTH_REFRESH_TTL_SECONDS: '120',
    };
    const activeSession = {
      id: 'session-old',
      userId: 'user-1',
      channel: 'MOBILE',
      assurance: 'BASE',
      tokenFamilyHash: 'family-hash',
      refreshExpiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      user: { id: 'user-1', status: 'ACTIVE' },
    };
    const db = {
      userSession: {
        findUnique: jest.fn().mockResolvedValue(activeSession),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({}),
      },
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'user-1', displayName: 'User', status: 'ACTIVE', roles: [] }),
      },
    };
    const service = new IdentityService(
      db as never,
      new PolicyService(),
      new ConfigGatedGoogleProvider(),
      new ConfigGatedOtpProvider(),
    );
    await service.refresh('refresh-token');
    expect(db.userSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tokenFamilyHash: 'family-hash' }),
      }),
    );
    db.userSession.findUnique.mockResolvedValue({ ...activeSession, revokedAt: new Date() });
    await expect(service.refresh('reused-token')).rejects.toMatchObject({
      code: 'SESSION_REVOKED',
    });
    expect(db.userSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ revocationReason: 'REFRESH_REUSE_DETECTED' }),
      }),
    );
  });
});
