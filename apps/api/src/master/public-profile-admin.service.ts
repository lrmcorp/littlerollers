import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem } from '../identity/security';
import { MasterAccessService } from './master-access.service';
import { PUBLIC_ASSET_KEYS, PUBLIC_ASSET_KEY_SET } from './public-asset-catalog';

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
        publicProfile: true,
        classTypes: {
          select: {
            id: true,
            code: true,
            name: true,
            packages: {
              select: { id: true, name: true, publicProfile: true },
              orderBy: { name: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!branch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const classProfiles = await this.db.profilPublikKelas.findMany({
      where: { code: { in: branch.classTypes.map(({ code }) => code) } },
      orderBy: { code: 'asc' },
    });
    return { branch, classProfiles, assetKeys: [...PUBLIC_ASSET_KEYS] };
  }

  async update(
    principal: SessionPrincipal,
    kind: 'branch' | 'class' | 'package',
    id: string,
    input: PublicProfileInput,
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    if (
      !Number.isInteger(input.expectedVersion) ||
      input.expectedVersion < 0 ||
      typeof input.reason !== 'string' ||
      input.reason.trim().length < 3
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const strings = (value: unknown) =>
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((item) => typeof item === 'string' && item.trim().length > 0);

    return this.db.$transaction(async (tx) => {
      if (kind === 'branch')
        return this.updateBranch(tx, principal, id, input, correlationId, strings);
      if (kind === 'class')
        return this.updateClass(tx, principal, id, input, correlationId, strings);
      return this.updatePackage(tx, principal, id, input, correlationId, strings);
    });
  }

  private async updateBranch(
    tx: Prisma.TransactionClient,
    principal: SessionPrincipal,
    id: string,
    input: PublicProfileInput,
    correlationId: string,
    strings: (value: unknown) => boolean,
  ) {
    this.access.ensureBranchScope(principal, id, true);
    const current = await tx.profilPublikCabang.findUnique({ where: { branchId: id } });
    if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const heroImageKey = String(input.heroImageKey ?? '');
    const galleryImageKeys = input.galleryImageKeys;
    if (
      !PUBLIC_ASSET_KEY_SET.has(heroImageKey) ||
      !strings(galleryImageKeys) ||
      !(galleryImageKeys as string[]).every((key) => PUBLIC_ASSET_KEY_SET.has(key))
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const updated = await tx.profilPublikCabang.updateMany({
      where: { branchId: id, version: input.expectedVersion },
      data: {
        slug: String(input.slug ?? '').trim(),
        area: String(input.area ?? '').trim(),
        city: String(input.city ?? '').trim(),
        address: String(input.address ?? '').trim(),
        description: String(input.description ?? '').trim(),
        arrivalInformation: String(input.arrivalInformation ?? '').trim() || null,
        parkingInformation: String(input.parkingInformation ?? '').trim() || null,
        openingHours: input.openingHours as Prisma.InputJsonValue,
        amenities: input.amenities as Prisma.InputJsonValue,
        heroImageKey,
        galleryImageKeys: galleryImageKeys as Prisma.InputJsonValue,
        version: { increment: 1 },
      },
    });
    if (!updated.count) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    const result = await tx.profilPublikCabang.findUniqueOrThrow({ where: { branchId: id } });
    await this.access.audit(
      tx,
      principal,
      correlationId,
      'master.public_branch_profile_updated',
      'BranchPublicProfile',
      id,
      id,
      { version: current.version },
      { version: result.version, reasonPresent: true },
    );
    return result;
  }

  private async updateClass(
    tx: Prisma.TransactionClient,
    principal: SessionPrincipal,
    id: string,
    input: PublicProfileInput,
    correlationId: string,
    strings: (value: unknown) => boolean,
  ) {
    if (!principal.capabilities.includes('branch:all'))
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    const current = await tx.profilPublikKelas.findUnique({ where: { code: id } });
    if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const heroImageKey = String(input.heroImageKey ?? '');
    if (
      !PUBLIC_ASSET_KEY_SET.has(heroImageKey) ||
      !strings(input.equipment) ||
      !strings(input.benefits)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const updated = await tx.profilPublikKelas.updateMany({
      where: { code: id, version: input.expectedVersion },
      data: {
        slug: String(input.slug ?? '').trim(),
        summary: String(input.summary ?? '').trim(),
        description: String(input.description ?? '').trim(),
        level: String(input.level ?? '').trim(),
        durationMinutes: Number(input.durationMinutes),
        equipment: input.equipment as Prisma.InputJsonValue,
        benefits: input.benefits as Prisma.InputJsonValue,
        heroImageKey,
        version: { increment: 1 },
      },
    });
    if (!updated.count) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    const result = await tx.profilPublikKelas.findUniqueOrThrow({ where: { code: id } });
    const branchId =
      principal.branchIds[0] ?? (await tx.cabang.findFirst({ select: { id: true } }))?.id;
    if (!branchId) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    await this.access.audit(
      tx,
      principal,
      correlationId,
      'master.public_class_profile_updated',
      'PublicClassProfile',
      id,
      branchId,
      { version: current.version },
      { version: result.version, reasonPresent: true },
    );
    return result;
  }

  private async updatePackage(
    tx: Prisma.TransactionClient,
    principal: SessionPrincipal,
    id: string,
    input: PublicProfileInput,
    correlationId: string,
    strings: (value: unknown) => boolean,
  ) {
    const pkg = await tx.paket.findUnique({
      where: { id },
      select: {
        branchScopes: { where: { active: true }, select: { branchId: true } },
        publicProfile: true,
      },
    });
    if (!pkg?.publicProfile) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    const branchIds = pkg.branchScopes.map(({ branchId }) => branchId);
    if (!branchIds.length) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    for (const branchId of branchIds) this.access.ensureBranchScope(principal, branchId, true);
    if (!strings(input.highlights) || !strings(input.terms))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const updated = await tx.profilPublikPaket.updateMany({
      where: { packageId: id, version: input.expectedVersion },
      data: {
        summary: String(input.summary ?? '').trim(),
        description: String(input.description ?? '').trim(),
        highlights: input.highlights as Prisma.InputJsonValue,
        usageGuidance: String(input.usageGuidance ?? '').trim(),
        terms: input.terms as Prisma.InputJsonValue,
        version: { increment: 1 },
      },
    });
    if (!updated.count) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    const result = await tx.profilPublikPaket.findUniqueOrThrow({ where: { packageId: id } });
    await this.access.audit(
      tx,
      principal,
      correlationId,
      'master.public_package_profile_updated',
      'PackagePublicProfile',
      id,
      null,
      { version: pkg.publicProfile.version },
      { version: result.version, reasonPresent: true },
    );
    return result;
  }
}
