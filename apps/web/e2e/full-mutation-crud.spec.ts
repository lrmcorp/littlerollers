import { expect, test, type Page } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

const evidenceDir = path.resolve(__dirname, '../playwright-evidence/full-crud');
const authFile = path.join(evidenceDir, 'auth-state.json');

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

// Inisialisasi file auth-state agar Playwright test worker tidak error saat load konfigurasi
if (!fs.existsSync(authFile)) {
  fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }));
}

async function takeEvidence(page: Page, filename: string) {
  const screenshotPath = path.join(evidenceDir, filename);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.info(`[Evidence Captured]: ${screenshotPath}`);
}

test.describe.serial('E2E Full Mutation CRUD & Form Testing Suite', () => {
  let consoleErrors: string[] = [];
  let pageErrors: string[] = [];
  let failedRequests: string[] = [];

  // Setup: Log in once as Superadmin and save authenticated storage state
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ baseURL: 'http://127.0.0.1:32120' });
    const page = await context.newPage();
    await page.goto('/sign-in');
    await page.getByLabel('Email', { exact: true }).fill('ralamzah@gmail.com');
    await page.getByLabel('Password').fill('ridho123');
    await page.getByRole('button', { name: 'Masuk dengan email' }).click();
    await expect(page).not.toHaveURL(/\/sign-in(?:\?|$)/, { timeout: 20000 });
    await context.storageState({ path: authFile });
    await context.close();
  });

  // Apply authenticated storage state for all test cases
  test.use({ storageState: authFile });

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    pageErrors = [];
    failedRequests = [];

    // Listener Telemetri Kriteria Ketat
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon.ico') && !text.includes('404 (Not Found)')) {
          consoleErrors.push(`[Console Error]: ${text}`);
        }
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(`[Page Error]: ${err.message}`);
    });

    page.on('response', (res) => {
      if (res.status() >= 400) {
        const url = res.url();
        if (!url.includes('favicon.ico')) {
          failedRequests.push(`[Failed HTTP ${res.status()}]: ${url}`);
        }
      }
    });
  });

  test.afterEach(async () => {
    expect(consoleErrors, 'Harus 0 Unhandled Console Error di browser').toEqual([]);
    expect(pageErrors, 'Harus 0 Unhandled Page Exception').toEqual([]);
    expect(failedRequests, 'Harus 0 Unexpected Failed HTTP Requests (no 4xx/5xx)').toEqual([]);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MODUL 1: Master Cabang — SUDAH LULUS, dipertahankan untuk regression
  // ─────────────────────────────────────────────────────────────────────────────
  test('Modul 1: Full CRUD Master Cabang (/workspace/branches)', async ({ page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const branchCode = `DD-B${timestamp}`;
    const branchName = `Daily Dose Bandung ${timestamp}`;
    const branchNameUpdated = `Daily Dose Bandung ${timestamp} Central`;

    // 1. Buka Halaman Cabang
    await page.goto('/workspace/branches');
    await expect(page.getByRole('heading', { name: 'Manajemen Cabang' })).toBeVisible({ timeout: 15000 });
    await takeEvidence(page, '01-branches-list-initial.png');

    // 2. Skenario Positif (Happy Path): Buka drawer 'Buat cabang'
    const createBtn = page.getByRole('button', { name: 'Buat cabang' });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const drawer = page.getByRole('dialog', { name: 'Buat cabang' });
    await expect(drawer).toBeVisible();

    // Isi formulir lengkap
    await drawer.getByLabel('Kode cabang').fill(branchCode);
    await drawer.getByLabel('Nama cabang').fill(branchName);
    await drawer.getByLabel('Zona waktu').fill('Asia/Jakarta');
    await drawer.getByLabel('WhatsApp support').fill('+628123456789');
    await drawer.getByLabel('Alasan pembuatan').fill('Pengujian E2E Full Mutation CRUD');

    await takeEvidence(page, '02-branch-create-form-filled.png');

    // Submit form 'Simpan cabang'
    const submitBtn = drawer.getByRole('button', { name: 'Simpan cabang' });
    await submitBtn.click();

    // Tangani dialog konfirmasi 'Buat cabang baru?'
    const confirmDialog = page.getByRole('dialog', { name: /Buat cabang baru\?/i });
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.getByRole('button', { name: 'Buat cabang', exact: true }).click();

    // Verifikasi toast sukses muncul dan redirect ke detail cabang
    await expect(page.getByText('Cabang dibuat', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: branchName })).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '03-branch-created-detail.png');

    // 3. Skenario Edit: Buka drawer edit cabang
    const editBtn = page.getByRole('button', { name: 'Edit cabang' });
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    const editDrawer = page.getByRole('dialog', { name: 'Edit cabang' });
    await expect(editDrawer).toBeVisible();
    await expect(editDrawer.getByLabel('Kode cabang')).toBeDisabled(); // Kode immutable

    // Ubah nama cabang
    await editDrawer.getByLabel('Nama cabang').fill(branchNameUpdated);
    await editDrawer.getByLabel('Alasan perubahan').fill('Pembaruan nama cabang via E2E');
    await takeEvidence(page, '04-branch-edit-form-filled.png');

    // Simpan perubahan
    await editDrawer.getByRole('button', { name: 'Simpan perubahan' }).click();

    // Tangani dialog konfirmasi 'Simpan perubahan cabang?'
    const confirmEditDialog = page.getByRole('dialog', { name: /Simpan perubahan cabang\?/i });
    await expect(confirmEditDialog).toBeVisible({ timeout: 5000 });
    await confirmEditDialog.getByRole('button', { name: 'Simpan perubahan', exact: true }).click();

    await expect(page.getByText('Cabang diperbarui', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: branchNameUpdated })).toBeVisible();
    await takeEvidence(page, '05-branch-updated-detail.png');

    // 4. Verifikasi di Tabel Daftar Cabang
    await page.goto('/workspace/branches');
    await expect(page.getByText(branchNameUpdated).first()).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '06-branches-list-verified.png');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MODUL 2: Voucher Promosi — FIXED: isi "Alasan pembuatan" + handle confirm dialog
  // ─────────────────────────────────────────────────────────────────────────────
  test('Modul 2: Full CRUD Voucher Promosi (/workspace/vouchers)', async ({ page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const voucherCode = `PROMO${timestamp}`;
    const voucherName = `Voucher Promo Diskon ${timestamp}`;
    const voucherNameUpdated = `Voucher Promo Diskon ${timestamp} Updated`;

    // 1. Buka Halaman Vouchers
    await page.goto('/workspace/vouchers');
    await expect(page.getByRole('heading', { name: /Voucher/i })).toBeVisible({ timeout: 15000 });
    await takeEvidence(page, '07-vouchers-list-initial.png');

    // 2. Skenario Positif (Happy Path): Buat Voucher Baru
    const createBtn = page.getByRole('button', { name: 'Buat voucher' });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const drawer = page.getByRole('dialog', { name: 'Buat voucher' });
    await expect(drawer).toBeVisible();

    // Isi formulir voucher secara lengkap (termasuk field required: Alasan pembuatan)
    await drawer.getByLabel('Kode voucher').fill(voucherCode);
    await drawer.getByLabel('Nama voucher').fill(voucherName);
    await drawer.getByLabel('Deskripsi').fill('Voucher diskon mutasi E2E Playwright');
    await drawer.getByLabel('Tipe diskon').selectOption('FIXED_AMOUNT');
    await drawer.getByLabel('Nilai diskon').fill('50000');
    await drawer.getByLabel('Minimum pembelian').fill('200000');
    // WAJIB: field "Alasan pembuatan" (required, minLength=3)
    await drawer.getByLabel('Alasan pembuatan').fill('Pengujian E2E Playwright mutasi voucher');

    await takeEvidence(page, '08-voucher-create-form-filled.png');

    // Submit form — akan memunculkan dialog konfirmasi "Buat voucher baru?"
    await drawer.getByRole('button', { name: 'Simpan voucher' }).click();

    // Tangani konfirmasi dialog
    const confirmCreate = page.getByRole('dialog', { name: /Buat voucher baru\?/i });
    await expect(confirmCreate).toBeVisible({ timeout: 5000 });
    await confirmCreate.getByRole('button', { name: 'Buat voucher', exact: true }).click();

    // Verifikasi: toast sukses muncul dan voucher baru terlihat di daftar
    await expect(page.getByText('Voucher dibuat', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(voucherCode).first()).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '09-voucher-created-list.png');

    // 3. Skenario Edit: Klik baris voucher untuk ke halaman detail
    // Row aria-label = "Buka detail voucher PROMO8908"
    const voucherRow = page.getByRole('row', { name: `Buka detail voucher ${voucherCode}` });
    await expect(voucherRow).toBeVisible({ timeout: 10000 });
    await voucherRow.click();
    // Heading di halaman detail = voucher.code (h1)
    await expect(page.getByRole('heading', { level: 1, name: voucherCode })).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '09b-voucher-detail.png');

    // Buka Edit Konfigurasi drawer (title "Edit voucher")
    await page.getByRole('button', { name: 'Edit konfigurasi' }).click();
    const editDrawer = page.getByRole('dialog', { name: 'Edit voucher' });
    await expect(editDrawer).toBeVisible({ timeout: 5000 });

    // Ubah nama voucher dan isi Alasan perubahan (required)
    const nameInput = editDrawer.getByLabel('Nama voucher');
    await nameInput.fill(voucherNameUpdated);
    await editDrawer.getByLabel('Alasan perubahan').fill('Pembaruan nama voucher via E2E Playwright');
    await takeEvidence(page, '09c-voucher-edit-form-filled.png');

    // Submit edit — tombol "Simpan perubahan" ada di footer drawer
    const saveEditBtn = editDrawer.getByRole('button', { name: 'Simpan perubahan' });
    await saveEditBtn.click();

    // Konfirmasi "Simpan perubahan voucher?"
    const confirmEdit = page.getByRole('dialog', { name: /Simpan perubahan voucher\?/i });
    await expect(confirmEdit).toBeVisible({ timeout: 5000 });
    await confirmEdit.getByRole('button', { name: 'Simpan perubahan', exact: true }).click();

    // Toast "Voucher diperbarui"
    await expect(page.getByText('Voucher diperbarui', { exact: true })).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '09d-voucher-updated-detail.png');

    // Verifikasi di list
    await page.goto('/workspace/vouchers');
    await expect(page.getByText(voucherCode).first()).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '09e-vouchers-list-verified.png');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MODUL 3: Pengguna Internal — Full CRUD: Buat Pengguna, Edit Profil, Verifikasi
  // ─────────────────────────────────────────────────────────────────────────────
  test('Modul 3: Full CRUD Pengguna & Staf Internal (/users)', async ({ page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const userEmail = `finance.e2e.${timestamp}@dailydose.local`;
    const userName = `Finance E2E Test ${timestamp}`;
    const userNameUpdated = `Finance E2E Test ${timestamp} Updated`;

    // 1. Buka Halaman Pengguna
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: /Pengguna internal/i })).toBeVisible({ timeout: 15000 });
    await takeEvidence(page, '10-users-list-initial.png');

    // 2. Skenario Positif: Tambah Pengguna Internal
    const addBtn = page.getByRole('button', { name: /Buat pengguna internal/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    const drawer = page.getByRole('dialog', { name: 'Buat pengguna internal' });
    await expect(drawer).toBeVisible();

    // Isi field profil — label "Email kerja"
    await drawer.getByLabel('Nama tampilan').fill(userName);
    await drawer.getByLabel('Email kerja').fill(userEmail);

    // Pilih role "Finance" (scope global)
    const financeCheckbox = drawer.getByRole('checkbox', { name: /Finance/i });
    await expect(financeCheckbox).toBeVisible({ timeout: 5000 });
    await financeCheckbox.check();

    await takeEvidence(page, '11-user-create-form-filled.png');

    // Tunggu tombol submit tidak disabled
    const submitBtn = drawer.getByRole('button', { name: /Buat pengguna dan kirim aktivasi/i });
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();

    // Tunggu drawer tertutup
    await expect(drawer).not.toBeVisible({ timeout: 15000 });

    // Verifikasi toast sukses / pengguna muncul di daftar
    await expect(page.getByText('Pengguna internal dibuat dan tautan aktivasi berhasil dikirim.')).toBeVisible({ timeout: 10000 });
    const userLink = page.getByRole('link', { name: userName }).first();
    await expect(userLink).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '12-user-created-list.png');

    // 3. Skenario Edit: Buka halaman detail pengguna
    await userLink.click();
    await expect(page.getByRole('heading', { level: 1, name: userName })).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '12b-user-detail.png');

    // Buka dialog "Edit profil"
    const editProfileBtn = page.getByRole('button', { name: 'Edit profil' });
    await expect(editProfileBtn).toBeVisible();
    await editProfileBtn.click();

    const editDialog = page.getByRole('dialog', { name: 'Edit profil staf' });
    await expect(editDialog).toBeVisible({ timeout: 5000 });

    // Ubah nama tampilan dan isi alasan perubahan
    await editDialog.locator('input[name="displayName"]').fill(userNameUpdated);
    await editDialog.getByLabel('Alasan perubahan').fill('Pembaruan profil pengguna via E2E Playwright');
    await takeEvidence(page, '12c-user-edit-form-filled.png');

    // Submit dialog edit
    await editDialog.getByRole('button', { name: 'Simpan profil' }).click();

    // Tunggu dialog tertutup dan verifikasi heading terupdate
    await expect(editDialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { level: 1, name: userNameUpdated })).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '12d-user-updated-detail.png');

    // 4. Kembali ke daftar pengguna dan verifikasi
    await page.getByRole('link', { name: 'Kembali ke Pengguna' }).click();
    await expect(page.getByRole('link', { name: userNameUpdated }).first()).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '12e-users-list-verified.png');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MODUL 4: Paket & Membership (/workspace/packages)
  // ─────────────────────────────────────────────────────────────────────────────
  test('Modul 4: Full CRUD Paket & Promo Harga (/workspace/packages)', async ({ page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const businessKey = `PKG-E2E-${timestamp}`;
    const packageName = `Paket Pilates E2E ${timestamp}`;
    const packageNameUpdated = `Paket Pilates E2E ${timestamp} Updated`;

    // 1. Buka Halaman Paket
    await page.goto('/workspace/packages');
    await expect(page.getByRole('heading', { name: /Paket & promo harga/i })).toBeVisible({ timeout: 15000 });
    await takeEvidence(page, '13-packages-list-initial.png');

    // 2. Skenario Positif: Buat Paket Baru
    const createBtn = page.getByRole('button', { name: 'Buat paket' });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const drawer = page.getByRole('dialog', { name: 'Buat paket' });
    await expect(drawer).toBeVisible();

    // Pilih sedikitnya 1 Studio/Cabang
    const branchCheckbox = drawer.locator('input[name="branchIds"]').first();
    await branchCheckbox.check();

    // Tunggu opsi tipe kelas muncul lalu pilih sedikitnya 1
    const classTypeCheckbox = drawer.locator('input[name="classTypeIds"]').first();
    await expect(classTypeCheckbox).toBeVisible({ timeout: 5000 });
    await classTypeCheckbox.check();

    // Isi formulir paket
    await drawer.locator('input[name="businessKey"]').fill(businessKey);
    await drawer.locator('input[name="name"]').fill(packageName);
    await drawer.locator('input[name="sessionCount"]').fill('10');
    await drawer.locator('input[name="durationDays"]').fill('30');
    await drawer.locator('input[name="priceRp"]').fill('750000');
    await drawer.locator('input[name="effectiveFrom"]').fill('2026-09-01');
    await drawer.locator('input[name="reason"]').fill('Pembuatan paket baru via E2E Playwright');
    await takeEvidence(page, '14-package-create-form-filled.png');

    // Simpan paket
    await drawer.getByRole('button', { name: 'Simpan paket' }).click();

    // Dialog konfirmasi "Buat paket baru?"
    const confirmCreate = page.getByRole('dialog', { name: /Buat paket baru\?/i });
    await expect(confirmCreate).toBeVisible({ timeout: 5000 });
    await confirmCreate.getByRole('button', { name: 'Buat paket', exact: true }).click();

    // Verifikasi: Toast "Paket dibuat" & redirect ke detail paket
    await expect(page.getByText('Paket dibuat', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { level: 1, name: packageName })).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '15-package-created-detail.png');

    // 3. Skenario Edit: Edit Metadata Paket
    const editBtn = page.getByRole('button', { name: 'Edit paket' });
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    const editDrawer = page.getByRole('dialog', { name: 'Edit paket' });
    await expect(editDrawer).toBeVisible({ timeout: 5000 });

    // Ubah nama paket & isi alasan perubahan
    await editDrawer.locator('input[name="name"]').fill(packageNameUpdated);
    await editDrawer.locator('input[name="reason"]').fill('Pembaruan nama paket via E2E Playwright');
    await takeEvidence(page, '16-package-edit-form-filled.png');

    // Simpan perubahan
    await editDrawer.getByRole('button', { name: 'Simpan perubahan' }).click();

    // Konfirmasi dialog "Konfirmasi memperbarui paket"
    const confirmEdit = page.getByRole('dialog', { name: /Konfirmasi memperbarui paket/i });
    await expect(confirmEdit).toBeVisible({ timeout: 5000 });
    await confirmEdit.getByRole('button', { name: 'Lanjutkan', exact: true }).click();

    // Verifikasi toast "Paket diperbarui" & nama baru di heading detail
    await expect(page.getByText('Paket diperbarui', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { level: 1, name: packageNameUpdated })).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '17-package-updated-detail.png');

    // 4. Kembali ke daftar paket dan verifikasi
    await page.goto('/workspace/packages');
    await expect(page.getByText(packageNameUpdated).first()).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '18-packages-list-verified.png');
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MODUL 5: Kelas / Jadwal (/workspace/classes)
  // ─────────────────────────────────────────────────────────────────────────────
  test('Modul 5: Full CRUD Kelas / Jadwal Timetable (/workspace/classes)', async ({ page }) => {
    // 1. Set Cabang Aktif ke Daily Dose Jakarta agar dapat melakukan tindakan operasional (canOperate)
    await page.addInitScript(() => {
      sessionStorage.setItem('dd_active_branch', '6487b893-72f6-4b80-8bb8-0c2c4860eff6');
    });

    // Buka Halaman Timetable Kelas
    await page.goto('/workspace/classes');
    await expect(page.getByRole('heading', { name: /Timetable kelas/i })).toBeVisible({ timeout: 15000 });

    // Pastikan tombol Buat kelas aktif; jika belum, pilih cabang aktif via topbar
    const createBtn = page.getByRole('button', { name: 'Buat kelas' });
    await expect(createBtn).toBeVisible({ timeout: 10000 });
    if (!(await createBtn.isEnabled())) {
      const branchCombobox = page.getByRole('combobox', { name: 'Cabang aktif' });
      if (await branchCombobox.isVisible()) {
        await branchCombobox.click();
        const jktOption = page.getByRole('option', { name: /Daily Dose Jakarta|Jakarta/i }).first();
        if (await jktOption.isVisible()) {
          await jktOption.click();
        }
      }
    }
    await expect(createBtn).toBeEnabled({ timeout: 10000 });
    await takeEvidence(page, '19-classes-timetable-initial.png');

    // 2. Skenario Positif: Buat Draft Kelas Baru
    await createBtn.click();

    const drawer = page.getByRole('dialog', { name: 'Buat draft kelas' });
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Pilih Tipe Kelas
    const classTypeSelect = drawer.getByRole('combobox', { name: 'Tipe kelas' });
    await classTypeSelect.click();
    const classTypeOption = drawer.getByRole('option').first();
    await expect(classTypeOption).toBeVisible({ timeout: 5000 });
    await classTypeOption.click();

    // Pilih Area Studio
    const studioSelect = drawer.getByRole('combobox', { name: 'Area Studio' });
    await studioSelect.click();
    const studioOption = drawer.getByRole('option').first();
    await expect(studioOption).toBeVisible({ timeout: 5000 });
    await studioOption.click();

    // Isi Tanggal dan Waktu (pukul 14:00 - 15:00 hari ini)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    await drawer.locator('input[name="date"]').fill(dateStr);
    await drawer.locator('input[name="startTime"]').fill('14:00');
    await drawer.locator('input[name="endTime"]').fill('15:00');
    await takeEvidence(page, '20-class-create-form-filled.png');

    // Submit Buat Draft
    const submitCreateBtn = drawer.getByRole('button', { name: 'Buat draft' });
    await expect(submitCreateBtn).toBeEnabled();
    await submitCreateBtn.click();

    // Konfirmasi dialog "Buat draft kelas?"
    const confirmCreate = page.getByRole('dialog', { name: /Buat draft kelas\?/i });
    await expect(confirmCreate).toBeVisible({ timeout: 5000 });
    await confirmCreate.getByRole('button', { name: 'Buat draft', exact: true }).click();

    // Verifikasi pesan sukses & slot muncul di timetable
    await expect(page.getByText('Draft kelas berhasil dibuat.')).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '21-class-created-timetable.png');

    // 3. Buka Detail Kelas yang baru dibuat
    const slotCard = page.locator('.calendar-slot').first();
    await expect(slotCard).toBeVisible({ timeout: 10000 });
    await slotCard.click();

    const detailDrawer = page.locator('section[role="dialog"]').first();
    await expect(detailDrawer).toBeVisible({ timeout: 5000 });
    await takeEvidence(page, '22-class-detail-open.png');

    // 4. Skenario Edit: Edit Draft Kelas
    const editDraftBtn = detailDrawer.getByRole('button', { name: 'Edit kelas' });
    await expect(editDraftBtn).toBeVisible({ timeout: 5000 });
    await editDraftBtn.click();

    const editForm = detailDrawer.getByRole('form', { name: 'Edit draft kelas' });
    await expect(editForm).toBeVisible({ timeout: 5000 });

    // Ubah jam dan isi alasan perubahan
    await editForm.locator('input[name="startTime"]').fill('14:30');
    await editForm.locator('input[name="endTime"]').fill('15:30');
    await editForm.locator('input[name="reason"]').fill('Penyesuaian jam draft kelas via E2E Playwright');
    await takeEvidence(page, '23-class-edit-form-filled.png');

    // Simpan perubahan draft
    await editForm.getByRole('button', { name: 'Simpan perubahan kelas' }).click();

    // Dialog konfirmasi "Simpan perubahan kelas?"
    const confirmEdit = page.getByRole('dialog', { name: /Simpan perubahan kelas\?/i });
    await expect(confirmEdit).toBeVisible({ timeout: 5000 });
    await confirmEdit.getByRole('button', { name: 'Simpan perubahan', exact: true }).click();
    await expect(confirmEdit).not.toBeVisible({ timeout: 5000 });

    // Verifikasi pesan sukses & waktu baru di detail
    await expect(page.getByText('Draft kelas berhasil diperbarui.')).toBeVisible({ timeout: 10000 });
    await expect(detailDrawer.getByText(/14[:.]30/)).toBeVisible({ timeout: 10000 });
    await takeEvidence(page, '24-class-updated-detail.png');
  });
});
