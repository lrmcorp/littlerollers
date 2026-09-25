import { describe, expect, it } from 'vitest';
import { canMutatePage, canReadPage, frontendPages, pageForPath } from './frontend-pages';
import { pageIcons } from './page-icons';

const page = (href: string) => frontendPages.find((item) => item.href === href)!;

describe('frontend page registry', () => {
  it('keeps daily work pages out of the "advanced" menu', () => {
    for (const href of ['/finance', '/ledger/adjustments', '/workspace/payments']) {
      expect(page(href).isAdvanced).toBeFalsy();
    }
  });

  it('only advertises queue badges the dashboard API can supply', () => {
    const supplied = new Set(['payments', 'reschedules', 'adjustments']);
    const unsupported = frontendPages
      .filter((item) => item.queueBadgeSource && !supplied.has(item.queueBadgeSource))
      .map((item) => item.href);
    // Verifikasi ID dan Operations belum punya antrean di API dashboard; jangan tambah lagi tanpa API.
    expect(unsupported.sort()).toEqual(['/identity-verifications', '/operations']);
  });

  it('gates the WhatsApp automation page behind automation capabilities', () => {
    const reminders = page('/workspace/reminders');
    expect(canReadPage([], reminders)).toBe(false);
    expect(canReadPage(['class:assigned:read', 'attendance:self'], reminders)).toBe(false);
    expect(canReadPage(['automation:read'], reminders)).toBe(true);
    expect(canMutatePage(['automation:read'], reminders)).toBe(false);
    expect(canMutatePage(['automation:read', 'automation:run'], reminders)).toBe(true);
  });

  it('resolves detail paths to their list page', () => {
    expect(pageForPath('/workspace/payments')?.href).toBe('/workspace/payments');
    expect(pageForPath('/workspace/payments/abc-123')?.href).toBe('/workspace/payments');
    expect(pageForPath('/customers/xyz')?.group).toBe('Member & Pelanggan');
    expect(pageForPath('/tidak-ada')).toBeUndefined();
  });

  it('gives every staff page its own icon', () => {
    const staffHrefs = frontendPages
      .filter((item) => !item.capabilities.includes('customer:self'))
      .map((item) => item.href);
    const icons = staffHrefs.map((href) => pageIcons[href]);
    expect(icons.every(Boolean)).toBe(true);
    expect(new Set(icons).size).toBe(icons.length);
  });
});
