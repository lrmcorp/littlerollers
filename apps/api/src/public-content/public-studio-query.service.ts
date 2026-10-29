import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';
import { calculatePackagePromotion } from '../packages/package-pricing.service';

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
                    sessionDurationMinutes: true,
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

    const contextualPackages = branch.classTypes.flatMap(
      ({ id: classTypeId, code, name, packageScopes }) =>
        packageScopes
          .filter(({ package: item }) =>
            item.branchScopes.some(({ branchId }) => branchId === branch.id),
          )
          .map(({ package: { promotions, branchScopes: _branchScopes, ...item } }) => ({
            ...item,
            branchId: branch.id,
            classTypes: [{ id: classTypeId, code, name }],
            ...calculatePackagePromotion({
              priceRp: item.priceRp,
              promotion: promotions?.[0],
              now,
            }),
          })),
    );

    const packages = contextualPackages.reduce<typeof contextualPackages>((items, item) => {
      const existing = items.find(({ id }) => id === item.id);
      if (!existing) {
        items.push(item);
        return items;
      }

      for (const classType of item.classTypes) {
        if (!existing.classTypes.some(({ id }) => id === classType.id)) {
          existing.classTypes.push(classType);
        }
      }
      return items;
    }, []);

    return {
      ...branch,
      classes: branch.classTypes
        .map(({ id: _id, packageScopes: _packageScopes, classSlots: _slots, ...type }) => ({
          ...type,
          profile: profilesByCode.get(type.code),
        }))
        .filter(({ profile }) => profile),
      packages,
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
