import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';
import { calculatePackagePromotion } from '../packages/kalkulasi-harga-paket.service';

@Injectable()
export class PublicClassQueryService {
  constructor(private readonly db: PrismaService) {}

  async detail(slugOrCode: string) {
    const raw = slugOrCode?.trim();
    if (!raw) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    // 1. Find profile by slug or code
    let profile = await this.db.profilPublikKelas.findFirst({
      where: {
        OR: [{ slug: raw.toLowerCase() }, { code: raw.toUpperCase() }, { slug: raw }],
        active: true,
      },
    });

    // If not found directly, check if it's a UUID or code matching a JenisKelas
    if (!profile) {
      const classTypeMatch = await this.db.jenisKelas.findFirst({
        where: {
          OR: [{ id: raw }, { code: raw.toUpperCase() }],
          active: true,
        },
        select: { code: true },
      });
      if (classTypeMatch) {
        profile = await this.db.profilPublikKelas.findFirst({
          where: { code: classTypeMatch.code, active: true },
        });
      }
    }

    if (!profile) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const now = new Date();

    // Find classTypes with this code
    const classTypes = await this.db.jenisKelas.findMany({
      where: {
        code: profile.code,
        active: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        branchId: true,
      },
    });

    // Find branches offering this class code
    const scopedBranches = await this.db.cabang.findMany({
      where: {
        active: true,
        publicProfile: { isNot: null },
        OR: [
          { classTypes: { some: { code: profile.code, active: true } } },
          {
            classTypeScopes: {
              some: {
                classType: { code: profile.code, active: true },
                active: true,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        code: true,
        name: true,
        timezone: true,
        supportWhatsappE164: true,
        publicProfile: true,
      },
      orderBy: [{ name: 'asc' }],
    });

    const studios =
      scopedBranches.length > 0
        ? scopedBranches
        : await this.db.cabang.findMany({
            where: { active: true, publicProfile: { isNot: null } },
            select: {
              id: true,
              code: true,
              name: true,
              timezone: true,
              supportWhatsappE164: true,
              publicProfile: true,
            },
            orderBy: [{ name: 'asc' }],
          });

    const studioIds = studios.map((s) => s.id);

    // Find packages applicable to this class type
    const packagesRaw = await this.db.paket.findMany({
      where: {
        status: 'ACTIVE',
        effectiveFrom: { lte: now },
        publicProfile: { isNot: null },
        AND: [
          { OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }] },
          {
            OR: [
              {
                classTypeScopes: {
                  some: { classType: { code: profile.code, active: true }, active: true },
                },
              },
              { classTypeScopes: { none: {} } },
            ],
          },
        ],
      },
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
          where: { active: true, branchId: { in: studioIds } },
          select: {
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
      orderBy: [{ priceRp: 'asc' }],
      take: 6,
    });

    const packages = packagesRaw.flatMap((pkg) => {
      const targetBranches =
        pkg.branchScopes.length > 0
          ? pkg.branchScopes.map((b) => b.branch).filter(Boolean)
          : studios.slice(0, 1);
      return targetBranches.map((branch) => ({
        id: pkg.id,
        name: pkg.name,
        sessionCount: pkg.sessionCount,
        durationDays: pkg.durationDays,
        publicProfile: pkg.publicProfile,
        branchId: branch.id,
        branch,
        classTypes: classTypes.map((ct) => ({ id: ct.id, code: ct.code, name: ct.name })),
        ...calculatePackagePromotion({
          priceRp: pkg.priceRp,
          promotion: pkg.promotions?.[0],
          now,
        }),
      }));
    });

    // Upcoming schedules
    const classSlots = await this.db.slotKelas.findMany({
      where: {
        classType: { code: profile.code, active: true },
        branch: { active: true, publicProfile: { isNot: null } },
        status: { in: ['PUBLISHED', 'CONFIRMED'] },
        startAt: { gt: now },
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
      orderBy: [{ startAt: 'asc' }],
      take: 6,
    });

    const schedules = classSlots.map(({ bookedCount, ...slot }) => ({
      ...slot,
      available: Math.max(0, slot.capacity - bookedCount),
    }));

    return {
      profile,
      studios,
      packages,
      schedules,
    };
  }
}
