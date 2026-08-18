import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';
import { assertPublicUuid } from './public-query.validation';
import { calculatePackagePromotion } from '../packages/kalkulasi-harga-paket.service';

@Injectable()
export class PublicPackageQueryService {
  constructor(private readonly db: PrismaService) {}

  async list(branchId?: string) {
    if (branchId) assertPublicUuid(branchId, 'VALIDATION_ERROR');
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
    if (branchId && !branches.some((branch) => branch.id === branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const now = new Date();
    const packages = branchId
      ? await this.db.paket.findMany({
          where: {
            branchScopes: {
              some: {
                branchId,
                active: true,
                branch: { active: true, publicProfile: { isNot: null } },
              },
            },
            classTypeScopes: {
              some: {
                active: true,
                classType: {
                  active: true,
                  branchScopes: { some: { branchId, active: true } },
                },
              },
            },
            status: 'ACTIVE',
            effectiveFrom: { lte: now },
            OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
          },
          select: {
            id: true,
            businessKey: true,
            name: true,
            sessionCount: true,
            durationDays: true,
            priceRp: true,
            effectiveUntil: true,
            updatedAt: true,
            promotions: {
              where: { status: 'ACTIVE', activeFrom: { lte: now }, activeUntil: { gt: now } },
              orderBy: [{ activeFrom: 'desc' as const }],
              take: 1,
            },
            classTypeScopes: {
              where: {
                active: true,
                classType: {
                  active: true,
                  branchScopes: { some: { branchId, active: true } },
                },
              },
              select: {
                classType: { select: { id: true, code: true, name: true } },
              },
            },
          },
          orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
          take: 100,
        })
      : [];

    const seen = new Set<string>();
    const branch = branches.find(({ id }) => id === branchId);
    const items = packages
      .filter((item) => {
        const key = `${branchId}:${item.businessKey}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(
        ({
          businessKey: _businessKey,
          updatedAt: _updatedAt,
          promotions,
          classTypeScopes,
          ...item
        }) => {
          const classTypes = classTypeScopes.map(({ classType }) => classType);
          return {
            ...item,
            branchId: branchId!,
            classType: classTypes[0] ?? { id: 'all', code: 'ALL', name: 'Semua Kelas' },
            classTypes,
            ...calculatePackagePromotion({ priceRp: item.priceRp, promotion: promotions?.[0], now }),
            branch,
          };
        },
      )
      .sort(
        (left, right) =>
          left.priceRp - right.priceRp ||
          left.name.localeCompare(right.name, 'id-ID') ||
          left.id.localeCompare(right.id),
      );

    return { branches, items };
  }

  async detail(id: string, branchId: string) {
    assertPublicUuid(id);
    assertPublicUuid(branchId);
    const now = new Date();
    const item = await this.db.paket.findFirst({
      where: {
        id,
        branchScopes: {
          some: {
            branchId,
            active: true,
            branch: { active: true, publicProfile: { isNot: null } },
          },
        },
        classTypeScopes: {
          some: {
            active: true,
            classType: {
              active: true,
              branchScopes: { some: { branchId, active: true } },
            },
          },
        },
        publicProfile: { isNot: null },
        status: 'ACTIVE',
        effectiveFrom: { lte: now },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
      },
      select: {
        id: true,
        name: true,
        sessionCount: true,
        durationDays: true,
        priceRp: true,
        effectiveFrom: true,
        effectiveUntil: true,
        promotions: {
          where: { status: 'ACTIVE', activeFrom: { lte: now }, activeUntil: { gt: now } },
          orderBy: [{ activeFrom: 'desc' as const }],
          take: 1,
        },
        publicProfile: {
          select: {
            summary: true,
            description: true,
            highlights: true,
            usageGuidance: true,
            terms: true,
          },
        },
        classTypeScopes: {
          where: {
            active: true,
            classType: {
              active: true,
              branchScopes: { some: { branchId, active: true } },
            },
          },
          select: {
            classType: { select: { id: true, code: true, name: true } },
          },
        },
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
        branchScopes: {
          where: {
            branchId,
            active: true,
            branch: { active: true, publicProfile: { isNot: null } },
          },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          take: 1,
          include: {
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
        },
      },
    });
    const branch = item?.branchScopes[0]?.branch;
    if (!item?.publicProfile || !branch?.publicProfile)
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const schedules = await this.db.slotKelas.findMany({
      where: {
        branchId: branch.id,
        classTypeId: {
          in: item.classTypeScopes.map(({ classType }) => classType.id),
        },
        status: { in: ['PUBLISHED', 'CONFIRMED'] },
        startAt: { gt: now },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        timezone: true,
        status: true,
        capacity: true,
        bookedCount: true,
      },
      orderBy: [{ startAt: 'asc' }, { id: 'asc' }],
      take: 4,
    });
    const pricing = calculatePackagePromotion({
      priceRp: item.priceRp,
      promotion: item.promotions?.[0],
      now,
    });
    const {
      promotions: _promotions,
      classTypeScopes,
      branchScopes: _branchScopes,
      branch: _legacyBranch,
      ...publicItem
    } = item;
    return {
      ...publicItem,
      branch,
      classTypes: classTypeScopes.map(({ classType }) => classType),
      ...pricing,
      pricePerSessionRp: Math.round(pricing.effectivePriceRp / item.sessionCount),
      schedules: schedules.map(({ bookedCount, ...schedule }) => ({
        ...schedule,
        available: Math.max(0, schedule.capacity - bookedCount),
      })),
    };
  }
}
