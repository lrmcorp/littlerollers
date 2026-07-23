import { describe, expect, it } from 'vitest';
import { localDateKey, weekWindow, zonedLocalDateTime } from './class-time';

describe('branch-local class time', () => {
  it('starts the week on Monday in Asia/Jakarta', () => {
    const week = weekWindow(new Date('2026-07-23T02:00:00Z'), 'Asia/Jakarta');
    expect(week.days[0]).toBe('2026-07-20');
    expect(week.days[6]).toBe('2026-07-26');
    expect(week.start.toISOString()).toBe('2026-07-19T17:00:00.000Z');
  });

  it('converts local branch time without using the machine timezone', () => {
    expect(zonedLocalDateTime('2026-07-27', '09:00', 'Asia/Jakarta').toISOString()).toBe(
      '2026-07-27T02:00:00.000Z',
    );
    expect(localDateKey(new Date('2026-07-26T17:00:00Z'), 'Asia/Jakarta')).toBe('2026-07-27');
  });

  it('handles DST offset and rejects a nonexistent local time', () => {
    expect(zonedLocalDateTime('2026-11-02', '09:00', 'America/New_York').toISOString()).toBe(
      '2026-11-02T14:00:00.000Z',
    );
    expect(() => zonedLocalDateTime('2026-03-08', '02:30', 'America/New_York')).toThrow(
      'INVALID_LOCAL_DATE_TIME',
    );
  });

  it('keeps midnight and adjacent half-open intervals deterministic', () => {
    const midnight = zonedLocalDateTime('2026-07-28', '00:00', 'Asia/Jakarta');
    const firstEnd = zonedLocalDateTime('2026-07-28', '09:00', 'Asia/Jakarta');
    const adjacentStart = zonedLocalDateTime('2026-07-28', '09:00', 'Asia/Jakarta');
    expect(localDateKey(new Date(midnight.getTime() - 1), 'Asia/Jakarta')).toBe('2026-07-27');
    expect(localDateKey(midnight, 'Asia/Jakarta')).toBe('2026-07-28');
    expect(firstEnd.getTime()).toBe(adjacentStart.getTime());
  });
});
