import { calculateVoucherDiscount, normalizeVoucherCode } from './voucher.service';

describe('voucher business rules', () => {
  it('normalizes voucher codes without case sensitivity', () => {
    expect(normalizeVoucherCode('  reformer-10 ')).toBe('MOVERS-10');
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
