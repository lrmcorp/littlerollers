import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { PublicLanding } from './public-landing';

describe('public landing page', () => {
  it('renders the full public journey without requiring a session', async () => {
    const view = render(<PublicLanding />);

    expect(
      screen.getByRole('heading', {
        name: 'Stronger Body. Calmer Mind.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navigasi publik' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reformer Pilates' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mat Pilates' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Barre' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Cadillac Pilates' })).not.toBeInTheDocument();
    screen.getAllByRole('link', { name: 'Jelajahi Studio' }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/locations');
    });
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/sign-in');
    expect(screen.getAllByRole('link', { name: 'Lihat Paket' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Pilih Paket' })).toHaveAttribute('href', '/packages');
    expect(screen.getAllByRole('link', { name: 'Lihat Jadwal' })).toHaveLength(3);
    screen.getAllByRole('link', { name: 'Lihat Jadwal' }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/classes#schedule');
    });
    expect(view.container).not.toHaveTextContent(/trial class/i);
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);
});
