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
      faq: null,
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

  it('serves the published hero carousel and FAQ from managed content, each null when none is published', async () => {
    const hero = { autoplay: true, intervalMs: 6000, slides: [{ id: 's1', title: 'Halo' }] };
    const faq = { items: [{ id: 'faq-1', question: 'Apakah cocok untuk pemula?', answer: 'Ya, cocok.', order: 1 }] };
    const byKey: Record<string, unknown> = { HOME_HERO_CAROUSEL: hero, CLASS_DETAIL_FAQ: faq };
    const db = {
      cabang: { findMany: jest.fn().mockResolvedValue([]) },
      jenisKelas: { findMany: jest.fn().mockResolvedValue([]) },
      publicContent: {
        findFirst: jest.fn(async ({ where }: { where: { contentKey: string } }) =>
          byKey[where.contentKey] ? { payload: byKey[where.contentKey] } : null,
        ),
      },
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
    await expect(service.get()).resolves.toMatchObject({ heroCarousel: hero, faq });
    for (const contentKey of ['HOME_HERO_CAROUSEL', 'CLASS_DETAIL_FAQ'])
      expect(db.publicContent.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ contentKey, scopeKey: 'GLOBAL', status: 'PUBLISHED' }),
          orderBy: { version: 'desc' },
        }),
      );
    delete byKey.CLASS_DETAIL_FAQ;
    await expect(service.get()).resolves.toMatchObject({ heroCarousel: hero, faq: null });
    delete byKey.HOME_HERO_CAROUSEL;
    await expect(service.get()).resolves.toMatchObject({ heroCarousel: null, faq: null });
  });
});
