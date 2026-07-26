import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import type { SessionPrincipal } from '../identity/identity.service';
import { PolicyService } from '../identity/policy.service';
import { ApiProblem } from '../identity/security';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const RAW_TOKEN = /^[A-Za-z0-9_-]{43}$/u;
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

export type CheckInWindowState = 'TOO_EARLY' | 'OPEN' | 'EXPIRED';

export function checkInWindowState(startAt: Date, endAt: Date, now: Date): CheckInWindowState {
  const opensAt = new Date(startAt.getTime() - 30 * 60_000);
  if (now < opensAt) return 'TOO_EARLY';
  return now < endAt ? 'OPEN' : 'EXPIRED';
}

function rawTokenFrom(value: string): string {
  const trimmed = value.trim();
  if (RAW_TOKEN.test(trimmed)) return trimmed;
  if (trimmed.startsWith('dd-checkin:v1:')) {
    const token = trimmed.slice('dd-checkin:v1:'.length);
    if (RAW_TOKEN.test(token)) return token;
  }
  // Compatibility for passes issued by the pre-release QR prototype.
  if (trimmed.startsWith('ddcheckin:v1:'))
    return rawTokenFrom(trimmed.replace('ddcheckin:', 'dd-checkin:'));
  try {
    const url = new URL(trimmed);
    const token = new URLSearchParams(url.hash.slice(1)).get('token') ?? '';
    const decoded = decodeURIComponent(token);
    if (decoded.startsWith('dd-checkin:v1:') || decoded.startsWith('ddcheckin:v1:'))
      return rawTokenFrom(decoded);
    if (RAW_TOKEN.test(decoded)) return decoded;
  } catch {
    // The same safe validation error is returned for every malformed representation.
  }
  throw new ApiProblem('CHECK_IN_TOKEN_INVALID', HttpStatus.UNPROCESSABLE_ENTITY);
}

function maskedPhone(phone: string | null) {
  if (!phone) return null;
  return `${phone.slice(0, 4)}••••${phone.slice(-3)}`;
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly db: PrismaService,
    private readonly policy: PolicyService,
  ) {}

  private requireBranch(principal: SessionPrincipal, branchId: string) {
    if (!principal.capabilities.includes('branch:all') && !principal.branchIds.includes(branchId))
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  private tokenStatus(token: {
    status: 'ACTIVE' | 'USED' | 'REVOKED';
    expiresAt: Date;
    usedAt: Date | null;
    revokedAt: Date | null;
  }) {
    if (token.status === 'USED') return 'USED';
    if (token.status === 'REVOKED') return 'REVOKED';
    return token.expiresAt <= new Date() ? 'EXPIRED' : 'ACTIVE';
  }

  private issuanceView(
    token: {
      id: string;
      bookingId: string;
      notBeforeAt: Date;
      expiresAt: Date;
      status: 'ACTIVE' | 'USED' | 'REVOKED';
      version: number;
    },
    booking: {
      customer: { displayName: string; phoneE164: string | null };
      classSlot: { startAt: Date; endAt: Date; timezone: string };
    },
    rawToken?: string,
    replay = false,
  ) {
    const payload = rawToken ? `dd-checkin:v1:${rawToken}` : null;
    const base = (process.env.PUBLIC_WEB_BASE_URL ?? 'http://127.0.0.1:32120').replace(/\/$/u, '');
    const passUrl = payload ? `${base}/check-in-pass#token=${encodeURIComponent(payload)}` : null;
    const schedule = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: booking.classSlot.timezone,
    }).format(booking.classSlot.startAt);
    const message = passUrl
      ? `Halo ${booking.customer.displayName}, berikut QR check-in Daily Dose untuk kelas ${schedule}. Buka pass ini saat tiba di studio: ${passUrl}`
      : null;
    const digits = booking.customer.phoneE164?.replace(/\D/gu, '') ?? '';
    return {
      id: token.id,
      purpose: 'CUSTOMER_CHECK_IN' as const,
      bookingId: token.bookingId,
      notBeforeAt: token.notBeforeAt.toISOString(),
      expiresAt: token.expiresAt.toISOString(),
      status: token.status,
      version: token.version,
      token: rawToken ?? null,
      qrPayload: payload,
      passUrl,
      maskedCustomerPhone: maskedPhone(booking.customer.phoneE164),
      whatsappUrl:
        digits && message ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null,
      message,
      idempotentReplay: replay,
    };
  }

  async issue(
    principal: SessionPrincipal,
    bookingId: string,
    input: { expectedVersion: number },
    idempotencyKey: string,
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'attendance:manage');
    if (
      !UUID.test(bookingId) ||
      !idempotencyKey?.trim() ||
      !Number.isInteger(input.expectedVersion) ||
      input.expectedVersion < 0
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const idempotencyKeyHash = sha256(idempotencyKey);
    const requestHash = sha256(
      JSON.stringify({ bookingId, expectedVersion: input.expectedVersion }),
    );

    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`Booking\` WHERE \`id\` = ${bookingId} FOR UPDATE`;
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: {
            customer: { select: { displayName: true, phoneE164: true } },
            classSlot: {
              include: {
                classType: { select: { name: true } },
                branch: { select: { code: true, name: true } },
              },
            },
          },
        });
        if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.requireBranch(principal, booking.branchId);

        const replay = await tx.checkInToken.findUnique({
          where: {
            issuedById_idempotencyKeyHash: {
              issuedById: principal.userId,
              idempotencyKeyHash,
            },
          },
        });
        if (replay) {
          if (replay.requestHash !== requestHash)
            throw new ApiProblem('IDEMPOTENCY_KEY_REUSED', HttpStatus.CONFLICT);
          return this.issuanceView(replay, booking, undefined, true);
        }
        if (booking.version !== input.expectedVersion)
          throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
        if (booking.status !== 'BOOKED' || booking.classSlot.status !== 'CONFIRMED')
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        if (booking.classSlot.endAt <= new Date())
          throw new ApiProblem('CHECK_IN_WINDOW_CLOSED', HttpStatus.GONE);

        await tx.checkInToken.updateMany({
          where: { bookingId, status: 'ACTIVE' },
          data: {
            status: 'REVOKED',
            activeBookingKey: null,
            revokedAt: new Date(),
            version: { increment: 1 },
          },
        });
        const rawToken = randomBytes(32).toString('base64url');
        const token = await tx.checkInToken.create({
          data: {
            id: randomUUID(),
            bookingId,
            issuedById: principal.userId,
            tokenHash: sha256(rawToken),
            activeBookingKey: bookingId,
            idempotencyKeyHash,
            requestHash,
            notBeforeAt: new Date(booking.classSlot.startAt.getTime() - 30 * 60_000),
            expiresAt: booking.classSlot.endAt,
          },
        });
        await tx.auditLog.create({
          data: {
            id: randomUUID(),
            actorType: 'USER',
            actorId: principal.userId,
            branchId: booking.branchId,
            action: 'attendance.customer_token_issued',
            objectType: 'CheckInToken',
            objectId: token.id,
            targetUserId: booking.customerUserId,
            correlationId,
            afterMasked: {
              bookingId,
              expiresAt: token.expiresAt.toISOString(),
              phoneAvailable: Boolean(booking.customer.phoneE164),
            },
          },
        });
        return this.issuanceView(token, booking, rawToken);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async issueBulk(
    principal: SessionPrincipal,
    classSlotId: string,
    input: { bookingIds?: string[] },
    idempotencyKey: string,
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'attendance:manage');
    if (!UUID.test(classSlotId) || !idempotencyKey?.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    if (
      input.bookingIds?.some((bookingId) => !UUID.test(bookingId)) ||
      (input.bookingIds && new Set(input.bookingIds).size !== input.bookingIds.length)
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const classSlot = await this.db.classSlot.findUnique({
      where: { id: classSlotId },
      select: { branchId: true },
    });
    if (!classSlot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.requireBranch(principal, classSlot.branchId);
    const bookings = await this.db.booking.findMany({
      where: {
        classSlotId,
        status: 'BOOKED',
        ...(input.bookingIds?.length ? { id: { in: input.bookingIds } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, version: true },
    });
    const items = [];
    for (const booking of bookings) {
      try {
        items.push({
          bookingId: booking.id,
          ok: true,
          result: await this.issue(
            principal,
            booking.id,
            { expectedVersion: booking.version },
            `${idempotencyKey}:${booking.id}`,
            correlationId,
          ),
        });
      } catch (error) {
        items.push({
          bookingId: booking.id,
          ok: false,
          errorCode: error instanceof ApiProblem ? error.code : 'CHECK_IN_ISSUANCE_FAILED',
        });
      }
    }
    return { classSlotId, items };
  }

  async status(principal: SessionPrincipal, id: string) {
    this.policy.requireCapability(principal.capabilities, 'attendance:read');
    if (!UUID.test(id)) throw new ApiProblem('VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
    const token = await this.db.checkInToken.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: { select: { displayName: true } },
            classSlot: {
              include: {
                classType: { select: { name: true } },
                branch: { select: { code: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!token) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.requireBranch(principal, token.booking.branchId);
    return {
      id: token.id,
      purpose: token.purpose,
      resourceType: 'BOOKING',
      resourceId: token.bookingId,
      notBeforeAt: token.notBeforeAt.toISOString(),
      expiresAt: token.expiresAt.toISOString(),
      usedAt: token.usedAt?.toISOString() ?? null,
      revokedAt: token.revokedAt?.toISOString() ?? null,
      status: this.tokenStatus(token),
      version: token.version,
      customerName: token.booking.customer.displayName,
      className: token.booking.classSlot.classType.name,
      branch: token.booking.classSlot.branch,
      startAt: token.booking.classSlot.startAt.toISOString(),
      endAt: token.booking.classSlot.endAt.toISOString(),
    };
  }

  async revoke(
    principal: SessionPrincipal,
    id: string,
    input: { expectedVersion: number; reason: string },
    correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'attendance:manage');
    if (
      !UUID.test(id) ||
      !Number.isInteger(input.expectedVersion) ||
      input.expectedVersion < 0 ||
      input.reason?.trim().length < 3
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const token = await this.db.checkInToken.findUnique({
      where: { id },
      include: { booking: { select: { branchId: true, customerUserId: true } } },
    });
    if (!token) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.requireBranch(principal, token.booking.branchId);
    if (token.status !== 'ACTIVE')
      throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
    const claimed = await this.db.checkInToken.updateMany({
      where: { id, version: input.expectedVersion, status: 'ACTIVE' },
      data: {
        status: 'REVOKED',
        activeBookingKey: null,
        revokedAt: new Date(),
        version: { increment: 1 },
      },
    });
    if (claimed.count !== 1) throw new ApiProblem('STALE_VERSION', HttpStatus.CONFLICT);
    await this.db.auditLog.create({
      data: {
        id: randomUUID(),
        actorType: 'USER',
        actorId: principal.userId,
        branchId: token.booking.branchId,
        action: 'attendance.customer_token_revoked',
        objectType: 'CheckInToken',
        objectId: id,
        targetUserId: token.booking.customerUserId,
        correlationId,
        afterMasked: { reasonPresent: true },
      },
    });
    return this.status(principal, id);
  }

  async consume(
    principal: SessionPrincipal,
    input: { token: string },
    idempotencyKey: string,
    correlationId: string,
    now = new Date(),
  ) {
    this.policy.requireCapability(principal.capabilities, 'attendance:manage');
    if (!idempotencyKey?.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const rawToken = rawTokenFrom(input.token);
    const tokenHash = sha256(rawToken);
    return this.db.$transaction(
      async (tx) => {
        const rows = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT \`id\` FROM \`CheckInToken\` WHERE \`tokenHash\` = ${tokenHash} FOR UPDATE
        `;
        const id = rows[0]?.id;
        if (!id) throw new ApiProblem('CHECK_IN_TOKEN_INVALID', HttpStatus.NOT_FOUND);
        const token = await tx.checkInToken.findUnique({
          where: { id },
          include: {
            attendance: true,
            booking: {
              include: {
                customer: { select: { displayName: true } },
                classSlot: {
                  include: {
                    classType: { select: { name: true } },
                    branch: { select: { code: true, name: true } },
                  },
                },
              },
            },
          },
        });
        if (!token) throw new ApiProblem('CHECK_IN_TOKEN_INVALID', HttpStatus.NOT_FOUND);
        this.requireBranch(principal, token.booking.branchId);
        if (token.status === 'USED' && token.attendance)
          return this.attendanceView(token, token.attendance, true);
        if (token.status === 'REVOKED')
          throw new ApiProblem('CHECK_IN_TOKEN_REVOKED', HttpStatus.GONE);
        const window = checkInWindowState(
          token.booking.classSlot.startAt,
          token.booking.classSlot.endAt,
          now,
        );
        if (window === 'TOO_EARLY') throw new ApiProblem('CHECK_IN_TOO_EARLY', HttpStatus.CONFLICT);
        if (window === 'EXPIRED' || token.expiresAt <= now)
          throw new ApiProblem('CHECK_IN_WINDOW_CLOSED', HttpStatus.GONE);
        if (
          token.booking.status !== 'BOOKED' ||
          token.booking.classSlot.status !== 'CONFIRMED' ||
          token.activeBookingKey !== token.bookingId
        )
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);

        const auditLogId = randomUUID();
        const attendance = await tx.customerAttendance.create({
          data: {
            id: randomUUID(),
            bookingId: token.bookingId,
            tokenId: token.id,
            branchId: token.booking.branchId,
            classSlotId: token.booking.classSlotId,
            recordedById: principal.userId,
            checkedInAt: now,
            auditLogId,
          },
        });
        const bookingClaim = await tx.booking.updateMany({
          where: { id: token.bookingId, status: 'BOOKED' },
          data: { status: 'ATTENDED', version: { increment: 1 } },
        });
        if (bookingClaim.count !== 1)
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        await tx.checkInToken.update({
          where: { id: token.id },
          data: {
            status: 'USED',
            activeBookingKey: null,
            usedAt: now,
            version: { increment: 1 },
          },
        });
        await tx.auditLog.create({
          data: {
            id: auditLogId,
            actorType: 'USER',
            actorId: principal.userId,
            branchId: token.booking.branchId,
            action: 'attendance.customer_checked_in',
            objectType: 'CustomerAttendance',
            objectId: attendance.id,
            targetUserId: token.booking.customerUserId,
            correlationId,
            afterMasked: {
              bookingId: token.bookingId,
              classSlotId: token.booking.classSlotId,
              source: 'QR',
            },
          },
        });
        await tx.outboxEvent.create({
          data: {
            id: randomUUID(),
            eventType: 'check_in.customer.v1',
            aggregateType: 'Booking',
            aggregateId: token.bookingId,
            payload: {
              attendanceId: attendance.id,
              bookingId: token.bookingId,
              branchId: token.booking.branchId,
              classSlotId: token.booking.classSlotId,
            },
            correlationId,
          },
        });
        return this.attendanceView(token, attendance, false);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  private attendanceView(
    token: {
      bookingId: string;
      booking: {
        customer: { displayName: string };
        classSlot: {
          startAt: Date;
          endAt: Date;
          classType: { name: string };
          branch: { code: string; name: string };
        };
      };
    },
    attendance: { id: string; checkedInAt: Date; auditLogId: string },
    replay: boolean,
  ) {
    return {
      id: attendance.id,
      purpose: 'CUSTOMER_CHECK_IN',
      resourceId: token.bookingId,
      status: 'CHECKED_IN',
      checkedInAt: attendance.checkedInAt.toISOString(),
      auditLogId: attendance.auditLogId,
      auditReference: attendance.auditLogId,
      idempotentReplay: replay,
      customerName: token.booking.customer.displayName,
      className: token.booking.classSlot.classType.name,
      branch: token.booking.classSlot.branch,
      startAt: token.booking.classSlot.startAt.toISOString(),
      endAt: token.booking.classSlot.endAt.toISOString(),
    };
  }
}
