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

export async function runSeedProfile(ctx: SeedContext) {
  const catalog = await seedBranchCatalog(ctx);
  const users = await seedIdentities(ctx, catalog.branches);
  const instructorsByBranch = resolveInstructorIdsByBranch(users);
  await seedInstructorAvailability(ctx, users, catalog.branches);
  const master = await seedCommercialMaster(ctx, catalog, instructorsByBranch);
  if (ctx.profile !== 'minimal') await seedIdentityVerificationFixtures(ctx, users);
  if (ctx.profile !== 'minimal') await seedOperationalScenarios(ctx, master, users);
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
