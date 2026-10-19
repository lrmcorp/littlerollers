import { PolicyService } from '../identity/policy.service';
import { BookingsService } from './pemesanan-kelas.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(1);
const branchB = id(2);
const bookingId = id(10);

const staff = (capabilities: string[], branchIds: string[], userId = id(100)) => ({
  sessionId: 's',
  userId,
  roles: [] as never,
  capabilities: ['booking:create:assisted', ...capabilities],
  branchIds,
});
const admin = staff(['booking:cancel:assisted'], [branchA]);
const customer = {
  sessionId: 's',
  userId: id(300),
  roles: [] as never,
  capabilities: ['booking:self:create', 'booking:self:cancel'],
  branchIds: [] as string[],
};

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 3_600_000);

const bookingRow = (overrides: Record<string, unknown> = {}, slot: Record<string, unknown> = {}) => ({
  id: bookingId,
  bookingNumber: 'BK-1',
  classSlotId: id(20),
  userId: id(300),
  customerPackageId: id(40),
  status: 'BOOKED',
  attendance: null,
  cancelledById: null,
  classSlot: {
    id: id(20),
    branchId: branchA,
    startAt: hoursFromNow(48),
    endAt: hoursFromNow(49),
    status: 'PUBLISHED',
    capacity: 4,
    bookedCount: 2,
    branch: { id: branchA, timezone: 'Asia/Jakarta' },
    classType: { id: id(21), name: 'Reformer' },
    ...slot,
  },
  user: { id: id(300), displayName: 'Maya', email: 'm@x.test', phone: '081234567890' },
  customerPackage: { package: { id: id(41), name: 'Paket 4' } },
  ...overrides,
});

function setup(row = bookingRow()) {
  const tx = {
    pemesananKelas: {
      findUnique: jest.fn().mockResolvedValue(row),
      update: jest.fn().mockImplementation(async ({ data }) => ({ ...row, ...data, status: 'CANCELLED' })),
    },
    slotKelas: { update: jest.fn().mockResolvedValue({}) },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
  };
  const db = { pemesananKelas: { findFirst: jest.fn().mockResolvedValue(row) } };
  const idempotency = {
    execute: jest.fn(async (_c: unknown, action: (t: typeof tx) => Promise<unknown>) => action(tx)),
  };
  const config = { value: { bookingCancellation: { enabled: true, cutoffHours: 24 } } };
  const service = new BookingsService(
    db as never,
    idempotency as never,
    new PolicyService(),
    config as never,
  );
  return { service, tx, db };
}

const command = (reason?: string) => ({ reasonCode: 'OTHER' as const, reason });

describe('staff cancelling a booking on behalf of a customer', () => {
  it('requires booking:cancel:assisted', async () => {
    const { service, tx } = setup();
    await expect(
      service.cancel(staff([], [branchA]), bookingId, command('Pelanggan sakit'), 'k', 'c'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(tx.pemesananKelas.update).not.toHaveBeenCalled();
  });

  it('requires a written reason from staff (min 10 characters, max 200 characters)', async () => {
    const { service, tx } = setup();
    for (const reason of [undefined, '  ', 'ab', '123456789', '   12345   ', 'x'.repeat(201)])
      await expect(
        service.cancel(admin, bookingId, command(reason), 'k', 'c'),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(tx.pemesananKelas.update).not.toHaveBeenCalled();
  });

  it('hides bookings of a foreign branch', async () => {
    const { service, tx } = setup(bookingRow({}, { branchId: branchB }));
    await expect(
      service.cancel(admin, bookingId, command('Pelanggan sakit'), 'k', 'c'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    expect(tx.pemesananKelas.update).not.toHaveBeenCalled();
  });

  it('cancels at least 24h before the class, records who did it and releases the seat', async () => {
    const { service, tx } = setup();
    const result = await service.cancel(admin, bookingId, command(' Pelanggan sakit '), 'k', 'c');
    expect(tx.pemesananKelas.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'CANCELLED',
          cancelledById: admin.userId,
          cancellationReason: 'Dibatalkan staf: Pelanggan sakit',
        }),
      }),
    );
    expect(tx.slotKelas.update).toHaveBeenCalledWith({
      where: { id: id(20) },
      data: { bookedCount: { decrement: 1 } },
    });
    expect(tx.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'booking.cancelled_by_staff',
          actorId: admin.userId,
          targetUserId: id(300),
          branchId: branchA,
          reason: 'Dibatalkan staf: Pelanggan sakit',
        }),
      }),
    );
    expect(result).toMatchObject({ status: 200, body: { status: 'CANCELLED' } });
  });

  it('applies the same H-24 cutoff and points staff to Penyesuaian Sesi', async () => {
    const { service, tx } = setup(bookingRow({}, { startAt: hoursFromNow(6), endAt: hoursFromNow(7) }));
    await expect(
      service.cancel(admin, bookingId, command('Pelanggan sakit'), 'k', 'c'),
    ).rejects.toMatchObject({
      code: 'CANCELLATION_CUTOFF_PASSED',
      details: [{ field: 'booking', issue: 'USE_SESSION_ADJUSTMENT' }],
    });
    expect(tx.pemesananKelas.update).not.toHaveBeenCalled();
  });

  it('refuses bookings that are not active or already have attendance', async () => {
    const { service } = setup(bookingRow({ status: 'CANCELLED' }));
    await expect(
      service.cancel(admin, bookingId, command('Pelanggan sakit'), 'k', 'c'),
    ).rejects.toMatchObject({ code: 'INVALID_STATE_TRANSITION' });
    const attended = setup(bookingRow({ attendance: { id: 'a' } }));
    await expect(
      attended.service.cancel(admin, bookingId, command('Pelanggan sakit'), 'k', 'c'),
    ).rejects.toMatchObject({ code: 'ATTENDANCE_RECORDED' });
  });

  it('keeps the customer flow unchanged (own booking only, still no reason required)', async () => {
    const { service, tx } = setup();
    await service.cancel(customer, bookingId, command(), 'k', 'c');
    expect(tx.pemesananKelas.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ cancelledById: customer.userId }),
      }),
    );
    const other = setup(bookingRow({ userId: id(999) }));
    await expect(
      other.service.cancel(customer, bookingId, command(), 'k', 'c'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
  });
});

describe('cancellationOptions for staff', () => {
  it('serves staff in scope and explains a cutoff block with the session-adjustment path', async () => {
    const { service } = setup();
    await expect(service.cancellationOptions(admin, bookingId)).resolves.toMatchObject({
      canCancel: true,
      unavailableReason: null,
      supportAction: null,
    });
    const late = setup(bookingRow({}, { startAt: hoursFromNow(6), endAt: hoursFromNow(7) }));
    await expect(late.service.cancellationOptions(admin, bookingId)).resolves.toMatchObject({
      canCancel: false,
      unavailableReason: 'CANCELLATION_CUTOFF_PASSED',
      supportAction: 'USE_SESSION_ADJUSTMENT',
    });
  });

  it('requires the capability and hides foreign-branch bookings', async () => {
    const { service } = setup();
    await expect(
      service.cancellationOptions(staff([], [branchA]), bookingId),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    const foreign = setup(bookingRow({}, { branchId: branchB }));
    await expect(foreign.service.cancellationOptions(admin, bookingId)).rejects.toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
    });
  });
});
