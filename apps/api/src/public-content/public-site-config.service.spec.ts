import { PublicSiteConfigService } from './public-site-config.service';

describe('PublicSiteConfigService', () => {
  it('projects only active public studios and class profiles from the database', async () => {
    const db = {
      branch: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'branch-jakarta',
            code: 'LR-JKT',
            name: 'Little Rollers Jakarta',
            timezone: 'Asia/Jakarta',
            supportWhatsappE164: null,
            publicProfile: { slug: 'jakarta', area: 'Jakarta', city: 'Jakarta' },
          },
        ]),
      },
      classType: {
        findMany: jest.fn().mockResolvedValue([{ code: 'MOVERS', name: 'Movers' }]),
      },
      publicClassProfile: {
        findMany: jest.fn().mockResolvedValue([
          {
            code: 'MOVERS',
            slug: 'movers',
            summary: 'Latihan reformer.',
            description: 'Latihan seluruh tubuh.',
            level: 'Semua level',
            durationMinutes: 50,
            equipment: ['Reformer'],
            benefits: ['Kekuatan'],
            heroImageKey: 'classes/movers.svg',
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
      branches: [{ code: 'LR-JKT', publicProfile: { slug: 'jakarta' } }],
      classes: [{ code: 'MOVERS', name: 'Movers' }],
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
    expect(db.branch.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true, publicProfile: { isNot: null } },
      }),
    );
    expect(db.publicClassProfile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { active: true, code: { in: ['MOVERS'] } },
      }),
    );
  });
});
