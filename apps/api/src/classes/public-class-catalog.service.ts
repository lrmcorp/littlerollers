import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';
import { HttpStatus } from '@nestjs/common';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function instant(value: string | undefined, fallback: Date) {
  if (!value) return fallback;
  if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(value))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  return date;
}

@Injectable()
export class PublicClassCatalogService {
  constructor(private readonly db: PrismaService) {}

  async list(input: { branchId?: string; from?: string; until?: string }) {
    if (input.branchId && !UUID.test(input.branchId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const now = new Date();
    const from = instant(input.from, now);
    const until = instant(input.until, new Date(from.getTime() + 14 * 86_400_000));
    if (from >= until || until.getTime() - from.getTime() > 31 * 86_400_000)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const branches = await this.db.branch.findMany({
      where: { active: true },
      select: { id: true, code: true, name: true, timezone: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    const visibleBranch = input.branchId
      ? branches.find((branch) => branch.id === input.branchId)
      : undefined;
    if (input.branchId && !visibleBranch)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const slots = input.branchId
      ? await this.db.classSlot.findMany({
          where: {
            branchId: input.branchId,
            branch: { active: true },
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
          },
          orderBy: [{ startAt: 'asc' }, { id: 'asc' }],
          take: 100,
        })
      : [];

    return {
      branches,
      items: slots.map((slot) => ({
        id: slot.id,
        branchId: slot.branchId,
        classType: slot.classType,
        startAt: slot.startAt,
        endAt: slot.endAt,
        timezone: slot.timezone,
        status: slot.status,
        capacity: slot.capacity,
        available: Math.max(0, slot.capacity - slot.bookedCount),
      })),
      range: { from, until },
    };
  }
}
