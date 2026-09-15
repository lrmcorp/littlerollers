import { HttpStatus, Injectable } from '@nestjs/common';
import { ClassSlotStatus, Prisma } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, newId } from '../identity/security';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
const PAGE_SIZE = 20;

export const CANCELLATION_REASONS = [
  'STUDIO_UNAVAILABLE',
  'INSTRUCTOR_UNAVAILABLE',
  'SAFETY_ISSUE',
  'OTHER_REVIEW_REQUIRED',
] as const;
export type ClassSlotCancellationReason = (typeof CANCELLATION_REASONS)[number];
type Tx = Prisma.TransactionClient;

function instant(value: string) {
  if (!OFFSET.test(value)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  const result = new Date(value);
  if (Number.isNaN(result.getTime()))
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  return result;
}

function decodeCursor(value?: string): { at: Date; id: string } | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString()) as {
      at: string;
      id: string;
    };
    if (!UUID.test(parsed.id)) throw new Error();
    return { at: instant(parsed.at), id: parsed.id };
  } catch {
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }
}

const encodeCursor = (at: Date, id: string) =>
  Buffer.from(JSON.stringify({ at: at.toISOString(), id })).toString('base64url');

export function classCompletionControlHash(
  bookings: Array<{
    id: string;
    status: string;
    attendance?: { id: string } | null;
  }>,
) {
  const projection = bookings
    .map((booking) => ({
      id: booking.id,
      status: booking.status,
      attended: Boolean(booking.attendance),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  return createHash('sha256').update(JSON.stringify(projection)).digest('hex');
}

@Injectable()
export class ClassSlotService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
    private readonly idempotency: IdempotencyService,
    private readonly config: RuntimeConfigService,
  ) {}

  private scope(principal: SessionPrincipal, branchId: string, capability: string) {
    if (
      !this.policy.hasCapability(principal, 'branch:all', branchId) &&
      !this.policy.hasCapability(principal, capability, branchId)
    )
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  private manage(principal: SessionPrincipal) {
    this.policy.requireCapability(principal.capabilities, 'class-slot:manage');
  }

  private view(slot: any) {
    return {
      id: slot.id,
      branchId: slot.branchId,
      classTypeId: slot.classTypeId,
      studioId: slot.studioId,
      roomId: slot.roomId ?? null,
      instructorUserId: slot.instructorId ?? null,
      instructorId: slot.instructorId ?? null,
      startAt: slot.startAt,
      endAt: slot.endAt,
      timezone: slot.branch?.timezone ?? 'Asia/Jakarta',
      capacity: slot.capacity,
      bookedCount: slot.bookedCount,
      minimumQuota: slot.classType?.minimumQuota ?? 1,
      status: slot.status,
      cancellationReasonCode: slot.cancellationReason ?? null,
      cancellationReason: slot.cancellationReason ?? null,
      notes: slot.notes ?? null,
      version: 1,
      branch: slot.branch,
      studio: slot.studio,
      room: slot.room,
      classType: slot.classType,
      instructor: slot.instructor,
    };
  }

  async list(
    principal: SessionPrincipal,
    input: {
      branchId?: string;
      status?: string;
      from?: string;
      until?: string;
      cursor?: string;
      includeHistorical?: boolean;
    },
  ) {
    this.policy.requireCapability(principal.capabilities, 'class-slot:read');
    if (input.branchId) {
      this.scope(principal, input.branchId, 'class-slot:read');
    }

    const from = input.from ? instant(input.from) : undefined;
    const until = input.until ? instant(input.until) : undefined;
    if (from && until && from >= until)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    const cursor = decodeCursor(input.cursor);

    const where: Prisma.SlotKelasWhereInput = {
      ...(input.branchId ? { branchId: input.branchId } : {}),
      ...(input.status
        ? { status: input.status as ClassSlotStatus }
        : !principal.capabilities.includes('class-slot:manage')
          ? { status: ClassSlotStatus.PUBLISHED }
          : {}),
      ...(from ? { endAt: { gt: from } } : {}),
      ...(until ? { startAt: { lt: until } } : {}),
      ...(cursor
        ? {
            OR: [
              { startAt: { lt: cursor.at } },
              { startAt: cursor.at, id: { lt: cursor.id } },
            ],
          }
        : {}),
    };

    const slots = await this.db.slotKelas.findMany({
      where,
      include: {
        branch: true,
        studio: true,
        room: true,
        classType: true,
        instructor: { include: { profile: true } },
      },
      orderBy: [{ startAt: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
    });

    const hasMore = slots.length > PAGE_SIZE;
    const items = slots.slice(0, PAGE_SIZE);
    const last = items.at(-1);

    return {
      items: items.map((slot) => this.view(slot)),
      page: {
        hasMore,
        nextCursor: hasMore && last ? encodeCursor(last.startAt, last.id) : null,
      },
    };
  }

  async create(
    principal: SessionPrincipal,
    input: {
      branchId: string;
      classTypeId: string;
      studioId: string;
      roomId?: string;
      instructorUserId?: string;
      startAt: string;
      endAt: string;
    },
    key: string,
    _correlationId: string,
  ) {
    this.manage(principal);
    this.validateKey(key);
    if (
      !UUID.test(input.branchId) ||
      !UUID.test(input.classTypeId) ||
      !UUID.test(input.studioId) ||
      (input.roomId && !UUID.test(input.roomId)) ||
      (input.instructorUserId && !UUID.test(input.instructorUserId))
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    const startAt = instant(input.startAt);
    const endAt = instant(input.endAt);
    if (startAt >= endAt) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    return this.execute(
      principal,
      `class-slot:create:${principal.userId}`,
      key,
      input,
      HttpStatus.CREATED,
      async (tx) => {
        this.scope(principal, input.branchId, 'class-slot:manage');
        const [branch, classType, studio, room] = await Promise.all([
          tx.cabang.findUnique({ where: { id: input.branchId } }),
          tx.jenisKelas.findUnique({ where: { id: input.classTypeId } }),
          tx.studio.findUnique({ where: { id: input.studioId } }),
          input.roomId ? tx.ruangan.findUnique({ where: { id: input.roomId } }) : null,
        ]);

        if (!branch?.active || !classType?.active || !studio?.active)
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

        const slot = await tx.slotKelas.create({
          data: {
            id: newId(),
            branchId: branch.id,
            classTypeId: classType.id,
            studioId: studio.id,
            roomId: room?.id ?? null,
            instructorId: input.instructorUserId ?? null,
            startAt,
            endAt,
            capacity: classType.defaultCapacity ?? 8,
            bookedCount: 0,
            status: ClassSlotStatus.DRAFT,
          },
          include: {
            branch: true,
            studio: true,
            room: true,
            classType: true,
            instructor: { include: { profile: true } },
          },
        });

        return this.view(slot);
      },
    );
  }

  async assign(
    principal: SessionPrincipal,
    id: string,
    input: { instructorUserId: string; expectedVersion?: number },
    key: string,
    _correlationId: string,
  ) {
    this.manage(principal);
    this.validateKey(key);
    if (!UUID.test(id) || !UUID.test(input.instructorUserId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    return this.execute(
      principal,
      `class-slot:assign:${id}`,
      key,
      input,
      HttpStatus.OK,
      async (tx) => {
        const slot = await tx.slotKelas.findUnique({ where: { id } });
        if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.scope(principal, slot.branchId, 'class-slot:manage');

        const updated = await tx.slotKelas.update({
          where: { id },
          data: { instructorId: input.instructorUserId },
          include: {
            branch: true,
            studio: true,
            room: true,
            classType: true,
            instructor: { include: { profile: true } },
          },
        });

        return this.view(updated);
      },
    );
  }

  async update(
    principal: SessionPrincipal,
    id: string,
    input: {
      classTypeId: string;
      instructorUserId?: string | null;
      startAt: string;
      endAt: string;
      expectedVersion?: number;
      reason?: string;
    },
    key: string,
    _correlationId: string,
  ) {
    this.manage(principal);
    this.validateKey(key);
    if (!UUID.test(id) || !UUID.test(input.classTypeId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    const startAt = instant(input.startAt);
    const endAt = instant(input.endAt);
    if (startAt >= endAt) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    return this.execute(
      principal,
      `class-slot:update:${id}`,
      key,
      input,
      HttpStatus.OK,
      async (tx) => {
        const slot = await tx.slotKelas.findUnique({ where: { id } });
        if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.scope(principal, slot.branchId, 'class-slot:manage');

        const updated = await tx.slotKelas.update({
          where: { id },
          data: {
            classTypeId: input.classTypeId,
            instructorId: input.instructorUserId ?? null,
            startAt,
            endAt,
            notes: input.reason ?? slot.notes,
          },
          include: {
            branch: true,
            studio: true,
            room: true,
            classType: true,
            instructor: { include: { profile: true } },
          },
        });

        return this.view(updated);
      },
    );
  }

  async publish(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion?: number },
    key: string,
    _correlationId: string,
  ) {
    this.manage(principal);
    this.validateKey(key);

    return this.execute(
      principal,
      `class-slot:publish:${id}`,
      key,
      input,
      HttpStatus.OK,
      async (tx) => {
        const slot = await tx.slotKelas.findUnique({ where: { id } });
        if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.scope(principal, slot.branchId, 'class-slot:manage');

        const updated = await tx.slotKelas.update({
          where: { id },
          data: { status: ClassSlotStatus.PUBLISHED },
          include: {
            branch: true,
            studio: true,
            room: true,
            classType: true,
            instructor: { include: { profile: true } },
          },
        });

        return this.view(updated);
      },
    );
  }

  async cancel(
    principal: SessionPrincipal,
    id: string,
    input: { reasonCode: ClassSlotCancellationReason; expectedVersion?: number },
    key: string,
    _correlationId: string,
  ) {
    this.manage(principal);
    this.validateKey(key);

    return this.execute(
      principal,
      `class-slot:cancel:${id}`,
      key,
      input,
      HttpStatus.OK,
      async (tx) => {
        const slot = await tx.slotKelas.findUnique({
          where: { id },
          include: { bookings: { where: { status: 'BOOKED' } } },
        });
        if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.scope(principal, slot.branchId, 'class-slot:manage');

        // Refund all booked members
        for (const booking of slot.bookings) {
          await tx.pemesananKelas.update({
            where: { id: booking.id },
            data: { status: 'CANCELLED', cancellationReason: input.reasonCode, cancelledAt: new Date() },
          });

          // Return session quota
          await tx.paketPelanggan.update({
            where: { id: booking.customerPackageId },
            data: {
              remainingSessions: { increment: 1 },
              usedSessions: { decrement: 1 },
              status: 'ACTIVE',
            },
          });
        }

        const updated = await tx.slotKelas.update({
          where: { id },
          data: {
            status: ClassSlotStatus.CANCELLED,
            cancellationReason: input.reasonCode,
            bookedCount: 0,
          },
          include: {
            branch: true,
            studio: true,
            room: true,
            classType: true,
            instructor: { include: { profile: true } },
          },
        });

        return this.view(updated);
      },
    );
  }

  async complete(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion?: number; controlHash?: string; reason?: string },
    key: string,
    _correlationId: string,
    now = new Date(),
  ) {
    this.validateKey(key);
    if (!UUID.test(id))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    return this.execute(
      principal,
      `class-slot:complete:${id}`,
      key,
      input,
      HttpStatus.OK,
      async (tx) => {
        const slot = await tx.slotKelas.findUnique({
          where: { id },
          include: {
            bookings: {
              include: { attendance: true },
            },
          },
        });
        if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

        // Mark bookings: if attended keep ATTENDED, else mark NO_SHOW
        for (const booking of slot.bookings) {
          if (booking.status === 'BOOKED') {
            const attended = Boolean(booking.attendance);
            await tx.pemesananKelas.update({
              where: { id: booking.id },
              data: { status: attended ? 'ATTENDED' : 'NO_SHOW' },
            });
          }

          // Revoke active checkin tokens
          await tx.checkInToken.updateMany({
            where: { bookingId: booking.id, isUsed: false },
            data: { isUsed: true },
          });
        }

        const updated = await tx.slotKelas.update({
          where: { id },
          data: { status: ClassSlotStatus.COMPLETED },
          include: {
            branch: true,
            studio: true,
            room: true,
            classType: true,
            instructor: { include: { profile: true } },
          },
        });

        return this.view(updated);
      },
    );
  }

  async completionControl(principal: SessionPrincipal, id: string) {
    if (!UUID.test(id)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const slot = await this.db.slotKelas.findUnique({ where: { id } });
    if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const bookings = await this.db.pemesananKelas.findMany({
      where: { classSlotId: id },
      orderBy: { id: 'asc' },
      include: { attendance: { select: { id: true } } },
    });

    return {
      classSlotId: id,
      expectedVersion: 1,
      controlHash: classCompletionControlHash(bookings),
      attendanceCount: bookings.filter((b) => Boolean(b.attendance)).length,
      noShowCount: bookings.filter((b) => b.status === 'BOOKED' && !b.attendance).length,
      activeReservationCount: bookings.filter((b) => b.status === 'BOOKED' || b.status === 'ATTENDED').length,
    };
  }

  private validateKey(key: string) {
    if (!key || key.length < 16 || key.length > 128)
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }

  private execute(
    _principal: SessionPrincipal,
    scope: string,
    key: string,
    payload: unknown,
    status: number,
    action: (tx: Tx) => Promise<object>,
  ) {
    return this.idempotency
      .execute(
        {
          scope,
          key,
          payload,
          ttlMs: 86400000,
          leaseMs: 30000,
        },
        async (tx) => {
          const body = await action(tx);
          return { status, body: body as unknown as Prisma.InputJsonValue };
        },
      )
      .then((res) => ({ status: res.status, body: res.body as any, replay: res.replay }));
  }

  // --- Indonesian Domain Aliases ---
  async daftarSlot(principal: SessionPrincipal, query: Parameters<ClassSlotService['list']>[1]) {
    return this.list(principal, query);
  }

  async buatSlot(
    principal: SessionPrincipal,
    input: Parameters<ClassSlotService['create']>[1],
    key: string,
    correlationId: string,
  ) {
    return this.create(principal, input, key, correlationId);
  }

  async perbaruiSlot(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<ClassSlotService['update']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.update(principal, id, input, key, correlationId);
  }

  async publikasikanSlot(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<ClassSlotService['publish']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.publish(principal, id, input, key, correlationId);
  }

  async batalkanSlot(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<ClassSlotService['cancel']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.cancel(principal, id, input, key, correlationId);
  }

  async selesaikanKelas(
    principal: SessionPrincipal,
    id: string,
    input: Parameters<ClassSlotService['complete']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.complete(principal, id, input, key, correlationId);
  }
}
