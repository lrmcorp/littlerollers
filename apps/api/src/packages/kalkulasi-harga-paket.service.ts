import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

export type PromotionPricingSource = {
  id: string;
  name: string;
  label?: string | null;
  status?: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FIXED_AMOUNT';
  discountValue: number;
  activeFrom?: Date | null;
  activeUntil?: Date | null;
  version?: number;
};

export function promotionEffectiveState(
  promotion: { status?: string; activeFrom?: Date | null; activeUntil?: Date | null },
  now = new Date(),
) {
  if (promotion.status && promotion.status !== 'ACTIVE') return promotion.status;
  if (promotion.activeUntil && promotion.activeUntil <= now) return 'EXPIRED' as const;
  if (promotion.activeFrom && promotion.activeFrom > now) return 'SCHEDULED' as const;
  return 'LIVE' as const;
}

export function calculatePackagePromotion(input: {
  priceRp: number;
  promotion?: PromotionPricingSource | null;
  now?: Date;
}) {
  const promotion = input.promotion;
  const live = promotion && promotionEffectiveState(promotion, input.now) === 'LIVE';
  if (!promotion || !live)
    return {
      priceRp: input.priceRp,
      effectivePriceRp: input.priceRp,
      promotion: null,
    };
  const raw =
    promotion.discountType === 'PERCENTAGE'
      ? Math.floor((input.priceRp * promotion.discountValue) / 100)
      : promotion.discountValue;
  const discountRp = Math.min(raw, Math.max(0, input.priceRp - 1));
  return {
    priceRp: input.priceRp,
    effectivePriceRp: input.priceRp - discountRp,
    promotion: {
      id: promotion.id,
      name: promotion.name,
      label: promotion.label ?? promotion.name,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      discountRp,
      promotionalPriceRp: input.priceRp - discountRp,
      activeFrom: promotion.activeFrom ?? new Date(),
      activeUntil: promotion.activeUntil ?? new Date(Date.now() + 86400000 * 365),
      version: promotion.version ?? 1,
    },
  };
}

@Injectable()
export class PackagePricingService {
  async activePromotion(
    _client: Prisma.TransactionClient,
    _packageId: string,
    _now = new Date(),
  ): Promise<PromotionPricingSource | null> {
    return null;
  }

  calculate(priceRp: number, promotion?: PromotionPricingSource | null, now = new Date()) {
    return calculatePackagePromotion({ priceRp, promotion, now });
  }

  // --- Indonesian Domain Aliases ---
  async promosiAktif(client: Prisma.TransactionClient, packageId: string, now = new Date()) {
    return this.activePromotion(client, packageId, now);
  }
}
