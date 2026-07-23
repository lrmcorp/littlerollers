import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import type { PurchaseClient, PurchaseReviewClient } from './purchase-client';
import { PurchaseView } from './purchases/purchase-view';
import { PurchaseReviewView } from './purchases/purchase-review-view';

const branch = { id: 'branch-1', name: 'Jakarta', timezone: 'Asia/Jakarta' };
const purchase = {
  id: 'purchase-1',
  branchId: 'branch-1',
  userId: 'customer-1',
  packageId: 'package-1',
  paymentProofId: 'proof-1',
  packageNameSnapshot: 'Ten Sessions',
  priceRpSnapshot: 2_000_000,
  sessionCountSnapshot: 10,
  durationDaysSnapshot: 30,
  status: 'PENDING' as const,
  submittedAt: new Date('2026-07-23T02:00:00Z'),
  version: 0,
};
const proof = {
  id: 'proof-1',
  uploadStatus: 'FINALIZED' as const,
  scanStatus: 'CLEAN' as const,
  fileName: 'proof.png',
  mimeType: 'image/png',
  sizeBytes: 1024,
  version: 0,
};
const submissionFake = (overrides: Partial<PurchaseClient> = {}): PurchaseClient => ({
  list: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'package-1',
        branchId: 'branch-1',
        classTypeId: 'class-1',
        businessKey: 'PKG-10',
        name: 'Ten Sessions',
        sessionCount: 10,
        durationDays: 30,
        priceRp: 2_000_000,
        status: 'ACTIVE',
        effectiveFrom: new Date('2026-01-01'),
        effectiveUntil: null,
        version: 0,
      },
    ],
    nextCursor: null,
  }),
  issue: vi.fn().mockResolvedValue({ ...proof, uploadStatus: 'ISSUED', scanStatus: 'PENDING' }),
  finalize: vi.fn().mockResolvedValue(proof),
  status: vi.fn().mockResolvedValue(proof),
  replace: vi.fn().mockResolvedValue(undefined),
  submit: vi.fn().mockResolvedValue(purchase),
  ...overrides,
});

const reviewPurchase = { ...purchase, customerName: 'Pelanggan Synthetic' };
const reviewFake = (overrides: Partial<PurchaseReviewClient> = {}): PurchaseReviewClient => ({
  list: vi.fn().mockResolvedValue({ items: [reviewPurchase], nextCursor: null }),
  authorizeProof: vi
    .fn()
    .mockResolvedValue({ url: '/private/opaque', expiresAt: new Date('2026-07-23T12:00:00Z') }),
  approve: vi.fn().mockResolvedValue({
    ...reviewPurchase,
    status: 'APPROVED',
    version: 1,
  }),
  reject: vi.fn().mockResolvedValue({
    ...reviewPurchase,
    status: 'REJECTED',
    version: 1,
  }),
  ...overrides,
});

describe('purchase submission workspace', () => {
  it('requires an explicit branch', () => {
    render(<PurchaseView client={submissionFake()} />);
    expect(screen.getByText('Cabang aktif wajib dipilih secara eksplisit.')).toBeVisible();
  });

  it('selects a package, hashes a real file and submits one stable intent accessibly', async () => {
    const client = submissionFake();
    const view = render(
      <PurchaseView
        client={client}
        branchOverride={branch}
        digestFile={vi.fn().mockResolvedValue('a'.repeat(64))}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Muat paket' }));
    await user.click(await screen.findByRole('radio', { name: /Ten Sessions/ }));
    await user.upload(
      screen.getByLabelText('Bukti pembayaran'),
      new File(['proof'], 'proof.png', { type: 'image/png' }),
    );
    await user.click(screen.getByRole('button', { name: 'Upload dan periksa' }));
    expect(await screen.findByText('Bersih')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Kirim pengajuan' }));
    expect(client.submit).toHaveBeenCalledWith('package-1', 'proof-1', expect.any(String));
    expect(await screen.findByText(/Purchase PENDING/)).toBeVisible();
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('polls pending proof and never enables submit before CLEAN', async () => {
    const client = submissionFake({
      finalize: vi.fn().mockResolvedValue({ ...proof, scanStatus: 'PENDING' }),
    });
    render(
      <PurchaseView
        client={client}
        branchOverride={branch}
        digestFile={vi.fn().mockResolvedValue('a'.repeat(64))}
      />,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Muat paket' }));
    await user.click(await screen.findByRole('radio', { name: /Ten Sessions/ }));
    await user.upload(
      screen.getByLabelText('Bukti pembayaran'),
      new File(['proof'], 'proof.png', { type: 'image/png' }),
    );
    await user.click(screen.getByRole('button', { name: 'Upload dan periksa' }));
    expect(screen.queryByRole('button', { name: 'Kirim pengajuan' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Periksa status scan' }));
    expect(await screen.findByRole('button', { name: 'Kirim pengajuan' })).toBeEnabled();
  });
});

describe('purchase internal review workspace', () => {
  it('loads queue, authorizes proof and applies authoritative approval with expected version', async () => {
    const client = reviewFake();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const view = render(<PurchaseReviewView client={client} branchOverride={branch} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Muat queue' }));
    await user.click(within(await screen.findByRole('listitem')).getByRole('button'));
    const dialog = screen.getByRole('dialog', { name: 'Detail review' });
    await user.click(within(dialog).getByRole('button', { name: 'Buka bukti privat' }));
    expect(open).toHaveBeenCalledWith('/private/opaque', '_blank', 'noopener,noreferrer');
    await user.click(within(dialog).getByRole('button', { name: 'Setujui purchase' }));
    expect(client.approve).toHaveBeenCalledWith('purchase-1', 0, expect.any(String));
    expect(await within(dialog).findByText('Disetujui')).toBeVisible();
    expect((await axe(view.container)).violations).toHaveLength(0);
    open.mockRestore();
  });

  it('rejects with only a controlled code and renders safe configuration failure', async () => {
    const client = reviewFake();
    render(<PurchaseReviewView client={client} branchOverride={branch} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Muat queue' }));
    await user.click(within(await screen.findByRole('listitem')).getByRole('button'));
    const dialog = screen.getByRole('dialog', { name: 'Detail review' });
    await user.selectOptions(within(dialog).getByLabelText('Alasan penolakan'), 'AMOUNT_MISMATCH');
    await user.click(within(dialog).getByRole('button', { name: 'Tolak purchase' }));
    expect(client.reject).toHaveBeenCalledWith(
      'purchase-1',
      0,
      'AMOUNT_MISMATCH',
      expect.any(String),
    );

    const failing = reviewFake({
      list: vi.fn().mockRejectedValue({ response: { status: 503 } }),
    });
    render(<PurchaseReviewView client={failing} branchOverride={branch} />);
    await user.click(screen.getAllByRole('button', { name: 'Muat queue' }).at(-1)!);
    expect(
      await screen.findByText('Layanan penyimpanan atau pemindaian belum dikonfigurasi.'),
    ).toBeVisible();
  });
});
