import { expect, test } from '@playwright/test';

const branches = [
  { id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' },
  { id: 'branch-2', code: 'BDG', name: 'Bandung', timezone: 'Asia/Jakarta' },
];

function overview(branchId?: string) {
  const scoped = branchId === 'branch-2';
  const revenue = scoped ? 400_000 : 1_000_000;
  const projection = scoped ? 160_000 : 400_000;
  const instructor = scoped ? 80_000 : 200_000;
  const other = scoped ? 60_000 : 150_000;
  const profit = revenue - projection - other;
  return {
    generatedAt: '2026-08-08T10:00:00.000Z',
    period: {
      from: '2026-08-01',
      until: '2026-08-08',
      previousFrom: '2026-07-24',
      previousUntil: '2026-07-31',
    },
    financial: {
      grossSalesRp: revenue,
      packagePromotionDiscountRp: 0,
      voucherDiscountRp: 0,
      revenueRp: revenue,
      projectionRp: projection,
      instructorRealtimeRp: instructor,
      otherCostRp: other,
      correctionRp: 25_000,
      profitRp: profit,
      completeness: 'COMPLETE',
      anomalyCount: 0,
      sourceCutoffAt: '2026-08-08T10:00:00.000Z',
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
      { key: 'grossSales', label: 'Penjualan kotor', value: revenue, unit: 'IDR', changePercent: 0 },
      { key: 'revenue', label: 'Omzet bersih', value: revenue, unit: 'IDR', changePercent: 0 },
      { key: 'projection', label: 'Proyeksi beban', value: projection, unit: 'IDR' },
      { key: 'instructor', label: 'Pendapatan instruktur', value: instructor, unit: 'IDR' },
      { key: 'otherCost', label: 'Pengeluaran lain', value: other, unit: 'IDR' },
      { key: 'profit', label: 'Profit operasional', value: profit, unit: 'IDR', changePercent: 0 },
      { key: 'correction', label: 'Koreksi (terpisah)', value: 25_000, unit: 'IDR' },
    ],
    queues: [],
    trend: [
      { date: '2026-08-01', revenue: revenue, profit, bookings: 5 },
      { date: '2026-08-02', revenue: 0, profit: 0, bookings: 0 },
    ],
    branches: branches.map((branch) => ({
      ...branch,
      revenueRp: branch.id === 'branch-2' ? 400_000 : 600_000,
      projectionRp: branch.id === 'branch-2' ? 160_000 : 240_000,
      instructorRealtimeRp: branch.id === 'branch-2' ? 80_000 : 120_000,
      otherCostRp: branch.id === 'branch-2' ? 60_000 : 90_000,
      profitRp: branch.id === 'branch-2' ? 180_000 : 270_000,
      bookings: 5,
      occupancyPercent: 50,
      pending: 0,
      anomalies: 0,
    })),
    risks: [],
    activities: [],
    jobs: [],
  };
}

test('Super Owner dashboard follows the topbar branch and shows authoritative financials', async ({
  page,
}) => {
  const overviewRequests: URL[] = [];
  await page.addInitScript(() => sessionStorage.setItem('dd_active_branch', 'branch-1'));
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'owner-1',
        displayName: 'Super Owner',
        roles: ['SUPER_OWNER'],
        branchIds: branches.map(({ id }) => id),
        activeBranchId: 'branch-1',
        sessionExpiresAt: '2027-08-08T00:00:00.000Z',
        capabilities: ['branch:all', 'finance:read', 'finance:export'],
        branches,
      }),
    }),
  );
  await page.route('**/api/v1/dashboard/overview**', (route) => {
    const url = new URL(route.request().url());
    overviewRequests.push(url);
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(overview(url.searchParams.get('branchId') ?? undefined)),
    });
  });

  await page.goto('/workspace');
  await expect(page.getByText('Omzet bersih')).toBeVisible();
  await expect(page.getByText('Rp\u00a01.000.000').first()).toBeVisible();
  await expect(page.getByText(/Cabang operasional: Jakarta/)).toBeVisible();

  // Satu-satunya pemilih cabang ada di topbar; Dashboard mengikutinya.
  await expect(page.getByRole('combobox', { name: 'Studio/Cabang', exact: true })).toHaveCount(0);
  const branchSelect = page.getByRole('combobox', { name: 'Cabang aktif', exact: true });
  await branchSelect.click();
  await page.getByRole('option', { name: /Bandung/ }).click();

  await expect(page.getByText('Rp\u00a0400.000').first()).toBeVisible();
  await expect(page.getByText(/Cabang operasional: Bandung/)).toBeVisible();
  await expect.poll(() => overviewRequests.at(-1)?.searchParams.get('branchId')).toBe('branch-2');
});
