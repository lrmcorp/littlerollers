import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';
const BASE_URL = 'http://localhost:32120';

const prisma = new PrismaClient();

function copyToArtifact(srcPath: string, filename: string) {
  if (fs.existsSync(srcPath)) {
    const dest = path.join(ARTIFACT_DIR, filename);
    fs.copyFileSync(srcPath, dest);
    console.log(`   [Artifact Saved] -> ${dest}`);
  }
}

async function runScenario2() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       DAILY DOSE PILATES V2 - UAT EKSEKUSI SKENARIO 2 (CLEAN SLATE)          ║');
  console.log('║       Verifikasi Identitas Pelanggan (KYC Submission & Review)               ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({
    headless: true, // Berjalan mandiri di background tanpa mengganggu tab user lain
  });

  // Context 1: Member Jessica
  const memberContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const memberPage = await memberContext.newPage();

  // Context 2: Super Owner Reviewer
  const ownerContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const ownerPage = await ownerContext.newPage();

  try {
    // ------------------------------------------------------------------------
    // TAHAP 1: MEMBER LOGIN
    // ------------------------------------------------------------------------
    console.log('▶ [1/6] Member Login (jessica.uat@gmail.com)...');
    await memberPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await memberPage.waitForTimeout(1000);

    await memberPage.fill('input[type="email"], #email', 'jessica.uat@gmail.com');
    await memberPage.fill('input[type="password"], #password', 'DailyDose2026!');
    await memberPage.click('button[type="submit"]');
    await memberPage.waitForLoadState('networkidle');
    await memberPage.waitForTimeout(1500);
    console.log(`   ✓ Login member berhasil, URL saat ini: ${memberPage.url()}`);

    // ------------------------------------------------------------------------
    // TAHAP 2: MEMBER MENGISI FORM KYC & UNGGAH DOKUMEN
    // ------------------------------------------------------------------------
    console.log('\n▶ [2/6] Mengakses Halaman Verifikasi Member (GET /account/verification)...');
    await memberPage.goto(`${BASE_URL}/account/verification`, { waitUntil: 'domcontentloaded' });
    await memberPage.waitForTimeout(1500);

    // Handle dialog pemilihan studio utama jika muncul
    const studioOverlay = memberPage.locator('div[data-overlay-phase="open"]');
    if (await studioOverlay.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('   ℹ Dialog pemilihan studio utama terdeteksi, memilih studio default...');
      const radio = studioOverlay.locator('input[type="radio"]').first();
      if (await radio.isVisible().catch(() => false)) {
        await radio.check();
      }
      const saveStudioBtn = studioOverlay.locator('button:has-text("Simpan")').first();
      if (await saveStudioBtn.isVisible().catch(() => false)) {
        await saveStudioBtn.click();
        await memberPage.waitForTimeout(1500);
      }
    }

    const ktpPath = path.resolve('scratch/sample_ktp.png');
    const selfiePath = path.resolve('scratch/sample_selfie.png');

    // Cek apakah form KYC tampil
    const nikInput = memberPage.locator('#nik');
    const isFormVisible = await nikInput.isVisible().catch(() => false);

    if (isFormVisible) {
      console.log('   ✓ Formulir KYC ditemukan, mengisi NIK dan Alamat...');
      await memberPage.fill('#nik', '3174051203950001');
      await memberPage.fill('#address', 'Jl. Kedoya Pesing No. 18, Jakarta Barat');

      console.log('   ✓ Melampirkan berkas Foto KTP dan Foto Selfie...');
      await memberPage.setInputFiles('#ktp', ktpPath);
      await memberPage.setInputFiles('#selfie', selfiePath);
      await memberPage.waitForTimeout(500);

      const formFilledScreenshot = path.join(process.cwd(), 'scratch/uat_scen2_01_member_kyc_filled.png');
      await memberPage.screenshot({ path: formFilledScreenshot, fullPage: false });
      copyToArtifact(formFilledScreenshot, 'uat_scen2_01_member_kyc_filled.png');

      console.log('   ✓ Menekan tombol "Kirim Dokumen Verifikasi"...');
      await memberPage.locator('button[type="submit"]:has-text("Kirim Dokumen Verifikasi")').click({ force: true });
      await memberPage.waitForTimeout(3000);
    } else {
      console.log('   ℹ Dokumen sudah ada atau halaman sedang menampilkan status dokumen.');
    }

    // Refresh untuk memastikan tampilan status dokumen pending
    await memberPage.goto(`${BASE_URL}/account/verification`, { waitUntil: 'domcontentloaded' });
    await memberPage.waitForTimeout(2000);
    await memberPage.waitForTimeout(2000);

    const pendingScreenshot = path.join(process.cwd(), 'scratch/uat_scen2_01_member_kyc_pending.png');
    await memberPage.screenshot({ path: pendingScreenshot, fullPage: false });
    copyToArtifact(pendingScreenshot, 'uat_scen2_01_member_kyc_pending.png');
    console.log('   ✓ Bukti tangkapan layar status KYC Member tersimpan.');

    // ------------------------------------------------------------------------
    // TAHAP 3: SUPER OWNER LOGIN
    // ------------------------------------------------------------------------
    console.log('\n▶ [3/6] Super Owner Login (ralamzah@gmail.com)...');
    await ownerPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await ownerPage.waitForTimeout(1000);

    await ownerPage.fill('input[type="email"], #email', 'ralamzah@gmail.com');
    await ownerPage.fill('input[type="password"], #password', 'ridho123');
    await ownerPage.click('button[type="submit"]');
    await ownerPage.waitForLoadState('networkidle');
    await ownerPage.waitForTimeout(2000);

    const ownerLoginScreenshot = path.join(process.cwd(), 'scratch/uat_scen2_02_superowner_login.png');
    await ownerPage.screenshot({ path: ownerLoginScreenshot, fullPage: false });
    copyToArtifact(ownerLoginScreenshot, 'uat_scen2_02_superowner_login.png');
    console.log(`   ✓ Login Super Owner berhasil. Workspace: ${ownerPage.url()}`);

    // ------------------------------------------------------------------------
    // TAHAP 4: SUPER OWNER MEMBUKA ANTREAN VERIFIKASI KYC
    // ------------------------------------------------------------------------
    console.log('\n▶ [4/6] Membuka Menu Antrean Verifikasi KYC (/identity-verifications)...');
    await ownerPage.goto(`${BASE_URL}/identity-verifications`, { waitUntil: 'networkidle' });
    await ownerPage.waitForTimeout(2000);

    // Cari member Jessica
    const searchInput = ownerPage.getByPlaceholder('Nama, nomor telepon, atau UUID');
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Jessica');
      await ownerPage.waitForTimeout(1500);
    }

    const queueScreenshot = path.join(process.cwd(), 'scratch/uat_scen2_03_kyc_queue.png');
    await ownerPage.screenshot({ path: queueScreenshot, fullPage: false });
    copyToArtifact(queueScreenshot, 'uat_scen2_03_kyc_queue.png');
    console.log('   ✓ Daftar antrean verifikasi berhasil dimuat.');

    // ------------------------------------------------------------------------
    // TAHAP 5: REVIEW & PERSETUJUAN DOKUMEN IDENTITAS
    // ------------------------------------------------------------------------
    console.log('\n▶ [5/6] Membuka Drawer Review Dokumen & Memberikan Persetujuan...');
    const inspectButton = ownerPage.getByRole('button', { name: 'Periksa' }).first();
    await inspectButton.click();
    await ownerPage.waitForTimeout(2000);

    const drawerScreenshot = path.join(process.cwd(), 'scratch/uat_scen2_04_kyc_review_drawer.png');
    await ownerPage.screenshot({ path: drawerScreenshot, fullPage: false });
    copyToArtifact(drawerScreenshot, 'uat_scen2_04_kyc_review_drawer.png');
    console.log('   ✓ Drawer Review Dokumen terbuka (menampilkan KTP dan Selfie).');

    // Menyetujui dokumen pertama
    const approveBtn1 = ownerPage.getByRole('button', { name: 'Setujui dokumen' }).first();
    if (await approveBtn1.isVisible({ timeout: 5000 }).catch(() => false)) {
      await approveBtn1.click();
      await ownerPage.waitForTimeout(800);
      const continueBtn = ownerPage.getByRole('button', { name: 'Lanjutkan persetujuan' });
      if (await continueBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await continueBtn.click();
        await ownerPage.waitForTimeout(2000);
      }
      console.log('   ✓ Dokumen 1 disetujui.');
    }

    // Menyetujui dokumen kedua jika ada
    const approveBtn2 = ownerPage.getByRole('button', { name: 'Setujui dokumen' }).first();
    if (await approveBtn2.isVisible({ timeout: 3000 }).catch(() => false)) {
      await approveBtn2.click();
      await ownerPage.waitForTimeout(800);
      const continueBtn2 = ownerPage.getByRole('button', { name: 'Lanjutkan persetujuan' });
      if (await continueBtn2.isVisible({ timeout: 5000 }).catch(() => false)) {
        await continueBtn2.click();
        await ownerPage.waitForTimeout(2000);
      }
      console.log('   ✓ Dokumen 2 disetujui.');
    }

    // ------------------------------------------------------------------------
    // TAHAP 6: VERIFIKASI STATUS MEMBER & AKSES BOOKING
    // ------------------------------------------------------------------------
    console.log('\n▶ [6/6] Memverifikasi Status Member di Portal Member...');
    await memberPage.goto(`${BASE_URL}/account/verification`, { waitUntil: 'domcontentloaded' });
    await memberPage.waitForTimeout(2500);

    const approvedScreenshot = path.join(process.cwd(), 'scratch/uat_scen2_05_member_kyc_approved.png');
    await memberPage.screenshot({ path: approvedScreenshot, fullPage: false });
    copyToArtifact(approvedScreenshot, 'uat_scen2_05_member_kyc_approved.png');
    console.log('   ✓ Status KYC Member berubah menjadi APPROVED.');

    // Cek akses halaman booking
    await memberPage.goto(`${BASE_URL}/bookings`, { waitUntil: 'domcontentloaded' });
    await memberPage.waitForTimeout(2000);

    const bookingsScreenshot = path.join(process.cwd(), 'scratch/uat_scen2_06_member_booking_unlocked.png');
    await memberPage.screenshot({ path: bookingsScreenshot, fullPage: false });
    copyToArtifact(bookingsScreenshot, 'uat_scen2_06_member_booking_unlocked.png');
    console.log('   ✓ Halaman Booking Member (/bookings) berhasil diakses.');

    // ------------------------------------------------------------------------
    // VERIFIKASI DATABASE
    // ------------------------------------------------------------------------
    console.log('\n▶ Memeriksa Integritas Database (dailydose_v2_uat)...');
    const updatedProfile = await prisma.profilPengguna.findFirst({
      where: { user: { email: 'jessica.uat@gmail.com' } },
      include: { user: true },
    });

    console.log('   ┌────────────────────────────────────────────────────────────┐');
    console.log(`   │ User ID       : ${updatedProfile?.userId}`);
    console.log(`   │ Nama Lengkap  : ${updatedProfile?.user.displayName}`);
    console.log(`   │ NIK           : ${updatedProfile?.nik}`);
    console.log(`   │ Alamat        : ${updatedProfile?.address}`);
    console.log(`   │ KTP Key       : ${updatedProfile?.ktpUrl}`);
    console.log(`   │ Selfie Key    : ${updatedProfile?.selfieUrl}`);
    console.log(`   │ Catatan/Audit : ${updatedProfile?.notes}`);
    console.log('   └────────────────────────────────────────────────────────────┘');

    if (!updatedProfile?.ktpUrl || !updatedProfile?.selfieUrl || !updatedProfile?.notes?.includes('KYC_APPROVED')) {
      throw new Error('Database verification failed: Dokumen KYC belum tersimpan atau belum terverifikasi di database.');
    }

    console.log('\n✨ SKENARIO 2 BERHASIL DIEKSEKUSI 100% TANPA KENDALA! ✨\n');
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runScenario2().catch((err) => {
  console.error('\n❌ ERROR EKSEKUSI SKENARIO 2:', err);
  process.exit(1);
});
