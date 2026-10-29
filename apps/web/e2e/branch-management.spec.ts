import { expect, test } from '@playwright/test';

const session = {
  id: 'super-owner-1',
  displayName: 'Super Owner',
  roles: ['SUPER_OWNER'],
  customRoleCodes: [],
  branchIds: ['branch-1'],
  capabilities: ['branch:all', 'master:read', 'master:manage'],
  globalCapabilities: ['branch:all', 'master:read', 'master:manage'],
  identityVerificationStatus: 'NOT_REQUIRED',
  sessionExpiresAt: '2027-07-30T12:00:00.000Z',
  branches: [
    {
      id: 'branch-1',
      code: 'LR-JKT',
      name: 'Little Rollers Jakarta',
      timezone: 'Asia/Jakarta',
    },
  ],
  preferredBranch: null,
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session) }),
  );
  await page.route('**/api/v1/me/notifications**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], page: { hasMore: false, nextCursor: null } }),
    }),
  );
  await page.route('**/api/v1/branches**', (route) => {
    if (route.request().url().endsWith('/branches/branch-1')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'branch-1',
          code: 'LR-JKT',
          name: 'Little Rollers Jakarta',
          timezone: 'Asia/Jakarta',
          supportWhatsappE164: '+628111111111',
          active: true,
          version: 2,
          publicProfile: {
            slug: 'jakarta',
            area: 'Jakarta Selatan',
            city: 'Jakarta',
            address: 'Alamat studio',
          },
          dependencies: {
            assignments: 2,
            futureClasses: 3,
            packages: 4,
            paymentAccounts: 1,
            classTypes: 3,
            staff: 5,
          },
          auditActivity: [],
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'branch-1',
            code: 'LR-JKT',
            name: 'Little Rollers Jakarta',
            timezone: 'Asia/Jakarta',
            supportWhatsappE164: '+628111111111',
            active: true,
            version: 2,
            publicProfile: {
              slug: 'jakarta',
              area: 'Jakarta Selatan',
              city: 'Jakarta',
              address: 'Alamat studio',
            },
          },
        ],
        summary: { total: 1, active: 1, inactive: 0 },
        page: { hasMore: false, nextCursor: null },
      }),
    });
  });
});

test('branch management is discoverable and its create drawer fits a mobile viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/workspace/branches');

  await expect(page.getByRole('heading', { name: 'Branch Management' })).toBeVisible();
  await expect(
    page.locator('div.md\\:hidden').getByText('Little Rollers Jakarta', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Buat cabang' }).click();

  const drawer = page.getByRole('dialog', { name: 'Buat cabang' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Simpan cabang' })).toBeVisible();
  const box = await drawer.boundingBox();
  expect(box?.y).toBe(0);
  expect(box?.height).toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('branch detail exposes dependencies and versioned edit workflow', async ({ page }) => {
  await page.goto('/workspace/branches/branch-1');

  await expect(page.getByRole('heading', { name: 'Little Rollers Jakarta' })).toBeVisible();
  const dependencies = page.getByRole('heading', { name: 'Dependency operasional' }).locator('..');
  await expect(dependencies.getByText('Paket aktif', { exact: true })).toBeVisible();
  await expect(dependencies.getByText('4', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit cabang' }).click();
  const drawer = page.getByRole('dialog', { name: 'Edit cabang' });
  await expect(drawer.getByLabel('Kode cabang')).toBeDisabled();
  await expect(drawer.getByRole('button', { name: 'Simpan perubahan' })).toBeVisible();
});
