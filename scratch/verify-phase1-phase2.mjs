import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('../apps/web/node_modules/@playwright/test');

async function verify() {
  console.log('🚀 Starting Verification of Phase 1 & Phase 2...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  // ==========================================
  // TEST FASE 2: 401 Network Pollution on Public Pages
  // ==========================================
  console.log('\n--- [TEST FASE 2] Public Pages Network Request Audit ---');
  const network401s = [];
  page.on('response', (res) => {
    if (res.status() === 401) {
      network401s.push({ url: res.url(), status: res.status() });
      console.log(`   [401 Caught] ${res.url()}`);
    }
  });

  console.log('▶ Navigating to Landing Page (http://127.0.0.1:32120/) ...');
  await page.goto('http://127.0.0.1:32120/');
  await page.waitForLoadState('networkidle');

  console.log('▶ Navigating to Classes Page (http://127.0.0.1:32120/classes) ...');
  await page.goto('http://127.0.0.1:32120/classes');
  await page.waitForLoadState('networkidle');

  console.log('▶ Navigating to Packages Page (http://127.0.0.1:32120/packages) ...');
  await page.goto('http://127.0.0.1:32120/packages');
  await page.waitForLoadState('networkidle');

  console.log(`\n📊 Total 401 Requests on Public Pages: ${network401s.length}`);
  const refreshCalls = network401s.filter(r => r.url.includes('/auth/refresh'));
  console.log(`   - 401 from /auth/refresh: ${refreshCalls.length} (Expected: 0)`);
  
  if (refreshCalls.length === 0) {
    console.log('   ✅ PASS FASE 2: No useless /auth/refresh calls on public routes!');
  } else {
    console.error('   ❌ FAIL FASE 2: Found /auth/refresh 401 calls!');
  }

  // ==========================================
  // TEST FASE 1: returnTo=/account/verification for Customer
  // ==========================================
  console.log('\n--- [TEST FASE 1] Customer Verification ReturnTo Audit ---');
  console.log('▶ Navigating to Sign-In with returnTo=/account/verification ...');
  await page.goto('http://127.0.0.1:32120/sign-in?returnTo=%2Faccount%2Fverification');
  await page.waitForLoadState('networkidle');

  console.log('▶ Logging in as Amanda (amanda.member@dailydose.test) ...');
  await page.getByLabel('Email', { exact: true }).fill('amanda.member@dailydose.test');
  await page.getByLabel('Password').fill('Customer123!');
  await page.getByRole('button', { name: /masuk/i }).click();

  await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 20000 });
  await page.waitForLoadState('networkidle');

  const currentUrl = page.url();
  console.log(`📍 Current URL after login: ${currentUrl}`);

  if (currentUrl.includes('/account/verification')) {
    console.log('   ✅ PASS FASE 1: Customer safely landed on /account/verification!');
  } else if (currentUrl.includes('/workspace')) {
    console.error('   ❌ FAIL FASE 1: Customer was redirected to staff /workspace!');
  } else {
    console.warn(`   ⚠️ Customer was redirected to: ${currentUrl}`);
  }

  await browser.close();
  console.log('\n🎉 Verification completed!');
}

verify().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
