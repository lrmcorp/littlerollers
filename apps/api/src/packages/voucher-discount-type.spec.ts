import { calculateVoucherDiscount, isPercentageVoucherType } from './voucher.service';

describe('tipe diskon voucher', () => {
  it.each(['PERCENTAGE', 'percentage', 'PERCENT', ' persen ', '%'])('%s dikenali sebagai persen', (type) => {
    expect(isPercentageVoucherType(type)).toBe(true);
    expect(calculateVoucherDiscount({ priceRp: 1_000_000, discountType: type, discountValue: 10 })).toBe(100_000);
  });

  it.each(['NOMINAL', 'FIXED_AMOUNT', '', null, undefined])('%s dianggap nominal', (type) => {
    expect(isPercentageVoucherType(type as never)).toBe(false);
    expect(calculateVoucherDiscount({ priceRp: 1_000_000, discountType: (type ?? '') as string, discountValue: 50_000 })).toBe(50_000);
  });

  it('menghormati batas diskon maksimum dan tidak melebihi harga', () => {
    expect(
      calculateVoucherDiscount({ priceRp: 1_000_000, discountType: 'PERCENT', discountValue: 50, maxDiscountRp: 200_000 }),
    ).toBe(200_000);
    expect(calculateVoucherDiscount({ priceRp: 30_000, discountType: 'NOMINAL', discountValue: 50_000 })).toBe(30_000);
  });
});
