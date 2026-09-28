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

type PricingClient = Pick<Prisma.TransactionClient, 'packagePromotion'>;

const toSource = (row: {
  id: string;
  name: string;
  label: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  activeFrom: Date;
  activeUntil: Date;
  version: number;
}): PromotionPricingSource => ({ ...row, status: 'ACTIVE' });

@Injectable()
export class PackagePricingService {
  /** Promosi ACTIVE yang sedang berlaku pada paket (paling akhir dimulai bila ada lebih dari satu). */
  async activePromotion(
    client: PricingClient,
    packageId: string,
    now = new Date(),
  ): Promise<PromotionPricingSource | null> {
    const row = await client.packagePromotion.findFirst({
      where: {
        packageId,
        status: 'ACTIVE',
        activeFrom: { lte: now },
        activeUntil: { gt: now },
      },
      orderBy: [{ activeFrom: 'desc' }, { id: 'desc' }],
    });
    return row ? toSource(row) : null;
  }

  /** Sama seperti `activePromotion` untuk banyak paket sekaligus (satu query). */
  async activePromotions(
    client: PricingClient,
    packageIds: string[],
    now = new Date(),
  ): Promise<Map<string, PromotionPricingSource>> {
    if (packageIds.length === 0) return new Map();
    const rows = await client.packagePromotion.findMany({
      where: {
        packageId: { in: packageIds },
        status: 'ACTIVE',
        activeFrom: { lte: now },
        activeUntil: { gt: now },
      },
      orderBy: [{ activeFrom: 'asc' }, { id: 'asc' }],
    });
    // Urutan menaik: yang paling akhir dimulai menimpa yang lebih awal.
    return new Map(rows.map((row) => [row.packageId, toSource(row)]));
  }

  calculate(priceRp: number, promotion?: PromotionPricingSource | null, now = new Date()) {
    return calculatePackagePromotion({ priceRp, promotion, now });
  }

  // --- Indonesian Domain Aliases ---
  async promosiAktif(client: PricingClient, packageId: string, now = new Date()) {
    return this.activePromotion(client, packageId, now);
  }
}
