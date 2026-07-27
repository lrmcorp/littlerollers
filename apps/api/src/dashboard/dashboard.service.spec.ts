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
    purchase: { aggregate, count, findMany },
    booking: { count, findMany },
    customerPackage: { findMany },
    classSlot: { findMany },
    identityVerificationDocument: { count },
    reschedule: { count },
    sessionAdjustment: { count },
    quotaEvaluationJob: { count, findMany },
    branch: { findMany },
    auditLog: { findMany },
  };
}

describe('DashboardService', () => {
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

  it('rejects a branch outside the principal scope', async () => {
    const service = new DashboardService(database() as never);
    await expect(service.overview(principal(), { branchId: 'branch-2' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
      status: 403,
    });
  });

  it('aggregates an empty branch dataset and only exposes permitted queues', async () => {
    const db = database();
    const result = await new DashboardService(db as never).overview(principal(), {
      branchId: 'branch-1',
      from: '2026-07-01',
      until: '2026-07-07',
    });

    expect(result.roleFocus).toBe('BRANCH_OPERATIONS');
    expect(result.metrics.map((metric) => metric.value)).toEqual([0, 0, 0, 0]);
    expect(result.queues.map((queue) => queue.key)).toEqual(['payments', 'reschedules']);
    expect(result.jobs).toEqual([]);
    expect(db.purchase.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ branchId: { in: ['branch-1'] } }),
      }),
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
    expect(db.purchase.aggregate).not.toHaveBeenCalled();
  });
});
