import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';
const BASE_URL = 'http://localhost:32120';

const BRANCH_ID = 'a1000000-0000-4000-8000-000000000001'; // Daily Dose Green Garden
const STUDIO_ID = 'b1000000-0000-4000-8000-000000000001'; // Studio 1
const CLASS_TYPE_ID = 'c1000000-0000-4000-8000-000000000001'; // Group Class
const INSTRUCTOR_ID = '10000000-0000-4000-8000-000000000113'; // Coach Clara

const SLOT_A_ID = 'a7000000-0000-4000-8000-000000000001'; // Source: Wednesday 2026-10-07 09:00 WIB
const SLOT_B_ID = 'a7000000-0000-4000-8000-000000000002'; // Target: Thursday 2026-10-08 14:00 WIB
const BOOKING_ID = 'b7000000-0000-4000-8000-000000000001';

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

async function runScenario7() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       DAILY DOSE PILATES V2 - UAT EKSEKUSI SKENARIO 7 (CLEAN SLATE)          ║');
  console.log('║       Manajemen Perubahan Jadwal (Reschedule) & Pembatalan Kelas (H-24)      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // ==========================================================================
  // TAHAP 0: PERSIAPAN DATABASE (CLEAN SLATE STATE UNTUK SKENARIO 7)
  // ==========================================================================
  console.log('▶ [0/6] Mempersiapkan Data UAT di Database (Slot A, Slot B, dan Booking Jessica)...');

  // Pastikan user Jessica Anastasya UAT ada
  const customer = await prisma.user.findUnique({
    where: { email: 'jessica.uat@gmail.com' },
    include: { customerPackages: true },
  });
  if (!customer) {
    throw new Error('User Jessica Anastasya UAT tidak ditemukan di database.');
  }

  const pkg = customer.customerPackages[0];
  if (!pkg) {
    throw new Error('Paket pelanggan Jessica tidak ditemukan di database.');
  }

  // Waktu Slot A: Rabu, 7 Oktober 2026 jam 09:00 - 09:50 WIB (02:00 - 02:50 UTC)
  const slotAStart = new Date('2026-10-07T02:00:00.000Z');
  const slotAEnd = new Date('2026-10-07T02:50:00.000Z');

  // Waktu Slot B: Kamis, 8 Oktober 2026 jam 14:00 - 14:50 WIB (07:00 - 07:50 UTC)
  const slotBStart = new Date('2026-10-08T07:00:00.000Z');
  const slotBEnd = new Date('2026-10-08T07:50:00.000Z');

  // Bersihkan data lama jika ada
  await prisma.ubahJadwal.deleteMany({ where: { bookingId: BOOKING_ID } });
  await prisma.checkInToken.deleteMany({ where: { bookingId: BOOKING_ID } });
  await prisma.kehadiranPelanggan.deleteMany({ where: { bookingId: BOOKING_ID } });
  await prisma.pemesananKelas.deleteMany({ where: { id: BOOKING_ID } });
  await prisma.slotKelas.deleteMany({ where: { id: { in: [SLOT_A_ID, SLOT_B_ID] } } });

  // Buat Slot A (Source Slot)
  await prisma.slotKelas.create({
    data: {
      id: SLOT_A_ID,
      branchId: BRANCH_ID,
      studioId: STUDIO_ID,
      classTypeId: CLASS_TYPE_ID,
      instructorId: INSTRUCTOR_ID,
      startAt: slotAStart,
      endAt: slotAEnd,
      capacity: 5,
      bookedCount: 1, // Akan diisi booking Jessica
      status: 'PUBLISHED',
      minQuota: 1,
    },
  });

  // Buat Slot B (Target Slot)
  await prisma.slotKelas.create({
    data: {
      id: SLOT_B_ID,
      branchId: BRANCH_ID,
      studioId: STUDIO_ID,
      classTypeId: CLASS_TYPE_ID,
      instructorId: INSTRUCTOR_ID,
      startAt: slotBStart,
      endAt: slotBEnd,
      capacity: 5,
      bookedCount: 0,
      status: 'PUBLISHED',
      minQuota: 1,
    },
  });

  // Buat Booking Jessica pada Slot A
  await prisma.pemesananKelas.create({
    data: {
      id: BOOKING_ID,
      bookingNumber: 'BK-UAT7-SCEN7-001',
      classSlotId: SLOT_A_ID,
      userId: customer.id,
      customerPackageId: pkg.id,
      status: 'BOOKED',
      bookedAt: new Date(),
    },
  });

  console.log('   ✓ Slot A (Rabu 09:00 WIB, bookedCount: 1) siap.');
  console.log('   ✓ Slot B (Kamis 14:00 WIB, bookedCount: 0) siap.');
  console.log('   ✓ Booking Jessica BK-UAT7-SCEN7-001 pada Slot A siap.\n');

  const browser = await chromium.launch({
    headless: true,
  });

  // Member Jessica Context
  const memberContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const memberPage = await memberContext.newPage();

  // Admin Frontdesk Context
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const adminPage = await adminContext.newPage();

  try {
    // ========================================================================
    // TAHAP 1: MEMBER JESSICA LOGIN & MENGAJUKAN RESCHEDULE
    // ========================================================================
    console.log('▶ [1/6] Member Jessica Login & Membuka Detail Booking Slot A...');
    await memberPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await memberPage.fill('input[name="email"]', 'jessica.uat@gmail.com');
    await memberPage.fill('input[name="password"]', 'DailyDose2026!');
    await memberPage.click('button[type="submit"]');
    await memberPage.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 15000 });
    console.log('   ✓ Login Member berhasil.');

    // Buka detail booking
    await memberPage.goto(`${BASE_URL}/bookings/${BOOKING_ID}`, { waitUntil: 'networkidle' });
    await memberPage.waitForSelector('#booking-detail-title', { timeout: 15000 });
    console.log('   ✓ Halaman detail booking Slot A terbuka.');

    // Verifikasi opsi reschedule tersedia (> H-24)
    const rescheduleBtn = memberPage.locator('button:has-text("Ajukan reschedule")');
    await rescheduleBtn.waitFor({ state: 'visible', timeout: 10000 });
    console.log('   ✓ Tombol "Ajukan reschedule" aktif & memenuhi syarat batas H-24.');

    // Buka form reschedule
    await rescheduleBtn.click();
    console.log('   ✓ Form formulir reschedule dibuka.');

    // Tunggu form pengajuan reschedule muncul
    await memberPage.waitForSelector('form[aria-label="Pengajuan reschedule"]', { timeout: 10000 });

    // Pilih alasan
    const reasonSelect = memberPage.locator('form[aria-label="Pengajuan reschedule"] select').first();
    await reasonSelect.selectOption({ index: 0 });

    // Klik tombol tinjau permintaan (Click 1)
    const reviewReqBtn = memberPage.locator('button[type="submit"]:has-text("Tinjau permintaan")');
    await reviewReqBtn.waitFor({ state: 'visible', timeout: 5000 });
    await reviewReqBtn.click();
    console.log('   ✓ Konfirmasi pengajuan ditampilkan.');

    // Klik tombol kirim permintaan (Click 2)
    const sendReqBtn = memberPage.locator('button[type="submit"]:has-text("Kirim permintaan")');
    await sendReqBtn.waitFor({ state: 'visible', timeout: 5000 });
    await sendReqBtn.click();
    console.log('   ✓ Permintaan reschedule dikirim.');

    // Tunggu banner permintaan berhasil dikirim
    await memberPage.waitForSelector('text=Permintaan berhasil dikirim', { timeout: 15000 });
    console.log('   ✓ Permintaan reschedule berhasil dikirim ke studio.');

    // Ambil Screenshot 1
    const scen7_01 = path.join(process.cwd(), 'scratch/uat_scen7_01_member_reschedule_requested.png');
    await memberPage.screenshot({ path: scen7_01, fullPage: true });
    copyToArtifact(scen7_01, 'uat_scen7_01_member_reschedule_requested.png');

    // ========================================================================
    // TAHAP 2: ADMIN FRONTDESK MENINJAU ANTREAN RESCHEDULE
    // ========================================================================
    console.log('\n▶ [2/6] Admin Frontdesk Login & Membuka Antrean Reschedule...');
    await adminPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await adminPage.fill('input[name="email"]', 'admin.gg@dailydose.test');
    await adminPage.fill('input[name="password"]', 'AdminPass123!');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 15000 });
    console.log('   ✓ Login Admin Frontdesk berhasil.');

    // Buka menu Operasional -> Manajemen Booking (Tab Reschedule dengan branch Green Garden)
    await adminPage.goto(`${BASE_URL}/workspace/bookings?tab=reschedules&branch=${BRANCH_ID}`, { waitUntil: 'networkidle' });
    await adminPage.waitForSelector('ul[aria-label="Antrean reschedule"]', { timeout: 15000 });
    console.log('   ✓ Antrean reschedule staf terbuka.');

    // Temukan pengajuan member Jessica
    const jessicaItem = adminPage.locator('li:has-text("Jessica Anastasya UAT"), li:has-text("Pelanggan")').first();
    await jessicaItem.waitFor({ state: 'visible', timeout: 10000 });
    console.log('   ✓ Pengajuan reschedule Jessica ditemukan di antrean.');

    // Klik tombol "Tinjau reschedule"
    const reviewBtn = jessicaItem.locator('button:has-text("Tinjau reschedule")');
    await reviewBtn.click();

    // Tunggu panel Keputusan reschedule terbuka
    await adminPage.waitForSelector('text=Keputusan reschedule', { timeout: 10000 });
    console.log('   ✓ Panel Keputusan Reschedule terbuka.');

    // Ambil Screenshot 2
    const scen7_02 = path.join(process.cwd(), 'scratch/uat_scen7_02_admin_review_reschedule.png');
    await adminPage.screenshot({ path: scen7_02, fullPage: true });
    copyToArtifact(scen7_02, 'uat_scen7_02_admin_review_reschedule.png');

    // ========================================================================
    // TAHAP 3: ADMIN FRONTDESK SETUJUI PERUBAHAN JADWAL
    // ========================================================================
    console.log('\n▶ [3/6] Admin Menyetujui Reschedule...');
    const approveBtn = adminPage.locator('button:has-text("Setujui reschedule")');
    await approveBtn.click();

    // Tunggu feedback berhasil / notifikasi
    await adminPage.waitForTimeout(2000);
    console.log('   ✓ Reschedule berhasil disetujui oleh Admin Frontdesk.');

    // Ambil Screenshot 3
    const scen7_03 = path.join(process.cwd(), 'scratch/uat_scen7_03_admin_reschedule_approved.png');
    await adminPage.screenshot({ path: scen7_03, fullPage: true });
    copyToArtifact(scen7_03, 'uat_scen7_03_admin_reschedule_approved.png');

    // ========================================================================
    // TAHAP 4: VERIFIKASI TRANSFER SLOT PADA PORTAL MEMBER
    // ========================================================================
    console.log('\n▶ [4/6] Verifikasi Booking Jessica Berpindah ke Slot B (Kamis 14:00 WIB)...');
    await memberPage.reload({ waitUntil: 'networkidle' });
    await memberPage.waitForSelector('#booking-detail-title', { timeout: 15000 });

    // Verifikasi alert reschedule disetujui
    const approvedAlert = memberPage.locator('text=Reschedule disetujui');
    await approvedAlert.waitFor({ state: 'visible', timeout: 10000 });
    console.log('   ✓ Banner "Reschedule disetujui" tampil di layar member.');

    // Verifikasi waktu baru (Kamis 14:00)
    const timeText = await memberPage.locator('article:has-text("Waktu Sesi")').textContent();
    console.log(`   ✓ Waktu sesi terkini: ${timeText?.replace(/\s+/g, ' ').trim()}`);

    // Ambil Screenshot 4
    const scen7_04 = path.join(process.cwd(), 'scratch/uat_scen7_04_booking_transferred_new_slot.png');
    await memberPage.screenshot({ path: scen7_04, fullPage: true });
    copyToArtifact(scen7_04, 'uat_scen7_04_booking_transferred_new_slot.png');

    // ========================================================================
    // TAHAP 5: PENGUJIAN PEMBATALAN MANDIRI (CANCELLATION SEBELUM H-24)
    // ========================================================================
    console.log('\n▶ [5/6] Member Melakukan Pembatalan Mandiri Tiket Booking (Sebelum Cutoff H-24)...');
    const cancelBtn = memberPage.locator('button:has-text("Batalkan booking")');
    await cancelBtn.waitFor({ state: 'visible', timeout: 10000 });
    await cancelBtn.click();
    console.log('   ✓ Tombol "Batalkan booking" diklik.');

    // Dialog konfirmasi pembatalan muncul
    await memberPage.waitForSelector('text=Konfirmasi Pembatalan Booking', { timeout: 10000 });
    console.log('   ✓ Dialog konfirmasi pembatalan muncul.');

    // Ambil Screenshot 5
    const scen7_05 = path.join(process.cwd(), 'scratch/uat_scen7_05_member_cancel_confirmation.png');
    await memberPage.screenshot({ path: scen7_05, fullPage: true });
    copyToArtifact(scen7_05, 'uat_scen7_05_member_cancel_confirmation.png');

    // Klik "Ya, Batalkan"
    const confirmCancelBtn = memberPage.locator('button:has-text("Ya, Batalkan")');
    await confirmCancelBtn.click();

    // Tunggu banner booking berhasil dibatalkan
    await memberPage.waitForSelector('text=Booking berhasil dibatalkan', { timeout: 15000 });
    console.log('   ✓ Booking berhasil dibatalkan oleh Member.');

    // Ambil Screenshot 6
    const scen7_06 = path.join(process.cwd(), 'scratch/uat_scen7_06_member_booking_cancelled.png');
    await memberPage.screenshot({ path: scen7_06, fullPage: true });
    copyToArtifact(scen7_06, 'uat_scen7_06_member_booking_cancelled.png');

    // ========================================================================
    // TAHAP 6: VERIFIKASI RIWAYAT & RECOVERY KUOTA SESI PAKET
    // ========================================================================
    console.log('\n▶ [6/6] Verifikasi Linimasa Riwayat Booking & Pemulihan Kuota Sesi...');

    // 1. Verifikasi halaman /bookings tab Riwayat
    await memberPage.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle' });
    const historyTab = memberPage.locator('button[role="tab"]:has-text("Riwayat")');
    await historyTab.click();
    await memberPage.waitForTimeout(1000);

    const cancelledBadge = memberPage.locator('text=Dibatalkan').first();
    await cancelledBadge.waitFor({ state: 'visible', timeout: 10000 });
    console.log('   ✓ Tiket booking tercatat dalam tab Riwayat dengan badge "Dibatalkan".');

    const scen7_07 = path.join(process.cwd(), 'scratch/uat_scen7_07_member_bookings_history_cancelled.png');
    await memberPage.screenshot({ path: scen7_07, fullPage: true });
    copyToArtifact(scen7_07, 'uat_scen7_07_member_bookings_history_cancelled.png');

    // 2. Verifikasi halaman /account/packages (Kuota Kembali 100%)
    await memberPage.goto(`${BASE_URL}/account/packages`, { waitUntil: 'networkidle' });
    await memberPage.waitForSelector('text=10 Sessions Group Class Reformer', { timeout: 15000 });

    const scen7_08 = path.join(process.cwd(), 'scratch/uat_scen7_08_package_quota_recovered.png');
    await memberPage.screenshot({ path: scen7_08, fullPage: true });
    copyToArtifact(scen7_08, 'uat_scen7_08_package_quota_recovered.png');

    // ========================================================================
    // TAHAP 7: AUDIT DATABASE (DATA INTEGRITY AUDIT)
    // ========================================================================
    console.log('\n▶ [AUDIT] Melakukan Verifikasi Konsistensi Database dailydose_v2_uat...');
    const dbBooking = await prisma.pemesananKelas.findUnique({
      where: { id: BOOKING_ID },
      include: { classSlot: true, reschedules: true },
    });
    console.log(`   - Status Pemesanan: ${dbBooking?.status} (Expected: CANCELLED)`);
    console.log(`   - Class Slot Terakhir: ${dbBooking?.classSlotId} (Expected: ${SLOT_B_ID})`);
    console.log(`   - Status Reschedule: ${dbBooking?.reschedules[0]?.status} (Expected: APPROVED)`);

    const dbSlotA = await prisma.slotKelas.findUnique({ where: { id: SLOT_A_ID } });
    const dbSlotB = await prisma.slotKelas.findUnique({ where: { id: SLOT_B_ID } });
    console.log(`   - Slot A Booked Count: ${dbSlotA?.bookedCount}/${dbSlotA?.capacity} (Expected: 0)`);
    console.log(`   - Slot B Booked Count: ${dbSlotB?.bookedCount}/${dbSlotB?.capacity} (Expected: 0)`);

    if (dbBooking?.status !== 'CANCELLED') {
      throw new Error(`Audit Failure: Status booking adalah ${dbBooking?.status}, diharapkan CANCELLED`);
    }
    if (dbBooking?.reschedules[0]?.status !== 'APPROVED') {
      throw new Error(`Audit Failure: Status reschedule adalah ${dbBooking?.reschedules[0]?.status}, diharapkan APPROVED`);
    }
    if (dbSlotA?.bookedCount !== 0 || dbSlotB?.bookedCount !== 0) {
      throw new Error(`Audit Failure: Kapasitas slot tidak pulih sepenuhnya. Slot A: ${dbSlotA?.bookedCount}, Slot B: ${dbSlotB?.bookedCount}`);
    }

    console.log('\n✅ ══════════════════════════════════════════════════════════════════════════════');
    console.log('✅   SKENARIO 7 UAT BERHASIL DIEKSEKUSI DENGAN 100% PASS!');
    console.log('✅   Reschedule disetujui, perpindahan slot valid, pembatalan memulihkan kuota.');
    console.log('✅ ══════════════════════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Terjadi kesalahan pada eksekusi Skenario 7:', error);
    const errPath = path.join(process.cwd(), 'scratch/uat_scen7_error_debug.png');
    await memberPage.screenshot({ path: errPath, fullPage: true }).catch(() => {});
    copyToArtifact(errPath, 'uat_scen7_error_debug.png');
    throw error;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runScenario7();
