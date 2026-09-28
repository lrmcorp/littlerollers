import { AvailabilityService } from './ketersediaan-instruktur.service';
import { PolicyService } from '../identity/policy.service';

const principal = {
  sessionId: 'session',
  userId: '00000000-0000-4000-8000-000000000001',
  roles: [{ role: 'INSTRUCTOR' as const, branchId: '00000000-0000-4000-8000-000000000002' }],
  capabilities: ['availability:self:read', 'availability:self:create'],
  branchIds: ['00000000-0000-4000-8000-000000000002'],
};

describe('AvailabilityService boundary', () => {
  const db = {
    slotKelas: { findMany: jest.fn().mockResolvedValue([]) },
    instructorAvailability: { findMany: jest.fn().mockResolvedValue([]) },
  };
  const service = new AvailabilityService(db as never, new PolicyService(), {} as never);

  beforeEach(() => {
    db.slotKelas.findMany.mockClear();
    db.instructorAvailability.findMany.mockClear().mockResolvedValue([]);
  });

  it('rejects offset-less and non-positive intervals before persistence', async () => {
    await expect(
      service.create(
        principal,
        {
          branchId: principal.branchIds[0]!,
          startAt: '2026-08-01T09:00:00',
          endAt: '2026-08-01T10:00:00Z',
        },
        '1234567890123456',
        'test',
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.create(
        principal,
        {
          branchId: principal.branchIds[0]!,
          startAt: '2026-08-01T10:00:00Z',
          endAt: '2026-08-01T10:00:00Z',
        },
        '1234567890123456',
        'test',
      ),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('returns a stable empty page and hides foreign branches', async () => {
    await expect(
      service.list(principal, '00000000-0000-4000-8000-000000000099'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    await expect(service.list(principal, principal.branchIds[0])).resolves.toEqual({
      items: [],
      page: { hasMore: false, nextCursor: null },
    });
  });

  it('reads submitted availability from instructor_availability, not the instructor\'s assigned class slots', async () => {
    db.instructorAvailability.findMany.mockResolvedValueOnce([
      {
        id: 'avail-1',
        instructorId: principal.userId,
        branchId: principal.branchIds[0],
        date: new Date('2026-11-21T00:00:00.000Z'),
        startTime: '08:00:00',
        endTime: '09:00:00',
        branch: { timezone: 'Asia/Jakarta' },
      },
    ]);

    const result = await service.list(principal, principal.branchIds[0]);

    expect(result).toEqual({
      items: [
        {
          id: 'avail-1',
          instructorUserId: principal.userId,
          branchId: principal.branchIds[0],
          startAt: new Date('2026-11-21T08:00:00.000Z'),
          endAt: new Date('2026-11-21T09:00:00.000Z'),
          timezone: 'Asia/Jakarta',
          version: 1,
          status: 'ACTIVE',
        },
      ],
      page: { hasMore: false, nextCursor: null },
    });
    expect(db.slotKelas.findMany).not.toHaveBeenCalled();
  });

  it('parses legacy "HH:MM" (no seconds) rows instead of producing an Invalid Date', async () => {
    db.instructorAvailability.findMany.mockResolvedValueOnce([
      {
        id: 'avail-legacy',
        instructorId: principal.userId,
        branchId: principal.branchIds[0],
        date: new Date('2026-11-20T00:00:00.000Z'),
        startTime: '08:00',
        endTime: '12:00',
        branch: { timezone: 'Asia/Jakarta' },
      },
    ]);

    const result = await service.list(principal, principal.branchIds[0]);

    expect(result.items[0]!.startAt.toISOString()).toBe('2026-11-20T08:00:00.000Z');
    expect(result.items[0]!.endAt.toISOString()).toBe('2026-11-20T12:00:00.000Z');
    expect(Number.isNaN(result.items[0]!.startAt.getTime())).toBe(false);
  });
});
