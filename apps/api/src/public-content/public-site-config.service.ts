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
    const rawBranches = await this.db.cabang.findMany({
      where: { active: true },
      select: {
        id: true,
        code: true,
        name: true,
        timezone: true,
        address: true,
        supportWhatsappE164: true,
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });

    const branches = rawBranches.map((b) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      timezone: b.timezone,
      supportWhatsappE164: b.supportWhatsappE164,
      publicProfile: {
        slug: b.code.toLowerCase(),
        area: b.name,
        city: 'Jakarta',
        address: b.address ?? '',
        description: `${b.name} Studio Pilates`,
        arrivalInformation: 'Silakan datang 10-15 menit sebelum sesi kelas dimulai.',
        parkingInformation: 'Tersedia tempat parkir kendaraan.',
        openingHours: ['Senin - Minggu: 06:00 - 21:00'],
        amenities: ['Locker', 'Shower', 'Water Refill', 'Towel'],
        heroImageKey: null,
        galleryImageKeys: [],
      },
    }));

    const activeClassTypes = await this.db.jenisKelas.findMany({
      where: { active: true },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        durationMinutes: true,
      },
      orderBy: [{ code: 'asc' }],
    });

    const classes = activeClassTypes.map((ct) => ({
      code: ct.code,
      name: ct.name,
      slug: ct.code.toLowerCase(),
      summary: ct.description ?? `${ct.name} Pilates Session`,
      description: ct.description ?? `${ct.name} Pilates Session`,
      level: 'ALL_LEVELS',
      durationMinutes: ct.durationMinutes,
      equipment: ['Reformer', 'Mat'],
      benefits: ['Core Strength', 'Flexibility', 'Posture Correction'],
      heroImageKey: null,
    }));

    return {
      branches,
      classes,
      heroCarousel: null,
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

  // --- Indonesian Domain Aliases ---
  async ambilKonfigurasiSitus() {
    return this.get();
  }
}
