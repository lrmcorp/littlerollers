import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutView } from './checkout-view';
import { AppFeedbackProvider } from '../components/app-feedback';
import { OrderClientError } from '@/api-clients/order-client';

const mockSearchParams = vi.hoisted(() => new Map<string, string>());
const mockRouter = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
}));
const mockSession = vi.hoisted(() => ({
  session: {
    userId: 'user-1',
    displayName: 'Gerald Customer',
    roles: ['CUSTOMER'],
    identityVerificationStatus: 'ACTION_REQUIRED',
    preferredBranch: { id: 'branch-1' },
  },
  status: 'authenticated',
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) ?? null,
  }),
}));

vi.mock('../components/app-loading', () => ({
  useTrackedRouter: () => mockRouter,
  foregroundFetch: vi.fn(),
}));

vi.mock('../session-context', () => ({
  useSessionContext: () => mockSession,
}));

vi.mock('@/api-clients/order-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api-clients/order-client')>();
  return {
    ...actual,
    browserOrderClient: {
      checkout: vi.fn(),
      detail: vi.fn(),
      create: vi.fn(),
      previewVoucher: vi.fn(),
    },
  };
});

import { browserOrderClient } from '@/api-clients/order-client';

describe('CheckoutView verification gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
    mockSearchParams.set('package', 'package-reformer-10');
    mockSearchParams.set('branch', 'branch-1');
  });

  it('renders verification gate when backend returns CUSTOMER_VERIFICATION_REQUIRED', async () => {
    vi.mocked(browserOrderClient.checkout).mockRejectedValueOnce(
      new OrderClientError('CUSTOMER_VERIFICATION_REQUIRED'),
    );

    render(
      <AppFeedbackProvider>
        <CheckoutView />
      </AppFeedbackProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Verifikasi KTP Diperlukan' })).toBeVisible();
    expect(
      screen.getByText(/Lengkapi verifikasi KTP terlebih dahulu untuk dapat membeli paket sesi Pilates/),
    ).toBeVisible();
    
    const verificationBtn = screen.getByRole('link', { name: 'Lengkapi Verifikasi KTP' });
    expect(verificationBtn).toBeVisible();
    expect(verificationBtn.getAttribute('href')).toContain('/account/verification?returnTo=');
    expect(verificationBtn.getAttribute('href')).toContain('package%3Dpackage-reformer-10');
  });

  it('renders pending status verification gate when customer verification is PENDING', async () => {
    mockSession.session.identityVerificationStatus = 'PENDING';
    vi.mocked(browserOrderClient.checkout).mockRejectedValueOnce(
      new OrderClientError('CUSTOMER_VERIFICATION_REQUIRED'),
    );

    render(
      <AppFeedbackProvider>
        <CheckoutView />
      </AppFeedbackProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Verifikasi KTP Sedang Diproses' })).toBeVisible();
    expect(
      screen.getByText(/Dokumen KTP Anda sedang dalam proses peninjauan oleh tim Daily Dose/),
    ).toBeVisible();

    const checkStatusBtn = screen.getByRole('link', { name: 'Lihat Status Verifikasi' });
    expect(checkStatusBtn).toBeVisible();
    expect(checkStatusBtn.getAttribute('href')).toContain('/account/verification?returnTo=');
  });
});
