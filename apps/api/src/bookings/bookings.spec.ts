import { isCancellationEntitled } from './bookings.service';

describe('customer booking cancellation boundary', () => {
  const startAt = new Date('2026-08-10T02:00:00.000Z');

  it('allows cancellation strictly before H-24', () => {
    expect(isCancellationEntitled(startAt, new Date('2026-08-09T01:59:59.999Z'), 24)).toBe(true);
  });

  it('rejects cancellation exactly at and after H-24', () => {
    expect(isCancellationEntitled(startAt, new Date('2026-08-09T02:00:00.000Z'), 24)).toBe(false);
    expect(isCancellationEntitled(startAt, new Date('2026-08-09T02:00:00.001Z'), 24)).toBe(false);
  });
});
