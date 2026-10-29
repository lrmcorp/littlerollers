import { BookingsService } from './bookings.service';

const principal = {
  userId: 'cust-1',
  roles: [{ role: 'ADMIN' }],
  capabilities: ['booking:self:read'],
} as any;
const slotId = '11111111-1111-4111-8111-111111111111';

function serviceWithSlot(slotHours: number) {
  const startAt = new Date(Date.now() + 7 * 86_400_000);
  const db = {
    classSlot: {
      findUnique: jest.fn().mockResolvedValue({
        id: slotId,
        branchId: 'branch-1',
        classTypeId: 'class-1',
        startAt,
        endAt: new Date(startAt.getTime() + slotHours * 3_600_000),
        timezone: 'Asia/Jakarta',
        status: 'PUBLISHED',
        capacity: 8,
        bookedCount: 0,
        branch: {},
        classType: {},
      }),
    },
    customerPackage: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'cp-60',
          packageId: 'p-60',
          sessionDurationMinutesSnapshot: 60,
          expiryAt: startAt,
          package: { name: 'One hour x8' },
        },
        {
          id: 'cp-120',
          packageId: 'p-120',
          sessionDurationMinutesSnapshot: 120,
          expiryAt: startAt,
          package: { name: 'Two hours x8' },
        },
      ]),
    },
    ledgerEntry: { aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 8 } }) },
    sessionReservation: { aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 0 } }) },
  };
  const policy = { requireCapability: jest.fn() };
  const config = { value: { booking: { enabled: true, cutoffHours: 2 } } };
  return new BookingsService(db as any, {} as any, policy as any, config as any);
}

describe('customer booking options by session length', () => {
  it('offers both 1-hour and 2-hour packages for a 2-hour block', async () => {
    const options = await serviceWithSlot(2).customerOptions(principal, slotId);
    expect(options.packages.map((item) => [item.id, item.sessionDurationMinutes])).toEqual([
      ['cp-60', 60],
      ['cp-120', 120],
    ]);
    expect(options.eligibility.canBook).toBe(true);
  });

  it('hides 2-hour packages when the slot is only 1 hour long', async () => {
    const options = await serviceWithSlot(1).customerOptions(principal, slotId);
    expect(options.packages.map((item) => item.id)).toEqual(['cp-60']);
  });
});
