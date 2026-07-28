import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { DateInput, RadioCard, SelectInput, Textarea, TextInput } from './forms';

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
});
