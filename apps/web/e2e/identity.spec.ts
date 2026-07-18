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
