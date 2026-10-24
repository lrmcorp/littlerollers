import { HttpStatus } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { PolicyService } from './policy.service';
import {
  ConfigGatedGoogleProvider,
} from './provider-adapters';
import { ApiProblem, digest, safeEqual } from './security';
import { IdentityService } from './identity.service';
import { RateLimitService } from './rate-limit.service';
import { CustomerProfileService } from './customer-profile.service';
import { IdentityDocumentAccessService } from './identity-document-access.service';
import { IdentityReviewQueryService } from './identity-review-query.service';
import { IdentityDocumentWorkflowService } from './identity-document-workflow.service';
import { UserAdministrationService } from './user-administration.service';

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
        'identity-verification:read',
        'identity-verification:decide',
        'identity-verification:delete',
      ]),
    );
    expect(policy.branches(roles.map((role) => ({ role, branchId: 'branch-a' })))).toEqual([
      'branch-a',
    ]);
  });

  it('reserves global identity review and deletion for Super Owner', () => {
    const policy = new PolicyService();
    const admin = policy.capabilities([{ role: 'ADMIN', branchId: 'branch-a' }]);
    const superOwner = policy.capabilities([{ role: 'SUPER_OWNER', branchId: null }]);
    expect(admin).not.toContain('identity-verification:read');
    expect(admin).not.toContain('identity-verification:decide');
    expect(admin).not.toContain('identity-verification:delete');
    expect(superOwner).toEqual(
      expect.arrayContaining([
        'identity-verification:read',
        'identity-verification:decide',
        'identity-verification:delete',
      ]),
    );
  });

  it('reserves customer self-service verification for customer-only sessions', () => {
    const policy = new PolicyService();
    expect(() =>
      policy.requireCustomerSelf([{ role: 'CUSTOMER', branchId: null }], ['customer:self']),
    ).not.toThrow();
    expect(() =>
      policy.requireCustomerSelf(
        [
          { role: 'CUSTOMER', branchId: null },
          { role: 'ADMIN', branchId: 'branch-a' },
        ],
        ['customer:self', 'identity-verification:read'],
      ),
    ).toThrow(ApiProblem);
    expect(() =>
      policy.requireCustomerSelf(
        [{ role: 'SUPER_OWNER', branchId: null }],
        ['identity-verification:read'],
      ),
    ).toThrow(ApiProblem);
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
      cabang: { findMany: jest.fn().mockResolvedValue([]) },
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
      user: { findUnique: jest.fn().mockResolvedValue(null) },
      identitas: { findUnique: jest.fn().mockResolvedValue(null) },
      userInvitation: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const service = new IdentityService(
      {
        user: tx.user,
        userInvitation: tx.userInvitation,
        $transaction: (callback: (client: typeof tx) => unknown) => callback(tx),
      } as never,
      new PolicyService(),
      new ConfigGatedGoogleProvider(),
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

  it('automatically registers public customer via Google when channel is WEB', async () => {
    process.env = {
      ...original,
      NODE_ENV: 'test',
      AUTH_SYNTHETIC_ENABLED: 'true',
    };
    const createdUser = {
      id: 'new-user-1',
      email: 'new-customer@example.test',
      displayName: 'new-customer',
      role: 'MEMBER',
      status: 'ACTIVE',
    };
    const tx = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where }: { where: { email?: string; id?: string } }) => {
          if (where.email) return Promise.resolve(null);
          if (where.id) return Promise.resolve(createdUser);
          return Promise.resolve(null);
        }),
        create: jest.fn().mockResolvedValue(createdUser),
      },
      userInvitation: { findFirst: jest.fn().mockResolvedValue(null) },
      userSession: {
        create: jest.fn().mockResolvedValue({ id: 'session-1' }),
      },
      cabang: { findMany: jest.fn().mockResolvedValue([]) },
      profilPengguna: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    const service = new IdentityService(
      {
        user: tx.user,
        userInvitation: tx.userInvitation,
        userSession: tx.userSession,
        cabang: tx.cabang,
        profilPengguna: tx.profilPengguna,
        $transaction: (callback: (client: typeof tx) => unknown) => callback(tx),
      } as never,
      new PolicyService(),
      new ConfigGatedGoogleProvider(),
      { consume: jest.fn() } as never,
      { sendAction: jest.fn() } as never,
    );
    const session = await service.authenticateGoogle(
      { idToken: 'new-customer@example.test', nonce: 'nonce', channel: 'WEB' },
      'correlation',
    );
    expect(session).toBeDefined();
    expect(tx.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new-customer@example.test',
          role: 'MEMBER',
          status: 'ACTIVE',
        }),
      }),
    );
  });

  it('verifies real Google JWT idToken via OAuth2Client and extracts legitimate email even when synthetic is enabled', async () => {
    process.env = {
      ...original,
      NODE_ENV: 'test',
      AUTH_SYNTHETIC_ENABLED: 'true',
      GOOGLE_CLIENT_ID: 'test-google-client-id',
    };
    const spy = jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({
        sub: 'google-sub-12345',
        email: 'real.user@gmail.com',
        email_verified: true,
        name: 'Real User',
        nonce: 'valid-nonce',
      }),
    } as never);

    const provider = new ConfigGatedGoogleProvider();
    const fakeJwt = 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjM0NSJ9.valid-signature';
    const verified = await provider.verify(fakeJwt, 'valid-nonce');

    expect(verified.email).toBe('real.user@gmail.com');
    expect(verified.displayName).toBe('Real User');
    expect(verified.subjectHash).toBe(digest('google:google-sub-12345'));
    expect(spy).toHaveBeenCalledWith({
      idToken: fakeJwt,
      audience: 'test-google-client-id',
    });
    spy.mockRestore();
  });

  it('updates permitted staff profile fields with versioning and without revoking sessions', async () => {
    const role = {
      role: 'ADMIN' as const,
      branchId: 'branch-a',
      sourceAssignmentId: null,
      cabang: { id: 'branch-a', code: 'JKT', name: 'Jakarta' },
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
        update: jest.fn().mockResolvedValue(after),
      },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      userSession: { updateMany: jest.fn() },
      $transaction: (callback: (client: unknown) => unknown) => callback(db),
    };
    const service = new UserAdministrationService(
      db as never,
      new PolicyService(),
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
    expect(db.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'staff-1' } }),
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
        update: jest.fn().mockResolvedValue(after),
      },
      cabang: { findFirst: jest.fn().mockResolvedValue({ id: 'branch-jkt' }) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      $transaction: (callback: (client: unknown) => unknown) => callback(db),
    };
    const profiles = new CustomerProfileService(db as never);
    const result = await profiles.update(
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
    expect(db.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'customer-1' },
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
      dokumenVerifikasiIdentitas: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'document-1',
          userId: 'customer-1',
          kind: 'SELFIE',
          objectKey: 'identity/customer-1/selfie/document-1',
        }),
      },
      otorisasiLihatDokumenIdentitas: {
        create: jest.fn().mockResolvedValue({ id: 'authorization-1' }),
      },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    const storage = { exists: jest.fn().mockResolvedValue(true) };
    const service = new IdentityDocumentAccessService(new PolicyService(), db as never);
    const principal = {
      sessionId: 'session-1',
      userId: 'customer-1',
      roles: [{ role: 'CUSTOMER' as const, branchId: null }],
      capabilities: ['customer:self'],
      branchIds: [],
    };
    await expect(service.authorizeSelf(principal, 'SELFIE', 'correlation-1')).resolves.toEqual({
      url: '/api/v1/identity-verification-files/authorization-1/content',
      expiresAt: expect.any(String),
    });
    expect(db.dokumenVerifikasiIdentitas.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'customer-1' }) }),
    );
    expect(db.otorisasiLihatDokumenIdentitas.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          viewerId: 'customer-1',
          purpose: 'SELF_VIEW',
          documentId: 'document-1',
        }),
      }),
    );
    await expect(
      service.authorizeSelf(
        { ...principal, roles: [{ role: 'ADMIN', branchId: 'branch-jkt' }] },
        'SELFIE',
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses reviewer authorization unless the active file is finalized and clean', async () => {
    const findUnique = jest.fn();
    const db = {
      dokumenVerifikasiIdentitas: { findUnique },
      otorisasiLihatDokumenIdentitas: { create: jest.fn() },
      auditLog: { create: jest.fn() },
    };
    const storage = { exists: jest.fn().mockResolvedValue(true) };
    const service = new IdentityDocumentAccessService(new PolicyService(), db as never);
    const principal = {
      sessionId: 'review-session',
      userId: 'reviewer-1',
      roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
      capabilities: ['branch:all', 'identity-verification:read'],
      branchIds: [],
    };
    const baseline = {
      id: 'document-1',
      userId: 'customer-1',
      objectKey: 'identity/customer-1/document-1',
      status: 'PENDING',
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN',
      replacedById: null,
    };
    for (const unsafe of [
      { uploadStatus: 'PENDING' },
      { scanStatus: 'PENDING' },
      { scanStatus: 'INFECTED' },
      { status: 'DELETED' },
      { replacedById: 'document-2' },
    ]) {
      findUnique.mockResolvedValueOnce({ ...baseline, ...unsafe });
      await expect(
        service.authorizeReview(principal, baseline.id, 'correlation-1'),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    }
    expect(db.otorisasiLihatDokumenIdentitas.create).not.toHaveBeenCalled();
  });

  it('revalidates document lifecycle when a one-time reviewer authorization is consumed', async () => {
    const db = {
      dokumenVerifikasiIdentitas: { findUnique: jest.fn() },
      otorisasiLihatDokumenIdentitas: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'authorization-1',
          viewerId: 'reviewer-1',
          purpose: 'REVIEW',
          consumedAt: null,
          expiresAt: new Date(Date.now() + 60_000),
          document: {
            id: 'document-1',
            userId: 'customer-1',
            objectKey: 'identity/customer-1/document-1',
            status: 'PENDING',
            uploadStatus: 'FINALIZED',
            scanStatus: 'ERROR',
            replacedById: null,
          },
        }),
        updateMany: jest.fn(),
      },
      auditLog: { create: jest.fn() },
    };
    const storage = { read: jest.fn() };
    const service = new IdentityDocumentAccessService(new PolicyService());
    await expect(
      service.read(
        {
          sessionId: 'review-session',
          userId: 'reviewer-1',
          roles: [{ role: 'SUPER_OWNER', branchId: null }],
          capabilities: ['branch:all', 'identity-verification:read'],
          branchIds: [],
        },
        'authorization-1',
        'correlation-1',
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(db.otorisasiLihatDokumenIdentitas.updateMany).not.toHaveBeenCalled();
    expect(storage.read).not.toHaveBeenCalled();
    expect(db.auditLog.create).not.toHaveBeenCalled();
  });

  it('groups the review queue by customer with masked contact, summary and all lifecycle statuses', async () => {
    const createdAt = new Date('2026-07-20T02:00:00.000Z');
    const groupBy = jest
      .fn()
      .mockResolvedValueOnce([{ userId: 'customer-1', _min: { createdAt } }])
      .mockResolvedValueOnce([{ userId: 'customer-1' }]);
    const count = jest
      .fn()
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);
    const document = (input: { id: string; kind: 'SELFIE' | 'KTP_FRONT'; status: string }) => ({
      ...input,
      userId: 'customer-1',
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN',
      fileName: 'private.png',
      mimeType: 'image/png',
      sizeBytes: 1024,
      rejectionReasonCode: input.status === 'REJECTED' ? 'BLURRY' : null,
      rejectionNote: null,
      issuedAt: createdAt,
      uploadedAt: createdAt,
      finalizedAt: createdAt,
      reviewedAt: null,
      deletedAt: null,
      version: 1,
      createdAt,
      user: {
        id: 'customer-1',
        displayName: 'Ayu Customer',
        phoneE164: '+628123456789',
        status: 'ACTIVE',
      },
    });
    const db = {
      dokumenVerifikasiIdentitas: {
        groupBy,
        count,
        findMany: jest
          .fn()
          .mockResolvedValue([
            document({ id: 'document-selfie', kind: 'SELFIE', status: 'DELETE_FAILED' }),
            document({ id: 'document-ktp', kind: 'KTP_FRONT', status: 'REJECTED' }),
          ]),
      },
    };
    const service = new IdentityReviewQueryService(db as never, new PolicyService());
    const result = await service.list(
      {
        sessionId: 'review-session',
        userId: 'reviewer-1',
        roles: [{ role: 'SUPER_OWNER', branchId: null }],
        capabilities: ['identity-verification:read', 'branch:all'],
        branchIds: [],
      },
      { q: 'Ayu', status: 'DELETE_FAILED', limit: 20 },
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          displayName: 'Ayu Customer',
          phoneMasked: '+628*****6789',
        }),
        verificationStatus: 'ACTION_REQUIRED',
        documents: expect.arrayContaining([
          expect.objectContaining({ id: 'document-selfie', status: 'DELETE_FAILED' }),
        ]),
      }),
    );
    expect(result.summary).toEqual({
      totalCustomers: 1,
      totalDocuments: 2,
      pendingDocuments: 1,
      approvedDocuments: 0,
      rejectedDocuments: 1,
      deletionIssues: 1,
    });
    expect(result.page).toEqual({ hasMore: false, nextCursor: null });
  });

  it('reports scan-incomplete documents separately from stale decisions', async () => {
    const db = {
      dokumenVerifikasiIdentitas: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'document-1',
          replacedById: null,
          status: 'PENDING',
          scanStatus: 'PENDING',
          uploadStatus: 'FINALIZED',
          version: 2,
        }),
      },
    };
    const service = new IdentityDocumentWorkflowService();
    await expect(
      service.decideIdentityDocument(
        {
          sessionId: 'review-session',
          userId: 'reviewer-1',
          roles: [{ role: 'SUPER_OWNER', branchId: null }],
          capabilities: ['identity-verification:decide', 'branch:all'],
          branchIds: [],
        },
        'document-1',
        'APPROVED',
        { expectedVersion: 2 },
        'correlation-1',
      ),
    ).rejects.toMatchObject({ code: 'IDENTITY_DOCUMENT_NOT_READY' });
  });

  it('rate limits only on hashed subject counters', async () => {
    delete process.env.RATE_LIMIT_DISABLED;
    const upsert = jest.fn().mockResolvedValue({ attempts: 6 });
    const limiter = new RateLimitService({ rateLimitCounter: { upsert } } as never);
    await expect(limiter.consume('OTP_REQUEST', digest('+62800000000'))).rejects.toMatchObject({
      code: 'RATE_LIMITED',
    });
    expect(JSON.stringify(upsert.mock.calls)).not.toContain('+62800000000');
  });

  it('sessionMe retrieves all active branches when admin/coach has preferredBranchId: null', async () => {
    const branches = [
      { id: 'branch-jkt', code: 'DD-JKT', name: 'Daily Dose Jakarta', timezone: 'Asia/Jakarta' },
      { id: 'branch-bsd', code: 'DD-BSD', name: 'Daily Dose BSD', timezone: 'Asia/Jakarta' },
    ];
    const db = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'admin-1',
          displayName: 'Global Admin',
          role: 'ADMIN',
          status: 'ACTIVE',
          preferredBranchId: null,
        }),
      },
      cabang: {
        findMany: jest.fn().mockResolvedValue(branches),
      },
    };
    const identityService = new IdentityService(
      db as never,
      new PolicyService(),
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await (identityService as any).sessionMe('admin-1', new Date(Date.now() + 3600000));
    expect(result.capabilities).toContain('branch:all');
    expect(result.branches).toHaveLength(2);
    expect(db.cabang.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true },
      }),
    );
  });
});

describe('mobile-only auth paths stay removed', () => {
  it('has no OTP, account-recovery or account-link handlers (the recovery verify once issued a session for any user id without proof)', async () => {
    const { IdentityController } = await import('./identity.controller');
    const { IdentityService: Service } = await import('./identity.service');
    for (const name of ['requestOtp', 'verifyOtp', 'requestRecovery', 'verifyRecovery', 'linkIdentity', 'authenticateProof']) {
      expect((Service.prototype as unknown as Record<string, unknown>)[name]).toBeUndefined();
      expect((IdentityController.prototype as unknown as Record<string, unknown>)[name]).toBeUndefined();
    }
  });
});

