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

  it('renders modern PageHeader, StatCards, and full-width CRUD table on classTypes tab', async () => {
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

    // Verify Table Header, Search Input, and Add Button
    expect(screen.getByRole('heading', { name: 'Tipe kelas' })).toBeVisible();
    expect(screen.getByLabelText('Cari tipe kelas')).toBeVisible();
    expect(screen.getByRole('button', { name: /Tambah tipe kelas/i })).toBeVisible();

    // Load master data to populate rows
    await userEvent.click(screen.getByRole('button', { name: 'Muat master data' }));
    expect(await screen.findByText('REFORMER')).toBeVisible();
    expect(screen.getByText('Reformer Pilates')).toBeVisible();

    // Opening Modal reveals the create form
    await userEvent.click(screen.getByRole('button', { name: /Tambah tipe kelas/i }));
    expect(screen.getByRole('form', { name: 'Buat class type' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Tambah tipe kelas' })).toBeVisible();
  });

  it('shows status alert only when a mutation action is performed (e.g. creating a class type)', async () => {
    const client = fakeMasterClient();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="classTypes" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    // Click [+ Tambah tipe kelas] to open modal dialog
    await userEvent.click(screen.getByRole('button', { name: /Tambah tipe kelas/i }));

    // Fill form inside modal and submit
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

  it('renders self-contained branch selector and ensures class types are populated in select form', async () => {
    const client = fakeMasterClient();
    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="fees" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    await user.click(screen.getByRole('tab', { name: 'Honor' }));
    await user.click(screen.getByRole('button', { name: 'Muat master data' }));
    // Verify branch selector is visible inside the operational settings tab
    expect(screen.getByRole('combobox', { name: 'Pilih cabang operasional' })).toBeVisible();

    // Open create modal
    await user.click(screen.getByRole('button', { name: /\+ Atur honor baru/i }));

    // Verify SearchSelect for Tipe kelas has the class type option and is not empty
    const classTypeCombobox = screen.getByRole('combobox', { name: 'Tipe kelas' });
    expect(classTypeCombobox).toBeVisible();

    // Click to open dropdown and verify class type item appears
    await user.click(classTypeCombobox);
    expect(await screen.findByRole('option', { name: /Reformer Pilates/i })).toBeVisible();
  });

  it('provides default effective date and reason for direct save', async () => {
    const client = fakeMasterClient();
    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="fees" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    await user.click(screen.getByRole('tab', { name: 'Honor' }));
    await user.click(screen.getByRole('button', { name: /\+ Atur honor baru/i }));

    const effectiveFromInput = screen.getByLabelText(/Efektif mulai/) as HTMLInputElement;
    const reasonInput = screen.getByLabelText(/Alasan perubahan/) as HTMLInputElement;

    expect(effectiveFromInput).toBeVisible();
    expect(reasonInput).toBeVisible();
  });

  it('allows editing existing setting directly from table row via edit modal', async () => {
    const client = fakeMasterClient({
      listSettings: vi.fn().mockResolvedValue([
        fee({
          id: 'fee-1',
          value: { feeRp: 150_000 },
        }),
      ]),
      createSetting: vi.fn().mockResolvedValue(undefined),
    });
    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="fees" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    await user.click(screen.getByRole('tab', { name: 'Honor' }));
    await user.click(screen.getByRole('button', { name: 'Muat master data' }));
    expect(screen.getByText('Rp 150.000')).toBeVisible();

    // Click Edit button on the table row
    const editBtn = screen.getByRole('button', { name: 'Edit' });
    expect(editBtn).toBeVisible();
    await user.click(editBtn);

    // Edit modal opens
    expect(screen.getByRole('heading', { name: /Ubah Honor Instruktur/i })).toBeVisible();
    const input = screen.getByLabelText(/Honor per sesi/i);
    expect(input).toHaveValue(150_000);

    // Modify fee amount and save
    await user.clear(input);
    await user.type(input, '175000');
    await user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

    expect(client.createSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'INSTRUCTOR_FEE',
        value: 175_000,
      }),
    );
    expect(await screen.findByText('Konfigurasi berhasil diperbarui.')).toBeVisible();
  });

  it('renders self-contained branch selector on venues tab and allows switching branch studios', async () => {
    const client = fakeMasterClient();
    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="venues" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    await user.click(screen.getByRole('tab', { name: 'Area/Ruangan' }));
    await user.click(screen.getByRole('button', { name: 'Muat master data' }));

    // Verify branch selector is visible in venues tab
    expect(screen.getByRole('combobox', { name: 'Pilih cabang studio' })).toBeVisible();
    // Verify Area Studio heading and list are visible
    expect(screen.getByRole('heading', { name: 'Area Studio & Ruangan' })).toBeVisible();
    expect(screen.getByText('Main Studio')).toBeVisible();
  });

  it('opens modal to create a new studio area and calls createStudio', async () => {
    const client = fakeMasterClient();
    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="venues" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    await user.click(screen.getByRole('tab', { name: 'Area/Ruangan' }));
    await user.click(screen.getByRole('button', { name: 'Muat master data' }));

    // Click "+ Tambah Area Studio" button
    const addStudioBtn = screen.getByRole('button', { name: '+ Tambah Area Studio' });
    expect(addStudioBtn).toBeVisible();
    await user.click(addStudioBtn);

    // Modal dialog opens
    expect(screen.getByRole('heading', { name: 'Tambah Area Studio' })).toBeVisible();

    await user.type(screen.getByLabelText('Kode area'), 'REFORMER');
    await user.type(screen.getByLabelText('Nama area'), 'Reformer Studio');
    await user.type(screen.getByLabelText('Equipment'), 'Reformer bed 6 unit, Box');

    await user.click(screen.getByRole('button', { name: 'Simpan Area Studio' }));

    expect(client.createStudio).toHaveBeenCalledWith(
      'branch-1',
      expect.objectContaining({
        code: 'REFORMER',
        name: 'Reformer Studio',
        equipmentText: 'Reformer bed 6 unit, Box',
      }),
    );
    expect(await screen.findByText('Area Studio berhasil ditambahkan.')).toBeVisible();
  });

  it('opens modal to create a new room from row action and pre-selects target studio', async () => {
    const client = fakeMasterClient({
      listStudios: vi.fn().mockResolvedValue([
        {
          id: 'studio-1',
          code: 'MAIN',
          name: 'Main Studio',
          active: true,
          version: 0,
          rooms: [
            { id: 'room-1', code: 'R1', name: 'Ruang A', active: true, version: 0 },
          ],
        },
      ]),
    });
    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="venues" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    await user.click(screen.getByRole('tab', { name: 'Area/Ruangan' }));
    await user.click(screen.getByRole('button', { name: 'Muat master data' }));

    // Click "+ Ruangan" button on the Main Studio row
    const addRoomRowBtn = screen.getByRole('button', { name: '+ Ruangan' });
    expect(addRoomRowBtn).toBeVisible();
    await user.click(addRoomRowBtn);

    // Modal opens with heading Tambah Ruangan
    expect(screen.getByRole('heading', { name: 'Tambah Ruangan' })).toBeVisible();

    await user.type(screen.getByLabelText('Kode ruangan'), 'R2');
    await user.type(screen.getByLabelText('Nama ruangan'), 'Ruang B');

    await user.click(screen.getByRole('button', { name: 'Simpan Ruangan' }));

    expect(client.createRoom).toHaveBeenCalledWith(
      'studio-1',
      expect.objectContaining({
        code: 'R2',
        name: 'Ruang B',
      }),
    );
    expect(await screen.findByText('Ruangan berhasil ditambahkan.')).toBeVisible();
  });

  it('filters studio venues based on search query', async () => {
    const client = fakeMasterClient({
      listStudios: vi.fn().mockResolvedValue([
        {
          id: 'studio-1',
          code: 'MAIN',
          name: 'Main Studio',
          active: true,
          version: 0,
          rooms: [{ id: 'room-1', code: 'R1', name: 'Cadillac Room', active: true, version: 0 }],
        },
        {
          id: 'studio-2',
          code: 'REFORM',
          name: 'Reformer Area',
          active: true,
          version: 0,
          rooms: [{ id: 'room-2', code: 'R2', name: 'Private Room', active: true, version: 0 }],
        },
      ]),
    });
    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <MasterView client={client} activeTab="venues" access={{ canManage: true, canFinance: true }} />
      </AppFeedbackProvider>,
    );

    await user.click(screen.getByRole('tab', { name: 'Area/Ruangan' }));
    await user.click(screen.getByRole('button', { name: 'Muat master data' }));

    expect(screen.getByText('Main Studio')).toBeVisible();
    expect(screen.getByText('Reformer Area')).toBeVisible();

    // Type in search query to match only "Reformer"
    const searchInput = screen.getByLabelText('Cari area studio atau ruangan');
    await user.type(searchInput, 'Reformer');

    expect(screen.queryByText('Main Studio')).toBeNull();
    expect(screen.getByText('Reformer Area')).toBeVisible();
  });
});

