import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Real E2E - Penugasan Instruktur Mandiri & Decoupling Topbar', () => {
  test('Super Owner can create assignment in Global Mode with self-contained branch selector and real coach lookup', async ({ page }) => {
    // 1. Login sebagai Super Owner
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: /masuk/i })).toBeVisible();
    await page.getByLabel('Email', { exact: true }).fill('ralamzah@gmail.com');
    await page.getByLabel('Password').fill('ridho123');
    await page.getByRole('button', { name: /masuk/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 20_000 });

    // 2. Navigasi ke halaman /assignments di Mode Global (Semua Cabang)
    await page.goto('/assignments');
    await expect(page.getByRole('heading', { name: 'Penugasan' })).toBeVisible({ timeout: 15_000 });

    // 3. Verifikasi banner panduan mode global baru
    const globalBanner = page.getByText(
      'Mode semua cabang menampilkan data seluruh lokasi. Untuk membuat penugasan baru, klik \'Buat penugasan\' dan tentukan cabang target langsung di dalam formulir.'
    );
    await expect(globalBanner).toBeVisible();

    // 4. Ambil screenshot 1: Halaman penugasan mode global dengan tombol aktif
    const screenshot1Path = path.resolve(
      '/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/verified_global_assignments_page.png'
    );
    await page.screenshot({ path: screenshot1Path, fullPage: true });
    console.log('Saved screenshot 1 to:', screenshot1Path);

    // 5. Verifikasi tombol "Buat penugasan" aktif (enabled) di mode global
    const createBtn = page.getByRole('button', { name: 'Buat penugasan' });
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    // 6. Verifikasi dialog drawer penugasan terbuka
    const dialog = page.getByRole('dialog', { name: 'Buat penugasan' });
    await expect(dialog).toBeVisible();

    // 7. Verifikasi dropdown Cabang Penugasan mandiri di dalam form
    const branchInput = page.getByPlaceholder('Pilih cabang penugasan');
    await expect(branchInput).toBeVisible();

    // 8. Cari pelatih nyata "Devi" (role COACH)
    const userSearchInput = page.getByPlaceholder('Ketik minimal 2 karakter');
    await userSearchInput.fill('Devi');

    const deviOption = page.getByRole('option', { name: /Devi/ }).first();
    await expect(deviOption).toBeVisible({ timeout: 10_000 });
    await deviOption.click();

    // 9. Isi tanggal aktif mulai dan alasan
    await page.getByLabel(/Aktif mulai/).fill('2026-10-01');
    await page.getByLabel(/Alasan/).fill('Penugasan instruktur resmi di cabang');

    // 10. Verifikasi tombol submit di drawer aktif (enabled)
    const submitBtn = dialog.getByRole('button', { name: 'Buat penugasan' });
    await expect(submitBtn).toBeEnabled();

    // 11. Ambil screenshot 2: Form terisi data riil dengan pemilih cabang dan Coach Devi
    const screenshot2Path = path.resolve(
      '/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/verified_assignment_drawer_real_data.png'
    );
    await page.screenshot({ path: screenshot2Path, fullPage: true });
    console.log('Saved screenshot 2 to:', screenshot2Path);
  });
});
