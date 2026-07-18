import { assertIsoDate, dateInTimeZone, startOfLocalDateUtc } from './assignment-boundary';

describe('branch-local assignment boundary', () => {
  it('maps a Jakarta calendar boundary to its UTC instant', () => {
    const boundary = startOfLocalDateUtc('2026-08-01', 'Asia/Jakarta');
    expect(boundary.toISOString()).toBe('2026-07-31T17:00:00.000Z');
    expect(dateInTimeZone(boundary, 'Asia/Jakarta')).toBe('2026-08-01');
  });

  it('handles a daylight-saving calendar boundary', () => {
    expect(startOfLocalDateUtc('2026-07-01', 'America/New_York').toISOString()).toBe(
      '2026-07-01T04:00:00.000Z',
    );
  });

  it('rejects non-calendar dates', () => {
    expect(() => assertIsoDate('2026-02-30')).toThrow();
  });
});
