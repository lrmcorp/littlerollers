import { PolicyService } from '../identity/policy.service';
import { SupportCasesService } from './support-cases.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(1);
const branchB = id(2);
const caseId = id(50);
const customerId = id(200);
const staffId = id(300);

const principalFor = (
  capabilities: string[],
  branchIds: string[] = [branchA],
  userId = id(100),
) => ({ sessionId: 's', userId, roles: [] as never, capabilities, branchIds });
const manager = principalFor(['support:read', 'support:manage']);
const customer = principalFor(['customer:self'], []);
const global = principalFor(['support:read', 'support:manage', 'branch:all'], []);

const row = (overrides: Record<string, unknown> = {}) => ({
  id: caseId,
  subject: 'Reschedule sesi',
  customerId,
  branchId: branchA,
  priority: 'NORMAL',
  status: 'OPEN',
  tags: ['vip'],
  assignedUserId: null,
  version: 1,
  resolvedAt: null,
  createdAt: new Date('2026-09-01T00:00:00Z'),
  updatedAt: new Date('2026-09-01T00:00:00Z'),
  customer: { id: customerId, displayName: 'Maya', email: 'm@x.test', phone: '+628111' },
  branch: { id: branchA, name: 'Green Garden' },
  assignedUser: null,
  _count: { notes: 0 },
  ...overrides,
});

function setup(current: Record<string, unknown> | null = row()) {
  const db = {
    user: {
      findUnique: jest.fn().mockImplementation(async ({ where }: { where: { id: string } }) =>
        where.id === staffId
          ? { id: staffId, status: 'ACTIVE', role: 'ADMIN' }
          : where.id === customerId
            ? { id: customerId, displayName: 'Maya', email: 'm@x.test', status: 'ACTIVE', role: 'CUSTOMER' }
            : null,
      ),
    },
    cabang: { findUnique: jest.fn().mockResolvedValue({ id: branchA, name: 'Green Garden' }) },
    supportCase: {
      findMany: jest.fn().mockResolvedValue([row()]),
      groupBy: jest.fn().mockResolvedValue([
        { status: 'OPEN', _count: { _all: 3 } },
        { status: 'RESOLVED', _count: { _all: 2 } },
      ]),
      findUnique: jest.fn().mockResolvedValue(current),
      create: jest.fn().mockImplementation(async ({ data }) => row({ ...data, id: caseId })),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      update: jest.fn().mockResolvedValue({}),
    },
    supportCaseNote: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: id(60),
          body: 'Sudah dihubungi',
          internal: true,
          createdAt: new Date('2026-09-02T00:00:00Z'),
          author: { id: staffId, displayName: 'Admin GG' },
        },
      ]),
      create: jest.fn().mockImplementation(async ({ data }) => ({
        id: id(61),
        createdAt: new Date('2026-09-03T00:00:00Z'),
        author: { id: data.authorId, displayName: 'Admin GG' },
        ...data,
      })),
    },
    $transaction: jest.fn(async (ops: Array<Promise<unknown>>) => Promise.all(ops)),
  };
  return { db, service: new SupportCasesService(db as never, new PolicyService()) };
}

describe('SupportCasesService access', () => {
  it('requires support capabilities for every operation', async () => {
    const { service } = setup();
    await expect(service.list(customer)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.create(customer, { customerUserId: customerId, subject: 'x' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.detail(customer, caseId)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.update(principalFor(['support:read']), caseId, { status: 'RESOLVED', expectedVersion: 1 }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.addInternalNote(principalFor(['support:read']), caseId, { body: 'catatan' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('hides cases of another branch and cases without a branch from branch staff', async () => {
    const { service, db } = setup(row({ branchId: branchB, branch: { id: branchB, name: 'PIK' } }));
    await expect(service.detail(manager, caseId)).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    await expect(
      service.update(manager, caseId, { status: 'RESOLVED', expectedVersion: 1 }),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    await expect(
      service.addInternalNote(manager, caseId, { body: 'catatan' }),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    expect(db.supportCase.updateMany).not.toHaveBeenCalled();
    const unassigned = setup(row({ branchId: null, branch: null }));
    await expect(unassigned.service.detail(manager, caseId)).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
    await expect(unassigned.service.detail(global, caseId)).resolves.toMatchObject({ id: caseId });
  });

  it('scopes the list to the staff branches, or everything for branch:all', async () => {
    const { service, db } = setup();
    await service.list(manager);
    expect(db.supportCase.findMany.mock.calls[0]![0].where.AND[0]).toEqual({ branchId: { in: [branchA] } });
    await service.list(global);
    expect(db.supportCase.findMany.mock.calls[1]![0].where.AND[0]).toEqual({});
  });
});

describe('SupportCasesService list', () => {
  it('validates filters, paginates and returns per-status counts', async () => {
    const { service, db } = setup();
    await expect(service.list(manager, { status: 'NOPE' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    await expect(service.list(manager, { priority: 'NOPE' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    db.supportCase.findMany.mockResolvedValue([row(), row({ id: id(51) }), row({ id: id(52) })]);
    const result = await service.list(manager, { limit: '2', status: 'OPEN', assignedUserId: 'me' });
    expect(result.items).toHaveLength(2);
    expect(result.page).toEqual({ hasMore: true, nextCursor: id(51) });
    expect(result.summary).toMatchObject({ total: 5, open: 3, resolved: 2, inProgress: 0 });
    const where = db.supportCase.findMany.mock.calls[0]![0].where.AND[1];
    expect(where).toMatchObject({ status: 'OPEN', assignedUserId: manager.userId });
  });

  it('shows the contract shape the web reads', async () => {
    const { service } = setup();
    const { items } = await service.list(manager);
    expect(items[0]).toMatchObject({
      customer: { phoneE164: '+628111' },
      branch: { name: 'Green Garden' },
      tags: ['vip'],
      version: 1,
      _count: { notes: 0 },
    });
  });
});

describe('SupportCasesService create', () => {
  it('validates input and never trusts a branch outside the staff scope', async () => {
    const { service, db } = setup();
    const base = { customerUserId: customerId, branchId: branchA, subject: 'Halo' };
    for (const bad of [
      { ...base, subject: '   ' },
      { ...base, subject: 'x'.repeat(201) },
      { ...base, priority: 'NGAWUR' },
      { ...base, tags: Array.from({ length: 11 }, (_, i) => `t${i}`) },
      { ...base, tags: ['x'.repeat(41)] },
      { ...base, customerUserId: 'x' },
      { ...base, note: 'x'.repeat(5001) },
    ])
      await expect(service.create(manager, bad)).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(service.create(manager, { ...base, branchId: branchB })).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
    await expect(
      service.create(manager, { ...base, branchId: null }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(db.supportCase.create).not.toHaveBeenCalled();
  });

  it('stores a normalized case with an optional first note and the creator', async () => {
    const { service, db } = setup();
    await service.create(manager, {
      customerUserId: customerId,
      branchId: branchA,
      subject: '  Lupa membawa QR  ',
      priority: 'HIGH',
      tags: [' VIP ', 'vip', 'Follow-Up'],
      note: '  Pelanggan menelepon  ',
    });
    expect(db.supportCase.create.mock.calls[0]![0].data).toMatchObject({
      subject: 'Lupa membawa QR',
      customerId,
      branchId: branchA,
      priority: 'HIGH',
      status: 'OPEN',
      tags: ['vip', 'follow-up'],
      createdById: manager.userId,
      notes: { create: { body: 'Pelanggan menelepon', internal: true, authorId: manager.userId } },
    });
  });
});

describe('SupportCasesService update', () => {
  it('needs the current version and at least one change', async () => {
    const { service, db } = setup();
    await expect(service.update(manager, caseId, { status: 'RESOLVED' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    await expect(service.update(manager, caseId, { expectedVersion: 1 })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    await expect(
      service.update(manager, caseId, { status: 'NOPE', expectedVersion: 1 }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(db.supportCase.updateMany).not.toHaveBeenCalled();
  });

  it('claims the row by version, bumps it, and stamps resolvedAt when closing or reopening', async () => {
    const { service, db } = setup();
    await service.update(manager, caseId, { status: 'RESOLVED', priority: 'URGENT', tags: ['A'], expectedVersion: 1 });
    const call = db.supportCase.updateMany.mock.calls[0]![0];
    expect(call.where).toEqual({ id: caseId, version: 1 });
    expect(call.data).toMatchObject({
      status: 'RESOLVED',
      priority: 'URGENT',
      tags: ['a'],
      version: { increment: 1 },
    });
    expect(call.data.resolvedAt).toBeInstanceOf(Date);
    await service.update(manager, caseId, { status: 'IN_PROGRESS', expectedVersion: 1 });
    expect(db.supportCase.updateMany.mock.calls[1]![0].data.resolvedAt).toBeNull();
  });

  it('returns 409 when the version is stale', async () => {
    const { service, db } = setup();
    db.supportCase.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.update(manager, caseId, { status: 'RESOLVED', expectedVersion: 1 }),
    ).rejects.toMatchObject({ code: 'STALE_VERSION' });
  });

  it('assigns only active staff, and clears the assignee with null', async () => {
    const { service, db } = setup();
    await expect(
      service.update(manager, caseId, { assignedUserId: customerId, expectedVersion: 1 }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.update(manager, caseId, { assignedUserId: id(999), expectedVersion: 1 }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await service.update(manager, caseId, { assignedUserId: staffId, expectedVersion: 1 });
    expect(db.supportCase.updateMany.mock.calls[0]![0].data.assignedUserId).toBe(staffId);
    await service.update(manager, caseId, { assignedUserId: null, expectedVersion: 1 });
    expect(db.supportCase.updateMany.mock.calls[1]![0].data.assignedUserId).toBeNull();
  });
});

describe('SupportCasesService internal notes', () => {
  it('adds an internal note by the acting staff member and touches the case', async () => {
    const { service, db } = setup();
    const note = await service.addInternalNote(manager, caseId, { body: '  Sudah dihubungi  ' });
    expect(db.supportCaseNote.create.mock.calls[0]![0].data).toEqual({
      caseId,
      body: 'Sudah dihubungi',
      internal: true,
      authorId: manager.userId,
    });
    expect(db.supportCase.update).toHaveBeenCalledWith({
      where: { id: caseId },
      data: { updatedAt: expect.any(Date) },
    });
    expect(note).toMatchObject({ internal: true, body: 'Sudah dihubungi' });
  });

  it('rejects empty or oversized notes and lists newest first on the detail', async () => {
    const { service, db } = setup();
    for (const body of [undefined, ' ', 'a', 'x'.repeat(5001)])
      await expect(service.addInternalNote(manager, caseId, { body })).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    expect(db.supportCaseNote.create).not.toHaveBeenCalled();
    const detail = await service.detail(manager, caseId);
    expect(detail.notes[0]).toMatchObject({ author: { displayName: 'Admin GG' }, internal: true });
    expect(db.supportCaseNote.findMany.mock.calls[0]![0].orderBy).toEqual([
      { createdAt: 'desc' },
      { id: 'desc' },
    ]);
  });
});
