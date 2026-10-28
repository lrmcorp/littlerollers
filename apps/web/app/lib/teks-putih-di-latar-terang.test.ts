import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Menjaga agar teks putih tidak pernah dipasang di atas token latar yang terang.
 *
 * Ini bukan aturan gaya. Palet panel pernah diubah dari hijau tua ke abu-abu terang, dan beberapa
 * tempat yang dulu gelap masih menuliskan `text-white`. Hasilnya putih di atas abu-abu muda, kira-
 * kira 1,1:1, yang berarti tulisannya hilang sama sekali. Jenis kesalahan itu tidak terlihat dari
 * membaca satu berkas, jadi dijaga di sini.
 */

const appDir = path.resolve(__dirname, '..');
const cssPath = path.join(appDir, 'tailwind.css');

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const kontras = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

/** Token `--color-dd-*` beserta nilai heksanya, dibaca dari sumber yang sebenarnya dipakai. */
function tokenWarna(): Map<string, string> {
  const css = fs.readFileSync(cssPath, 'utf8');
  const peta = new Map<string, string>();
  for (const baris of css.matchAll(/--color-(dd-[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    peta.set(baris[1]!, baris[2]!.toLowerCase());
  }
  return peta;
}

function berkasSumber(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory())
      return entry.name === 'node_modules' || entry.name === '.next' ? [] : berkasSumber(full);
    return /\.tsx$/.test(entry.name) && !/\.test\.tsx$/.test(entry.name) ? [full] : [];
  });
}

describe('teks putih tidak boleh berada di atas latar terang', () => {
  const token = tokenWarna();

  it('membaca token warna dari tailwind.css, bukan dari daftar tersalin', () => {
    expect(token.size).toBeGreaterThan(10);
    expect(token.get('dd-sidebar')).toBeDefined();
  });

  it('tidak ada satu pun kelas bg-dd-* terang yang dipasangkan dengan text-white', () => {
    // Hanya memeriksa string kelas yang memuat keduanya sekaligus, sehingga latar dan warna teks
    // benar-benar berasal dari elemen yang sama. Kelas berawalan varian (`hover:`, `group-hover:`,
    // `selection:`) dilewati: di sana putih berlaku bersama latar gelap milik varian yang sama,
    // bukan di atas latar dasarnya.
    const kelas = /(?:"|'|`)([^"'`\n]*(?<![\w:-])text-white(?![\w-])[^"'`\n]*)(?:"|'|`)/g;
    const pelanggaran: string[] = [];

    for (const berkas of berkasSumber(appDir)) {
      const isi = fs.readFileSync(berkas, 'utf8');
      for (const cocok of isi.matchAll(kelas)) {
        const baris = cocok[1]!;
        for (const bg of baris.matchAll(/(?<![\w:-])bg-(dd-[a-z0-9-]+)(?![\w/-])/g)) {
          const hex = token.get(bg[1]!);
          if (!hex) continue;
          const rasio = kontras(hex, '#ffffff');
          if (rasio < 4.5) {
            pelanggaran.push(
              `${path.relative(appDir, berkas)}: bg-${bg[1]} (${hex}) + text-white = ${rasio.toFixed(2)}:1`,
            );
          }
        }
      }
    }

    expect(pelanggaran).toEqual([]);
  });

  it('memastikan dd-ink memang cukup gelap untuk menopang teks putih', () => {
    expect(kontras(token.get('dd-ink')!, '#ffffff')).toBeGreaterThanOrEqual(9);
  });
});
