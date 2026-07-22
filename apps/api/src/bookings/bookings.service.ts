import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, type BookingStatus } from '@prisma/client';
import { createHash, randomUUID } from 'node:crypto';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';

export type BookingCommand = {
  classSlotId: string;
  customerPackageId: string;
  customerUserId?: string;
  source: 'SELF' | 'ADMIN_ASSISTED';
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 20;
type Cursor = { at: string; id: string };
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

function encodeCursor(at: Date, id: string) {
  return Buffer.from(JSON.stringify({ at: at.toISOString(), id })).toString('base64url');
}

function decodeCursor(value?: string): Cursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Cursor;
    if (!UUID.test(parsed.id) || Number.isNaN(Date.parse(parsed.at))) throw new Error('invalid');
    return parsed;
  } catch {
    throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly db: PrismaService,
    private readonly idempotency: IdempotencyService,
    private readonly policy: PolicyService,
    private readonly config: RuntimeConfigService,
  ) {}

  private syntheticPolicy() {
    const { syntheticEnabled, cutoffHours } = this.config.value.booking;
    if (!syntheticEnabled || cutoffHours === null)
      throw new ApiProblem('CONFIGURATION_REQUIRED', HttpStatus.SERVICE_UNAVAILABLE);
    return { cutoffHours };
  }

  private isCustomer(principal: SessionPrincipal) {
    return (
      principal.capabilities.includes('booking:self:create') &&
      !principal.capabilities.includes('booking:create:assisted')
    );
  }

  private requireBranch(principal: SessionPrincipal, branchId: string) {
    if (!principal.capabilities.includes('branch:all') && !principal.branchIds.includes(branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  async list(
    principal: SessionPrincipal,
    query: { branchId?: string; status?: string; cursor?: string },
  ) {
    const customer = this.isCustomer(principal);
    this.policy.requireCapability(
      principal.capabilities,
      customer ? 'booking:self:read' : 'booking:read',
    );
    const statuses: BookingStatus[] = [
      'BOOKED',
      'RESCHEDULE_PENDING',
      'CANCELLED',
      'ATTENDED',
      'NO_SHOW',
    ];
    if (query.status && !statuses.includes(query.status as BookingStatus))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    if (query.branchId && !customer) this.requireBranch(principal, query.branchId);
    const cursor = decodeCursor(query.cursor);
    const items = await this.db.booking.findMany({
      where: {
        ...(customer ? { customerUserId: principal.userId } : {}),
        ...(query.branchId
          ? { branchId: query.branchId }
          : customer || principal.capabilities.includes('branch:all')
            ? {}
            : { branchId: { in: principal.branchIds } }),
        ...(query.status ? { status: query.status as BookingStatus } : {}),
        ...(cursor
          ? {
              OR: [
                { createdAt: { lt: new Date(cursor.at) } },
                { createdAt: new Date(cursor.at), id: { lt: cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: PAGE_SIZE + 1,
    });
    const hasMore = items.length > PAGE_SIZE;
    const pageItems = items.slice(0, PAGE_SIZE);
    const last = pageItems.at(-1);
    return {
      items: pageItems.map((item) => ({ ...item, idempotentReplay: false })),
      page: { hasMore, nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null },
    };
  }

  async create(
    principal: SessionPrincipal,
    input: BookingCommand,
    key: string,
    correlationId: string,
  ) {
    const customerFlow = input.source === 'SELF';
    if (
      !key ||
      !UUID.test(input.classSlotId) ||
      !UUID.test(input.customerPackageId) ||
      !['SELF', 'ADMIN_ASSISTED'].includes(input.source) ||
      (customerFlow && input.customerUserId && input.customerUserId !== principal.userId) ||
      (!customerFlow && (!input.customerUserId || !UUID.test(input.customerUserId)))
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);

    this.policy.requireCapability(
      principal.capabilities,
      customerFlow ? 'booking:self:create' : 'booking:create:assisted',
    );
    const customerUserId = customerFlow ? principal.userId : input.customerUserId!;
    const policy = this.syntheticPolicy();

    return this.idempotency
      .execute(
        {
          scope: `booking-create:${principal.userId}`,
          key,
          payload: { ...input, customerUserId },
          ttlMs: 86_400_000,
          leaseMs: 30_000,
        },
        async (tx) => {
          await tx.$queryRaw`SELECT "id" FROM "ClassSlot" WHERE "id" = ${input.classSlotId}::uuid FOR UPDATE`;
          const slot = await tx.classSlot.findUnique({ where: { id: input.classSlotId } });
          if (!slot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          if (!customerFlow) this.requireBranch(principal, slot.branchId);

          await tx.$queryRaw`SELECT "id" FROM "CustomerPackage" WHERE "id" = ${input.customerPackageId}::uuid FOR UPDATE`;
          const [customerPackage, customer] = await Promise.all([
            tx.customerPackage.findUnique({ where: { id: input.customerPackageId } }),
            tx.user.findUnique({ where: { id: customerUserId } }),
          ]);
          if (!customerPackage || !customer || customer.status !== 'ACTIVE')
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          if (
            customerPackage.customerUserId !== customerUserId ||
            customerPackage.branchId !== slot.branchId ||
            customerPackage.classTypeId !== slot.classTypeId
          )
            throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
          if (customerPackage.status !== 'ACTIVE' || customerPackage.expiryAt <= new Date())
            throw new ApiProblem('INSUFFICIENT_AVAILABLE_SESSIONS', HttpStatus.CONFLICT);
          if (!['PUBLISHED', 'CONFIRMED'].includes(slot.status))
            throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
          const now = new Date();
          if (slot.startAt <= now)
            throw new ApiProblem('BOOKING_CUTOFF_PASSED', HttpStatus.CONFLICT);
          const cutoffAt = new Date(slot.startAt.getTime() - policy.cutoffHours * 3_600_000);
          if (now >= cutoffAt) throw new ApiProblem('BOOKING_CUTOFF_PASSED', HttpStatus.CONFLICT);

          const duplicate = await tx.booking.findFirst({
            where: {
              customerUserId,
              classSlotId: slot.id,
              status: { in: ['BOOKED', 'RESCHEDULE_PENDING'] },
            },
          });
          if (duplicate) throw new ApiProblem('DUPLICATE_ACTIVE_BOOKING', HttpStatus.CONFLICT);

          const [slotReserved, packageReserved, ledger] = await Promise.all([
            tx.sessionReservation.aggregate({
              where: { classSlotId: slot.id, status: 'ACTIVE' },
              _sum: { quantity: true },
            }),
            tx.sessionReservation.aggregate({
              where: { customerPackageId: customerPackage.id, status: 'ACTIVE' },
              _sum: { quantity: true },
            }),
            tx.ledgerEntry.aggregate({
              where: { customerPackageId: customerPackage.id },
              _sum: { quantity: true },
            }),
          ]);
          const booked = slotReserved._sum.quantity ?? 0;
          const reserved = packageReserved._sum.quantity ?? 0;
          const balance = ledger._sum.quantity ?? 0;
          if (booked >= slot.capacity)
            throw new ApiProblem('CLASS_CAPACITY_FULL', HttpStatus.CONFLICT);
          if (balance < 0 || reserved > balance)
            throw new ApiProblem('LEDGER_INVARIANT_VIOLATION', HttpStatus.CONFLICT);
          if (balance - reserved < 1)
            throw new ApiProblem('INSUFFICIENT_AVAILABLE_SESSIONS', HttpStatus.CONFLICT);

          const reservationId = randomUUID();
          const bookingId = randomUUID();
          await tx.sessionReservation.create({
            data: {
              id: reservationId,
              customerPackageId: customerPackage.id,
              classSlotId: slot.id,
              referenceHash: hash(`booking:${bookingId}`),
              quantity: 1,
            },
          });
          const booking = await tx.booking.create({
            data: {
              id: bookingId,
              branchId: slot.branchId,
              classSlotId: slot.id,
              customerUserId,
              customerPackageId: customerPackage.id,
              reservationId,
              createdById: principal.userId,
              source: input.source,
            },
          });
          await tx.classSlot.update({
            where: { id: slot.id },
            data: { bookedCount: booked + 1 },
          });
          await Promise.all([
            tx.auditLog.create({
              data: {
                id: randomUUID(),
                actorType: 'USER',
                actorId: principal.userId,
                branchId: slot.branchId,
                action: 'booking.created',
                objectType: 'Booking',
                objectId: booking.id,
                correlationId,
                afterMasked: { status: 'BOOKED', source: input.source, reservedQuantity: 1 },
              },
            }),
            tx.outboxEvent.create({
              data: {
                id: randomUUID(),
                eventType: 'booking.created.v1',
                aggregateType: 'Booking',
                aggregateId: booking.id,
                correlationId,
                payload: { bookingId: booking.id, classSlotId: slot.id, branchId: slot.branchId },
              },
            }),
          ]);
          return { status: HttpStatus.CREATED, body: booking as unknown as Prisma.InputJsonValue };
        },
      )
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
          throw new ApiProblem('DUPLICATE_ACTIVE_BOOKING', HttpStatus.CONFLICT);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')
          throw new ApiProblem('CONFLICT', HttpStatus.CONFLICT);
        throw error;
      });
  }
}
