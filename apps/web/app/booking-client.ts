import {
  BookingsApi,
  Configuration,
  type Booking,
  type BookingCommand,
} from '@dailydose/api-client-ts/generated';
import { notifySessionFailure } from './session-client';

export type { Booking };
export interface BookingClient {
  list(input: { branchId?: string; status?: string }): Promise<Booking[]>;
  create(input: BookingCommand): Promise<Booking>;
}

const api = new BookingsApi(new Configuration({ basePath: '/api/v1', credentials: 'include' }));
export const browserBookingClient: BookingClient = {
  async list(input) {
    return (await api.listBookings(input)).items;
  },
  create(input) {
    return api.createBooking({
      idempotencyKey: crypto.randomUUID(),
      bookingCommand: input,
    });
  },
};

export function bookingFailure(error: unknown): string {
  notifySessionFailure(error);
  const typed = error as { code?: string; response?: { status?: number } };
  if (typed.code) return typed.code;
  const status = typed.response?.status;
  if (status === 401) return 'SESSION_EXPIRED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'RESOURCE_NOT_FOUND';
  if (status === 409) return 'BOOKING_CONFLICT';
  if (status === 503) return 'CONFIGURATION_REQUIRED';
  if (status === 400 || status === 422) return 'VALIDATION_ERROR';
  return 'OFFLINE_OR_REQUEST_FAILED';
}
