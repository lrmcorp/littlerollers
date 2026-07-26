import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import ContactPage from './contact/page';
import LocationsPage from './locations/page';

describe('public information pages', () => {
  it('renders approved studio labels without inventing operational details', async () => {
    const view = render(<LocationsPage />);
    expect(screen.getByRole('heading', { name: 'Daily Dose Jakarta' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Daily Dose BSD' })).toBeVisible();
    expect(screen.queryByText(/Surabaya|PIK 2/)).not.toBeInTheDocument();
    expect(screen.getByText(/Alamat lengkap, jam operasional/)).toBeVisible();
    expect(screen.getAllByRole('link', { name: /Lihat Jadwal/ }).length).toBeGreaterThanOrEqual(3);
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);

  it('routes support through the official contact channel without collecting PII', async () => {
    const view = render(<ContactPage />);
    expect(screen.getByRole('heading', { name: 'Ada yang ingin Anda tanyakan?' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Buka kontak resmi ↗' })).toHaveAttribute(
      'href',
      'https://dailydosepilates.com/contact-us',
    );
    expect(screen.getByText(/tidak meminta atau menyimpan data pribadi/)).toBeVisible();
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);
});
