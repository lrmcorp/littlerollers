import { PolicyService } from './policy.service';
import { CustomerManagementService } from './manajemen-pelanggan.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(2);
const branchB = id(3);
const customerId = id(10);

const principal = (over: Record<string, unknown> = {}) => ({
  sessionId: 's',
  userId: id(1),
  roles: [] as never,
  capabilities: ['customer:write'],
  branchIds: [branchA],
  ...over,
});

function setup(
  row: Record<string, unknown> | null = { status: 'ACTIVE', preferredBranchId: branchA, _count: { bookings: 1, purchases: 1 } },
  history: { bookings?: string[]; purchases?: string[] } = {},
) {
  const tx = {
    pemesananKelas: { findMany: jest.fn().mockResolvedValue((history.bookings ?? []).map((userId) => ({ userId }))) },
    pembelian: { findMany: jest.fn().mockResolvedValue((history.purchases ?? []).map((userId) => ({ userId }))) },
    user: {
      findFirst: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockImplementation(async ({ data }) => ({ id: customerId, preferredBranchId: row?.preferredBranchId ?? null, ...data })),
    },
  };
  const db = { ...tx, $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)) };
  const audit = { catat: jest.fn().mockResolvedValue(undefined) };
  const service = new CustomerManagementService(db as never, new PolicyService(), undefined, undefined, undefined, audit as never);
  return { service, tx, audit };
}

const deactivate = (s: ReturnType<typeof setup>, p = principal(), reason?: string) =>
  s.service.setStatus(p as never, customerId, false, { expectedVersion: 1, reason }, '', '', 'corr-1');

describe('customer deactivate / reactivate', () => {
  it('refuses to deactivate without a typed reason and touches nothing', async () => {
    const s = setup();
    for (const reason of [undefined, '', '  ', 'ab'])
      await expect(deactivate(s, principal(), reason)).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(s.tx.user.update).not.toHaveBeenCalled();
    expect(s.audit.catat).not.toHaveBeenCalled();
  });

  it('only ever finds customer accounts: staff and Super Owner ids are "not found"', async () => {
    const s = setup(null);
    await expect(deactivate(s, principal(), 'Uji')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(s.tx.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: customerId, role: 'CUSTOMER' } }),
    );
    expect(s.tx.user.update).not.toHaveBeenCalled();
  });

  it('hides a customer of another branch from branch-scoped staff, but not from cross-branch staff', async () => {
    const other = setup({ status: 'ACTIVE', preferredBranchId: branchB, _count: { bookings: 2, purchases: 0 } });
    await expect(deactivate(other, principal(), 'Uji')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(other.tx.user.update).not.toHaveBeenCalled();

    const global = setup({ status: 'ACTIVE', preferredBranchId: branchB, _count: { bookings: 2, purchases: 0 } });
    await deactivate(global, principal({ capabilities: ['customer:write', 'branch:all'], branchIds: [] }), 'Uji');
    expect(global.tx.user.update).toHaveBeenCalled();
  });

  it('records the trimmed reason and before/after in the permanent audit', async () => {
    const s = setup();
    await expect(deactivate(s, principal(), '  Permintaan member  ')).resolves.toMatchObject({ status: 'INACTIVE' });
    expect(s.audit.catat).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'customer.deactivated',
        objectType: 'Customer',
        targetUserId: customerId,
        branchId: branchA,
        reason: 'Permintaan member',
        beforeMasked: { status: 'ACTIVE' },
        afterMasked: { status: 'INACTIVE' },
      }),
    );
  });

  it('reactivating needs no reason', async () => {
    const s = setup({ status: 'INACTIVE', preferredBranchId: branchA, _count: { bookings: 0, purchases: 0 } });
    await expect(
      s.service.setStatus(principal() as never, customerId, true, { expectedVersion: 1 }, '', '', 'corr-2'),
    ).resolves.toMatchObject({ status: 'ACTIVE' });
    expect(s.audit.catat).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'customer.reactivated', reason: null }),
    );
  });

  it('allows staff who served the customer (booking or purchase at their branch) even if the preferred branch differs', async () => {
    const s = setup({ status: 'ACTIVE', preferredBranchId: branchB, _count: { bookings: 3, purchases: 1 } }, { bookings: [customerId] });
    await expect(deactivate(s, principal(), 'Uji')).resolves.toMatchObject({ status: 'INACTIVE' });
  });

  it('allows a customer not yet attached to any branch (no preferred branch, no bookings, no purchases)', async () => {
    const s = setup({ status: 'ACTIVE', preferredBranchId: null, _count: { bookings: 0, purchases: 0 } });
    await expect(deactivate(s, principal(), 'Uji')).resolves.toMatchObject({ status: 'INACTIVE' });
  });
});
