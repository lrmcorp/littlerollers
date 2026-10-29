import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../components/app-feedback';
import { IdentityReviewView } from './review-view';

const reviewCase = {
  id: 'customer-1',
  user: {
    id: 'customer-1',
    displayName: 'Ayu Customer',
    phoneMasked: '+628*****6789',
    status: 'ACTIVE' as const,
  },
  verificationStatus: 'PENDING' as const,
  oldestAt: '2026-07-20T02:00:00.000Z',
  documents: [
    {
      id: 'document-selfie',
      kind: 'SELFIE' as const,
      status: 'PENDING' as const,
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN' as const,
      fileName: 'selfie',
      mimeType: 'image/png',
      sizeBytes: 1024,
      rejectionReasonCode: null,
      rejectionNote: null,
      reviewedAt: null,
      deletedAt: null,
      version: 1,
    },
    {
      id: 'document-ktp',
      kind: 'KTP_FRONT' as const,
      status: 'PENDING' as const,
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN' as const,
      fileName: 'ktp-front',
      mimeType: 'image/png',
      sizeBytes: 2048,
      rejectionReasonCode: null,
      rejectionNote: null,
      reviewedAt: null,
      deletedAt: null,
      version: 1,
    },
  ],
};

function createClient() {
  return {
    reviewQueue: vi.fn().mockResolvedValue({
      items: [reviewCase],
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
    authorizeView: vi.fn().mockResolvedValue({
      url: '/api/v1/identity-verification-files/authorization/content',
      expiresAt: '2026-07-27T02:05:00.000Z',
    }),
    readPrivateFile: vi.fn().mockResolvedValue(new Blob(['private'], { type: 'image/png' })),
    decide: vi.fn().mockResolvedValue({
      ...reviewCase.documents[0],
      status: 'APPROVED',
      version: 2,
      auditReference: 'audit-1',
    }),
    delete: vi.fn().mockResolvedValue({
      id: 'document-selfie',
      status: 'DELETED',
      version: 2,
      auditReference: 'audit-delete-1',
    }),
  };
}

function renderReview(client = createClient()) {
  render(
    <AppFeedbackProvider>
      <IdentityReviewView
        client={client}
        capabilitiesOverride={[
          'identity-verification:read',
          'identity-verification:decide',
          'identity-verification:delete',
        ]}
      />
    </AppFeedbackProvider>,
  );
  return client;
}

describe('professional identity verification queue', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/identity-verifications');
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi
        .fn()
        .mockReturnValueOnce('blob:private-preview-selfie')
        .mockReturnValueOnce('blob:private-preview-ktp'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
  });

  it('groups documents by customer and searches through the server contract', async () => {
    const client = renderReview();
    expect((await screen.findAllByText('Ayu Customer')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('+628*****6789').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText('Nama, nomor telepon, atau UUID'), {
      target: { value: 'Ayu' },
    });

    await waitFor(() =>
      expect(client.reviewQueue).toHaveBeenLastCalledWith(
        expect.objectContaining({ q: 'Ayu', status: 'PENDING', limit: 20 }),
      ),
    );
    expect(window.location.search).toContain('q=Ayu');
  });

  it('opens one customer drawer and renders private selfie and KTP previews together', async () => {
    const client = renderReview();
    await screen.findAllByText('Ayu Customer');
    fireEvent.click(screen.getAllByRole('button', { name: 'Periksa' })[0]!);
    expect(await screen.findByRole('dialog', { name: 'Verifikasi · Ayu Customer' })).toBeVisible();

    const previewButtons = screen.getAllByRole('button', { name: 'Lihat dokumen' });
    fireEvent.click(previewButtons[0]!);
    fireEvent.click(previewButtons[1]!);

    expect(await screen.findByAltText('Preview privat Selfie')).toBeVisible();
    expect(await screen.findByAltText('Preview privat KTP depan')).toBeVisible();
    expect(client.authorizeView).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it('keeps the drawer open and can reissue preview after a private-file failure', async () => {
    const client = createClient();
    client.readPrivateFile
      .mockRejectedValueOnce({ response: { status: 404, data: { code: 'NOT_FOUND' } } })
      .mockResolvedValueOnce(new Blob(['private'], { type: 'image/png' }));
    renderReview(client);
    await screen.findAllByText('Ayu Customer');
    fireEvent.click(screen.getAllByRole('button', { name: 'Periksa' })[0]!);
    fireEvent.click(screen.getAllByRole('button', { name: 'Lihat dokumen' })[0]!);

    expect(await screen.findByRole('button', { name: 'Coba lagi preview' })).toBeVisible();
    expect(screen.getByRole('dialog', { name: 'Verifikasi · Ayu Customer' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Coba lagi preview' }));
    expect(await screen.findByAltText('Preview privat Selfie')).toBeVisible();
    expect(client.authorizeView).toHaveBeenCalledTimes(2);
  });
});
