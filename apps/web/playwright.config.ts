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
const customerFullStack = process.env.DD_CUSTOMER_FULLSTACK === 'true';
const customerRunId = process.env.DD_CUSTOMER_E2E_RUN_ID ?? 'customer-e2e';
if (customerFullStack && !/^[a-zA-Z0-9_-]{1,80}$/.test(customerRunId)) {
  throw new Error('DD_CUSTOMER_E2E_RUN_ID must be a safe local artifact identifier.');
}
const webDistDir = customerFullStack ? `.next-customer-runs/${customerRunId}` : '.next-playwright';
const webCommand = customerFullStack
  ? `NEXT_DIST_DIR=${webDistDir} pnpm exec next build && NEXT_DIST_DIR=${webDistDir} pnpm exec next start -p ${playwrightPort}`
  : `NEXT_DIST_DIR=${webDistDir} pnpm exec next dev -p ${playwrightPort}`;

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
      command: webCommand,
      url: playwrightBaseUrl,
      timeout: customerFullStack ? 180_000 : 60_000,
      reuseExistingServer: process.env.DD_PLAYWRIGHT_REUSE_SERVER === 'true',
      env: { NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED: 'true', API_BASE_URL: apiBaseUrl },
    },
  ],
});
