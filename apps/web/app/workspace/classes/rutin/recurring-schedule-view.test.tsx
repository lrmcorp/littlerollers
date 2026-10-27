import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../../../components/app-feedback';
import type { ClassSlotClient } from '../../../api-clients/class-slot-client';
import { RecurringScheduleView } from './recurring-schedule-view';

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
const workspace = {
  slots: [] as unknown[],
  classTypes: [{ id: 'type-1', code: 'RF', name: 'Reformer Flow' }],
  instructors: [{ id: 'inst-1', displayName: 'Sarah Kartika' }],
  studios: [{ id: 'studio-1', branchId: 'branch-1', code: 'S1', name: 'Studio Utama', rooms: [{ id: 'room-1', studioId: 'studio-1', code: 'R1', name: 'Ruang 1' }] }],
};

const clientWith = (existing: unknown[] = [], overrides: Record<string, unknown> = {}) =>
  ({
    discover: vi.fn().mockImplementation(async () => ({ ...workspace, slots: existing })),
    create: vi.fn().mockImplementation(async (input: { startAt: Date }) => ({ id: `new-${input.startAt.getTime()}`, version: 1 })),
    publish: vi.fn().mockResolvedValue({}),
    ...overrides,
  }) as unknown as ClassSlotClient & { create: ReturnType<typeof vi.fn>; publish: ReturnType<typeof vi.fn> };

const renderView = (client: ClassSlotClient) =>
  render(
    <AppFeedbackProvider>
      <RecurringScheduleView client={client} initialNow={now} />
    </AppFeedbackProvider>,
  );

async function fillForm(user: ReturnType<typeof userEvent.setup>, { instructor = true } = {}) {
  await user.click(await screen.findByRole('button', { name: 'Senin' }));
  await user.click(screen.getByRole('button', { name: 'Rabu' }));
  await user.selectOptions(screen.getByLabelText('Tipe kelas'), 'type-1');
  await user.selectOptions(screen.getByLabelText('Studio'), 'studio-1');
  if (instructor) await user.selectOptions(screen.getByLabelText('Instruktur'), 'inst-1');
  const from = screen.getByLabelText('Tanggal mulai');
  const until = screen.getByLabelText('Tanggal akhir');
  await user.clear(from);
  await user.type(from, '2026-11-02');
  await user.clear(until);
  await user.type(until, '2026-11-15');
}

describe('RecurringScheduleView', () => {
  beforeEach(() => {
    capabilities.list = ['class-slot:manage', 'class-slot:read'];
  });

  it('writes the weekday buttons with three letters', async () => {
    renderView(clientWith());
    for (const name of ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'])
      expect(await screen.findByRole('button', { name })).toBeVisible();
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(
      expect.arrayContaining(['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']),
    );
  });

  it('asks for what is missing instead of guessing', async () => {
    const user = userEvent.setup();
    renderView(clientWith());
    await user.click(await screen.findByRole('button', { name: 'Lihat rencana' }));
    expect(await screen.findByText('Pilih tipe kelas.')).toBeVisible();
  });

  it('previews the count first, then creates and publishes after confirmation', async () => {
    const user = userEvent.setup();
    const client = clientWith();
    renderView(client);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Lihat rencana' }));
    const plan = await screen.findByRole('region', { name: 'Rencana jadwal rutin' });
    expect(within(plan).getByRole('status')).toHaveTextContent('4 kelas akan dibuat');
    expect(client.create).not.toHaveBeenCalled();

    await user.click(within(plan).getByRole('button', { name: 'Buat 4 kelas' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Buat 4 kelas' }));
    await waitFor(() => expect(client.create).toHaveBeenCalledTimes(4));
    expect(client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        classTypeId: 'type-1',
        studioId: 'studio-1',
        instructorUserId: 'inst-1',
        startAt: new Date('2026-11-02T02:00:00Z'),
        endAt: new Date('2026-11-02T03:00:00Z'),
      }),
    );
    await waitFor(() => expect(client.publish).toHaveBeenCalledTimes(4));
    expect(await screen.findByText('4 kelas dibuat.')).toBeVisible();
  });

  it('does not publish classes that have no instructor yet', async () => {
    const user = userEvent.setup();
    const client = clientWith();
    renderView(client);
    await fillForm(user, { instructor: false });
    await user.click(screen.getByRole('button', { name: 'Lihat rencana' }));
    const plan = await screen.findByRole('region', { name: 'Rencana jadwal rutin' });
    expect(within(plan).queryByLabelText('Terbitkan kelas setelah dibuat')).not.toBeInTheDocument();
    await user.click(within(plan).getByRole('button', { name: 'Buat 4 kelas' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Buat 4 kelas' }));
    await waitFor(() => expect(client.create).toHaveBeenCalledTimes(4));
    expect(client.publish).not.toHaveBeenCalled();
  });

  it('leaves booked classes alone and names the dates it will skip', async () => {
    const user = userEvent.setup();
    const booked = {
      id: 'booked',
      branchId: 'branch-1',
      classTypeId: 'type-1',
      studioId: 'studio-1',
      roomId: null,
      instructorUserId: 'inst-1',
      startAt: new Date('2026-11-02T02:00:00Z'),
      endAt: new Date('2026-11-02T03:00:00Z'),
      status: 'PUBLISHED',
      bookedCount: 6,
      version: 3,
    };
    const client = clientWith([booked]);
    renderView(client);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Lihat rencana' }));
    const plan = await screen.findByRole('region', { name: 'Rencana jadwal rutin' });
    expect(within(plan).getByRole('status')).toHaveTextContent('3 kelas akan dibuat, 1 sudah ada');
    expect(within(plan).getByText('Sudah ada')).toBeVisible();
    expect(within(plan).getByText(/2 Nov 2026/)).toBeVisible();
  });

  it('reports the classes the server refused and carries on with the rest', async () => {
    const user = userEvent.setup();
    const create = vi.fn().mockRejectedValueOnce(new Error('409')).mockResolvedValue({ id: 'ok', version: 1 });
    renderView(clientWith([], { create }));
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Lihat rencana' }));
    const plan = await screen.findByRole('region', { name: 'Rencana jadwal rutin' });
    await user.click(within(plan).getByRole('button', { name: 'Buat 4 kelas' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Buat 4 kelas' }));
    expect(await screen.findByText('3 kelas dibuat.')).toBeVisible();
    expect(screen.getByText(/1 kelas tidak dapat dibuat/)).toBeVisible();
  });

  it('refuses people without permission to manage classes', async () => {
    capabilities.list = ['class-slot:read'];
    renderView(clientWith());
    expect(await screen.findByText(/tidak memiliki izin mengelola kelas/)).toBeVisible();
  });
});
