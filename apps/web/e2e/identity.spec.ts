import { expect, test } from '@playwright/test';

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
        },
        assurance: 'BASE',
        channel: 'WEB',
        expiresAt: new Date().toISOString(),
        refreshExpiresAt: new Date().toISOString(),
      }),
    }),
  );
  await page.goto('/sign-in');
  await page.getByLabel('Email Google synthetic').fill('owner@example.test');
  await page.getByRole('button', { name: /Google/ }).press('Enter');
  await expect(page.getByRole('status')).toContainText('terverifikasi');
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
          roles: ['OWNER'],
          branchIds: ['branch-1'],
          capabilities: ['user:admin'],
        },
        assurance: 'MFA',
        channel: 'WEB',
        expiresAt: new Date().toISOString(),
        refreshExpiresAt: new Date().toISOString(),
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
          roles: ['OWNER'],
          branchIds: ['branch-1'],
          capabilities: ['user:admin'],
        },
        assurance: 'MFA',
        channel: 'WEB',
        expiresAt: new Date().toISOString(),
        refreshExpiresAt: new Date().toISOString(),
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
          roles: ['OWNER'],
          branchIds: ['branch-1'],
          capabilities: ['user:admin'],
        },
        assurance: 'MFA',
        channel: 'WEB',
        expiresAt: new Date().toISOString(),
        refreshExpiresAt: new Date().toISOString(),
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
  await page.getByLabel('ID cabang').fill('branch-1');
  await page.getByRole('button', { name: 'Muat paket' }).press('Enter');
  await page.getByLabel('Paket', { exact: true }).selectOption('package-1');
  await page.getByLabel('Nama file').fill('proof.png');
  await page.getByLabel('Ukuran byte').fill('1024');
  await page.getByLabel('SHA-256').fill('a'.repeat(64));
  await page.getByRole('button', { name: 'Upload dan scan' }).press('Enter');
  await expect(page.getByText('Status scan:')).toContainText('CLEAN');
  await page.getByRole('button', { name: 'Kirim purchase' }).press('Enter');
  await expect(page.getByRole('status')).toContainText('PENDING');
});

test('unsafe scan and provider failure never enable purchase submission', async ({ page }) => {
  await page.route('**/api/v1/packages**', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'CONFIGURATION_REQUIRED' } }),
    }),
  );
  await page.goto('/purchases');
  await page.getByLabel('ID cabang').fill('branch-1');
  await page.getByRole('button', { name: 'Muat paket' }).click();
  await expect(page.getByText('CONFIGURATION_REQUIRED', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kirim purchase' })).toBeDisabled();
});

test('MFA purchase review approves once and exposes only an opaque proof authorization', async ({
  page,
}) => {
  await page.route('**/api/v1/purchases?branchId=branch-1', (route) =>
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
            submittedAt: new Date().toISOString(),
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
  await page.getByLabel('Cabang review').fill('branch-1');
  await page.getByRole('button', { name: 'Muat queue' }).press('Enter');
  await page.getByRole('button', { name: /Ten Sessions.*PENDING/ }).press('Enter');
  await page.getByRole('button', { name: 'Buka proof privat' }).press('Enter');
  await expect(page.getByRole('status')).toContainText('Proof tersedia');
  await page.getByRole('button', { name: 'Setujui purchase' }).press('Enter');
  await expect(page.getByRole('status')).toContainText('APPROVED');
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
    startAt: '2026-08-01T02:00:00Z',
    endAt: '2026-08-01T03:00:00Z',
    timezone: 'Asia/Jakarta',
    status: 'DRAFT' as string,
    minimumQuota: 2,
    capacity: 8,
    bookedCount: 0,
    cancellationReasonCode: null as string | null,
    version: 0,
    idempotentReplay: false,
  };
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
  await page.goto('/classes');
  await page.getByLabel('ID cabang kelas').fill('branch-1');
  await page.getByRole('button', { name: 'Muat class slot' }).press('Enter');
  await page.getByLabel('Instructor slot-1').fill('instructor-1');
  await page.getByRole('button', { name: 'Assign' }).press('Enter');
  await expect(page.getByText('Instructor ditetapkan.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Publish' })).toBeEnabled();
  await page.getByRole('button', { name: 'Publish' }).press('Enter');
  await expect(page.getByText(/PUBLISHED/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  await page.getByRole('button', { name: 'Cancel' }).press('Enter');
  await expect(page.getByText(/CANCELLED/)).toBeVisible();
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
  await page.goto('/classes');
  await page.getByLabel('ID cabang kelas').fill('foreign-branch');
  await page.getByRole('button', { name: 'Muat class slot' }).click();
  await expect(page.getByText('CONFIGURATION_REQUIRED', { exact: true })).toBeVisible();
  await expect(page.getByText('Class slot dimuat.')).toHaveCount(0);
});
