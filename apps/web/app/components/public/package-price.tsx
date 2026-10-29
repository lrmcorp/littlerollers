const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export type PublicPromotionPrice = {
  label: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  discountRp: number;
  promotionalPriceRp: number;
  activeUntil: string | Date;
};

export function PackagePrice({
  priceRp,
  effectivePriceRp = priceRp,
  promotion,
  sessionCount,
  compact = false,
}: {
  priceRp: number;
  effectivePriceRp?: number;
  promotion?: PublicPromotionPrice | null;
  sessionCount?: number;
  compact?: boolean;
}) {
  const promoted = Boolean(promotion && effectivePriceRp < priceRp);
  return (
    <div className={compact ? 'grid gap-0.5 text-right' : 'grid gap-1'}>
      {promoted && (
        <div className={`flex flex-wrap items-center gap-2 ${compact ? 'justify-end' : ''}`}>
          <del
            className="text-sm font-medium text-dd-muted"
            aria-label={`Usual price ${rupiah.format(priceRp)}`}
          >
            {rupiah.format(priceRp)}
          </del>
          <span className="rounded-full bg-lr-sun-soft px-2.5 py-1 text-xs font-bold text-dd-brass-dark">
            {promotion?.label}
          </span>
        </div>
      )}
      <strong
        className={compact ? 'text-base text-dd-forest' : 'font-display text-3xl text-dd-forest'}
      >
        {rupiah.format(effectivePriceRp)}
      </strong>
      {promoted && !compact && (
        <span className="text-xs font-semibold text-dd-brass-dark">
          You save {rupiah.format(promotion?.discountRp ?? 0)}
        </span>
      )}
      {sessionCount && !compact && (
        <span className="text-sm text-dd-muted">
          {rupiah.format(Math.round(effectivePriceRp / sessionCount))} per session
        </span>
      )}
    </div>
  );
}
