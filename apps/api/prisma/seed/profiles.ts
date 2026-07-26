import type { SeedContext } from './context';
import { seedIdentities } from './identities';
import { seedMasterData } from './master-data';
import { seedOperationalScenarios, seedVolume } from './scenarios';

export async function runSeedProfile(ctx: SeedContext) {
  const instructorId = ctx.id('user', 'instructor');
  const master = await seedMasterData(ctx, instructorId);
  const users = await seedIdentities(ctx, master.branches);
  if (ctx.profile !== 'minimal') await seedOperationalScenarios(ctx, master, users);
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
