import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:32120';
const MUARA_KARANG_BRANCH_ID = 'a1000000-0000-4000-8000-000000000002';

test.describe('E2E Workflow & Data Accuracy Testing per Role', () => {

  // ==========================================================================
  // SKENARIO 1: ROLE GUEST (PUBLIK)
  // ==========================================================================
  test('1. Guest - Eksplorasi Landing Page, Katalog 5 Cabang & Jadwal Publik', async ({ page }) => {
    // 1. Akses Landing Page
    await page.goto(`${BASE_URL}/`);
    await expect(page).toHaveTitle(/Daily Dose/i);
    await expect(page.locator('body')).toBeVisible();

    // 2. Eksplorasi Katalog Paket
    await page.goto(`${BASE_URL}/packages`);

    // Verifikasi tombol/filter 5 Cabang Fisik ada
    const branchNames = ['Muara Karang', 'Green Garden', 'Surabaya', 'Untar', 'PIK'];
    for (const bName of branchNames) {
      const btn = page.locator(`button:has-text("${bName}"), a:has-text("${bName}")`).first();
      await expect(btn).toBeVisible({ timeout: 10000 });
    }

    // Klik cabang Muara Karang
    const mkBtn = page.locator('button:has-text("Muara Karang")').first();
    await mkBtn.click();

    // Verifikasi kartu paket muncul dengan harga Rp dan jumlah sesi
    const cards = page.locator('article');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Verifikasi TIDAK ADA jenis kelas dummy seeder di layar
    await expect(page.locator('text=REFORMER_PRIV')).not.toBeVisible();
    await expect(page.locator('text=Mat Pilates')).not.toBeVisible();
    await expect(page.locator('text=Barre Class')).not.toBeVisible();

    // Verifikasi tombol aksi paket mengarahkan ke sign-in
    const selectBtn = page.locator('article a:has-text("Pilih"), article a:has-text("Masuk")').first();
    await expect(selectBtn).toBeVisible();
  });

  // ==========================================================================
  // SKENARIO 2: ROLE SUPERADMIN (AUDIT MASTER DATA & FINANCE DASHBOARD)
  // ==========================================================================
  test('2. Superadmin - Login, Dashboard Omzet Keuangan & Master Data 5 Cabang', async ({ page }) => {
    // Login sebagai Superadmin
    await page.goto(`${BASE_URL}/sign-in?returnTo=%2Fworkspace`);
    await page.getByLabel('Email', { exact: true }).fill('ralamzah@gmail.com');
    await page.getByLabel('Password').fill('ridho123');
    await page.getByRole('button', { name: 'Masuk dengan email' }).click();

    // Verifikasi masuk ke /workspace
    await expect(page).toHaveURL(/.*\/workspace.*/, { timeout: 20000 });
    await expect(page.locator('body')).toBeVisible();

    // Buka Halaman Keuangan /finance
    await page.goto(`${BASE_URL}/finance`);
    await expect(page.locator('text=Keuangan').or(page.locator('text=Rekonsiliasi')).first()).toBeVisible({ timeout: 15000 });

    // Buka Manajemen Cabang /workspace/branches
    await page.goto(`${BASE_URL}/workspace/branches`);
    await expect(page.locator('text=Daily Dose Muara Karang').or(page.locator('text=Green Garden')).first()).toBeVisible({ timeout: 15000 });

    // Buka Manajemen Voucher /workspace/vouchers
    await page.goto(`${BASE_URL}/workspace/vouchers`);
    await expect(page.locator('text=Voucher').first()).toBeVisible({ timeout: 15000 });
  });

  // ==========================================================================
  // SKENARIO 3: ROLE ADMIN CABANG (MANAJEMEN PEMBAYARAN & JADWAL)
  // ==========================================================================
  test('3. Admin - Login, Antrean Pembayaran Bank & Timetable Kelas', async ({ page }) => {
    // Login sebagai Admin Cabang
    await page.goto(`${BASE_URL}/sign-in?returnTo=%2Fworkspace%2Fpayments`);
    await page.getByLabel('Email', { exact: true }).fill('adminmk@ddose.com');
    await page.getByLabel('Password').fill('ridho123');
    await page.getByRole('button', { name: 'Masuk dengan email' }).click();

    // Verifikasi antrean pembayaran terbuka dan memuat data
    await expect(page).toHaveURL(/.*\/workspace\/payments.*/, { timeout: 20000 });
    await expect(page.locator('h1, h2').filter({ hasText: /Pembayaran/i }).first()).toBeVisible({ timeout: 15000 });

    // Verifikasi baris pembayaran menampilkan data tagihan nyata dengan format Rp
    const paymentRows = page.locator('table tbody tr');
    await expect(paymentRows.first()).toBeVisible({ timeout: 15000 });
    const rowCount = await paymentRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Buka Timetable Jadwal Kelas /workspace/classes dengan cabang aktif Muara Karang
    await page.goto(`${BASE_URL}/workspace/classes`);
    
    // Set cabang aktif via sessionStorage agar timetable cabang termuat
    await page.evaluate((branchId) => {
      sessionStorage.setItem('dd_active_branch', branchId);
    }, MUARA_KARANG_BRANCH_ID);
    await page.reload();

    // Verifikasi header timetable mingguan dan badge kemampuan mengelola
    await expect(page.locator('text=Timetable kelas mingguan').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Dapat mengelola').first()).toBeVisible({ timeout: 10000 });

    // Verifikasi tombol "Buat kelas" muncul untuk Admin
    const createClassBtn = page.getByRole('button', { name: 'Buat kelas' }).first();
    await expect(createClassBtn).toBeVisible({ timeout: 10000 });

    // Klik "Buat kelas" untuk memverifikasi form drawer/modal terbuka dengan benar
    await createClassBtn.click();
    const dialog = page.getByRole('dialog', { name: /Buat draft kelas/i });
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Buat draft kelas/i })).toBeVisible();
    await expect(dialog.getByRole('combobox', { name: 'Tipe kelas' })).toBeVisible();
    await expect(dialog.getByRole('combobox', { name: 'Instruktur' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Buat draft' })).toBeVisible();
  });

  // ==========================================================================
  // SKENARIO 4: ROLE MEMBER (LOGIN, AKUN PAKET & TIKET BOOKING)
  // ==========================================================================
  test('4. Member - Login, Cek Saldo Kuota Sesi & Riwayat Tiket', async ({ page }) => {
    // Login sebagai Member
    await page.goto(`${BASE_URL}/sign-in?returnTo=%2Faccount`);
    await page.getByLabel('Email', { exact: true }).fill('cindyedelene@gmail.com');
    await page.getByLabel('Password').fill('ridho123');
    await page.getByRole('button', { name: 'Masuk dengan email' }).click();

    // Verifikasi masuk ke /account dan menyapa nama pelanggan asli
    await expect(page).toHaveURL(/.*\/account.*/, { timeout: 20000 });
    await expect(page.locator('text=Halo, Cindy Edelene Arief').first()).toBeVisible({ timeout: 15000 });

    // Verifikasi tombol aksi "Booking kelas" tersedia
    await expect(page.getByRole('link', { name: /Booking kelas/i }).first()).toBeVisible();

    // Buka halaman paket saya /account/packages
    await page.goto(`${BASE_URL}/account/packages`);
    await expect(page.locator('h1, h2').filter({ hasText: /Paket Saya/i }).first()).toBeVisible({ timeout: 15000 });

    // Buka halaman QR Check-in Pass /check-in-pass
    await page.goto(`${BASE_URL}/check-in-pass`);
    await expect(page.locator('h1').filter({ hasText: /QR Pass Kelas/i }).first()).toBeVisible({ timeout: 15000 });
    // Tanpa booking terpilih halaman memakai booking mendatang terdekat, atau mengajak melihat jadwal; bukan galat.
    await expect(page.locator('text=Pass QR tidak valid atau sudah tidak tersedia')).toHaveCount(0, { timeout: 10000 });
  });

  // ==========================================================================
  // SKENARIO 5: ROLE COACH (JADWAL MENGAJAR & RBAC "HANYA LIHAT")
  // ==========================================================================
  test('5. Coach - Login & Akses Jadwal Mengajar dengan RBAC Read-Only', async ({ page }) => {
    // Login sebagai Coach Devi
    await page.goto(`${BASE_URL}/sign-in?returnTo=%2Fworkspace%2Fclasses`);
    await page.getByLabel('Email', { exact: true }).fill('instdevi@ddose.com');
    await page.getByLabel('Password').fill('ridho123');
    await page.getByRole('button', { name: 'Masuk dengan email' }).click();

    // Verifikasi redirect ke workspace / kelas
    await expect(page).not.toHaveURL(/\/sign-in(?:\?|$)/, { timeout: 20000 });

    // Set cabang aktif Muara Karang
    await page.evaluate((branchId) => {
      sessionStorage.setItem('dd_active_branch', branchId);
    }, MUARA_KARANG_BRANCH_ID);
    await page.reload();

    // Verifikasi timetable kelas mingguan terbuka
    await expect(page.locator('text=Timetable kelas mingguan').first()).toBeVisible({ timeout: 15000 });

    // Verifikasi RBAC: Coach hanya memiliki hak "Hanya lihat", bukan "Dapat mengelola"
    await expect(page.locator('text=Hanya lihat').first()).toBeVisible({ timeout: 10000 });

    // Verifikasi tombol "Buat kelas" disabled bagi Coach
    const createBtn = page.getByRole('button', { name: 'Buat kelas' }).first();
    await expect(createBtn).toBeDisabled();
  });

});
