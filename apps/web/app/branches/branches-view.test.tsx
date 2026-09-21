import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../components/app-feedback';
import type { BranchManagementItem } from '@/api-clients/branch-client';

const mockList = vi.fn();
const mockDetail = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockTransition = vi.fn();

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
});
