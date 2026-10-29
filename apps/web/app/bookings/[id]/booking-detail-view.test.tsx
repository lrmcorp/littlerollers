import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BookingClient, CustomerRescheduleOptions } from '../../booking-client';
import { BookingDetailView } from './booking-detail-view';

const sessionState = vi.hoisted(() => ({ context: null as any }));
vi.mock('../../session-context', () => ({
  useSessionContext: () => sessionState.context,
}));

const bookingId = '00000000-0000-4000-8000-000000000401';
const sourceId = '00000000-0000-4000-8000-000000000402';
const targetId = '00000000-0000-4000-8000-000000000403';
const booking = {
  id: bookingId,
  branchId: '00000000-0000-4000-8000-000000000404',
  classSlotId: sourceId,
  customerUserId: '00000000-0000-4000-8000-000000000405',
  customerPackageId: '00000000-0000-4000-8000-000000000406',
  reservationId: '00000000-0000-4000-8000-000000000407',
  createdById: '00000000-0000-4000-8000-000000000405',
  source: 'SELF' as const,
  status: 'BOOKED' as const,
  reservedQuantity: 1,
  version: 0,
  createdAt: new Date('2026-08-01T00:00:00Z'),
  idempotentReplay: false,
  branch: { id: '00000000-0000-4000-8000-000000000404', name: 'Jakarta', timezone: 'Asia/Jakarta' },
  classSlot: {
    id: sourceId,
    startAt: new Date('2026-08-10T03:00:00Z'),
    endAt: new Date('2026-08-10T04:00:00Z'),
    timezone: 'Asia/Jakarta',
    status: 'CONFIRMED',
    classType: { id: '00000000-0000-4000-8000-000000000408', name: 'Movers' },
  },
  package: { id: '00000000-0000-4000-8000-000000000409', name: 'Movers 10 x 2h' },
};

const eligible: CustomerRescheduleOptions = {
  bookingId,
  bookingVersion: 0,
  sourceClassSlotId: sourceId,
  cutoffAt: new Date('2026-08-09T03:00:00Z'),
  canRequest: true,
  unavailableReason: null,
  supportAction: null,
  latestRequest: null,
  targets: [
    {
      id: targetId,
      startAt: new Date('2026-08-12T03:00:00Z'),
      endAt: new Date('2026-08-12T04:00:00Z'),
      timezone: 'Asia/Jakarta',
      status: 'PUBLISHED',
      availableCapacity: 3,
      branch: { id: booking.branchId, name: 'Jakarta', timezone: 'Asia/Jakarta' },
      classType: booking.classSlot.classType,
    },
  ],
};

const request = {
  id: '00000000-0000-4000-8000-000000000410',
  branchId: booking.branchId,
  bookingId,
  sourceClassSlotId: sourceId,
  targetClassSlotId: targetId,
  requestedById: booking.customerUserId,
  requestReasonCode: 'PERSONAL_UNAVAILABLE' as const,
  status: 'PENDING' as const,
  entitlementCutoffAt: eligible.cutoffAt,
  entitledAtRequest: true as const,
  requestedAt: new Date('2026-08-01T01:00:00Z'),
  version: 0,
};

const makeClient = (options: CustomerRescheduleOptions): BookingClient => ({
  discover: vi.fn(),
  options: vi.fn(),
  list: vi.fn(),
  detail: vi.fn().mockResolvedValue(booking),
  rescheduleOptions: vi.fn().mockResolvedValue(options),
  create: vi.fn(),
  listReschedules: vi.fn(),
  requestReschedule: vi.fn().mockResolvedValue(request),
  decideReschedule: vi.fn(),
});

describe('BookingDetailView reschedule customer', () => {
  beforeEach(() => {
    sessionState.context = null;
  });

  it('submits an eligible request through an explicit confirmation step', async () => {
    const client = makeClient(eligible);
    vi.mocked(client.rescheduleOptions)
      .mockResolvedValueOnce(eligible)
      .mockResolvedValueOnce({
        ...eligible,
        canRequest: false,
        unavailableReason: 'RESCHEDULE_PENDING',
        latestRequest: request,
        targets: [],
      });
    const view = render(<BookingDetailView id={bookingId} client={client} />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Ask to reschedule' }));
    expect((await axe(view.container)).violations).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Review request' }));
    expect(screen.getByText('Check the change')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Send request' }));

    expect(client.requestReschedule).toHaveBeenCalledWith(
      {
        bookingId,
        targetClassSlotId: targetId,
        reasonCode: 'PERSONAL_UNAVAILABLE',
        expectedBookingVersion: 0,
      },
      expect.any(String),
    );
    expect(await screen.findByText('Reschedule being reviewed')).toBeVisible();
  });

  it('shows studio guidance after the inclusive cutoff has passed', async () => {
    const client = makeClient({
      ...eligible,
      canRequest: false,
      unavailableReason: 'RESCHEDULE_CUTOFF_PASSED',
      supportAction: 'CONTACT_STUDIO',
      targets: [],
    });
    render(<BookingDetailView id={bookingId} client={client} />);
    expect(await screen.findByText('Reschedules have closed')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Ask to reschedule' })).not.toBeInTheDocument();
  });

  it('keeps booking detail readable while reschedule policy is disabled', async () => {
    const client = makeClient(eligible);
    vi.mocked(client.rescheduleOptions).mockRejectedValue({ code: 'CONFIGURATION_REQUIRED' });
    render(<BookingDetailView id={bookingId} client={client} />);

    expect(await screen.findByRole('heading', { name: 'Movers' })).toBeVisible();
    expect(screen.getByText('Rescheduling is unavailable right now')).toBeVisible();
    expect(screen.getByText(/Your booking is still active/)).toBeVisible();
    expect(screen.queryByText('We could not send the request')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Contact the club' })).toHaveAttribute(
      'href',
      '/contact',
    );
  });

  it('retries only reschedule options without reloading booking detail', async () => {
    const client = makeClient(eligible);
    vi.mocked(client.rescheduleOptions)
      .mockRejectedValueOnce({ code: 'OFFLINE_OR_REQUEST_FAILED' })
      .mockResolvedValueOnce(eligible);
    render(<BookingDetailView id={bookingId} client={client} />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('button', { name: 'Ask to reschedule' })).toBeVisible();
    expect(client.detail).toHaveBeenCalledTimes(1);
    expect(client.rescheduleOptions).toHaveBeenCalledTimes(2);
  });

  it('shows a blocking error only when booking detail cannot be loaded', async () => {
    const client = makeClient(eligible);
    vi.mocked(client.detail).mockRejectedValue({ code: 'RESOURCE_NOT_FOUND' });
    render(<BookingDetailView id={bookingId} client={client} />);

    expect(await screen.findByRole('heading', { name: 'Booking not available' })).toBeVisible();
    expect(screen.getByText('This booking did not load')).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Movers' })).not.toBeInTheDocument();
    expect(client.rescheduleOptions).not.toHaveBeenCalled();
  });

  it('keeps submit failures inside the reschedule form', async () => {
    const client = makeClient(eligible);
    vi.mocked(client.requestReschedule).mockRejectedValue({ code: 'TARGET_CLASS_FULL' });
    render(<BookingDetailView id={bookingId} client={client} />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Ask to reschedule' }));
    await user.click(screen.getByRole('button', { name: 'Review request' }));
    await user.click(screen.getByRole('button', { name: 'Send request' }));

    const form = screen.getByRole('form', { name: 'Reschedule request' });
    expect(await within(form).findByText('We could not send the request')).toBeVisible();
    expect(within(form).getByText('The new session is full.')).toBeVisible();
  });

  it('does not request reschedule options without the customer capability', async () => {
    sessionState.context = {
      status: 'authenticated',
      session: { roles: ['CUSTOMER'] },
      hasCapability: () => false,
    };
    const client = makeClient(eligible);
    render(<BookingDetailView id={bookingId} client={client} />);

    expect(await screen.findByRole('heading', { name: 'Movers' })).toBeVisible();
    await waitFor(() => expect(client.detail).toHaveBeenCalledTimes(1));
    expect(client.rescheduleOptions).not.toHaveBeenCalled();
    expect(screen.queryByText('Rescheduling is unavailable right now')).not.toBeInTheDocument();
  });
});
