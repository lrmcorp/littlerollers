import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'visual-user',
        displayName: 'Synthetic Operator',
        roles: ['SUPER_OWNER'],
        branchIds: ['branch-1'],
        assurance: 'MFA',
        sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        capabilities: [
          'user:read',
          'assignment:read',
          'master:read',
          'package:read',
          'purchase:review',
          'ledger:read',
          'class-slot:read',
          'operations:read',
          'booking:read',
        ],
        branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
      }),
    }),
  );
});

const breakpoints = [
  { name: 'desktop-1280', width: 1280, height: 900 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'mobile-360', width: 360, height: 800 },
];

for (const breakpoint of breakpoints) {
  test(`responsive application shell ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Daily Dose Pilates' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navigasi utama' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Booking bantuan' }).first()).toBeAttached();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus-visible')).toBeVisible();
    await expect(page).toHaveScreenshot(`shell-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
}

test('navigation keeps current page context and keyboard access', async ({ page }) => {
  await page.goto('/bookings');
  const current = page.getByRole('link', { name: 'Booking bantuan' });
  await expect(current).toHaveAttribute('aria-current', 'page');
  await current.focus();
  await expect(current).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Booking bantuan pelanggan' })).toBeVisible();
});

test('protected route redirects to sign-in with a safe relative return target', async ({
  page,
}) => {
  await page.unroute('**/api/v1/me');
  await page.route('**/api/v1/me', (route) => route.fulfill({ status: 401, body: '{}' }));
  await page.goto('/ledger?cursor=next');
  await expect(page).toHaveURL('/sign-in?returnTo=%2Fledger%3Fcursor%3Dnext');
});

test('navigation hides capabilities that are not effective', async ({ page }) => {
  await page.unroute('**/api/v1/me');
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'finance-user',
        displayName: 'Finance',
        roles: ['FINANCE'],
        branchIds: ['branch-1'],
        assurance: 'BASE',
        sessionExpiresAt: new Date(Date.now() + 60_000).toISOString(),
        capabilities: ['ledger:read'],
        branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
      }),
    }),
  );
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Ledger', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pengguna', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Operations H-24' })).toHaveCount(0);
});

test('branch choice persists per tab and a revoked API response ends the session', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Cabang aktif').selectOption('branch-1');
  await page.reload();
  await expect(page.getByLabel('Cabang aktif')).toHaveValue('branch-1');
  await page.route('**/api/v1/bookings?**', (route) => route.fulfill({ status: 401, body: '{}' }));
  await page.goto('/bookings');
  await page.getByRole('button', { name: 'Muat booking' }).click();
  await expect(page).toHaveURL('/sign-in?returnTo=%2Fbookings');
});
