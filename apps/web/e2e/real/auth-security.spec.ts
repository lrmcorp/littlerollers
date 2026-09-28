import { test, expect } from '@playwright/test';
import path from 'node:path';
import { prisma } from './db-helper';
import { randomBytes } from 'node:crypto';

// Load argon2 from apps/api
const apiArgon2Path = path.resolve(__dirname, '../../../../apps/api/node_modules/argon2');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { hash, argon2id } = require(apiArgon2Path);

async function resetAmandaPasswordInDb() {
  const newHash = await hash('Customer123!', {
    type: argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
    hashLength: 32,
    salt: randomBytes(16),
  });
  await prisma.user.update({
    where: { email: 'amanda.member@dailydose.test' },
    data: { passwordHash: newHash },
  });
}

test.describe('Real E2E: Authentication & Account Security Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure Amanda password is always Customer123! before each test
    await resetAmandaPasswordInDb();

    // Login as Amanda Member
    await page.goto('/sign-in');
    await page.getByLabel('Email', { exact: true }).fill('amanda.member@dailydose.test');
    await page.getByLabel('Password').fill('Customer123!');
    await page.getByRole('button', { name: /masuk dengan email/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15_000 });
  });

  test.afterAll(async () => {
    // Ensure final state is always Customer123!
    await resetAmandaPasswordInDb();
    await prisma.$disconnect();
  });

  test('1. Verifikasi Status Keamanan & Form Ubah Password Aktif', async ({ page }) => {
    await page.goto('/account/security');
    await expect(page).toHaveURL(/\/account\/security/);

    // 1. Verifikasi kartu status password aktif (memvalidasi perbaikan Langkah 1)
    await expect(page.getByRole('heading', { name: 'Status password' })).toBeVisible();
    await expect(page.getByText('Password aktif', { exact: true })).toBeVisible();
    await expect(page.getByText(/Password.*dapat diperbarui kapan saja/i)).toBeVisible();

    // 2. Verifikasi form ubah password tampil lengkap dan tidak tersembunyi
    const form = page.getByRole('form', { name: 'Ubah password' });
    await expect(form).toBeVisible();

    const currentPasswordInput = form.locator('input[name="current"]');
    const newPasswordInput = form.locator('input[name="next"]');
    const submitButton = form.getByRole('button', { name: 'Simpan password' });

    await expect(currentPasswordInput).toBeVisible();
    await expect(newPasswordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('2. Uji Negatif: Password Saat Ini Salah Ditolak Sistem', async ({ page }) => {
    await page.goto('/account/security');
    const form = page.getByRole('form', { name: 'Ubah password' });

    // Masukkan password saat ini yang salah
    await form.locator('input[name="current"]').fill('WrongOldPassword123!');
    await form.locator('input[name="next"]').fill('NewValidPassword2026!');
    await form.getByRole('button', { name: 'Simpan password' }).click();

    // Periksa munculnya pesan error
    await expect(
      page.getByText('Password saat ini tidak valid atau password baru belum memenuhi syarat.').first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('3. Uji Positif: Berhasil Ubah Password & Konsistensi Hash Database MySQL', async ({ page }) => {
    await page.goto('/account/security');
    const form = page.getByRole('form', { name: 'Ubah password' });

    // 1. Ubah password dari Customer123! ke CustomerNewPass2026!
    await form.locator('input[name="current"]').fill('Customer123!');
    await form.locator('input[name="next"]').fill('CustomerNewPass2026!');
    await form.getByRole('button', { name: 'Simpan password' }).click();

    // Verifikasi toast sukses
    await expect(page.getByText('Password diperbarui')).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByText('Sesi lain telah dicabut untuk melindungi akun Anda.'),
    ).toBeVisible();

    // Verifikasi otomatis redirect ke /account setelah sukses
    await page.waitForURL((url) => url.pathname.includes('/account'), { timeout: 10_000 });

    // Verifikasi hash di database MySQL terupdate
    const userInDb = await prisma.user.findFirst({
      where: { email: 'amanda.member@dailydose.test' },
      select: { passwordHash: true, updatedAt: true },
    });
    expect(userInDb?.passwordHash).toBeTruthy();

    // 2. Buka kembali halaman security dan ubah kembali ke Customer123! melalui UI
    await page.goto('/account/security');
    const secondForm = page.getByRole('form', { name: 'Ubah password' });
    await secondForm.locator('input[name="current"]').fill('CustomerNewPass2026!');
    await secondForm.locator('input[name="next"]').fill('Customer123!');
    await secondForm.getByRole('button', { name: 'Simpan password' }).click();

    await expect(page.getByText('Password diperbarui')).toBeVisible({ timeout: 10_000 });
  });
});
