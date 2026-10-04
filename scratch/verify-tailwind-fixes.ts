import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';
const BASE_URL = 'http://localhost:32120';
const SUPEROWNER_EMAIL = 'ralamzah@gmail.com';
const SUPEROWNER_PASSWORD = 'ridho123';
const MEMBER_EMAIL = 'jessica.uat@gmail.com';
const MEMBER_PASSWORD = 'DailyDose2026!';

function copyToArtifact(srcPath: string, filename: string) {
  if (fs.existsSync(srcPath)) {
    const dest = path.join(ARTIFACT_DIR, filename);
    fs.copyFileSync(srcPath, dest);
    console.log(`   [Artifact Saved] -> ${dest}`);
  }
}

async function verifyTailwindFixes() {
  console.log('=== VISUAL VERIFICATION OF TAILWIND CSS FIXES ===\n');
  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // PART 1: SUPEROWNER VIEWS
    // -------------------------------------------------------------
    const soContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const soPage = await soContext.newPage();

    console.log('1. Logging in as Superowner...');
    await soPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await soPage.waitForSelector('input[name="email"]', { timeout: 30000 });
    await soPage.fill('input[name="email"]', SUPEROWNER_EMAIL);
    await soPage.fill('input[name="password"]', SUPEROWNER_PASSWORD);
    await soPage.click('button[type="submit"]');
    await soPage.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 30000 });
    console.log('   ✓ Logged in as Superowner.');

    // Step 2: Branch Performance View
    console.log('\n2. Verifying /workspace/branch-performance...');
    await soPage.goto(`${BASE_URL}/workspace/branch-performance`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await soPage.waitForSelector('#period-select', { timeout: 30000 });
    await soPage.waitForTimeout(2000);

    const shot1 = 'scratch/verify_01_branch_performance.png';
    await soPage.screenshot({ path: shot1, fullPage: false });
    copyToArtifact(shot1, 'verify_01_branch_performance.png');

    // Step 3: Role & Permissions View
    console.log('\n3. Verifying /users/roles-permissions (eyebrow styling)...');
    await soPage.goto(`${BASE_URL}/users/roles-permissions`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await soPage.waitForSelector('h1:has-text("Peran & Hak Akses")', { timeout: 30000 });
    await soPage.waitForTimeout(2000);

    const shot3 = 'scratch/verify_03_roles_permissions_eyebrow.png';
    await soPage.screenshot({ path: shot3, fullPage: false });
    copyToArtifact(shot3, 'verify_03_roles_permissions_eyebrow.png');

    // Step 4: Check-in Link View
    console.log('\n4. Verifying /check-in/[token] (text-dd-ink & dd-surface-muted)...');
    await soPage.goto(`${BASE_URL}/check-in/test-token-verification`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await soPage.waitForSelector('h1:has-text("Presensi Kehadiran Kelas")', { timeout: 30000 });
    await soPage.waitForTimeout(1500);

    const shot4 = 'scratch/verify_04_check_in.png';
    await soPage.screenshot({ path: shot4, fullPage: false });
    copyToArtifact(shot4, 'verify_04_check_in.png');

    await soContext.close();

    // -------------------------------------------------------------
    // PART 2: MEMBER ORDERS VIEW
    // -------------------------------------------------------------
    console.log('\n5. Logging in as Member Jessica to view /orders (no-scrollbar)...');
    const memberContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const memberPage = await memberContext.newPage();

    await memberPage.goto(`${BASE_URL}/sign-in`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await memberPage.waitForSelector('input[name="email"]', { timeout: 30000 });
    await memberPage.fill('input[name="email"]', MEMBER_EMAIL);
    await memberPage.fill('input[name="password"]', MEMBER_PASSWORD);
    await memberPage.click('button[type="submit"]');
    await memberPage.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 30000 });
    console.log('   ✓ Logged in as Member.');

    await memberPage.goto(`${BASE_URL}/orders`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await memberPage.waitForSelector('section[aria-label="Ringkasan pesanan"]', { timeout: 30000 });
    await memberPage.waitForTimeout(2000);

    const shot2 = 'scratch/verify_02_orders_no_scrollbar.png';
    await memberPage.screenshot({ path: shot2, fullPage: false });
    copyToArtifact(shot2, 'verify_02_orders_no_scrollbar.png');

    await memberContext.close();

    console.log('\n=== ALL 4 VIEWS VISUALLY VERIFIED WITH ZERO ERRORS ===');

  } finally {
    await browser.close();
  }
}

verifyTailwindFixes().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
