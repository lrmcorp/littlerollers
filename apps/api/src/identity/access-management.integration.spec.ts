import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { IdempotencyService } from '../foundation/idempotency.service';
import { AccessManagementService } from './access-management.service';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';

// Integration test berjalan dengan koneksi MySQL nyata.
// DATABASE_URL dimuat otomatis dari root .env oleh jest.setup.cjs.
const databaseDescribe = describe;

databaseDescribe('access management integration', () => {
  const db = new PrismaClient();
  const namespace = `rbac-it-${Date.now()}`;
  const actorId = randomUUID();
  const targetId = randomUUID();
  const branchA = randomUUID();
  const branchB = randomUUID();
  const service = new AccessManagementService(
    db as never,
    new PolicyService(),
    new IdempotencyService(db as never),
  );
  const principal: SessionPrincipal = {
    sessionId: randomUUID(),
    userId: actorId,
    capabilities: ['role-permission:manage', 'branch:all'],
    branchIds: [],
    roles: [{ role: 'SUPER_OWNER', branchId: null }],
  };

  beforeAll(async () => {
    await db.$connect();
    await db.cabang.createMany({
      data: [
        { id: branchA, code: `${namespace}-a`, name: 'RBAC A', timezone: 'Asia/Jakarta' },
        { id: branchB, code: `${namespace}-b`, name: 'RBAC B', timezone: 'Asia/Jakarta' },
      ],
    });
    await db.user.createMany({
      data: [
        { id: actorId, displayName: 'RBAC Super Owner', role: 'SUPER_OWNER' },
        { id: targetId, displayName: 'RBAC Target', role: 'CUSTOMER' },
      ],
    });
    await db.userSession.create({
      data: {
        id: randomUUID(),
        userId: targetId,
        channel: 'WEB',
        tokenFamilyHash: `${namespace}-family`,
        accessTokenHash: `${namespace}-access`,
        refreshTokenHash: `${namespace}-refresh`,
        refreshExpiresAt: new Date(Date.now() + 86_400_000),
        expiresAt: new Date(Date.now() + 3_600_000),
      },
    });
  });

  afterAll(async () => {
    await db.userSession.deleteMany({ where: { userId: { in: [actorId, targetId] } } });
    await db.user.deleteMany({ where: { id: { in: [actorId, targetId] } } });
    await db.cabang.deleteMany({ where: { id: { in: [branchA, branchB] } } });
    await db.$disconnect();
  });

  it('lists static roles and capabilities for authorized principal', async () => {
    const roles = await service.listRoles(principal);
    expect(roles.items.length).toBeGreaterThan(0);
    expect(roles.items.some((r) => r.code === 'SUPER_OWNER')).toBe(true);

    const caps = await service.listCapabilities(principal, {});
    expect(caps.items.length).toBeGreaterThan(0);
    expect(caps.items.some((c) => c.key === 'role-permission:manage')).toBe(true);
  });

  it('resolves effective user access from system configuration', async () => {
    const access = await service.getUserAccess(principal, targetId);
    expect(access).toBeDefined();
    expect(access.user.id).toBe(targetId);
    expect(access.effective).toBeDefined();
  });

  it('rejects an unauthorized caller without role-permission:manage', async () => {
    await expect(
      service.listCapabilities(
        {
          ...principal,
          capabilities: ['user:read'],
        },
        {},
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
