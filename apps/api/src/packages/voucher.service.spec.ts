import {
  calculateVoucherDiscount,
  checkVoucherApplicability,
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

  it('identifies JULY2026 as EXPIRED after July 31st 2026', () => {
    const july2026Voucher = {
      code: 'JULY2026',
      active: true,
      validUntil: new Date('2026-07-31T23:59:59.999Z'),
      quota: null,
      usedCount: 0,
    };
    const octoberNow = new Date('2026-10-13T00:00:00.000Z');
    expect(deriveVoucherStatus(july2026Voucher, octoberNow)).toBe('EXPIRED');
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

describe('checkVoucherApplicability - strict negative boundary tests', () => {
  const now = new Date('2026-10-15T12:00:00.000Z');
  const validVoucher = {
    active: true,
    validUntil: new Date('2026-10-20T12:00:00.000Z'),
    minSpendRp: 250_000,
    quota: 10,
    usedCount: 2,
  };

  it('rejects with NOT_FOUND if voucher is null or undefined', () => {
    expect(checkVoucherApplicability(null, 500_000, now)).toEqual({
      valid: false,
      issue: 'NOT_FOUND',
    });
    expect(checkVoucherApplicability(undefined, 500_000, now)).toEqual({
      valid: false,
      issue: 'NOT_FOUND',
    });
  });

  it('rejects with INACTIVE when active is false, even if quota and validity are fine', () => {
    expect(
      checkVoucherApplicability({ ...validVoucher, active: false }, 500_000, now),
    ).toEqual({
      valid: false,
      issue: 'INACTIVE',
    });
  });

  it('rejects with EXPIRED when validUntil has passed or matches exactly', () => {
    // Past date
    expect(
      checkVoucherApplicability(
        { ...validVoucher, validUntil: new Date('2026-10-15T11:59:59.999Z') },
        500_000,
        now,
      ),
    ).toEqual({
      valid: false,
      issue: 'EXPIRED',
    });

    // Exact current instant
    expect(
      checkVoucherApplicability(
        { ...validVoucher, validUntil: new Date('2026-10-15T12:00:00.000Z') },
        500_000,
        now,
      ),
    ).toEqual({
      valid: false,
      issue: 'EXPIRED',
    });

    // Future date passes
    expect(
      checkVoucherApplicability(
        { ...validVoucher, validUntil: new Date('2026-10-15T12:00:01.000Z') },
        500_000,
        now,
      ),
    ).toEqual({ valid: true });
  });

  it('rejects with MINIMUM_SPEND_NOT_MET when basisRp is strictly below minSpendRp', () => {
    // 1 rupiah below minimum
    expect(
      checkVoucherApplicability(validVoucher, 249_999, now),
    ).toEqual({
      valid: false,
      issue: 'MINIMUM_SPEND_NOT_MET',
    });

    // Exact minimum spend passes
    expect(
      checkVoucherApplicability(validVoucher, 250_000, now),
    ).toEqual({ valid: true });
  });

  it('rejects with EXHAUSTED when usedCount equals or exceeds quota', () => {
    // Exact quota reached
    expect(
      checkVoucherApplicability(
        { ...validVoucher, quota: 10, usedCount: 10 },
        500_000,
        now,
      ),
    ).toEqual({
      valid: false,
      issue: 'EXHAUSTED',
    });

    // Over quota
    expect(
      checkVoucherApplicability(
        { ...validVoucher, quota: 10, usedCount: 11 },
        500_000,
        now,
      ),
    ).toEqual({
      valid: false,
      issue: 'EXHAUSTED',
    });

    // 1 under quota passes
    expect(
      checkVoucherApplicability(
        { ...validVoucher, quota: 10, usedCount: 9 },
        500_000,
        now,
      ),
    ).toEqual({ valid: true });

    // Unlimited quota (null) passes regardless of high usage
    expect(
      checkVoucherApplicability(
        { ...validVoucher, quota: null, usedCount: 9999 },
        500_000,
        now,
      ),
    ).toEqual({ valid: true });
  });

  it('hardens calculateVoucherDiscount against negative numbers and excessive amounts', () => {
    // Negative discountValue must return 0, never negative
    expect(
      calculateVoucherDiscount({
        priceRp: 500_000,
        discountType: 'FIXED_AMOUNT',
        discountValue: -100_000,
      }),
    ).toBe(0);

    // Negative priceRp must return 0
    expect(
      calculateVoucherDiscount({
        priceRp: -500_000,
        discountType: 'FIXED_AMOUNT',
        discountValue: 100_000,
      }),
    ).toBe(0);

    // Fixed amount exceeding priceRp must cap at priceRp
    expect(
      calculateVoucherDiscount({
        priceRp: 200_000,
        discountType: 'FIXED_AMOUNT',
        discountValue: 1_000_000,
      }),
    ).toBe(200_000);
  });
});

