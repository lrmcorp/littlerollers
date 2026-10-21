import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../components/app-feedback';
import { PackagesManagementView } from './packages-management-view';
import { browserPackagePromotionClient } from '@/api-clients/package-promotion-client';
import { browserMasterClient } from '@/api-clients/master-client';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('../components/app-loading', () => ({
  useTrackedRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  foregroundFetch: vi.fn(),
}));

vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    status: 'authenticated',
    activeBranchId: 'branch-1',
    hasCapability: (cap: string) => true,
    session: {
      branches: [
        { id: 'branch-1', name: 'Studio Kebon Jeruk' },
        { id: 'branch-2', name: 'Studio Gading Serpong' },
      ],
    },
  }),
}));

vi.mock('@/api-clients/package-promotion-client', () => ({
  browserPackagePromotionClient: {
    packages: vi.fn(),
    createPackage: vi.fn(),
  },
}));

vi.mock('@/api-clients/master-client', () => ({
  browserMasterClient: {
    listClassTypes: vi.fn(),
  },
}));

describe('PackagesManagementView duplicate feature', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (browserPackagePromotionClient.packages as unknown as { mockResolvedValue(v: unknown): void }).mockResolvedValue({
      items: [
        {
          id: 'pkg-1',
          name: '10x Group Reformer',
          businessKey: 'PKG-10X-GROUP',
          sessionCount: 10,
          durationDays: 60,
          priceRp: 1500000,
          effectiveState: 'ACTIVE',
          effectiveFrom: '2026-01-01',
          effectiveUntil: '2026-12-31',
          isMultiBranch: true,
          branchScopes: [],
          classTypeScopes: [{ classTypeId: 'ct-reformer', active: true }],
        },
      ],
      summary: { ACTIVE: 1 },
      page: { hasMore: false, nextCursor: null },
    });
    (browserMasterClient.listClassTypes as unknown as { mockResolvedValue(v: unknown): void }).mockResolvedValue([
      {
        id: 'ct-reformer',
        name: 'Group Reformer',
        branchScopes: [
          { branchId: 'branch-1', active: true },
          { branchId: 'branch-2', active: true },
        ],
      },
    ]);
  });

  it('renders Duplikasi button and opens create form with pre-filled duplicate template', async () => {
    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <PackagesManagementView />
      </AppFeedbackProvider>,
    );

    expect((await screen.findAllByText('10x Group Reformer'))[0]).toBeInTheDocument();

    const duplicateBtns = screen.getAllByRole('button', { name: /Duplikasi/i });
    expect(duplicateBtns.length).toBeGreaterThan(0);

    await user.click(duplicateBtns[0]!);

    expect(await screen.findByRole('heading', { name: 'Duplikasi paket' })).toBeInTheDocument();
    expect(screen.getByText(/Mode Duplikasi/i)).toBeInTheDocument();

    const nameInput = screen.getByLabelText('Nama paket') as HTMLInputElement;
    expect(nameInput.value).toBe('10x Group Reformer (Salinan)');

    const keyInput = screen.getByLabelText('Business key') as HTMLInputElement;
    expect(keyInput.value).toBe('PKG-10X-GROUP-copy');

    const sessionsInput = screen.getByLabelText('Jumlah sesi') as HTMLInputElement;
    expect(sessionsInput.value).toBe('10');

    const durationInput = screen.getByLabelText('Masa berlaku (hari)') as HTMLInputElement;
    expect(durationInput.value).toBe('60');

    const priceInput = screen.getByLabelText('Harga normal') as HTMLInputElement;
    expect(priceInput.value).toBe('1500000');

    const reasonInput = screen.getByLabelText('Alasan') as HTMLInputElement;
    expect(reasonInput.value).toBe('Duplikasi dari paket 10x Group Reformer');
  });
});
