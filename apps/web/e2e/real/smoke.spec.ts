import { test, expect } from '@playwright/test';

test.describe('Real E2E Smoke Test', () => {
  test('Verify landing page and login with real customer credentials', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('/');
    await expect(page).toHaveTitle(/Daily Dose/i);

    // 2. Visit sign-in page
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: /masuk/i })).toBeVisible();

    // 3. Fill real credentials
    await page.getByLabel('Email', { exact: true }).fill('amanda.member@dailydose.test');
    await page.getByLabel('Password').fill('Customer123!');
    await page.getByRole('button', { name: /masuk/i }).click();

    // 4. Verify redirected to account or target page
    await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15_000 });
    expect(page.url()).not.toContain('/sign-in');
  });
});
