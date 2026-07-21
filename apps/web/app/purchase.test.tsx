import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import type { PurchaseClient } from './purchase-client';
import { PurchaseView } from './purchases/purchase-view';
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
