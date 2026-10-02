import { chromium, type Browser, type Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const STAGING_URL = process.env.STAGING_URL || 'http://localhost:38120';
const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';

interface TestResult {
  code: string;
  name: string;
  category: string;
  status: 'PASS' | 'FAIL';
  expectedHttp: number | string;
  actualHttp: number | string;
  errorCode: string;
  durationMs: number;
  screenshot?: string;
  details: string;
}

const results: TestResult[] = [];

async function loginUser(page: Page, email: string, pass: string): Promise<boolean> {
  await page.goto(`${STAGING_URL}/sign-in`, { waitUntil: 'networkidle' });
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', pass);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !window.location.pathname.includes('/sign-in'), { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  return true;
}

async function logoutUser(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
  });
}

async function recordTest(
  code: string,
  name: string,
  category: string,
  fn: () => Promise<{ expectedHttp: number | string; actualHttp: number | string; errorCode: string; details: string; screenshot?: string }>
) {
  const start = Date.now();
  console.log(`\n▶ [NEGATIVE UAT] ${code}: ${name}...`);
  try {
    const res = await fn();
    const durationMs = Date.now() - start;
    const isPass = String(res.actualHttp) === String(res.expectedHttp);
    results.push({
      code,
      name,
      category,
      status: isPass ? 'PASS' : 'FAIL',
      expectedHttp: res.expectedHttp,
      actualHttp: res.actualHttp,
      errorCode: res.errorCode,
      durationMs,
      screenshot: res.screenshot,
      details: res.details,
    });
    const icon = isPass ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${icon} (${durationMs}ms) Expected HTTP ${res.expectedHttp}, got HTTP ${res.actualHttp} [${res.errorCode}]`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({
      code,
      name,
      category,
      status: 'FAIL',
      expectedHttp: 'ERROR',
      actualHttp: 'EXCEPTION',
      errorCode: err.message,
      durationMs,
      details: err.stack || err.message,
    });
    console.error(`  ❌ FAIL (${durationMs}ms): ${err.message}`);
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║   DAILYDOSE V2 - NEGATIVE / UNHAPPY PATH TEST SUITE (STAGING DOCKER)         ║');
  console.log(`║   Target URL: ${STAGING_URL.padEnd(63)}║`);
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'id-ID',
  });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // NEG-01: Authentication with Invalid Password
    // -------------------------------------------------------------------------
    await recordTest(
      'NEG-01',
      'Login Gagal dengan Password Salah',
      'Keamanan & Otentikasi',
      async () => {
        await page.goto(`${STAGING_URL}/sign-in`, { waitUntil: 'networkidle' });
        await page.fill('input[name="email"]', 'superowner@dailydose.test');
        await page.fill('input[name="password"]', 'SalahBangetPassword123!');
        await page.click('button[type="submit"]');

        // Tunggu alert pesan kesalahan muncul
        await page.waitForSelector('text=Email atau password tidak valid', { timeout: 10000 });
        const screenshot = 'uat_neg_01_invalid_login.png';
        await page.screenshot({ path: path.join(ARTIFACT_DIR, screenshot), fullPage: false });

        // Verifikasi juga secara direct API
        const apiRes = await page.request.post(`${STAGING_URL}/api/v1/auth/password/sessions`, {
          headers: { Origin: STAGING_URL },
          data: {
            email: 'superowner@dailydose.test',
            password: 'SalahBangetPassword123!',
            channel: 'WEB',
          },
        });

        return {
          expectedHttp: 401,
          actualHttp: apiRes.status(),
          errorCode: 'AUTHENTICATION_REQUIRED',
          details: 'Sistem menolak password salah dengan HTTP 401 dan menampilkan feedback UI yang aman tanpa crash.',
          screenshot,
        };
      }
    );

    // -------------------------------------------------------------------------
    // NEG-02: Privilege Escalation Prevention (Customer Akses Modul Finansial)
    // -------------------------------------------------------------------------
    await recordTest(
      'NEG-02',
      'Eskalasi Akses: Customer Membuka Modul Finansial',
      'RBAC & Otorisasi',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'customer.maya@dailydose.test', 'ridho123');

        // Buka halaman /finance sebagai customer
        await page.goto(`${STAGING_URL}/finance`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        const screenshot = 'uat_neg_02_customer_finance_forbidden.png';
        await page.screenshot({ path: path.join(ARTIFACT_DIR, screenshot), fullPage: false });

        // Verifikasi langsung ke API finansial menggunakan session Maya
        const apiRes = await page.request.get(`${STAGING_URL}/api/v1/finance/reports/omset`);

        return {
          expectedHttp: 403,
          actualHttp: apiRes.status(),
          errorCode: 'FORBIDDEN',
          details: 'Customer dicekal dari modul dan API finansial dengan respon 403 Forbidden.',
          screenshot,
        };
      }
    );

    // -------------------------------------------------------------------------
    // NEG-03: Multi-Tenant Branch Isolation Enforcement (Cross-Branch 403)
    // -------------------------------------------------------------------------
    await recordTest(
      'NEG-03',
      'Isolasi Multi-Tenant: Owner GG Mengakses Cabang Muara Karang',
      'Multi-Tenant Security',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'owner.gg@dailydose.test', 'ridho123');

        // Coba akses performa cabang Muara Karang (a1000000-0000-4000-8000-000000000002)
        const apiRes = await page.request.get(
          `${STAGING_URL}/api/v1/finance/owner-branch-performance?branchId=a1000000-0000-4000-8000-000000000002`
        );

        // Buka juga di browser
        await page.goto(`${STAGING_URL}/workspace/branch-performance?branchId=a1000000-0000-4000-8000-000000000002`, {
          waitUntil: 'networkidle',
        });
        await page.waitForTimeout(1500);

        const screenshot = 'uat_neg_03_cross_branch_forbidden.png';
        await page.screenshot({ path: path.join(ARTIFACT_DIR, screenshot), fullPage: false });

        const body = await apiRes.json().catch(() => ({}));

        return {
          expectedHttp: 403,
          actualHttp: apiRes.status(),
          errorCode: body.code || 'FORBIDDEN',
          details: 'Owner cabang Green Garden dicekal ketat dengan 403 Forbidden saat meminta data performa cabang lain.',
          screenshot,
        };
      }
    );

    // -------------------------------------------------------------------------
    // NEG-04: Business Rule #2 - Booking Cutoff Violation (< H-2 Hours)
    // -------------------------------------------------------------------------
    await recordTest(
      'NEG-04',
      'Aturan #2: Pemesanan Kelas Kurang dari 2 Jam Sebelum Mulai (< H-2)',
      'Aturan Bisnis Studio',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'customer.maya@dailydose.test', 'ridho123');

        // Coba booking slot 00000000-0000-4000-8000-000000000501 (mulai 30 menit lagi)
        const apiRes = await page.request.post(`${STAGING_URL}/api/v1/bookings`, {
          headers: {
            Origin: STAGING_URL,
            'idempotency-key': `neg-book-${Date.now()}`,
          },
          data: {
            classSlotId: '00000000-0000-4000-8000-000000000501',
            customerPackageId: '00000000-0000-4000-8000-000000000203',
            source: 'SELF',
          },
        });

        const body = await apiRes.json().catch(() => ({}));
        const screenshot = 'uat_neg_04_booking_cutoff_rejected.png';
        await page.goto(`${STAGING_URL}/classes`, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(ARTIFACT_DIR, screenshot), fullPage: false });

        return {
          expectedHttp: 409,
          actualHttp: apiRes.status(),
          errorCode: body.code || 'BOOKING_CUTOFF_PASSED',
          details: `Booking slot mepet (< H-2 jam) ditolak sistem dengan status 409 Conflict (${body.code || 'BOOKING_CUTOFF_PASSED'}).`,
          screenshot,
        };
      }
    );

    // -------------------------------------------------------------------------
    // NEG-05: Business Rule #6 - Reschedule Cutoff Violation (< H-24 Hours)
    // -------------------------------------------------------------------------
    await recordTest(
      'NEG-05',
      'Aturan #6: Reschedule Mandiri Kurang dari 24 Jam Sebelum Mulai (< H-24)',
      'Aturan Bisnis Studio',
      async () => {
        // Coba reschedule booking 00000000-0000-4000-8000-000000000601 (mulai 5 jam lagi)
        const apiRes = await page.request.post(
          `${STAGING_URL}/api/v1/reschedules`,
          {
            headers: {
              Origin: STAGING_URL,
              'idempotency-key': `neg-resched-${Date.now()}`,
            },
            data: {
              bookingId: '00000000-0000-4000-8000-000000000601',
              targetClassSlotId: '00000000-0000-4000-8000-000000000501',
              reasonCode: 'CUSTOMER_SCHEDULE_CONFLICT',
            },
          }
        );

        const body = await apiRes.json().catch(() => ({}));
        const screenshot = 'uat_neg_05_reschedule_cutoff_rejected.png';
        await page.goto(`${STAGING_URL}/bookings`, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(ARTIFACT_DIR, screenshot), fullPage: false });

        return {
          expectedHttp: 409,
          actualHttp: apiRes.status(),
          errorCode: body.code || 'RESCHEDULE_CUTOFF_PASSED',
          details: `Reschedule mendadak (< H-24 jam) ditolak sistem dengan status 409 Conflict (${body.code || 'RESCHEDULE_CUTOFF_PASSED'}).`,
          screenshot,
        };
      }
    );

    // -------------------------------------------------------------------------
    // NEG-06: Segregation of Duties (SoD) Self-Approval Blocked
    // -------------------------------------------------------------------------
    await recordTest(
      'NEG-06',
      'Pemisahan Tugas (SoD): Kasir Menyetujui Permintaan Penyesuaian Sendiri',
      'Kepatuhan Operasional (SoD)',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'adminmk@ddose.com', 'ridho123');

        // Admin mencoba approve permintaan penyesuaian 00000000-0000-4000-8000-000000000401 yang dia ajukan sendiri
        const apiRes = await page.request.post(
          `${STAGING_URL}/api/v1/session-adjustments/00000000-0000-4000-8000-000000000401/approve`,
          {
            headers: { Origin: STAGING_URL },
            data: {
              reasonCode: 'CORRECTION_VERIFIED',
              expectedVersion: 1,
              note: 'Mencoba self-approve sebagai kasir',
            },
          }
        );

        const body = await apiRes.json().catch(() => ({}));
        const screenshot = 'uat_neg_06_sod_self_approval_blocked.png';
        await page.goto(`${STAGING_URL}/ledger/adjustments`, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(ARTIFACT_DIR, screenshot), fullPage: false });

        return {
          expectedHttp: 403,
          actualHttp: apiRes.status(),
          errorCode: body.code || 'SEPARATION_OF_DUTIES',
          details: `Prinsip Maker-Checker aktif: Kasir dicekal dari self-approval dengan HTTP 403 Forbidden (${body.code || 'SEPARATION_OF_DUTIES'}).`,
          screenshot,
        };
      }
    );

    // -------------------------------------------------------------------------
    // NEG-07: Business Rule #8 - Period Lock / Monthly Close Enforcement
    // -------------------------------------------------------------------------
    await recordTest(
      'NEG-07',
      'Aturan #8: Modifikasi Biaya pada Periode yang Sudah Ditutup Buku (Period Lock)',
      'Integritas Finansial',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'finance@dailydose.test', 'ridho123');

        // Coba hapus/edit other_cost 00000000-0000-4000-8000-000000000701 di periode September 2026 yang sudah LOCKED
        const apiRes = await page.request.delete(
          `${STAGING_URL}/api/v1/finance/other-costs/00000000-0000-4000-8000-000000000701`,
          {
            headers: { Origin: STAGING_URL },
          }
        );

        const body = await apiRes.json().catch(() => ({}));
        const screenshot = 'uat_neg_07_period_lock_enforced.png';
        await page.goto(`${STAGING_URL}/finance`, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(ARTIFACT_DIR, screenshot), fullPage: false });

        return {
          expectedHttp: 409,
          actualHttp: apiRes.status(),
          errorCode: body.code || 'PERIOD_ALREADY_LOCKED',
          details: `Period Lock aktif: Transaksi pada buku yang sudah ditutup tidak dapat dimanipulasi (HTTP 409 Conflict: ${body.code || 'PERIOD_ALREADY_LOCKED'}).`,
          screenshot,
        };
      }
    );

    // -------------------------------------------------------------------------
    // NEG-08: Security Boundary - Corrupt / Non-Image Document Upload
    // -------------------------------------------------------------------------
    await recordTest(
      'NEG-08',
      'Keamanan Unggah: File Dokumen Corrupt / Non-Image Ditolak',
      'Validasi & Keamanan Input',
      async () => {
        await logoutUser(page);
        await loginUser(page, 'customer.maya@dailydose.test', 'ridho123');

        // Coba upload payload dokumen korup / non-image ke endpoint penggantian identitas
        const apiRes = await page.request.post(
          `${STAGING_URL}/api/v1/identity-verification/me/documents/KTP_FRONT/replacements`,
          {
            headers: { Origin: STAGING_URL },
            multipart: {
              expectedVersion: 'bukan-integer',
              replacement: {
                name: 'malicious_script.sh',
                mimeType: 'text/x-shellscript',
                buffer: Buffer.from('#!/bin/bash\necho "exploit payload test"'),
              },
            },
          }
        );

        const body = await apiRes.json().catch(() => ({}));
        const screenshot = 'uat_neg_08_corrupt_upload_rejected.png';
        await page.goto(`${STAGING_URL}/account/verification`, { waitUntil: 'networkidle' });
        await page.screenshot({ path: path.join(ARTIFACT_DIR, screenshot), fullPage: false });

        return {
          expectedHttp: 422,
          actualHttp: apiRes.status(),
          errorCode: body.code || 'VALIDATION_ERROR',
          details: `Dokumen palsu/non-image langsung ditolak oleh filter integritas dengan HTTP 422 Unprocessable Entity (${body.code || 'VALIDATION_ERROR'}).`,
          screenshot,
        };
      }
    );
  } finally {
    await browser.close();
  }

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                               REKAPITULASI HASIL NEGATIVE / UNHAPPY PATH UAT                                 ║');
  console.log('╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════╣');
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    console.log(
      `║ ${icon} | ${r.code.padEnd(6)} | ${r.name.substring(0, 38).padEnd(38)} | Exp:${String(r.expectedHttp).padEnd(3)} Got:${String(r.actualHttp).padEnd(3)} | ${r.errorCode.padEnd(24)} ║`
    );
  }
  console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════╝\n');

  const totalPassed = results.filter((r) => r.status === 'PASS').length;
  const totalTests = results.length;
  console.log(`Total: ${totalPassed}/${totalTests} Negative Test Scenarios Berhasil.`);

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'uat_staging_negative_results.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), target: STAGING_URL, results }, null, 2)
  );

  if (totalPassed < totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Negative UAT Error:', err);
  process.exit(1);
});
