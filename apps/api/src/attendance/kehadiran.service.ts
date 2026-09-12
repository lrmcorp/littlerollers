import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import { IdempotencyService } from '../foundation/idempotency.service';
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

export function isOwningCustomer(
  principal: Pick<SessionPrincipal, 'userId' | 'roles'>,
  customerUserId: string,
): boolean {
  return (
    principal.roles.some(({ role }) => role === 'CUSTOMER') && principal.userId === customerUserId
  );
}

function rawTokenFrom(value: string): string {
  const trimmed = value.trim();
  if (RAW_TOKEN.test(trimmed)) return trimmed;
  if (trimmed.startsWith('dd-checkin:v1:')) {
    const token = trimmed.slice('dd-checkin:v1:'.length);
    if (RAW_TOKEN.test(token)) return token;
  }
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
    // invalid token format
  }
  throw new ApiProblem('CHECK_IN_TOKEN_INVALID', HttpStatus.NOT_FOUND);
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
    private readonly idempotency: IdempotencyService,
  ) {}

  private requireBranch(principal: SessionPrincipal, branchId: string, capability: string) {
    if (
      !this.policy.hasCapability(principal, 'branch:all', branchId) &&
      !this.policy.hasCapability(principal, capability, branchId)
    )
      throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
  }

  private authorizeCustomerToken(
    principal: SessionPrincipal,
    booking: { classSlot: { branchId: string }; userId: string },
    staffCapability: 'attendance:read' | 'attendance:manage',
  ) {
    if (
      principal.roles.some(({ role }) => role === 'CUSTOMER') &&
      principal.userId === booking.userId
    )
      return;
    this.policy.requireCapability(principal.capabilities, staffCapability);
    this.requireBranch(principal, booking.classSlot.branchId, staffCapability);
  }

  /** Issue a QR check-in token for a specific booking (staff action). */
  async issue(
    principal: SessionPrincipal,
    bookingId: string,
    input: { expectedVersion?: number },
    _idempotencyKey: string,
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'attendance:manage');
    if (!UUID.test(bookingId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);

    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`v2_pemesanan_kelas\` WHERE \`id\` = ${bookingId} FOR UPDATE`;
        const booking = await tx.pemesananKelas.findUnique({
          where: { id: bookingId },
          include: {
            user: { select: { displayName: true, phone: true } },
            classSlot: {
              include: {
                classType: { select: { name: true } },
                branch: { select: { id: true, code: true, name: true, timezone: true } },
              },
            },
          },
        });
        if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.requireBranch(principal, booking.classSlot.branchId, 'attendance:manage');
        if (booking.status !== 'BOOKED' || booking.classSlot.status !== 'CONFIRMED')
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        if (booking.classSlot.endAt <= new Date())
          throw new ApiProblem('CHECK_IN_WINDOW_CLOSED', HttpStatus.GONE);

        // Revoke existing active tokens for this booking
        await tx.checkInToken.updateMany({
          where: { bookingId, isUsed: false },
          data: { isUsed: true },
        });

        const rawToken = randomBytes(32).toString('base64url');
        const token = await tx.checkInToken.create({
          data: {
            id: randomUUID(),
            bookingId,
            token: sha256(rawToken),
            expiresAt: booking.classSlot.endAt,
          },
        });

        const payload = `dd-checkin:v1:${rawToken}`;
        const base = (process.env.PUBLIC_WEB_BASE_URL ?? 'http://127.0.0.1:32120').replace(/\/$/u, '');
        const passUrl = `${base}/check-in-pass#token=${encodeURIComponent(payload)}`;
        const digits = booking.user.phone?.replace(/\D/gu, '') ?? '';
        const schedule = new Intl.DateTimeFormat('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: booking.classSlot.branch.timezone,
        }).format(booking.classSlot.startAt);
        const message = `Halo ${booking.user.displayName}, berikut QR check-in Daily Dose untuk kelas ${schedule}. Buka pass ini saat tiba di studio: ${passUrl}`;

        return {
          id: token.id,
          purpose: 'CUSTOMER_CHECK_IN' as const,
          bookingId: token.bookingId,
          expiresAt: token.expiresAt.toISOString(),
          token: rawToken,
          qrPayload: payload,
          passUrl,
          maskedCustomerPhone: maskedPhone(booking.user.phone ?? null),
          whatsappUrl: digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null,
          message,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /** Issue QR tokens in bulk for all bookings in a class slot. */
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
    const classSlot = await this.db.slotKelas.findUnique({
      where: { id: classSlotId },
      select: { branchId: true },
    });
    if (!classSlot) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    this.requireBranch(principal, classSlot.branchId, 'attendance:manage');
    const bookings = await this.db.pemesananKelas.findMany({
      where: {
        classSlotId,
        status: 'BOOKED',
        ...(input.bookingIds?.length ? { id: { in: input.bookingIds } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    const items = [];
    for (const booking of bookings) {
      try {
        items.push({
          bookingId: booking.id,
          ok: true,
          result: await this.issue(principal, booking.id, {}, `${idempotencyKey}:${booking.id}`, correlationId),
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

  /** Issue a QR check-in token for an instructor for a specific class slot. */
  async issueInstructor(
    principal: SessionPrincipal,
    classSlotId: string,
    _idempotencyKey: string,
    _correlationId: string,
    now = new Date(),
  ) {
    this.policy.requireCapability(principal.capabilities, 'attendance:self');
    if (!UUID.test(classSlotId))
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`v2_slot_kelas\` WHERE \`id\` = ${classSlotId} FOR UPDATE`;
        const slot = await tx.slotKelas.findUnique({
          where: { id: classSlotId },
          include: {
            classType: { select: { name: true } },
            branch: { select: { id: true, code: true, name: true, timezone: true } },
          },
        });
        if (!slot || slot.instructorId !== principal.userId)
          throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        if (slot.status !== 'CONFIRMED')
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        if (checkInWindowState(slot.startAt, slot.endAt, now) === 'TOO_EARLY')
          throw new ApiProblem('CHECK_IN_TOO_EARLY', HttpStatus.CONFLICT);
        if (checkInWindowState(slot.startAt, slot.endAt, now) === 'EXPIRED')
          throw new ApiProblem('CHECK_IN_WINDOW_CLOSED', HttpStatus.GONE);

        const rawToken = randomBytes(32).toString('base64url');
        const targetBooking = await tx.pemesananKelas.findFirst({ where: { classSlotId } });
        let tokenId: string = randomUUID();
        let tokenExpiresAt = slot.endAt;
        if (targetBooking) {
          const token = await tx.checkInToken.create({
            data: {
              id: randomUUID(),
              bookingId: targetBooking.id,
              token: sha256(rawToken),
              expiresAt: slot.endAt,
            },
          });
          tokenId = token.id;
          tokenExpiresAt = token.expiresAt;
        }

        const payload = `dd-checkin:v1:${rawToken}`;
        const base = (process.env.PUBLIC_WEB_BASE_URL ?? 'http://127.0.0.1:32120').replace(/\/$/u, '');
        const passUrl = `${base}/check-in-pass#token=${encodeURIComponent(payload)}`;
        return {
          id: tokenId,
          purpose: 'INSTRUCTOR_CHECK_IN' as const,
          resourceType: 'CLASS_SLOT' as const,
          resourceId: classSlotId,
          expiresAt: tokenExpiresAt.toISOString(),
          token: rawToken,
          qrPayload: payload,
          passUrl,
          className: slot.classType.name,
          branch: slot.branch,
          startAt: slot.startAt.toISOString(),
          endAt: slot.endAt.toISOString(),
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /** Consume (validate and record) a customer QR check-in token. */
  async consume(
    principal: SessionPrincipal,
    input: { token: string },
    idempotencyKey: string,
    correlationId: string,
    now = new Date(),
  ) {
    if (!idempotencyKey?.trim())
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    const rawToken = rawTokenFrom(input.token);
    const tokenHash = sha256(rawToken);
    return this.db.$transaction(
      async (tx) => {
        const rows = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT \`id\` FROM \`v2_check_in_token\` WHERE \`token\` = ${tokenHash} FOR UPDATE
        `;
        const id = rows[0]?.id;
        if (!id) throw new ApiProblem('CHECK_IN_TOKEN_INVALID', HttpStatus.NOT_FOUND);
        const token = await tx.checkInToken.findUnique({
          where: { id },
          include: {
            booking: {
              include: {
                attendance: true,
                user: { select: { displayName: true } },
                classSlot: {
                  include: {
                    classType: { select: { name: true } },
                    branch: { select: { code: true, name: true, timezone: true } },
                  },
                },
              },
            },
          },
        });
        if (!token) throw new ApiProblem('CHECK_IN_TOKEN_INVALID', HttpStatus.NOT_FOUND);
        this.authorizeCustomerToken(principal, token.booking, 'attendance:manage');

        // Already checked in — return existing attendance (idempotent)
        if (token.isUsed && token.booking.attendance) {
          return this.attendanceView(token.booking, token.booking.attendance);
        }
        if (token.isUsed) throw new ApiProblem('CHECK_IN_TOKEN_REVOKED', HttpStatus.GONE);

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
          token.booking.classSlot.status !== 'CONFIRMED'
        )
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);

        const attendance = await tx.kehadiranPelanggan.create({
          data: {
            id: randomUUID(),
            bookingId: token.bookingId,
            checkedInAt: now,
          },
        });
        await tx.pemesananKelas.update({
          where: { id: token.bookingId },
          data: { status: 'ATTENDED' },
        });
        await tx.checkInToken.update({
          where: { id: token.id },
          data: { isUsed: true },
        });
        return this.attendanceView(token.booking, attendance);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /** Backfill/manual attendance recording by staff. */
  async backfillCustomer(
    principal: SessionPrincipal,
    input: { bookingId: string; reason: string; expectedVersion?: number },
    idempotencyKey: string,
    correlationId: string,
    now = new Date(),
  ) {
    this.policy.requireCapability(principal.capabilities, 'attendance:manage');
    if (
      !UUID.test(input.bookingId) ||
      !idempotencyKey ||
      idempotencyKey.length < 16 ||
      idempotencyKey.length > 128 ||
      input.reason?.trim().length < 3 ||
      input.reason.trim().length > 500
    )
      throw new ApiProblem('VALIDATION_ERROR', HttpStatus.UNPROCESSABLE_ENTITY);
    return this.idempotency.execute(
      {
        scope: `attendance:customer-backfill:${input.bookingId}`,
        key: idempotencyKey,
        payload: input,
        ttlMs: 86_400_000,
        leaseMs: 30_000,
      },
      async (tx) => {
        await tx.$queryRaw`SELECT \`id\` FROM \`v2_pemesanan_kelas\` WHERE \`id\` = ${input.bookingId} FOR UPDATE`;
        const booking = await tx.pemesananKelas.findUnique({
          where: { id: input.bookingId },
          include: {
            attendance: true,
            user: { select: { displayName: true } },
            classSlot: {
              include: {
                classType: { select: { name: true } },
                branch: { select: { code: true, name: true, timezone: true } },
              },
            },
          },
        });
        if (!booking) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
        this.requireBranch(principal, booking.classSlot.branchId, 'attendance:manage');
        if (booking.attendance)
          throw new ApiProblem('ATTENDANCE_ALREADY_RECORDED', HttpStatus.CONFLICT);
        if (!['BOOKED', 'NO_SHOW'].includes(booking.status))
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        if (!['CONFIRMED', 'COMPLETED'].includes(booking.classSlot.status))
          throw new ApiProblem('INVALID_STATE_TRANSITION', HttpStatus.CONFLICT);
        if (booking.classSlot.startAt > now)
          throw new ApiProblem('CHECK_IN_TOO_EARLY', HttpStatus.CONFLICT);

        const attendance = await tx.kehadiranPelanggan.create({
          data: {
            id: randomUUID(),
            bookingId: booking.id,
            checkedInAt: now,
          },
        });
        await tx.pemesananKelas.update({
          where: { id: booking.id },
          data: { status: 'ATTENDED' },
        });
        return {
          status: HttpStatus.CREATED,
          body: {
            id: attendance.id,
            purpose: 'CUSTOMER_BACKFILL',
            resourceId: booking.id,
            status: 'CHECKED_IN',
            checkedInAt: attendance.checkedInAt.toISOString(),
            customerName: booking.user.displayName,
            className: booking.classSlot.classType.name,
            branch: booking.classSlot.branch,
            startAt: booking.classSlot.startAt.toISOString(),
            endAt: booking.classSlot.endAt.toISOString(),
          } as Prisma.InputJsonValue,
        };
      },
    );
  }

  private attendanceView(
    booking: {
      userId: string;
      classSlotId: string;
      user: { displayName: string };
      classSlot: {
        startAt: Date;
        endAt: Date;
        classType: { name: string };
        branch: { code: string; name: string; timezone: string };
      };
    },
    attendance: { id: string; checkedInAt: Date },
  ) {
    return {
      id: attendance.id,
      purpose: 'CUSTOMER_CHECK_IN' as const,
      resourceId: booking.classSlotId,
      status: 'CHECKED_IN',
      checkedInAt: attendance.checkedInAt.toISOString(),
      customerName: booking.user.displayName,
      className: booking.classSlot.classType.name,
      branch: booking.classSlot.branch,
      startAt: booking.classSlot.startAt.toISOString(),
      endAt: booking.classSlot.endAt.toISOString(),
    };
  }

  // --- Indonesian Domain Aliases ---
  async terbitkanTokenCheckIn(
    principal: SessionPrincipal,
    bookingId: string,
    input: Parameters<AttendanceService['issue']>[2],
    key: string,
    correlationId: string,
  ) {
    return this.issue(principal, bookingId, input, key, correlationId);
  }

  async terbitkanTokenInstruktur(
    principal: SessionPrincipal,
    classSlotId: string,
    idempotencyKey: string,
    correlationId: string,
    now = new Date(),
  ) {
    return this.issueInstructor(principal, classSlotId, idempotencyKey, correlationId, now);
  }

  async catatKehadiran(
    principal: SessionPrincipal,
    input: Parameters<AttendanceService['consume']>[1],
    key: string,
    correlationId: string,
  ) {
    return this.consume(principal, input, key, correlationId);
  }

  async koreksiKehadiranPelanggan(
    principal: SessionPrincipal,
    input: Parameters<AttendanceService['backfillCustomer']>[1],
    idempotencyKey: string,
    correlationId: string,
    now = new Date(),
  ) {
    return this.backfillCustomer(principal, input, idempotencyKey, correlationId, now);
  }

  async status(principal: SessionPrincipal, id: string) {
    this.policy.requireCapability(principal.capabilities, 'attendance:manage');
    const token = await this.db.checkInToken.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: { select: { id: true, displayName: true, email: true } },
            classSlot: {
              include: {
                classType: { select: { name: true } },
                branch: { select: { id: true, code: true, name: true, timezone: true } },
              },
            },
          },
        },
      },
    });
    if (!token) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);

    const now = new Date();
    const isExpired = token.expiresAt < now;
    return {
      id: token.id,
      bookingId: token.bookingId,
      isUsed: token.isUsed,
      isExpired,
      status: token.isUsed ? 'USED' : isExpired ? 'EXPIRED' : 'ACTIVE',
      expiresAt: token.expiresAt.toISOString(),
      booking: token.booking
        ? {
            id: token.booking.id,
            userId: token.booking.userId,
            status: token.booking.status,
            userName: token.booking.user.displayName,
            className: token.booking.classSlot.classType.name,
          }
        : null,
    };
  }

  async revoke(
    principal: SessionPrincipal,
    id: string,
    _body: { expectedVersion?: number; reason?: string },
    _correlationId: string,
  ) {
    this.policy.requireCapability(principal.capabilities, 'attendance:manage');
    const token = await this.db.checkInToken.findUnique({ where: { id } });
    if (!token) throw new ApiProblem('RESOURCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    if (token.isUsed) throw new ApiProblem('TOKEN_ALREADY_USED', HttpStatus.CONFLICT);

    await this.db.checkInToken.update({
      where: { id },
      data: { isUsed: true },
    });

    return { id, status: 'REVOKED' };
  }

  async consumeInstructor(
    principal: SessionPrincipal,
    body: { token: string },
    _idempotencyKey: string,
    _correlationId: string,
    now = new Date(),
  ) {
    this.policy.requireCapability(principal.capabilities, 'attendance:self');
    const tokenStr = (body.token ?? '').trim();
    const tokenHash = sha256(tokenStr.replace(/^dd-checkin:v1:/u, ''));

    const token = await this.db.checkInToken.findFirst({
      where: { token: tokenHash },
    });
    if (!token) throw new ApiProblem('INVALID_TOKEN', HttpStatus.UNPROCESSABLE_ENTITY);
    if (token.isUsed) throw new ApiProblem('TOKEN_ALREADY_USED', HttpStatus.CONFLICT);
    if (token.expiresAt < now) throw new ApiProblem('TOKEN_EXPIRED', HttpStatus.GONE);

    await this.db.checkInToken.update({
      where: { id: token.id },
      data: { isUsed: true },
    });

    return {
      status: HttpStatus.OK,
      body: {
        success: true,
        type: 'INSTRUCTOR',
        checkedInAt: now.toISOString(),
      },
    };
  }
}
