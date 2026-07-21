import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import type { PurchaseClient, PurchaseReviewClient } from './purchase-client';
import { PurchaseView } from './purchases/purchase-view';
import { PurchaseReviewView } from './purchases/purchase-review-view';
const fake = (overrides: Partial<PurchaseClient> = {}): PurchaseClient => ({
  list: vi.fn().mockResolvedValue([
    {
      id: 'package-1',
      branchId: 'branch-1',
      name: 'Ten Sessions',
      sessionCount: 10,
      durationDays: 30,
      priceRp: 2000000,
    },
  ]),
  issue: vi.fn().mockResolvedValue('proof-1'),
  finalize: vi.fn().mockResolvedValue('CLEAN'),
  submit: vi.fn().mockResolvedValue('PENDING'),
  ...overrides,
});
describe('synthetic purchase UI', () => {
  it('is accessible and completes clean proof to pending purchase', async () => {
    const client = fake();
    const view = render(<PurchaseView client={client} />);
    expect((await axe(view.container)).violations).toHaveLength(0);
    await userEvent.type(screen.getByLabelText('ID cabang'), 'branch-1');
    await userEvent.click(screen.getByRole('button', { name: 'Muat paket' }));
    await userEvent.selectOptions(screen.getByLabelText('Paket'), 'package-1');
    await userEvent.type(screen.getByLabelText('Nama file'), 'proof.png');
    await userEvent.type(screen.getByLabelText('Ukuran byte'), '1024');
    await userEvent.type(screen.getByLabelText('SHA-256'), 'a'.repeat(64));
    await userEvent.click(screen.getByRole('button', { name: 'Upload dan scan' }));
    expect(await screen.findByText(/Status scan:/)).toHaveTextContent('CLEAN');
    await userEvent.click(screen.getByRole('button', { name: 'Kirim purchase' }));
    expect(await screen.findByRole('status')).toHaveTextContent('PENDING');
  });
  it.each([
    [503, 'CONFIGURATION_REQUIRED'],
    [409, 'PAYMENT_PROOF_NOT_CLEAN_OR_DUPLICATE'],
    [404, 'RESOURCE_NOT_FOUND'],
  ])('shows safe status %s', async (status, code) => {
    render(
      <PurchaseView client={fake({ list: vi.fn().mockRejectedValue({ response: { status } }) })} />,
    );
    await userEvent.type(screen.getByLabelText('ID cabang'), 'branch-1');
    await userEvent.click(screen.getByRole('button', { name: 'Muat paket' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(code);
  });
});

const reviewFake = (overrides: Partial<PurchaseReviewClient> = {}): PurchaseReviewClient => ({
  list: vi.fn().mockResolvedValue([
    {
      id: 'purchase-1',
      branchId: 'branch-1',
      userId: 'customer-1',
      paymentProofId: 'proof-1',
      packageNameSnapshot: 'Ten Sessions',
      priceRpSnapshot: 2000000,
      sessionCountSnapshot: 10,
      status: 'PENDING',
      version: 0,
    },
  ]),
  authorizeProof: vi
    .fn()
    .mockResolvedValue({ url: '/private/opaque', expiresAt: new Date('2026-07-21T12:00:00Z') }),
  approve: vi.fn().mockResolvedValue('APPROVED'),
  reject: vi.fn().mockResolvedValue('REJECTED'),
  ...overrides,
});

describe('synthetic purchase review UI', () => {
  it('is accessible and approves a pending purchase with keyboard-visible controls', async () => {
    const client = reviewFake();
    const view = render(<PurchaseReviewView client={client} />);
    expect((await axe(view.container)).violations).toHaveLength(0);
    await userEvent.type(screen.getByLabelText('Cabang review'), 'branch-1');
    await userEvent.click(screen.getByRole('button', { name: 'Muat queue' }));
    await userEvent.click(await screen.findByRole('button', { name: /Ten Sessions/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Setujui purchase' }));
    expect(await screen.findByRole('status')).toHaveTextContent('APPROVED');
    expect(client.approve).toHaveBeenCalledWith('purchase-1', 0, expect.any(String));
  });

  it('sends only a safe rejection code and renders configuration failure', async () => {
    const client = reviewFake({ reject: vi.fn().mockResolvedValue('REJECTED') });
    render(<PurchaseReviewView client={client} />);
    await userEvent.type(screen.getByLabelText('Cabang review'), 'branch-1');
    await userEvent.click(screen.getByRole('button', { name: 'Muat queue' }));
    await userEvent.click(await screen.findByRole('button', { name: /Ten Sessions/ }));
    await userEvent.selectOptions(screen.getByLabelText('Kode penolakan'), 'AMOUNT_MISMATCH');
    await userEvent.click(screen.getByRole('button', { name: 'Tolak purchase' }));
    expect(client.reject).toHaveBeenCalledWith(
      'purchase-1',
      0,
      'AMOUNT_MISMATCH',
      expect.any(String),
    );
    const failing = reviewFake({ list: vi.fn().mockRejectedValue({ response: { status: 503 } }) });
    render(<PurchaseReviewView client={failing} />);
    const branches = screen.getAllByLabelText('Cabang review');
    await userEvent.type(branches.at(-1)!, 'branch-1');
    const queues = screen.getAllByRole('button', { name: 'Muat queue' });
    await userEvent.click(queues.at(-1)!);
    expect(await screen.findByText('CONFIGURATION_REQUIRED')).toBeInTheDocument();
  });
});
