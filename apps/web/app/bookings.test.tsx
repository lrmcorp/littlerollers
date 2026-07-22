import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { BookingView } from './bookings/booking-view';

const booking = {
  id: '00000000-0000-4000-8000-000000000201',
  branchId: '00000000-0000-4000-8000-000000000202',
  classSlotId: '00000000-0000-4000-8000-000000000203',
  customerUserId: '00000000-0000-4000-8000-000000000204',
  customerPackageId: '00000000-0000-4000-8000-000000000205',
  reservationId: '00000000-0000-4000-8000-000000000206',
  createdById: '00000000-0000-4000-8000-000000000207',
  source: 'ADMIN_ASSISTED' as const,
  status: 'BOOKED' as const,
  reservedQuantity: 1,
  createdAt: new Date(),
  version: 0,
  idempotentReplay: false,
};

describe('BookingView', () => {
  it('loads and creates an assisted booking accessibly', async () => {
    const client = {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue(booking),
    };
    const view = render(<BookingView client={client} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('ID cabang booking'), booking.branchId);
    await user.click(screen.getByRole('button', { name: 'Muat booking' }));
    await user.type(screen.getByLabelText('ID class slot'), booking.classSlotId);
    await user.type(screen.getByLabelText('ID customer'), booking.customerUserId);
    await user.type(screen.getByLabelText('ID customer package'), booking.customerPackageId);
    expect((await axe(view.container)).violations).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Konfirmasi booking satu sesi' }));
    expect(await screen.findByText(/BOOKED/)).toBeInTheDocument();
    expect(client.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'ADMIN_ASSISTED' }),
    );
  });

  it('shows deterministic capacity failure without optimistic success', async () => {
    const client = {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockRejectedValue({ code: 'CLASS_CAPACITY_FULL' }),
    };
    render(<BookingView client={client} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('ID cabang booking'), booking.branchId);
    await user.type(screen.getByLabelText('ID class slot'), booking.classSlotId);
    await user.type(screen.getByLabelText('ID customer'), booking.customerUserId);
    await user.type(screen.getByLabelText('ID customer package'), booking.customerPackageId);
    await user.click(screen.getByRole('button', { name: 'Konfirmasi booking satu sesi' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('CLASS_CAPACITY_FULL');
    expect(screen.queryByText(/BOOKED/)).not.toBeInTheDocument();
  });
});
