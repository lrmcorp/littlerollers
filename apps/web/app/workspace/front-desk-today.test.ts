import { describe, expect, it } from 'vitest';
import type { ClassSlot } from '../api-clients/class-slot-client';
import { attendanceWindow, liveSlots, pickLastEnded, pickRunningAndNext, slotPhase } from './front-desk-today';

const at = (hour: number, minute = 0) => new Date(Date.UTC(2026, 9, 27, hour, minute));
const slot = (id: string, start: Date, endHour: number, status = 'CONFIRMED') =>
  ({ id, startAt: start, endAt: at(endHour), status }) as unknown as ClassSlot;

describe('front desk today helpers', () => {
  const morning = slot('morning', at(1), 2);
  const midday = slot('midday', at(4), 5);
  const evening = slot('evening', at(10), 11);

  it('hides cancelled and draft classes and orders by start time', () => {
    expect(liveSlots([evening, slot('x', at(3), 4, 'CANCELLED'), slot('y', at(2), 3, 'DRAFT'), morning]).map((s) => s.id)).toEqual([
      'morning',
      'evening',
    ]);
  });

  it('picks the class that is running now and the next one after it', () => {
    expect(pickRunningAndNext([morning, midday, evening], at(4, 30))).toMatchObject({
      running: { id: 'midday' },
      next: { id: 'evening' },
    });
    expect(pickRunningAndNext([morning, midday, evening], at(3))).toMatchObject({ running: null, next: { id: 'midday' } });
    expect(pickRunningAndNext([morning], at(23)).next).toBeNull();
  });

  it('picks the last class that ended, and labels each class as finished, running or not started', () => {
    expect(pickLastEnded([morning, midday, evening], at(7))?.id).toBe('midday');
    expect(pickLastEnded([morning, midday, evening], at(0))).toBeNull();
    expect(pickLastEnded([morning, slot('x', at(3), 4, 'CANCELLED')], at(23))?.id).toBe('morning');
    expect(slotPhase(midday, at(3))).toBe('Belum mulai');
    expect(slotPhase(midday, at(4, 30))).toBe('Berjalan');
    expect(slotPhase(midday, at(5))).toBe('Selesai');
  });

  it('allows manual attendance only for confirmed or completed classes within 2 hours of the end', () => {
    expect(attendanceWindow(midday, at(4, 30)).open).toBe(true);
    expect(attendanceWindow(midday, at(7)).open).toBe(true);
    expect(attendanceWindow(midday, at(7, 1))).toMatchObject({ open: false, reason: expect.stringMatching(/2 jam/) });
    expect(attendanceWindow(slot('p', at(4), 5, 'PUBLISHED'), at(4, 30))).toMatchObject({
      open: false,
      reason: expect.stringMatching(/dikonfirmasi/),
    });
    expect(attendanceWindow(slot('c', at(4), 5, 'COMPLETED'), at(6)).open).toBe(true);
  });
});
