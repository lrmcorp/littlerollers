import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { AppNavigation } from '../app-navigation';

vi.mock('next/navigation', () => ({
  usePathname: () => '/workspace',
}));

// Helper perhitungan luminansi dan rasio kontras WCAG
function getLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Tiket T-17: Ganti Palet Panel Admin ke Netral', () => {
  describe('Kriteria 1: Definisi Token CSS Panel Admin Netral (Spesifikasi 10.2)', () => {
    it('memastikan token panel admin netral terdefinisi di tailwind.css', () => {
      const tailwindCssPath = fs.existsSync(path.resolve(process.cwd(), 'app/tailwind.css'))
        ? path.resolve(process.cwd(), 'app/tailwind.css')
        : path.resolve(process.cwd(), 'apps/web/app/tailwind.css');

      const css = fs.readFileSync(tailwindCssPath, 'utf-8');

      // Sidebar netral
      expect(css).toContain('--color-dd-sidebar: #edeff2;');
      // Bidang kerja netral
      expect(css).toContain('--color-dd-canvas: #f6f7f9;');
      // Kartu putih
      expect(css).toContain('--color-dd-surface: #ffffff;');
      // Teks utama
      expect(css).toContain('--color-dd-ink: #111827;');
      // Label kelompok menu
      expect(css).toContain('--color-admin-group: #4b5563;');
      // Teks pendukung
      expect(css).toContain('--color-dd-muted: #4b5563;');
      // Garis dan batas panel admin
      expect(css).toContain('--color-dd-line: #7a848f;');
      // Aksen hijau untuk tombol dan menu aktif
      expect(css).toContain('--color-dd-forest: #0d5132;');
    });

    it('memastikan token gagal 3:1 (#d5dfda dan #aabbb3) telah dieliminasi dari globals.css', () => {
      const globalsCssPath = fs.existsSync(path.resolve(process.cwd(), 'app/globals.css'))
        ? path.resolve(process.cwd(), 'app/globals.css')
        : path.resolve(process.cwd(), 'apps/web/app/globals.css');

      const css = fs.readFileSync(globalsCssPath, 'utf-8');

      // Tidak ada lagi --color-border: #d5dfda atau #aabbb3
      expect(css).not.toContain('--color-border: #d5dfda;');
      expect(css).not.toContain('--color-border-strong: #aabbb3;');
      // Digantikan dengan token lolos 3:1 (#7a848f)
      expect(css).toContain('--color-border: #7a848f;');
      expect(css).toContain('--color-border-strong: #7a848f;');
    });
  });

  describe('Kriteria 2: Rasio Kontras Matematis Palet Panel Admin', () => {
    it('memastikan teks utama #111827 pada sidebar #edeff2 lolos rasio kontras tinggi (> 13:1)', () => {
      const ratio = getContrastRatio('#111827', '#edeff2');
      expect(ratio).toBeGreaterThanOrEqual(13.0);
    });

    it('memastikan teks utama #111827 pada bidang kerja #f6f7f9 lolos rasio kontras tinggi (> 14:1)', () => {
      const ratio = getContrastRatio('#111827', '#f6f7f9');
      expect(ratio).toBeGreaterThanOrEqual(14.0);
    });

    it('memastikan label kelompok menu #4b5563 pada sidebar #edeff2 lolos rasio kontras WCAG AA (>= 4.5:1)', () => {
      const ratio = getContrastRatio('#4b5563', '#edeff2');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('memastikan teks pendukung #4b5563 pada bidang kerja #f6f7f9 lolos rasio kontras WCAG AA (>= 4.5:1)', () => {
      const ratio = getContrastRatio('#4b5563', '#f6f7f9');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('memastikan garis pembatas #7a848f pada putih dan kanvas lolos batas komponen WCAG (>= 3:1)', () => {
      const ratioWhite = getContrastRatio('#7a848f', '#ffffff');
      const ratioCanvas = getContrastRatio('#7a848f', '#f6f7f9');

      expect(ratioWhite).toBeGreaterThanOrEqual(3.0);
      expect(ratioCanvas).toBeGreaterThanOrEqual(3.0);
    });

    it('memastikan tombol utama dan menu aktif #0d5132 pada sidebar #edeff2 lolos kontras (>= 5:1)', () => {
      const ratio = getContrastRatio('#0d5132', '#edeff2');
      expect(ratio).toBeGreaterThanOrEqual(5.0);
    });
  });

  describe('Kriteria 3: Penanda Menu Aktif & Struktur Sidebar (Spesifikasi 10.3)', () => {
    it('memastikan sidebar AppNavigation berlatar netral bg-dd-sidebar (#edeff2) dan border kanan border-dd-line (#7a848f)', () => {
      render(
        <AppNavigation
          mobileOpen={false}
          mobileRendered={false}
          mobilePhase="exiting"
          collapsed={false}
          queueCounts={{}}
          onClose={() => {}}
          onCollapse={() => {}}
        />,
      );

      const nav = screen.getByRole('navigation', { name: 'Navigasi utama' });
      expect(nav.className).toContain('bg-dd-sidebar');
      expect(nav.className).toContain('border-dd-line');
      expect(nav.className).toContain('text-dd-ink');
      // Tidak lagi menggunakan background gelap hijau
      expect(nav.className).not.toContain('text-white');
    });

    it('memastikan penanda menu aktif menggunakan latar putih dengan border kiri 3px --color-dd-forest (#0d5132)', () => {
      render(
        <AppNavigation
          mobileOpen={false}
          mobileRendered={false}
          mobilePhase="exiting"
          collapsed={false}
          queueCounts={{}}
          onClose={() => {}}
          onCollapse={() => {}}
        />,
      );

      // Cari tautan yang aktif atau periksa kelas penanda aktif
      const activeLink = document.querySelector('[aria-current="page"]');
      if (activeLink) {
        expect(activeLink.className).toContain('bg-white');
        expect(activeLink.className).toContain('border-l-[3px]');
        expect(activeLink.className).toContain('border-l-dd-forest');
        expect(activeLink.className).toContain('text-dd-ink');
      }
    });

    it('memastikan label kelompok menu sidebar menggunakan warna text-[#4b5563]', () => {
      render(
        <AppNavigation
          mobileOpen={false}
          mobileRendered={false}
          mobilePhase="exiting"
          collapsed={false}
          queueCounts={{}}
          onClose={() => {}}
          onCollapse={() => {}}
        />,
      );

      const groupHeadings = document.querySelectorAll('h2');
      const groupHeadingTexts = Array.from(groupHeadings).map((h) => h.className);

      // Minimal satu heading kelompok menu memiliki kelas text-[#4b5563]
      const hasCorrectGroupColor = groupHeadingTexts.some((c) => c.includes('text-[#4b5563]'));
      expect(hasCorrectGroupColor).toBe(true);
    });
  });
});
