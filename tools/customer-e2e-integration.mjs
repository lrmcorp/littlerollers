import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
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
    `customer_${new Date().toISOString().replace(/\D/gu, '').slice(0, 14)}_${process.pid}`,
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

async function reservePort() {
  const server = createServer();
  await new Promise((resolveReady, rejectReady) => {
    server.once('error', rejectReady);
    server.listen(0, '127.0.0.1', resolveReady);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('CUSTOMER_E2E_PORT_UNAVAILABLE');
  await new Promise((resolveClose) => server.close(resolveClose));
  return address.port;
}

if (cleanupMode) {
  if (!requestedRunId) throw new Error('RUN_ID_REQUIRED');
  await cleanupNativeMySqlRuntime(runId);
  process.exit(0);
}

const [apiPort, webPort] = await Promise.all([reservePort(), reservePort()]);
const evidenceDirectory = resolve(evidenceRoot, runId);
const privateRoot = resolve(evidenceDirectory, 'private');
await mkdir(privateRoot, { recursive: true });
let mysqlRuntime;
let status = 'FAILED';
let exitCode = 1;
let migrationCount = 0;
let interruptedSignal;
const startedAt = new Date().toISOString();

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
    PRIVATE_UPLOAD_ROOT: privateRoot,
    PAYMENT_PROOF_SCAN_DRIVER: 'synthetic',
    PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT: 'CLEAN',
    DD_CUSTOMER_E2E_RUN_ID: runId,
    DD_CUSTOMER_E2E_API_PORT: String(apiPort),
    DD_PLAYWRIGHT_PORT: String(webPort),
    DD_NATIVE_MYSQL_CLIENT_DIR: mysqlRuntime.binaryDirectory,
  };
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
  if (migrated.code !== 0) throw new Error('CUSTOMER_E2E_MIGRATION_FAILED');
  migrationCount = Number(
    await mysqlRuntime.query(
      `SELECT COUNT(*) FROM \`${mysqlRuntime.database}\`.\`_prisma_migrations\` WHERE \`finished_at\` IS NOT NULL`,
    ),
  );
  const seeded = await run(
    'node',
    ['--import', './apps/api/node_modules/tsx/dist/loader.mjs', 'apps/api/prisma/seed.ts'],
    { env: { ...environment, SEED_PROFILE: 'demo' } },
  );
  if (seeded.code !== 0) throw new Error('CUSTOMER_E2E_SEED_FAILED');
  const tested = await run('node', ['tools/run-customer-e2e.mjs'], { env: environment });
  exitCode = tested.code;
  if (tested.code !== 0) throw new Error('CUSTOMER_E2E_FAILED');
  status = 'PASSED';
} finally {
  const fixtureChecksum = createHash('sha256')
    .update(await readFile(resolve(root, 'apps/api/prisma/seed.ts')))
    .update(await readFile(resolve(root, 'tools/prepare-customer-e2e.ts')))
    .digest('hex');
  await writeFile(
    resolve(evidenceDirectory, 'customer-e2e.json'),
    `${JSON.stringify(
      {
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
        apiPort,
        webPort,
        redisConfigured: false,
        workerStarted: false,
        exitCode,
        interruptedSignal: interruptedSignal ?? null,
      },
      null,
      2,
    )}\n`,
  );
  await mysqlRuntime?.stop({ keep });
  if (mysqlRuntime && keep)
    process.stderr.write(`[customer-e2e] runtime evidence retained for run ${runId}\n`);
}

if (interruptedSignal) process.exit(interruptedSignal === 'SIGINT' ? 130 : 143);
if (status !== 'PASSED') process.exit(1);
