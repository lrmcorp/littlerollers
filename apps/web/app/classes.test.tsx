import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ClassSlotView } from './classes/class-slot-view';
import type { ClassSlotClient } from './class-slot-client';

// Keep operational fixtures relative to execution time so the seven-day agenda remains relevant.
const now = new Date();
const slot = {
  id: 'slot-1',
  branchId: 'branch-1',
  classTypeId: 'type-1',
  instructorUserId: 'instructor-1',
  startAt: new Date(now.getTime() + 60 * 60 * 1000),
  endAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
  timezone: 'Asia/Jakarta',
  status: 'DRAFT' as const,
  minimumQuota: 2,
  capacity: 8,
  bookedCount: 1,
  cancellationReasonCode: null,
  version: 0,
  idempotentReplay: false,
};
const branch = { id: 'branch-1', name: 'Jakarta', timezone: 'Asia/Jakarta' };
const workspace = {
  slots: [slot],
  classTypes: [{ id: 'type-1', code: 'REF', name: 'Reformer' }],
  instructors: [{ id: 'instructor-1', displayName: 'Ayu Instructor' }],
};
const fake = (overrides: Partial<ClassSlotClient> = {}): ClassSlotClient => ({
  discover: vi.fn().mockResolvedValue(workspace),
  create: vi.fn().mockResolvedValue(slot),
  assign: vi.fn().mockResolvedValue({ ...slot, version: 1 }),
  publish: vi.fn().mockResolvedValue({ ...slot, status: 'PUBLISHED', version: 1 }),
  cancel: vi.fn().mockResolvedValue({ ...slot, status: 'CANCELLED', version: 1 }),
  ...overrides,
});
const readCapabilities = ['class-slot:read'] as const;
const manageCapabilities = ['class-slot:read', 'class-slot:manage', 'attendance:manage'] as const;

describe('ClassSlotView', () => {
  it('defaults to deny when no authoritative capability is available', () => {
    const client = fake();
    render(<ClassSlotView client={client} branchOverride={branch} />);
    expect(screen.getByRole('alert')).toHaveTextContent('class-slot:read');
    expect(client.discover).not.toHaveBeenCalled();
  });

  it('keeps an Owner-style read capability in read-only mode', async () => {
    render(
      <ClassSlotView
        client={fake()}
        branchOverride={branch}
        capabilitiesOverride={readCapabilities}
      />,
    );
    expect(screen.getByText('Read only')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Buat kelas' })).toBeDisabled();
  });

  it('requires an explicit authoritative branch for a branch-scoped reader', () => {
    render(<ClassSlotView client={fake()} capabilitiesOverride={readCapabilities} />);
    expect(
      screen.getByText('Pilih cabang aktif untuk membuka timetable sesuai scope Anda.'),
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Muat timetable' })).not.toBeInTheDocument();
  });

  it('loads a Super Owner global overview without selecting a branch', async () => {
    const client = fake();
    render(
      <ClassSlotView
        client={client}
        branchesOverride={[branch]}
        capabilitiesOverride={['class-slot:read', 'class-slot:manage', 'branch:all']}
      />,
    );
    expect(await screen.findByText('Semua cabang · ringkasan global')).toBeVisible();
    expect(screen.getByText('Scope global')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Buat kelas' })).toBeDisabled();
    expect(client.discover).toHaveBeenCalledWith(expect.objectContaining({ branchId: undefined }));
  });

  it('discovers labels, renders seven days, and publishes authoritative slot accessibly', async () => {
    const client = fake();
    const view = render(
      <ClassSlotView
        client={client}
        branchOverride={branch}
        capabilitiesOverride={manageCapabilities}
      />,
    );
    const user = userEvent.setup();
    const calendar = screen.getByRole('region', { name: 'Kalender kelas tujuh hari' });
    expect(await within(calendar).findByText('Reformer')).toBeInTheDocument();
    expect(calendar).toBeVisible();
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(7);
    await user.click(within(calendar).getByRole('button', { name: /Reformer/ }));
    const dialog = screen.getByRole('dialog', { name: 'Detail kelas' });
    expect(within(dialog).getAllByText('Ayu Instructor')[0]).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Publish kelas' }));
    expect(client.publish).toHaveBeenCalledWith('slot-1', 0);
    expect(await screen.findByText('Kelas berhasil dipublikasikan.')).toBeVisible();
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('creates a draft from branch-local fields without technical IDs', async () => {
    const client = fake({ discover: vi.fn().mockResolvedValue({ ...workspace, slots: [] }) });
    render(
      <ClassSlotView
        client={client}
        branchOverride={branch}
        capabilitiesOverride={manageCapabilities}
      />,
    );
    const user = userEvent.setup();
    await screen.findByText('Belum ada kelas pada minggu ini');
    await user.click(screen.getByRole('button', { name: 'Buat kelas' }));
    const dialog = screen.getByRole('dialog', { name: 'Buat kelas' });
    await user.selectOptions(within(dialog).getByLabelText('Class type'), 'type-1');
    await user.selectOptions(within(dialog).getByLabelText('Instructor'), 'instructor-1');
    await user.type(within(dialog).getByLabelText('Tanggal'), '2026-07-27');
    await user.type(within(dialog).getByLabelText('Mulai'), '09:00');
    await user.type(within(dialog).getByLabelText('Selesai eksklusif'), '10:00');
    await user.click(within(dialog).getByRole('button', { name: 'Buat draft' }));
    expect(client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: 'branch-1',
        classTypeId: 'type-1',
        instructorUserId: 'instructor-1',
        startAt: new Date('2026-07-27T02:00:00.000Z'),
        endAt: new Date('2026-07-27T03:00:00.000Z'),
      }),
    );
  });

  it('renders safe configuration failure', async () => {
    const client = fake({ discover: vi.fn().mockRejectedValue({ response: { status: 503 } }) });
    render(
      <ClassSlotView
        client={client}
        branchOverride={branch}
        capabilitiesOverride={manageCapabilities}
      />,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Konfigurasi quota atau capacity');
  });

  it('cancels with the controlled reason and authoritative version', async () => {
    const client = fake();
    render(
      <ClassSlotView
        client={client}
        branchOverride={branch}
        capabilitiesOverride={manageCapabilities}
      />,
    );
    const user = userEvent.setup();
    await screen.findAllByText('Reformer');
    await user.click(
      within(screen.getByRole('region', { name: 'Kalender kelas tujuh hari' })).getByRole(
        'button',
        { name: /Reformer/ },
      ),
    );
    const dialog = screen.getByRole('dialog', { name: 'Detail kelas' });
    await user.selectOptions(
      within(dialog).getByLabelText('Alasan pembatalan'),
      'INSTRUCTOR_UNAVAILABLE',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Konfirmasi pembatalan' }));
    expect(client.cancel).toHaveBeenCalledWith('slot-1', 'INSTRUCTOR_UNAVAILABLE', 0);
    expect(await screen.findByText('Kelas berhasil dibatalkan.')).toBeVisible();
  });
});
