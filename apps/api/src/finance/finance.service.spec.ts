import { FinanceService } from './finance.service';

const finance = {
  userId: 'finance-1',
  roles: [{ role: 'FINANCE', branchId: null }],
  branchIds: [],
  capabilities: ['finance:reconcile'],
} as never;

describe('FinanceService', () => {
  it('denies principals without reconciliation capability', async () => {
    const service = new FinanceService({ purchase: { findMany: jest.fn() } } as never);
    await expect(
      service.overview(
        {
          userId: 'manager',
          roles: [],
          branchIds: ['b1'],
          capabilities: ['finance:read'],
        } as never,
        {},
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });

  it('calculates actual transaction and ledger reconciliation values', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'p1',
        branchId: 'b1',
        branch: { id: 'b1', code: 'JKT', name: 'Jakarta' },
        status: 'APPROVED',
        priceRpSnapshot: 1_000_000,
        paymentUniqueCode: 101,
        payableAmountRpSnapshot: 1_000_101,
        submittedAt: new Date(),
        paymentProof: { uploadStatus: 'FINALIZED', scanStatus: 'CLEAN' },
        customerPackage: { id: 'cp1', salePriceRp: 1_000_000 },
      },
      {
        id: 'p2',
        branchId: 'b1',
        branch: { id: 'b1', code: 'JKT', name: 'Jakarta' },
        status: 'PENDING',
        priceRpSnapshot: 500_000,
        paymentUniqueCode: 202,
        payableAmountRpSnapshot: 500_202,
        submittedAt: new Date(),
        paymentProof: { uploadStatus: 'FINALIZED', scanStatus: 'CLEAN' },
        customerPackage: null,
      },
    ]);
    const result = await new FinanceService({ purchase: { findMany } } as never).overview(finance, {
      branchId: 'b1',
      from: '2026-07-01',
      until: '2026-07-31',
    });
    expect(result.metrics).toMatchObject({
      expectedRp: 1_500_303,
      receivedRp: 1_500_303,
      approvedRp: 1_000_000,
      pendingRp: 500_202,
      identificationAmountRp: 303,
      ledgerDeltaRp: 0,
      unreconciledCount: 1,
    });
    expect(result.branches).toEqual([
      expect.objectContaining({
        code: 'JKT',
        pendingCount: 1,
        identificationAmountRp: 303,
      }),
    ]);
  });

  it('returns actionable anomalies without exposing proof contents', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'p1',
        branchId: 'b1',
        branch: { id: 'b1', code: 'JKT', name: 'Jakarta' },
        status: 'APPROVED',
        priceRpSnapshot: 1_000_000,
        submittedAt: new Date(),
        paymentProof: null,
        customerPackage: null,
      },
    ]);
    const result = await new FinanceService({ purchase: { findMany } } as never).anomalies(
      finance,
      {},
    );
    expect(result.items).toEqual([
      expect.objectContaining({
        code: 'APPROVED_WITHOUT_LEDGER',
        severity: 'CRITICAL',
        href: '/workspace/payments?purchaseId=p1',
      }),
    ]);
    expect(result.page).toEqual({ hasMore: false, nextCursor: null });
  });

  it('paginates more than twenty anomalies with a stable purchase cursor', async () => {
    const purchases = Array.from({ length: 25 }, (_, index) => ({
      id: `p${index + 1}`,
      branchId: 'b1',
      branch: { id: 'b1', code: 'JKT', name: 'Jakarta' },
      status: 'APPROVED',
      priceRpSnapshot: 100_000 + index,
      submittedAt: new Date(Date.UTC(2026, 6, 31, 0, 0, 25 - index)),
      paymentProof: null,
      customerPackage: null,
    }));
    const service = new FinanceService({
      purchase: { findMany: jest.fn().mockResolvedValue(purchases) },
    } as never);

    const first = await service.anomalies(finance, {});
    const second = await service.anomalies(finance, { cursor: first.page.nextCursor! });

    expect(first.items).toHaveLength(20);
    expect(first.total).toBe(25);
    expect(first.page).toEqual({ hasMore: true, nextCursor: 'p20' });
    expect(second.items).toHaveLength(5);
    expect(second.items[0]?.purchaseId).toBe('p21');
    expect(second.page).toEqual({ hasMore: false, nextCursor: null });
  });
});
