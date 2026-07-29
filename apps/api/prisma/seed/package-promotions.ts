import type { SeedContext } from './context';

export async function seedPackagePromotions(
  ctx: SeedContext,
  master: { packages: Record<string, string> },
  users: Record<string, string>,
) {
  if (ctx.profile === 'minimal') return;
  const createdById = users['ralamzah-super-owner'] ?? users['super-owner'];
  if (!createdById) return;
  const definitions = [
    {
      key: 'jkt-reformer-live',
      packageKey: 'DD-JKT:REFORMER:10',
      name: 'Reformer Routine 10%',
      label: 'Promo 10%',
      status: 'ACTIVE' as const,
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      activeFrom: ctx.at(-15),
      activeUntil: ctx.at(30),
    },
    {
      key: 'bsd-reformer-live',
      packageKey: 'DD-BSD:REFORMER:10',
      name: 'BSD Reformer Special',
      label: 'Hemat Rp120.000',
      status: 'ACTIVE' as const,
      discountType: 'FIXED_AMOUNT' as const,
      discountValue: 120_000,
      activeFrom: ctx.at(-10),
      activeUntil: ctx.at(20),
    },
    {
      key: 'jkt-mat-scheduled',
      packageKey: 'DD-JKT:MAT:8',
      name: 'Mat Pilates Agustus',
      label: 'Segera hadir',
      status: 'ACTIVE' as const,
      discountType: 'PERCENTAGE' as const,
      discountValue: 8,
      activeFrom: ctx.at(10),
      activeUntil: ctx.at(40),
    },
    {
      key: 'jkt-barre-paused',
      packageKey: 'DD-JKT:BARRE:8',
      name: 'Barre Weekend',
      label: 'Promo akhir pekan',
      status: 'PAUSED' as const,
      discountType: 'FIXED_AMOUNT' as const,
      discountValue: 50_000,
      activeFrom: ctx.at(-3),
      activeUntil: ctx.at(12),
    },
    {
      key: 'bsd-reformer-expired',
      packageKey: 'DD-BSD:REFORMER:5',
      name: 'BSD Opening Promo',
      label: 'Opening promo',
      status: 'ACTIVE' as const,
      discountType: 'PERCENTAGE' as const,
      discountValue: 12,
      activeFrom: ctx.at(-60),
      activeUntil: ctx.at(-30),
    },
  ];
  for (const item of definitions) {
    const packageId = master.packages[item.packageKey];
    if (!packageId) throw new Error(`Missing package for promotion ${item.packageKey}`);
    const id = ctx.id('package-promotion', item.key);
    await ctx.db.packagePromotion.upsert({
      where: { id },
      update: {
        packageId,
        name: item.name,
        label: item.label,
        status: item.status,
        discountType: item.discountType,
        discountValue: item.discountValue,
        activeFrom: item.activeFrom,
        activeUntil: item.activeUntil,
      },
      create: {
        id,
        packageId,
        name: item.name,
        label: item.label,
        status: item.status,
        discountType: item.discountType,
        discountValue: item.discountValue,
        activeFrom: item.activeFrom,
        activeUntil: item.activeUntil,
        createdById,
      },
    });
  }
}

export async function seedPackagePromotionOrderFixtures(ctx: SeedContext) {
  if (ctx.profile === 'minimal') return;
  const jktPurchaseId = ctx.id('purchase', 'approved');
  const jktPromotionId = ctx.id('package-promotion', 'jkt-reformer-live');
  const jktPurchase = await ctx.db.purchase.findUnique({ where: { id: jktPurchaseId } });
  if (jktPurchase) {
    const promotionDiscountRp = Math.floor(jktPurchase.priceRpSnapshot * 0.1);
    const promotionalPriceRp = jktPurchase.priceRpSnapshot - promotionDiscountRp;
    const voucherDiscountRp = Math.floor(promotionalPriceRp * 0.1);
    const netRp = promotionalPriceRp - voucherDiscountRp;
    await ctx.db.purchase.update({
      where: { id: jktPurchaseId },
      data: {
        packagePromotionId: jktPromotionId,
        packagePromotionNameSnapshot: 'Reformer Routine 10%',
        packagePromotionDiscountTypeSnapshot: 'PERCENTAGE',
        packagePromotionDiscountValueSnapshot: 10,
        packagePromotionDiscountRpSnapshot: promotionDiscountRp,
        promotionalPriceRpSnapshot: promotionalPriceRp,
        voucherDiscountRpSnapshot: voucherDiscountRp,
        priceAfterDiscountRpSnapshot: netRp,
        payableAmountRpSnapshot: netRp + (jktPurchase.paymentUniqueCode ?? 0),
      },
    });
    await ctx.db.voucherRedemption.updateMany({
      where: { purchaseId: jktPurchaseId },
      data: { discountRp: voucherDiscountRp },
    });
    await ctx.db.customerPackage.updateMany({
      where: { purchaseId: jktPurchaseId },
      data: { salePriceRp: netRp },
    });
  }

  const bsdPurchaseId = ctx.id('purchase', 'bsd-approved');
  const bsdPromotionId = ctx.id('package-promotion', 'bsd-reformer-live');
  const bsdPurchase = await ctx.db.purchase.findUnique({ where: { id: bsdPurchaseId } });
  if (bsdPurchase) {
    const promotionDiscountRp = 120_000;
    const netRp = bsdPurchase.priceRpSnapshot - promotionDiscountRp;
    await ctx.db.purchase.update({
      where: { id: bsdPurchaseId },
      data: {
        packagePromotionId: bsdPromotionId,
        packagePromotionNameSnapshot: 'BSD Reformer Special',
        packagePromotionDiscountTypeSnapshot: 'FIXED_AMOUNT',
        packagePromotionDiscountValueSnapshot: promotionDiscountRp,
        packagePromotionDiscountRpSnapshot: promotionDiscountRp,
        promotionalPriceRpSnapshot: netRp,
        priceAfterDiscountRpSnapshot: netRp,
        payableAmountRpSnapshot: netRp + (bsdPurchase.paymentUniqueCode ?? 0),
      },
    });
    await ctx.db.customerPackage.updateMany({
      where: { purchaseId: bsdPurchaseId },
      data: { salePriceRp: netRp },
    });
  }
}
