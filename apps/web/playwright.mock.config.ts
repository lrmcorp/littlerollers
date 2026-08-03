import { defineConfig, devices } from '@playwright/test';

const port = process.env.DD_PLAYWRIGHT_PORT ?? '3010';
if (!/^\d{2,5}$/.test(port) || Number(port) < 1024 || Number(port) > 65_535) {
  throw new Error('DD_PLAYWRIGHT_PORT must be a valid local TCP port.');
}

const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `NEXT_DIST_DIR=.next-playwright-mock pnpm exec next dev -p ${port}`,
    url: baseURL,
    reuseExistingServer: process.env.DD_PLAYWRIGHT_REUSE_SERVER === 'true',
    env: {
      NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED: 'true',
      API_BASE_URL: 'http://127.0.0.1:9',
    },
  },
});
