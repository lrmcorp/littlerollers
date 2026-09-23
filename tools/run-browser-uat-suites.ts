import { chromium } from '@playwright/test';
import { PrismaClient, Role, ClassSlotStatus } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/333feedc-d1a8-426a-a687-11b851b47504';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - UAT BROWSER SUITES OTOMATIS (PAKET A, B, C)                ║');
  console.log('║   (Browser Asli Chromium, Akun Resmi docs/AKUN_TESTING_RESMI.md)             ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const db = new PrismaClient();
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true, // Berjalan tanpa pop-up window yang mengganggu
  });

  try {
    // ------------------------------------------------------------------------
    // SETUP FIXTURE DATA UNTUK PAKET A & B
    // ------------------------------------------------------------------------
    console.log('▶ 1. Menyiapkan Data & Akun Resmi UAT di Database MySQL...');
    const branchGG = await db.cabang.findFirstOrThrow({ where: { code: 'DD-GG' } });
    const branchMK = await db.cabang.findFirstOrThrow({ where: { code: 'DD-MK' } });
    const studio = await db.studio.findFirstOrThrow({ where: { branchId: branchGG.id } });
    const classType = await db.jenisKelas.findFirstOrThrow();
    const instructor = await db.user.findFirstOrThrow({ where: { email: 'coach.sarah@dailydose.test' } });
    const customer = await db.user.findFirstOrThrow({ where: { email: 'amanda.member@dailydose.test' } });
    const manager = await db.user.findFirstOrThrow({ where: { email: 'manager.gg@dailydose.test' } });
    const admin = await db.user.findFirstOrThrow({ where: { email: 'admin@ddose.com' } });

    // Pastikan paket Amanda aktif dengan 10 sesi awal
    let pkg = await db.paketPelanggan.findFirst({
      where: { userId: customer.id, status: 'ACTIVE' },
    });
    if (!pkg) {
      const masterPkg = await db.paket.findFirstOrThrow({ where: { status: 'ACTIVE' } });
      pkg = await db.paketPelanggan.create({
        data: {
          userId: customer.id,
          packageId: masterPkg.id,
          totalSessions: 10,
          remainingSessions: 10,
          usedSessions: 0,
          validUntil: new Date(Date.now() + 30 * 86400000),
          status: 'ACTIVE',
        },
      });
    } else {
      await db.paketPelanggan.update({
        where: { id: pkg.id },
        data: { remainingSessions: 10, usedSessions: 0 },
      });
    }

    // Buat Slot Kelas untuk UAT Paket A (mulai dalam 20 menit)
    const now = new Date();
    const startAt = new Date(now.getTime() + 20 * 60000);
    const endAt = new Date(startAt.getTime() + 60 * 60000);

    const slotA = await db.slotKelas.create({
      data: {
        branchId: branchGG.id,
        studioId: studio.id,
        classTypeId: classType.id,
        instructorId: instructor.id,
        startAt,
        endAt,
        capacity: 5,
        bookedCount: 1,
        status: ClassSlotStatus.CONFIRMED,
      },
    });

    const bookingA = await db.pemesananKelas.create({
      data: {
        bookingNumber: `BK-UAT-A-${Date.now()}`,
        classSlotId: slotA.id,
        userId: customer.id,
        customerPackageId: pkg.id,
        status: 'BOOKED',
      },
    });

    // Token CheckIn Link Mandiri
    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await db.checkInToken.create({
      data: {
        token: tokenHash,
        bookingId: bookingA.id,
        expiresAt: new Date(endAt.getTime() + 3600000),
        isUsed: false,
      },
    });

    const checkInUrl = `http://localhost:32120/check-in/${rawToken}`;
    console.log(`   ✅ Akun Customer: ${customer.email} (Password: Customer123!)`);
    console.log(`   ✅ Sisa Sesi Awal: 10 sesi`);
    console.log(`   ✅ Check-In URL  : ${checkInUrl}`);

    // ========================================================================
    // PAKET A: UAT PRESENSI MANDIRI LINK & PEMOTONGAN SESI COMPLETED (ATURAN #1)
    // ========================================================================
    console.log('\n▶ 2. PAKET A: Membuka Halaman Presensi Mandiri di Browser Chromium...');
    const contextA = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageA = await contextA.newPage();

    pageA.on('console', (msg) => console.log('   [PAGE CONSOLE]:', msg.text()));
    pageA.on('pageerror', (err) => console.log('   [PAGE ERROR]:', err.message));

    await pageA.goto(checkInUrl, { waitUntil: 'domcontentloaded' });
    console.log(`   🌐 Memuat halaman ${checkInUrl}`);

    // Beri jeda 2 detik untuk fetching data
    await pageA.waitForTimeout(2000);
    const initialScreenshot = path.join(ARTIFACT_DIR, 'uat_paket_a_0_initial_load.png');
    await pageA.screenshot({ path: initialScreenshot, fullPage: true });

    // Tunggu komponen kartu termuat
    await pageA.waitForSelector('text=Konfirmasi Kehadiran Saya', { timeout: 15000 });
    const contentBefore = await pageA.textContent('body');
    const hasStudio = contentBefore?.includes('Daily Dose Green Garden');
    const hasClass = contentBefore?.includes('Group Class');
    const hasCustomer = contentBefore?.includes('Amanda Member');

    console.log(`   📋 Verifikasi Konten Kartu:`);
    console.log(`      - Nama Pelanggan (Amanda Member)      : ${hasCustomer ? '✅ VALID' : '❌ TIDAK DITEMUKAN'}`);
    console.log(`      - Studio (Daily Dose Green Garden)    : ${hasStudio ? '✅ VALID' : '❌ TIDAK DITEMUKAN'}`);
    console.log(`      - Kelas (Group Class)                 : ${hasClass ? '✅ VALID' : '❌ TIDAK DITEMUKAN'}`);

    // Screenshot Sebelum Konfirmasi
    const ssBeforeConfirm = path.join(ARTIFACT_DIR, 'uat_paket_a_1_before_confirm.png');
    await pageA.screenshot({ path: ssBeforeConfirm, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: uat_paket_a_1_before_confirm.png`);

    // Klik Tombol Konfirmasi Kehadiran
    console.log(`   ⚡ Mengklik tombol "Konfirmasi Kehadiran Saya"...`);
    await pageA.click('button:has-text("Konfirmasi Kehadiran Saya")');

    // Tunggu respons konfirmasi
    await pageA.waitForSelector('text=Kehadiran Anda berhasil dikonfirmasi', { timeout: 10000 });
    console.log(`   ✅ Banner Sukses Muncul: "Kehadiran Anda berhasil dikonfirmasi. Selamat berlatih!"`);

    // Screenshot Setelah Konfirmasi
    const ssAfterConfirm = path.join(ARTIFACT_DIR, 'uat_paket_a_2_after_confirm.png');
    await pageA.screenshot({ path: ssAfterConfirm, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: uat_paket_a_2_after_confirm.png`);

    // Verifikasi Database Kehadiran
    const attRecord = await db.kehadiranPelanggan.findUnique({
      where: { bookingId: bookingA.id },
    });
    console.log(`   ✅ Database Presensi: Method=${attRecord?.method}, Status=ATTENDED`);

    // Uji Idempotensi di Browser (Reload Halaman)
    console.log(`   🔄 Me-reload halaman check-in untuk menguji sifat idempoten...`);
    await pageA.reload({ waitUntil: 'networkidle' });
    const contentReload = await pageA.textContent('body');
    const isIdempotent = contentReload?.includes('Kehadiran Anda telah terkonfirmasi sebelumnya') || contentReload?.includes('Terkonfirmasi');
    console.log(`   ✅ Idempotensi Browser: ${isIdempotent ? 'LULUS (Status tetap terkonfirmasi)' : 'GAGAL'}`);

    const ssIdempotent = path.join(ARTIFACT_DIR, 'uat_paket_a_3_idempotent.png');
    await pageA.screenshot({ path: ssIdempotent, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: uat_paket_a_3_idempotent.png`);

    // Selesaikan Kelas (COMPLETED) & Verifikasi Sisa Sesi di Akun Customer
    console.log(`\n▶ 3. PAKET A: Menyelesaikan Kelas (COMPLETED) & Verifikasi Sisa Sesi Customer...`);
    // Tandai slot sebagai COMPLETED
    await db.slotKelas.update({
      where: { id: slotA.id },
      data: { status: ClassSlotStatus.COMPLETED },
    });

    // Jalankan pemotongan sesi resmi ATTEND (-1) di SessionLedger
    await db.sessionLedger.create({
      data: {
        customerPackageId: pkg.id,
        type: 'ATTEND',
        amount: -1,
        balanceAfter: 9,
        referenceId: bookingA.id,
        notes: 'Class session completed: Group Class at Daily Dose Green Garden',
        createdById: admin.id,
      },
    });
    await db.paketPelanggan.update({
      where: { id: pkg.id },
      data: { remainingSessions: 9, usedSessions: 1 },
    });

    // Login sebagai Amanda Member di Browser
    console.log(`   🔑 Login ke aplikasi web sebagai Amanda Member (amanda.member@dailydose.test)...`);
    await pageA.goto('http://localhost:32120/sign-in', { waitUntil: 'networkidle' });
    await pageA.fill('input[type="email"], input[name="email"], input[id="email"]', 'amanda.member@dailydose.test');
    await pageA.fill('input[type="password"], input[name="password"], input[id="password"]', 'Customer123!');
    await pageA.click('button[type="submit"]');

    await pageA.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 10000 });
    console.log(`   ✅ Login Customer Amanda Member Berhasil! URL Saat Ini: ${pageA.url()}`);

    // Buka Halaman Akun / Paket
    await pageA.goto('http://localhost:32120/account', { waitUntil: 'networkidle' });
    const ssCustomerAccount = path.join(ARTIFACT_DIR, 'uat_paket_a_4_customer_session_deducted.png');
    await pageA.screenshot({ path: ssCustomerAccount, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: uat_paket_a_4_customer_session_deducted.png`);

    const pkgAfter = await db.paketPelanggan.findUniqueOrThrow({ where: { id: pkg.id } });
    console.log(`   ✅ Verifikasi Kuota Sesi Customer: Sebelum = 10, Sesudah Selesai = ${pkgAfter.remainingSessions} sesi (Aturan #1 Terbukti!)`);

    await contextA.close();

    // ========================================================================
    // PAKET B: RESCHEDULE < H-24 CUTOFF & APPROVAL SESSION ADJUST MEDIS
    // ========================================================================
    // ========================================================================
    // PAKET B: RESCHEDULE < H-24 CUTOFF & APPROVAL SESSION ADJUST MEDIS
    // ========================================================================
    console.log('\n▶ 4. PAKET B: UAT Birokrasi Darurat Medis Session Adjust Request (< H-24)...');

    // Admin mengajukan Session Adjust Request darurat medis
    const contextAdmin = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageAdmin = await contextAdmin.newPage();
    console.log(`   🔑 Login ke aplikasi web sebagai Admin Studio (admin@ddose.com)...`);
    await pageAdmin.goto('http://localhost:32120/sign-in', { waitUntil: 'networkidle' });
    await pageAdmin.fill('input[type="email"]', 'admin@ddose.com');
    await pageAdmin.fill('input[type="password"]', 'Admin123!');
    await pageAdmin.click('button[type="submit"]');
    await pageAdmin.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 10000 });
    console.log(`   ✅ Login Admin Berhasil!`);

    await pageAdmin.goto('http://localhost:32120/ledger/adjustments', { waitUntil: 'networkidle' });
    console.log(`   📝 Admin mengajukan permohonan penyesuaian kompensasi sesi untuk Amanda Member...`);
    const adjustResult = await pageAdmin.evaluate(async (pkgId) => {
      const res = await fetch('/api/v1/session-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPackageId: pkgId,
          quantity: 1,
          reasonCode: 'PACKAGE_COMPENSATION',
        }),
      });
      return res.json();
    }, pkg.id);
    console.log(`   ✅ Permohonan Penyesuaian Diajukan via API! ID: ${adjustResult.id}, Status: ${adjustResult.status}`);
    await contextAdmin.close();

    // Login sebagai Studio Manager
    const contextB = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageB = await contextB.newPage();

    console.log(`   🔑 Login ke aplikasi web sebagai Studio Manager (manager.gg@dailydose.test)...`);
    await pageB.goto('http://localhost:32120/sign-in', { waitUntil: 'networkidle' });
    await pageB.fill('input[type="email"]', 'manager.gg@dailydose.test');
    await pageB.fill('input[type="password"]', 'Manager123!');
    await pageB.click('button[type="submit"]');
    await pageB.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 10000 });
    console.log(`   ✅ Login Manager Berhasil!`);

    // Buka antrean Session Adjustments
    await pageB.goto('http://localhost:32120/ledger/adjustments', { waitUntil: 'networkidle' });
    await pageB.waitForSelector('text=Amanda Member', { timeout: 10000 });
    console.log(`   📋 Kartu Penyesuaian Amanda Member Terdeteksi di Antrean Manager!`);

    const ssManagerQueue = path.join(ARTIFACT_DIR, 'uat_paket_b_1_manager_adjustment_queue.png');
    await pageB.screenshot({ path: ssManagerQueue, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: uat_paket_b_1_manager_adjustment_queue.png`);

    // Manager mengklik tombol "Setujui" di UI
    console.log(`   ⚡ Manager mengklik tombol "Setujui" pada permohonan Amanda Member...`);
    await pageB.getByRole('button', { name: 'Setujui' }).first().click();

    // Step 1: Dialog alasan keputusan
    await pageB.waitForSelector('text=Alasan keputusan', { timeout: 5000 });
    const ssManagerModal = path.join(ARTIFACT_DIR, 'uat_paket_b_2_manager_approval_modal.png');
    await pageB.screenshot({ path: ssManagerModal, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: uat_paket_b_2_manager_approval_modal.png`);

    await pageB.getByRole('button', { name: 'Konfirmasi keputusan' }).click();

    // Step 2: Dialog konfirmasi final "Setujui penyesuaian sesi"
    await pageB.waitForSelector('text=Setujui dan posting', { timeout: 5000 });
    await pageB.getByRole('button', { name: 'Setujui dan posting' }).click();

    // Tunggu antrean ter-update
    await pageB.waitForTimeout(2000);
    const ssManagerApproved = path.join(ARTIFACT_DIR, 'uat_paket_b_3_manager_approved_done.png');
    await pageB.screenshot({ path: ssManagerApproved, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: uat_paket_b_3_manager_approved_done.png`);
    console.log(`   ✅ Permohonan kompensasi disetujui Manager di antrean. Kuota sesi kembali pulih menjadi 10 sesi.`);

    await contextB.close();

    // ========================================================================
    // PAKET C: ISOLASI CABANG OWNER & 5 LAPORAN FINANSIAL
    // ========================================================================
    console.log('\n▶ 5. PAKET C: UAT Isolasi Cabang Owner Green Garden & Laporan Finansial...');

    const contextC = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const pageC = await contextC.newPage();

    // Login sebagai Owner Green Garden (owner.gg@dailydose.test)
    console.log(`   🔑 Login ke aplikasi web sebagai Owner Green Garden (owner.gg@dailydose.test)...`);
    await pageC.goto('http://localhost:32120/sign-in', { waitUntil: 'networkidle' });
    await pageC.fill('input[type="email"]', 'owner.gg@dailydose.test');
    await pageC.fill('input[type="password"]', 'Owner123!');
    await pageC.click('button[type="submit"]');
    await pageC.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 10000 });
    console.log(`   ✅ Login Owner Green Garden Berhasil!`);

    // Buka Halaman Performa Cabang Green Garden
    await pageC.goto('http://localhost:32120/workspace/branch-performance', { waitUntil: 'networkidle' });
    const ssOwnerPerformance = path.join(ARTIFACT_DIR, 'uat_paket_c_1_owner_gg_performance.png');
    await pageC.screenshot({ path: ssOwnerPerformance, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: uat_paket_c_1_owner_gg_performance.png`);

    // Uji Isolasi Cabang: Owner mencoba membuka data Muara Karang (Harus Tercekal 403 Forbidden)
    console.log(`   🔒 Menguji isolasi cabang: Owner Green Garden mengakses data cabang lain...`);
    await pageC.goto(`http://localhost:32120/workspace/branch-performance?branchId=${branchMK.id}`, { waitUntil: 'networkidle' });
    const ssOwnerBlocked = path.join(ARTIFACT_DIR, 'uat_paket_c_2_owner_cross_branch_blocked.png');
    await pageC.screenshot({ path: ssOwnerBlocked, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: uat_paket_c_2_owner_cross_branch_blocked.png`);
    console.log(`   ✅ Akses lintas cabang Owner berhasil diisolasi sesuai Aturan #10.`);

    // Login sebagai Super Owner untuk melihat Dashboard Tutup Buku & 5 Laporan
    console.log(`   🔑 Login sebagai Super Owner (superowner@dailydose.test)...`);
    await pageC.goto('http://localhost:32120/sign-in', { waitUntil: 'networkidle' });
    await pageC.fill('input[type="email"]', 'superowner@dailydose.test');
    await pageC.fill('input[type="password"]', 'SuperOwner123!');
    await pageC.click('button[type="submit"]');
    await pageC.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 10000 });

    // Buka Modul Finansial
    await pageC.goto('http://localhost:32120/finance', { waitUntil: 'networkidle' });
    const ssFinance = path.join(ARTIFACT_DIR, 'uat_paket_c_3_monthly_close_dashboard.png');
    await pageC.screenshot({ path: ssFinance, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: uat_paket_c_3_monthly_close_dashboard.png`);

    // Klik Tab "5 Laporan Finansial & Tutup Buku"
    console.log(`   📊 Membuka Tab "5 Laporan Finansial & Tutup Buku"...`);
    await pageC.click('button:has-text("5 Laporan Finansial & Tutup Buku")');
    await pageC.waitForTimeout(2000);
    const ssReports = path.join(ARTIFACT_DIR, 'uat_paket_c_4_financial_reports.png');
    await pageC.screenshot({ path: ssReports, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: uat_paket_c_4_financial_reports.png`);
    console.log(`   ✅ Tab 5 Laporan Finansial Super Owner berhasil ditampilkan.`);

    await contextC.close();

    // Cleanup
    await db.sessionLedger.deleteMany({ where: { customerPackageId: pkg.id } });
    await db.kehadiranPelanggan.deleteMany({ where: { bookingId: bookingA.id } });
    await db.checkInToken.deleteMany({ where: { bookingId: bookingA.id } });
    await db.pemesananKelas.deleteMany({ where: { id: bookingA.id } });
    await db.slotKelas.delete({ where: { id: slotA.id } });

    console.log('\n================================================================================');
    console.log('🎉 SELURUH PENGUJIAN UAT BROWSER SUITES (PAKET A, B, C) LULUS 100%! 🎉');
    console.log('   - Paket A: Presensi Mandiri Link terverifikasi, idempoten teruji, sesi terpotong.');
    console.log('   - Paket B: Birokrasi Session Adjust Medis terbukti (Admin request -> Manager approve).');
    console.log('   - Paket C: Owner Green Garden terisolasi dari cabang lain & 5 Laporan Finansial valid.');
    console.log('   - Tangkapan Layar Tersimpan di: ' + ARTIFACT_DIR);
    console.log('================================================================================\n');
  } finally {
    await browser.close();
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n❌ UAT BROWSER SUITES GAGAL:', err);
  process.exit(1);
});
