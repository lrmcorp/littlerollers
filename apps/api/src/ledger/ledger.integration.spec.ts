import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PolicyService } from '../identity/policy.service';
import { LedgerService } from './ledger.service';
import { IdempotencyService } from '../foundation/idempotency.service';

const databaseDescribe = process.env.DATABASE_URL ? describe : describe.skip;

databaseDescribe('synthetic ledger read MySQL integration', () => {
  const db = new PrismaClient();
  const namespace = `ledger-${Date.now()}`;
  const customerId = randomUUID();
  const managerId = randomUUID();
  const adminId = randomUUID();
  const branchId = randomUUID();
  const classTypeId = randomUUID();
  const packageId = randomUUID();
  const proofId = randomUUID();
  const purchaseId = randomUUID();
  const customerPackageId = randomUUID();
  const service = new LedgerService(
    db as never,
    new PolicyService(),
    new IdempotencyService(db as never),
  );
  const customer = {
    sessionId: namespace,
    userId: customerId,
    roles: [{ role: 'CUSTOMER' as const, branchId }],
    capabilities: ['customer:self', 'package:read', 'ledger:read'],
    branchIds: [branchId],
  };
  const manager = {
    ...customer,
    sessionId: `${namespace}-manager`,
    userId: managerId,
    roles: [{ role: 'MANAGER' as const, branchId }],
    capabilities: ['branch:manage', 'ledger:read', 'ledger:adjust:read', 'ledger:adjust:decide'],
  };
  const admin = {
    ...manager,
    sessionId: `${namespace}-admin`,
    userId: adminId,
    roles: [{ role: 'ADMIN' as const, branchId }],
    capabilities: ['branch:operate', 'ledger:read', 'ledger:adjust:read', 'ledger:adjust:request'],
  };

  beforeAll(async () => {
    await db.$connect();
    await db.user.createMany({
      data: [
        { id: customerId, displayName: 'Ledger customer' },
        { id: managerId, displayName: 'Ledger manager' },
        { id: adminId, displayName: 'Ledger admin' },
      ],
    });
    await db.branch.create({
      data: { id: branchId, code: namespace, name: 'Ledger branch', timezone: 'Asia/Jakarta' },
    });
    await db.classType.create({
      data: { id: classTypeId, branchId, code: 'LEDGER', name: 'Ledger class' },
    });
    await db.package.create({
      data: {
        id: packageId,
        branchId,
        classTypeId,
        businessKey: namespace,
        name: 'Ten sessions',
        sessionCount: 10,
        durationDays: 30,
        priceRp: 1000000,
        effectiveFrom: new Date('2026-01-01T00:00:00Z'),
      },
    });
    await db.paymentProof.create({
      data: {
        id: proofId,
        userId: customerId,
        branchId,
        packageId,
        objectKey: `${namespace}-object`,
        checksum: `${namespace}-checksum`,
        fileName: 'masked.png',
        mimeType: 'image/png',
        sizeBytes: 1,
        uploadStatus: 'FINALIZED',
        scanStatus: 'CLEAN',
      },
    });
    await db.purchase.create({
      data: {
        id: purchaseId,
        userId: customerId,
        branchId,
        packageId,
        paymentProofId: proofId,
        packageNameSnapshot: 'Ten sessions',
        priceRpSnapshot: 1000000,
        sessionCountSnapshot: 10,
        durationDaysSnapshot: 30,
        status: 'APPROVED',
        idempotencyKeyHash: `${namespace}-idem`,
        decidedAt: new Date(),
        decidedById: managerId,
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
        activationDate: new Date('2026-01-01T00:00:00Z'),
        expiryAt: new Date('2099-01-31T17:00:00Z'),
        salePriceRp: 1000000,
        sessionCountSnapshot: 10,
        durationDaysSnapshot: 30,
        projectionRateRp: 100000,
      },
    });
    await db.ledgerEntry.create({
      data: {
        id: randomUUID(),
        customerPackageId,
        type: 'PURCHASE',
        quantity: 10,
        referenceType: 'PURCHASE',
        referenceId: purchaseId,
      },
    });
    await db.sessionReservation.createMany({
      data: [
        { id: randomUUID(), customerPackageId, referenceHash: `${namespace}-active-1` },
        { id: randomUUID(), customerPackageId, referenceHash: `${namespace}-active-2` },
        {
          id: randomUUID(),
          customerPackageId,
          referenceHash: `${namespace}-released`,
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      ],
    });
  });

  afterAll(async () => {
    await db.outboxEvent.deleteMany({
      where: {
        aggregateType: 'SessionAdjustment',
        aggregateId: {
          in: (
            await db.sessionAdjustment.findMany({
              where: { customerPackageId },
              select: { id: true },
            })
          ).map(({ id }) => id),
        },
      },
    });
    await db.auditLog.deleteMany({
      where: {
        objectType: 'SessionAdjustment',
        objectId: {
          in: (
            await db.sessionAdjustment.findMany({
              where: { customerPackageId },
              select: { id: true },
            })
          ).map(({ id }) => id),
        },
      },
    });
    await db.ledgerEntry.deleteMany({ where: { customerPackageId } });
    await db.sessionAdjustment.deleteMany({ where: { customerPackageId } });
    await db.idempotencyRecord.deleteMany({
      where: { scope: { startsWith: 'session-adjustment-' } },
    });
    await db.sessionReservation.deleteMany({ where: { customerPackageId } });
    await db.customerPackage.deleteMany({ where: { id: customerPackageId } });
    await db.purchase.deleteMany({ where: { id: purchaseId } });
    await db.paymentProof.deleteMany({ where: { id: proofId } });
    await db.package.deleteMany({ where: { id: packageId } });
    await db.classType.deleteMany({ where: { id: classTypeId } });
    await db.branch.deleteMany({ where: { id: branchId } });
    await db.user.deleteMany({ where: { id: { in: [customerId, managerId, adminId] } } });
    await db.$disconnect();
  });

  it('returns authoritative balance, reservations and append-only history', async () => {
    const result = await service.detail(customer, customerPackageId);
    expect(result.balance).toMatchObject({
      status: 'ACTIVE',
      ledgerBalance: 10,
      reserved: 2,
      available: 8,
    });
    expect(result.reservations.activeQuantity).toBe(2);
    expect(result.entries).toHaveLength(1);
  });

  it('lists customer-owned and branch-scoped balances without foreign leakage', async () => {
    const own = await service.list(customer, branchId);
    const scoped = await service.list(manager, branchId);
    expect(own.items).toHaveLength(1);
    expect(scoped.items).toHaveLength(1);
    await expect(
      service.detail({ ...manager, branchIds: [] }, customerPackageId),
    ).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });

  it('returns zero available when expired or inactive while preserving history', async () => {
    await db.customerPackage.update({
      where: { id: customerPackageId },
      data: { status: 'INACTIVE' },
    });
    const result = await service.detail(customer, customerPackageId);
    expect(result.balance.available).toBe(0);
    expect(result.balance.ledgerBalance).toBe(10);
    expect(result.entries).toHaveLength(1);
    await db.customerPackage.update({
      where: { id: customerPackageId },
      data: { status: 'ACTIVE' },
    });
  });

  it('rejects invalid cursor and over-reservation without silently clamping', async () => {
    await expect(service.detail(customer, customerPackageId, 'not-a-cursor')).rejects.toMatchObject(
      {
        code: 'VALIDATION_ERROR',
      },
    );
    const extra = await db.sessionReservation.create({
      data: {
        id: randomUUID(),
        customerPackageId,
        referenceHash: `${namespace}-over`,
        quantity: 20,
      },
    });
    await expect(service.detail(customer, customerPackageId)).rejects.toMatchObject({
      code: 'LEDGER_INVARIANT_VIOLATION',
    });
    await db.sessionReservation.delete({ where: { id: extra.id } });
  });

  it('requests without ledger mutation and posts exactly one adjustment by a different authorized actor', async () => {
    const before = await db.ledgerEntry.count({ where: { customerPackageId } });
    const requested = await service.requestAdjustment(
      admin,
      { customerPackageId, quantity: -2, reasonCode: 'ATTENDANCE_CORRECTION' },
      `${namespace}-request`,
      namespace,
    );
    const replay = await service.requestAdjustment(
      admin,
      { customerPackageId, quantity: -2, reasonCode: 'ATTENDANCE_CORRECTION' },
      `${namespace}-request`,
      namespace,
    );
    expect(replay.replay).toBe(true);
    expect(await db.ledgerEntry.count({ where: { customerPackageId } })).toBe(before);
    const id = (requested.body as { id: string }).id;
    const decided = await service.decideAdjustment(
      manager,
      id,
      'approve',
      { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 0 },
      `${namespace}-decision`,
      namespace,
    );
    expect((decided.body as { resultingBalance: number }).resultingBalance).toBe(8);
    expect(
      await db.ledgerEntry.count({ where: { customerPackageId, type: 'ADJUST_MANUAL' } }),
    ).toBe(1);
    const detail = await service.detail(customer, customerPackageId);
    expect(detail.balance).toMatchObject({ ledgerBalance: 8, reserved: 2, available: 6 });
  });

  it('rejects self-decision and unsafe post-balance', async () => {
    const request = await service.requestAdjustment(
      admin,
      { customerPackageId, quantity: -7, reasonCode: 'SUPPORT_RECONCILIATION' },
      `${namespace}-request-2`,
      namespace,
    );
    const id = (request.body as { id: string }).id;
    await expect(
      service.decideAdjustment(
        {
          ...admin,
          capabilities: [...admin.capabilities, 'ledger:adjust:decide'],
        },
        id,
        'approve',
        { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 0 },
        `${namespace}-self`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'SEPARATION_OF_DUTIES_VIOLATION' });
    await expect(
      service.decideAdjustment(
        manager,
        id,
        'approve',
        { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 0 },
        `${namespace}-unsafe`,
        namespace,
      ),
    ).rejects.toMatchObject({ code: 'LEDGER_INVARIANT_VIOLATION' });
    await service.decideAdjustment(
      manager,
      id,
      'reject',
      { reasonCode: 'INVALID_EVIDENCE', expectedVersion: 0 },
      `${namespace}-reject`,
      namespace,
    );
    expect(await db.ledgerEntry.count({ where: { sessionAdjustmentId: id } })).toBe(0);
  });
});
