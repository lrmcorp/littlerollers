import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { FinancialAggregationService } from './financial-aggregation.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;

databaseDescribe('authoritative financial facts MySQL integration', () => {
  const db = new PrismaClient();
  const namespace = `finance-${Date.now()}`;
  const branchId = randomUUID();
  const customerId = randomUUID();
  const instructorId = randomUUID();
  const financeId = randomUUID();
  const classTypeId = randomUUID();
  const studioId = randomUUID();
  const packageId = randomUUID();
  const purchaseId = randomUUID();
  const customerPackageId = randomUUID();
  const slotId = randomUUID();
  const feeConfigurationId = randomUUID();
  const correctionId = randomUUID();
  const service = new FinancialAggregationService(db as never);

  beforeAll(async () => {
    await db.$connect();
    await db.user.createMany({
      data: [
        { id: customerId, displayName: 'Financial customer' },
        { id: instructorId, displayName: 'Financial instructor' },
        { id: financeId, displayName: 'Financial actor' },
      ],
    });
    await db.branch.create({
      data: { id: branchId, code: namespace, name: 'Financial branch', timezone: 'Asia/Jakarta' },
    });
    await db.classType.create({
      data: { id: classTypeId, code: namespace.toUpperCase(), name: 'Financial class' },
    });
    await db.studio.create({
      data: { id: studioId, branchId, code: 'MAIN', name: 'Financial studio' },
    });
    await db.package.create({
      data: {
        id: packageId,
        classTypeId,
        businessKey: namespace,
        name: 'Financial package',
        sessionCount: 10,
        durationDays: 30,
        priceRp: 1_000_000,
        effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
      },
    });
    await db.purchase.create({
      data: {
        id: purchaseId,
        userId: customerId,
        branchId,
        packageId,
        packageNameSnapshot: 'Financial package',
        priceRpSnapshot: 1_000_000,
        catalogAmountRpSnapshot: 1_000_000,
        priceAfterDiscountRpSnapshot: 1_000_000,
        sessionCountSnapshot: 10,
        durationDaysSnapshot: 30,
        status: 'APPROVED',
        idempotencyKeyHash: namespace,
        decidedAt: new Date('2026-07-31T17:00:00.000Z'),
        decidedById: financeId,
        decisionReasonCode: 'PAYMENT_VERIFIED',
      },
    });
    await db.customerPackage.create({
      data: {
        id: customerPackageId,
        purchaseId,
        customerUserId: customerId,
        branchId,
        packageId,
        classTypeId,
        activationDate: new Date('2026-08-01T00:00:00.000Z'),
        expiryAt: new Date('2026-09-01T00:00:00.000Z'),
        salePriceRp: 1_000_000,
        sessionCountSnapshot: 10,
        durationDaysSnapshot: 30,
        projectionRateRp: 40_000,
      },
    });
    await db.effectiveConfiguration.create({
      data: {
        id: feeConfigurationId,
        kind: 'INSTRUCTOR_FEE',
        businessKey: `${branchId}:${classTypeId}:${instructorId}`,
        branchId,
        classTypeId,
        value: { instructorUserId: instructorId, feeRp: 200_000 },
        effectiveFrom: new Date('2026-01-01T00:00:00.000Z'),
        approvedEvidence: 'SYNTHETIC_NON_PRODUCTION',
      },
    });
    await db.classSlot.create({
      data: {
        id: slotId,
        branchId,
        classTypeId,
        studioId,
        instructorUserId: instructorId,
        startAt: new Date('2026-08-01T02:00:00.000Z'),
        endAt: new Date('2026-08-01T03:00:00.000Z'),
        timezone: 'Asia/Jakarta',
        minimumQuota: 1,
        capacity: 10,
        status: 'COMPLETED',
      },
    });
    await db.instructorHourLog.create({
      data: {
        id: randomUUID(),
        classSlotId: slotId,
        instructorUserId: instructorId,
        branchId,
        classTypeId,
        effectiveConfigurationId: feeConfigurationId,
        matchedUnits: 1,
        feeRpSnapshot: 200_000,
        amountRp: 200_000,
        period: '2026-08',
        occurredAt: new Date('2026-08-01T03:00:00.000Z'),
      },
    });
    await db.otherCost.create({
      data: {
        id: randomUUID(),
        branchId,
        period: '2026-08',
        categoryCode: 'OPERATING_EXPENSE',
        occurredOn: new Date('2026-08-01T00:00:00.000Z'),
        description: 'Utilities',
        reason: 'Synthetic control fixture',
        amountRp: 150_000,
        createdById: financeId,
      },
    });
    await db.financeCorrection.create({
      data: {
        id: correctionId,
        branchId,
        currentPeriod: '2026-08',
        referencePeriod: '2026-07',
        amountRp: 25_000,
        reason: 'Synthetic late settlement',
        requestedById: customerId,
        decidedById: financeId,
        decisionReason: 'Evidence verified',
        status: 'POSTED',
        decidedAt: new Date('2026-08-01T04:00:00.000Z'),
        postedAt: new Date('2026-08-01T04:00:00.000Z'),
      },
    });
  });

  afterAll(async () => {
    await db.financeCorrection.deleteMany({ where: { id: correctionId } });
    await db.otherCost.deleteMany({ where: { branchId } });
    await db.instructorHourLog.deleteMany({ where: { branchId } });
    await db.classSlot.deleteMany({ where: { id: slotId } });
    await db.effectiveConfiguration.deleteMany({ where: { id: feeConfigurationId } });
    await db.customerPackage.deleteMany({ where: { id: customerPackageId } });
    await db.purchase.deleteMany({ where: { id: purchaseId } });
    await db.package.deleteMany({ where: { id: packageId } });
    await db.studio.deleteMany({ where: { id: studioId } });
    await db.classType.deleteMany({ where: { id: classTypeId } });
    await db.branch.deleteMany({ where: { id: branchId } });
    await db.user.deleteMany({ where: { id: { in: [customerId, instructorId, financeId] } } });
    await db.$disconnect();
  });

  it('matches the locked Rupiah control totals at the Jakarta day boundary', async () => {
    const result = await service.aggregate({
      branchIds: [branchId],
      from: '2026-08-01',
      until: '2026-08-01',
      strict: true,
    });

    expect(result.totals).toEqual({
      grossSalesRp: 1_000_000,
      packagePromotionDiscountRp: 0,
      voucherDiscountRp: 0,
      revenueRp: 1_000_000,
      projectionRp: 400_000,
      instructorRealtimeRp: 200_000,
      otherCostRp: 150_000,
      correctionRp: 25_000,
      profitRp: 450_000,
    });
    expect(result.completeness).toBe('COMPLETE');
    expect(result.controlHash).toMatch(/^[a-f0-9]{64}$/u);
  });
});
