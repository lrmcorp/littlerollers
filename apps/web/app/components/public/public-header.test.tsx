import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { PublicHeader } from './public-header';

describe('PublicHeader', () => {
  it('opens an accessible mobile drawer, traps focus, and closes with Escape', async () => {
    const user = userEvent.setup();
    const view = render(<PublicHeader current="/packages" />);
    const trigger = screen.getByRole('button', { name: 'Buka menu navigasi' });

    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Menu navigasi' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByRole('link', { name: 'Paket' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Menu navigasi' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
    expect((await axe(view.container)).violations).toHaveLength(0);
  });
});
