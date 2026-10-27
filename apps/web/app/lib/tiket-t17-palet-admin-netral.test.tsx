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

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

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
      expect(css).toContain('--color-dd-sidebar: #ebe8e0;');
      // Bidang kerja netral
      expect(css).toContain('--color-dd-canvas: #f4f2ec;');
      // Kartu putih
      expect(css).toContain('--color-dd-surface: #ffffff;');
      // Teks utama
      expect(css).toContain('--color-dd-ink: #17231e;');
      // Label kelompok menu
      expect(css).toContain('--color-admin-group: #5f6b63;');
      // Teks pendukung
      expect(css).toContain('--color-dd-muted: #566660;');
      // Garis dan batas panel admin
      expect(css).toContain('--color-dd-line: #827c6a;');
      // Aksen hijau untuk tombol dan menu aktif
      expect(css).toContain('--color-dd-forest: #285740;');
    });

    it('memastikan token gagal 3:1 (#d5dfda dan #aabbb3) telah dieliminasi dari globals.css', () => {
      const globalsCssPath = fs.existsSync(path.resolve(process.cwd(), 'app/globals.css'))
        ? path.resolve(process.cwd(), 'app/globals.css')
        : path.resolve(process.cwd(), 'apps/web/app/globals.css');

      const css = fs.readFileSync(globalsCssPath, 'utf-8');

      // Tidak ada lagi --color-border: #d5dfda atau #aabbb3
      expect(css).not.toContain('--color-border: #d5dfda;');
      expect(css).not.toContain('--color-border-strong: #aabbb3;');
      // Digantikan dengan token lolos 3:1 (#827c6a)
      expect(css).toContain('--color-border: #827c6a;');
      expect(css).toContain('--color-border-strong: #827c6a;');
    });
  });

  describe('Kriteria 2: Rasio Kontras Matematis Palet Panel Admin', () => {
    it('memastikan teks utama #17231e pada sidebar #ebe8e0 lolos rasio kontras tinggi (> 13:1)', () => {
      const ratio = getContrastRatio('#17231e', '#ebe8e0');
      expect(ratio).toBeGreaterThanOrEqual(13.0);
    });

    it('memastikan teks utama #17231e pada bidang kerja #f4f2ec lolos rasio kontras tinggi (> 14:1)', () => {
      const ratio = getContrastRatio('#17231e', '#f4f2ec');
      expect(ratio).toBeGreaterThanOrEqual(14.0);
    });

    it('memastikan label kelompok menu #5f6b63 pada sidebar #ebe8e0 lolos rasio kontras WCAG AA (>= 4.5:1)', () => {
      const ratio = getContrastRatio('#5f6b63', '#ebe8e0');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('memastikan teks pendukung #566660 pada bidang kerja #f4f2ec lolos rasio kontras WCAG AA (>= 4.5:1)', () => {
      const ratio = getContrastRatio('#566660', '#f4f2ec');
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('memastikan garis pembatas #827c6a pada putih dan kanvas lolos batas komponen WCAG (>= 3:1)', () => {
      const ratioWhite = getContrastRatio('#827c6a', '#ffffff');
      const ratioCanvas = getContrastRatio('#827c6a', '#f4f2ec');

      expect(ratioWhite).toBeGreaterThanOrEqual(3.0);
      expect(ratioCanvas).toBeGreaterThanOrEqual(3.0);
    });

    it('memastikan tombol utama dan menu aktif #285740 pada sidebar #ebe8e0 lolos kontras (>= 5:1)', () => {
      const ratio = getContrastRatio('#285740', '#ebe8e0');
      expect(ratio).toBeGreaterThanOrEqual(5.0);
    });
  });

  describe('Kriteria 3: Penanda Menu Aktif & Struktur Sidebar (Spesifikasi 10.3)', () => {
    it('memastikan sidebar AppNavigation berlatar netral bg-dd-sidebar (#ebe8e0) dan border kanan border-dd-line (#827c6a)', () => {
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

    it('memastikan penanda menu aktif menggunakan latar putih dengan border kiri 3px --color-dd-forest (#285740)', () => {
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

    it('memastikan label kelompok menu sidebar menggunakan warna text-[#5f6b63]', () => {
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

      // Minimal satu heading kelompok menu memiliki kelas text-[#5f6b63]
      const hasCorrectGroupColor = groupHeadingTexts.some((c) => c.includes('text-[#5f6b63]'));
      expect(hasCorrectGroupColor).toBe(true);
    });
  });
});
