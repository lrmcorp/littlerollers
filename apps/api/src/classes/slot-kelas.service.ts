import { HttpStatus, Injectable } from '@nestjs/common';
import { ClassSlotStatus, Prisma, SessionMutationType } from '@prisma/client';
import { createHash } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem, ENTITY_ID_REGEX, newId } from '../identity/security';

const UUID = ENTITY_ID_REGEX;
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

  /**
   * Selesaikan kelas: staf dengan `class-slot:manage` (dan branch scope), ATAU instruktur pemilik
   * slot ini dengan `attendance:self` (Aturan #1 — instruktur menandai kelasnya sendiri selesai).
   */
  private authorizeCompletion(principal: SessionPrincipal, slot: { instructorId: string | null; branchId: string }) {
    const isOwningInstructor =
      principal.capabilities.includes('attendance:self') &&
      slot.instructorId !== null &&
      slot.instructorId === principal.userId;
    if (isOwningInstructor) return;
    this.manage(principal);
    this.scope(principal, slot.branchId, 'class-slot:manage');
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
      limit?: number;
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
    const limit = Math.min(Math.max(1, Number(input.limit ?? PAGE_SIZE)), 500);

    // Instruktur/coach (`class:assigned:read`) tetap harus melihat kelasnya sendiri di status apa
    // pun (CONFIRMED untuk diselesaikan, dsb) — hanya customer murni yang dibatasi ke PUBLISHED.
    const canSeeAllStatuses =
      principal.capabilities.includes('class-slot:manage') ||
      principal.capabilities.includes('class:assigned:read');
    const where: Prisma.SlotKelasWhereInput = {
      ...(input.branchId ? { branchId: input.branchId } : {}),
      ...(input.status
        ? { status: input.status as ClassSlotStatus }
        : !canSeeAllStatuses
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

    const isCalendarWindow = Boolean(from && until && !cursor);
    const orderBy: Prisma.SlotKelasOrderByWithRelationInput[] = isCalendarWindow
      ? [{ startAt: 'asc' }, { id: 'asc' }]
      : [{ startAt: 'desc' }, { id: 'desc' }];

    const slots = await this.db.slotKelas.findMany({
      where,
      include: {
        branch: true,
        studio: true,
        room: true,
        classType: true,
        instructor: { include: { profile: true } },
      },
      orderBy,
      take: limit + 1,
    });

    const hasMore = slots.length > limit;
    const items = slots.slice(0, limit);
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

        const collisionConditions: Prisma.SlotKelasWhereInput[] = [];
        if (room?.id) {
          collisionConditions.push({ studioId: studio.id, roomId: room.id });
        } else {
          collisionConditions.push({ studioId: studio.id });
        }
        if (input.instructorUserId) {
          collisionConditions.push({ instructorId: input.instructorUserId });
        }

        const collision = await tx.slotKelas.findFirst({
          where: {
            status: { not: ClassSlotStatus.CANCELLED },
            startAt: { lt: endAt },
            endAt: { gt: startAt },
            OR: collisionConditions,
          },
        });
        if (collision) {
          throw new ApiProblem('SLOT_SCHEDULE_COLLISION', HttpStatus.CONFLICT);
        }

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
            capacity: (input as any).capacity ?? classType.defaultCapacity ?? 8,
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

        const instructorCollision = await tx.slotKelas.findFirst({
          where: {
            id: { not: slot.id },
            instructorId: input.instructorUserId,
            status: { not: ClassSlotStatus.CANCELLED },
            startAt: { lt: slot.endAt },
            endAt: { gt: slot.startAt },
          },
        });
        if (instructorCollision) {
          throw new ApiProblem('SLOT_SCHEDULE_COLLISION', HttpStatus.CONFLICT);
        }

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

        const targetInstructorId = input.instructorUserId !== undefined ? input.instructorUserId : slot.instructorId;
        const updateCollisionConditions: Prisma.SlotKelasWhereInput[] = [];
        if (slot.roomId) {
          updateCollisionConditions.push({ studioId: slot.studioId, roomId: slot.roomId });
        } else {
          updateCollisionConditions.push({ studioId: slot.studioId });
        }
        if (targetInstructorId) {
          updateCollisionConditions.push({ instructorId: targetInstructorId });
        }

        const updateCollision = await tx.slotKelas.findFirst({
          where: {
            id: { not: slot.id },
            status: { not: ClassSlotStatus.CANCELLED },
            startAt: { lt: endAt },
            endAt: { gt: startAt },
            OR: updateCollisionConditions,
          },
        });
        if (updateCollision) {
          throw new ApiProblem('SLOT_SCHEDULE_COLLISION', HttpStatus.CONFLICT);
        }

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

          // Rule #1: Sesi tidak dipotong saat booking, kuota virtual dipulihkan otomatis saat booking CANCELLED.
          // Audit integritas saldo paket:
          if (booking.customerPackageId) {
            const customerPkg = await tx.paketPelanggan.findUnique({
              where: { id: booking.customerPackageId },
            });
            if (customerPkg) {
              await tx.sessionLedger.create({
                data: {
                  customerPackageId: booking.customerPackageId,
                  type: SessionMutationType.REFUND_AUTOCANCEL,
                  amount: 0, // Saldo tidak terpotong di muka pada Rule #1, dicatat untuk audit trail
                  balanceAfter: customerPkg.remainingSessions,
                  referenceId: booking.id,
                  notes: `Manual cancel kelas slot: ${input.reasonCode}`,
                },
              });
            }
          }
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
            branch: true,
            classType: true,
            bookings: {
              include: { attendance: true, customerPackage: true },
            },
          },
        });
        if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.authorizeCompletion(principal, slot);

        const tally = (bookings: Array<{ status: string }>) =>
          bookings.reduce(
            (acc, booking) => {
              if (booking.status === 'ATTENDED') acc.attendanceCount += 1;
              else if (booking.status === 'NO_SHOW') acc.noShowCount += 1;
              return acc;
            },
            { attendanceCount: 0, noShowCount: 0 },
          );

        // Jika slot sudah pernah COMPLETED, return view (idempotent guard)
        if (slot.status === ClassSlotStatus.COMPLETED) {
          return { ...this.view(slot), ...tally(slot.bookings) };
        }

        // Atomic lock guard: update status ke COMPLETED terlebih dahulu untuk mengunci baris secara eksklusif di MySQL
        const lockResult = await tx.slotKelas.updateMany({
          where: { id, status: { not: ClassSlotStatus.COMPLETED } },
          data: { status: ClassSlotStatus.COMPLETED },
        });

        if (lockResult.count === 0) {
          // Sudah diselesaikan secara bersamaan oleh request paralel lain
          const currentSlot = await tx.slotKelas.findUniqueOrThrow({
            where: { id },
            include: {
              branch: true,
              studio: true,
              room: true,
              classType: true,
              instructor: { include: { profile: true } },
              bookings: true,
            },
          });
          return { ...this.view(currentSlot), ...tally(currentSlot.bookings) };
        }

        // Evaluasi kehadiran & potong sesi bagi customer yang ATTENDED (Rule #1)
        let attendanceCount = 0;
        let noShowCount = 0;
        for (const booking of slot.bookings) {
          const wasAttended = booking.status === 'ATTENDED' || Boolean(booking.attendance);
          const newStatus = wasAttended ? 'ATTENDED' : 'NO_SHOW';
          if (wasAttended) attendanceCount += 1;
          else noShowCount += 1;

          if (booking.status !== newStatus) {
            await tx.pemesananKelas.update({
              where: { id: booking.id },
              data: { status: newStatus },
            });
          }

          // Rule #1 & Kebijakan No-Show: Sesi terpotong saat kelas COMPLETED baik hadir maupun mangkir
          const existingLedger = await tx.sessionLedger.findFirst({
            where: {
              referenceId: booking.id,
              type: SessionMutationType.ATTEND,
            },
          });

          if (!existingLedger && booking.customerPackageId) {
            const customerPackage = await tx.paketPelanggan.findUnique({
              where: { id: booking.customerPackageId },
            });

            if (customerPackage) {
              const remainingAfter = Math.max(0, customerPackage.remainingSessions - 1);
              const noteText = wasAttended
                ? `Class session completed: ${slot.classType?.name ?? 'Class'} at ${slot.branch?.name ?? 'Studio'}`
                : `Sesi hangus (NO SHOW): Mangkir tanpa pembatalan resmi kelas ${slot.classType?.name ?? 'Class'} di ${slot.branch?.name ?? 'Studio'}`;

              // Catat mutasi SessionLedger
              await tx.sessionLedger.create({
                data: {
                  customerPackageId: customerPackage.id,
                  type: SessionMutationType.ATTEND,
                  amount: -1,
                  balanceAfter: remainingAfter,
                  referenceId: booking.id,
                  notes: noteText,
                  createdById: principal.userId,
                },
              });

              // Update saldo kuota di PaketPelanggan
              await tx.paketPelanggan.update({
                where: { id: customerPackage.id },
                data: {
                  usedSessions: { increment: 1 },
                  remainingSessions: { decrement: 1 },
                  status: remainingAfter <= 0 ? 'DEPLETED' : customerPackage.status,
                },
              });
            }
          }

          // Revoke active checkin tokens
          await tx.checkInToken.updateMany({
            where: { bookingId: booking.id, isUsed: false },
            data: { isUsed: true },
          });
        }

        const updated = await tx.slotKelas.findUniqueOrThrow({
          where: { id },
          include: {
            branch: true,
            studio: true,
            room: true,
            classType: true,
            instructor: { include: { profile: true } },
          },
        });

        return { ...this.view(updated), attendanceCount, noShowCount };
      },
    );
  }

  async completionControl(principal: SessionPrincipal, id: string) {
    if (!UUID.test(id)) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    const slot = await this.db.slotKelas.findUnique({ where: { id } });
    if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.authorizeCompletion(principal, slot);

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
