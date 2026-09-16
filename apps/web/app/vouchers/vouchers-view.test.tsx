import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { VouchersView } from './vouchers-view';
import { browserVoucherClient, type VoucherRecord } from '@/api-clients/voucher-client';
import { AppFeedbackProvider } from '../components/app-feedback';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => '/workspace/vouchers',
}));

vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    status: 'authenticated',
    hasCapability: (cap: string) => cap === 'voucher:read' || cap === 'voucher:manage',
    capabilities: ['voucher:read', 'voucher:manage'],
    activeBranchId: 'b1',
    branches: [{ id: 'b1', name: 'Gading Serpong', code: 'DD-GG' }],
    session: {
      status: 'authenticated',
      hasCapability: (cap: string) => true,
      capabilities: ['voucher:read', 'voucher:manage'],
      branches: [{ id: 'b1', name: 'Gading Serpong', code: 'DD-GG' }],
    },
  }),
}));

const mockVouchers: VoucherRecord[] = [
  {
    id: 'v-1',
    code: 'PROMO-AKTIF',
    name: 'Diskon 20 Persen',
    description: 'Promo aktif',
    status: 'ACTIVE',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxDiscountRp: 50000,
    minimumPurchaseRp: 100000,
    activeFrom: '2026-01-01T00:00:00Z',
    activeUntil: '2026-12-31T23:59:59Z',
    totalUsageLimit: 100,
    perCustomerUsageLimit: 1,
    redeemedCount: 15,
    branch: { id: 'b1', name: 'Gading Serpong' },
    classType: null,
    packageIds: [],
    version: 1,
  },
  {
    id: 'v-2',
    code: 'PROMO-JEDA',
    name: 'Diskon 50 Ribu',
    description: 'Promo dijeda',
    status: 'PAUSED',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50000,
    maxDiscountRp: null,
    minimumPurchaseRp: 200000,
    activeFrom: '2026-01-01T00:00:00Z',
    activeUntil: null,
    totalUsageLimit: null,
    perCustomerUsageLimit: 1,
    redeemedCount: 5,
    branch: null,
    classType: null,
    packageIds: [],
    version: 2,
  },
];

describe('VouchersView CRUD Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(browserVoucherClient, 'list').mockResolvedValue({
      items: mockVouchers,
      summary: { ACTIVE: 1, PAUSED: 1 },
      page: { hasMore: false, nextCursor: null },
    });
    vi.spyOn(browserVoucherClient, 'transition').mockResolvedValue({
      ...mockVouchers[0],
      status: 'PAUSED',
      version: 2,
    });
  });

  it('renders explicit Tindakan column and action buttons on desktop and mobile', async () => {
    render(
      <AppFeedbackProvider>
        <VouchersView />
      </AppFeedbackProvider>,
    );

    const promoAktif = await screen.findAllByText('PROMO-AKTIF');
    expect(promoAktif.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('PROMO-JEDA').length).toBeGreaterThanOrEqual(1);

    // Check "Tindakan" header in DataTable
    expect(screen.getByRole('columnheader', { name: 'Tindakan' })).toBeVisible();

    // "Lihat / Edit" buttons should exist for rows
    const editButtons = screen.getAllByRole('button', { name: 'Lihat / Edit' });
    expect(editButtons.length).toBeGreaterThanOrEqual(2);

    // Click "Lihat / Edit" navigates to detail
    await userEvent.click(editButtons[0]);
    expect(mockPush).toHaveBeenCalledWith('/workspace/vouchers/v-1');
  });

  it('renders quick status actions (Jeda for ACTIVE, Aktifkan for PAUSED)', async () => {
    render(
      <AppFeedbackProvider>
        <VouchersView />
      </AppFeedbackProvider>,
    );

    await screen.findAllByText('PROMO-AKTIF');

    // ACTIVE voucher has "Jeda" button
    const jedaButtons = screen.getAllByRole('button', { name: 'Jeda' });
    expect(jedaButtons.length).toBeGreaterThanOrEqual(1);

    // PAUSED voucher has "Aktifkan" button
    const aktifkanButtons = screen.getAllByRole('button', { name: 'Aktifkan' });
    expect(aktifkanButtons.length).toBeGreaterThanOrEqual(1);

    // Both have "Arsip" button
    const arsipButtons = screen.getAllByRole('button', { name: 'Arsip' });
    expect(arsipButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('triggers transition confirmation and calls browserVoucherClient.transition on confirm', async () => {
    render(
      <AppFeedbackProvider>
        <VouchersView />
      </AppFeedbackProvider>,
    );

    await screen.findAllByText('PROMO-AKTIF');

    const jedaButton = screen.getAllByRole('button', { name: 'Jeda' })[0];
    await userEvent.click(jedaButton);

    // Confirmation dialog appears
    expect(await screen.findByText('Jeda voucher PROMO-AKTIF?')).toBeVisible();

    // Confirm the action in the dialog
    const confirmButtons = screen.getAllByRole('button', { name: 'Jeda' });
    const modalConfirmBtn = confirmButtons[confirmButtons.length - 1];
    await userEvent.click(modalConfirmBtn);

    await waitFor(() => {
      expect(browserVoucherClient.transition).toHaveBeenCalledWith('v-1', 'pause', 1);
    });
  });
});
