import { PublicSiteConfigService } from './public-site-config.service';

describe('PublicSiteConfigService', () => {
  it('projects only active public studios and class profiles from the database', async () => {
    const db = {
      cabang: {
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
      jenisKelas: {
        findMany: jest.fn().mockResolvedValue([{ code: 'REFORMER', name: 'Reformer Pilates' }]),
      },
      profilPublikKelas: {
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

    await expect(service.get()).resolves.toMatchObject({
      branches: [{ code: 'DD-JKT', publicProfile: { slug: 'jakarta' } }],
      classes: [{ code: 'REFORMER', name: 'Reformer Pilates' }],
      fallbackWhatsappE164: '+622100000000',
      mobileFeatures: {
        accountRecovery: false,
        revokeAllSessions: false,
        bookingCancellation: false,
        reschedule: true,
        customerCheckIn: true,
        instructorCheckIn: false,
      },
    });
    expect(db.cabang.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true, publicProfile: { isNot: null } },
      }),
    );
    expect(db.profilPublikKelas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true, code: { in: ['REFORMER'] } },
      }),
    );
  });
});
