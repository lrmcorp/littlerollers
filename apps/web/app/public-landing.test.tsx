import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { PublicLanding } from './public-landing';

describe('public landing page', () => {
  it('renders the full public journey without requiring a session', async () => {
    const view = render(<PublicLanding />);

    expect(
      screen.getByRole('heading', {
        name: 'Gerak yang terasa baik, untuk hidup yang lebih seimbang.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navigasi publik' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Private Class' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Semi Private Class' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Private Group' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Green Garden' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Orange Groves' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Masuk / Registrasi' }).length).toBeGreaterThan(0);
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);
});
