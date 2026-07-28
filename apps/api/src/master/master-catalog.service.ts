import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { MasterAccessService } from './master-access.service';

@Injectable()
export class MasterCatalogService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: MasterAccessService,
  ) {}

  async listBranches(principal: SessionPrincipal) {
    this.access.authorize(principal);
    const scope = this.access.branchScope(principal);
    const items = await this.db.branch.findMany({
      where: scope.all
        ? scope.excluded.length
          ? { id: { notIn: scope.excluded } }
          : {}
        : { id: { in: scope.included } },
      orderBy: { code: 'asc' },
    });
    return { items, page: { nextCursor: null, hasMore: false } };
  }

  async createBranch(
    principal: SessionPrincipal,
    input: { code: string; name: string; timezone: string },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    if (!/^[A-Z0-9_-]{2,30}$/.test(code) || name.length < 2 || name.length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format();
    } catch {
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.db.$transaction(async (tx) => {
        const branch = await tx.branch.create({
          data: { id: newId(), code, name, timezone: input.timezone },
        });
        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.branch_created',
          'Branch',
          branch.id,
          branch.id,
          undefined,
          { code, timezone: input.timezone, active: true, version: 0 },
        );
        return branch;
      });
    } catch (error) {
      if (isUnique(error)) throw new ApiProblem('BUSINESS_KEY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async deactivateBranch(
    principal: SessionPrincipal,
    id: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, id, true);
    return this.db.$transaction(async (tx) => {
      const current = await tx.branch.findUnique({ where: { id } });
      if (!current) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      if (!current.active || current.version !== expectedVersion)
        throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      const dependencies = await tx.assignment.count({
        where: { branchId: id, activeUntil: null },
      });
      if (dependencies) throw new ApiProblem('ACTIVE_DEPENDENCY', HttpStatus.CONFLICT);
      const result = await tx.branch.update({
        where: { id },
        data: { active: false, version: { increment: 1 } },
      });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.branch_deactivated',
        'Branch',
        id,
        id,
        { active: true, version: expectedVersion },
        { active: false, version: expectedVersion + 1 },
      );
      return result;
    });
  }

  async listClassTypes(principal: SessionPrincipal, branchId?: string) {
    this.access.authorize(principal);
    if (branchId) this.access.ensureBranchScope(principal, branchId);
    const scope = this.access.branchScope(principal);
    const items = await this.db.classType.findMany({
      where: {
        branchId:
          branchId ??
          (scope.all
            ? scope.excluded.length
              ? { notIn: scope.excluded }
              : undefined
            : { in: scope.included }),
      },
      orderBy: { code: 'asc' },
    });
    return { items, page: { nextCursor: null, hasMore: false } };
  }

  async createClassType(
    principal: SessionPrincipal,
    input: { branchId: string; code: string; name: string },
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    this.access.ensureBranchScope(principal, input.branchId, true);
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    if (!/^[A-Z0-9_-]{2,30}$/.test(code) || name.length < 2 || name.length > 120)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    try {
      return await this.db.$transaction(async (tx) => {
        const branch = await tx.branch.findUnique({ where: { id: input.branchId } });
        if (!branch?.active) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
        const item = await tx.classType.create({
          data: { id: newId(), branchId: input.branchId, code, name },
        });
        await this.access.audit(
          tx,
          principal,
          correlationId,
          'master.class_type_created',
          'ClassType',
          item.id,
          input.branchId,
          undefined,
          { code, active: true, version: 0 },
        );
        return item;
      });
    } catch (error) {
      if (isUnique(error)) throw new ApiProblem('BUSINESS_KEY_CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async deactivateClassType(
    principal: SessionPrincipal,
    id: string,
    expectedVersion: number,
    correlationId: string,
  ) {
    this.access.authorize(principal, true);
    return this.db.$transaction(async (tx) => {
      const item = await tx.classType.findUnique({ where: { id } });
      if (!item) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
      this.access.ensureBranchScope(principal, item.branchId, true);
      if (!item.active || item.version !== expectedVersion)
        throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      const activeSettings = await tx.effectiveConfiguration.count({
        where: { classTypeId: id, effectiveUntil: null },
      });
      if (activeSettings) throw new ApiProblem('ACTIVE_DEPENDENCY', HttpStatus.CONFLICT);
      const result = await tx.classType.update({
        where: { id },
        data: { active: false, version: { increment: 1 } },
      });
      await this.access.audit(
        tx,
        principal,
        correlationId,
        'master.class_type_deactivated',
        'ClassType',
        id,
        item.branchId,
        { active: true, version: expectedVersion },
        { active: false, version: expectedVersion + 1 },
      );
      return result;
    });
  }
}

function isUnique(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
