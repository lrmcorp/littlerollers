import { isRescheduleEntitled } from './ubah-jadwal.service';

describe('synthetic reschedule boundary', () => {
  const startAt = new Date('2026-08-02T10:00:00Z');

  it('uses an inclusive H-24 request boundary', () => {
    expect(isRescheduleEntitled(startAt, new Date('2026-08-01T09:59:59.999Z'), 24)).toBe(true);
    expect(isRescheduleEntitled(startAt, new Date('2026-08-01T10:00:00Z'), 24)).toBe(true);
    expect(isRescheduleEntitled(startAt, new Date('2026-08-01T10:00:00.001Z'), 24)).toBe(false);
  });
});
