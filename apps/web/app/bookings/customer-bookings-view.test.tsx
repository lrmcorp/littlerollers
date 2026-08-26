import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { BookingClient, CustomerBookingRecord } from '@/api-clients/booking-client';
import { CustomerBookingsView } from './customer-bookings-view';

const record = (overrides: Partial<CustomerBookingRecord> = {}): CustomerBookingRecord =>
  ({
    id: '00000000-0000-4000-8000-000000000201',
    branchId: '00000000-0000-4000-8000-000000000202',
    classSlotId: '00000000-0000-4000-8000-000000000203',
    customerUserId: '00000000-0000-4000-8000-000000000204',
    customerPackageId: '00000000-0000-4000-8000-000000000205',
    reservationId: '00000000-0000-4000-8000-000000000206',
    createdById: '00000000-0000-4000-8000-000000000204',
    source: 'SELF',
    status: 'BOOKED',
    reservedQuantity: 1,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    version: 0,
    idempotentReplay: false,
    branch: {
      id: '00000000-0000-4000-8000-000000000202',
      name: 'Daily Dose BSD',
      timezone: 'Asia/Jakarta',
    },
    classSlot: {
      id: '00000000-0000-4000-8000-000000000203',
      startAt: new Date('2027-01-10T03:00:00Z'),
      endAt: new Date('2027-01-10T04:00:00Z'),
      timezone: 'Asia/Jakarta',
      status: 'CONFIRMED',
      classType: {
        id: '00000000-0000-4000-8000-000000000207',
        name: 'Reformer Pilates',
      },
    },
    ...overrides,
  }) as CustomerBookingRecord;

describe('customer booking timeline', () => {
  it('loads upcoming first and switches to chronological history', async () => {
    const client = {
      list: vi
        .fn()
        .mockResolvedValueOnce({ items: [record()], nextCursor: null })
        .mockResolvedValueOnce({
          items: [
            record({
              id: '00000000-0000-4000-8000-000000000208',
              classSlot: {
                ...record().classSlot!,
                startAt: new Date('2020-01-10T03:00:00Z'),
                endAt: new Date('2020-01-10T04:00:00Z'),
              },
            }),
          ],
          nextCursor: null,
        }),
    } as unknown as BookingClient;

    render(<CustomerBookingsView client={client} />);
    expect(await screen.findByText('Reformer Pilates')).toBeVisible();
    expect(client.list).toHaveBeenCalledWith({
      timeline: 'UPCOMING',
      cursor: undefined,
      limit: 20,
    });

    await userEvent.click(screen.getByRole('tab', { name: 'Riwayat' }));
    expect(await screen.findByText('Status kehadiran sedang diproses')).toBeVisible();
    await waitFor(() =>
      expect(client.list).toHaveBeenCalledWith({
        timeline: 'HISTORY',
        cursor: undefined,
        limit: 20,
      }),
    );
  });

  it('navigates across more than twenty bookings without appending duplicate cards', async () => {
    const first = Array.from({ length: 20 }, (_, index) =>
      record({
        id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
        classSlot: {
          ...record().classSlot!,
          classType: { ...record().classSlot!.classType, name: `Kelas ${index + 1}` },
        },
      }),
    );
    const second = Array.from({ length: 5 }, (_, index) =>
      record({
        id: `10000000-0000-4000-8000-${String(index + 21).padStart(12, '0')}`,
        classSlot: {
          ...record().classSlot!,
          classType: { ...record().classSlot!.classType, name: `Kelas ${index + 21}` },
        },
      }),
    );
    const client = {
      list: vi.fn(({ cursor }: { cursor?: string }) =>
        Promise.resolve(
          cursor
            ? { items: second, nextCursor: null, summary: { total: 25 } }
            : { items: first, nextCursor: 'booking-20', summary: { total: 25 } },
        ),
      ),
    } as unknown as BookingClient;

    render(<CustomerBookingsView client={client} />);
    expect(await screen.findByText('Kelas 1')).toBeVisible();
    expect(screen.getByText('Halaman 1 · 20 data dari 25 booking')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Berikutnya' }));
    expect(await screen.findByText('Kelas 21')).toBeVisible();
    expect(screen.queryByText('Kelas 1')).not.toBeInTheDocument();
    expect(screen.getByText('Halaman 2 · 5 data dari 25 booking')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Sebelumnya' }));
    expect(await screen.findByText('Kelas 1')).toBeVisible();
  });
});
