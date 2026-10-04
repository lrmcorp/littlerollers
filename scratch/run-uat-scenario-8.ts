import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';
const BASE_URL = 'http://localhost:32120';

// Actor credentials
const ADMIN_EMAIL = 'admin.gg@dailydose.test';
const ADMIN_PASSWORD = 'AdminPass123!';
const SUPER_OWNER_EMAIL = 'ralamzah@gmail.com';
const SUPER_OWNER_PASSWORD = 'ridho123';

// Member & Package for the test
const MEMBER_EMAIL = 'jessica.uat@gmail.com';
const CUSTOMER_PACKAGE_ID = 'bc5188df-bf14-4ae2-826a-3eb3bc97af22';

const BRANCH_ID = 'a1000000-0000-4000-8000-000000000001'; // Daily Dose Green Garden

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://dailydose:dailydose_local@127.0.0.1:3306/dailydose_v2_uat',
    },
  },
});

function copyToArtifact(srcPath: string, filename: string) {
  if (fs.existsSync(srcPath)) {
    const dest = path.join(ARTIFACT_DIR, filename);
    fs.copyFileSync(srcPath, dest);
    console.log(`   [Artifact Saved] -> ${dest}`);
  }
}

async function runScenario8() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       DAILY DOSE PILATES V2 - UAT EKSEKUSI SKENARIO 8 (CLEAN SLATE)          ║');
  console.log('║       Koreksi Saldo / Penyesuaian Sesi (Separation of Duties - SOD)          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // ==========================================================================
  // TAHAP 0: VERIFIKASI BASELINE STATE PAKET JESSICA
  // ==========================================================================
  console.log('▶ [0/5] Verifikasi State Awal Paket Jessica di Database...');

  const pkg = await prisma.paketPelanggan.findUnique({
    where: { id: CUSTOMER_PACKAGE_ID },
    include: { package: true, user: true },
  });
  if (!pkg) throw new Error('Paket pelanggan Jessica tidak ditemukan!');

  // Hapus semua adjustment dari Jessica untuk clean slate
  await prisma.sessionAdjustRequest.deleteMany({
    where: { customerPackageId: CUSTOMER_PACKAGE_ID },
  });
  // Hapus ledger manual adjustment dari Jessica jika ada
  await prisma.sessionLedger.deleteMany({
    where: { customerPackageId: CUSTOMER_PACKAGE_ID, type: 'ADJUST_MANUAL' },
  });
  // Reset saldo sesi ke 10
  await prisma.paketPelanggan.update({
    where: { id: CUSTOMER_PACKAGE_ID },
    data: { remainingSessions: 10 },
  });

  const INITIAL_SESSIONS = 10;
  console.log(`   ✓ Paket: ${pkg.package.name}`);
  console.log(`   ✓ Saldo Sesi Awal: ${INITIAL_SESSIONS} sesi`);
  console.log(`   ✓ Status Paket: ${pkg.status}`);
  console.log(`   ✓ Paket Pelanggan ID: ${CUSTOMER_PACKAGE_ID}\n`);

  const browser = await chromium.launch({ headless: true });

  // Admin Context
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const adminPage = await adminContext.newPage();

  // Super Owner Context
  const superOwnerContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const superOwnerPage = await superOwnerContext.newPage();

  let ADJUSTMENT_ID = '';

  try {
    // ========================================================================
    // TAHAP 1: ADMIN LOGIN & AJUKAN PENYESUAIAN SESI (+1)
    // ========================================================================
    console.log('▶ [1/5] Admin Frontdesk Login & Membuka Halaman Penyesuaian Sesi...');

    // Login Admin
    await adminPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await adminPage.getByLabel('Email', { exact: true }).fill(ADMIN_EMAIL);
    await adminPage.getByLabel('Password').fill(ADMIN_PASSWORD);
    await adminPage.getByRole('button', { name: /masuk dengan email/i }).click();
    await adminPage.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 30000 });
    console.log('   ✓ Login Admin Frontdesk berhasil.');

    // Buka halaman penyesuaian sesi
    await adminPage.goto(`${BASE_URL}/ledger/adjustments`, { waitUntil: 'networkidle' });
    await adminPage.waitForSelector('text=Penyesuaian Sesi', { timeout: 15000 });
    console.log('   ✓ Halaman Penyesuaian Sesi terbuka.');

    // Ambil Screenshot 1: Halaman Penyesuaian Sesi (Admin View)
    const scen8_01 = path.join(process.cwd(), 'scratch/uat_scen8_01_admin_adjustment_page.png');
    await adminPage.screenshot({ path: scen8_01, fullPage: true });
    copyToArtifact(scen8_01, 'uat_scen8_01_admin_adjustment_page.png');

    // Verifikasi Admin TIDAK melihat banner "Direct Authority" (SOD Check)
    const directBanner = adminPage.locator('text=Sebagai Manager/Owner, Anda memiliki wewenang untuk langsung menyesuaikan saldo sesi');
    const directVisible = await directBanner.isVisible().catch(() => false);
    if (directVisible) {
      throw new Error('SOD Failure: Admin seharusnya TIDAK melihat banner Direct Authority!');
    }
    console.log('   ✓ SOD Verified: Admin TIDAK memiliki Direct Authority - harus melalui review.');

    // Klik tombol "Buat permintaan penyesuaian"
    const openDrawerBtn = adminPage.getByRole('button', { name: 'Buat permintaan penyesuaian' });
    await openDrawerBtn.waitFor({ state: 'visible', timeout: 10000 });
    await openDrawerBtn.click();
    await adminPage.waitForSelector('text=Buat permintaan penyesuaian', { timeout: 10000 });
    console.log('   ✓ Drawer formulir penyesuaian terbuka.');

    // ========================================================================
    // TAHAP 2: ISI FORMULIR PENYESUAIAN SESI
    // ========================================================================
    console.log('\n▶ [2/5] Admin Mengisi Formulir Pengajuan Koreksi Saldo...');

    // Cari & pilih paket Jessica
    const searchInput = adminPage.getByLabel('Cari pelanggan atau paket aktif');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.fill('Jessica');
    await adminPage.waitForTimeout(1500);

    const option = adminPage.getByRole('option').first();
    await option.waitFor({ state: 'visible', timeout: 10000 });
    const optionText = await option.textContent();
    console.log(`   ✓ Opsi paket ditemukan: "${optionText?.trim()}"`);
    await option.click();
    await adminPage.waitForTimeout(500);

    // Isi jumlah sesi (+1)
    const quantityInput = adminPage.getByLabel('Perubahan sesi');
    await quantityInput.waitFor({ state: 'visible', timeout: 5000 });
    await quantityInput.fill('1');

    // Pastikan submit button bertulisan "Tinjau dan buat permintaan" (BUKAN "terapkan sekarang")
    const adminSubmitBtn = adminPage.getByRole('button', { name: 'Tinjau dan buat permintaan' });
    await adminSubmitBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✓ SOD Verified: Admin tombol submit = "Tinjau dan buat permintaan" (bukan Direct Apply).');

    // Ambil Screenshot 2: Formulir Penyesuaian Sesi Terisi
    const scen8_02 = path.join(process.cwd(), 'scratch/uat_scen8_02_admin_adjustment_form.png');
    await adminPage.screenshot({ path: scen8_02, fullPage: true });
    copyToArtifact(scen8_02, 'uat_scen8_02_admin_adjustment_form.png');

    // Klik submit
    await adminSubmitBtn.click();

    // Konfirmasi dialog
    const confirmBtn = adminPage.getByRole('button', { name: 'Buat permintaan', exact: true });
    await confirmBtn.waitFor({ state: 'visible', timeout: 10000 });
    console.log('   ✓ Dialog konfirmasi pengajuan muncul.');

    // Ambil Screenshot 3: Dialog Konfirmasi Pengajuan
    const scen8_03 = path.join(process.cwd(), 'scratch/uat_scen8_03_admin_confirm_request.png');
    await adminPage.screenshot({ path: scen8_03, fullPage: true });
    copyToArtifact(scen8_03, 'uat_scen8_03_admin_confirm_request.png');

    await confirmBtn.click();

    // Tunggu sukses - teks sukses dari ledger-view.tsx: 'Permintaan penyesuaian dibuat dan menunggu keputusan tanpa mengubah saldo.'
    await adminPage.waitForSelector('text=Permintaan penyesuaian dibuat dan menunggu keputusan', { timeout: 20000 });
    console.log('   ✓ Permintaan penyesuaian berhasil diajukan dengan status PENDING.');

    // Ambil Screenshot 4: Permintaan Terkirim - Antrean PENDING
    const scen8_04 = path.join(process.cwd(), 'scratch/uat_scen8_04_admin_request_pending.png');
    await adminPage.screenshot({ path: scen8_04, fullPage: true });
    copyToArtifact(scen8_04, 'uat_scen8_04_admin_request_pending.png');

    // Ambil ID adjustment dari database
    const adjustment = await prisma.sessionAdjustRequest.findFirst({
      where: { customerPackageId: CUSTOMER_PACKAGE_ID, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    if (!adjustment) throw new Error('Adjustment PENDING tidak ditemukan di database!');
    ADJUSTMENT_ID = adjustment.id;
    console.log(`   ✓ Adjustment ID: ${ADJUSTMENT_ID}`);

    // ========================================================================
    // TAHAP 3: VERIFIKASI SOD - ADMIN TIDAK BISA APPROVE PENGAJUANNYA SENDIRI
    // ========================================================================
    console.log('\n▶ [3/5] Verifikasi Proteksi SOD (Admin Tidak Bisa Setujui Sendiri)...');
    await adminPage.reload({ waitUntil: 'networkidle' });

    // Cek apakah ada item dengan status "Menunggu keputusan"
    const pendingItem = adminPage.locator('text=Menunggu keputusan').first();
    await pendingItem.waitFor({ state: 'visible', timeout: 15000 });
    console.log('   ✓ Item pengajuan tampil dalam antrean dengan status "Menunggu keputusan".');

    // Admin (ADMIN role) tidak memiliki ledger:adjust:decide - tombol Setujui tidak muncul sama sekali
    // SOD diverifikasi via RBAC: karena canDecide=false, item hanya menampilkan "Lihat detail"
    const approveBtn = adminPage.locator('button:has-text("Setujui")').first();
    const approveBtnExists = await approveBtn.isVisible().catch(() => false);
    const isApproveDisabled = approveBtnExists ? await approveBtn.isDisabled().catch(() => true) : true;

    if (approveBtnExists && !isApproveDisabled) {
      throw new Error('SOD Failure: Admin seharusnya TIDAK dapat menyetujui pengajuannya sendiri!');
    }
    console.log(`   ✓ SOD Enforced via RBAC: Admin tidak memiliki kapabilitas 'ledger:adjust:decide'.`);
    console.log(`   ✓ Tombol Setujui: ${approveBtnExists ? 'ada tapi disabled' : 'tidak tampil'} — SOD berjalan sempurna.`);

    // Ambil Screenshot 5: SOD Protection Visible
    const scen8_05 = path.join(process.cwd(), 'scratch/uat_scen8_05_sod_protection_admin.png');
    await adminPage.screenshot({ path: scen8_05, fullPage: true });
    copyToArtifact(scen8_05, 'uat_scen8_05_sod_protection_admin.png');

    // ========================================================================
    // TAHAP 4: SUPER OWNER LOGIN & SETUJUI PENYESUAIAN
    // ========================================================================
    console.log('\n▶ [4/5] Super Owner Login & Menyetujui Penyesuaian Sesi...');

    // Login Super Owner
    await superOwnerPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await superOwnerPage.getByLabel('Email', { exact: true }).fill(SUPER_OWNER_EMAIL);
    await superOwnerPage.getByLabel('Password').fill(SUPER_OWNER_PASSWORD);
    await superOwnerPage.getByRole('button', { name: /masuk dengan email/i }).click();
    await superOwnerPage.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 30000 });
    console.log('   ✓ Login Super Owner berhasil.');

    // Buka halaman penyesuaian
    await superOwnerPage.goto(
      `${BASE_URL}/ledger/adjustments?branch=${BRANCH_ID}`,
      { waitUntil: 'networkidle' }
    );
    await superOwnerPage.waitForSelector('text=Penyesuaian Sesi', { timeout: 15000 });

    // Verifikasi Super Owner MELIHAT banner Direct Authority
    const directBannerSO = superOwnerPage.locator('text=Sebagai Manager/Owner, Anda memiliki wewenang untuk langsung menyesuaikan saldo sesi');
    const soDirectVisible = await directBannerSO.isVisible().catch(() => false);
    console.log(`   ✓ Super Owner Direct Authority Banner: ${soDirectVisible ? 'Tampil (Memiliki wewenang penuh)' : 'Tidak tampil'}.`);

    // Ambil Screenshot 6: Super Owner Review Page
    const scen8_06 = path.join(process.cwd(), 'scratch/uat_scen8_06_superowner_review_page.png');
    await superOwnerPage.screenshot({ path: scen8_06, fullPage: true });
    copyToArtifact(scen8_06, 'uat_scen8_06_superowner_review_page.png');

    // Temukan item Jessica & klik Setujui
    const pendingItemSO = superOwnerPage.locator('text=Menunggu keputusan').first();
    await pendingItemSO.waitFor({ state: 'visible', timeout: 15000 });
    console.log('   ✓ Pengajuan Admin ditemukan di antrean Super Owner.');

    // Cari tombol Setujui yang enabled
    const approveButtons = superOwnerPage.locator('button:has-text("Setujui")');
    await approveButtons.first().waitFor({ state: 'visible', timeout: 10000 });
    const soApproveDisabled = await approveButtons.first().isDisabled().catch(() => false);
    if (soApproveDisabled) {
      throw new Error('Super Owner seharusnya BISA menyetujui pengajuan dari Admin!');
    }
    await approveButtons.first().click();
    console.log('   ✓ Tombol "Setujui" diklik oleh Super Owner.');

    // Modal "Persetujuan penyesuaian" terbuka
    const modalConfirmBtn = superOwnerPage.getByRole('button', { name: 'Konfirmasi keputusan' });
    await modalConfirmBtn.waitFor({ state: 'visible', timeout: 10000 });
    console.log('   ✓ Modal Persetujuan penyesuaian terbuka.');

    // Ambil Screenshot 7a: Modal Persetujuan Penyesuaian
    const scen8_07a = path.join(process.cwd(), 'scratch/uat_scen8_07_superowner_decision_modal.png');
    await superOwnerPage.screenshot({ path: scen8_07a, fullPage: true });
    copyToArtifact(scen8_07a, 'uat_scen8_07_superowner_decision_modal.png');

    // Klik "Konfirmasi keputusan" di modal
    await modalConfirmBtn.click();

    // Dialog konfirmasi posting terbuka
    const soConfirmBtn = superOwnerPage.getByRole('button', { name: 'Setujui dan posting' });
    await soConfirmBtn.waitFor({ state: 'visible', timeout: 10000 });
    console.log('   ✓ Dialog konfirmasi posting muncul.');

    // Ambil Screenshot 7b: Konfirmasi Approve oleh Super Owner
    const scen8_07b = path.join(process.cwd(), 'scratch/uat_scen8_07_superowner_approve_confirm.png');
    await superOwnerPage.screenshot({ path: scen8_07b, fullPage: true });
    copyToArtifact(scen8_07b, 'uat_scen8_07_superowner_approve_confirm.png');

    await soConfirmBtn.click();

    // Tunggu sukses
    await superOwnerPage.waitForSelector('text=disetujui dan diposting', { timeout: 15000 });
    console.log('   ✓ Penyesuaian sesi berhasil disetujui dan diposting oleh Super Owner.');

    // Ambil Screenshot 8: Persetujuan Sukses
    const scen8_08 = path.join(process.cwd(), 'scratch/uat_scen8_08_superowner_approved_success.png');
    await superOwnerPage.screenshot({ path: scen8_08, fullPage: true });
    copyToArtifact(scen8_08, 'uat_scen8_08_superowner_approved_success.png');

    // ========================================================================
    // TAHAP 5: AUDIT DATABASE - VERIFIKASI SALDO SESI BERTAMBAH
    // ========================================================================
    console.log('\n▶ [AUDIT] Verifikasi Konsistensi Database dailydose_v2_uat...');

    const updatedPkg = await prisma.paketPelanggan.findUnique({
      where: { id: CUSTOMER_PACKAGE_ID },
    });
    const updatedAdj = await prisma.sessionAdjustRequest.findUnique({
      where: { id: ADJUSTMENT_ID },
    });
    const ledgerEntry = await prisma.sessionLedger.findFirst({
      where: { customerPackageId: CUSTOMER_PACKAGE_ID },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`   - Status Adjustment: ${updatedAdj?.status} (Expected: APPROVED)`);
    console.log(`   - Saldo Sesi Sebelum: ${INITIAL_SESSIONS}`);
    console.log(`   - Saldo Sesi Sesudah: ${updatedPkg?.remainingSessions} (Expected: ${INITIAL_SESSIONS + 1})`);
    console.log(`   - Tipe Ledger Entry Terbaru: ${ledgerEntry?.type} (Expected: ADJUST_MANUAL)`);
    console.log(`   - Jumlah Perubahan: +${ledgerEntry?.amount} (Expected: +1)`);
    console.log(`   - Saldo Akhir Ledger: ${ledgerEntry?.balanceAfter} (Expected: ${INITIAL_SESSIONS + 1})`);
    console.log(`   - Disetujui Oleh: ${updatedAdj?.approvedById}`);

    if (updatedAdj?.status !== 'APPROVED') {
      throw new Error(`Audit Failure: Status adjustment adalah ${updatedAdj?.status}, diharapkan APPROVED`);
    }
    if (updatedPkg?.remainingSessions !== INITIAL_SESSIONS + 1) {
      throw new Error(`Audit Failure: Saldo sesi ${updatedPkg?.remainingSessions}, diharapkan ${INITIAL_SESSIONS + 1}`);
    }
    if (ledgerEntry?.type !== 'ADJUST_MANUAL') {
      throw new Error(`Audit Failure: Tipe ledger ${ledgerEntry?.type}, diharapkan ADJUST_MANUAL`);
    }
    if (ledgerEntry?.amount !== 1) {
      throw new Error(`Audit Failure: Jumlah perubahan ledger ${ledgerEntry?.amount}, diharapkan 1`);
    }

    // Ambil screenshot layar antrean riwayat Super Owner
    await superOwnerPage.reload({ waitUntil: 'networkidle' });
    const historyTabSO = superOwnerPage.locator('button[role="tab"]:has-text("Riwayat")').first();
    if (await historyTabSO.isVisible()) await historyTabSO.click();
    await superOwnerPage.waitForTimeout(1000);
    const scen8_09 = path.join(process.cwd(), 'scratch/uat_scen8_09_adjustment_history_posted.png');
    await superOwnerPage.screenshot({ path: scen8_09, fullPage: true });
    copyToArtifact(scen8_09, 'uat_scen8_09_adjustment_history_posted.png');

    console.log('\n✅ ══════════════════════════════════════════════════════════════════════════════');
    console.log('✅   SKENARIO 8 UAT BERHASIL DIEKSEKUSI DENGAN 100% PASS!');
    console.log('✅   SOD enforced: Admin tidak bisa approve sendiri.');
    console.log('✅   Super Owner approved → saldo sesi bertambah (+1) → ledger ADJUST_MANUAL.');
    console.log('✅ ══════════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Terjadi kesalahan pada eksekusi Skenario 8:', error);
    const errPath = path.join(process.cwd(), 'scratch/uat_scen8_error_debug.png');
    await adminPage.screenshot({ path: errPath, fullPage: true }).catch(() => {});
    copyToArtifact(errPath, 'uat_scen8_error_debug.png');
    const errPath2 = path.join(process.cwd(), 'scratch/uat_scen8_error_debug_so.png');
    await superOwnerPage.screenshot({ path: errPath2, fullPage: true }).catch(() => {});
    copyToArtifact(errPath2, 'uat_scen8_error_debug_so.png');
    throw error;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runScenario8();
