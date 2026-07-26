import { expect, test } from '@playwright/test';

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/me', (route) => route.fulfill({ status: 401, body: '{}' }));
  await page.route('**/api/v1/auth/refresh', (route) => route.fulfill({ status: 401, body: '{}' }));
  await page.route('**/api/v1/public/package-catalog**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        branches: [
          {
            id: 'branch-jkt',
            code: 'DD-JKT',
            name: 'Daily Dose Jakarta',
            timezone: 'Asia/Jakarta',
          },
          {
            id: 'branch-bsd',
            code: 'DD-BSD',
            name: 'Daily Dose BSD',
            timezone: 'Asia/Jakarta',
          },
        ],
        items: [],
      }),
    }),
  );
  await page.route('**/api/v1/public/class-catalog**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        branches: [
          {
            id: 'branch-jkt',
            code: 'DD-JKT',
            name: 'Daily Dose Jakarta',
            timezone: 'Asia/Jakarta',
          },
          {
            id: 'branch-bsd',
            code: 'DD-BSD',
            name: 'Daily Dose BSD',
            timezone: 'Asia/Jakarta',
          },
        ],
        items: [],
        range: {
          from: '2026-07-27T00:00:00.000Z',
          until: '2026-08-10T00:00:00.000Z',
        },
      }),
    }),
  );
});

for (const viewport of viewports) {
  test(`public surfaces fit ${viewport.width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const path of ['/', '/packages', '/classes', '/locations', '/contact']) {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
        bodyMargin: getComputedStyle(document.body).margin,
      }));
      expect(dimensions.content, path).toBeLessThanOrEqual(dimensions.viewport);
      expect(dimensions.bodyMargin, path).toBe('0px');
    }
  });
}

test('mobile navigation uses a modal drawer instead of a horizontal menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Buka menu navigasi' });
  await trigger.click();
  const drawer = page.getByRole('dialog', { name: 'Menu navigasi' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Paket', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});
