import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.DD_PLAYWRIGHT_BASE_URL;
if (!baseURL) {
  throw new Error(
    'DD_PLAYWRIGHT_BASE_URL is required. Run this suite through `pnpm test:e2e:mock`.',
  );
}

const workersValue = process.env.DD_PLAYWRIGHT_WORKERS;
const workers = workersValue ? Number(workersValue) : undefined;
if (workersValue && (!Number.isInteger(workers) || Number(workers) < 1)) {
  throw new Error('DD_PLAYWRIGHT_WORKERS must be a positive integer.');
}

export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  workers,
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
});
