import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';
const BASE_URL = 'http://localhost:32120';
const SLOT_ID = 'b626ca6b-005e-4b4f-b0d6-ec3e05e92f36';
const BOOKING_ID = '21d3d612-51e3-4c6b-b991-f5b7b8b5ac21';

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

async function runScenario6() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       DAILY DOSE PILATES V2 - UAT EKSEKUSI SKENARIO 6 (CLEAN SLATE)          ║');
  console.log('║       Presensi Studio via QR Scanner & Resepsionis (Operational Check-In)    ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  // ==========================================================================
  // TAHAP 0: PERSIAPAN WINDOW JADWAL & STATUS KELAS DI DATABASE
  // ==========================================================================
  console.log('▶ [0/6] Mempersiapkan Jendela Presensi Studio (Slot CONFIRMED & Window Aktif)...');
  const now = new Date();
  const startAt = new Date(now.getTime() + 10 * 60_000); // 10 menit ke depan
  const endAt = new Date(now.getTime() + 60 * 60_000);   // 60 menit ke depan

  // Reset state presensi jika pengujian diulang
  await prisma.kehadiranPelanggan.deleteMany({ where: { bookingId: BOOKING_ID } });
  await prisma.pemesananKelas.update({ where: { id: BOOKING_ID }, data: { status: 'BOOKED' } });
  await prisma.kehadiranInstruktur.deleteMany({ where: { classSlotId: SLOT_ID } });
  await prisma.instructorCheckInToken.deleteMany({ where: { classSlotId: SLOT_ID } });

  // Update status slot menjadi CONFIRMED dan startAt dalam 30 menit window
  await prisma.slotKelas.update({
    where: { id: SLOT_ID },
    data: {
      status: 'CONFIRMED',
      startAt,
      endAt,
    },
  });

  // Perpanjang masa berlaku token check-in Jessica
  await prisma.checkInToken.updateMany({
    where: { bookingId: BOOKING_ID },
    data: { isUsed: false, expiresAt: endAt },
  });

  console.log('   ✓ Status slot kelas berhasil diperbarui ke CONFIRMED dengan jendela check-in aktif.');

  const browser = await chromium.launch({
    headless: true,
  });

  // 1. Context untuk Member Jessica
  const memberContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const memberPage = await memberContext.newPage();

  // 2. Context untuk Admin Frontdesk
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const adminPage = await adminContext.newPage();

  // 3. Context untuk Coach Clara
  const coachContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const coachPage = await coachContext.newPage();

  let customerQrPayload = '';
  let instructorQrPayload = '';

  try {
    // ========================================================================
    // TAHAP 1: MEMBER JESSICA BUKA TIKET & PASS CHECK-IN STUDIO
    // ========================================================================
    console.log('\n▶ [1/6] Login Member Jessica & Mengambil Pass QR Check-in...');
    await memberPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await memberPage.fill('input[name="email"]', 'jessica.uat@gmail.com');
    await memberPage.fill('input[name="password"]', 'DailyDose2026!');
    await memberPage.click('button[type="submit"]');
    await memberPage.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 10000 });

    // Intercept response issue check-in untuk mengambil token payload
    memberPage.on('response', async (response) => {
      if (response.url().includes('/customer-check-in-links') && response.status() === 200) {
        try {
          const body = await response.json();
          if (body.qrPayload) {
            customerQrPayload = body.qrPayload;
          }
        } catch {}
      }
    });

    console.log(`   Membuka Halaman Tiket Booking (/bookings/${BOOKING_ID})...`);
    await memberPage.goto(`${BASE_URL}/bookings/${BOOKING_ID}`, { waitUntil: 'networkidle' });
    await memberPage.waitForSelector('canvas', { timeout: 10000 });
    await memberPage.waitForTimeout(2000);

    const memberQrScreenshot = path.join(process.cwd(), 'scratch/uat_scen6_01_member_qr_pass_screen.png');
    await memberPage.screenshot({ path: memberQrScreenshot, fullPage: false });
    copyToArtifact(memberQrScreenshot, 'uat_scen6_01_member_qr_pass_screen.png');

    // Jika payload belum tertangkap via event, ambil dari link pass URL
    if (!customerQrPayload) {
      const passUrl = await memberPage.getAttribute('a:has-text("Buka tampilan QR layar penuh")', 'href');
      if (passUrl && passUrl.includes('#token=')) {
        customerQrPayload = decodeURIComponent(passUrl.split('#token=')[1]);
      }
    }
    console.log(`   ✓ Pass QR Check-in aktif tampil di layar member (Payload: ${customerQrPayload}).`);

    // ========================================================================
    // TAHAP 2: ADMIN FRONTDESK BUKA SCANNER DI /check-in-scanner
    // ========================================================================
    console.log('\n▶ [2/6] Login Admin Frontdesk (admin.gg@dailydose.test) & Buka Scanner...');
    await adminPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await adminPage.fill('input[name="email"]', 'admin.gg@dailydose.test');
    await adminPage.fill('input[name="password"]', 'AdminPass123!');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 10000 });

    console.log('   Membuka Halaman Scanner Presensi (/check-in-scanner)...');
    await adminPage.goto(`${BASE_URL}/check-in-scanner`, { waitUntil: 'networkidle' });
    await adminPage.waitForSelector('h1:has-text("Scan QR check-in")', { timeout: 10000 });
    await adminPage.waitForTimeout(1500);

    const scannerInitScreenshot = path.join(process.cwd(), 'scratch/uat_scen6_02_admin_checkin_scanner_ready.png');
    await adminPage.screenshot({ path: scannerInitScreenshot, fullPage: false });
    copyToArtifact(scannerInitScreenshot, 'uat_scen6_02_admin_checkin_scanner_ready.png');
    console.log('   ✓ Antarmuka Scanner Presensi Studio siap (Kamera + Fallback Manual).');

    // ========================================================================
    // TAHAP 3: ADMIN INPUT MANUAL QR PASS PELANGGAN & VALIDASI
    // ========================================================================
    console.log('\n▶ [3/6] Memindai / Memvalidasi Check-in Member Jessica...');
    console.log(`   Memasukkan QR Token Pelanggan: ${customerQrPayload}...`);
    await adminPage.fill('textarea[aria-label="Token QR manual"]', customerQrPayload);
    await adminPage.waitForTimeout(500);

    const submitBtn = adminPage.getByRole('button', { name: /Validasi check-in/i });
    await submitBtn.click();

    // Tunggu pesan "Check-in berhasil" muncul
    await adminPage.waitForSelector('text=Check-in berhasil', { timeout: 10000 });
    await adminPage.waitForTimeout(2000);

    const customerSuccessScreenshot = path.join(process.cwd(), 'scratch/uat_scen6_03_customer_checkin_success.png');
    await adminPage.screenshot({ path: customerSuccessScreenshot, fullPage: false });
    copyToArtifact(customerSuccessScreenshot, 'uat_scen6_03_customer_checkin_success.png');
    console.log('   ✓ Check-in Member Jessica Berhasil! Kehadiran tercatat resmi di studio.');

    // ========================================================================
    // TAHAP 4: VERIFIKASI STATUS TIKET MEMBER MENJADI ATTENDED (HADIR)
    // ========================================================================
    console.log('\n▶ [4/6] Verifikasi Status Tiket Member (/bookings & /bookings/[id])...');
    // Cek detail tiket langsung
    await memberPage.goto(`${BASE_URL}/bookings/${BOOKING_ID}`, { waitUntil: 'networkidle' });
    await memberPage.waitForSelector('text=Hadir', { timeout: 10000 });
    await memberPage.waitForTimeout(1500);

    // Cek juga daftar booking tab Riwayat
    await memberPage.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle' });
    const historyTab = memberPage.getByRole('tab', { name: /Riwayat/i });
    if (await historyTab.isVisible()) {
      await historyTab.click();
      await memberPage.waitForTimeout(1500);
    }

    const memberAttendedScreenshot = path.join(process.cwd(), 'scratch/uat_scen6_04_member_booking_attended.png');
    await memberPage.screenshot({ path: memberAttendedScreenshot, fullPage: false });
    copyToArtifact(memberAttendedScreenshot, 'uat_scen6_04_member_booking_attended.png');
    console.log('   ✓ Status tiket member Jessica terverifikasi: Hadir (ATTENDED).');

    // ========================================================================
    // TAHAP 5: PRESENSI INSTRUKTUR (COACH CLARA)
    // ========================================================================
    console.log('\n▶ [5/6] Menerbitkan QR Presensi Instruktur & Mencatat Kehadiran Coach Clara...');

    // Admin menerbitkan QR Token Instruktur via direct API call (idempotent & bulletproof)
    const issueRes = await adminPage.request.post(
      `${BASE_URL}/api/v1/class-slots/${SLOT_ID}/instructor-check-in-tokens`,
      {
        headers: { 'idempotency-key': `inst-issue-${Date.now()}` },
      }
    );
    if (issueRes.ok()) {
      const json = await issueRes.json();
      instructorQrPayload = json.qrPayload;
      console.log('   ✓ Token QR Presensi Instruktur Diterbitkan:', instructorQrPayload);
    }

    // Admin membuka Timetable Kelas di Workspace untuk visualisasi drawer
    console.log('   Admin membuka Timetable Kelas (/workspace/classes)...');
    await adminPage.goto(`${BASE_URL}/workspace/classes`, { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(2000);

    const branchCombobox = adminPage.getByRole('combobox', { name: 'Cabang aktif' });
    if (await branchCombobox.isVisible()) {
      await branchCombobox.click();
      await adminPage.waitForTimeout(500);
      const ggOption = adminPage.getByRole('option', { name: /Green Garden/i }).first();
      await ggOption.click();
      await adminPage.waitForTimeout(2000);
    }

    // Klik slot Group Class jika ada di layar
    const slotCard = adminPage.locator('button', { hasText: /Group Class/i }).first();
    if (await slotCard.isVisible()) {
      await slotCard.click();
      await adminPage.waitForTimeout(1500);
    }

    const instructorQrScreenshot = path.join(process.cwd(), 'scratch/uat_scen6_05_instructor_qr_issued.png');
    await adminPage.screenshot({ path: instructorQrScreenshot, fullPage: false });
    copyToArtifact(instructorQrScreenshot, 'uat_scen6_05_instructor_qr_issued.png');

    // Login Coach Clara untuk mencatat presensi mandiri
    console.log('   Login Coach Clara (coach.clara@dailydose.test)...');
    await coachPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await coachPage.fill('input[name="email"]', 'coach.clara@dailydose.test');
    await coachPage.fill('input[name="password"]', 'CoachPass123!');
    await coachPage.click('button[type="submit"]');
    await coachPage.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 10000 });

    console.log('   Coach Clara membuka Scanner Presensi (/check-in-scanner)...');
    await coachPage.goto(`${BASE_URL}/check-in-scanner`, { waitUntil: 'networkidle' });
    await coachPage.waitForTimeout(1500);

    // Switch ke mode QR presensi instruktur jika tombol tersedia
    const instModeBtn = coachPage.getByRole('button', { name: /QR presensi instruktur/i });
    if (await instModeBtn.isVisible()) {
      await instModeBtn.click();
      await coachPage.waitForTimeout(1000);
    }

    console.log(`   Coach Clara memasukkan token presensi instruktur: ${instructorQrPayload}...`);
    await coachPage.fill('textarea[aria-label="Token QR manual"]', instructorQrPayload);
    await coachPage.waitForTimeout(500);

    const recordAttendanceBtn = coachPage.getByRole('button', { name: /Catat presensi/i });
    await recordAttendanceBtn.click();

    await coachPage.waitForSelector('text=Presensi instruktur tercatat', { timeout: 10000 });
    await coachPage.waitForTimeout(2000);

    const instructorSuccessScreenshot = path.join(process.cwd(), 'scratch/uat_scen6_06_instructor_checkin_success.png');
    await coachPage.screenshot({ path: instructorSuccessScreenshot, fullPage: false });
    copyToArtifact(instructorSuccessScreenshot, 'uat_scen6_06_instructor_checkin_success.png');
    console.log('   ✓ Presensi Instruktur Coach Clara berhasil tercatat resmi.');

    // ========================================================================
    // TAHAP 6: AUDIT DATABASE PRESENSI & OPERASIONAL HARIAN
    // ========================================================================
    console.log('\n▶ [6/6] Melakukan Audit Database dailydose_v2_uat...');
    const updatedBooking = await prisma.pemesananKelas.findUnique({
      where: { id: BOOKING_ID },
      include: { attendance: true, user: true, classSlot: true },
    });

    const customerAttendance = await prisma.kehadiranPelanggan.findUnique({
      where: { bookingId: BOOKING_ID },
    });

    const instructorAttendance = await prisma.kehadiranInstruktur.findUnique({
      where: { classSlotId: SLOT_ID },
      include: { instructor: true },
    });

    const usedCustomerToken = await prisma.checkInToken.findFirst({
      where: { bookingId: BOOKING_ID },
      orderBy: { createdAt: 'desc' },
    });

    const usedInstructorToken = await prisma.instructorCheckInToken.findFirst({
      where: { classSlotId: SLOT_ID },
      orderBy: { createdAt: 'desc' },
    });

    console.log('\n--- HASIL AUDIT DATABASE PRESENSI STUDIO ---');
    console.log('BOOKING STATUS:', {
      id: updatedBooking?.id,
      bookingNumber: updatedBooking?.bookingNumber,
      status: updatedBooking?.status,
      customerName: updatedBooking?.user?.displayName,
      hasAttendanceRecord: Boolean(updatedBooking?.attendance),
    });

    console.log('KEHADIRAN PELANGGAN:', {
      id: customerAttendance?.id,
      bookingId: customerAttendance?.bookingId,
      method: customerAttendance?.method,
      checkedInAt: customerAttendance?.checkedInAt,
    });

    console.log('KEHADIRAN INSTRUKTUR:', {
      id: instructorAttendance?.id,
      classSlotId: instructorAttendance?.classSlotId,
      instructorName: instructorAttendance?.instructor?.displayName,
      method: instructorAttendance?.method,
      checkedInAt: instructorAttendance?.checkedInAt,
    });

    console.log('CUSTOMER CHECK-IN TOKEN USAGE:', {
      id: usedCustomerToken?.id,
      isUsed: usedCustomerToken?.isUsed,
      expiresAt: usedCustomerToken?.expiresAt,
    });

    console.log('INSTRUCTOR CHECK-IN TOKEN USAGE:', {
      id: usedInstructorToken?.id,
      usedAt: usedInstructorToken?.usedAt,
      expiresAt: usedInstructorToken?.expiresAt,
    });

    console.log('\n✅ SKENARIO 6 BERHASIL DIEKSEKUSI DENGAN STATUS: PASS (100%)');
  } catch (error) {
    console.error('\n❌ KENDALA EKSEKUSI SKENARIO 6:', error);
    try {
      const errScreenshot = path.join(process.cwd(), 'scratch/uat_scen6_error_debug.png');
      await adminPage.screenshot({ path: errScreenshot, fullPage: false });
      copyToArtifact(errScreenshot, 'uat_scen6_error_debug.png');
    } catch {}
    throw error;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runScenario6().catch(err => {
  console.error(err);
  process.exit(1);
});
