import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  cleanupNativeMySqlRuntime,
  databaseNameForRun,
  startNativeMySqlRuntime,
  validateRunId,
} from './native-mysql-harness.mjs';

const root = resolve(import.meta.dirname, '..');
const evidenceRoot = resolve(root, '.integration-evidence');
const args = process.argv.slice(2);
const cleanupMode = args[0] === 'cleanup';
const keep = args.includes('--keep') || process.env.DD_NATIVE_MYSQL_KEEP_RUN === 'true';
const runIdArgument = args.findIndex((value) => value === '--run-id');
const requestedRunId =
  runIdArgument >= 0 ? args[runIdArgument + 1] : process.env.DD_NATIVE_MYSQL_RUN_ID?.trim();
const runId = validateRunId(
  requestedRunId ??
    `api_${new Date().toISOString().replace(/\D/gu, '').slice(0, 14)}_${process.pid}`,
);

let activeChild;
function run(command, commandArgs, options = {}) {
  return new Promise((resolveResult, rejectResult) => {
    const child = spawn(command, commandArgs, {
      cwd: root,
      env: { ...process.env, ...options.env },
      stdio: 'inherit',
    });
    activeChild = child;
    child.once('error', rejectResult);
    child.once('exit', (code, signal) => {
      if (activeChild === child) activeChild = undefined;
      resolveResult({ code: code ?? 1, signal });
    });
  });
}

if (cleanupMode) {
  if (!requestedRunId) throw new Error('RUN_ID_REQUIRED');
  await cleanupNativeMySqlRuntime(runId);
  process.exit(0);
}

const evidenceDirectory = resolve(evidenceRoot, runId);
await mkdir(evidenceDirectory, { recursive: true });
const startedAt = new Date().toISOString();
let status = 'FAILED';
let testExitCode = 1;
let migrationCount = 0;
let mysqlRuntime;
let interruptedSignal;

const interrupt = (signal) => {
  interruptedSignal = signal;
  activeChild?.kill('SIGTERM');
};
process.once('SIGINT', () => interrupt('SIGINT'));
process.once('SIGTERM', () => interrupt('SIGTERM'));

try {
  mysqlRuntime = await startNativeMySqlRuntime(runId, { keep });
  const environment = {
    DATABASE_URL: mysqlRuntime.databaseUrl,
    NODE_ENV: 'test',
    REDIS_URL: '',
    PRIVATE_UPLOAD_ROOT: resolve(evidenceDirectory, 'private'),
    PAYMENT_PROOF_SCAN_DRIVER: 'synthetic',
    PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT: 'CLEAN',
  };
  await mkdir(environment.PRIVATE_UPLOAD_ROOT, { recursive: true });
  const migrated = await run(
    'pnpm',
    [
      '--dir',
      'apps/api',
      'exec',
      'prisma',
      'migrate',
      'deploy',
      '--schema',
      'prisma/schema.prisma',
    ],
    { env: environment },
  );
  if (migrated.code !== 0) throw new Error('INTEGRATION_PRISMA_MIGRATION_FAILED');
  migrationCount = Number(
    await mysqlRuntime.query(
      `SELECT COUNT(*) FROM \`${mysqlRuntime.database}\`.\`_prisma_migrations\` WHERE \`finished_at\` IS NOT NULL`,
    ),
  );
  const tested = await run(
    'pnpm',
    [
      '--dir',
      'apps/api',
      'exec',
      'jest',
      '--runInBand',
      '--testPathPatterns=integration\\.spec\\.ts$',
    ],
    { env: environment },
  );
  testExitCode = tested.code;
  if (tested.code !== 0) throw new Error('INTEGRATION_TESTS_FAILED');
  status = 'PASSED';
} finally {
  const fixtureChecksum = createHash('sha256')
    .update(await readFile(resolve(root, 'apps/api/prisma/seed.ts')))
    .digest('hex');
  const evidence = {
    runId,
    status,
    startedAt,
    completedAt: new Date().toISOString(),
    mysql: {
      version: mysqlRuntime?.version ?? 'unavailable',
      host: mysqlRuntime?.host ?? 'local',
      port: mysqlRuntime?.port ?? null,
      database: mysqlRuntime?.database ?? databaseNameForRun(runId),
      execution: 'native-ephemeral',
      gtidMode: mysqlRuntime?.gtidMode ?? 'unavailable',
      binlogFormat: mysqlRuntime?.binlogFormat ?? 'unavailable',
      binlogRowImage: mysqlRuntime?.binlogRowImage ?? 'unavailable',
    },
    migrationCount,
    fixtureChecksum,
    redisConfigured: false,
    testExitCode,
    interruptedSignal: interruptedSignal ?? null,
  };
  await writeFile(
    resolve(evidenceDirectory, 'evidence.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
  await mysqlRuntime?.stop({ keep });
  if (mysqlRuntime && keep)
    process.stderr.write(`[api-integration] runtime evidence retained for run ${runId}\n`);
}

if (interruptedSignal) process.exit(interruptedSignal === 'SIGINT' ? 130 : 143);
if (status !== 'PASSED') process.exit(1);
