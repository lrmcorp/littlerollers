import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migratedViews = [
  'assignments/assignments-view.tsx',
  'bookings/booking-view.tsx',
  'master/master-view.tsx',
  'master/payment-accounts-view.tsx',
  'identity-verifications/review-components.tsx',
  'identity-verifications/review-view.tsx',
  'dashboard.tsx',
];

const bareControl = /<(button|input|select|textarea)\b(?![^>]*\bclassName=)[^>]*>/g;

describe('internal Tailwind control guardrail', () => {
  it.each(migratedViews)('%s tidak menambahkan bare production control', (relativePath) => {
    const source = readFileSync(resolve(process.cwd(), 'app', relativePath), 'utf8');
    const violations = [...source.matchAll(bareControl)]
      .filter((match) => !/\btype=["']hidden["']/.test(match[0]))
      .map((match) => match[0]);
    expect(violations).toEqual([]);
  });
});
