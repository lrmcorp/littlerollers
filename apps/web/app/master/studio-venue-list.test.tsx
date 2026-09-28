import { render as rtlRender, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Studio } from '@/api-clients/master-client';
import { AppFeedbackProvider } from '@/components/app-feedback';
import { StudioVenueList } from '@/master/studio-venue-list';

const studios: Studio[] = [
  {
    id: 'studio-1',
    branchId: 'branch-1',
    code: 'ST-1',
    name: 'Studio 1',
    equipmentText: 'Reformer x5',
    active: true,
    rooms: [
      { id: 'room-1', studioId: 'studio-1', code: 'R1', name: 'Ruang A', capacity: 5, active: true },
      { id: 'room-2', studioId: 'studio-1', code: 'R2', name: 'Ruang B', capacity: null, active: false },
    ],
  },
  { id: 'studio-2', branchId: 'branch-1', code: 'ST-2', name: 'Studio Lama', active: false, rooms: [] },
];

const setup = (canManage = true) => {
  const client = {
    updateStudio: vi.fn().mockResolvedValue({}),
    updateRoom: vi.fn().mockResolvedValue({}),
  };
  const onChanged = vi.fn();
  const onFailure = vi.fn();
  rtlRender(
    <AppFeedbackProvider>
      <StudioVenueList
        studios={studios}
        canManage={canManage}
        client={client}
        onChanged={onChanged}
        onFailure={onFailure}
      />
    </AppFeedbackProvider>,
  );
  return { client, onChanged, onFailure };
};

describe('StudioVenueList', () => {
  it('labels inactive areas and rooms and offers to reactivate them', () => {
    setup();
    expect(screen.getByText('Ruang B · R2 (nonaktif)')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Aktifkan ruangan Ruang B' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Aktifkan kembali' })).toBeVisible();
  });

  it('hides every action without master:manage', () => {
    setup(false);
    expect(screen.queryByRole('button', { name: 'Ubah area' })).toBeNull();
    expect(screen.queryByRole('button', { name: /ruangan Ruang A/ })).toBeNull();
  });

  it('edits an area name and equipment', async () => {
    const user = userEvent.setup();
    const { client, onChanged } = setup();
    await user.click(screen.getAllByRole('button', { name: 'Ubah area' })[0]!);
    const dialog = screen.getByRole('dialog', { name: 'Ubah area studio' });
    await user.clear(within(dialog).getByLabelText('Nama area'));
    await user.type(within(dialog).getByLabelText('Nama area'), 'Studio Utama');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() =>
      expect(client.updateStudio).toHaveBeenCalledWith('studio-1', {
        name: 'Studio Utama',
        equipmentText: 'Reformer x5',
      }),
    );
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith('Area studio diperbarui.'));
  });

  it('deactivates a room only after confirming, and shows the readable refusal when classes remain', async () => {
    const user = userEvent.setup();
    const { client, onFailure } = setup();
    client.updateRoom.mockImplementation(async () => {
      throw { status: 409, data: { code: 'HAS_UPCOMING_SLOTS' } };
    });
    await user.click(screen.getByRole('button', { name: 'Nonaktifkan ruangan Ruang A' }));
    const confirm = await screen.findByRole('dialog', { name: 'Nonaktifkan ruangan?' });
    expect(client.updateRoom).not.toHaveBeenCalled();
    await user.click(within(confirm).getByRole('button', { name: 'Nonaktifkan' }));
    await waitFor(() =>
      expect(client.updateRoom).toHaveBeenCalledWith('room-1', {
        name: 'Ruang A',
        capacity: 5,
        active: false,
      }),
    );
    await waitFor(() =>
      expect(onFailure).toHaveBeenCalledWith(expect.stringContaining('kelas terjadwal')),
    );
  });

  it('reactivates an area after confirming without resending its equipment', async () => {
    const user = userEvent.setup();
    const { client } = setup();
    await user.click(screen.getByRole('button', { name: 'Aktifkan kembali' }));
    const confirm = await screen.findByRole('dialog', { name: 'Aktifkan area studio?' });
    await user.click(within(confirm).getByRole('button', { name: 'Aktifkan' }));
    await waitFor(() =>
      expect(client.updateStudio).toHaveBeenCalledWith('studio-2', { name: 'Studio Lama', active: true }),
    );
  });
});
