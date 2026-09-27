import { test, expect } from '@playwright/test';
import { prisma } from './db-helper';
import { loginAsCustomer } from './auth-helper';

test.describe('Real E2E: Package Catalog & Details Flow', () => {
  test('1. Eksplorasi Katalog Paket Publik dengan Pemilihan Studio & Data Asli MySQL', async ({ page }) => {
    await page.goto('/packages');
    await expect(page).toHaveURL(/\/packages/);

    // Verifikasi heading
    await expect(page.getByRole('heading', { name: /Komitmen yang sesuai/i })).toBeVisible();

    // Verifikasi 5 tombol studio fisik ada di halaman
    const branchNames = ['Green Garden', 'Muara Karang', 'Surabaya', 'Orange Groves PIK 2', 'Untar'];
    for (const bName of branchNames) {
      await expect(page.getByRole('button', { name: new RegExp(bName, 'i') })).toBeVisible();
    }

    // Klik tombol studio Green Garden
    await page.getByRole('button', { name: /Green Garden/i }).click();

    // Verifikasi kartu paket nyata muncul setelah studio dipilih
    const packageCards = page.locator('article');
    await expect(packageCards.first()).toBeVisible({ timeout: 10_000 });
    const count = await packageCards.count();
    expect(count).toBeGreaterThan(0);

    // Ambil nama paket dari kartu pertama dan pastikan terdaftar di database MySQL
    const firstCardTitle = await packageCards.first().locator('h2, h3, strong').first().textContent();
    expect(firstCardTitle?.trim().length).toBeGreaterThan(0);

    const pkgInDb = await prisma.paket.findFirst({
      where: { name: firstCardTitle!.trim(), status: 'ACTIVE' },
    });
    expect(pkgInDb).toBeTruthy();

    // Verifikasi format mata uang Rupiah & jumlah sesi muncul di kartu paket
    await expect(page.getByText(/Rp\s?[\d.,]+/i).first()).toBeVisible();
    await expect(page.getByText(/sesi/i).first()).toBeVisible();
  });

  test('2. Halaman Rincian Paket (/packages/[id]) Memuat Informasi Lengkap', async ({ page }) => {
    // Ambil 1 paket aktif dari MySQL
    const samplePackage = await prisma.paket.findFirstOrThrow({
      where: { status: 'ACTIVE' },
      include: { branch: true, classType: true },
    });

    await page.goto(`/packages/${samplePackage.id}`);
    await expect(page).toHaveURL(new RegExp(`/packages/${samplePackage.id}`));

    // Verifikasi tidak ada error 404/500
    await expect(page.getByText(/404|tidak ditemukan/i)).toHaveCount(0);

    // Verifikasi nama paket
    await expect(page.getByRole('heading', { name: samplePackage.name })).toBeVisible();

    // Verifikasi jumlah sesi
    await expect(
      page.getByText(new RegExp(`${samplePackage.sessionCount}\\s+sesi`, 'i')).first(),
    ).toBeVisible();

    // Verifikasi tombol aksi / checkout
    const ctaButton = page.locator('a, button').filter({ hasText: /pilih|masuk|beli|checkout/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('3. Pengguna Terotentikasi Melihat Tombol "Pilih paket" yang Mengarah ke Checkout', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/packages');

    // Customer terotentikasi melihat tombol "Pilih paket"
    const chooseButton = page.getByRole('link', { name: 'Pilih paket' }).first();
    await expect(chooseButton).toBeVisible();

    const href = await chooseButton.getAttribute('href');
    expect(href).toMatch(/\/checkout|\/packages/);
  });
});
