import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const appDir = path.resolve(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' || entry.name === '.next' ? [] : sourceFiles(full);
    return /\.(tsx?|css)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

describe('T-17: palet admin netral, hijau terbatas', () => {
  it('tidak ada lagi warna garis #d5dfda dan #aabbb3 yang gagal 3:1 di kode aplikasi', () => {
    const offenders = sourceFiles(appDir).filter((file) => /#d5dfda|#aabbb3/i.test(fs.readFileSync(file, 'utf8')));
    expect(offenders.map((file) => path.relative(appDir, file))).toEqual([]);
  });

  it('hijau admin tetap #285740 (keputusan 27 Oktober 2026), dan sidebar tidak lagi hijau gelap', () => {
    const css = fs.readFileSync(path.join(appDir, 'tailwind.css'), 'utf8');
    expect(css).toContain('--color-dd-forest: #285740;');
    expect(css).not.toContain('#17352a');
  });

  it('tombol hijau utama lolos kontras dengan teks putih dan dengan sidebar', () => {
    expect(contrast('#285740', '#ffffff')).toBeGreaterThanOrEqual(7);
    expect(contrast('#285740', '#ebe8e0')).toBeGreaterThanOrEqual(5);
  });

  it('lencana jumlah antrean di menu admin tidak memakai hijau', () => {
    const nav = fs.readFileSync(path.join(appDir, 'app-navigation.tsx'), 'utf8');
    expect(nav).not.toMatch(/rounded-full bg-dd-forest/);
  });
});
