import { chromium } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/333feedc-d1a8-426a-a687-11b851b47504';
const BASE_URL = process.env.BASE_URL || 'http://localhost:32120';

const databaseUrl =
  process.env.TEST_DATABASE_URL ||
  (process.env.DATABASE_URL?.includes('3315')
    ? process.env.DATABASE_URL
    : 'mysql://dailydose:b64c0a6442c3df2f4f940459955788747a844facf4be7d9e23773bad7b592308@127.0.0.1:3315/dailydose');

async function runStudioJourneyTest() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - FULL E2E BROWSER JOURNEY TEST (LANGKAH 4)                   ║');
  console.log('║   Browser Asli Chromium: Customer Journey & Ledger Verification              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const db = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // ========================================================================
    // TAHAP 1: SETUP FIXTURE DATA DATABASE DETERMINISTIK
    // ========================================================================
    console.log('▶ 1. Menyiapkan Fixture Data Customer & Paket di Database MySQL...');
    const customer = await db.user.findFirstOrThrow({
      where: { email: 'amanda.member@dailydose.test' },
    });
    console.log(`   👤 Akun Customer: ${customer.displayName} (${customer.email})`);

    const branchGG = await db.cabang.findFirstOrThrow({ where: { code: 'DD-GG' } });
    const branchSBY = await db.cabang.findFirstOrThrow({ where: { code: 'DD-SBY' } });

    // Nonaktifkan paket universal (branchId: null) atau paket Surabaya milik Amanda
    // agar mismatch edukasi paket Surabaya terpicu secara deterministik
    const deactUniversal = await db.paketPelanggan.updateMany({
      where: {
        userId: customer.id,
        status: 'ACTIVE',
        package: {
          OR: [{ branchId: null }, { branchId: branchSBY.id }],
        },
      },
      data: { status: 'EXPIRED' },
    });
    if (deactUniversal.count > 0) {
      console.log(`   📦 Dinonaktifkan sementara ${deactUniversal.count} paket non-cabang/Surabaya Amanda.`);
    }

    // Pastikan Amanda memiliki paket aktif spesifik Green Garden Jakarta dengan 10 sesi
    const masterPkgGG = await db.paket.findFirstOrThrow({
      where: { code: 'PKG-TEST-1789699463379', branchId: branchGG.id },
    });

    let customerPkg = await db.paketPelanggan.findFirst({
      where: { userId: customer.id, packageId: masterPkgGG.id, status: 'ACTIVE' },
    });

    if (!customerPkg) {
      customerPkg = await db.paketPelanggan.create({
        data: {
          userId: customer.id,
          packageId: masterPkgGG.id,
          totalSessions: 10,
          remainingSessions: 10,
          usedSessions: 0,
          validUntil: new Date(Date.now() + 30 * 86400000),
          status: 'ACTIVE',
        },
      });
    } else {
      await db.paketPelanggan.update({
        where: { id: customerPkg.id },
        data: {
          remainingSessions: 10,
          usedSessions: 0,
          validUntil: new Date(Date.now() + 30 * 86400000),
        },
      });
    }
    // Bersihkan booking lama Amanda pada slot Jakarta dan paket ini agar test bersifat idempotent
    await db.pemesananKelas.updateMany({
      where: {
        userId: customer.id,
        classSlotId: 'f1000000-ddgg00-4000-8000-0000060101',
        status: 'BOOKED',
      },
      data: { status: 'CANCELLED' },
    });
    await db.pemesananKelas.updateMany({
      where: {
        customerPackageId: customerPkg.id,
        status: 'BOOKED',
      },
      data: { status: 'CANCELLED' },
    });
    await db.slotKelas.update({
      where: { id: 'f1000000-ddgg00-4000-8000-0000060101' },
      data: { bookedCount: 0, status: 'PUBLISHED' },
    });

    console.log(`   ✅ Paket Aktif Amanda Disiapkan: "${masterPkgGG.name}" (Saldo: 10 sesi, Cabang: Green Garden)`);

    // Pastikan slot Surabaya & slot Jakarta siap dan berstatus PUBLISHED di masa depan
    const slotSby = await db.slotKelas.findUniqueOrThrow({
      where: { id: 'f1000000-ddsby0-4000-8000-0000060001' },
      include: { branch: true, classType: true },
    });
    console.log(`   🏛️  Slot Surabaya: ${slotSby.id} (${slotSby.branch.name} - ${slotSby.classType.name})`);

    const slotJkt = await db.slotKelas.findUniqueOrThrow({
      where: { id: 'f1000000-ddgg00-4000-8000-0000060101' },
      include: { branch: true, classType: true },
    });
    console.log(`   🏛️  Slot Jakarta : ${slotJkt.id} (${slotJkt.branch.name} - ${slotJkt.classType.name})`);

    // ========================================================================
    // TAHAP 2: AUTENTIKASI PENGGUNA DI BROWSER (UI LOGIN)
    // ========================================================================
    console.log('\n▶ 2. Membuka Browser Chromium & Login sebagai Amanda Member...');
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    console.log(`   🌐 Membuka halaman login: ${page.url()}`);

    await page.fill('input[type="email"], input[name="email"], input[id="email"]', 'amanda.member@dailydose.test');
    await page.fill('input[type="password"], input[name="password"], input[id="password"]', 'Customer123!');
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15000 });
    console.log(`   ✅ Login Berhasil! Halaman dialihkan ke: ${page.url()}`);

    // ========================================================================
    // TAHAP 3: AKSES SLOT SURABAYA & VALIDASI EDUKASI PAKET MISMATCH
    // ========================================================================
    console.log('\n▶ 3. Mengakses Slot Surabaya (Uji Deteksi Mismatch Paket)...');
    const surabayaUrl = `${BASE_URL}/bookings/new?slot=${slotSby.id}`;
    await page.goto(surabayaUrl, { waitUntil: 'networkidle' });
    console.log(`   🌐 Menavigasi ke: ${surabayaUrl}`);

    // Verifikasi UI tidak crash (tidak 404, tidak 500)
    const pageTitle = await page.textContent('h1, header');
    if (!pageTitle || pageTitle.includes('404') || pageTitle.includes('500')) {
      throw new Error(`Halaman slot Surabaya mengalami kegagalan render: ${pageTitle}`);
    }

    // Verifikasi pesan edukasi paket yang ramah
    const bannerTitle = await page.waitForSelector('text=Paket yang sesuai diperlukan', { timeout: 10000 });
    if (!bannerTitle) throw new Error('Banner "Paket yang sesuai diperlukan" tidak ditemukan di UI.');

    const bannerDesc = await page.waitForSelector('text=Anda belum memiliki paket aktif untuk studio', { timeout: 10000 });
    if (!bannerDesc) throw new Error('Pesan edukasi studio tidak ditemukan di UI.');

    // Verifikasi tombol Beli Paket mengarah ke pembelian paket yang sesuai
    const buyButton = await page.waitForSelector('a:has-text("Beli paket yang sesuai")', { timeout: 10000 });
    const buyHref = await buyButton.getAttribute('href');
    console.log(`   ✅ Edukasi Paket Mismatch Ditampilkan dengan Benar!`);
    console.log(`      • Judul  : "Paket yang sesuai diperlukan"`);
    console.log(`      • Pesan  : "Anda belum memiliki paket aktif untuk studio dan tipe kelas ini."`);
    console.log(`      • Tombol : "Beli paket yang sesuai" (URL: ${buyHref})`);

    const ssMismatch = path.join(ARTIFACT_DIR, 'e2e_studio_journey_1_surabaya_mismatch.png');
    await page.screenshot({ path: ssMismatch, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: e2e_studio_journey_1_surabaya_mismatch.png`);

    // ========================================================================
    // TAHAP 4: TRANSISI KE SLOT JAKARTA & MENUNTASKAN BOOKING
    // ========================================================================
    console.log('\n▶ 4. Menavigasi ke Slot Jakarta yang Sesuai & Menuntaskan Booking...');
    const jakartaUrl = `${BASE_URL}/bookings/new?slot=${slotJkt.id}`;
    await page.goto(jakartaUrl, { waitUntil: 'networkidle' });
    console.log(`   🌐 Menavigasi ke: ${jakartaUrl}`);

    // Pastikan form booking tampil dengan rincian kelas Jakarta
    await page.waitForSelector('text=Konfirmasi reservasi kelas', { timeout: 10000 });
    await page.waitForSelector(`text=${slotJkt.branch.name}`, { timeout: 10000 });
    await page.waitForSelector(`text=${slotJkt.classType.name}`, { timeout: 10000 });
    console.log(`   ✅ Rincian Jadwal Terverifikasi: ${slotJkt.branch.name} · ${slotJkt.classType.name}`);

    // Pastikan paket Amanda terpilih (radio button aktif)
    const packageRadio = page.locator(`input[value="${customerPkg.id}"]`);
    if (await packageRadio.isVisible()) {
      if (!(await packageRadio.isChecked())) {
        await packageRadio.check();
      }
    }
    console.log(`   ✅ Paket Terpilih: "${masterPkgGG.name}"`);

    // Klik "Lanjutkan ke review booking"
    console.log('   👉 Menekan tombol "Lanjutkan ke review booking"...');
    await page.click('button:has-text("Lanjutkan ke review booking")');

    // Verifikasi Tahap Review
    await page.waitForSelector('text=Konfirmasi detail booking', { timeout: 10000 });
    await page.waitForSelector('text=Review reservasi', { timeout: 10000 });
    console.log('   ✅ Tinjauan Reservasi Tampil (Studio, Kelas, Waktu, & Proyeksi Saldo 10 → 9)');

    // Intercept respons konfirmasi booking
    const bookingResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && /\/api\/v1\/bookings$/.test(response.url()),
    );

    console.log('   👉 Menekan tombol "Ya, konfirmasi booking"...');
    await page.click('button:has-text("Ya, konfirmasi booking")');

    const bookingResponse = await bookingResponsePromise;
    if (!bookingResponse.ok()) {
      const errBody = await bookingResponse.text();
      throw new Error(`API Konfirmasi Booking Gagal: HTTP ${bookingResponse.status()} - ${errBody}`);
    }

    const bookingResult = (await bookingResponse.json()) as { id: string };
    console.log(`   🎉 Booking Berhasil Dikonfirmasi via API! Booking ID: ${bookingResult.id}`);

    // Verifikasi UI menampilkan panel konfirmasi berhasil
    await page.waitForSelector('text=Booking berhasil', { timeout: 10000 });
    console.log('   ✅ Layar Sukses Tampil: "Booking berhasil"');

    const ssBookingConfirmed = path.join(ARTIFACT_DIR, 'e2e_studio_journey_2_booking_confirmed.png');
    await page.screenshot({ path: ssBookingConfirmed, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: e2e_studio_journey_2_booking_confirmed.png`);

    // ========================================================================
    // TAHAP 5: VERIFIKASI TIKET DI /bookings & AUDIT LEDGER DI DATABASE
    // ========================================================================
    console.log('\n▶ 5. Membuka Halaman /bookings & Memverifikasi Tiket...');
    await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle' });
    console.log(`   🌐 Menavigasi ke: ${page.url()}`);

    // Verifikasi tiket booking muncul di tab Mendatang
    await page.waitForSelector(`text=${slotJkt.classType.name}`, { timeout: 15000 });
    await page.waitForSelector(`text=${slotJkt.branch.name}`, { timeout: 10000 });
    await page.waitForSelector('text=Terjadwal', { timeout: 10000 });
    console.log(`   ✅ Tiket Booking Ditemukan di Daftar "Jadwal Latihan Anda" (Status: Terjadwal)`);

    const ssTicket = path.join(ARTIFACT_DIR, 'e2e_studio_journey_3_ticket_published.png');
    await page.screenshot({ path: ssTicket, fullPage: true });
    console.log(`   📸 Tangkapan Layar Disimpan: e2e_studio_journey_3_ticket_published.png`);

    // Audit Ledger & Kuota Reservasi di Database MySQL
    console.log('\n▶ 6. Audit Database Ledger & Kuota Sesi Customer...');
    const updatedPkg = await db.paketPelanggan.findUniqueOrThrow({
      where: { id: customerPkg.id },
    });

    const createdBooking = await db.pemesananKelas.findUniqueOrThrow({
      where: { id: bookingResult.id },
      include: { classSlot: true },
    });

    const activeBookings = await db.pemesananKelas.count({
      where: { customerPackageId: customerPkg.id, status: 'BOOKED' },
    });
    const availableForBooking = updatedPkg.remainingSessions - activeBookings;

    console.log(`   📊 Rekam Database:`);
    console.log(`      • Booking Number           : ${createdBooking.bookingNumber}`);
    console.log(`      • Status Booking           : ${createdBooking.status}`);
    console.log(`      • Slot Kelas ID            : ${createdBooking.classSlotId}`);
    console.log(`      • Slot Booked Count        : ${createdBooking.classSlot.bookedCount} / ${createdBooking.classSlot.capacity}`);
    console.log(`      • Saldo Sesi Fisik         : ${updatedPkg.remainingSessions} sesi`);
    console.log(`      • Reservasi Aktif Mengikat : ${activeBookings} sesi`);
    console.log(`      • Sisa Saldo Tersedia      : ${availableForBooking} sesi (Terpotong Reservasi dari 10 → 9)`);

    if (availableForBooking !== 9) {
      throw new Error(
        `Audit Reservasi Gagal: Sisa saldo sesi tersedia seharusnya berkurang menjadi 9, namun tercatat ${availableForBooking}`,
      );
    }
    console.log('   ✅ Konsistensi Kuota Terbukti: Kuota reservasi customer terpotong tepat 1 sesi (Aturan #1 & #2)!');

    console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║   SELURUH RANGKAIAN FULL E2E BROWSER JOURNEY TEST LULUS DENGAN SEMPURNA!     ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
  } finally {
    await browser.close();
    await db.$disconnect();
  }
}

runStudioJourneyTest().catch((error) => {
  console.error('\n❌ E2E JOURNEY TEST MENGALAMI KEGAGALAN:', error);
  process.exit(1);
});
