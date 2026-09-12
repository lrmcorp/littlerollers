import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';
import { assertPublicUuid, publicScheduleRange } from './public-query.validation';

@Injectable()
export class PublicScheduleQueryService {
  constructor(private readonly db: PrismaService) {}

  async list(input: { branchId?: string; from?: string; until?: string }) {
    if (input.branchId) assertPublicUuid(input.branchId, 'VALIDATION_ERROR');
    const { from, until } = publicScheduleRange(input.from, input.until);

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
        openingHours: ['Senin - Minggu: 06:00 - 21:00'],
      },
    }));

    if (input.branchId && !branches.some(({ id }) => id === input.branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const branch = branches.find(({ id }) => id === input.branchId);

    const slots = input.branchId
      ? await this.db.slotKelas.findMany({
          where: {
            branchId: input.branchId,
            status: { in: ['PUBLISHED', 'CONFIRMED'] },
            startAt: { gte: from, lt: until },
          },
          select: {
            id: true,
            branchId: true,
            startAt: true,
            endAt: true,
            status: true,
            capacity: true,
            bookedCount: true,
            classType: { select: { id: true, code: true, name: true } },
            instructor: { select: { displayName: true } },
          },
          orderBy: [{ startAt: 'asc' }, { id: 'asc' }],
          take: 100,
        })
      : [];

    return {
      branches,
      items: slots.map(({ bookedCount, ...slot }) => ({
        ...slot,
        timezone: branch?.timezone ?? 'Asia/Jakarta',
        branch,
        available: Math.max(0, slot.capacity - bookedCount),
      })),
      range: { from, until },
    };
  }

  async detail(id: string) {
    assertPublicUuid(id);
    const slot = await this.db.slotKelas.findFirst({
      where: {
        id,
        status: { in: ['PUBLISHED', 'CONFIRMED'] },
      },
      include: {
        classType: true,
        instructor: { select: { displayName: true } },
        studio: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
        branch: true,
      },
    });

    if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const publicProfile = {
      slug: slot.branch.code.toLowerCase(),
      area: slot.branch.name,
      city: 'Jakarta',
      address: slot.branch.address ?? '',
    };

    const classProfile = {
      code: slot.classType.code,
      name: slot.classType.name,
      slug: slot.classType.code.toLowerCase(),
      summary: slot.classType.description ?? `${slot.classType.name} Pilates`,
      description: slot.classType.description ?? `${slot.classType.name} Pilates`,
      level: 'ALL_LEVELS',
      durationMinutes: slot.classType.durationMinutes,
      equipment: ['Reformer'],
      benefits: ['Core Strength', 'Flexibility'],
      heroImageKey: null,
    };

    const { bookedCount, ...safeSlot } = slot;

    return {
      ...safeSlot,
      timezone: slot.branch.timezone,
      available: Math.max(0, slot.capacity - bookedCount),
      branch: {
        ...slot.branch,
        publicProfile,
      },
      classProfile,
    };
  }
}
