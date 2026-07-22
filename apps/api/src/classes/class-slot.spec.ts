import { ClassSlotService, CANCELLATION_REASONS } from './class-slot.service';
import { PolicyService } from '../identity/policy.service';

const branchId = '00000000-0000-4000-8000-000000000002';
const principal = {
  sessionId: 'session',
  userId: '00000000-0000-4000-8000-000000000001',
  assurance: 'MFA' as const,
  roles: [{ role: 'ADMIN' as const, branchId }],
  capabilities: ['class-slot:read', 'class-slot:manage'],
  branchIds: [branchId],
};

describe('ClassSlotService contract boundaries', () => {
  const db = { classSlot: { findMany: jest.fn().mockResolvedValue([]) } };
  const service = new ClassSlotService(db as never, new PolicyService(), {} as never);

  it('exposes only controlled synthetic cancellation reasons', () => {
    expect(CANCELLATION_REASONS).toEqual([
      'STUDIO_UNAVAILABLE',
      'INSTRUCTOR_UNAVAILABLE',
      'SAFETY_ISSUE',
      'OTHER_REVIEW_REQUIRED',
    ]);
  });
  it('rejects offset-less or reversed create ranges before persistence', async () => {
    const base = { branchId, classTypeId: '00000000-0000-4000-8000-000000000003' };
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
    expect(db.classSlot.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'PUBLISHED' }) }),
    );
  });
});
