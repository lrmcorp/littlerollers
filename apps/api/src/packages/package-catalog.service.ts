import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { ApiProblem, newId } from '../identity/security';
import { PackageAccessService } from './package-access.service';

@Injectable()
export class PackageCatalogService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: PackageAccessService,
  ) {}

  async list(principal: SessionPrincipal, branchId?: string) {
    this.access.catalog(principal);
    const customer =
      principal.roles.some(({ role }) => role === 'CUSTOMER') &&
      !principal.capabilities.includes('branch:all') &&
      !principal.capabilities.includes('branch:operate') &&
      !principal.capabilities.includes('branch:manage');
    if (branchId && !customer) this.access.scope(principal, branchId);
    if (branchId && customer) {
      const branch = await this.db.branch.findUnique({ where: { id: branchId } });
      if (!branch?.active) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    const now = new Date();
    const items = await this.db.package.findMany({
      where: {
        ...(branchId
          ? { branchId }
          : customer
            ? {}
            : principal.capabilities.includes('branch:all')
              ? {}
              : { branchId: { in: principal.branchIds } }),
        status: 'ACTIVE',
        effectiveFrom: { lte: now },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: now } }],
      },
      orderBy: [{ branchId: 'asc' }, { effectiveFrom: 'desc' }],
    });
    return { items, page: { nextCursor: null, hasMore: false } };
  }

  async create(principal: SessionPrincipal, input: any, correlationId: string) {
    this.access.catalog(principal, true);
    this.access.scope(principal, input.branchId);
    if (
      !input.name ||
      !Number.isInteger(input.sessionCount) ||
      input.sessionCount < 1 ||
      !Number.isInteger(input.durationDays) ||
      input.durationDays < 1 ||
      !Number.isInteger(input.priceRp) ||
      input.priceRp < 1 ||
      !input.effectiveFrom
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (input.effectiveUntil && input.effectiveUntil <= input.effectiveFrom)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const businessKey = String(input.businessKey ?? input.name)
      .trim()
      .toUpperCase();
    const effectiveFrom = new Date(input.effectiveFrom);
    const effectiveUntil = input.effectiveUntil ? new Date(input.effectiveUntil) : null;
    try {
      return await this.db.$transaction(
        async (tx) => {
          await tx.$queryRaw`
            SELECT \`id\`
            FROM \`ClassType\`
            WHERE \`id\` = ${input.classTypeId}
            FOR UPDATE
          `;
          const [branch, classType] = await Promise.all([
            tx.branch.findUnique({ where: { id: input.branchId } }),
            tx.classType.findUnique({ where: { id: input.classTypeId } }),
          ]);
          if (!branch?.active || !classType?.active || classType.branchId !== input.branchId)
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          const overlap = await tx.package.findFirst({
            where: {
              branchId: input.branchId,
              classTypeId: input.classTypeId,
              businessKey,
              effectiveFrom: effectiveUntil ? { lt: effectiveUntil } : undefined,
              OR: [{ effectiveUntil: null }, { effectiveUntil: { gt: effectiveFrom } }],
            },
          });
          if (overlap) throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
          const result = await tx.package.create({
            data: {
              id: newId(),
              branchId: input.branchId,
              classTypeId: input.classTypeId,
              businessKey,
              name: input.name.trim(),
              sessionCount: input.sessionCount,
              durationDays: input.durationDays,
              priceRp: input.priceRp,
              effectiveFrom,
              effectiveUntil,
            },
          });
          await this.access.audit(
            tx,
            principal,
            'PACKAGE_CREATED',
            'Package',
            result.id,
            result.branchId,
            correlationId,
          );
          return result;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P2002', 'P2004', 'P2010'].includes(error.code)
      )
        throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
      throw error;
    }
  }
}
