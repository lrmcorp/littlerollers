import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  use: { baseURL: 'http://127.0.0.1:3010', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'pnpm exec next dev -p 3010',
    url: 'http://127.0.0.1:3010',
    reuseExistingServer: false,
    env: { NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED: 'true' },
  },
});
