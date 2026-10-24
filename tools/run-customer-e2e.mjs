import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const repositoryRoot = resolve(import.meta.dirname, '..');
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL wajib tersedia untuk customer full-stack E2E.');

const database = new URL(databaseUrl);
if (database.protocol !== 'mysql:')
  throw new Error('Customer full-stack E2E hanya mendukung MySQL.');
if ((process.env.PAYMENT_PROOF_SCAN_DRIVER ?? 'synthetic') !== 'synthetic') {
  throw new Error('Development customer E2E mewajibkan PAYMENT_PROOF_SCAN_DRIVER=synthetic.');
}
const mysqlClientDirectory = process.env.DD_NATIVE_MYSQL_CLIENT_DIR?.trim();
const mysqlExecutable = (name) =>
  mysqlClientDirectory ? resolve(mysqlClientDirectory, name) : name;

const privateRoot = resolve(
  repositoryRoot,
  process.env.PRIVATE_UPLOAD_ROOT?.trim() || 'apps/api/.local-data/private',
);
mkdirSync(privateRoot, { recursive: true, mode: 0o700 });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const apiPort = process.env.DD_CUSTOMER_E2E_API_PORT?.trim() || '32131';
const webPort = process.env.DD_PLAYWRIGHT_PORT?.trim() || '3030';
if (![apiPort, webPort].every((port) => /^\d{4,5}$/u.test(port))) {
  throw new Error('Port API/Web customer E2E harus berupa angka TCP yang valid.');
}
const runId =
  process.env.DD_CUSTOMER_E2E_RUN_ID?.trim() ||
  `customer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
if (!/^[a-zA-Z0-9_-]{1,80}$/.test(runId)) {
  throw new Error('DD_CUSTOMER_E2E_RUN_ID harus berupa identifier lokal yang aman.');
}
const webBuildPath = resolve(repositoryRoot, 'apps/web/.next-customer-runs', runId);
const webTsconfigName = `tsconfig.customer-e2e.${runId}.json`;
const webTsconfigPath = resolve(repositoryRoot, 'apps/web', webTsconfigName);
const webNextEnvPath = resolve(repositoryRoot, 'apps/web/next-env.d.ts');
const originalWebNextEnv = readFileSync(webNextEnvPath, 'utf8');
copyFileSync(resolve(repositoryRoot, 'apps/web/tsconfig.json'), webTsconfigPath);
const backupPath = `/private/tmp/dailydose-customer-e2e-${stamp}.sql`;
const reportPath = `/private/tmp/dailydose-customer-e2e-${stamp}.json`;

function mysqlArgs() {
  return [
    '-h',
    database.hostname,
    '-P',
    database.port || '3306',
    '-u',
    decodeURIComponent(database.username),
    database.pathname.slice(1),
  ];
}

function mysqlConnectionArgs() {
  return mysqlArgs().slice(0, -1);
}

const mysqlEnvironment = {
  ...process.env,
  MYSQL_PWD: decodeURIComponent(database.password),
};

function backupDatabase() {
  const descriptor = openSync(backupPath, 'wx', 0o600);
  const result = spawnSync(
    mysqlExecutable('mysqldump'),
    [
      '--single-transaction',
      '--quick',
      '--skip-lock-tables',
      '--no-tablespaces',
      '--set-gtid-purged=OFF',
      ...mysqlArgs(),
    ],
    { cwd: repositoryRoot, env: mysqlEnvironment, stdio: ['ignore', descriptor, 'inherit'] },
  );
  closeSync(descriptor);
  if (result.status !== 0 || !existsSync(backupPath) || statSync(backupPath).size === 0) {
    throw new Error('Backup database E2E gagal atau kosong.');
  }
}

function databaseCounts() {
  const tables = {
    user: 'User',
    purchase: 'Purchase',
    paymentProof: 'PaymentProof',
    package: 'Package',
    ledgerEntry: 'LedgerEntry',
    booking: 'Booking',
    reschedule: 'Reschedule',
    notification: 'UserNotification',
    audit: 'AuditLog',
  };
  const query = Object.entries(tables)
    .map(([label, table]) => `SELECT '${label}', COUNT(*) FROM \`${table}\``)
    .join(' UNION ALL ');
  const result = spawnSync(
    mysqlExecutable('mysql'),
    [
      ...mysqlConnectionArgs(),
      '--batch',
      '--skip-column-names',
      '-e',
      query,
      database.pathname.slice(1),
    ],
    {
      cwd: repositoryRoot,
      env: mysqlEnvironment,
      encoding: 'utf8',
    },
  );
  if (result.status !== 0) throw new Error(result.stderr || 'Tidak dapat membaca baseline MySQL.');
  return Object.fromEntries(
    result.stdout
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [name, count] = line.split('\t');
        return [name, Number(count)];
      }),
  );
}

function terminate(child, processGroup = false) {
  if (!child?.pid) return;
  const signal = (name) => {
    try {
      if (processGroup && process.platform !== 'win32') process.kill(-child.pid, name);
      else child.kill(name);
    } catch (error) {
      if (error?.code !== 'ESRCH') throw error;
    }
  };
  signal('SIGTERM');
  setTimeout(() => {
    try {
      signal('SIGKILL');
    } catch {
      // The process tree already exited between the TERM and KILL checks.
    }
  }, 5_000).unref();
}

function waitForChild(child) {
  return new Promise((resolveWait, rejectWait) => {
    child.once('error', rejectWait);
    child.once('exit', (code, signal) => resolveWait({ code, signal }));
  });
}

backupDatabase();
const baseline = databaseCounts();
const prepared = spawnSync(
  'node',
  ['--import', './apps/api/node_modules/tsx/dist/loader.mjs', 'tools/prepare-customer-e2e.ts'],
  {
    cwd: repositoryRoot,
    env: { ...process.env, DD_CUSTOMER_E2E_RUN_ID: runId },
    encoding: 'utf8',
  },
);
if (prepared.status !== 0) throw new Error(prepared.stderr || 'Fixture jadwal E2E gagal dibuat.');
const fixture = JSON.parse(prepared.stdout);
let playwrightProcess;
let interruptedSignal;
const cleanup = () => {
  terminate(playwrightProcess, true);
};
const interrupt = (signal) => {
  interruptedSignal = signal;
  cleanup();
};
process.once('SIGINT', () => interrupt('SIGINT'));
process.once('SIGTERM', () => interrupt('SIGTERM'));

if (worker || notificationProjection)
  await new Promise((resolveWait) => setTimeout(resolveWait, 2_500));

const playwrightEnvironment = {
  ...process.env,
  DD_CUSTOMER_E2E_RUN_ID: runId,
  DD_CUSTOMER_E2E_SLOT_ID: fixture.slotId,
  DD_CUSTOMER_E2E_TARGET_SLOT_ID: fixture.targetSlotId,
  DD_CUSTOMER_E2E_TARGET_START_AT: fixture.targetStartAt,
  DD_CUSTOMER_E2E_CHECK_IN_SLOT_ID: fixture.checkInSlotId,
  DD_CUSTOMER_E2E_BRANCH_ID: fixture.branchId,
  DD_CUSTOMER_E2E_BRANCH_NAME: fixture.branchName,
  DD_CUSTOMER_FULLSTACK: 'true',
  DD_PLAYWRIGHT_PORT: webPort,
  API_BASE_URL: `http://127.0.0.1:${apiPort}`,
  PORT: apiPort,
  DD_PLAYWRIGHT_REUSE_SERVER: 'false',
  NEXT_TYPESCRIPT_CONFIG: webTsconfigName,
};
const startedAt = Date.now();
playwrightProcess = spawn(
  'pnpm',
  [
    '--filter',
    '@dailydose/web',
    'exec',
    'playwright',
    'test',
    'e2e/customer-fullstack.spec.ts',
    '--grep',
    '@customer-fullstack',
  ],
  {
    cwd: repositoryRoot,
    env: playwrightEnvironment,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
  },
);
const playwright = await waitForChild(playwrightProcess);
cleanup();
writeFileSync(webNextEnvPath, originalWebNextEnv);
if (process.env.DD_NATIVE_MYSQL_KEEP_RUN !== 'true') {
  rmSync(webBuildPath, { recursive: true, force: true });
  rmSync(webTsconfigPath, { force: true });
}

const fixtureCleanup = spawnSync(
  'node',
  ['--import', './apps/api/node_modules/tsx/dist/loader.mjs', 'tools/prepare-customer-e2e.ts'],
  {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      DD_CUSTOMER_E2E_RUN_ID: runId,
      DD_CUSTOMER_E2E_CLEANUP: 'true',
    },
    encoding: 'utf8',
  },
);

const after = databaseCounts();
const report = {
  runId,
  fixture,
  startedAt: new Date(startedAt).toISOString(),
  finishedAt: new Date().toISOString(),
  durationMs: Date.now() - startedAt,
  backupPath,
  backupBytes: statSync(backupPath).size,
  privateStorageConfigured: true,
  scanner: 'synthetic',
  baseline,
  after,
  delta: Object.fromEntries(
    Object.keys(after).map((key) => [key, (after[key] ?? 0) - (baseline[key] ?? 0)]),
  ),
  exitCode: interruptedSignal
    ? interruptedSignal === 'SIGINT'
      ? 130
      : 143
    : (playwright.code ?? 1),
  interruptedSignal: interruptedSignal ?? null,
  fixtureCleanup: fixtureCleanup.status === 0 ? 'completed' : fixtureCleanup.stderr || 'failed',
};
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
console.log(`Customer E2E report: ${reportPath}`);
console.log(`Customer E2E backup: ${backupPath}`);
process.exit(report.exitCode);
