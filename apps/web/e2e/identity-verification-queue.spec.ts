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
          'identity-verification:review',
          'identity-verification:delete',
          'branch:all',
        ],
        branches: [],
      }),
    }),
  );
  let query = '';
  const document = {
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
          ...document,
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
              document,
              { ...document, id: 'document-ktp', kind: 'KTP_FRONT', fileName: 'ktp-front' },
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
