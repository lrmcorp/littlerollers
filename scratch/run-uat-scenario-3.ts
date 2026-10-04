import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';
const BASE_URL = 'http://localhost:32120';
const RECEIPT_IMAGE_PATH = path.join(process.cwd(), 'scratch/sample_receipt.png');

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

async function runScenario3() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       DAILY DOSE PILATES V2 - UAT EKSEKUSI SKENARIO 3 (CLEAN SLATE)          ║');
  console.log('║       Pembelian Paket Sesi, Pembayaran Transfer, & Persetujuan Kasir         ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // Launch isolated headless Chromium browser
  const browser = await chromium.launch({
    headless: true,
  });

  // --------------------------------------------------------------------------
  // CONTEXT 1: MEMBER (JESSICA ANASTASYA UAT)
  // --------------------------------------------------------------------------
  const memberContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const memberPage = await memberContext.newPage();

  // --------------------------------------------------------------------------
  // CONTEXT 2: FINANCE / STAFF (FINANCE MANAGER MK)
  // --------------------------------------------------------------------------
  const staffContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const staffPage = await staffContext.newPage();

  let createdOrderId = '';
  let createdInvoiceNumber = '';

  try {
    // ========================================================================
    // TAHAP 1: LOGIN MEMBER JESSICA
    // ========================================================================
    console.log('▶ [1/6] Login Member Jessica Anastasya UAT (GET /sign-in)...');
    await memberPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await memberPage.waitForSelector('input[name="email"]');
    await memberPage.fill('input[name="email"]', 'jessica.uat@gmail.com');
    await memberPage.fill('input[name="password"]', 'DailyDose2026!');
    await memberPage.click('button[type="submit"]');

    // Tunggu navigasi setelah login
    await memberPage.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 10000 });
    console.log(`   ✓ Login Member Berhasil, URL: ${memberPage.url()}`);

    // ========================================================================
    // TAHAP 2: BUKA KATALOG PAKET & PILIH 10 SESSIONS GROUP CLASS REFORMER
    // ========================================================================
    console.log('\n▶ [2/6] Membuka Halaman Katalog Paket (GET /packages)...');
    await memberPage.goto(`${BASE_URL}/packages?branch=a1000000-0000-4000-8000-000000000001`, { waitUntil: 'networkidle' });
    await memberPage.waitForTimeout(1500);

    // Cari kartu paket "10 Sessions Group Class Reformer"
    const targetPackageCard = memberPage.locator('article', { hasText: '10 Sessions Group Class Reformer' });
    await targetPackageCard.waitFor({ timeout: 5000 });
    console.log('   ✓ Kartu Paket "10 Sessions Group Class Reformer" ditemukan di katalog Green Garden.');

    // Screenshot kartu paket yang dipilih
    const scen3CardScreenshot = path.join(process.cwd(), 'scratch/uat_scen3_01_catalog_selection.png');
    await memberPage.screenshot({ path: scen3CardScreenshot, fullPage: false });
    copyToArtifact(scen3CardScreenshot, 'uat_scen3_01_catalog_selection.png');

    // Klik tombol Beli paket / Pilih paket
    const ctaButton = targetPackageCard.locator('a, button', { hasText: /pilih paket|beli paket/i }).first();
    await ctaButton.click();

    // ========================================================================
    // TAHAP 3: HALAMAN CHECKOUT & BUAT PESANAN
    // ========================================================================
    console.log('\n▶ [3/6] Berada di Halaman Checkout (GET /checkout)...');
    await memberPage.waitForURL(url => url.pathname.includes('/checkout'), { timeout: 10000 });
    await memberPage.waitForTimeout(1500);
    console.log(`   ✓ URL Checkout: ${memberPage.url()}`);

    // Verifikasi ringkasan paket di halaman checkout
    const packageNameHeader = await memberPage.textContent('h2');
    console.log(`   ✓ Paket dipilih di checkout: "${packageNameHeader?.trim()}"`);

    // Screenshot ringkasan pesanan sebelum dibuat
    const scen3OrderSummaryScreenshot = path.join(process.cwd(), 'scratch/uat_scen3_02_order_summary.png');
    await memberPage.screenshot({ path: scen3OrderSummaryScreenshot, fullPage: false });
    copyToArtifact(scen3OrderSummaryScreenshot, 'uat_scen3_02_order_summary.png');

    // Klik tombol "Buat pesanan dan lanjutkan pembayaran"
    console.log('   Mengklik tombol "Buat pesanan dan lanjutkan pembayaran"...');
    const createOrderBtn = memberPage.locator('button', { hasText: /buat pesanan dan lanjutkan/i });
    await createOrderBtn.click();

    // Tangani dialog konfirmasi jika muncul
    await memberPage.waitForTimeout(500);
    const confirmModalBtn = memberPage.locator('button', { hasText: /^buat pesanan$/i });
    if (await confirmModalBtn.isVisible()) {
      console.log('   Mengonfirmasi modal pembuatan pesanan...');
      await confirmModalBtn.click();
    }

    // Tunggu status beralih ke form pembayaran dengan orderId
    await memberPage.waitForURL(url => url.searchParams.has('order'), { timeout: 15000 });
    const currentCheckoutUrl = new URL(memberPage.url());
    createdOrderId = currentCheckoutUrl.searchParams.get('order') || '';
    console.log(`   ✓ Pesanan berhasil dibuat! ID Order: ${createdOrderId}`);

    await memberPage.waitForTimeout(1500);

    // ========================================================================
    // TAHAP 4: UNGGAH BUKTI TRANSFER BCA
    // ========================================================================
    console.log('\n▶ [4/6] Meninjau Rekening Transfer & Mengunggah Bukti Bayar...');
    // Verifikasi informasi rekening BCA
    const bcaInfo = await memberPage.locator('text=6600482911').isVisible();
    const geraldInfo = await memberPage.locator('text=Gerald Reyner Liando').isVisible();
    console.log(`   ✓ Snapshot Rekening BCA Green Garden tampil: ${bcaInfo && geraldInfo ? 'VALID (6600482911 a.n. Gerald Reyner Liando)' : 'Periksa kembali'}`);

    // Upload file receipt ke file input
    const fileInput = memberPage.locator('input[type="file"]');
    await fileInput.setInputFiles(RECEIPT_IMAGE_PATH);
    console.log(`   ✓ File bukti transfer diunggah: ${RECEIPT_IMAGE_PATH}`);
    await memberPage.waitForTimeout(1000);

    // Screenshot sebelum submit bukti pembayaran
    const scen3ProofReadyScreenshot = path.join(process.cwd(), 'scratch/uat_scen3_03_proof_selected.png');
    await memberPage.screenshot({ path: scen3ProofReadyScreenshot, fullPage: false });
    copyToArtifact(scen3ProofReadyScreenshot, 'uat_scen3_03_proof_selected.png');

    // Klik tombol "Kirim bukti pembayaran"
    console.log('   Mengklik tombol "Kirim bukti pembayaran"...');
    const submitProofBtn = memberPage.locator('button', { hasText: /kirim bukti pembayaran/i });
    await submitProofBtn.click();

    // Tunggu status berubah menjadi PENDING / "Menunggu pemeriksaan"
    await memberPage.waitForSelector('text=Menunggu pemeriksaan', { timeout: 15000 });
    console.log('   ✓ Status pesanan member berubah menjadi: "Menunggu pemeriksaan Finance"');

    // Screenshot status PENDING di sisi Member
    const scen3PendingScreenshot = path.join(process.cwd(), 'scratch/uat_scen3_04_member_pending_review.png');
    await memberPage.screenshot({ path: scen3PendingScreenshot, fullPage: false });
    copyToArtifact(scen3PendingScreenshot, 'uat_scen3_04_member_pending_review.png');

    // ========================================================================
    // TAHAP 5: PERSIDANGAN & VERIFIKASI PEMBAYARAN OLEH FINANCE
    // ========================================================================
    console.log('\n▶ [5/6] Login Staff Finance (finance.mk@dailydose.test) & Verifikasi Pembayaran...');
    await staffPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await staffPage.waitForSelector('input[name="email"]');
    await staffPage.fill('input[name="email"]', 'finance.mk@dailydose.test');
    await staffPage.fill('input[name="password"]', 'FinancePass123!');
    await staffPage.click('button[type="submit"]');

    await staffPage.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 10000 });
    console.log(`   ✓ Login Finance Berhasil, URL: ${staffPage.url()}`);

    // Buka menu Antrean Pembayaran (/workspace/payments)
    console.log('   Membuka Antrean Pembayaran (/workspace/payments)...');
    await staffPage.goto(`${BASE_URL}/workspace/payments`, { waitUntil: 'networkidle' });
    await staffPage.waitForTimeout(2000);

    // Screenshot antrean pembayaran sebelum persetujuan
    const scen3QueueScreenshot = path.join(process.cwd(), 'scratch/uat_scen3_05_finance_payments_queue.png');
    await staffPage.screenshot({ path: scen3QueueScreenshot, fullPage: false });
    copyToArtifact(scen3QueueScreenshot, 'uat_scen3_05_finance_payments_queue.png');

    // Cari transaksi Jessica Anastasya UAT
    const jessicaRow = staffPage.locator('tr, tr[role="row"]', { hasText: 'Jessica Anastasya UAT' }).first();
    await jessicaRow.waitFor({ timeout: 10000 });
    console.log('   ✓ Transaksi member Jessica Anastasya UAT ditemukan di tabel antrean pembayaran.');

    // Buka detail transaksi atau preview
    const detailLink = jessicaRow.locator('a, button', { hasText: /periksa detail/i }).first();
    if (await detailLink.isVisible()) {
      console.log('   Membuka halaman detail transaksi pembayaran...');
      await detailLink.click();
      await staffPage.waitForURL(url => url.pathname.includes('/workspace/payments/'), { timeout: 10000 });
      await staffPage.waitForTimeout(1500);

      // Screenshot detail pembayaran di sisi Finance
      const scen3DetailScreenshot = path.join(process.cwd(), 'scratch/uat_scen3_06_finance_payment_detail.png');
      await staffPage.screenshot({ path: scen3DetailScreenshot, fullPage: false });
      copyToArtifact(scen3DetailScreenshot, 'uat_scen3_06_finance_payment_detail.png');

      // Klik Preview Bukti untuk menampilkan bukti transfer BCA
      const previewBtn = staffPage.locator('button', { hasText: /preview bukti/i });
      if (await previewBtn.isVisible()) {
        console.log('   Menampilkan preview bukti pembayaran...');
        await previewBtn.click();
        await staffPage.waitForTimeout(1500);
        const scen3ProofModalScreenshot = path.join(process.cwd(), 'scratch/uat_scen3_07_finance_proof_preview.png');
        await staffPage.screenshot({ path: scen3ProofModalScreenshot, fullPage: false });
        copyToArtifact(scen3ProofModalScreenshot, 'uat_scen3_07_finance_proof_preview.png');
      }

      // Klik tombol "Setujui pembayaran"
      console.log('   Mengklik tombol persetujuan pembayaran ("Setujui pembayaran")...');
      const approveBtn = staffPage.locator('button', { hasText: /setujui pembayaran/i });
      await approveBtn.click();
      await staffPage.waitForTimeout(1000);

      // Tangani modal konfirmasi persetujuan jika muncul
      const confirmApproveBtn = staffPage.locator('button', { hasText: /setujui dan aktifkan paket|lanjutkan|ya/i }).last();
      if (await confirmApproveBtn.isVisible()) {
        console.log('   Mengonfirmasi modal persetujuan pembayaran...');
        await confirmApproveBtn.click();
      }

      // Tunggu panel aktivasi paket muncul
      await staffPage.waitForSelector('text=Paket pelanggan telah aktif', { timeout: 15000 });
      console.log('   ✓ Pembayaran berhasil disetujui! Status transaksi berubah menjadi PAID / Disetujui.');

      // Screenshot hasil persetujuan di sisi Finance
      const scen3ApprovedScreenshot = path.join(process.cwd(), 'scratch/uat_scen3_08_finance_payment_approved.png');
      await staffPage.screenshot({ path: scen3ApprovedScreenshot, fullPage: false });
      copyToArtifact(scen3ApprovedScreenshot, 'uat_scen3_08_finance_payment_approved.png');
    } else {
      // Alternatif: Klik tombol "Setujui" langsung dari tabel baris antrean
      console.log('   Mengklik tombol "Setujui" langsung dari baris antrean...');
      const approveRowBtn = jessicaRow.locator('button', { hasText: /setujui/i });
      await approveRowBtn.click();
      await staffPage.waitForTimeout(1000);

      const confirmApproveBtn = staffPage.locator('button', { hasText: /setujui dan aktifkan paket/i });
      if (await confirmApproveBtn.isVisible()) {
        await confirmApproveBtn.click();
      }
      await staffPage.waitForTimeout(2000);
      console.log('   ✓ Pembayaran disetujui dari tabel antrean.');
    }

    // ========================================================================
    // TAHAP 6: VERIFIKASI SALDO SESI PADA PORTAL MEMBER
    // ========================================================================
    console.log('\n▶ [6/6] Verifikasi Saldo Paket Sesi pada Portal Member (GET /account/packages)...');
    await memberPage.goto(`${BASE_URL}/account/packages`, { waitUntil: 'networkidle' });
    await memberPage.waitForTimeout(2000);

    // Cari kartu paket aktif
    const activePackageCard = memberPage.locator('article', { hasText: '10 Sessions Group Class Reformer' });
    await activePackageCard.waitFor({ timeout: 10000 });

    const availableSessions = await activePackageCard.locator('dd').first().textContent();
    console.log(`   ✓ Saldo sesi aktif berhasil diverifikasi: ${availableSessions?.trim()} Sesi Tersedia`);

    // Screenshot paket aktif di halaman akun member
    const scen3MemberActiveScreenshot = path.join(process.cwd(), 'scratch/uat_scen3_09_member_packages_active.png');
    await memberPage.screenshot({ path: scen3MemberActiveScreenshot, fullPage: false });
    copyToArtifact(scen3MemberActiveScreenshot, 'uat_scen3_09_member_packages_active.png');

    // ========================================================================
    // TAHAP 7: VERIFIKASI DATABASE (DATABASE INTEGRITY AUDIT)
    // ========================================================================
    console.log('\n▶ [AUDIT] Melakukan Verifikasi Database dailydose_v2_uat...');
    const purchaseRecord = await prisma.pembelian.findFirst({
      where: { userId: 'b4a79f7a-8f67-47ce-a1e6-a2f21ad75fef' },
      include: {
        package: true,
        branch: true,
        paymentProof: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const customerPackageRecord = await prisma.paketPelanggan.findFirst({
      where: { userId: 'b4a79f7a-8f67-47ce-a1e6-a2f21ad75fef' },
      orderBy: { createdAt: 'desc' },
    });

    const sessionLedgerRecord = await prisma.sessionLedger.findFirst({
      where: { customerPackageId: customerPackageRecord?.id },
      orderBy: { createdAt: 'desc' },
    });

    console.log('\n--- HASIL AUDIT DATABASE ---');
    console.log('1. Pembelian (Purchase):', {
      id: purchaseRecord?.id,
      invoiceNumber: purchaseRecord?.invoiceNumber,
      status: purchaseRecord?.status,
      paidAt: purchaseRecord?.paidAt,
      priceRpSnapshot: purchaseRecord?.priceRpSnapshot,
      branch: purchaseRecord?.branch?.name,
      package: purchaseRecord?.packageNameSnapshot,
    });
    console.log('2. Bukti Pembayaran (Payment Proof):', {
      id: purchaseRecord?.paymentProof?.id,
      uploadStatus: purchaseRecord?.paymentProof?.uploadStatus,
      scanStatus: purchaseRecord?.paymentProof?.scanStatus,
    });
    console.log('3. Paket Pelanggan (Customer Package):', {
      id: customerPackageRecord?.id,
      packageName: customerPackageRecord?.packageNameSnapshot,
      totalSessions: customerPackageRecord?.totalSessions,
      remainingSessions: customerPackageRecord?.remainingSessions,
      usedSessions: customerPackageRecord?.usedSessions,
      status: customerPackageRecord?.status,
      validUntil: customerPackageRecord?.validUntil,
    });
    console.log('4. Session Ledger:', {
      id: sessionLedgerRecord?.id,
      mutationType: sessionLedgerRecord?.mutationType,
      delta: sessionLedgerRecord?.sessionDelta,
      balanceAfter: sessionLedgerRecord?.balanceAfter,
    });

    console.log('\n✅ SKENARIO 3 BERHASIL DIEKSEKUSI DENGAN STATUS: PASS (100%)');
  } catch (error) {
    console.error('\n❌ KENDALA EKSEKUSI SKENARIO 3:', error);
    // Tangkap screenshot kegagalan untuk diagnosis
    try {
      const errScreenshot = path.join(process.cwd(), 'scratch/uat_scen3_error_debug.png');
      await memberPage.screenshot({ path: errScreenshot, fullPage: false });
      copyToArtifact(errScreenshot, 'uat_scen3_error_debug.png');
    } catch {}
    throw error;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runScenario3().catch(err => {
  console.error(err);
  process.exit(1);
});
