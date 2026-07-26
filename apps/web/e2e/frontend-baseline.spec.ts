import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'visual-user',
        displayName: 'Synthetic Operator',
        roles: ['SUPER_OWNER'],
        branchIds: ['branch-1'],
        sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        capabilities: [
          'user:read',
          'user:admin',
          'audit:read',
          'assignment:read',
          'master:read',
          'package:read',
          'purchase:review',
          'ledger:read',
          'class-slot:read',
          'operations:read',
          'booking:read',
        ],
        branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
      }),
    }),
  );
});

const breakpoints = [
  { name: 'desktop-1280', width: 1280, height: 900 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'mobile-360', width: 360, height: 800 },
];

test('super owner manages users while permissions remain read-only', async ({ page }) => {
  let status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
  let version = 1;
  let role = 'ADMIN';
  const user = () => ({
    id: 'user-1',
    displayName: 'Admin Green Garden',
    status,
    version,
    createdAt: '2026-07-23T00:00:00.000Z',
    updatedAt: '2026-07-23T00:00:00.000Z',
    roles: [
      {
        role,
        branchId: 'branch-1',
        branch: { id: 'branch-1', code: 'JKT', name: 'Jakarta' },
        source: 'DIRECT',
      },
    ],
  });
  await page.route('**/api/v1/users**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path.endsWith('/role-catalog'))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              role: 'ADMIN',
              capabilities: ['user:read'],
              assignable: true,
              readOnly: false,
              scope: 'BRANCH',
            },
            {
              role: 'MANAGER',
              capabilities: ['user:read', 'purchase:review'],
              assignable: true,
              readOnly: false,
              scope: 'BRANCH',
            },
            {
              role: 'SUPER_OWNER',
              capabilities: ['user:read', 'user:admin', 'audit:read'],
              assignable: false,
              readOnly: true,
              scope: 'GLOBAL',
            },
          ],
        }),
      });
    if (path.endsWith('/audit'))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'audit-1',
              occurredAt: '2026-07-23T01:00:00.000Z',
              action: 'security.user_invited',
              actorId: 'visual-user',
              correlationId: 'corr-user-1',
            },
          ],
          page: { nextCursor: null, hasMore: false },
        }),
      });
    if (path.endsWith('/roles') && request.method() === 'POST') {
      role = 'MANAGER';
      version += 1;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(user()),
      });
    }
    if (path.endsWith('/deactivate')) {
      status = 'INACTIVE';
      version += 1;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'user-1', status, version }),
      });
    }
    if (path.endsWith('/reactivate')) {
      status = 'ACTIVE';
      version += 1;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'user-1', status, version }),
      });
    }
    if (path.endsWith('/user-1'))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(user()),
      });
    if (request.method() === 'POST')
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'invite-1', status: 'PENDING' }),
      });
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [user()],
        page: { nextCursor: null, hasMore: false },
      }),
    });
  });

  await page.goto('/users');
  await expect(page.getByText('Admin Green Garden')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Matrix permission role' })).toBeVisible();
  await page.getByRole('button', { name: 'Lihat detail' }).click();
  await expect(page.getByText('security.user_invited')).toBeVisible();
  await page.getByRole('button', { name: 'Ubah role dan scope' }).click();
  await page.getByLabel('Role baru').selectOption('MANAGER');
  await page.getByLabel('Alasan perubahan').fill('promosi operasional');
  await page.getByRole('button', { name: 'Simpan role dan cabut sesi' }).click();
  await expect(page.getByText(/Role dan scope berhasil diperbarui/)).toBeVisible();
  await page.getByLabel('Alasan deaktivasi').fill('akses sementara dihentikan');
  await page.getByRole('button', { name: 'Konfirmasi nonaktifkan' }).click();
  await expect(page.getByText(/Pengguna dinonaktifkan dan seluruh sesi dicabut/)).toBeVisible();
});

test('admin sees only a read-only scoped user workspace', async ({ page }) => {
  await page.unroute('**/api/v1/me');
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'admin-user',
        displayName: 'Scoped Admin',
        roles: ['ADMIN'],
        branchIds: ['branch-1'],
        sessionExpiresAt: new Date(Date.now() + 60_000).toISOString(),
        capabilities: ['user:read'],
        branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
      }),
    }),
  );
  await page.route('**/api/v1/users**', (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/role-catalog'))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              role: 'ADMIN',
              capabilities: ['user:read'],
              assignable: true,
              readOnly: false,
              scope: 'BRANCH',
            },
          ],
        }),
      });
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'branch-user',
            displayName: 'Branch User',
            status: 'ACTIVE',
            version: 0,
            createdAt: '2026-07-23T00:00:00.000Z',
            updatedAt: '2026-07-23T00:00:00.000Z',
            roles: [
              {
                role: 'ADMIN',
                branchId: 'branch-1',
                branch: { id: 'branch-1', code: 'JKT', name: 'Jakarta' },
                source: 'DIRECT',
              },
            ],
          },
        ],
        page: { nextCursor: null, hasMore: false },
      }),
    });
  });

  await page.goto('/users');
  await expect(page.getByText('Branch User')).toBeVisible();
  await expect(page.getByText('READ ONLY')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Undang pengguna' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Ubah role dan scope' })).toHaveCount(0);
});

test('public catalog requires a studio then shows authoritative availability', async ({ page }) => {
  await page.route('**/api/v1/public/class-catalog**', (route) => {
    const selected = new URL(route.request().url()).searchParams.has('branchId');
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        branches: [{ id: 'branch-1', code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' }],
        items: selected
          ? [
              {
                id: 'slot-1',
                branchId: 'branch-1',
                classType: { id: 'type-1', code: 'PRIVATE', name: 'Private Class' },
                startAt: '2026-07-25T03:00:00.000Z',
                endAt: '2026-07-25T03:50:00.000Z',
                timezone: 'Asia/Jakarta',
                status: 'PUBLISHED',
                capacity: 4,
                available: 2,
              },
            ]
          : [],
        range: { from: '2026-07-23T00:00:00.000Z', until: '2026-08-06T00:00:00.000Z' },
      }),
    });
  });
  await page.goto('/classes');
  await expect(page.getByText('Pilih studio untuk melihat kelas')).toBeVisible();
  await page.getByLabel('Studio', { exact: true }).selectOption('branch-1');
  await expect(page.getByRole('heading', { name: 'Private Class', exact: true })).toBeVisible();
  await expect(page.getByText('2 tempat')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pilih kelas' })).toHaveAttribute(
    'href',
    '/sign-in?returnTo=%2Fclasses%3Fslot%3Dslot-1',
  );
});

test('public package catalog requires a studio and uses authoritative commercial data', async ({
  page,
}) => {
  await page.route('**/api/v1/public/package-catalog**', (route) => {
    const selected = new URL(route.request().url()).searchParams.has('branchId');
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        branches: [{ id: 'branch-1', code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' }],
        items: selected
          ? [
              {
                id: 'package-1',
                branchId: 'branch-1',
                name: 'Pilates Starter',
                sessionCount: 4,
                durationDays: 30,
                priceRp: 1200000,
                effectiveUntil: null,
                classType: { id: 'type-1', code: 'PRIVATE', name: 'Private Class' },
              },
            ]
          : [],
      }),
    });
  });
  await page.goto('/packages');
  await expect(page.getByText('Pilih studio untuk memulai.')).toBeVisible();
  await page.getByLabel('Studio', { exact: true }).selectOption('branch-1');
  await expect(page.getByRole('heading', { name: 'Pilates Starter' })).toBeVisible();
  await expect(page.getByText(/Rp\s*1\.200\.000/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pilih paket' })).toHaveAttribute(
    'href',
    '/sign-in?returnTo=%2Fpurchases%3Fpackage%3Dpackage-1',
  );
});

test('public information routes expose approved content and official support only', async ({
  page,
}) => {
  await page.goto('/locations');
  await expect(page.getByRole('heading', { name: 'Daily Dose Jakarta' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Daily Dose BSD' })).toBeVisible();
  await expect(page.getByText(/Surabaya|PIK 2/)).toHaveCount(0);
  await expect(page.getByText(/Alamat lengkap, jam operasional/)).toBeVisible();
  await page.goto('/contact');
  await expect(page.getByRole('heading', { name: 'Ada yang ingin Anda tanyakan?' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buka kontak resmi ↗' })).toHaveAttribute(
    'href',
    'https://dailydosepilates.com/contact-us',
  );
});

for (const breakpoint of breakpoints) {
  test(`public landing ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: 'Stronger Body. Calmer Mind.',
      }),
    ).toBeVisible();
    if (breakpoint.width >= 1024) {
      await expect(page.getByRole('navigation', { name: 'Navigasi publik' })).toBeVisible();
    } else {
      await expect(page.getByRole('button', { name: 'Buka menu navigasi' })).toBeVisible();
    }
    await expect(
      page.getByRole('heading', { name: 'Reformer Pilates', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', {
        name: breakpoint.width >= 640 ? 'Masuk' : 'Masuk ke akun',
        exact: true,
      }),
    ).toHaveAttribute('href', '/sign-in');
    for (const link of await page.getByRole('link', { name: 'Jelajahi Studio' }).all()) {
      await expect(link).toHaveAttribute('href', '/locations');
    }
    const scheduleLinks = page.getByRole('link', { name: 'Lihat Jadwal' });
    expect(await scheduleLinks.count()).toBeGreaterThanOrEqual(2);
    for (const link of await scheduleLinks.all()) {
      await expect(link).toHaveAttribute('href', '/classes#schedule');
    }
    await expect(page.getByText(/trial class/i)).toHaveCount(0);
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus-visible')).toBeVisible();
    await expect(page).toHaveScreenshot(`public-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
}

for (const breakpoint of breakpoints) {
  test(`responsive application shell ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
    await page.goto('/workspace');

    await expect(
      page.getByRole('heading', { name: 'Selamat datang, Synthetic Operator' }),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navigasi utama' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Booking' }).first()).toBeAttached();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus-visible')).toBeVisible();
    await expect(page).toHaveScreenshot(`shell-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
}

test('navigation keeps current page context and keyboard access', async ({ page }) => {
  await page.goto('/bookings');
  const current = page.getByRole('link', { name: 'Booking' });
  await expect(current).toHaveAttribute('aria-current', 'page');
  await current.focus();
  await expect(current).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Booking bantuan pelanggan' })).toBeVisible();
});

test('protected route redirects to sign-in with a safe relative return target', async ({
  page,
}) => {
  await page.unroute('**/api/v1/me');
  await page.route('**/api/v1/me', (route) => route.fulfill({ status: 401, body: '{}' }));
  await page.route('**/api/v1/auth/refresh', (route) => route.fulfill({ status: 401, body: '{}' }));
  await page.goto('/ledger?cursor=next');
  await expect(page).toHaveURL('/sign-in?returnTo=%2Fledger%3Fcursor%3Dnext');
});

test('navigation hides capabilities that are not effective', async ({ page }) => {
  await page.unroute('**/api/v1/me');
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'finance-user',
        displayName: 'Finance',
        roles: ['FINANCE'],
        branchIds: ['branch-1'],
        sessionExpiresAt: new Date(Date.now() + 60_000).toISOString(),
        capabilities: ['ledger:read'],
        branches: [{ id: 'branch-1', code: 'JKT', name: 'Jakarta', timezone: 'Asia/Jakarta' }],
      }),
    }),
  );
  await page.goto('/workspace');
  await expect(page.getByRole('link', { name: 'Ledger', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pengguna', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Operations H-24' })).toHaveCount(0);
});

test('branch choice persists per tab and a revoked API response ends the session', async ({
  page,
}) => {
  await page.goto('/workspace');
  await page.getByLabel('Cabang aktif', { exact: true }).selectOption('branch-1');
  await page.reload();
  await expect(page.getByLabel('Cabang aktif', { exact: true })).toHaveValue('branch-1');
  await page.route('**/api/v1/**', (route) => route.fulfill({ status: 401, body: '{}' }));
  await page.goto('/bookings');
  await expect(page).toHaveURL('/sign-in?returnTo=%2Fbookings');
});
