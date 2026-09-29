import { randomUUID } from 'node:crypto';
import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { prisma } from './db-helper';
import {
  STAFF_ACCOUNTS,
  cleanupSlots,
  createSlot,
  e2eSlotId,
  loadOtherInstructor,
  loadSarah,
  loginAs,
  openClassDetail,
  selectBranch,
  slotTimeLabel,
  uniqueStart,
} from './staff-helper';

/**
 * Perjalanan nyata staf + instruktur: backend, database, dan sesi dengan capability terbatas
 * (bukan super owner). Tidak ada mock; setiap langkah melewati kontrak HTTP sebenarnya.
 *
 * Menjalankan terhadap server dev lokal (web :3100, API :32121, MySQL native):
 *   TEST_DATABASE_URL=<DATABASE_URL di .env> PLAYWRIGHT_BASE_URL=http://localhost:3100 pnpm test:e2e:staff
 * Login dibatasi 5 percobaan/15 menit per akun, jadi spec ini login sekali per akun per run
 * dan memakai ulang sesinya; restart API bila ingin mengulang lebih dari ~4 kali dalam 15 menit.
 * Data uji (kelas berawalan `f1000000-0e2e-`) dibuat di beforeAll dan dihapus di afterAll.
 */

const QR_SLOT = e2eSlotId(1);
const MANUAL_SLOT = e2eSlotId(2);
const FUTURE_SLOT = e2eSlotId(3);
const OTHER_DRAFT_SLOT = e2eSlotId(4);
const ALL_SLOTS = [QR_SLOT, MANUAL_SLOT, FUTURE_SLOT, OTHER_DRAFT_SLOT];
const GREEN_GARDEN = /Green Garden/;

type Issue = { id: string; token: string; qrPayload: string; expiresAt: string };

let sarahId = '';
let qrStart: Date;
let manualStart: Date;
let draftStart: Date;
const issued: { first?: Issue; current?: Issue } = {};

const scan = async (page: Page, payload: string) => {
  await page.goto('/check-in-scanner');
  await page.getByLabel('Token QR manual').fill(payload);
  await page.getByRole('button', { name: 'Catat presensi' }).click();
};

type AccountKey = keyof typeof STAFF_ACCOUNTS;
const ACCOUNT_KEYS = Object.keys(STAFF_ACCOUNTS) as AccountKey[];
const storageStates = new Map<AccountKey, Awaited<ReturnType<BrowserContext['storageState']>>>();
const openContexts: BrowserContext[] = [];

/** Halaman dengan sesi akun yang sudah login (login sekali per akun agar tidak menabrak pembatas laju login). */
const sessionPage = async (browser: Browser, key: AccountKey) => {
  const context = await browser.newContext({ storageState: storageStates.get(key) });
  openContexts.push(context);
  return context.newPage();
};

const openStaffTimetable = async (browser: Browser) => {
  const page = await sessionPage(browser, 'admin');
  await page.goto('/workspace/classes');
  await selectBranch(page, GREEN_GARDEN);
  return page;
};

test.describe.configure({ mode: 'serial' });

test.describe('Real E2E: staf dan instruktur (presensi QR, verifikasi manual, honor)', () => {
  test.beforeAll(async ({ browser }) => {
    for (const key of ACCOUNT_KEYS) {
      const context = await browser.newContext();
      await loginAs(await context.newPage(), STAFF_ACCOUNTS[key]);
      storageStates.set(key, await context.storageState());
      await context.close();
    }
    const sarah = await loadSarah();
    sarahId = sarah.id;
    qrStart = uniqueStart(10);
    manualStart = uniqueStart(13);
    if (manualStart.getMinutes() === qrStart.getMinutes()) manualStart.setMinutes(manualStart.getMinutes() + 1);
    draftStart = uniqueStart(17);
    while ([qrStart, manualStart].some((d) => d.getMinutes() === draftStart.getMinutes()))
      draftStart.setMinutes(draftStart.getMinutes() + 1);
    const devi = await loadOtherInstructor();
    await createSlot({ id: QR_SLOT, instructorId: sarahId, startAt: qrStart });
    await createSlot({ id: MANUAL_SLOT, instructorId: sarahId, startAt: manualStart });
    await createSlot({
      id: FUTURE_SLOT,
      instructorId: sarahId,
      startAt: new Date(Date.now() + 5 * 3_600_000),
    });
    // Draft milik instruktur lain di cabang yang sama (disalin dari kelas Sarah): tidak boleh bocor ke Sarah.
    await createSlot({
      id: OTHER_DRAFT_SLOT,
      instructorId: devi.id,
      templateInstructorId: sarahId,
      startAt: draftStart,
      status: 'DRAFT',
    });
  });

  test.afterEach(async () => {
    await Promise.all(openContexts.splice(0).map((context) => context.close()));
  });

  test.afterAll(async () => {
    await cleanupSlots(ALL_SLOTS);
    await prisma.$disconnect();
  });

  test('instruktur mendarat di jadwal sendiri, hanya melihat kelasnya, dan tertutup dari area staf', async ({
    browser,
  }) => {
    const page = await sessionPage(browser, 'coachSarah');
    await page.goto('/workspace/classes');
    await expect(page).toHaveURL(/\/workspace\/classes/);
    await selectBranch(page, GREEN_GARDEN);

    const calendar = page.getByRole('region', { name: 'Kalender kelas tujuh hari' });
    await expect(
      calendar.getByRole('button', { name: new RegExp(slotTimeLabel(qrStart).replace('.', '\\.')) }),
    ).toBeVisible({ timeout: 20_000 });
    // Jadwal tim yang sudah dipublikasikan boleh terlihat; draft/batal milik instruktur lain tidak.
    const cards = await calendar.getByRole('button').allInnerTexts();
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) expect(card).toMatch(/Sarah Jenkins|Dipublikasikan/);
    await expect(
      calendar.getByRole('button', { name: new RegExp(slotTimeLabel(draftStart).replace('.', '\\.')) }),
    ).toHaveCount(0);

    for (const blocked of ['/workspace', '/workspace/payments']) {
      await page.goto(blocked);
      await expect(page).toHaveURL(/\/workspace\/classes/);
    }
    await page.goto('/check-in-scanner');
    await expect(page).toHaveURL(/\/check-in-scanner/);
    await expect(page.getByRole('heading', { name: 'Scan QR check-in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'QR pelanggan' })).toHaveCount(0);
  });

  test('instruktur tidak bisa menerbitkan QR atau memverifikasi presensinya sendiri', async ({ browser }) => {
    const page = await sessionPage(browser, 'coachSarah');
    const headers = { 'Idempotency-Key': randomUUID() };
    const issue = await page.request.post(`/api/v1/class-slots/${QR_SLOT}/instructor-check-in-tokens`, { headers });
    expect(issue.status()).toBe(403);
    const verify = await page.request.post(`/api/v1/class-slots/${QR_SLOT}/instructor-attendance`, {
      headers: { 'Idempotency-Key': randomUUID() },
      data: { notes: 'verifikasi sendiri' },
    });
    expect(verify.status()).toBe(403);
    expect(await prisma.kehadiranInstruktur.count({ where: { classSlotId: QR_SLOT } })).toBe(0);
  });

  test('staf menerbitkan QR presensi, dan menerbitkan ulang menggantikan QR sebelumnya', async ({ browser }) => {
    const page = await openStaffTimetable(browser);
    // Kontrol: staf penjadwalan melihat draft yang disembunyikan dari instruktur.
    await expect(
      page
        .getByRole('region', { name: 'Kalender kelas tujuh hari' })
        .getByRole('button', { name: new RegExp(slotTimeLabel(draftStart).replace('.', '\\.')) }),
    ).toBeVisible({ timeout: 20_000 });
    const dialog = await openClassDetail(page, qrStart);
    await expect(dialog.getByText(/Belum tercatat/)).toBeVisible();

    const firstResponse = page.waitForResponse(
      (r) => r.url().includes('/instructor-check-in-tokens') && r.request().method() === 'POST',
    );
    await dialog.getByRole('button', { name: 'Tampilkan QR presensi instruktur' }).click();
    const first = await (await firstResponse).json();
    await expect(dialog.getByRole('img', { name: 'QR presensi instruktur' })).toBeVisible();
    expect(first.qrPayload).toMatch(/^dd-checkin:v1:/);
    issued.first = first;

    const secondResponse = page.waitForResponse(
      (r) => r.url().includes('/instructor-check-in-tokens') && r.request().method() === 'POST',
    );
    await dialog.getByRole('button', { name: 'Ganti QR presensi' }).click();
    const second = await (await secondResponse).json();
    expect(second.qrPayload).not.toBe(first.qrPayload);
    issued.current = second;

    const tokens = await prisma.instructorCheckInToken.findMany({ where: { classSlotId: QR_SLOT } });
    expect(tokens).toHaveLength(2);
    expect(tokens.filter((t: { usedAt: Date | null }) => t.usedAt === null)).toHaveLength(1);
  });

  test('QR menolak instruktur lain, QR lama, dan pemakaian ulang; hanya pemilik kelas yang tercatat', async ({
    browser,
  }) => {
    const current = issued.current!.qrPayload;
    const stale = issued.first!.qrPayload;

    const other = await sessionPage(browser, 'otherInstructor');
    await scan(other, current);
    await expect(other.getByText(/tidak tersedia/i)).toBeVisible();
    await expect(other.getByText('Presensi instruktur tercatat')).toHaveCount(0);
    expect(await prisma.kehadiranInstruktur.count({ where: { classSlotId: QR_SLOT } })).toBe(0);
    const unusedAfterWrongScan = await prisma.instructorCheckInToken.count({
      where: { classSlotId: QR_SLOT, usedAt: null },
    });
    expect(unusedAfterWrongScan).toBe(1);

    const owner = await sessionPage(browser, 'coachSarah');

    await scan(owner, stale);
    await expect(owner.getByText(/sudah dipakai atau sudah diganti/)).toBeVisible();
    expect(await prisma.kehadiranInstruktur.count({ where: { classSlotId: QR_SLOT } })).toBe(0);

    await scan(owner, current);
    await expect(owner.getByText('Presensi instruktur tercatat')).toBeVisible();

    await scan(owner, current);
    await expect(owner.getByText(/sudah dipakai atau sudah diganti/)).toBeVisible();

    const rows = await prisma.kehadiranInstruktur.findMany({ where: { classSlotId: QR_SLOT } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ instructorId: sarahId, method: 'QR_SCAN', recordedById: null });
  });

  test('staf melihat presensi hasil scan dan tidak lagi ditawari verifikasi manual', async ({ browser }) => {
    const page = await openStaffTimetable(browser);
    const dialog = await openClassDetail(page, qrStart);
    await expect(dialog.getByText(/melalui scan QR/)).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Verifikasi presensi instruktur' })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: /QR presensi/ })).toHaveCount(0);
  });

  test('staf memverifikasi manual presensi instruktur yang lupa scan, dengan catatan', async ({ browser }) => {
    const page = await openStaffTimetable(browser);
    const dialog = await openClassDetail(page, manualStart);
    await expect(dialog.getByText(/Belum tercatat/)).toBeVisible();
    await dialog.getByLabel('Catatan (opsional)').fill('lupa scan, hadir sesuai daftar');
    await dialog.getByRole('button', { name: 'Verifikasi presensi instruktur' }).click();
    await page
      .getByRole('dialog', { name: 'Verifikasi presensi instruktur?' })
      .getByRole('button', { name: 'Verifikasi' })
      .click();
    await expect(page.getByText('Presensi instruktur berhasil dicatat.')).toBeVisible();

    const row = await prisma.kehadiranInstruktur.findUniqueOrThrow({ where: { classSlotId: MANUAL_SLOT } });
    expect(row).toMatchObject({
      instructorId: sarahId,
      method: 'MANUAL_FRONTDESK',
      notes: 'lupa scan, hadir sesuai daftar',
    });
    expect(row.recordedById).not.toBeNull();
  });

  test('QR dan verifikasi ditolak untuk kelas yang jendela check-in-nya belum dibuka', async ({ browser }) => {
    const page = await sessionPage(browser, 'admin');
    for (const path of ['instructor-check-in-tokens', 'instructor-attendance']) {
      const response = await page.request.post(`/api/v1/class-slots/${FUTURE_SLOT}/${path}`, {
        headers: { 'Idempotency-Key': randomUUID() },
        data: path === 'instructor-attendance' ? {} : undefined,
      });
      expect(response.status()).toBe(409);
      expect((await response.json()).error.code).toBe('CHECK_IN_TOO_EARLY');
    }
    expect(await prisma.kehadiranInstruktur.count({ where: { classSlotId: FUTURE_SLOT } })).toBe(0);
    expect(await prisma.instructorCheckInToken.count({ where: { classSlotId: FUTURE_SLOT } })).toBe(0);
  });

  test('honor: laporan keuangan dan halaman instruktur sama untuk Super Owner, dan nominal tertutup untuk Admin', async ({
    browser,
  }) => {
    await prisma.slotKelas.updateMany({ where: { id: { in: [QR_SLOT, MANUAL_SLOT] } }, data: { status: 'COMPLETED' } });
    const period = new Date().toISOString().slice(0, 7);

    const owner = await sessionPage(browser, 'superOwner');
    const finance = await (
      await owner.request.get(`/api/v1/finance/reports/instructor-cost-realtime?period=${period}`)
    ).json();
    const financeRow = finance.instructors.find((i: { instructorId: string }) => i.instructorId === sarahId);
    expect(financeRow).toBeTruthy();
    expect(financeRow.verifiedFeeRp).toBeGreaterThan(0);

    const list = await (await owner.request.get('/api/v1/instructors?q=Sarah')).json();
    const listRow = list.items.find((i: { id: string }) => i.id === sarahId);
    expect(listRow).toBeTruthy();
    expect(listRow.compensationRp).toBe(financeRow.totalFeeRp);
    expect(listRow.unverifiedCompensationRp).toBe(financeRow.unverifiedFeeRp);

    await owner.goto(`/instructors/${sarahId}`);
    const metric = owner.getByText('Honor Bulan Ini (kelas selesai)').locator('..');
    await expect(metric).toContainText(/Rp\s?[\d.]+/);

    const admin = await sessionPage(browser, 'admin');
    const adminList = await (await admin.request.get('/api/v1/instructors?q=Sarah')).json();
    const adminRow = adminList.items.find((i: { id: string }) => i.id === sarahId);
    expect(adminRow.compensationRp).toBeNull();
    expect(adminRow.unverifiedCompensationRp).toBeNull();
    expect((await admin.request.get(`/api/v1/finance/reports/instructor-cost-realtime?period=${period}`)).status()).toBe(
      403,
    );

    await admin.goto(`/instructors/${sarahId}`);
    const adminMetric = admin.getByText('Honor Bulan Ini (kelas selesai)').locator('..');
    await expect(adminMetric).toContainText('—');
    await expect(adminMetric).not.toContainText(/Rp\s?[\d.]+/);
  });
});
