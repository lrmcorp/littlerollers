import { PolicyService } from '../identity/policy.service';
import { RetentionService, RENEWAL_WINDOW_DAYS } from './retention.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(1);
const branchB = id(2);

const principal = (
  capabilities: string[],
  role: string,
  userId: string,
  branchIds: string[] = [],
) => ({
  sessionId: 's',
  userId,
  roles: [{ role, branchId: null }] as never,
  capabilities,
  branchIds,
});

const superOwner = principal(['package:read', 'branch:all'], 'SUPER_OWNER', id(100));
const ownerA = principal(['package:read'], 'OWNER', id(101), [branchA]);

const NOW = new Date('2026-10-28T00:00:00.000Z');

type PackageRow = {
  id: string;
  userId: string;
  status: 'EXPIRED' | 'DEPLETED';
  validUntil: string;
  remainingSessions?: number;
  paidRp?: number | null;
  branchId?: string | null;
  name?: string;
};

function customerPackage(row: PackageRow) {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    validUntil: new Date(row.validUntil),
    remainingSessions: row.remainingSessions ?? 0,
    user: { id: row.userId, displayName: row.name ?? 'Member', phone: '0812', stoppedAt: null },
    package: { name: 'Private Group 10 sesi' },
    purchase:
      row.paidRp === null
        ? null
        : {
            totalAmountRp: row.paidRp ?? 2_000_000,
            branchId: row.branchId ?? branchA,
            status: 'PAID',
          },
  };
}

function setup(packages: ReturnType<typeof customerPackage>[], purchases: unknown[] = []) {
  const db = {
    paketPelanggan: { findMany: jest.fn().mockResolvedValue(packages) },
    pembelian: { findMany: jest.fn().mockResolvedValue(purchases) },
  };
  const service = new RetentionService(db as never, new PolicyService());
  return { service, db };
}

describe('RetentionService.expiryCohort', () => {
  it('splits packages that ran out of time from packages that ran out of sessions', async () => {
    const { service } = setup([
      customerPackage({ id: id(10), userId: id(50), status: 'EXPIRED', validUntil: '2026-10-05' }),
      customerPackage({ id: id(11), userId: id(51), status: 'DEPLETED', validUntil: '2026-10-09' }),
    ]);

    const result = await service.expiryCohort(superOwner, { period: '2026-10' }, NOW);

    expect(result.segments.expired.customers).toBe(1);
    expect(result.segments.hot.customers).toBe(1);
    expect(result.rows.find((r) => r.customerPackageId === id(11))?.endReason).toBe('HOT');
  });

  it('counts a customer as renewed when they pay again inside the 60 day window', async () => {
    const { service } = setup(
      [
        customerPackage({
          id: id(10),
          userId: id(50),
          status: 'EXPIRED',
          validUntil: '2026-10-05',
        }),
      ],
      [{ userId: id(50), paidAt: new Date('2026-10-20T00:00:00.000Z'), totalAmountRp: 2_000_000 }],
    );

    const result = await service.expiryCohort(superOwner, { period: '2026-10' }, NOW);

    expect(result.rows[0]?.renewed).toBe(true);
    expect(result.renewalRatePct).toBe(100);
    expect(result.potentialLoss.customers).toBe(0);
  });

  it('does not count a payment made after the renewal window closes', async () => {
    const validUntil = new Date('2026-10-05T00:00:00.000Z');
    const tooLate = new Date(validUntil.getTime() + (RENEWAL_WINDOW_DAYS + 1) * 86_400_000);
    const { service } = setup(
      [
        customerPackage({
          id: id(10),
          userId: id(50),
          status: 'EXPIRED',
          validUntil: '2026-10-05',
        }),
      ],
      [{ userId: id(50), paidAt: tooLate, totalAmountRp: 2_000_000 }],
    );

    const result = await service.expiryCohort(superOwner, { period: '2026-10' }, NOW);

    expect(result.rows[0]?.renewed).toBe(false);
    expect(result.renewalRatePct).toBe(0);
  });

  it('does not count a payment made before the package ended', async () => {
    const { service } = setup(
      [
        customerPackage({
          id: id(10),
          userId: id(50),
          status: 'EXPIRED',
          validUntil: '2026-10-05',
        }),
      ],
      [{ userId: id(50), paidAt: new Date('2026-09-30T00:00:00.000Z'), totalAmountRp: 2_000_000 }],
    );

    const result = await service.expiryCohort(superOwner, { period: '2026-10' }, NOW);

    expect(result.rows[0]?.renewed).toBe(false);
  });

  it('reports 50 percent when half the customers renewed, counting people not packages', async () => {
    const { service } = setup(
      [
        // Satu member memegang dua paket yang habis di bulan yang sama.
        customerPackage({
          id: id(10),
          userId: id(50),
          status: 'EXPIRED',
          validUntil: '2026-10-03',
        }),
        customerPackage({
          id: id(11),
          userId: id(50),
          status: 'EXPIRED',
          validUntil: '2026-10-04',
        }),
        customerPackage({
          id: id(12),
          userId: id(51),
          status: 'EXPIRED',
          validUntil: '2026-10-05',
        }),
      ],
      [{ userId: id(50), paidAt: new Date('2026-10-15T00:00:00.000Z'), totalAmountRp: 2_000_000 }],
    );

    const result = await service.expiryCohort(superOwner, { period: '2026-10' }, NOW);

    expect(result.total.customers).toBe(2);
    expect(result.total.packages).toBe(3);
    expect(result.renewalRatePct).toBe(50);
  });

  it('values the loss at what the customer actually paid', async () => {
    const { service } = setup([
      customerPackage({
        id: id(10),
        userId: id(50),
        status: 'EXPIRED',
        validUntil: '2026-10-05',
        paidRp: 1_500_000,
      }),
      customerPackage({
        id: id(11),
        userId: id(51),
        status: 'DEPLETED',
        validUntil: '2026-10-06',
        paidRp: 2_500_000,
      }),
    ]);

    const result = await service.expiryCohort(superOwner, { period: '2026-10' }, NOW);

    expect(result.potentialLoss.paidRp).toBe(4_000_000);
  });

  it('counts a package with no recorded purchase separately instead of valuing it at zero silently', async () => {
    const { service } = setup([
      customerPackage({
        id: id(10),
        userId: id(50),
        status: 'EXPIRED',
        validUntil: '2026-10-05',
        paidRp: null,
      }),
    ]);

    const result = await service.expiryCohort(superOwner, { period: '2026-10' }, NOW);

    expect(result.total.packagesWithoutValue).toBe(1);
    expect(result.total.paidRp).toBe(0);
    expect(result.rows[0]?.paidRp).toBeNull();
  });

  it('excludes frozen and active packages from the query', async () => {
    const { service, db } = setup([]);

    await service.expiryCohort(superOwner, { period: '2026-10' }, NOW);

    const where = db.paketPelanggan.findMany.mock.calls[0][0].where;
    expect(where.status).toEqual({ in: ['EXPIRED', 'DEPLETED'] });
  });

  it('hides other branches from a branch owner', async () => {
    const { service } = setup([
      customerPackage({
        id: id(10),
        userId: id(50),
        status: 'EXPIRED',
        validUntil: '2026-10-05',
        branchId: branchA,
      }),
      customerPackage({
        id: id(11),
        userId: id(51),
        status: 'EXPIRED',
        validUntil: '2026-10-06',
        branchId: branchB,
      }),
    ]);

    const result = await service.expiryCohort(
      ownerA,
      { branchId: branchA, period: '2026-10' },
      NOW,
    );

    expect(result.total.customers).toBe(1);
    expect(result.rows.every((row) => row.branchId === branchA)).toBe(true);
  });

  it('refuses a branch owner asking for a branch they do not hold', async () => {
    const { service } = setup([]);

    await expect(
      service.expiryCohort(ownerA, { branchId: branchB, period: '2026-10' }, NOW),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('returns null rather than zero percent when nobody expired that month', async () => {
    const { service } = setup([]);

    const result = await service.expiryCohort(superOwner, { period: '2026-10' }, NOW);

    expect(result.renewalRatePct).toBeNull();
    expect(result.total.customers).toBe(0);
  });
});

describe('RetentionService.retentionTrend', () => {
  it('returns the last three months ending with the current one', async () => {
    const { service } = setup([]);

    const result = await service.retentionTrend(superOwner, {}, NOW);

    expect(result.cohorts.map((c) => c.period)).toEqual(['2026-08', '2026-09', '2026-10']);
  });

  it('caps the window so a caller cannot ask for an unbounded history', async () => {
    const { service } = setup([]);

    const result = await service.retentionTrend(superOwner, { months: 99 }, NOW);

    expect(result.months).toBe(12);
  });
});
