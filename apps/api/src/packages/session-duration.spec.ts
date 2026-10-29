import { sessionFitsSlot, validSessionDuration } from './session-duration';

describe('session duration', () => {
  const twoHourSlot = {
    startAt: new Date('2026-11-02T02:00:00Z'),
    endAt: new Date('2026-11-02T04:00:00Z'),
  };
  const oneHourSlot = {
    startAt: new Date('2026-11-02T02:00:00Z'),
    endAt: new Date('2026-11-02T03:00:00Z'),
  };

  it('accepts only 1-hour and 2-hour sessions', () => {
    expect(validSessionDuration(60)).toBe(true);
    expect(validSessionDuration(120)).toBe(true);
    for (const value of [0, 30, 90, 180, '60', null, undefined]) {
      expect(validSessionDuration(value)).toBe(false);
    }
  });

  it('fits both lengths into a 2-hour timetable block', () => {
    expect(sessionFitsSlot(60, twoHourSlot)).toBe(true);
    expect(sessionFitsSlot(120, twoHourSlot)).toBe(true);
  });

  it('keeps a 2-hour session out of a 1-hour slot', () => {
    expect(sessionFitsSlot(60, oneHourSlot)).toBe(true);
    expect(sessionFitsSlot(120, oneHourSlot)).toBe(false);
  });
});
