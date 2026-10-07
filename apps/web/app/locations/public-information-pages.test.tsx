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
          id: 'branch-green-garden',
          code: 'DD-GG',
          name: 'Daily Dose Green Garden',
          timezone: 'Asia/Jakarta',
          supportWhatsappE164: '+6281212327038',
          publicProfile: {
            slug: 'green-garden',
            area: 'Jakarta Barat',
            city: 'Jakarta',
            address: 'Rukan Green Garden Blok Z2 No. 18-19, Jakarta Barat',
            description: 'Studio Pilates utama di Green Garden.',
            arrivalInformation: null,
            parkingInformation: null,
            openingHours: [],
            amenities: ['Reformer', 'Tower', 'Mat'],
            heroImageKey: 'branches/green-garden.png',
            galleryImageKeys: [],
          },
        },
        {
          id: 'branch-surabaya',
          code: 'DD-SBY',
          name: 'Daily Dose Graha Family Surabaya',
          timezone: 'Asia/Jakarta',
          supportWhatsappE164: '+62895340133103',
          publicProfile: {
            slug: 'graha-family-surabaya',
            area: 'Graha Family',
            city: 'Surabaya',
            address: 'Komplek Ruko Plaza Graha Family Blok C-23, Surabaya',
            description: 'Studio Pilates Graha Family Surabaya.',
            arrivalInformation: null,
            parkingInformation: null,
            openingHours: [],
            amenities: ['Reformer', 'Megaformer'],
            heroImageKey: 'branches/graha-family-surabaya.png',
            galleryImageKeys: [],
          },
        },
      ],
      classes: [],
      fallbackWhatsappE164: null,
    });
    const view = render(<LocationsPage />);
    expect(await screen.findByRole('heading', { name: 'Daily Dose Green Garden' })).toBeVisible();
    expect(
      await screen.findByRole('heading', { name: 'Daily Dose Graha Family Surabaya' }),
    ).toBeVisible();
    expect(screen.getByText(/Alamat lengkap, jam operasional/)).toBeVisible();
    expect(screen.getAllByRole('link', { name: /Lihat Jadwal/ }).length).toBeGreaterThanOrEqual(3);
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);

  it('routes support through the official contact channel without collecting PII', async () => {
    const view = render(<ContactPage />);
    expect(screen.getByRole('heading', { name: 'Ada yang ingin Anda tanyakan?' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Chat WhatsApp CS/ })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/'),
    );
    expect(screen.getByRole('link', { name: /Lihat kontak per studio/ })).toHaveAttribute(
      'href',
      '/locations',
    );
    expect(screen.getByText(/tidak meminta atau menyimpan data pribadi/)).toBeVisible();
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);
});
