import { render, screen, waitFor } from '@testing-library/react';
import { cloneElement } from 'react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { browserLedgerClient, type LedgerClient } from '@/api-clients/ledger-client';
import { LedgerView } from '@/ledger/ledger-view';
import { AppFeedbackProvider } from '@/components/app-feedback';

const balance = {
  id: 'cp-1',
  branchId: 'branch-1',
  status: 'ACTIVE' as const,
  activationDate: new Date('2026-01-01'),
  expiryAt: new Date('2026-12-01'),
  ledgerBalance: 10,
  reserved: 2,
  available: 8,
  packageName: 'Ten sessions',
  branchName: 'Jakarta',
  customer: { id: 'customer-1', displayName: 'Nadia Customer', phoneMasked: '+628*****01' },
};
const fake = (overrides: Partial<LedgerClient> = {}): LedgerClient => ({
  list: vi.fn().mockResolvedValue({
    items: [balance],
    summary: { packageCount: 1, ledgerBalance: 10, reserved: 2, available: 8 },
    nextCursor: null,
  }),
  detail: vi.fn().mockResolvedValue({
    balance,
    entries: [{ id: 'entry-1', type: 'PURCHASE', quantity: 10, occurredAt: new Date() }],
    nextCursor: null,
  }),
  listAdjustments: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
  getAdjustment: vi.fn(),
  requestAdjustment: vi.fn(),
  decideAdjustment: vi.fn(),
  ...overrides,
});

const renderLedger = (view: React.ReactElement) =>
  render(
    <AppFeedbackProvider>
      {cloneElement(view, {
        access: { canRequest: true, canDecide: true, canReview: true },
      } as never)}
    </AppFeedbackProvider>,
  );

describe('synthetic ledger UI', () => {
  it('is accessible and links each authoritative balance to its detail history', async () => {
    const view = renderLedger(<LedgerView client={fake()} />);
    expect((await screen.findAllByText('Nadia Customer')).length).toBeGreaterThan(0);
    const accessibility = await axe(view.container);
    expect(
      accessibility.violations,
      accessibility.violations
        .map(({ id, nodes }) => `${id}: ${nodes[0]?.failureSummary}`)
        .join('\n'),
    ).toHaveLength(0);
    expect(screen.getAllByRole('link', { name: /Lihat detail|Lihat histori/ })[0]).toHaveAttribute(
      'href',
      '/ledger/cp-1?returnTo=%2Fledger',
    );
  });
  it('shows safe invariant and expired states', async () => {
    renderLedger(
      <LedgerView
        client={fake({ list: vi.fn().mockRejectedValue({ response: { status: 409 } }) })}
      />,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Data berubah');
    const expired = { ...balance, status: 'EXPIRED' as const, available: 0 };
    renderLedger(
      <LedgerView
        client={fake({
          list: vi.fn().mockResolvedValue({
            items: [expired],
            summary: { packageCount: 1, ledgerBalance: 10, reserved: 2, available: 0 },
          }),
        })}
      />,
    );
    expect((await screen.findAllByText('Berakhir')).length).toBeGreaterThan(0);
  });
  it('creates a controlled pending request without free text', async () => {
    const requestAdjustment = vi.fn().mockResolvedValue({ id: 'adj-1' });
    const view = renderLedger(<LedgerView client={fake({ requestAdjustment })} />);
    await userEvent.click(screen.getByRole('tab', { name: /Penyesuaian Sesi/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Buat permintaan penyesuaian' }));
    const lookup = screen.getByLabelText('Cari pelanggan atau paket aktif');
    await userEvent.type(lookup, 'Nadia');
    await waitFor(() => expect(lookup).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.click(await screen.findByRole('option', { name: /Nadia/ }));
    await userEvent.type(screen.getByLabelText('Perubahan sesi'), '-2');
    await userEvent.selectOptions(screen.getByLabelText('Alasan'), 'ATTENDANCE_CORRECTION');
    await userEvent.click(screen.getByRole('button', { name: 'Tinjau dan buat permintaan' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Buat permintaan' }));
    expect(requestAdjustment).toHaveBeenCalledWith(
      expect.objectContaining({
        customerPackageId: 'cp-1',
        quantity: -2,
        reasonCode: 'ATTENDANCE_CORRECTION',
      }),
      expect.any(String),
    );
    expect(await screen.findByText(/menunggu keputusan tanpa mengubah saldo/)).toBeVisible();
    const accessibility = await axe(view.container);
    expect(
      accessibility.violations,
      accessibility.violations
        .map(({ id, nodes }) => `${id}: ${nodes[0]?.failureSummary}`)
        .join('\n'),
    ).toHaveLength(0);
  });

  it('reviews pending adjustment with explicit controlled decisions', async () => {
    const decideAdjustment = vi.fn().mockResolvedValue({});
    const listAdjustments = vi.fn().mockResolvedValue({
      items: [
        {
          id: 'adj-1',
          customerPackageId: 'cp-1',
          quantity: 2,
          reasonCode: 'PACKAGE_COMPENSATION',
          status: 'PENDING',
          version: 0,
          eligibleForApproval: true,
        },
      ],
      nextCursor: null,
    });
    renderLedger(<LedgerView client={fake({ listAdjustments, decideAdjustment })} />);
    await userEvent.click(screen.getByRole('tab', { name: /Penyesuaian Sesi/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Setujui' }));
    await userEvent.click(screen.getByRole('button', { name: 'Konfirmasi keputusan' }));
    await userEvent.click(screen.getByRole('button', { name: 'Setujui dan posting' }));
    await waitFor(() =>
      expect(decideAdjustment).toHaveBeenCalledWith(
        'adj-1',
        'approve',
        { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 0 },
        expect.any(String),
      ),
    );
  });

  it('reuses the same idempotency key after an uncertain request failure', async () => {
    const requestAdjustment = vi
      .fn()
      .mockRejectedValueOnce(new Error('network timeout'))
      .mockResolvedValueOnce({ id: 'adj-1' });
    renderLedger(<LedgerView client={fake({ requestAdjustment })} />);
    await userEvent.click(screen.getByRole('tab', { name: /Penyesuaian Sesi/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Buat permintaan penyesuaian' }));
    const lookup = screen.getByLabelText('Cari pelanggan atau paket aktif');
    await userEvent.type(lookup, 'Nadia');
    await waitFor(() => expect(lookup).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.click(await screen.findByRole('option', { name: /Nadia/ }));
    await userEvent.type(screen.getByLabelText('Perubahan sesi'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Tinjau dan buat permintaan' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Buat permintaan' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Layanan belum dapat dijangkau');
    await userEvent.click(screen.getByRole('button', { name: 'Tinjau dan buat permintaan' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Buat permintaan' }));
    await waitFor(() => expect(requestAdjustment).toHaveBeenCalledTimes(2));
    expect(requestAdjustment.mock.calls[0]?.[1]).toBe(requestAdjustment.mock.calls[1]?.[1]);
  });

  it('renders numbered pagination for balances and navigates to page 2', async () => {
    const list = vi.fn().mockImplementation((branchId, cursor, search, status, customerUserId, page) =>
      Promise.resolve({
        items: [balance],
        summary: { packageCount: 25, ledgerBalance: 10, reserved: 2, available: 8 },
        total: 25,
        totalPages: 2,
        currentPage: page ?? 1,
        pageSize: 20,
        nextCursor: null,
      }),
    );
    renderLedger(<LedgerView client={fake({ list })} />);
    expect(await screen.findByText(/Halaman 1 dari 2/)).toBeInTheDocument();
    expect(screen.getByText(/Menampilkan 1–20 dari 25/)).toBeInTheDocument();
    const page2Button = screen.getByRole('button', { name: 'Halaman 2' });
    await userEvent.click(page2Button);
    await waitFor(() => {
      expect(list).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        2,
        20,
      );
    });
  });

  it('renders numbered pagination for adjustments and navigates pages', async () => {
    const listAdjustments = vi.fn().mockImplementation((branchId, status, cursor, q, customerUserId, from, until, limit, page) =>
      Promise.resolve({
        items: [
          {
            id: 'adj-1',
            customerPackageId: 'cp-1',
            quantity: 2,
            reasonCode: 'PACKAGE_COMPENSATION',
            status: 'PENDING',
            version: 0,
            eligibleForApproval: true,
          },
        ],
        summary: { total: 35, pending: 35, posted: 0, rejected: 0 },
        total: 35,
        totalPages: 2,
        currentPage: page ?? 1,
        pageSize: 20,
        nextCursor: null,
      }),
    );
    renderLedger(<LedgerView client={fake({ listAdjustments })} initialWorkspaceTab="adjustments" />);
    expect(await screen.findByText(/Halaman 1 dari 2/)).toBeInTheDocument();
    expect(screen.getByText(/Menampilkan 1–20 dari 35/)).toBeInTheDocument();
    const page2Button = screen.getByRole('button', { name: 'Halaman 2' });
    await userEvent.click(page2Button);
    await waitFor(() => {
      expect(listAdjustments).toHaveBeenCalledWith(
        undefined,
        'PENDING',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        2,
        20,
      );
    });
  });

  it('performs direct 1-click adjustment when user has manager/owner direct authority', async () => {
    const directAdjustment = vi.fn().mockResolvedValue({ id: 'adj-direct-1', status: 'POSTED' });
    renderLedger(<LedgerView client={fake({ directAdjustment })} />);
    await userEvent.click(screen.getByRole('tab', { name: /Penyesuaian Sesi/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Buat permintaan penyesuaian' }));
    expect(screen.getByText('Penyesuaian sesi langsung (Manager/Owner)')).toBeInTheDocument();

    const lookup = screen.getByLabelText('Cari pelanggan atau paket aktif');
    await userEvent.type(lookup, 'Nadia');
    await waitFor(() => expect(lookup).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.click(await screen.findByRole('option', { name: /Nadia/ }));
    await userEvent.type(screen.getByLabelText('Perubahan sesi'), '2');
    await userEvent.selectOptions(screen.getByLabelText('Alasan'), 'PACKAGE_COMPENSATION');

    await userEvent.click(screen.getByRole('button', { name: 'Tinjau dan terapkan sekarang' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Terapkan sekarang (Posting)' }));

    expect(directAdjustment).toHaveBeenCalledWith(
      expect.objectContaining({
        customerPackageId: 'cp-1',
        quantity: 2,
        reasonCode: 'PACKAGE_COMPENSATION',
      }),
      expect.any(String),
    );
    expect(
      await screen.findByText(/berhasil diterapkan langsung ke saldo member/),
    ).toBeVisible();
  });

  it('handles direct adjustment non-happy path error gracefully', async () => {
    const directAdjustment = vi.fn().mockRejectedValue({
      response: {
        status: 409,
        data: { message: 'Jumlah sesi yang dikurangi melebihi sisa sesi aktif' },
      },
    });
    renderLedger(<LedgerView client={fake({ directAdjustment })} />);
    await userEvent.click(screen.getByRole('tab', { name: /Penyesuaian Sesi/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Buat permintaan penyesuaian' }));

    const lookup = screen.getByLabelText('Cari pelanggan atau paket aktif');
    await userEvent.type(lookup, 'Nadia');
    await waitFor(() => expect(lookup).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.click(await screen.findByRole('option', { name: /Nadia/ }));
    await userEvent.type(screen.getByLabelText('Perubahan sesi'), '-15');
    await userEvent.selectOptions(screen.getByLabelText('Alasan'), 'ATTENDANCE_CORRECTION');

    await userEvent.click(screen.getByRole('button', { name: 'Tinjau dan terapkan sekarang' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Terapkan sekarang (Posting)' }));

    expect(directAdjustment).toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

describe('browser ledger transport', () => {
  it('hydrates JSON timestamps before the view formats them', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              ...balance,
              activationDate: '2026-01-01T00:00:00.000Z',
              expiryAt: '2026-12-01T00:00:00.000Z',
            },
          ],
          page: { nextCursor: null },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await browserLedgerClient.list();

    expect(result.items[0]?.activationDate).toBeInstanceOf(Date);
    expect(result.items[0]?.expiryAt).toBeInstanceOf(Date);
    expect(result.summary.available).toBe(8);
    vi.unstubAllGlobals();
  });
});
