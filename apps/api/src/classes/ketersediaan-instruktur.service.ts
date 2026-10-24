import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, ENTITY_ID_REGEX } from '../identity/security';

const DATE_TIME_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
const UUID = ENTITY_ID_REGEX;
const PAGE_SIZE = 20;

type AvailabilityCursor = { at: string; id: string };
const encodeCursor = (at: Date, id: string) =>
  Buffer.from(JSON.stringify({ at: at.toISOString(), id })).toString('base64url');

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

  async list(
    principal: SessionPrincipal,
    branchId?: string,
    fromValue?: string,
    untilValue?: string,
    _cursorValue?: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'availability:self:read');
    if (branchId && !principal.branchIds.includes(branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const from = fromValue ? instant(fromValue) : undefined;
    const until = untilValue ? instant(untilValue) : undefined;
    if (from && until && from >= until)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    const records = await this.db.instructorAvailability.findMany({
      where: {
        instructorId: principal.userId,
        ...(branchId ? { branchId } : { branchId: { in: principal.branchIds } }),
        ...(from ? { date: { gte: new Date(from.toISOString().slice(0, 10)) } } : {}),
        ...(until ? { date: { lte: new Date(until.toISOString().slice(0, 10)) } } : {}),
      },
      include: { branch: { select: { timezone: true } } },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
    });

    const hasMore = records.length > PAGE_SIZE;
    const page = records.slice(0, PAGE_SIZE);
    const last = page.at(-1);

    // Baris lama (mis. hasil seed) menyimpan "HH:MM" tanpa detik; normalisasi ke "HH:MM:SS"
    // sebelum dirangkai jadi ISO instant, jika tidak Date jadi Invalid dan diserialisasi null.
    const withSeconds = (time: string) => (time.length === 5 ? `${time}:00` : time);
    const items = page.map((record) => {
      const dateIso = record.date.toISOString().slice(0, 10);
      const startAt = new Date(`${dateIso}T${withSeconds(record.startTime)}.000Z`);
      const endAt = new Date(`${dateIso}T${withSeconds(record.endTime)}.000Z`);
      return {
        id: record.id,
        instructorUserId: record.instructorId,
        branchId: record.branchId,
        startAt,
        endAt,
        timezone: record.branch.timezone,
        version: 1,
        status: endAt.getTime() <= Date.now() ? 'ENDED' : 'ACTIVE',
      };
    });

    return {
      items,
      page: { hasMore, nextCursor: hasMore && last ? encodeCursor(last.date, last.id) : null },
    };
  }

  async create(
    principal: SessionPrincipal,
    input: { branchId: string; startAt: string; endAt: string },
    key: string,
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'availability:self:create');
    if (!key || key.length < 16 || key.length > 128 || !UUID.test(input.branchId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const startAt = instant(input.startAt);
    const endAt = instant(input.endAt);
    if (startAt >= endAt) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    return this.idempotency.execute(
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
          tx.cabang.findUnique({ where: { id: input.branchId } }),
        ]);

        if (
          !user ||
          user.status !== 'ACTIVE' ||
          !branch ||
          !branch.active ||
          !principal.branchIds.includes(branch.id)
        )
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

        const assignment = await tx.penugasanInstruktur.findFirst({
          where: {
            coachId: principal.userId,
            branchId: branch.id,
            active: true,
          },
        });
        if (!assignment) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

        const overlap = await tx.slotKelas.findFirst({
          where: {
            instructorId: principal.userId,
            startAt: { lt: endAt },
            endAt: { gt: startAt },
            status: { in: ['PUBLISHED', 'CONFIRMED'] },
          },
        });
        if (overlap) throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);

        const recordId = randomUUID();
        const dateOnly = new Date(startAt.toISOString().slice(0, 10));
        const startTimeStr = startAt.toISOString().slice(11, 19);
        const endTimeStr = endAt.toISOString().slice(11, 19);

        await tx.instructorAvailability.create({
          data: {
            id: recordId,
            instructorId: principal.userId,
            branchId: branch.id,
            date: dateOnly,
            startTime: startTimeStr,
            endTime: endTimeStr,
          },
        });

        const item = {
          id: recordId,
          instructorUserId: principal.userId,
          branchId: branch.id,
          startAt,
          endAt,
          timezone: branch.timezone,
          version: 1,
          status: 'ACTIVE',
        };

        return {
          status: HttpStatus.CREATED,
          body: item as unknown as Prisma.InputJsonValue,
        };
      },
    );
  }

  /** Milik sendiri dan belum berakhir; selain itu 404 (bukan milik) atau 409 (sudah lewat). */
  private async ownActiveWindow(
    tx: Pick<PrismaService, 'instructorAvailability'>,
    principal: SessionPrincipal,
    id: string,
  ) {
    if (!UUID.test(id)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const record = await tx.instructorAvailability.findFirst({
      where: { id, instructorId: principal.userId, branchId: { in: principal.branchIds } },
      include: { branch: { select: { timezone: true } } },
    });
    if (!record) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const dateIso = record.date.toISOString().slice(0, 10);
    const time = record.endTime.length === 5 ? `${record.endTime}:00` : record.endTime;
    if (new Date(`${dateIso}T${time}.000Z`).getTime() <= Date.now())
      throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
    return record;
  }

  /** Ubah jam ketersediaan sendiri yang belum berakhir; cabang tidak bisa diganti. */
  async update(principal: SessionPrincipal, id: string, input: { startAt: string; endAt: string }) {
    this.policy.requireCapability(principal.capabilities, 'availability:self:create');
    const startAt = instant(String(input?.startAt));
    const endAt = instant(String(input?.endAt));
    if (startAt >= endAt) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    return this.db.$transaction(async (tx) => {
      const record = await this.ownActiveWindow(tx, principal, id);
      const overlap = await tx.slotKelas.findFirst({
        where: {
          instructorId: principal.userId,
          startAt: { lt: endAt },
          endAt: { gt: startAt },
          status: { in: ['PUBLISHED', 'CONFIRMED'] },
        },
      });
      if (overlap) throw new ApiProblem('EFFECTIVE_PERIOD_OVERLAP', HttpStatus.CONFLICT);

      await tx.instructorAvailability.update({
        where: { id: record.id },
        data: {
          date: new Date(startAt.toISOString().slice(0, 10)),
          startTime: startAt.toISOString().slice(11, 19),
          endTime: endAt.toISOString().slice(11, 19),
        },
      });
      return {
        id: record.id,
        instructorUserId: principal.userId,
        branchId: record.branchId,
        startAt,
        endAt,
        timezone: record.branch.timezone,
        version: 1,
        status: 'ACTIVE',
      };
    });
  }

  /** Tarik ketersediaan sendiri yang belum berakhir. Tidak ada data lain yang merujuknya. */
  async remove(principal: SessionPrincipal, id: string) {
    this.policy.requireCapability(principal.capabilities, 'availability:self:create');
    return this.db.$transaction(async (tx) => {
      const record = await this.ownActiveWindow(tx, principal, id);
      await tx.instructorAvailability.delete({ where: { id: record.id } });
      return { id: record.id, deleted: true };
    });
  }

  // --- Indonesian Domain Aliases ---
  async daftarKetersediaan(
    principal: SessionPrincipal,
    branchId?: string,
    fromValue?: string,
    untilValue?: string,
    cursorValue?: string,
  ) {
    return this.list(principal, branchId, fromValue, untilValue, cursorValue);
  }

  async catatKetersediaan(
    principal: SessionPrincipal,
    input: Parameters<AvailabilityService['create']>[1],
    key: string,
    correlationId: string,
  ) {
    return this.create(principal, input, key, correlationId);
  }
}
