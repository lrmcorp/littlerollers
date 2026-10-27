import { describe, expect, it } from 'vitest';
import type { ClassSlot } from '../api-clients/class-slot-client';
import {
  countClassesByWeek,
  MAX_RECURRING_DAYS,
  planRecurring,
  planWeekCopy,
  summarizeCopy,
  validateRecurring,
  type RecurringTemplate,
} from './schedule-weeks';

const TZ = 'Asia/Jakarta';
// Senin 26 Okt 2026 09.00 WIB = 02.00 UTC
const monday = (days: number, hour = 2) => new Date(Date.UTC(2026, 9, 26 + days, hour));
const slot = (id: string, startDay: number, overrides: Record<string, unknown> = {}) =>
  ({
    id,
    classTypeId: 'type-1',
    studioId: 'studio-1',
    roomId: 'room-1',
    instructorUserId: 'inst-1',
    startAt: monday(startDay),
    endAt: monday(startDay, 3),
    status: 'PUBLISHED',
    ...overrides,
  }) as unknown as ClassSlot;
const now = monday(-1);

describe('countClassesByWeek', () => {
  it('counts live classes per week and ignores cancelled ones', () => {
    const slots = [slot('a', 0), slot('b', 2), slot('c', 8), slot('x', 9, { status: 'CANCELLED' })];
    const counts = countClassesByWeek(slots, monday(0), 3, TZ).map((entry) => entry.count);
    expect(counts).toEqual([2, 1, 0]);
  });
});

describe('planWeekCopy', () => {
  const source = [slot('mon', 0), slot('wed', 2, { roomId: 'room-2', instructorUserId: 'inst-2' })];

  it('creates a copy of every class one week later when the target week is empty', () => {
    const plan = planWeekCopy(source, [], 7, now);
    expect(plan.map((item) => item.decision.kind)).toEqual(['CREATE', 'CREATE']);
    expect(plan[0]!.startAt.toISOString()).toBe('2026-11-02T02:00:00.000Z');
    expect(summarizeCopy(plan)).toEqual({ create: 2, exists: 0, conflicts: 0, past: 0 });
  });

  it('skips a class that already exists and never touches existing (booked) classes', () => {
    const existing = [slot('already', 7, { bookedCount: 5 })];
    const plan = planWeekCopy(source, existing, 7, now);
    expect(plan[0]!.decision.kind).toBe('EXISTS');
    expect(plan[1]!.decision.kind).toBe('CREATE');
  });

  it('reports a room clash and an instructor clash instead of creating them', () => {
    const roomClash = slot('other-class', 7, { classTypeId: 'type-9', instructorUserId: 'inst-9' });
    const instructorClash = slot('teaches', 9, { roomId: 'room-9', studioId: 'studio-9', classTypeId: 'type-9' });
    const plan = planWeekCopy(source, [roomClash, instructorClash], 7, now);
    expect(plan.map((item) => item.decision.kind)).toEqual(['ROOM_CONFLICT', 'CREATE']);
    const second = planWeekCopy([slot('wed2', 2, { roomId: 'room-2', instructorUserId: 'inst-1' })], [slot('t', 9, { roomId: 'room-9', studioId: 'studio-9', instructorUserId: 'inst-1' })], 7, now);
    expect(second[0]!.decision.kind).toBe('INSTRUCTOR_CONFLICT');
  });

  it('ignores cancelled classes when looking for clashes and when copying', () => {
    const cancelledTarget = slot('c', 7, { status: 'CANCELLED' });
    const plan = planWeekCopy([...source, slot('gone', 1, { status: 'CANCELLED' })], [cancelledTarget], 7, now);
    expect(plan).toHaveLength(2);
    expect(plan[0]!.decision.kind).toBe('CREATE');
  });

  it('does not create classes in the past', () => {
    const plan = planWeekCopy(source, [], 7, monday(12));
    expect(plan.every((item) => item.decision.kind === 'PAST')).toBe(true);
  });

  it('plans four weeks without clashing with itself', () => {
    const all = [7, 14, 21, 28].flatMap((offset) => planWeekCopy(source, [], offset, now));
    expect(all.filter((item) => item.decision.kind === 'CREATE')).toHaveLength(8);
  });
});

describe('planRecurring', () => {
  // Senin 26 Okt 2026 sampai Minggu 8 Nov 2026 (dua minggu penuh), jam 09.00 WIB
  const template: RecurringTemplate = {
    days: [1, 3],
    startTime: '09:00',
    durationMinutes: 60,
    classTypeId: 'type-1',
    studioId: 'studio-1',
    roomId: 'room-1',
    instructorUserId: 'inst-1',
    from: '2026-10-26',
    until: '2026-11-08',
  };

  it('creates one class per chosen weekday between the two dates, at the branch local time', () => {
    const plan = planRecurring(template, [], now, TZ);
    expect(plan.map((item) => item.startAt.toISOString())).toEqual([
      '2026-10-26T02:00:00.000Z',
      '2026-10-28T02:00:00.000Z',
      '2026-11-02T02:00:00.000Z',
      '2026-11-04T02:00:00.000Z',
    ]);
    expect(plan.every((item) => item.decision.kind === 'CREATE')).toBe(true);
    expect(plan[0]!.endAt.toISOString()).toBe('2026-10-26T03:00:00.000Z');
  });

  it('includes both end dates and treats Sunday as day 7', () => {
    const plan = planRecurring({ ...template, days: [7], from: '2026-11-01', until: '2026-11-01' }, [], now, TZ);
    expect(plan).toHaveLength(1);
    expect(plan[0]!.startAt.toISOString()).toBe('2026-11-01T02:00:00.000Z');
  });

  it('never touches a class that already exists and reports clashes instead of creating them', () => {
    const existing = [
      slot('same', 0),
      slot('room', 2, { classTypeId: 'type-2', instructorUserId: 'inst-9' }),
      slot('teacher', 7, { studioId: 'studio-2', roomId: 'room-9' }),
    ];
    const plan = planRecurring(template, existing, now, TZ);
    expect(plan.map((item) => item.decision.kind)).toEqual(['EXISTS', 'ROOM_CONFLICT', 'INSTRUCTOR_CONFLICT', 'CREATE']);
    expect(summarizeCopy(plan as never)).toMatchObject({ create: 1, exists: 1, conflicts: 2 });
  });

  it('skips dates that are already in the past', () => {
    const plan = planRecurring(template, [], monday(3), TZ);
    expect(plan.map((item) => item.decision.kind)).toEqual(['PAST', 'PAST', 'CREATE', 'CREATE']);
  });

  it('plans three months of Monday, Wednesday and Friday classes in one go', () => {
    const plan = planRecurring({ ...template, days: [1, 3, 5], from: '2026-10-26', until: '2027-01-24' }, [], now, TZ);
    expect(plan).toHaveLength(39);
  });
});

describe('validateRecurring', () => {
  const ok: RecurringTemplate = {
    days: [1],
    startTime: '09:00',
    durationMinutes: 60,
    classTypeId: 'type-1',
    studioId: 'studio-1',
    from: '2026-10-26',
    until: '2026-11-08',
  };

  it('accepts a complete form', () => {
    expect(validateRecurring(ok)).toBeNull();
  });

  it('explains what is missing in plain words', () => {
    expect(validateRecurring({ ...ok, days: [] })).toBe('Pilih paling sedikit satu hari.');
    expect(validateRecurring({ ...ok, classTypeId: '' })).toBe('Pilih tipe kelas.');
    expect(validateRecurring({ ...ok, studioId: '' })).toBe('Pilih studio.');
    expect(validateRecurring({ ...ok, until: '2026-10-01' })).toBe('Tanggal akhir tidak boleh sebelum tanggal mulai.');
    expect(validateRecurring({ ...ok, from: '' })).toBe('Isi tanggal mulai dan tanggal akhir.');
  });

  it('limits one fill to three months', () => {
    expect(validateRecurring({ ...ok, until: '2027-01-24' })).toBeNull();
    expect(MAX_RECURRING_DAYS).toBe(92);
    expect(validateRecurring({ ...ok, until: '2027-02-01' })).toMatch(/tiga bulan/);
  });
});
