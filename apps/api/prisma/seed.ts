import { PrismaClient } from '@prisma/client';
import { assertSeedAllowed, createSeedContext, resolveProfile } from './seed/context';
import { runSeedProfile } from './seed/profiles';

async function main() {
  const profile = resolveProfile();
  assertSeedAllowed(profile);
  const db = new PrismaClient();
  try {
    const result = await runSeedProfile(createSeedContext(db, profile));
    console.info(`Seed complete: profile=${result.profile}, users=${result.users}, branches=${result.branches}, classTypes=${result.classTypes}, packages=${result.packages}, volumeRecords=${result.volumeRecords}.`);
  } finally {
    await db.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Seed failed.');
  process.exitCode = 1;
});
