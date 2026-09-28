import { PolicyService } from '../identity/policy.service';
import { PackageAccessService } from './package-access.service';
import { CustomerOrderService } from './pembelian-paket.service';
import { PaymentReviewService } from './verifikasi-pembayaran.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(1);
const branchB = id(2);
const customerId = id(300);
const packageId = id(40);
const recorderId = id(100);

const staff = (capabilities: string[], branchIds: string[], userId = recorderId) => ({
  sessionId: 's',
  userId,
  roles: [] as never,
  capabilities,
  branchIds,
});
const admin = staff(['purchase:record'], [branchA]);

const packageRow = (overrides: Record<string, unknown> = {}) => ({
  id: packageId,
  name: 'Paket 8 Sesi',
  status: 'ACTIVE',
  branchId: null,
  priceRp: 1_000_000,
  sessionCount: 8,
  validityDays: 60,
  ...overrides,
});

function setup(
  options: { customer?: Record<string, unknown> | null; pkg?: Record<string, unknown> | null; voucher?: Record<string, unknown> | null } = {},
) {
  const created: Array<Record<string, any>> = [];
  const tx = {
    user: {
      findUnique: jest
        .fn()
        .mockResolvedValue(
          options.customer === undefined
            ? { id: customerId, role: 'CUSTOMER', status: 'ACTIVE' }
            : options.customer,
        ),
    },
    cabang: { findUnique: jest.fn().mockResolvedValue({ id: branchA, active: true }) },
    paket: {
      findUnique: jest
        .fn()
        .mockResolvedValue(options.pkg === undefined ? packageRow() : options.pkg),
    },
    voucher: {
      findFirst: jest.fn().mockResolvedValue(options.voucher ?? null),
      update: jest.fn().mockResolvedValue({}),
    },
    pembelian: {
      create: jest.fn().mockImplementation(async ({ data }) => {
        created.push(data);
        return { ...data, package: packageRow(), branch: { paymentAccounts: [] }, voucher: null };
      }),
    },
  };
  const idempotency = {
    execute: jest.fn(async (_c: unknown, action: (t: typeof tx) => Promise<unknown>) => ({
      ...((await action(tx)) as object),
      replay: false,
    })),
  };
  const audit = { record: jest.fn() };
  const policy = new PolicyService();
  const access = new PackageAccessService({} as never, policy, audit as never);
  const service = new CustomerOrderService(
    {} as never,
    access,
    {} as never,
    {} as never,
    idempotency as never,
    {} as never,
    audit as never,
  );
  return { service, tx, created, audit };
}

const input = (overrides: Record<string, unknown> = {}) => ({
  customerUserId: customerId,
  packageId,
  branchId: branchA,
  paymentMethod: 'CASH',
  ...overrides,
});

describe('assisted (walk-in) package sale', () => {
  it('requires purchase:record and hides other branches', async () => {
    const { service, tx } = setup();
    await expect(
      service.recordAssistedSale(staff([], [branchA]), input(), 'key-12345', 'c'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.recordAssistedSale(staff(['purchase:record'], [branchB]), input(), 'key-12345', 'c'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    expect(tx.pembelian.create).not.toHaveBeenCalled();
  });

  it('validates ids, payment method, note length and the idempotency key', async () => {
    const { service, tx } = setup();
    const bad = [
      input({ customerUserId: 'x' }),
      input({ packageId: 'x' }),
      input({ paymentMethod: 'BITCOIN' }),
      input({ note: 'x'.repeat(201) }),
    ];
    for (const value of bad)
      await expect(
        service.recordAssistedSale(admin, value, 'key-12345', 'c'),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(service.recordAssistedSale(admin, input(), '', 'c')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect(tx.pembelian.create).not.toHaveBeenCalled();
  });

  it('records a PENDING purchase for the customer, remembers who recorded it and does not pre-activate', async () => {
    const { service, created, audit } = setup();
    const result = await service.recordAssistedSale(
      admin,
      input({ note: '  Bayar tunai di meja  ' }),
      'key-12345',
      'c',
    );
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      userId: customerId,
      branchId: branchA,
      packageId,
      status: 'PENDING',
      paymentMethod: 'CASH',
      paymentExpiresAt: null,
      recordedById: recorderId,
      recordNote: 'Bayar tunai di meja',
      subtotalRp: 1_000_000,
      totalAmountRp: 1_000_000,
    });
    expect(result).toMatchObject({ status: 201, body: { recordedById: recorderId } });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'PURCHASE_RECORDED_BY_STAFF', actorUserId: recorderId }),
    );
  });

  it('refuses inactive customers, non-customer accounts, missing or off-branch packages', async () => {
    await expect(
      setup({ customer: { id: customerId, role: 'CUSTOMER', status: 'SUSPENDED' } }).service.recordAssistedSale(
        admin,
        input(),
        'key-12345',
        'c',
      ),
    ).rejects.toMatchObject({ code: 'CUSTOMER_NOT_ACTIVE' });
    await expect(
      setup({ customer: { id: customerId, role: 'ADMIN', status: 'ACTIVE' } }).service.recordAssistedSale(
        admin,
        input(),
        'key-12345',
        'c',
      ),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    await expect(
      setup({ pkg: null }).service.recordAssistedSale(admin, input(), 'key-12345', 'c'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    await expect(
      setup({ pkg: packageRow({ branchId: branchB }) }).service.recordAssistedSale(
        admin,
        input(),
        'key-12345',
        'c',
      ),
    ).rejects.toMatchObject({ code: 'PACKAGE_BRANCH_MISMATCH' });
  });

  it('applies a valid voucher, counts its use, and rejects an unusable code instead of ignoring it', async () => {
    const voucher = {
      id: id(50),
      code: 'HEMAT',
      active: true,
      discountType: 'FIXED',
      discountValue: 100_000,
      maxDiscountRp: null,
      minSpendRp: 0,
      quota: null,
      usedCount: 0,
    };
    const ok = setup({ voucher });
    await ok.service.recordAssistedSale(admin, input({ voucherCode: 'hemat' }), 'key-12345', 'c');
    expect(ok.created[0]).toMatchObject({
      voucherId: voucher.id,
      subtotalRp: 1_000_000,
      discountRp: 100_000,
      totalAmountRp: 900_000,
    });
    expect(ok.tx.voucher.update).toHaveBeenCalledWith({
      where: { id: voucher.id },
      data: { usedCount: { increment: 1 } },
    });

    const missing = setup({ voucher: null });
    await expect(
      missing.service.recordAssistedSale(admin, input({ voucherCode: 'NGAWUR' }), 'key-12345', 'c'),
    ).rejects.toMatchObject({ code: 'VOUCHER_NOT_APPLICABLE' });
    expect(missing.created).toHaveLength(0);
  });
});

describe('approving a purchase: separation of duties', () => {
  const reviewer = (userId: string) =>
    staff(['payment:decide', 'payment:review'], [branchA], userId);
  const purchase = (overrides: Record<string, unknown> = {}) => ({
    id: id(60),
    userId: customerId,
    recordedById: recorderId,
    branchId: branchA,
    packageId,
    status: 'PENDING',
    invoiceNumber: 'INV-1',
    package: packageRow(),
    branch: { name: 'Green Garden' },
    paymentProof: null,
    ...overrides,
  });
  function decideSetup(row = purchase()) {
    const tx = {
      pembelian: {
        findUnique: jest.fn().mockResolvedValue(row),
        update: jest.fn().mockImplementation(async ({ data }) => ({ ...row, ...data })),
      },
      paketPelanggan: {
        create: jest.fn().mockImplementation(async ({ data }) => ({
          id: id(70),
          ...data,
        })),
      },
      sessionLedger: { create: jest.fn().mockResolvedValue({}) },
    };
    const idempotency = {
      execute: jest.fn(async (_c: unknown, action: (t: typeof tx) => Promise<unknown>) => action(tx)),
    };
    const access = new PackageAccessService(
      {} as never,
      new PolicyService(),
      { record: jest.fn() } as never,
    );
    const service = new PaymentReviewService({} as never, idempotency as never, access);
    return { service, tx };
  }
  const approve = (service: PaymentReviewService, principal: ReturnType<typeof staff>) =>
    service.decide(principal, id(60), 'APPROVED', { reasonCode: 'PAYMENT_VERIFIED' }, 'key-12345', 'c');

  it('does not let the staff member who recorded a sale approve it', async () => {
    const { service, tx } = decideSetup();
    await expect(approve(service, reviewer(recorderId))).rejects.toMatchObject({
      code: 'SEPARATION_OF_DUTIES_VIOLATION',
    });
    expect(tx.pembelian.update).not.toHaveBeenCalled();
  });

  it('still blocks a purchaser from approving their own order', async () => {
    const { service } = decideSetup(purchase({ recordedById: null }));
    await expect(approve(service, reviewer(customerId))).rejects.toMatchObject({
      code: 'SEPARATION_OF_DUTIES_VIOLATION',
    });
  });

  it('lets a different reviewer approve and activates the package with an opening ledger entry', async () => {
    const { service, tx } = decideSetup();
    await approve(service, reviewer(id(200)));
    expect(tx.pembelian.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PAID', verifiedById: id(200) }),
      }),
    );
    expect(tx.paketPelanggan.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: customerId, totalSessions: 8, status: 'ACTIVE' }),
      }),
    );
    expect(tx.sessionLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'PURCHASE', amount: 8, createdById: id(200) }),
      }),
    );
  });
});
