import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:32120';

test.describe('End-to-End Multi-Role Workflow Testing', () => {

  test('Role: Guest - Public catalog discovery and package view', async ({ page }) => {
    // 1. Visit landing page
    await page.goto(`${BASE_URL}/`);
    await expect(page).toHaveTitle(/Daily Dose/i);

    // 2. Visit public packages
    await page.goto(`${BASE_URL}/packages`);
    await page.waitForLoadState('networkidle');

    // Click studio Muara Karang
    const studioButton = page.locator('button:has-text("Muara Karang")').first();
    await expect(studioButton).toBeVisible({ timeout: 10000 });
    await studioButton.click();

    // Verify packages are rendered
    const packageCards = page.locator('article');
    await expect(packageCards.first()).toBeVisible({ timeout: 10000 });
    const count = await packageCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify CTA directs to sign-in or checkout
    const ctaButton = page.locator('article a:has-text("Pilih"), article a:has-text("Masuk")').first();
    await expect(ctaButton).toBeVisible();
  });

  test('Role: Customer - Booking confirmation flow and package resolution', async ({ page }) => {
    // Login as approved customer
    await page.goto(`${BASE_URL}/sign-in?returnTo=%2Fbookings%2Fnew%3Fslot%3Dfb0685b0-5ef0-4aa9-8b87-edebf0e92030`);
    await page.getByLabel('Email', { exact: true }).fill('uat.member01@example.com');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Masuk dengan email' }).click();

    // Wait for redirect to booking page
    await expect(page).toHaveURL(/.*\/bookings\/new.*/, { timeout: 20000 });

    // Verify page loads cleanly with NO error banner
    await expect(page.locator('text=Booking belum dapat diproses')).not.toBeVisible();
    await expect(page.locator('text=Jadwal kelas tidak dapat dibuka')).not.toBeVisible();

    // Verify selected class details are rendered
    await expect(page.locator('h2:has-text("Private Group")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Muara Karang').first()).toBeVisible();

    // Verify active package option is displayed
    await expect(page.locator('strong:has-text("20 Sessions Private Group")')).toBeVisible();
    await expect(page.locator('text=24 sesi tersedia')).toBeVisible();

    // Verify submit button is active
    const submitBtn = page.locator('button[type="submit"]:has-text("Lanjutkan ke review booking")');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('Role: Super Owner - Workspace dashboard & Identity Verifications console', async ({ page }) => {
    // Login as Super Owner
    await page.goto(`${BASE_URL}/sign-in?returnTo=%2Fworkspace`);
    await page.getByLabel('Email', { exact: true }).fill('ralamzah@gmail.com');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Masuk dengan email' }).click();

    // Wait for redirect to workspace
    await expect(page).toHaveURL(/.*\/workspace.*/, { timeout: 20000 });
    await expect(page.locator('text=Portfolio Cabang').or(page.locator('text=Ringkasan Eksekutif'))).toBeVisible({ timeout: 15000 });

    // Verify Identity Verifications console
    await page.goto(`${BASE_URL}/identity-verifications?status=PENDING`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Verifikasi ID').first()).toBeVisible({ timeout: 15000 });
  });

});
