import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../components/app-feedback';
import type { IdentityVerificationReviewCase } from '@/api-clients/identity-verification-client';
import { buildFastItems, mergeFastItems } from './fast-review-queue';
import { FastReviewView } from './fast-review-view';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const doc = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  kind: 'KTP_FRONT',
  status: 'PENDING',
  uploadStatus: 'FINALIZED',
  scanStatus: 'CLEAN',
  fileName: `${id}.jpg`,
  mimeType: 'image/jpeg',
  sizeBytes: 1000,
  rejectionReasonCode: null,
  rejectionNote: null,
  reviewedAt: null,
  deletedAt: null,
  createdAt: '2026-10-20T00:00:00Z',
  version: 3,
  ...overrides,
});
const entry = (userId: string, name: string, documents: unknown[]) =>
  ({
    id: `case-${userId}`,
    user: { id: userId, displayName: name, profileName: name, phoneMasked: '+62••••1234', status: 'ACTIVE' },
    verificationStatus: 'PENDING',
    oldestAt: null,
    documents,
  }) as unknown as IdentityVerificationReviewCase;

const cases = [
  entry('u1', 'Akun Satu', [doc('d1'), doc('d2', { kind: 'SELFIE', createdAt: '2026-10-21T00:00:00Z' })]),
  entry('u2', 'Akun Dua', [doc('d3', { createdAt: '2026-10-22T00:00:00Z' })]),
];

const clientWith = (overrides: Record<string, unknown> = {}) => ({
  reviewQueue: vi.fn().mockResolvedValue({
    items: cases,
    summary: { pendingDocuments: 3 },
    page: { hasMore: false, nextCursor: null },
    generatedAt: '2026-10-27T00:00:00Z',
  }),
  authorizeView: vi.fn().mockResolvedValue({ url: '/private/file', expiresAt: '2030-01-01' }),
  readPrivateFile: vi.fn().mockResolvedValue(new Blob(['x'], { type: 'image/jpeg' })),
  decide: vi.fn().mockResolvedValue({ ...doc('d1'), status: 'APPROVED' }),
  ...overrides,
});

const renderFast = (client: ReturnType<typeof clientWith>) =>
  render(
    <AppFeedbackProvider>
      <FastReviewView
        client={client as never}
        capabilitiesOverride={['identity-verification:read', 'identity-verification:decide']}
      />
    </AppFeedbackProvider>,
  );

describe('fast review queue helpers', () => {
  it('keeps only documents that can be decided now, oldest first', () => {
    const items = buildFastItems([
      entry('u1', 'A', [doc('late', { createdAt: '2026-10-25T00:00:00Z' }), doc('done', { status: 'APPROVED' })]),
      entry('u2', 'B', [doc('old', { createdAt: '2026-10-01T00:00:00Z' }), doc('dirty', { scanStatus: 'PENDING' }), doc('unfinished', { uploadStatus: 'ISSUED' })]),
    ]);
    expect(items.map((item) => item.key)).toEqual(['old', 'late']);
  });

  it('never queues a document twice when the list is reloaded', () => {
    const items = buildFastItems(cases);
    expect(mergeFastItems(items, [items[0]!]).map((item) => item.key)).toEqual(['d2', 'd3']);
  });
});

describe('FastReviewView', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn().mockReturnValue('blob:file') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  });
  afterEach(() => vi.useRealTimers());

  /** Di jsdom gambar tidak memicu load sendiri; ini meniru gambar yang sudah tampil di layar. */
  const showImage = async (name: RegExp) => {
    fireEvent.load(await screen.findByRole('img', { name }));
  };

  const ready = async (client: ReturnType<typeof clientWith>) => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderFast(client);
    await showImage(/KTP depan Akun Satu/);
    return user;
  };

  it('shows one file per screen with the account name, the privacy note and the remaining count', async () => {
    await ready(clientWith());
    expect(screen.getByText('Akun Satu')).toBeVisible();
    expect(screen.getByText(/Nomor identitas tidak perlu dibaca atau dicatat/)).toBeVisible();
    expect(screen.getByText(/Sisa antrean: 3 berkas/)).toBeVisible();
    expect(screen.queryByRole('button', { name: /Setujui semua|massal/i })).toBeNull();
  });

  it('approves with S, moves on at once, and only sends after 10 seconds', async () => {
    const client = clientWith();
    const user = await ready(client);
    await user.keyboard('s');
    await showImage(/Selfie Akun Satu/);
    expect(client.decide).not.toHaveBeenCalled();
    expect(screen.getByText(/akan dikirim dalam 10 detik/)).toBeVisible();
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(client.decide).toHaveBeenCalledWith('d1', 'approve', { expectedVersion: 3, reasonCode: undefined, note: undefined });
  });

  it('Z brings the last decision back and sends nothing', async () => {
    const client = clientWith();
    const user = await ready(client);
    await user.keyboard('s');
    await screen.findByRole('img', { name: /Selfie Akun Satu/ });
    await user.keyboard('z');
    expect(await screen.findByRole('img', { name: /KTP depan Akun Satu/ })).toBeVisible();
    await act(() => vi.advanceTimersByTimeAsync(20_000));
    expect(client.decide).not.toHaveBeenCalled();
  });

  it('sends the earlier decision straight away when the next one is made', async () => {
    const client = clientWith();
    const user = await ready(client);
    await user.keyboard('s');
    await showImage(/Selfie Akun Satu/);
    await user.keyboard('s');
    await waitFor(() => expect(client.decide).toHaveBeenCalledWith('d1', 'approve', expect.anything()));
    expect(client.decide).toHaveBeenCalledTimes(1);
  });

  it('U then a number asks for a new photo with that reason', async () => {
    const client = clientWith();
    const user = await ready(client);
    await user.keyboard('u');
    expect(await screen.findByRole('group', { name: 'Alasan minta foto ulang' })).toBeVisible();
    await user.keyboard('2');
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(client.decide).toHaveBeenCalledWith('d1', 'reject', { expectedVersion: 3, reasonCode: 'GLARE', note: undefined });
  });

  it('T with "other" needs a written reason before anything is sent', async () => {
    const client = clientWith();
    const user = await ready(client);
    await user.keyboard('t');
    await user.keyboard('3');
    const send = await screen.findByRole('button', { name: 'Kirim alasan' });
    expect(send).toBeDisabled();
    await user.type(screen.getByLabelText('Jelaskan alasannya'), 'Nama tidak cocok');
    await user.click(send);
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(client.decide).toHaveBeenCalledWith('d1', 'reject', {
      expectedVersion: 3,
      reasonCode: 'OTHER_REQUIRES_NOTE',
      note: 'Nama tidak cocok',
    });
  });

  it('L skips into "perlu dilihat ulang" and the file comes back when the rest is done', async () => {
    const client = clientWith({
      reviewQueue: vi.fn().mockResolvedValue({
        items: [cases[1]],
        summary: { pendingDocuments: 1 },
        page: { hasMore: false, nextCursor: null },
        generatedAt: '2026-10-27T00:00:00Z',
      }),
    });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderFast(client);
    await showImage(/KTP depan Akun Dua/);
    await user.keyboard('l');
    expect(await screen.findByText(/Berkas utama selesai/)).toBeVisible();
    expect(screen.getByText(/1 perlu dilihat ulang/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Periksa ulang berkas yang dilewati' }));
    expect(await screen.findByRole('img', { name: /KTP depan Akun Dua/ })).toBeVisible();
    expect(client.decide).not.toHaveBeenCalled();
  });

  it('puts the file back and warns when sending fails', async () => {
    const client = clientWith({ decide: vi.fn().mockRejectedValue(new Error('gagal')) });
    const user = await ready(client);
    await user.keyboard('s');
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(await screen.findByRole('img', { name: /KTP depan Akun Satu/ })).toBeVisible();
  });

  it('ignores shortcuts while typing and does not approve before the file is on screen', async () => {
    const client = clientWith({ readPrivateFile: vi.fn().mockReturnValue(new Promise(() => undefined)) });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderFast(client);
    await screen.findByText('Akun Satu');
    await user.keyboard('s');
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(client.decide).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Setujui (S)' })).toBeDisabled();
  });

  it('does not allow approving a file whose image failed to show, and says why', async () => {
    const client = clientWith();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderFast(client);
    fireEvent.error(await screen.findByRole('img', { name: /KTP depan Akun Satu/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/tidak dapat ditampilkan/);
    expect(screen.getByRole('button', { name: 'Setujui (S)' })).toBeDisabled();
    await user.keyboard('s');
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(client.decide).not.toHaveBeenCalled();
  });
});
