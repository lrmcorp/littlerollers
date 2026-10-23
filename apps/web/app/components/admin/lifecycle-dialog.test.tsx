import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../app-feedback';
import { ApiError } from '../../lib/api-client';
import { lifecycleClient } from '../../api-clients/lifecycle-client';
import { LifecycleDialog, type LifecycleRequest } from './lifecycle-dialog';

vi.mock('../../api-clients/lifecycle-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api-clients/lifecycle-client')>();
  return {
    ...actual,
    lifecycleClient: { deletability: vi.fn(), remove: vi.fn(), archive: vi.fn() },
  };
});

const client = vi.mocked(lifecycleClient);
const branch = (action: LifecycleRequest['action']): LifecycleRequest => ({
  kind: 'branch',
  id: 'b1',
  name: 'Green Garden',
  action,
});

const show = (request: LifecycleRequest, extra: Partial<React.ComponentProps<typeof LifecycleDialog>> = {}) => {
  const onDone = vi.fn();
  const onClose = vi.fn();
  render(
    <AppFeedbackProvider>
      <LifecycleDialog request={request} onDone={onDone} onClose={onClose} {...extra} />
    </AppFeedbackProvider>,
  );
  return { onDone, onClose };
};

beforeEach(() => vi.clearAllMocks());

describe('LifecycleDialog', () => {
  it('explains what still points at the data instead of offering to delete it', async () => {
    client.deletability.mockResolvedValue({
      kind: 'branch',
      id: 'b1',
      deletable: false,
      blockers: [
        { kind: 'studio', label: 'studio', count: 3 },
        { kind: 'slot_kelas', label: 'jadwal kelas', count: 12 },
      ],
    });
    show(branch('delete'));
    expect(await screen.findByText('Cabang belum dapat dihapus')).toBeInTheDocument();
    expect(screen.getByText('Jadwal kelas')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hapus permanen' })).not.toBeInTheDocument();
    expect(client.remove).not.toHaveBeenCalled();
  });

  it('deletes clean data only with a reason, then reports success', async () => {
    client.deletability.mockResolvedValue({ kind: 'branch', id: 'b1', deletable: true, blockers: [] });
    client.remove.mockResolvedValue({ id: 'b1', deleted: true });
    const { onDone } = show(branch('delete'));
    const user = userEvent.setup();
    const confirm = await screen.findByRole('button', { name: 'Hapus permanen' });
    expect(confirm).toBeDisabled();
    await user.type(screen.getByLabelText('Alasan'), 'Salah input');
    await user.click(confirm);
    await waitFor(() => expect(client.remove).toHaveBeenCalledWith('branch', 'b1', 'Salah input'));
    expect(onDone).toHaveBeenCalledWith('Cabang "Green Garden" berhasil dihapus.');
  });

  it('archives with a reason', async () => {
    client.archive.mockResolvedValue({});
    const { onDone } = show(branch('archive'));
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Alasan'), 'Cabang ditutup');
    await user.click(screen.getByRole('button', { name: 'Arsipkan' }));
    await waitFor(() => expect(client.archive).toHaveBeenCalledWith('branch', 'b1', 'Cabang ditutup'));
    expect(onDone).toHaveBeenCalledWith('Cabang "Green Garden" berhasil diarsipkan.');
    expect(client.deletability).not.toHaveBeenCalled();
  });

  it('shows the server message and stays open when archiving is refused', async () => {
    client.archive.mockRejectedValue(new ApiError('x', 409, { code: 'HAS_UPCOMING_SLOTS' }));
    const { onDone } = show(branch('archive'));
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Alasan'), 'Cabang ditutup');
    await user.click(screen.getByRole('button', { name: 'Arsipkan' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Masih ada kelas yang akan berlangsung');
    expect(onDone).not.toHaveBeenCalled();
  });

  it('hands deactivation to the module (its endpoint differs) and uses "Jeda" wording for vouchers', async () => {
    const deactivate = vi.fn().mockResolvedValue(undefined);
    const { onDone } = show({ kind: 'voucher', id: 'v1', name: 'HEMAT', action: 'deactivate' }, { deactivate });
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Alasan'), 'Promo selesai');
    await user.click(screen.getByRole('button', { name: 'Jeda' }));
    await waitFor(() => expect(deactivate).toHaveBeenCalledWith('Promo selesai'));
    expect(onDone).toHaveBeenCalledWith('Voucher "HEMAT" berhasil dijeda.');
  });
});
