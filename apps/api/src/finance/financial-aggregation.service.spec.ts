import { FinancialAggregationService } from './financial-aggregation.service';

function database(overrides: Record<string, unknown> = {}) {
  return {
    branch: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' },
        ]),
    },
    purchase: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'purchase-1',
          decidedAt: new Date('2026-07-31T17:00:00.000Z'),
          priceRpSnapshot: 1_000_000,
          packagePromotionDiscountRpSnapshot: 0,
          voucherDiscountRpSnapshot: 0,
          priceAfterDiscountRpSnapshot: 1_000_000,
          sessionCountSnapshot: 10,
          customerPackage: {
            id: 'customer-package-1',
            salePriceRp: 1_000_000,
            projectionRateRp: 40_000,
            sessionCountSnapshot: 10,
          },
        },
      ]),
    },
    instructorHourLog: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'hour-log-1',
          branchId: 'branch-1',
          instructorUserId: 'instructor-1',
          classSlotId: 'slot-1',
          matchedUnits: 1,
          feeRpSnapshot: 200_000,
          amountRp: 200_000,
          occurredAt: new Date('2026-08-01T03:00:00.000Z'),
        },
      ]),
    },
    otherCost: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'cost-1',
          branchId: 'branch-1',
          occurredOn: new Date('2026-08-01T00:00:00.000Z'),
          categoryCode: 'OPERATING_EXPENSE',
          description: 'Utilities',
          reason: 'Monthly utilities',
          amountRp: 150_000,
        },
      ]),
    },
    financeCorrection: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'correction-1',
          branchId: 'branch-1',
          amountRp: 25_000,
          postedAt: new Date('2026-08-01T04:00:00.000Z'),
        },
      ]),
    },
    ...overrides,
  };
}

describe('FinancialAggregationService', () => {
  it('uses immutable approved facts and keeps correction outside operational profit', async () => {
    const db = database();
    const result = await new FinancialAggregationService(db as never).aggregate({
      branchIds: ['branch-1'],
      from: '2026-08-01',
      until: '2026-08-01',
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
    expect(db.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          decidedAt: {
            gte: new Date('2026-07-31T17:00:00.000Z'),
            lt: new Date('2026-08-01T17:00:00.000Z'),
          },
        }),
      }),
    );
  });

  it('fails authoritative aggregation when an approved purchase lacks its package fact', async () => {
    const db = database({
      purchase: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'purchase-invalid',
            decidedAt: new Date('2026-08-01T00:00:00.000Z'),
            priceRpSnapshot: 1,
            packagePromotionDiscountRpSnapshot: 0,
            voucherDiscountRpSnapshot: 0,
            priceAfterDiscountRpSnapshot: 1,
            sessionCountSnapshot: 1,
            customerPackage: null,
          },
        ]),
      },
    });
    await expect(
      new FinancialAggregationService(db as never).aggregate({
        branchIds: ['branch-1'],
        from: '2026-08-01',
        until: '2026-08-01',
        strict: true,
      }),
    ).rejects.toMatchObject({ code: 'FINANCE_CONFIGURATION_INCOMPLETE', status: 409 });
  });
});
