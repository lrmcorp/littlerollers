import { describe, expect, it } from 'vitest';
import { formatAssignmentDate } from './assignments-view';

describe('formatAssignmentDate', () => {
  it('accepts date-only and ISO timestamps without creating an invalid date', () => {
    expect(formatAssignmentDate('2026-07-29')).toContain('2026');
    expect(formatAssignmentDate('2026-07-29T08:30:00.000Z')).toContain('2026');
  });

  it('uses a safe fallback for missing and invalid values', () => {
    expect(formatAssignmentDate(null)).toBe('Tanggal tidak tersedia');
    expect(formatAssignmentDate('not-a-date')).toBe('Tanggal tidak tersedia');
  });
});
