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

  it('lets an instructor see their own classes in every status without an explicit filter, unlike a customer', async () => {
    await service.list(
      {
        ...principal,
        roles: [{ role: 'INSTRUCTOR', branchId }],
        capabilities: ['class-slot:read', 'class:assigned:read', 'attendance:self'],
        branchIds: [branchId],
      },
      { branchId },
    );
    const lastCall = db.slotKelas.findMany.mock.calls.at(-1)![0];
    expect(lastCall.where).not.toHaveProperty('status');
  });
});

describe('ClassSlotService completion authorization', () => {
  const slotId = '00000000-0000-4000-8000-000000000010';
  const foreignBranch = '00000000-0000-4000-8000-000000000099';
  const instructorId = '00000000-0000-4000-8000-000000000050';
  const otherInstructorId = '00000000-0000-4000-8000-000000000051';
  const customer = {
    ...principal,
    roles: [{ role: 'CUSTOMER' as const, branchId: null }],
    capabilities: ['class-slot:read'],
    branchIds: [],
  };
  const instructor = {
    ...principal,
    userId: instructorId,
    roles: [{ role: 'INSTRUCTOR' as const, branchId }],
    capabilities: ['class-slot:read', 'attendance:self'],
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

  it('denies a customer without persisting any completion side effect', async () => {
    execute.mockImplementation(async (_opts: unknown, action: (tx: unknown) => Promise<unknown>) =>
      action({ slotKelas: { findUnique: async () => ({ id: slotId, branchId, instructorId: null }) } }),
    );
    await expect(
      service.complete(customer, slotId, {}, '1234567890123456', 'test'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('denies completion-control without class-slot:manage or matching instructor ownership', async () => {
    db.slotKelas.findUnique.mockResolvedValue({ id: slotId, branchId, instructorId: null });
    await expect(service.completionControl(customer, slotId)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
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

  it('allows the assigned instructor to read completion-control without class-slot:manage', async () => {
    db.slotKelas.findUnique.mockResolvedValue({ id: slotId, branchId, instructorId });
    await expect(service.completionControl(instructor, slotId)).resolves.toMatchObject({
      classSlotId: slotId,
    });
  });

  it('denies completion-control to an instructor not assigned to the slot', async () => {
    db.slotKelas.findUnique.mockResolvedValue({ id: slotId, branchId, instructorId: otherInstructorId });
    await expect(service.completionControl(instructor, slotId)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('allows the assigned instructor to complete their own class', async () => {
    execute.mockImplementation(async (_opts: unknown, action: (tx: unknown) => Promise<unknown>) =>
      action({
        slotKelas: {
          // Slot already COMPLETED hits the idempotent-guard return path, which is enough to
          // prove the authorization gate let the owning instructor through.
          findUnique: async () => ({
            id: slotId,
            branchId,
            instructorId,
            status: 'COMPLETED',
            bookings: [],
          }),
        },
      }),
    );
    await expect(
      service.complete(instructor, slotId, {}, '1234567890123456', 'test'),
    ).resolves.toMatchObject({ body: { id: slotId, status: 'COMPLETED' } });
  });

  it('tallies attendance and no-show counts instead of leaving them undefined in the response', async () => {
    const attendedBooking = {
      id: 'booking-attended',
      status: 'ATTENDED',
      attendance: { id: 'attendance-1' },
      customerPackageId: null,
    };
    const noShowBooking = {
      id: 'booking-no-show',
      status: 'BOOKED',
      attendance: null,
      customerPackageId: null,
    };
    execute.mockImplementation(async (_opts: unknown, action: (tx: unknown) => Promise<unknown>) =>
      action({
        slotKelas: {
          findUnique: async () => ({
            id: slotId,
            branchId,
            instructorId,
            status: 'CONFIRMED',
            bookings: [attendedBooking, noShowBooking],
          }),
          updateMany: async () => ({ count: 1 }),
          findUniqueOrThrow: async () => ({ id: slotId, branchId, instructorId, status: 'COMPLETED' }),
        },
        pemesananKelas: { update: async () => ({}) },
        sessionLedger: { findFirst: async () => null, create: async () => ({}) },
        paketPelanggan: { findUnique: async () => null, update: async () => ({}) },
        checkInToken: { updateMany: async () => ({ count: 0 }) },
      }),
    );
    await expect(
      service.complete(instructor, slotId, {}, '1234567890123456', 'test'),
    ).resolves.toMatchObject({ body: { attendanceCount: 1, noShowCount: 1 } });
  });

  it('denies completion of a class assigned to a different instructor', async () => {
    execute.mockImplementation(async (_opts: unknown, action: (tx: unknown) => Promise<unknown>) =>
      action({
        slotKelas: {
          findUnique: async () => ({
            id: slotId,
            branchId,
            instructorId: otherInstructorId,
            status: 'CONFIRMED',
          }),
        },
      }),
    );
    await expect(
      service.complete(instructor, slotId, {}, '1234567890123456', 'test'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
