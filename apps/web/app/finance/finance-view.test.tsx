import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../components/app-feedback';
import type { FinanceClient } from './finance-client';
import { FinanceView } from './finance-view';

vi.mock('../session-context', () => ({
  useSessionContext: () => ({
    activeBranchId: 'branch-1',
    activeBranch: { id: 'branch-1', code: 'JKT', name: 'Jakarta' },
    hasCapability: () => true,
    session: {
      branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta' }],
    },
  }),
}));

const anomaly = (index: number) => ({
  purchaseId: `purchase-${index}`,
  branchId: 'branch-1',
  branchCode: 'JKT',
  amountRp: 100_000 + index,
  submittedAt: new Date('2026-08-01T00:00:00Z'),
  code: 'STALE_PENDING_PAYMENT' as const,
  severity: 'WARNING' as const,
  href: `/workspace/payments?purchaseId=purchase-${index}`,
});

describe('Finance anomaly pagination', () => {
  it('changes anomaly pages without recomputing the overview', async () => {
    const overview = vi.fn().mockResolvedValue({
      generatedAt: new Date(),
      period: { from: new Date(), until: new Date() },
      metrics: {
        expectedRp: 0,
        receivedRp: 0,
        approvedRp: 0,
        identificationAmountRp: 0,
        ledgerDeltaRp: 0,
        unreconciledCount: 25,
      },
      branches: [],
    });
    const anomalies = vi.fn((_input, cursor?: string) =>
      Promise.resolve({
        items: cursor
          ? Array.from({ length: 5 }, (_, index) => anomaly(index + 21))
          : Array.from({ length: 20 }, (_, index) => anomaly(index + 1)),
        total: 25,
        page: { hasMore: !cursor, nextCursor: cursor ? null : 'purchase-20' },
      }),
    );
    const legacyCashflow = vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      summary: {},
      page: { hasMore: false, nextCursor: null },
    });
    const client = { overview, anomalies, legacyCashflow } as FinanceClient;

    render(
      <AppFeedbackProvider>
        <FinanceView client={client} initialTab="RECONCILIATION" />
      </AppFeedbackProvider>,
    );
    // Navigasi paginasi pertama di halaman ini adalah milik antrean anomali.
    const anomalyPagination = () => screen.getAllByRole('navigation', { name: 'Paginasi data' })[0]!;
    await waitFor(() => expect(within(anomalyPagination()).getByText('Halaman 1')).toBeVisible());
    await userEvent.click(screen.getByRole('button', { name: 'Berikutnya' }));
    await waitFor(() => expect(within(anomalyPagination()).getByText('Halaman 2')).toBeVisible());
    expect(overview).toHaveBeenCalledTimes(1);
    expect(anomalies).toHaveBeenLastCalledWith(expect.any(Object), 'purchase-20');
  });

  it('downloads only the audited authoritative server export', async () => {
    const exportReport = vi.fn().mockResolvedValue({
      fileName: 'finance-authoritative.csv',
      mimeType: 'text/csv;charset=utf-8',
      content: 'branch_code,revenue_rp\nJKT,1000000',
      controlHash: 'a'.repeat(64),
      sourceCutoffAt: new Date(),
      completeness: 'COMPLETE',
      auditLogId: 'audit-1',
    });
    const client = {
      overview: vi.fn().mockResolvedValue({
        generatedAt: new Date(),
        period: { from: new Date(), until: new Date() },
        metrics: {
          expectedRp: 0,
          receivedRp: 0,
          approvedRp: 0,
          identificationAmountRp: 0,
          ledgerDeltaRp: 0,
          unreconciledCount: 0,
        },
        branches: [],
      }),
      anomalies: vi.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: { hasMore: false, nextCursor: null },
      }),
      legacyCashflow: vi.fn().mockResolvedValue({
        items: [],
        total: 0,
        summary: {},
        page: { hasMore: false, nextCursor: null },
      }),
      exportReport,
    } as FinanceClient;
    const createObjectURL = vi.fn().mockReturnValue('blob:finance');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    render(
      <AppFeedbackProvider>
        <FinanceView client={client} initialTab="RECONCILIATION" />
      </AppFeedbackProvider>,
    );
    await screen.findByRole('heading', { name: 'Rekonsiliasi transaksi' });
    await userEvent.click(screen.getByRole('button', { name: 'Ekspor CSV' }));

    expect(exportReport).toHaveBeenCalledWith(expect.objectContaining({ branchId: 'branch-1' }));
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:finance');
  });

  it('renders Laporan Keuangan & Honor Instruktur as the default tab', async () => {
    const client = {
      overview: vi.fn().mockResolvedValue({
        generatedAt: new Date(),
        period: { from: new Date(), until: new Date() },
        metrics: {
          expectedRp: 0,
          receivedRp: 0,
          approvedRp: 0,
          identificationAmountRp: 0,
          ledgerDeltaRp: 0,
          unreconciledCount: 0,
        },
        branches: [],
      }),
      anomalies: vi.fn().mockResolvedValue({ items: [], total: 0, page: { hasMore: false, nextCursor: null } }),
      legacyCashflow: vi.fn().mockResolvedValue({ items: [], total: 0, summary: {}, page: { hasMore: false, nextCursor: null } }),
      getProfitCloseReport: vi.fn().mockResolvedValue({
        monthlyProfit: {
          omsetRp: 50_000_000,
          instructorFeeRp: 15_000_000,
          otherCostRp: 5_000_000,
          grossProfitRp: 30_000_000,
          isPeriodLocked: false,
        },
      }),
      getOmsetReport: vi.fn().mockResolvedValue({ transactions: [], totalOmsetRp: 0, totalTransactions: 0 }),
      getRealtimeInstructorReport: vi.fn().mockResolvedValue({ instructors: [], totalFeeRp: 0, totalHours: 0, totalSessions: 0 }),
      getOtherCostReport: vi.fn().mockResolvedValue({ items: [], totalOtherCostRp: 0 }),
    } as unknown as FinanceClient;

    render(
      <AppFeedbackProvider>
        <FinanceView client={client} />
      </AppFeedbackProvider>,
    );

    // Verify default active tab is Laporan Keuangan & Honor Instruktur
    expect(
      screen.getByRole('button', { name: /Laporan Keuangan & Honor Instruktur/i }),
    ).toHaveClass('border-dd-forest');
  });

  it('displays error feedback when financial reports fail to load (non-happy path)', async () => {
    const client = {
      overview: vi.fn().mockResolvedValue({
        generatedAt: new Date(),
        period: { from: new Date(), until: new Date() },
        metrics: { expectedRp: 0, receivedRp: 0, approvedRp: 0, identificationAmountRp: 0, ledgerDeltaRp: 0, unreconciledCount: 0 },
        branches: [],
      }),
      anomalies: vi.fn().mockResolvedValue({ items: [], total: 0, page: { hasMore: false, nextCursor: null } }),
      legacyCashflow: vi.fn().mockResolvedValue({ items: [], total: 0, summary: {}, page: { hasMore: false, nextCursor: null } }),
      getProfit: vi.fn().mockRejectedValue(new Error('Koneksi server terputus saat mengambil laporan laba rugi')),
      getOmsetReport: vi.fn().mockResolvedValue({ transactions: [], totalOmsetRp: 0, totalTransactions: 0 }),
      getInstructorCostRealtime: vi.fn().mockResolvedValue({ instructors: [], totalFeeRp: 0, totalHours: 0, totalSessions: 0 }),
      getOtherCostReport: vi.fn().mockResolvedValue({ items: [], totalOtherCostRp: 0 }),
    } as unknown as FinanceClient;

    render(
      <AppFeedbackProvider>
        <FinanceView client={client} />
      </AppFeedbackProvider>,
    );

    expect(await screen.findByText(/Permintaan belum berhasil/)).toBeVisible();
  });

  it('displays reconFailed feedback when reconciliation overview fails (non-happy path)', async () => {
    const client = {
      overview: vi.fn().mockRejectedValue(new Error('Database timeout')),
      anomalies: vi.fn().mockResolvedValue({ items: [], total: 0, page: { hasMore: false, nextCursor: null } }),
      legacyCashflow: vi.fn().mockResolvedValue({ items: [], total: 0, summary: {}, page: { hasMore: false, nextCursor: null } }),
    } as unknown as FinanceClient;

    render(
      <AppFeedbackProvider>
        <FinanceView client={client} initialTab="RECONCILIATION" />
      </AppFeedbackProvider>,
    );

    expect(
      await screen.findByText(/Gagal memuat atau mengekspor data finansial server/i),
    ).toBeVisible();
  });
});

describe('Finance reports by date range', () => {
  const profit = {
    period: '2026-10',
    from: '2026-10-01',
    until: '2026-10-31',
    branchId: 'branch-1',
    omsetRp: 10_000_000,
    costRealtimeRp: 4_000_000,
    grossProfitRp: 6_000_000,
    grossMarginPercent: 60,
    otherCostRp: 1_000_000,
    netProfitRealtimeRp: 5_000_000,
    netMarginPercent: 50,
  };
  const reports = () => ({
    overview: vi.fn().mockResolvedValue({
      generatedAt: new Date(),
      period: { from: new Date(), until: new Date() },
      metrics: { expectedRp: 0, receivedRp: 0, approvedRp: 0, identificationAmountRp: 0, ledgerDeltaRp: 0, unreconciledCount: 0 },
      branches: [],
    }),
    anomalies: vi.fn().mockResolvedValue({ items: [], total: 0, page: { hasMore: false, nextCursor: null } }),
    legacyCashflow: vi.fn().mockResolvedValue({ items: [], total: 0, summary: {}, page: { hasMore: false, nextCursor: null } }),
    getProfit: vi.fn().mockResolvedValue(profit),
    getOmsetReport: vi.fn().mockResolvedValue({ transactions: [], totalOmsetRp: 0, totalTransactionCount: 0, byPaymentMethod: {} }),
    getInstructorCostRealtime: vi.fn().mockResolvedValue({ instructors: [], totalInstructorCostRp: 0 }),
    getOtherCostReport: vi.fn().mockResolvedValue({
      period: '2026-10',
      from: '2026-10-01',
      until: '2026-10-31',
      totalOtherCostRp: 1_000_000,
      byCategory: { SEWA: { count: 1, amountRp: 1_000_000 } },
      items: [
        {
          id: 'cost-1',
          branchId: 'branch-1',
          branchName: 'Jakarta',
          period: '2026-10',
          incurredOn: '2026-10-12',
          category: 'SEWA',
          description: 'Sewa studio',
          amountRp: 1_000_000,
          createdByName: 'Admin',
          createdAt: '2026-10-12T03:00:00Z',
        },
      ],
    }),
    createOtherCost: vi.fn().mockResolvedValue({}),
    updateOtherCost: vi.fn().mockResolvedValue({}),
  });

  it('loads every report for the chosen from–until range and has no month-close controls', async () => {
    const client = reports() as unknown as FinanceClient;
    render(
      <AppFeedbackProvider>
        <FinanceView client={client} />
      </AppFeedbackProvider>,
    );
    await screen.findByText('Laporan Laba Rugi Berjenjang (P&L)');
    expect(screen.queryByText(/tutup buku/i)).toBeNull();
    expect(screen.queryByText(/koreksi/i)).toBeNull();
    expect(client.getProfit).toHaveBeenLastCalledWith(
      'branch-1',
      expect.objectContaining({ from: expect.stringMatching(/^\d{4}-\d{2}-01$/), until: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) }),
    );

    fireEvent.change(screen.getByLabelText('Dari tanggal'), { target: { value: '2026-09-10' } });
    fireEvent.change(screen.getByLabelText('Sampai tanggal'), { target: { value: '2026-09-20' } });
    await waitFor(() =>
      expect(client.getOmsetReport).toHaveBeenLastCalledWith('branch-1', { from: '2026-09-10', until: '2026-09-20' }),
    );
    for (const method of ['getProfit', 'getInstructorCostRealtime', 'getOtherCostReport'] as const)
      expect(client[method]).toHaveBeenLastCalledWith('branch-1', { from: '2026-09-10', until: '2026-09-20' });
  });

  it('does not call the server for an inverted or oversized range', async () => {
    const client = reports() as unknown as FinanceClient;
    render(
      <AppFeedbackProvider>
        <FinanceView client={client} />
      </AppFeedbackProvider>,
    );
    await screen.findByText('Laporan Laba Rugi Berjenjang (P&L)');
    const calls = (client.getProfit as ReturnType<typeof vi.fn>).mock.calls.length;
    fireEvent.change(screen.getByLabelText('Dari tanggal'), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText('Sampai tanggal'), { target: { value: '2026-12-31' } });
    expect(await screen.findByText(/Rentang terlalu lebar/)).toBeVisible();
    expect(client.getProfit).toHaveBeenCalledTimes(calls);
  });

  it('applies a quick range and records a dated cost from the Biaya Lain tab', async () => {
    const user = userEvent.setup();
    const client = reports() as unknown as FinanceClient;
    render(
      <AppFeedbackProvider>
        <FinanceView client={client} />
      </AppFeedbackProvider>,
    );
    await screen.findByText('Laporan Laba Rugi Berjenjang (P&L)');
    await user.click(screen.getByRole('button', { name: 'Bulan lalu' }));
    await waitFor(() => expect((client.getProfit as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(1));

    await user.click(screen.getByRole('button', { name: /4\. Biaya Operasional Lain/ }));
    expect(await screen.findByText('12 Okt 2026')).toBeVisible();

    fireEvent.change(screen.getByLabelText('Tanggal pengeluaran'), { target: { value: '2026-10-05' } });
    await user.clear(screen.getByLabelText('Keterangan'));
    await user.type(screen.getByLabelText('Keterangan'), 'Listrik');
    await user.type(screen.getByLabelText('Nominal (Rp)'), '750000');
    await user.click(screen.getByRole('button', { name: 'Simpan biaya' }));
    await waitFor(() =>
      expect(client.createOtherCost).toHaveBeenCalledWith({
        branchId: 'branch-1',
        incurredOn: '2026-10-05',
        categoryCode: 'OPERATING_EXPENSE',
        description: 'Listrik',
        amountRp: 750000,
      }),
    );
  });
});
