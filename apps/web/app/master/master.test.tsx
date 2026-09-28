import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { MasterView } from './master-view';
import { AppFeedbackProvider } from '../components/app-feedback';
import type { MasterClient } from '@/api-clients/master-client';

function fakeMasterClient(overrides: Partial<MasterClient> = {}): MasterClient {
  return {
    listBranches: vi.fn().mockResolvedValue({
      items: [
        {
          id: 'branch-1',
          code: 'DD-JKT',
          name: 'Daily Dose Jakarta',
          timezone: 'Asia/Jakarta',
          active: true,
          version: 0,
        },
      ],
      summary: { total: 1, active: 1, inactive: 0 },
      page: { hasMore: false, nextCursor: null },
    }),
    listClassTypes: vi.fn().mockResolvedValue([
      {
        id: 'class-1',
        code: 'REFORMER',
        name: 'Reformer Pilates',
        active: true,
        version: 0,
        branchScopes: [],
      },
    ]),
    listStudios: vi.fn().mockResolvedValue([
      {
        id: 'studio-1',
        code: 'MAIN',
        name: 'Main Studio',
        active: true,
        version: 0,
        rooms: [],
      },
    ]),
    listSettings: vi.fn().mockResolvedValue([]),
    createBranch: vi.fn().mockResolvedValue(undefined),
    createClassType: vi.fn().mockResolvedValue({
      id: 'class-2',
      code: 'BARRE',
      name: 'Barre Sculpt',
      active: true,
      version: 0,
      branchScopes: [],
    }),
    updateClassType: vi.fn().mockResolvedValue({
      id: 'class-1',
      code: 'REFORMER',
      name: 'Reformer Pilates Updated',
      active: true,
      version: 1,
      branchScopes: [],
    }),
    deactivateBranch: vi.fn().mockResolvedValue(undefined),
    deactivateClassType: vi.fn().mockResolvedValue({
      id: 'class-1',
      code: 'REFORMER',
      name: 'Reformer Pilates',
      active: false,
      version: 1,
      branchScopes: [],
    }),
    reactivateClassType: vi.fn().mockResolvedValue({
      id: 'class-1',
      code: 'REFORMER',
      name: 'Reformer Pilates',
      active: true,
      version: 2,
      branchScopes: [],
    }),
    replaceClassTypeScopes: vi.fn().mockResolvedValue([]),
    createStudio: vi.fn().mockResolvedValue({
      id: 'studio-2',
      code: 'STUDIO-B',
      name: 'Studio B',
      active: true,
      version: 0,
    }),
    updateStudio: vi.fn().mockResolvedValue(undefined),
    createRoom: vi.fn().mockResolvedValue({
      id: 'room-1',
      code: 'ROOM-1',
      name: 'Room 1',
      active: true,
      version: 0,
    }),
    updateRoom: vi.fn().mockResolvedValue(undefined),
    deleteSetting: vi.fn().mockResolvedValue(undefined),
    createSetting: vi.fn().mockResolvedValue({
      id: 'setting-1',
      kind: 'QUOTA_CAPACITY',
      branchId: 'branch-1',
      classTypeId: 'class-1',
      effectiveFrom: new Date('2026-08-01'),
      effectiveUntil: null,
      value: { minimumQuota: 4, defaultCapacity: 8 },
      version: 0,
      active: true,
    }),
    ...overrides,
  };
}

describe('MasterView Redesign Tests', () => {
  it('does NOT show any persistent green status alert on initial render', async () => {
    const client = fakeMasterClient();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="classTypes" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    // Initial silent render should NOT show role="status"
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders modern PageHeader, StatCards, and unified grid on classTypes tab', async () => {
    const client = fakeMasterClient();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="classTypes" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    // Verify PageHeader
    expect(screen.getByRole('heading', { name: 'Data Master' })).toBeVisible();

    // Verify StatCards
    expect(screen.getByText('Tipe kelas aktif')).toBeVisible();
    expect(screen.getByText('Area studio cabang')).toBeVisible();
    expect(screen.getByText('Konfigurasi aktif')).toBeVisible();

    // Verify Form and List are both present
    expect(screen.getByRole('form', { name: 'Buat class type' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Tambah tipe kelas' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Tipe kelas' })).toBeVisible();
  });

  it('shows status alert only when a mutation action is performed (e.g. creating a class type)', async () => {
    const client = fakeMasterClient();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="classTypes" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    // Fill form and submit
    await userEvent.type(screen.getByLabelText(/Kode kelas/), 'BARRE');
    await userEvent.type(screen.getByLabelText(/Nama kelas/), 'Barre Sculpt');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan tipe kelas' }));

    // Status alert MUST appear after mutation
    expect(await screen.findByRole('status')).toHaveTextContent('Tipe kelas berhasil dibuat.');
  });

  it('renders package management workspace card on packages tab', async () => {
    const client = fakeMasterClient();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="packages" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Manajemen Paket Sesi' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Buka Manajemen Paket' })).toHaveAttribute(
      'href',
      '/workspace/packages',
    );
  });

  it('has zero accessibility violations', async () => {
    const client = fakeMasterClient();
    const view = render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="classTypes" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    const results = await axe(view.container);
    expect(results.violations).toHaveLength(0);
  });
});

describe('MasterView tarif list', () => {
  const fee = (overrides: Record<string, unknown>) => ({
    id: 'fee-1',
    kind: 'INSTRUCTOR_FEE',
    businessKey: 'fee-1',
    branchId: 'branch-1',
    classTypeId: 'class-1',
    value: { feeRp: 180_000 },
    effectiveFrom: new Date('2027-01-01T00:00:00Z'),
    effectiveUntil: null,
    version: 1,
    instructorName: 'Ayu Instruktur',
    deletable: true,
    ...overrides,
  });

  it('shows the rupiah value, instructor and status, and deletes only not-yet-effective rows after confirming', async () => {
    const client = fakeMasterClient({
      listSettings: vi.fn().mockResolvedValue([
        fee({}),
        fee({
          id: 'fee-2',
          value: { feeRp: 150_000 },
          effectiveFrom: new Date('2025-01-01T00:00:00Z'),
          deletable: false,
        }),
      ]),
    });
    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="fees" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );
    await user.click(screen.getByRole('tab', { name: 'Honor' }));
    await user.click(screen.getByRole('button', { name: 'Muat master data' }));
    expect((await screen.findAllByText('Ayu Instruktur', { selector: 'span' })).length).toBe(2);
    expect(screen.getByText('Rp 180.000')).toBeVisible();
    expect(screen.getByText('Akan berlaku')).toBeVisible();
    expect(screen.getByText('Sudah berlaku')).toBeVisible();
    expect(screen.queryByLabelText(/Efektif sampai/)).toBeNull();
    const deleteButtons = screen.getAllByRole('button', { name: 'Hapus' });
    expect(deleteButtons).toHaveLength(1);
    await user.click(deleteButtons[0]!);
    expect(client.deleteSetting).not.toHaveBeenCalled();
    await user.click(await screen.findByRole('button', { name: 'Hapus tarif' }));
    await waitFor(() => expect(client.deleteSetting).toHaveBeenCalledWith('INSTRUCTOR_FEE', 'fee-1'));
    expect(await screen.findByText('Tarif dihapus.')).toBeVisible();
  });

  it('hides the delete action without finance:manage', async () => {
    const client = fakeMasterClient({ listSettings: vi.fn().mockResolvedValue([fee({})]) });
    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="fees" access={{ canManage: true, canFinance: false }} />
      </AppFeedbackProvider>,
    );
    await user.click(screen.getByRole('tab', { name: 'Honor' }));
    await user.click(screen.getByRole('button', { name: 'Muat master data' }));
    await screen.findByText('Akan berlaku');
    expect(screen.queryByRole('button', { name: 'Hapus' })).toBeNull();
  });
});
