import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const appDir = path.resolve(__dirname, '..');

// Halaman yang dibuka member atau tamu; judul tab harus mengikuti nama halaman (T-03), bukan judul bawaan.
const MEMBER_ROUTES = [
  'account',
  'account/packages',
  'account/profile',
  'account/security',
  'account/verification',
  'activate-account',
  'bookings',
  'bookings/new',
  'bookings/[id]',
  'check-in-pass',
  'checkout',
  'classes',
  'forgot-password',
  'notifications',
  'orders',
  'orders/[id]',
  'packages',
  'register',
  'reset-password',
  'sign-in',
];

describe('judul tab halaman member (T-03)', () => {
  it.each(MEMBER_ROUTES)('/%s punya judul sendiri', (route) => {
    const page = fs.readFileSync(path.join(appDir, route, 'page.tsx'), 'utf8');
    const layoutPath = path.join(appDir, route, 'layout.tsx');
    const layout = fs.existsSync(layoutPath) ? fs.readFileSync(layoutPath, 'utf8') : '';
    expect(`${page}\n${layout}`).toMatch(/title\s*:|generateMetadata/);
  });

  it('tidak ada judul halaman yang berbunyi "Move with intention"', () => {
    const offenders = MEMBER_ROUTES.filter((route) =>
      /Move with intention/i.test(fs.readFileSync(path.join(appDir, route, 'page.tsx'), 'utf8')),
    );
    expect(offenders).toEqual([]);
  });
});
