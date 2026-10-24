import { expect, test } from '@playwright/test';

const session = {
  id: 'super-admin-1',
  displayName: 'Super Admin Daily Dose',
  roles: ['SUPER_OWNER'],
  branchIds: ['branch-1'],
  sessionExpiresAt: '2027-08-12T00:00:00.000Z',
  capabilities: [
    'branch:all',
    'customer:read',
    'customer:manage',
    'customer:credential:initialize',
    'customer:security:manage',
    'assignment:read',
    'notification:manage',
    'public-content:read',
    'public-content:manage',
  ],
  globalCapabilities: [
    'branch:all',
    'customer:read',
    'customer:manage',
    'customer:credential:initialize',
    'customer:security:manage',
    'notification:manage',
  ],
  branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session) }),
  );
  await page.route('**/api/v1/dashboard/overview**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        generatedAt: new Date().toISOString(),
        period: {},
        sections: {},
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
});

test('public sign-in hides optional Google configuration details', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByRole('heading', { name: 'Masuk ke Daily Dose' })).toBeVisible();
  await expect(page.getByText(/Google|client ID|production|configuration/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Masuk dengan email/i })).toBeVisible();
});

test('Super Admin creates and opens an integrated customer without exposing the password', async ({
  page,
}) => {
  let created = false;
  await page.route('**/api/v1/customers**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === 'POST' && url.pathname.endsWith('/customers')) {
      const body = request.postDataJSON() as Record<string, unknown>;
      expect(body.password).toBe('InitialPass123');
      created = true;
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'customer-1',
          displayName: body.displayName,
          status: 'ACTIVE',
          version: 0,
        }),
      });
    }
    if (url.pathname.endsWith('/customers/customer-1'))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'customer-1',
          displayName: 'Ayu Customer',
          email: 'ayu@example.test',
          phoneE164: '+6281234567890',
          status: 'ACTIVE',
          version: 0,
          verificationStatus: 'PENDING',
          emailVerified: false,
          mustChangePassword: true,
          activePackageCount: 0,
          purchasedSessions: 0,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          preferredBranch: null,
          profile: null,
          identities: [],
          identityDocuments: [],
          passwordCredential: {
            verifiedAt: null,
            passwordChangedAt: new Date().toISOString(),
            mustChangePassword: true,
          },
          purchases: [],
          customerPackages: [],
          customerBookings: [],
          voucherRedemptions: [],
          notifications: [],
          _count: {
            purchases: 0,
            customerBookings: 0,
            customerPackages: 0,
            voucherRedemptions: 0,
            notifications: 0,
          },
        }),
      });
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: created
          ? [
              {
                id: 'customer-1',
                displayName: 'Ayu Customer',
                email: 'ayu@example.test',
                phoneE164: '+6281234567890',
                status: 'ACTIVE',
                version: 0,
                verificationStatus: 'PENDING',
                emailVerified: false,
                mustChangePassword: true,
                activePackageCount: 0,
                purchasedSessions: 0,
                updatedAt: new Date().toISOString(),
                preferredBranch: null,
                profile: null,
                _count: { purchases: 0, customerBookings: 0 },
              },
            ]
          : [],
        summary: { total: created ? 1 : 0 },
        page: { hasMore: false, nextCursor: null },
      }),
    });
  });
  await page.goto('/customers');
  await page.getByRole('button', { name: 'Buat pelanggan aktif' }).click();
  await page.getByLabel('Nama').fill('Ayu Customer');
  await page.getByLabel('Email').fill('ayu@example.test');
  await page.getByLabel('Telepon').fill('+6281234567890');
  await page.getByLabel('Password awal').fill('InitialPass123');
  await page.getByLabel('Ulangi password').fill('InitialPass123');
  await page.getByRole('button', { name: 'Simpan pelanggan' }).click();
  await expect.poll(() => created).toBe(true);
  await page.reload();
  await expect(page.getByText('Ayu Customer')).toBeVisible();
  await expect(page.getByText('InitialPass123')).toHaveCount(0);
  await page.getByRole('link', { name: 'Lihat detail' }).click();
  await expect(page.getByText(/wajib mengganti password awal/i)).toBeVisible();
  await expect(
    page.getByText(/Saldo, pembayaran, booking, dan voucher tidak diedit/i),
  ).toBeVisible();
});

test('management consoles expose controlled lifecycle actions', async ({ page }) => {
  await page.route('**/api/v1/notification-management**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        templates: [
          {
            id: 'template-1',
            templateKey: 'BOOKING_CREATED',
            version: 1,
            status: 'DRAFT',
            channel: 'IN_APP',
            eventType: 'booking.created',
          },
        ],
        deliveries: [],
        metrics: {},
        deferredChannels: ['WHATSAPP'],
      }),
    }),
  );
  await page.goto('/notification-management');
  await expect(page.getByRole('button', { name: 'Terbitkan' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Otomasi WA' })).toBeVisible();

  await page.route('**/api/v1/public-content-management**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'content-1',
          contentKey: 'LANDING_HERO',
          version: 1,
          kind: 'LANDING_SECTION',
          branchId: null,
          status: 'DRAFT',
          payload: { title: 'Move better' },
        },
      ]),
    }),
  );
  await page.goto('/public-content-management');
  await expect(page.getByText('Preview aman')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
});
