import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dashboard } from './dashboard';
import type { DashboardClient, DashboardOverview } from './dashboard-client';

vi.mock('./session-context', () => ({
  useSessionContext: () => ({
    activeBranchId: 'branch-1',
    activeBranch: { id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' },
    session: {
      displayName: 'Super Owner',
      roles: ['SUPER_OWNER'],
      capabilities: ['branch:all', 'finance:read'],
      branches: [
        { id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' },
        { id: 'branch-2', code: 'BDG', name: 'Bandung', timezone: 'Asia/Jakarta' },
      ],
    },
  }),
}));

const response = (): DashboardOverview =>
  ({
    generatedAt: new Date('2026-08-08T00:00:00.000Z'),
    period: {
      from: new Date('2026-08-01T00:00:00.000Z'),
      until: new Date('2026-08-08T00:00:00.000Z'),
      previousFrom: new Date('2026-07-24T00:00:00.000Z'),
      previousUntil: new Date('2026-07-31T00:00:00.000Z'),
    },
    financial: {
      grossSalesRp: 1_000_000,
      packagePromotionDiscountRp: 0,
      voucherDiscountRp: 0,
      revenueRp: 1_000_000,
      projectionRp: 400_000,
      instructorRealtimeRp: 200_000,
      otherCostRp: 150_000,
      correctionRp: 25_000,
      profitRp: 450_000,
      completeness: 'COMPLETE',
      anomalyCount: 0,
      sourceCutoffAt: new Date('2026-08-08T00:00:00.000Z'),
      controlHash: 'a'.repeat(64),
    },
    roleFocus: 'EXECUTIVE',
    sections: {
      executive: true,
      owner: false,
      branchOperations: false,
      finance: false,
      operations: false,
      trend: true,
      queue: true,
      risk: true,
      branchComparison: true,
      auditActivity: true,
      jobHealth: true,
    },
    metrics: [
      { key: 'revenue', label: 'Omzet bersih', value: 1_000_000, unit: 'IDR', changePercent: 0 },
      { key: 'profit', label: 'Profit operasional', value: 450_000, unit: 'IDR', changePercent: 0 },
    ],
    queues: [],
    trend: [
      {
        date: new Date('2026-08-01T00:00:00.000Z'),
        revenue: 1_000_000,
        profit: 450_000,
        bookings: 1,
      },
      { date: new Date('2026-08-02T00:00:00.000Z'), revenue: 0, profit: 0, bookings: 0 },
    ],
    branches: [],
    risks: [],
    activities: [],
    jobs: [],
  }) as DashboardOverview;

describe('Super Owner financial dashboard', () => {
  it('uses a local branch filter without changing the operational branch', async () => {
    const overview = vi.fn().mockResolvedValue(response());
    render(<Dashboard client={{ overview } as DashboardClient} />);

    expect(await screen.findByText('Omzet bersih')).toBeVisible();
    expect(screen.getByText('Profit operasional')).toBeVisible();
    expect(screen.getByText(/Cabang operasional: Jakarta/)).toBeVisible();

    const branchFilter = screen.getByRole('combobox', { name: 'Studio/Cabang' });
    await userEvent.click(branchFilter);
    await userEvent.click(screen.getByRole('option', { name: /Bandung/ }));
    expect(await screen.findByText(/Scope:/)).toBeVisible();
    expect(overview).toHaveBeenLastCalledWith(expect.objectContaining({ branchId: 'branch-2' }));
    expect(screen.getByText(/Cabang operasional: Jakarta/)).toBeVisible();
  });

  it('does not present incomplete financial facts as authoritative zeroes', async () => {
    const incomplete = response();
    incomplete.financial.completeness = 'INCOMPLETE';
    incomplete.financial.anomalyCount = 1;
    incomplete.metrics = [
      { key: 'revenue', label: 'Omzet bersih', value: 0, unit: 'IDR', changePercent: 0 },
    ];
    render(
      <Dashboard
        client={{ overview: vi.fn().mockResolvedValue(incomplete) } as unknown as DashboardClient}
      />,
    );

    expect(await screen.findByText('Belum tersedia')).toBeVisible();
    expect(screen.getByText('Konfigurasi atau sumber belum lengkap')).toBeVisible();
    expect(screen.getByText(/belum boleh digunakan/)).toBeVisible();
  });
});
