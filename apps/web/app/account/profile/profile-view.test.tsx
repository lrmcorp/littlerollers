import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileView } from './profile-view';
import { accountClient } from '@/api-clients/account-client';

const session = vi.hoisted(() => ({
  displayName: 'Nadia Customer',
  roles: ['CUSTOMER'],
  identityVerificationStatus: 'APPROVED',
  capabilities: [],
}));

vi.mock('../../session-context', () => ({
  useSessionContext: () => ({ session, refresh: vi.fn() }),
}));

vi.mock('../../components/app-feedback', () => ({
  useAppFeedback: () => ({ showToast: vi.fn(), showAlert: vi.fn() }),
  messageForApiError: (err: unknown) => ({ message: String(err) }),
}));

vi.mock('../../components/public/public-experience', () => ({
  useStudioPreference: () => ({
    studioId: 'branch-1',
    openStudioPreference: vi.fn(),
  }),
}));

vi.mock('@/api-clients/account-client', () => ({
  accountClient: {
    profile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

describe('ProfileView component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          actionableOrders: [],
          packages: [],
          upcomingBookings: [],
          verification: { status: 'APPROVED' },
        }),
      }),
    );
  });

  it('renders loading skeleton initially and transitions smoothly to loaded profile without hook errors', async () => {
    let resolveProfile: (val: any) => void;
    const profilePromise = new Promise((resolve) => {
      resolveProfile = resolve;
    });

    vi.mocked(accountClient.profile).mockReturnValue(profilePromise as any);

    render(<ProfileView />);

    // Initial render: loading skeleton is displayed
    expect(screen.getByLabelText('Memuat profil pengguna')).toBeInTheDocument();

    // Resolve profile API call (triggers re-render with profile data)
    resolveProfile!({
      userId: 'user-1',
      username: 'nadiapilates',
      displayName: 'Nadia Customer',
      emailMasked: 'na***@example.com',
      phoneMasked: '+62812****5678',
      version: 1,
      preferredBranch: {
        id: 'branch-1',
        name: 'Muara Karang',
        publicProfile: {
          address: 'Jl. Muara Karang No. 10',
        },
      },
    });

    // Assert that component transitioned successfully without Hook Error 310
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Nadia Customer' })).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('@nadiapilates')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Nadia Customer')).toBeInTheDocument();
    expect(screen.getByText('Member Terverifikasi')).toBeInTheDocument();
  });
});
