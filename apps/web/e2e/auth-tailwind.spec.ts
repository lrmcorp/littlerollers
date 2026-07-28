import { expect, test } from '@playwright/test';
import { hideNextDevelopmentAffordances } from './e2e-visual-helpers';

const breakpoints = [
  { name: 'desktop-1280', width: 1280, height: 900 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'mobile-360', width: 360, height: 800 },
];

test.beforeEach(async ({ page }) => {
  await hideNextDevelopmentAffordances(page);
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'visual-super-owner',
        displayName: 'Visual Super Owner',
        roles: ['SUPER_OWNER'],
        branchIds: ['branch-1'],
        sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        capabilities: ['user:read', 'user:admin', 'audit:read', 'branch:all'],
        branches: [{ id: 'branch-1', code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' }],
      }),
    }),
  );
  await page.route('**/api/v1/users/role-catalog', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            role: 'ADMIN',
            capabilities: ['user:read'],
            assignable: true,
            readOnly: false,
            scope: 'BRANCH',
          },
        ],
      }),
    }),
  );
  await page.route('**/api/v1/users?**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], page: { nextCursor: null, hasMore: false } }),
    }),
  );
  await page.route('**/api/v1/users', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], page: { nextCursor: null, hasMore: false } }),
    }),
  );
});

for (const breakpoint of breakpoints) {
  test(`Tailwind Studios ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize(breakpoint);
    await page.goto('/locations');
    await expect(page.getByRole('heading', { name: 'Studio Kami', exact: true })).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);
    await expect(page).toHaveScreenshot(`studios-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test(`premium sign-in ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize(breakpoint);
    await page.goto('/sign-in?returnTo=%2Fclasses%23schedule');
    await expect(page.getByRole('heading', { name: 'Masuk ke Daily Dose' })).toBeVisible();
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);
    await expect(page).toHaveScreenshot(`sign-in-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test(`activation and reset ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize(breakpoint);
    await page.goto('/activate-account?token=visual-token');
    await expect(page.getByRole('heading', { name: 'Buat password' })).toBeVisible();
    await expect(page).toHaveScreenshot(`activation-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });

    await page.goto('/reset-password?token=visual-token');
    await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);
    await expect(page).toHaveScreenshot(`reset-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test(`permission-based user management ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize(breakpoint);
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Pengguna', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buat pengguna internal' })).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);
  });
}
