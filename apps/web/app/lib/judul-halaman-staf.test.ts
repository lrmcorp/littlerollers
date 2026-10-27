import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const appDir = path.resolve(__dirname, '..');
const HAS_TITLE = /title\s*:|generateMetadata/;

function pageFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : pageFiles(full);
    return entry.name === 'page.tsx' ? [full] : [];
  });
}

/** Halaman yang hanya memanggil `redirect()` tidak pernah tampil, jadi tidak perlu judul. */
const isRedirectOnly = (source: string) => /\bredirect\(/.test(source) && !/<[A-Z]\w*/.test(source);

/** Halaman lama yang langsung dialihkan oleh komponen klien (tautan lama pembelian paket). */
const REDIRECT_COMPONENTS = ['purchases/page.tsx'];

/** Judul dicari di halaman lalu di setiap `layout.tsx` di atasnya, kecuali layout akar (judul bawaan situs). */
function titleSource(pagePath: string) {
  const parts = [fs.readFileSync(pagePath, 'utf8')];
  for (let dir = path.dirname(pagePath); dir !== appDir; dir = path.dirname(dir)) {
    const layout = path.join(dir, 'layout.tsx');
    if (fs.existsSync(layout)) parts.push(fs.readFileSync(layout, 'utf8'));
  }
  return parts.join('\n');
}

const pages = pageFiles(appDir)
  .map((file) => path.relative(appDir, file))
  .filter((file) => file !== 'page.tsx') // beranda publik memakai judul bawaan situs
  .sort();

describe('judul tab semua halaman (T-03)', () => {
  it('menemukan halaman untuk diperiksa', () => {
    expect(pages.length).toBeGreaterThan(60);
  });

  it.each(pages)('%s punya judul sendiri atau hanya mengalihkan', (file) => {
    const source = titleSource(path.join(appDir, file));
    const page = fs.readFileSync(path.join(appDir, file), 'utf8');
    expect(
      HAS_TITLE.test(source) || isRedirectOnly(page) || REDIRECT_COMPONENTS.includes(file),
    ).toBe(true);
  });

  it('judul tidak menambahkan sendiri nama situs (sudah ada di templat akar)', () => {
    const doubled = pages.filter((file) => {
      const source = titleSource(path.join(appDir, file));
      return /title\s*:\s*['"`][^'"`]*Daily Dose Pilates/.test(source);
    });
    expect(doubled).toEqual([]);
  });
});
