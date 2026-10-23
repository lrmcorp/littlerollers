import { render, screen, within } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { LandingIntro } from './landing-intro';

describe('LandingIntro', () => {
  it('menampilkan judul pengantar dan empat keunggulan studio dengan anchor lama', async () => {
    const view = render(<LandingIntro />);

    const section = view.container.querySelector('section');
    expect(section).toHaveAttribute('id', 'instructors');
    expect(section).toHaveClass('ed-scope');
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ruang kecil untuk bergerak berbeda.' }),
    ).toBeInTheDocument();

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(4);
    [
      'Kapasitas Kelas Eksklusif',
      'Instruktur Tersertifikasi',
      'Peralatan Pilates Modern',
      'Suasana Studio Tenang',
    ].forEach((title, index) => {
      expect(within(items[index]!).getByRole('heading', { level: 3, name: title })).toBeVisible();
    });
    expect(within(items[0]!).getByText('Maksimal 4 peserta per sesi')).toBeInTheDocument();
    expect((await axe(view.container)).violations).toHaveLength(0);
  });
});
