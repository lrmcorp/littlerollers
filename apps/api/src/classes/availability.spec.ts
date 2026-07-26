import { AvailabilityService } from './availability.service';
import { PolicyService } from '../identity/policy.service';

const principal = {
  sessionId: 'session',
  userId: '00000000-0000-4000-8000-000000000001',
  roles: [{ role: 'INSTRUCTOR' as const, branchId: '00000000-0000-4000-8000-000000000002' }],
  capabilities: ['availability:self:read', 'availability:self:create'],
  branchIds: ['00000000-0000-4000-8000-000000000002'],
};

describe('AvailabilityService boundary', () => {
  const db = { instructorAvailability: { findMany: jest.fn().mockResolvedValue([]) } };
  const service = new AvailabilityService(db as never, new PolicyService(), {} as never);

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
});
