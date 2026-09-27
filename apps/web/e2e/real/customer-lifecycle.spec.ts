import { test, expect } from '@playwright/test';
import { prisma } from './db-helper';
import { loginAsCustomer, CUSTOMER_CREDENTIALS } from './auth-helper';

const JAKARTA_SLOT_ID = 'f1000000-ddgg00-4000-8000-0000060101';

test.describe('Real E2E: Full Customer Lifecycle Journey (Real Live Server & MySQL)', () => {
  let customerUser: { id: string; email: string; displayName: string };
  let testPackage: { id: string; packageId: string };

  test.beforeAll(async () => {
    // 1. Ambil customer Amanda dari database MySQL
    customerUser = await prisma.user.findFirstOrThrow({
      where: { email: CUSTOMER_CREDENTIALS.email },
      select: { id: true, email: true, displayName: true },
    });

    // 2. Set slot jadwal di masa depan (+48 jam)
    const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const futureEndDate = new Date(futureDate.getTime() + 60 * 60 * 1000);

    const slot = await prisma.slotKelas.update({
      where: { id: JAKARTA_SLOT_ID },
      data: {
        status: 'PUBLISHED',
        bookedCount: 0,
        startAt: futureDate,
        endAt: futureEndDate,
      },
      include: { branch: true, classType: true },
    });

    // 3. Batalkan booking lama Amanda pada slot ini
    await prisma.pemesananKelas.updateMany({
      where: {
        userId: customerUser.id,
        classSlotId: JAKARTA_SLOT_ID,
        status: 'BOOKED',
      },
      data: { status: 'CANCELLED' },
    });

    // 4. Cari paket master yang cocok dengan cabang & tipe kelas slot
    const masterPkg = await prisma.paket.findFirstOrThrow({
      where: {
        status: 'ACTIVE',
        AND: [
          { OR: [{ branchId: null }, { branchId: slot.branchId }] },
          { OR: [{ classTypeId: null }, { classTypeId: slot.classTypeId }] },
        ],
      },
    });

    // 5. Nonaktifkan paket lama dan berikan paket segar 10 sesi untuk Amanda
    await prisma.paketPelanggan.updateMany({
      where: { userId: customerUser.id, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    });

    const newPkg = await prisma.paketPelanggan.create({
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

    testPackage = { id: newPkg.id, packageId: newPkg.packageId };
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Customer Lifecycle: Login -> Eksplorasi Katalog -> Reservasi Kelas -> Verifikasi Tiket -> Audit DB', async ({
    page,
  }) => {
    // -------------------------------------------------------------------------
    // TAHAP 1: Login sebagai Customer
    // -------------------------------------------------------------------------
    await loginAsCustomer(page);
    await page.goto('/account');
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByText('Amanda Member').first()).toBeVisible();

    // -------------------------------------------------------------------------
    // TAHAP 2: Buka Profil & Keamanan Akun (Hasil Validasi Langkah 1)
    // -------------------------------------------------------------------------
    await page.goto('/account/security');
    await expect(page.getByRole('heading', { name: 'Keamanan Akun' })).toBeVisible();
    await expect(page.getByText('Password aktif')).toBeVisible();

    // -------------------------------------------------------------------------
    // TAHAP 3: Eksplorasi Katalog Paket
    // -------------------------------------------------------------------------
    await page.goto('/packages');
    await expect(page).toHaveURL(/\/packages/);

    // Klik filter studio Green Garden
    const branchBtn = page.getByRole('button', { name: /Green Garden/i }).first();
    await branchBtn.click();
    await expect(page.getByText(/Rp\s*[\d.]+/).first()).toBeVisible();

    // -------------------------------------------------------------------------
    // TAHAP 4: Reservasi Sesi Kelas di /bookings/new
    // -------------------------------------------------------------------------
    await page.goto(`/bookings/new?slot=${JAKARTA_SLOT_ID}`);
    await expect(page.getByRole('heading', { name: 'Private Class' })).toBeVisible();
    await expect(page.getByText(/Daily Dose Green Garden/i).first()).toBeVisible();

    // Pastikan paket Amanda tercentang
    const pkgRadio = page.locator(`input[value="${testPackage.id}"]`);
    if (await pkgRadio.isVisible()) {
      if (!(await pkgRadio.isChecked())) {
        await pkgRadio.check();
      }
    }

    // Lanjutkan ke review booking
    const reviewBtn = page.getByRole('button', { name: 'Lanjutkan ke review booking' });
    await reviewBtn.click();

    await expect(page.getByText('Review reservasi')).toBeVisible();
    await expect(page.getByText('Konfirmasi detail booking')).toBeVisible();

    // Intercept respons konfirmasi API
    const bookingResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && /\/api\/v1\/bookings$/.test(response.url()),
    );

    // Konfirmasi booking
    const confirmBtn = page.getByRole('button', { name: 'Ya, konfirmasi booking' });
    await confirmBtn.click();

    const bookingResponse = await bookingResponsePromise;
    expect(bookingResponse.ok()).toBe(true);

    const bookingJson = (await bookingResponse.json()) as { id: string };
    expect(bookingJson.id).toBeTruthy();

    await expect(page.getByText('Booking berhasil', { exact: true })).toBeVisible({
      timeout: 10_000,
    });

    // -------------------------------------------------------------------------
    // TAHAP 5: Periksa Tiket di Halaman Riwayat Booking
    // -------------------------------------------------------------------------
    await page.goto('/bookings');
    await expect(page).toHaveURL(/\/bookings/);
    await expect(page.getByText('Private Class').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Daily Dose Green Garden/i).first()).toBeVisible();

    // -------------------------------------------------------------------------
    // TAHAP 6: AUDIT KONSISTENSI DATABASE MYSQL (REAL DB AUDIT)
    // -------------------------------------------------------------------------
    const bookingInDb = await prisma.pemesananKelas.findUniqueOrThrow({
      where: { id: bookingJson.id },
      include: {
        classSlot: { include: { branch: true } },
        customerPackage: { include: { package: true } },
      },
    });

    // 1. Verifikasi record booking
    expect(bookingInDb.status).toBe('BOOKED');
    expect(bookingInDb.userId).toBe(customerUser.id);
    expect(bookingInDb.classSlotId).toBe(JAKARTA_SLOT_ID);
    expect(bookingInDb.customerPackageId).toBe(testPackage.id);

    // 2. Verifikasi kuota slot bertambah (bookedCount >= 1)
    const slotInDb = await prisma.slotKelas.findUniqueOrThrow({
      where: { id: JAKARTA_SLOT_ID },
    });
    expect(slotInDb.bookedCount).toBeGreaterThanOrEqual(1);

    // 3. Verifikasi saldo paket terpotong akurat (10 sesi - 1 booking = 9 sesi efektif)
    const packageInDb = await prisma.paketPelanggan.findUniqueOrThrow({
      where: { id: testPackage.id },
    });
    const activeBookings = await prisma.pemesananKelas.count({
      where: { customerPackageId: testPackage.id, status: 'BOOKED' },
    });
    const effectiveRemaining = packageInDb.remainingSessions - activeBookings;
    expect(effectiveRemaining).toBe(9);
  });
});
