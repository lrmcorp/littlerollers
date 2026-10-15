import { render as rtlRender, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BookingClient } from '@/api-clients/booking-client';
import { BookingView } from '@/bookings/booking-view';
import { AppFeedbackProvider } from '@/components/app-feedback';

const state = vi.hoisted(() => ({ branchId: '', setBranch: vi.fn() }));
vi.mock('../session-context', () => ({
  useActiveBranchState: () => [state.branchId, state.setBranch],
  useSessionContext: () => ({
    status: 'authenticated',
    session: {
      branches: [
        { id: 'b1', code: 'DD-GG', name: 'Daily Dose Green Garden', timezone: 'Asia/Jakarta' },
        { id: 'b2', code: 'DD-MK', name: 'Daily Dose Muara Karang', timezone: 'Asia/Jakarta' },
      ],
    },
    hasCapability: () => true,
    activeBranchId: state.branchId,
    activeBranch: null,
    setActiveBranchId: state.setBranch,
  }),
}));

const render = (view: React.ReactNode) =>
  rtlRender(view, {
    wrapper: ({ children }) => <AppFeedbackProvider>{children}</AppFeedbackProvider>,
  });

const client = {
  options: vi.fn(),
  discover: vi.fn().mockResolvedValue({ customers: [], packages: [], slots: [] }),
  list: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
  detail: vi.fn(),
  rescheduleOptions: vi.fn(),
  create: vi.fn(),
  listReschedules: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
  requestReschedule: vi.fn(),
  decideReschedule: vi.fn(),
} as unknown as BookingClient;

describe('Buat booking manual pada mode Semua cabang', () => {
  beforeEach(() => {
    state.branchId = '';
    state.setBranch.mockReset();
  });

  it('tombol tetap bisa diklik dan meminta pilih cabang, bukan mati', async () => {
    const user = userEvent.setup();
    render(<BookingView client={client} access={{ canRead: true, canCreate: true, canReview: true, canDecide: true }} />);
    const button = await screen.findByRole('button', { name: 'Buat booking manual' });
    expect(button).toBeEnabled();
    await user.click(button);

    const dialog = await screen.findByRole('dialog', { name: 'Pilih cabang' });
    await user.selectOptions(within(dialog).getByLabelText('Cabang'), 'b2');
    await user.click(within(dialog).getByRole('button', { name: 'Lanjutkan' }));

    await waitFor(() => expect(state.setBranch).toHaveBeenCalledWith('b2'));
  });
});
