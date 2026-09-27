import { test, expect } from '@playwright/test';
import { prisma } from './db-helper';
import { loginAsCustomer, CUSTOMER_CREDENTIALS } from './auth-helper';

const JAKARTA_SLOT_ID = 'f1000000-ddgg00-4000-8000-0000060101';

test.describe('Real E2E: Strict JavaScript & Console Error Audit Across Pages', () => {
  let pageErrors: Error[] = [];
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    pageErrors = [];
    consoleErrors = [];

    // Dengarkan setiap JavaScript uncaught exception / runtime error di browser
    page.on('pageerror', (exception) => {
      // Abaikan error koneksi jaringan yang disengaja/eksternal jika ada, tapi rekam semua JS runtime errors
      pageErrors.push(exception);
    });

    // Dengarkan setiap console.error yang dipancarkan oleh React / Next.js / skrip halaman
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Saring pesan favicon 404 jika ada, fokus pada bug JavaScript aplikasi
        if (!text.includes('favicon.ico') && !text.includes('Failed to load resource')) {
          consoleErrors.push(text);
        }
      }
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('1. Audit Bebas Error JS pada Halaman Publik (Landing, Login, Katalog, Detail Paket)', async ({
    page,
  }) => {
    // 1. Landing Page (/)
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    expect(pageErrors, `Uncaught JS error on /: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);

    // 2. Sign-In Page (/sign-in)
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');
    expect(pageErrors, `Uncaught JS error on /sign-in: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);

    // 3. Public Packages Catalog (/packages)
    await page.goto('/packages');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('button', { name: /Green Garden/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /Green Garden/i }).first().click();
    expect(pageErrors, `Uncaught JS error on /packages: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);

    // 4. Package Detail (/packages/[id])
    const samplePackage = await prisma.paket.findFirstOrThrow({ where: { status: 'ACTIVE' } });
    await page.goto(`/packages/${samplePackage.id}`);
    await page.waitForLoadState('domcontentloaded');
    expect(pageErrors, `Uncaught JS error on /packages/${samplePackage.id}: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);

    // 5. Classes Schedule (/classes)
    await page.goto('/classes');
    await page.waitForLoadState('domcontentloaded');
    expect(pageErrors, `Uncaught JS error on /classes: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);

    // Verifikasi tidak ada fatal console errors pada halaman publik
    expect(consoleErrors).toHaveLength(0);
  });

  test('2. Audit Bebas Error JS pada Halaman Terotentikasi Customer (Dashboard, Profil, Security, Booking, Orders)', async ({
    page,
  }) => {
    // Login
    await loginAsCustomer(page);

    // 1. Customer Dashboard (/account)
    await page.goto('/account');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('Amanda Member').first()).toBeVisible();
    expect(pageErrors, `Uncaught JS error on /account: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);

    // 2. Customer Profile (/account/profile)
    await page.goto('/account/profile');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input#displayName')).toBeVisible();
    expect(pageErrors, `Uncaught JS error on /account/profile: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);

    // 3. Customer Security (/account/security)
    await page.goto('/account/security');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'Status password' })).toBeVisible();
    expect(pageErrors, `Uncaught JS error on /account/security: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);

    // 4. Customer Bookings List (/bookings)
    await page.goto('/bookings');
    await page.waitForLoadState('domcontentloaded');
    expect(pageErrors, `Uncaught JS error on /bookings: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);

    // 5. Booking Flow (/bookings/new?slot=...)
    // Pastikan slot di masa depan
    await prisma.slotKelas.update({
      where: { id: JAKARTA_SLOT_ID },
      data: {
        status: 'PUBLISHED',
        startAt: new Date(Date.now() + 48 * 3600000),
        endAt: new Date(Date.now() + 49 * 3600000),
      },
    });
    await page.goto(`/bookings/new?slot=${JAKARTA_SLOT_ID}`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: 'Konfirmasi reservasi kelas' })).toBeVisible();
    expect(pageErrors, `Uncaught JS error on /bookings/new: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);

    // 6. Orders Page (/orders)
    await page.goto('/orders');
    await page.waitForLoadState('domcontentloaded');
    expect(pageErrors, `Uncaught JS error on /orders: ${pageErrors.map((e) => e.message).join(', ')}`).toHaveLength(0);

    // Verifikasi tidak ada fatal console errors pada seluruh alur customer
    expect(consoleErrors).toHaveLength(0);
  });
});
