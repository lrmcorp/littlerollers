import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('../apps/web/node_modules/@playwright/test');

const BASE_URL = 'http://127.0.0.1:32120';

async function main() {
  console.log('🚀 Starting Phase 3 Live Browser Verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
  });
  const page = await context.newPage();

  // Test 1: Mobile Viewport Touch Target on Landing Page
  console.log('--- Test 1: Mobile Touch Target Check (375x667) ---');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  
  // Check the mobile CTA or nav buttons
  const mobileCtas = page.locator('a, button').filter({ hasText: /jadwal|pesan|lihat|masuk|daftar/i });
  const ctaCount = await mobileCtas.count();
  console.log(`Found ${ctaCount} matching interactive elements on mobile landing page.`);
  for (let i = 0; i < Math.min(ctaCount, 5); i++) {
    const el = mobileCtas.nth(i);
    const text = (await el.textContent())?.trim().replace(/\s+/g, ' ');
    const box = await el.boundingBox();
    if (box) {
      console.log(`  [Mobile] Element "${text}": ${Math.round(box.width)}x${Math.round(box.height)}px (min-h >= 44? ${box.height >= 44 ? '✅ YES' : '❌ NO'})`);
      if (box.height < 44 || box.width < 44) {
        throw new Error(`Mobile target too small: "${text}" is ${box.width}x${box.height}px`);
      }
    }
  }

  // Test 2: Desktop Viewport Touch Target on Landing Page
  console.log('--- Test 2: Desktop Touch Target Check (1280x800) ---');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

  // Specifically check the header nav links (the one that triggered UX-TAP-01 in master audit)
  const navLinks = page.locator('header nav a');
  const navCount = await navLinks.count();
  console.log(`Found ${navCount} desktop header nav links.`);
  for (let i = 0; i < navCount; i++) {
    const link = navLinks.nth(i);
    const text = (await link.textContent())?.trim();
    const box = await link.boundingBox();
    if (box) {
      console.log(`  [Desktop Nav] "${text}": ${Math.round(box.width)}x${Math.round(box.height)}px (min-h >= 44? ${box.height >= 44 ? '✅ YES' : '❌ NO'})`);
      if (box.height < 44) {
        throw new Error(`Desktop nav target too short: "${text}" is height ${box.height}px`);
      }
    }
  }

  // Check the exact locator from run-master-audit.mjs line 95:
  const auditCta = page.locator('a, button').filter({ hasText: /jadwal|pesan|lihat/i }).first();
  const auditCtaBox = await auditCta.boundingBox();
  const auditCtaText = (await auditCta.textContent())?.trim().replace(/\s+/g, ' ');
  console.log(`  [Audit Match Locator] "${auditCtaText}": ${Math.round(auditCtaBox.width)}x${Math.round(auditCtaBox.height)}px`);
  if (auditCtaBox.height < 44 || auditCtaBox.width < 44) {
    throw new Error(`Audit target still fails: ${auditCtaBox.width}x${auditCtaBox.height}px`);
  }
  console.log('✅ Audit Match Locator meets WCAG 2.1 44x44px touch target criteria!');

  // Test 3: Public Packages Page
  console.log('--- Test 3: Public Packages Page Empty State & Branch Experience ---');
  await page.goto(`${BASE_URL}/packages`, { waitUntil: 'networkidle' });
  const studioTitle = page.getByRole('heading', { name: 'Pilih studio untuk melihat paket' });
  console.log(`  "Pilih studio" prompt visible: ${await studioTitle.isVisible()}`);

  // Click on a studio
  const studioBtn = page.locator('button').filter({ hasText: /Daily Dose/i }).first();
  if (await studioBtn.isVisible()) {
    const studioName = (await studioBtn.textContent())?.trim().replace(/\s+/g, ' ');
    console.log(`  Clicking studio: "${studioName}"...`);
    await studioBtn.click();
    await page.waitForTimeout(1000);

    // Check if packages or empty state loaded
    const packageCards = page.locator('article');
    const pCount = await packageCards.count();
    console.log(`  Packages displayed: ${pCount}`);
  }

  console.log('🎉 All Phase 3 checks passed successfully!');
  await browser.close();
}

main().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
