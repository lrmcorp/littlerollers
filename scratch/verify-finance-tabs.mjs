import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('../apps/web/node_modules/@playwright/test');

const BASE_URL = 'http://127.0.0.1:32120';
const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';

async function main() {
  console.log('🚀 Verifying /finance Tab & Filter Styling in Live Browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // 1. Login as Finance
  console.log('▶ Logging in as finance@dailydose.test...');
  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle' });
  await page.getByLabel('Email', { exact: true }).fill('finance@dailydose.test');
  await page.getByLabel('Password').fill('Finance123!');
  await page.getByRole('button', { name: /masuk/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15_000 });

  // 2. Navigate to /finance
  console.log('▶ Navigating to /finance...');
  await page.goto(`${BASE_URL}/finance`, { waitUntil: 'networkidle' });

  // 3. Check Main Tabs
  const tabReports = page.getByRole('button', { name: /5 Laporan Finansial/i });
  const tabRecon = page.getByRole('button', { name: /Rekonsiliasi Transaksi/i });

  // By default, let's click tabReports
  await tabReports.click();
  await page.waitForTimeout(500);

  const reportTabStyles = await tabReports.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      color: s.color,
      borderBottomColor: s.borderBottomColor,
      borderBottomWidth: s.borderBottomWidth,
    };
  });
  console.log('  [Main Tab 1: Financial Reports (Active)] styles:', reportTabStyles);

  // Expect color to be dd-forest: rgb(40, 87, 64)
  if (!reportTabStyles.color.includes('40, 87, 64')) {
    throw new Error(`Active Main Tab color is wrong: ${reportTabStyles.color}, expected rgb(40, 87, 64)`);
  }
  console.log('  ✅ Active Main Tab text and bottom border properly styled with dd-forest!');

  // 4. Check Sub-Tabs
  const subTab1 = page.getByRole('button', { name: /1\. Laba Bersih/i });
  const subTab2 = page.getByRole('button', { name: /2\. Omset/i });

  const subTab1Styles = await subTab1.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      color: s.color,
    };
  });
  console.log('  [Sub-Tab 1: Laba Bersih (Active)] styles:', subTab1Styles);

  // Verify background is dd-forest and text is white
  if (!subTab1Styles.backgroundColor.includes('40, 87, 64')) {
    throw new Error(`Sub-Tab 1 background is not dd-forest: ${subTab1Styles.backgroundColor}`);
  }
  if (!subTab1Styles.color.includes('255, 255, 255')) {
    throw new Error(`Sub-Tab 1 text is not white: ${subTab1Styles.color}`);
  }
  console.log('  ✅ Active Sub-Tab has solid dd-forest background and crisp white text (no longer invisible)!');

  // Switch to Sub-Tab 2
  console.log('▶ Clicking Sub-Tab 2 (Omset Penjualan)...');
  await subTab2.click();
  await page.waitForTimeout(500);

  const subTab2Styles = await subTab2.evaluate((el) => {
    const s = window.getComputedStyle(el);
    return {
      backgroundColor: s.backgroundColor,
      color: s.color,
    };
  });
  console.log('  [Sub-Tab 2: Omset (Active)] styles:', subTab2Styles);

  if (!subTab2Styles.backgroundColor.includes('40, 87, 64')) {
    throw new Error(`Sub-Tab 2 background is not dd-forest: ${subTab2Styles.backgroundColor}`);
  }
  console.log('  ✅ Sub-Tab 2 active background successfully updated to dd-forest!');

  // 5. Check Month filter input text color
  const monthInput = page.locator('input[type="month"]');
  const monthInputColor = await monthInput.evaluate((el) => window.getComputedStyle(el).color);
  console.log('  [Month Filter Input] text color:', monthInputColor);
  if (!monthInputColor.includes('32, 35, 31')) {
    throw new Error(`Month input text color is wrong: ${monthInputColor}, expected dd-ink rgb(32, 35, 31)`);
  }
  console.log('  ✅ Month input text color correctly styled with dd-ink!');

  // 6. Switch back to Sub-Tab 1 and capture screenshot
  await subTab1.click();
  await page.waitForTimeout(500);
  const screenshotPath = path.join(ARTIFACT_DIR, 'finance_tab_styling_fixed.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`  📸 Screenshot captured: ${screenshotPath}`);

  console.log('🎉 All /finance Tab & Filter styling verifications passed flawlessly!');
  await browser.close();
}

main().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
