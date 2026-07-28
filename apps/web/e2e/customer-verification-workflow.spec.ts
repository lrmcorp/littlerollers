import { expect, test, type Page } from '@playwright/test';

const baseDocument = {
  uploadStatus: 'FINALIZED',
  scanStatus: 'CLEAN',
  fileName: 'private-image',
  mimeType: 'image/png',
  sizeBytes: 1024,
  rejectionReasonCode: null,
  rejectionNote: null,
  reviewedAt: null,
  deletedAt: null,
  version: 1,
};

async function routeCustomerSession(page: Page, approved: () => boolean) {
  const preferredBranch = {
    id: 'branch-1',
    code: 'JKT',
    name: 'Jakarta',
    timezone: 'Asia/Jakarta',
    supportWhatsappE164: '+628111111111',
  };
  await page.route(/\/api\/v1\/me\/?(?:\?.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'customer-1',
        displayName: 'Ayu Customer',
        roles: ['CUSTOMER'],
        branchIds: [],
        capabilities: ['customer:self', 'package:read', 'class-slot:read'],
        identityVerificationStatus: approved() ? 'APPROVED' : 'PENDING',
        sessionExpiresAt: '2099-07-27T02:00:00.000Z',
        branches: [],
        preferredBranch,
      }),
    }),
  );
  await page.route('**/api/v1/me/profile', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'customer-1',
        displayName: 'Ayu Customer',
        emailMasked: 'a***@example.test',
        phoneMasked: '****1111',
        preferredBranch,
        version: 1,
      }),
    }),
  );
  await page.route('**/api/v1/public/site-config', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        branches: [],
        classes: [],
        fallbackWhatsappE164: '+628111111111',
      }),
    }),
  );
  await page.route(/\/api\/v1\/me\/notifications(?:\/unread-count)?\/?(?:\?.*)?$/, (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        path.endsWith('/unread-count')
          ? { count: 0 }
          : { items: [], page: { hasMore: false, nextCursor: null } },
      ),
    });
  });
}

test('pending customer sees why replacement is not yet available', async ({ page }) => {
  await routeCustomerSession(page, () => false);
  await page.route('**/api/v1/identity-verification/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'PENDING',
        documents: [
          { ...baseDocument, id: 'selfie-1', kind: 'SELFIE', status: 'PENDING' },
          { ...baseDocument, id: 'ktp-1', kind: 'KTP_FRONT', status: 'PENDING' },
        ],
      }),
    }),
  );

  await page.goto('/account/verification');
  await expect(page.getByRole('heading', { name: 'Dokumen Anda sudah kami terima' })).toBeVisible();
  await expect(
    page.getByText('Upload ulang tersedia jika reviewer meminta perbaikan.'),
  ).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Unggah ulang dokumen' })).toHaveCount(0);
});

test('notification deep-link focuses and replaces only the rejected document', async ({ page }) => {
  await routeCustomerSession(page, () => false);
  let replaced = false;
  await page.route('**/api/v1/identity-verification/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: replaced ? 'PENDING' : 'ACTION_REQUIRED',
        documents: [
          { ...baseDocument, id: 'selfie-1', kind: 'SELFIE', status: 'PENDING' },
          {
            ...baseDocument,
            id: replaced ? 'ktp-2' : 'ktp-1',
            kind: 'KTP_FRONT',
            status: replaced ? 'PENDING' : 'REJECTED',
            rejectionReasonCode: replaced ? null : 'GLARE',
            rejectionNote: replaced ? null : 'Hindari pantulan lampu.',
            version: replaced ? 0 : 2,
          },
        ],
      }),
    }),
  );
  await page.route(
    '**/api/v1/identity-verification/me/documents/KTP_FRONT/replacements',
    (route) => {
      replaced = true;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...baseDocument,
          id: 'ktp-2',
          kind: 'KTP_FRONT',
          status: 'PENDING',
        }),
      });
    },
  );
  await page.route(
    '**/api/v1/identity-verification/me/documents/KTP_FRONT/view-authorizations',
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: '/api/v1/identity-verification-files/auth-1/content',
          expiresAt: '2027-07-27T02:05:00.000Z',
        }),
      }),
  );
  await page.route('**/api/v1/identity-verification-files/auth-1/content', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('preview') }),
  );

  await page.goto('/account/verification?document=KTP_FRONT');
  const ktpCard = page.locator('#verification-document-KTP_FRONT');
  await expect(ktpCard).toBeFocused();
  await expect(ktpCard.getByText('Pantulan cahaya menutupi dokumen')).toBeVisible();
  await ktpCard.getByRole('button', { name: 'Unggah ulang dokumen' }).click();
  await page.getByLabel('Pilih foto pengganti').setInputFiles({
    name: 'ktp-pengganti.png',
    mimeType: 'image/png',
    buffer: Buffer.from('replacement-image'),
  });
  await page.getByRole('button', { name: 'Kirim dokumen pengganti' }).click();
  await expect(page.getByText('Dokumen pengganti diterima', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Unggah ulang dokumen' })).toHaveCount(0);
});

test('approval returns the customer to a sanitized checkout continuation', async ({ page }) => {
  let approved = false;
  await routeCustomerSession(page, () => approved);
  await page.route('**/api/v1/identity-verification/me', (route) => {
    approved = true;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'APPROVED',
        documents: [
          { ...baseDocument, id: 'selfie-1', kind: 'SELFIE', status: 'APPROVED' },
          { ...baseDocument, id: 'ktp-1', kind: 'KTP_FRONT', status: 'APPROVED' },
        ],
      }),
    });
  });
  await page.route('**/api/v1/public/package-catalog/package-1', (route) =>
    route.fulfill({ status: 404, contentType: 'application/json', body: '{}' }),
  );
  const continuation = '/checkout?package=package-1&branch=branch-1';
  await page.goto(`/account/verification?returnTo=${encodeURIComponent(continuation)}`);
  await expect(page).toHaveURL(continuation);
});

test('staff is redirected from customer verification to the reviewer queue', async ({ page }) => {
  await page.route(/\/api\/v1\/me\/?(?:\?.*)?$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'owner-1',
        displayName: 'Super Owner',
        roles: ['SUPER_OWNER'],
        branchIds: [],
        capabilities: ['identity-verification:read', 'identity-verification:decide', 'branch:all'],
        identityVerificationStatus: 'NOT_REQUIRED',
        sessionExpiresAt: '2099-07-27T02:00:00.000Z',
        branches: [],
        preferredBranch: null,
      }),
    }),
  );
  await page.route('**/api/v1/identity-verifications**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [],
        summary: {
          totalCustomers: 0,
          totalDocuments: 0,
          pendingDocuments: 0,
          approvedDocuments: 0,
          rejectedDocuments: 0,
          deletionIssues: 0,
        },
        page: { hasMore: false, nextCursor: null },
        generatedAt: '2026-07-27T02:00:00.000Z',
      }),
    }),
  );

  await page.goto('/account/verification');
  await expect(page).toHaveURL(/\/identity-verifications(?:\?status=PENDING)?$/);
});
