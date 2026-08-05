import { createHash, randomBytes } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { chmod, mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises';
import { basename, isAbsolute, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { parseEnv } from 'node:util';

const repositoryRoot = resolve(import.meta.dirname, '..');
const phases = [
  'branch-master',
  'user-role',
  'package-order',
  'ledger',
  'slot-booking',
  'voucher-finance-audit-media',
];

export function parseArguments(argv) {
  const result = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) result._.push(token);
    else {
      const key = token.slice(2);
      const next = argv[index + 1];
      if (!next || next.startsWith('--')) result[key] = true;
      else {
        result[key] = next;
        index += 1;
      }
    }
  }
  return result;
}

function required(value, code) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(code);
  return value.trim();
}

function safeRunId(value) {
  if (!/^[a-z0-9][a-z0-9_-]{2,48}$/u.test(value)) throw new Error('RUN_ID_INVALID');
  return value;
}

export function validateStopAfterPhase(value) {
  if (value !== undefined && (typeof value !== 'string' || !phases.includes(value)))
    throw new Error('STOP_AFTER_PHASE_INVALID');
  return value;
}

function safeFailureCode(error, fallback = 'REHEARSAL_COMMAND_FAILED') {
  const text = `${error?.stderr ?? ''}\n${error?.stdout ?? ''}\n${error?.message ?? ''}`;
  return (
    text.match(/"code"\s*:\s*"([A-Z][A-Z0-9_]{2,63})"/u)?.[1] ??
    text.match(/\b([A-Z][A-Z0-9_]{2,63})(?::|\b)/u)?.[1] ??
    fallback
  );
}

function safeIntegrationDiagnostic(error) {
  const lines = `${error?.stderr ?? ''}`.trim().split(/\r?\n/u).reverse();
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      const diagnostic = parsed?.diagnostic;
      if (!diagnostic || typeof diagnostic !== 'object') continue;
      const safe = Object.fromEntries(
        Object.entries(diagnostic).filter(
          ([key, value]) =>
            ['category', 'prismaCode', 'databaseCode', 'identifier'].includes(key) &&
            typeof value === 'string' &&
            /^[A-Za-z0-9_.-]{1,64}$/u.test(value),
        ),
      );
      return Object.keys(safe).length ? safe : undefined;
    } catch {
      // Command stderr may contain non-JSON runtime output; never persist it verbatim.
    }
  }
  return undefined;
}

function parseIso(value, code) {
  const parsed = new Date(required(value, code));
  if (Number.isNaN(parsed.getTime())) throw new Error(code);
  return parsed;
}

export function validateRehearsalEnvironment(environment) {
  const requiredKeys = [
    'DATABASE_URL',
    'V1_DATABASE_URL',
    'V1_DUMP_SHA256',
    'V1_SNAPSHOT_AT',
    'V1_SNAPSHOT_STARTED_AT',
    'V1_SNAPSHOT_COMPLETED_AT',
    'V1_SNAPSHOT_GTID',
    'V1_MAPPING_VERSION',
    'V1_BRANCH_CODES',
    'V1_BRANCH_TIMEZONES',
    'V1_MIGRATION_ACTOR_SOURCE_USER_ID',
    'MIGRATION_PII_KEY_BASE64',
    'MIGRATION_PII_HASH_PEPPER',
    'V1_EXPECTED_SOURCE_MYSQL_VERSION',
  ];
  for (const key of requiredKeys) required(environment[key], `${key}_REQUIRED`);
  if (environment.V1_MIGRATION_MEDIA_MODE !== 'metadata-only')
    throw new Error('V1_MIGRATION_MEDIA_MODE_MUST_BE_METADATA_ONLY');
  if (environment.V1_MAPPING_VERSION !== '2.0.0')
    throw new Error('V1_MAPPING_VERSION_NOT_APPROVED');
  if (environment.V1_REHEARSAL_CONFIRMATION !== 'REHEARSAL_1_DATABASE_ONLY')
    throw new Error('V1_REHEARSAL_CONFIRMATION_REQUIRED');
  if (!/^[a-f0-9]{64}$/u.test(environment.V1_DUMP_SHA256))
    throw new Error('V1_DUMP_SHA256_INVALID');
  const started = parseIso(environment.V1_SNAPSHOT_STARTED_AT, 'V1_SNAPSHOT_STARTED_AT_INVALID');
  const completed = parseIso(
    environment.V1_SNAPSHOT_COMPLETED_AT,
    'V1_SNAPSHOT_COMPLETED_AT_INVALID',
  );
  const snapshot = parseIso(environment.V1_SNAPSHOT_AT, 'V1_SNAPSHOT_AT_INVALID');
  if (completed < started) throw new Error('V1_SNAPSHOT_WINDOW_INVALID');
  if (snapshot.getTime() !== completed.getTime())
    throw new Error('V1_SNAPSHOT_AT_MUST_EQUAL_COMPLETED_AT');
  const source = new URL(environment.V1_DATABASE_URL);
  const target = new URL(environment.DATABASE_URL);
  if (source.protocol !== 'mysql:' || target.protocol !== 'mysql:')
    throw new Error('MYSQL_DATABASE_URL_REQUIRED');
  if (
    source.hostname === target.hostname &&
    (source.port || '3306') === (target.port || '3306') &&
    source.pathname === target.pathname
  )
    throw new Error('SOURCE_AND_TARGET_MUST_DIFFER');
  return {
    snapshotStartedAt: started.toISOString(),
    snapshotCompletedAt: completed.toISOString(),
    snapshotGtidHash: createHash('sha256').update(environment.V1_SNAPSHOT_GTID).digest('hex'),
  };
}

async function sha256File(path) {
  const hash = createHash('sha256');
  await new Promise((resolveHash, rejectHash) => {
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', rejectHash);
    stream.on('end', resolveHash);
  });
  return hash.digest('hex');
}

async function atomicJson(path, value) {
  const temporary = `${path}.${randomBytes(4).toString('hex')}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
  await rename(temporary, path);
  await chmod(path, 0o600);
}

function parseCpuTime(value) {
  const parts = value.trim().split(':').map(Number);
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

async function childUsage(pid) {
  try {
    const result = await runRaw('ps', ['-o', 'rss=,time=', '-p', String(pid)], {
      capture: true,
      monitor: false,
    });
    const match = result.stdout.trim().match(/^(\d+)\s+([\d:.]+)$/u);
    return match ? { rssKb: Number(match[1]), cpuSeconds: parseCpuTime(match[2]) } : null;
  } catch {
    return null;
  }
}

function runRaw(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const started = process.hrtime.bigint();
    const child = spawn(command, args, {
      cwd: repositoryRoot,
      env: options.env ?? process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout = [];
    const stderr = [];
    let peakRssKb = 0;
    let cpuSeconds = 0;
    const sample = async () => {
      if (!child.pid) return;
      const usage = await childUsage(child.pid);
      if (usage) {
        peakRssKb = Math.max(peakRssKb, usage.rssKb);
        cpuSeconds = Math.max(cpuSeconds, usage.cpuSeconds);
      }
    };
    const timer = options.monitor === false ? null : setInterval(sample, 250);
    timer?.unref();
    child.stdout.on('data', (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on('data', (chunk) => stderr.push(Buffer.from(chunk)));
    child.once('error', rejectRun);
    child.once('exit', async (code) => {
      if (timer) {
        clearInterval(timer);
        await sample();
      }
      const result = {
        code,
        stdout: Buffer.concat(stdout).toString('utf8'),
        stderr: Buffer.concat(stderr).toString('utf8'),
        metrics: {
          durationMs: Number((process.hrtime.bigint() - started) / 1_000_000n),
          peakRssKb,
          cpuSeconds,
        },
      };
      if (code === 0) resolveRun(result);
      else
        rejectRun(Object.assign(new Error(`COMMAND_FAILED:${basename(command)}:${code}`), result));
    });
  });
}

function jsonOutput(result, code) {
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(code);
  }
}

async function collectFiles(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(path, relative)));
    else if (entry.isFile() && entry.name !== 'run-manifest.json')
      files.push({ name: relative, sha256: await sha256File(path) });
  }
  return files.sort((left, right) => left.name.localeCompare(right.name));
}

async function scanEvidence(directory) {
  const forbidden = [
    /mysql:\/\//iu,
    /\$2[aby]\$/u,
    /\$argon2id\$/u,
    /(?:password|token|nik|privatePath|objectKey)\s*[=:]/iu,
    /(?:\/Users\/|\/home\/|[A-Z]:\\)/u,
  ];
  for (const entry of await collectFiles(directory)) {
    const content = await readFile(join(directory, entry.name), 'utf8');
    if (forbidden.some((pattern) => pattern.test(content)))
      throw new Error('REHEARSAL_EVIDENCE_SECURITY_SCAN_FAILED');
  }
}

async function verifyManifest(directory) {
  const manifest = JSON.parse(await readFile(join(directory, 'run-manifest.json'), 'utf8'));
  for (const file of manifest.files) {
    if ((await sha256File(join(directory, file.name))) !== file.sha256)
      throw new Error('REHEARSAL_EVIDENCE_CHECKSUM_MISMATCH');
  }
  return { runId: manifest.runId, files: manifest.files.length, verified: true };
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  if (args._[0] === 'verify-evidence') {
    const output = required(args.output, 'OUTPUT_REQUIRED');
    if (!isAbsolute(output)) throw new Error('OUTPUT_MUST_BE_ABSOLUTE');
    console.log(JSON.stringify(await verifyManifest(output), null, 2));
    return;
  }
  if (args._.length && args._[0] !== 'run') throw new Error('UNKNOWN_REHEARSAL_COMMAND');
  if (args.execute !== true) throw new Error('REHEARSAL_EXECUTE_CONFIRMATION_REQUIRED');
  validateStopAfterPhase(args['stop-after-phase']);
  const envFile = required(args['env-file'], 'ENV_FILE_REQUIRED');
  const dumpPath = required(args.dump, 'DUMP_PATH_REQUIRED');
  const output = required(args.output, 'OUTPUT_REQUIRED');
  if (![envFile, dumpPath, output].every(isAbsolute)) throw new Error('ABSOLUTE_PATH_REQUIRED');
  const envStat = await stat(envFile);
  if ((envStat.mode & 0o077) !== 0) throw new Error('ENV_FILE_PERMISSIONS_TOO_OPEN');
  const environment = { ...process.env, ...parseEnv(await readFile(envFile, 'utf8')) };
  const snapshot = validateRehearsalEnvironment(environment);
  const dumpStat = await stat(dumpPath);
  if (!dumpStat.isFile()) throw new Error('DUMP_FILE_REQUIRED');
  const dumpChecksum = await sha256File(dumpPath);
  if (dumpChecksum !== environment.V1_DUMP_SHA256) throw new Error('SOURCE_DUMP_CHECKSUM_MISMATCH');

  const statePath = join(output, 'run-state.json');
  let state;
  try {
    state = JSON.parse(await readFile(statePath, 'utf8'));
    if (args.resume !== true) throw new Error('REHEARSAL_OUTPUT_ALREADY_INITIALIZED');
    if (
      state.dump.sha256 !== dumpChecksum ||
      state.mappingVersion !== environment.V1_MAPPING_VERSION ||
      state.snapshotCompletedAt !== snapshot.snapshotCompletedAt
    )
      throw new Error('REHEARSAL_RESUME_INPUT_MISMATCH');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    await mkdir(output, { recursive: true, mode: 0o700 });
    if ((await readdir(output)).length) throw new Error('REHEARSAL_OUTPUT_NOT_EMPTY');
    state = {
      schemaVersion: 1,
      runId: safeRunId(
        typeof args['run-id'] === 'string'
          ? args['run-id']
          : `r1_${new Date().toISOString().replace(/\D/gu, '').slice(0, 14)}_${randomBytes(3).toString('hex')}`,
      ),
      status: 'STARTING',
      startedAt: new Date().toISOString(),
      snapshotStartedAt: snapshot.snapshotStartedAt,
      snapshotCompletedAt: snapshot.snapshotCompletedAt,
      snapshotGtidHash: snapshot.snapshotGtidHash,
      mappingVersion: environment.V1_MAPPING_VERSION,
      mediaMode: 'metadata-only',
      dump: { name: basename(dumpPath), sizeBytes: dumpStat.size, sha256: dumpChecksum },
      phases: [],
    };
    await atomicJson(statePath, state);
  }

  const cli = (...commandArgs) =>
    runRaw(
      'node',
      [
        '--import',
        './apps/api/node_modules/tsx/dist/loader.mjs',
        'apps/api/prisma/v1-migration.ts',
        ...commandArgs,
      ],
      { env: environment },
    );
  const writeCli = (...commandArgs) =>
    runRaw(
      'node',
      [
        '--import',
        './apps/api/node_modules/tsx/dist/loader.mjs',
        'apps/api/prisma/v1-migration.ts',
        ...commandArgs,
      ],
      { env: { ...environment, MIGRATION_ALLOW_WRITES: 'true' } },
    );

  try {
    if (state.status === 'STARTING') {
      if (args['apply-migrations'] !== true)
        throw new Error('APPLY_MIGRATIONS_CONFIRMATION_REQUIRED');
      const generation = await runRaw(
        'pnpm',
        [
          '--filter',
          '@dailydose/api',
          'exec',
          'prisma',
          'generate',
          '--schema',
          'prisma/schema.prisma',
        ],
        { env: environment },
      );
      const migration = await runRaw(
        'pnpm',
        [
          '--filter',
          '@dailydose/api',
          'exec',
          'prisma',
          'migrate',
          'deploy',
          '--schema',
          'prisma/schema.prisma',
        ],
        { env: environment },
      );
      const preflightResult = await cli('rehearsal-preflight');
      const preflight = jsonOutput(preflightResult, 'PREFLIGHT_OUTPUT_INVALID');
      if (!preflight.serverVersion.startsWith(environment.V1_EXPECTED_SOURCE_MYSQL_VERSION))
        throw new Error('SOURCE_MYSQL_VERSION_MISMATCH');
      const profileResult = await cli('profile');
      const gateResult = await cli('gate', '--dump', dumpPath);
      await atomicJson(join(output, 'preflight.json'), {
        ...preflight,
        snapshot,
        dump: state.dump,
        metrics: {
          generation: generation.metrics,
          migrations: migration.metrics,
          preflight: preflightResult.metrics,
          profile: profileResult.metrics,
          gate: gateResult.metrics,
        },
      });
      await writeFile(join(output, 'source-profile.json'), profileResult.stdout, { mode: 0o600 });
      await writeFile(join(output, 'gate.json'), gateResult.stdout, { mode: 0o600 });
      state.status = 'RUNNING';
      await atomicJson(statePath, state);
    }

    await mkdir(join(output, 'phases'), { recursive: true, mode: 0o700 });
    for (let index = 0; index < phases.length; index += 1) {
      const phase = phases[index];
      let phaseState = state.phases.find((item) => item.phase === phase);
      if (phaseState?.status === 'COMPLETED') continue;
      if (!phaseState) {
        phaseState = { phase, status: 'PENDING', attempts: [] };
        state.phases.push(phaseState);
      }
      const attemptNumber = phaseState.attempts.length + 1;
      const attemptDirectory = join(
        output,
        'phases',
        `${String(index + 1).padStart(2, '0')}-${phase}`,
        `attempt-${String(attemptNumber).padStart(3, '0')}`,
      );
      await mkdir(attemptDirectory, { recursive: true, mode: 0o700 });
      const attempt = { attempt: attemptNumber, startedAt: new Date().toISOString() };
      phaseState.attempts.push(attempt);
      phaseState.status = 'RUNNING';
      await atomicJson(statePath, state);
      try {
        const prepared = await writeCli('prepare', '--phase', phase, '--dump', dumpPath);
        const preparedJson = jsonOutput(prepared, 'PREPARE_OUTPUT_INVALID');
        phaseState.batchId = preparedJson.id;
        const imported = await writeCli(
          'import',
          '--batch',
          phaseState.batchId,
          '--dump',
          dumpPath,
        );
        const reconciliation = await writeCli('reconcile', '--batch', phaseState.batchId);
        const reconciliationJson = jsonOutput(reconciliation, 'RECONCILIATION_OUTPUT_INVALID');
        await writeFile(join(attemptDirectory, 'reconciliation.json'), reconciliation.stdout, {
          mode: 0o600,
        });
        if (reconciliationJson.blocking) throw new Error('REHEARSAL_RECONCILIATION_BLOCKING');
        const replay = await writeCli('import', '--batch', phaseState.batchId, '--dump', dumpPath);
        const replayJson = jsonOutput(replay, 'REPLAY_OUTPUT_INVALID');
        if (replayJson.replay !== true) throw new Error('REHEARSAL_REPLAY_NOT_IDEMPOTENT');
        const rollback = await cli('rollback-report', '--batch', phaseState.batchId);
        const resumed = await cli('resume', '--batch', phaseState.batchId);
        await writeFile(join(attemptDirectory, 'rollback-report.json'), rollback.stdout, {
          mode: 0o600,
        });
        await writeFile(join(attemptDirectory, 'batch.json'), resumed.stdout, { mode: 0o600 });
        attempt.completedAt = new Date().toISOString();
        attempt.status = 'COMPLETED';
        attempt.metrics = {
          prepare: prepared.metrics,
          import: imported.metrics,
          reconcile: reconciliation.metrics,
          replay: replay.metrics,
          rollbackReport: rollback.metrics,
        };
        phaseState.status = 'COMPLETED';
        await atomicJson(join(attemptDirectory, 'attempt.json'), attempt);
        await atomicJson(statePath, state);
        if (args['stop-after-phase'] === phase) {
          state.status = 'PAUSED_OPERATOR';
          state.pausedAfterPhase = phase;
          await atomicJson(statePath, state);
          console.log(
            JSON.stringify(
              { runId: state.runId, status: state.status, pausedAfterPhase: phase },
              null,
              2,
            ),
          );
          return;
        }
      } catch (error) {
        const failureCode = safeFailureCode(error);
        const diagnostic = safeIntegrationDiagnostic(error);
        attempt.completedAt = new Date().toISOString();
        attempt.status = 'BLOCKED';
        attempt.failureCode = failureCode;
        if (diagnostic) attempt.diagnostic = diagnostic;
        phaseState.status = 'BLOCKED';
        state.status = 'PAUSED';
        state.failureCode = failureCode;
        await atomicJson(join(attemptDirectory, 'attempt.json'), attempt);
        await atomicJson(statePath, state);
        console.log(
          JSON.stringify({ runId: state.runId, status: 'PAUSED', phase, failureCode }, null, 2),
        );
        process.exitCode = 2;
        return;
      }
    }

    const finalPhase = state.phases.at(-1);
    const finalEvidenceDirectory = join(output, 'final-evidence');
    const evidence = await writeCli(
      'evidence',
      '--batch',
      finalPhase.batchId,
      '--output',
      finalEvidenceDirectory,
    );
    const evidenceJson = jsonOutput(evidence, 'EVIDENCE_OUTPUT_INVALID');
    if (evidenceJson.blocking) throw new Error('REHEARSAL_FINAL_EVIDENCE_BLOCKING');
    await writeFile(
      join(output, 'smoke-and-signoff.md'),
      [
        '# Rehearsal 1 smoke and sign-off',
        '',
        '- [ ] Customer bcrypt login upgraded to Argon2id and second login succeeded.',
        '- [ ] Super Owner migration console, totals, resolution, and historical filter passed.',
        '- [ ] Per-branch user, order, balance, booking, voucher, and journal samples passed.',
        '- [ ] Active migrated identity/payment/media records are zero.',
        '- [ ] Security scan contains no credential, raw NIK, token, or private path.',
        '- [ ] Data Owner approved mapping and resolutions.',
        '- [ ] Finance approved Rupiah, COA, and journal controls.',
        '- [ ] Technical Lead approved replay, performance, and evidence.',
        '',
      ].join('\n'),
      { mode: 0o600, flag: 'wx' },
    );
    state.status = 'PASSED_AUTOMATED_GATES';
    state.completedAt = new Date().toISOString();
    delete state.failureCode;
    delete state.pausedAfterPhase;
    await atomicJson(statePath, state);
    await scanEvidence(output);
    const manifest = {
      schemaVersion: 1,
      runId: state.runId,
      generatedAt: new Date().toISOString(),
      status: state.status,
      files: await collectFiles(output),
    };
    await atomicJson(join(output, 'run-manifest.json'), manifest);
    console.log(
      JSON.stringify(
        { runId: state.runId, status: state.status, files: manifest.files.length },
        null,
        2,
      ),
    );
  } catch (error) {
    state.status = 'FAILED';
    state.failureCode = safeFailureCode(error);
    state.completedAt = new Date().toISOString();
    await atomicJson(statePath, state);
    throw new Error(state.failureCode);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  main().catch((error) => {
    console.error(JSON.stringify({ ok: false, code: safeFailureCode(error) }));
    process.exitCode = 1;
  });
