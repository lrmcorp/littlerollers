import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorView from './error';

describe('global error recovery', () => {
  it('uses the primary action and invokes reset once', async () => {
    const reset = vi.fn();
    render(<ErrorView reset={reset} />);

    const retry = screen.getByRole('button', { name: 'Coba lagi' });
    expect(retry).toHaveClass('min-h-11', 'bg-dd-forest', 'text-white');
    await userEvent.click(retry);
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
