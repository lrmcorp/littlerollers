import { chromium } from '../apps/web/node_modules/@playwright/test/index.mjs';
import { PrismaClient } from '../apps/api/node_modules/@prisma/client/index.js';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:32120';
const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/c6426952-ce89-43b2-93c3-2d13678b66a6';

async function setupFixtures() {
  console.log('--- [SETUP FIXTURES] Menyiapkan data uji booking Amanda Member ---');
  const amanda = await prisma.user.findFirstOrThrow({
    where: { email: 'amanda.member@dailydose.test' },
  });
  const ggBranch = await prisma.cabang.findFirstOrThrow({
    where: { code: 'DD-GG' },
  });
  const privateType = await prisma.jenisKelas.findFirstOrThrow({
    where: { name: 'Private Class' },
  });
  const ggStudio = await prisma.studio.findFirst({
    where: { branchId: ggBranch.id },
  });

  // Pastikan Amanda memiliki paket aktif
  let activePackage = await prisma.paketPelanggan.findFirst({
    where: {
      userId: amanda.id,
      status: 'ACTIVE',
      remainingSessions: { gte: 2 },
    },
    include: { package: true, purchase: true },
  });

  if (!activePackage) {
    const pkgDef = await prisma.paket.findFirstOrThrow({
      where: { classTypeId: privateType.id },
    });
    activePackage = await prisma.paketPelanggan.create({
      data: {
        userId: amanda.id,
        packageId: pkgDef.id,
        remainingSessions: 10,
        totalSessions: 10,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 86_400_000),
        status: 'ACTIVE',
      },
      include: { package: true, purchase: true },
    });
  }

  // Bersihkan penyesuaian sesi PENDING lama agar Amanda dapat diajukan penyesuaian baru
  await prisma.sessionAdjustRequest.deleteMany({
    where: { customerPackageId: activePackage.id, status: 'PENDING' },
  });

  // 1. Slot Sumber untuk Uji >= H-24 (5 hari ke depan)
  const slotEligibleDate = new Date(Date.now() + 5 * 86_400_000);
  slotEligibleDate.setHours(10, 0, 0, 0);
  const slotEligibleEnd = new Date(slotEligibleDate.getTime() + 3_600_000);

  const sourceSlotEligible = await prisma.slotKelas.create({
    data: {
      id: randomUUID(),
      branchId: ggBranch.id,
      classTypeId: privateType.id,
      studioId: ggStudio?.id,
      startAt: slotEligibleDate,
      endAt: slotEligibleEnd,
      capacity: 5,
      bookedCount: 1,
      status: 'PUBLISHED',
    },
  });

  // 2. Slot Tujuan untuk Reschedule (6 hari ke depan)
  const slotTargetDate = new Date(Date.now() + 6 * 86_400_000);
  slotTargetDate.setHours(14, 0, 0, 0);
  const slotTargetEnd = new Date(slotTargetDate.getTime() + 3_600_000);

  const targetSlotEligible = await prisma.slotKelas.create({
    data: {
      id: randomUUID(),
      branchId: ggBranch.id,
      classTypeId: privateType.id,
      studioId: ggStudio?.id,
      startAt: slotTargetDate,
      endAt: slotTargetEnd,
      capacity: 5,
      bookedCount: 0,
      status: 'PUBLISHED',
    },
  });

  // Booking untuk Uji >= H-24
  const bookingEligible = await prisma.pemesananKelas.create({
    data: {
      id: randomUUID(),
      bookingNumber: `UAT-RESCH-OK-${Date.now().toString().slice(-4)}`,
      classSlotId: sourceSlotEligible.id,
      userId: amanda.id,
      customerPackageId: activePackage.id,
      status: 'BOOKED',
    },
  });

  // 3. Slot Sumber untuk Uji < H-24 (5 jam ke depan)
  const slotLateDate = new Date(Date.now() + 5 * 3_600_000);
  const slotLateEnd = new Date(slotLateDate.getTime() + 3_600_000);

  const sourceSlotLate = await prisma.slotKelas.create({
    data: {
      id: randomUUID(),
      branchId: ggBranch.id,
      classTypeId: privateType.id,
      studioId: ggStudio?.id,
      startAt: slotLateDate,
      endAt: slotLateEnd,
      capacity: 5,
      bookedCount: 1,
      status: 'PUBLISHED',
    },
  });

  // Booking untuk Uji < H-24
  const bookingLate = await prisma.pemesananKelas.create({
    data: {
      id: randomUUID(),
      bookingNumber: `UAT-RESCH-LATE-${Date.now().toString().slice(-4)}`,
      classSlotId: sourceSlotLate.id,
      userId: amanda.id,
      customerPackageId: activePackage.id,
      status: 'BOOKED',
    },
  });

  return {
    amanda,
    activePackage,
    bookingEligible,
    sourceSlotEligible,
    targetSlotEligible,
    bookingLate,
    sourceSlotLate,
  };
}

async function runUAT() {
  const fixtures = await setupFixtures();
  console.log(`✅ Data uji siap:`);
  console.log(`   - Booking >= H-24: ${fixtures.bookingEligible.bookingNumber} (${fixtures.bookingEligible.id})`);
  console.log(`   - Booking < H-24 : ${fixtures.bookingLate.bookingNumber} (${fixtures.bookingLate.id})`);

  const browser = await chromium.launch({ headless: true });
  const report = [];

  try {
    // =========================================================================
    // SKENARIO 1: ROLE CUSTOMER - RESCHEDULE MANDIRI >= H-24
    // =========================================================================
    console.log('\n=============================================================');
    console.log('▶ [SKENARIO 1: CUSTOMER] Reschedule Mandiri >= H-24');
    console.log('=============================================================');
    const contextCustomer = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pageCustomer = await contextCustomer.newPage();

    console.log('1.1 Login sebagai Amanda Member...');
    await pageCustomer.goto(`${BASE_URL}/sign-in`);
    await pageCustomer.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    }, { timeout: 15000 });
    await pageCustomer.fill('input[name="email"]', 'amanda.member@dailydose.test');
    await pageCustomer.fill('input[name="password"]', 'Customer123!');
    await pageCustomer.click('button[type="submit"]');
    await pageCustomer.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
    console.log('   ✅ Berhasil login sebagai Customer.');

    console.log(`1.2 Membuka tiket booking yang berhak reschedule (${fixtures.bookingEligible.id})...`);
    await pageCustomer.goto(`${BASE_URL}/bookings/${fixtures.bookingEligible.id}`);
    await pageCustomer.waitForSelector('h1', { timeout: 10000 });

    const rescheduleCardVisible = await pageCustomer.isVisible('text=Perlu mengganti jadwal?');
    console.log(`   - Kartu 'Perlu mengganti jadwal?': ${rescheduleCardVisible ? 'MUNCUL ✅' : 'TIDAK MUNCUL ❌'}`);

    const ajukanBtn = pageCustomer.locator('button:has-text("Ajukan reschedule")');
    await ajukanBtn.click();
    console.log('   - Tombol "Ajukan reschedule" diklik.');

    await pageCustomer.waitForSelector('form[aria-label="Pengajuan reschedule"]', { timeout: 5000 });
    console.log('   ✅ Form pengajuan reschedule terbuka.');

    // Pilih slot tujuan via SearchSelect combobox
    console.log('1.3 Memilih jadwal tujuan pada SearchSelect...');
    const targetCombobox = pageCustomer.locator('form[aria-label="Pengajuan reschedule"] input[role="combobox"]');
    await targetCombobox.click();
    await pageCustomer.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await pageCustomer.waitForSelector('[role="listbox"] [role="option"]', { timeout: 5000 });
    await pageCustomer.locator('[role="listbox"] [role="option"]').first().click();
    console.log('   ✅ Slot tujuan dipilih.');

    // Screenshot Form Pengajuan Terisi
    const screenshotFormPath = path.join(ARTIFACT_DIR, 'uat_01_customer_reschedule_form.png');
    await pageCustomer.screenshot({ path: screenshotFormPath, fullPage: true });
    console.log(`   📸 Screenshot form disimpan: ${screenshotFormPath}`);

    // Step 1: Tinjau Permintaan
    const tinjauBtn = pageCustomer.locator('button:has-text("Tinjau permintaan")');
    await tinjauBtn.click();
    console.log('   - Tombol "Tinjau permintaan" diklik.');

    await pageCustomer.waitForSelector('text=Konfirmasi perubahan jadwal', { timeout: 5000 });
    console.log('   ✅ Peringatan konfirmasi 2-langkah muncul.');

    // Screenshot Konfirmasi 2-Langkah
    const screenshotConfirmPath = path.join(ARTIFACT_DIR, 'uat_02_customer_confirm_dialog.png');
    await pageCustomer.screenshot({ path: screenshotConfirmPath, fullPage: true });
    console.log(`   📸 Screenshot konfirmasi disimpan: ${screenshotConfirmPath}`);

    // Step 2: Kirim Permintaan
    const kirimBtn = pageCustomer.locator('button:has-text("Kirim permintaan")');
    await kirimBtn.click();
    console.log('   - Tombol "Kirim permintaan" diklik.');

    await pageCustomer.waitForSelector('text=Permintaan berhasil dikirim', { timeout: 10000 });
    console.log('   ✅ Notifikasi sukses reschedule diterima!');

    // Screenshot Sukses Reschedule
    const screenshotSuccessPath = path.join(ARTIFACT_DIR, 'uat_03_customer_reschedule_success.png');
    await pageCustomer.screenshot({ path: screenshotSuccessPath, fullPage: true });
    console.log(`   📸 Screenshot sukses disimpan: ${screenshotSuccessPath}`);

    // Verifikasi database
    const updatedBooking = await prisma.pemesananKelas.findUnique({
      where: { id: fixtures.bookingEligible.id },
      include: { reschedules: true },
    });
    const moved =
      updatedBooking.classSlotId !== fixtures.sourceSlotEligible.id &&
      updatedBooking.reschedules.some((r) => r.status === 'APPROVED' && r.targetSlotId === updatedBooking.classSlotId);
    console.log(`   - Verifikasi DB: Booking berpindah dari slot awal ke slot baru: ${moved ? 'YA (SUKSES) ✅' : 'TIDAK ❌'}`);
    report.push({
      scenario: 'Customer Reschedule Mandiri (>= H-24)',
      result: moved ? 'PASSED' : 'FAILED',
      notes: `Booking ${fixtures.bookingEligible.bookingNumber} berpindah secara instan ke slot baru. Status reschedule APPROVED di ledger.`,
    });

    // =========================================================================
    // SKENARIO 2: ROLE CUSTOMER - PROTEKSI CUTOFF < H-24
    // =========================================================================
    console.log('\n=============================================================');
    console.log('▶ [SKENARIO 2: CUSTOMER] Proteksi Cutoff Reschedule < H-24');
    console.log('=============================================================');
    console.log(`2.1 Membuka tiket booking kelas darurat < H-24 (${fixtures.bookingLate.id})...`);
    await pageCustomer.goto(`${BASE_URL}/bookings/${fixtures.bookingLate.id}`);
    await pageCustomer.waitForSelector('h1', { timeout: 10000 });

    const cutoffNoticeVisible = await pageCustomer.isVisible('text=Batas reschedule telah lewat');
    console.log(`   - Peringatan 'Batas reschedule telah lewat': ${cutoffNoticeVisible ? 'MUNCUL ✅' : 'TIDAK MUNCUL ❌'}`);

    const reassuranceTextVisible = await pageCustomer.isVisible('text=Kursi Anda pada jadwal ini tetap aman');
    console.log(`   - Penegasan 'Kursi Anda tetap aman': ${reassuranceTextVisible ? 'MUNCUL ✅' : 'TIDAK MUNCUL ❌'}`);

    const hubungiStudioVisible = await pageCustomer.isVisible('a:has-text("Hubungi studio")');
    console.log(`   - Tombol 'Hubungi studio': ${hubungiStudioVisible ? 'TERSEDIA ✅' : 'TIDAK ADA ❌'}`);

    const canRequestSelf = await pageCustomer.isVisible('button:has-text("Ajukan reschedule")');
    console.log(`   - Form mandiri terkunci: ${!canRequestSelf ? 'TERKUNCI AMAN ✅' : 'BOCOR (DAPAT DIKLIK) ❌'}`);

    // Screenshot Cutoff Lock
    const screenshotCutoffPath = path.join(ARTIFACT_DIR, 'uat_04_customer_cutoff_locked.png');
    await pageCustomer.screenshot({ path: screenshotCutoffPath, fullPage: true });
    console.log(`   📸 Screenshot proteksi cutoff disimpan: ${screenshotCutoffPath}`);

    report.push({
      scenario: 'Customer Reschedule Cutoff Protection (< H-24)',
      result: cutoffNoticeVisible && !canRequestSelf && hubungiStudioVisible ? 'PASSED' : 'FAILED',
      notes: 'Peringatan H-24 dan jaminan kursi aman tampil dengan benar; tombol mandiri terkunci.',
    });

    await contextCustomer.close();

    // =========================================================================
    // SKENARIO 3: ROLE ADMIN - PENGAJUAN ADJUSTMENT DARURAT KARENA < H-24
    // =========================================================================
    console.log('\n=============================================================');
    console.log('▶ [SKENARIO 3: ADMIN STUDIO] Pengajuan Penyesuaian Sesi Darurat Medis');
    console.log('=============================================================');
    const contextAdmin = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pageAdmin = await contextAdmin.newPage();

    console.log('3.1 Login sebagai Admin Studio Green Garden (admin@ddose.com)...');
    await pageAdmin.goto(`${BASE_URL}/sign-in`);
    await pageAdmin.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    }, { timeout: 15000 });
    await pageAdmin.fill('input[name="email"]', 'admin@ddose.com');
    await pageAdmin.fill('input[name="password"]', 'Admin123!');
    await pageAdmin.click('button[type="submit"]');
    await pageAdmin.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
    console.log('   ✅ Berhasil login sebagai Admin Studio Green Garden.');

    console.log('3.2 Admin membuka menu Penyesuaian Sesi (/ledger/adjustments)...');
    await pageAdmin.goto(`${BASE_URL}/ledger/adjustments`);
    await pageAdmin.waitForSelector('h1', { timeout: 10000 });

    console.log('3.3 Mengajukan penyesuaian kompensasi 1 sesi untuk Amanda via API / session-adjustments...');
    const adjustRes = await pageAdmin.evaluate(async (pkgId) => {
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
    }, fixtures.activePackage.id);

    console.log(`   - Permohonan terdaftar ID: ${adjustRes.id}, Status: ${adjustRes.status}, Versi: ${adjustRes.version}`);

    // Refresh halaman dan capture tampilan antrean adjustment PENDING di mata Admin
    await pageAdmin.reload();
    await pageAdmin.waitForSelector('text=Menunggu keputusan', { timeout: 10000 });
    const screenshotAdminPending = path.join(ARTIFACT_DIR, 'uat_05_admin_pending_queue.png');
    await pageAdmin.screenshot({ path: screenshotAdminPending, fullPage: true });
    console.log(`   📸 Screenshot antrean admin disimpan: ${screenshotAdminPending}`);

    const adminRequested = adjustRes.status === 'PENDING' && Boolean(adjustRes.id);
    report.push({
      scenario: 'Admin Studio Pengajuan Emergency Compensation',
      result: adminRequested ? 'PASSED' : 'FAILED',
      notes: `Permohonan penyesuaian kompensasi dibuat dengan status PENDING (ID: ${adjustRes.id}). Menunggu persetujuan Manager.`,
    });

    await contextAdmin.close();

    // =========================================================================
    // SKENARIO 4: ROLE MANAGER - APPROVAL ADJUSTMENT SESI (SEPARATION OF DUTIES)
    // =========================================================================
    console.log('\n=============================================================');
    console.log('▶ [SKENARIO 4: STUDIO MANAGER] Persetujuan Penyesuaian Sesi');
    console.log('=============================================================');
    const contextManager = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pageManager = await contextManager.newPage();

    console.log('4.1 Login sebagai Studio Manager (manager.gg@dailydose.test)...');
    await pageManager.goto(`${BASE_URL}/sign-in`);
    await pageManager.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    }, { timeout: 15000 });
    await pageManager.fill('input[name="email"]', 'manager.gg@dailydose.test');
    await pageManager.fill('input[name="password"]', 'Manager123!');
    await pageManager.click('button[type="submit"]');
    await pageManager.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
    console.log('   ✅ Berhasil login sebagai Studio Manager.');

    console.log('4.2 Manager membuka daftar penyesuaian sesi (/ledger/adjustments)...');
    await pageManager.goto(`${BASE_URL}/ledger/adjustments`);
    await pageManager.waitForSelector('h1', { timeout: 10000 });

    console.log(`4.3 Manager melihat permohonan penyesuaian ${adjustRes.id} dan membuka modal approval...`);
    const setujuiBtn = pageManager.locator('button:has-text("Setujui")').first();
    if (await setujuiBtn.isVisible()) {
      await setujuiBtn.click();
      await pageManager.waitForSelector('text=Persetujuan penyesuaian', { timeout: 5000 });
      const screenshotManagerModal = path.join(ARTIFACT_DIR, 'uat_06_manager_approval_modal.png');
      await pageManager.screenshot({ path: screenshotManagerModal });
      console.log(`   📸 Screenshot modal approval disimpan: ${screenshotManagerModal}`);
    }

    console.log(`4.4 Manager menyetujui (Approve) permohonan penyesuaian ${adjustRes.id}...`);
    const approveRes = await pageManager.evaluate(async ({ adjId, version }) => {
      const res = await fetch(`/api/v1/session-adjustments/${adjId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reasonCode: 'CORRECTION_VERIFIED',
          note: 'Disetujui berdasarkan surat dokter resmi dari member.',
          expectedVersion: version,
        }),
      });
      return res.json();
    }, { adjId: adjustRes.id, version: adjustRes.version ?? 1 });

    const postedStatus = approveRes.adjustment?.status ?? approveRes.status;
    console.log(`   - Hasil persetujuan Manager: Status: ${postedStatus}`);
    const approved = postedStatus === 'POSTED' || postedStatus === 'APPROVED';

    // Reload dan ambil screenshot status POSTED di riwayat
    await pageManager.goto(`${BASE_URL}/ledger/adjustments?status=HISTORY`);
    await pageManager.waitForSelector('h1', { timeout: 10000 });
    const screenshotManagerPosted = path.join(ARTIFACT_DIR, 'uat_07_manager_adjustment_posted.png');
    await pageManager.screenshot({ path: screenshotManagerPosted, fullPage: true });
    console.log(`   📸 Screenshot riwayat POSTED disimpan: ${screenshotManagerPosted}`);

    // Verifikasi saldo Amanda bertambah di database
    const pkgAfter = await prisma.paketPelanggan.findUnique({
      where: { id: fixtures.activePackage.id },
    });
    console.log(`   - Saldo sesi Amanda sebelum: ${fixtures.activePackage.remainingSessions}, sesudah: ${pkgAfter.remainingSessions}`);

    report.push({
      scenario: 'Studio Manager Approval & Ledger Posting',
      result: approved && pkgAfter.remainingSessions === fixtures.activePackage.remainingSessions + 1 ? 'PASSED' : 'FAILED',
      notes: `Permohonan disetujui (POSTED). Saldo sesi paket Amanda bertambah 1 sesi secara otomatis di ledger.`,
    });

    await contextManager.close();

    console.log('\n=============================================================');
    console.log('📊 RINGKASAN HASIL UAT RESCHEDULE MATRIX:');
    console.log('=============================================================');
    console.table(report);
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runUAT().catch((err) => {
  console.error('❌ UAT Gagal:', err);
  process.exit(1);
});
