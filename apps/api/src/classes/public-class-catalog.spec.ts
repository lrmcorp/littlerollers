import { PublicScheduleQueryService } from '../public-content/public-schedule-query.service';

const branchId = '00000000-0000-4000-8000-000000000002';

describe('PublicScheduleQueryService', () => {
  const db = {
    branch: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { id: branchId, code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' },
        ]),
    },
    classSlot: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: '00000000-0000-4000-8000-000000000004',
          branchId,
          classType: {
            id: '00000000-0000-4000-8000-000000000003',
            code: 'PRIVATE',
            name: 'Private Class',
          },
          startAt: new Date('2026-07-25T03:00:00.000Z'),
          endAt: new Date('2026-07-25T03:50:00.000Z'),
          timezone: 'Asia/Jakarta',
          status: 'PUBLISHED',
          capacity: 4,
          bookedCount: 2,
        },
      ]),
    },
  };
  const service = new PublicScheduleQueryService(db as never);

  beforeEach(() => jest.clearAllMocks());

  it('returns active branch discovery without leaking slots before explicit selection', async () => {
    const result = await service.list({});
    expect(result.branches).toHaveLength(1);
    expect(result.items).toEqual([]);
    expect(db.classSlot.findMany).not.toHaveBeenCalled();
    expect(db.branch.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          supportWhatsappE164: true,
          publicProfile: true,
        }),
      }),
    );
  });

  it('returns only the safe public projection and derived remaining capacity', async () => {
    const result = await service.list({
      branchId,
      from: '2026-07-23T00:00:00.000Z',
      until: '2026-08-01T00:00:00.000Z',
    });
    expect(result.items).toEqual([
      expect.objectContaining({
        branchId,
        available: 2,
        classType: expect.objectContaining({ name: 'Private Class' }),
      }),
    ]);
    expect(result.items[0]).not.toHaveProperty('bookedCount');
    expect(result.items[0]).not.toHaveProperty('instructorUserId');
    expect(db.classSlot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: { in: ['PUBLISHED', 'CONFIRMED'] } }),
      }),
    );
  });

  it('rejects invalid branch and excessive date ranges before querying slots', async () => {
    await expect(service.list({ branchId: 'invalid' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    await expect(
      service.list({
        branchId,
        from: '2026-07-01T00:00:00.000Z',
        until: '2026-09-01T00:00:00.000Z',
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
