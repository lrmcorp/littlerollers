import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';

@Injectable()
export class PublicStudioQueryService {
  constructor(private readonly db: PrismaService) {}

  async detail(slug: string) {
    const now = new Date();
    const branch = await this.db.branch.findFirst({
      where: { active: true, publicProfile: { is: { slug } } },
      select: {
        id: true,
        code: true,
        name: true,
        timezone: true,
        supportWhatsappE164: true,
        publicProfile: true,
        classTypes: {
          where: { active: true },
          select: {
            id: true,
            code: true,
            name: true,
            packages: {
              where: {
                status: 'ACTIVE',
                effectiveFrom: { lte: now },
                OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
                publicProfile: { isNot: null },
              },
              select: {
                id: true,
                name: true,
                sessionCount: true,
                durationDays: true,
                priceRp: true,
                publicProfile: { select: { summary: true } },
              },
              orderBy: [{ priceRp: 'asc' }],
            },
            classSlots: {
              where: { status: { in: ['PUBLISHED', 'CONFIRMED'] }, startAt: { gt: now } },
              select: {
                id: true,
                startAt: true,
                endAt: true,
                timezone: true,
                status: true,
                capacity: true,
                bookedCount: true,
              },
              orderBy: [{ startAt: 'asc' }],
              take: 3,
            },
          },
          orderBy: [{ name: 'asc' }],
        },
      },
    });
    if (!branch?.publicProfile) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const classProfiles = await this.db.publicClassProfile.findMany({
      where: { code: { in: branch.classTypes.map(({ code }) => code) }, active: true },
    });
    const profilesByCode = new Map(classProfiles.map((profile) => [profile.code, profile]));
    return {
      ...branch,
      classes: branch.classTypes
        .map(({ id: _id, packages: _packages, classSlots: _slots, ...type }) => ({
          ...type,
          profile: profilesByCode.get(type.code),
        }))
        .filter(({ profile }) => profile),
      packages: branch.classTypes.flatMap(({ code, name, packages }) =>
        packages.map((item) => ({ ...item, classType: { code, name } })),
      ),
      schedules: branch.classTypes
        .flatMap(({ code, name, classSlots }) =>
          classSlots.map(({ bookedCount, ...slot }) => ({
            ...slot,
            classType: { code, name },
            available: Math.max(0, slot.capacity - bookedCount),
          })),
        )
        .sort((left, right) => left.startAt.getTime() - right.startAt.getTime())
        .slice(0, 8),
    };
  }
}
