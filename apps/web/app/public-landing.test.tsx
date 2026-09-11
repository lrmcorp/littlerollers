import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountClient } from '@/api-clients/account-client';
import { classDurationSummary, PublicLanding, studioAreaSummary } from './public-landing';

describe('public landing page', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the full public journey without requiring a session', async () => {
    vi.spyOn(accountClient, 'siteConfig').mockResolvedValue({
      branches: [
        {
          id: 'branch-jakarta',
          code: 'DD-JKT',
          name: 'Daily Dose Jakarta',
          timezone: 'Asia/Jakarta',
          supportWhatsappE164: null,
        },
        {
          id: 'branch-bsd',
          code: 'DD-BSD',
          name: 'Daily Dose BSD',
          timezone: 'Asia/Jakarta',
          supportWhatsappE164: null,
        },
      ],
      classes: [
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
        {
          code: 'BARRE',
          name: 'Barre',
          slug: 'barre',
          summary: 'Latihan stabilitas dan daya tahan.',
          description: 'Gerak fungsional.',
          level: 'Pemula–menengah',
          durationMinutes: 50,
          equipment: ['Barre'],
          benefits: ['Stabilitas'],
          heroImageKey: 'landing/studio-showcase.png',
        },
      ],
      fallbackWhatsappE164: null,
    });
    const view = render(<PublicLanding />);

    expect(
      screen.getByRole('heading', {
        name: 'Stronger Body. Calmer Mind.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navigasi publik' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Reformer Pilates' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Mat Pilates' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Barre' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Cadillac Pilates' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Customer Demo|Synthetic/i)).not.toBeInTheDocument();
    screen.getAllByRole('link', { name: 'Jelajahi Studio' }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/locations');
    });
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/sign-in');
    expect(screen.getByRole('link', { name: 'Daftar' })).toHaveAttribute('href', '/register');
    expect(screen.getAllByRole('link', { name: 'Lihat Paket' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Pilih Paket' })).toHaveAttribute('href', '/packages');
    expect(screen.getByText('2 lokasi')).toBeInTheDocument();
    expect(screen.getAllByText('Jakarta & BSD').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('50 menit')).toBeInTheDocument();
    expect(
      screen.getByText('Harga dan paket mengikuti lokasi tempat Anda berlatih.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Gunakan paket aktif untuk memilih jadwal yang tersedia.'),
    ).toBeInTheDocument();
    expect(screen.getByAltText('Reformer Pilates di Daily Dose Pilates')).toBeInTheDocument();
    expect(screen.getByAltText('Mat Pilates di Daily Dose Pilates')).toBeInTheDocument();
    expect(screen.getByAltText('Barre di Daily Dose Pilates')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Lihat Jadwal' })).toHaveLength(3);
    screen.getAllByRole('link', { name: 'Lihat Jadwal' }).forEach((link) => {
      expect(link).toHaveAttribute('href', '/classes#schedule');
    });
    expect(view.container).not.toHaveTextContent(/trial class/i);
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);

  it('derives studio areas and class duration without hardcoded location claims', () => {
    expect(
      studioAreaSummary([
        {
          id: 'one',
          code: 'ONE',
          name: 'Daily Dose Jakarta',
          timezone: 'Asia/Jakarta',
          supportWhatsappE164: null,
        },
        {
          id: 'two',
          code: 'TWO',
          name: 'Daily Dose BSD',
          timezone: 'Asia/Jakarta',
          supportWhatsappE164: null,
        },
      ]),
    ).toBe('Jakarta & BSD');
    expect(
      classDurationSummary([
        {
          code: 'ONE',
          name: 'One',
          slug: 'one',
          summary: 'One',
          description: 'One',
          level: 'Semua level',
          durationMinutes: 45,
          equipment: [],
          benefits: [],
          heroImageKey: 'one.png',
        },
        {
          code: 'TWO',
          name: 'Two',
          slug: 'two',
          summary: 'Two',
          description: 'Two',
          level: 'Semua level',
          durationMinutes: 60,
          equipment: [],
          benefits: [],
          heroImageKey: 'two.png',
        },
      ]),
    ).toBe('45–60 menit');
  });
});
