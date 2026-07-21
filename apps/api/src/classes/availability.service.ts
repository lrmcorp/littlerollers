import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import { dateInTimeZone } from '../identity/assignment-boundary';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';

const DATE_TIME_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 20;

type AvailabilityCursor = { at: string; id: string };
const encodeCursor = (at: Date, id: string) =>
  Buffer.from(JSON.stringify({ at: at.toISOString(), id })).toString('base64url');
function decodeCursor(value?: string): AvailabilityCursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString()) as AvailabilityCursor;
    if (!parsed.at || Number.isNaN(Date.parse(parsed.at)) || !UUID.test(parsed.id))
      throw new Error();
    return parsed;
  } catch {
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }
}
function instant(value: string): Date {
  if (!DATE_TIME_WITH_OFFSET.test(value))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  const result = new Date(value);
  if (Number.isNaN(result.getTime()))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  return result;
}

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly idempotency: IdempotencyService,
  ) {}

  private view(item: {
    id: string;
    instructorUserId: string;
    branchId: string;
    startAt: Date;
    endAt: Date;
    timezone: string;
    version: number;
  }) {
    return {
      id: item.id,
      instructorUserId: item.instructorUserId,
      branchId: item.branchId,
      startAt: item.startAt,
      endAt: item.endAt,
      timezone: item.timezone,
      version: item.version,
      status: item.endAt.getTime() <= Date.now() ? 'ENDED' : 'ACTIVE',
    };
  }

  async list(
    principal: SessionPrincipal,
    branchId?: string,
    fromValue?: string,
    untilValue?: string,
    cursorValue?: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'availability:self:read');
    if (branchId && !principal.branchIds.includes(branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const from = fromValue ? instant(fromValue) : undefined;
    const until = untilValue ? instant(untilValue) : undefined;
    if (from && until && from >= until)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const cursor = decodeCursor(cursorValue);
    const items = await this.db.instructorAvailability.findMany({
      where: {
        instructorUserId: principal.userId,
        ...(branchId ? { branchId } : { branchId: { in: principal.branchIds } }),
        ...(from ? { endAt: { gt: from } } : {}),
        ...(until ? { startAt: { lt: until } } : {}),
        ...(cursor
          ? {
              OR: [
                { startAt: { lt: new Date(cursor.at) } },
                { startAt: new Date(cursor.at), id: { lt: cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ startAt: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
    });
    const hasMore = items.length > PAGE_SIZE;
    const page = items.slice(0, PAGE_SIZE);
    const last = page.at(-1);
    return {
      items: page.map((item) => this.view(item)),
      page: { hasMore, nextCursor: hasMore && last ? encodeCursor(last.startAt, last.id) : null },
    };
  }

  async create(
    principal: SessionPrincipal,
    input: { branchId: string; startAt: string; endAt: string },
    key: string,
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'availability:self:create');
    if (!key || key.length < 16 || key.length > 128 || !UUID.test(input.branchId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const startAt = instant(input.startAt);
    const endAt = instant(input.endAt);
    if (startAt >= endAt) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    return this.idempotency
      .execute(
        {
          scope: `instructor-availability:${principal.userId}`,
          key,
          payload: input,
          ttlMs: 86400000,
          leaseMs: 30000,
        },
        async (tx) => {
          const [user, branch] = await Promise.all([
            tx.user.findUnique({ where: { id: principal.userId } }),
            tx.branch.findUnique({ where: { id: input.branchId } }),
          ]);
          if (
            !user ||
            user.status !== 'ACTIVE' ||
            !branch ||
            !branch.active ||
            !principal.branchIds.includes(branch.id)
          )
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          const startDate = dateInTimeZone(startAt, branch.timezone);
          const occupiedEndDate = dateInTimeZone(new Date(endAt.getTime() - 1), branch.timezone);
          const assignment = await tx.assignment.findFirst({
            where: {
              userId: principal.userId,
              branchId: branch.id,
              type: 'INSTRUCTOR',
              activeFrom: { lte: new Date(`${startDate}T00:00:00Z`) },
              OR: [
                { activeUntil: null },
                { activeUntil: { gt: new Date(`${occupiedEndDate}T00:00:00Z`) } },
              ],
            },
          });
          if (!assignment) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          const availability = await tx.instructorAvailability.create({
            data: {
              id: randomUUID(),
              instructorUserId: principal.userId,
              branchId: branch.id,
              sourceAssignmentId: assignment.id,
              startAt,
              endAt,
              timezone: branch.timezone,
            },
          });
          await tx.auditLog.create({
            data: {
              id: randomUUID(),
              actorType: 'USER',
              actorId: principal.userId,
              action: 'instructor.availability.created',
              objectType: 'InstructorAvailability',
              objectId: availability.id,
              branchId: branch.id,
              correlationId,
              afterMasked: {
                branchId: branch.id,
                startAt: startAt.toISOString(),
                endAt: endAt.toISOString(),
                timezone: branch.timezone,
              },
            },
          });
          return {
            status: HttpStatus.CREATED,
            body: this.view(availability) as unknown as Prisma.InputJsonValue,
          };
        },
      )
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        if (
          /InstructorAvailability_no_overlap|23P01|exclusion/i.test(message) ||
          (error instanceof Prisma.PrismaClientKnownRequestError &&
            ['P2002', 'P2004', 'P2010', 'P2034'].includes(error.code))
        )
          throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);
        throw error;
      });
  }
}
