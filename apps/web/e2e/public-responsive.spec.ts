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
  await page.route('**/api/v1/public/package-catalog**', (route) => {
    const branchId = new URL(route.request().url()).searchParams.get('branchId');
    return route.fulfill({
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
        items: branchId
          ? [
              {
                id: 'package-reformer-10',
                branchId,
                name: 'Reformer Pilates 10',
                sessionCount: 10,
                durationDays: 90,
                priceRp: 1_600_000,
                effectiveUntil: null,
                classType: {
                  id: 'type-reformer',
                  code: 'REFORMER',
                  name: 'Reformer Pilates',
                },
              },
              {
                id: 'package-reformer-5',
                branchId,
                name: 'Reformer Pilates 5',
                sessionCount: 5,
                durationDays: 45,
                priceRp: 850_000,
                effectiveUntil: null,
                classType: {
                  id: 'type-reformer',
                  code: 'REFORMER',
                  name: 'Reformer Pilates',
                },
              },
              {
                id: 'package-mat-8',
                branchId,
                name: 'Mat Pilates 8',
                sessionCount: 8,
                durationDays: 60,
                priceRp: 720_000,
                effectiveUntil: null,
                classType: { id: 'type-mat', code: 'MAT', name: 'Mat Pilates' },
              },
              {
                id: 'package-barre-8',
                branchId,
                name: 'Barre 8',
                sessionCount: 8,
                durationDays: 60,
                priceRp: 760_000,
                effectiveUntil: null,
                classType: { id: 'type-barre', code: 'BARRE', name: 'Barre' },
              },
            ]
          : [],
      }),
    });
  });
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

for (const viewport of [
  { name: 'mobile', width: 390, height: 844, maximumCardTop: 900 },
  { name: 'desktop', width: 1280, height: 720, maximumCardTop: 720 },
]) {
  test(`package catalog reaches products quickly on ${viewport.name}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/packages?branch=branch-jkt&slot=slot-1');
    const recommended = page.getByRole('heading', { name: 'Reformer Pilates 10' });
    await expect(recommended).toBeVisible();
    const firstCard = page.locator('main article').first();
    const top = await firstCard.evaluate((element) => element.getBoundingClientRect().top);
    expect(top).toBeLessThanOrEqual(viewport.maximumCardTop);
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    await page.screenshot({
      path: testInfo.outputPath(`packages-${viewport.name}.png`),
      fullPage: true,
    });

    await page.getByLabel('Tipe kelas').selectOption('type-mat');
    await expect(page).toHaveURL(/branch=branch-jkt/);
    await expect(page).toHaveURL(/classType=type-mat/);
    await expect(page).toHaveURL(/slot=slot-1/);
    await expect(page.getByRole('heading', { name: 'Mat Pilates 8' })).toBeVisible();
  });
}
