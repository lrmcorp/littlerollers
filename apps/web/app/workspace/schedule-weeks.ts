import type { ClassSlot } from '../api-clients/class-slot-client';
import { shiftWeek, weekWindow, zonedLocalDateTime, type WeekWindow } from '../lib/class-time';

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

interface Candidate {
  classTypeId: string;
  studioId: string;
  roomId?: string | null;
  instructorUserId?: string | null;
  startAt: Date;
  endAt: Date;
}

/** Putusan untuk satu kelas calon terhadap kelas yang sudah ada (`clash`): sama persis, bentrok ruang, atau bentrok instruktur. */
function decide(candidate: Candidate, clash: readonly Candidate[], now: Date): CopyDecision {
  if (candidate.startAt <= now) return { kind: 'PAST' };
  if (
    clash.some(
      (other) =>
        other.classTypeId === candidate.classTypeId &&
        other.studioId === candidate.studioId &&
        other.startAt.getTime() === candidate.startAt.getTime(),
    )
  )
    return { kind: 'EXISTS' };
  if (
    clash.some(
      (other) =>
        other.studioId === candidate.studioId &&
        (candidate.roomId ? other.roomId === candidate.roomId || !other.roomId : true) &&
        overlaps(other, candidate),
    )
  )
    return { kind: 'ROOM_CONFLICT' };
  if (
    candidate.instructorUserId &&
    clash.some((other) => other.instructorUserId === candidate.instructorUserId && overlaps(other, candidate))
  )
    return { kind: 'INSTRUCTOR_CONFLICT' };
  return { kind: 'CREATE' };
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
  const taken: Candidate[] = existing.filter(isLive);
  const planned: PlannedCopy[] = [];
  for (const slot of [...source].filter(isLive).sort((a, b) => a.startAt.getTime() - b.startAt.getTime())) {
    const startAt = new Date(slot.startAt.getTime() + offsetDays * DAY_MS);
    const endAt = new Date(slot.endAt.getTime() + offsetDays * DAY_MS);
    const candidate = { ...slotOf({ source: slot, startAt, endAt }), startAt, endAt };
    const clash = [...taken, ...planned.filter((p) => p.decision.kind === 'CREATE').map(slotOf)];
    planned.push({ source: slot, startAt, endAt, decision: decide(candidate, clash, now) });
  }
  return planned;
}

const slotOf = (planned: Pick<PlannedCopy, 'source' | 'startAt' | 'endAt'>): Candidate => ({
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

/** Hari dalam seminggu, 1 = Senin sampai 7 = Minggu. */
export const WEEKDAYS = [
  { value: 1, short: 'Sen', long: 'Senin' },
  { value: 2, short: 'Sel', long: 'Selasa' },
  { value: 3, short: 'Rab', long: 'Rabu' },
  { value: 4, short: 'Kam', long: 'Kamis' },
  { value: 5, short: 'Jum', long: 'Jumat' },
  { value: 6, short: 'Sab', long: 'Sabtu' },
  { value: 7, short: 'Min', long: 'Minggu' },
] as const;

/** Jadwal rutin paling lama tiga bulan sekali isi. */
export const MAX_RECURRING_DAYS = 92;

export interface RecurringTemplate {
  days: readonly number[];
  startTime: string;
  durationMinutes: number;
  classTypeId: string;
  studioId: string;
  roomId?: string | null;
  instructorUserId?: string | null;
  /** Tanggal lokal cabang `YYYY-MM-DD`, keduanya ikut dihitung. */
  from: string;
  until: string;
}

export interface PlannedRecurring extends Candidate {
  decision: CopyDecision;
}

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const dayNumber = (key: string) => Math.floor(new Date(`${key}T00:00:00Z`).getTime() / DAY_MS);
const keyOfDay = (day: number) => new Date(day * DAY_MS).toISOString().slice(0, 10);
const weekdayOf = (key: string) => new Date(`${key}T00:00:00Z`).getUTCDay() || 7;

/** Pesan galat form jadwal rutin dalam bahasa pengguna, atau `null` bila sudah bisa dihitung. */
export function validateRecurring(template: RecurringTemplate): string | null {
  if (!template.classTypeId) return 'Pilih tipe kelas.';
  if (!template.studioId) return 'Pilih studio.';
  if (template.days.length === 0) return 'Pilih paling sedikit satu hari.';
  if (!/^\d{2}:\d{2}$/.test(template.startTime)) return 'Pilih jam mulai.';
  if (!(template.durationMinutes > 0)) return 'Isi durasi kelas.';
  if (!DATE_KEY.test(template.from) || !DATE_KEY.test(template.until)) return 'Isi tanggal mulai dan tanggal akhir.';
  const span = dayNumber(template.until) - dayNumber(template.from);
  if (span < 0) return 'Tanggal akhir tidak boleh sebelum tanggal mulai.';
  if (span + 1 > MAX_RECURRING_DAYS) return 'Rentang paling lama tiga bulan (92 hari). Buat jadwal berikutnya setelah itu selesai.';
  return null;
}

/**
 * Rencana kelas rutin: setiap hari terpilih di antara dua tanggal, pada jam yang sama. Aturannya sama dengan
 * menyalin minggu: yang sudah ada tidak diubah, yang bentrok ruang atau instruktur dilaporkan dan tidak dibuat.
 */
export function planRecurring(
  template: RecurringTemplate,
  existing: readonly ClassSlot[],
  now: Date,
  timezone: string,
): PlannedRecurring[] {
  if (validateRecurring(template)) return [];
  const taken: Candidate[] = existing.filter(isLive);
  const planned: PlannedRecurring[] = [];
  for (let day = dayNumber(template.from); day <= dayNumber(template.until); day += 1) {
    const key = keyOfDay(day);
    if (!template.days.includes(weekdayOf(key))) continue;
    const startAt = zonedLocalDateTime(key, template.startTime, timezone);
    const endAt = new Date(startAt.getTime() + template.durationMinutes * 60_000);
    const candidate: Candidate = {
      classTypeId: template.classTypeId,
      studioId: template.studioId,
      roomId: template.roomId,
      instructorUserId: template.instructorUserId,
      startAt,
      endAt,
    };
    const clash = [...taken, ...planned.filter((item) => item.decision.kind === 'CREATE')];
    planned.push({ ...candidate, decision: decide(candidate, clash, now) });
  }
  return planned;
}

/** Jalankan `task` untuk setiap item dengan paling banyak `limit` yang berjalan bersamaan. */
export async function runPool<T>(items: readonly T[], limit: number, task: (item: T) => Promise<void>) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++]!;
      await task(item);
    }
  });
  await Promise.all(workers);
}
