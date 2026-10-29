import { expect, test } from '@playwright/test';

test('reviewer searches a customer, compares document states and approves with confirmation', async ({
  page,
}) => {
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'reviewer-1',
        displayName: 'Super Owner Reviewer',
        roles: ['SUPER_OWNER'],
        branchIds: [],
        sessionExpiresAt: '2027-07-27T02:00:00.000Z',
        capabilities: [
          'identity-verification:read',
          'identity-verification:decide',
          'identity-verification:delete',
          'branch:all',
        ],
        branches: [],
      }),
    }),
  );
  let query = '';
  const verificationDocument = {
    id: 'document-selfie',
    kind: 'SELFIE',
    status: 'PENDING',
    uploadStatus: 'FINALIZED',
    scanStatus: 'CLEAN',
    fileName: 'selfie',
    mimeType: 'image/png',
    sizeBytes: 1024,
    rejectionReasonCode: null,
    rejectionNote: null,
    reviewedAt: null,
    deletedAt: null,
    version: 1,
  };
  await page.route('**/api/v1/identity-verifications**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === 'POST' && url.pathname.includes('/decisions/approve'))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...verificationDocument,
          status: 'APPROVED',
          version: 2,
          auditReference: 'audit-verification-1',
        }),
      });
    query = url.searchParams.get('q') ?? '';
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'customer-1',
            user: {
              id: 'customer-1',
              displayName: 'Ayu Customer',
              phoneMasked: '+628*****6789',
              status: 'ACTIVE',
            },
            verificationStatus: 'PENDING',
            oldestAt: '2026-07-20T02:00:00.000Z',
            documents: [
              verificationDocument,
              {
                ...verificationDocument,
                id: 'document-ktp',
                kind: 'KTP_FRONT',
                fileName: 'ktp-front',
              },
            ],
          },
        ],
        summary: {
          totalCustomers: 1,
          totalDocuments: 2,
          pendingDocuments: 2,
          approvedDocuments: 0,
          rejectedDocuments: 0,
          deletionIssues: 0,
        },
        page: { hasMore: false, nextCursor: null },
        generatedAt: '2026-07-27T02:00:00.000Z',
      }),
    });
  });

  await page.goto('/identity-verifications');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(page.getByLabel('Cabang aktif', { exact: true })).toHaveCount(1);
  await expect(page.getByText(/customer-1|document-selfie|document-ktp/)).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await expect(page.getByText('Ayu Customer').first()).toBeVisible();
  await page.getByPlaceholder('Nama, nomor telepon, atau UUID').fill('Ayu');
  await expect.poll(() => query).toBe('Ayu');
  await page.getByRole('button', { name: 'Periksa' }).first().click();
  await expect(page.getByRole('heading', { name: 'Selfie' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'KTP depan' })).toBeVisible();
  await page.getByRole('button', { name: 'Setujui dokumen' }).first().click();
  await page.getByRole('button', { name: 'Lanjutkan persetujuan' }).click();
  await page.getByRole('button', { name: 'Setujui', exact: true }).click();
  await expect(page.getByText('Dokumen disetujui')).toBeVisible();
  await expect(page.getByText('Referensi: audit-verification-1')).toBeVisible();
});

test('admin without review capability cannot open the reviewer queue by direct URL', async ({
  page,
}) => {
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'admin-1',
        displayName: 'Admin Jakarta',
        roles: ['ADMIN'],
        branchIds: ['branch-jkt'],
        sessionExpiresAt: '2027-07-27T02:00:00.000Z',
        capabilities: ['booking:read', 'class-slot:read'],
        branches: [
          {
            id: 'branch-jkt',
            code: 'JKT',
            name: 'Little Rollers Jakarta',
            timezone: 'Asia/Jakarta',
          },
        ],
      }),
    }),
  );

  await page.goto('/identity-verifications');

  await expect(page).toHaveURL('/workspace');
  await expect(page.getByRole('link', { name: 'Verifikasi ID' })).toHaveCount(0);
});
