import { PublicSiteConfigService } from './public-site-config.service';

describe('PublicSiteConfigService', () => {
  it('projects active branches and classes with heroImageKey from the database', async () => {
    const db = {
      cabang: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'branch-gg',
            code: 'DD-GG',
            name: 'Daily Dose Green Garden',
            timezone: 'Asia/Jakarta',
            supportWhatsappE164: '+6281212327038',
            heroImageKey: 'branches/green-garden.png',
            galleryImageKeys: ['branches/green-garden.png'],
          },
        ]),
      },
      publicContent: { findFirst: jest.fn().mockResolvedValue(null) },
      jenisKelas: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'class-reformer',
            code: 'REFORMER',
            name: 'Reformer Pilates',
            description: 'Full body reformer',
            durationMinutes: 50,
            heroImageKey: 'classes/reformer-pilates.png',
          },
        ]),
      },
    };
    const service = new PublicSiteConfigService(
      db as never,
      {
        value: {
          publicSupportWhatsappE164: '+622100000000',
          bookingCancellation: { enabled: false },
          reschedule: { enabled: true },
          mobileFeatures: {
            accountRecovery: false,
            revokeAllSessions: false,
            customerCheckIn: true,
            instructorCheckIn: false,
          },
        },
      } as never,
    );

    const result = await service.get();
    expect(result).toMatchObject({
      branches: [
        {
          code: 'DD-GG',
          publicProfile: {
            slug: 'dd-gg',
            heroImageKey: 'branches/green-garden.png',
          },
        },
      ],
      classes: [
        {
          code: 'REFORMER',
          name: 'Reformer Pilates',
          heroImageKey: 'classes/reformer-pilates.png',
        },
      ],
      heroCarousel: null,
      fallbackWhatsappE164: '+622100000000',
    });
    expect(db.cabang.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true },
      }),
    );
    expect(db.jenisKelas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true },
      }),
    );
  });

  it('serves the published hero carousel from managed content, and null when none is published', async () => {
    const published = { autoplay: true, intervalMs: 6000, slides: [{ id: 's1', title: 'Halo' }] };
    const db = {
      cabang: { findMany: jest.fn().mockResolvedValue([]) },
      jenisKelas: { findMany: jest.fn().mockResolvedValue([]) },
      publicContent: { findFirst: jest.fn().mockResolvedValue({ payload: published }) },
    };
    const config = {
      value: {
        publicSupportWhatsappE164: null,
        bookingCancellation: { enabled: false },
        reschedule: { enabled: false },
        mobileFeatures: {},
      },
    };
    const service = new PublicSiteConfigService(db as never, config as never);
    await expect(service.get()).resolves.toMatchObject({ heroCarousel: published });
    expect(db.publicContent.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          contentKey: 'HOME_HERO_CAROUSEL',
          scopeKey: 'GLOBAL',
          status: 'PUBLISHED',
        }),
        orderBy: { version: 'desc' },
      }),
    );
    db.publicContent.findFirst.mockResolvedValue(null);
    await expect(service.get()).resolves.toMatchObject({ heroCarousel: null });
  });
});
