import {
  calculateVoucherDiscount,
  deriveVoucherStatus,
  normalizeVoucherCode,
  paginateVouchers,
} from './voucher.service';

describe('voucher business rules', () => {
  it('normalizes voucher codes without case sensitivity', () => {
    expect(normalizeVoucherCode('  reformer-10 ')).toBe('REFORMER-10');
  });

  it('calculates percentage discounts and respects the maximum', () => {
    expect(
      calculateVoucherDiscount({
        priceRp: 1_000_000,
        discountType: 'PERCENTAGE',
        discountValue: 20,
        maxDiscountRp: 150_000,
      }),
    ).toBe(150_000);
  });

  it('never discounts more than the package price', () => {
    expect(
      calculateVoucherDiscount({
        priceRp: 100_000,
        discountType: 'FIXED_AMOUNT',
        discountValue: 250_000,
      }),
    ).toBe(100_000);
  });
});

describe('voucher display status', () => {
  const now = new Date('2026-09-26T00:00:00.000Z');
  const base = { active: true, validUntil: null, quota: 100, usedCount: 0 };

  it('is ACTIVE for an enabled voucher with quota left and no expiry', () => {
    expect(deriveVoucherStatus(base, now)).toBe('ACTIVE');
  });

  it('is PAUSED whenever the voucher is switched off, even if expired or used up', () => {
    expect(
      deriveVoucherStatus({ ...base, active: false, validUntil: '2020-01-01', usedCount: 100 }, now),
    ).toBe('PAUSED');
  });

  it('is EXPIRED once validUntil has passed', () => {
    expect(deriveVoucherStatus({ ...base, validUntil: new Date('2026-09-25') }, now)).toBe(
      'EXPIRED',
    );
    expect(deriveVoucherStatus({ ...base, validUntil: new Date('2026-09-27') }, now)).toBe(
      'ACTIVE',
    );
  });

  it('is EXHAUSTED when usage reaches the quota', () => {
    expect(deriveVoucherStatus({ ...base, quota: 1, usedCount: 1 }, now)).toBe('EXHAUSTED');
    expect(deriveVoucherStatus({ ...base, quota: 2, usedCount: 1 }, now)).toBe('ACTIVE');
  });
});

describe('voucher list pagination and summary', () => {
  const now = new Date('2026-09-26T00:00:00.000Z');
  const rows = [
    { id: 'v1', active: true, validUntil: null, quota: 100, usedCount: 0 },
    { id: 'v2', active: true, validUntil: null, quota: 100, usedCount: 0 },
    { id: 'v3', active: false, validUntil: null, quota: 100, usedCount: 0 },
    { id: 'v4', active: true, validUntil: new Date('2026-01-01'), quota: 100, usedCount: 0 },
    { id: 'v5', active: true, validUntil: null, quota: 1, usedCount: 1 },
  ];

  it('counts every status across the whole result set, keyed by status', () => {
    const { summary } = paginateVouchers(rows, { limit: 2, now });
    expect(summary).toEqual({ ACTIVE: 2, PAUSED: 1, EXPIRED: 1, EXHAUSTED: 1, total: 5 });
  });

  it('keeps the summary independent from the status filter', () => {
    const result = paginateVouchers(rows, { status: 'EXPIRED', limit: 10, now });
    expect(result.items.map((row) => row.id)).toEqual(['v4']);
    expect(result.summary.ACTIVE).toBe(2);
  });

  it('walks pages with the cursor and stops at the end', () => {
    const first = paginateVouchers(rows, { limit: 2, now });
    expect(first.items.map((row) => row.id)).toEqual(['v1', 'v2']);
    expect(first.hasMore).toBe(true);
    expect(first.nextCursor).toBe('v2');

    const second = paginateVouchers(rows, { limit: 2, cursor: first.nextCursor!, now });
    expect(second.items.map((row) => row.id)).toEqual(['v3', 'v4']);

    const last = paginateVouchers(rows, { limit: 2, cursor: second.nextCursor!, now });
    expect(last.items.map((row) => row.id)).toEqual(['v5']);
    expect(last.hasMore).toBe(false);
    expect(last.nextCursor).toBeNull();
  });

  it('treats the legacy ARCHIVED filter as PAUSED', () => {
    const result = paginateVouchers(rows, { status: 'ARCHIVED', limit: 10, now });
    expect(result.items.map((row) => row.id)).toEqual(['v3']);
  });

  it('supports numbered page pagination with total and totalPages', () => {
    const page2 = paginateVouchers(rows, { limit: 2, page: 2, now });
    expect(page2.items.map((row) => row.id)).toEqual(['v3', 'v4']);
    expect(page2.total).toBe(5);
    expect(page2.totalPages).toBe(3);
    expect(page2.page).toBe(2);
    expect(page2.hasMore).toBe(true);
    expect(page2.nextCursor).toBe('v4');

    const page3 = paginateVouchers(rows, { limit: 2, page: 3, now });
    expect(page3.items.map((row) => row.id)).toEqual(['v5']);
    expect(page3.hasMore).toBe(false);
    expect(page3.nextCursor).toBeNull();
  });
});
