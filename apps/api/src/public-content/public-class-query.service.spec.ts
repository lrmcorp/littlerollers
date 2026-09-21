import { PublicClassQueryService } from './public-class-query.service';
import { ApiProblem } from '../identity/security';

describe('PublicClassQueryService', () => {
  const mockClassType = {
    id: 'class-type-1',
    code: 'GROUP_CLASS',
    name: 'Group Class',
    durationMinutes: 50,
    description: 'Authentic V1 Group Class',
    active: true,
  };

  const mockBranches = [
    {
      id: 'branch-1',
      code: 'GG',
      name: 'Green Garden',
      timezone: 'Asia/Jakarta',
      address: 'Green Garden Blok Z No. 1',
      supportWhatsappE164: '+628123456789',
    },
  ];

  const db = {
    jenisKelas: {
      findFirst: jest.fn(),
    },
    cabang: {
      findMany: jest.fn().mockResolvedValue(mockBranches),
    },
    paket: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    promosiPaket: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    slotKelas: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  const service = new PublicClassQueryService(db as never);

  beforeEach(() => {
    jest.clearAllMocks();
    db.cabang.findMany.mockResolvedValue(mockBranches);
    db.paket.findMany.mockResolvedValue([]);
    db.promosiPaket.findMany.mockResolvedValue([]);
    db.slotKelas.findMany.mockResolvedValue([]);
  });

  it('resolves authentic V1 class type code GROUP_CLASS', async () => {
    db.jenisKelas.findFirst.mockResolvedValue(mockClassType);

    const result = await service.detail('GROUP_CLASS');
    expect(result.profile.code).toBe('GROUP_CLASS');
    expect(result.profile.name).toBe('Group Class');
    expect(result.studios).toHaveLength(1);
    expect(result.studios[0]?.name).toBe('Green Garden');
  });

  it('resolves legacy and SEO alias reformer-pilates to GROUP_CLASS', async () => {
    db.jenisKelas.findFirst.mockResolvedValue(mockClassType);

    const result = await service.detail('reformer-pilates');
    expect(db.jenisKelas.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([{ code: 'GROUP_CLASS' }]),
        }),
      }),
    );
    expect(result.profile.code).toBe('GROUP_CLASS');
  });

  it('throws RESOURCE_NOT_FOUND when class type is not found', async () => {
    db.jenisKelas.findFirst.mockResolvedValue(null);

    await expect(service.detail('non-existent-class')).rejects.toThrow(ApiProblem);
  });
});
