import { deflateSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import {
  expect,
  test as base,
  type BrowserContext,
  type Page,
  type TestInfo,
} from '@playwright/test';

export type CustomerActor = 'reviewer' | 'finance' | 'manager';

export interface CustomerE2EContext {
  runId: string;
  customer: {
    displayName: string;
    email: string;
    phone: string;
    password: string;
  };
  png(name: string): { name: string; mimeType: 'image/png'; buffer: Buffer };
  observe(page: Page): void;
  actor(role: CustomerActor, returnTo: string): Promise<{ context: BrowserContext; page: Page }>;
  assertNoSensitiveMarkup(page: Page): Promise<void>;
  auditAccessibility(page: Page, label: string): Promise<void>;
  openCheckInWindow(): void;
}

const actorCredentials: Record<CustomerActor, { email: string; password: string }> = {
  reviewer: { email: 'ralamzah@gmail.com', password: 'ridho123' },
  finance: { email: 'finance@littlerollers.local', password: 'LittleRollers#2026' },
  manager: { email: 'manager@littlerollers.local', password: 'LittleRollers#2026' },
};

function crc32(input: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of input) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const name = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function testPng(width = 320, height = 240): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;
  const row = Buffer.alloc(width * 3 + 1, 0);
  const pixels = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(pixels)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

async function signIn(
  page: Page,
  credentials: { email: string; password: string },
  returnTo: string,
) {
  await page.goto(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  await page.getByLabel('Email', { exact: true }).fill(credentials.email);
  await page.getByLabel('Password').fill(credentials.password);
  await page.getByRole('button', { name: 'Masuk dengan email' }).click();
  await expect(page).not.toHaveURL(/\/sign-in(?:\?|$)/, { timeout: 20_000 });
}

export const test = base.extend<{ customerE2E: CustomerE2EContext }>({
  customerE2E: async ({ browser, baseURL }, use, testInfo) => {
    const runId =
      process.env.DD_CUSTOMER_E2E_RUN_ID?.trim() ||
      `${Date.now().toString(36)}-${testInfo.workerIndex}-${Math.random().toString(36).slice(2, 8)}`;
    const safeRunId = runId
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .slice(0, 42);
    const contexts: BrowserContext[] = [];
    const telemetry: Array<{ type: string; text: string; url?: string }> = [];

    const observe = (page: Page) => {
      page.on('console', (message) => {
        if (message.type() === 'error') telemetry.push({ type: 'console', text: message.text() });
      });
      page.on('pageerror', (error) => telemetry.push({ type: 'pageerror', text: error.message }));
      page.on('requestfailed', (request) =>
        telemetry.push({
          type: 'requestfailed',
          text: request.failure()?.errorText ?? 'UNKNOWN',
          url: request.url(),
        }),
      );
    };

    const fixture: CustomerE2EContext = {
      runId: safeRunId,
      customer: {
        displayName: `E2E Customer ${safeRunId}`,
        email: `e2e.customer+${safeRunId}@littlerollers.local`,
        phone: `0813${String(Date.now()).slice(-8)}`,
        password: 'CustomerE2E#2026',
      },
      png: (name) => ({ name, mimeType: 'image/png', buffer: testPng() }),
      observe,
      actor: async (role, returnTo) => {
        const context = await browser.newContext({ baseURL });
        contexts.push(context);
        const page = await context.newPage();
        observe(page);
        await signIn(page, actorCredentials[role], returnTo);
        return { context, page };
      },
      assertNoSensitiveMarkup: async (page) => {
        const html = await page.locator('html').innerText();
        expect(html).not.toMatch(/(?:objectKey|filesystem path|PRIVATE_UPLOAD_ROOT)/i);
        expect(page.url()).not.toMatch(
          /identity-verification-files|payment-proofs\/view-authorizations/i,
        );
      },
      auditAccessibility: async (page, label) => {
        await page.addScriptTag({
          path: resolve(process.cwd(), 'node_modules/axe-core/axe.min.js'),
        });
        const violations = await page.evaluate(async () => {
          const result = await (
            window as typeof window & { axe: { run(): Promise<{ violations: unknown[] }> } }
          ).axe.run();
          return result.violations;
        });
        await testInfo.attach(`axe-${label}`, {
          body: Buffer.from(JSON.stringify(violations, null, 2)),
          contentType: 'application/json',
        });
        expect(violations).toEqual([]);
      },
      openCheckInWindow: () => {
        const repositoryRoot = resolve(process.cwd(), '../..');
        const result = spawnSync(
          'node',
          [
            '--import',
            './apps/api/node_modules/tsx/dist/loader.mjs',
            'tools/prepare-customer-e2e.ts',
          ],
          {
            cwd: repositoryRoot,
            env: {
              ...process.env,
              DD_CUSTOMER_E2E_RUN_ID: safeRunId,
              DD_CUSTOMER_E2E_OPEN_CHECK_IN: 'true',
            },
            encoding: 'utf8',
          },
        );
        if (result.status !== 0)
          throw new Error(result.stderr || 'Tidak dapat membuka jendela check-in fixture.');
      },
    };

    await use(fixture);
    await testInfo.attach('customer-e2e-telemetry', {
      body: Buffer.from(JSON.stringify(telemetry, null, 2)),
      contentType: 'application/json',
    });
    for (const context of contexts) await context.close();
  },
});

export { expect };
