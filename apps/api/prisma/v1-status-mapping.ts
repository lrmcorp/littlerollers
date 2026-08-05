import type { BookingStatus, ClassSlotStatus, PurchaseStatus } from '@prisma/client';

import { V1_MAPPING_VERSION } from './v1-column-registry';

export const V1_STATUS_MAPPING_VERSION = V1_MAPPING_VERSION;

export type V1AttendanceOutcomeCode =
  | 'ATTENDED'
  | 'EXCUSED'
  | 'NO_SHOW'
  | 'UNKNOWN_HISTORICAL';

const CLASS_SLOT_STATUS: Readonly<Record<number, ClassSlotStatus>> = {
  1: 'PUBLISHED',
  2: 'CONFIRMED',
  3: 'COMPLETED',
  4: 'CANCELLED',
};

const BOOKING_ATTENDANCE: Readonly<Record<number, V1AttendanceOutcomeCode>> = {
  1: 'ATTENDED',
  2: 'EXCUSED',
  3: 'NO_SHOW',
};

export function mapV1ClassSlotStatus(value: unknown): ClassSlotStatus {
  const code = Number(value);
  const mapped = CLASS_SLOT_STATUS[code];
  if (!mapped) throw new Error(`V1_CLASS_SLOT_STATUS_UNKNOWN:${String(value)}`);
  return mapped;
}

export function mapV1BookingAttendance(value: unknown): {
  outcome: V1AttendanceOutcomeCode;
  bookingStatus: BookingStatus;
} {
  if (value === null || value === undefined || value === '' || Number(value) === 0) {
    return { outcome: 'UNKNOWN_HISTORICAL', bookingStatus: 'BOOKED' };
  }
  const outcome = BOOKING_ATTENDANCE[Number(value)];
  if (!outcome) throw new Error(`V1_BOOKING_ATTENDANCE_STATUS_UNKNOWN:${String(value)}`);
  return {
    outcome,
    bookingStatus: outcome === 'ATTENDED' ? 'ATTENDED' : outcome === 'NO_SHOW' ? 'NO_SHOW' : 'BOOKED',
  };
}

export function mapV1PurchaseStatus(input: {
  status: unknown;
  active: unknown;
}): { status: PurchaseStatus; conflict: boolean } {
  const statusCode = Number(input.status);
  const active = Number(input.active) === 1;
  if (![0, 1, 2].includes(statusCode)) {
    throw new Error(`V1_PURCHASE_STATUS_UNKNOWN:${String(input.status)}`);
  }

  if (statusCode === 1 && active) return { status: 'APPROVED', conflict: false };
  if (statusCode === 1 && !active) return { status: 'EXPIRED', conflict: false };
  if (statusCode === 2 && !active) return { status: 'AWAITING_PAYMENT', conflict: false };
  if (statusCode === 0 && !active) return { status: 'REJECTED', conflict: false };

  // Kombinasi status=2, active=1 terdapat pada v1 dan tidak boleh ditebak.
  return { status: 'ACTION_REQUIRED', conflict: true };
}
