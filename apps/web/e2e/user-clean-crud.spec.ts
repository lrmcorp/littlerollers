import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:32120';

test.describe('Clean Studio CRUD User Management', () => {
  const testEmail = `test.staff.${Date.now()}@dailydose.test`;
  const initialPassword = 'InitialStaffPassword123!';
  const newPassword = 'UpdatedStaffPassword456!';
  const displayName = `Staf Operasional ${Date.now()}`;
  const phone = `0812${Math.floor(10000000 + Math.random() * 90000000)}`;

  test('Complete Clean CRUD Flow: Direct Create -> Direct Reset -> Login -> Toggle Status', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // 1. Sign in as Super Owner
    await adminPage.goto(`${BASE_URL}/sign-in`);
    await adminPage.getByLabel('Email', { exact: true }).fill('ralamzah@gmail.com');
    await adminPage.getByLabel('Password').fill('ridho123');
    await adminPage.getByRole('button', { name: 'Masuk dengan email' }).click();
    await adminPage.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 15000 });

    // 2. Navigate to /users
    await adminPage.goto(`${BASE_URL}/users`);
    await adminPage.waitForLoadState('networkidle');
    await expect(adminPage.locator('h1, h2').filter({ hasText: /Pengguna/i }).first()).toBeVisible({ timeout: 10000 });

    // 3. Open Create User Drawer
    const createBtn = adminPage.getByRole('button', { name: 'Buat pengguna internal' });
    await expect(createBtn).toBeVisible({ timeout: 10000 });
    await createBtn.click();

    // 4. Fill form with direct password & phone
    await expect(adminPage.getByLabel('Nama Lengkap')).toBeVisible({ timeout: 5000 });
    await adminPage.getByLabel('Nama Lengkap').fill(displayName);
    await adminPage.getByLabel('Alamat Email').fill(testEmail);
    await adminPage.getByLabel('Nomor WhatsApp / HP (Opsional)').fill(phone);

    // Initial password
    const pwdInput = adminPage.locator('#user-password-input');
    await expect(pwdInput).toBeVisible();
    await pwdInput.fill(initialPassword);

    // Select role: Finance (Global role)
    await adminPage.getByRole('checkbox', { name: 'Finance' }).check();

    // Submit user creation
    const submitBtn = adminPage.getByRole('button', { name: 'Simpan Pengguna & Aktifkan' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 5. Verify user created via notification toast & search filter
    await expect(adminPage.locator('text=Pengguna staf berhasil dibuat')).toBeVisible({ timeout: 15000 });

    const searchInput = adminPage.getByRole('searchbox', { name: 'Cari nama' });
    await searchInput.fill(displayName);
    await adminPage.getByRole('button', { name: 'Terapkan' }).click();
    await expect(adminPage.locator(`text=${displayName}`).first()).toBeVisible({ timeout: 15000 });

    // 6. Test direct staff login with initial password in a separate browser context
    const staffContext = await browser.newContext();
    const staffPage = await staffContext.newPage();

    await staffPage.goto(`${BASE_URL}/sign-in`);
    await staffPage.getByLabel('Email', { exact: true }).fill(testEmail);
    await staffPage.getByLabel('Password').fill(initialPassword);
    await staffPage.getByRole('button', { name: 'Masuk dengan email' }).click();

    // Verify staff login succeeds (redirects to workspace)
    await expect(staffPage).toHaveURL(/.*\/workspace.*/, { timeout: 15000 });
    await staffContext.close();

    // 7. View User Detail Page from Admin page
    await adminPage.locator(`a:has-text("${displayName}")`).first().click();
    await expect(adminPage).toHaveURL(/.*\/users\/.*/, { timeout: 10000 });
    await expect(adminPage.locator(`text=${displayName}`).first()).toBeVisible();

    // 8. Direct Password Reset by Admin
    const resetPwdBtn = adminPage.getByRole('button', { name: /Reset kata sandi/i });
    await expect(resetPwdBtn).toBeVisible({ timeout: 10000 });
    await resetPwdBtn.click();

    // Verify modal title
    await expect(adminPage.locator('text=Ubah Kata Sandi Staf Langsung')).toBeVisible();

    // Fill new password
    await adminPage.locator('#new-password').fill(newPassword);
    await adminPage.locator('#confirm-password').fill(newPassword);

    // Submit reset
    await adminPage.getByRole('button', { name: 'Simpan Kata Sandi Baru' }).click();
    await expect(adminPage.locator('text=/Kata sandi .* berhasil diperbarui/i')).toBeVisible({ timeout: 10000 });

    // 9. Verify staff can log in with new password
    const staffContext2 = await browser.newContext();
    const staffPage2 = await staffContext2.newPage();

    await staffPage2.goto(`${BASE_URL}/sign-in`);
    await staffPage2.getByLabel('Email', { exact: true }).fill(testEmail);
    await staffPage2.getByLabel('Password').fill(newPassword);
    await staffPage2.getByRole('button', { name: 'Masuk dengan email' }).click();

    await expect(staffPage2).toHaveURL(/.*\/workspace.*/, { timeout: 15000 });
    await staffContext2.close();

    // 10. Test Deactivate & Reactivate 1-click confirmation
    const deactivateBtn = adminPage.getByRole('button', { name: 'Nonaktifkan' });
    if (await deactivateBtn.isVisible()) {
      await deactivateBtn.click();
      await expect(adminPage.getByRole('button', { name: /Konfirmasi Nonaktif/i })).toBeVisible();
      await adminPage.getByRole('button', { name: /Konfirmasi Nonaktif/i }).click();
      await expect(adminPage.locator('text=dinonaktifkan')).toBeVisible({ timeout: 10000 });

      // Reactivate
      const reactivateBtn = adminPage.getByRole('button', { name: /Aktifkan kembali/i });
      await expect(reactivateBtn).toBeVisible({ timeout: 10000 });
      await reactivateBtn.click();
      await expect(adminPage.getByRole('button', { name: /Konfirmasi Aktif/i })).toBeVisible();
      await adminPage.getByRole('button', { name: /Konfirmasi Aktif/i }).click();
      await expect(adminPage.locator('text=berhasil diaktifkan')).toBeVisible({ timeout: 10000 });
    }

    await adminContext.close();
  });
});
