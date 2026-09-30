import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Real E2E - Antrean Pembayaran & Normalisasi Pencarian Pelanggan', () => {
  test('Super Owner can view All Payments status, use decoupled branch filter, and search customer by 08... phone format', async ({ page }) => {
    test.setTimeout(90_000);

    // 1. Login sebagai Super Owner langsung mengarah ke /workspace/payments
    await page.goto('/sign-in?returnTo=/workspace/payments');
    await expect(page.getByRole('heading', { name: /masuk/i })).toBeVisible();
    await page.getByLabel('Email', { exact: true }).fill('ralamzah@gmail.com');
    await page.getByLabel('Password').fill('ridho123');
    await page.getByRole('button', { name: /masuk dengan email/i }).click();

    // 2. Tunggu hingga sampai di Antrean Pembayaran (/workspace/payments)
    await page.waitForURL((url) => url.pathname.includes('/workspace/payments'), { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Antrean Pembayaran' })).toBeVisible({ timeout: 30_000 });

    // 3. Verifikasi summary cards memuat kartu "Semua status"
    const allStatusCard = page.getByRole('button', { name: /Semua status/i });
    await expect(allStatusCard).toBeVisible({ timeout: 15_000 });

    const pendingCard = page.getByRole('button', { name: /Menunggu/i }).first();
    await expect(pendingCard).toBeVisible();

    // 4. Verifikasi dropdown Cabang mandiri di dalam FilterBar
    const branchFilter = page.getByLabel('Cabang', { exact: true });
    await expect(branchFilter).toBeVisible();
    await expect(branchFilter.getByRole('option', { name: 'Semua Cabang' })).toBeAttached();

    // 5. Klik kartu "Semua status" untuk menampilkan seluruh riwayat transaksi
    await allStatusCard.click();
    await expect(page).toHaveURL(/status=ALL/);

    // Pastikan tabel transaksi terisi baris data
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 15_000 });

    // 6. Screenshot 1: Halaman Antrean Pembayaran dengan kartu Semua Status & filter cabang mandiri
    const screenshotPaymentsPath = path.resolve(
      '/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/verified_payments_all_status.png'
    );
    await page.screenshot({ path: screenshotPaymentsPath, fullPage: true });
    console.log('Saved screenshot 1 to:', screenshotPaymentsPath);

    // 7. Uji pencarian transaksi dengan nomor HP lokal (08...)
    const paymentSearchInput = page.getByLabel('Cari pelanggan atau transaksi');
    await paymentSearchInput.fill('08023000927');
    await page.waitForTimeout(600); // debounce input

    // Verifikasi bahwa transaksi ditemukan
    await expect(page.getByRole('table').getByText('Ester Budi')).toBeVisible({ timeout: 10_000 });

    // 8. Navigasi ke Manajemen Pelanggan (/customers)
    await page.goto('/customers');
    await expect(page.getByRole('heading', { name: 'Data Pelanggan' })).toBeVisible({ timeout: 20_000 });

    // 9. Cari pelanggan menggunakan format nomor lokal Indonesia: 0812-9464-9383 atau 081294649383
    const customerSearchInput = page.getByPlaceholder('Nama, email, telepon, barcode, ID');
    await expect(customerSearchInput).toBeVisible();
    await customerSearchInput.fill('0812-9464-9383');
    await page.waitForTimeout(600); // debounce

    // Verifikasi pelanggan "Erlini GG" berhasil ditemukan meski di database tersimpan +6281294649383
    await expect(page.getByText('Erlini GG').first()).toBeVisible({ timeout: 15_000 });

    // 10. Screenshot 2: Hasil pencarian pelanggan dengan nomor HP lokal 08...
    const screenshotCustomerPath = path.resolve(
      '/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/verified_customer_phone_search.png'
    );
    await page.screenshot({ path: screenshotCustomerPath, fullPage: true });
    console.log('Saved screenshot 2 to:', screenshotCustomerPath);

    // 11. Navigasi langsung ke URL detail pembayaran yang dilaporkan pengguna
    await page.goto('/workspace/payments/40000000-0000-4000-8000-000000016999?returnTo=%2Fworkspace%2Fpayments');
    
    // Pastikan tidak ada banner error merah
    const errorBanner = page.getByText('Detail pembayaran belum tersedia');
    await expect(errorBanner).not.toBeVisible();

    // Pastikan halaman memuat detail pembayaran dengan benar
    await expect(page.getByRole('heading', { name: 'Detail pembayaran' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('40000000-0000-4000-8000-000000016999')).toBeVisible();

    // Simpan screenshot halaman detail pembayaran yang normal dan mulus
    const screenshotDetailPath = path.resolve(
      '/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6/verified_payment_detail_no_blink.png'
    );
    await page.screenshot({ path: screenshotDetailPath, fullPage: true });
    console.log('Saved screenshot 3 to:', screenshotDetailPath);
  });
});

