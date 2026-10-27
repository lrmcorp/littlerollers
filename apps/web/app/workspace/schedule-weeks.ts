import type { ClassSlot } from '../api-clients/class-slot-client';
import { shiftWeek, weekWindow, type WeekWindow } from '../lib/class-time';

const DAY_MS = 86_400_000;
const LIVE = new Set(['DRAFT', 'PUBLISHED', 'CONFIRMED', 'COMPLETED']);
const isLive = (slot: Pick<ClassSlot, 'status'>) => LIVE.has(slot.status);
const overlaps = (a: Pick<ClassSlot, 'startAt' | 'endAt'>, b: Pick<ClassSlot, 'startAt' | 'endAt'>) =>
  a.startAt < b.endAt && b.startAt < a.endAt;

export interface WeekCount {
  week: WeekWindow;
  count: number;
}

/** Jumlah kelas (tidak dibatalkan) pada `weeks` minggu berturut-turut mulai minggu yang memuat `from`. */
export function countClassesByWeek(
  slots: readonly ClassSlot[],
  from: Date,
  weeks: number,
  timezone: string,
): WeekCount[] {
  return Array.from({ length: weeks }, (_, index) => {
    const week = weekWindow(shiftWeek(from, index), timezone);
    const count = slots.filter((slot) => isLive(slot) && slot.startAt >= week.start && slot.startAt < week.end).length;
    return { week, count };
  });
}

export type CopyDecision =
  | { kind: 'CREATE' }
  | { kind: 'EXISTS' }
  | { kind: 'ROOM_CONFLICT' }
  | { kind: 'INSTRUCTOR_CONFLICT' }
  | { kind: 'PAST' };

export interface PlannedCopy {
  source: ClassSlot;
  startAt: Date;
  endAt: Date;
  decision: CopyDecision;
}

/**
 * Rencana menyalin kelas satu minggu ke `offsetDays` hari berikutnya. Hanya membuat kelas baru: kelas yang
 * sudah ada (apalagi yang sudah dipesan) tidak pernah diubah atau ditimpa. Kelas yang sama persis dilewati,
 * kelas yang bentrok ruang atau instrukturnya dilaporkan dan tidak dibuat.
 */
export function planWeekCopy(
  source: readonly ClassSlot[],
  existing: readonly ClassSlot[],
  offsetDays: number,
  now: Date,
): PlannedCopy[] {
  const taken = existing.filter(isLive);
  const planned: PlannedCopy[] = [];
  for (const slot of [...source].filter(isLive).sort((a, b) => a.startAt.getTime() - b.startAt.getTime())) {
    const startAt = new Date(slot.startAt.getTime() + offsetDays * DAY_MS);
    const endAt = new Date(slot.endAt.getTime() + offsetDays * DAY_MS);
    const candidate = { startAt, endAt };
    const clash = [...taken, ...planned.filter((p) => p.decision.kind === 'CREATE').map((p) => ({ ...slotOf(p) }))];
    let decision: CopyDecision = { kind: 'CREATE' };
    if (startAt <= now) decision = { kind: 'PAST' };
    else if (
      clash.some(
        (other) =>
          other.classTypeId === slot.classTypeId &&
          other.studioId === slot.studioId &&
          other.startAt.getTime() === startAt.getTime(),
      )
    )
      decision = { kind: 'EXISTS' };
    else if (
      clash.some(
        (other) =>
          other.studioId === slot.studioId &&
          (slot.roomId ? other.roomId === slot.roomId || !other.roomId : true) &&
          overlaps(other, candidate),
      )
    )
      decision = { kind: 'ROOM_CONFLICT' };
    else if (
      slot.instructorUserId &&
      clash.some((other) => other.instructorUserId === slot.instructorUserId && overlaps(other, candidate))
    )
      decision = { kind: 'INSTRUCTOR_CONFLICT' };
    planned.push({ source: slot, startAt, endAt, decision });
  }
  return planned;
}

const slotOf = (planned: PlannedCopy) => ({
  classTypeId: planned.source.classTypeId,
  studioId: planned.source.studioId,
  roomId: planned.source.roomId,
  instructorUserId: planned.source.instructorUserId,
  startAt: planned.startAt,
  endAt: planned.endAt,
});

export interface CopySummary {
  create: number;
  exists: number;
  conflicts: number;
  past: number;
}

export function summarizeCopy(plan: readonly PlannedCopy[]): CopySummary {
  const count = (kind: CopyDecision['kind']) => plan.filter((item) => item.decision.kind === kind).length;
  return {
    create: count('CREATE'),
    exists: count('EXISTS'),
    conflicts: count('ROOM_CONFLICT') + count('INSTRUCTOR_CONFLICT'),
    past: count('PAST'),
  };
}

export const DECISION_LABEL: Record<CopyDecision['kind'], string> = {
  CREATE: 'Akan dibuat',
  EXISTS: 'Sudah ada',
  ROOM_CONFLICT: 'Bentrok ruang',
  INSTRUCTOR_CONFLICT: 'Instruktur bentrok',
  PAST: 'Sudah lewat',
};
