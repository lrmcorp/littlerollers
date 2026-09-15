import { render as rtlRender, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ClassSlotView } from '@/classes/class-slot-view';
import type { ClassSlotClient } from '@/api-clients/class-slot-client';
import type { BookingClient, BookingPage } from '@/api-clients/booking-client';
import { AppFeedbackProvider } from '@/components/app-feedback';

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
  studios: [
    {
      id: 'studio-1',
      branchId: 'branch-1',
      code: 'MAIN',
      name: 'Area Studio Utama',
      rooms: [],
    },
  ],
};
const fake = (overrides: Partial<ClassSlotClient> = {}): ClassSlotClient => ({
  discover: vi.fn().mockResolvedValue(workspace),
  create: vi.fn().mockResolvedValue(slot),
  update: vi.fn().mockResolvedValue({ ...slot, version: 1 }),
  assign: vi.fn().mockResolvedValue({ ...slot, version: 1 }),
  publish: vi.fn().mockResolvedValue({ ...slot, status: 'PUBLISHED', version: 1 }),
  cancel: vi.fn().mockResolvedValue({ ...slot, status: 'CANCELLED', version: 1 }),
  completionControl: vi.fn().mockResolvedValue({
    classSlotId: slot.id,
    expectedVersion: slot.version,
    controlHash: 'a'.repeat(64),
    attendanceCount: 1,
    noShowCount: 0,
    activeReservationCount: 1,
  }),
  complete: vi.fn().mockResolvedValue({
    classSlotId: slot.id,
    status: 'COMPLETED',
    attendanceCount: 1,
    noShowCount: 0,
    releasedReservationIds: [],
    ledgerEntryIds: ['ledger-1'],
    hourLogIds: [],
    auditLogId: 'audit-1',
    outboxEventIds: ['outbox-1'],
    completedAt: new Date(),
    idempotentReplay: false,
  }),
  ...overrides,
});
const readCapabilities = ['class-slot:read'] as const;
const manageCapabilities = ['class-slot:read', 'class-slot:manage', 'attendance:manage'] as const;
const render = (view: React.ReactNode) =>
  rtlRender(<AppFeedbackProvider>{view}</AppFeedbackProvider>);

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
    expect(screen.getByText('Hanya lihat')).toBeVisible();
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
    expect(screen.getByText('Semua Cabang')).toBeVisible();
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
    const dialog = screen.getByRole('dialog', { name: 'Reformer' });
    expect(within(dialog).getAllByText('Ayu Instructor')[0]).toBeVisible();
    await user.click(within(dialog).getByRole('button', { name: 'Publish kelas' }));
    await user.click(screen.getByRole('button', { name: 'Publikasikan' }));
    expect(client.publish).toHaveBeenCalledWith('slot-1', 0);
    expect(await screen.findByText('Kelas berhasil dipublikasikan.')).toBeVisible();
    const accessibility = await axe(view.container);
    expect(
      accessibility.violations,
      accessibility.violations
        .map(({ id, nodes }) => `${id}: ${nodes[0]?.failureSummary}`)
        .join('\n'),
    ).toHaveLength(0);
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
    const dialog = screen.getByRole('dialog', { name: 'Buat draft kelas' });
    const classType = within(dialog).getByRole('combobox', { name: /Tipe kelas/ });
    await user.click(classType);
    await user.click(within(dialog).getByRole('option', { name: /Reformer/ }));
    const studio = within(dialog).getByRole('combobox', { name: /Area Studio/ });
    await user.click(studio);
    await user.click(within(dialog).getByRole('option', { name: /Area Studio Utama/ }));
    const instructor = within(dialog).getByRole('combobox', { name: /Instruktur/ });
    await user.click(instructor);
    await user.click(within(dialog).getByRole('option', { name: /Ayu Instructor/ }));
    await user.type(within(dialog).getByLabelText('Tanggal'), '2026-07-27');
    await user.type(within(dialog).getByLabelText('Mulai'), '09:00');
    await user.type(within(dialog).getByLabelText('Selesai eksklusif'), '10:00');
    await user.click(within(dialog).getByRole('button', { name: 'Buat draft' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Buat draft kelas?' })).getByRole('button', {
        name: 'Buat draft',
      }),
    );
    expect(client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        branchId: 'branch-1',
        classTypeId: 'type-1',
        studioId: 'studio-1',
        instructorUserId: 'instructor-1',
        startAt: new Date('2026-07-27T02:00:00.000Z'),
        endAt: new Date('2026-07-27T03:00:00.000Z'),
      }),
    );
  });

  it('edits only a draft with an authoritative version and reason', async () => {
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
    const dialog = screen.getByRole('dialog', { name: 'Reformer' });
    await user.click(within(dialog).getByRole('button', { name: 'Edit kelas' }));
    const form = within(dialog).getByRole('form', { name: 'Edit draft kelas' });
    await user.type(within(form).getByLabelText('Alasan perubahan'), 'Penyesuaian jadwal studio');
    await user.click(within(form).getByRole('button', { name: 'Simpan perubahan kelas' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Simpan perubahan kelas?' })).getByRole('button', {
        name: 'Simpan perubahan',
      }),
    );
    expect(client.update).toHaveBeenCalledWith(
      'slot-1',
      expect.objectContaining({
        classTypeId: 'type-1',
        instructorUserId: 'instructor-1',
        expectedVersion: 0,
        reason: 'Penyesuaian jadwal studio',
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

  it('loads a capability-scoped roster for the selected class slot', async () => {
    const rosterPage = {
      items: [
        {
          id: 'booking-1',
          status: 'BOOKED',
          customer: {
            id: 'customer-1',
            displayName: 'Customer Demo',
            phoneMasked: '+62••••1234',
          },
          package: { id: 'package-1', name: 'Reformer 10' },
          sessionBalance: { ledgerBalance: 8, reserved: 1, available: 7 },
        },
      ],
      summary: {
        total: 1,
        booked: 1,
        reschedulePending: 0,
        attended: 0,
        cancelled: 0,
        noShow: 0,
      },
      nextCursor: null,
    } as unknown as BookingPage;
    const bookingClient: Pick<BookingClient, 'list'> = {
      list: vi.fn().mockResolvedValue(rosterPage),
    };
    render(
      <ClassSlotView
        client={fake()}
        bookingClient={bookingClient}
        branchOverride={branch}
        capabilitiesOverride={[...manageCapabilities, 'booking:read']}
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
    const dialog = screen.getByRole('dialog', { name: 'Reformer' });
    expect((await within(dialog).findAllByText('Customer Demo')).length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText('+62••••1234').length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText(/7 sesi tersedia/).length).toBeGreaterThan(0);
    expect(bookingClient.list).toHaveBeenCalledWith(
      expect.objectContaining({ classSlotId: 'slot-1', limit: 10 }),
    );
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
    const dialog = screen.getByRole('dialog', { name: 'Reformer' });
    await user.selectOptions(
      within(dialog).getByLabelText('Alasan pembatalan'),
      'INSTRUCTOR_UNAVAILABLE',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Konfirmasi pembatalan' }));
    await user.click(screen.getByRole('button', { name: 'Batalkan kelas' }));
    expect(client.cancel).toHaveBeenCalledWith('slot-1', 'INSTRUCTOR_UNAVAILABLE', 0);
    expect(await screen.findByText('Kelas berhasil dibatalkan.')).toBeVisible();
  });
});
