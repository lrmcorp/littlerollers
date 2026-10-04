import { chromium } from '@playwright/test';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err));
  page.on('response', async res => {
    if (res.url().includes('class-slot')) {
      try {
        console.log('[API RESPONSE]', res.status(), res.url(), await res.text());
      } catch (e) {}
    }
  });

  await page.goto('http://localhost:32120/sign-in', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'admin.gg@dailydose.test');
  await page.fill('input[name="password"]', 'AdminPass123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.pathname.includes('/sign-in'));

  await page.goto('http://localhost:32120/workspace/classes', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const branchCombobox = page.getByRole('combobox', { name: 'Cabang aktif' });
  if (await branchCombobox.isVisible()) {
    await branchCombobox.click();
    await page.getByRole('option', { name: /Green Garden/i }).first().click();
    await page.waitForTimeout(1500);
  }

  await page.locator('button', { hasText: /^buat kelas$/i }).click();
  await page.waitForSelector('form#class-slot-create-form');

  const form = page.locator('form#class-slot-create-form');
  await form.getByRole('combobox', { name: 'Tipe kelas' }).click();
  await page.getByRole('option', { name: /Group Class/i }).first().click();

  await form.getByRole('combobox', { name: 'Area Studio' }).click();
  await page.getByRole('option', { name: /Studio 1/i }).first().click();

  await form.getByRole('combobox', { name: 'Ruangan' }).click();
  await page.getByRole('option', { name: /Studio 1|RM-1/i }).first().click();

  await form.getByRole('combobox', { name: 'Instruktur' }).click();
  await page.getByRole('option', { name: /Coach Clara/i }).first().click();

  await form.getByLabel('Tanggal').fill('2026-10-05');
  await form.getByLabel('Mulai').fill('09:00');
  await form.getByLabel('Selesai eksklusif').fill('09:50');

  // Cek isi form sebelum submit
  const formData = await page.evaluate(() => {
    const f = document.querySelector('form#class-slot-create-form') as HTMLFormElement;
    const fd = new FormData(f);
    return Object.fromEntries(fd.entries());
  });
  console.log('[FORM DATA EVAL]', formData);

  await page.locator('button[form="class-slot-create-form"]').click();
  await page.waitForTimeout(1000);

  const modal = page.getByRole('dialog', { name: 'Buat draft kelas?' });
  console.log('[MODAL VISIBLE?]', await modal.isVisible());
  if (await modal.isVisible()) {
    await modal.getByRole('button', { name: /^buat draft$/i }).click();
    console.log('[MODAL CONFIRM CLICKED]');
  }

  await page.waitForTimeout(4000);
  await browser.close();
}

test().catch(console.error);
