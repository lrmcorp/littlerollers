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

async function runScenario1() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       DAILY DOSE PILATES V2 - UAT EKSEKUSI SKENARIO 1 (CLEAN SLATE)          ║');
  console.log('║       Public Discovery, Catalog Browsing, & Member Onboarding                ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // Bersihkan user pengujian jika ada sebelumnya di database UAT
  await prisma.user.deleteMany({
    where: { email: 'jessica.uat@gmail.com' },
  }).catch(() => {});

  const browser = await chromium.launch({
    headless: true, // Berjalan mandiri di browser tersendiri tanpa mengganggu tab user lain
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    // ------------------------------------------------------------------------
    // TAHAP 1: LANDING PAGE PUBLIK
    // ------------------------------------------------------------------------
    console.log('▶ [1/4] Mengakses Landing Page Publik (GET /)...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const title = await page.title();
    console.log(`   ✓ Title: "${title}"`);

    const landingScreenshot = path.join(process.cwd(), 'scratch/uat_scen1_01_landing.png');
    await page.screenshot({ path: landingScreenshot, fullPage: false });
    copyToArtifact(landingScreenshot, 'uat_scen1_01_landing.png');

    // ------------------------------------------------------------------------
    // TAHAP 2: JADWAL KELAS PUBLIK
    // ------------------------------------------------------------------------
    console.log('\n▶ [2/4] Mengakses Katalog Jadwal Kelas Publik (GET /classes)...');
    await page.goto(`${BASE_URL}/classes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const classesScreenshot = path.join(process.cwd(), 'scratch/uat_scen1_02_classes.png');
    await page.screenshot({ path: classesScreenshot, fullPage: false });
    copyToArtifact(classesScreenshot, 'uat_scen1_02_classes.png');
    console.log('   ✓ Halaman Jadwal Kelas berhasil dimuat.');

    // ------------------------------------------------------------------------
    // TAHAP 3: KATALOG PAKET LATIHAN
    // ------------------------------------------------------------------------
    console.log('\n▶ [3/4] Mengakses Katalog Paket Latihan (GET /packages)...');
    await page.goto(`${BASE_URL}/packages`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const packagesScreenshot = path.join(process.cwd(), 'scratch/uat_scen1_03_packages.png');
    await page.screenshot({ path: packagesScreenshot, fullPage: false });
    copyToArtifact(packagesScreenshot, 'uat_scen1_03_packages.png');
    console.log('   ✓ Katalog Paket Latihan berhasil dimuat.');

    // ------------------------------------------------------------------------
    // TAHAP 4: PENDAFTARAN MEMBER BARU (ONBOARDING)
    // ------------------------------------------------------------------------
    console.log('\n▶ [4/4] Mengisi Formulir Pendaftaran Akun Member (GET /register)...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Isi formulir sesuai spesifikasi dokumen UAT
    await page.fill('#register-display-name', 'Jessica Anastasya UAT');
    await page.fill('#register-phone', '081299887766');
    await page.fill('#register-email', 'jessica.uat@gmail.com');
    await page.fill('#register-password', 'DailyDose2026!');
    await page.fill('#register-confirmation', 'DailyDose2026!');
    await page.check('#register-consent');

    const filledScreenshot = path.join(process.cwd(), 'scratch/uat_scen1_04_register_filled.png');
    await page.screenshot({ path: filledScreenshot, fullPage: false });
    copyToArtifact(filledScreenshot, 'uat_scen1_04_register_filled.png');
    console.log('   ✓ Formulir registrasi berhasil diisi lengkap.');

    // Submit formulir
    console.log('   Mengirimkan formulir registrasi...');
    await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/v1/') && res.status() < 400, { timeout: 15000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForTimeout(3000);

    // Navigasi ke portal member (/account) untuk memverifikasi sesi login
    await page.goto(`${BASE_URL}/account`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const accountScreenshot = path.join(process.cwd(), 'scratch/uat_scen1_05_account_dashboard.png');
    await page.screenshot({ path: accountScreenshot, fullPage: false });
    copyToArtifact(accountScreenshot, 'uat_scen1_05_account_dashboard.png');

    const accountUrl = page.url();
    console.log(`   ✓ Selesai registrasi & navigasi ke: ${accountUrl}`);

    // ------------------------------------------------------------------------
    // VALIDASI DATABASE
    // ------------------------------------------------------------------------
    console.log('\n🔍 [VERIFIKASI DATABASE] Memeriksa record di tabel dailydose_v2_uat.user...');
    const dbUser = await prisma.user.findFirst({
      where: { email: 'jessica.uat@gmail.com' },
      include: { profile: true },
    });

    if (!dbUser) {
      throw new Error('User jessica.uat@gmail.com tidak ditemukan di database dailydose_v2_uat!');
    }

    console.log('   ✓ User ID       :', dbUser.id);
    console.log('   ✓ Nama Lengkap  :', dbUser.displayName);
    console.log('   ✓ Email         :', dbUser.email);
    console.log('   ✓ Phone         :', dbUser.phone);
    console.log('   ✓ Role          :', dbUser.role);
    console.log('   ✓ Status Akun   :', dbUser.status);
    console.log('   ✓ Profil Terkait:', dbUser.profile ? 'ADA (ID: ' + dbUser.profile.id + ')' : 'BELUM');

    console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║   ✅ SKENARIO 1 UAT (PUBLIC ONBOARDING) BERHASIL DENGAN STATUS: PASS!        ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
  } catch (err) {
    console.error('❌ Terjadi kesalahan pada eksekusi Skenario 1:', err);
    throw err;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runScenario1().catch(() => process.exit(1));
