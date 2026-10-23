import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { VouchersView } from './vouchers-view';
import { browserVoucherClient, type VoucherRecord } from '@/api-clients/voucher-client';
import { AppFeedbackProvider } from '../components/app-feedback';

const mockDeletability = vi.fn();
const mockRemove = vi.fn();
vi.mock('../api-clients/lifecycle-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api-clients/lifecycle-client')>();
  return {
    ...actual,
    lifecycleClient: {
      deletability: (...args: unknown[]) => mockDeletability(...args),
      remove: (...args: unknown[]) => mockRemove(...args),
      archive: vi.fn(),
    },
  };
});

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
    const baseVoucher = mockVouchers[0]!;
    vi.spyOn(browserVoucherClient, 'transition').mockResolvedValue({
      ...baseVoucher,
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

    // "Lihat detail" buttons should exist for rows
    const editButtons = screen.getAllByRole('button', { name: 'Lihat detail' });
    expect(editButtons.length).toBeGreaterThanOrEqual(2);

    // Click "Lihat detail" navigates to detail
    await userEvent.click(editButtons[0]!);
    expect(mockPush).toHaveBeenCalledWith('/workspace/vouchers/v-1');
  });

  it('shows a KPI card per derived status with the counts from the API summary', async () => {
    vi.spyOn(browserVoucherClient, 'list').mockResolvedValue({
      items: mockVouchers,
      summary: { ACTIVE: 7, PAUSED: 3, EXPIRED: 2, EXHAUSTED: 1 },
      page: { hasMore: false, nextCursor: null },
    });
    render(
      <AppFeedbackProvider>
        <VouchersView />
      </AppFeedbackProvider>,
    );

    await screen.findAllByText('PROMO-AKTIF');
    const card = (label: string) =>
      screen.getByText(label, { selector: 'p' }).closest('section') as HTMLElement;
    expect(card('Aktif')).toHaveTextContent('7');
    expect(card('Dijeda')).toHaveTextContent('3');
    expect(card('Kedaluwarsa')).toHaveTextContent('2');
    expect(card('Kuota habis')).toHaveTextContent('1');
    expect(screen.queryByText('Draft', { selector: 'p' })).not.toBeInTheDocument();
  });

  it('renders quick status actions via action menu (Jeda for ACTIVE, Aktifkan for PAUSED)', async () => {
    render(
      <AppFeedbackProvider>
        <VouchersView />
      </AppFeedbackProvider>,
    );

    await screen.findAllByText('PROMO-AKTIF');

    // ACTIVE voucher action menu has "Jeda", "Arsipkan" and "Hapus"
    const activeMenuBtn = screen.getAllByRole('button', { name: 'Aksi voucher PROMO-AKTIF' })[0]!;
    await userEvent.click(activeMenuBtn);
    expect(screen.getByRole('menuitem', { name: 'Jeda' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Arsipkan' })).toBeInTheDocument();

    // Close menu or click PAUSED voucher action menu
    const pausedMenuBtn = screen.getAllByRole('button', { name: 'Aksi voucher PROMO-JEDA' })[0]!;
    await userEvent.click(pausedMenuBtn);
    expect(screen.getByRole('menuitem', { name: 'Aktifkan' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Arsipkan' })).toBeInTheDocument();
  });

  it('pauses only with a typed reason (no invented default) and sends it to the server', async () => {
    render(
      <AppFeedbackProvider>
        <VouchersView />
      </AppFeedbackProvider>,
    );

    await screen.findAllByText('PROMO-AKTIF');
    await userEvent.click(screen.getAllByRole('button', { name: 'Aksi voucher PROMO-AKTIF' })[0]!);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Jeda' }));

    const dialog = await screen.findByRole('dialog', { name: 'Jeda voucher?' });
    const confirm = within(dialog).getByRole('button', { name: 'Jeda' });
    expect(confirm).toBeDisabled();
    await userEvent.type(within(dialog).getByLabelText('Alasan'), 'Promo ditunda');
    await userEvent.click(confirm);

    await waitFor(() => {
      expect(browserVoucherClient.transition).toHaveBeenCalledWith('v-1', 'pause', 1, 'Promo ditunda');
    });
  });

  it('archives with a reason, separately from pausing', async () => {
    render(
      <AppFeedbackProvider>
        <VouchersView />
      </AppFeedbackProvider>,
    );
    await screen.findAllByText('PROMO-AKTIF');
    await userEvent.click(screen.getAllByRole('button', { name: 'Aksi voucher PROMO-AKTIF' })[0]!);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Arsipkan' }));
    const dialog = await screen.findByRole('dialog', { name: 'Arsipkan voucher?' });
    await userEvent.type(within(dialog).getByLabelText('Alasan'), 'Promo berakhir');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Arsipkan' }));
    await waitFor(() => {
      expect(browserVoucherClient.transition).toHaveBeenCalledWith('v-1', 'archive', 1, 'Promo berakhir');
    });
  });

  it('deletes a never-used voucher with a reason, and explains why a used one cannot be deleted', async () => {
    mockDeletability.mockResolvedValueOnce({
      kind: 'voucher',
      id: 'v-1',
      deletable: false,
      blockers: [{ kind: 'voucher_used', label: 'pemakaian voucher', count: 4 }],
    });
    render(
      <AppFeedbackProvider>
        <VouchersView />
      </AppFeedbackProvider>,
    );
    await screen.findAllByText('PROMO-AKTIF');
    await userEvent.click(screen.getAllByRole('button', { name: 'Aksi voucher PROMO-AKTIF' })[0]!);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Hapus' }));
    expect(await screen.findByText('Voucher belum dapat dihapus')).toBeVisible();
    expect(screen.getByText('Pemakaian voucher')).toBeVisible();
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it('renders Edit button in action menu and opens EditVoucherModal, calling browserVoucherClient.update on submit', async () => {
    vi.spyOn(browserVoucherClient, 'update').mockResolvedValue({
      ...mockVouchers[0]!,
      name: 'Diskon 25 Persen',
      discountValue: 25,
      version: 2,
    });

    const user = userEvent.setup();
    render(
      <AppFeedbackProvider>
        <VouchersView />
      </AppFeedbackProvider>,
    );

    await screen.findAllByText('PROMO-AKTIF');

    const activeMenuBtn = screen.getAllByRole('button', { name: 'Aksi voucher PROMO-AKTIF' })[0]!;
    await user.click(activeMenuBtn);

    const editItem = screen.getByRole('menuitem', { name: 'Edit' });
    await user.click(editItem);

    expect(await screen.findByRole('heading', { name: 'Ubah Voucher: PROMO-AKTIF' })).toBeVisible();

    const nameInput = screen.getByLabelText('Nama voucher') as HTMLInputElement;
    expect(nameInput.value).toBe('Diskon 20 Persen');

    const reasonInput = screen.getByLabelText('Alasan pembaruan') as HTMLInputElement;
    await user.type(reasonInput, 'Penyesuaian kuota promo');

    const submitBtn = screen.getByRole('button', { name: 'Simpan perubahan' });
    await user.click(submitBtn);

    // Confirm dialog
    const confirmBtns = await screen.findAllByRole('button', { name: 'Simpan perubahan' });
    await user.click(confirmBtns[confirmBtns.length - 1]!);

    await waitFor(() => {
      expect(browserVoucherClient.update).toHaveBeenCalledWith(
        'v-1',
        expect.objectContaining({
          name: 'Diskon 20 Persen',
          reason: 'Penyesuaian kuota promo',
        }),
      );
    });
  });
});
