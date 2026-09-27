import { test, expect } from '@playwright/test';
import { prisma } from './db-helper';
import { loginAsCustomer, CUSTOMER_CREDENTIALS } from './auth-helper';

test.describe('Real E2E: Customer Profile Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure Amanda's name in DB is 'Amanda Member'
    await prisma.user.update({
      where: { email: CUSTOMER_CREDENTIALS.email },
      data: { displayName: CUSTOMER_CREDENTIALS.displayName },
    });

    // Login as Amanda
    await loginAsCustomer(page);
  });

  test.afterAll(async () => {
    // Ensure final state is restored
    await prisma.user.update({
      where: { email: CUSTOMER_CREDENTIALS.email },
      data: { displayName: CUSTOMER_CREDENTIALS.displayName },
    });
    await prisma.$disconnect();
  });

  test('1. Memuat Data Profil Nyata dari Database MySQL ke UI', async ({ page }) => {
    await page.goto('/account/profile');
    await expect(page).toHaveURL(/\/account\/profile/);

    // Verifikasi Header Halaman
    await expect(page.getByRole('heading', { name: 'Profil Saya' })).toBeVisible();

    // Verifikasi Data Pengguna Aktual dari MySQL
    const userInDb = await prisma.user.findFirstOrThrow({
      where: { email: CUSTOMER_CREDENTIALS.email },
    });

    await expect(page.getByText(userInDb.displayName, { exact: true }).first()).toBeVisible();

    // Verifikasi Input Form terisi dengan data yang benar
    const nameInput = page.locator('input#displayName');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue(userInDb.displayName);
  });

  test('2. Mengubah Nama Tampilan & Memvalidasi Penyimpanan Langsung di Database MySQL', async ({ page }) => {
    await page.goto('/account/profile');

    const nameInput = page.locator('input#displayName');
    await expect(nameInput).toBeVisible();

    // 1. Ubah nama menjadi 'Amanda Member QA'
    const updatedName = 'Amanda Member QA';
    await nameInput.fill(updatedName);

    // Klik tombol submit & tunggu respon API PATCH /api/v1/me/profile
    const submitBtn = page.getByRole('button', { name: 'Simpan perubahan' });
    const firstSavePromise = page.waitForResponse(
      (res) => res.url().includes('/me/profile') && res.request().method() === 'PATCH',
    );
    await submitBtn.click();
    const firstRes = await firstSavePromise;
    if (!firstRes.ok()) {
      console.log('firstRes failed with status:', firstRes.status(), await firstRes.text());
    }
    expect(firstRes.ok()).toBe(true);

    // Verifikasi toast notifikasi sukses
    await expect(page.getByText('Profil diperbarui')).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText('Nama tampilan terbaru sudah berhasil disimpan.'),
    ).toBeVisible();

    // 2. Audit Database MySQL Nyata (Tanpa Mock): pastikan kolom displayName berubah di DB
    const userAfterSave = await prisma.user.findFirstOrThrow({
      where: { email: CUSTOMER_CREDENTIALS.email },
    });
    expect(userAfterSave.displayName).toBe(updatedName);

    // 3. Kembalikan nama ke 'Amanda Member' via form UI untuk memvalidasi alur kedua
    await nameInput.fill(CUSTOMER_CREDENTIALS.displayName);
    const secondSavePromise = page.waitForResponse(
      (res) => res.url().includes('/me/profile') && res.request().method() === 'PATCH',
    );
    await submitBtn.click();
    const secondRes = await secondSavePromise;
    expect(secondRes.ok()).toBe(true);

    const userReverted = await prisma.user.findFirstOrThrow({
      where: { email: CUSTOMER_CREDENTIALS.email },
    });
    expect(userReverted.displayName).toBe(CUSTOMER_CREDENTIALS.displayName);
  });
});
