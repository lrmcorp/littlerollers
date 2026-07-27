import { expect, test } from '@playwright/test';

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`admin dashboard shell fits ${viewport.width}px without horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.route('**/api/v1/me', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'owner-1',
          displayName: 'Daily Dose Owner',
          roles: ['SUPER_OWNER'],
          branchIds: ['branch-1'],
          sessionExpiresAt: '2027-07-26T12:00:00.000Z',
          capabilities: ['branch:all', 'purchase:review', 'audit:read', 'operations:read'],
          branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
        }),
      }),
    );
    await page.route('**/api/v1/dashboard/overview**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          generatedAt: '2026-07-26T12:00:00.000Z',
          period: {
            from: '2026-07-01T00:00:00.000Z',
            until: '2026-07-26T23:59:59.999Z',
            previousFrom: '2026-06-05T00:00:00.000Z',
            previousUntil: '2026-07-01T00:00:00.000Z',
          },
          roleFocus: 'OWNER',
          metrics: [
            {
              key: 'revenue',
              label: 'Pendapatan disetujui',
              value: 12500000,
              unit: 'IDR',
              changePercent: 8.2,
            },
          ],
          queues: [
            {
              key: 'payments',
              label: 'Pembayaran menunggu',
              count: 4,
              href: '/workspace/payments?status=PENDING',
            },
          ],
          trend: [],
          branches: [],
          risks: [],
          activities: [],
          jobs: [],
        }),
      }),
    );

    await page.goto('/workspace');
    await expect(page.getByRole('heading', { name: /Selamat datang/i })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    if (viewport.width >= 1024) {
      await expect(page.getByLabel('Navigasi utama')).toBeVisible();
    } else {
      const drawerBox = await page.getByLabel('Navigasi utama').boundingBox();
      expect(drawerBox && drawerBox.x + drawerBox.width).toBeLessThanOrEqual(0);
      await expect(page.getByRole('button', { name: 'Buka navigasi' })).toBeVisible();
    }
  });
}
