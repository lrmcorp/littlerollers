import { HttpStatus } from '@nestjs/common';
import { PolicyService } from './policy.service';
import {
  ConfigGatedGoogleProvider,
  ConfigGatedOtpProvider,
  ConfigGatedProofProvider,
} from './provider-adapters';
import { ApiProblem, digest, safeEqual } from './security';
import { IdentityService } from './identity.service';
import { RateLimitService } from './rate-limit.service';

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
        'identity-verification:review',
        'identity-verification:delete',
      ]),
    );
    expect(policy.branches(roles.map((role) => ({ role, branchId: 'branch-a' })))).toEqual([
      'branch-a',
    ]);
  });

  it('allows Admin to review identity evidence but reserves permanent deletion for Super Owner', () => {
    const policy = new PolicyService();
    const admin = policy.capabilities([{ role: 'ADMIN', branchId: 'branch-a' }]);
    const superOwner = policy.capabilities([{ role: 'SUPER_OWNER', branchId: null }]);
    expect(admin).toContain('identity-verification:review');
    expect(admin).not.toContain('identity-verification:delete');
    expect(superOwner).toEqual(
      expect.arrayContaining(['identity-verification:review', 'identity-verification:delete']),
    );
  });

  it('reserves payment decisions for Finance and Super Owner', () => {
    const policy = new PolicyService();
    const admin = policy.capabilities([{ role: 'ADMIN', branchId: 'branch-a' }]);
    const manager = policy.capabilities([{ role: 'MANAGER', branchId: 'branch-a' }]);
    const finance = policy.capabilities([{ role: 'FINANCE', branchId: null }]);
    const superOwner = policy.capabilities([{ role: 'SUPER_OWNER', branchId: null }]);
    expect(admin).toContain('payment:review');
    expect(admin).not.toContain('payment:decide');
    expect(manager).not.toContain('payment:decide');
    expect(finance).toEqual(
      expect.arrayContaining(['payment:review', 'payment:decide', 'finance:reconcile']),
    );
    expect(superOwner).toEqual(expect.arrayContaining(['payment:decide', 'finance:export']));
  });

  it('enforces the class workspace role matrix without a Super Admin role', () => {
    const policy = new PolicyService();
    const capabilities = (role: Parameters<PolicyService['capabilities']>[0][number]['role']) =>
      policy.capabilities([{ role, branchId: role === 'SUPER_OWNER' ? null : 'branch-a' }]);

    expect(capabilities('SUPER_OWNER')).toEqual(
      expect.arrayContaining([
        'class-slot:read',
        'class-slot:manage',
        'attendance:read',
        'attendance:manage',
      ]),
    );
    expect(capabilities('OWNER')).toContain('class-slot:read');
    expect(capabilities('OWNER')).not.toContain('class-slot:manage');
    for (const role of ['ADMIN', 'MANAGER'] as const) {
      expect(capabilities(role)).toEqual(
        expect.arrayContaining(['class-slot:read', 'class-slot:manage', 'attendance:manage']),
      );
    }
    for (const role of ['FINANCE', 'OPS'] as const) {
      expect(capabilities(role)).not.toContain('class-slot:read');
      expect(capabilities(role)).not.toContain('class-slot:manage');
    }
  });

  it('denies missing capability', () => {
    const policy = new PolicyService();
    expect(() => policy.requireCapability(['user:read'], 'user:admin')).toThrow('FORBIDDEN');
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
      AUTH_SYNTHETIC_RECOVERY_PROOF: 'recovery-proof',
    };
    await expect(
      new ConfigGatedGoogleProvider().verify('opaque-test-token', 'nonce'),
    ).resolves.toMatchObject({ provider: 'GOOGLE' });
    const otp = await new ConfigGatedOtpProvider().send('+628123456789');
    expect(otp.proofHash).toBe(digest(`${digest('+628123456789')}:123456`));
    const proofs = new ConfigGatedProofProvider();
    expect(proofs.verify('RECOVERY', digest('user-1'), 'recovery-proof')).toBe(true);
    expect(proofs.verify('RECOVERY', digest('user-1'), 'wrong')).toBe(false);
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
      tokenFamilyHash: 'family-hash',
      refreshExpiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      user: { id: 'user-1', status: 'ACTIVE' },
    };
    const db = {
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      branch: { findMany: jest.fn().mockResolvedValue([]) },
      userSession: {
        findUnique: jest.fn().mockResolvedValue(activeSession),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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
      new ConfigGatedProofProvider(),
      { consume: jest.fn() } as never,
      { sendAction: jest.fn() } as never,
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

  it('rejects arbitrary Google identity without an existing identity or invitation', async () => {
    process.env = {
      ...original,
      NODE_ENV: 'test',
      AUTH_SYNTHETIC_ENABLED: 'true',
    };
    const tx = {
      identity: { findUnique: jest.fn().mockResolvedValue(null) },
      userInvitation: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const service = new IdentityService(
      { $transaction: (callback: (client: typeof tx) => unknown) => callback(tx) } as never,
      new PolicyService(),
      new ConfigGatedGoogleProvider(),
      new ConfigGatedOtpProvider(),
      new ConfigGatedProofProvider(),
      { consume: jest.fn() } as never,
      { sendAction: jest.fn() } as never,
    );
    await expect(
      service.authenticateGoogle(
        { idToken: 'not-invited@example.test', nonce: 'nonce', channel: 'MOBILE' },
        'correlation',
      ),
    ).rejects.toMatchObject({ code: 'AUTHENTICATION_REQUIRED' });
    expect(tx.userInvitation.findFirst).toHaveBeenCalled();
  });

  it('updates permitted staff profile fields with versioning and without revoking sessions', async () => {
    const role = {
      role: 'ADMIN' as const,
      branchId: 'branch-a',
      sourceAssignmentId: null,
      branch: { id: 'branch-a', code: 'JKT', name: 'Jakarta' },
    };
    const before = {
      id: 'staff-1',
      displayName: 'Staff Lama',
      phoneE164: null,
      status: 'ACTIVE' as const,
      version: 2,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      roles: [role],
    };
    const after = {
      ...before,
      displayName: 'Staff Baru',
      phoneE164: '+628123456789',
      version: 3,
    };
    const db = {
      user: {
        findUnique: jest.fn().mockResolvedValueOnce(before).mockResolvedValueOnce(after),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      userSession: { updateMany: jest.fn() },
      $transaction: (callback: (client: unknown) => unknown) => callback(db),
    };
    const service = new IdentityService(
      db as never,
      new PolicyService(),
      new ConfigGatedGoogleProvider(),
      new ConfigGatedOtpProvider(),
      new ConfigGatedProofProvider(),
      { consume: jest.fn() } as never,
      { sendAction: jest.fn() } as never,
    );
    const result = await service.updateUserProfile(
      {
        sessionId: 'session-1',
        userId: 'owner-1',
        roles: [{ role: 'SUPER_OWNER', branchId: null }],
        capabilities: ['user:read', 'user:admin', 'branch:all'],
        branchIds: [],
      },
      'staff-1',
      {
        displayName: ' Staff Baru ',
        phoneE164: '0812 3456 789',
        expectedVersion: 2,
        reason: 'Koreksi profil',
      },
      'correlation-1',
    );
    expect(result).toMatchObject({
      displayName: 'Staff Baru',
      phoneE164: '+628123456789',
      version: 3,
    });
    expect(db.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'staff-1', version: 2 } }),
    );
    expect(db.userSession.updateMany).not.toHaveBeenCalled();
    expect(db.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'security.user_profile_updated' }),
      }),
    );
  });

  it('updates the signed-in customer profile and persists an active preferred studio', async () => {
    const before = {
      id: 'customer-1',
      displayName: 'Customer Lama',
      email: 'customer@example.test',
      phoneE164: '+628123456789',
      status: 'ACTIVE',
      version: 4,
      preferredBranch: null,
    };
    const after = {
      ...before,
      displayName: 'Customer Baru',
      version: 5,
      preferredBranch: {
        id: 'branch-jkt',
        code: 'JKT',
        name: 'Daily Dose Jakarta',
        timezone: 'Asia/Jakarta',
        supportWhatsappE164: '+628111000001',
        active: true,
      },
    };
    const db = {
      user: {
        findUnique: jest.fn().mockResolvedValueOnce(before).mockResolvedValueOnce(after),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      branch: { findFirst: jest.fn().mockResolvedValue({ id: 'branch-jkt' }) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      $transaction: (callback: (client: unknown) => unknown) => callback(db),
    };
    const service = new IdentityService(
      db as never,
      new PolicyService(),
      new ConfigGatedGoogleProvider(),
      new ConfigGatedOtpProvider(),
      new ConfigGatedProofProvider(),
      { consume: jest.fn() } as never,
      { sendAction: jest.fn() } as never,
    );
    const result = await service.updateMyProfile(
      {
        sessionId: 'session-1',
        userId: 'customer-1',
        roles: [{ role: 'CUSTOMER', branchId: null }],
        capabilities: ['customer:self'],
        branchIds: [],
      },
      { displayName: ' Customer Baru ', preferredBranchId: 'branch-jkt', expectedVersion: 4 },
      'correlation-1',
    );
    expect(result).toMatchObject({
      displayName: 'Customer Baru',
      emailMasked: 'cu******@example.test',
      phoneMasked: '+628*****6789',
      preferredBranch: { id: 'branch-jkt' },
      version: 5,
    });
    expect(db.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'customer-1', version: 4, status: 'ACTIVE' },
        data: expect.objectContaining({ preferredBranchId: 'branch-jkt' }),
      }),
    );
    expect(db.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'security.my_profile_updated' }),
      }),
    );
  });

  it('issues a private one-time self-view authorization only for the customer document owner', async () => {
    const db = {
      identityVerificationDocument: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'document-1',
          userId: 'customer-1',
          kind: 'SELFIE',
          objectKey: 'identity/customer-1/selfie/document-1',
        }),
      },
      identityDocumentViewAuthorization: {
        create: jest.fn().mockResolvedValue({ id: 'authorization-1' }),
      },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    const storage = { exists: jest.fn().mockResolvedValue(true) };
    const service = new IdentityService(
      db as never,
      new PolicyService(),
      new ConfigGatedGoogleProvider(),
      new ConfigGatedOtpProvider(),
      new ConfigGatedProofProvider(),
      { consume: jest.fn() } as never,
      { sendAction: jest.fn() } as never,
      undefined,
      storage as never,
    );
    const principal = {
      sessionId: 'session-1',
      userId: 'customer-1',
      roles: [{ role: 'CUSTOMER' as const, branchId: null }],
      capabilities: ['customer:self'],
      branchIds: [],
    };
    await expect(
      service.authorizeMyIdentityDocument(principal, 'SELFIE', 'correlation-1'),
    ).resolves.toEqual({
      url: '/api/v1/identity-verification-files/authorization-1/content',
      expiresAt: expect.any(String),
    });
    expect(db.identityVerificationDocument.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'customer-1' }) }),
    );
    expect(db.identityDocumentViewAuthorization.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          viewerId: 'customer-1',
          purpose: 'SELF_VIEW',
          documentId: 'document-1',
        }),
      }),
    );
    await expect(
      service.authorizeMyIdentityDocument(
        { ...principal, roles: [{ role: 'ADMIN', branchId: 'branch-jkt' }] },
        'SELFIE',
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rate limits only on hashed subject counters', async () => {
    const upsert = jest.fn().mockResolvedValue({ attempts: 6 });
    const limiter = new RateLimitService({ rateLimitCounter: { upsert } } as never);
    await expect(limiter.consume('OTP_REQUEST', digest('+62800000000'))).rejects.toMatchObject({
      code: 'RATE_LIMITED',
    });
    expect(JSON.stringify(upsert.mock.calls)).not.toContain('+62800000000');
  });
});
