import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { InstructorsView } from './instructors-view';
import { instructorClient, type InstructorSummary } from './instructor-client';
import { AppFeedbackProvider } from '../components/app-feedback';

vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    session: {
      status: 'authenticated',
      hasCapability: () => true,
      capabilities: ['user:admin', 'assignment:manage', 'master:manage'],
      branches: [
        { id: 'b1', name: 'Gading Serpong', code: 'DD-GG' },
        { id: 'b2', name: 'Muara Karang', code: 'DD-MK' },
      ],
    },
    activeBranchId: 'b1',
  }),
}));

const mockInstructors: InstructorSummary[] = [
  {
    id: 'inst-1',
    displayName: 'Coach Devi',
    email: 'devi@dailydose.id',
    phoneE164: '+628123456789',
    status: 'ACTIVE',
    assignments: [
      { id: 'asgn-1', branch: { id: 'b1', code: 'DD-GG', name: 'Gading Serpong' } },
    ],
    compensationRp: 1500000,
    _count: {
      instructedClassSlots: 12,
      instructorAttendances: 12,
      instructorHourLogs: 12,
    },
  },
  {
    id: 'inst-2',
    displayName: 'Coach Maya',
    email: 'maya@dailydose.id',
    phoneE164: '+628987654321',
    status: 'INACTIVE',
    assignments: [],
    compensationRp: 0,
    _count: {
      instructedClassSlots: 0,
      instructorAttendances: 0,
      instructorHourLogs: 0,
    },
  },
];

describe('InstructorsView CRUD Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(instructorClient, 'list').mockResolvedValue({
      items: mockInstructors,
      summary: { total: 2 },
      page: { hasMore: false, nextCursor: null },
    });
    vi.spyOn(instructorClient, 'create').mockResolvedValue({
      id: 'inst-3',
      status: 'CREATED',
    });
  });

  it('renders instructors list with status badge and Detail & Kelola action', async () => {
    render(
      <AppFeedbackProvider>
        <InstructorsView />
      </AppFeedbackProvider>,
    );

    const coachDevi = await screen.findAllByText('Coach Devi');
    expect(coachDevi.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Coach Maya').length).toBeGreaterThanOrEqual(1);

    // Verify badges
    expect(screen.getAllByText('Aktif').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Nonaktif').length).toBeGreaterThanOrEqual(1);

    // Verify "Detail & Kelola" button links
    const detailLinks = screen.getAllByRole('link', { name: 'Detail & Kelola' });
    expect(detailLinks.length).toBeGreaterThanOrEqual(2);
    expect(detailLinks[0]).toHaveAttribute('href', '/instructors/inst-1');
  });

  it('renders Tambah Instruktur button and opens creation drawer', async () => {
    render(
      <AppFeedbackProvider>
        <InstructorsView />
      </AppFeedbackProvider>,
    );

    await screen.findAllByText('Coach Devi');

    const tambahButton = screen.getByRole('button', { name: 'Tambah Instruktur' });
    expect(tambahButton).toBeVisible();

    await userEvent.click(tambahButton);

    // Drawer opens
    expect(await screen.findByText('Tambah Instruktur Baru')).toBeVisible();
    const form = document.getElementById('create-instructor-form')!;
    expect(form).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama Lengkap Instruktur/i)).toBeVisible();
    expect(screen.getByLabelText(/Alamat Email/i)).toBeVisible();
    expect(screen.getByLabelText(/Nomor WhatsApp/i)).toBeVisible();

    // Branch assignment checkboxes exist inside drawer form
    expect(within(form).getByText('Gading Serpong')).toBeVisible();
    expect(within(form).getByText('Muara Karang')).toBeVisible();
  });

  it('submits new instructor creation and calls instructorClient.create', async () => {
    render(
      <AppFeedbackProvider>
        <InstructorsView />
      </AppFeedbackProvider>,
    );

    await screen.findAllByText('Coach Devi');
    await userEvent.click(screen.getByRole('button', { name: 'Tambah Instruktur' }));

    const form = document.getElementById('create-instructor-form')!;
    expect(form).toBeInTheDocument();

    // Fill form
    await userEvent.type(screen.getByLabelText(/Nama Lengkap Instruktur/i), 'Coach Budi');
    await userEvent.type(screen.getByLabelText(/Alamat Email/i), 'budi@dailydose.id');
    await userEvent.type(screen.getByLabelText(/Nomor WhatsApp/i), '+628111222333');

    // Select Gading Serpong branch checkbox inside drawer form
    const branchLabel = within(form).getByText('Gading Serpong').closest('label');
    const branchCheckbox = branchLabel?.querySelector('input[type="checkbox"]');
    if (branchCheckbox) {
      await userEvent.click(branchCheckbox);
    }

    // Submit
    const submitBtn = screen.getByRole('button', { name: 'Simpan Instruktur' });
    await userEvent.click(submitBtn);

    // Confirmation dialog appears
    expect(await screen.findByText('Daftarkan instruktur baru?')).toBeVisible();
    const confirmButtons = screen.getAllByRole('button', { name: 'Daftarkan Instruktur' });
    const modalConfirmBtn = confirmButtons[confirmButtons.length - 1];
    await userEvent.click(modalConfirmBtn);

    await waitFor(() => {
      expect(instructorClient.create).toHaveBeenCalledWith({
        displayName: 'Coach Budi',
        email: 'budi@dailydose.id',
        phoneE164: '+628111222333',
        branchIds: ['b1'],
      });
    });
  });
});
