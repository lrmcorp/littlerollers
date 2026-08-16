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
        code: true,
        name: true,
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
        packageScopes: {
          where: {
            active: true,
            package: {
              status: 'ACTIVE',
              effectiveFrom: { lte: now },
              OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
              publicProfile: { isNot: null },
            },
          },
          select: {
            package: {
              select: {
                id: true,
                name: true,
                sessionCount: true,
                durationDays: true,
                priceRp: true,
                promotions: {
                  where: {
                    status: 'ACTIVE',
                    activeFrom: { lte: now },
                    activeUntil: { gt: now },
                  },
                  orderBy: [{ activeFrom: 'desc' as const }],
                  take: 1,
                },
                publicProfile: { select: { summary: true } },
                branchScopes: {
                  where: { active: true },
                  select: { branchId: true },
                },
              },
            },
          },
          orderBy: [{ package: { priceRp: 'asc' } }],
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
      packages: classTypes.flatMap(
        ({ id: classTypeId, code, name, branch, packageScopes }) => {
          if (!branch) return [];
          return packageScopes
            .filter(({ package: item }) =>
              item.branchScopes.some(({ branchId }) => branchId === branch.id),
            )
            .slice(0, 4)
            .map(({ package: { promotions, branchScopes: _branchScopes, ...item } }) => ({
              ...item,
              branchId: branch.id,
              classTypes: [{ id: classTypeId, code, name }],
              ...calculatePackagePromotion({
                priceRp: item.priceRp,
                promotion: promotions?.[0],
                now,
              }),
              branch,
            }));
        },
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
