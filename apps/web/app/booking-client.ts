import {
  BookingsApi,
  ClassesApi,
  Configuration,
  IdentityApi,
  LedgerApi,
  type Booking,
  type BookingCommand,
  type ClassSlot,
  type CustomerPackageBalance,
  type Reschedule,
  type RescheduleDecisionCommand,
  type RescheduleRequestCommand,
} from '@dailydose/api-client-ts/generated';
import { notifySessionFailure } from './session-client';

export type { Booking, ClassSlot, CustomerPackageBalance, Reschedule };

export type BookingCustomer = {
  id: string;
  displayName: string;
};

export type BookingDiscovery = {
  customers: BookingCustomer[];
  packages: CustomerPackageBalance[];
  slots: ClassSlot[];
};

export type BookingPage = {
  items: CustomerBookingRecord[];
  nextCursor?: string | null;
};

export type CustomerBookingRecord = Omit<
  Booking,
  'branch' | 'classSlot' | 'package' | 'attendance'
> & {
  branch?: { id: string; name: string; timezone: string };
  classSlot?: {
    id: string;
    startAt: Date;
    endAt: Date;
    timezone: string;
    status: string;
    classType: { id: string; name: string };
  };
  package?: { id: string; name: string };
  attendance?: { checkedInAt: Date; source: 'QR' | 'BACKFILL' };
};

export type CustomerBookingOptions = {
  slot: {
    id: string;
    branchId: string;
    classTypeId: string;
    startAt: Date;
    endAt: Date;
    timezone: string;
    status: 'PUBLISHED' | 'CONFIRMED';
    capacity: number;
    bookedCount: number;
    available: number;
    branch: { id: string; code: string; name: string; timezone: string };
    classType: { id: string; code: string; name: string };
  };
  packages: Array<{
    id: string;
    packageId: string;
    name: string;
    available: number;
    expiryAt: Date;
  }>;
};

export type ReschedulePage = {
  items: Reschedule[];
  nextCursor?: string | null;
};

export type CheckInIssue = {
  id: string;
  bookingId: string;
  notBeforeAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'USED' | 'REVOKED';
  version: number;
  token: string | null;
  qrPayload: string | null;
  passUrl: string | null;
  maskedCustomerPhone: string | null;
  whatsappUrl: string | null;
  message: string | null;
  idempotentReplay: boolean;
};

export type CheckInResult = {
  id: string;
  resourceId: string;
  status: 'CHECKED_IN';
  checkedInAt: string;
  auditReference: string;
  idempotentReplay: boolean;
  customerName: string;
  className: string;
  branch: { code: string; name: string };
  startAt: string;
  endAt: string;
};

export interface BookingClient {
  discover(branchId: string): Promise<BookingDiscovery>;
  options(classSlotId: string): Promise<CustomerBookingOptions>;
  list(input: { branchId?: string; status?: string; cursor?: string }): Promise<BookingPage>;
  detail(id: string): Promise<CustomerBookingRecord>;
  create(input: BookingCommand, idempotencyKey: string): Promise<Booking>;
  listReschedules(input: {
    branchId: string;
    status?: string;
    cursor?: string;
  }): Promise<ReschedulePage>;
  requestReschedule(input: RescheduleRequestCommand, idempotencyKey: string): Promise<Reschedule>;
  decideReschedule(
    id: string,
    decision: 'approve' | 'reject',
    input: RescheduleDecisionCommand,
    idempotencyKey: string,
  ): Promise<{ reschedule: Reschedule; booking: Booking; idempotentReplay: boolean }>;
  issueCheckIn?(
    bookingId: string,
    expectedVersion: number,
    idempotencyKey: string,
  ): Promise<CheckInIssue>;
  issueBulkCheckIns?(
    classSlotId: string,
    bookingIds: string[] | undefined,
    idempotencyKey: string,
  ): Promise<{
    classSlotId: string;
    items: Array<{ bookingId: string; ok: boolean; result?: CheckInIssue; errorCode?: string }>;
  }>;
  consumeCheckIn?(token: string, idempotencyKey: string): Promise<CheckInResult>;
}

const configuration = new Configuration({ basePath: '/api/v1', credentials: 'include' });
const bookings = new BookingsApi(configuration);
const classes = new ClassesApi(configuration);
const identity = new IdentityApi(configuration);
const ledger = new LedgerApi(configuration);

export const browserBookingClient: BookingClient = {
  async options(classSlotId) {
    const response = await fetch(`/api/v1/bookings/options/${encodeURIComponent(classSlotId)}`, {
      credentials: 'include',
    });
    if (!response.ok) throw { response };
    const value = (await response.json()) as Omit<CustomerBookingOptions, 'slot' | 'packages'> & {
      slot: Omit<CustomerBookingOptions['slot'], 'startAt' | 'endAt'> & {
        startAt: string;
        endAt: string;
      };
      packages: Array<
        Omit<CustomerBookingOptions['packages'][number], 'expiryAt'> & {
          expiryAt: string;
        }
      >;
    };
    return {
      slot: {
        ...value.slot,
        startAt: new Date(value.slot.startAt),
        endAt: new Date(value.slot.endAt),
      },
      packages: value.packages.map((item) => ({ ...item, expiryAt: new Date(item.expiryAt) })),
    };
  },
  async discover(branchId) {
    const [users, packages, published, confirmed] = await Promise.all([
      identity.listUsers({ branchId }),
      ledger.listCustomerPackages({ branchId }),
      classes.listClassSlots({ branchId, status: 'PUBLISHED' }),
      classes.listClassSlots({ branchId, status: 'CONFIRMED' }),
    ]);
    const now = Date.now();
    return {
      customers: users.items
        .filter((user) => user.status === 'ACTIVE')
        .map((user) => ({
          id: user.id,
          displayName: user.displayName || 'Pelanggan',
        })),
      packages: packages.items.filter(
        (item) =>
          item.branchId === branchId &&
          item.status === 'ACTIVE' &&
          item.available >= 1 &&
          item.expiryAt.getTime() > now,
      ),
      slots: [...published.items, ...confirmed.items]
        .filter(
          (slot) =>
            slot.branchId === branchId &&
            slot.startAt.getTime() > now &&
            slot.bookedCount < slot.capacity,
        )
        .sort((left, right) => left.startAt.getTime() - right.startAt.getTime()),
    };
  },
  async list(input) {
    const query = new URLSearchParams();
    if (input.branchId) query.set('branchId', input.branchId);
    if (input.status) query.set('status', input.status);
    if (input.cursor) query.set('cursor', input.cursor);
    const response = await fetch(`/api/v1/bookings?${query.toString()}`, {
      credentials: 'include',
    });
    if (!response.ok) throw { response };
    const result = (await response.json()) as {
      items: Array<
        Omit<CustomerBookingRecord, 'createdAt' | 'classSlot' | 'attendance'> & {
          createdAt: string;
          classSlot?: Omit<NonNullable<CustomerBookingRecord['classSlot']>, 'startAt' | 'endAt'> & {
            startAt: string;
            endAt: string;
          };
          attendance?: { checkedInAt: string; source: 'QR' | 'BACKFILL' } | null;
        }
      >;
      page: { nextCursor?: string | null };
    };
    return {
      items: result.items.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        classSlot: item.classSlot
          ? {
              ...item.classSlot,
              startAt: new Date(item.classSlot.startAt),
              endAt: new Date(item.classSlot.endAt),
            }
          : undefined,
        attendance: item.attendance
          ? { ...item.attendance, checkedInAt: new Date(item.attendance.checkedInAt) }
          : undefined,
      })),
      nextCursor: result.page.nextCursor,
    };
  },
  async detail(id) {
    const response = await fetch(`/api/v1/bookings/${encodeURIComponent(id)}`, {
      credentials: 'include',
    });
    if (!response.ok) throw { response };
    const item = (await response.json()) as any;
    return {
      ...item,
      createdAt: new Date(item.createdAt),
      classSlot: item.classSlot
        ? {
            ...item.classSlot,
            startAt: new Date(item.classSlot.startAt),
            endAt: new Date(item.classSlot.endAt),
          }
        : undefined,
      attendance: item.attendance
        ? { ...item.attendance, checkedInAt: new Date(item.attendance.checkedInAt) }
        : undefined,
    };
  },
  create(input, idempotencyKey) {
    return bookings.createBooking({ idempotencyKey, bookingCommand: input });
  },
  async listReschedules(input) {
    const result = await bookings.listReschedules(input);
    return { items: result.items, nextCursor: result.page.nextCursor };
  },
  requestReschedule(input, idempotencyKey) {
    return bookings.requestReschedule({ idempotencyKey, rescheduleRequestCommand: input });
  },
  decideReschedule(id, decision, input, idempotencyKey) {
    return bookings.decideReschedule({
      id,
      decision,
      idempotencyKey,
      rescheduleDecisionCommand: input,
    });
  },
  async issueCheckIn(bookingId, expectedVersion, idempotencyKey) {
    const response = await fetch(
      `/api/v1/bookings/${encodeURIComponent(bookingId)}/customer-check-in-links`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', 'idempotency-key': idempotencyKey },
        body: JSON.stringify({ expectedVersion }),
      },
    );
    if (!response.ok) throw { response };
    return response.json() as Promise<CheckInIssue>;
  },
  async issueBulkCheckIns(classSlotId, bookingIds, idempotencyKey) {
    const response = await fetch(
      `/api/v1/class-slots/${encodeURIComponent(classSlotId)}/customer-check-in-links/bulk`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', 'idempotency-key': idempotencyKey },
        body: JSON.stringify({ bookingIds }),
      },
    );
    if (!response.ok) throw { response };
    return response.json();
  },
  async consumeCheckIn(token, idempotencyKey) {
    const response = await fetch('/api/v1/check-ins/customers', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json', 'idempotency-key': idempotencyKey },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) throw { response };
    return response.json() as Promise<CheckInResult>;
  },
};

const messages: Record<string, string> = {
  BOOKING_CUTOFF_PASSED: 'Waktu pemesanan kelas ini sudah ditutup.',
  CLASS_CAPACITY_FULL: 'Kapasitas kelas sudah penuh.',
  INSUFFICIENT_AVAILABLE_SESSIONS: 'Saldo sesi pelanggan tidak mencukupi.',
  DUPLICATE_ACTIVE_BOOKING: 'Pelanggan sudah memiliki booking aktif untuk kelas ini.',
  RESOURCE_NOT_FOUND: 'Data tidak tersedia dalam cabang yang dipilih.',
  CONFIGURATION_REQUIRED: 'Konfigurasi booking belum tersedia.',
  IDEMPOTENCY_KEY_REUSED: 'Permintaan booking berubah. Silakan mulai konfirmasi baru.',
  IDEMPOTENCY_IN_PROGRESS: 'Permintaan yang sama masih diproses. Silakan coba lagi.',
  SESSION_EXPIRED: 'Sesi berakhir. Silakan masuk kembali.',
  FORBIDDEN: 'Anda tidak memiliki izin untuk tindakan ini.',
  VALIDATION_ERROR: 'Data booking belum valid.',
  OFFLINE_OR_REQUEST_FAILED: 'Layanan tidak dapat dijangkau. Periksa koneksi lalu coba lagi.',
  RESCHEDULE_CUTOFF_PASSED: 'Batas pengajuan reschedule H-24 sudah terlewati.',
  PENDING_RESCHEDULE_EXISTS: 'Booking ini sudah memiliki reschedule yang sedang ditinjau.',
  TARGET_CLASS_FULL: 'Kelas tujuan sudah penuh.',
  TARGET_CLASS_INELIGIBLE: 'Kelas tujuan tidak lagi memenuhi syarat.',
  RESCHEDULE_ALREADY_DECIDED: 'Reschedule ini sudah diputuskan.',
  STALE_VERSION: 'Data berubah sejak terakhir dimuat. Muat ulang sebelum melanjutkan.',
  CHECK_IN_TOO_EARLY: 'QR belum aktif. Check-in dibuka 30 menit sebelum kelas.',
  CHECK_IN_WINDOW_CLOSED: 'QR sudah kedaluwarsa karena jadwal kelas telah selesai.',
  CHECK_IN_TOKEN_REVOKED: 'QR sudah dicabut dan perlu diterbitkan ulang.',
  CHECK_IN_TOKEN_INVALID: 'QR tidak valid atau tidak dikenali.',
  INVALID_STATE_TRANSITION: 'Booking atau kelas tidak berada pada status yang dapat di-check-in.',
};

export async function bookingFailure(error: unknown): Promise<string> {
  notifySessionFailure(error);
  const typed = error as {
    code?: string;
    response?: Response & { status?: number };
  };
  let code = typed.code;
  if (!code && typed.response?.clone) {
    try {
      const problem = (await typed.response.clone().json()) as { code?: string };
      code = problem.code;
    } catch {
      // A response without problem-details is mapped by status below.
    }
  }
  const status = typed.response?.status;
  code ??=
    status === 401
      ? 'SESSION_EXPIRED'
      : status === 403
        ? 'FORBIDDEN'
        : status === 404
          ? 'RESOURCE_NOT_FOUND'
          : status === 503
            ? 'CONFIGURATION_REQUIRED'
            : status === 400 || status === 422
              ? 'VALIDATION_ERROR'
              : 'OFFLINE_OR_REQUEST_FAILED';
  return messages[code] ?? messages.OFFLINE_OR_REQUEST_FAILED!;
}
