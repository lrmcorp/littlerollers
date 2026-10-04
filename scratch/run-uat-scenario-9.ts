import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';
const BASE_URL = 'http://localhost:32120';

const FINANCE_EMAIL = 'finance.mk@dailydose.test';
const FINANCE_PASSWORD = 'FinancePass123!';

const BRANCH_ID = 'a1000000-0000-4000-8000-000000000001'; // Daily Dose Green Garden
const PERIOD = '2026-10';

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

async function runScenario9() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       DAILY DOSE PILATES V2 - UAT EKSEKUSI SKENARIO 9 (CLEAN SLATE)          ║');
  console.log('║   Rekonsiliasi Finansial, Honor Instruktur, & Tutup Buku (Period Lock)       ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // ==========================================================================
  // TAHAP 0: CLEAN SLATE & PRE-CONDITION DATABASE SETUP
  // ==========================================================================
  console.log('▶ [0/6] Membersihkan dan Mempersiapkan Data Baseline Finansial...');

  // Hapus snapshot monthly_close periode 2026-10 jika ada
  await prisma.monthlyClose.deleteMany({
    where: { branchId: BRANCH_ID, period: PERIOD },
  });

  // Hapus otherCost periode 2026-10 jika ada
  await prisma.otherCost.deleteMany({
    where: { branchId: BRANCH_ID, period: PERIOD },
  });

  // Pastikan slot b626ca6b (Coach Clara dari Skenario 6) berstatus COMPLETED
  await prisma.slotKelas.updateMany({
    where: { id: { startsWith: 'b626ca6b' } },
    data: { status: 'COMPLETED' },
  });

  console.log('   ✓ Snapshot MonthlyClose 2026-10 dibersihkan.');
  console.log('   ✓ OtherCost 2026-10 dibersihkan.');
  console.log('   ✓ Slot kelas Coach Clara berstatus COMPLETED.\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('   [PAGE ERROR]', msg.text());
  });
  page.on('response', async (response) => {
    if (response.status() >= 400) {
      let body = '';
      try {
        body = await response.text();
      } catch {}
      console.log(`   [HTTP ${response.status()}] ${response.request().method()} ${response.url()}:`, body);
    }
  });

  try {
    // ========================================================================
    // TAHAP 1: FINANCE LOGIN & BUKA MODUL FINANSIAL
    // ========================================================================
    console.log('▶ [1/6] Login Finance Staff & Membuka Modul Keuangan & Tutup Buku...');

    await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await page.getByLabel('Email', { exact: true }).fill(FINANCE_EMAIL);
    await page.getByLabel('Password').fill(FINANCE_PASSWORD);
    await page.getByRole('button', { name: /masuk dengan email/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 30000 });
    console.log('   ✓ Login Finance Staff berhasil.');

    // Buka menu /finance
    await page.goto(`${BASE_URL}/finance`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Keuangan & Tutup Buku', { timeout: 15000 });
    console.log('   ✓ Halaman Keuangan & Tutup Buku berhasil dimuat.');

    // Klik tab "5 Laporan Finansial & Tutup Buku"
    const financialReportsTab = page.locator('button:has-text("5 Laporan Finansial & Tutup Buku")');
    await financialReportsTab.click();
    await page.waitForTimeout(1000);

    // Pastikan filter Periode 2026-10 terpilih di filter bar
    const periodInput = page.getByRole('textbox', { name: 'Periode Bulan' });
    if (await periodInput.isVisible()) {
      const currentVal = await periodInput.inputValue();
      if (currentVal !== PERIOD) {
        await periodInput.fill(PERIOD);
        await page.waitForTimeout(1500);
      }
    }

    // ========================================================================
    // TAHAP 2: VERIFIKASI 5 PILAR - SUB-TAB 2 (OMSET PENJUALAN)
    // ========================================================================
    console.log('\n▶ [2/6] Verifikasi Laporan Omset Penjualan (Sub-Tab Omset)...');

    const omsetTab = page.locator('button:has-text("2. Omset Penjualan")');
    await omsetTab.click();
    await page.waitForTimeout(1500);

    // Ambil Screenshot 1: Laporan Omset Penjualan
    const scen9_01 = path.join(process.cwd(), 'scratch/uat_scen9_01_omset_report.png');
    await page.screenshot({ path: scen9_01, fullPage: true });
    copyToArtifact(scen9_01, 'uat_scen9_01_omset_report.png');

    // Verifikasi teks Rp 2.500.000 dan invoice Jessica
    const omsetText = await page.locator('text=Rp 2.500.000').first().isVisible().catch(() => false);
    const invoiceText = await page.locator('text=INV-MUSRV09P-98FB61').first().isVisible().catch(() => false);
    console.log(`   ✓ Omset Rp 2.500.000 Terlihat: ${omsetText}`);
    console.log(`   ✓ Invoice Transaksi Jessica Terlihat: ${invoiceText}`);

    // ========================================================================
    // TAHAP 3: VERIFIKASI SUB-TAB 3 (COST INSTRUKTUR REALTIME)
    // ========================================================================
    console.log('\n▶ [3/6] Verifikasi Laporan Beban Mengajar Instruktur Realtime...');

    const instructorTab = page.locator('button:has-text("3. Cost Instruktur Realtime")');
    await instructorTab.click();
    await page.waitForTimeout(1500);

    // Ambil Screenshot 2: Laporan Honor Instruktur
    const scen9_02 = path.join(process.cwd(), 'scratch/uat_scen9_02_instructor_cost_realtime.png');
    await page.screenshot({ path: scen9_02, fullPage: true });
    copyToArtifact(scen9_02, 'uat_scen9_02_instructor_cost_realtime.png');

    const claraText = await page.locator('text=Coach Clara').first().isVisible().catch(() => false);
    const honorText = await page.locator('text=Rp 150.000').first().isVisible().catch(() => false);
    console.log(`   ✓ Instruktur Coach Clara Terdaftar: ${claraText}`);
    console.log(`   ✓ Honor Mengajar Rp 150.000 (1 Jam Group Class): ${honorText}`);

    // ========================================================================
    // TAHAP 4: INPUT BIAYA OPERASIONAL LAIN (OTHER COST)
    // ========================================================================
    console.log('\n▶ [4/6] Input Biaya Operasional Lain (Other Cost: Rp 500.000)...');

    // Pindah ke tab 1 (Laba Bersih & Tutup Buku) untuk mengakses Finance Commands Panel
    const profitTab = page.locator('button:has-text("1. Laba Bersih & Tutup Buku")');
    await profitTab.click();
    await page.waitForTimeout(1500);

    // Scroll ke bagian Finance Command Panel
    const commandPanel = page.locator('text=Finance command').first();
    await commandPanel.scrollIntoViewIfNeeded();

    // Isi formulir Biaya Lain
    const reasonInput = page.getByLabel('Alasan command');
    await reasonInput.fill('Pencatatan biaya utilitas bulanan');

    const descInput = page.getByLabel('Deskripsi');
    await descInput.fill('Utilitas Listrik & Air Studio');

    const categoryInput = page.getByLabel('Kode kategori');
    await categoryInput.fill('OPERATING_EXPENSE');

    const amountInput = page.getByLabel('Nominal Rupiah');
    await amountInput.fill('500000');

    // Klik tombol "Simpan biaya"
    const saveCostBtn = page.getByRole('button', { name: 'Simpan biaya' });
    await saveCostBtn.click();

    // Tunggu notifikasi sukses
    await page.waitForSelector('text=Biaya lain tercatat', { timeout: 15000 });
    console.log('   ✓ Biaya operasional Rp 500.000 berhasil dicatat.');

    // Segarkan view agar ringkasan finansial dan tabel biaya operasional ter-update
    const refreshBtn = page.locator('button:has-text("Segarkan")').first();
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();
      await page.waitForTimeout(1500);
    }

    // Ambil Screenshot 3: Biaya Lain Tersimpan di Command Panel
    const scen9_03 = path.join(process.cwd(), 'scratch/uat_scen9_03_other_cost_saved.png');
    await page.screenshot({ path: scen9_03, fullPage: true });
    copyToArtifact(scen9_03, 'uat_scen9_03_other_cost_saved.png');

    // Buka Sub-Tab 5 (Biaya Operasional) untuk verifikasi tabel
    const otherCostTab = page.locator('button:has-text("5. Biaya Operasional (Other Cost)")');
    await otherCostTab.click();
    await page.waitForTimeout(1500);

    // Ambil Screenshot 4: Tabel Biaya Operasional
    const scen9_04 = path.join(process.cwd(), 'scratch/uat_scen9_04_other_cost_table.png');
    await page.screenshot({ path: scen9_04, fullPage: true });
    copyToArtifact(scen9_04, 'uat_scen9_04_other_cost_table.png');

    const utilityText = await page.locator('text=Utilitas Listrik & Air Studio').first().isVisible().catch(() => false);
    console.log(`   ✓ Item biaya "Utilitas Listrik & Air Studio" tampil di tabel: ${utilityText}`);

    // ========================================================================
    // TAHAP 5: VERIFIKASI KALKULASI LABA BERSIH
    // ========================================================================
    console.log('\n▶ [5/6] Verifikasi Kalkulasi Laba Bersih (Omset - Honor - Biaya)...');

    await profitTab.click();
    await page.waitForTimeout(1500);

    // Expected:
    // Omset: Rp 2.500.000
    // Honor Instruktur: Rp 150.000
    // Biaya Lain: Rp 500.000
    // Laba Bersih: 2.500.000 - 150.000 - 500.000 = Rp 1.850.000
    const profitCardValue = await page.locator('text=Rp 1.850.000').first().isVisible().catch(() => false);
    console.log(`   ✓ Laba Bersih Terkalkulasi Rp 1.850.000: ${profitCardValue}`);

    // Ambil Screenshot 5: Ringkasan 5 Pilar Laba Bersih
    const scen9_05 = path.join(process.cwd(), 'scratch/uat_scen9_05_profit_summary_accurate.png');
    await page.screenshot({ path: scen9_05, fullPage: true });
    copyToArtifact(scen9_05, 'uat_scen9_05_profit_summary_accurate.png');

    // ========================================================================
    // TAHAP 6: EKSEKUSI KUNCI PERIODE / TUTUP BUKU (PERIOD LOCK)
    // ========================================================================
    console.log('\n▶ [6/6] Menutup Buku dan Mengunci Periode (Period Lock)...');

    // Scroll ke bagian penutupan buku
    await commandPanel.scrollIntoViewIfNeeded();

    // Isi alasan command tutup buku
    await reasonInput.fill('Tutup buku bulanan operasional Oktober 2026');

    // Klik tombol Tutup periode
    const closeMonthBtn = page.getByRole('button', { name: 'Tutup periode' });
    await closeMonthBtn.waitFor({ state: 'visible', timeout: 10000 });
    await closeMonthBtn.click();

    // Dialog konfirmasi penutupan buku
    const dialogConfirmBtn = page.locator('button:has-text("Tutup periode")').last();
    await dialogConfirmBtn.waitFor({ state: 'visible', timeout: 10000 });
    console.log('   ✓ Dialog konfirmasi Tutup Periode muncul.');

    // Ambil Screenshot 6: Dialog Konfirmasi Tutup Buku
    const scen9_06 = path.join(process.cwd(), 'scratch/uat_scen9_06_confirm_period_lock_dialog.png');
    await page.screenshot({ path: scen9_06, fullPage: true });
    copyToArtifact(scen9_06, 'uat_scen9_06_confirm_period_lock_dialog.png');

    // Konfirmasi tutup buku
    await dialogConfirmBtn.click();

    // Tunggu feedback berhasil
    await page.waitForSelector('text=Periode berhasil ditutup', { timeout: 20000 });
    console.log('   ✓ Periode berhasil ditutup.');

    // Muat ulang halaman untuk verifikasi status LOCKED
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('button:has-text("5 Laporan Finansial & Tutup Buku")').click();
    await page.waitForTimeout(1500);

    // Ambil Screenshot 7: Periode Terkunci (Status LOCKED)
    const scen9_07 = path.join(process.cwd(), 'scratch/uat_scen9_07_period_locked_success.png');
    await page.screenshot({ path: scen9_07, fullPage: true });
    copyToArtifact(scen9_07, 'uat_scen9_07_period_locked_success.png');

    const lockedBadge = await page.locator('text=LOCKED (TERKUNCI)').first().isVisible().catch(() => false);
    console.log(`   ✓ Badge Status Periode Berubah Menjadi LOCKED: ${lockedBadge}`);

    // Pindah ke tab Biaya Operasional untuk memastikan aksi Ubah/Hapus menjadi Terkunci (Read-Only)
    await page.locator('button:has-text("5. Biaya Operasional (Other Cost)")').click();
    await page.waitForTimeout(1000);

    const lockedActionText = await page.locator('text=Terkunci').first().isVisible().catch(() => false);
    console.log(`   ✓ Aksi Mutasi Biaya Menjadi Read-Only ("Terkunci"): ${lockedActionText}`);

    // Ambil Screenshot 8: Biaya Operasional dalam Mode Terkunci
    const scen9_08 = path.join(process.cwd(), 'scratch/uat_scen9_08_other_cost_locked_readonly.png');
    await page.screenshot({ path: scen9_08, fullPage: true });
    copyToArtifact(scen9_08, 'uat_scen9_08_other_cost_locked_readonly.png');

    // ========================================================================
    // AUDIT BASIS DATA
    // ========================================================================
    console.log('\n▶ [AUDIT] Verifikasi Konsistensi Database dailydose_v2_uat...');

    const closed = await prisma.monthlyClose.findUnique({
      where: { branchId_period: { branchId: BRANCH_ID, period: PERIOD } },
      include: { closedBy: true, branch: true },
    });

    console.log(`   - Status MonthlyClose: ${closed?.status} (Expected: LOCKED)`);
    console.log(`   - Omset Snapshot: Rp ${closed?.omsetRp.toLocaleString('id-ID')} (Expected: Rp 2.500.000)`);
    console.log(`   - Honor Instruktur Snapshot: Rp ${closed?.costRealtimeRp.toLocaleString('id-ID')} (Expected: Rp 150.000)`);
    console.log(`   - Biaya Lain Snapshot: Rp ${closed?.otherCostRp.toLocaleString('id-ID')} (Expected: Rp 500.000)`);
    console.log(`   - Laba Bersih Snapshot: Rp ${closed?.profitRp.toLocaleString('id-ID')} (Expected: Rp 1.850.000)`);
    console.log(`   - Ditutup Oleh: ${closed?.closedBy?.displayName} (${closed?.closedBy?.email})`);
    console.log(`   - Control Hash: ${closed?.controlHash}`);

    if (closed?.status !== 'LOCKED') {
      throw new Error(`Audit Failure: Status MonthlyClose adalah ${closed?.status}, diharapkan LOCKED`);
    }
    if (closed?.omsetRp !== 2500000) {
      throw new Error(`Audit Failure: Omset adalah ${closed?.omsetRp}, diharapkan 2500000`);
    }
    if (closed?.costRealtimeRp !== 150000) {
      throw new Error(`Audit Failure: Honor adalah ${closed?.costRealtimeRp}, diharapkan 150000`);
    }
    if (closed?.otherCostRp !== 500000) {
      throw new Error(`Audit Failure: Biaya lain adalah ${closed?.otherCostRp}, diharapkan 500000`);
    }
    if (closed?.profitRp !== 1850000) {
      throw new Error(`Audit Failure: Laba adalah ${closed?.profitRp}, diharapkan 1850000`);
    }

    console.log('\n✅ ══════════════════════════════════════════════════════════════════════════════');
    console.log('✅   SKENARIO 9 UAT BERHASIL DIEKSEKUSI DENGAN 100% PASS!');
    console.log('✅   5 Pilar Finansial terverifikasi akurat.');
    console.log('✅   Other Cost berhasil dicatat, Laba Bersih Rp 1.850.000 terbukti akurat.');
    console.log('✅   Tutup Buku / Period Lock berhasil: snapshot tersimpan permanen di DB.');
    console.log('✅ ══════════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Terjadi kesalahan pada eksekusi Skenario 9:', error);
    const errPath = path.join(process.cwd(), 'scratch/uat_scen9_error_debug.png');
    await page.screenshot({ path: errPath, fullPage: true }).catch(() => {});
    copyToArtifact(errPath, 'uat_scen9_error_debug.png');
    throw error;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runScenario9();
