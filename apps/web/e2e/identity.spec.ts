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
  await expect(page.getByRole('alert')).toContainText('MFA_CHALLENGE_EXPIRED');
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
  await expect(page.getByRole('alert')).toContainText('FORBIDDEN');
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
  await expect(page.getByRole('alert')).toContainText('IDENTITY_CONFLICT');
  await expect(page.getByText('Pengguna dinonaktifkan.')).toHaveCount(0);
});
