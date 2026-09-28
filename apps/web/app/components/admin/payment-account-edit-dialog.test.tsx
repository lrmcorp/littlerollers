import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentAccountEditDialog } from './payment-account-edit-dialog';

// Plain function (not vi.fn): vitest reports the rejected promise of a failing vi.fn as unhandled.
const api = vi.hoisted(() => ({ failWith: 0, calls: [] as Array<[string, RequestInit]> }));
vi.mock('../../lib/api-client', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../lib/api-client')>();
  return {
    ...original,
    apiFetch: async (path: string, init: RequestInit) => {
      api.calls.push([path, init]);
      if (api.failWith) throw new original.ApiError('bad', api.failWith);
      return {};
    },
  };
});

const account = {
  id: 'acc-1',
  bankName: 'BCA',
  accountHolderName: 'PT Daily Dose',
  maskedAccountNumber: '•••• 1511',
};

beforeEach(() => {
  api.failWith = 0;
  api.calls = [];
});

describe('PaymentAccountEditDialog', () => {
  it('prefills the account, keeps save disabled until something changes, and never asks for the old number', async () => {
    const user = userEvent.setup();
    render(<PaymentAccountEditDialog account={account} onClose={vi.fn()} onSaved={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { name: 'Ubah rekening pembayaran' });
    expect(within(dialog).getByLabelText('Nama bank')).toHaveValue('BCA');
    expect(within(dialog).getByLabelText('Nomor rekening baru (opsional)')).toHaveValue('');
    expect(within(dialog).getByRole('button', { name: 'Simpan perubahan' })).toBeDisabled();
    await user.type(within(dialog).getByLabelText('Nama bank'), ' Syariah');
    expect(within(dialog).getByRole('button', { name: 'Simpan perubahan' })).toBeEnabled();
  });

  it('PATCHes only the fields given (no number when blank) and reports success', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const onClose = vi.fn();
    render(<PaymentAccountEditDialog account={account} onClose={onClose} onSaved={onSaved} />);
    const dialog = screen.getByRole('dialog');
    await user.clear(within(dialog).getByLabelText('Nama pemilik rekening'));
    await user.type(within(dialog).getByLabelText('Nama pemilik rekening'), 'PT Baru');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(api.calls).toHaveLength(1));
    const [path, init] = api.calls[0]!;
    expect(path).toBe('/payment-accounts/acc-1');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(String(init.body))).toEqual({ bankName: 'BCA', accountHolderName: 'PT Baru' });
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it('rejects a malformed number locally and shows a readable server failure', async () => {
    const user = userEvent.setup();
    api.failWith = 422;
    render(<PaymentAccountEditDialog account={account} onClose={vi.fn()} onSaved={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    const number = within(dialog).getByLabelText('Nomor rekening baru (opsional)');
    await user.type(number, 'abc');
    expect(within(dialog).getByRole('button', { name: 'Simpan perubahan' })).toBeDisabled();
    await user.clear(number);
    await user.type(number, '1234567');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan perubahan' }));
    expect(await within(dialog).findByText(/Nomor rekening harus 6–24 digit/)).toBeVisible();
  });
});
