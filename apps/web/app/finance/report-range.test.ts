import { describe, expect, it } from 'vitest';
import { formatDay, presetRange, rangeProblem } from './report-range';

const now = new Date('2026-10-25T10:00:00Z');

describe('presetRange', () => {
  it('builds the quick ranges relative to today', () => {
    expect(presetRange('THIS_MONTH', now)).toEqual({ from: '2026-10-01', until: '2026-10-25' });
    expect(presetRange('LAST_MONTH', now)).toEqual({ from: '2026-09-01', until: '2026-09-30' });
    expect(presetRange('LAST_30_DAYS', now)).toEqual({ from: '2026-09-26', until: '2026-10-25' });
    expect(presetRange('THIS_YEAR', now)).toEqual({ from: '2026-01-01', until: '2026-10-25' });
  });

  it('crosses the year boundary for last month in January', () => {
    expect(presetRange('LAST_MONTH', new Date('2027-01-15T00:00:00Z'))).toEqual({
      from: '2026-12-01',
      until: '2026-12-31',
    });
  });
});

describe('rangeProblem', () => {
  it('accepts a normal range and a full year, rejects the rest', () => {
    expect(rangeProblem({ from: '2026-10-01', until: '2026-10-25' })).toBeUndefined();
    expect(rangeProblem({ from: '2026-01-01', until: '2026-12-31' })).toBeUndefined();
    expect(rangeProblem({ from: '', until: '2026-10-25' })).toMatch(/Isi tanggal/);
    expect(rangeProblem({ from: '2026-10-26', until: '2026-10-25' })).toMatch(/sebelum tanggal awal/);
    expect(rangeProblem({ from: '2026-01-01', until: '2027-01-02' })).toMatch(/366 hari/);
  });
});

describe('formatDay', () => {
  it('shows an Indonesian date without a timezone shift', () => {
    expect(formatDay('2026-10-12')).toBe('12 Okt 2026');
    expect(formatDay('bukan-tanggal')).toBe('bukan-tanggal');
  });
});
