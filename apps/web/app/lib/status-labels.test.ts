import { describe, expect, it } from 'vitest';
import { statusLabel } from './status-labels';

describe('statusLabel', () => {
  it('translates the enums that used to leak into the payments table', () => {
    expect(statusLabel('WAITING_VERIFICATION')).toBe('Menunggu pemeriksaan');
    expect(statusLabel('PAID')).toBe('Lunas');
    expect(statusLabel('CANCELLED')).toBe('Dibatalkan');
  });

  it('translates notification template statuses', () => {
    expect(statusLabel('PUBLISHED')).toBe('Terbit');
    expect(statusLabel('DRAFT')).toBe('Draf');
    expect(statusLabel('ARCHIVED')).toBe('Diarsipkan');
  });

  it('never prints an ALL_CAPS enum for unknown values', () => {
    expect(statusLabel('SOME_NEW_STATE')).toBe('Some new state');
    expect(statusLabel('SOME_NEW_STATE')).not.toMatch(/_/);
  });

  it('handles empty values', () => {
    expect(statusLabel(undefined)).toBe('—');
    expect(statusLabel(null)).toBe('—');
    expect(statusLabel('')).toBe('—');
  });
});
