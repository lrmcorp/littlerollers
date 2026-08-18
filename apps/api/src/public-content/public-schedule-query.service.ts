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
    const branches = await this.db.cabang.findMany({
      where: { active: true, publicProfile: { isNot: null } },
      select: {
        id: true,
        code: true,
        name: true,
        timezone: true,
        supportWhatsappE164: true,
        publicProfile: true,
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    if (input.branchId && !branches.some(({ id }) => id === input.branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const slots = input.branchId
      ? await this.db.slotKelas.findMany({
          where: {
            branchId: input.branchId,
            branch: { active: true, publicProfile: { isNot: null } },
            classType: { active: true },
            status: { in: ['PUBLISHED', 'CONFIRMED'] },
            startAt: { gte: from, lt: until },
          },
          select: {
            id: true,
            branchId: true,
            startAt: true,
            endAt: true,
            timezone: true,
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
    const branch = branches.find(({ id }) => id === input.branchId);

    return {
      branches,
      items: slots.map(({ bookedCount, ...slot }) => ({
        ...slot,
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
        branch: { active: true, publicProfile: { isNot: null } },
        classType: { active: true },
      },
      select: {
        id: true,
        branchId: true,
        startAt: true,
        endAt: true,
        timezone: true,
        status: true,
        capacity: true,
        bookedCount: true,
        classType: { select: { id: true, code: true, name: true, defaultDurationMinutes: true } },
        instructor: { select: { displayName: true } },
        studio: { select: { id: true, name: true } },
        room: { select: { id: true, name: true } },
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
            timezone: true,
            supportWhatsappE164: true,
            publicProfile: true,
          },
        },
      },
    });
    if (!slot?.branch.publicProfile)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const classProfile = await this.db.profilPublikKelas.findFirst({
      where: { code: slot.classType.code, active: true },
    });
    if (!classProfile) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const { bookedCount, ...safeSlot } = slot;
    return {
      ...safeSlot,
      available: Math.max(0, slot.capacity - bookedCount),
      classProfile,
    };
  }
}

