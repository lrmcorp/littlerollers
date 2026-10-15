import { DEFAULT_PROJECTION_RATE_RP, projectionCostFor } from './projection-cost';

const purchase = (branchId: string, sessionCount: number, classTypeId: string | null = 'ct1') => ({
  branchId,
  paidAt: new Date('2026-09-10T00:00:00Z'),
  createdAt: new Date('2026-09-10T00:00:00Z'),
  package: { classTypeId, sessionCount },
});

describe('projectionCostFor', () => {
  it('mengalikan sesi terjual dengan tarif cabang dan jenis kelas yang berlaku', () => {
    const result = projectionCostFor(
      [purchase('b1', 10), purchase('b2', 4)],
      [
        { branchId: 'b1', classTypeId: 'ct1', effectiveDate: new Date('2026-01-01'), ratePerSesiRp: 80_000 },
        { branchId: 'b1', classTypeId: 'ct1', effectiveDate: new Date('2026-12-01'), ratePerSesiRp: 999_000 },
      ],
    );
    expect(result.byBranch.get('b1')).toBe(800_000);
    expect(result.byBranch.get('b2')).toBe(4 * DEFAULT_PROJECTION_RATE_RP);
    expect(result.totalSessionsSold).toBe(14);
    expect(result.totalProjectionCostRp).toBe(800_000 + 4 * DEFAULT_PROJECTION_RATE_RP);
  });

  it('mengembalikan nol tanpa pembelian', () => {
    expect(projectionCostFor([], []).totalProjectionCostRp).toBe(0);
  });
});
