import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { PublicHeader } from './public-header';

const navigation = vi.hoisted(() => ({ pathname: '/packages' }));
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));

describe('PublicHeader', () => {
  it('opens an accessible mobile drawer, traps focus, and closes with Escape', async () => {
    navigation.pathname = '/packages';
    const user = userEvent.setup();
    const view = render(<PublicHeader />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });

    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in',
    );
    expect(within(dialog).getByRole('link', { name: 'Join us' })).toHaveAttribute(
      'href',
      '/register',
    );
    expect(within(dialog).getByRole('link', { name: 'Packages' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('marks exactly one classes destination active for page and schedule hash', async () => {
    navigation.pathname = '/classes';
    window.history.replaceState({}, '', '/classes');
    const view = render(<PublicHeader />);
    expect(view.container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    const desktop = screen.getByRole('navigation', { name: 'Main' });
    expect(within(desktop).getByRole('link', { name: 'Classes' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(desktop).getByRole('link', { name: 'Timetable' })).not.toHaveAttribute(
      'aria-current',
    );
    window.location.hash = '#schedule';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await waitFor(() =>
      expect(within(desktop).getByRole('link', { name: 'Timetable' })).toHaveAttribute(
        'aria-current',
        'page',
      ),
    );
    expect(within(desktop).getByRole('link', { name: 'Classes' })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
