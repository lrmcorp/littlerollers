import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import type { LedgerClient } from './ledger-client';
import { LedgerView } from './ledger/ledger-view';

const balance = {
  id: 'cp-1',
  branchId: 'branch-1',
  status: 'ACTIVE' as const,
  activationDate: new Date('2026-01-01'),
  expiryAt: new Date('2026-12-01'),
  ledgerBalance: 10,
  reserved: 2,
  available: 8,
};
const fake = (overrides: Partial<LedgerClient> = {}): LedgerClient => ({
  list: vi.fn().mockResolvedValue({ items: [balance], nextCursor: null }),
  detail: vi.fn().mockResolvedValue({
    balance,
    entries: [{ id: 'entry-1', type: 'PURCHASE', quantity: 10, occurredAt: new Date() }],
    nextCursor: null,
  }),
  listAdjustments: vi.fn().mockResolvedValue([]),
  requestAdjustment: vi.fn(),
  decideAdjustment: vi.fn(),
  ...overrides,
});

describe('synthetic ledger UI', () => {
  it('is accessible and shows total, reserved, available and history', async () => {
    const view = render(<LedgerView client={fake()} />);
    expect((await axe(view.container)).violations).toHaveLength(0);
    await userEvent.type(screen.getByLabelText('Cabang ledger'), 'branch-1');
    await userEvent.click(screen.getByRole('button', { name: 'Muat saldo' }));
    await userEvent.click(
      await screen.findByRole('button', { name: /total 10.*reserved 2.*tersedia 8/ }),
    );
    expect(await screen.findByText('PURCHASE 10')).toBeInTheDocument();
  });
  it('shows safe invariant and expired states', async () => {
    render(
      <LedgerView
        client={fake({ list: vi.fn().mockRejectedValue({ response: { status: 409 } }) })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Muat saldo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('LEDGER_INVARIANT_VIOLATION');
    const expired = { ...balance, status: 'EXPIRED' as const, available: 0 };
    render(<LedgerView client={fake({ list: vi.fn().mockResolvedValue({ items: [expired] }) })} />);
    const buttons = screen.getAllByRole('button', { name: 'Muat saldo' });
    await userEvent.click(buttons.at(-1)!);
    expect(await screen.findByRole('button', { name: /EXPIRED.*tersedia 0/ })).toBeVisible();
  });
  it('creates a controlled pending request without free text', async () => {
    const requestAdjustment = vi.fn().mockResolvedValue({ id: 'adj-1' });
    const view = render(<LedgerView client={fake({ requestAdjustment })} />);
    await userEvent.type(screen.getByLabelText('Paket customer'), 'cp-1');
    await userEvent.type(screen.getByLabelText('Delta sesi'), '-2');
    await userEvent.selectOptions(
      screen.getByLabelText('Alasan terkontrol'),
      'ATTENDANCE_CORRECTION',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Buat request adjustment' }));
    expect(requestAdjustment).toHaveBeenCalledWith(
      expect.objectContaining({
        customerPackageId: 'cp-1',
        quantity: -2,
        reasonCode: 'ATTENDANCE_CORRECTION',
      }),
      expect.any(String),
    );
    expect(await screen.findByText(/PENDING dibuat tanpa mutasi saldo/)).toBeVisible();
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('reviews pending adjustment with explicit controlled decisions', async () => {
    const decideAdjustment = vi.fn().mockResolvedValue({});
    const listAdjustments = vi
      .fn()
      .mockResolvedValueOnce([
        {
          id: 'adj-1',
          customerPackageId: 'cp-1',
          quantity: 2,
          reasonCode: 'PACKAGE_COMPENSATION',
          status: 'PENDING',
          version: 0,
        },
      ])
      .mockResolvedValue([]);
    render(<LedgerView client={fake({ listAdjustments, decideAdjustment })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Muat antrean adjustment' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Setujui' }));
    expect(decideAdjustment).toHaveBeenCalledWith(
      'adj-1',
      'approve',
      { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 0 },
      expect.any(String),
    );
  });
});
