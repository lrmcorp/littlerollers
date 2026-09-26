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
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
  });
  it('allows a customer to discover only published slots without an internal branch role', async () => {
    await service.list(
      {
        ...principal,
        roles: [{ role: 'CUSTOMER', branchId: null }],
        capabilities: ['class-slot:read'],
        branchIds: [],
      },
      {},
    );
    expect(db.slotKelas.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'PUBLISHED' }) }),
    );
  });
});

describe('ClassSlotService completion authorization', () => {
  const slotId = '00000000-0000-4000-8000-000000000010';
  const foreignBranch = '00000000-0000-4000-8000-000000000099';
  const customer = {
    ...principal,
    roles: [{ role: 'CUSTOMER' as const, branchId: null }],
    capabilities: ['class-slot:read'],
    branchIds: [],
  };
  const execute = jest.fn();
  const db = {
    slotKelas: { findUnique: jest.fn() },
    pemesananKelas: { findMany: jest.fn().mockResolvedValue([]) },
  };
  const service = new ClassSlotService(
    db as never,
    new PolicyService(),
    { execute } as never,
    { value: {} } as never,
  );

  beforeEach(() => {
    execute.mockReset();
    db.slotKelas.findUnique.mockReset();
  });

  it('denies a customer before any completion side effect', async () => {
    await expect(
      service.complete(customer, slotId, {}, '1234567890123456', 'test'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(execute).not.toHaveBeenCalled();
  });

  it('denies completion-control without class-slot:manage', async () => {
    await expect(service.completionControl(customer, slotId)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(db.slotKelas.findUnique).not.toHaveBeenCalled();
  });

  it('hides completion-control of a slot in a foreign branch', async () => {
    db.slotKelas.findUnique.mockResolvedValue({ id: slotId, branchId: foreignBranch });
    await expect(service.completionControl(principal, slotId)).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });

  it('allows completion-control for staff with manage inside their branch', async () => {
    db.slotKelas.findUnique.mockResolvedValue({ id: slotId, branchId });
    await expect(service.completionControl(principal, slotId)).resolves.toMatchObject({
      classSlotId: slotId,
    });
  });

  it('rejects completion of a foreign-branch slot inside the transaction', async () => {
    execute.mockImplementation(async (_opts: unknown, action: (tx: unknown) => Promise<unknown>) =>
      action({ slotKelas: { findUnique: async () => ({ id: slotId, branchId: foreignBranch }) } }),
    );
    await expect(
      service.complete(principal, slotId, {}, '1234567890123456', 'test'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
  });
});
