import { closeSync, existsSync, openSync } from 'node:fs';
import { access, mkdir, readFile, realpath, rm } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:net';
import { dirname, resolve, sep } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const DATABASE_PREFIX = 'dailydose_it_';
const repositoryRoot = resolve(import.meta.dirname, '..');
const runtimeRoot = resolve(repositoryRoot, '.integration-runtime');
const defaultBinary = '/opt/homebrew/opt/mysql@8.4/bin/mysqld';

export function validateRunId(value) {
  if (!value || !/^[a-z0-9][a-z0-9_-]{2,48}$/u.test(value)) throw new Error('RUN_ID_INVALID');
  return value;
}

export function databaseNameForRun(runId) {
  const safeRunId = validateRunId(runId).replaceAll('-', '_');
  const name = `${DATABASE_PREFIX}${safeRunId}`;
  if (name.length > 64) throw new Error('INTEGRATION_DATABASE_NAME_TOO_LONG');
  return name;
}

export function runtimeDirectoryForRun(runId) {
  return resolve(runtimeRoot, validateRunId(runId));
}

function assertManagedPath(path, runId) {
  const expected = runtimeDirectoryForRun(runId);
  if (path !== expected || !path.startsWith(`${runtimeRoot}${sep}`))
    throw new Error('NATIVE_MYSQL_RUNTIME_PATH_UNSAFE');
}

async function reservePort(requestedPort) {
  const port = requestedPort === undefined ? 0 : Number(requestedPort);
  if (!Number.isInteger(port) || port < 0 || port > 65_535)
    throw new Error('NATIVE_MYSQL_PORT_INVALID');
  const server = createServer();
  await new Promise((resolveReady, rejectReady) => {
    server.once('error', (error) =>
      rejectReady(Object.assign(new Error('NATIVE_MYSQL_PORT_UNAVAILABLE'), { cause: error })),
    );
    server.listen(port, '127.0.0.1', resolveReady);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('NATIVE_MYSQL_PORT_UNAVAILABLE');
  await new Promise((resolveClose) => server.close(resolveClose));
  return address.port;
}

function command(binary, args, options = {}) {
  return new Promise((resolveResult, rejectResult) => {
    const child = spawn(binary, args, {
      cwd: repositoryRoot,
      env: { ...process.env, ...options.env },
      stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (chunk) => (stdout += chunk));
    child.stderr?.on('data', (chunk) => (stderr += chunk));
    child.once('error', (error) => rejectResult(error));
    child.once('exit', (code, signal) =>
      resolveResult({ code: code ?? 1, signal, stdout: stdout.trim(), stderr: stderr.trim() }),
    );
  });
}

async function mysql(socketPath, binaryDirectory, sql, options = {}) {
  const args = [
    '--protocol=SOCKET',
    '--socket',
    socketPath,
    '--user',
    options.user ?? 'root',
    '--batch',
    '--skip-column-names',
    '--execute',
    sql,
  ];
  const result = await command(resolve(binaryDirectory, 'mysql'), args, {
    env: options.password ? { MYSQL_PWD: options.password } : undefined,
  });
  if (result.code !== 0) {
    const reason = /access denied/iu.test(result.stderr)
      ? 'NATIVE_MYSQL_ACCESS_DENIED'
      : 'NATIVE_MYSQL_COMMAND_FAILED';
    throw new Error(reason);
  }
  return result.stdout;
}

export async function waitForNativeMySqlReadiness({
  child,
  socketPath,
  binaryDirectory,
  timeoutMs,
}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('NATIVE_MYSQL_CRASHED_BEFORE_READY');
    const ping = spawnSync(
      resolve(binaryDirectory, 'mysqladmin'),
      ['--protocol=SOCKET', '--socket', socketPath, '--user', 'root', 'ping', '--silent'],
      { cwd: repositoryRoot, stdio: 'ignore' },
    );
    if (ping.status === 0) return;
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  throw new Error('NATIVE_MYSQL_READINESS_TIMEOUT');
}

async function terminateChild(child, expectedPid, timeoutMs = 10_000) {
  if (!child?.pid || child.exitCode !== null) return;
  if (child.pid !== expectedPid) throw new Error('NATIVE_MYSQL_PID_MISMATCH');
  child.kill('SIGTERM');
  const exited = new Promise((resolveExit) => child.once('exit', resolveExit));
  const timedOut = await Promise.race([
    exited.then(() => false),
    new Promise((resolveTimeout) => setTimeout(() => resolveTimeout(true), timeoutMs)),
  ]);
  if (timedOut && child.exitCode === null) {
    child.kill('SIGKILL');
    await exited;
  }
}

function socketPathForRun(runId) {
  const digest = createHash('sha256').update(validateRunId(runId)).digest('hex').slice(0, 16);
  return resolve(runtimeRoot, `${digest}.sock`);
}

async function cleanupFiles(runId) {
  const directory = runtimeDirectoryForRun(runId);
  assertManagedPath(directory, runId);
  await rm(socketPathForRun(runId), { force: true });
  await rm(directory, { recursive: true, force: true });
}

export async function cleanupNativeMySqlRuntime(runId) {
  const directory = runtimeDirectoryForRun(runId);
  assertManagedPath(directory, runId);
  const pidFile = resolve(directory, 'mysqld.pid');
  if (existsSync(pidFile)) {
    const pid = Number((await readFile(pidFile, 'utf8')).trim());
    if (!Number.isInteger(pid) || pid < 2) throw new Error('NATIVE_MYSQL_PID_INVALID');
    const commandLine = spawnSync('ps', ['-p', String(pid), '-o', 'command='], {
      encoding: 'utf8',
    }).stdout.trim();
    const dataDirectory = resolve(directory, 'data');
    if (commandLine && !commandLine.includes(`--datadir=${dataDirectory}`))
      throw new Error('NATIVE_MYSQL_PROCESS_OWNERSHIP_MISMATCH');
    if (commandLine) process.kill(pid, 'SIGTERM');
  }
  await cleanupFiles(runId);
}

export async function startNativeMySqlRuntime(runId, options = {}) {
  validateRunId(runId);
  const directory = runtimeDirectoryForRun(runId);
  assertManagedPath(directory, runId);
  if (existsSync(directory)) throw new Error('NATIVE_MYSQL_RUNTIME_ALREADY_EXISTS');

  const configuredBinary =
    options.binary ?? process.env.DD_NATIVE_MYSQL_BINARY?.trim() ?? defaultBinary;
  await access(configuredBinary).catch(() => {
    throw new Error('NATIVE_MYSQL_BINARY_NOT_FOUND');
  });
  const binary = await realpath(configuredBinary);
  const versionResult = await command(binary, ['--version']);
  if (versionResult.code !== 0) throw new Error('NATIVE_MYSQL_BINARY_INVALID');
  const versionMatch = /Ver\s+(\d+)\.(\d+)\.([\w.-]+)/u.exec(versionResult.stdout);
  if (!versionMatch) throw new Error('NATIVE_MYSQL_VERSION_UNKNOWN');
  const major = Number(versionMatch[1]);
  const minor = Number(versionMatch[2]);
  if (major < 8 || (major === 8 && minor < 4))
    throw new Error('INTEGRATION_MYSQL_8_4_OR_NEWER_REQUIRED');

  const port = await reservePort(options.port);
  const database = databaseNameForRun(runId);
  const dataDirectory = resolve(directory, 'data');
  const socketPath = socketPathForRun(runId);
  const pidFile = resolve(directory, 'mysqld.pid');
  const errorLog = resolve(directory, 'mysqld.err');
  const consoleLog = resolve(directory, 'mysqld.console.log');
  const binaryDirectory = dirname(binary);
  const basedir = dirname(binaryDirectory);
  const password = randomBytes(24).toString('hex');
  const username = `dd_${createHash('sha256').update(runId).digest('hex').slice(0, 12)}`;
  let child;

  await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  const initializationLog = openSync(resolve(directory, 'initialize.log'), 'wx', 0o600);
  const initialized = await command(
    binary,
    [
      '--no-defaults',
      '--initialize-insecure',
      `--basedir=${basedir}`,
      `--datadir=${dataDirectory}`,
    ],
    { stdio: ['ignore', initializationLog, initializationLog] },
  );
  closeSync(initializationLog);
  if (initialized.code !== 0) {
    if (!options.keep) await cleanupFiles(runId);
    throw new Error('NATIVE_MYSQL_INITIALIZE_FAILED');
  }

  try {
    const serverLog = openSync(consoleLog, 'wx', 0o600);
    child = spawn(
      binary,
      [
        '--no-defaults',
        `--basedir=${basedir}`,
        `--datadir=${dataDirectory}`,
        '--bind-address=127.0.0.1',
        `--port=${port}`,
        `--socket=${socketPath}`,
        `--pid-file=${pidFile}`,
        `--log-error=${errorLog}`,
        `--server-id=${100_000 + port}`,
        `--log-bin=${resolve(directory, 'binlog')}`,
        '--binlog-format=ROW',
        '--binlog-row-image=FULL',
        '--gtid-mode=ON',
        '--enforce-gtid-consistency=ON',
        '--mysqlx=OFF',
        '--skip-name-resolve',
      ],
      {
        cwd: repositoryRoot,
        env: process.env,
        stdio: ['ignore', serverLog, serverLog],
      },
    );
    closeSync(serverLog);
    await waitForNativeMySqlReadiness({
      child,
      socketPath,
      binaryDirectory,
      timeoutMs: options.readinessTimeoutMs ?? 30_000,
    });
    const escapedPassword = password.replaceAll("'", "''");
    await mysql(
      socketPath,
      binaryDirectory,
      [
        `CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
        `CREATE USER '${username}'@'127.0.0.1' IDENTIFIED BY '${escapedPassword}'`,
        `GRANT ALL PRIVILEGES ON \`${database}\`.* TO '${username}'@'127.0.0.1'`,
        'FLUSH PRIVILEGES',
      ].join('; '),
    );
    const metadata = (
      await mysql(
        socketPath,
        binaryDirectory,
        'SELECT VERSION(), @@GLOBAL.gtid_mode, @@GLOBAL.binlog_format, @@GLOBAL.binlog_row_image',
      )
    ).split('\t');
    const databaseUrl = new URL('mysql://127.0.0.1');
    databaseUrl.username = username;
    databaseUrl.password = password;
    databaseUrl.port = String(port);
    databaseUrl.pathname = `/${database}`;
    let stopped = false;
    return {
      database,
      databaseUrl: databaseUrl.toString(),
      host: '127.0.0.1',
      port,
      version: metadata[0] ?? versionMatch[0],
      gtidMode: metadata[1] ?? 'UNKNOWN',
      binlogFormat: metadata[2] ?? 'UNKNOWN',
      binlogRowImage: metadata[3] ?? 'UNKNOWN',
      binaryDirectory,
      runtimeDirectory: directory,
      query: (sql) => mysql(socketPath, binaryDirectory, sql),
      async stop({ keep = false } = {}) {
        if (stopped) return;
        stopped = true;
        await terminateChild(child, child.pid);
        if (!keep) await cleanupFiles(runId);
      },
    };
  } catch (error) {
    if (child?.pid) await terminateChild(child, child.pid).catch(() => undefined);
    if (!options.keep) await cleanupFiles(runId);
    throw error;
  }
}
