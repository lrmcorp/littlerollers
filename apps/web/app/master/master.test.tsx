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
