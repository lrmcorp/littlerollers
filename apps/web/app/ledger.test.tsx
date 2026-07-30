import { render, screen, waitFor } from '@testing-library/react';
import { cloneElement } from 'react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import type { LedgerClient } from './ledger-client';
import { LedgerView } from './ledger/ledger-view';
import { AppFeedbackProvider } from './components/app-feedback';

const balance = {
  id: 'cp-1',
  branchId: 'branch-1',
  status: 'ACTIVE' as const,
  activationDate: new Date('2026-01-01'),
  expiryAt: new Date('2026-12-01'),
  ledgerBalance: 10,
  reserved: 2,
  available: 8,
  packageName: 'Ten sessions',
  branchName: 'Jakarta',
  customer: { id: 'customer-1', displayName: 'Nadia Customer', phoneMasked: '+628*****01' },
};
const fake = (overrides: Partial<LedgerClient> = {}): LedgerClient => ({
  list: vi.fn().mockResolvedValue({
    items: [balance],
    summary: { packageCount: 1, ledgerBalance: 10, reserved: 2, available: 8 },
    nextCursor: null,
  }),
  detail: vi.fn().mockResolvedValue({
    balance,
    entries: [{ id: 'entry-1', type: 'PURCHASE', quantity: 10, occurredAt: new Date() }],
    nextCursor: null,
  }),
  listAdjustments: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
  requestAdjustment: vi.fn(),
  decideAdjustment: vi.fn(),
  ...overrides,
});

const renderLedger = (view: React.ReactElement) =>
  render(
    <AppFeedbackProvider>
      {cloneElement(view, {
        access: { canRequest: true, canDecide: true, canReview: true },
      } as never)}
    </AppFeedbackProvider>,
  );

describe('synthetic ledger UI', () => {
  it('is accessible and shows total, reserved, available and history', async () => {
    const view = renderLedger(<LedgerView client={fake()} />);
    expect((await screen.findAllByText('Nadia Customer')).length).toBeGreaterThan(0);
    const accessibility = await axe(view.container);
    expect(
      accessibility.violations,
      accessibility.violations
        .map(({ id, nodes }) => `${id}: ${nodes[0]?.failureSummary}`)
        .join('\n'),
    ).toHaveLength(0);
    await userEvent.click(screen.getAllByRole('button', { name: /Lihat histori/ })[0]!);
    expect(await screen.findByText('Aktivasi paket')).toBeInTheDocument();
  });
  it('shows safe invariant and expired states', async () => {
    renderLedger(
      <LedgerView
        client={fake({ list: vi.fn().mockRejectedValue({ response: { status: 409 } }) })}
      />,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Data berubah');
    const expired = { ...balance, status: 'EXPIRED' as const, available: 0 };
    renderLedger(
      <LedgerView
        client={fake({
          list: vi.fn().mockResolvedValue({
            items: [expired],
            summary: { packageCount: 1, ledgerBalance: 10, reserved: 2, available: 0 },
          }),
        })}
      />,
    );
    expect((await screen.findAllByText('Berakhir')).length).toBeGreaterThan(0);
  });
  it('creates a controlled pending request without free text', async () => {
    const requestAdjustment = vi.fn().mockResolvedValue({ id: 'adj-1' });
    const view = renderLedger(<LedgerView client={fake({ requestAdjustment })} />);
    await userEvent.click(screen.getByRole('tab', { name: /Session Adjustment/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Buat permintaan penyesuaian' }));
    const lookup = screen.getByLabelText('Cari customer atau paket aktif');
    await userEvent.type(lookup, 'Nadia');
    await waitFor(() => expect(lookup).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.click(await screen.findByRole('option', { name: /Nadia/ }));
    await userEvent.type(screen.getByLabelText('Perubahan sesi'), '-2');
    await userEvent.selectOptions(screen.getByLabelText('Alasan'), 'ATTENDANCE_CORRECTION');
    await userEvent.click(screen.getByRole('button', { name: 'Tinjau dan buat permintaan' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Buat permintaan' }));
    expect(requestAdjustment).toHaveBeenCalledWith(
      expect.objectContaining({
        customerPackageId: 'cp-1',
        quantity: -2,
        reasonCode: 'ATTENDANCE_CORRECTION',
      }),
      expect.any(String),
    );
    expect(await screen.findByText(/menunggu keputusan tanpa mengubah saldo/)).toBeVisible();
    const accessibility = await axe(view.container);
    expect(
      accessibility.violations,
      accessibility.violations
        .map(({ id, nodes }) => `${id}: ${nodes[0]?.failureSummary}`)
        .join('\n'),
    ).toHaveLength(0);
  });

  it('reviews pending adjustment with explicit controlled decisions', async () => {
    const decideAdjustment = vi.fn().mockResolvedValue({});
    const listAdjustments = vi.fn().mockResolvedValue({
      items: [
        {
          id: 'adj-1',
          customerPackageId: 'cp-1',
          quantity: 2,
          reasonCode: 'PACKAGE_COMPENSATION',
          status: 'PENDING',
          version: 0,
          eligibleForApproval: true,
        },
      ],
      nextCursor: null,
    });
    renderLedger(<LedgerView client={fake({ listAdjustments, decideAdjustment })} />);
    await userEvent.click(screen.getByRole('tab', { name: /Session Adjustment/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Setujui' }));
    await userEvent.click(screen.getByRole('button', { name: 'Konfirmasi keputusan' }));
    await userEvent.click(screen.getByRole('button', { name: 'Setujui dan posting' }));
    await waitFor(() =>
      expect(decideAdjustment).toHaveBeenCalledWith(
        'adj-1',
        'approve',
        { reasonCode: 'CORRECTION_VERIFIED', expectedVersion: 0 },
        expect.any(String),
      ),
    );
  });

  it('reuses the same idempotency key after an uncertain request failure', async () => {
    const requestAdjustment = vi
      .fn()
      .mockRejectedValueOnce(new Error('network timeout'))
      .mockResolvedValueOnce({ id: 'adj-1' });
    renderLedger(<LedgerView client={fake({ requestAdjustment })} />);
    await userEvent.click(screen.getByRole('tab', { name: /Session Adjustment/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Buat permintaan penyesuaian' }));
    const lookup = screen.getByLabelText('Cari customer atau paket aktif');
    await userEvent.type(lookup, 'Nadia');
    await waitFor(() => expect(lookup).toHaveAttribute('aria-expanded', 'true'));
    await userEvent.click(await screen.findByRole('option', { name: /Nadia/ }));
    await userEvent.type(screen.getByLabelText('Perubahan sesi'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Tinjau dan buat permintaan' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Buat permintaan' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Layanan belum dapat dijangkau');
    await userEvent.click(screen.getByRole('button', { name: 'Tinjau dan buat permintaan' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Buat permintaan' }));
    await waitFor(() => expect(requestAdjustment).toHaveBeenCalledTimes(2));
    expect(requestAdjustment.mock.calls[0]?.[1]).toBe(requestAdjustment.mock.calls[1]?.[1]);
  });
});
