import { PublicSiteConfigService } from './public-site-config.service';

describe('PublicSiteConfigService', () => {
  it('projects only active public studios and class profiles from the database', async () => {
    const db = {
      branch: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'branch-jakarta',
            code: 'DD-JKT',
            name: 'Daily Dose Jakarta',
            timezone: 'Asia/Jakarta',
            supportWhatsappE164: null,
            publicProfile: { slug: 'jakarta', area: 'Jakarta', city: 'Jakarta' },
          },
        ]),
      },
      classType: {
        findMany: jest.fn().mockResolvedValue([{ code: 'REFORMER', name: 'Reformer Pilates' }]),
      },
      publicClassProfile: {
        findMany: jest.fn().mockResolvedValue([
          {
            code: 'REFORMER',
            slug: 'reformer-pilates',
            summary: 'Latihan reformer.',
            description: 'Latihan seluruh tubuh.',
            level: 'Semua level',
            durationMinutes: 50,
            equipment: ['Reformer'],
            benefits: ['Kekuatan'],
            heroImageKey: 'classes/reformer-pilates.png',
          },
        ]),
      },
    };
    const service = new PublicSiteConfigService(
      db as never,
      {
        value: { publicSupportWhatsappE164: '+622100000000' },
      } as never,
    );

    await expect(service.get()).resolves.toMatchObject({
      branches: [{ code: 'DD-JKT', publicProfile: { slug: 'jakarta' } }],
      classes: [{ code: 'REFORMER', name: 'Reformer Pilates' }],
      fallbackWhatsappE164: '+622100000000',
    });
    expect(db.branch.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true, publicProfile: { isNot: null } },
      }),
    );
    expect(db.publicClassProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true, code: { in: ['REFORMER'] } },
      }),
    );
  });
});
