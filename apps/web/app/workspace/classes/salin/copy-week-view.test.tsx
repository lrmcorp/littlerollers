import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../../../components/app-feedback';
import type { ClassSlotClient } from '../../../api-clients/class-slot-client';
import { CopyWeekView } from './copy-week-view';

const capabilities = vi.hoisted(() => ({ list: ['class-slot:manage', 'class-slot:read'] as string[] }));
const branch = { id: 'branch-1', code: 'DD-GG', name: 'Daily Dose Green Garden', timezone: 'Asia/Jakarta' };

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('../../../session-context', () => ({
  useSessionContext: () => ({
    session: { id: 'u1', branches: [branch] },
    activeBranchId: 'branch-1',
    activeBranch: branch,
    hasCapability: (cap: string) => capabilities.list.includes(cap),
  }),
}));

const now = new Date('2026-10-26T03:00:00Z'); // Senin 26 Okt 2026, 10.00 WIB
const slot = (id: string, isoStart: string, overrides: Record<string, unknown> = {}) => ({
  id,
  branchId: 'branch-1',
  classTypeId: 'type-1',
  studioId: 'studio-1',
  roomId: 'room-1',
  instructorUserId: 'inst-1',
  startAt: new Date(isoStart),
  endAt: new Date(new Date(isoStart).getTime() + 3600_000),
  status: 'PUBLISHED',
  version: 1,
  ...overrides,
});
const sourceSlots = [slot('mon', '2026-10-26T02:00:00Z'), slot('wed', '2026-10-28T02:00:00Z', { roomId: 'room-2', instructorUserId: 'inst-2' })];

const clientWith = (target: unknown[] = [], overrides: Record<string, unknown> = {}) => {
  const discover = vi.fn().mockImplementation(async ({ from }: { from: Date }) => {
    const isSource = from.getTime() <= new Date('2026-10-26T02:00:00Z').getTime();
    return {
      slots: isSource ? sourceSlots : target,
      classTypes: [{ id: 'type-1', code: 'RF', name: 'Reformer Flow' }],
      instructors: [],
      studios: [],
    };
  });
  return {
    discover,
    create: vi.fn().mockImplementation(async (input: { startAt: Date }) => ({ id: `new-${input.startAt.getTime()}`, version: 1 })),
    publish: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as unknown as ClassSlotClient & { create: ReturnType<typeof vi.fn>; publish: ReturnType<typeof vi.fn> };
};

const renderCopy = (client: ClassSlotClient) =>
  render(
    <AppFeedbackProvider>
      <CopyWeekView client={client} initialNow={now} />
    </AppFeedbackProvider>,
  );

describe('CopyWeekView', () => {
  beforeEach(() => {
    capabilities.list = ['class-slot:manage', 'class-slot:read'];
  });

  it('previews how many classes will be created, then creates and publishes them after confirmation', async () => {
    const user = userEvent.setup();
    const client = clientWith();
    renderCopy(client);
    await user.click(await screen.findByRole('button', { name: 'Salin minggu ini ke minggu depan' }));
    const plan = await screen.findByRole('region', { name: 'Rencana salin' });
    expect(within(plan).getByRole('status')).toHaveTextContent('2 kelas akan dibuat');
    expect(client.create).not.toHaveBeenCalled();

    await user.click(within(plan).getByRole('button', { name: 'Buat 2 kelas' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Buat 2 kelas' }));
    await waitFor(() => expect(client.create).toHaveBeenCalledTimes(2));
    expect(client.create).toHaveBeenCalledWith(expect.objectContaining({ classTypeId: 'type-1', instructorUserId: 'inst-1', startAt: new Date('2026-11-02T02:00:00Z') }));
    await waitFor(() => expect(client.publish).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('2 kelas dibuat.')).toBeVisible();
  });

  it('leaves existing classes alone and names the ones it will not create', async () => {
    const user = userEvent.setup();
    const client = clientWith([slot('already', '2026-11-02T02:00:00Z', { bookedCount: 6 })]);
    renderCopy(client);
    await user.click(await screen.findByRole('button', { name: 'Salin minggu ini ke minggu depan' }));
    const plan = await screen.findByRole('region', { name: 'Rencana salin' });
    expect(within(plan).getByRole('status')).toHaveTextContent('1 kelas akan dibuat, 1 sudah ada');
    expect(within(plan).getByText('Sudah ada')).toBeVisible();
    expect(client.create).not.toHaveBeenCalled();
  });

  it('plans four weeks at once', async () => {
    const user = userEvent.setup();
    renderCopy(clientWith());
    await user.click(await screen.findByRole('button', { name: 'Salin ke empat minggu ke depan' }));
    const plan = await screen.findByRole('region', { name: 'Rencana salin' });
    expect(within(plan).getByRole('status')).toHaveTextContent('8 kelas akan dibuat');
  });

  it('reports the classes that could not be created and carries on with the rest', async () => {
    const user = userEvent.setup();
    const create = vi
      .fn()
      .mockRejectedValueOnce(new Error('409'))
      .mockResolvedValue({ id: 'ok', version: 1 });
    const client = clientWith([], { create });
    renderCopy(client);
    await user.click(await screen.findByRole('button', { name: 'Salin minggu ini ke minggu depan' }));
    const plan = await screen.findByRole('region', { name: 'Rencana salin' });
    await user.click(within(plan).getByRole('button', { name: 'Buat 2 kelas' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Buat 2 kelas' }));
    expect(await screen.findByText('1 kelas dibuat.')).toBeVisible();
    expect(screen.getByText(/1 kelas tidak dapat dibuat/)).toBeVisible();
  });

  it('refuses people without permission to manage classes', async () => {
    capabilities.list = ['class-slot:read'];
    renderCopy(clientWith());
    expect(await screen.findByText(/tidak memiliki izin mengelola kelas/)).toBeVisible();
  });
});
