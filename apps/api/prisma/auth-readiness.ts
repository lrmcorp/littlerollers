import { PrismaClient } from '@prisma/client';
import { canonicalEmailHash } from '../src/identity/credential-security';

type HashAlgorithm = 'ARGON2ID' | 'BCRYPT' | 'UNSUPPORTED';

function hashAlgorithm(value: string): HashAlgorithm {
  if (value.startsWith('$argon2id$')) return 'ARGON2ID';
  if (/^\$2[aby]\$/u.test(value)) return 'BCRYPT';
  return 'UNSUPPORTED';
}

function argument(name: string): string | null {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1]?.trim() : undefined;
  return value || null;
}

const db = new PrismaClient();

async function main() {
  const syntheticFallback =
    process.env.NODE_ENV !== 'production' && process.env.AUTH_SYNTHETIC_ENABLED === 'true';
  const accessTtlReady = Boolean(process.env.AUTH_ACCESS_TTL_SECONDS?.trim()) || syntheticFallback;
  const refreshTtlReady = Boolean(process.env.AUTH_REFRESH_TTL_SECONDS?.trim()) || syntheticFallback;
  const email = argument('--email');

  const [users, activeUsers, historicalUsers, credentials, activePasswordIdentities, sourceMappings] =
    await Promise.all([
      db.user.count(),
      db.user.count({ where: { status: 'ACTIVE' } }),
      db.user.count({ where: { historical: true } }),
      db.passwordCredential.findMany({ select: { userId: true, passwordHash: true } }),
      db.identity.findMany({
        where: { provider: 'EMAIL_PASSWORD', user: { status: 'ACTIVE', historical: false } },
        select: { userId: true },
      }),
      db.migrationSourceKey.count({ where: { targetType: 'PasswordCredential' } }),
    ]);

  const algorithmTotals = credentials.reduce<Record<HashAlgorithm, number>>(
    (totals, credential) => {
      totals[hashAlgorithm(credential.passwordHash)] += 1;
      return totals;
    },
    { ARGON2ID: 0, BCRYPT: 0, UNSUPPORTED: 0 },
  );
  const credentialUsers = new Set(credentials.map(({ userId }) => userId));
  const activePasswordUsers = new Set(activePasswordIdentities.map(({ userId }) => userId));
  const activeMissingCredentials = [...activePasswordUsers].filter(
    (userId) => !credentialUsers.has(userId),
  ).length;

  const selected = email
    ? await db.passwordCredential.findUnique({
        where: { emailHash: canonicalEmailHash(email) },
        select: {
          passwordHash: true,
          user: { select: { status: true, historical: true } },
        },
      })
    : null;

  const blockers = [
    ...(process.env.AUTH_PASSWORD_ENABLED === 'true' ? [] : ['AUTH_PASSWORD_DISABLED']),
    ...(accessTtlReady ? [] : ['AUTH_ACCESS_TTL_CONFIGURATION_REQUIRED']),
    ...(refreshTtlReady ? [] : ['AUTH_REFRESH_TTL_CONFIGURATION_REQUIRED']),
    ...(activeMissingCredentials === 0 ? [] : ['ACTIVE_USERS_MISSING_CREDENTIALS']),
    ...(algorithmTotals.UNSUPPORTED === 0 ? [] : ['UNSUPPORTED_PASSWORD_HASH']),
    ...(email && !selected ? ['SELECTED_ACCOUNT_CREDENTIAL_MISSING'] : []),
    ...(selected && (selected.user.status !== 'ACTIVE' || selected.user.historical)
      ? ['SELECTED_ACCOUNT_NOT_ACTIVE']
      : []),
  ];

  const report = {
    ready: blockers.length === 0,
    blockers,
    configuration: {
      passwordEnabled: process.env.AUTH_PASSWORD_ENABLED === 'true',
      syntheticFallback,
      accessTtlReady,
      refreshTtlReady,
    },
    database: {
      schemaReachable: true,
      users,
      activeUsers,
      historicalUsers,
      passwordCredentials: credentials.length,
      activePasswordIdentities: activePasswordUsers.size,
      activeMissingCredentials,
      sourceCredentialMappings: sourceMappings,
      hashAlgorithms: algorithmTotals,
    },
    selectedAccount: email
      ? {
          requested: true,
          credentialFound: Boolean(selected),
          userActive: selected?.user.status === 'ACTIVE' && !selected.user.historical,
          hashAlgorithm: selected ? hashAlgorithm(selected.passwordHash) : null,
        }
      : { requested: false },
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.ready) process.exitCode = 1;
}

main()
  .catch((error: unknown) => {
    const code =
      typeof error === 'object' && error && 'code' in error && typeof error.code === 'string'
        ? error.code
        : 'DATABASE_OR_SCHEMA_UNAVAILABLE';
    console.error(
      JSON.stringify({
        ready: false,
        blockers: [code],
        database: { schemaReachable: false },
      }),
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
