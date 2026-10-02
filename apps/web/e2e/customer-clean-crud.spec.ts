import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:32120';

test.describe('Clean Studio CRUD Customer Management (Tahap 3 & 4)', () => {
  test('Complete Customer Clean CRUD: Direct Password Reset -> Demographic Edit -> Direct Document Upload', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // 1. Sign in as Super Owner
    await adminPage.goto(`${BASE_URL}/sign-in`);
    await adminPage.getByLabel('Email', { exact: true }).fill('ralamzah@gmail.com');
    await adminPage.getByLabel('Password').fill('ridho123');
    await adminPage.getByRole('button', { name: 'Masuk dengan email' }).click();
    await adminPage.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 15000 });

    // 2. Navigate to /customers
    await adminPage.goto(`${BASE_URL}/customers`);
    await adminPage.waitForLoadState('networkidle');
    await expect(adminPage.locator('h1, h2').filter({ hasText: /Pelanggan/i }).first()).toBeVisible({ timeout: 10000 });

    // 3. Click the first customer in the table
    const firstCustomerRow = adminPage.locator('table tbody tr').first();
    await expect(firstCustomerRow).toBeVisible({ timeout: 10000 });
    const detailLink = firstCustomerRow.getByRole('link', { name: 'Lihat detail' });
    await detailLink.click();

    // 4. Verify Customer Detail Page
    await adminPage.waitForURL(/.*\/customers\/.*/, { timeout: 10000 });
    await expect(adminPage.locator('h1').first()).toBeVisible({ timeout: 10000 });

    // 5. Test Tahap 3: Direct Password Reset Modal
    const resetPwdBtn = adminPage.getByRole('button', { name: /Reset kata sandi/i });
    await expect(resetPwdBtn).toBeVisible({ timeout: 10000 });
    await resetPwdBtn.click();

    // Verify modal open
    await expect(adminPage.locator('text=Reset Kata Sandi Pelanggan')).toBeVisible();

    // Test "Buat Sandi Acak"
    const randomBtn = adminPage.getByRole('button', { name: /Buat Sandi Acak/i });
    await expect(randomBtn).toBeVisible();
    await randomBtn.click();

    const pwdInput = adminPage.locator('#new-customer-password');
    const generatedPwd = await pwdInput.inputValue();
    expect(generatedPwd.length).toBeGreaterThanOrEqual(8);

    // Set custom password
    const testPassword = 'MemberDirectPassword123!';
    await pwdInput.fill(testPassword);

    // Save password
    await adminPage.getByRole('button', { name: 'Simpan Kata Sandi' }).click();
    await expect(adminPage.locator('text=/Kata sandi .* berhasil diperbarui/i')).toBeVisible({ timeout: 10000 });

    // 6. Test Tahap 3: Demographic & Profile Update without stepUpToken requirement
    const testNik = `3201${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const testAddress = `Jl. Studio Pilates Indah No. ${Math.floor(Math.random() * 100)}, Jakarta Selatan`;
    const testContactName = 'Budi Santoso (Kerabat)';
    const testContactPhone = '081298765432';

    // Open Edit Profile Drawer
    const editProfileBtn = adminPage.getByRole('button', { name: /Edit profil/i }).first();
    await expect(editProfileBtn).toBeVisible({ timeout: 10000 });
    await editProfileBtn.click();
    await expect(adminPage.locator('input[name="nik"]')).toBeVisible({ timeout: 5000 });

    await adminPage.locator('input[name="nik"]').fill(testNik);
    await adminPage.locator('select[name="genderCode"]').selectOption('FEMALE');
    await adminPage.locator('input[name="birthDate"]').fill('1995-08-17');
    await adminPage.locator('input[name="address"]').fill(testAddress);
    await adminPage.locator('input[name="emergencyContactName"]').fill(testContactName);
    await adminPage.locator('input[name="emergencyContactPhone"]').fill(testContactPhone);

    // Submit profile update
    const saveProfileBtn = adminPage.getByRole('button', { name: 'Simpan Perubahan Profil' });
    await expect(saveProfileBtn).toBeEnabled();
    await saveProfileBtn.click();

    await expect(adminPage.locator('text=/Profil pelanggan berhasil diperbarui/i')).toBeVisible({ timeout: 10000 });

    // Verify values remain after reload
    await adminPage.reload({ waitUntil: 'networkidle' });
    await expect(adminPage.locator(`text=${testNik}`)).toBeVisible({ timeout: 10000 });
    await expect(adminPage.locator(`text=${testContactName}`)).toBeVisible({ timeout: 10000 });
    await expect(adminPage.locator(`text=${testContactPhone}`)).toBeVisible({ timeout: 10000 });

    // Also verify inside drawer
    await adminPage.getByRole('button', { name: /Edit profil/i }).first().click();
    await expect(adminPage.locator('input[name="nik"]')).toHaveValue(testNik);
    await expect(adminPage.locator('input[name="address"]')).toHaveValue(testAddress);
    await expect(adminPage.locator('input[name="emergencyContactName"]')).toHaveValue(testContactName);
    await expect(adminPage.locator('input[name="emergencyContactPhone"]')).toHaveValue(testContactPhone);
    await adminPage.getByRole('button', { name: 'Batal' }).click();

    // 7. Test Tahap 4: Direct KTP / Selfie Upload by Admin
    // Create a 1x1 dummy transparent png base64 file to simulate file upload
    const dummyPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );

    // Upload KTP
    const ktpFileInput = adminPage.locator('#upload-ktp-front');
    await expect(ktpFileInput).toBeAttached();
    await ktpFileInput.setInputFiles({
      name: 'ktp-test.png',
      mimeType: 'image/png',
      buffer: dummyPngBuffer,
    });

    await expect(adminPage.locator('text=/Dokumen KTP berhasil diunggah/i')).toBeVisible({ timeout: 10000 });

    // Upload Selfie
    const selfieFileInput = adminPage.locator('#upload-selfie');
    await expect(selfieFileInput).toBeAttached();
    await selfieFileInput.setInputFiles({
      name: 'selfie-test.png',
      mimeType: 'image/png',
      buffer: dummyPngBuffer,
    });

    await expect(adminPage.locator('text=Dokumen Foto Selfie berhasil diunggah')).toBeVisible({ timeout: 10000 });

    await adminContext.close();
  });
});
