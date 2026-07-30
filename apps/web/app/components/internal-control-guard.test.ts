import { readdirSync, readFileSync } from 'node:fs';
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

function productionViews(directory = resolve(process.cwd(), 'app')): Array<[string, string]> {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return productionViews(path);
    if (!entry.name.endsWith('.tsx') || entry.name.includes('.test.')) return [];
    return [[path.slice(resolve(process.cwd(), 'app').length + 1), readFileSync(path, 'utf8')]];
  });
}

describe('internal Tailwind control guardrail', () => {
  it.each(migratedViews)('%s tidak menambahkan bare production control', (relativePath) => {
    const source = readFileSync(resolve(process.cwd(), 'app', relativePath), 'utf8');
    const violations = [...source.matchAll(bareControl)]
      .filter((match) => !/\btype=["']hidden["']/.test(match[0]))
      .map((match) => match[0]);
    expect(violations).toEqual([]);
  });

  it('tidak mengizinkan ConfirmationPanel inline pada production view', () => {
    const productionViews = migratedViews.map((relativePath) =>
      readFileSync(resolve(process.cwd(), 'app', relativePath), 'utf8'),
    );
    expect(productionViews.join('\n')).not.toContain('ConfirmationPanel');
  });

  it('memusatkan dialog dan drawer form pada fondasi global', () => {
    const sources = productionViews();
    const deprecated = sources
      .filter(([, source]) =>
        /\b(?:DetailDrawer|DestructiveActionDialog|ConfirmationPanel)\b/u.test(source),
      )
      .map(([path]) => path);
    const adminDialogImports = sources
      .filter(([, source]) =>
        [...source.matchAll(/import\s*\{([^}]*)\}\s*from ['"]([^'"]+)['"]/gu)].some(
          ([, imports, modulePath]) =>
            modulePath?.endsWith('components/admin/admin-ui') &&
            /(?:^|,)\s*(?:Button|Dialog|Drawer)(?:\s+as\s+\w+)?\s*(?:,|$)/u.test(imports ?? ''),
        ),
      )
      .map(([path]) => path);
    expect(deprecated).toEqual([]);
    expect(adminDialogImports).toEqual([]);
  });

  it('melarang overlay form ad-hoc dan dialog native di luar fondasi global', () => {
    const overlayAllowlist = new Set([
      'components/app-feedback.tsx',
      'app-navigation.tsx',
      'components/customer/customer-navigation.tsx',
      'components/public/public-header.tsx',
    ]);
    const dialogAllowlist = new Set([
      'components/app-feedback.tsx',
      'components/public/public-header.tsx',
    ]);
    const sources = productionViews();
    expect(
      sources
        .filter(
          ([path, source]) => !overlayAllowlist.has(path) && /\bfixed inset-0\b/u.test(source),
        )
        .map(([path]) => path),
    ).toEqual([]);
    expect(
      sources
        .filter(
          ([path, source]) =>
            !dialogAllowlist.has(path) &&
            /(?:role=["']dialog["']|aria-modal=["']true["']|<dialog\b)/u.test(source),
        )
        .map(([path]) => path),
    ).toEqual([]);
  });

  it('melarang browser dialog dan ikon langsung di dalam Button', () => {
    const sources = productionViews();
    expect(
      sources
        .filter(([, source]) => /window\.(?:alert|confirm|prompt)\s*\(/u.test(source))
        .map(([path]) => path),
    ).toEqual([]);
    const directIcon =
      /<Button\b(?![^>]*(?:leadingIcon|trailingIcon))[^>]*>\s*<[A-Z][A-Za-z0-9]*\b/u;
    expect(sources.filter(([, source]) => directIcon.test(source)).map(([path]) => path)).toEqual(
      [],
    );
  });

  it('mengharuskan searchable dropdown untuk opsi data dinamis', () => {
    const dynamicSources = [
      'branches',
      'classTypes',
      'instructors',
      'customers',
      'customerPackages',
      'eligibleSlots',
      'packageOptions',
      'assetKeys',
      'visibleRoles',
      'capabilities',
      'categories',
    ];
    const violations = productionViews().flatMap(([path, source]) => {
      const controls = [
        ...source.matchAll(/<(?:select|SelectInput)\b[\s\S]*?<\/(?:select|SelectInput)>/gu),
      ];
      return controls
        .filter((match) => dynamicSources.some((name) => match[0].includes(`${name}.map`)))
        .map(() => path);
    });
    expect([...new Set(violations)]).toEqual([]);
  });

  it('tidak menyisakan façade SearchableLookup lama', () => {
    expect(
      productionViews()
        .filter(([, source]) => source.includes('SearchableLookup'))
        .map(([path]) => path),
    ).toEqual([]);
  });
});
