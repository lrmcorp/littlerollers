import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import {
  AsyncSearchSelect,
  AsyncMultiSearchSelect,
  DateInput,
  MultiSearchSelect,
  RadioCard,
  SearchSelect,
  SelectInput,
  Textarea,
  TextInput,
} from './forms';

describe('Tailwind form primitives', () => {
  it('shares accessible label, invalid, disabled, and responsive control states', async () => {
    const view = render(
      <form>
        <TextInput label="Nama" description="Nama customer" error="Nama wajib diisi" />
        <SelectInput label="Status" defaultValue="PENDING">
          <option value="PENDING">Menunggu</option>
        </SelectInput>
        <DateInput label="Tanggal" disabled />
        <Textarea label="Catatan" />
        <RadioCard name="scope" value="global" label="Semua cabang" description="Scope global" />
      </form>,
    );
    expect(screen.getByLabelText('Nama')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Tanggal')).toBeDisabled();
    await userEvent.click(screen.getByLabelText('Semua cabang'));
    expect(screen.getByLabelText('Semua cabang')).toBeChecked();
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('searches dynamic options and supports keyboard selection and clear', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SearchSelect
        label="Cabang"
        name="branchId"
        options={[
          { id: 'jkt', label: 'Little Rollers Jakarta', description: 'Jakarta · WIB' },
          { id: 'bsd', label: 'Little Rollers BSD', description: 'BSD · WIB' },
        ]}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('combobox', { name: 'Cabang' });
    await user.click(input);
    await user.type(input, 'bsd');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('bsd', expect.objectContaining({ id: 'bsd' }));
    expect(screen.getByDisplayValue('bsd')).toHaveAttribute('type', 'hidden');
    await user.click(screen.getByRole('button', { name: 'Clear Cabang' }));
    expect(onChange).toHaveBeenLastCalledWith('', undefined);
  });

  it('loads async options and supports multi-value selections', async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn().mockResolvedValue({
      items: [{ id: 'customer-1', label: 'Ayu Customer' }],
    });
    const { rerender } = render(
      <AsyncSearchSelect label="Pelanggan" loadOptions={loadOptions} onChange={vi.fn()} />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Pelanggan' }));
    await waitFor(() => expect(loadOptions).toHaveBeenCalled());
    expect(await screen.findByRole('option', { name: 'Ayu Customer' })).toBeVisible();

    const onMultiChange = vi.fn();
    rerender(
      <MultiSearchSelect
        label="Paket"
        value={[]}
        options={[
          { id: 'reformer', label: 'Reformer 10' },
          { id: 'mat', label: 'Mat 8' },
        ]}
        onChange={onMultiChange}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Paket' }));
    await user.click(screen.getByRole('option', { name: 'Reformer 10' }));
    expect(onMultiChange).toHaveBeenCalledWith(
      ['reformer'],
      [expect.objectContaining({ id: 'reformer' })],
    );
  });

  it('loads additional async multi-select options beyond the first twenty records', async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn((_query: string, cursor?: string) =>
      Promise.resolve(
        cursor
          ? {
              items: Array.from({ length: 5 }, (_, index) => ({
                id: `package-${index + 21}`,
                label: `Paket ${index + 21}`,
              })),
            }
          : {
              items: Array.from({ length: 20 }, (_, index) => ({
                id: `package-${index + 1}`,
                label: `Paket ${index + 1}`,
              })),
              nextCursor: 'package-20',
            },
      ),
    );
    const onChange = vi.fn();
    render(
      <AsyncMultiSearchSelect
        label="Scope paket"
        value={[]}
        loadOptions={loadOptions}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Scope paket' }));
    expect(await screen.findByRole('option', { name: 'Paket 1' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Load more' }));
    await user.click(await screen.findByRole('option', { name: 'Paket 25' }));
    expect(onChange).toHaveBeenCalledWith(
      ['package-25'],
      [expect.objectContaining({ id: 'package-25' })],
    );
  });
});
