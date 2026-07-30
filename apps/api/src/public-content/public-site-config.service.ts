import { Injectable } from '@nestjs/common';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PublicSiteConfigService {
  constructor(
    private readonly db: PrismaService,
    private readonly runtimeConfig: RuntimeConfigService,
  ) {}

  async get() {
    const branches = await this.db.branch.findMany({
      where: { active: true, publicProfile: { isNot: null } },
      select: {
        id: true,
        code: true,
        name: true,
        timezone: true,
        supportWhatsappE164: true,
        publicProfile: {
          select: {
            slug: true,
            area: true,
            city: true,
            address: true,
            description: true,
            arrivalInformation: true,
            parkingInformation: true,
            openingHours: true,
            amenities: true,
            heroImageKey: true,
            galleryImageKeys: true,
          },
        },
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });

    const activeClassTypes = await this.db.classType.findMany({
      where: { active: true, branch: { active: true, publicProfile: { isNot: null } } },
      select: { code: true, name: true },
      distinct: ['code'],
      orderBy: [{ code: 'asc' }],
    });
    const classProfiles = await this.db.publicClassProfile.findMany({
      where: {
        active: true,
        code: { in: activeClassTypes.map(({ code }) => code) },
      },
      select: {
        code: true,
        slug: true,
        summary: true,
        description: true,
        level: true,
        durationMinutes: true,
        equipment: true,
        benefits: true,
        heroImageKey: true,
      },
      orderBy: [{ code: 'asc' }],
    });
    const namesByCode = new Map(activeClassTypes.map(({ code, name }) => [code, name]));
    const classes = classProfiles.map((profile) => ({
      ...profile,
      name: namesByCode.get(profile.code) ?? profile.code,
    }));

    return {
      branches,
      classes,
      fallbackWhatsappE164: this.runtimeConfig.value.publicSupportWhatsappE164 ?? null,
      mobileFeatures: {
        accountRecovery: this.runtimeConfig.value.mobileFeatures.accountRecovery,
        revokeAllSessions: this.runtimeConfig.value.mobileFeatures.revokeAllSessions,
        bookingCancellation: this.runtimeConfig.value.bookingCancellation.enabled,
        reschedule: this.runtimeConfig.value.reschedule.enabled,
        customerCheckIn: this.runtimeConfig.value.mobileFeatures.customerCheckIn,
        instructorCheckIn: this.runtimeConfig.value.mobileFeatures.instructorCheckIn,
      },
    };
  }
}
