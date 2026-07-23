import { expect, test, type Page } from '@playwright/test';

const webCapabilities = [
  'user:read',
  'user:admin',
  'assignment:read',
  'assignment:manage',
  'master:read',
  'master:manage',
  'finance:manage',
  'package:read',
  'purchase:review',
  'purchase:decide',
  'ledger:read',
  'ledger:adjust:read',
  'ledger:adjust:request',
  'ledger:adjust:decide',
  'class-slot:read',
  'class-slot:manage',
  'operations:read',
  'operations:recover',
  'booking:read',
  'booking:create:assisted',
  'reschedule:read',
  'reschedule:decide',
  'branch:all',
];

test.beforeEach(async ({ page }) => {
  let sessionReads = 0;
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-1',
        displayName: 'Synthetic Super Owner',
        roles: ['SUPER_OWNER'],
        branchIds: ['branch-1'],
        capabilities: webCapabilities,
        assurance: sessionReads++ === 0 && /\/users|\/sign-in/.test(page.url()) ? 'BASE' : 'MFA',
        sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        branches: [
          { id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' },
          {
            id: '00000000-0000-4000-8000-000000000301',
            code: 'BDG',
            name: 'Bandung',
            timezone: 'Asia/Jakarta',
          },
        ],
      }),
    }),
  );
});

async function routeBookingDiscovery(
  page: Page,
  ids: { branchId: string; classSlotId: string; customerUserId: string; customerPackageId: string },
  reschedules: object[] = [],
) {
  const classTypeId = '00000000-0000-4000-8000-000000000399';
  await page.route('**/api/v1/users**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: ids.customerUserId,
            status: 'ACTIVE',
            attributes: { displayName: 'Customer Synthetic' },
          },
        ],
        page: { hasMore: false, nextCursor: null },
      }),
    }),
  );
  await page.route('**/api/v1/customer-packages**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: ids.customerPackageId,
            branchId: ids.branchId,
            customerUserId: ids.customerUserId,
            packageId: '00000000-0000-4000-8000-000000000398',
            classTypeId,
            status: 'ACTIVE',
            activationDate: '2026-01-01',
            expiryAt: '2028-01-01T00:00:00Z',
            ledgerBalance: 10,
            reserved: 2,
            available: 8,
            salePriceRp: 1000000,
            sessionCountSnapshot: 10,
            durationDaysSnapshot: 30,
            projectionRateRp: 100000,
            version: 0,
          },
        ],
        page: { hasMore: false, nextCursor: null },
      }),
    }),
  );
  await page.route('**/api/v1/class-slots**', (route) => {
    const isPublished = new URL(route.request().url()).searchParams.get('status') === 'PUBLISHED';
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: isPublished
          ? [
              {
                id: ids.classSlotId,
                branchId: ids.branchId,
                classTypeId,
                startAt: '2027-01-02T02:00:00Z',
                endAt: '2027-01-02T03:00:00Z',
                timezone: 'Asia/Jakarta',
                status: 'PUBLISHED',
                minimumQuota: 2,
                capacity: 10,
                bookedCount: 3,
                version: 0,
                idempotentReplay: false,
              },
            ]
          : [],
        page: { hasMore: false, nextCursor: null },
      }),
    });
  });
  await page.route('**/api/v1/reschedules**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: reschedules, page: { hasMore: false, nextCursor: null } }),
    }),
  );
}

test('sign-in exposes success without a token body', async ({ page }) => {
  await page.route('**/api/v1/auth/google', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: null,
        refreshToken: null,
        user: {
          id: 'user-1',
          displayName: 'Owner',
          roles: ['OWNER'],
          branchIds: ['branch-1'],
          capabilities: ['user:admin'],
          assurance: 'BASE',
          sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
        },
        assurance: 'BASE',
        channel: 'WEB',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        refreshExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    }),
  );
  await page.goto('/sign-in?returnTo=https://evil.example/steal');
  await page.getByLabel('Email Google synthetic').fill('owner@example.test');
  await page.getByRole('button', { name: /Google/ }).press('Enter');
  await expect(page).toHaveURL('/workspace');
  await expect(page.getByText('Synthetic Super Owner', { exact: true })).toBeVisible();
});

test('MFA invitation and deactivation flow is keyboard operable', async ({ page }) => {
  await page.route('**/api/v1/auth/mfa/challenges', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mfa-1',
        purpose: 'STEP_UP',
        methodHint: 'synthetic',
        expiresAt: new Date().toISOString(),
      }),
    }),
  );
  await page.route('**/api/v1/auth/mfa/verifications', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'owner',
          displayName: 'Owner',
          roles: ['OWNER'],
          branchIds: ['branch-1'],
          capabilities: ['user:admin'],
          assurance: 'MFA',
          sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
        },
        assurance: 'MFA',
        channel: 'WEB',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        refreshExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    }),
  );
  await page.route('**/api/v1/users', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'invite-1', status: 'PENDING' }),
    }),
  );
  await page.route('**/api/v1/users/*/deactivate', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'selected-user', status: 'INACTIVE' }),
    }),
  );
  await page.goto('/users');
  await page.getByRole('button', { name: /MFA/ }).press('Enter');
  await page.getByRole('button', { name: 'Undang pengguna' }).press('Enter');
  await page.getByLabel('Email kerja').fill('staff@example.test');
  await page.getByRole('button', { name: /Buat undangan/ }).press('Enter');
  await expect(page.getByRole('status')).toContainText('berhasil');
  await page.getByRole('button', { name: /Nonaktifkan/ }).press('Enter');
  await expect(page.getByRole('status')).toContainText('dinonaktifkan');
});

test('expired MFA and forbidden branch remain safe', async ({ page }) => {
  await page.route('**/api/v1/auth/mfa/challenges', (route) =>
    route.fulfill({
      status: 410,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'MFA_CHALLENGE_EXPIRED' } }),
    }),
  );
  await page.goto('/users');
  await page.getByRole('button', { name: /MFA/ }).click();
  await expect(page.getByText('MFA_CHALLENGE_EXPIRED', { exact: true })).toBeVisible();
});

test('duplicate invitation is idempotent and forbidden branch does not mutate', async ({
  page,
}) => {
  await page.route('**/api/v1/auth/mfa/challenges', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mfa-2',
        purpose: 'STEP_UP',
        methodHint: 'synthetic',
        expiresAt: new Date().toISOString(),
      }),
    }),
  );
  await page.route('**/api/v1/auth/mfa/verifications', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'owner',
          displayName: 'Owner',
          roles: ['OWNER'],
          branchIds: ['branch-1'],
          capabilities: ['user:admin'],
          assurance: 'MFA',
          sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
        },
        assurance: 'MFA',
        channel: 'WEB',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        refreshExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    }),
  );
  let inviteCalls = 0;
  await page.route('**/api/v1/users', (route) => {
    inviteCalls += 1;
    return route.fulfill({
      status: inviteCalls === 1 ? 200 : 403,
      contentType: 'application/json',
      body: JSON.stringify(
        inviteCalls === 1 ? { id: 'invite-1', status: 'EXISTS' } : { error: { code: 'FORBIDDEN' } },
      ),
    });
  });
  await page.goto('/users');
  await page.getByRole('button', { name: /MFA/ }).click();
  await page.getByRole('button', { name: 'Undang pengguna' }).click();
  await page.getByLabel('Email kerja').fill('staff@example.test');
  await page.getByRole('button', { name: /Buat undangan/ }).click();
  await expect(page.getByRole('status')).toContainText('sudah tersedia');
  await page.getByRole('button', { name: /Buat undangan/ }).click();
  await expect(page.getByText('FORBIDDEN', { exact: true })).toBeVisible();
});

test('self-deactivation conflict is visible without optimistic mutation', async ({ page }) => {
  await page.route('**/api/v1/auth/mfa/challenges', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mfa-3',
        purpose: 'STEP_UP',
        methodHint: 'synthetic',
        expiresAt: new Date().toISOString(),
      }),
    }),
  );
  await page.route('**/api/v1/auth/mfa/verifications', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'owner',
          displayName: 'Owner',
          roles: ['OWNER'],
          branchIds: ['branch-1'],
          capabilities: ['user:admin'],
          assurance: 'MFA',
          sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
        },
        assurance: 'MFA',
        channel: 'WEB',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        refreshExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    }),
  );
  await page.route('**/api/v1/users/*/deactivate', (route) =>
    route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'SEPARATION_OF_DUTIES_VIOLATION' } }),
    }),
  );
  await page.goto('/users');
  await page.getByRole('button', { name: /MFA/ }).click();
  await page.getByRole('button', { name: /Nonaktifkan/ }).click();
  await expect(page.getByText('IDENTITY_CONFLICT', { exact: true })).toBeVisible();
  await expect(page.getByText('Pengguna dinonaktifkan.')).toHaveCount(0);
});

test('assignment create and end use one branch and expected version', async ({ page }) => {
  let assignments: Array<Record<string, unknown>> = [];
  let endedBody: Record<string, unknown> | undefined;
  await page.route('**/api/v1/assignments**', async (route) => {
    const request = route.request();
    if (request.method() === 'GET')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: assignments, page: { nextCursor: null, hasMore: false } }),
      });
    if (request.url().endsWith('/end')) {
      endedBody = request.postDataJSON();
      assignments = [{ ...assignments[0], activeUntil: '2026-08-10', version: 1 }];
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'assignment-1', status: 'ENDED', version: 1 }),
      });
    }
    assignments = [
      {
        id: 'assignment-1',
        userId: 'user-1',
        branchId: 'branch-1',
        assignmentType: 'INSTRUCTOR',
        activeFrom: '2026-08-01',
        activeUntil: null,
        version: 0,
      },
    ];
    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'assignment-1', status: 'ACTIVE', version: 0 }),
    });
  });
  await page.goto('/assignments');
  await page.getByLabel('ID cabang aktif').fill('branch-1');
  await page.getByLabel('ID pengguna').fill('user-1');
  await page.getByLabel('Aktif mulai').fill('2026-08-01');
  await page.getByLabel('Alasan').fill('synthetic create');
  await page.getByRole('button', { name: 'Buat assignment' }).press('Enter');
  await expect(page.getByRole('status')).toContainText('berhasil dibuat');
  await page.getByLabel('Efektif berakhir').fill('2026-08-10T00:00');
  await page.getByLabel('Alasan akhir').fill('synthetic end');
  await page.getByRole('button', { name: 'Konfirmasi akhiri' }).press('Enter');
  await expect(page.getByRole('status')).toContainText('berhasil diakhiri');
  expect(endedBody?.expectedVersion).toBe(0);
});

test('master creates quota without a production default and exposes overlap safely', async ({
  page,
}) => {
  await page.route('**/api/v1/branches', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'branch-1',
            code: 'JKT',
            name: 'Jakarta',
            timezone: 'Asia/Jakarta',
            active: true,
            version: 0,
          },
        ],
        page: { nextCursor: null, hasMore: false },
      }),
    }),
  );
  await page.route('**/api/v1/class-types**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'class-1',
            branchId: 'branch-1',
            code: 'REFORMER',
            name: 'Reformer',
            active: true,
            version: 0,
          },
        ],
        page: { nextCursor: null, hasMore: false },
      }),
    }),
  );
  let calls = 0;
  await page.route('**/api/v1/quota-capacity-settings', (route) => {
    calls += 1;
    return route.fulfill({
      status: calls === 1 ? 201 : 409,
      contentType: 'application/json',
      body: JSON.stringify(
        calls === 1
          ? { id: 'setting-1', status: 'ACTIVE' }
          : { error: { code: 'EFFECTIVE_PERIOD_OVERLAP' } },
      ),
    });
  });
  await page.goto('/master');
  await expect(page.getByLabel('Nilai Rupiah atau minimum quota')).toHaveValue('');
  await page.getByLabel('ID cabang aktif').fill('branch-1');
  await page.getByLabel('ID class type').fill('class-1');
  await page.getByLabel('Nilai Rupiah atau minimum quota').fill('4');
  await page.getByLabel('Capacity (khusus quota)').fill('8');
  await page.getByLabel('Efektif mulai').fill('2026-08-01');
  await page.getByLabel('Alasan').fill('synthetic E2E');
  await page.getByRole('button', { name: 'Buat setting' }).press('Enter');
  await expect(page.getByRole('status')).toContainText('berhasil dibuat');
  await page.getByRole('button', { name: 'Buat setting' }).press('Enter');
  await expect(
    page.getByText('EFFECTIVE_PERIOD_OVERLAP_OR_STALE_VERSION', { exact: true }),
  ).toBeVisible();
});

test('purchase proof clean flow submits one pending intent with keyboard controls', async ({
  page,
}) => {
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'customer-1',
        displayName: 'Customer Synthetic',
        roles: ['CUSTOMER'],
        branchIds: ['branch-1'],
        capabilities: ['package:read'],
        assurance: 'BASE',
        sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
      }),
    }),
  );
  await page.route('**/api/v1/packages**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'package-1',
            branchId: 'branch-1',
            classTypeId: 'class-1',
            businessKey: 'PKG-10',
            name: 'Ten Sessions',
            sessionCount: 10,
            durationDays: 30,
            priceRp: 2000000,
            status: 'ACTIVE',
            effectiveFrom: '2026-01-01',
            effectiveUntil: null,
            version: 0,
          },
        ],
        page: { nextCursor: null, hasMore: false },
      }),
    }),
  );
  await page.route('**/api/v1/uploads/payment-proofs', (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'proof-1',
        status: 'ISSUED',
        scanStatus: 'PENDING',
        uploadReference: 'opaque',
      }),
    }),
  );
  await page.route('**/api/v1/uploads/payment-proofs/proof-1/finalize', (route) =>
    route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'proof-1',
        uploadStatus: 'FINALIZED',
        scanStatus: 'CLEAN',
        fileName: 'proof.png',
        mimeType: 'image/png',
        sizeBytes: 1024,
        version: 0,
      }),
    }),
  );
  await page.route('**/api/v1/purchases', (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'purchase-1',
        userId: 'user-1',
        branchId: 'branch-1',
        packageId: 'package-1',
        paymentProofId: 'proof-1',
        packageNameSnapshot: 'Ten Sessions',
        priceRpSnapshot: 2000000,
        sessionCountSnapshot: 10,
        durationDaysSnapshot: 30,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
        version: 0,
      }),
    }),
  );
  await page.goto('/purchases');
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption('branch-1');
  await page.getByRole('button', { name: 'Muat paket' }).press('Enter');
  await page.getByRole('radio', { name: /Ten Sessions/ }).check();
  await page.getByLabel('Bukti pembayaran', { exact: true }).setInputFiles({
    name: 'proof.png',
    mimeType: 'image/png',
    buffer: Buffer.from('synthetic-proof'),
  });
  await page.getByRole('button', { name: 'Upload dan periksa' }).press('Enter');
  await expect(page.getByText('Bersih', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Kirim pengajuan' }).press('Enter');
  await expect(page.getByText(/Purchase PENDING/)).toBeVisible();
});

test('unsafe scan and provider failure never enable purchase submission', async ({ page }) => {
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'customer-1',
        displayName: 'Customer Synthetic',
        roles: ['CUSTOMER'],
        branchIds: ['branch-1'],
        capabilities: ['package:read'],
        assurance: 'BASE',
        sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
      }),
    }),
  );
  await page.route('**/api/v1/packages**', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'CONFIGURATION_REQUIRED' } }),
    }),
  );
  await page.goto('/purchases');
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption('branch-1');
  await page.getByRole('button', { name: 'Muat paket' }).click();
  await expect(page.getByText(/belum dikonfigurasi/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kirim pengajuan' })).toHaveCount(0);
});

test('MFA purchase review approves once and exposes only an opaque proof authorization', async ({
  page,
}) => {
  await page.route('**/api/v1/users**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'customer-1', status: 'ACTIVE', attributes: { displayName: 'Customer Synthetic' } },
        ],
        page: { nextCursor: null, hasMore: false },
      }),
    }),
  );
  await page.route('**/api/v1/purchases**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'purchase-review-1',
            branchId: 'branch-1',
            userId: 'customer-1',
            packageId: 'package-1',
            paymentProofId: 'proof-review-1',
            packageNameSnapshot: 'Ten Sessions',
            priceRpSnapshot: 2000000,
            sessionCountSnapshot: 10,
            durationDaysSnapshot: 30,
            status: 'PENDING',
            submittedAt: '2026-07-23T02:00:00.000Z',
            version: 0,
          },
        ],
        page: { nextCursor: null, hasMore: false },
      }),
    }),
  );
  await page.route(
    '**/api/v1/uploads/payment-proofs/proof-review-1/download-authorizations',
    (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          url: '/synthetic-private-proof/opaque',
          expiresAt: new Date(Date.now() + 60000).toISOString(),
        }),
      }),
  );
  await page.route('**/api/v1/purchases/purchase-review-1/approve', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        purchase: {
          id: 'purchase-review-1',
          branchId: 'branch-1',
          userId: 'customer-1',
          packageId: 'package-1',
          paymentProofId: 'proof-review-1',
          packageNameSnapshot: 'Ten Sessions',
          priceRpSnapshot: 2000000,
          sessionCountSnapshot: 10,
          durationDaysSnapshot: 30,
          status: 'APPROVED',
          submittedAt: new Date().toISOString(),
          version: 1,
        },
        customerPackage: { id: 'cp-1' },
        ledgerEntry: { id: 'ledger-1' },
        idempotentReplay: false,
      }),
    }),
  );
  await page.goto('/purchases');
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption('branch-1');
  await page.getByRole('button', { name: 'Muat queue' }).press('Enter');
  for (const viewport of [
    { name: 'desktop-1280', width: 1280, height: 900 },
    { name: 'tablet-768', width: 768, height: 900 },
    { name: 'mobile-360', width: 360, height: 800 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expect(page).toHaveScreenshot(`purchases-${viewport.name}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole('button', { name: /Customer Synthetic/ }).press('Enter');
  await page.getByRole('button', { name: 'Buka bukti privat' }).press('Enter');
  await expect(page.getByRole('status')).toContainText('Bukti privat diotorisasi');
  await page.getByRole('button', { name: 'Setujui purchase' }).press('Enter');
  await expect(
    page.getByRole('dialog', { name: 'Detail review' }).getByText('Disetujui', { exact: true }),
  ).toBeVisible();
});

test('ledger balance and history are keyboard accessible and branch scoped', async ({ page }) => {
  const balance = {
    id: 'cp-1',
    branchId: 'branch-1',
    customerUserId: 'customer-1',
    packageId: 'package-1',
    classTypeId: 'class-1',
    status: 'ACTIVE',
    activationDate: '2026-01-01',
    expiryAt: '2099-01-01T00:00:00Z',
    ledgerBalance: 10,
    reserved: 2,
    available: 8,
    salePriceRp: 2000000,
    sessionCountSnapshot: 10,
    durationDaysSnapshot: 30,
    projectionRateRp: 100000,
    version: 0,
  };
  await page.route('**/api/v1/customer-packages?branchId=branch-1', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [balance], page: { nextCursor: null, hasMore: false } }),
    }),
  );
  await page.route('**/api/v1/customer-packages/cp-1/ledger', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        balance,
        reservations: { activeQuantity: 2 },
        entries: [
          {
            id: 'entry-1',
            customerPackageId: 'cp-1',
            type: 'PURCHASE',
            quantity: 10,
            referenceType: 'PURCHASE',
            referenceId: 'purchase-1',
            occurredAt: '2026-01-01T00:00:00Z',
          },
        ],
        page: { nextCursor: null, hasMore: false },
      }),
    }),
  );
  await page.goto('/ledger');
  await page.getByLabel('Cabang ledger').fill('branch-1');
  await page.getByRole('button', { name: 'Muat saldo' }).press('Enter');
  await page.getByRole('button', { name: /total 10.*reserved 2.*tersedia 8/ }).press('Enter');
  await expect(page.getByText('PURCHASE 10')).toBeVisible();
});

test('session adjustment request and MFA review use controlled codes with keyboard flow', async ({
  page,
}) => {
  const pending = {
    id: 'adj-1',
    customerPackageId: 'cp-1',
    quantity: -2,
    reasonCode: 'ATTENDANCE_CORRECTION',
    requestedById: 'admin-1',
    status: 'PENDING',
    version: 0,
    createdAt: '2026-07-22T00:00:00Z',
  };
  let listed = true;
  await page.route('**/api/v1/session-adjustments**', async (route) => {
    const request = route.request();
    if (request.method() === 'GET')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: listed ? [pending] : [],
          page: { hasMore: false, nextCursor: null },
        }),
      });
    if (request.url().includes('/adj-1/approve')) {
      listed = false;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          adjustment: { ...pending, status: 'POSTED', version: 1 },
          resultingBalance: 8,
          idempotentReplay: false,
        }),
      });
    }
    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ ...pending, idempotentReplay: false }),
    });
  });
  await page.goto('/ledger');
  await page.getByLabel('Paket customer').fill('cp-1');
  await page.getByLabel('Delta sesi').fill('-2');
  await page.getByLabel('Alasan terkontrol').selectOption('ATTENDANCE_CORRECTION');
  await page.getByRole('button', { name: 'Buat request adjustment' }).press('Enter');
  await expect(page.getByRole('status')).toContainText('tanpa mutasi saldo');
  await page.getByRole('button', { name: 'Muat antrean adjustment' }).press('Enter');
  await page.getByRole('button', { name: 'Setujui' }).press('Enter');
  await expect(page.getByRole('button', { name: 'Setujui' })).toHaveCount(0);
});

test('assignment overlap and hidden branch failures do not show optimistic success', async ({
  page,
}) => {
  await page.route('**/api/v1/assignments**', (route) =>
    route.fulfill({
      status: route.request().method() === 'GET' ? 404 : 409,
      contentType: 'application/problem+json',
      body: JSON.stringify({ code: 'EFFECTIVE_PERIOD_OVERLAP' }),
    }),
  );
  await page.goto('/assignments');
  await page.getByLabel('ID cabang aktif').fill('foreign-branch');
  await page.getByRole('button', { name: 'Muat assignment' }).click();
  await expect(page.getByText('RESOURCE_NOT_FOUND', { exact: true })).toBeVisible();
  await page.getByLabel('ID pengguna').fill('user-1');
  await page.getByLabel('Aktif mulai').fill('2026-08-01');
  await page.getByLabel('Alasan').fill('overlap test');
  await page.getByRole('button', { name: 'Buat assignment' }).click();
  await expect(page.getByText('EFFECTIVE_PERIOD_OVERLAP', { exact: true })).toBeVisible();
  await expect(page.getByText('Assignment berhasil dibuat.')).toHaveCount(0);
});

test('class-slot draft assign publish and cancel lifecycle is keyboard operable', async ({
  page,
}) => {
  let slot = {
    id: 'slot-1',
    branchId: 'branch-1',
    classTypeId: 'type-1',
    instructorUserId: null as string | null,
    startAt: '2026-07-24T02:00:00Z',
    endAt: '2026-07-24T03:00:00Z',
    timezone: 'Asia/Jakarta',
    status: 'DRAFT' as string,
    minimumQuota: 2,
    capacity: 8,
    bookedCount: 0,
    cancellationReasonCode: null as string | null,
    version: 0,
    idempotentReplay: false,
  };
  await page.route('**/api/v1/class-types**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'type-1',
            branchId: 'branch-1',
            code: 'REF',
            name: 'Reformer',
            active: true,
            version: 0,
          },
        ],
        page: { hasMore: false, nextCursor: null },
      }),
    }),
  );
  await page.route('**/api/v1/users**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          { id: 'instructor-1', status: 'ACTIVE', attributes: { displayName: 'Ayu Instructor' } },
        ],
        page: { hasMore: false, nextCursor: null },
      }),
    }),
  );
  await page.route('**/api/v1/assignments**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'assignment-1',
            userId: 'instructor-1',
            branchId: 'branch-1',
            assignmentType: 'INSTRUCTOR',
            activeFrom: '2026-01-01',
            activeUntil: null,
            version: 0,
          },
        ],
        page: { hasMore: false, nextCursor: null },
      }),
    }),
  );
  await page.route('**/api/v1/class-slots**', async (route) => {
    const request = route.request();
    const url = request.url();
    if (request.method() === 'GET')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [slot], page: { hasMore: false, nextCursor: null } }),
      });
    if (url.endsWith('/assign-instructor'))
      slot = { ...slot, instructorUserId: 'instructor-1', version: 1 };
    else if (url.endsWith('/publish')) slot = { ...slot, status: 'PUBLISHED', version: 2 };
    else if (url.endsWith('/cancel'))
      slot = {
        ...slot,
        status: 'CANCELLED',
        cancellationReasonCode: 'OTHER_REVIEW_REQUIRED',
        version: 3,
      };
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(slot),
    });
  });
  await page.goto('/workspace/classes');
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption('branch-1');
  await page.getByRole('button', { name: 'Muat timetable' }).press('Enter');
  for (const viewport of [
    { name: 'desktop-1280', width: 1280, height: 900 },
    { name: 'tablet-768', width: 768, height: 900 },
    { name: 'mobile-360', width: 360, height: 800 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expect(page).toHaveScreenshot(`classes-${viewport.name}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page
    .getByRole('region', { name: 'Kalender kelas tujuh hari' })
    .getByRole('button', { name: /Reformer/ })
    .click();
  const dialog = page.getByRole('dialog', { name: 'Detail kelas' });
  await dialog.getByLabel('Instructor', { exact: true }).selectOption('instructor-1');
  await dialog.getByRole('button', { name: 'Tetapkan instructor' }).press('Enter');
  await expect(page.getByText('Instructor berhasil ditetapkan.', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Publish kelas' }).press('Enter');
  await expect(dialog.getByText('Dipublikasikan', { exact: true })).toBeVisible();
  await dialog.getByLabel('Alasan pembatalan').selectOption('OTHER_REVIEW_REQUIRED');
  await dialog.getByRole('button', { name: 'Konfirmasi pembatalan' }).press('Enter');
  await expect(dialog.getByText('Dibatalkan', { exact: true })).toBeVisible();
});

test('class-slot configuration and hidden failures never show optimistic success', async ({
  page,
}) => {
  await page.route('**/api/v1/class-slots**', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/problem+json',
      body: JSON.stringify({ code: 'CONFIGURATION_REQUIRED' }),
    }),
  );
  await page.route('**/api/v1/class-types**', (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ items: [], page: { hasMore: false } }) }),
  );
  await page.route('**/api/v1/users**', (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ items: [], page: { hasMore: false } }) }),
  );
  await page.route('**/api/v1/assignments**', (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ items: [], page: { hasMore: false } }) }),
  );
  await page.goto('/workspace/classes');
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption('branch-1');
  await page.getByRole('button', { name: 'Muat timetable' }).click();
  await expect(page.getByText(/Konfigurasi quota atau capacity/)).toBeVisible();
  await expect(page.getByText('Draft kelas berhasil dibuat.')).toHaveCount(0);
});

test('operations H-24 queue and MFA recovery are keyboard operable', async ({ page }) => {
  const job = {
    id: '00000000-0000-4000-8000-000000000101',
    type: 'H24_QUOTA_EVALUATION',
    status: 'RETRYING',
    attemptCount: 1,
    maxAttempts: 5,
    progress: 0,
    dueAt: '2026-07-22T00:00:00Z',
    nextAttemptAt: '2026-07-22T00:01:00Z',
    leaseExpiresAt: null,
    lastErrorCode: 'DEPENDENCY_UNAVAILABLE',
    createdAt: '2026-07-21T00:00:00Z',
    version: 1,
  };
  await page.route('**/api/v1/operations/jobs', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [job], page: { hasMore: false, nextCursor: null } }),
    }),
  );
  await page.route('**/api/v1/operations/quota-evaluations/*/run', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        classSlotId: '00000000-0000-4000-8000-000000000102',
        previousStatus: 'PUBLISHED',
        status: 'CONFIRMED',
        bookingCount: 2,
        minimumQuota: 2,
        releasedReservationIds: [],
        outboxEventIds: ['00000000-0000-4000-8000-000000000103'],
        evaluatedAt: '2026-07-22T00:02:00Z',
        idempotentReplay: false,
      }),
    }),
  );
  await page.goto('/operations');
  await page.getByRole('button', { name: 'Muat job' }).press('Enter');
  await expect(page.getByText(/RETRYING.*DEPENDENCY_UNAVAILABLE/)).toBeVisible();
  await page.getByRole('button', { name: 'Jalankan recovery MFA' }).press('Enter');
  await expect(page.getByText('Evaluasi selesai.')).toBeVisible();
});

test('assisted booking reserves one session with keyboard confirmation', async ({ page }) => {
  const branchId = '00000000-0000-4000-8000-000000000301';
  const classSlotId = '00000000-0000-4000-8000-000000000302';
  const customerUserId = '00000000-0000-4000-8000-000000000303';
  const customerPackageId = '00000000-0000-4000-8000-000000000304';
  await routeBookingDiscovery(page, { branchId, classSlotId, customerUserId, customerPackageId });
  await page.route('**/api/v1/bookings**', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], page: { hasMore: false, nextCursor: null } }),
      });
    return route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '00000000-0000-4000-8000-000000000305',
        branchId,
        classSlotId,
        customerUserId,
        customerPackageId,
        reservationId: '00000000-0000-4000-8000-000000000306',
        createdById: '00000000-0000-4000-8000-000000000307',
        source: 'ADMIN_ASSISTED',
        status: 'BOOKED',
        reservedQuantity: 1,
        createdAt: new Date().toISOString(),
        version: 0,
        idempotentReplay: false,
      }),
    });
  });
  await page.goto('/bookings');
  await page.getByLabel('Cabang aktif').selectOption(branchId);
  await page.getByRole('button', { name: 'Muat data booking' }).press('Enter');
  await page.getByLabel('Pelanggan', { exact: true }).selectOption(customerUserId);
  await page.getByLabel('Paket pelanggan').selectOption(customerPackageId);
  await page.getByLabel('Kelas').selectOption(classSlotId);
  await expect(page.getByText(/Saldo tersedia berubah dari 8 menjadi 7/)).toBeVisible();
  await page.getByRole('button', { name: 'Konfirmasi booking satu sesi' }).press('Enter');
  await expect(page.getByText('Booking dibuat; satu sesi telah direservasi.')).toBeVisible();
  await expect(page.getByText(/BOOKED.*reservasi 1 sesi/)).toBeVisible();
});

test('booking conflict never renders optimistic success', async ({ page }) => {
  const branchId = '00000000-0000-4000-8000-000000000301';
  const classSlotId = '00000000-0000-4000-8000-000000000302';
  const customerUserId = '00000000-0000-4000-8000-000000000303';
  const customerPackageId = '00000000-0000-4000-8000-000000000304';
  await routeBookingDiscovery(page, { branchId, classSlotId, customerUserId, customerPackageId });
  await page.route('**/api/v1/bookings**', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [], page: { hasMore: false, nextCursor: null } }),
        })
      : route.fulfill({
          status: 409,
          contentType: 'application/problem+json',
          body: JSON.stringify({ code: 'CLASS_CAPACITY_FULL' }),
        }),
  );
  await page.goto('/bookings');
  await page.getByLabel('Cabang aktif').selectOption(branchId);
  await page.getByRole('button', { name: 'Muat data booking' }).click();
  await page.getByLabel('Pelanggan', { exact: true }).selectOption(customerUserId);
  await page.getByLabel('Paket pelanggan').selectOption(customerPackageId);
  await page.getByLabel('Kelas').selectOption(classSlotId);
  await page.getByRole('button', { name: 'Konfirmasi booking satu sesi' }).click();
  await expect(page.getByText('Kapasitas kelas sudah penuh.', { exact: true })).toBeVisible();
  await expect(page.getByText('Booking dibuat; satu sesi telah direservasi.')).toHaveCount(0);
});

test('MFA reschedule review moves one reservation with controlled decision', async ({ page }) => {
  const branchId = '00000000-0000-4000-8000-000000000301';
  const sourceClassSlotId = '00000000-0000-4000-8000-000000000302';
  const targetClassSlotId = '00000000-0000-4000-8000-000000000308';
  const customerUserId = '00000000-0000-4000-8000-000000000303';
  const customerPackageId = '00000000-0000-4000-8000-000000000304';
  const bookingId = '00000000-0000-4000-8000-000000000305';
  const rescheduleId = '00000000-0000-4000-8000-000000000309';
  const reschedule = {
    id: rescheduleId,
    branchId,
    bookingId,
    sourceClassSlotId,
    targetClassSlotId,
    requestedById: customerUserId,
    requestReasonCode: 'PERSONAL_UNAVAILABLE',
    status: 'PENDING',
    entitlementCutoffAt: '2027-01-01T02:00:00Z',
    entitledAtRequest: true,
    requestedAt: '2026-12-31T00:00:00Z',
    version: 0,
    idempotentReplay: false,
  };
  await routeBookingDiscovery(
    page,
    { branchId, classSlotId: targetClassSlotId, customerUserId, customerPackageId },
    [reschedule],
  );
  await page.route('**/api/v1/bookings**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], page: { hasMore: false, nextCursor: null } }),
    }),
  );
  await page.route('**/api/v1/reschedules/*/approve', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reschedule: {
          ...reschedule,
          status: 'APPROVED',
          decisionReasonCode: 'ELIGIBILITY_VERIFIED',
          decidedById: 'user-1',
          decidedAt: new Date().toISOString(),
          version: 1,
        },
        booking: {
          id: bookingId,
          branchId,
          classSlotId: targetClassSlotId,
          customerUserId,
          customerPackageId,
          reservationId: '00000000-0000-4000-8000-000000000306',
          createdById: customerUserId,
          source: 'SELF',
          status: 'BOOKED',
          reservedQuantity: 1,
          createdAt: new Date().toISOString(),
          version: 2,
          idempotentReplay: false,
        },
        idempotentReplay: false,
      }),
    }),
  );
  await page.goto('/bookings');
  await page.getByLabel('Cabang aktif').selectOption(branchId);
  await page.getByRole('button', { name: 'Muat data booking' }).click();
  await page.getByRole('button', { name: /Tinjau reschedule/ }).press('Enter');
  await page.getByRole('button', { name: 'Setujui reschedule' }).press('Enter');
  await expect(
    page.getByText('Reschedule disetujui dan reservation dipindahkan secara atomik.'),
  ).toBeVisible();
  await expect(page.getByRole('list', { name: 'Queue reschedule' })).toHaveCount(0);
});
