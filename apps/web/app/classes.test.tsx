import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ClassSlotView } from './classes/class-slot-view';
const slot = {
  id: 'slot-1',
  branchId: 'branch-1',
  classTypeId: 'type-1',
  instructorUserId: 'instructor-1',
  startAt: new Date(),
  endAt: new Date(),
  timezone: 'Asia/Jakarta',
  status: 'DRAFT' as const,
  minimumQuota: 2,
  capacity: 8,
  bookedCount: 0,
  cancellationReasonCode: null,
  version: 0,
  idempotentReplay: false,
};
describe('ClassSlotView', () => {
  it('lists and transitions typed class slots accessibly', async () => {
    const client = {
      list: vi.fn().mockResolvedValue([slot]),
      create: vi.fn(),
      assign: vi.fn().mockResolvedValue({ ...slot, version: 1 }),
      publish: vi.fn().mockResolvedValue({ ...slot, status: 'PUBLISHED', version: 1 }),
      cancel: vi.fn().mockResolvedValue({ ...slot, status: 'CANCELLED', version: 1 }),
    };
    const view = render(<ClassSlotView client={client} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('ID cabang kelas'), 'branch-1');
    await user.click(screen.getByRole('button', { name: 'Muat class slot' }));
    expect(await screen.findByText(/quota 2\/8/)).toBeInTheDocument();
    expect((await axe(view.container)).violations).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: 'Publish' }));
    expect(client.publish).toHaveBeenCalledWith('slot-1', 0);
  });
  it('renders deterministic configuration failure', async () => {
    const client = {
      list: vi.fn().mockRejectedValue({ response: { status: 503 } }),
      create: vi.fn(),
      assign: vi.fn(),
      publish: vi.fn(),
      cancel: vi.fn(),
    };
    render(<ClassSlotView client={client} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('ID cabang kelas'), 'branch-1');
    await user.click(screen.getByRole('button', { name: 'Muat class slot' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('CONFIGURATION_REQUIRED');
  });
});
