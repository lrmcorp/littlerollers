import { expect, test } from '@playwright/test';

const routes = [
  {
    path: '/packages/6f6dca0c-74fe-4c6f-8982-33db678a0b7a',
    heading: 'Reformer Pilates 10',
    parent: 'Paket',
  },
  {
    path: '/schedule/4669d2c4-cc55-40ff-8759-10bd8369371c',
    heading: 'Reformer Pilates',
    parent: 'Jadwal',
  },
  {
    path: '/classes/reformer-pilates',
    heading: 'Reformer Pilates',
    parent: 'Kelas',
  },
  {
    path: '/locations/jakarta',
    heading: 'Daily Dose Jakarta',
    parent: 'Studio',
  },
] as const;

for (const width of [390, 1280]) {
  test.describe(`public detail ${width}px`, () => {
    test.use({ viewport: { width, height: width === 390 ? 844 : 720 } });
    for (const item of routes) {
      test(`${item.parent} has canonical detail layout without overflow`, async ({ page }) => {
        if (item.parent === 'Jadwal') {
          await page.route('**/api/v1/public/class-catalog/4669d2c4-cc55-40ff-8759-10bd8369371c',
            (route) => route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                id: '4669d2c4-cc55-40ff-8759-10bd8369371c',
                branchId: '00000000-0000-4000-8000-000000000001',
                startAt: '2027-01-10T02:00:00.000Z',
                endAt: '2027-01-10T02:50:00.000Z',
                timezone: 'Asia/Jakarta',
                status: 'PUBLISHED',
                capacity: 12,
                available: 8,
                branch: {
                  id: '00000000-0000-4000-8000-000000000001',
                  code: 'DD-JKT',
                  name: 'Daily Dose Jakarta',
                  timezone: 'Asia/Jakarta',
                  supportWhatsappE164: '+628111111111',
                  publicProfile: {
                    slug: 'jakarta',
                    area: 'Jakarta Selatan',
                    city: 'Jakarta',
                    address: 'Jakarta Selatan',
                    openingHours: [{ days: 'Senin–Minggu', hours: '07.00–21.00' }],
                    description: 'Studio Pilates yang tenang dan tertata.',
                    arrivalInformation: 'Datang 15 menit sebelum kelas.',
                    parkingInformation: 'Area parkir tersedia.',
                    amenities: ['Ruang ganti', 'Loker'],
                    heroImageKey: 'studios/studio-reception.png',
                    galleryImageKeys: [],
                  },
                },
                classType: {
                  id: '00000000-0000-4000-8000-000000000101',
                  code: 'REFORMER',
                  name: 'Reformer Pilates',
                },
                classProfile: {
                  code: 'REFORMER',
                  slug: 'reformer-pilates',
                  summary: 'Latihan seluruh tubuh menggunakan reformer.',
                  description: 'Kelas terarah untuk kekuatan, kontrol, dan mobilitas.',
                  level: 'Semua level',
                  durationMinutes: 50,
                  equipment: ['Reformer'],
                  benefits: ['Kekuatan inti', 'Postur'],
                  heroImageKey: 'classes/reformer-pilates.png',
                },
              }),
            }),
          );
        }
        await page.goto(item.path);
        await expect(page.getByRole('heading', { level: 1, name: item.heading })).toBeVisible();
        await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText(
          item.parent,
        );
        await expect(page.locator('[data-admin-shell]')).toHaveCount(0);
        await expect(page.locator('header').first()).toBeVisible();
        expect(await page.locator('h1').count()).toBe(1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
      });
    }
  });
}
