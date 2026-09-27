import { test, expect } from '@playwright/test';
import { prisma } from './db-helper';
import { loginAsCustomer, CUSTOMER_CREDENTIALS } from './auth-helper';

const JAKARTA_SLOT_ID = 'f1000000-ddgg00-4000-8000-0000060101';
const SURABAYA_SLOT_ID = 'f1000000-ddsby0-4000-8000-0000070001';

test.describe('Real E2E: Booking Journey & Ledger Audit Flow', () => {
  let customerUser: { id: string; email: string };
  let activePackage: { id: string; remainingSessions: number; packageId: string };

  test.beforeEach(async ({ page }) => {
    // 1. Ambil data customer Amanda dari database MySQL
    customerUser = await prisma.user.findFirstOrThrow({
      where: { email: CUSTOMER_CREDENTIALS.email },
      select: { id: true, email: true },
    });

    // 2. Pastikan slot Jakarta & Surabaya berstatus PUBLISHED, bookedCount reset, dan jadwal di masa depan (+24 jam)
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const futureEndDate = new Date(futureDate.getTime() + 60 * 60 * 1000);

    await prisma.slotKelas.update({
      where: { id: JAKARTA_SLOT_ID },
      data: {
        status: 'PUBLISHED',
        bookedCount: 0,
        startAt: futureDate,
        endAt: futureEndDate,
      },
    });

    await prisma.slotKelas.update({
      where: { id: SURABAYA_SLOT_ID },
      data: {
        status: 'PUBLISHED',
        bookedCount: 0,
        startAt: futureDate,
        endAt: futureEndDate,
      },
    });

    // 3. Batalkan booking lama Amanda pada slot Jakarta ini agar test bersifat idempotent
    await prisma.pemesananKelas.updateMany({
      where: {
        userId: customerUser.id,
        classSlotId: JAKARTA_SLOT_ID,
        status: 'BOOKED',
      },
      data: { status: 'CANCELLED' },
    });

    // 4. Pastikan Amanda memiliki 1 paket aktif yang sesuai persis dengan jenis kelas & cabang slot Jakarta
    const slotJakarta = await prisma.slotKelas.findUniqueOrThrow({
      where: { id: JAKARTA_SLOT_ID },
    });

    const masterPkg = await prisma.paket.findFirstOrThrow({
      where: {
        status: 'ACTIVE',
        AND: [
          { OR: [{ branchId: null }, { branchId: slotJakarta.branchId }] },
          { OR: [{ classTypeId: null }, { classTypeId: slotJakarta.classTypeId }] },
        ],
      },
    });

    // Nonaktifkan semua paket aktif Amanda sebelumnya agar state pengujian terisolasi & deterministik
    await prisma.paketPelanggan.updateMany({
      where: {
        userId: customerUser.id,
        status: 'ACTIVE',
      },
      data: { status: 'EXPIRED' },
    });

    const pkg = await prisma.paketPelanggan.create({
      data: {
        userId: customerUser.id,
        packageId: masterPkg.id,
        totalSessions: 10,
        remainingSessions: 10,
        usedSessions: 0,
        validUntil: new Date(Date.now() + 30 * 86400000),
        status: 'ACTIVE',
      },
    });

    activePackage = { id: pkg.id, remainingSessions: pkg.remainingSessions, packageId: pkg.packageId };

    // 5. Login sebagai Amanda
    await loginAsCustomer(page);
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('1. Validasi Halaman Booking Baru (/bookings/new) & Informasi Sesi Lengkap', async ({ page }) => {
    await page.goto(`/bookings/new?slot=${JAKARTA_SLOT_ID}`);
    await expect(page).toHaveURL(new RegExp(`/bookings/new\\?slot=${JAKARTA_SLOT_ID}`));

    // Verifikasi Rincian Sesi Kelas
    await expect(page.getByRole('heading', { name: 'Private Class' })).toBeVisible();
    await expect(page.getByText(/Daily Dose Green Garden/i).first()).toBeVisible();
    await expect(page.getByText(/Ratna/i).first()).toBeVisible();
    await expect(page.getByText('Waktu sesi')).toBeVisible();
    await expect(page.getByText('Durasi latihan')).toBeVisible();

    // Verifikasi Bagian Pemilihan Paket
    await expect(page.getByRole('heading', { name: 'Pilih paket aktif untuk sesi ini' })).toBeVisible();

    // Verifikasi tombol submit awal
    const reviewBtn = page.getByRole('button', { name: 'Lanjutkan ke review booking' });
    await expect(reviewBtn).toBeVisible();
  });

  test('2. Deteksi Edukasi Paket Mismatch pada Slot Surabaya (Permintaan Awal User)', async ({ page }) => {
    // Nonaktifkan sementara paket universal/Surabaya agar mismatch terpicu secara deterministik
    const branchSBY = await prisma.cabang.findFirstOrThrow({ where: { code: 'DD-SBY' } });
    await prisma.paketPelanggan.updateMany({
      where: {
        userId: customerUser.id,
        status: 'ACTIVE',
        package: {
          OR: [{ branchId: null }, { branchId: branchSBY.id }],
        },
      },
      data: { status: 'EXPIRED' },
    });

    await page.goto(`/bookings/new?slot=${SURABAYA_SLOT_ID}`);
    await expect(page).toHaveURL(new RegExp(`/bookings/new\\?slot=${SURABAYA_SLOT_ID}`));

    // Verifikasi Banner Edukasi Paket Mismatch Tampil Secara Jelas
    await expect(page.getByText('Paket yang sesuai diperlukan')).toBeVisible();
    await expect(
      page.getByText('Anda belum memiliki paket aktif untuk studio dan tipe kelas ini.'),
    ).toBeVisible();

    // Verifikasi link Beli Paket terarah ke katalog yang tepat dengan parameter branch & slot
    const buyButton = page.getByRole('link', { name: 'Beli paket yang sesuai' });
    await expect(buyButton).toBeVisible();
    const buyHref = await buyButton.getAttribute('href');
    expect(buyHref).toContain('/packages');
    expect(buyHref).toContain('branch=');
    expect(buyHref).toContain(SURABAYA_SLOT_ID);
  });

  test('3. Alur Booking Penuh: Review, Konfirmasi API, Tiket, & Audit Ledger MySQL Riil', async ({ page }) => {
    await page.goto(`/bookings/new?slot=${JAKARTA_SLOT_ID}`);

    // Pastikan paket Amanda terpilih (radio button aktif)
    const packageRadio = page.locator(`input[value="${activePackage.id}"]`);
    if (await packageRadio.isVisible()) {
      if (!(await packageRadio.isChecked())) {
        await packageRadio.check();
      }
    }

    // Klik tombol "Lanjutkan ke review booking"
    const reviewBtn = page.getByRole('button', { name: 'Lanjutkan ke review booking' });
    await reviewBtn.click();

    // Verifikasi dialog / layar Review Reservasi
    await expect(page.getByText('Konfirmasi detail booking')).toBeVisible();
    await expect(page.getByText('Review reservasi')).toBeVisible();

    // Intercept respons konfirmasi booking API
    const bookingResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && /\/api\/v1\/bookings$/.test(response.url()),
    );

    // Klik tombol konfirmasi booking
    const confirmBtn = page.getByRole('button', { name: 'Ya, konfirmasi booking' });
    await confirmBtn.click();

    const bookingResponse = await bookingResponsePromise;
    expect(bookingResponse.ok()).toBe(true);

    const bookingResult = (await bookingResponse.json()) as { id: string };
    expect(bookingResult.id).toBeTruthy();

    // Verifikasi UI menampilkan layar konfirmasi berhasil
    await expect(page.getByText('Booking berhasil', { exact: true })).toBeVisible({ timeout: 10_000 });

    // Verifikasi Tiket di halaman /bookings
    await page.goto('/bookings');
    await expect(page.getByText('Private Class').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Daily Dose Green Garden/i).first()).toBeVisible();

    // ========================================================================
    // AUDIT DATABASE MYSQL NYATA (100% REAL - NO MOCK):
    // Membuktikan transaksi benar-benar tersimpan dan saldo terpotong akurat
    // ========================================================================
    const bookingInDb = await prisma.pemesananKelas.findUniqueOrThrow({
      where: { id: bookingResult.id },
      include: { classSlot: true },
    });

    expect(bookingInDb.status).toBe('BOOKED');
    expect(bookingInDb.classSlotId).toBe(JAKARTA_SLOT_ID);

    const updatedPackageInDb = await prisma.paketPelanggan.findUniqueOrThrow({
      where: { id: activePackage.id },
    });

    // Hitung active bookings yang mengikat saldo paket
    const activeBookingsCount = await prisma.pemesananKelas.count({
      where: { customerPackageId: activePackage.id, status: 'BOOKED' },
    });

    const effectiveRemaining = updatedPackageInDb.remainingSessions - activeBookingsCount;
    // Kuota tersisa harus terpotong tepat 1 sesi (dari 10 menjadi 9)
    expect(effectiveRemaining).toBe(9);
  });
});
