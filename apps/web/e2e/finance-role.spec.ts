import { expect, test } from '@playwright/test';

const session = (role: 'FINANCE' | 'MANAGER') => ({
  id: `${role.toLowerCase()}-1`,
  displayName: `${role} Demo`,
  roles: [role],
  branchIds: role === 'MANAGER' ? ['branch-1'] : [],
  sessionExpiresAt: '2027-07-26T12:00:00.000Z',
  capabilities:
    role === 'FINANCE'
      ? [
          'finance:read',
          'finance:reconcile',
          'finance:export',
          'payment:review',
          'payment:decide',
          'ledger:read',
        ]
      : [
          'branch:manage',
          'user:read',
          'class-slot:read',
          'class-slot:manage',
          'booking:read',
          'reschedule:decide',
        ],
  branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
});

test('Finance sees reconciliation while Manager cannot open it', async ({ page }) => {
  let activeRole: 'FINANCE' | 'MANAGER' = 'FINANCE';
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(session(activeRole)),
    }),
  );
  await page.route('**/api/v1/dashboard/overview**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        period: {
          from: new Date().toISOString(),
          until: new Date().toISOString(),
          previousFrom: new Date().toISOString(),
          previousUntil: new Date().toISOString(),
        },
        roleFocus: activeRole === 'FINANCE' ? 'FINANCE' : 'BRANCH',
        metrics: [],
        queues: [],
        trend: [],
        branches: [],
        risks: [],
        activities: [],
        jobs: [],
      }),
    }),
  );
  await page.route('**/api/v1/finance/reconciliation/overview**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        period: { from: new Date().toISOString(), until: new Date().toISOString() },
        metrics: {
          expectedRp: 1500000,
          receivedRp: 1500000,
          approvedRp: 1000000,
          pendingRp: 500000,
          rejectedRp: 0,
          ledgerDeltaRp: 0,
          unreconciledCount: 1,
        },
        branches: [
          {
            id: 'branch-1',
            code: 'JKT',
            name: 'Jakarta',
            expectedRp: 1500000,
            receivedRp: 1500000,
            approvedRp: 1000000,
            pendingCount: 1,
            anomalyCount: 0,
          },
        ],
      }),
    }),
  );
  await page.route('**/api/v1/finance/reconciliation/anomalies**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        items: [],
        total: 0,
        page: { hasMore: false, nextCursor: null },
      }),
    }),
  );
  await page.route('**/api/v1/finance/reconciliation/legacy-cashflow**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [],
        total: 0,
        summary: {},
        page: { hasMore: false, nextCursor: null },
      }),
    }),
  );

  await page.goto('/finance');
  await expect(page.getByRole('heading', { name: 'Rekonsiliasi transaksi' })).toBeVisible();
  await expect(page.getByText('Rp 1.500.000').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Finance' })).toBeVisible();

  activeRole = 'MANAGER';
  await page.reload();
  await expect(page).toHaveURL(/\/workspace$/);
  await expect(page.getByRole('heading', { name: 'Selamat datang, MANAGER Demo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Finance' })).toHaveCount(0);
});
