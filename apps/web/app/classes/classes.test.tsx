import { render as rtlRender, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ClassSlotView } from '@/classes/class-slot-view';
import type { ClassSlotClient } from '@/api-clients/class-slot-client';
import type { BookingClient, BookingPage } from '@/api-clients/booking-client';
import { AppFeedbackProvider } from '@/components/app-feedback';
import QRCode from 'qrcode';

vi.mock('qrcode', () => ({ default: { toCanvas: vi.fn().mockResolvedValue(undefined) } }));

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

  it('shows the instructor and class names sent with the slot instead of id fragments', async () => {
    const named = {
      ...slot,
      instructorUserId: 'a45ec6c1-0000-4000-8000-000000000000',
      instructor: { displayName: 'Sarah Coach' },
      classType: { name: 'Reformer Pilates' },
    };
    render(
      <ClassSlotView
        client={fake({ discover: vi.fn().mockResolvedValue({ ...workspace, slots: [named] }) })}
        branchOverride={branch}
        capabilitiesOverride={readCapabilities}
      />,
    );
    expect((await screen.findAllByText('Sarah Coach')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reformer Pilates').length).toBeGreaterThan(0);
  });

  it('never prints an id fragment when the instructor is not in the loaded lists', async () => {
    const orphan = { ...slot, instructorUserId: 'a45ec6c1-0000-4000-8000-000000000000' };
    const view = render(
      <ClassSlotView
        client={fake({ discover: vi.fn().mockResolvedValue({ ...workspace, slots: [orphan] }) })}
        branchOverride={branch}
        capabilitiesOverride={readCapabilities}
      />,
    );
    expect((await screen.findAllByText('Instruktur belum dimuat')).length).toBeGreaterThan(0);
    expect(view.container).not.toHaveTextContent('a45ec6c1');
  });

  it('requires an explicit authoritative branch for a branch-scoped reader', () => {
    render(<ClassSlotView client={fake()} capabilitiesOverride={readCapabilities} />);
    expect(
      screen.getByText('Pilih cabang aktif untuk membuka timetable sesuai cakupan Anda.'),
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
    expect(await screen.findByText(/Pantau jadwal seluruh cabang/)).toBeVisible();
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
    await user.click(within(dialog).getByRole('button', { name: 'Publikasikan kelas' }));
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
    await user.click(within(dialog).getByRole('button', { name: 'Batalkan kelas ini' }));
    await user.click(screen.getByRole('button', { name: 'Batalkan kelas' }));
    expect(client.cancel).toHaveBeenCalledWith('slot-1', 'INSTRUCTOR_UNAVAILABLE', 0);
    expect(await screen.findByText('Kelas berhasil dibatalkan.')).toBeVisible();
  });
});

describe('ClassSlotView instructor attendance verification', () => {
  const confirmedSlot = { ...slot, status: 'CONFIRMED' as const };
  const openDetail = async (client: ClassSlotClient, capabilities: readonly string[]) => {
    render(
      <ClassSlotView
        client={client}
        branchOverride={branch}
        capabilitiesOverride={capabilities}
      />,
    );
    const user = userEvent.setup();
    const calendar = screen.getByRole('region', { name: 'Kalender kelas tujuh hari' });
    await within(calendar).findByText('Reformer');
    await user.click(within(calendar).getByRole('button', { name: /Reformer/ }));
    return { user, dialog: screen.getByRole('dialog', { name: 'Reformer' }) };
  };
  const withSlot = (over: Record<string, unknown>, extra: Partial<ClassSlotClient> = {}) =>
    fake({
      discover: vi.fn().mockResolvedValue({ ...workspace, slots: [{ ...confirmedSlot, ...over }] }),
      ...extra,
    });

  it('lets staff with attendance:manage verify a missing instructor attendance after confirming', async () => {
    const verify = vi.fn().mockResolvedValue({
      classSlotId: slot.id,
      checkedInAt: new Date().toISOString(),
      method: 'MANUAL_FRONTDESK',
      alreadyRecorded: false,
    });
    const client = withSlot({}, { verifyInstructorAttendance: verify });
    const { user, dialog } = await openDetail(client, manageCapabilities);

    expect(within(dialog).getByText(/Belum tercatat/)).toBeVisible();
    await user.type(within(dialog).getByLabelText('Catatan (opsional)'), 'lupa scan');
    await user.click(within(dialog).getByRole('button', { name: 'Verifikasi presensi instruktur' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Verifikasi presensi instruktur?' })).getByRole(
        'button',
        { name: 'Verifikasi' },
      ),
    );

    expect(verify).toHaveBeenCalledWith('slot-1', 'lupa scan');
    expect(await screen.findByText('Presensi instruktur berhasil dicatat.')).toBeVisible();
    expect(await within(dialog).findByText(/verifikasi manual admin/)).toBeVisible();
    expect(within(dialog).queryByRole('button', { name: 'Verifikasi presensi instruktur' })).toBeNull();
  });

  it('shows already recorded attendance without offering to verify again', async () => {
    const client = withSlot(
      { instructorAttendance: { checkedInAt: new Date().toISOString(), method: 'QR_SCAN' } },
      { verifyInstructorAttendance: vi.fn() },
    );
    const { dialog } = await openDetail(client, manageCapabilities);
    expect(within(dialog).getByText(/melalui scan QR/)).toBeVisible();
    expect(within(dialog).queryByRole('button', { name: 'Verifikasi presensi instruktur' })).toBeNull();
  });

  it('shows the status but hides the verify action without attendance:manage', async () => {
    const client = withSlot({}, { verifyInstructorAttendance: vi.fn() });
    const { dialog } = await openDetail(client, ['class-slot:read', 'class-slot:manage']);
    expect(within(dialog).getByText(/Belum tercatat/)).toBeVisible();
    expect(within(dialog).queryByRole('button', { name: 'Verifikasi presensi instruktur' })).toBeNull();
  });

  it('surfaces a clear message when attendance is recorded before the check-in window opens', async () => {
    const verify = vi.fn().mockRejectedValue({ status: 409, data: { error: { code: 'CHECK_IN_TOO_EARLY' } } });
    const client = withSlot({}, { verifyInstructorAttendance: verify });
    const { user, dialog } = await openDetail(client, manageCapabilities);
    await user.click(within(dialog).getByRole('button', { name: 'Verifikasi presensi instruktur' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Verifikasi presensi instruktur?' })).getByRole(
        'button',
        { name: 'Verifikasi' },
      ),
    );
    expect(
      await screen.findByText('Presensi baru dapat dicatat mulai 30 menit sebelum kelas dimulai.'),
    ).toBeVisible();
  });
});

describe('ClassSlotView instructor check-in QR for studio staff', () => {
  const confirmedSlot = { ...slot, status: 'CONFIRMED' as const };
  const issue = {
    id: 'tok-1',
    resourceId: slot.id,
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
    qrPayload: 'dd-checkin:v1:raw-token',
    className: 'Reformer',
    branch: { code: 'JKT', name: 'Jakarta' },
    startAt: confirmedSlot.startAt,
    endAt: confirmedSlot.endAt,
  };
  const open = async (
    over: Record<string, unknown>,
    bookingClient: Pick<BookingClient, 'list'> & Partial<Pick<BookingClient, 'issueInstructorCheckIn'>>,
    capabilities: readonly string[] = manageCapabilities,
  ) => {
    const client = fake({
      discover: vi.fn().mockResolvedValue({ ...workspace, slots: [{ ...confirmedSlot, ...over }] }),
    });
    render(
      <ClassSlotView
        client={client}
        bookingClient={bookingClient}
        branchOverride={branch}
        capabilitiesOverride={capabilities}
      />,
    );
    const user = userEvent.setup();
    const calendar = screen.getByRole('region', { name: 'Kalender kelas tujuh hari' });
    await within(calendar).findByText('Reformer');
    await user.click(within(calendar).getByRole('button', { name: /Reformer/ }));
    return { user, dialog: screen.getByRole('dialog', { name: 'Reformer' }) };
  };

  it('issues and renders the QR the instructor scans, with an idempotency key', async () => {
    const issueInstructorCheckIn = vi.fn().mockResolvedValue(issue);
    const { user, dialog } = await open({}, { list: vi.fn(), issueInstructorCheckIn });
    await user.click(within(dialog).getByRole('button', { name: 'Tampilkan QR presensi instruktur' }));
    expect(issueInstructorCheckIn).toHaveBeenCalledWith('slot-1', expect.any(String));
    expect(await within(dialog).findByRole('img', { name: 'QR presensi instruktur' })).toBeVisible();
    expect(QRCode.toCanvas).toHaveBeenCalledWith(expect.anything(), 'dd-checkin:v1:raw-token', expect.anything());
    expect(within(dialog).getByRole('button', { name: 'Ganti QR presensi' })).toBeVisible();
  });

  it('shows the backend refusal (e.g. window not open yet) and no QR', async () => {
    const issueInstructorCheckIn = vi
      .fn()
      .mockRejectedValue({ status: 409, data: { error: { code: 'CHECK_IN_TOO_EARLY' } } });
    const { user, dialog } = await open({}, { list: vi.fn(), issueInstructorCheckIn });
    await user.click(within(dialog).getByRole('button', { name: 'Tampilkan QR presensi instruktur' }));
    await within(dialog).findByText(/30 menit sebelum kelas/);
    expect(within(dialog).queryByRole('img', { name: 'QR presensi instruktur' })).toBeNull();
  });

  it('hides the QR action without attendance:manage', async () => {
    const { dialog } = await open(
      {},
      { list: vi.fn(), issueInstructorCheckIn: vi.fn() },
      ['class-slot:read', 'class-slot:manage'],
    );
    expect(within(dialog).queryByRole('button', { name: 'Tampilkan QR presensi instruktur' })).toBeNull();
  });

  it('hides the QR action once the instructor is already recorded', async () => {
    const { dialog } = await open(
      { instructorAttendance: { checkedInAt: new Date().toISOString(), method: 'QR_SCAN' } },
      { list: vi.fn(), issueInstructorCheckIn: vi.fn() },
    );
    expect(within(dialog).queryByRole('button', { name: 'Tampilkan QR presensi instruktur' })).toBeNull();
  });
});

describe('ClassSlotView without catalog access (read-only roles)', () => {
  const named = {
    ...slot,
    instructorUserId: 'a45ec6c1-0000-4000-8000-000000000000',
    instructor: { displayName: 'Sarah Coach' },
    classType: { name: 'Reformer Pilates' },
  };
  const emptyCatalog = () =>
    fake({
      discover: vi
        .fn()
        .mockResolvedValue({ slots: [named], classTypes: [], instructors: [], studios: [] }),
    });

  it('shows the class and instructor names from the slot in the detail drawer', async () => {
    render(
      <ClassSlotView
        client={emptyCatalog()}
        branchOverride={branch}
        capabilitiesOverride={readCapabilities}
      />,
    );
    const user = userEvent.setup();
    const calendar = screen.getByRole('region', { name: 'Kalender kelas tujuh hari' });
    await user.click(await within(calendar).findByRole('button', { name: /Reformer Pilates/ }));
    const dialog = screen.getByRole('dialog', { name: 'Reformer Pilates' });
    expect(within(dialog).getAllByText('Sarah Coach')[0]).toBeVisible();
    expect(within(dialog).queryByText('Instruktur belum dimuat')).toBeNull();
  });

  it('builds the class-type and instructor filters from the visible slots', async () => {
    render(
      <ClassSlotView
        client={emptyCatalog()}
        branchOverride={branch}
        capabilitiesOverride={readCapabilities}
      />,
    );
    const user = userEvent.setup();
    await screen.findAllByText('Reformer Pilates');
    await user.click(screen.getByRole('combobox', { name: 'Instruktur' }));
    expect(await screen.findByRole('option', { name: /Sarah Coach/ })).toBeVisible();
  });
});

describe('ClassSlotView detail drawer layout', () => {
  const openDetail = async (
    detailSlot: Record<string, unknown>,
    capabilities: readonly string[] = manageCapabilities,
    client?: ClassSlotClient,
  ) => {
    const target = { ...slot, ...detailSlot };
    render(
      <ClassSlotView
        client={
          client ??
          fake({ discover: vi.fn().mockResolvedValue({ ...workspace, slots: [target] }) })
        }
        branchOverride={branch}
        capabilitiesOverride={capabilities}
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
    return { user, dialog: screen.getByRole('dialog', { name: 'Reformer' }) };
  };

  it('summarises date, time zone, studio and room without exposing the data version', async () => {
    const { dialog } = await openDetail({
      status: 'PUBLISHED',
      studio: { name: 'Area Studio Utama' },
      room: { name: 'Ruang Reformer' },
    });
    expect(within(dialog).getByRole('heading', { name: 'Ringkasan kelas' })).toBeVisible();
    expect(within(dialog).getByText('Area Studio Utama · Ruang Reformer')).toBeVisible();
    expect(within(dialog).getByText(/WIB/)).toBeVisible();
    expect(within(dialog).queryByText('Versi data')).toBeNull();
    expect(dialog).toHaveTextContent(
      new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(slot.startAt),
    );
  });

  it('explains why a draft without an instructor cannot be published', async () => {
    const { dialog } = await openDetail({ status: 'DRAFT', instructorUserId: null });
    expect(within(dialog).getByRole('button', { name: 'Publikasikan kelas' })).toBeDisabled();
    expect(
      within(dialog).getByText('Tetapkan instruktur terlebih dahulu untuk mempublikasikan kelas.'),
    ).toBeVisible();
  });

  it('shows a read-only notice instead of disabled action buttons', async () => {
    const { dialog } = await openDetail({ status: 'PUBLISHED' }, readCapabilities);
    expect(within(dialog).getByText('Anda hanya dapat melihat kelas ini.')).toBeVisible();
    expect(within(dialog).queryByRole('button', { name: 'Batalkan kelas ini' })).toBeNull();
    expect(within(dialog).queryByRole('heading', { name: 'Batalkan kelas' })).toBeNull();
  });

  it('requires an explicit cancellation reason before the cancel button is enabled', async () => {
    const { user, dialog } = await openDetail({ status: 'PUBLISHED' });
    const cancel = within(dialog).getByRole('button', { name: 'Batalkan kelas ini' });
    expect(cancel).toBeDisabled();
    expect(within(dialog).getByLabelText('Alasan pembatalan')).toHaveValue('');
    await user.selectOptions(within(dialog).getByLabelText('Alasan pembatalan'), 'SAFETY_ISSUE');
    expect(cancel).toBeEnabled();
    expect(within(dialog).getByText(/1 peserta aktif/)).toBeVisible();
  });

  it('shows the cancellation reason on a closed class and offers no actions', async () => {
    const { dialog } = await openDetail({
      status: 'CANCELLED',
      cancellationReasonCode: 'AUTO_CANCEL_MIN_QUOTA',
    });
    expect(
      within(dialog).getByText('Kuota minimum tidak terpenuhi (otomatis)'),
    ).toBeVisible();
    expect(within(dialog).queryByRole('button', { name: 'Batalkan kelas ini' })).toBeNull();
    expect(within(dialog).queryByText('Anda hanya dapat melihat kelas ini.')).toBeNull();
  });

  it('hides roster pagination when everything fits on one page', async () => {
    const bookingClient: Pick<BookingClient, 'list'> = {
      list: vi.fn().mockResolvedValue({
        items: [],
        summary: { total: 0, booked: 0, reschedulePending: 0, attended: 0, cancelled: 0, noShow: 0 },
        nextCursor: null,
      } as unknown as BookingPage),
    };
    render(
      <ClassSlotView
        client={fake({
          discover: vi.fn().mockResolvedValue({
            ...workspace,
            slots: [{ ...slot, status: 'PUBLISHED' }],
          }),
        })}
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
    expect(await within(dialog).findByText('Belum ada peserta')).toBeVisible();
    expect(within(dialog).queryByText(/Halaman 1/)).toBeNull();
  });
});
