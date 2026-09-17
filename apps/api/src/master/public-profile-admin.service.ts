import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';
import { MasterAccessService } from './master-access.service';
import { PUBLIC_ASSET_KEYS } from './public-asset-catalog';

export type PublicProfileInput = {
  expectedVersion: number;
  reason: string;
  [key: string]: unknown;
};

@Injectable()
export class PublicProfileAdminService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: MasterAccessService,
  ) {}

  async list(principal: SessionPrincipal, branchId: string) {
    this.access.authorize(principal);
    this.access.ensureBranchScope(principal, branchId);
    const branch = await this.db.cabang.findUnique({
      where: { id: branchId },
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
        heroImageKey: true,
        galleryImageKeys: true,
      },
    });
    if (!branch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);

    const publicProfile = {
      slug: branch.code.toLowerCase(),
      area: branch.name,
      city: 'Jakarta',
      address: branch.address ?? '',
      description: `${branch.name} Studio Pilates`,
      arrivalInformation: 'Silakan datang 10-15 menit sebelum sesi kelas dimulai.',
      parkingInformation: 'Tersedia tempat parkir kendaraan.',
      openingHours: ['Senin - Minggu: 06:00 - 21:00'],
      amenities: ['Locker', 'Shower', 'Water Refill', 'Towel'],
      heroImageKey: branch.heroImageKey,
      galleryImageKeys: (branch.galleryImageKeys as string[]) ?? [],
      version: 1,
    };

    return {
      branch: { ...branch, publicProfile, classTypes: [] },
      classProfiles: [],
      assetKeys: [...PUBLIC_ASSET_KEYS],
    };
  }

  async update(
    principal: SessionPrincipal,
    kind: 'branch' | 'class' | 'package',
    id: string,
    input: PublicProfileInput,
    _correlationId: string,
  ) {
    this.access.authorize(principal, true);
    if (
      !Number.isInteger(input.expectedVersion) ||
      input.expectedVersion < 0 ||
      typeof input.reason !== 'string' ||
      input.reason.trim().length < 3
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    if (kind === 'branch') {
      const dataToUpdate: Record<string, unknown> = {};
      if (typeof input.heroImageKey === 'string') {
        dataToUpdate.heroImageKey = input.heroImageKey.trim() || null;
      }
      if (Array.isArray(input.galleryImageKeys)) {
        dataToUpdate.galleryImageKeys = input.galleryImageKeys;
      }
      if (typeof input.address === 'string' && input.address.trim()) {
        dataToUpdate.address = input.address.trim();
      }
      if (Object.keys(dataToUpdate).length > 0) {
        await this.db.cabang.update({
          where: { id },
          data: dataToUpdate,
        });
      }
    } else if (kind === 'class') {
      const dataToUpdate: Record<string, unknown> = {};
      if (typeof input.heroImageKey === 'string') {
        dataToUpdate.heroImageKey = input.heroImageKey.trim() || null;
      }
      if (Array.isArray(input.galleryImageKeys)) {
        dataToUpdate.galleryImageKeys = input.galleryImageKeys;
      }
      if (Object.keys(dataToUpdate).length > 0) {
        await this.db.jenisKelas.update({
          where: { id },
          data: dataToUpdate,
        });
      }
    }

    return {
      kind,
      id,
      version: input.expectedVersion + 1,
      updated: true,
    };
  }
}
