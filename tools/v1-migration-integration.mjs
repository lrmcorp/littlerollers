import { createHash, randomBytes } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { basename, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { syntheticV1FixtureSql } from './v1-migration-integration-fixture.mjs';

const repositoryRoot = resolve(import.meta.dirname, '..');
const composeFile = join(repositoryRoot, 'infra/migration/docker-compose.yml');
const runsRoot = join(repositoryRoot, '.migration-integration', 'runs');
const keep = process.argv.includes('--keep');
const cleanup = process.argv[2] === 'cleanup';
const runIdArgument = process.argv.indexOf('--run-id');
const requestedRunId = runIdArgument >= 0 ? process.argv[runIdArgument + 1] : undefined;

function safeRunId(value) {
  if (!value || !/^[a-z0-9][a-z0-9_-]{2,48}$/u.test(value)) throw new Error('RUN_ID_INVALID');
  return value;
}

function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: repositoryRoot,
      env: options.env ?? process.env,
      stdio: options.capture ? ['pipe', 'pipe', 'pipe'] : ['pipe', 'inherit', 'inherit'],
    });
    const stdout = [];
    const stderr = [];
    child.stdout?.on('data', (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr?.on('data', (chunk) => stderr.push(Buffer.from(chunk)));
    if (options.input) child.stdin.end(options.input);
    else child.stdin.end();
    child.on('error', rejectRun);
    child.on('exit', (code) => {
      const result = {
        code,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
      };
      if (code === 0) resolveRun(result);
      else
        rejectRun(Object.assign(new Error(`COMMAND_FAILED:${basename(command)}:${code}`), result));
    });
  });
}

async function freePort() {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();
    server.unref();
    server.once('error', rejectPort);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => resolvePort(port));
    });
  });
}

async function compose(project, env, ...args) {
  return run('docker', ['compose', '-p', project, '-f', composeFile, ...args], { env });
}

async function readEvidenceText(directory) {
  const chunks = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) chunks.push(await readEvidenceText(path));
    else if (entry.isFile()) chunks.push(await readFile(path, 'utf8'));
  }
  return chunks.join('\n');
}

async function removeRun(runId) {
  const directory = join(runsRoot, safeRunId(runId));
  const state = JSON.parse(await readFile(join(directory, 'run.json'), 'utf8'));
  await compose(
    state.project,
    {
      ...process.env,
      ...state.composeEnvironment,
      MIGRATION_PRIVATE_ROOT: join(directory, 'private'),
    },
    'down',
    '--volumes',
    '--remove-orphans',
  );
  await rm(directory, { recursive: true, force: true });
}

if (cleanup) {
  await removeRun(requestedRunId);
  process.stdout.write(`${JSON.stringify({ cleaned: requestedRunId })}\n`);
  process.exit(0);
}

const runId = safeRunId(
  requestedRunId ??
    `mig_${new Date().toISOString().replace(/\D/gu, '').slice(0, 14)}_${randomBytes(3).toString('hex')}`,
);
const project = `ddmig_${runId.replaceAll('-', '_')}`.slice(0, 60);
const runDirectory = join(runsRoot, runId);
const evidenceDirectory = join(runDirectory, 'evidence');
const rehearsalDirectory = join(runDirectory, 'rehearsal-1');
const operatorEvidenceDirectory = join(rehearsalDirectory, 'final-evidence');
const rehearsalEnvPath = join(runDirectory, 'rehearsal-1.env');
const privateRoot = join(runDirectory, 'private');
const spoolDirectory = join(runDirectory, 'spool');
await Promise.all([
  mkdir(evidenceDirectory, { recursive: true }),
  mkdir(join(privateRoot, 'v1-compat/private'), { recursive: true }),
  mkdir(spoolDirectory, { recursive: true }),
]);
const sourcePort = await freePort();
const targetPort = await freePort();
const composeEnvironment = {
  MIGRATION_SOURCE_PORT: String(sourcePort),
  MIGRATION_TARGET_PORT: String(targetPort),
  MIGRATION_PRIVATE_ROOT: privateRoot,
};
const persistedComposeEnvironment = {
  MIGRATION_SOURCE_PORT: composeEnvironment.MIGRATION_SOURCE_PORT,
  MIGRATION_TARGET_PORT: composeEnvironment.MIGRATION_TARGET_PORT,
};
await writeFile(
  join(runDirectory, 'run.json'),
  `${JSON.stringify({ runId, project, composeEnvironment: persistedComposeEnvironment, status: 'STARTING' }, null, 2)}\n`,
  { mode: 0o600 },
);

const sourceUrl = `mysql://migration_readonly:synthetic_readonly@127.0.0.1:${sourcePort}/dailydose_v1_fixture`;
const captureUrl = `mysql://migration_capture:synthetic_capture@127.0.0.1:${sourcePort}/dailydose_v1_fixture`;
const rollbackUrl = `mysql://migration_rollback:synthetic_rollback@127.0.0.1:${sourcePort}/dailydose_v1_fixture`;
const targetUrl = `mysql://migration_target:synthetic_target@127.0.0.1:${targetPort}/dailydose_v2_fixture`;
const deltaKey = randomBytes(32).toString('base64');
const piiKey = randomBytes(32).toString('base64');
const snapshotCompletedAt = new Date().toISOString();
const snapshotStartedAt = new Date(Date.now() - 1000).toISOString();
const environment = {
  ...process.env,
  ...composeEnvironment,
  DATABASE_URL: targetUrl,
  V1_DATABASE_URL: sourceUrl,
  V1_ROLLBACK_DATABASE_URL: rollbackUrl,
  V1_MAPPING_VERSION: '2.0.0',
  V1_MIGRATION_MEDIA_MODE: 'metadata-only',
  V1_SNAPSHOT_AT: snapshotCompletedAt,
  V1_SNAPSHOT_STARTED_AT: snapshotStartedAt,
  V1_SNAPSHOT_COMPLETED_AT: snapshotCompletedAt,
  V1_EXPECTED_SOURCE_MYSQL_VERSION: '8.4',
  V1_REHEARSAL_CONFIRMATION: 'REHEARSAL_1_DATABASE_ONLY',
  V1_BRANCH_CODES: '{"1":"SYN","99":"CDC"}',
  V1_BRANCH_TIMEZONES: '{"1":"Asia/Jakarta","99":"Asia/Jakarta"}',
  V1_MIGRATION_ACTOR_SOURCE_USER_ID: '1',
  MIGRATION_ALLOW_WRITES: 'true',
  MIGRATION_PII_KEY_BASE64: piiKey,
  MIGRATION_PII_HASH_PEPPER: randomBytes(32).toString('hex'),
  MIGRATION_DELTA_KEY_BASE64: deltaKey,
  MIGRATION_DELTA_KEY_VERSION: 'integration-v1',
  MIGRATION_INTEGRATION_TEST: 'true',
  PRIVATE_UPLOAD_ROOT: privateRoot,
  V1_SHARED_MEDIA_PREFIX: 'v1-compat/private',
};
const containerName = `${project}-migration-source-1`;
environment.MYSQLBINLOG_PATH = process.env.MYSQLBINLOG_PATH?.trim() || 'mysqlbinlog';
environment.MYSQLBINLOG_HOST = '127.0.0.1';
environment.MYSQLBINLOG_PORT = String(sourcePort);

const cli = async (...args) =>
  run(
    'node',
    [
      '--import',
      './apps/api/node_modules/tsx/dist/loader.mjs',
      'apps/api/prisma/v1-migration.ts',
      ...args,
    ],
    { env: environment, capture: true },
  );

let succeeded = false;
let currentStep = 'BOOTSTRAP';
try {
  currentStep = 'COMPOSE_UP';
  await compose(project, environment, 'up', '-d', '--wait');
  const grants = `
CREATE USER IF NOT EXISTS 'migration_readonly'@'%' IDENTIFIED BY 'synthetic_readonly';
GRANT SELECT ON dailydose_v1_fixture.* TO 'migration_readonly'@'%';
CREATE USER IF NOT EXISTS 'migration_capture'@'%' IDENTIFIED BY 'synthetic_capture';
GRANT SELECT ON dailydose_v1_fixture.* TO 'migration_capture'@'%';
GRANT REPLICATION CLIENT, REPLICATION SLAVE ON *.* TO 'migration_capture'@'%';
CREATE USER IF NOT EXISTS 'migration_rollback'@'%' IDENTIFIED BY 'synthetic_rollback';
GRANT SELECT ON dailydose_v1_fixture.* TO 'migration_rollback'@'%';
GRANT INSERT,UPDATE ON dailydose_v1_fixture.users TO 'migration_rollback'@'%';
GRANT INSERT,UPDATE ON dailydose_v1_fixture.order_pakets TO 'migration_rollback'@'%';
GRANT INSERT,UPDATE ON dailydose_v1_fixture.booking_kelas TO 'migration_rollback'@'%';
GRANT INSERT,UPDATE ON dailydose_v1_fixture.voucher_customers TO 'migration_rollback'@'%';
GRANT INSERT,UPDATE ON dailydose_v1_fixture.check_in_outs TO 'migration_rollback'@'%';
FLUSH PRIVILEGES;`;
  const fixtureSql = await syntheticV1FixtureSql();
  const receiptSql = await readFile(
    join(repositoryRoot, 'apps/api/prisma/v1-control/migration_pilot_replay_receipts.sql'),
    'utf8',
  );
  currentStep = 'SOURCE_FIXTURE';
  await run(
    'docker',
    [
      'exec',
      '-i',
      containerName,
      'mysql',
      '-uroot',
      '-psynthetic_root_source',
      'dailydose_v1_fixture',
    ],
    {
      input: `${fixtureSql}\n${grants}`,
    },
  );
  const highWater = await run(
    'docker',
    [
      'exec',
      containerName,
      'mysql',
      '-N',
      '-uroot',
      '-psynthetic_root_source',
      '-e',
      'SELECT @@GLOBAL.gtid_executed',
    ],
    { capture: true },
  );
  const gtid = highWater.stdout.trim();
  environment.V1_SNAPSHOT_GTID = gtid;
  const dumpPath = join(runDirectory, 'synthetic-v1.sql');
  await writeFile(dumpPath, fixtureSql, { mode: 0o600 });
  environment.V1_DUMP_SHA256 = createHash('sha256').update(fixtureSql).digest('hex');
  const rehearsalEnvironmentKeys = [
    'DATABASE_URL',
    'V1_DATABASE_URL',
    'V1_DUMP_SHA256',
    'V1_SNAPSHOT_AT',
    'V1_SNAPSHOT_STARTED_AT',
    'V1_SNAPSHOT_COMPLETED_AT',
    'V1_SNAPSHOT_GTID',
    'V1_MAPPING_VERSION',
    'V1_MIGRATION_MEDIA_MODE',
    'V1_BRANCH_CODES',
    'V1_BRANCH_TIMEZONES',
    'V1_MIGRATION_ACTOR_SOURCE_USER_ID',
    'MIGRATION_PII_KEY_BASE64',
    'MIGRATION_PII_HASH_PEPPER',
    'V1_EXPECTED_SOURCE_MYSQL_VERSION',
    'V1_REHEARSAL_CONFIRMATION',
  ];
  await writeFile(
    rehearsalEnvPath,
    `${rehearsalEnvironmentKeys.map((key) => `${key}='${environment[key]}'`).join('\n')}\n`,
    { mode: 0o600 },
  );
  currentStep = 'REHEARSAL_1_RUNNER';
  const rehearsal = await run(
    'node',
    [
      'tools/v1-migration-rehearsal.mjs',
      'run',
      '--env-file',
      rehearsalEnvPath,
      '--dump',
      dumpPath,
      '--output',
      rehearsalDirectory,
      '--run-id',
      `r1_${runId}`,
      '--apply-migrations',
      '--stop-after-phase',
      'user-role',
      '--execute',
    ],
    { capture: true },
  );
  const rehearsalResult = JSON.parse(rehearsal.stdout);
  if (rehearsalResult.status !== 'PAUSED_OPERATOR')
    throw new Error('REHEARSAL_1_CONTROLLED_PAUSE_FAILED');
  const resumedRehearsal = await run(
    'node',
    [
      'tools/v1-migration-rehearsal.mjs',
      'run',
      '--env-file',
      rehearsalEnvPath,
      '--dump',
      dumpPath,
      '--output',
      rehearsalDirectory,
      '--resume',
      '--execute',
    ],
    { capture: true },
  );
  const resumedRehearsalResult = JSON.parse(resumedRehearsal.stdout);
  if (resumedRehearsalResult.status !== 'PASSED_AUTOMATED_GATES')
    throw new Error('REHEARSAL_1_RUNNER_FAILED');
  await rm(rehearsalEnvPath, { force: true });
  const rehearsalState = JSON.parse(
    await readFile(join(rehearsalDirectory, 'run-state.json'), 'utf8'),
  );
  const profile = await readFile(join(rehearsalDirectory, 'source-profile.json'), 'utf8');
  await writeFile(join(evidenceDirectory, 'profile.json'), profile, { mode: 0o600 });
  const expected = JSON.parse(
    await readFile(join(repositoryRoot, 'tools/fixtures/v1-migration-expected.json'), 'utf8'),
  );
  const profiled = JSON.parse(profile);
  for (const [table, count] of Object.entries(expected.sourceCounts))
    if (profiled.counts?.[table] !== count)
      throw new Error(`FIXTURE_CONTROL_TOTAL_MISMATCH:${table}`);
  const batches = rehearsalState.phases.map(({ phase, batchId }) => ({ phase, batchId }));
  const finalReconciliation = JSON.parse(
    await readFile(join(operatorEvidenceDirectory, 'reconciliation.json'), 'utf8'),
  );
  if (
    !finalReconciliation ||
    finalReconciliation.blocking ||
    finalReconciliation.sessions?.sourceTotal !== expected.sessions.total ||
    finalReconciliation.rupiah?.sourceTotal !== expected.rupiah.orders ||
    finalReconciliation.exact?.journalRupiah?.expected !== expected.rupiah.journals ||
    finalReconciliation.sessions?.activeReserved?.expected !== expected.sessions.reserved ||
    finalReconciliation.sessions?.consumed?.expected !== expected.sessions.consumed ||
    finalReconciliation.sessions?.released?.expected !== expected.sessions.released ||
    finalReconciliation.sessions?.available?.expected !== expected.sessions.available ||
    finalReconciliation.sessions?.available?.actual !== expected.sessions.available ||
    finalReconciliation.dimensional?.mismatchCount !== 0 ||
    Object.entries(expected.exact).some(([key, value]) => {
      const controlKey = {
        users: 'USER_CARDINALITY',
        userRoles: 'USER_ROLE_CARDINALITY',
        assignments: 'ASSIGNMENT_CARDINALITY',
        capabilities: 'CAPABILITY_CARDINALITY',
        bookings: 'BOOKING_CARDINALITY',
        reservations: 'RESERVATION_CARDINALITY',
        attendance: 'ATTENDANCE_CARDINALITY',
        voucherEntitlements: 'VOUCHER_ENTITLEMENT_CARDINALITY',
        voucherRedemptions: 'VOUCHER_REDEMPTION_CARDINALITY',
        coas: 'COA_CARDINALITY',
        journals: 'JOURNAL_CARDINALITY',
        auditEvents: 'AUDIT_EVENT_CARDINALITY',
        notifications: 'NOTIFICATION_CARDINALITY',
      }[key];
      const control = finalReconciliation.exact?.controls?.[controlKey];
      return !control?.match || control.expected !== value || control.actual !== value;
    }) ||
    finalReconciliation.deferredMedia?.actual !== expected.deferredMedia ||
    !finalReconciliation.deferredMedia?.match
  )
    throw new Error('FINAL_RECONCILIATION_MISMATCH');
  await writeFile(
    join(evidenceDirectory, 'reconciliation.json'),
    `${JSON.stringify(finalReconciliation, null, 2)}\n`,
    { mode: 0o600 },
  );
  const parsedEvidenceResult = JSON.parse(
    await readFile(join(operatorEvidenceDirectory, 'summary.json'), 'utf8'),
  );
  if (parsedEvidenceResult.blocking) throw new Error('OPERATOR_EVIDENCE_INCOMPLETE');
  currentStep = 'ROLLBACK_RECEIPT_CONTROL';
  await run(
    'docker',
    [
      'exec',
      '-i',
      containerName,
      'mysql',
      '-uroot',
      '-psynthetic_root_source',
      'dailydose_v1_fixture',
    ],
    {
      input: `${receiptSql}\nGRANT SELECT,INSERT,UPDATE ON dailydose_v1_fixture.migration_pilot_replay_receipts TO 'migration_rollback'@'%'; FLUSH PRIVILEGES;`,
    },
  );
  await writeFile(
    join(evidenceDirectory, 'batches.json'),
    `${JSON.stringify(batches, null, 2)}\n`,
    { mode: 0o600 },
  );
  environment.V1_DATABASE_URL = captureUrl;
  currentStep = 'CDC_MUTATION';
  await run(
    'docker',
    [
      'exec',
      '-i',
      containerName,
      'mysql',
      '-uroot',
      '-psynthetic_root_source',
      'dailydose_v1_fixture',
    ],
    {
      input:
        "START TRANSACTION; INSERT INTO locations (id,nama,created_at,updated_at) VALUES (99,'CDC Branch',NOW(),NOW()); UPDATE locations SET nama='CDC Branch Updated' WHERE id=99; DELETE FROM locations WHERE id=99; INSERT INTO roles (id,name,guard_name,created_at,updated_at) VALUES (6,'finance','web',NOW(),NOW()); UPDATE roles SET name='finance-updated' WHERE id=6; DELETE FROM roles WHERE id=6; UPDATE users SET name='Synthetic Customer Updated' WHERE id=1; UPDATE pakets SET nama='Ten Sessions Updated' WHERE id=1; UPDATE order_pakets SET sisa=7 WHERE id=1; UPDATE order_pakets SET sisa=8 WHERE id=1; UPDATE kelas_activities SET nama_latihan='Pilates CDC' WHERE id=1; UPDATE booking_kelas SET deleted_at=NOW() WHERE id=1; UPDATE booking_kelas SET deleted_at=NULL WHERE id=1; UPDATE vouchers SET deskripsi='Fixture voucher CDC' WHERE id=1; UPDATE jurnals SET nama='Synthetic Sale CDC' WHERE id=1; COMMIT;",
    },
  );
  currentStep = 'CDC_CAPTURE';
  const captured = await cli(
    'delta-capture',
    '--source-binlog',
    '--from-gtid',
    gtid,
    '--spool-dir',
    spoolDirectory,
    '--operator',
    'integration-runner',
  );
  await writeFile(join(evidenceDirectory, 'delta-capture.json'), captured.stdout, { mode: 0o600 });
  currentStep = 'CDC_VERIFY_IMPORT';
  await cli('delta-verify', '--operator', 'integration-runner');
  await cli('delta-import', '--operator', 'integration-runner');
  await cli('delta-import', '--operator', 'integration-runner');
  const status = await cli('delta-status');
  await writeFile(join(evidenceDirectory, 'delta-status.json'), status.stdout, { mode: 0o600 });
  const deltaState = JSON.parse(status.stdout);
  if (
    Number(deltaState.events?.APPLIED ?? 0) < 14 ||
    Object.entries(deltaState.events ?? {}).some(
      ([state, count]) => state !== 'APPLIED' && Number(count) > 0,
    )
  )
    throw new Error('CDC_DOMAIN_MATRIX_MISMATCH');
  currentStep = 'PILOT_DATABASE_OUTBOX';
  const pilotSeed = await run(
    'node',
    [
      '--import',
      './apps/api/node_modules/tsx/dist/loader.mjs',
      'apps/api/prisma/v1-integration-pilot.ts',
    ],
    { env: environment, capture: true },
  );
  await writeFile(join(evidenceDirectory, 'pilot-seed.json'), pilotSeed.stdout, { mode: 0o600 });
  const pilotBefore = await cli('pilot-outbox-status', '--source-branch', '1');
  await writeFile(join(evidenceDirectory, 'pilot-status-before.json'), pilotBefore.stdout, {
    mode: 0o600,
  });
  await cli('pilot-outbox-apply', '--source-branch', '1');
  await cli('pilot-outbox-apply', '--source-branch', '1');
  const failureSeed = await run(
    'node',
    [
      '--import',
      './apps/api/node_modules/tsx/dist/loader.mjs',
      'apps/api/prisma/v1-integration-pilot.ts',
      '--failure',
    ],
    { env: environment, capture: true },
  );
  await writeFile(join(evidenceDirectory, 'pilot-failure-seed.json'), failureSeed.stdout, {
    mode: 0o600,
  });
  let receiptCrashObserved = false;
  try {
    await run(
      'node',
      [
        '--import',
        './apps/api/node_modules/tsx/dist/loader.mjs',
        'apps/api/prisma/v1-migration.ts',
        'pilot-outbox-apply',
        '--source-branch',
        '1',
      ],
      {
        env: { ...environment, MIGRATION_TEST_CRASH_AFTER_V1_RECEIPT: 'true' },
        capture: true,
      },
    );
  } catch {
    receiptCrashObserved = true;
  }
  if (!receiptCrashObserved) throw new Error('PILOT_RECEIPT_CRASH_NOT_OBSERVED');
  await cli('pilot-outbox-apply', '--source-branch', '1');
  const pilotVerify = await cli('pilot-outbox-verify', '--source-branch', '1');
  await writeFile(join(evidenceDirectory, 'pilot-verify.json'), pilotVerify.stdout, {
    mode: 0o600,
  });
  const pilotComparison = await run(
    'docker',
    [
      'exec',
      containerName,
      'mysql',
      '-N',
      '-umigration_rollback',
      '-psynthetic_rollback',
      'dailydose_v1_fixture',
      '-e',
      "SELECT name FROM users WHERE id=1; SELECT IF(deleted_at IS NULL,0,1) FROM booking_kelas WHERE id=1; SELECT COUNT(*) FROM migration_pilot_replay_receipts WHERE status='APPLIED';",
    ],
    { capture: true },
  );
  const pilotValues = pilotComparison.stdout.trim().split(/\r?\n/u);
  if (
    pilotValues[0] !== 'Synthetic Customer Crash Resume' ||
    pilotValues[1] !== '1' ||
    pilotValues[2] !== '3'
  )
    throw new Error('PILOT_DATABASE_RECONCILIATION_MISMATCH');
  await writeFile(
    join(evidenceDirectory, 'pilot-comparison.json'),
    `${JSON.stringify({ profileMatch: true, bookingCancelMatch: true, appliedReceipts: 3, receiptCrashResumed: true })}\n`,
    { mode: 0o600 },
  );
  const evidence = JSON.stringify({
    runId,
    batches,
    fixtureSha256: environment.V1_DUMP_SHA256,
    mediaMode: 'metadata-only',
    operatorEvidenceId: parsedEvidenceResult.evidenceId,
  });
  const forbidden = [
    /mysql:\/\//iu,
    /\$2[aby]\$/u,
    /SYNTHETIC-NIK/u,
    /synthetic_(?:capture|rollback|target|root)/iu,
    /legacy\//iu,
  ];
  const evidenceText = `${await readEvidenceText(evidenceDirectory)}\n${await readEvidenceText(operatorEvidenceDirectory)}`;
  if (forbidden.some((pattern) => pattern.test(`${evidence}\n${evidenceText}`)))
    throw new Error('SECURITY_EVIDENCE_SCAN_FAILED');
  await writeFile(join(evidenceDirectory, 'run-summary.json'), `${evidence}\n`, { mode: 0o600 });
  await writeFile(
    join(runDirectory, 'run.json'),
    `${JSON.stringify({ runId, project, composeEnvironment: persistedComposeEnvironment, status: 'PASSED' }, null, 2)}\n`,
    { mode: 0o600 },
  );
  succeeded = true;
  process.stdout.write(
    `${JSON.stringify({ runId, status: 'PASSED', evidence: `.migration-integration/runs/${runId}/evidence` })}\n`,
  );
} catch (error) {
  const safeDetail = `${error?.stderr ?? ''}\n${error?.stdout ?? ''}`.match(
    /(?:Error:\s+|\b)([A-Z][A-Z0-9_]{2,63})(?::|\b)/u,
  )?.[1];
  const failureCode = (safeDetail ?? `${currentStep}_FAILED`).slice(0, 64);
  await writeFile(
    join(runDirectory, 'run.json'),
    `${JSON.stringify({ runId, project, composeEnvironment: persistedComposeEnvironment, status: 'FAILED', step: currentStep, failureCode }, null, 2)}\n`,
    { mode: 0o600 },
  );
  process.stderr.write(
    `${JSON.stringify({ runId, status: 'FAILED', step: currentStep, failureCode })}\n`,
  );
  if (!keep)
    await compose(project, environment, 'down', '--volumes', '--remove-orphans').catch(
      () => undefined,
    );
  process.exitCode = 1;
} finally {
  await rm(rehearsalEnvPath, { force: true });
  if (succeeded && !keep) {
    await compose(project, environment, 'down', '--volumes', '--remove-orphans');
    await Promise.all([
      rm(privateRoot, { recursive: true, force: true }),
      rm(spoolDirectory, { recursive: true, force: true }),
      rm(join(runDirectory, 'synthetic-v1.sql'), { force: true }),
    ]);
  }
}
