import { FinanceService } from '../packages/finance.service';
import { MigrationsService } from '../operations/migrations.service';
import { SupportCasesService, inMemorySupportCases } from '../operations/support-cases.service';
import { IdentityDocumentAccessService } from './identity-document-access.service';
import { IdentityService } from './identity.service';
import { PolicyService } from './policy.service';
import { UserAdministrationService } from './user-administration.service';

const branchA = '00000000-0000-4000-8000-000000000001';
const branchB = '00000000-0000-4000-8000-000000000002';

const principal = (
  capabilities: string[],
  roles: Array<{ role: string; branchId: string | null }> = [],
  branchIds: string[] = [branchA],
  userId = '00000000-0000-4000-8000-0000000000aa',
) => ({ sessionId: 's', userId, roles: roles as never, capabilities, branchIds });

// Pelanggan: tidak punya satu pun kapabilitas staf.
const customer = principal(
  ['customer:self', 'ledger:read'],
  [{ role: 'CUSTOMER', branchId: null }],
  [],
  '00000000-0000-4000-8000-0000000000cc',
);

describe('lookups only serve staff pages that need them', () => {
  const findMany = jest.fn().mockResolvedValue([
    { id: 'u1', displayName: 'Coach A', role: 'COACH', phone: '+6281234567890', preferredBranchId: null },
  ]);
  const service = new UserAdministrationService(
    { user: { findMany } } as never,
    new PolicyService(),
    {} as never,
  );

  beforeEach(() => findMany.mockClear());

  it('refuses customers and staff without a picker page', async () => {
    await expect(service.lookupUsers(customer, {})).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.lookupUsers(principal(['booking:read']), { instructorsOnly: true }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(findMany).not.toHaveBeenCalled();
  });

  it('serves users to assignment/master/user admins without phone numbers', async () => {
    const result = await service.lookupUsers(principal(['assignment:manage']), {});
    expect(result.items[0]).toMatchObject({ id: 'u1', label: 'Coach A', description: 'COACH' });
    expect(JSON.stringify(result)).not.toContain('+6281234567890');
  });

  it('serves instructors to timetable managers but not to audit-only roles', async () => {
    await expect(
      service.lookupUsers(principal(['class-slot:manage']), { instructorsOnly: true }),
    ).resolves.toMatchObject({ items: expect.any(Array) });
    await expect(
      service.lookupUsers(principal(['audit:read']), { instructorsOnly: true }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('requires audit:read for a per-user audit trail', async () => {
    await expect(service.listUserAudit(customer, 'x')).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.listUserAudit(principal(['audit:read']), 'x')).resolves.toMatchObject({
      items: [],
    });
  });
});

describe('MigrationsService', () => {
  const service = new MigrationsService(new PolicyService());

  it('denies every read without migration:read', async () => {
    await expect(service.cdc(customer)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.listBatches(customer)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.controlTotals(customer, 'b')).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.rejects(customer, 'b')).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.resolutions(customer, 'b')).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('never reports a fake successful resolution decision', async () => {
    const body = { approve: true, reason: 'x', decision: {} };
    await expect(
      service.decideResolution(principal(['migration:read']), 'r', body),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.decideResolution(principal(['migration:resolve']), 'r', body),
    ).rejects.toMatchObject({ code: 'NOT_IMPLEMENTED' });
  });
});

describe('SupportCasesService', () => {
  const db = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 'c1', displayName: 'Maya', email: 'm@x.test' }),
    },
    cabang: { findUnique: jest.fn().mockResolvedValue({ id: branchA, name: 'GG' }) },
  };
  const service = new SupportCasesService(db as never, new PolicyService());
  const manager = principal(['support:read', 'support:manage']);

  beforeEach(() => {
    inMemorySupportCases.length = 0;
  });

  it('requires support capabilities and no longer seeds fabricated cases', async () => {
    await expect(service.list(customer)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.create(customer, { customerUserId: 'c1', subject: 'x' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.detail(customer, 'any')).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.list(manager)).resolves.toMatchObject({ items: [], summary: { total: 0 } });
  });

  it('scopes cases to the branch of the staff member', async () => {
    const created = await service.create(manager, {
      customerUserId: 'c1',
      branchId: branchA,
      subject: '  Jadwal  ',
    });
    expect(created.subject).toBe('Jadwal');
    await expect(service.detail(manager, created.id)).resolves.toMatchObject({ id: created.id });
    const otherBranch = principal(['support:read'], [], [branchB]);
    await expect(service.list(otherBranch)).resolves.toMatchObject({ items: [] });
    await expect(service.detail(otherBranch, created.id)).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
    await expect(
      service.create(manager, { customerUserId: 'c1', branchId: branchB, subject: 'x' }),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
  });
});

describe('FinanceService capability gates', () => {
  const db = {
    monthlyClose: { findMany: jest.fn().mockResolvedValue([]) },
    cabang: { findUnique: jest.fn().mockResolvedValue({ id: branchA }) },
  };
  const service = new FinanceService(db as never, new PolicyService());
  const branchManager = principal(['booking:read'], [{ role: 'MANAGER', branchId: branchA }]);

  it('denies reports, stubs and periods without finance:read even to a branch member', async () => {
    await expect(service.overview(branchManager, { branchId: branchA })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(service.omsetReport(branchManager, { branchId: branchA })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(service.anomalies(customer, {})).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.legacyCashflow(customer, {})).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.periods(customer, {})).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('denies finance writes without finance:manage', async () => {
    const reader = principal(['finance:read'], [{ role: 'OWNER', branchId: branchA }]);
    await expect(
      service.createOtherCost(reader, {
        branchId: branchA,
        period: '2026-01',
        category: 'X',
        description: 'x',
        amountRp: 1,
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.deleteOtherCost(reader, 'id')).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.executeMonthlyClose(reader, { branchId: branchA, period: '2026-01' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('lists periods only for the principal branches instead of the first branch', async () => {
    const reader = principal(['finance:read'], [{ role: 'OWNER', branchId: branchA }]);
    await service.periods(reader, {});
    expect(db.monthlyClose.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { branchId: { in: [branchA] } } }),
    );
    await expect(service.periods(reader, { branchId: branchB })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    const global = principal(
      ['finance:read', 'branch:all'],
      [{ role: 'FINANCE', branchId: null }],
      [],
    );
    await service.periods(global, {});
    expect(db.monthlyClose.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });
});

describe('IdentityDocumentAccessService', () => {
  it('binds a view authorization to the principal that requested it', async () => {
    const service = new IdentityDocumentAccessService(new PolicyService());
    const owner = principal(
      ['customer:self'],
      [{ role: 'CUSTOMER', branchId: null }],
      [],
      '00000000-0000-4000-8000-0000000000c1',
    );
    const stranger = { ...owner, userId: '00000000-0000-4000-8000-0000000000c2' };
    const { url } = await service.authorizeSelf(owner, 'KTP');
    const authorizationId = /identity-verification-files\/([^/]+)\/content/u.exec(url)?.[1] ?? '';
    await expect(service.read(stranger, authorizationId)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(service.read(owner, authorizationId)).resolves.toMatchObject({
      mimeType: expect.any(String),
    });
  });
});

describe('IdentityService.requestPasswordSetup', () => {
  const service = Object.create(IdentityService.prototype) as IdentityService;
  (service as unknown as { policy: PolicyService }).policy = new PolicyService();
  const body = { email: 'a@b.test', reason: 'x' };

  it('requires user:admin and never claims a link was sent', async () => {
    await expect(service.requestPasswordSetup(customer, 'u', body, 'c')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(
      service.requestPasswordSetup(principal(['user:admin']), 'u', body, 'c'),
    ).rejects.toMatchObject({ code: 'NOT_IMPLEMENTED' });
  });
});
