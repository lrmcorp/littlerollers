import { DashboardService } from './dashboard.service';

const principal = (overrides: Record<string, unknown> = {}) =>
  ({
    userId: 'user-1',
    roles: [{ role: 'ADMIN', branchId: 'branch-1' }],
    branchIds: ['branch-1'],
    capabilities: ['purchase:review', 'reschedule:read'],
    ...overrides,
  }) as never;

function database() {
  const aggregate = jest.fn().mockResolvedValue({ _sum: { priceRpSnapshot: 0 } });
  const count = jest.fn().mockResolvedValue(0);
  const findMany = jest.fn().mockResolvedValue([]);
  return {
    pembelian: { aggregate, count, findMany },
    pemesananKelas: { count, findMany },
    paketPelanggan: { findMany },
    slotKelas: { findMany },
    otherCost: { findMany },
    instructorFee: { findMany },
    dokumenVerifikasiIdentitas: { count },
    ubahJadwal: { count },
    sessionAdjustRequest: { count: jest.fn().mockResolvedValue(0) },
    penyesuaianSesi: { count },
    quotaEvaluationJob: { count, findMany },
    cabang: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' },
        ]),
    },
    user: { count, findMany },
    auditLog: { findMany },
  };
}

describe('DashboardService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('rejects customer-only sessions', async () => {
    const service = new DashboardService(database() as never);
    await expect(
      service.overview(
        principal({
          roles: [{ role: 'CUSTOMER', branchId: null }],
          capabilities: [],
          branchIds: [],
        }),
        {},
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });

  it('rejects instructor/coach-only sessions', async () => {
    const service = new DashboardService(database() as never);
    await expect(
      service.overview(
        principal({
          roles: [{ role: 'INSTRUCTOR', branchId: 'branch-1' }],
          capabilities: ['class:assigned:read', 'attendance:self', 'class-slot:read'],
        }),
        {},
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });

  it('rejects a branch outside the principal scope', async () => {
    const service = new DashboardService(database() as never);
    await expect(service.overview(principal(), { branchId: 'branch-2' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
      status: 403,
    });
  });

  it('aggregates an empty branch dataset and only exposes permitted queues', async () => {
    const db = database();
    const result = await new DashboardService(db as never).overview(
      principal(),
      {
        branchId: 'branch-1',
        from: '2026-07-01',
        until: '2026-07-07',
      },
    );

    expect(result.roleFocus).toBe('BRANCH_OPERATIONS');
    expect(result.metrics.every((metric) => metric.value === 0)).toBe(true);
    expect(result.queues.map((queue) => queue.key)).toEqual(['payments', 'reschedules']);
    expect(result.jobs).toEqual([]);
    expect(db.cabang.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { active: true, id: 'branch-1' } }),
    );
  });

  it('exposes the pending session adjustment queue only to actors who can read adjustments', async () => {
    const db = database();
    db.sessionAdjustRequest.count.mockResolvedValue(3);
    const result = await new DashboardService(db as never).overview(
      principal({
        capabilities: ['purchase:review', 'reschedule:read', 'ledger:adjust:read'],
      }),
      { branchId: 'branch-1', from: '2026-07-01', until: '2026-07-07' },
    );
    expect(result.queues.find((queue) => queue.key === 'adjustments')).toEqual({
      key: 'adjustments',
      label: 'Penyesuaian sesi menunggu',
      count: 3,
      href: '/ledger/adjustments?status=PENDING',
    });
    expect(db.sessionAdjustRequest.count).toHaveBeenCalledWith({
      where: {
        status: 'PENDING',
        customerPackage: { purchase: { branchId: { in: ['branch-1'] } } },
      },
    });
  });

  it('keeps an omitted branch filter inside the actor branch assignments', async () => {
    const db = database();
    await new DashboardService(db as never).overview(principal(), {
      from: '2026-07-01',
      until: '2026-07-07',
    });

    expect(db.cabang.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { active: true, id: { in: ['branch-1'] } } }),
    );
  });

  it('uses deterministic role precedence and removes irrelevant sections', async () => {
    const result = await new DashboardService(database() as never).overview(
      principal({
        roles: [
          { role: 'FINANCE', branchId: null },
          { role: 'SUPER_OWNER', branchId: null },
        ],
        capabilities: ['branch:all', 'finance:read', 'operations:read'],
        branchIds: [],
      }),
      {},
    );
    expect(result.roleFocus).toBe('EXECUTIVE');
    expect(result.sections.executive).toBe(true);
    expect(result.sections.branchOperations).toBe(false);
  });

  it('validates date order before querying the database', async () => {
    const db = database();
    const service = new DashboardService(db as never);
    await expect(
      service.overview(principal(), { from: '2026-08-01', until: '2026-07-01' }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 422 });
    expect(db.pembelian.aggregate).not.toHaveBeenCalled();
  });
});
