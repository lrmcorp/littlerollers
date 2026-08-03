import { defineConfig, devices } from '@playwright/test';

const playwrightPort = process.env.DD_PLAYWRIGHT_PORT ?? '3010';
if (
  !/^\d{2,5}$/.test(playwrightPort) ||
  Number(playwrightPort) < 1024 ||
  Number(playwrightPort) > 65_535
) {
  throw new Error('DD_PLAYWRIGHT_PORT must be a valid local TCP port.');
}
const playwrightBaseUrl = `http://127.0.0.1:${playwrightPort}`;
const apiBaseUrl = process.env.API_BASE_URL ?? 'http://127.0.0.1:32121';

export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  use: {
    baseURL: playwrightBaseUrl,
    ...devices['Desktop Chrome'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm --dir ../api start:e2e',
      url: `${apiBaseUrl}/api/v1/public/site-config`,
      reuseExistingServer: process.env.DD_PLAYWRIGHT_REUSE_SERVER === 'true',
    },
    {
      command: `NEXT_DIST_DIR=.next-playwright pnpm exec next dev -p ${playwrightPort}`,
      url: playwrightBaseUrl,
      reuseExistingServer: process.env.DD_PLAYWRIGHT_REUSE_SERVER === 'true',
      env: { NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED: 'true', API_BASE_URL: apiBaseUrl },
    },
  ],
});
