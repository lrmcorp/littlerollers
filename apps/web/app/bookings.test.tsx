import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { bookingFailure, type BookingClient } from './booking-client';
import { BookingView } from './bookings/booking-view';

const branchId = '00000000-0000-4000-8000-000000000202';
const customerId = '00000000-0000-4000-8000-000000000204';
const packageId = '00000000-0000-4000-8000-000000000205';
const classTypeId = '00000000-0000-4000-8000-000000000208';
const slotId = '00000000-0000-4000-8000-000000000203';
const booking = {
  id: '00000000-0000-4000-8000-000000000201',
  branchId,
  classSlotId: slotId,
  customerUserId: customerId,
  customerPackageId: packageId,
  reservationId: '00000000-0000-4000-8000-000000000206',
  createdById: '00000000-0000-4000-8000-000000000207',
  source: 'ADMIN_ASSISTED' as const,
  status: 'BOOKED' as const,
  reservedQuantity: 1,
  createdAt: new Date('2027-01-01T00:00:00Z'),
  version: 0,
  idempotentReplay: false,
};
const customerPackage = {
  id: packageId,
  branchId,
  customerUserId: customerId,
  packageId: '00000000-0000-4000-8000-000000000209',
  classTypeId,
  status: 'ACTIVE' as const,
  activationDate: new Date('2026-01-01'),
  expiryAt: new Date('2028-01-01T00:00:00Z'),
  ledgerBalance: 10,
  reserved: 2,
  available: 8,
  salePriceRp: 1000000,
  sessionCountSnapshot: 10,
  durationDaysSnapshot: 30,
  projectionRateRp: 100000,
  version: 0,
};
const slot = {
  id: slotId,
  branchId,
  classTypeId,
  startAt: new Date('2027-01-02T02:00:00Z'),
  endAt: new Date('2027-01-02T03:00:00Z'),
  timezone: 'Asia/Jakarta',
  status: 'PUBLISHED' as const,
  minimumQuota: 2,
  capacity: 10,
  bookedCount: 3,
  version: 0,
  idempotentReplay: false,
};
const reschedule = {
  id: '00000000-0000-4000-8000-000000000211',
  branchId,
  bookingId: booking.id,
  sourceClassSlotId: slotId,
  targetClassSlotId: '00000000-0000-4000-8000-000000000212',
  requestedById: customerId,
  requestReasonCode: 'PERSONAL_UNAVAILABLE' as const,
  status: 'PENDING' as const,
  entitlementCutoffAt: new Date('2027-01-01T02:00:00Z'),
  entitledAtRequest: true as const,
  requestedAt: new Date('2026-12-31T00:00:00Z'),
  version: 0,
  idempotentReplay: false,
};

function client(overrides: Partial<BookingClient> = {}): BookingClient {
  return {
    options: vi.fn().mockRejectedValue(new Error('not used by assisted booking tests')),
    discover: vi.fn().mockResolvedValue({
      customers: [{ id: customerId, displayName: 'Customer Synthetic' }],
      packages: [customerPackage],
      slots: [slot],
    }),
    list: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
    detail: vi.fn().mockResolvedValue(booking),
    rescheduleOptions: vi.fn().mockRejectedValue(new Error('not used by assisted booking tests')),
    create: vi.fn().mockResolvedValue(booking),
    listReschedules: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
    requestReschedule: vi.fn().mockResolvedValue(reschedule),
    decideReschedule: vi.fn().mockResolvedValue({
      reschedule: { ...reschedule, status: 'APPROVED', version: 1 },
      booking: { ...booking, classSlotId: reschedule.targetClassSlotId, version: 2 },
      idempotentReplay: false,
    }),
    ...overrides,
  };
}

async function selectBooking(user: ReturnType<typeof userEvent.setup>) {
  if (!screen.queryByRole('form', { name: 'Buat booking bantuan' }))
    await user.click(screen.getByRole('button', { name: 'Buat booking manual' }));
  await screen.findByRole('option', { name: 'Customer Synthetic' });
  await user.selectOptions(screen.getByLabelText('Pelanggan'), customerId);
  await user.selectOptions(screen.getByLabelText('Paket pelanggan'), packageId);
  await user.selectOptions(screen.getByLabelText('Kelas'), slotId);
}

describe('BookingView', () => {
  it('keeps global read mode but requires a branch for mutations', () => {
    render(<BookingView client={client()} activeBranchId="" />);
    expect(screen.getByText(/Mode semua cabang bersifat baca saja/)).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Buat booking bantuan' })).not.toBeInTheDocument();
  });

  it('discovers eligible options and creates one assisted booking accessibly', async () => {
    const bookingClient = client();
    const view = render(<BookingView client={bookingClient} activeBranchId={branchId} />);
    const user = userEvent.setup();
    await selectBooking(user);
    expect(screen.getByText(/Saldo tersedia berubah dari 8 menjadi 7/)).toBeInTheDocument();
    expect((await axe(view.container)).violations).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Konfirmasi booking satu sesi' }));
    expect(await screen.findByText(/Booking dibuat/)).toBeInTheDocument();
    expect(bookingClient.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'ADMIN_ASSISTED', customerUserId: customerId }),
      expect.any(String),
    );
  });

  it('keeps the same intent key for a safe retry and maps the failure', async () => {
    const create = vi
      .fn()
      .mockRejectedValueOnce({ code: 'CLASS_CAPACITY_FULL' })
      .mockResolvedValueOnce({ ...booking, idempotentReplay: true });
    const bookingClient = client({ create });
    render(<BookingView client={bookingClient} activeBranchId={branchId} />);
    const user = userEvent.setup();
    await selectBooking(user);
    await user.click(screen.getByRole('button', { name: 'Konfirmasi booking satu sesi' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Kapasitas kelas sudah penuh.');
    await user.click(screen.getByRole('button', { name: 'Konfirmasi booking satu sesi' }));
    expect(await screen.findByText(/tidak ada reservasi ganda/)).toBeInTheDocument();
    expect(create.mock.calls[0]?.[1]).toBe(create.mock.calls[1]?.[1]);
  });

  it('loads stable booking pagination without duplicates', async () => {
    const second = { ...booking, id: '00000000-0000-4000-8000-000000000210' };
    const list = vi
      .fn()
      .mockImplementation(({ cursor }: { cursor?: string }) =>
        Promise.resolve(
          cursor === 'cursor-2'
            ? { items: [booking, second], nextCursor: null }
            : { items: [booking], nextCursor: 'cursor-2' },
        ),
      );
    render(<BookingView client={client({ list })} activeBranchId={branchId} />);
    const user = userEvent.setup();
    await screen.findAllByText('Aktif');
    await user.click(screen.getByRole('button', { name: 'Muat booking berikutnya' }));
    expect(screen.getAllByText(/Aktif/).length).toBeGreaterThanOrEqual(2);
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ branchId, cursor: 'cursor-2' }),
    );
  });

  it('continues cursor pagination in global read mode without requiring a branch', async () => {
    const second = { ...booking, id: '00000000-0000-4000-8000-000000000299' };
    const list = vi
      .fn()
      .mockImplementation(({ cursor }: { cursor?: string }) =>
        Promise.resolve(
          cursor === 'global-cursor'
            ? { items: [second], nextCursor: null }
            : { items: [booking], nextCursor: 'global-cursor' },
        ),
      );
    render(<BookingView client={client({ list })} activeBranchId="" />);
    const user = userEvent.setup();
    await screen.findByRole('button', { name: 'Muat booking berikutnya' });
    await user.click(screen.getByRole('button', { name: 'Muat booking berikutnya' }));
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ branchId: undefined, cursor: 'global-cursor' }),
    );
  });

  it('clears downstream selections when active branch changes', async () => {
    const bookingClient = client();
    const view = render(<BookingView client={bookingClient} activeBranchId={branchId} />);
    const user = userEvent.setup();
    await selectBooking(user);
    expect(screen.getByLabelText('Kelas')).toHaveValue(slotId);
    view.rerender(
      <BookingView client={bookingClient} activeBranchId="00000000-0000-4000-8000-000000000299" />,
    );
    await waitFor(() => expect(screen.getByLabelText('Pelanggan')).toHaveValue(''));
    expect(screen.getByLabelText('Paket pelanggan')).toHaveValue('');
    expect(screen.getByLabelText('Kelas')).toHaveValue('');
  });

  it('maps stable booking problems to safe Indonesian copy', async () => {
    const cases = [
      ['BOOKING_CUTOFF_PASSED', 'Waktu pemesanan kelas ini sudah ditutup.'],
      ['INSUFFICIENT_AVAILABLE_SESSIONS', 'Saldo sesi pelanggan tidak mencukupi.'],
      ['DUPLICATE_ACTIVE_BOOKING', 'Pelanggan sudah memiliki booking aktif untuk kelas ini.'],
      ['RESOURCE_NOT_FOUND', 'Data tidak tersedia dalam cabang yang dipilih.'],
      ['CONFIGURATION_REQUIRED', 'Konfigurasi booking belum tersedia.'],
      ['IDEMPOTENCY_IN_PROGRESS', 'Permintaan yang sama masih diproses. Silakan coba lagi.'],
      ['SESSION_EXPIRED', 'Sesi berakhir. Silakan masuk kembali.'],
    ] as const;
    for (const [code, message] of cases) expect(await bookingFailure({ code })).toBe(message);
    expect(
      await bookingFailure({
        response: new Response(JSON.stringify({ error: { code: 'DUPLICATE_ACTIVE_BOOKING' } }), {
          status: 409,
          headers: { 'content-type': 'application/problem+json' },
        }),
      }),
    ).toBe('Pelanggan sudah memiliki booking aktif untuk kelas ini.');
  });

  it('reviews and approves a pending reschedule with controlled reason', async () => {
    const decideReschedule = vi.fn().mockResolvedValue({
      reschedule: { ...reschedule, status: 'APPROVED', version: 1 },
      booking: { ...booking, classSlotId: reschedule.targetClassSlotId, version: 2 },
      idempotentReplay: false,
    });
    const view = render(
      <BookingView
        client={client({
          listReschedules: vi.fn().mockResolvedValue({ items: [reschedule], nextCursor: null }),
          decideReschedule,
        })}
        activeBranchId={branchId}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: /Antrean Reschedule/ }));
    await screen.findByRole('button', { name: /Tinjau reschedule/ });
    await user.click(screen.getByRole('button', { name: /Tinjau reschedule/ }));
    expect((await axe(view.container)).violations).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Setujui reschedule' }));
    expect(
      await screen.findByText('Reschedule disetujui dan reservation dipindahkan secara atomik.'),
    ).toBeInTheDocument();
    expect(decideReschedule).toHaveBeenCalledWith(
      reschedule.id,
      'approve',
      { reasonCode: 'ELIGIBILITY_VERIFIED', expectedVersion: 0 },
      expect.any(String),
    );
  });
});
