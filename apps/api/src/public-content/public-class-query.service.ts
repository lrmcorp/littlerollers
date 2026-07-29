import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';
import { calculatePackagePromotion } from '../packages/package-pricing.service';

@Injectable()
export class PublicClassQueryService {
  constructor(private readonly db: PrismaService) {}

  async detail(slug: string) {
    const profile = await this.db.publicClassProfile.findFirst({
      where: { slug, active: true },
    });
    if (!profile) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const now = new Date();
    const classTypes = await this.db.classType.findMany({
      where: {
        code: profile.code,
        active: true,
        branch: { active: true, publicProfile: { isNot: null } },
      },
      select: {
        id: true,
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
            promotions: {
              where: { status: 'ACTIVE', activeFrom: { lte: now }, activeUntil: { gt: now } },
              orderBy: [{ activeFrom: 'desc' as const }],
              take: 1,
            },
            publicProfile: { select: { summary: true } },
          },
          orderBy: [{ priceRp: 'asc' }],
          take: 4,
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
          take: 4,
        },
      },
      orderBy: [{ branch: { name: 'asc' } }],
    });
    if (!classTypes.length) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    return {
      profile,
      studios: classTypes.map(({ branch }) => branch),
      packages: classTypes.flatMap(({ branch, packages }) =>
        packages.map(({ promotions, ...item }) => ({
          ...item,
          ...calculatePackagePromotion({ priceRp: item.priceRp, promotion: promotions?.[0], now }),
          branch,
        })),
      ),
      schedules: classTypes
        .flatMap(({ branch, classSlots }) =>
          classSlots.map(({ bookedCount, ...slot }) => ({
            ...slot,
            branch,
            available: Math.max(0, slot.capacity - bookedCount),
          })),
        )
        .sort((left, right) => left.startAt.getTime() - right.startAt.getTime())
        .slice(0, 6),
    };
  }
}
