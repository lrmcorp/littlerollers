import { calculatePackagePromotion, promotionEffectiveState } from './package-pricing.service';

const promotion = {
  id: 'promo-1',
  name: 'Routine promo',
  label: 'Promo 10%',
  status: 'ACTIVE' as const,
  discountType: 'PERCENTAGE' as const,
  discountValue: 10,
  activeFrom: new Date('2026-07-01T00:00:00.000Z'),
  activeUntil: new Date('2026-08-01T00:00:00.000Z'),
  version: 2,
};

describe('package promotion pricing', () => {
  it('uses a half-open active interval', () => {
    expect(promotionEffectiveState(promotion, promotion.activeFrom)).toBe('LIVE');
    expect(promotionEffectiveState(promotion, promotion.activeUntil)).toBe('EXPIRED');
  });

  it('keeps explicit lifecycle states instead of presenting them as scheduled or expired', () => {
    expect(
      promotionEffectiveState(
        { ...promotion, status: 'PAUSED' },
        new Date('2026-06-01T00:00:00.000Z'),
      ),
    ).toBe('PAUSED');
    expect(
      promotionEffectiveState(
        { ...promotion, status: 'ARCHIVED' },
        new Date('2026-09-01T00:00:00.000Z'),
      ),
    ).toBe('ARCHIVED');
  });

  it('rounds percentage discounts down and preserves the base price', () => {
    expect(
      calculatePackagePromotion({
        priceRp: 1_000_005,
        promotion,
        now: new Date('2026-07-15T00:00:00.000Z'),
      }),
    ).toMatchObject({
      priceRp: 1_000_005,
      effectivePriceRp: 900_005,
      promotion: { discountRp: 100_000, promotionalPriceRp: 900_005 },
    });
  });

  it('never reduces package promotion price below one rupiah', () => {
    const result = calculatePackagePromotion({
      priceRp: 100_000,
      promotion: { ...promotion, discountType: 'FIXED_AMOUNT', discountValue: 500_000 },
      now: new Date('2026-07-15T00:00:00.000Z'),
    });
    expect(result.effectivePriceRp).toBe(1);
    expect(result.promotion?.discountRp).toBe(99_999);
  });

  it('ignores scheduled, paused, and expired promotions', () => {
    expect(
      calculatePackagePromotion({
        priceRp: 100_000,
        promotion,
        now: new Date('2026-06-30T23:59:59.000Z'),
      }).promotion,
    ).toBeNull();
    expect(
      calculatePackagePromotion({
        priceRp: 100_000,
        promotion: { ...promotion, status: 'PAUSED' },
        now: new Date('2026-07-15T00:00:00.000Z'),
      }).promotion,
    ).toBeNull();
    expect(
      calculatePackagePromotion({
        priceRp: 100_000,
        promotion,
        now: promotion.activeUntil,
      }).promotion,
    ).toBeNull();
  });
});
