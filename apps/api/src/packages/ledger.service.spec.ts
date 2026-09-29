import { LedgerService } from './ledger.service';
import { PolicyService } from '../identity/policy.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(1);
const branchB = id(2);
const packageId = id(10);
const requestId = id(20);

const principalFor = (userId: string, capabilities: string[], branchIds = [branchA]) => ({
  sessionId: 's',
  userId,
  roles: [],
  capabilities,
  branchIds,
});

const admin = principalFor(id(100), ['ledger:read', 'ledger:adjust:read', 'ledger:adjust:request']);
const manager = principalFor(id(101), ['ledger:read', 'ledger:adjust:read', 'ledger:adjust:decide']);
// Pelanggan memegang `ledger:read` untuk data miliknya, tetapi tanpa cakupan cabang staf.
const customer = principalFor(id(102), ['ledger:read'], []);

const pkgRow = (overrides: Record<string, unknown> = {}) => ({
  id: packageId,
  userId: id(200),
  remainingSessions: 3,
  usedSessions: 1,
  totalSessions: 4,
  status: 'ACTIVE',
  validFrom: new Date('2026-01-01'),
  validUntil: new Date('2099-01-01'),
  purchaseId: id(30),
  user: { id: id(200), displayName: 'Maya', phone: '081234567890' },
  package: { id: id(40), name: 'Paket 4', classType: { id: id(41), name: 'Reformer' } },
  purchase: { branchId: branchA, branch: { id: branchA, name: 'Green Garden' } },
  ...overrides,
});

const requestRow = (overrides: Record<string, unknown> = {}) => ({
  id: requestId,
  customerPackageId: packageId,
  sessionCount: 1,
  reason: 'ATTENDANCE_CORRECTION',
  reasonCode: 'ATTENDANCE_CORRECTION',
  status: 'PENDING',
  version: 1,
  requestedById: admin.userId,
  approvedById: null,
  decisionCode: null,
  decisionNote: null,
  createdAt: new Date('2026-02-01T00:00:00Z'),
  decidedAt: null,
  requestedBy: { id: admin.userId, displayName: 'Admin MK' },
  approvedBy: null,
  customerPackage: pkgRow(),
  ...overrides,
});

function setup() {
  const tx = {
    paketPelanggan: {
      findUnique: jest.fn().mockResolvedValue(pkgRow()),
      findUniqueOrThrow: jest.fn().mockResolvedValue(pkgRow()),
      update: jest.fn().mockResolvedValue({}),
    },
    pemesananKelas: { count: jest.fn().mockResolvedValue(0) },
    sessionAdjustRequest: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation(async ({ data }) =>
        requestRow({ sessionCount: data.sessionCount, reasonCode: data.reasonCode }),
      ),
      findUnique: jest.fn().mockResolvedValue(requestRow()),
      findUniqueOrThrow: jest.fn().mockResolvedValue(requestRow({ status: 'APPROVED', version: 2 })),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    sessionLedger: {
      create: jest.fn().mockImplementation(async ({ data }) => ({
        id: id(50),
        createdAt: new Date('2026-02-02T00:00:00Z'),
        ...data,
      })),
    },
  };
  const db = {
    ...tx,
    $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
    pemesananKelas: {
      ...tx.pemesananKelas,
      groupBy: jest.fn().mockResolvedValue([]),
    },
    sessionAdjustRequest: {
      ...tx.sessionAdjustRequest,
      findMany: jest.fn().mockResolvedValue([]),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    paketPelanggan: { ...tx.paketPelanggan, findMany: jest.fn().mockResolvedValue([]) },
  };
  const audit = { catat: jest.fn().mockResolvedValue(undefined) };
  const service = new LedgerService(db as never, new PolicyService(), audit as never);
  return { service, tx, db, audit };
}

const input = { customerPackageId: packageId, quantity: 1, reasonCode: 'ATTENDANCE_CORRECTION' };
const approve = { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 1 };

describe('LedgerService.requestAdjustment', () => {
  it('requires ledger:adjust:request', async () => {
    const { service, tx } = setup();
    await expect(service.requestAdjustment(manager, input)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(tx.sessionAdjustRequest.create).not.toHaveBeenCalled();
  });

  it.each([
    [{ ...input, quantity: 0 }],
    [{ ...input, quantity: 51 }],
    [{ ...input, quantity: 1.5 }],
    [{ ...input, reasonCode: 'WHATEVER' }],
    [{ ...input, customerPackageId: 'not-a-uuid' }],
  ])('rejects invalid input %j before persistence', async (body) => {
    const { service, tx } = setup();
    await expect(service.requestAdjustment(admin, body as never)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(tx.sessionAdjustRequest.create).not.toHaveBeenCalled();
  });

  it('hides packages that belong to a foreign branch', async () => {
    const { service, tx } = setup();
    tx.paketPelanggan.findUnique.mockResolvedValue(
      pkgRow({ purchase: { branchId: branchB, branch: { id: branchB, name: 'Lain' } } }),
    );
    await expect(service.requestAdjustment(admin, input)).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });

  it('rejects a reduction that would break the balance or existing bookings', async () => {
    const { service, tx } = setup();
    await expect(
      service.requestAdjustment(admin, { ...input, quantity: -4 }),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_SESSION_BALANCE' });
    tx.pemesananKelas.count.mockResolvedValue(3);
    await expect(
      service.requestAdjustment(admin, { ...input, quantity: -1 }),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_SESSION_BALANCE' });
  });

  it('allows only one pending request per package', async () => {
    const { service, tx } = setup();
    tx.sessionAdjustRequest.count.mockResolvedValue(1);
    await expect(service.requestAdjustment(admin, input)).rejects.toMatchObject({
      code: 'ADJUSTMENT_ALREADY_PENDING',
    });
  });

  it('stores the real requester and returns the contract shape', async () => {
    const { service, tx, audit } = setup();
    const result = await service.requestAdjustment(admin, input);
    expect(tx.sessionAdjustRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requestedById: admin.userId,
          sessionCount: 1,
          reasonCode: 'ATTENDANCE_CORRECTION',
        }),
      }),
    );
    expect(result).toMatchObject({
      status: 'PENDING',
      quantity: 1,
      version: 1,
      requestedBy: { displayName: 'Admin MK' },
      branch: { id: branchA },
      customer: { phoneMasked: '0812****' },
      projectedLedgerBalance: 4,
    });
    expect(audit.catat).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ action: 'SESSION_ADJUSTMENT_REQUESTED' }),
    );
    // Saldo belum berubah sebelum ada keputusan.
    expect(tx.paketPelanggan.update).not.toHaveBeenCalled();
    expect(tx.sessionLedger.create).not.toHaveBeenCalled();
  });
});

describe('LedgerService.decideAdjustment', () => {
  it('requires ledger:adjust:decide', async () => {
    const { service } = setup();
    await expect(
      service.decideAdjustment(admin, requestId, 'approve', approve),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('enforces separation of duties', async () => {
    const { service, tx } = setup();
    const selfDeciding = principalFor(admin.userId, ['ledger:adjust:decide']);
    await expect(
      service.decideAdjustment(selfDeciding, requestId, 'approve', approve),
    ).rejects.toMatchObject({ code: 'SEPARATION_OF_DUTIES' });
    expect(tx.paketPelanggan.update).not.toHaveBeenCalled();
    expect(tx.sessionLedger.create).not.toHaveBeenCalled();
  });

  it('allows SUPER_OWNER to approve their own adjustment request', async () => {
    const { service, tx, audit } = setup();
    const superOwner = {
      sessionId: 's',
      userId: admin.userId,
      roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
      capabilities: ['ledger:adjust:decide', 'ledger:read', 'ledger:adjust:read'],
      branchIds: [branchA],
    };
    const result = await service.decideAdjustment(superOwner, requestId, 'approve', approve);
    expect(tx.paketPelanggan.update).toHaveBeenCalled();
    expect(tx.sessionLedger.create).toHaveBeenCalled();
    expect(result).toMatchObject({
      adjustment: { status: 'POSTED' },
    });
    expect(audit.catat).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ action: 'SESSION_ADJUSTMENT_APPROVED' }),
    );
  });

  it('validates decision and reason code combinations', async () => {
    const { service } = setup();
    await expect(
      service.decideAdjustment(manager, requestId, 'maybe', approve),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.decideAdjustment(manager, requestId, 'approve', {
        reasonCode: 'INVALID_EVIDENCE',
        expectedVersion: 1,
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.decideAdjustment(manager, requestId, 'reject', approve),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.decideAdjustment(manager, requestId, 'approve', { reasonCode: 'CORRECTION_VERIFIED' }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('hides requests from a foreign branch', async () => {
    const { service, tx } = setup();
    tx.sessionAdjustRequest.findUnique.mockResolvedValue(
      requestRow({
        customerPackage: pkgRow({
          purchase: { branchId: branchB, branch: { id: branchB, name: 'Lain' } },
        }),
      }),
    );
    await expect(
      service.decideAdjustment(manager, requestId, 'approve', approve),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
  });

  it('rejects stale versions and already decided requests', async () => {
    const { service, tx } = setup();
    await expect(
      service.decideAdjustment(manager, requestId, 'approve', { ...approve, expectedVersion: 7 }),
    ).rejects.toMatchObject({ code: 'ADJUSTMENT_VERSION_CONFLICT' });
    tx.sessionAdjustRequest.findUnique.mockResolvedValue(requestRow({ status: 'APPROVED' }));
    await expect(
      service.decideAdjustment(manager, requestId, 'approve', approve),
    ).rejects.toMatchObject({ code: 'ADJUSTMENT_ALREADY_DECIDED' });
  });

  it('fails when a concurrent decision claims the row first', async () => {
    const { service, tx } = setup();
    tx.sessionAdjustRequest.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.decideAdjustment(manager, requestId, 'approve', approve),
    ).rejects.toMatchObject({ code: 'ADJUSTMENT_VERSION_CONFLICT' });
    expect(tx.sessionLedger.create).not.toHaveBeenCalled();
  });

  it('approval moves the balance and writes an ADJUST_MANUAL ledger entry by the approver', async () => {
    const { service, tx, audit } = setup();
    const result = await service.decideAdjustment(manager, requestId, 'approve', {
      ...approve,
      note: 'Surat dokter terlampir',
    });
    expect(tx.paketPelanggan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ remainingSessions: 4, status: 'ACTIVE' }),
      }),
    );
    expect(tx.sessionLedger.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'ADJUST_MANUAL',
        amount: 1,
        balanceAfter: 4,
        referenceId: requestId,
        createdById: manager.userId,
      }),
    });
    expect(result).toMatchObject({
      resultingBalance: 4,
      ledgerEntry: { type: 'ADJUST_MANUAL', quantity: 1, balanceAfter: 4 },
      adjustment: { status: 'POSTED' },
    });
    expect(audit.catat).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ action: 'SESSION_ADJUSTMENT_APPROVED' }),
    );
  });

  it('approval revives a depleted package and depletes one that reaches zero', async () => {
    const { service, tx } = setup();
    tx.paketPelanggan.findUniqueOrThrow.mockResolvedValue(
      pkgRow({ remainingSessions: 0, status: 'DEPLETED' }),
    );
    await service.decideAdjustment(manager, requestId, 'approve', approve);
    expect(tx.paketPelanggan.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ remainingSessions: 1, status: 'ACTIVE' }),
      }),
    );

    tx.paketPelanggan.findUniqueOrThrow.mockResolvedValue(pkgRow({ remainingSessions: 1 }));
    tx.sessionAdjustRequest.findUnique.mockResolvedValue(requestRow({ sessionCount: -1 }));
    await service.decideAdjustment(manager, requestId, 'approve', approve);
    expect(tx.paketPelanggan.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ remainingSessions: 0, status: 'DEPLETED' }),
      }),
    );
  });

  it('re-checks the balance at approval time', async () => {
    const { service, tx } = setup();
    tx.sessionAdjustRequest.findUnique.mockResolvedValue(requestRow({ sessionCount: -3 }));
    tx.pemesananKelas.count.mockResolvedValue(1);
    await expect(
      service.decideAdjustment(manager, requestId, 'approve', approve),
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_SESSION_BALANCE' });
    expect(tx.sessionLedger.create).not.toHaveBeenCalled();
  });

  it('rejection leaves the balance and ledger untouched', async () => {
    const { service, tx } = setup();
    tx.sessionAdjustRequest.findUniqueOrThrow.mockResolvedValue(
      requestRow({ status: 'REJECTED', version: 2, decisionCode: 'INVALID_EVIDENCE' }),
    );
    const result = await service.decideAdjustment(manager, requestId, 'reject', {
      reasonCode: 'INVALID_EVIDENCE',
      expectedVersion: 1,
    });
    expect(tx.paketPelanggan.update).not.toHaveBeenCalled();
    expect(tx.sessionLedger.create).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ledgerEntry: null,
      resultingBalance: null,
      adjustment: { status: 'REJECTED', decisionCode: 'INVALID_EVIDENCE' },
    });
  });
});

describe('LedgerService reads', () => {
  it('refuses the staff package list to a customer even though they hold ledger:read', async () => {
    const { service, db } = setup();
    await expect(service.listCustomerPackages(customer, {})).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(db.paketPelanggan.findMany).not.toHaveBeenCalled();
  });

  it('scopes package and adjustment lists to the principal branches', async () => {
    const { service, db } = setup();
    db.paketPelanggan.findMany.mockResolvedValue([]);
    await service.listAdjustments(admin, {});
    const where = JSON.stringify(db.sessionAdjustRequest.findMany.mock.calls[0][0].where);
    expect(where).toContain(branchA);
    await expect(service.listAdjustments(admin, { branchId: branchB })).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });

  it('requires ledger:adjust:read to list or read adjustments', async () => {
    const { service } = setup();
    await expect(service.listAdjustments(customer, {})).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.getAdjustment(customer, requestId)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('lets the package owner read their own ledger but not another customer', async () => {
    const { service, db } = setup();
    const owner = principalFor(id(200), ['ledger:read'], []);
    const stranger = principalFor(id(201), ['ledger:read'], []);
    (db.paketPelanggan as unknown as { findUnique: jest.Mock }).findUnique.mockResolvedValue({
      ...pkgRow(),
      bookings: [],
    });
    (db as unknown as { sessionLedger: { findMany: jest.Mock } }).sessionLedger = {
      findMany: jest.fn().mockResolvedValue([]),
    } as never;
    await expect(service.getPackageLedger(owner, packageId)).resolves.toMatchObject({
      page: { hasMore: false },
    });
    await expect(service.getPackageLedger(stranger, packageId)).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });
});
