import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { IdempotencyService } from '../foundation/idempotency.service';
import { PolicyService } from '../identity/policy.service';
import { PackageAccessService } from './package-access.service';
import { PackagePromotionService } from './package-promotion.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;

databaseDescribe('package promotion MySQL integration', () => {
  const db = new PrismaClient();
  const namespace = `promotion-${Date.now()}`;
  const userId = randomUUID();
  const branchId = randomUUID();
  const classTypeId = randomUUID();
  const packageId = randomUUID();
  let service: PackagePromotionService;
  let promotionId = '';
  const principal = {
    sessionId: namespace,
    userId,
    roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
    capabilities: ['branch:all', 'package-promotion:read', 'package-promotion:manage'],
    branchIds: [branchId],
  };

  beforeAll(async () => {
    await db.$connect();
    await db.user.create({ data: { id: userId, displayName: 'Promotion owner' } });
    await db.cabang.create({
      data: { id: branchId, code: namespace, name: 'Promotion branch', timezone: 'Asia/Jakarta' },
    });
    await db.jenisKelas.create({
      data: {
        id: classTypeId,
        branchId,
        code: `REFORMER-${namespace}`.toUpperCase(),
        name: 'Reformer',
      },
    });
    await db.paket.create({
      data: {
        id: packageId,
        branchId,
        classTypeId,
        businessKey: namespace,
        name: 'Promotion package',
        sessionCount: 10,
        durationDays: 90,
        priceRp: 1_000_000,
        effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
      },
    });
    await db.cakupanCabangPaket.create({
      data: { packageId, branchId },
    });
    await db.cakupanJenisKelasPaket.create({
      data: { packageId, classTypeId },
    });
    const access = new PackageAccessService(db as never, new PolicyService());
    service = new PackagePromotionService(db as never, access, new IdempotencyService(db as never));
  });

  afterAll(async () => {
    await db.idempotencyRecord.deleteMany({
      where: {
        OR: [
          { scope: `package-promotion-create:${packageId}` },
          { scope: `package-promotion-update:${promotionId}` },
          { scope: `package-promotion-transition:${promotionId}` },
        ],
      },
    });
    await db.auditLog.deleteMany({ where: { correlationId: { startsWith: namespace } } });
    await db.promosiPaket.deleteMany({ where: { packageId } });
    await db.cakupanJenisKelasPaket.deleteMany({ where: { packageId } });
    await db.cakupanCabangPaket.deleteMany({ where: { packageId } });
    await db.paket.deleteMany({ where: { id: packageId } });
    await db.cakupanCabangJenisKelas.deleteMany({ where: { classTypeId } });
    await db.jenisKelas.deleteMany({ where: { id: classTypeId } });
    await db.cabang.deleteMany({ where: { id: branchId } });
    await db.user.deleteMany({ where: { id: userId } });
    await db.$disconnect();
  });

  it('manages an audited idempotent lifecycle and rejects overlapping periods', async () => {
    const createCommand = {
      name: 'Routine promotion',
      label: 'Promo 10%',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      activeFrom: '2030-07-01T00:00:00.000Z',
      activeUntil: '2030-08-01T00:00:00.000Z',
      reason: 'Campaign integration test',
    };
    const created = (await service.create(
      principal,
      packageId,
      createCommand,
      `${namespace}-create-key`,
      `${namespace}-create`,
    )) as any;
    promotionId = created.id;
    const replay = (await service.create(
      principal,
      packageId,
      createCommand,
      `${namespace}-create-key`,
      `${namespace}-create-replay`,
    )) as any;
    expect(replay.id).toBe(created.id);
    expect(await db.promosiPaket.count({ where: { packageId } })).toBe(1);

    await expect(
      service.create(
        principal,
        packageId,
        {
          ...createCommand,
          name: 'Overlapping promotion',
          activeFrom: '2030-07-15T00:00:00.000Z',
          activeUntil: '2030-08-15T00:00:00.000Z',
        },
        `${namespace}-overlap-key`,
        `${namespace}-overlap`,
      ),
    ).rejects.toMatchObject({ code: 'PROMOTION_PERIOD_OVERLAP' });

    const updated = (await service.update(
      principal,
      created.id,
      {
        label: 'Promo Reformer 12%',
        discountValue: 12,
        expectedVersion: 0,
        reason: 'Improve campaign value',
      },
      `${namespace}-update-key`,
      `${namespace}-update`,
    )) as any;
    expect(updated).toMatchObject({ discountValue: 12, promotionalPriceRp: 880_000, version: 1 });

    const active = (await service.transition(
      principal,
      created.id,
      'ACTIVE',
      { expectedVersion: 1, reason: 'Campaign approved' },
      `${namespace}-activate-key`,
      `${namespace}-activate`,
    )) as any;
    const paused = (await service.transition(
      principal,
      created.id,
      'PAUSED',
      { expectedVersion: active.version, reason: 'Pause campaign safely' },
      `${namespace}-pause-key`,
      `${namespace}-pause`,
    )) as any;
    const archived = (await service.transition(
      principal,
      created.id,
      'ARCHIVED',
      { expectedVersion: paused.version, reason: 'Archive completed campaign' },
      `${namespace}-archive-key`,
      `${namespace}-archive`,
    )) as any;
    expect(archived).toMatchObject({ status: 'ARCHIVED', effectiveState: 'ARCHIVED' });
    expect(
      await db.auditLog.count({
        where: { objectType: 'PackagePromotion', objectId: created.id },
      }),
    ).toBe(5);
  });
});
