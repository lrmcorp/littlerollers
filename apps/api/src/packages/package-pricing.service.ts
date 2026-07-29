import { Injectable } from '@nestjs/common';
import type { PackagePromotion, Prisma } from '@prisma/client';

export type PromotionPricingSource = Pick<
  PackagePromotion,
  | 'id'
  | 'name'
  | 'label'
  | 'status'
  | 'discountType'
  | 'discountValue'
  | 'activeFrom'
  | 'activeUntil'
  | 'version'
>;

export function promotionEffectiveState(
  promotion: Pick<PackagePromotion, 'status' | 'activeFrom' | 'activeUntil'>,
  now = new Date(),
) {
  if (promotion.status !== 'ACTIVE') return promotion.status;
  if (promotion.activeUntil <= now) return 'EXPIRED' as const;
  if (promotion.activeFrom > now) return 'SCHEDULED' as const;
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
      label: promotion.label,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      discountRp,
      promotionalPriceRp: input.priceRp - discountRp,
      activeFrom: promotion.activeFrom,
      activeUntil: promotion.activeUntil,
      version: promotion.version,
    },
  };
}

@Injectable()
export class PackagePricingService {
  async activePromotion(client: Prisma.TransactionClient, packageId: string, now = new Date()) {
    return client.packagePromotion.findFirst({
      where: {
        packageId,
        status: 'ACTIVE',
        activeFrom: { lte: now },
        activeUntil: { gt: now },
      },
      orderBy: [{ activeFrom: 'desc' }, { id: 'asc' }],
    });
  }

  calculate(priceRp: number, promotion?: PromotionPricingSource | null, now = new Date()) {
    return calculatePackagePromotion({ priceRp, promotion, now });
  }
}
