import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountClient } from './account-client';
import ContactPage from './contact/page';
import LocationsPage from './locations/page';

describe('public information pages', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders approved studio labels without inventing operational details', async () => {
    vi.spyOn(accountClient, 'siteConfig').mockResolvedValue({
      branches: [
        {
          id: 'branch-jakarta',
          code: 'LR-JKT',
          name: 'Little Rollers Jakarta',
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
            heroImageKey: 'studios/jakarta.svg',
            galleryImageKeys: [],
          },
        },
        {
          id: 'branch-bsd',
          code: 'LR-BSD',
          name: 'Little Rollers BSD',
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
            heroImageKey: 'studios/bsd.svg',
            galleryImageKeys: [],
          },
        },
      ],
      classes: [],
      fallbackWhatsappE164: null,
    });
    const view = render(<LocationsPage />);
    expect(await screen.findByRole('heading', { name: 'Little Rollers Jakarta' })).toBeVisible();
    expect(await screen.findByRole('heading', { name: 'Little Rollers BSD' })).toBeVisible();
    expect(screen.queryByText(/Surabaya|PIK 2/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Find your club' })).toBeVisible();
    const timetableLinks = screen.getAllByRole('link', { name: 'Timetable' });
    expect(timetableLinks.map((link) => link.getAttribute('href'))).toEqual(
      expect.arrayContaining([
        '/classes?branch=branch-jakarta#schedule',
        '/classes?branch=branch-bsd#schedule',
      ]),
    );
    expect(view.container).not.toHaveTextContent(/pilates|reformer machine|daily dose/i);
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);

  it('routes support through each club WhatsApp without collecting PII', async () => {
    vi.spyOn(accountClient, 'siteConfig').mockResolvedValue({
      branches: [
        {
          id: 'branch-jakarta',
          code: 'LR-JKT',
          name: 'Little Rollers Jakarta',
          timezone: 'Asia/Jakarta',
          supportWhatsappE164: '+628111000001',
        },
        {
          id: 'branch-bsd',
          code: 'LR-BSD',
          name: 'Little Rollers BSD',
          timezone: 'Asia/Jakarta',
          supportWhatsappE164: null,
        },
      ],
      classes: [],
      fallbackWhatsappE164: null,
    });
    const view = render(<ContactPage />);
    expect(
      screen.getByRole('heading', { name: 'Questions before your first session?' }),
    ).toBeVisible();
    const whatsapp = await screen.findByRole('link', { name: 'WhatsApp' });
    expect(whatsapp.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/628111000001\?text=/);
    expect(screen.getByText('No WhatsApp number yet')).toBeVisible();
    expect(screen.getByText(/does not collect any personal details/)).toBeVisible();
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);
});
