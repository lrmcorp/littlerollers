import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/333feedc-d1a8-426a-a687-11b851b47504';
const WEB_BASE_URL = 'http://localhost:32120';
const API_BASE_URL = 'http://localhost:32121';

const CUSTOMER_CREDENTIALS = {
  email: 'customer.maya@dailydose.test',
  password: 'ridho123',
};

const results = {
  deepTesting: [],
  negativeTesting: [],
  stressTesting: [],
  uatScreenshots: [],
};

function record(category, testName, passed, details = '') {
  results[category].push({ testName, status: passed ? 'PASS' : 'FAIL', details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category.toUpperCase()}] ${testName}: ${details}`);
}

async function run() {
  console.log('🚀 Starting Comprehensive Deep, Negative, Stress Testing, and Visual UAT...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  // Listen for console errors or unhandled exceptions
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      pageErrors.push(msg.text());
    }
  });

  try {
    // =========================================================================
    // 1. DEEP TESTING
    // =========================================================================
    console.log('\n--- PHASE 1: DEEP TESTING ---');

    // 1.1 Login as Customer
    await page.goto(`${WEB_BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"], input[id*="email"]', CUSTOMER_CREDENTIALS.email);
    await page.fill('input[type="password"], input[name="password"], input[id*="password"]', CUSTOMER_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 10000 });
    const currentUrlAfterLogin = page.url();
    record('deepTesting', 'Customer Login Successful', true, `Navigated to ${currentUrlAfterLogin}`);

    // Wait for DOM to stabilize
    await page.waitForTimeout(1500);

    // 1.2 Customer Shell vs Admin Shell DOM Verification
    const customerShellCount = await page.locator('[data-customer-shell]').count();
    const adminShellCount = await page.locator('[data-admin-shell]').count();
    const adminSidebarCount = await page.locator('#admin-sidebar, [aria-label="Navigasi admin"]').count();

    record(
      'deepTesting',
      'Shell Architecture Isolation',
      customerShellCount === 1 && adminShellCount === 0 && adminSidebarCount === 0,
      `data-customer-shell: ${customerShellCount}, data-admin-shell: ${adminShellCount}, admin-sidebar: ${adminSidebarCount}`,
    );

    // 1.3 Desktop Header Navigation Deep Audit
    const navItems = await page.locator('nav[aria-label="Navigasi customer"] a').allTextContents();
    const cleanedNavItems = navItems.map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const expectedNav = ['Dashboard', 'Jadwal', 'Paket', 'Booking', 'Pesanan'];
    const hasOnlyCustomerNav = expectedNav.every((item) => cleanedNavItems.some((n) => n.includes(item)));
    const hasForbiddenNav = cleanedNavItems.some((n) =>
      ['Workspace', 'Cabang', 'Voucher', 'Audit', 'Finance', 'Migrasi', 'Pengguna'].some((f) => n.includes(f)),
    );

    record(
      'deepTesting',
      'Customer Primary Navigation Audit',
      hasOnlyCustomerNav && !hasForbiddenNav,
      `Nav items found: [${cleanedNavItems.join(', ')}]`,
    );

    // 1.4 Profile Dropdown Deep Inspection (Workspace Button Removal Verification)
    const profileTrigger = page.locator('button[aria-controls="customer-profile-menu"], button[aria-label*="Menu profil"]');
    await profileTrigger.click();
    await page.waitForSelector('#customer-profile-menu', { timeout: 5000 });

    const menuItems = await page.locator('#customer-profile-menu a, #customer-profile-menu button').allTextContents();
    const cleanedMenuItems = menuItems.map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);

    const hasWorkspaceInDropdown = cleanedMenuItems.some((t) =>
      t.toLowerCase().includes('workspace'),
    );

    record(
      'deepTesting',
      'Dropdown Profile Zero Workspace Leakage',
      !hasWorkspaceInDropdown,
      `Items: [${cleanedMenuItems.join(', ')}] | Workspace found: ${hasWorkspaceInDropdown}`,
    );

    // Screenshot UAT: Dropdown Opened
    const uatDropdownPath = path.join(ARTIFACT_DIR, 'uat_customer_dropdown_no_workspace.png');
    await page.screenshot({ path: uatDropdownPath, fullPage: false });
    results.uatScreenshots.push({ name: 'uat_customer_dropdown_no_workspace.png', path: uatDropdownPath });

    // Close dropdown
    await profileTrigger.click();
    await page.waitForTimeout(500);

    // 1.5 Classes Page CTA Button Audit
    await page.goto(`${WEB_BASE_URL}/classes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const slotButtons = await page.locator('button:has-text("booking"), a:has-text("booking")').allTextContents();
    const hasWorkspaceSlotCTA = slotButtons.some((b) => b.toLowerCase().includes('workspace'));
    const hasValidBookingCTA = slotButtons.some((b) => b.toLowerCase().includes('booking'));

    record(
      'deepTesting',
      'Class Catalog Slot CTA Buttons',
      !hasWorkspaceSlotCTA && hasValidBookingCTA,
      `Total booking buttons: ${slotButtons.length}, workspace CTAs found: ${hasWorkspaceSlotCTA}`,
    );

    // 1.6 Mobile Responsive Drawer Zero Workspace Leakage
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${WEB_BASE_URL}/account`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const mobileMenuButton = page.locator('button[aria-label="Buka navigasi akun"], button[aria-controls="customer-navigation"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(600);

      const drawerText = await page.locator('#customer-navigation, [data-customer-drawer]').allTextContents();
      const combinedDrawerText = drawerText.join(' ').toLowerCase();
      const hasWorkspaceInDrawer = combinedDrawerText.includes('buka workspace') || combinedDrawerText.includes('workspace cabang');

      record(
        'deepTesting',
        'Mobile Drawer Zero Workspace Leakage',
        !hasWorkspaceInDrawer,
        `Mobile drawer workspace mentions: ${hasWorkspaceInDrawer}`,
      );

      const closeDrawerBtn = page.locator('button[aria-label="Tutup navigasi akun"]');
      if (await closeDrawerBtn.isVisible()) await closeDrawerBtn.click();
    }
    // Restore viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    // =========================================================================
    // 2. NEGATIVE TESTING
    // =========================================================================
    console.log('\n--- PHASE 2: NEGATIVE TESTING ---');

    // 2.1 Direct Route Tampering: Accessing /workspace directly as Customer
    await page.goto(`${WEB_BASE_URL}/workspace`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const urlAfterWorkspaceAccess = page.url();
    const adminShellOnWorkspace = await page.locator('[data-admin-shell]').count();
    const customerShellOnWorkspace = await page.locator('[data-customer-shell]').count();

    const workspaceBlocked = !urlAfterWorkspaceAccess.endsWith('/workspace') || customerShellOnWorkspace === 1;
    record(
      'negativeTesting',
      'Direct URL Tampering: /workspace Access Intercepted',
      workspaceBlocked && adminShellOnWorkspace === 0,
      `Final URL: ${urlAfterWorkspaceAccess} | admin-shell: ${adminShellOnWorkspace} | customer-shell: ${customerShellOnWorkspace}`,
    );

    // Screenshot UAT: Redirected / Protected from /workspace
    const uatNegativeWorkspacePath = path.join(ARTIFACT_DIR, 'uat_negative_workspace_redirect.png');
    await page.screenshot({ path: uatNegativeWorkspacePath, fullPage: false });
    results.uatScreenshots.push({ name: 'uat_negative_workspace_redirect.png', path: uatNegativeWorkspacePath });

    // 2.2 Direct Route Tampering: Accessing /workspace/bookings directly
    await page.goto(`${WEB_BASE_URL}/workspace/bookings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const urlAfterWorkspaceBookings = page.url();
    const redirectedToCustomerBookings = urlAfterWorkspaceBookings.includes('/bookings') && !urlAfterWorkspaceBookings.includes('/workspace/bookings');

    record(
      'negativeTesting',
      'Direct URL Tampering: /workspace/bookings Redirects to /bookings',
      redirectedToCustomerBookings,
      `Redirected to: ${urlAfterWorkspaceBookings}`,
    );

    // 2.3 Direct Route Tampering: Accessing Staff Ledger (/ledger)
    await page.goto(`${WEB_BASE_URL}/ledger`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const urlAfterLedger = page.url();
    const ledgerTableCount = await page.locator('table, [data-ledger-view]').count();
    const ledgerBlocked = !urlAfterLedger.endsWith('/ledger') || ledgerTableCount === 0;

    record(
      'negativeTesting',
      'Direct URL Tampering: /ledger Restricted',
      ledgerBlocked,
      `Final URL: ${urlAfterLedger}, ledger table rendered: ${ledgerTableCount}`,
    );

    // 2.4 Open Redirect & Phishing Injection Test (?returnTo)
    await page.goto(`${WEB_BASE_URL}/account/verification?returnTo=//evil-phishing.com/steal`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const currentUrlPhishing = page.url();
    const isPhishingPrevented = !currentUrlPhishing.includes('evil-phishing.com');

    record(
      'negativeTesting',
      'Open Redirect & Phishing Defense (?returnTo=//evil...)',
      isPhishingPrevented,
      `Current URL: ${currentUrlPhishing}`,
    );

    // 2.5 API Level RBAC Negative Testing (Using session cookies)
    const cookies = await context.cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

    // Call restricted admin API: POST /api/v1/vouchers
    const voucherRes = await fetch(`${API_BASE_URL}/api/v1/vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ code: 'HACKVOUCHER', discountPercent: 100 }),
    });
    record(
      'negativeTesting',
      'API RBAC: POST /api/v1/vouchers (Admin only)',
      voucherRes.status === 403 || voucherRes.status === 401,
      `HTTP status: ${voucherRes.status} (Expected 401/403)`,
    );

    // Call restricted admin API: GET /api/v1/audit/logs
    const auditRes = await fetch(`${API_BASE_URL}/api/v1/audit/logs`, {
      headers: { Cookie: cookieHeader },
    });
    record(
      'negativeTesting',
      'API RBAC: GET /api/v1/audit/logs (Audit permission only)',
      auditRes.status === 403 || auditRes.status === 401,
      `HTTP status: ${auditRes.status} (Expected 401/403)`,
    );

    // =========================================================================
    // 3. STRESS & CONCURRENCY TESTING
    // =========================================================================
    console.log('\n--- PHASE 3: STRESS & CONCURRENCY TESTING ---');

    await page.goto(`${WEB_BASE_URL}/account`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 3.1 Button Hammering: Rapid 50x Click on Profile Trigger
    console.log('⚡ Executing 50 rapid toggle clicks on Profile Dropdown...');
    const hammerTrigger = page.locator('button[aria-controls="customer-profile-menu"], button[aria-label*="Menu profil"]');
    const hammerStartTime = Date.now();
    for (let i = 0; i < 50; i++) {
      await hammerTrigger.click({ delay: 10 }).catch(() => {});
    }
    const hammerDuration = Date.now() - hammerStartTime;
    await page.waitForTimeout(800);

    // Verify page is still alive and responsive
    const menuInstances = await page.locator('#customer-profile-menu').count();
    const dropdownStressHealthy = menuInstances <= 1 && pageErrors.length === 0;

    record(
      'stressTesting',
      'Profile Dropdown Toggle Hammering (50 Clicks)',
      dropdownStressHealthy,
      `Completed in ${hammerDuration}ms. Active menu count: ${menuInstances}. Uncaught errors: ${pageErrors.length}`,
    );

    // 3.2 Rapid Tab Navigation Stress (20 rapid consecutive page transitions)
    console.log('⚡ Executing 20 rapid page navigations between customer routes...');
    const routesToStress = ['/classes', '/packages', '/bookings', '/orders', '/account'];
    let navigationFailures = 0;
    const navStartTime = Date.now();

    for (let i = 0; i < 20; i++) {
      const targetRoute = routesToStress[i % routesToStress.length];
      try {
        await page.goto(`${WEB_BASE_URL}${targetRoute}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
        const shell = await page.locator('[data-customer-shell]').count();
        if (shell !== 1) navigationFailures++;
      } catch (err) {
        navigationFailures++;
      }
    }
    const navDuration = Date.now() - navStartTime;

    record(
      'stressTesting',
      'Rapid Multi-Tab Navigation Stress (20 Transitions)',
      navigationFailures === 0,
      `Completed in ${navDuration}ms. Failures/Flickers: ${navigationFailures}`,
    );

    // 3.3 Concurrency API Stress: 50 Simultaneous Session Validations
    console.log('⚡ Executing 50 concurrent session validation requests...');
    const sessionPromises = Array.from({ length: 50 }, () =>
      fetch(`${API_BASE_URL}/api/v1/auth/session`, {
        headers: { Cookie: cookieHeader },
      }).then((r) => r.status),
    );

    const sessionStatuses = await Promise.all(sessionPromises);
    const successCount = sessionStatuses.filter((s) => s === 200).length;

    record(
      'stressTesting',
      '50 Concurrent Session Audience Validations',
      successCount === 50,
      `Successful 200 OK: ${successCount}/50`,
    );

    // =========================================================================
    // 4. VISUAL UAT ARTIFACT CAPTURES
    // =========================================================================
    console.log('\n--- PHASE 4: VISUAL UAT ARTIFACT CAPTURES ---');

    // UAT: Customer Dashboard
    await page.goto(`${WEB_BASE_URL}/account`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const uatDashboardPath = path.join(ARTIFACT_DIR, 'uat_customer_dashboard_verified.png');
    await page.screenshot({ path: uatDashboardPath, fullPage: false });
    results.uatScreenshots.push({ name: 'uat_customer_dashboard_verified.png', path: uatDashboardPath });
    record('deepTesting', 'UAT Snapshot: Customer Dashboard', true, uatDashboardPath);

    // UAT: Customer Bookings Page
    await page.goto(`${WEB_BASE_URL}/bookings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const uatBookingsPath = path.join(ARTIFACT_DIR, 'uat_customer_bookings_verified.png');
    await page.screenshot({ path: uatBookingsPath, fullPage: false });
    results.uatScreenshots.push({ name: 'uat_customer_bookings_verified.png', path: uatBookingsPath });
    record('deepTesting', 'UAT Snapshot: Customer Bookings Page', true, uatBookingsPath);

    // UAT: Public Classes with "Lanjutkan booking"
    await page.goto(`${WEB_BASE_URL}/classes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const uatClassesPath = path.join(ARTIFACT_DIR, 'uat_customer_classes_catalog_verified.png');
    await page.screenshot({ path: uatClassesPath, fullPage: false });
    results.uatScreenshots.push({ name: 'uat_customer_classes_catalog_verified.png', path: uatClassesPath });
    record('deepTesting', 'UAT Snapshot: Public Classes Catalog', true, uatClassesPath);

    console.log('\n=============================================');
    console.log('📊 FINAL TEST RESULTS SUMMARY:');
    console.log('=============================================');
    console.table(results.deepTesting);
    console.table(results.negativeTesting);
    console.table(results.stressTesting);

    const allPassed =
      results.deepTesting.every((r) => r.status === 'PASS') &&
      results.negativeTesting.every((r) => r.status === 'PASS') &&
      results.stressTesting.every((r) => r.status === 'PASS');

    console.log(`\nOVERALL STATUS: ${allPassed ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);

    // Output JSON for programmatic analysis
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'scratch/test-run-summary.json'),
      JSON.stringify(results, null, 2),
    );
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
