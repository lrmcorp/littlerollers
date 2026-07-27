import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VerificationView } from './verification-view';
import { verificationClient } from '../../identity-verification-client';
import type { VerificationSummary } from '../../identity-verification-client';

vi.mock('../../identity-verification-client', async (original) => {
  const actual = await original<typeof import('../../identity-verification-client')>();
  return {
    ...actual,
    verificationClient: {
      mine: vi.fn(),
      replace: vi.fn(),
      authorizeMine: vi
        .fn()
        .mockResolvedValue({ url: '/private', expiresAt: new Date().toISOString() }),
      readPrivateFile: vi.fn().mockResolvedValue(new Blob(['image'], { type: 'image/png' })),
    },
  };
});

vi.mock('../../session-context', () => ({
  useSessionContext: () => ({ refresh: vi.fn() }),
}));

const pending: VerificationSummary = {
  status: 'PENDING' as const,
  documents: [
    {
      id: 'selfie-1',
      kind: 'SELFIE' as const,
      status: 'PENDING' as const,
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN',
      fileName: 'selfie',
      mimeType: 'image/png',
      sizeBytes: 100,
      rejectionReasonCode: null,
      rejectionNote: null,
      reviewedAt: null,
      deletedAt: null,
      version: 0,
    },
    {
      id: 'ktp-1',
      kind: 'KTP_FRONT' as const,
      status: 'PENDING' as const,
      uploadStatus: 'FINALIZED',
      scanStatus: 'CLEAN',
      fileName: 'ktp-front',
      mimeType: 'image/jpeg',
      sizeBytes: 100,
      rejectionReasonCode: null,
      rejectionNote: null,
      reviewedAt: null,
      deletedAt: null,
      version: 0,
    },
  ],
};

describe('customer verification view', () => {
  beforeEach(() => {
    vi.mocked(verificationClient.mine).mockResolvedValue(pending);
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:https://daily-dose.test/replacement'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
  });

  it('renders one customer-facing heading, progress and privacy guidance', async () => {
    const view = render(<VerificationView />);
    expect(
      await screen.findByRole('heading', { name: 'Dokumen Anda sudah kami terima', level: 1 }),
    ).toBeVisible();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText('Dokumen diterima')).toBeVisible();
    expect(screen.getByText('Privasi dokumen Anda')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Lihat jadwal' })).toHaveAttribute('href', '/classes');
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('translates rejection reasons and uploads a real replacement from a dialog', async () => {
    vi.mocked(verificationClient.mine).mockResolvedValue({
      status: 'ACTION_REQUIRED',
      documents: [
        {
          ...pending.documents[0]!,
          status: 'REJECTED',
          rejectionReasonCode: 'BLURRY',
          rejectionNote: 'Ambil foto di tempat terang.',
          version: 2,
        },
      ],
    });
    vi.mocked(verificationClient.replace).mockResolvedValue({} as never);
    const user = userEvent.setup();
    render(<VerificationView />);

    expect(await screen.findByText('Foto terlalu buram')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Unggah ulang dokumen' }));
    expect(screen.getByRole('dialog', { name: 'Foto selfie' })).toBeVisible();
    const file = new File(['replacement'], 'replacement.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Pilih foto pengganti'), file);
    const submit = screen.getByRole('button', { name: 'Kirim dokumen pengganti' });
    expect(submit).toBeEnabled();
    fireEvent.submit(submit.closest('form')!);
    await waitFor(() =>
      expect(verificationClient.replace).toHaveBeenCalledWith('SELFIE', {
        file,
        expectedVersion: 2,
      }),
    );
  });
});
