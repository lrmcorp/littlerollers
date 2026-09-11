import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountClient } from '@/api-clients/account-client';
import ContactPage from '@/contact/page';
import LocationsPage from '@/locations/page';

describe('public information pages', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders approved studio labels without inventing operational details', async () => {
    vi.spyOn(accountClient, 'siteConfig').mockResolvedValue({
      branches: [
        {
          id: 'branch-jakarta',
          code: 'DD-JKT',
          name: 'Daily Dose Jakarta',
          timezone: 'Asia/Jakarta',
          supportWhatsappE164: null,
          publicProfile: {
            slug: 'jakarta',
            area: 'Jakarta',
            city: 'Jakarta',
            address: 'Jakarta',
            description: 'Studio aktif Jakarta.',
            arrivalInformation: null,
            parkingInformation: null,
            openingHours: [],
            amenities: ['Reformer'],
            heroImageKey: 'studios/studio-reception.png',
            galleryImageKeys: [],
          },
        },
        {
          id: 'branch-bsd',
          code: 'DD-BSD',
          name: 'Daily Dose BSD',
          timezone: 'Asia/Jakarta',
          supportWhatsappE164: null,
          publicProfile: {
            slug: 'bsd',
            area: 'BSD',
            city: 'Tangerang Selatan',
            address: 'BSD',
            description: 'Studio aktif BSD.',
            arrivalInformation: null,
            parkingInformation: null,
            openingHours: [],
            amenities: ['Reformer'],
            heroImageKey: 'studios/studio-interior-reformer.png',
            galleryImageKeys: [],
          },
        },
      ],
      classes: [],
      fallbackWhatsappE164: null,
    });
    const view = render(<LocationsPage />);
    expect(await screen.findByRole('heading', { name: 'Daily Dose Jakarta' })).toBeVisible();
    expect(await screen.findByRole('heading', { name: 'Daily Dose BSD' })).toBeVisible();
    expect(screen.queryByText(/Surabaya|PIK 2/)).not.toBeInTheDocument();
    expect(screen.getByText(/Alamat lengkap, jam operasional/)).toBeVisible();
    expect(screen.getAllByRole('link', { name: /Lihat Jadwal/ }).length).toBeGreaterThanOrEqual(3);
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);

  it('routes support through the official contact channel without collecting PII', async () => {
    const view = render(<ContactPage />);
    expect(screen.getByRole('heading', { name: 'Ada yang ingin Anda tanyakan?' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Buka kontak resmi/ })).toHaveAttribute(
      'href',
      'https://dailydosepilates.com/contact-us',
    );
    expect(screen.getByText(/tidak meminta atau menyimpan data pribadi/)).toBeVisible();
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);
});
