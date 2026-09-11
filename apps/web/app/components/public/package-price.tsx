import { formatRupiah } from '../../lib/formatters';

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
            aria-label={`Harga normal ${formatRupiah(priceRp)}`}
          >
            {formatRupiah(priceRp)}
          </del>
          <span className="rounded-full bg-dd-brass-soft px-2.5 py-1 text-[11px] font-bold text-dd-brass-dark">
            {promotion?.label}
          </span>
        </div>
      )}
      <strong
        className={compact ? 'font-serif text-base text-dd-forest font-bold' : 'font-serif text-3xl sm:text-4xl tracking-tight text-dd-forest font-normal'}
      >
        {formatRupiah(effectivePriceRp)}
      </strong>
      {promoted && !compact && (
        <span className="text-xs font-semibold text-dd-brass-dark">
          Hemat {formatRupiah(promotion?.discountRp ?? 0)}
        </span>
      )}
      {sessionCount && !compact && (
        <span className="text-sm text-dd-muted">
          {formatRupiah(Math.round(effectivePriceRp / sessionCount))} per sesi
        </span>
      )}
    </div>
  );
}
