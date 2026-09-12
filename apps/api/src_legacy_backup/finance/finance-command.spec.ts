import { FinanceCommandService } from './finance-command.service';

const correctionId = '00000000-0000-4000-8000-000000000101';
const branchId = '00000000-0000-4000-8000-000000000201';
const requesterId = '00000000-0000-4000-8000-000000000301';
const approverId = '00000000-0000-4000-8000-000000000302';
const key = 'finance-command-key-000000000001';

function fixture(actorId: string) {
  const correction = {
    id: correctionId,
    branchId,
    currentPeriod: '2026-08',
    referencePeriod: '2026-07',
    amountRp: 25_000,
    reason: 'Late bank settlement correction',
    requestedById: requesterId,
    decidedById: null,
    status: 'PENDING',
    version: 0,
  };
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: correctionId }]),
    koreksiKeuangan: {
      findUnique: jest.fn().mockResolvedValue(correction),
      update: jest
        .fn()
        .mockImplementation(({ data }) =>
          Promise.resolve({ ...correction, ...data, status: data.status, decidedById: actorId }),
        ),
    },
    periodeKeuangan: { findUnique: jest.fn().mockResolvedValue(null) },
    akunAkuntansi: { findFirst: jest.fn().mockResolvedValue({ id: 'account-1' }) },
    entriJurnal: { create: jest.fn().mockResolvedValue({ id: 'journal-1' }) },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
  };
  const idempotency = {
    execute: jest.fn().mockImplementation(async (_command, execute) => ({
      ...(await execute(tx)),
      replay: false,
    })),
  };
  const policy = {
    requireCapability: jest.fn(),
    hasCapability: jest.fn().mockReturnValue(true),
  };
  const service = new FinanceCommandService(
    {} as never,
    policy as never,
    idempotency as never,
    {} as never,
  );
  const principal = {
    userId: actorId,
    capabilities: ['finance:manage'],
    branchIds: [branchId],
    roles: [],
  };
  return { service, principal, tx };
}

test('enforces separation of duties on a finance correction decision', async () => {
  const { service, principal, tx } = fixture(requesterId);
  await expect(
    service.decideCorrection(
      principal as never,
      correctionId,
      'approve',
      { reason: 'Evidence verified' },
      key,
      'correlation-id',
    ),
  ).rejects.toEqual(expect.objectContaining({ code: 'SEPARATION_OF_DUTIES' }));
  expect(tx.koreksiKeuangan.update).not.toHaveBeenCalled();
});

test('posts an approved correction as a new immutable finance fact', async () => {
  const { service, principal, tx } = fixture(approverId);
  const result = await service.decideCorrection(
    principal as never,
    correctionId,
    'approve',
    { reason: 'Evidence verified' },
    key,
    'correlation-id',
    new Date('2026-08-06T10:00:00.000Z'),
  );

  expect(result).toEqual(expect.objectContaining({ status: 200, replay: false }));
  expect(tx.koreksiKeuangan.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ status: 'POSTED', decidedById: approverId }),
    }),
  );
  expect(tx.auditLog.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ action: 'finance.correction.posted' }),
    }),
  );
  expect(tx.entriJurnal.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        debitRp: 25_000,
        creditRp: 0,
        statusCode: 'POSTED_CORRECTION',
      }),
    }),
  );
});

test('closes a month with exactly one immutable authoritative snapshot', async () => {
  const totals = {
    grossSalesRp: 1_000_000,
    packagePromotionDiscountRp: 0,
    voucherDiscountRp: 0,
    revenueRp: 1_000_000,
    projectionRp: 400_000,
    instructorRealtimeRp: 200_000,
    otherCostRp: 150_000,
    correctionRp: 25_000,
    profitRp: 450_000,
  };
  const period = {
    id: '00000000-0000-4000-8000-000000000401',
    branchId,
    period: '2026-08',
    status: 'OPEN',
    version: 0,
  };
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: branchId }]),
    periodeKeuangan: {
      findUnique: jest.fn().mockResolvedValue(period),
      update: jest.fn().mockResolvedValue({ ...period, status: 'CLOSED', version: 1 }),
    },
    snapshotTutupBukuKeuangan: {
      create: jest
        .fn()
        .mockImplementation(({ data }) => Promise.resolve({ id: 'snapshot-1', ...data })),
    },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
  };
  const idempotency = {
    execute: jest.fn().mockImplementation(async (_command, execute) => ({
      ...(await execute(tx)),
      replay: false,
    })),
  };
  const aggregation = {
    aggregate: jest.fn().mockResolvedValue({
      totals,
      controlHash: 'a'.repeat(64),
      sourceCutoffAt: new Date('2026-09-01T00:00:00.000Z'),
      sourceVersion: 'financial-facts-v1',
    }),
  };
  const service = new FinanceCommandService(
    {} as never,
    { requireCapability: jest.fn(), hasCapability: jest.fn().mockReturnValue(true) } as never,
    idempotency as never,
    aggregation as never,
  );
  const result = await service.closeMonth(
    {
      userId: approverId,
      capabilities: ['finance:manage'],
      branchIds: [branchId],
      roles: [],
    } as never,
    {
      branchId,
      period: '2026-08',
      controlHash: 'a'.repeat(64),
      reason: 'Finance reconciliation passed',
      expectedVersion: 0,
    },
    key,
    'correlation-id',
  );

  expect(result.body).toEqual(expect.objectContaining({ snapshotIds: ['snapshot-1'] }));
  expect(tx.snapshotTutupBukuKeuangan.create).toHaveBeenCalledTimes(1);
  expect(tx.snapshotTutupBukuKeuangan.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ ...totals, controlHash: 'a'.repeat(64) }),
    }),
  );
});

test('exports the same authoritative branch-scoped aggregation and audits it', async () => {
  const auditCreate = jest.fn().mockResolvedValue({});
  const aggregation = {
    aggregate: jest.fn().mockResolvedValue({
      branches: [
        {
          branchId,
          branchCode: 'JKT',
          branchName: 'Jakarta',
          grossSalesRp: 1_000_000,
          revenueRp: 1_000_000,
          projectionRp: 400_000,
          instructorRealtimeRp: 200_000,
          otherCostRp: 150_000,
          profitRp: 450_000,
          correctionRp: 25_000,
        },
      ],
      controlHash: 'a'.repeat(64),
      sourceCutoffAt: new Date('2026-09-01T00:00:00.000Z'),
      completeness: 'COMPLETE',
    }),
  };
  const service = new FinanceCommandService(
    { auditLog: { create: auditCreate } } as never,
    { requireCapability: jest.fn(), hasCapability: jest.fn().mockReturnValue(true) } as never,
    {} as never,
    aggregation as never,
  );

  const result = await service.exportReport(
    {
      userId: approverId,
      capabilities: ['finance:export'],
      branchIds: [branchId],
      roles: [],
    } as never,
    { branchId, from: '2026-08-01', until: '2026-08-31' },
    'correlation-id',
  );

  expect(aggregation.aggregate).toHaveBeenCalledWith({
    branchIds: [branchId],
    from: '2026-08-01',
    until: '2026-08-31',
    strict: true,
  });
  expect(result.content).toContain('"450000"');
  expect(result.controlHash).toBe('a'.repeat(64));
  expect(auditCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        action: 'finance.report.exported',
        branchId,
      }),
    }),
  );
});
