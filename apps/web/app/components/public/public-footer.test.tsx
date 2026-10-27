import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { PublicFooter } from './public-footer';

describe('PublicFooter', () => {
  it('varian default tetap menampilkan strip CTA dan tautan utama', async () => {
    const view = render(<PublicFooter />);
    expect(screen.getByRole('link', { name: 'Lokasi Studio' })).toHaveAttribute(
      'href',
      '/locations',
    );
    expect(screen.queryByRole('link', { name: /Layar Kiosk Studio/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Dapatkan kabar terbaru/)).toBeInTheDocument();
    expect(view.container.querySelector('footer')).not.toHaveClass('ed-scope');
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('varian editorial menampilkan tautan studio, bantuan, legal, WhatsApp, dan sosial', async () => {
    const view = render(<PublicFooter variant="editorial" />);
    expect(view.container.querySelector('footer')).toHaveClass('ed-scope');

    const studio = screen.getByRole('navigation', { name: 'Studio' });
    expect(within(studio).getByRole('link', { name: 'Lokasi Studio' })).toHaveAttribute(
      'href',
      '/locations',
    );
    expect(within(studio).getByRole('link', { name: 'Paket & Harga' })).toHaveAttribute(
      'href',
      '/packages',
    );
    expect(
      within(screen.getByRole('navigation', { name: 'Legal & Privasi' })).getByRole('link', {
        name: 'Kebijakan Privasi',
      }),
    ).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'Hubungi via WhatsApp' })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/'),
    );
    expect(screen.getByRole('link', { name: 'Instagram Daily Dose Pilates' })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(screen.getByRole('link', { name: 'TikTok Daily Dose Pilates' })).toBeInTheDocument();
    const contact = screen.getAllByRole('link', { name: 'Hubungi Kami' });
    expect(contact.length).toBeGreaterThanOrEqual(2);
    contact.forEach((link) => expect(link).toHaveAttribute('href', '/contact'));
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();
    expect((await axe(view.container)).violations).toHaveLength(0);
  });
});
