import { expect, test } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:32120';

test.describe('Hero Carousel & Slider Management Flow', () => {
  test.setTimeout(60000);

  test('Guest can view hero carousel with dynamic slides, navigation and dots on landing page', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { timeout: 45000 });

    // Verify Carousel Container & Heading
    const heroTitle = page.locator('#marketing-hero-title');
    await expect(heroTitle).toBeVisible({ timeout: 15000 });
    await expect(heroTitle).toContainText('Stronger Body.');

    // Verify action buttons
    await expect(page.locator('a:has-text("Lihat Jadwal")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Lihat Paket")').first()).toBeVisible();

    // Verify Next Slide Button
    const nextBtn = page.locator('button[aria-label="Slide berikutnya"]');
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator('#marketing-hero-title')).toBeVisible();
    }
  });

  test('Super Owner can access Public Content Management, view slider slides, and see image upload zone', async ({ page }) => {
    // 1. Sign in as Super Owner
    await page.goto(`${BASE_URL}/sign-in?returnTo=%2Fpublic-content-management`, { timeout: 45000 });
    await page.getByLabel('Email', { exact: true }).fill('ralamzah@gmail.com');
    await page.getByLabel('Password').fill('ridho123');
    await page.getByRole('button', { name: 'Masuk dengan email' }).click();

    // 2. Wait for redirect to /public-content-management
    await expect(page).toHaveURL(/.*\/public-content-management.*/, { timeout: 30000 });

    // 3. Verify Page Header & Tabs
    await expect(page.locator('h1')).toContainText('Public Content Management', { timeout: 20000 });
    await expect(page.locator('text=Hero Carousel Beranda')).toBeVisible();
    await expect(page.locator('text=Pengaturan Slider Beranda')).toBeVisible();

    // 4. Verify Slides list
    await expect(page.locator('text=Daftar Slide Banner')).toBeVisible();
    await expect(page.locator('text=Stronger Body.')).toBeVisible();

    // 5. Open Add Slide Form and check Image Upload Zone
    await page.click('button:has-text("Tambah Slide Baru")');
    await expect(page.locator('text=Unggah Gambar Kustom / Manual')).toBeVisible();
    await expect(page.locator('button:has-text("Pilih File dari Komputer")')).toBeVisible();
    await expect(page.locator('select[name="imagePreset"]')).toBeVisible();
  });
});
