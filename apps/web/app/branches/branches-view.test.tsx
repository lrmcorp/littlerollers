import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../components/app-feedback';
import type { BranchManagementItem } from '@/api-clients/branch-client';

const mockList = vi.fn();
const mockDetail = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockTransition = vi.fn();
const mockDeletability = vi.fn();
const mockRemove = vi.fn();
const mockArchive = vi.fn();

vi.mock('../api-clients/lifecycle-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api-clients/lifecycle-client')>();
  return {
    ...actual,
    lifecycleClient: {
      deletability: (...args: unknown[]) => mockDeletability(...args),
      remove: (...args: unknown[]) => mockRemove(...args),
      archive: (...args: unknown[]) => mockArchive(...args),
    },
  };
});

vi.mock('@/api-clients/branch-client', () => ({
  browserBranchClient: {
    list: (...args: unknown[]) => mockList(...args),
    detail: (...args: unknown[]) => mockDetail(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    transition: (...args: unknown[]) => mockTransition(...args),
  },
}));

vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    status: 'authenticated',
    hasCapability: () => true,
    hasRole: () => true,
    session: {
      id: 'test-session',
      displayName: 'Admin User',
      roles: ['OWNER_SUPERADMIN'],
      capabilities: ['master:read', 'master:manage'],
      branchIds: ['b1'],
      branches: [],
      preferredBranch: null,
      identityVerificationStatus: 'APPROVED',
      sessionExpiresAt: new Date(Date.now() + 3_600_000),
    },
  }),
}));

const mockReplace = vi.fn();
vi.mock('../components/app-loading', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../components/app-loading')>();
  return {
    ...mod,
    useTrackedRouter: () => ({
      push: vi.fn(),
      replace: mockReplace,
      back: vi.fn(),
      prefetch: vi.fn(),
    }),
  };
});

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

import { BranchesView } from './branches-view';

function renderWithProviders() {
  return render(
    <AppFeedbackProvider>
      <BranchesView />
    </AppFeedbackProvider>,
  );
}

describe('BranchesView - Location rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders area and city when publicProfile is populated', async () => {
    const mockBranches: BranchManagementItem[] = [
      {
        id: 'b1',
        code: 'DD-GG',
        name: 'Daily Dose Green Garden',
        timezone: 'Asia/Jakarta',
        supportWhatsappE164: '+62811111111',
        active: true,
        version: 1,
        publicProfile: {
          slug: 'dd-gg',
          area: 'Kedoya Utara, Kebon Jeruk',
          city: 'Jakarta Barat',
          address: 'Ruko Green Garden Blok A7 No. 26-27',
        },
      },
    ];

    mockList.mockResolvedValueOnce({
      items: mockBranches,
      summary: { total: 1, active: 1, inactive: 0 },
      page: { hasMore: false, nextCursor: null },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getAllByText('Daily Dose Green Garden').length).toBeGreaterThan(0);
    });

    // Check that area and city are rendered in both desktop and mobile
    expect(screen.getAllByText('Kedoya Utara, Kebon Jeruk, Jakarta Barat').length).toBeGreaterThan(0);
    // Ensure "Profil publik belum lengkap" is NOT shown
    expect(screen.queryByText('Profil publik belum lengkap')).not.toBeInTheDocument();
  });

  it('falls back to address when publicProfile area/city is missing', async () => {
    const mockBranches: BranchManagementItem[] = [
      {
        id: 'b2',
        code: 'DD-CUSTOM',
        name: 'Daily Dose Custom Studio',
        timezone: 'Asia/Jakarta',
        supportWhatsappE164: null,
        active: true,
        version: 1,
        address: 'Jl. Surya Wijaya No. 8',
        publicProfile: null,
      },
    ];

    mockList.mockResolvedValueOnce({
      items: mockBranches,
      summary: { total: 1, active: 1, inactive: 0 },
      page: { hasMore: false, nextCursor: null },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getAllByText('Daily Dose Custom Studio').length).toBeGreaterThan(0);
    });

    // Should render physical address
    expect(screen.getAllByText('Jl. Surya Wijaya No. 8').length).toBeGreaterThan(0);
    expect(screen.queryByText('Profil publik belum lengkap')).not.toBeInTheDocument();
  });

  it('renders "Lokasi belum diatur" when both publicProfile and address are missing', async () => {
    const mockBranches: BranchManagementItem[] = [
      {
        id: 'b3',
        code: 'DD-EMPTY',
        name: 'Daily Dose Empty Branch',
        timezone: 'Asia/Jakarta',
        supportWhatsappE164: null,
        active: true,
        version: 1,
        publicProfile: null,
      },
    ];

    mockList.mockResolvedValueOnce({
      items: mockBranches,
      summary: { total: 1, active: 1, inactive: 0 },
      page: { hasMore: false, nextCursor: null },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getAllByText('Daily Dose Empty Branch').length).toBeGreaterThan(0);
    });

    // Should render fallback text
    expect(screen.getAllByText('Lokasi belum diatur').length).toBeGreaterThan(0);
    expect(screen.queryByText('Profil publik belum lengkap')).not.toBeInTheDocument();
  });

  it('renders Edit and Hapus action buttons and handles delete flow', async () => {
    const mockBranches: BranchManagementItem[] = [
      {
        id: 'b-del',
        code: 'DD-TEST',
        name: 'Daily Dose Test Studio',
        timezone: 'Asia/Jakarta',
        supportWhatsappE164: null,
        active: true,
        version: 1,
        publicProfile: null,
      },
    ];

    mockList.mockResolvedValueOnce({
      items: mockBranches,
      summary: { total: 1, active: 1, inactive: 0 },
      page: { hasMore: false, nextCursor: null },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getAllByText('Daily Dose Test Studio').length).toBeGreaterThan(0);
    });

    // Check that action menu trigger is present and opens Edit and Hapus items
    const actionButtons = screen.getAllByRole('button', { name: /Aksi cabang/i });
    expect(actionButtons.length).toBeGreaterThan(0);
    fireEvent.click(actionButtons[0]!);

    expect(screen.getByRole('menuitem', { name: /Edit/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Hapus/i })).toBeInTheDocument();
  });

  describe('lifecycle actions', () => {
    const branch = (over: Partial<BranchManagementItem> = {}): BranchManagementItem => ({
      id: 'b-1',
      code: 'DD-GG',
      name: 'Green Garden',
      timezone: 'Asia/Jakarta',
      supportWhatsappE164: null,
      active: true,
      version: 3,
      publicProfile: null,
      ...over,
    });
    const open = async (item: BranchManagementItem, menuItem: RegExp) => {
      mockList.mockResolvedValue({
        items: [item],
        summary: { total: 1, active: 1, inactive: 0, archived: 0 },
        page: { hasMore: false, nextCursor: null },
      });
      renderWithProviders();
      await waitFor(() => expect(screen.getAllByText('Green Garden').length).toBeGreaterThan(0));
      fireEvent.click(screen.getAllByRole('button', { name: /Aksi cabang/i })[0]!);
      fireEvent.click(screen.getByRole('menuitem', { name: menuItem }));
    };

    it('deactivates only with a typed reason (no invented default) and sends it to the server', async () => {
      mockTransition.mockResolvedValue({});
      await open(branch(), /^Nonaktifkan$/);
      const user = userEvent.setup();
      const confirm = await screen.findByRole('button', { name: 'Nonaktifkan' });
      expect(confirm).toBeDisabled();
      await user.type(screen.getByLabelText('Alasan'), 'Cabang tutup sementara');
      await user.click(confirm);
      await waitFor(() =>
        expect(mockTransition).toHaveBeenCalledWith('b-1', 'deactivate', {
          expectedVersion: 3,
          reason: 'Cabang tutup sementara',
        }),
      );
      await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2));
    });

    it('offers Arsipkan and archives with a reason', async () => {
      mockArchive.mockResolvedValue({});
      await open(branch(), /Arsipkan/);
      const user = userEvent.setup();
      await user.type(await screen.findByLabelText('Alasan'), 'Sudah tidak beroperasi');
      await user.click(screen.getByRole('button', { name: 'Arsipkan' }));
      await waitFor(() => expect(mockArchive).toHaveBeenCalledWith('branch', 'b-1', 'Sudah tidak beroperasi'));
    });

    it('explains what blocks Hapus instead of attempting it', async () => {
      mockDeletability.mockResolvedValue({
        kind: 'branch',
        id: 'b-1',
        deletable: false,
        blockers: [{ kind: 'studio', label: 'studio', count: 2 }],
      });
      await open(branch(), /Hapus/);
      expect(await screen.findByText('Cabang belum dapat dihapus')).toBeInTheDocument();
      expect(screen.getByText('Studio')).toBeInTheDocument();
      expect(mockRemove).not.toHaveBeenCalled();
    });

    it('shows archived branches as such and offers to reopen instead of Nonaktifkan/Arsipkan', async () => {
      await open(branch({ active: false, archivedAt: '2026-10-01T00:00:00Z' }), /Buka arsip/);
      expect(screen.getAllByText('Diarsipkan').length).toBeGreaterThan(0);
      expect(await screen.findByText('Buka arsip dan aktifkan cabang?')).toBeInTheDocument();
    });
  });
});
