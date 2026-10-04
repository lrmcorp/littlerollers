import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/lrmcorporation/.gemini/antigravity-ide/brain/71d2c1fd-f6c0-434b-85e6-7cb1af7e6cee';
const BASE_URL = 'http://localhost:32120';
const REAL_TOKEN = 'e4Y1qpM21GoFcabZiDyNat7fBAdPmlWW3K4Qe0nHNvM';

function copyToArtifact(srcPath: string, filename: string) {
  if (fs.existsSync(srcPath)) {
    const dest = path.join(ARTIFACT_DIR, filename);
    fs.copyFileSync(srcPath, dest);
    console.log(`   [Artifact Saved] -> ${dest}`);
  }
}

async function verifyRealCheckIn() {
  console.log('=== VERIFYING REAL CHECK-IN VIEW ===\n');
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    console.log(`Navigating to ${BASE_URL}/check-in/${REAL_TOKEN}...`);
    await page.goto(`${BASE_URL}/check-in/${REAL_TOKEN}`, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait for the ticket card to render
    await page.waitForSelector('text=Nama Peserta', { timeout: 15000 });
    await page.waitForSelector('text=Jessica Anastasya UAT', { timeout: 15000 });
    console.log('   ✓ Ticket details successfully rendered on screen!');

    // Check computed styles
    const customerNameElem = page.locator('text=Jessica Anastasya UAT');
    const color = await customerNameElem.evaluate((el) => window.getComputedStyle(el).color);
    console.log('   Customer Name computed color:', color);

    const cardElem = page.locator('div.bg-dd-surface-muted').first();
    const bgColor = await cardElem.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    console.log('   Card computed backgroundColor:', bgColor);

    const shot = 'scratch/verify_04_check_in.png';
    await page.screenshot({ path: shot, fullPage: false });
    copyToArtifact(shot, 'verify_04_check_in.png');
    console.log('   ✓ New screenshot captured and saved as verify_04_check_in.png');

    await context.close();
  } finally {
    await browser.close();
  }
}

verifyRealCheckIn().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
