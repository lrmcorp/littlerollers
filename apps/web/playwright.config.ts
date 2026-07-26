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

export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  use: { baseURL: playwrightBaseUrl, ...devices['Desktop Chrome'] },
  webServer: {
    command: `pnpm exec next dev -p ${playwrightPort}`,
    url: playwrightBaseUrl,
    reuseExistingServer: process.env.DD_PLAYWRIGHT_REUSE_SERVER === 'true',
    env: { NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED: 'true' },
  },
});
