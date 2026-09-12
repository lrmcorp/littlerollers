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
      },
    });
    if (!branch) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
    return {
      branch: { ...branch, publicProfile: null, classTypes: [] },
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

    return {
      kind,
      id,
      version: input.expectedVersion + 1,
      updated: true,
    };
  }
}
