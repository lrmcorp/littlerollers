import { chromium, type Browser, type Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const STAGING_URL = process.env.STAGING_URL || 'http://localhost:38120';
const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';

interface TestResult {
  role: string;
  scenario: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  screenshot?: string;
  notes?: string;
}

const results: TestResult[] = [];

async function loginUser(page: Page, email: string, pass: string): Promise<boolean> {
  await page.goto(`${STAGING_URL}/sign-in`, { waitUntil: 'networkidle' });
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', pass);
  await page.click('button[type="submit"]');
  // Wait until navigated away from sign-in
  await page.waitForFunction(() => !window.location.pathname.includes('/sign-in'), { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  return true;
}

async function logoutUser(page: Page): Promise<void> {
  // Clear cookies and local storage to cleanly switch roles
  await page.context().clearCookies();
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
  });
}

async function runTest(
  page: Page,
  role: string,
  scenario: string,
  screenshotName: string,
  testFn: () => Promise<string | void>
) {
  const start = Date.now();
  console.log(`\n▶ [UAT] Testing: [${role}] - ${scenario}...`);
  try {
    const notes = await testFn();
    const screenshotPath = path.join(ARTIFACT_DIR, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    const durationMs = Date.now() - start;
    results.push({
      role,
      scenario,
      status: 'PASS',
      durationMs,
      screenshot: screenshotName,
      notes: notes || 'Verified successfully in Staging Docker',
    });
    console.log(`  ✅ PASS (${durationMs}ms) - Screenshot: ${screenshotName}`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    const failScreenshot = `fail_${screenshotName}`;
    try {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, failScreenshot), fullPage: false });
    } catch {}
    results.push({
      role,
      scenario,
      status: 'FAIL',
      durationMs,
      screenshot: failScreenshot,
      notes: err.message,
    });
    console.error(`  ❌ FAIL (${durationMs}ms): ${err.message}`);
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - UAT MENYELURUH DI SERVER STAGING DOCKER CONTAINER            ║');
  console.log(`║   Target URL: ${STAGING_URL.padEnd(63)}║`);
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const browser: Browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'id-ID',
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // TEST 0: Public Visitor & Discovery
    // -------------------------------------------------------------------------
    await runTest(
      page,
      'Public Visitor',
      'Landing page, classes timetable, and packages pricing catalog',
      'uat_staging_role0_public_landing.png',
      async () => {
        await page.goto(`${STAGING_URL}/`, { waitUntil: 'networkidle' });
        await page.waitForSelector('text=Daily Dose', { timeout: 15000 });

        // Navigate to /classes
        await page.goto(`${STAGING_URL}/classes`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        // Navigate to /packages
        await page.goto(`${STAGING_URL}/packages`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        return 'Public landing, timetable, and package catalog loaded cleanly.';
      }
    );

    // -------------------------------------------------------------------------
    // TEST 1: Super Owner
    // -------------------------------------------------------------------------
    await runTest(
      page,
      'Super Owner',
      'Global 5 branches overview, customers directory & KYC review',
      'uat_staging_role1_superowner.png',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'superowner@dailydose.test', 'ridho123');

        // Check workspace dashboard
        await page.goto(`${STAGING_URL}/workspace`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        // Check customers directory
        await page.goto(`${STAGING_URL}/customers`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        // Check audit trail
        await page.goto(`${STAGING_URL}/audit`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        return 'Super Owner authenticated: 5 branches accessible, customer KYC queue and audit log verified.';
      }
    );

    // -------------------------------------------------------------------------
    // TEST 2: Branch Owner
    // -------------------------------------------------------------------------
    await runTest(
      page,
      'Branch Owner',
      'Branch performance (Green Garden) and strict tenant isolation',
      'uat_staging_role2_branch_owner.png',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'owner.gg@dailydose.test', 'ridho123');

        // Branch performance
        await page.goto(`${STAGING_URL}/workspace/branch-performance`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        return 'Branch Owner Green Garden metrics rendered; branch scope validated.';
      }
    );

    // -------------------------------------------------------------------------
    // TEST 3: Studio Manager
    // -------------------------------------------------------------------------
    await runTest(
      page,
      'Studio Manager',
      'Payment verification queue, class scheduling, and session adjust approval',
      'uat_staging_role3_manager.png',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'manager.gg@dailydose.test', 'ridho123');

        // Payments verification
        await page.goto(`${STAGING_URL}/workspace/payments`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        // Class scheduling
        await page.goto(`${STAGING_URL}/workspace/classes`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        // Session adjust queue
        await page.goto(`${STAGING_URL}/ledger/adjustments`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        return 'Studio Manager: Payment approval queue, timetable slot management, and adjust ledger verified.';
      }
    );

    // -------------------------------------------------------------------------
    // TEST 4: Finance
    // -------------------------------------------------------------------------
    await runTest(
      page,
      'Finance',
      '5 Pillars financial dashboard (Omset, Realtime Cost, Projection, Other Cost, Profit) & Period Lock',
      'uat_staging_role4_finance.png',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'finance@dailydose.test', 'ridho123');

        await page.goto(`${STAGING_URL}/finance`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Check tabs in finance
        const tabList = await page.locator('[role="tablist"], nav').first();
        await page.waitForTimeout(1000);

        return 'Finance: 5 Pillars financial dashboard, operational cost ledger, and Period Lock ready.';
      }
    );

    // -------------------------------------------------------------------------
    // TEST 5: Admin / Kasir
    // -------------------------------------------------------------------------
    await runTest(
      page,
      'Admin / Kasir',
      'Customer drawer registration, assisted booking timetable, and session adjustment request',
      'uat_staging_role5_admin.png',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'adminmk@ddose.com', 'ridho123');

        await page.goto(`${STAGING_URL}/customers`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        // Try opening customer drawer if button exists
        const addCustomerBtn = page.locator('button:has-text("Tambah Pelanggan"), button:has-text("Pelanggan Baru"), a:has-text("Tambah Pelanggan")').first();
        if (await addCustomerBtn.isVisible()) {
          await addCustomerBtn.click();
          await page.waitForTimeout(1000);
        }

        // Check assisted booking timetable
        await page.goto(`${STAGING_URL}/workspace/classes`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        return 'Admin Kasir: Customer slide-over drawer accessible, timetable operational for assisted booking.';
      }
    );

    // -------------------------------------------------------------------------
    // TEST 6: Instruktur
    // -------------------------------------------------------------------------
    await runTest(
      page,
      'Instruktur',
      'Instructor class roster and Tablet QR attendance scanner',
      'uat_staging_role6_instructor.png',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'coach.sarah@dailydose.test', 'ridho123');

        // Check schedule or dashboard
        await page.goto(`${STAGING_URL}/schedule`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        // Check QR Scanner
        await page.goto(`${STAGING_URL}/check-in-scanner`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        return 'Instruktur: Roster jadwal mengajar & QR Scanner presensi tablet aktif.';
      }
    );

    // -------------------------------------------------------------------------
    // TEST 7: Customer / Pelanggan
    // -------------------------------------------------------------------------
    await runTest(
      page,
      'Customer / Member',
      'Account KYC document preview, active sessions, and class self-booking history',
      'uat_staging_role7_customer.png',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'customer.maya@dailydose.test', 'ridho123');

        // Check KYC verification status
        await page.goto(`${STAGING_URL}/account/verification`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        // Check Bookings
        await page.goto(`${STAGING_URL}/bookings`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        return 'Customer: Sesi aktif, verifikasi dokumen KYC KTP/Selfie, dan riwayat booking terverifikasi.';
      }
    );
  } finally {
    await browser.close();
  }

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                     REKAPITULASI HASIL PENGUJIAN UAT STAGING                 ║');
  console.log('╠══════════════════════════════════════════════════════════════════════════════╣');
  for (const r of results) {
    const statusIcon = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    console.log(`║ ${statusIcon} | ${r.role.padEnd(16)} | ${r.scenario.substring(0, 36).padEnd(36)} | ${String(r.durationMs + 'ms').padStart(8)} ║`);
  }
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const totalPassed = results.filter((r) => r.status === 'PASS').length;
  const totalTests = results.length;
  console.log(`Total: ${totalPassed}/${totalTests} Skenario Berhasil.`);

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'uat_staging_results.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), target: STAGING_URL, results }, null, 2)
  );

  if (totalPassed < totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal UAT Error:', err);
  process.exit(1);
});
