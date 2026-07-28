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

  async list(
    principal: SessionPrincipal,
    input: {
      branchId?: string;
      q?: string;
      type?: AssignmentType;
      status?: 'ACTIVE' | 'ENDED';
      cursor?: string;
      limit?: number;
    } = {},
  ) {
    this.policy.requireCapability(principal.capabilities, 'assignment:read');
    this.ensureScope(principal, input.branchId);
    if (input.type && !['OWNER', 'INSTRUCTOR'].includes(input.type))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (input.status && !['ACTIVE', 'ENDED'].includes(input.status))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const limit = input.limit ?? 20;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const cursor = decodeAssignmentCursor(input.cursor);
    const now = new Date();
    const scopeWhere: Prisma.AssignmentWhereInput = input.branchId
      ? { branchId: input.branchId }
      : principal.capabilities.includes('branch:all')
        ? {}
        : { branchId: { in: principal.branchIds } };
    const query = input.q?.trim();
    const commonWhere: Prisma.AssignmentWhereInput = {
      ...scopeWhere,
      type: input.type,
      ...(query
        ? {
            OR: [
              { id: query },
              { userId: query },
              { user: { displayName: { contains: query } } },
              { user: { phoneE164: { contains: query } } },
              { branch: { name: { contains: query } } },
              { branch: { code: { contains: query } } },
            ],
          }
        : {}),
    };
    const statusWhere: Prisma.AssignmentWhereInput =
      input.status === 'ACTIVE'
        ? { OR: [{ activeUntil: null }, { activeUntil: { gt: now } }] }
        : input.status === 'ENDED'
          ? { activeUntil: { lte: now } }
          : {};
    const cursorWhere: Prisma.AssignmentWhereInput = cursor
      ? {
          OR: [
            { activeFrom: { lt: cursor.activeFrom } },
            { activeFrom: cursor.activeFrom, id: { lt: cursor.id } },
          ],
        }
      : {};
    const [rows, total, active, ended] = await this.db.$transaction([
      this.db.assignment.findMany({
        where: { AND: [commonWhere, statusWhere, cursorWhere] },
        include: {
          user: { select: { id: true, displayName: true, phoneE164: true } },
          branch: { select: { id: true, code: true, name: true } },
        },
        orderBy: [{ activeFrom: 'desc' }, { id: 'desc' }],
        take: limit + 1,
      }),
      this.db.assignment.count({ where: commonWhere }),
      this.db.assignment.count({
        where: {
          AND: [commonWhere, { OR: [{ activeUntil: null }, { activeUntil: { gt: now } }] }],
        },
      }),
      this.db.assignment.count({
        where: { AND: [commonWhere, { activeUntil: { lte: now } }] },
      }),
    ]);
    const hasMore = rows.length > limit;
    const assignments = rows.slice(0, limit);
    const last = assignments.at(-1);
    return {
      items: assignments.map((assignment) => assignmentView(assignment, now)),
      summary: { total, active, ended },
      page: {
        nextCursor: hasMore && last ? encodeAssignmentCursor(last.activeFrom, last.id) : null,
        hasMore,
      },
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

function assignmentView(
  assignment: {
    id: string;
    userId: string;
    branchId: string;
    type: AssignmentType;
    activeFrom: Date;
    activeUntil: Date | null;
    version: number;
    user: { id: string; displayName: string; phoneE164: string | null };
    branch: { id: string; code: string; name: string };
  },
  now: Date,
) {
  return {
    id: assignment.id,
    userId: assignment.userId,
    branchId: assignment.branchId,
    assignmentType: assignment.type,
    activeFrom: assignment.activeFrom.toISOString().slice(0, 10),
    activeUntil: assignment.activeUntil?.toISOString().slice(0, 10) ?? null,
    status: !assignment.activeUntil || assignment.activeUntil > now ? 'ACTIVE' : 'ENDED',
    user: {
      id: assignment.user.id,
      displayName: assignment.user.displayName,
      phoneMasked: maskPhone(assignment.user.phoneE164),
    },
    branch: assignment.branch,
    version: assignment.version,
  };
}

function maskPhone(value: string | null) {
  if (!value) return null;
  return `${value.slice(0, 4)}••••${value.slice(-3)}`;
}

function encodeAssignmentCursor(activeFrom: Date, id: string) {
  return Buffer.from(JSON.stringify({ activeFrom: activeFrom.toISOString(), id })).toString(
    'base64url',
  );
}

function decodeAssignmentCursor(value?: string) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as {
      activeFrom?: string;
      id?: string;
    };
    const activeFrom = new Date(parsed.activeFrom ?? '');
    if (!parsed.id || Number.isNaN(activeFrom.getTime())) throw new Error('invalid');
    return { activeFrom, id: parsed.id };
  } catch {
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

function isAssignmentConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)
  );
}

function isSerializationConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
}
