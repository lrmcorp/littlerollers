import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PolicyService } from '../identity/policy.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { EffectiveSettingsService } from './konfigurasi-efektif.service';
import { MasterAccessService } from './master-access.service';
import { MasterCatalogService } from './master-catalog.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;
databaseDescribe('effective master MySQL integration', () => {
  const db = new PrismaClient();
  const namespace = `mst-${Date.now()}`;
  const primaryClassTypeCode = `REFORMER-${namespace}`.toUpperCase();
  const lifecycleClassTypeCode = `BARRE-${namespace}`.toUpperCase();
  const actorId = randomUUID();
  const instructorId = randomUUID();
  let catalog: MasterCatalogService;
  let settings: EffectiveSettingsService;
  let branchId = '';
  let classTypeId = '';
  let lifecycleClassTypeId = '';
  let connected = false;
  const principal = () => ({
    sessionId: 'mst',
    userId: actorId,
    roles: [
      { role: 'SUPER_OWNER' as const, branchId: null },
      { role: 'FINANCE' as const, branchId: null },
    ],
    capabilities: ['branch:all', 'master:read', 'master:manage', 'finance:manage'],
    branchIds: [branchId],
  });

  beforeAll(async () => {
    await db.$connect();
    connected = true;
    const access = new MasterAccessService(new PolicyService());
    catalog = new MasterCatalogService(db as never, access, new IdempotencyService(db as never));
    settings = new EffectiveSettingsService(db as never, access);
    await db.user.createMany({
      data: [
        { id: actorId, displayName: 'Master actor' },
        { id: instructorId, displayName: 'Master instructor' },
      ],
    });
    const branch = await catalog.createBranch(
      principal(),
      { code: namespace, name: 'Integration Branch', timezone: 'Asia/Jakarta' },
      `${namespace}-branch`,
    );
    branchId = branch.id;
    const type = await catalog.createClassType(
      principal(),
      { branchIds: [branchId], code: primaryClassTypeCode, name: 'Reformer' },
      `${namespace}-class`,
    );
    classTypeId = type.id;
  });
  afterAll(async () => {
    if (!connected) return;
    await db.idempotencyRecord.deleteMany({
      where: {
        OR: [
          { scope: { in: [`branch-update:${branchId}`, `branch-transition:${branchId}`] } },
          ...(lifecycleClassTypeId
            ? [
                {
                  scope: {
                    in: [
                      `class-type-update:${lifecycleClassTypeId}`,
                      `class-type-reactivate:${lifecycleClassTypeId}`,
                    ],
                  },
                },
              ]
            : []),
        ],
      },
    });
    await db.auditLog.deleteMany({ where: { correlationId: { startsWith: namespace } } });
    await db.konfigurasiEfektif.deleteMany({ where: { branchId } });
    await db.cakupanCabangJenisKelas.deleteMany({ where: { branchId } });

    await db.jenisKelas.deleteMany({
      where: {
        id: {
          in: [classTypeId, lifecycleClassTypeId].filter(Boolean),
        },
      },
    });

    await db.akunAkuntansi.deleteMany({ where: { branchId } });
    await db.cabang.deleteMany({ where: { id: branchId } });
    await db.user.deleteMany({ where: { id: { in: [actorId, instructorId] } } });
    await db.$disconnect();
  });

  it('creates typed versions and masks raw reasons', async () => {
    const quota = await settings.create(
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
    const fee = await settings.create(
      principal(),
      {
        kind: 'INSTRUCTOR_FEE',
        branchId,
        classTypeId,
        instructorUserId: instructorId,
        feeRp: 250000,
        effectiveFrom: '2026-08-01',
        effectiveUntil: '2029-01-01',
        reason: 'sensitive fee reason',
      },
      `${namespace}-fee`,
    );
    expect(fee.value).toMatchObject({ currency: 'IDR', unit: 'MATCHED_CLASS' });
    const audit = JSON.stringify(
      await db.auditLog.findMany({ where: { correlationId: { startsWith: namespace } } }),
    );
    expect(audit).not.toContain('sensitive quota reason');
    expect(audit).not.toContain('sensitive fee reason');
  });

  it('requires the signed DEC-006 pack and replays an exact configuration as a no-op', async () => {
    const previous = process.env.V1_DEC006_CONFIGURATION_PACK_SHA256;
    const checksum = 'b'.repeat(64);
    process.env.V1_DEC006_CONFIGURATION_PACK_SHA256 = checksum;
    const base = {
      kind: 'INSTRUCTOR_FEE' as const,
      branchId,
      classTypeId,
      instructorUserId: instructorId,
      feeRp: 275000,
      effectiveFrom: '2029-01-01',
      reason: 'DEC-006 signed fixture',
    };
    try {
      await expect(
        settings.create(principal(), base, `${namespace}-unsigned`),
      ).rejects.toMatchObject({ code: 'FINANCE_CONFIGURATION_INCOMPLETE' });
      const signed = {
        ...base,
        configurationId: 'CFG-FEE-INTEGRATION-001',
        approvedEvidence: 'DEC006-EVIDENCE-INTEGRATION',
        configurationPackChecksum: checksum,
        approval: {
          financeApproverId: actorId,
          productOwnerApproverId: actorId,
          approvedAt: '2026-08-09T01:00:00.000Z',
        },
      };
      const created = await settings.create(principal(), signed, `${namespace}-signed`);
      const replay = await settings.create(principal(), signed, `${namespace}-signed-replay`);
      expect(replay.id).toBe(created.id);
      expect(replay.value).toMatchObject({
        unit: 'MATCHED_CLASS',
        configurationPackChecksum: checksum,
      });
      expect(await db.konfigurasiEfektif.count({ where: { id: created.id } })).toBe(1);
      await expect(
        settings.create(
          principal(),
          {
            ...signed,
            approval: { ...signed.approval, approvedAt: '2026-08-09T02:00:00.000Z' },
          },
          `${namespace}-signed-changed`,
        ),
      ).rejects.toMatchObject({ code: 'EFFECTIVE_PERIOD_OVERLAP' });
    } finally {
      if (previous === undefined) delete process.env.V1_DEC006_CONFIGURATION_PACK_SHA256;
      else process.env.V1_DEC006_CONFIGURATION_PACK_SHA256 = previous;
    }
  });

  it('rejects invalid values and overlapping concurrent periods atomically', async () => {
    await expect(
      settings.create(
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
        settings.create(
          principal(),
          {
            kind: 'PROJECTION_RATE',
            branchId,
            classTypeId,
            rateRp: 100000 + index,
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
      await db.konfigurasiEfektif.count({
        where: { kind: 'PROJECTION_RATE', branchId, classTypeId },
      }),
    ).toBe(1);
  });

  it('enforces finance authority, hidden scope and stale lifecycle', async () => {
    await expect(
      settings.create(
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
      catalog.listClassTypes(
        { ...principal(), capabilities: ['master:read'], branchIds: [] },
        branchId,
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      catalog.deactivateClassType(principal(), classTypeId, 0, `${namespace}-dependency`),
    ).rejects.toMatchObject({ code: 'ACTIVE_DEPENDENCY' });
  });

  it('lists branch management summary and protects versioned updates', async () => {
    const page = await catalog.listBranches(principal(), { q: namespace, status: 'ACTIVE' });
    expect(page.summary).toMatchObject({ total: 1, active: 1, inactive: 0 });
    expect(page.items[0]).toMatchObject({ id: branchId, code: namespace.toUpperCase() });

    const detail = await catalog.branchDetail(principal(), branchId);
    expect(detail.dependencies).toMatchObject({ classTypes: 1 });

    const updated = await catalog.updateBranch(
      principal(),
      branchId,
      {
        name: 'Integration Branch Updated',
        timezone: 'Asia/Jakarta',
        supportWhatsappE164: '+628111111111',
        expectedVersion: detail.version,
        reason: 'Memperbarui informasi cabang',
      },
      `${namespace}-branch-update`,
      `${namespace}-branch-update`,
    );
    expect(updated).toMatchObject({
      name: 'Integration Branch Updated',
      supportWhatsappE164: '+628111111111',
      version: detail.version + 1,
    });

    await expect(
      catalog.updateBranch(
        principal(),
        branchId,
        {
          name: 'Stale branch',
          timezone: 'Asia/Jakarta',
          expectedVersion: detail.version,
          reason: 'Menguji stale version',
        },
        `${namespace}-branch-stale`,
        `${namespace}-branch-stale`,
      ),
    ).rejects.toMatchObject({ code: 'STALE_VERSION' });
  });

  it('updates safe class-type metadata and reactivates an inactive type idempotently', async () => {
    const item = await catalog.createClassType(
      principal(),
      { branchIds: [branchId], code: lifecycleClassTypeCode, name: 'Barre Test' },
      `${namespace}-class-lifecycle`,
    );
    lifecycleClassTypeId = item.id;
    const updated = await catalog.updateClassType(
      principal(),
      item.id,
      {
        name: 'Barre Integration',
        expectedVersion: item.version,
        reason: 'Memperbarui nama tipe kelas',
      },
      `${namespace}-class-update-key`,
      `${namespace}-class-update`,
    );
    expect(updated).toMatchObject({
      code: lifecycleClassTypeCode,
      branchId: null,
      name: 'Barre Integration',
      version: item.version + 1,
    });

    const inactive = await catalog.deactivateClassType(
      principal(),
      item.id,
      updated.version,
      `${namespace}-class-deactivate`,
    );
    const reactivated = await catalog.reactivateClassType(
      principal(),
      item.id,
      {
        expectedVersion: inactive.version,
        reason: 'Mengaktifkan kembali tipe kelas',
      },
      `${namespace}-class-reactivate-key`,
      `${namespace}-class-reactivate`,
    );
    expect(reactivated).toMatchObject({ active: true, version: inactive.version + 1 });
    const replay = await catalog.reactivateClassType(
      principal(),
      item.id,
      {
        expectedVersion: inactive.version,
        reason: 'Mengaktifkan kembali tipe kelas',
      },
      `${namespace}-class-reactivate-key`,
      `${namespace}-class-reactivate-replay`,
    );
    expect(replay).toMatchObject({ id: item.id, active: true, version: inactive.version + 1 });
  });
});
