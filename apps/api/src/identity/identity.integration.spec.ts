import { PrismaClient } from '@prisma/client';
import { IdentityService } from './identity.service';
import { PolicyService } from './policy.service';
import {
  ConfigGatedGoogleProvider,
  ConfigGatedOtpProvider,
  ConfigGatedProofProvider,
} from './provider-adapters';
import { RateLimitService } from './rate-limit.service';
import { ResendPasswordEmailProvider } from './email-provider';
import { digest } from './security';
import { randomUUID } from 'node:crypto';
import { IdentityReviewQueryService } from './identity-review-query.service';
import { AssignmentService } from './assignment.service';
import { UserAdministrationService } from './user-administration.service';
import { IdempotencyService } from '../foundation/idempotency.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;

databaseDescribe('identity MySQL integration', () => {
  const db = new PrismaClient();
  const namespace = `it-${Date.now()}`;
  const branchId = randomUUID();
  const inviterId = randomUUID();
  const targetId = randomUUID();
  const otpUserId = randomUUID();
  const assignmentUserId = randomUUID();
  const reviewStatuses = [
    'PENDING',
    'APPROVED',
    'REJECTED',
    'PENDING_DELETION',
    'DELETE_FAILED',
    'DELETED',
  ] as const;
  const reviewFixtures = reviewStatuses.map((status, index) => ({
    userId: randomUUID(),
    documentId: randomUUID(),
    status,
    displayName: `${namespace} Review Fixture ${index + 1}`,
    phoneE164: `+6287000000${String(index).padStart(2, '0')}`,
  }));
  let service: IdentityService;
  let reviewQueries: IdentityReviewQueryService;
  let assignments: AssignmentService;
  let users: UserAdministrationService;
  let previousRbacPolicySource: string | undefined;

  beforeAll(async () => {
    previousRbacPolicySource = process.env.RBAC_POLICY_SOURCE;
    process.env.RBAC_POLICY_SOURCE = 'static';
    process.env.NODE_ENV = 'test';
    process.env.AUTH_SYNTHETIC_ENABLED = 'true';
    process.env.AUTH_SYNTHETIC_OTP_CODE = '123456';
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
      data: { userId: inviterId, branchId: null, role: 'SUPER_OWNER', activeFrom: new Date() },
    });
    await db.user.create({ data: { id: assignmentUserId, displayName: 'Assignment target' } });
    await db.user.create({ data: { id: otpUserId, displayName: 'Integration OTP user' } });
    await db.user.createMany({
      data: reviewFixtures.map(({ userId, displayName, phoneE164 }) => ({
        id: userId,
        displayName,
        phoneE164,
      })),
    });
    await db.identityVerificationDocument.createMany({
      data: reviewFixtures.map(({ userId, documentId, status }, index) => ({
        id: documentId,
        userId,
        kind: index % 2 === 0 ? ('SELFIE' as const) : ('KTP_FRONT' as const),
        status,
        checksum: digest(`${namespace}:${documentId}`),
        fileName: 'fixture.png',
        mimeType: 'image/png',
        sizeBytes: 1024,
        uploadStatus: 'FINALIZED' as const,
        scanStatus: 'CLEAN' as const,
        uploadedAt: new Date(Date.now() - (reviewFixtures.length - index) * 60_000),
        finalizedAt: new Date(Date.now() - (reviewFixtures.length - index) * 60_000),
        createdAt: new Date(Date.now() - (reviewFixtures.length - index) * 60_000),
      })),
    });
    await db.identity.create({
      data: {
        id: randomUUID(),
        userId: otpUserId,
        provider: 'WHATSAPP_PHONE',
        subjectHash: digest('+628111111111'),
        verifiedAt: new Date(),
      },
    });
    const policy = new PolicyService();
    const rateLimit = new RateLimitService(db as never);
    const passwordEmail = new ResendPasswordEmailProvider();
    const idempotency = new IdempotencyService(db as never);
    service = new IdentityService(
      db as never,
      policy,
      new ConfigGatedGoogleProvider(),
      new ConfigGatedOtpProvider(),
      new ConfigGatedProofProvider(),
      rateLimit,
      passwordEmail,
      idempotency,
    );
    reviewQueries = new IdentityReviewQueryService(db as never, policy);
    assignments = new AssignmentService(db as never, policy);
    users = new UserAdministrationService(
      db as never,
      policy,
      rateLimit,
      passwordEmail,
      idempotency,
    );
  });

  afterAll(async () => {
    const users = await db.user.findMany({
      where: { roles: { some: { branchId } } },
      select: { id: true },
    });
    const userIds = [
      ...new Set([
        inviterId,
        targetId,
        otpUserId,
        assignmentUserId,
        ...reviewFixtures.map(({ userId }) => userId),
        ...users.map(({ id }) => id),
      ]),
    ];
    await db.auditLog.deleteMany({
      where: {
        OR: [
          { actorId: { in: userIds } },
          { objectId: { in: userIds } },
          { targetUserId: { in: userIds } },
        ],
      },
    });
    await db.authChallenge.deleteMany({ where: { userId: { in: userIds } } });
    await db.userSession.deleteMany({ where: { userId: { in: userIds } } });
    await db.identityDocumentViewAuthorization.deleteMany({
      where: { document: { userId: { in: userIds } } },
    });
    await db.identityDocumentDeletionJob.deleteMany({
      where: { document: { userId: { in: userIds } } },
    });
    await db.identityVerificationDocument.deleteMany({ where: { userId: { in: userIds } } });
    await db.identity.deleteMany({ where: { userId: { in: userIds } } });
    await db.passwordActionToken.deleteMany({
      where: {
        OR: [{ userId: { in: userIds } }, { invitation: { invitedById: inviterId } }],
      },
    });
    await db.userInvitation.deleteMany({ where: { invitedById: inviterId } });
    await db.userRole.deleteMany({ where: { userId: { in: userIds } } });
    await db.assignment.deleteMany({ where: { userId: { in: userIds } } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
    await db.branch.deleteMany({ where: { id: branchId } });
    await db.rateLimitCounter.deleteMany({
      where: {
        subjectHash: { in: [digest('+628111111111'), digest('+628222222222')] },
      },
    });
    await db.$disconnect();
    if (previousRbacPolicySource === undefined) delete process.env.RBAC_POLICY_SOURCE;
    else process.env.RBAC_POLICY_SOURCE = previousRbacPolicySource;
  });

  const principal = {
    sessionId: 'pending',
    userId: inviterId,
    roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
    capabilities: [
      'user:read',
      'user:admin',
      'audit:read',
      'branch:all',
      'assignment:read',
      'assignment:manage',
      'identity-verification:read',
      'identity-verification:decide',
    ],
    branchIds: [branchId],
  };

  it('lists every identity lifecycle status with search, masking, summary and cursor pagination', async () => {
    for (const fixture of reviewFixtures) {
      const result = await reviewQueries.list(principal, {
        q: fixture.displayName,
        status: fixture.status,
        limit: 2,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.documents).toEqual(
        expect.arrayContaining([expect.objectContaining({ status: fixture.status })]),
      );
      expect(result.items[0]?.user.phoneMasked).not.toBe(fixture.phoneE164);
      expect(result.summary.totalCustomers).toBe(1);
    }

    const first = await reviewQueries.list(principal, {
      q: `${namespace} Review Fixture`,
      limit: 2,
    });
    expect(first.items).toHaveLength(2);
    expect(first.page.hasMore).toBe(true);
    expect(first.page.nextCursor).toEqual(expect.any(String));
    const second = await reviewQueries.list(principal, {
      q: `${namespace} Review Fixture`,
      cursor: first.page.nextCursor!,
      limit: 2,
    });
    expect(second.items).toHaveLength(2);
    expect(second.items.map(({ id }) => id)).not.toEqual(
      expect.arrayContaining(first.items.map(({ id }) => id)),
    );
  });

  it('keeps invitation and concurrent Google identity unique', async () => {
    const email = `${namespace}@example.test`;
    const first = await users.inviteUser(
      principal,
      { email, roles: ['ADMIN'], branchIds: [branchId] },
      `${namespace}-invite-1`,
    );
    const replay = await users.inviteUser(
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

  it('creates a visible pending internal user with multiple fixed-role permission bundles', async () => {
    const email = `${namespace}-multi@example.test`;
    const created = await users.inviteUser(
      principal,
      {
        email,
        displayName: 'Multi Role Staff',
        roleAssignments: [
          { role: 'ADMIN', branchId },
          { role: 'FINANCE', branchId: null },
        ],
      },
      `${namespace}-multi-create`,
    );
    const invitation = await db.userInvitation.findUniqueOrThrow({ where: { id: created.id } });
    const user = await users.getUser(principal, invitation.userId!);
    expect(user.status).toBe('PENDING_ACTIVATION');
    expect(user.directRoles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ role: 'ADMIN', branchId }),
        expect.objectContaining({ role: 'FINANCE', branchId: null }),
      ]),
    );
    expect(user.effectiveCapabilities).toEqual(
      expect.arrayContaining(['booking:read', 'finance:read']),
    );
    const audit = await users.listAuditLogs(principal, {
      targetUserId: user.id,
      action: 'security.user_created',
    });
    expect(audit.items).toHaveLength(1);
    expect(audit.items[0]).toMatchObject({
      targetUserId: user.id,
      correlationId: `${namespace}-multi-create`,
    });
  });

  it('returns authoritative session expiry and active branch contexts', async () => {
    const inactiveBranchId = randomUUID();
    await db.branch.create({
      data: {
        id: inactiveBranchId,
        code: `${namespace}-inactive`,
        name: 'Inactive integration branch',
        timezone: 'Asia/Makassar',
        active: false,
      },
    });
    try {
      const issued = await service.issueSession(inviterId, 'WEB');
      const principal = await service.authenticateBearer(issued.webCookieToken!);
      const view = await service.meForSession(principal);
      expect(view.sessionExpiresAt).toBe(issued.expiresAt);
      expect(view.branches).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: branchId, code: namespace, timezone: 'Asia/Jakarta' }),
        ]),
      );
      expect(view.branches).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ id: inactiveBranchId })]),
      );
    } finally {
      await db.branch.delete({ where: { id: inactiveBranchId } });
    }
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

  it('deactivation revokes every session with masked audit', async () => {
    await db.user.create({ data: { id: targetId, displayName: 'Integration target' } });
    await db.userRole.create({
      data: { userId: targetId, branchId, role: 'ADMIN', activeFrom: new Date() },
    });
    await service.issueSession(targetId, 'MOBILE');
    await users.deactivate(principal, targetId, 'integration reason', 0, `${namespace}-deactivate`);
    expect(await db.userSession.count({ where: { userId: targetId, revokedAt: null } })).toBe(0);
    const audit = await db.auditLog.findFirstOrThrow({
      where: { correlationId: `${namespace}-deactivate` },
    });
    const serialized = JSON.stringify(audit);
    expect(serialized).not.toContain('integration reason');
  });

  it('enforces hidden branch and self-deactivation boundaries', async () => {
    await expect(
      users.listUsers(
        { ...principal, capabilities: ['user:read'] },
        { branchId: 'outside-branch' },
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      users.deactivate(principal, inviterId, 'self', 0, `${namespace}-self`),
    ).rejects.toMatchObject({ code: 'SEPARATION_OF_DUTIES_VIOLATION' });
  });

  it('returns capability-scoped user totals independent of the selected status filter', async () => {
    const result = await users.listUsers(principal, { branchId, status: 'ACTIVE' });
    expect(result.items.every((user) => user.status === 'ACTIVE')).toBe(true);
    expect(result.summary.total).toBeGreaterThanOrEqual(result.items.length);
    expect(result.summary.active).toBeGreaterThanOrEqual(result.items.length);
    expect(result.summary.pendingActivation + result.summary.inactive).toBeGreaterThanOrEqual(0);
  });

  it('returns minimal branch-scoped lookup data and filters instructors', async () => {
    const instructorId = randomUUID();
    await db.user.create({ data: { id: instructorId, displayName: 'Lookup Instructor' } });
    await db.userRole.create({
      data: { userId: instructorId, branchId, role: 'INSTRUCTOR', activeFrom: new Date() },
    });
    const result = await users.lookupUsers(
      { ...principal, capabilities: ['class-slot:read'] },
      { branchId, q: 'Lookup', instructorsOnly: true },
    );
    expect(result.items).toEqual([
      expect.objectContaining({
        id: instructorId,
        label: 'Lookup Instructor',
        metadata: expect.objectContaining({ roles: ['INSTRUCTOR'], branchIds: [branchId] }),
      }),
    ]);
    expect(JSON.stringify(result)).not.toContain('phoneE164');
    await expect(
      users.lookupUsers(
        { ...principal, capabilities: ['class-slot:read'], branchIds: [] },
        { branchId, instructorsOnly: true },
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('updates assignable roles with concurrency, revokes sessions, reactivates and exposes audit', async () => {
    await users.reactivate(principal, targetId, 'returning staff', 1, `${namespace}-reactivate`);
    const before = await users.getUser(principal, targetId);
    await service.issueSession(targetId, 'MOBILE', 'BASE');
    const updated = await users.updateUserRoles(
      principal,
      targetId,
      {
        roles: [{ role: 'MANAGER', branchId }],
        expectedVersion: before.version,
        reason: 'responsibility changed',
      },
      `${namespace}-roles`,
      randomUUID(),
    );
    expect(updated.roles).toEqual(
      expect.arrayContaining([expect.objectContaining({ role: 'MANAGER', branchId })]),
    );
    expect(await db.userSession.count({ where: { userId: targetId, revokedAt: null } })).toBe(0);
    await expect(
      users.updateUserRoles(
        principal,
        targetId,
        {
          roles: [{ role: 'ADMIN', branchId }],
          expectedVersion: before.version,
          reason: 'stale update',
        },
        `${namespace}-roles-stale`,
        randomUUID(),
      ),
    ).rejects.toMatchObject({ code: 'STALE_VERSION' });
    await expect(
      users.updateUserRoles(
        principal,
        targetId,
        {
          roles: [{ role: 'SUPER_OWNER' }],
          expectedVersion: updated.version,
          reason: 'forbidden escalation',
        },
        `${namespace}-roles-forbidden`,
        randomUUID(),
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect((await users.listUserAudit(principal, targetId)).items.length).toBeGreaterThan(0);
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
    for (const raw of [token, '+628111111111', '+628222222222', '123456', 'recovery-proof'])
      expect(auditText).not.toContain(raw);
  });

  it('creates one assignment and linked role projection with a masked audit', async () => {
    const created = await assignments.create(
      principal,
      {
        userId: assignmentUserId,
        branchId,
        assignmentType: 'INSTRUCTOR',
        activeFrom: '2026-08-01',
        activeUntil: null,
        reason: 'raw operational reason',
      },
      `${namespace}-assignment-create`,
    );
    const assignment = await db.assignment.findUniqueOrThrow({
      where: { id: created.id },
      include: { projectedRole: true },
    });
    expect(assignment.projectedRole?.activeFrom.toISOString()).toBe('2026-07-31T17:00:00.000Z');
    expect(assignment.projectedRole?.activeUntil).toBeNull();
    expect(
      await db.auditLog.count({ where: { correlationId: `${namespace}-assignment-create` } }),
    ).toBe(1);
    expect(
      JSON.stringify(
        await db.auditLog.findFirstOrThrow({
          where: { correlationId: `${namespace}-assignment-create` },
        }),
      ),
    ).not.toContain('raw operational reason');
    expect((await assignments.list(principal, { branchId })).items).toHaveLength(1);
  });

  it('rejects overlap and permits only one concurrent create without partial projection', async () => {
    await expect(
      assignments.create(
        principal,
        {
          userId: assignmentUserId,
          branchId,
          assignmentType: 'INSTRUCTOR',
          activeFrom: '2026-08-05',
          activeUntil: '2026-08-12',
          reason: 'overlap',
        },
        `${namespace}-overlap`,
      ),
    ).rejects.toMatchObject({ code: 'EFFECTIVE_PERIOD_OVERLAP' });

    const concurrent = await Promise.allSettled([
      assignments.create(
        principal,
        {
          userId: assignmentUserId,
          branchId,
          assignmentType: 'OWNER',
          activeFrom: '2026-09-01',
          activeUntil: null,
          reason: 'first',
        },
        `${namespace}-concurrent-1`,
      ),
      assignments.create(
        principal,
        {
          userId: assignmentUserId,
          branchId,
          assignmentType: 'OWNER',
          activeFrom: '2026-09-01',
          activeUntil: null,
          reason: 'second',
        },
        `${namespace}-concurrent-2`,
      ),
    ]);
    expect(concurrent.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    expect(
      await db.assignment.count({
        where: { userId: assignmentUserId, branchId, type: 'OWNER' },
      }),
    ).toBe(1);
    expect(
      await db.userRole.count({
        where: {
          userId: assignmentUserId,
          branchId,
          role: 'OWNER',
          sourceAssignmentId: { not: null },
        },
      }),
    ).toBe(1);
  });

  it('ends once with branch-local boundary and keeps /me projection consistent', async () => {
    const assignment = await db.assignment.findFirstOrThrow({
      where: { userId: assignmentUserId, branchId, type: 'INSTRUCTOR' },
    });
    const ended = await assignments.end(
      principal,
      assignment.id,
      { effectiveAt: '2026-08-08T18:00:00.000Z', reason: 'end', expectedVersion: 0 },
      `${namespace}-assignment-end`,
    );
    expect(ended.version).toBe(1);
    expect(
      (await service.me(assignmentUserId, new Date('2026-08-08T16:59:59.999Z'))).roles,
    ).toContain('INSTRUCTOR');
    expect(
      (await service.me(assignmentUserId, new Date('2026-08-08T17:00:00.000Z'))).roles,
    ).not.toContain('INSTRUCTOR');
    await expect(
      assignments.end(
        principal,
        assignment.id,
        { effectiveAt: '2026-08-10T00:00:00.000Z', reason: 'again', expectedVersion: 0 },
        `${namespace}-assignment-end-again`,
      ),
    ).rejects.toMatchObject({ code: 'STALE_VERSION' });
    expect(
      await db.auditLog.count({
        where: { action: 'master.assignment_ended', objectId: assignment.id },
      }),
    ).toBe(1);
  });

  it('rejects self-escalation without mutation', async () => {
    await expect(
      assignments.create(
        principal,
        {
          userId: inviterId,
          branchId,
          assignmentType: 'OWNER',
          activeFrom: '2027-01-01',
          reason: 'self',
        },
        `${namespace}-self-assignment`,
      ),
    ).rejects.toMatchObject({ code: 'SEPARATION_OF_DUTIES_VIOLATION' });
  });
});
