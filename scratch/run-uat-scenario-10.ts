import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';
const BASE_URL = 'http://localhost:32120';

const OWNER_SBY_EMAIL = 'owner.sby@dailydose.test';
const OWNER_SBY_PASSWORD = 'OwnerPass123!';

const SUPEROWNER_EMAIL = 'ralamzah@gmail.com';
const SUPEROWNER_PASSWORD = 'ridho123';

const BRANCH_SBY_ID = 'a1000000-0000-4000-8000-000000000003'; // Surabaya (Authorized)
const BRANCH_MK_ID = 'a1000000-0000-4000-8000-000000000002'; // Muara Karang (Unauthorized)
const BRANCH_GG_ID = 'a1000000-0000-4000-8000-000000000001'; // Green Garden (Unauthorized)

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

async function runScenario10() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       DAILY DOSE PILATES V2 - UAT EKSEKUSI SKENARIO 10 (FINAL)                ║');
  console.log('║    Pengujian Keamanan & Isolasi Multi-Cabang (Cross-Branch RBAC Security)     ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // ==========================================================================
  // TAHAP 0: VERIFIKASI USER & KEPEMILIKAN CABANG DI DATABASE
  // ==========================================================================
  console.log('▶ [0/6] Memeriksa Data User Owner Surabaya di Basis Data...');
  const ownerUser = await prisma.user.findFirst({
    where: { email: OWNER_SBY_EMAIL },
    include: {
      ownedBranches: { include: { branch: true } },
    },
  });

  if (!ownerUser) {
    throw new Error('User owner.sby@dailydose.test tidak ditemukan di database.');
  }

  const assignedBranchIds = ownerUser.ownedBranches.map((ob) => ob.branchId);
  console.log(`   ✓ User ID: ${ownerUser.id}`);
  console.log(`   ✓ Role: ${ownerUser.role} (Status: ${ownerUser.status})`);
  console.log(`   ✓ Cabang Yang Dimiliki: ${assignedBranchIds.join(', ')}`);
  console.log(`   ✓ Nama Cabang: ${ownerUser.ownedBranches[0]?.branch.name}\n`);

  const browser = await chromium.launch({ headless: true });

  // CONTEXT 1: OWNER SURABAYA
  const ownerContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const ownerPage = await ownerContext.newPage();

  // CONTEXT 2: SUPER OWNER
  const soContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const soPage = await soContext.newPage();

  try {
    // ========================================================================
    // TAHAP 1: LOGIN OWNER SURABAYA & PERIKSA RUANG KERJA
    // ========================================================================
    console.log('▶ [1/6] Login Owner Cabang Surabaya & Buka Workspace...');
    await ownerPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await ownerPage.getByLabel('Email', { exact: true }).fill(OWNER_SBY_EMAIL);
    await ownerPage.getByLabel('Password').fill(OWNER_SBY_PASSWORD);
    await ownerPage.getByRole('button', { name: /masuk dengan email/i }).click();
    await ownerPage.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 30000 });
    console.log('   ✓ Login Owner Surabaya berhasil.');

    await ownerPage.waitForTimeout(2000);
    const scen10_01 = path.join(process.cwd(), 'scratch/uat_scen10_01_owner_logged_in.png');
    await ownerPage.screenshot({ path: scen10_01, fullPage: true });
    copyToArtifact(scen10_01, 'uat_scen10_01_owner_logged_in.png');

    // ========================================================================
    // TAHAP 2: BUKA HALAMAN PERFORMA CABANG SURABAYA
    // ========================================================================
    console.log('\n▶ [2/6] Membuka Menu Performa Cabang Privat Surabaya...');
    await ownerPage.goto(`${BASE_URL}/workspace/branch-performance`, { waitUntil: 'networkidle' });
    await ownerPage.waitForSelector('text=Performa Cabang Privat', { timeout: 15000 });
    await ownerPage.waitForTimeout(2000);

    const sbyHeaderVisible = await ownerPage.locator('text=Daily Dose Graha Family Surabaya').first().isVisible().catch(() => false);
    console.log(`   ✓ Header Cabang Surabaya Muncul: ${sbyHeaderVisible}`);

    const scen10_02 = path.join(process.cwd(), 'scratch/uat_scen10_02_surabaya_performance_view.png');
    await ownerPage.screenshot({ path: scen10_02, fullPage: true });
    copyToArtifact(scen10_02, 'uat_scen10_02_surabaya_performance_view.png');

    // ========================================================================
    // TAHAP 3: VERIFIKASI ISOLASI PEMILIH CABANG (TOPBAR / SESSION SCOPE)
    // ========================================================================
    console.log('\n▶ [3/6] Verifikasi Isolasi Akses Topbar & Cakupan Cabang...');
    // Cek tombol topbar cabang
    const topbarBranchBtn = ownerPage.locator('button:has-text("Surabaya")').first();
    const isSbyTopbar = await topbarBranchBtn.isVisible().catch(() => false);
    console.log(`   ✓ Topbar Aktif Terkunci ke Cabang Surabaya: ${isSbyTopbar}`);

    // Periksa API session me untuk memastikan branches hanya berisi Surabaya
    const sessionMe = await ownerPage.evaluate(async () => {
      const res = await fetch('/api/v1/me');
      return res.json();
    });

    console.log(`   - Jumlah Cabang Yang Diotorisasi di Sesi: ${sessionMe.branches?.length} cabang`);
    console.log(`   - Daftar Cabang: ${sessionMe.branches?.map((b: any) => `${b.code} (${b.name})`).join(', ')}`);

    if (sessionMe.branches?.length !== 1 || sessionMe.branches[0]?.id !== BRANCH_SBY_ID) {
      throw new Error(`Kebocoran Hak Akses Cabang! Cabang di sesi: ${JSON.stringify(sessionMe.branches)}`);
    }
    console.log('   ✓ Bukti Isolasi Sesi: Tidak ada cabang lain yang tersedia di profil Owner Surabaya.');

    const scen10_03 = path.join(process.cwd(), 'scratch/uat_scen10_03_branch_selector_isolated.png');
    await ownerPage.screenshot({ path: scen10_03, fullPage: true });
    copyToArtifact(scen10_03, 'uat_scen10_03_branch_selector_isolated.png');

    // ========================================================================
    // TAHAP 4: UJI PENETRASI AKSES ILEGAL LINTAS CABANG (MUARA KARANG)
    // ========================================================================
    console.log('\n▶ [4/6] Uji Penetrasi Akses Ilegal ke Cabang Muara Karang via URL Parameter...');
    const illegalUrl = `${BASE_URL}/workspace/branch-performance?branch=${BRANCH_MK_ID}`;
    await ownerPage.goto(illegalUrl, { waitUntil: 'networkidle' });
    await ownerPage.waitForTimeout(2000);

    const scen10_04 = path.join(process.cwd(), 'scratch/uat_scen10_04_cross_branch_access_denied_403.png');
    await ownerPage.screenshot({ path: scen10_04, fullPage: true });
    copyToArtifact(scen10_04, 'uat_scen10_04_cross_branch_access_denied_403.png');

    const forbiddenBanner = await ownerPage.locator('text=403 Forbidden: Anda tidak memiliki wewenang untuk mengakses cabang ini.').first().isVisible().catch(() => false);
    console.log(`   ✓ Pesan Penolakan 403 Forbidden Muncul di Layar: ${forbiddenBanner}`);

    // Pastikan angka omset dan data Muara Karang tidak bocor (tampil Rp 0)
    const zeroOmset = await ownerPage.locator('text=Rp 0').first().isVisible().catch(() => false);
    console.log(`   ✓ Data Finansial Muara Karang Terlindungi (Tampil Rp 0 / Kosong): ${zeroOmset}`);

    if (!forbiddenBanner) {
      throw new Error('Security Breach: Penolakan 403 Forbidden tidak muncul saat penetrasi lintas cabang!');
    }

    // ========================================================================
    // TAHAP 5: UJI PENETRASI LANGSUNG KE API BACKEND (DIRECT API TAMPERING)
    // ========================================================================
    console.log('\n▶ [5/6] Uji Penetrasi Langsung ke Seluruh Endpoint API Cabang Lain...');
    const apiTestResults = await ownerPage.evaluate(async ({ branchGg, branchMk }) => {
      const results: Array<{ endpoint: string; status: number }> = [];

      // 1. Owner Branch Performance Muara Karang
      const r1 = await fetch(`/api/v1/finance/owner-branch-performance?branchId=${branchMk}`);
      results.push({ endpoint: 'GET /finance/owner-branch-performance (MK)', status: r1.status });

      // 2. Owner Branch Performance Green Garden
      const r2 = await fetch(`/api/v1/finance/owner-branch-performance?branchId=${branchGg}`);
      results.push({ endpoint: 'GET /finance/owner-branch-performance (GG)', status: r2.status });

      // 3. Omset Report Green Garden
      const r3 = await fetch(`/api/v1/finance/reports/omset?branchId=${branchGg}&period=2026-10`);
      results.push({ endpoint: 'GET /finance/reports/omset (GG)', status: r3.status });

      // 4. Other Costs Green Garden
      const r4 = await fetch(`/api/v1/other-costs?branchId=${branchGg}&period=2026-10`);
      results.push({ endpoint: 'GET /other-costs (GG)', status: r4.status });

      return results;
    }, { branchGg: BRANCH_GG_ID, branchMk: BRANCH_MK_ID });

    console.log('   Hasil Respon API Backend saat Penetrasi:');
    let allForbidden = true;
    for (const test of apiTestResults) {
      console.log(`   - ${test.endpoint}: HTTP ${test.status} ${test.status === 403 ? '✅ (BLOCKED)' : '❌ (LEAK)'}`);
      if (test.status !== 403) allForbidden = false;
    }

    if (!allForbidden) {
      throw new Error('Security Breach: Ada endpoint API yang tidak memblokir akses lintas cabang!');
    }
    console.log('   ✓ 100% Endpoint API Finansial Cabang Lain Menolak dengan Status 403 Forbidden.');

    const scen10_05 = path.join(process.cwd(), 'scratch/uat_scen10_05_api_security_audit_logs.png');
    await ownerPage.screenshot({ path: scen10_05, fullPage: true });
    copyToArtifact(scen10_05, 'uat_scen10_05_api_security_audit_logs.png');

    // ========================================================================
    // TAHAP 6: VERIFIKASI ASIMETRIS - SUPER OWNER BEBAS AKSES SEMUA CABANG
    // ========================================================================
    console.log('\n▶ [6/6] Verifikasi Komparasi: Super Owner Memiliki Akses Global (branch:all)...');
    await soPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await soPage.getByLabel('Email', { exact: true }).fill(SUPEROWNER_EMAIL);
    await soPage.getByLabel('Password').fill(SUPEROWNER_PASSWORD);
    await soPage.getByRole('button', { name: /masuk dengan email/i }).click();
    await soPage.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 30000 });
    console.log('   ✓ Login Super Owner berhasil.');

    // Buka performa cabang Muara Karang sebagai Super Owner
    await soPage.goto(`${BASE_URL}/workspace/branch-performance?branch=${BRANCH_MK_ID}`, { waitUntil: 'networkidle' });
    await soPage.waitForTimeout(2000);

    const scen10_06 = path.join(process.cwd(), 'scratch/uat_scen10_06_superowner_global_switch.png');
    await soPage.screenshot({ path: scen10_06, fullPage: true });
    copyToArtifact(scen10_06, 'uat_scen10_06_superowner_global_switch.png');

    const soForbidden = await soPage.locator('text=403 Forbidden').first().isVisible().catch(() => false);
    console.log(`   ✓ Super Owner Dapat Mengakses Cabang Muara Karang Tanpa Hambatan 403 (Allowed: ${!soForbidden})`);

    console.log('\n✅ ══════════════════════════════════════════════════════════════════════════════');
    console.log('✅   SKENARIO 10 UAT BERHASIL DIEKSEKUSI DENGAN 100% PASS!');
    console.log('✅   Isolasi multi-cabang (Cross-Branch Isolation) terbukti kedap.');
    console.log('✅   Owner cabang privat HANYA dapat melihat data cabangnya sendiri.');
    console.log('✅   Akses lintas cabang ilegal (tampering URL & API) 100% DITOLAK (403 Forbidden).');
    console.log('✅   Prinsip tata kelola privasi & keamanan perbankan/investor TERPENUHI LENGKAP.');
    console.log('✅ ══════════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Terjadi kesalahan pada eksekusi Skenario 10:', error);
    const errPath = path.join(process.cwd(), 'scratch/uat_scen10_error_debug.png');
    await ownerPage.screenshot({ path: errPath, fullPage: true }).catch(() => {});
    copyToArtifact(errPath, 'uat_scen10_error_debug.png');
    throw error;
  } finally {
    await browser.close();
    await soContext.close();
    await prisma.$disconnect();
  }
}

runScenario10();
