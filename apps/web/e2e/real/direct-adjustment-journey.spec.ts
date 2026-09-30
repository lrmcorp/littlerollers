import { test, expect } from '@playwright/test';
import path from 'node:path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6';

test.describe('Real E2E: Direct Session Adjustment (No Happy Path & Zero Bureaucracy)', () => {
  test('Manager Cabang can directly adjust customer sessions in 1-click without pending approval', async ({
    page,
  }) => {
    // 1. Sign in as Manager Gandaria (manager.gg@dailydose.test)
    await page.goto('/sign-in');
    await page.getByLabel('Email', { exact: true }).fill('manager.gg@dailydose.test');
    await page.getByLabel('Password').fill('ridho123');
    await page.getByRole('button', { name: /masuk dengan email/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 40_000 });

    // 2. Open Session Adjustments page
    await page.goto('/ledger/adjustments');
    await page.waitForLoadState('networkidle');

    // 3. Verify Manager Direct Authority banner is rendered
    const banner = page.locator('text=Sebagai Manager/Owner, Anda memiliki wewenang untuk langsung menyesuaikan saldo sesi');
    await expect(banner).toBeVisible({ timeout: 10_000 });

    // 4. Click button to open Drawer
    const openDrawerBtn = page.getByRole('button', { name: 'Buat permintaan penyesuaian' });
    await expect(openDrawerBtn).toBeVisible();
    await openDrawerBtn.click();

    // 5. Verify Drawer title is Direct Adjustment (Manager/Owner)
    const drawerTitle = page.locator('text=Penyesuaian sesi langsung (Manager/Owner)');
    await expect(drawerTitle).toBeVisible();

    // 6. Search for customer package
    const searchInput = page.getByLabel('Cari pelanggan atau paket aktif');
    await searchInput.fill('Maya');
    await page.waitForTimeout(1000);

    const option = page.getByRole('option').first();
    await expect(option).toBeVisible({ timeout: 5000 });
    await option.click();

    // 7. Fill quantity and reason
    const quantityInput = page.getByLabel('Perubahan sesi');
    await quantityInput.fill('1');

    const reasonSelect = page.getByLabel('Alasan');
    await reasonSelect.selectOption('PACKAGE_COMPENSATION');

    // 8. Verify the submit button reads 'Tinjau dan terapkan sekarang' (NOT 'buat permintaan')
    const submitDrawerBtn = page.getByRole('button', { name: 'Tinjau dan terapkan sekarang' });
    await expect(submitDrawerBtn).toBeVisible();
    await submitDrawerBtn.click();

    // 9. Confirm dialog should say 'Terapkan sekarang (Posting)'
    const confirmBtn = page.getByRole('button', { name: 'Terapkan sekarang (Posting)' });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 10. Verify instant success notification
    const successMsg = page.locator('text=Penyesuaian sesi (+1 sesi) berhasil diterapkan langsung ke saldo member.');
    await expect(successMsg).toBeVisible({ timeout: 10_000 });

    // Capture screenshot as proof
    const screenshotPath = path.join(ARTIFACT_DIR, 'manager_direct_adjust_success.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // 11. Rollback +1 by adjusting -1 so test data remains clean and pristine
    await openDrawerBtn.click();
    await expect(drawerTitle).toBeVisible();
    await searchInput.fill('Maya');
    await page.waitForTimeout(1000);
    const rollbackOption = page.getByRole('option').first();
    await expect(rollbackOption).toBeVisible({ timeout: 5000 });
    await rollbackOption.click();

    await quantityInput.fill('-1');
    await reasonSelect.selectOption('ATTENDANCE_CORRECTION');
    await submitDrawerBtn.click();
    await confirmBtn.click();
    await expect(
      page.locator('text=Penyesuaian sesi (-1 sesi) berhasil diterapkan langsung ke saldo member.'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Admin Kasir CANNOT perform direct adjustment and must go through review', async ({ page }) => {
    // 1. Sign in as Admin Kasir
    await page.goto('/sign-in');
    await page.getByLabel('Email', { exact: true }).fill('adminmk@ddose.com');
    await page.getByLabel('Password').fill('ridho123');
    await page.getByRole('button', { name: /masuk dengan email/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15_000 });

    // 2. Open Session Adjustments page
    await page.goto('/ledger/adjustments');
    await page.waitForLoadState('networkidle');

    // 3. Verify Admin Kasir does NOT see direct authority banner
    const directBanner = page.locator('text=Sebagai Manager/Owner, Anda memiliki wewenang untuk langsung menyesuaikan');
    await expect(directBanner).not.toBeVisible();

    // 4. Open Drawer
    const openDrawerBtn = page.getByRole('button', { name: 'Buat permintaan penyesuaian' });
    await openDrawerBtn.click();

    // 5. Verify Drawer title is 'Buat permintaan penyesuaian' (NOT direct)
    const drawerTitle = page.locator('h2:has-text("Buat permintaan penyesuaian")');
    await expect(drawerTitle).toBeVisible();

    // 6. Verify submit button says 'Tinjau dan buat permintaan' (NOT 'terapkan sekarang')
    const cashierSubmitBtn = page.getByRole('button', { name: 'Tinjau dan buat permintaan' });
    const directSubmitBtn = page.getByRole('button', { name: 'Tinjau dan terapkan sekarang' });
    await expect(cashierSubmitBtn).toBeVisible();
    await expect(directSubmitBtn).not.toBeVisible();
  });
});
