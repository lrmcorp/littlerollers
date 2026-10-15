import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const appRoot = resolve(process.cwd(), 'app');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'api-clients' ? [] : walk(path);
    return /\.tsx?$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

// Literal string dan teks JSX (bukan komentar atau kode).
const literal = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`|>([^<>{};=]+)</gs;

/** Istilah pemrogram yang pernah bocor ke layar (laporan UAT 13 Okt 2026). */
const forbidden: Array<[RegExp, string]> = [
  [/Rules? #\d/, 'nomor aturan internal'],
  [/Keputusan Bisnis #?\d/, 'nomor keputusan bisnis internal'],
  [/ledger authoritative/i, 'istilah ledger authoritative'],
  [/Optimistic locking/i, 'istilah optimistic locking'],
  [/Role (&|&amp;) Scope/, 'Role & Scope'],
  [/\(Other Cost\)/i, '(Other Cost)'],
  [/\(Realtime\)/i, '(Realtime)'],
  [/Projection (Cost|Rate)/i, 'Projection Cost/Rate'],
  [/Gross Sales/, 'Gross Sales'],
  [/Our Studios/, 'Our Studios'],
  [/tanpa pilihan otomatis/, 'teks developer jadwal'],
  [/selalu kosong/, 'catatan pratinjau developer'],
  [/sumber operasionalnya disetujui/, 'catatan developer studio'],
  [/persetujuan berbelit/, 'kalimat Penyesuaian Sesi yang bertentangan'],
];

describe('teks tampilan bebas istilah pemrogram', () => {
  it('tidak memuat istilah internal pada literal string atau teks JSX', () => {
    const violations: string[] = [];
    for (const file of walk(appRoot)) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(literal)) {
        const text = match[1] ?? match[2] ?? match[3] ?? match[4] ?? '';
        for (const [pattern, name] of forbidden) {
          if (pattern.test(text)) {
            violations.push(`${relative(appRoot, file)}: "${text.trim().slice(0, 70)}" → ${name}`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
