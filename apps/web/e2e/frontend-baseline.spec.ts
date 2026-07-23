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

test('public catalog requires a studio then shows authoritative availability', async ({ page }) => {
  await page.route('**/api/v1/public/class-catalog**', (route) => {
    const selected = new URL(route.request().url()).searchParams.has('branchId');
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        branches: [{ id: 'branch-1', code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' }],
        items: selected
          ? [
              {
                id: 'slot-1',
                branchId: 'branch-1',
                classType: { id: 'type-1', code: 'PRIVATE', name: 'Private Class' },
                startAt: '2026-07-25T03:00:00.000Z',
                endAt: '2026-07-25T03:50:00.000Z',
                timezone: 'Asia/Jakarta',
                status: 'PUBLISHED',
                capacity: 4,
                available: 2,
              },
            ]
          : [],
        range: { from: '2026-07-23T00:00:00.000Z', until: '2026-08-06T00:00:00.000Z' },
      }),
    });
  });
  await page.goto('/classes');
  await expect(page.getByText('Pilih studio untuk melihat kelas')).toBeVisible();
  await page.getByLabel('Studio').selectOption('branch-1');
  await expect(page.getByRole('heading', { name: 'Private Class', exact: true })).toBeVisible();
  await expect(page.getByText('2 tempat')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pilih kelas' })).toHaveAttribute(
    'href',
    '/sign-in?returnTo=%2Fclasses%3Fslot%3Dslot-1',
  );
});

for (const breakpoint of breakpoints) {
  test(`public landing ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: 'Gerak yang terasa baik, untuk hidup yang lebih seimbang.',
      }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navigasi publik' })).toBeAttached();
    await expect(page.getByRole('heading', { name: 'Private Class', exact: true })).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus-visible')).toBeVisible();
    await expect(page).toHaveScreenshot(`public-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
}

for (const breakpoint of breakpoints) {
  test(`responsive application shell ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
    await page.goto('/workspace');

    await expect(
      page.getByRole('heading', { name: 'Selamat datang, Synthetic Operator' }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navigasi utama' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Booking' }).first()).toBeAttached();
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
  const current = page.getByRole('link', { name: 'Booking' });
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
  await page.goto('/workspace');
  await expect(page.getByRole('link', { name: 'Ledger', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pengguna', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Operations H-24' })).toHaveCount(0);
});

test('branch choice persists per tab and a revoked API response ends the session', async ({
  page,
}) => {
  await page.goto('/workspace');
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption('branch-1');
  await page.reload();
  await expect(page.getByLabel('Cabang aktif', { exact: true })).toHaveValue('branch-1');
  await page.route('**/api/v1/**', (route) => route.fulfill({ status: 401, body: '{}' }));
  await page.goto('/bookings');
  await expect(page).toHaveURL('/sign-in?returnTo=%2Fbookings');
});
