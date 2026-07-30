import { checkInWindowState, isOwningCustomer } from './attendance.service';

describe('customer QR check-in window', () => {
  const start = new Date('2026-07-27T02:00:00.000Z');
  const end = new Date('2026-07-27T03:00:00.000Z');

  it('opens exactly thirty minutes before the class', () => {
    expect(checkInWindowState(start, end, new Date('2026-07-27T01:29:59.999Z'))).toBe('TOO_EARLY');
    expect(checkInWindowState(start, end, new Date('2026-07-27T01:30:00.000Z'))).toBe('OPEN');
  });

  it('remains open during class and expires exactly at class end', () => {
    expect(checkInWindowState(start, end, new Date('2026-07-27T02:59:59.999Z'))).toBe('OPEN');
    expect(checkInWindowState(start, end, end)).toBe('EXPIRED');
  });
});

describe('customer QR check-in ownership', () => {
  const principal = {
    userId: 'customer-a',
    roles: [{ role: 'CUSTOMER' as const, branchId: null }],
  };

  it('allows only the customer who owns the booking-bound token', () => {
    expect(isOwningCustomer(principal, 'customer-a')).toBe(true);
    expect(isOwningCustomer(principal, 'customer-b')).toBe(false);
  });

  it('does not treat a staff role as the owning customer path', () => {
    expect(
      isOwningCustomer(
        { userId: 'staff-a', roles: [{ role: 'ADMIN' as const, branchId: 'branch-a' }] },
        'staff-a',
      ),
    ).toBe(false);
  });
});
