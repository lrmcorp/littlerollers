import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { BookingClient, CustomerBookingOptions } from '../../booking-client';
import { CustomerBookingFlow } from './customer-booking-flow';

const options: CustomerBookingOptions = {
  slot: {
    id: '00000000-0000-4000-8000-000000000101',
    branchId: '00000000-0000-4000-8000-000000000102',
    classTypeId: '00000000-0000-4000-8000-000000000103',
    startAt: new Date('2027-01-10T03:00:00Z'),
    endAt: new Date('2027-01-10T04:00:00Z'),
    timezone: 'Asia/Jakarta',
    status: 'PUBLISHED',
    capacity: 10,
    bookedCount: 2,
    available: 8,
    branch: {
      id: '00000000-0000-4000-8000-000000000102',
      code: 'JKT',
      name: 'Jakarta',
      timezone: 'Asia/Jakarta',
    },
    classType: {
      id: '00000000-0000-4000-8000-000000000103',
      code: 'REFORMER',
      name: 'Reformer Pilates',
    },
  },
  packages: [
    {
      id: '00000000-0000-4000-8000-000000000104',
      packageId: '00000000-0000-4000-8000-000000000105',
      name: 'Reformer 10',
      available: 6,
      expiryAt: new Date('2027-03-01T00:00:00Z'),
    },
  ],
};

function bookingClient(value: CustomerBookingOptions): BookingClient {
  return {
    options: vi.fn().mockResolvedValue(value),
    discover: vi.fn(),
    list: vi.fn(),
    create: vi.fn().mockResolvedValue({
      id: '00000000-0000-4000-8000-000000000106',
      status: 'BOOKED',
      createdAt: new Date(),
    }),
    listReschedules: vi.fn(),
    requestReschedule: vi.fn(),
    decideReschedule: vi.fn(),
  } as unknown as BookingClient;
}

describe('customer self booking flow', () => {
  it('books the selected slot using the authenticated customer package', async () => {
    window.history.replaceState({}, '', `?slot=${options.slot.id}`);
    const client = bookingClient(options);
    render(<CustomerBookingFlow client={client} />);

    expect(await screen.findByRole('heading', { name: 'Konfirmasi kelas Anda' })).toBeVisible();
    expect(screen.getByText('Reformer 10')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Konfirmasi booking' }));

    expect(client.create).toHaveBeenCalledWith(
      {
        classSlotId: options.slot.id,
        customerPackageId: options.packages[0]!.id,
        source: 'SELF',
      },
      expect.any(String),
    );
    expect(await screen.findByText('Booking berhasil dibuat.', { exact: false })).toBeVisible();
  });

  it('preserves the slot when the customer needs to buy a matching package', async () => {
    window.history.replaceState({}, '', `?slot=${options.slot.id}`);
    render(<CustomerBookingFlow client={bookingClient({ ...options, packages: [] })} />);

    expect(
      await screen.findByText('Anda belum memiliki paket aktif', { exact: false }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Lihat paket yang sesuai' })).toHaveAttribute(
      'href',
      `/packages?branch=${options.slot.branchId}&classType=${options.slot.classTypeId}&slot=${options.slot.id}`,
    );
  });
});
