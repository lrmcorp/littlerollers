import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';

@Injectable()
export class PublicStudioQueryService {
  constructor(private readonly db: PrismaService) {}

  async detail(slug: string) {
    const raw = slug?.trim();
    if (!raw) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const now = new Date();
    const branch = await this.db.cabang.findFirst({
      where: {
        active: true,
        OR: [
          { code: raw.toUpperCase() },
          { id: raw },
        ],
      },
      include: {
        studios: {
          where: { active: true },
          include: {
            rooms: { where: { active: true } },
          },
        },
      },
    });

    if (!branch) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const classTypes = await this.db.jenisKelas.findMany({
      where: { active: true },
      include: {
        classSlots: {
          where: {
            branchId: branch.id,
            status: { in: ['PUBLISHED', 'CONFIRMED'] },
            startAt: { gt: now },
          },
          include: {
            instructor: { select: { displayName: true } },
          },
          orderBy: { startAt: 'asc' },
          take: 10,
        },
      },
      orderBy: { name: 'asc' },
    });

    const packages = await this.db.paket.findMany({
      where: { status: 'ACTIVE' },
      include: { classType: true },
      take: 20,
    });

    const publicProfile = {
      slug: branch.code.toLowerCase(),
      area: branch.name,
      city: 'Jakarta',
      address: branch.address ?? '',
      description: `${branch.name} Studio Pilates`,
      arrivalInformation: 'Silakan datang 10-15 menit sebelum sesi kelas dimulai.',
      parkingInformation: 'Tersedia tempat parkir kendaraan.',
      openingHours: ['Senin - Minggu: 06:00 - 21:00'],
      amenities: ['Locker', 'Shower', 'Water Refill', 'Towel'],
      heroImageKey: null,
      galleryImageKeys: [],
    };

    return {
      ...branch,
      publicProfile,
      classes: classTypes.map((ct) => ({
        id: ct.id,
        code: ct.code,
        name: ct.name,
        profile: {
          code: ct.code,
          name: ct.name,
          slug: ct.code.toLowerCase(),
          summary: ct.description ?? `${ct.name} Pilates`,
          description: ct.description ?? `${ct.name} Pilates`,
          durationMinutes: ct.durationMinutes,
          level: 'ALL_LEVELS',
          equipment: ['Reformer'],
          benefits: ['Core Strength', 'Flexibility'],
          heroImageKey: null,
        },
      })),
      packages: packages.map((p) => ({
        id: p.id,
        name: p.name,
        sessionCount: p.sessionCount,
        durationDays: p.validityDays,
        priceRp: p.priceRp,
        branchId: branch.id,
        classTypes: p.classType ? [{ id: p.classType.id, code: p.classType.code, name: p.classType.name }] : [],
        isDiscounted: false,
        discountedPriceRp: p.priceRp,
        discountPercent: 0,
      })),
      schedules: classTypes
        .flatMap((ct) =>
          ct.classSlots.map((slot) => ({
            id: slot.id,
            startAt: slot.startAt,
            endAt: slot.endAt,
            timezone: branch.timezone,
            status: slot.status,
            capacity: slot.capacity,
            bookedCount: slot.bookedCount,
            available: Math.max(0, slot.capacity - slot.bookedCount),
            classType: { code: ct.code, name: ct.name },
            instructor: slot.instructor?.displayName ? { displayName: slot.instructor.displayName } : null,
          })),
        )
        .sort((left, right) => left.startAt.getTime() - right.startAt.getTime())
        .slice(0, 8),
    };
  }
}
