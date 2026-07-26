import { PublicPackageCatalogService } from './public-package-catalog.service';

const branchId = '00000000-0000-4000-8000-000000000002';

describe('PublicPackageCatalogService', () => {
  const db = {
    branch: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { id: branchId, code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' },
        ]),
    },
    package: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: '00000000-0000-4000-8000-000000000004',
          branchId,
          businessKey: 'PRIVATE-4',
          name: 'Pilates Starter',
          sessionCount: 4,
          durationDays: 30,
          priceRp: 1200000,
          effectiveUntil: null,
          updatedAt: new Date('2026-07-27T00:00:00.000Z'),
          classType: {
            id: '00000000-0000-4000-8000-000000000003',
            code: 'PRIVATE',
            name: 'Private Class',
          },
        },
      ]),
    },
  };
  const service = new PublicPackageCatalogService(db as never);

  beforeEach(() => jest.clearAllMocks());

  it('returns branch discovery without exposing packages before explicit selection', async () => {
    const result = await service.list();
    expect(result.branches).toHaveLength(1);
    expect(result.items).toEqual([]);
    expect(db.package.findMany).not.toHaveBeenCalled();
  });

  it('returns only an active effective public commercial projection', async () => {
    const result = await service.list(branchId);
    expect(result.items).toEqual([
      expect.objectContaining({
        branchId,
        name: 'Pilates Starter',
        priceRp: 1200000,
        classType: expect.objectContaining({ name: 'Private Class' }),
      }),
    ]);
    expect(result.items[0]).not.toHaveProperty('businessKey');
    expect(result.items[0]).not.toHaveProperty('version');
    expect(result.items[0]).not.toHaveProperty('createdAt');
    expect(db.package.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE', branchId }),
      }),
    );
  });

  it('deduplicates overlapping legacy seed records by commercial business key', async () => {
    db.package.findMany.mockResolvedValueOnce([
      {
        id: '00000000-0000-4000-8000-000000000004',
        branchId,
        businessKey: 'PRIVATE-4',
        name: 'Pilates Starter',
        sessionCount: 4,
        durationDays: 30,
        priceRp: 1200000,
        effectiveUntil: null,
        updatedAt: new Date('2026-07-27T00:00:00.000Z'),
        classType: {
          id: '00000000-0000-4000-8000-000000000003',
          code: 'PRIVATE',
          name: 'Private Class',
        },
      },
      {
        id: '00000000-0000-4000-8000-000000000005',
        branchId,
        businessKey: 'PRIVATE-4',
        name: 'Legacy duplicate',
        sessionCount: 4,
        durationDays: 30,
        priceRp: 1200000,
        effectiveUntil: null,
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        classType: {
          id: '00000000-0000-4000-8000-000000000003',
          code: 'PRIVATE',
          name: 'Private Class',
        },
      },
    ]);

    const result = await service.list(branchId);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe('Pilates Starter');
  });

  it('rejects malformed and unavailable branch identifiers', async () => {
    await expect(service.list('invalid')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(service.list('00000000-0000-4000-8000-000000000099')).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });
});
