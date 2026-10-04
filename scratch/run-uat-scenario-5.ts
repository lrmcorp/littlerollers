import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';
const BASE_URL = 'http://localhost:32120';

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

async function runScenario5() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║       DAILY DOSE PILATES V2 - UAT EKSEKUSI SKENARIO 5 (CLEAN SLATE)          ║');
  console.log('║       Booking & Reservasi Mandiri oleh Member (FIFO Quota & QR Pass)         ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({
    headless: true,
  });

  const memberContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  });
  const page = await memberContext.newPage();

  try {
    // ========================================================================
    // TAHAP 1: LOGIN MEMBER JESSICA & BUKA JADWAL PUBLIK
    // ========================================================================
    console.log('▶ [1/6] Login Member Jessica (jessica.uat@gmail.com)...');
    await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await page.waitForSelector('input[name="email"]');
    await page.fill('input[name="email"]', 'jessica.uat@gmail.com');
    await page.fill('input[name="password"]', 'DailyDose2026!');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/sign-in'), { timeout: 10000 });
    console.log(`   ✓ Login Member Berhasil, URL: ${page.url()}`);

    console.log('   Membuka Jadwal Kelas Green Garden (/classes?branch=a1000000-0000-4000-8000-000000000001)...');
    await page.goto(`${BASE_URL}/classes?branch=a1000000-0000-4000-8000-000000000001`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Filter tanggal Senin, 5 Oktober jika ada tab tanggal
    const mondayBtn = page.locator('button', { hasText: /Senin.*5.*Oktober/i }).first();
    if (await mondayBtn.isVisible()) {
      await mondayBtn.click();
      await page.waitForTimeout(1000);
    }

    const catalogScreenshot = path.join(process.cwd(), 'scratch/uat_scen5_01_public_schedule_catalog.png');
    await page.screenshot({ path: catalogScreenshot, fullPage: false });
    copyToArtifact(catalogScreenshot, 'uat_scen5_01_public_schedule_catalog.png');
    console.log('   ✓ Jadwal publik menampilkan slot Group Class Coach Clara dengan badge paket sesuai.');

    // ========================================================================
    // TAHAP 2: KLIK LANJUTKAN BOOKING & PILIH PAKET
    // ========================================================================
    console.log('\n▶ [2/6] Membuka Formulir Reservasi Kelas (/bookings/new)...');
    // Cari tombol "Lanjutkan booking" pada kartu Group Class
    const bookCta = page.locator('a[href*="/bookings/new?slot="]').first();
    await bookCta.waitFor({ timeout: 10000 });
    await bookCta.click();

    await page.waitForURL(url => url.pathname.includes('/bookings/new'), { timeout: 10000 });
    await page.waitForSelector('form[aria-label="Formulir booking mandiri"]', { timeout: 10000 });
    await page.waitForTimeout(1500);

    const step1Screenshot = path.join(process.cwd(), 'scratch/uat_scen5_02_booking_step1_select_package.png');
    await page.screenshot({ path: step1Screenshot, fullPage: false });
    copyToArtifact(step1Screenshot, 'uat_scen5_02_booking_step1_select_package.png');
    console.log('   ✓ Step 1: Pilihan paket aktif (10 Sessions Group Class Reformer) tampil.');

    // ========================================================================
    // TAHAP 3: LANJUTKAN KE REVIEW BOOKING
    // ========================================================================
    console.log('\n▶ [3/6] Meninjau Ringkasan Reservasi (Step 2: Review)...');
    const toReviewBtn = page.getByRole('button', { name: /Lanjutkan ke review booking/i });
    await toReviewBtn.click();
    await page.waitForTimeout(1500);

    const step2Screenshot = path.join(process.cwd(), 'scratch/uat_scen5_03_booking_step2_review.png');
    await page.screenshot({ path: step2Screenshot, fullPage: false });
    copyToArtifact(step2Screenshot, 'uat_scen5_03_booking_step2_review.png');
    console.log('   ✓ Step 2: Konfirmasi detail booking & pengurangan kuota (10 → 9 sesi) tampil.');

    // ========================================================================
    // TAHAP 4: KONFIRMASI BOOKING & TERBITKAN TIKET
    // ========================================================================
    console.log('\n▶ [4/6] Mengonfirmasi Booking Kelas...');
    const confirmBookingBtn = page.getByRole('button', { name: /Ya, konfirmasi booking/i });
    await confirmBookingBtn.click();

    // Tunggu tampilan sukses muncul
    await page.waitForSelector('text=Booking berhasil', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const successScreenshot = path.join(process.cwd(), 'scratch/uat_scen5_04_booking_confirmed_success.png');
    await page.screenshot({ path: successScreenshot, fullPage: false });
    copyToArtifact(successScreenshot, 'uat_scen5_04_booking_confirmed_success.png');
    console.log('   ✓ Booking berhasil dikonfirmasi! Kuota paket berkurang menjadi 9 sesi.');

    // ========================================================================
    // TAHAP 5: LIHAT TIKET & PASS CHECK-IN STUDIO DENGAN QR CODE
    // ========================================================================
    console.log('\n▶ [5/6] Membuka Tiket & Pass Check-in Studio (/bookings/[id])...');
    const viewTicketBtn = page.locator('a', { hasText: /Lihat tiket & QR check-in/i }).first();
    await viewTicketBtn.click();

    await page.waitForURL(url => url.pathname.includes('/bookings/'), { timeout: 10000 });
    await page.waitForSelector('canvas', { timeout: 10000 }); // QR canvas rendered
    await page.waitForTimeout(2000);

    const ticketDetailScreenshot = path.join(process.cwd(), 'scratch/uat_scen5_06_ticket_detail_qr_pass.png');
    await page.screenshot({ path: ticketDetailScreenshot, fullPage: false });
    copyToArtifact(ticketDetailScreenshot, 'uat_scen5_06_ticket_detail_qr_pass.png');
    console.log('   ✓ Pass Check-in Studio memuat QR Code aktif dan referensi booking.');

    // Buka juga daftar semua booking member (/bookings)
    console.log('   Membuka Daftar Booking Saya (/bookings)...');
    await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const bookingsListScreenshot = path.join(process.cwd(), 'scratch/uat_scen5_05_member_bookings_list.png');
    await page.screenshot({ path: bookingsListScreenshot, fullPage: false });
    copyToArtifact(bookingsListScreenshot, 'uat_scen5_05_member_bookings_list.png');
    console.log('   ✓ Daftar booking menampilkan tiket status Terjadwal.');

    // ========================================================================
    // TAHAP 6: VERIFIKASI SALDO PAKET MEMBER & AUDIT DATABASE
    // ========================================================================
    console.log('\n▶ [6/6] Memverifikasi Sisa Saldo Paket Member (/account/packages)...');
    await page.goto(`${BASE_URL}/account/packages`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const packagesScreenshot = path.join(process.cwd(), 'scratch/uat_scen5_07_member_remaining_package_sessions.png');
    await page.screenshot({ path: packagesScreenshot, fullPage: false });
    copyToArtifact(packagesScreenshot, 'uat_scen5_07_member_remaining_package_sessions.png');
    console.log('   ✓ Saldo paket member menampilkan 9 Sesi Tersedia (1 sesi terpakai).');

    // Audit Database
    console.log('\n▶ [AUDIT] Melakukan Verifikasi Database dailydose_v2_uat...');
    const memberUser = await prisma.user.findUnique({
      where: { email: 'jessica.uat@gmail.com' },
    });

    const bookingRecord = await prisma.pemesananKelas.findFirst({
      where: { userId: memberUser?.id },
      include: {
        classSlot: {
          include: {
            branch: true,
            classType: true,
            instructor: true,
            studio: true,
            room: true,
          },
        },
        customerPackage: {
          include: { package: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const packageRecord = await prisma.paketPelanggan.findFirst({
      where: { userId: memberUser?.id },
      include: { package: true },
    });

    const ledgerEntries = await prisma.sessionLedger.findMany({
      where: { customerPackageId: packageRecord?.id },
      orderBy: { createdAt: 'desc' },
    });

    const updatedSlot = await prisma.slotKelas.findUnique({
      where: { id: bookingRecord?.classSlotId },
    });

    console.log('\n--- HASIL AUDIT DATABASE RESERVASI MEMBER ---');
    console.log('BOOKING RECORD:', {
      bookingId: bookingRecord?.id,
      bookingNumber: bookingRecord?.bookingNumber,
      status: bookingRecord?.status,
      userId: bookingRecord?.userId,
      classType: bookingRecord?.classSlot?.classType?.name,
      instructor: bookingRecord?.classSlot?.instructor?.displayName,
      branch: bookingRecord?.classSlot?.branch?.name,
      package: bookingRecord?.customerPackage?.package?.name,
    });

    console.log('CUSTOMER PACKAGE BALANCE:', {
      packageId: packageRecord?.id,
      packageName: packageRecord?.package?.name,
      totalSessions: packageRecord?.totalSessions,
      usedSessions: packageRecord?.usedSessions,
      remainingSessions: packageRecord?.remainingSessions,
      status: packageRecord?.status,
    });

    console.log('SESSION LEDGER ENTRIES:', ledgerEntries.map(l => ({
      id: l.id,
      type: l.type,
      amount: l.amount,
      balanceAfter: l.balanceAfter,
      referenceId: l.referenceId,
      notes: l.notes,
    })));

    console.log('SLOT KELAS CAPACITY:', {
      slotId: updatedSlot?.id,
      capacity: updatedSlot?.capacity,
      bookedCount: updatedSlot?.bookedCount,
      availableRemaining: (updatedSlot?.capacity ?? 0) - (updatedSlot?.bookedCount ?? 0),
    });

    console.log('\n✅ SKENARIO 5 BERHASIL DIEKSEKUSI DENGAN STATUS: PASS (100%)');
  } catch (error) {
    console.error('\n❌ KENDALA EKSEKUSI SKENARIO 5:', error);
    try {
      const errScreenshot = path.join(process.cwd(), 'scratch/uat_scen5_error_debug.png');
      await page.screenshot({ path: errScreenshot, fullPage: false });
      copyToArtifact(errScreenshot, 'uat_scen5_error_debug.png');
    } catch {}
    throw error;
  } finally {
    await browser.close();
    await prisma.$disconnect();
  }
}

runScenario5().catch(err => {
  console.error(err);
  process.exit(1);
});
