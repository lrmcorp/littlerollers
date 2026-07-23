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
  items: Booking[];
  nextCursor?: string | null;
};

export type ReschedulePage = {
  items: Reschedule[];
  nextCursor?: string | null;
};

export interface BookingClient {
  discover(branchId: string): Promise<BookingDiscovery>;
  list(input: { branchId: string; status?: string; cursor?: string }): Promise<BookingPage>;
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
}

const configuration = new Configuration({ basePath: '/api/v1', credentials: 'include' });
const bookings = new BookingsApi(configuration);
const classes = new ClassesApi(configuration);
const identity = new IdentityApi(configuration);
const ledger = new LedgerApi(configuration);

export const browserBookingClient: BookingClient = {
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
          displayName:
            typeof user.attributes === 'object' &&
            user.attributes !== null &&
            'displayName' in user.attributes &&
            typeof user.attributes.displayName === 'string'
              ? user.attributes.displayName
              : 'Pelanggan',
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
    const result = await bookings.listBookings(input);
    return { items: result.items, nextCursor: result.page.nextCursor };
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
  MFA_REQUIRED: 'Verifikasi MFA diperlukan untuk memutuskan reschedule.',
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
