import { render, screen } from '@testing-library/react';
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
        <FinanceView client={client} />
      </AppFeedbackProvider>,
    );
    expect(await screen.findByText('Halaman 1 · 20 data dari 25 anomali')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Berikutnya' }));
    expect(await screen.findByText('Halaman 2 · 5 data dari 25 anomali')).toBeVisible();
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
        <FinanceView client={client} />
      </AppFeedbackProvider>,
    );
    await screen.findByRole('heading', { name: 'Rekonsiliasi transaksi' });
    await userEvent.click(screen.getByRole('button', { name: 'Export CSV' }));

    expect(exportReport).toHaveBeenCalledWith(expect.objectContaining({ branchId: 'branch-1' }));
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:finance');
  });
});
