import { ClassSlotService, CANCELLATION_REASONS } from './slot-kelas.service';
import { PolicyService } from '../identity/policy.service';

const branchId = '00000000-0000-4000-8000-000000000002';
const principal = {
  sessionId: 'session',
  userId: '00000000-0000-4000-8000-000000000001',
  roles: [{ role: 'ADMIN' as const, branchId }],
  capabilities: ['class-slot:read', 'class-slot:manage'],
  branchIds: [branchId],
};

describe('ClassSlotService contract boundaries', () => {
  const db = { slotKelas: { findMany: jest.fn().mockResolvedValue([]) } };
  const service = new ClassSlotService(
    db as never,
    new PolicyService(),
    {} as never,
    { value: { quotaEvaluation: { maxAttempts: 5 } } } as never,
  );

  it('exposes only controlled synthetic cancellation reasons', () => {
    expect(CANCELLATION_REASONS).toEqual([
      'STUDIO_UNAVAILABLE',
      'INSTRUCTOR_UNAVAILABLE',
      'SAFETY_ISSUE',
      'OTHER_REVIEW_REQUIRED',
    ]);
  });
  it('rejects offset-less or reversed create ranges before persistence', async () => {
    const base = {
      branchId,
      classTypeId: '00000000-0000-4000-8000-000000000003',
      studioId: '00000000-0000-4000-8000-000000000004',
    };
    await expect(
      service.create(
        principal,
        { ...base, startAt: '2026-08-01T09:00:00', endAt: '2026-08-01T10:00:00Z' },
        '1234567890123456',
        'test',
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.create(
        principal,
        { ...base, startAt: '2026-08-01T11:00:00Z', endAt: '2026-08-01T10:00:00Z' },
        '1234567890123456',
        'test',
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
  it('hides foreign branch list access', async () => {
    await expect(
      service.list(principal, { branchId: '00000000-0000-4000-8000-000000000099' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
  const customer = {
    ...principal,
    roles: [{ role: 'CUSTOMER' as const, branchId: null }],
    capabilities: ['class-slot:read', 'customer:self'],
    branchIds: [],
  };
  const owner = {
    ...principal,
    roles: [{ role: 'OWNER' as const, branchId }],
    capabilities: ['class-slot:read', 'finance:read'],
    branchIds: [branchId],
  };
  const instructor = {
    ...principal,
    roles: [{ role: 'INSTRUCTOR' as const, branchId }],
    capabilities: ['class-slot:read', 'class:assigned:read', 'attendance:self'],
    branchIds: [branchId],
  };
  const lastWhere = () => db.slotKelas.findMany.mock.calls.at(-1)![0].where;

  it('allows a customer to discover only published slots without an internal branch role', async () => {
    await service.list(customer, {});
    expect(lastWhere().AND).toEqual([{ status: 'PUBLISHED' }]);
  });

  it('never lets a status filter widen what a customer may see', async () => {
    await service.list(customer, { status: 'DRAFT' });
    expect(lastWhere().AND).toEqual([{ status: 'PUBLISHED' }]);
  });

  it('shows an instructor the published schedule plus only their own classes in any other status', async () => {
    await service.list(instructor, { branchId });
    expect(lastWhere().AND).toEqual([
      { OR: [{ status: 'PUBLISHED' }, { instructorId: instructor.userId }] },
    ]);
  });

  it('keeps an instructor\'s status filter inside that visibility rule', async () => {
    await service.list(instructor, { branchId, status: 'DRAFT' });
    const where = lastWhere();
    expect(where.status).toBe('DRAFT');
    expect(where.AND).toEqual([
      { OR: [{ status: 'PUBLISHED' }, { instructorId: instructor.userId }] },
    ]);
  });

  it('keeps read-only staff on published classes by default, widening only through an explicit filter', async () => {
    await service.list(owner, { branchId });
    expect(lastWhere()).toMatchObject({ status: 'PUBLISHED' });
    expect(lastWhere()).not.toHaveProperty('AND');
    await service.list(owner, { branchId, status: 'CANCELLED' });
    expect(lastWhere()).toMatchObject({ status: 'CANCELLED' });
  });

  it('gives scheduling staff every status, with no visibility restriction', async () => {
    await service.list(principal, { branchId });
    expect(lastWhere()).not.toHaveProperty('AND');
    expect(lastWhere()).not.toHaveProperty('status');
  });
});
