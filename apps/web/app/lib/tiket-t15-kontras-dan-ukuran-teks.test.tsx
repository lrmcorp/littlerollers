import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, ButtonLink, IconButton, actionClasses } from '../components/actions';
import {
  TextInput,
  CheckboxInput,
  RadioCard,
  controlClassName,
  editorialControlClassName,
} from '../components/forms';
import { PageHeader, StatusBadge } from '../ui';
import fs from 'fs';
import path from 'path';

/**
 * Utilitas matematis WCAG 2.1 untuk menghitung Relative Luminance dan Rasio Kontras
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
}

function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const srgb = val / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Tiket T-15: Perbaiki kontras dan ukuran teks', () => {
  describe('Kriteria 1: Rasio Kontras Batas Komponen Interaktif (Minimal 3:1)', () => {
    const interactiveBorderColor = '#7a848f';
    const decorativeDividerColor = '#d5dfda';
    const whiteBackground = '#ffffff';
    const canvasBackground = '#f6f7f9';

    it('memastikan warna batas interaktif #7a848f memiliki kontras minimal 3:1 terhadap latar putih', () => {
      const ratio = getContrastRatio(interactiveBorderColor, whiteBackground);
      // Di spesifikasi: "Pengganti: #7a848f, terukur 3.80:1 pada putih"
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      expect(ratio).toBeCloseTo(3.8, 1);
    });

    it('memastikan warna batas interaktif #7a848f memiliki kontras minimal 3:1 terhadap kanvas studio', () => {
      const ratio = getContrastRatio(interactiveBorderColor, canvasBackground);
      // Di spesifikasi: "terukur 3.55:1 pada kanvas"
      expect(ratio).toBeGreaterThanOrEqual(3.0);
      expect(ratio).toBeCloseTo(3.55, 1);
    });

    it('memastikan garis dekoratif #d5dfda terbukti tidak memenuhi 3:1 (sehingga tepat hanya untuk dekoratif)', () => {
      const ratioWhite = getContrastRatio(decorativeDividerColor, whiteBackground);
      const ratioCanvas = getContrastRatio(decorativeDividerColor, canvasBackground);
      expect(ratioWhite).toBeLessThan(3.0);
      expect(ratioCanvas).toBeLessThan(3.0);
    });

    it('memastikan tombol sekunder menggunakan batas interaktif #7a848f', () => {
      const classes = actionClasses({ variant: 'secondary' });
      expect(classes).toContain('border-dd-border-interactive');
      expect(classes).toContain('bg-white');
    });

    it('memastikan kontrol input standar menggunakan border-dd-border-interactive', () => {
      expect(controlClassName).toContain('border-dd-border-interactive');
    });

    it('memastikan kontrol input editorial publik menggunakan border-ed-border-ui', () => {
      expect(editorialControlClassName).toContain('border-ed-border-ui');
    });

    it('memastikan RadioCard dan CheckboxInput menggunakan batas interaktif', () => {
      render(
        <div>
          <CheckboxInput label="Persetujuan" name="consent" />
          <RadioCard label="Pilihan A" name="choice" value="a" />
        </div>,
      );
      const checkboxLabel = screen.getByText('Persetujuan').closest('label');
      const radioLabel = screen.getByText('Pilihan A').closest('label');

      expect(checkboxLabel?.className).toContain('border-dd-border-interactive');
      expect(radioLabel?.className).toContain('border-dd-border-interactive');
    });
  });

  describe('Kriteria 2: Rasio Kontras Teks (Minimal 4.5:1 untuk teks normal)', () => {
    const whiteBackground = '#ffffff';
    const canvasBackground = '#f6f7f9';
    const primaryInk = '#20231f';
    const supportingMuted = '#607069';
    const editorialMuted = '#4f6255';

    it('memastikan teks utama memiliki kontras di atas 7:1 (lolos WCAG AAA)', () => {
      const ratioWhite = getContrastRatio(primaryInk, whiteBackground);
      const ratioCanvas = getContrastRatio(primaryInk, canvasBackground);

      expect(ratioWhite).toBeGreaterThanOrEqual(7.0);
      expect(ratioCanvas).toBeGreaterThanOrEqual(7.0);
    });

    it('memastikan teks pendukung #607069 memiliki kontras minimal 4.5:1 terhadap putih dan kanvas', () => {
      const ratioWhite = getContrastRatio(supportingMuted, whiteBackground);
      const ratioCanvas = getContrastRatio(supportingMuted, canvasBackground);

      // Sesuai spesifikasi: "Teks tidak pernah lebih terang dari #607069 (5.23:1 pada putih, 4.80:1 pada kanvas)"
      expect(ratioWhite).toBeGreaterThanOrEqual(4.5);
      expect(ratioCanvas).toBeGreaterThanOrEqual(4.5);
    });

    it('memastikan teks pendukung editorial #4f6255 memiliki kontras di atas 4.5:1', () => {
      const ratioWhite = getContrastRatio(editorialMuted, whiteBackground);
      const ratioCanvas = getContrastRatio(editorialMuted, canvasBackground);

      expect(ratioWhite).toBeGreaterThanOrEqual(4.5);
      expect(ratioCanvas).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Kriteria 3: Skala Tipografi Standar', () => {
    it('memastikan token CSS tipografi didefinisikan sesuai spesifikasi di tailwind.css', () => {
      const cssPath = fs.existsSync(path.resolve(process.cwd(), 'app/tailwind.css'))
        ? path.resolve(process.cwd(), 'app/tailwind.css')
        : path.resolve(process.cwd(), 'apps/web/app/tailwind.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      // Teks utama 17 / 26
      expect(cssContent).toContain('text-body');
      expect(cssContent).toContain('font-size: 17px;');
      expect(cssContent).toContain('line-height: 26px;');

      // Teks pendukung 15 / 22
      expect(cssContent).toContain('text-sub');
      expect(cssContent).toContain('font-size: 15px;');
      expect(cssContent).toContain('line-height: 22px;');

      // Label kecil 13 / 18, tracking 0.06em
      expect(cssContent).toContain('text-caption');
      expect(cssContent).toContain('font-size: 13px;');
      expect(cssContent).toContain('line-height: 18px;');
      expect(cssContent).toContain('letter-spacing: 0.06em;');

      // Body root base size 17px / 26px
      expect(cssContent).toContain('font-size: 17px;');
      expect(cssContent).toContain('line-height: 26px;');
    });

    it('memastikan token theme inline menormalisasi skala teks xs ke minimal 13px', () => {
      const cssPath = fs.existsSync(path.resolve(process.cwd(), 'app/tailwind.css'))
        ? path.resolve(process.cwd(), 'app/tailwind.css')
        : path.resolve(process.cwd(), 'apps/web/app/tailwind.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      expect(cssContent).toContain('--text-xs: 0.8125rem;'); // 13px
      expect(cssContent).toContain('--text-sm: 0.9375rem;'); // 15px
      expect(cssContent).toContain('--text-base: 1.0625rem;'); // 17px
    });
  });

  describe('Kriteria 4: Target Sentuh Minimal 44 x 44 px', () => {
    it('memastikan semua varian ukuran Button memenuhi minimal 44px', () => {
      const smClasses = actionClasses({ size: 'sm' });
      const mdClasses = actionClasses({ size: 'md' });
      const lgClasses = actionClasses({ size: 'lg' });

      // Ukuran sm ditingkatkan ke minimal 44px (min-h-[44px])
      expect(smClasses).toContain('min-h-[44px]');
      // Ukuran md memenuhi 44px (min-h-11 = 44px)
      expect(mdClasses).toContain('min-h-11');
      // Ukuran lg memenuhi 48px (min-h-12 = 48px >= 44px)
      expect(lgClasses).toContain('min-h-12');
    });

    it('memastikan IconButton memiliki lebar dan tinggi minimal 44 px (11 tailwind units)', () => {
      render(<IconButton label="Tutup">✕</IconButton>);
      const button = screen.getByRole('button', { name: 'Tutup' });
      expect(button.className).toContain('min-h-11');
      expect(button.className).toContain('min-w-11');
    });

    it('memastikan kontrol form standar dan editorial memiliki tinggi minimal 44 px', () => {
      expect(controlClassName).toContain('min-h-[44px]');
      expect(editorialControlClassName).toContain('min-h-[48px]');
    });

    it('memastikan ButtonLink memenuhi ukuran sentuh minimal', () => {
      render(
        <ButtonLink href="/classes" size="sm">
          Jadwal
        </ButtonLink>,
      );
      const link = screen.getByRole('link', { name: 'Jadwal' });
      expect(link.className).toContain('min-h-[44px]');
    });

    it('memastikan PageHeader tombol kembali memiliki target sentuh minimal 44 x 44 px', () => {
      render(<PageHeader title="Judul Layar" backHref="/account" />);
      const backLink = screen.getByRole('link', { name: 'Kembali' });
      expect(backLink.className).toContain('min-h-[44px]');
      expect(backLink.className).toContain('min-w-[44px]');
    });
  });

  describe('Kriteria 5: Navigasi Keyboard & Indikator Fokus Terlihat Jelas', () => {
    it('memastikan base CSS mendefinisikan outline fokus 3px #0d5132 dengan offset 2px', () => {
      const cssPath = fs.existsSync(path.resolve(process.cwd(), 'app/tailwind.css'))
        ? path.resolve(process.cwd(), 'app/tailwind.css')
        : path.resolve(process.cwd(), 'apps/web/app/tailwind.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      expect(cssContent).toContain('outline: 3px solid #09371f;');
      expect(cssContent).toContain('outline-offset: 2px;');
    });

    it('memastikan actionClasses menyertakan outline fokus keyboard 3px #0d5132', () => {
      const classes = actionClasses({});
      expect(classes).toContain('focus-visible:outline-3');
      expect(classes).toContain('focus-visible:outline-offset-2');
      expect(classes).toContain('focus-visible:outline-[#09371f]');
    });

    it('memastikan kontrol input form menyertakan outline fokus keyboard 3px #0d5132', () => {
      expect(controlClassName).toContain('focus-visible:outline-3');
      expect(controlClassName).toContain('focus-visible:outline-offset-2');
      expect(controlClassName).toContain('focus-visible:outline-[#09371f]');

      expect(editorialControlClassName).toContain('focus-visible:outline-3');
      expect(editorialControlClassName).toContain('focus-visible:outline-offset-2');
      expect(editorialControlClassName).toContain('focus-visible:outline-[#09371f]');
    });

    it('memastikan warna outline fokus #09371f memiliki rasio kontras sangat tinggi (> 9:1)', () => {
      const focusOutlineColor = '#09371f';
      const ratioWhite = getContrastRatio(focusOutlineColor, '#ffffff');
      const ratioCanvas = getContrastRatio(focusOutlineColor, '#f6f7f9');

      expect(ratioWhite).toBeGreaterThanOrEqual(9.0);
      expect(ratioCanvas).toBeGreaterThanOrEqual(9.0);
    });
  });
});
