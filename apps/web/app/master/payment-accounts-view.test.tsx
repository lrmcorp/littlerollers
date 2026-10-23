import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../components/app-feedback';
import { PaymentAccountsView } from './payment-accounts-view';

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

const mockHasCapability = vi.fn();
const mockActiveBranch = { id: 'branch-1', code: 'SCBD', name: 'Studio SCBD' };

vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    hasCapability: (cap: string) => mockHasCapability(cap),
    activeBranch: mockActiveBranch,
    activeBranchId: 'branch-1',
  }),
  useActiveBranchState: () => ['branch-1', vi.fn()],
}));

const sampleAccounts = [
  {
    id: 'acc-1',
    branchId: 'branch-1',
    bankCode: 'BCA',
    bankName: 'Bank Central Asia',
    maskedAccountNumber: '••••• 2911',
    accountHolderName: 'PT Daily Dose Pilates Indonesia',
    paymentWindowHours: 24,
    active: true,
    version: 1,
  },
  {
    id: 'acc-2',
    branchId: 'branch-1',
    bankCode: 'MANDIRI',
    bankName: 'Bank Mandiri',
    maskedAccountNumber: '••••• 8820',
    accountHolderName: 'PT Daily Dose Pilates Indonesia',
    paymentWindowHours: 48,
    active: false,
    version: 2,
  },
];

describe('PaymentAccountsView - Tahap 4: Standarisasi Tab Rekening Pembayaran', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockHasCapability.mockReturnValue(true);
  });

  const renderComponent = () =>
    render(
      <AppFeedbackProvider>
        <PaymentAccountsView />
      </AppFeedbackProvider>,
    );

  it('merender tabel penuh CRUD dengan seluruh kolom dan nomor rekening termasking', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/payment-accounts')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: sampleAccounts }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Rekening Pembayaran')).toBeInTheDocument();
    });

    expect(screen.getByText('2 rekening')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Verifikasi kolom tabel
    expect(screen.getByText('Bank & No. Rekening')).toBeInTheDocument();
    expect(screen.getByText('Nama Pemilik')).toBeInTheDocument();
    expect(screen.getByText('Batas Pembayaran')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    // Verifikasi data baris 1 (BCA)
    expect(screen.getByText('Bank Central Asia')).toBeInTheDocument();
    expect(screen.getByText('••••• 2911')).toBeInTheDocument();
    expect(screen.getByText('24 jam')).toBeInTheDocument();
    expect(screen.getByText('Aktif')).toBeInTheDocument();

    // Verifikasi data baris 2 (Mandiri)
    expect(screen.getByText('Bank Mandiri')).toBeInTheDocument();
    expect(screen.getByText('••••• 8820')).toBeInTheDocument();
    expect(screen.getByText('48 jam')).toBeInTheDocument();
    expect(screen.getByText('Nonaktif')).toBeInTheDocument();
  });

  it('melakukan filter pencarian realtime berdasarkan nama bank atau nomor rekening', async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/payment-accounts')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: sampleAccounts }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bank Central Asia')).toBeInTheDocument();
      expect(screen.getByText('Bank Mandiri')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText('Cari rekening pembayaran');
    await user.type(searchInput, 'Mandiri');

    expect(screen.queryByText('Bank Central Asia')).not.toBeInTheDocument();
    expect(screen.getByText('Bank Mandiri')).toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'XYZ_NONEXISTENT');

    expect(screen.getByText('Tidak ada rekening yang cocok')).toBeInTheDocument();
  });

  it('menampilkan empty state ketika cabang belum memiliki rekening pembayaran', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/payment-accounts')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: [] }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Belum ada rekening pembayaran')).toBeInTheDocument();
    });

    expect(screen.getAllByRole('button', { name: /Tambah rekening/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('membuka modal tambah rekening dan mengirimkan payload lengkap saat disimpan', async () => {
    const user = userEvent.setup();
    let postBody: any = null;

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes('/payment-accounts') && init?.method === 'POST') {
        postBody = JSON.parse(init.body as string);
        return {
          ok: true,
          status: 201,
          json: async () => ({ id: 'new-acc', ...postBody }),
        } as Response;
      }
      if (url.includes('/payment-accounts')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: sampleAccounts }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Rekening Pembayaran')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByRole('button', { name: /Tambah rekening/i });
    await user.click(addButtons[0]!);

    const modal = screen.getByRole('dialog', { name: 'Tambah rekening pembayaran' });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText(/Studio SCBD/i)).toBeInTheDocument();

    await user.type(within(modal).getByLabelText(/Kode bank/i), 'BNI');
    await user.type(within(modal).getByLabelText(/Nama bank/i), 'Bank Negara Indonesia');
    await user.type(within(modal).getByLabelText(/Nomor rekening/i), '0123456789');
    await user.type(within(modal).getByLabelText(/Nama penerima/i), 'PT Daily Dose Pilates');
    await user.type(within(modal).getByLabelText(/Alasan pembuatan/i), 'Rekening operasional baru');

    const saveButton = within(modal).getByRole('button', { name: 'Simpan rekening' });
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    await waitFor(() => {
      expect(postBody).toEqual({
        branchId: 'branch-1',
        bankCode: 'BNI',
        bankName: 'Bank Negara Indonesia',
        accountNumber: '0123456789',
        accountHolderName: 'PT Daily Dose Pilates',
        paymentWindowHours: 24,
        reason: 'Rekening operasional baru',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Rekening pembayaran berhasil ditambahkan.')).toBeInTheDocument();
    });
  });

  it('membuka modal detail saat tombol Lihat detail diklik', async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/payment-accounts/acc-1')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ...sampleAccounts[0],
            branch: { name: 'Studio SCBD', code: 'SCBD', active: true },
            purchaseCount: 42,
          }),
        } as Response;
      }
      if (url.includes('/payment-accounts')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: sampleAccounts }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bank Central Asia')).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByRole('button', { name: 'Lihat detail' });
    await user.click(detailButtons[0]!);

    const modal = await screen.findByRole('dialog', { name: 'Detail rekening pembayaran' });
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText('Studio SCBD · SCBD')).toBeInTheDocument();
    expect(within(modal).getByText('42')).toBeInTheDocument();

    await user.click(within(modal).getByRole('button', { name: 'Tutup' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Detail rekening pembayaran' })).not.toBeInTheDocument();
    });
  });

  it('membuka konfirmasi penonaktifan dan memanggil API dengan alasan wajib', async () => {
    const user = userEvent.setup();
    let deactivatePayload: any = null;

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes('/payment-accounts/acc-1/deactivate') && init?.method === 'POST') {
        deactivatePayload = JSON.parse(init.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({ ...sampleAccounts[0], active: false }),
        } as Response;
      }
      if (url.includes('/payment-accounts')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: sampleAccounts }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bank Central Asia')).toBeInTheDocument();
    });

    const deactivateBtn = screen.getByRole('button', { name: 'Nonaktifkan' });
    await user.click(deactivateBtn);

    const modal = screen.getByRole('dialog', { name: 'Nonaktifkan rekening pembayaran' });
    expect(modal).toBeInTheDocument();

    const confirmBtn = within(modal).getByRole('button', { name: 'Konfirmasi nonaktifkan' });
    expect(confirmBtn).toBeDisabled();

    await user.type(within(modal).getByLabelText(/Alasan wajib/i), 'Pindah rekening cabang utama');
    expect(confirmBtn).toBeEnabled();

    await user.click(confirmBtn);

    await waitFor(() => {
      expect(deactivatePayload).toEqual({
        expectedVersion: 1,
        reason: 'Pindah rekening cabang utama',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Rekening dinonaktifkan.')).toBeInTheDocument();
    });
  });

  it('membuka konfirmasi aktivasi kembali dan memanggil API dengan alasan wajib', async () => {
    const user = userEvent.setup();
    let reactivatePayload: any = null;

    global.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.includes('/payment-accounts/acc-2/reactivate') && init?.method === 'POST') {
        reactivatePayload = JSON.parse(init.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({ ...sampleAccounts[1], active: true }),
        } as Response;
      }
      if (url.includes('/payment-accounts')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: sampleAccounts }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bank Mandiri')).toBeInTheDocument();
    });

    const reactivateBtn = screen.getByRole('button', { name: 'Aktifkan kembali' });
    await user.click(reactivateBtn);

    const modal = screen.getByRole('dialog', { name: 'Aktifkan kembali rekening' });
    expect(modal).toBeInTheDocument();

    const confirmBtn = within(modal).getByRole('button', { name: 'Konfirmasi aktifkan' });
    expect(confirmBtn).toBeDisabled();

    await user.type(within(modal).getByLabelText(/Alasan wajib/i), 'Aktifkan kembali untuk promo transfer');
    expect(confirmBtn).toBeEnabled();

    await user.click(confirmBtn);

    await waitFor(() => {
      expect(reactivatePayload).toEqual({
        expectedVersion: 2,
        reason: 'Aktifkan kembali untuk promo transfer',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Rekening berhasil diaktifkan kembali.')).toBeInTheDocument();
    });
  });

  it('menyembunyikan tombol mutasi ketika user hanya memiliki izin baca', async () => {
    mockHasCapability.mockImplementation((cap: string) => cap === 'payment-account:read');

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/payment-accounts')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: sampleAccounts }),
        } as Response;
      }
      return { ok: false, status: 404 } as Response;
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Rekening Pembayaran')).toBeInTheDocument();
    });

    // Tombol tambah tidak tampil
    expect(screen.queryByRole('button', { name: /Tambah rekening/i })).not.toBeInTheDocument();

    // Tombol ubah tidak tampil
    expect(screen.queryByRole('button', { name: 'Ubah' })).not.toBeInTheDocument();

    // Tombol Lihat detail tetap dapat diakses
    expect(screen.getAllByRole('button', { name: 'Lihat detail' })).toHaveLength(2);
  });

  it('deletes an account only with a reason, after the server confirms it is clean', async () => {
    global.fetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify({ items: sampleAccounts }),
      json: async () => ({ items: sampleAccounts }),
    })) as never;
    mockDeletability.mockResolvedValue({ kind: 'payment-account', id: 'acc-1', deletable: true, blockers: [] });
    mockRemove.mockResolvedValue({ id: 'acc-1', deleted: true });
    const user = userEvent.setup();
    renderComponent();
    await user.click((await screen.findAllByRole('button', { name: /Hapus rekening Bank Central Asia/ }))[0]!);
    const dialog = await screen.findByRole('dialog', { name: 'Hapus rekening pembayaran permanen?' });
    expect(within(dialog).getByRole('button', { name: 'Hapus permanen' })).toBeDisabled();
    await user.type(within(dialog).getByLabelText('Alasan'), 'Rekening salah input');
    await user.click(within(dialog).getByRole('button', { name: 'Hapus permanen' }));
    await waitFor(() => expect(mockRemove).toHaveBeenCalledWith('payment-account', 'acc-1', 'Rekening salah input'));
  });

  it('hides Hapus without manage permission', async () => {
    mockHasCapability.mockImplementation((cap: string) => cap !== 'payment-account:manage');
    global.fetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify({ items: sampleAccounts }),
      json: async () => ({ items: sampleAccounts }),
    })) as never;
    renderComponent();
    await screen.findAllByText('Bank Central Asia');
    expect(screen.queryByRole('button', { name: /Hapus rekening/ })).toBeNull();
  });
});
