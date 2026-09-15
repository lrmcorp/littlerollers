import { isCancellationEntitled, isInstructorRosterPrincipal } from './pemesanan-kelas.service';

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

describe('instructor roster capability boundary', () => {
  it('uses the assignment-scoped path only for Instructor capabilities', () => {
    expect(isInstructorRosterPrincipal({ capabilities: ['class:assigned:read'] })).toBe(true);
    expect(
      isInstructorRosterPrincipal({ capabilities: ['class:assigned:read', 'booking:read'] }),
    ).toBe(false);
    expect(isInstructorRosterPrincipal({ capabilities: ['booking:self:read'] })).toBe(false);
  });
});
