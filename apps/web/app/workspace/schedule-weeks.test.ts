import { describe, expect, it } from 'vitest';
import type { ClassSlot } from '../api-clients/class-slot-client';
import { countClassesByWeek, planWeekCopy, summarizeCopy } from './schedule-weeks';

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
