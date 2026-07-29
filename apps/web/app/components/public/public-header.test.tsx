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
    const trigger = screen.getByRole('button', { name: 'Buka menu navigasi' });

    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Menu navigasi' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/sign-in');
    expect(within(dialog).getByRole('link', { name: 'Daftar' })).toHaveAttribute(
      'href',
      '/register',
    );
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

  it('marks exactly one classes destination active for page and schedule hash', async () => {
    navigation.pathname = '/classes';
    window.history.replaceState({}, '', '/classes');
    const view = render(<PublicHeader />);
    expect(view.container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    const desktop = screen.getByRole('navigation', { name: 'Navigasi publik' });
    expect(within(desktop).getByRole('link', { name: 'Kelas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(desktop).getByRole('link', { name: 'Jadwal' })).not.toHaveAttribute(
      'aria-current',
    );
    window.location.hash = '#schedule';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await waitFor(() =>
      expect(within(desktop).getByRole('link', { name: 'Jadwal' })).toHaveAttribute(
        'aria-current',
        'page',
      ),
    );
    expect(within(desktop).getByRole('link', { name: 'Kelas' })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
