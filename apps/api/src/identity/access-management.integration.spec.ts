import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { IdempotencyService } from '../foundation/idempotency.service';
import { AccessManagementService } from './access-management.service';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;

databaseDescribe('dynamic RBAC MySQL integration', () => {
  const db = new PrismaClient();
  const namespace = `rbac-it-${Date.now()}`;
  const actorId = randomUUID();
  const targetId = randomUUID();
  const branchA = randomUUID();
  const branchB = randomUUID();
  const service = new AccessManagementService(
    db as never,
    new PolicyService(db as never),
    new IdempotencyService(db as never),
    { value: { rbac: { managementEnabled: true } } } as never,
  );
  const principal: SessionPrincipal = {
    sessionId: randomUUID(),
    userId: actorId,
    capabilities: ['role-permission:manage', 'branch:all'],
    branchIds: [],
    roles: [{ role: 'SUPER_OWNER', branchId: null }],
    capabilityGrants: [
      {
        capability: 'role-permission:manage',
        branchId: null,
        source: 'SYSTEM_ROLE',
        sourceId: 'SUPER_OWNER',
      },
    ],
    capabilityDenials: [],
  };
  let customRoleId = '';

  beforeAll(async () => {
    process.env.RBAC_POLICY_SOURCE = 'database';
    await db.$connect();
    await db.branch.createMany({
      data: [
        { id: branchA, code: `${namespace}-a`, name: 'RBAC A', timezone: 'Asia/Jakarta' },
        { id: branchB, code: `${namespace}-b`, name: 'RBAC B', timezone: 'Asia/Jakarta' },
      ],
    });
    await db.user.createMany({
      data: [
        { id: actorId, displayName: 'RBAC Super Owner' },
        { id: targetId, displayName: 'RBAC Target' },
      ],
    });
    await db.userRole.create({
      data: { userId: actorId, role: 'SUPER_OWNER', activeFrom: new Date() },
    });
    await db.userSession.create({
      data: {
        id: randomUUID(),
        userId: targetId,
        channel: 'WEB',
        tokenFamilyHash: `${namespace}-family`,
        accessTokenHash: `${namespace}-access`,
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });
  });

  afterAll(async () => {
    await db.auditLog.deleteMany({
      where: { OR: [{ actorId }, { targetUserId: targetId }, { objectId: customRoleId }] },
    });
    await db.idempotencyRecord.deleteMany({
      where: { scope: { startsWith: `access:${actorId}:` } },
    });
    await db.userSession.deleteMany({ where: { userId: { in: [actorId, targetId] } } });
    await db.userCapabilityOverride.deleteMany({ where: { userId: targetId } });
    await db.accessRoleAssignment.deleteMany({ where: { userId: targetId } });
    await db.userRole.deleteMany({ where: { userId: { in: [actorId, targetId] } } });
    if (customRoleId) {
      await db.roleCapability.deleteMany({ where: { roleId: customRoleId } });
      await db.roleDefinition.deleteMany({ where: { id: customRoleId } });
    }
    await db.user.deleteMany({ where: { id: { in: [actorId, targetId] } } });
    await db.branch.deleteMany({ where: { id: { in: [branchA, branchB] } } });
    await db.$disconnect();
  });

  it('creates a custom role idempotently and keeps grants scoped to its branch', async () => {
    const key = randomUUID();
    const input = {
      code: `${namespace}_operator`.replaceAll('-', '_').toUpperCase(),
      displayName: 'Scoped Operator',
      description: 'Integration role scoped to one branch.',
      scope: 'BRANCH' as const,
      capabilityKeys: ['class-slot:manage', 'class-slot:read'],
      reasonCode: 'POLICY_UPDATE',
    };
    const first = (await service.createRole(
      principal,
      input,
      key,
      `${namespace}-create`,
    )) as unknown as { id: string };
    const replay = (await service.createRole(
      principal,
      input,
      key,
      `${namespace}-create`,
    )) as unknown as { id: string };
    expect(replay.id).toBe(first.id);
    customRoleId = first.id;

    await service.replaceUserRoles(
      principal,
      targetId,
      {
        roles: [{ roleId: customRoleId, branchId: branchA }],
        expectedVersion: 0,
        reasonCode: 'ROLE_REPLACEMENT',
      },
      randomUUID(),
      `${namespace}-assign`,
    );
    const access = await new PolicyService(db as never).resolveAccess(targetId, []);
    const policy = new PolicyService();
    expect(policy.hasCapability(access, 'class-slot:manage', branchA)).toBe(true);
    expect(policy.hasCapability(access, 'class-slot:manage', branchB)).toBe(false);
    expect(
      await db.userSession.count({
        where: { userId: targetId, revokedAt: { not: null } },
      }),
    ).toBe(1);
  });

  it('applies matching DENY before a global GRANT until explicit revoke', async () => {
    await service.createOverride(
      principal,
      targetId,
      {
        capabilityKey: 'attendance:read',
        effect: 'GRANT',
        branchId: null,
        reasonCode: 'ACCESS_EXCEPTION',
      },
      randomUUID(),
      `${namespace}-grant`,
    );
    await service.createOverride(
      principal,
      targetId,
      {
        capabilityKey: 'attendance:read',
        effect: 'DENY',
        branchId: branchB,
        reasonCode: 'SECURITY_RESTRICTION',
      },
      randomUUID(),
      `${namespace}-deny`,
    );
    const policy = new PolicyService(db as never);
    let access = await policy.resolveAccess(targetId, []);
    expect(policy.hasCapability(access, 'attendance:read', branchA)).toBe(true);
    expect(policy.hasCapability(access, 'attendance:read', branchB)).toBe(false);

    const denied = await db.userCapabilityOverride.findFirstOrThrow({
      where: {
        userId: targetId,
        capabilityKey: 'attendance:read',
        branchId: branchB,
        revokedAt: null,
      },
    });
    await service.revokeOverride(
      principal,
      targetId,
      denied.id,
      { expectedVersion: denied.version, reasonCode: 'ACCESS_CORRECTION' },
      randomUUID(),
      `${namespace}-revoke`,
    );
    access = await policy.resolveAccess(targetId, []);
    expect(policy.hasCapability(access, 'attendance:read', branchB)).toBe(true);
  });

  it('blocks self-access changes and core capability overrides for Super Owner', async () => {
    const superOwnerRole = await db.roleDefinition.findUniqueOrThrow({
      where: { systemRole: 'SUPER_OWNER' },
    });
    await expect(
      service.replaceRoleCapabilities(
        principal,
        superOwnerRole.id,
        {
          capabilityKeys: ['role-permission:manage', 'user:admin', 'audit:read', 'branch:all'],
          expectedVersion: superOwnerRole.version,
          reasonCode: 'POLICY_UPDATE',
        },
        randomUUID(),
        `${namespace}-fixed-system-role`,
      ),
    ).rejects.toMatchObject({ code: 'PROTECTED_ROLE_CHANGE' });
    await expect(
      service.replaceUserRoles(
        principal,
        actorId,
        {
          roles: [{ roleId: superOwnerRole.id }],
          expectedVersion: 0,
          reasonCode: 'ROLE_REPLACEMENT',
        },
        randomUUID(),
        `${namespace}-self`,
      ),
    ).rejects.toMatchObject({ code: 'SELF_ACCESS_CHANGE_FORBIDDEN' });
    const target = await db.user.findUniqueOrThrow({ where: { id: targetId } });
    await service.replaceUserRoles(
      principal,
      targetId,
      {
        roles: [{ roleId: superOwnerRole.id }],
        expectedVersion: target.version,
        reasonCode: 'ROLE_REPLACEMENT',
      },
      randomUUID(),
      `${namespace}-promote`,
    );
    await expect(
      service.createOverride(
        principal,
        targetId,
        {
          capabilityKey: 'audit:read',
          effect: 'DENY',
          reasonCode: 'SECURITY_RESTRICTION',
        },
        randomUUID(),
        `${namespace}-protected`,
      ),
    ).rejects.toMatchObject({ code: 'PROTECTED_CAPABILITY' });
  });

  it('rejects an unauthorized caller', async () => {
    await expect(
      service.listCapabilities(
        {
          ...principal,
          capabilities: ['user:read'],
          capabilityGrants: [],
        },
        {},
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
