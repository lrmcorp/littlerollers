import { expect, test } from '@playwright/test';

const routes = [
  {
    path: '/packages/6f6dca0c-74fe-4c6f-8982-33db678a0b7a',
    heading: 'Movers 10',
    parent: 'Paket',
  },
  {
    path: '/schedule/4669d2c4-cc55-40ff-8759-10bd8369371c',
    heading: 'Movers',
    parent: 'Jadwal',
  },
  {
    path: '/classes/movers',
    heading: 'Movers',
    parent: 'Kelas',
  },
  {
    path: '/locations/jakarta',
    heading: 'Little Rollers Jakarta',
    parent: 'Studio',
  },
] as const;

for (const width of [390, 1280]) {
  test.describe(`public detail ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 720 } });
    for (const item of routes) {
      test(`${item.parent} has canonical detail layout without overflow`, async ({ page }) => {
        await page.goto(item.path);
        await expect(page).toHaveTitle(new RegExp(item.heading));
        await expect(page.getByRole('heading', { level: 1, name: item.heading })).toBeVisible();
        await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText(
          item.parent,
        );
        await expect(page.locator('[data-admin-shell]')).toHaveCount(0);
        await expect(page.locator('header').first()).toBeVisible();
        await expect(page.locator('h1:visible')).toHaveCount(1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
      });
    }
  });
}
