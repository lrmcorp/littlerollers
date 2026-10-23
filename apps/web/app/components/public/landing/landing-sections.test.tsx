import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import type { PublicSiteConfig } from '@/api-clients/account-client';
import { LandingClasses } from './landing-classes';
import { LandingPackages } from './landing-packages';
import { LandingStudio } from './landing-studio';
import { LandingTestimonials } from './landing-testimonials';

const classes: PublicSiteConfig['classes'] = [
  {
    code: 'REFORMER',
    name: 'Reformer Pilates',
    slug: 'reformer-pilates',
    summary: 'Latihan seluruh tubuh dengan reformer.',
    description: 'Latihan terarah.',
    level: 'Semua level',
    durationMinutes: 50,
    equipment: ['Reformer'],
    benefits: ['Kekuatan'],
    heroImageKey: 'classes/reformer-pilates.png',
  },
  {
    code: 'MAT',
    name: 'Mat Pilates',
    slug: 'mat-pilates',
    summary: 'Gerak presisi di atas mat.',
    description: 'Bangun kontrol tubuh.',
    level: 'Semua level',
    durationMinutes: 50,
    equipment: ['Mat'],
    benefits: ['Kontrol'],
    heroImageKey: 'classes/mat-pilates.png',
  },
];

describe('LandingClasses', () => {
  it('renders each class as a numbered row with a descriptive detail link', async () => {
    const view = render(<LandingClasses classes={classes} />);

    const list = screen.getByRole('list');
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByRole('heading', { name: 'Reformer Pilates' })).toBeInTheDocument();
    expect(within(rows[0]!).getByText('Latihan seluruh tubuh dengan reformer.')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('Gerak presisi di atas mat.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat detail Reformer Pilates' })).toHaveAttribute(
      'href',
      '/classes/reformer-pilates',
    );
    expect(screen.getByRole('link', { name: 'Lihat detail Mat Pilates' })).toHaveAttribute(
      'href',
      '/classes/mat-pilates',
    );
    expect(screen.getByRole('link', { name: /Lihat semua kelas/ })).toHaveAttribute('href', '/classes');
    expect(screen.getByAltText('Reformer Pilates di Daily Dose Pilates')).toBeInTheDocument();
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('shows only the first six classes and links to the full list when there are more', () => {
    const many = Array.from({ length: 8 }, (_, index) => ({
      ...classes[0]!,
      code: `TYPE_${index}`,
      name: `Kelas ${index + 1}`,
      slug: `kelas-${index + 1}`,
    }));
    const { rerender } = render(<LandingClasses classes={many} />);

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
    expect(screen.queryByRole('heading', { name: 'Kelas 7' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat semua 8 kelas' })).toHaveAttribute(
      'href',
      '/classes',
    );

    rerender(<LandingClasses classes={many.slice(0, 6)} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
    expect(screen.queryByRole('link', { name: /Lihat semua \d+ kelas/ })).not.toBeInTheDocument();
  });

  it('shows a busy placeholder list while the catalog is loading', async () => {
    const view = render(<LandingClasses classes={null} />);

    expect(screen.getByLabelText('Memuat kelas')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
    expect((await axe(view.container)).violations).toHaveLength(0);
  });

  it('shows the error and empty states without a class list', () => {
    const { rerender } = render(
      <LandingClasses classes={null} error="Informasi studio belum dapat dimuat." />,
    );
    expect(screen.getByText('Informasi studio belum dapat dimuat.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    rerender(<LandingClasses classes={[]} />);
    expect(screen.getByText('Kelas aktif belum tersedia.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

describe('LandingStudio', () => {
  it('keeps the showcase test id, anchor, statistics and studio link', async () => {
    const view = render(
      <LandingStudio
        stats={[
          ['Studio', '2 lokasi'],
          ['Format', 'Personal & kelompok'],
          ['Durasi', '50 menit'],
          ['Area', 'Jakarta & BSD'],
        ]}
      />,
    );

    const showcase = view.container.querySelector('[data-testid="studio-showcase"]');
    expect(showcase).not.toBeNull();
    expect(view.container.querySelector('#about')).not.toBeNull();
    expect(within(showcase as HTMLElement).getByRole('heading', { level: 2 })).toHaveTextContent(
      /Ruang tenang yang dirancang untuk\s*bergerak/,
    );
    expect(view.container.querySelectorAll('dl > div')).toHaveLength(4);
    expect(screen.getByText('2 lokasi')).toBeInTheDocument();
    expect(screen.getByText('Jakarta & BSD')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jelajahi Studio' })).toHaveAttribute('href', '/locations');
    expect(screen.getByAltText(/Reception Daily Dose Pilates/)).toBeInTheDocument();
    expect((await axe(view.container)).violations).toHaveLength(0);
  });
});

describe('LandingTestimonials', () => {
  it('renders one featured quote, two supporting quotes and the studio philosophy', async () => {
    const view = render(<LandingTestimonials />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      /Refined Movement\.\s*Real Transformation\./,
    );
    expect(view.container.querySelectorAll('blockquote')).toHaveLength(3);
    expect(screen.getByText('Maya S.')).toBeInTheDocument();
    expect(screen.getByText('Ronald K.')).toBeInTheDocument();
    expect(screen.getByText('Clarissa W.')).toBeInTheDocument();
    expect(screen.getByText(/Consistency is not perfection/)).toBeInTheDocument();
    expect(view.container.querySelector('#testimonials')).not.toBeNull();
    expect((await axe(view.container)).violations).toHaveLength(0);
  });
});

describe('LandingPackages', () => {
  it('keeps the package journey test id with three numbered steps and both calls to action', async () => {
    const view = render(<LandingPackages />);

    const journey = view.container.querySelector('[data-testid="package-journey"]') as HTMLElement;
    expect(journey).not.toBeNull();
    expect(within(journey).getByRole('heading', { level: 2 })).toHaveTextContent(
      /Bangun rutinitas yang\s*konsisten/,
    );
    const steps = within(journey).getByRole('list');
    expect(steps.children).toHaveLength(3);
    expect(within(steps).getByText('Pilih studio')).toBeInTheDocument();
    expect(within(steps).getByText('Bandingkan paket')).toBeInTheDocument();
    expect(within(steps).getByText('Booking kelas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pilih Paket' })).toHaveAttribute('href', '/packages');
    expect(screen.getByRole('link', { name: 'Lihat Jadwal' })).toHaveAttribute(
      'href',
      '/classes#schedule',
    );
    expect((await axe(view.container)).violations).toHaveLength(0);
  });
});
