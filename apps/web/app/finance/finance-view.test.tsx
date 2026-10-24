import { render, screen, waitFor, within } from '@testing-library/react';
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
      getMonthlyProfit: vi.fn().mockRejectedValue(new Error('Koneksi server terputus saat mengambil laporan laba rugi')),
      getOmsetReport: vi.fn().mockResolvedValue({ transactions: [], totalOmsetRp: 0, totalTransactions: 0 }),
      getInstructorCostRealtime: vi.fn().mockResolvedValue({ instructors: [], totalFeeRp: 0, totalHours: 0, totalSessions: 0 }),
      getOtherCostReport: vi.fn().mockResolvedValue({ items: [], totalOtherCostRp: 0 }),
    } as unknown as FinanceClient;

    render(
      <AppFeedbackProvider>
        <FinanceView client={client} />
      </AppFeedbackProvider>,
    );

    expect(
      await screen.findByText('Koneksi server terputus saat mengambil laporan laba rugi'),
    ).toBeVisible();
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
