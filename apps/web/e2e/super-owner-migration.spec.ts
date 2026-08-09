import { expect, test } from '@playwright/test';

const session = (withMigrationCapability = true) => ({
  id: 'super-owner-1',
  displayName: 'Super Owner Migration',
  roles: ['SUPER_OWNER'],
  branchIds: [],
  sessionExpiresAt: '2027-08-02T12:00:00.000Z',
  capabilities: withMigrationCapability
    ? ['migration:read', 'migration:resolve', 'audit:read', 'operations:read']
    : ['audit:read', 'operations:read'],
  branches: [],
});

test('Super Owner reviews controls and submits an MFA step-up resolution', async ({ page }) => {
  let submittedHeaders: Record<string, string> = {};
  let submittedBody: Record<string, unknown> = {};
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(session()),
    }),
  );
  await page.route('**/api/v1/dashboard/overview**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        period: {
          from: new Date().toISOString(),
          until: new Date().toISOString(),
          previousFrom: new Date().toISOString(),
          previousUntil: new Date().toISOString(),
        },
        roleFocus: 'EXECUTIVE',
        metrics: [],
        queues: [],
        trend: [],
        branches: [],
        risks: [],
        activities: [],
        jobs: [],
      }),
    }),
  );
  await page.route('**/api/v1/internal/migrations/batches', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'batch-1',
            phase: 'package-order',
            status: 'FAILED',
            sourceSnapshotAt: '2026-08-02T00:00:00.000Z',
            sourceChecksum: 'a'.repeat(64),
            mappingVersion: 'v1.0.0',
            delta: false,
            failureCode: 'OPEN_MATERIAL_RESOLUTIONS',
            _count: {
              sourceKeys: 14420,
              rejects: 1,
              controlTotals: 34,
              resolutions: 1,
              deferredMediaReferences: 10,
            },
          },
        ],
        nextCursor: null,
      }),
    }),
  );
  await page.route('**/api/v1/internal/migrations/cdc', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        lagSeconds: 3,
        events: { VERIFIED: 4, BLOCKED: 1 },
        checkpoints: [
          {
            kind: 'CAPTURE',
            lastGtid: 'server-uuid:101',
            transactionOrder: '101',
            capturedThroughAt: '2026-08-02T00:00:00.000Z',
            updatedAt: '2026-08-02T00:00:03.000Z',
          },
        ],
        branches: [
          {
            branchId: 'branch-1',
            sourceBranchId: '1',
            code: 'GREEN_GARDEN',
            name: 'Green Garden',
            status: 'DRAINING',
            highWaterGtid: 'server-uuid:100',
            highWaterOrder: '100',
            updatedAt: '2026-08-02T00:00:03.000Z',
          },
        ],
        pilotOutbox: { PENDING: 0 },
        failures: [
          {
            id: 'delta-1',
            sourceTable: 'order_pakets',
            sourceId: '99',
            operation: 'UPDATE',
            status: 'BLOCKED',
            failureCode: 'SOURCE_EVENT_AFTER_CUTOVER',
            transactionOrder: '101',
            eventOrder: 0,
          },
        ],
      }),
    }),
  );
  await page.route('**/api/v1/internal/migrations/batches/batch-1/control-totals', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'control-1',
            controlKey: 'SESSION_BALANCE_TOTAL',
            dimensions: { scope: 'ALL' },
            expectedValue: '34668',
            actualValue: '34667',
            status: 'MISMATCH',
          },
        ],
      }),
    }),
  );
  await page.route('**/api/v1/internal/migrations/batches/batch-1/rejects**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'reject-1',
            sourceTable: 'order_pakets',
            sourceId: '99',
            reasonCode: 'ORDER_BALANCE_EXCEEDS_SESSIONS',
            status: 'OPEN',
          },
        ],
        nextCursor: null,
      }),
    }),
  );
  await page.route('**/api/v1/internal/migrations/batches/batch-1/resolutions**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'resolution-1',
            resolutionKey: 'order_pakets:99:ORDER_BALANCE_EXCEEDS_SESSIONS',
            reasonCode: 'ORDER_BALANCE_EXCEEDS_SESSIONS',
            proposal: { sourceSessionCount: 8, sourceBalance: 10 },
            status: 'OPEN',
          },
        ],
        nextCursor: null,
      }),
    }),
  );
  await page.route(
    '**/api/v1/internal/migrations/resolutions/resolution-1/decision',
    async (route) => {
      const request = route.request();
      submittedHeaders = request.headers();
      submittedBody = request.postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'resolution-1', status: 'APPROVED' }),
      });
    },
  );

  await page.goto('/migrations');
  await expect(page.getByRole('heading', { name: 'Kontrol migrasi v1 → v2' })).toBeVisible();
  await expect(page.getByText('SESSION_BALANCE_TOTAL')).toBeVisible();
  await expect(page.getByText('CDC dan cutover cabang')).toBeVisible();
  await expect(page.getByText('10 media ditunda (nonblocking)')).toBeVisible();
  await expect(page.getByText('GREEN_GARDEN — Green Garden')).toBeVisible();
  await expect(page.getByText('ORDER_BALANCE_EXCEEDS_SESSIONS').first()).toBeVisible();
  await page.getByLabel('Resolution migrasi').selectOption('resolution-1');
  await page
    .getByLabel('Alasan keputusan')
    .fill('Disetujui Data Owner berdasarkan dokumen rekonsiliasi');
  await page.getByLabel('Payload keputusan').fill('{"openingBalance":10}');
  await page.getByLabel('Step-up token').fill('temporary-step-up-token');
  await page.getByRole('button', { name: 'Setujui' }).click();

  await expect.poll(() => submittedHeaders['idempotency-key']).toBeTruthy();
  expect(submittedHeaders['x-migration-step-up']).toBe('temporary-step-up-token');
  expect(submittedBody).toEqual({
    approve: true,
    reason: 'Disetujui Data Owner berdasarkan dokumen rekonsiliasi',
    decision: { openingBalance: 10 },
  });
  await expect(page.getByLabel('Step-up token')).toHaveValue('');
});

test('principal without migration:read cannot open the migration console', async ({ page }) => {
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(session(false)),
    }),
  );
  await page.route('**/api/v1/dashboard/overview**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        period: {
          from: new Date().toISOString(),
          until: new Date().toISOString(),
          previousFrom: new Date().toISOString(),
          previousUntil: new Date().toISOString(),
        },
        roleFocus: 'EXECUTIVE',
        metrics: [],
        queues: [],
        trend: [],
        branches: [],
        risks: [],
        activities: [],
        jobs: [],
      }),
    }),
  );
  await page.goto('/migrations');
  await expect(page).toHaveURL(/\/workspace$/u);
  await expect(page.getByRole('link', { name: 'Migrasi v1 → v2' })).toHaveCount(0);
});
