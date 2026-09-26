import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from './identity.service';
import { ApiProblem, ENTITY_ID_REGEX, newId } from './security';
import { Role } from '@prisma/client';

const UUID_REGEX = ENTITY_ID_REGEX;

@Injectable()
export class OwnerBranchService {
  constructor(private readonly db: PrismaService) {}

  private isSuperOwner(principal: SessionPrincipal): boolean {
    return principal.roles.some((r) =>
      ['SUPER_OWNER', 'SUPERADMIN'].includes(r.role as string),
    );
  }

  async listAssignments(
    principal: SessionPrincipal,
    filters: { branchId?: string; ownerId?: string } = {},
  ) {
    if (!this.isSuperOwner(principal)) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    const where: any = {};
    if (filters.branchId) {
      if (!UUID_REGEX.test(filters.branchId)) {
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
      }
      where.branchId = filters.branchId;
    }
    if (filters.ownerId) {
      if (!UUID_REGEX.test(filters.ownerId)) {
        throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
      }
      where.ownerId = filters.ownerId;
    }

    const rows = await this.db.ownerCabang.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            email: true,
            phone: true,
            role: true,
          },
        },
        branch: {
          select: {
            id: true,
            code: true,
            name: true,
            active: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: rows.map((row) => ({
        id: row.id,
        ownerId: row.ownerId,
        branchId: row.branchId,
        createdAt: row.createdAt.toISOString(),
        owner: row.owner,
        branch: row.branch,
      })),
      total: rows.length,
    };
  }

  async assignOwner(
    principal: SessionPrincipal,
    input: { ownerId: string; branchId: string },
  ) {
    if (!this.isSuperOwner(principal)) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    if (!UUID_REGEX.test(input.ownerId) || !UUID_REGEX.test(input.branchId)) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }

    const [user, branch] = await Promise.all([
      this.db.user.findUnique({ where: { id: input.ownerId } }),
      this.db.cabang.findUnique({ where: { id: input.branchId } }),
    ]);

    if (!user || user.status !== 'ACTIVE') {
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    if (!branch || !branch.active) {
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    // Pastikan user memiliki role OWNER jika belum
    if (user.role !== Role.OWNER && user.role !== Role.SUPER_OWNER && (user.role as any) !== 'SUPERADMIN') {
      await this.db.user.update({
        where: { id: user.id },
        data: { role: Role.OWNER },
      });
    }

    const assignment = await this.db.ownerCabang.upsert({
      where: {
        ownerId_branchId: {
          ownerId: input.ownerId,
          branchId: input.branchId,
        },
      },
      create: {
        id: newId(),
        ownerId: input.ownerId,
        branchId: input.branchId,
      },
      update: {},
      include: {
        owner: {
          select: { id: true, displayName: true, email: true, phone: true, role: true },
        },
        branch: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return {
      id: assignment.id,
      ownerId: assignment.ownerId,
      branchId: assignment.branchId,
      createdAt: assignment.createdAt.toISOString(),
      owner: assignment.owner,
      branch: assignment.branch,
    };
  }

  async unassignOwner(principal: SessionPrincipal, id: string) {
    if (!this.isSuperOwner(principal)) {
      throw new ApiProblem('FORBIDDEN', HttpStatus.FORBIDDEN);
    }

    if (!UUID_REGEX.test(id)) {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }

    const existing = await this.db.ownerCabang.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    await this.db.ownerCabang.delete({ where: { id } });

    return { id, removed: true };
  }
}
