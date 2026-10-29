import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountClient, type PublicSiteConfig } from './account-client';
import { PublicLanding } from './public-landing';

const siteConfig: PublicSiteConfig = {
  branches: [
    {
      id: 'branch-jakarta',
      code: 'LR-JKT',
      name: 'Little Rollers Jakarta',
      timezone: 'Asia/Jakarta',
      supportWhatsappE164: null,
      publicProfile: {
        slug: 'jakarta',
        area: 'South Jakarta',
        city: 'Jakarta',
        address: 'Jl. Wijaya II, South Jakarta',
        description: 'Our Jakarta club room.',
        arrivalInformation: null,
        parkingInformation: null,
        openingHours: [],
        amenities: [],
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
    },
  ],
  classes: [
    {
      code: 'MOVERS',
      name: 'Movers',
      slug: 'movers',
      summary: 'Running, jumping, rolling and balancing games.',
      description: 'Small-group movement games.',
      level: 'Ages 4 to 6',
      durationMinutes: 120,
      equipment: [],
      benefits: [],
      heroImageKey: 'classes/movers.svg',
    },
    {
      code: 'PLAY',
      name: 'Tiny Rollers',
      slug: 'tiny-rollers',
      summary: 'Playful sessions where a grown-up joins in.',
      description: 'Songs, tunnels and soft play.',
      level: 'Ages 2 to 3, with a grown-up',
      durationMinutes: 60,
      equipment: [],
      benefits: [],
      heroImageKey: 'classes/tiny-rollers.svg',
    },
  ],
  fallbackWhatsappE164: null,
};

describe('public landing page', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the hero, the 1h/2h explainer and clubs, with no class cards', async () => {
    vi.spyOn(accountClient, 'siteConfig').mockResolvedValue(siteConfig);
    const view = render(<PublicLanding />);

    expect(screen.getByRole('heading', { level: 1, name: 'Kids Movement Club' })).toBeVisible();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toBeInTheDocument();
    screen
      .getAllByRole('link', { name: 'Sign in' })
      .forEach((link) => expect(link).toHaveAttribute('href', '/sign-in'));
    expect(screen.getAllByRole('link', { name: 'Join us' })[0]).toHaveAttribute(
      'href',
      '/register',
    );

    expect(await screen.findByRole('link', { name: /Little Rollers Jakarta/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'CLASSES' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Movers/ })).not.toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'One hour or two' })).toBeVisible();
    expect(screen.getByText('Joins the first hour')).toBeVisible();
    expect(screen.getByText('Stays for the whole block')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Compare packages' })).toHaveAttribute(
      'href',
      '/packages',
    );

    expect(screen.getByRole('link', { name: /Little Rollers Jakarta/ })).toHaveAttribute(
      'href',
      '/locations/jakarta',
    );
    expect(screen.getByRole('link', { name: /Little Rollers BSD/ })).toHaveAttribute(
      'href',
      '/locations',
    );
    expect(view.container).not.toHaveTextContent(/pilates|daily dose|coming soon/i);
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);

  it('shows a retry when the clubs cannot load', async () => {
    const siteConfigSpy = vi
      .spyOn(accountClient, 'siteConfig')
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(siteConfig);
    render(<PublicLanding />);

    expect(await screen.findByText('We could not load the clubs.')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('link', { name: /Little Rollers Jakarta/ })).toBeVisible();
    expect(siteConfigSpy).toHaveBeenCalledTimes(2);
  });
});
