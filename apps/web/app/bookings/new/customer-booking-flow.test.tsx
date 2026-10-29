import { render, screen, waitFor } from '@testing-library/react';
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
    endAt: new Date('2027-01-10T05:00:00Z'),
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
      code: 'MOVERS',
      name: 'Movers',
    },
  },
  packages: [
    {
      id: '00000000-0000-4000-8000-000000000104',
      packageId: '00000000-0000-4000-8000-000000000105',
      name: 'Movers 10 x 2h',
      sessionDurationMinutes: 120,
      available: 6,
      projectedAvailable: 5,
      expiryAt: new Date('2027-03-01T00:00:00Z'),
    },
  ],
  eligibility: {
    canBook: true,
    reasonCode: null,
    requiredAction: null,
    cutoffAt: new Date('2027-01-10T01:00:00Z'),
  },
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

const oneHourPackage = {
  id: '00000000-0000-4000-8000-000000000108',
  packageId: '00000000-0000-4000-8000-000000000109',
  name: 'Movers 5 x 1h',
  sessionDurationMinutes: 60,
  available: 2,
  projectedAvailable: 1,
  expiryAt: new Date('2027-02-01T00:00:00Z'),
};

describe('customer self booking flow', () => {
  it('books the selected slot using the authenticated customer package', async () => {
    window.history.replaceState({}, '', `?slot=${options.slot.id}`);
    const client = bookingClient(options);
    render(<CustomerBookingFlow client={client} />);

    expect(await screen.findByRole('heading', { name: 'Movers', level: 1 })).toBeVisible();
    expect(screen.getByRole('radio', { name: /2 hours/ })).toBeChecked();
    expect(screen.getByText('Movers 10 x 2h')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Check booking' }));
    expect(screen.getByText('Movers 10 x 2h (6 → 5 left)')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Confirm booking' }));

    expect(client.create).toHaveBeenCalledWith(
      {
        classSlotId: options.slot.id,
        customerPackageId: options.packages[0]!.id,
        source: 'SELF',
      },
      expect.any(String),
    );
    expect(await screen.findByRole('heading', { name: 'You are booked in' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Confirm booking' })).not.toBeInTheDocument();
  });

  it('lists only packages of the chosen length and books a 1-hour session', async () => {
    window.history.replaceState({}, '', `?slot=${options.slot.id}`);
    const client = bookingClient({ ...options, packages: [...options.packages, oneHourPackage] });
    render(<CustomerBookingFlow client={client} />);

    await screen.findByText('Movers 10 x 2h');
    expect(screen.queryByText('Movers 5 x 1h')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: /1 hour/ }));
    expect(screen.getByText('Movers 5 x 1h')).toBeVisible();
    expect(screen.queryByText('Movers 10 x 2h')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Check booking' }));
    expect(screen.getByText('1 hour')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Confirm booking' }));
    expect(client.create).toHaveBeenCalledWith(
      expect.objectContaining({ customerPackageId: oneHourPackage.id }),
      expect.any(String),
    );
  });

  it('points to buying a package when none matches the chosen length', async () => {
    window.history.replaceState({}, '', `?slot=${options.slot.id}`);
    render(<CustomerBookingFlow client={bookingClient(options)} />);

    await userEvent.click(await screen.findByRole('radio', { name: /1 hour/ }));
    expect(screen.getByRole('link', { name: 'Buy a 1 hour package' })).toHaveAttribute(
      'href',
      `/packages?branch=${options.slot.branchId}&classType=${options.slot.classTypeId}&slot=${options.slot.id}`,
    );
    expect(screen.getByRole('button', { name: 'Check booking' })).toBeDisabled();
  });

  it('offers only 1 hour when the slot is a 1-hour block', async () => {
    window.history.replaceState({}, '', `?slot=${options.slot.id}`);
    render(
      <CustomerBookingFlow
        client={bookingClient({
          ...options,
          slot: { ...options.slot, endAt: new Date('2027-01-10T04:00:00Z') },
          packages: [oneHourPackage],
        })}
      />,
    );

    expect(await screen.findByRole('radio', { name: /1 hour/ })).toBeChecked();
    expect(screen.queryByRole('radio', { name: /2 hours/ })).not.toBeInTheDocument();
  });

  it('preserves the slot when the customer needs to buy a matching package', async () => {
    window.history.replaceState({}, '', `?slot=${options.slot.id}`);
    render(
      <CustomerBookingFlow
        client={bookingClient({
          ...options,
          packages: [],
          eligibility: {
            ...options.eligibility,
            canBook: false,
            reasonCode: 'MATCHING_PACKAGE_REQUIRED',
            requiredAction: 'BUY_MATCHING_PACKAGE',
          },
        })}
      />,
    );

    expect(await screen.findByText('You need a package for this class')).toBeVisible();
    expect(screen.getByRole('link', { name: 'See packages for this class' })).toHaveAttribute(
      'href',
      `/packages?branch=${options.slot.branchId}&classType=${options.slot.classTypeId}&slot=${options.slot.id}`,
    );
  });

  it('keeps the retry key for one intent and rotates it when the selected package changes', async () => {
    window.history.replaceState({}, '', `?slot=${options.slot.id}`);
    const secondPackage = {
      ...options.packages[0]!,
      id: '00000000-0000-4000-8000-000000000107',
      name: 'Movers 20 x 2h',
    };
    const client = bookingClient({
      ...options,
      packages: [...options.packages, secondPackage],
    });
    vi.mocked(client.create).mockRejectedValue(new Error('network unavailable'));
    render(<CustomerBookingFlow client={client} />);

    await screen.findByText('Movers 10 x 2h');
    await userEvent.click(screen.getByRole('button', { name: 'Check booking' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirm booking' }));
    await waitFor(() => expect(client.create).toHaveBeenCalledTimes(1));
    const firstKey = vi.mocked(client.create).mock.calls[0]![1];

    await userEvent.click(screen.getByRole('button', { name: 'Confirm booking' }));
    await waitFor(() => expect(client.create).toHaveBeenCalledTimes(2));
    expect(vi.mocked(client.create).mock.calls[1]![1]).toBe(firstKey);

    await userEvent.click(screen.getByRole('button', { name: 'Change length or package' }));
    await userEvent.click(screen.getByRole('radio', { name: /Movers 20 x 2h/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Check booking' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirm booking' }));
    await waitFor(() => expect(client.create).toHaveBeenCalledTimes(3));
    expect(vi.mocked(client.create).mock.calls[2]![1]).not.toBe(firstKey);
  });
});
