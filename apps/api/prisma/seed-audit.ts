import { PrismaClient } from '@prisma/client';
import { canonicalEmailHash } from '../src/identity/credential-security';
import { assertSeedAllowed, deterministicId } from './seed/context';
import { demoUsers } from './seed/identities';

interface ResidualAccount {
  id: string;
  displayName: string;
  status: string;
  reasons: string[];
}

async function main() {
  assertSeedAllowed('demo');
  const cleanup = process.argv.includes('--deactivate-residual');
  const db = new PrismaClient();
  try {
    const expected = new Map(
      demoUsers.map((item) => [deterministicId('user', item.key), item] as const),
    );
    const demoNames = [...new Set(demoUsers.map((item) => item.name))];
    const demoEmailHashes = demoUsers.map((item) => canonicalEmailHash(item.email));
    const candidates = await db.user.findMany({
      where: {
        OR: [
          { displayName: { in: demoNames } },
          { passwordCredential: { emailHash: { in: demoEmailHashes } } },
        ],
      },
      include: {
        passwordCredential: { select: { emailHash: true } },
      },
      orderBy: { id: 'asc' },
    });
    const expectedByEmail = new Map(
      demoUsers.map((item) => [canonicalEmailHash(item.email), deterministicId('user', item.key)]),
    );
    const residuals: ResidualAccount[] = candidates.flatMap((user) => {
      const reasons: string[] = [];
      const expectedNameIds = demoUsers
        .filter((item) => item.name === user.displayName)
        .map((item) => deterministicId('user', item.key));
      if (expectedNameIds.length && !expectedNameIds.includes(user.id))
        reasons.push('DEMO_NAME_WITH_NONDETERMINISTIC_ID');
      const expectedCredentialId = user.passwordCredential
        ? expectedByEmail.get(user.passwordCredential.emailHash)
        : undefined;
      if (expectedCredentialId && expectedCredentialId !== user.id)
        reasons.push('DEMO_CREDENTIAL_ON_UNEXPECTED_USER');
      return reasons.length
        ? [{ id: user.id, displayName: user.displayName, status: user.status, reasons }]
        : [];
    });

    if (cleanup && residuals.length) {
      const ids = residuals.map(({ id }) => id);
      await db.$transaction([
        db.user.updateMany({
          where: { id: { in: ids }, status: { not: 'INACTIVE' } },
          data: { status: 'INACTIVE', version: { increment: 1 } },
        }),
        db.userSession.updateMany({
          where: { userId: { in: ids }, revokedAt: null },
          data: { revokedAt: new Date(), revocationReason: 'DEMO_RESIDUE_DEACTIVATED' },
        }),
      ]);
    }

    console.info(
      JSON.stringify({
        mode: cleanup ? 'DEACTIVATE' : 'REPORT',
        expectedAccounts: expected.size,
        residualCount: residuals.length,
        residuals,
      }),
    );
  } finally {
    await db.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Demo account audit failed.');
  process.exitCode = 1;
});
