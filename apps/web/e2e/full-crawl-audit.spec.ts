import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const evidenceDir = path.resolve(__dirname, '../playwright-evidence/full-crawl-audit');
const authFile = path.join(evidenceDir, 'auth-state.json');
const reportFile = path.join(evidenceDir, 'audit-report.json');

if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}

interface PageAuditResult {
  route: string;
  name: string;
  category: string;
  screenshot: string;
  pageErrors: string[];
  consoleErrors: string[];
  failedRequests: string[];
  uiFeedbackErrors: string[];
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL_ERROR';
}

const routesToAudit: Array<{ route: string; name: string; category: string }> = [
  // Operasional Studio
  { route: '/workspace', name: 'Ringkasan Dashboard', category: 'Operasional Studio' },
  { route: '/workspace/classes', name: 'Timetable Kelas', category: 'Operasional Studio' },
  { route: '/workspace/bookings', name: 'Booking & Reschedule', category: 'Operasional Studio' },
  { route: '/check-in-scanner', name: 'Scan Check-in QR', category: 'Operasional Studio' },
  { route: '/support-cases', name: 'Customer Support', category: 'Operasional Studio' },

  // Member & Pelanggan
  { route: '/customers', name: 'Customer Management', category: 'Member & Pelanggan' },
  { route: '/ledger', name: 'Sesi Customer', category: 'Member & Pelanggan' },
  { route: '/identity-verifications', name: 'Verifikasi ID Customer', category: 'Member & Pelanggan' },
  { route: '/ledger/adjustments', name: 'Penyesuaian Sesi', category: 'Member & Pelanggan' },

  // Penjualan & Keuangan
  { route: '/workspace/payments', name: 'Pemeriksaan Pembayaran', category: 'Penjualan & Keuangan' },
  { route: '/workspace/packages', name: 'Paket & Promo Harga', category: 'Penjualan & Keuangan' },
  { route: '/workspace/vouchers', name: 'Voucher Promosi', category: 'Penjualan & Keuangan' },
  { route: '/finance', name: 'Finance & Rekonsiliasi', category: 'Penjualan & Keuangan' },

  // Pengaturan & Sistem
  { route: '/workspace/branches', name: 'Master Studio/Cabang', category: 'Pengaturan & Sistem' },
  { route: '/instructors', name: 'Instructor Management', category: 'Pengaturan & Sistem' },
  { route: '/users', name: 'Pengguna & Staf Internal', category: 'Pengaturan & Sistem' },
  { route: '/users/roles-permissions', name: 'Roles & Permissions', category: 'Pengaturan & Sistem' },
  { route: '/assignments', name: 'Penugasan Cabang', category: 'Pengaturan & Sistem' },
  { route: '/master', name: 'Master Data Global', category: 'Pengaturan & Sistem' },
  { route: '/audit', name: 'Audit Log & Akses', category: 'Pengaturan & Sistem' },
  { route: '/notification-management', name: 'Notification Management', category: 'Pengaturan & Sistem' },
  { route: '/public-content-management', name: 'Public Content Management', category: 'Pengaturan & Sistem' },
  { route: '/operations', name: 'Evaluasi kuota H-24', category: 'Pengaturan & Sistem' },
  { route: '/health', name: 'Status Sistem Health', category: 'Pengaturan & Sistem' },

  // Customer Self-Service / Publik
  { route: '/account', name: 'Dashboard Customer', category: 'Customer Self-Service' },
  { route: '/account/profile', name: 'Profil Customer', category: 'Customer Self-Service' },
  { route: '/account/verification', name: 'Verifikasi Saya', category: 'Customer Self-Service' },
  { route: '/classes', name: 'Katalog Jadwal Publik', category: 'Customer Self-Service' },
  { route: '/packages', name: 'Katalog Paket Publik', category: 'Customer Self-Service' },
  { route: '/bookings', name: 'Booking Saya', category: 'Customer Self-Service' },
  { route: '/orders', name: 'Pesanan Saya', category: 'Customer Self-Service' },
  { route: '/account/packages', name: 'Paket Saya', category: 'Customer Self-Service' },
];

test.describe.serial('Full Crawl Audit Suite Across Entire Application', () => {
  const auditResults: PageAuditResult[] = [];

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ baseURL: 'http://127.0.0.1:32120' });
    const page = await context.newPage();
    await page.goto('/sign-in');
    await page.getByLabel('Email', { exact: true }).fill('ralamzah@gmail.com');
    await page.getByLabel('Password').fill('ridho123');
    await page.getByRole('button', { name: 'Masuk dengan email' }).click();
    await expect(page).not.toHaveURL(/\/sign-in(?:\?|$)/, { timeout: 20000 });
    await context.storageState({ path: authFile });
    await context.close();
  });

  test.afterAll(() => {
    fs.writeFileSync(reportFile, JSON.stringify(auditResults, null, 2), 'utf-8');
    console.info(`\n========================================`);
    console.info(`[AUDIT COMPLETE] Written to ${reportFile}`);
    console.info(`Total Pages Audited: ${auditResults.length}`);
    const critical = auditResults.filter((r) => r.status === 'CRITICAL_ERROR');
    const warning = auditResults.filter((r) => r.status === 'WARNING');
    const healthy = auditResults.filter((r) => r.status === 'HEALTHY');
    console.info(`Healthy: ${healthy.length} | Warnings: ${warning.length} | Critical: ${critical.length}`);
    console.info(`========================================\n`);
  });

  for (const [index, pageTarget] of routesToAudit.entries()) {
    test(`[Audit ${index + 1}/${routesToAudit.length}]: ${pageTarget.route} (${pageTarget.name})`, async ({ browser }) => {
      const context = await browser.newContext({
        baseURL: 'http://127.0.0.1:32120',
        storageState: authFile,
      });
      const page = await context.newPage();

      await page.addInitScript(() => {
        sessionStorage.setItem('dd_active_branch', '6487b893-72f6-4b80-8bb8-0c2c4860eff6');
      });

      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];
      const uiFeedbackErrors: string[] = [];

      page.on('pageerror', (err) => {
        pageErrors.push(err.message);
      });

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!text.includes('favicon.ico') && !text.includes('Download the React DevTools')) {
            consoleErrors.push(text);
          }
        }
      });

      page.on('response', (res) => {
        if (res.status() >= 400 && !res.url().includes('favicon.ico')) {
          failedRequests.push(`HTTP ${res.status()} on ${res.url()}`);
        }
      });

      const safeFileName = pageTarget.route.replace(/\//g, '_').replace(/^_/, '') || 'home';
      const screenshotPath = path.join(evidenceDir, `${String(index + 1).padStart(2, '0')}-${safeFileName}.png`);

      try {
        await page.goto(pageTarget.route, { timeout: 60000, waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        const errorAlerts = page.locator('[role="alert"], .feedback-error, .text-dd-danger, [aria-live="assertive"]');
        const count = await errorAlerts.count();
        for (let i = 0; i < count; i++) {
          const alert = errorAlerts.nth(i);
          if (await alert.isVisible()) {
            const text = (await alert.textContent())?.trim();
            if (text && text.length > 2 && !uiFeedbackErrors.includes(text)) {
              uiFeedbackErrors.push(text);
            }
          }
        }

        const bodyText = await page.locator('body').innerText();
        const crashKeywords = [
          'TypeError:',
          'Cannot read properties',
          'Layanan tidak dapat dijangkau',
          'belum dapat dimuat',
          'Terjadi kesalahan',
          'Application error: a client-side exception has occurred',
        ];
        for (const kw of crashKeywords) {
          if (bodyText.includes(kw) && !uiFeedbackErrors.some((t) => t.includes(kw))) {
            const snippet = bodyText
              .split('\n')
              .filter((line) => line.includes(kw))
              .join(' | ')
              .slice(0, 160);
            uiFeedbackErrors.push(snippet);
          }
        }

        await page.screenshot({ path: screenshotPath, fullPage: true });
      } catch (err: any) {
        pageErrors.push(`Navigation Failure: ${err.message}`);
      }

      let status: 'HEALTHY' | 'WARNING' | 'CRITICAL_ERROR' = 'HEALTHY';
      if (pageErrors.length > 0 || uiFeedbackErrors.some((t) => t.includes('TypeError') || t.includes('Application error'))) {
        status = 'CRITICAL_ERROR';
      } else if (failedRequests.length > 0 || uiFeedbackErrors.length > 0 || consoleErrors.length > 0) {
        status = 'WARNING';
      }

      auditResults.push({
        route: pageTarget.route,
        name: pageTarget.name,
        category: pageTarget.category,
        screenshot: `${String(index + 1).padStart(2, '0')}-${safeFileName}.png`,
        pageErrors,
        consoleErrors,
        failedRequests,
        uiFeedbackErrors,
        status,
      });

      console.info(
        `[${status}] ${pageTarget.route} -> PageErrors: ${pageErrors.length}, FailedHTTP: ${failedRequests.length}, ConsoleErrors: ${consoleErrors.length}, UIFeedback: ${uiFeedbackErrors.length}`,
      );

      await context.close();
    });
  }
});
