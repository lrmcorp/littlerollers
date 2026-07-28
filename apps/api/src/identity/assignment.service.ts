import { HttpStatus, Injectable } from '@nestjs/common';
import { type AssignmentType, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { assertIsoDate, dateInTimeZone, startOfLocalDateUtc } from './assignment-boundary';
import type { SessionPrincipal } from './identity.service';
import { PolicyService } from './policy.service';
import { ApiProblem, newId } from './security';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  async list(principal: SessionPrincipal, branchId?: string) {
    this.policy.requireCapability(principal.capabilities, 'assignment:read');
    this.ensureScope(principal, branchId);
    const assignments = await this.db.assignment.findMany({
      where: branchId
        ? { branchId }
        : principal.capabilities.includes('branch:all')
          ? undefined
          : { branchId: { in: principal.branchIds } },
      orderBy: [{ activeFrom: 'desc' }, { id: 'asc' }],
      take: 50,
    });
    return {
      items: assignments.map(assignmentView),
      page: { nextCursor: null, hasMore: false },
    };
  }

  async create(
    principal: SessionPrincipal,
    input: {
      userId: string;
      branchId: string;
      assignmentType: AssignmentType;
      activeFrom: string;
      activeUntil?: string | null;
      reason: string;
    },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'assignment:manage');
    this.ensureScope(principal, input.branchId);
    if (!['OWNER', 'INSTRUCTOR'].includes(input.assignmentType))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (input.userId === principal.userId)
      throw new ApiProblem('SEPARATION_OF_DUTIES_VIOLATION', HttpStatus.CONFLICT);
    const activeFrom = assertIsoDate(input.activeFrom);
    const activeUntil = input.activeUntil ? assertIsoDate(input.activeUntil) : null;
    if (activeUntil && activeUntil <= activeFrom)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    try {
      return await this.db.$transaction(
        async (tx) => {
          await tx.$queryRaw`
            SELECT \`id\`
            FROM \`User\`
            WHERE \`id\` = ${input.userId}
            FOR UPDATE
          `;
          const [user, branch] = await Promise.all([
            tx.user.findUnique({ where: { id: input.userId } }),
            tx.branch.findUnique({ where: { id: input.branchId } }),
          ]);
          if (!user || user.status !== 'ACTIVE' || !branch || !branch.active)
            throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
          const overlap = await tx.assignment.findFirst({
            where: {
              userId: input.userId,
              branchId: input.branchId,
              type: input.assignmentType,
              activeFrom: activeUntil ? { lt: new Date(`${activeUntil}T00:00:00Z`) } : undefined,
              OR: [
                { activeUntil: null },
                { activeUntil: { gt: new Date(`${activeFrom}T00:00:00Z`) } },
              ],
            },
          });
          if (overlap) throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);
          const id = newId();
          const assignment = await tx.assignment.create({
            data: {
              id,
              userId: input.userId,
              branchId: input.branchId,
              type: input.assignmentType,
              activeFrom: new Date(`${activeFrom}T00:00:00Z`),
              activeUntil: activeUntil ? new Date(`${activeUntil}T00:00:00Z`) : null,
            },
          });
          await tx.userRole.create({
            data: {
              userId: input.userId,
              role: input.assignmentType,
              branchId: input.branchId,
              activeFrom: startOfLocalDateUtc(activeFrom, branch.timezone),
              activeUntil: activeUntil ? startOfLocalDateUtc(activeUntil, branch.timezone) : null,
              sourceAssignmentId: id,
            },
          });
          await this.audit(tx, principal, {
            action: 'master.assignment_created',
            id,
            targetUserId: input.userId,
            branchId: input.branchId,
            correlationId,
            after: {
              assignmentType: input.assignmentType,
              activeFrom,
              activeUntil,
              reasonPresent: Boolean(input.reason),
              version: 0,
            },
          });
          return { id: assignment.id, status: 'ACTIVE', version: assignment.version };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (isAssignmentConflict(error))
        throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);
      throw error;
    }
  }

  async end(
    principal: SessionPrincipal,
    assignmentId: string,
    input: { effectiveAt: string; reason: string; expectedVersion: number },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'assignment:manage');
    if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 0)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const effectiveInstant = new Date(input.effectiveAt);
    if (Number.isNaN(effectiveInstant.getTime()))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    try {
      return await this.db.$transaction(
        async (tx) => {
          const assignment = await tx.assignment.findUnique({
            where: { id: assignmentId },
            include: { branch: true, projectedRole: true },
          });
          if (!assignment) throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
          this.ensureScope(principal, assignment.branchId);
          const effectiveDate = dateInTimeZone(effectiveInstant, assignment.branch.timezone);
          const from = assignment.activeFrom.toISOString().slice(0, 10);
          if (effectiveDate <= from)
            throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
          if (assignment.activeUntil || assignment.version !== input.expectedVersion)
            throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
          const updated = await tx.assignment.updateMany({
            where: { id: assignment.id, version: input.expectedVersion, activeUntil: null },
            data: {
              activeUntil: new Date(`${effectiveDate}T00:00:00Z`),
              version: { increment: 1 },
            },
          });
          if (updated.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
          if (!assignment.projectedRole)
            throw new ApiProblem('ASSIGNMENT_PROJECTION_MISSING', HttpStatus.CONFLICT);
          await tx.userRole.update({
            where: { sourceAssignmentId: assignment.id },
            data: { activeUntil: startOfLocalDateUtc(effectiveDate, assignment.branch.timezone) },
          });
          await this.audit(tx, principal, {
            action: 'master.assignment_ended',
            id: assignment.id,
            targetUserId: assignment.userId,
            branchId: assignment.branchId,
            correlationId,
            before: { activeUntil: null, version: assignment.version },
            after: {
              activeUntil: effectiveDate,
              version: assignment.version + 1,
              reasonPresent: Boolean(input.reason),
            },
          });
          return { id: assignment.id, status: 'ENDED', version: assignment.version + 1 };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (isSerializationConflict(error))
        throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
      throw error;
    }
  }

  private ensureScope(principal: SessionPrincipal, branchId?: string) {
    if (
      branchId &&
      !principal.capabilities.includes('branch:all') &&
      !principal.branchIds.includes(branchId)
    )
      throw new ApiProblem('NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  private audit(
    tx: Prisma.TransactionClient,
    principal: SessionPrincipal,
    input: {
      action: string;
      id: string;
      targetUserId: string;
      branchId: string;
      correlationId: string;
      before?: Prisma.InputJsonValue;
      after?: Prisma.InputJsonValue;
    },
  ) {
    return tx.auditLog.create({
      data: {
        id: newId(),
        actorType: 'USER',
        actorId: principal.userId,
        action: input.action,
        objectType: 'Assignment',
        objectId: input.id,
        targetUserId: input.targetUserId,
        branchId: input.branchId,
        correlationId: input.correlationId,
        beforeMasked: input.before,
        afterMasked: input.after,
      },
    });
  }
}

function assignmentView(assignment: {
  id: string;
  userId: string;
  branchId: string;
  type: AssignmentType;
  activeFrom: Date;
  activeUntil: Date | null;
  version: number;
}) {
  return {
    id: assignment.id,
    userId: assignment.userId,
    branchId: assignment.branchId,
    assignmentType: assignment.type,
    activeFrom: assignment.activeFrom.toISOString().slice(0, 10),
    activeUntil: assignment.activeUntil?.toISOString().slice(0, 10) ?? null,
    version: assignment.version,
  };
}

function isAssignmentConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)
  );
}

function isSerializationConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
}
