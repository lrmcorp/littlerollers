import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PolicyService } from '../identity/policy.service';
import { MasterService } from './master.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;
databaseDescribe('effective master PostgreSQL integration', () => {
  const db = new PrismaClient();
  const namespace = `mst-${Date.now()}`;
  const actorId = randomUUID();
  const instructorId = randomUUID();
  let service: MasterService;
  let branchId = '';
  let classTypeId = '';
  const principal = () => ({
    sessionId: 'mst',
    userId: actorId,
    assurance: 'MFA' as const,
    roles: [
      { role: 'SUPER_OWNER' as const, branchId: null },
      { role: 'FINANCE' as const, branchId: null },
    ],
    capabilities: ['branch:all', 'master:read', 'master:manage', 'finance:manage'],
    branchIds: [branchId],
  });

  beforeAll(async () => {
    await db.$connect();
    service = new MasterService(db as never, new PolicyService());
    await db.user.createMany({
      data: [
        { id: actorId, displayName: 'Master actor' },
        { id: instructorId, displayName: 'Master instructor' },
      ],
    });
    const branch = await service.createBranch(
      principal(),
      { code: namespace, name: 'Integration Branch', timezone: 'Asia/Jakarta' },
      `${namespace}-branch`,
    );
    branchId = branch.id;
    const type = await service.createClassType(
      principal(),
      { branchId, code: 'REFORMER', name: 'Reformer' },
      `${namespace}-class`,
    );
    classTypeId = type.id;
  });
  afterAll(async () => {
    await db.auditLog.deleteMany({ where: { correlationId: { startsWith: namespace } } });
    await db.effectiveConfiguration.deleteMany({ where: { branchId } });
    await db.classType.deleteMany({ where: { branchId } });
    await db.branch.deleteMany({ where: { id: branchId } });
    await db.user.deleteMany({ where: { id: { in: [actorId, instructorId] } } });
    await db.$disconnect();
  });

  it('creates typed versions and masks raw reasons', async () => {
    const quota = await service.createSetting(
      principal(),
      {
        kind: 'QUOTA_CAPACITY',
        branchId,
        classTypeId,
        minimumQuota: 4,
        defaultCapacity: 8,
        effectiveFrom: '2026-08-01',
        reason: 'sensitive quota reason',
      },
      `${namespace}-quota`,
    );
    expect(quota.value).toEqual({ minimumQuota: 4, defaultCapacity: 8 });
    const fee = await service.createSetting(
      principal(),
      {
        kind: 'INSTRUCTOR_FEE',
        branchId,
        classTypeId,
        instructorUserId: instructorId,
        feeRp: 250000,
        effectiveFrom: '2026-08-01',
        reason: 'sensitive fee reason',
      },
      `${namespace}-fee`,
    );
    expect(fee.value).toMatchObject({ currency: 'IDR', unit: 'MATCHED_HOUR' });
    const audit = JSON.stringify(
      await db.auditLog.findMany({ where: { correlationId: { startsWith: namespace } } }),
    );
    expect(audit).not.toContain('sensitive quota reason');
    expect(audit).not.toContain('sensitive fee reason');
  });

  it('rejects invalid values and overlapping concurrent periods atomically', async () => {
    await expect(
      service.createSetting(
        principal(),
        {
          kind: 'QUOTA_CAPACITY',
          branchId,
          classTypeId,
          minimumQuota: 9,
          defaultCapacity: 8,
          effectiveFrom: '2027-01-01',
          reason: 'invalid',
        },
        `${namespace}-invalid`,
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    const attempts = await Promise.allSettled(
      [1, 2].map((index) =>
        service.createSetting(
          principal(),
          {
            kind: 'PROJECTION_RATE',
            branchId,
            classTypeId,
            rateRp: 100000,
            effectiveFrom: '2026-09-01',
            effectiveUntil: '2026-10-01',
            reason: `concurrent ${index}`,
          },
          `${namespace}-concurrent-${index}`,
        ),
      ),
    );
    expect(attempts.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    expect(
      await db.effectiveConfiguration.count({
        where: { kind: 'PROJECTION_RATE', branchId, classTypeId },
      }),
    ).toBe(1);
  });

  it('enforces MFA, finance authority, hidden scope and stale lifecycle', async () => {
    await expect(
      service.createSetting(
        { ...principal(), assurance: 'BASE' },
        {
          kind: 'QUOTA_CAPACITY',
          branchId,
          classTypeId,
          minimumQuota: 1,
          defaultCapacity: 2,
          effectiveFrom: '2028-01-01',
          reason: 'base',
        },
        `${namespace}-base`,
      ),
    ).rejects.toMatchObject({ code: 'MFA_REQUIRED' });
    await expect(
      service.createSetting(
        { ...principal(), capabilities: ['branch:all', 'master:read', 'master:manage'] },
        {
          kind: 'PROJECTION_RATE',
          branchId,
          classTypeId,
          rateRp: 1,
          effectiveFrom: '2028-01-01',
          reason: 'no finance',
        },
        `${namespace}-finance`,
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.listClassTypes(
        { ...principal(), capabilities: ['master:read'], branchIds: [] },
        branchId,
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      service.deactivateClassType(principal(), classTypeId, 0, `${namespace}-dependency`),
    ).rejects.toMatchObject({ code: 'ACTIVE_DEPENDENCY' });
  });
});
