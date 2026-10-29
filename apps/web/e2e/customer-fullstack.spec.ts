import type { Page } from '@playwright/test';
import { expect, test } from './customer-fullstack-fixture';

test.skip(
  process.env.DD_CUSTOMER_FULLSTACK !== 'true',
  'Jalankan melalui `pnpm test:e2e:customer` agar backup, worker, dan runtime guard aktif.',
);

test.describe.serial('@customer-fullstack lifecycle customer nyata', () => {
  test.setTimeout(600_000);

  const chooseSearchOption = async (page: Page, label: string, option: string) => {
    const input = page.getByRole('combobox', { name: label, exact: true });
    await input.click();
    await input.fill(option);
    await page
      .getByRole('option', { name: new RegExp(option, 'i') })
      .first()
      .click();
  };

  const openVerificationCase = async (page: Page, customerName: string) => {
    await page.goto('/identity-verifications?status=PENDING');
    await page.getByLabel('Cari customer atau ID').fill(customerName);
    const customerRow = page.getByRole('row', { name: new RegExp(customerName) });
    await expect(customerRow).toBeVisible({ timeout: 20_000 });
    await customerRow.getByRole('button', { name: 'Periksa' }).click();
    await expect(
      page.getByRole('dialog', { name: new RegExp(`Verifikasi · ${customerName}`) }),
    ).toBeVisible();
  };

  const approveOnlyPendingDocument = async (page: Page) => {
    await page.getByRole('button', { name: 'Setujui dokumen' }).click();
    await page.getByRole('button', { name: 'Lanjutkan persetujuan' }).click();
    await page.getByRole('button', { name: 'Setujui', exact: true }).click();
    await expect(page.getByText('Dokumen disetujui', { exact: true })).toBeVisible();
  };

  const expectCustomerNotification = async (page: Page, title: string) => {
    const trigger = page.getByRole('button', { name: /^Notifikasi(?:,|$)/ });
    await expect(trigger).toBeVisible();
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.click();
      const center = page.getByRole('region', { name: 'Pusat notifikasi' });
      if (
        await center
          .getByText(title, { exact: true })
          .isVisible()
          .catch(() => false)
      )
        return;
      await trigger.click();
      await page.waitForTimeout(500);
    }
    await expect(
      page.getByRole('region', { name: 'Pusat notifikasi' }).getByText(title, { exact: true }),
    ).toBeVisible();
  };

  test('registrasi → verifikasi → pembayaran → booking → reschedule → check-in', async ({
    page,
    customerE2E,
  }, testInfo) => {
    customerE2E.observe(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await testInfo.attach('customer-run', {
      body: Buffer.from(
        JSON.stringify({ runId: customerE2E.runId, customer: customerE2E.customer.email }),
      ),
      contentType: 'application/json',
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/register');
    await page.getByLabel('Nama lengkap').fill(customerE2E.customer.displayName);
    await page.getByLabel('Nomor WhatsApp').fill(customerE2E.customer.phone);
    await page.getByLabel('Email', { exact: true }).fill(customerE2E.customer.email);
    await page.getByLabel('Password', { exact: true }).fill(customerE2E.customer.password);
    await page.getByLabel('Ulangi password', { exact: true }).fill(customerE2E.customer.password);
    await page.getByLabel('Foto selfie').setInputFiles(customerE2E.png('selfie-e2e.png'));
    await page
      .getByLabel('Foto KTP bagian depan')
      .setInputFiles(customerE2E.png('ktp-depan-e2e.png'));
    await page.getByRole('checkbox').check();
    const registration = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/api/v1/auth/customer-registrations'),
    );
    await page.getByRole('button', { name: 'Daftar dan masuk' }).click();
    expect((await registration).ok()).toBe(true);
    await expect(page).toHaveURL(/\/account\/verification/, { timeout: 20_000 });

    const studioDialog = page.getByRole('dialog', { name: 'Pilih studio utama Anda' });
    const studioRequired = await studioDialog
      .waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => true)
      .catch(() => false);
    if (studioRequired) {
      await studioDialog.getByRole('radio', { name: /Little Rollers Jakarta/ }).check();
      await studioDialog.getByRole('button', { name: 'Simpan studio' }).click();
      await expect(studioDialog).toBeHidden();
    }
    await expect(
      page.getByRole('heading', { name: 'Dokumen Anda sudah kami terima' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unggah ulang dokumen' })).toHaveCount(0);
    for (const kind of ['SELFIE', 'KTP_FRONT'] as const) {
      const documentCard = page.locator(`#verification-document-${kind}`);
      const documentName = kind === 'SELFIE' ? 'Foto selfie' : 'Foto KTP depan';
      await documentCard.getByRole('button', { name: 'Lihat dokumen' }).click();
      const previewDialog = page.getByRole('dialog', { name: documentName });
      await expect(previewDialog).toBeVisible();
      await expect(previewDialog.getByRole('img', { name: `Dokumen ${documentName}` })).toBeVisible(
        {
          timeout: 15_000,
        },
      );
      await previewDialog.getByRole('button', { name: 'Tutup dialog' }).click();
      await expect(previewDialog).toBeHidden();
    }
    await customerE2E.assertNoSensitiveMarkup(page);

    const reviewer = await customerE2E.actor('reviewer', '/identity-verifications?status=PENDING');
    await reviewer.page.setViewportSize({ width: 1280, height: 900 });
    await openVerificationCase(reviewer.page, customerE2E.customer.displayName);
    const previewButtons = reviewer.page.getByRole('button', { name: 'Lihat dokumen' });
    await previewButtons.first().click();
    await expect(reviewer.page.getByRole('img', { name: /Preview privat/ }).first()).toBeVisible();

    await reviewer.page.getByRole('button', { name: 'Setujui dokumen' }).first().click();
    await reviewer.page.getByRole('button', { name: 'Lanjutkan persetujuan' }).click();
    await reviewer.page.getByRole('button', { name: 'Setujui', exact: true }).click();
    await expect(reviewer.page.getByText('Dokumen disetujui', { exact: true })).toBeVisible();
    await reviewer.page.getByRole('button', { name: 'Minta perbaikan' }).click();
    await reviewer.page.getByLabel('Alasan').selectOption('BLURRY');
    await reviewer.page.getByLabel('Catatan').fill('Foto perlu dibuat lebih tajam.');
    await reviewer.page.getByRole('button', { name: 'Lanjutkan perbaikan' }).click();
    await reviewer.page
      .getByRole('dialog', { name: 'Minta perbaikan dokumen?' })
      .getByRole('button', { name: 'Minta perbaikan', exact: true })
      .click();
    await expect(reviewer.page.getByText('Perbaikan diminta', { exact: true })).toBeVisible();

    await page.goto('/account/verification?document=KTP_FRONT');
    const rejectedCard = page.locator('#verification-document-KTP_FRONT');
    await expect(rejectedCard).toBeFocused();
    await expectCustomerNotification(page, 'Dokumen perlu diperbaiki');
    await expect(rejectedCard.getByText('Foto terlalu buram')).toBeVisible();
    await expect(
      rejectedCard.getByText('Catatan reviewer: Foto perlu dibuat lebih tajam.'),
    ).toBeVisible();
    await rejectedCard.getByRole('button', { name: 'Unggah ulang dokumen' }).click();
    await page
      .getByLabel('Pilih foto pengganti')
      .setInputFiles(customerE2E.png('ktp-pengganti-e2e.png'));
    await page.getByRole('button', { name: 'Kirim dokumen pengganti' }).click();
    await expect(page.getByText('Dokumen pengganti diterima', { exact: true })).toBeVisible();

    await openVerificationCase(reviewer.page, customerE2E.customer.displayName);
    await approveOnlyPendingDocument(reviewer.page);
    await page.goto('/account/verification');
    await expect(page.getByRole('heading', { name: 'Identitas Anda telah disetujui' })).toBeVisible(
      {
        timeout: 20_000,
      },
    );

    await page.getByRole('link', { name: 'Lihat paket' }).click();
    await expect(page).toHaveURL(/\/packages$/);
    await expect(page.getByRole('link', { name: 'Pilih paket' }).first()).toBeVisible();
    await expect(page.locator('del').first()).toBeVisible();
    const checkoutHref = await page
      .getByRole('link', { name: 'Pilih paket' })
      .first()
      .getAttribute('href');
    expect(checkoutHref).toMatch(/^\/checkout\?/);
    await page.goto(checkoutHref!);
    await page.getByLabel('Kode voucher').fill('welcome10');
    await page.getByRole('button', { name: 'Terapkan voucher' }).click();
    await expect(page.getByText('WELCOME10', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Buat pesanan dan lanjutkan pembayaran' }).click();
    const orderResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && /\/api\/v1\/orders$/.test(response.url()),
    );
    await page.getByRole('button', { name: 'Buat pesanan', exact: true }).click();
    const orderResponse = await orderResponsePromise;
    expect(orderResponse.ok()).toBe(true);
    const order = (await orderResponse.json()) as { id: string };
    await expect(page).toHaveURL(new RegExp(`/checkout\\?order=${order.id}`));
    await expect(page.getByText('Nominal yang perlu ditransfer')).toBeVisible();

    const proofInput = page.locator('input[type="file"]').last();
    await proofInput.setInputFiles(customerE2E.png('bukti-transfer-e2e.png'));
    await page.getByRole('button', { name: 'Kirim bukti pembayaran' }).click();
    await expect(page.getByText('Bukti pembayaran diterima', { exact: true })).toBeVisible({
      timeout: 30_000,
    });

    const finance = await customerE2E.actor('finance', `/workspace/payments/${order.id}`);
    await finance.page.setViewportSize({ width: 1280, height: 900 });
    await expect(finance.page.getByRole('heading', { name: 'Detail pembayaran' })).toBeVisible();
    await finance.page.getByRole('button', { name: 'Preview bukti' }).click();
    await expect(
      finance.page.getByRole('img', {
        name: `Bukti pembayaran ${customerE2E.customer.displayName}`,
      }),
    ).toBeVisible();
    await finance.page.getByRole('button', { name: 'Minta perbaikan bukti' }).click();
    await finance.page
      .getByRole('dialog', { name: 'Minta perbaikan bukti' })
      .getByRole('button', { name: 'Minta perbaikan bukti', exact: true })
      .click();
    await expect(finance.page.getByText('Perbaikan bukti diminta', { exact: true })).toBeVisible();

    await page.goto(`/checkout?order=${order.id}`);
    await page
      .locator('input[type="file"]')
      .last()
      .setInputFiles(customerE2E.png('bukti-pengganti-e2e.png'));
    await page.getByRole('button', { name: 'Kirim bukti pembayaran' }).click();
    await expect(page.getByText('Bukti pembayaran diterima', { exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await finance.page.reload();
    await finance.page.getByRole('button', { name: 'Setujui pembayaran' }).click();
    await finance.page
      .getByRole('dialog', { name: 'Setujui pembayaran' })
      .getByRole('button', { name: 'Setujui pembayaran', exact: true })
      .click();
    await expect(finance.page.getByText('Pembayaran disetujui', { exact: true })).toBeVisible();

    await page.goto(`/orders/${order.id}`);
    await expectCustomerNotification(page, 'Pembayaran disetujui');
    await expect(page.getByText('Disetujui', { exact: true }).first()).toBeVisible();
    await page.goto('/account/packages');
    await expect(page.getByRole('link', { name: 'Tambah paket' })).toHaveClass(/min-h-10/);
    await expect(page.getByRole('heading', { name: 'Movers 10' })).toBeVisible();
    await expect(page.getByText('Tersedia', { exact: true })).toBeVisible();

    const slotId = process.env.DD_CUSTOMER_E2E_SLOT_ID!;
    expect(slotId).toBeTruthy();
    await page.goto(`/bookings/new?slot=${slotId}`);
    await expect(page.getByRole('heading', { name: 'Konfirmasi kelas Anda' })).toBeVisible();
    await page.getByRole('button', { name: 'Review booking' }).click();
    const bookingResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && /\/api\/v1\/bookings$/.test(response.url()),
    );
    await page.getByRole('button', { name: 'Ya, konfirmasi booking' }).click();
    const bookingResponse = await bookingResponsePromise;
    expect(bookingResponse.ok()).toBe(true);
    const booking = (await bookingResponse.json()) as { id: string };
    await page.getByRole('link', { name: 'Lihat detail booking' }).click();
    await expect(page).toHaveURL(new RegExp(`/bookings/${booking.id}`));
    await expectCustomerNotification(page, 'Booking berhasil dibuat');
    await page.getByRole('button', { name: 'Ajukan reschedule' }).click();
    const targetStartAt = process.env.DD_CUSTOMER_E2E_TARGET_START_AT!;
    const targetLabel = new Date(targetStartAt).toLocaleString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
    const targetSelect = page.getByRole('combobox', { name: 'Jadwal tujuan', exact: true });
    await targetSelect.click();
    await page.getByRole('option', { name: new RegExp(targetLabel, 'i') }).click();
    await page.getByRole('button', { name: 'Tinjau permintaan' }).click();
    const rescheduleResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && /\/api\/v1\/reschedules$/.test(response.url()),
    );
    await page.getByRole('button', { name: 'Kirim permintaan' }).click();
    expect((await rescheduleResponsePromise).ok()).toBe(true);

    const manager = await customerE2E.actor('manager', '/workspace/bookings?tab=reschedules');
    await manager.page.setViewportSize({ width: 1280, height: 900 });
    await chooseSearchOption(
      manager.page,
      'Cabang aktif',
      process.env.DD_CUSTOMER_E2E_BRANCH_NAME ?? 'Little Rollers Jakarta',
    );
    const pendingReschedule = manager.page
      .getByRole('list', { name: 'Antrean reschedule' })
      .getByRole('listitem')
      .last();
    await expect(pendingReschedule).toBeVisible({ timeout: 20_000 });
    await pendingReschedule.getByRole('button', { name: 'Tinjau reschedule' }).click();
    await manager.page.getByRole('button', { name: 'Setujui reschedule' }).click();
    await expect(
      manager.page.getByText('Reschedule disetujui dan reservation dipindahkan secara atomik.'),
    ).toBeVisible();
    await expectCustomerNotification(page, 'Reschedule disetujui');

    customerE2E.openCheckInWindow();
    await manager.page.goto(`/workspace/bookings/${booking.id}`);
    const issueResponsePromise = manager.page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/customer-check-in-links'),
    );
    await manager.page.getByRole('button', { name: 'Buat/Kirim QR' }).click();
    const issueResponse = await issueResponsePromise;
    expect(issueResponse.ok()).toBe(true);
    const issue = (await issueResponse.json()) as { passUrl: string };
    expect(issue.passUrl).toContain('/check-in-pass#token=');
    const issuedPassUrl = new URL(issue.passUrl);
    await page.goto(`${issuedPassUrl.pathname}${issuedPassUrl.search}${issuedPassUrl.hash}`);
    await expect(page.getByRole('heading', { name: 'Pass check-in kelas' })).toBeVisible();
    await expect(page.getByLabel('QR check-in')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download QR' })).toHaveCSS(
      'background-color',
      'rgb(40, 87, 64)',
    );
    const token = decodeURIComponent(issuedPassUrl.hash.slice('#token='.length));
    await manager.page.goto('/check-in-scanner');
    await manager.page.getByLabel('Token QR manual').fill(token);
    await manager.page.getByRole('button', { name: 'Validasi check-in' }).click();
    await expect(manager.page.getByText(/Check-in berhasil|Customer sudah check-in/)).toBeVisible();

    await page.goto('/bookings');
    await expectCustomerNotification(page, 'Check-in berhasil');
    await expect(page.getByText(/Sudah hadir|Riwayat/).first()).toBeVisible();
    await page.goto('/workspace');
    await expect(page).toHaveURL(/\/classes#schedule$/);
    await customerE2E.assertNoSensitiveMarkup(page);
  });

  test('responsive shell dan accessibility customer seed', async ({ page, customerE2E }) => {
    customerE2E.observe(page);
    await page.goto('/sign-in?returnTo=%2Faccount');
    await page.getByLabel('Email', { exact: true }).fill('customer@littlerollers.local');
    await page.getByLabel('Password').fill('Customer#2026');
    await page.getByRole('button', { name: 'Masuk dengan email' }).click();
    await expect(page).toHaveURL(/\/account/);
    const studioDialog = page.getByRole('dialog', { name: 'Pilih studio utama Anda' });
    if (
      await studioDialog
        .waitFor({ state: 'visible', timeout: 10_000 })
        .then(() => true)
        .catch(() => false)
    ) {
      await studioDialog.getByRole('radio', { name: /Little Rollers Jakarta/ }).check();
      await studioDialog.getByRole('button', { name: 'Simpan studio' }).click();
      await expect(studioDialog).toBeHidden();
    }

    for (const width of [360, 390, 479, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
      await page.goto('/account');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
        await page.evaluate(() => document.documentElement.clientWidth),
      );
      if (width < 1024) {
        const trigger = page.getByRole('button', { name: 'Buka navigasi akun' });
        const box = await trigger.boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
        await trigger.click();
        const navigation = page.getByRole('dialog', { name: 'Navigasi akun' });
        await expect(navigation).toBeVisible();
        await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
        await navigation.getByRole('button', { name: 'Tutup navigasi akun' }).click();
        await expect(navigation).toBeHidden();
      } else {
        await expect(page.locator('[aria-current="page"]')).toHaveCount(1);
      }
    }
    await customerE2E.auditAccessibility(page, 'customer-account');
  });
});
