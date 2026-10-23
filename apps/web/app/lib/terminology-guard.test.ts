import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { glossary } from './glossary';

const appRoot = resolve(process.cwd(), 'app');

/** Folder dan berkas panel staf; tampilan customer/publik sengaja tidak dipindai. */
const staffDirs = [
  'assignments',
  'audit',
  'branches',
  'classes',
  'customers',
  'data-import',
  'finance',
  'identity-verifications',
  'instructors',
  'ledger',
  'master',
  'migrations',
  'notification-management',
  'operations',
  'package-promotions',
  'public-content-management',
  'support-cases',
  'users',
  'vouchers',
  'workspace',
  'health',
  'check-in-scanner',
];
const staffFiles = [
  'purchases/purchase-review-view.tsx',
  'bookings/booking-view.tsx',
  'components/admin/admin-ui.tsx',
  'components/admin/admin-page-header.tsx',
  'lib/frontend-pages.ts',
  'dashboard.tsx',
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.tsx?$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

const files = [
  ...staffDirs.flatMap((dir) => walk(join(appRoot, dir))),
  ...staffFiles.map((file) => join(appRoot, file)),
];

// Teks yang ditampilkan ke pengguna: teks JSX dan atribut label ramah pengguna (aria-label, placeholder, title)
const userFacingText = />([^<>{};=\n][^<>{};=]*)<|(?:aria-label|placeholder|title)=["']([^"']+)["']/gu;

// Kata bahasa Inggris yang dilarang dalam teks; dicocokkan sebagai kata utuh.
const banned = glossary
  .filter(({ avoid }) => !avoid.includes(' ') && !avoid.includes('-'))
  .map(({ avoid, use }) => ({ avoid, use, pattern: new RegExp(`\\b${avoid}\\b`) }));

describe('panel terminology guard', () => {
  it('scans a meaningful set of staff files', () => {
    expect(files.length).toBeGreaterThan(40);
  });

  it('uses the glossary terms in staff-facing text', () => {
    const violations: string[] = [];
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(userFacingText)) {
        const text = match[1] ?? match[2] ?? '';
        if (!text.trim()) continue;
        for (const { avoid, use, pattern } of banned) {
          if (pattern.test(text)) {
            violations.push(
              `${relative(appRoot, file)}: "${text.trim().slice(0, 60)}" → gunakan "${use}" bukan "${avoid}"`,
            );
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
