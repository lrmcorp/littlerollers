import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { OtherCostItem } from './finance-client';
import { financeFailureMessage } from './finance-client';
import { OtherCostEditDialog } from './other-cost-edit-dialog';

const cost: OtherCostItem = {
  id: 'cost-1',
  branchId: 'branch-1',
  branchName: 'Green Garden',
  period: '2026-09',
  incurredOn: '2026-09-15',
  category: 'SEWA',
  description: 'Sewa studio',
  amountRp: 5_000_000,
  createdByName: 'Admin',
  createdAt: '2026-09-01T00:00:00Z',
};

describe('OtherCostEditDialog', () => {
  it('prefills the cost and enables save only after a valid change', async () => {
    const user = userEvent.setup();
    render(<OtherCostEditDialog cost={cost} onSave={vi.fn()} onClose={vi.fn()} onSaved={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { name: 'Ubah biaya operasional' });
    const save = within(dialog).getByRole('button', { name: 'Simpan perubahan' });
    expect(within(dialog).getByLabelText('Nominal (Rp)')).toHaveValue(5000000);
    expect(save).toBeDisabled();
    await user.clear(within(dialog).getByLabelText('Nominal (Rp)'));
    await user.type(within(dialog).getByLabelText('Nominal (Rp)'), '0');
    expect(save).toBeDisabled();
    await user.clear(within(dialog).getByLabelText('Nominal (Rp)'));
    await user.type(within(dialog).getByLabelText('Nominal (Rp)'), '6000000');
    expect(save).toBeEnabled();
  });

  it('sends the normalized fields, then reports saved and closes', async () => {
    const user = userEvent.setup();
    const calls: Array<[string, unknown]> = [];
    const onSaved = vi.fn();
    const onClose = vi.fn();
    render(
      <OtherCostEditDialog
        cost={cost}
        onSave={async (id, input) => {
          calls.push([id, input]);
        }}
        onClose={onClose}
        onSaved={onSaved}
      />,
    );
    const dialog = screen.getByRole('dialog');
    await user.clear(within(dialog).getByLabelText('Kode kategori'));
    await user.type(within(dialog).getByLabelText('Kode kategori'), 'listrik');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(calls).toEqual([
      [
        'cost-1',
        { incurredOn: '2026-09-15', category: 'LISTRIK', description: 'Sewa studio', amountRp: 5000000 },
      ],
    ]);
    expect(onClose).toHaveBeenCalled();
  });

  it('lets the spending date be corrected', async () => {
    const user = userEvent.setup();
    const calls: Array<[string, unknown]> = [];
    render(
      <OtherCostEditDialog
        cost={cost}
        onSave={async (id, input) => {
          calls.push([id, input]);
        }}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText('Tanggal pengeluaran')).toHaveValue('2026-09-15');
    fireEvent.change(within(dialog).getByLabelText('Tanggal pengeluaran'), { target: { value: '2026-09-20' } });
    await user.click(within(dialog).getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0]![1]).toMatchObject({ incurredOn: '2026-09-20' });
  });

  it('shows the Indonesian message when saving fails', async () => {
    const user = userEvent.setup();
    render(
      <OtherCostEditDialog
        cost={cost}
        onSave={async () => {
          throw { response: { status: 400, data: { code: 'INVALID_AMOUNT' } } };
        }}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Keterangan'), ' baru');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan perubahan' }));
    expect(await within(dialog).findByText(/rupiah bulat/)).toBeVisible();
  });
});

describe('financeFailureMessage', () => {
  it('maps API codes and statuses to Indonesian', () => {
    expect(financeFailureMessage({ response: { status: 422, data: { code: 'RANGE_TOO_LARGE' } } })).toMatch(/366 hari/);
    expect(financeFailureMessage({ response: { status: 400, data: { code: 'INVALID_AMOUNT' } } })).toMatch(/rupiah bulat/);
    expect(financeFailureMessage({ response: { status: 403 } })).toMatch(/izin/);
    expect(financeFailureMessage(new Error('offline'))).toMatch(/koneksi/);
  });
});
