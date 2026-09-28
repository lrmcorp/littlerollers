import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../../components/app-feedback';
import type { AvailabilityClient, AvailabilityWindow } from '@/api-clients/availability-client';
import { AvailabilityView } from './availability-view';

let capabilities: string[] = [];
let activeBranch: { id: string; name: string; timezone: string } | null = {
  id: 'branch-1',
  name: 'Daily Dose Green Garden',
  timezone: 'Asia/Jakarta',
};

vi.mock('../../session-context', () => ({
  useSessionContext: () => ({
    status: 'authenticated',
    session: { capabilities },
    activeBranch,
    hasCapability: (...required: string[]) =>
      required.some((capability) => capabilities.includes(capability)),
  }),
}));

const window1: AvailabilityWindow = {
  id: 'avail-1',
  instructorUserId: 'instructor-1',
  branchId: 'branch-1',
  startAt: new Date('2026-11-21T01:00:00.000Z'),
  endAt: new Date('2026-11-21T02:00:00.000Z'),
  timezone: 'Asia/Jakarta',
  version: 1,
  status: 'ACTIVE',
};

const makeClient = (overrides: Partial<AvailabilityClient> = {}): AvailabilityClient => ({
  list: vi.fn().mockResolvedValue({ items: [window1], page: { hasMore: false, nextCursor: null } }),
  create: vi.fn().mockResolvedValue({ ...window1, id: 'avail-2', idempotentReplay: false }),
  ...overrides,
});

const renderView = (client: AvailabilityClient) =>
  render(
    <AppFeedbackProvider>
      <AvailabilityView client={client} />
    </AppFeedbackProvider>,
  );

describe('AvailabilityView', () => {
  beforeEach(() => {
    capabilities = ['availability:self:read', 'availability:self:create'];
    activeBranch = { id: 'branch-1', name: 'Daily Dose Green Garden', timezone: 'Asia/Jakarta' };
  });

  it('is forbidden without availability:self:read and never loads the list', async () => {
    capabilities = [];
    const client = makeClient();
    renderView(client);
    expect(
      await screen.findByText('Anda tidak memiliki izin untuk membaca ketersediaan mengajar.'),
    ).toBeVisible();
    expect(client.list).not.toHaveBeenCalled();
  });

  it('asks for an active branch before loading anything', async () => {
    activeBranch = null;
    const client = makeClient();
    renderView(client);
    expect(
      await screen.findByText('Pilih cabang aktif untuk mengajukan atau melihat ketersediaan mengajar Anda.'),
    ).toBeVisible();
    expect(client.list).not.toHaveBeenCalled();
  });

  it('lists submitted availability windows for the active branch', async () => {
    const client = makeClient();
    renderView(client);
    await waitFor(() => expect(client.list).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: 'branch-1' }),
    ));
    expect(await screen.findAllByText('Aktif')).not.toHaveLength(0);
  });

  it('hides the submission form for a read-only session', async () => {
    capabilities = ['availability:self:read'];
    const client = makeClient();
    renderView(client);
    await waitFor(() => expect(client.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Ajukan ketersediaan' })).toBeNull();
  });

  it('rejects an end time before the start time without calling the API', async () => {
    const user = userEvent.setup();
    const client = makeClient();
    renderView(client);
    await waitFor(() => expect(client.list).toHaveBeenCalled());

    await user.type(screen.getByLabelText('Tanggal'), '2026-12-01');
    await user.type(screen.getByLabelText('Mulai'), '10:00');
    await user.type(screen.getByLabelText('Selesai'), '09:00');
    await user.click(screen.getByRole('button', { name: 'Ajukan ketersediaan' }));

    expect(await screen.findByText('Waktu selesai harus setelah waktu mulai.')).toBeVisible();
    expect(client.create).not.toHaveBeenCalled();
  });

  it('submits a valid range after confirmation and refreshes the list', async () => {
    const user = userEvent.setup();
    const client = makeClient();
    renderView(client);
    await waitFor(() => expect(client.list).toHaveBeenCalled());

    await user.type(screen.getByLabelText('Tanggal'), '2026-12-01');
    await user.type(screen.getByLabelText('Mulai'), '08:00');
    await user.type(screen.getByLabelText('Selesai'), '09:00');
    await user.click(screen.getByRole('button', { name: 'Ajukan ketersediaan' }));

    await screen.findByRole('dialog', { name: 'Ajukan ketersediaan?' });
    await user.click(screen.getByRole('button', { name: 'Ajukan' }));

    await waitFor(() => expect(client.create).toHaveBeenCalledTimes(1));
    expect(client.create).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: 'branch-1' }),
    );
    expect(await screen.findByText('Ketersediaan berhasil diajukan.')).toBeVisible();
    expect(client.list).toHaveBeenCalledTimes(2);
  });

  it('surfaces the overlap conflict message from the API', async () => {
    const user = userEvent.setup();
    const client = makeClient({
      create: vi.fn().mockRejectedValue({ status: 409, data: { error: { code: 'EFFECTIVE_PERIOD_OVERLAP' } } }),
    });
    renderView(client);
    await waitFor(() => expect(client.list).toHaveBeenCalled());

    await user.type(screen.getByLabelText('Tanggal'), '2026-12-01');
    await user.type(screen.getByLabelText('Mulai'), '08:00');
    await user.type(screen.getByLabelText('Selesai'), '09:00');
    await user.click(screen.getByRole('button', { name: 'Ajukan ketersediaan' }));
    await screen.findByRole('dialog', { name: 'Ajukan ketersediaan?' });
    await user.click(screen.getByRole('button', { name: 'Ajukan' }));

    expect(
      await screen.findByText('Rentang waktu ini tumpang tindih dengan kelas yang sudah Anda ajar.'),
    ).toBeVisible();
  });
});
