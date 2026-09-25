import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterBar } from './admin-ui';

describe('FilterBar', () => {
  it('is a plain container without apply/reset buttons by default', () => {
    render(
      <FilterBar>
        <input aria-label="Cari" />
      </FilterBar>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('applies on the Terapkan button and on Enter inside a field', async () => {
    const onApply = vi.fn();
    render(
      <FilterBar label="Filter contoh" onApply={onApply}>
        <input aria-label="Cari" />
      </FilterBar>,
    );
    const user = userEvent.setup();
    expect(screen.getByRole('form', { name: 'Filter contoh' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Terapkan' }));
    expect(onApply).toHaveBeenCalledTimes(1);
    await user.type(screen.getByLabelText('Cari'), 'abc{Enter}');
    expect(onApply).toHaveBeenCalledTimes(2);
  });

  it('shows Reset only when there is something to reset', async () => {
    const onReset = vi.fn();
    const { rerender } = render(
      <FilterBar onApply={() => undefined} onReset={onReset} showReset={false}>
        <input aria-label="Cari" />
      </FilterBar>,
    );
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();
    rerender(
      <FilterBar onApply={() => undefined} onReset={onReset} showReset>
        <input aria-label="Cari" />
      </FilterBar>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
