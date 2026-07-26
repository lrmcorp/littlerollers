import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ApiProblem } from '../identity/security';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class PublicPackageCatalogService {
  constructor(private readonly db: PrismaService) {}

  async list(branchId?: string) {
    if (branchId && !UUID.test(branchId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    const branches = await this.db.branch.findMany({
      where: { active: true },
      select: { id: true, code: true, name: true, timezone: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    if (branchId && !branches.some((branch) => branch.id === branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const now = new Date();
    const packages = branchId
      ? await this.db.package.findMany({
          where: {
            branchId,
            branch: { active: true },
            classType: { active: true },
            status: 'ACTIVE',
            effectiveFrom: { lte: now },
            OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
          },
          select: {
            id: true,
            branchId: true,
            businessKey: true,
            name: true,
            sessionCount: true,
            durationDays: true,
            priceRp: true,
            effectiveUntil: true,
            updatedAt: true,
            classType: { select: { id: true, code: true, name: true } },
          },
          orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
          take: 100,
        })
      : [];

    const seen = new Set<string>();
    const items = packages
      .filter((item) => {
        const key = `${item.branchId}:${item.classType.id}:${item.businessKey}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(({ businessKey: _businessKey, updatedAt: _updatedAt, ...item }) => item)
      .sort(
        (left, right) =>
          left.priceRp - right.priceRp ||
          left.name.localeCompare(right.name, 'id-ID') ||
          left.id.localeCompare(right.id),
      );

    return { branches, items };
  }
}
