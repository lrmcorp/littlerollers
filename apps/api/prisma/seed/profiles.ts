import type { SeedContext } from './context';
import { seedIdentities } from './identities';
import { seedBranchCatalog, seedCommercialMaster } from './master-data';
import { seedOperationalScenarios, seedVolume } from './scenarios';
import { seedIdentityVerificationFixtures } from './verification';
import { seedNotifications } from './notifications';
import {
  resolveInstructorIdsByBranch,
  seedInstructorAvailability,
} from './instructors';
import { seedAccessControl } from './access-control';
import { seedVoucherRedemptionFixture, seedVouchers } from './vouchers';
import {
  seedPackagePromotionOrderFixtures,
  seedPackagePromotions,
} from './package-promotions';

export async function runSeedProfile(ctx: SeedContext) {
  await seedAccessControl(ctx);
  const catalog = await seedBranchCatalog(ctx);
  const users = await seedIdentities(ctx, catalog.branches);
  const instructorsByBranch = resolveInstructorIdsByBranch(users);
  await seedInstructorAvailability(ctx, users, catalog.branches);
  const master = await seedCommercialMaster(ctx, catalog, instructorsByBranch);
  await seedPackagePromotions(ctx, master, users);
  await seedVouchers(ctx, master, users);
  if (ctx.profile !== 'minimal') await seedIdentityVerificationFixtures(ctx, users);
  if (ctx.profile !== 'minimal') await seedOperationalScenarios(ctx, master, users);
  if (ctx.profile !== 'minimal') await seedVoucherRedemptionFixture(ctx, users);
  if (ctx.profile !== 'minimal') await seedPackagePromotionOrderFixtures(ctx);
  if (ctx.profile !== 'minimal') await seedNotifications(ctx, users, master.branches);
  if (ctx.profile === 'volume') await seedVolume(ctx, master, users, 500);
  return {
    profile: ctx.profile,
    branches: Object.keys(master.branches).length,
    classTypes: Object.keys(master.classTypes).length,
    packages: Object.keys(master.packages).length,
    users: Object.keys(users).length,
    volumeRecords: ctx.profile === 'volume' ? 500 : 0,
  };
}
