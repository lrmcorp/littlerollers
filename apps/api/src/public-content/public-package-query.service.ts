import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';
import { assertPublicUuid } from './public-query.validation';

@Injectable()
export class PublicPackageQueryService {
  constructor(private readonly db: PrismaService) {}

  async list(branchId?: string) {
    if (branchId) assertPublicUuid(branchId, 'VALIDATION_ERROR');

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

    const branches = rawBranches.map((b: any) => ({
      id: b.id,
      code: b.code,
      name: b.name,
      timezone: b.timezone,
      supportWhatsappE164: b.supportWhatsappE164,
      publicProfile: b.publicProfile ?? {
        slug: b.code.toLowerCase(),
        area: b.name,
        city: 'Jakarta',
        address: b.address ?? '',
        openingHours: ['Senin - Minggu: 06:00 - 21:00'],
      },
    }));

    if (branchId && !branches.some((branch) => branch.id === branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    if (!branchId) return { branches, items: [] };

    const rawPackages = await this.db.paket.findMany({
      where: {
        branchId,
        status: 'ACTIVE',
      },
      include: {
        classType: {
          select: { id: true, code: true, name: true },
        },
      },
      orderBy: [{ priceRp: 'asc' }, { id: 'asc' }],
      take: 100,
    });

    const branch = branches.find(({ id }) => id === branchId) ?? branches[0] ?? null;

    const seen = new Set<string>();
    const packages: typeof rawPackages = [];
    for (const pkg of rawPackages) {
      const key = (pkg as any).businessKey || pkg.id;
      if (!seen.has(key)) {
        seen.add(key);
        packages.push(pkg);
      }
    }

    const items = packages.map((pkg: any) => {
      const classTypes =
        pkg.classTypeScopes?.map((s: any) => s.classType) ||
        (pkg.classType ? [pkg.classType] : []);
      return {
        id: pkg.id,
        name: pkg.name,
        sessionCount: pkg.sessionCount,
        durationDays: pkg.validityDays,
        priceRp: pkg.priceRp,
        branchId: branch?.id ?? branchId ?? '',
        classType: classTypes[0] ?? pkg.classType ?? { id: 'all', code: 'ALL', name: 'Semua Kelas' },
        classTypes,
        isDiscounted: false,
        discountedPriceRp: pkg.priceRp,
        discountPercent: 0,
        effectivePriceRp: pkg.priceRp,
        branch,
      };
    });

    return { branches, items };
  }

  async detail(id: string, branchId: string) {
    assertPublicUuid(id);
    assertPublicUuid(branchId);
    const now = new Date();

    const branchData = await this.db.cabang.findFirst({
      where: { id: branchId, active: true },
      select: {
        id: true,
        code: true,
        name: true,
        timezone: true,
        address: true,
        supportWhatsappE164: true,
      },
    });
    if (!branchData) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const branch = {
      ...branchData,
      publicProfile: {
        slug: branchData.code.toLowerCase(),
        area: branchData.name,
        city: 'Jakarta',
        address: branchData.address ?? '',
        openingHours: ['Senin - Minggu: 06:00 - 21:00'],
      },
    };

    const item = await this.db.paket.findFirst({
      where: {
        id,
        status: 'ACTIVE',
      },
      include: {
        classType: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    if (!item) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const schedules = await this.db.slotKelas.findMany({
      where: {
        branchId: branch.id,
        ...(item.classTypeId ? { classTypeId: item.classTypeId } : {}),
        status: { in: ['PUBLISHED', 'CONFIRMED'] },
        startAt: { gt: now },
      },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        capacity: true,
        bookedCount: true,
      },
      orderBy: [{ startAt: 'asc' }, { id: 'asc' }],
      take: 4,
    });

    const classTypes = item.classType ? [item.classType] : [];

    return {
      id: item.id,
      name: item.name,
      sessionCount: item.sessionCount,
      durationDays: item.validityDays,
      priceRp: item.priceRp,
      effectiveFrom: item.createdAt,
      effectiveUntil: null,
      publicProfile: {
        summary: `${item.sessionCount} Sesi Pilates - Berlaku ${item.validityDays} Hari`,
        description: `Paket latihan pilates ${item.name} dengan total ${item.sessionCount} sesi kelas.`,
        highlights: ['Akses instruktur bersertifikat', 'Fasilitas studio lengkap', 'Jadwal fleksibel'],
        usageGuidance: 'Pemesanan kelas dapat dilakukan melalui aplikasi kapan saja.',
        terms: 'Paket tidak dapat diuangkan kembali.',
      },
      branch,
      classTypes,
      isDiscounted: false,
      discountedPriceRp: item.priceRp,
      discountPercent: 0,
      effectivePriceRp: item.priceRp,
      pricePerSessionRp: Math.round(item.priceRp / item.sessionCount),
      schedules: schedules.map(({ bookedCount, ...schedule }) => ({
        ...schedule,
        timezone: branch.timezone,
        available: Math.max(0, schedule.capacity - bookedCount),
      })),
    };
  }
}
