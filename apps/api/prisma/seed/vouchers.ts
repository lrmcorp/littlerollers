import type { SeedContext } from './context';

export async function seedVouchers(
  ctx: SeedContext,
  master: { branches: Record<string, string>; packages: Record<string, string> },
  users: Record<string, string>,
) {
  if (ctx.profile === 'minimal') return;
  const creatorId = users['ralamzah-super-owner'] ?? users['super-owner'];
  if (!creatorId) return;
  const packageIds = Object.values(master.packages);
  const definitions: Array<{
    key: string;
    code: string;
    name: string;
    description?: string;
    status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'EXHAUSTED';
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    maxDiscountRp?: number;
    minimumPurchaseRp?: number;
    activeFrom: Date;
    activeUntil: Date;
    totalUsageLimit?: number;
    perCustomerUsageLimit?: number;
    branchId?: string;
    packageIds: string[];
  }> = [
    {
      key: 'welcome-10',
      code: 'WELCOME10',
      name: 'Welcome 10%',
      status: 'ACTIVE' as const,
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      description: 'Diskon perkenalan untuk satu transaksi customer.',
      perCustomerUsageLimit: 1,
      activeFrom: ctx.at(-30),
      activeUntil: ctx.at(60),
      packageIds,
    },
    {
      key: 'reformer-150k',
      code: 'REFORMER150',
      name: 'Reformer hemat Rp150.000',
      status: 'ACTIVE' as const,
      discountType: 'FIXED_AMOUNT' as const,
      discountValue: 150_000,
      activeFrom: ctx.at(-10),
      activeUntil: ctx.at(30),
      packageIds: packageIds.slice(0, 2),
    },
    {
      key: 'bsd-special',
      code: 'BSDPILATES',
      name: 'Promo studio BSD',
      status: 'ACTIVE' as const,
      discountType: 'PERCENTAGE' as const,
      discountValue: 15,
      activeFrom: ctx.at(-10),
      activeUntil: ctx.at(20),
      branchId: master.branches['DD-BSD'],
      packageIds: [],
    },
    {
      key: 'minimum-order',
      code: 'HEMAT100',
      name: 'Hemat Rp100.000',
      status: 'ACTIVE' as const,
      discountType: 'FIXED_AMOUNT' as const,
      discountValue: 100_000,
      minimumPurchaseRp: 1_000_000,
      activeFrom: ctx.at(-5),
      activeUntil: ctx.at(45),
      packageIds: [],
    },
    {
      key: 'expired',
      code: 'EXPIRED2025',
      name: 'Voucher kedaluwarsa',
      status: 'EXPIRED' as const,
      discountType: 'PERCENTAGE' as const,
      discountValue: 20,
      activeFrom: ctx.at(-400),
      activeUntil: ctx.at(-200),
      packageIds: [],
    },
    {
      key: 'paused',
      code: 'PAUSED2026',
      name: 'Voucher dijeda',
      status: 'PAUSED' as const,
      discountType: 'FIXED_AMOUNT' as const,
      discountValue: 50_000,
      activeFrom: ctx.at(-5),
      activeUntil: ctx.at(20),
      packageIds: [],
    },
    {
      key: 'exhausted',
      code: 'SOLDOUT10',
      name: 'Voucher kuota habis',
      status: 'EXHAUSTED' as const,
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      activeFrom: ctx.at(-5),
      activeUntil: ctx.at(20),
      totalUsageLimit: 1,
      packageIds: [],
    },
  ];
  for (const item of definitions) {
    const voucherId = ctx.id('voucher', item.key);
    await ctx.db.voucher.upsert({
      where: { id: voucherId },
      update: {
        code: item.code,
        name: item.name,
        status: item.status,
        discountType: item.discountType,
        discountValue: item.discountValue,
        description: item.description ?? null,
        maxDiscountRp: item.maxDiscountRp ?? null,
        minimumPurchaseRp: item.minimumPurchaseRp ?? 0,
        activeFrom: item.activeFrom,
        activeUntil: item.activeUntil,
        branchId: item.branchId ?? null,
        totalUsageLimit: item.totalUsageLimit ?? null,
        perCustomerUsageLimit: item.perCustomerUsageLimit ?? null,
      },
      create: {
        id: voucherId,
        code: item.code,
        name: item.name,
        status: item.status,
        discountType: item.discountType,
        discountValue: item.discountValue,
        description: item.description ?? null,
        maxDiscountRp: item.maxDiscountRp ?? null,
        minimumPurchaseRp: item.minimumPurchaseRp ?? 0,
        activeFrom: item.activeFrom,
        activeUntil: item.activeUntil,
        branchId: item.branchId ?? null,
        totalUsageLimit: item.totalUsageLimit ?? null,
        perCustomerUsageLimit: item.perCustomerUsageLimit ?? null,
        createdById: creatorId,
      },
    });
    for (const packageId of item.packageIds) {
      await ctx.db.voucherPackageScope.upsert({
        where: { voucherId_packageId: { voucherId, packageId } },
        update: {},
        create: { id: ctx.id('voucher-scope', `${item.key}:${packageId}`), voucherId, packageId },
      });
    }
  }
}

export async function seedVoucherRedemptionFixture(
  ctx: SeedContext,
  users: Record<string, string>,
) {
  if (ctx.profile === 'minimal') return;
  const voucherId = ctx.id('voucher', 'welcome-10');
  const purchaseId = ctx.id('purchase', 'approved');
  const customerUserId = users.customer;
  if (!customerUserId) return;
  const purchase = await ctx.db.purchase.findUnique({
    where: { id: purchaseId },
    select: { priceRpSnapshot: true, paymentUniqueCode: true },
  });
  if (!purchase) return;
  const discountRp = Math.floor(purchase.priceRpSnapshot * 0.1);
  const netRp = purchase.priceRpSnapshot - discountRp;
  await ctx.db.purchase.update({
    where: { id: purchaseId },
    data: {
      voucherId,
      voucherCodeSnapshot: 'WELCOME10',
      voucherDiscountTypeSnapshot: 'PERCENTAGE',
      voucherDiscountValueSnapshot: 10,
      voucherDiscountRpSnapshot: discountRp,
      priceAfterDiscountRpSnapshot: netRp,
      payableAmountRpSnapshot: netRp + (purchase.paymentUniqueCode ?? 0),
    },
  });
  await ctx.db.voucherRedemption.upsert({
    where: { purchaseId },
    update: { voucherId, customerUserId, discountRp, releasedAt: null },
    create: {
      id: ctx.id('voucher-redemption', 'welcome-approved'),
      voucherId,
      purchaseId,
      customerUserId,
      discountRp,
    },
  });
  await ctx.db.customerPackage.updateMany({
    where: { purchaseId },
    data: { salePriceRp: netRp },
  });
}
