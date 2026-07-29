import { expect, test, type Page } from '@playwright/test';
import { hideNextDevelopmentAffordances } from './e2e-visual-helpers';

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
  await hideNextDevelopmentAffordances(page);
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
  await page.route('**/api/v1/lookups/customers**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: ids.customerUserId,
            label: 'Customer Synthetic',
            description: '08••••0303',
            metadata: {
              verificationStatus: 'APPROVED',
              eligiblePackageCount: 1,
            },
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
  await page.route('**/api/v1/auth/password/sessions', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    }),
  );
  await page.goto('/sign-in?returnTo=https://evil.example/steal');
  await page.getByLabel('Email', { exact: true }).fill('owner@example.test');
  await page.getByLabel('Password').fill('secure-password');
  await page.getByRole('button', { name: 'Masuk dengan email' }).press('Enter');
  await expect(page).toHaveURL('/workspace');
  await expect(
    page.getByRole('heading', { name: 'Selamat datang, Synthetic Super Owner' }),
  ).toBeVisible();
});

test('assignment create and end use one branch and expected version', async ({ page }) => {
  let assignments: Array<Record<string, unknown>> = [];
  let endedBody: Record<string, unknown> | undefined;
  await page.route('**/api/v1/lookups/users**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'user-1',
            label: 'Synthetic Instructor',
            description: '08••••0101',
          },
        ],
        page: { nextCursor: null, hasMore: false },
      }),
    }),
  );
  await page.route('**/api/v1/assignments**', async (route) => {
    const request = route.request();
    if (request.method() === 'GET')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: assignments,
          summary: {
            total: assignments.length,
            active: assignments.filter((item) => item.status === 'ACTIVE').length,
            ended: assignments.filter((item) => item.status === 'ENDED').length,
          },
          page: { nextCursor: null, hasMore: false },
        }),
      });
    if (request.url().endsWith('/end')) {
      endedBody = request.postDataJSON();
      assignments = [
        {
          ...assignments[0],
          activeUntil: '2026-08-10T00:00:00.000Z',
          status: 'ENDED',
          version: 1,
        },
      ];
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
        activeFrom: '2026-08-01T00:00:00.000Z',
        activeUntil: null,
        status: 'ACTIVE',
        user: {
          id: 'user-1',
          displayName: 'Synthetic Instructor',
          phoneMasked: '08••••0101',
        },
        branch: { id: 'branch-1', code: 'JKT', name: 'Jakarta' },
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
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption('branch-1');
  await page.getByRole('button', { name: 'Buat assignment' }).click();
  const assignmentDrawer = page.getByRole('dialog', { name: 'Buat assignment' });
  await assignmentDrawer.getByLabel('Pengguna').fill('Synthetic');
  await assignmentDrawer.getByRole('option', { name: /Synthetic Instructor/ }).click();
  await assignmentDrawer.getByLabel('Aktif mulai').fill('2026-08-01');
  await assignmentDrawer.getByLabel('Alasan').fill('synthetic create');
  await assignmentDrawer.getByRole('button', { name: 'Buat assignment' }).click();
  await page
    .getByRole('dialog', { name: 'Buat assignment?' })
    .getByRole('button', {
      name: 'Buat assignment',
    })
    .click();
  await expect(page.getByText('Assignment baru telah dicatat dan diaudit.')).toBeVisible();
  await page.getByRole('button', { name: 'Akhiri', exact: true }).click();
  await page.getByLabel('Efektif berakhir').fill('2026-08-10T00:00');
  await page
    .getByRole('dialog', { name: 'Akhiri assignment' })
    .getByLabel('Alasan')
    .fill('synthetic end');
  await page
    .getByRole('dialog', { name: 'Akhiri assignment' })
    .getByRole('button', {
      name: 'Akhiri assignment',
    })
    .click();
  await page
    .getByRole('dialog', { name: 'Konfirmasi akhir assignment' })
    .getByRole('button', {
      name: 'Akhiri assignment',
    })
    .click();
  await expect(page.getByText('Perubahan periode telah dicatat dalam audit.')).toBeVisible();
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
  await page.route('**/api/v1/quota-capacity-settings**', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], page: { nextCursor: null, hasMore: false } }),
      });
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
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption('branch-1');
  await page.getByRole('tab', { name: 'Kuota/Kapasitas' }).click();
  await expect(page.getByLabel('Minimum peserta')).toHaveValue('');
  await expect(page.getByLabel('Cabang aktif', { exact: true })).toHaveValue('branch-1');
  await expect(
    page.getByRole('form', { name: 'Buat effective setting' }).getByRole('combobox').nth(1),
  ).toHaveValue('class-1');
  await page.getByLabel('Minimum peserta').fill('4');
  await page.getByLabel('Kapasitas maksimum').fill('8');
  await page.getByLabel('Efektif mulai').fill('2026-08-01');
  await page.getByLabel('Alasan perubahan').fill('Penyesuaian operasional E2E');
  await expect(page.getByRole('button', { name: 'Simpan konfigurasi' })).toBeEnabled();
  await page.getByRole('button', { name: 'Simpan konfigurasi' }).press('Enter');
  await expect(page.getByRole('region', { name: 'Data Master' }).getByRole('status')).toContainText(
    'berhasil dibuat',
  );
  await page.getByLabel('Minimum peserta').fill('4');
  await page.getByLabel('Kapasitas maksimum').fill('8');
  await page.getByLabel('Efektif mulai').fill('2026-08-01');
  await page.getByLabel('Alasan perubahan').fill('Validasi periode tumpang tindih');
  await page.getByRole('button', { name: 'Simpan konfigurasi' }).press('Enter');
  await expect(
    page.getByText('EFFECTIVE_PERIOD_OVERLAP_OR_STALE_VERSION', { exact: true }),
  ).toBeVisible();
});

test('permission-gated purchase review approves once and exposes only an opaque proof authorization', async ({
  page,
}) => {
  let approved = false;
  const purchase = () => ({
    id: 'purchase-review-1',
    branchId: 'branch-1',
    userId: 'customer-1',
    packageId: 'package-1',
    paymentProofId: 'proof-review-1',
    packageNameSnapshot: 'Ten Sessions',
    priceRpSnapshot: 2000000,
    payableAmountRpSnapshot: 2000377,
    paymentUniqueCode: 377,
    sessionCountSnapshot: 10,
    durationDaysSnapshot: 30,
    status: approved ? 'APPROVED' : 'PENDING',
    submittedAt: '2026-07-23T02:00:00.000Z',
    auditReference: approved ? 'audit-payment-1' : null,
    version: approved ? 1 : 0,
    customer: {
      id: 'customer-1',
      displayName: 'Customer Synthetic',
      phoneMasked: '08••••0101',
    },
    branch: { id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' },
    paymentProof: {
      id: 'proof-review-1',
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN',
      mimeType: 'image/png',
      sizeBytes: 68,
      finalizedAt: '2026-07-23T02:01:00.000Z',
    },
    activationSummary: approved
      ? {
          customerPackageId: 'cp-1',
          status: 'ACTIVE',
          activationDate: '2026-07-23T02:02:00.000Z',
          expiryAt: '2026-08-22T02:02:00.000Z',
          initialSessions: 10,
          ledgerBalance: 10,
          reserved: 0,
          available: 10,
        }
      : null,
  });
  await page.route('**/api/v1/purchases**', (route) => {
    if (route.request().url().endsWith('/approve')) {
      approved = true;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          purchase: purchase(),
          customerPackage: {
            id: 'cp-1',
            branchId: 'branch-1',
            customerUserId: 'customer-1',
            packageId: 'package-1',
            classTypeId: 'class-1',
            packageName: 'Ten Sessions',
            status: 'ACTIVE',
            activationDate: '2026-07-23',
            expiryAt: '2026-08-22T02:02:00.000Z',
            ledgerBalance: 10,
            reserved: 0,
            available: 10,
            salePriceRp: 2000000,
            sessionCountSnapshot: 10,
            durationDaysSnapshot: 30,
            projectionRateRp: 100000,
            version: 0,
          },
          ledgerEntry: {
            id: 'ledger-1',
            customerPackageId: 'cp-1',
            type: 'PURCHASE',
            quantity: 10,
            referenceType: 'PURCHASE',
            referenceId: 'purchase-review-1',
            occurredAt: '2026-07-23T02:02:00.000Z',
          },
          idempotentReplay: false,
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [purchase()],
        summary: {
          pending: approved ? 0 : 1,
          actionRequired: 0,
          approved: approved ? 1 : 0,
          rejected: 0,
          expired: 0,
          totalAmountRp: 2000377,
          agingOver24Hours: 0,
        },
        generatedAt: '2026-07-23T02:05:00.000Z',
        page: { nextCursor: null, hasMore: false },
      }),
    });
  });
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
  await page.route('**/synthetic-private-proof/opaque', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nXsAAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  await page.goto('/workspace/payments');
  await expect(page.getByText('Customer Synthetic').first()).toBeVisible();
  await page.getByRole('button', { name: 'Preview bukti' }).first().click();
  await expect(
    page.getByRole('dialog', { name: 'Bukti pembayaran Customer Synthetic' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Tutup dialog' }).click();
  await page.getByRole('button', { name: 'Setujui', exact: true }).first().click();
  await page
    .getByRole('dialog', { name: 'Setujui pembayaran' })
    .getByRole('button', { name: 'Setujui dan aktifkan paket' })
    .click();
  await expect(page.getByText('Pembayaran disetujui')).toBeVisible();
  await expect(page.getByText('Paket aktif')).toBeVisible();
});

test('ledger balance and history are keyboard accessible and branch scoped', async ({ page }) => {
  const balance = {
    id: 'cp-1',
    branchId: 'branch-1',
    branchName: 'Jakarta',
    customerUserId: 'customer-1',
    customer: { id: 'customer-1', displayName: 'Customer Synthetic', phoneMasked: '08••••0101' },
    packageId: 'package-1',
    packageName: 'Ten Sessions',
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
  await page.route('**/api/v1/customer-packages**', (route) =>
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
  await page.route('**/api/v1/session-adjustments**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], page: { nextCursor: null, hasMore: false } }),
    }),
  );
  await page.goto('/ledger');
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption('branch-1');
  await page.getByRole('button', { name: 'Lihat histori' }).press('Enter');
  await expect(page.getByText('Aktivasi paket')).toBeVisible();
  await expect(page.getByText('+10')).toBeVisible();
});

test('session adjustment request and permission review use controlled codes with keyboard flow', async ({
  page,
}) => {
  const adjustablePackage = {
    id: 'cp-1',
    branchId: 'branch-1',
    branchName: 'Jakarta',
    customerUserId: 'customer-1',
    customer: { id: 'customer-1', displayName: 'Customer Synthetic', phoneMasked: '08••••0101' },
    packageId: 'package-1',
    packageName: 'Ten Sessions',
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
  const pending = {
    id: 'adj-1',
    customerPackageId: 'cp-1',
    quantity: -2,
    reasonCode: 'ATTENDANCE_CORRECTION',
    requestedById: 'admin-1',
    status: 'PENDING',
    version: 0,
    createdAt: '2026-07-22T00:00:00Z',
    ledgerBalanceAtRequest: 10,
    reservedAtRequest: 2,
    customer: adjustablePackage.customer,
    branch: { id: 'branch-1', name: 'Jakarta' },
    package: { id: 'package-1', name: 'Ten Sessions' },
    classType: { id: 'class-1', name: 'Reformer' },
    requestedBy: { id: 'admin-1', displayName: 'Admin Synthetic' },
    currentBalance: 10,
    currentReserved: 2,
    currentAvailable: 8,
    projectedLedgerBalance: 8,
    projectedAvailable: 6,
    eligibleForApproval: true,
  };
  let listed = true;
  await page.route('**/api/v1/customer-packages**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [adjustablePackage],
        summary: { packageCount: 1, ledgerBalance: 10, reserved: 2, available: 8 },
        page: { hasMore: false, nextCursor: null },
      }),
    }),
  );
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
  await page.goto('/ledger?tab=adjustments');
  await page.getByLabel('Cari customer atau paket aktif').fill('Customer');
  await page.getByRole('button', { name: /Customer Synthetic · Ten Sessions/ }).click();
  await page.getByLabel('Perubahan sesi').fill('-2');
  await page.getByLabel('Alasan').selectOption('ATTENDANCE_CORRECTION');
  await page.getByRole('button', { name: 'Tinjau dan buat permintaan' }).press('Enter');
  await page
    .getByRole('dialog', { name: 'Konfirmasi permintaan penyesuaian' })
    .getByRole('button', {
      name: 'Buat permintaan',
    })
    .click();
  await expect(page.getByText(/menunggu keputusan tanpa mengubah saldo/)).toBeVisible();
  await page.getByRole('button', { name: 'Setujui' }).press('Enter');
  await page.getByRole('button', { name: 'Konfirmasi keputusan' }).click();
  await page
    .getByRole('dialog', { name: 'Setujui penyesuaian sesi' })
    .getByRole('button', {
      name: 'Setujui dan posting',
    })
    .click();
  await expect(page.getByRole('button', { name: 'Setujui' })).toHaveCount(0);
});

test('class-slot draft assign publish and cancel lifecycle is keyboard operable', async ({
  page,
}) => {
  let slot = {
    id: 'slot-1',
    branchId: 'branch-1',
    classTypeId: 'type-1',
    instructorUserId: null as string | null,
    startAt: '2026-07-29T02:00:00Z',
    endAt: '2026-07-29T03:00:00Z',
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
          {
            id: 'instructor-1',
            displayName: 'Ayu Instructor',
            phoneE164: null,
            status: 'ACTIVE',
            version: 0,
            createdAt: '2026-07-23T00:00:00.000Z',
            updatedAt: '2026-07-23T00:00:00.000Z',
            roles: [],
            directRoles: [],
            assignmentRoles: [],
            effectiveCapabilities: [],
          },
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
  await expect(
    page
      .getByRole('region', { name: 'Kalender kelas tujuh hari' })
      .getByRole('button', { name: /Reformer/ }),
  ).toBeVisible();
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption('branch-1');
  await expect(
    page
      .getByRole('region', { name: 'Kalender kelas tujuh hari' })
      .getByRole('button', { name: /Reformer/ }),
  ).toBeVisible();
  for (const viewport of [
    { name: 'desktop-1280', width: 1280, height: 900 },
    { name: 'tablet-768', width: 768, height: 900 },
    { name: 'mobile-360', width: 360, height: 800 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await expect(page).toHaveScreenshot(`classes-${viewport.name}.png`, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
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
  await expect(page.getByText(/Konfigurasi quota atau capacity/)).toBeVisible();
  await expect(page.getByText('Draft kelas berhasil dibuat.')).toHaveCount(0);
});

test('operations H-24 queue and recovery are keyboard operable', async ({ page }) => {
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
  await page.route('**/api/v1/operations/jobs**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [job], page: { hasMore: false, nextCursor: null } }),
    }),
  );
  await page.route('**/api/v1/operations/email-deliveries**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [],
        metrics: {
          pendingCount: 0,
          acceptedRateBasisPoints: 10000,
          terminalCount: 0,
          fallbackCount: 0,
          retryableCount: 0,
        },
        page: { hasMore: false, nextCursor: null },
      }),
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
  await expect(
    page.getByRole('row', { name: /Mencoba kembali.*Memerlukan pemeriksaan operasional/ }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Jalankan recovery' }).press('Enter');
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
  await page.goto('/workspace/bookings');
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption(branchId);
  await page.getByRole('button', { name: 'Buat booking manual' }).click();
  await page.getByLabel('Pelanggan', { exact: true }).selectOption(customerUserId);
  await page.getByLabel('Paket pelanggan').selectOption(customerPackageId);
  await page.getByLabel('Kelas').selectOption(classSlotId);
  await expect(page.getByText(/Saldo tersedia berubah dari 8 menjadi 7/)).toBeVisible();
  await page.getByRole('button', { name: 'Konfirmasi booking satu sesi' }).press('Enter');
  await expect(page.getByText('Booking dibuat; satu sesi telah direservasi.')).toBeVisible();
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
  await page.goto('/workspace/bookings');
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption(branchId);
  await page.getByRole('button', { name: 'Buat booking manual' }).click();
  await page.getByLabel('Pelanggan', { exact: true }).selectOption(customerUserId);
  await page.getByLabel('Paket pelanggan').selectOption(customerPackageId);
  await page.getByLabel('Kelas').selectOption(classSlotId);
  await page.getByRole('button', { name: 'Konfirmasi booking satu sesi' }).click();
  await expect(page.getByText('Kapasitas kelas sudah penuh.', { exact: true })).toBeVisible();
  await expect(page.getByText('Booking dibuat; satu sesi telah direservasi.')).toHaveCount(0);
});

test('permission-gated reschedule review moves one reservation with controlled decision', async ({
  page,
}) => {
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
  let reschedulePending = true;
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
  await page.unroute('**/api/v1/reschedules**');
  await page.route('**/api/v1/reschedules**', (route) => {
    if (route.request().url().endsWith('/approve')) {
      reschedulePending = false;
      return route.fulfill({
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
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: reschedulePending ? [reschedule] : [],
        page: { hasMore: false, nextCursor: null },
      }),
    });
  });
  await page.goto('/workspace/bookings?tab=reschedules');
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption(branchId);
  await page.getByRole('button', { name: /Tinjau reschedule/ }).press('Enter');
  await page.getByRole('button', { name: 'Setujui reschedule' }).press('Enter');
  await expect(
    page.getByText('Reschedule disetujui dan reservation dipindahkan secara atomik.'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /Tinjau reschedule/ })).toHaveCount(0);
});
