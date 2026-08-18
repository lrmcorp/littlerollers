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
    await db.cabang.create({
      data: { id: branchId, code: namespace, name: 'Ledger branch', timezone: 'Asia/Jakarta' },
    });
    await db.jenisKelas.create({
      data: { id: classTypeId, branchId, code: 'LEDGER', name: 'Ledger class' },
    });
    await db.paket.create({
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
    await db.buktiPembayaran.create({
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
    await db.pembelian.create({
      data: {
        id: purchaseId,
        userId: customerId,
        branchId,
        packageId,
        classTypeId,
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
    await db.paketPelanggan.create({
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
    await db.entriBukuBesar.create({
      data: {
        id: randomUUID(),
        customerPackageId,
        type: 'PURCHASE',
        quantity: 10,
        referenceType: 'PURCHASE',
        referenceId: purchaseId,
      },
    });
    await db.reservasiSesi.createMany({
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
            await db.penyesuaianSesi.findMany({
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
            await db.penyesuaianSesi.findMany({
              where: { customerPackageId },
              select: { id: true },
            })
          ).map(({ id }) => id),
        },
      },
    });
    await db.entriBukuBesar.deleteMany({ where: { customerPackageId } });
    await db.penyesuaianSesi.deleteMany({ where: { customerPackageId } });
    await db.idempotencyRecord.deleteMany({
      where: { scope: { startsWith: 'session-adjustment-' } },
    });
    await db.reservasiSesi.deleteMany({ where: { customerPackageId } });
    await db.paketPelanggan.deleteMany({ where: { id: customerPackageId } });
    await db.pembelian.deleteMany({ where: { id: purchaseId } });
    await db.buktiPembayaran.deleteMany({ where: { id: proofId } });
    await db.paket.deleteMany({ where: { id: packageId } });
    await db.jenisKelas.deleteMany({ where: { id: classTypeId } });
    await db.cabang.deleteMany({ where: { id: branchId } });
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
      usage: {
        initialSessions: 10,
        usedSessions: 0,
        reversedSessions: 0,
        adjustmentDelta: 0,
      },
      packageName: 'Ten sessions',
      branchName: 'Ledger branch',
    });
    expect(result.reservations.activeQuantity).toBe(2);
    expect(result.reservations.items).toHaveLength(2);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0]).toMatchObject({ balanceAfter: 10, referenceLabel: 'Aktivasi paket' });
  });

  it('lists customer-owned and branch-scoped balances without foreign leakage', async () => {
    const own = await service.list(customer, branchId);
    const scoped = await service.list(
      manager,
      branchId,
      undefined,
      'Ledger customer',
      'ACTIVE',
      customerId,
    );
    expect(own.items).toHaveLength(1);
    expect(own.items[0]).not.toHaveProperty('customer');
    expect(scoped.items).toHaveLength(1);
    expect(scoped.summary).toMatchObject({
      packageCount: 1,
      activePackageCount: 1,
      ledgerBalance: 10,
      reserved: 2,
      available: 8,
      usedSessions: 0,
    });
    expect(scoped.items[0]).toMatchObject({
      customer: { id: customerId, displayName: 'Ledger customer', phoneMasked: null },
    });
    const byPackage = await service.list(manager, branchId, undefined, 'Ten sessions', 'ACTIVE');
    expect(byPackage.items).toHaveLength(1);
    expect(byPackage.summary.packageCount).toBe(1);
    await expect(
      service.list(customer, branchId, undefined, undefined, undefined, managerId),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    await expect(
      service.detail({ ...manager, branchIds: [] }, customerPackageId),
    ).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });

  it('returns zero available when expired or inactive while preserving history', async () => {
    await db.paketPelanggan.update({
      where: { id: customerPackageId },
      data: { status: 'INACTIVE' },
    });
    const result = await service.detail(customer, customerPackageId);
    expect(result.balance.available).toBe(0);
    expect(result.balance.ledgerBalance).toBe(10);
    expect(result.entries).toHaveLength(1);
    await db.paketPelanggan.update({
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
    const extra = await db.reservasiSesi.create({
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
    await db.reservasiSesi.delete({ where: { id: extra.id } });
  });

  it('requests without ledger mutation and posts exactly one adjustment by a different authorized actor', async () => {
    const before = await db.entriBukuBesar.count({ where: { customerPackageId } });
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
    expect(await db.entriBukuBesar.count({ where: { customerPackageId } })).toBe(before);
    const id = (requested.body as { id: string }).id;
    expect(requested.body).toMatchObject({ ledgerBalanceAtRequest: 10, reservedAtRequest: 2 });
    const queue = await service.listAdjustments(
      manager,
      branchId,
      'PENDING',
      undefined,
      'Ledger customer',
      customerId,
      undefined,
      undefined,
      '10',
    );
    expect(queue.summary).toMatchObject({ total: 1, pending: 1, posted: 0, rejected: 0 });
    expect(queue.items[0]).toMatchObject({ id, customer: { id: customerId } });
    expect(await service.adjustmentDetail(manager, id)).toMatchObject({
      id,
      currentBalance: 10,
      projectedLedgerBalance: 8,
    });
    const decided = await service.decideAdjustment(
      manager,
      id,
      'approve',
      { reasonCode: 'CORRECTION_VERIFIED', note: 'Saldo telah diverifikasi.', expectedVersion: 0 },
      `${namespace}-decision`,
      namespace,
    );
    expect((decided.body as { resultingBalance: number }).resultingBalance).toBe(8);
    expect(decided.body).toMatchObject({ auditReference: namespace });
    expect(
      await db.entriBukuBesar.count({ where: { customerPackageId, type: 'ADJUST_MANUAL' } }),
    ).toBe(1);
    const detail = await service.detail(customer, customerPackageId);
    expect(detail.balance).toMatchObject({ ledgerBalance: 8, reserved: 2, available: 6 });
    expect(await service.adjustmentDetail(manager, id)).toMatchObject({
      decisionNote: 'Saldo telah diverifikasi.',
      auditReference: namespace,
    });
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
    expect(
      await db.auditLog.count({
        where: { objectId: id, action: 'session.adjustment.self_approval_denied' },
      }),
    ).toBe(1);
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
    expect(await db.entriBukuBesar.count({ where: { sessionAdjustmentId: id } })).toBe(0);
  });

  it('allows only one concurrent pending request and one concurrent ledger post', async () => {
    const requests = await Promise.allSettled([
      service.requestAdjustment(
        admin,
        { customerPackageId, quantity: 1, reasonCode: 'PACKAGE_COMPENSATION' },
        `${namespace}-concurrent-request-a`,
        namespace,
      ),
      service.requestAdjustment(
        admin,
        { customerPackageId, quantity: 1, reasonCode: 'PACKAGE_COMPENSATION' },
        `${namespace}-concurrent-request-b`,
        namespace,
      ),
    ]);
    expect(requests.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    const fulfilled = requests.find(({ status }) => status === 'fulfilled');
    if (!fulfilled || fulfilled.status !== 'fulfilled') throw new Error('missing request');
    const id = (fulfilled.value.body as { id: string }).id;
    expect(
      await db.penyesuaianSesi.count({ where: { customerPackageId, status: 'PENDING' } }),
    ).toBe(1);

    const decisions = await Promise.allSettled([
      service.decideAdjustment(
        manager,
        id,
        'approve',
        { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 0 },
        `${namespace}-concurrent-decision-a`,
        namespace,
      ),
      service.decideAdjustment(
        manager,
        id,
        'approve',
        { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 0 },
        `${namespace}-concurrent-decision-b`,
        namespace,
      ),
    ]);
    expect(decisions.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    expect(await db.entriBukuBesar.count({ where: { sessionAdjustmentId: id } })).toBe(1);
    expect(
      await db.auditLog.count({ where: { objectId: id, action: 'session.adjustment.posted' } }),
    ).toBe(1);
    expect(
      await db.outboxEvent.count({
        where: { aggregateId: id, aggregateType: 'SessionAdjustment' },
      }),
    ).toBe(3);
  });
});
