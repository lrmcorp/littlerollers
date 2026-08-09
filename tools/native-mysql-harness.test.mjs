import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import test from 'node:test';
import {
  cleanupNativeMySqlRuntime,
  databaseNameForRun,
  runtimeDirectoryForRun,
  startNativeMySqlRuntime,
  validateRunId,
  waitForNativeMySqlReadiness,
} from './native-mysql-harness.mjs';

test('creates deterministic names only inside the integration namespace', () => {
  assert.equal(databaseNameForRun('api_20260806_123'), 'dailydose_it_api_20260806_123');
  assert.equal(databaseNameForRun('customer-run-1'), 'dailydose_it_customer_run_1');
  assert.match(runtimeDirectoryForRun('customer-run-1'), /\.integration-runtime\/customer-run-1$/u);
});

test('rejects unsafe run IDs and missing binaries', async () => {
  assert.throws(() => validateRunId('production;DROP DATABASE'), /RUN_ID_INVALID/u);
  assert.throws(() => validateRunId('../development'), /RUN_ID_INVALID/u);
  await assert.rejects(
    startNativeMySqlRuntime('missing_binary_test', { binary: '/not-installed/mysqld' }),
    /NATIVE_MYSQL_BINARY_NOT_FOUND/u,
  );
});

test('reports readiness timeout and an early server crash distinctly', async () => {
  const input = {
    socketPath: resolve('/private/tmp', `dd-missing-${process.pid}.sock`),
    binaryDirectory: '/opt/homebrew/opt/mysql@8.4/bin',
    timeoutMs: 150,
  };
  await assert.rejects(
    waitForNativeMySqlReadiness({ ...input, child: { exitCode: null } }),
    /NATIVE_MYSQL_READINESS_TIMEOUT/u,
  );
  await assert.rejects(
    waitForNativeMySqlReadiness({ ...input, child: { exitCode: 1 } }),
    /NATIVE_MYSQL_CRASHED_BEFORE_READY/u,
  );
});

test('rejects a requested port already owned by another process', async () => {
  const server = createServer();
  await new Promise((resolveReady) => server.listen(0, '127.0.0.1', resolveReady));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  try {
    await assert.rejects(
      startNativeMySqlRuntime('port_conflict_test', { port: address.port }),
      /NATIVE_MYSQL_PORT_UNAVAILABLE/u,
    );
  } finally {
    await new Promise((resolveClose) => server.close(resolveClose));
  }
});

test('starts MySQL 8.4 with GTID ROW FULL and cleans only its own runtime', async () => {
  const runId = `lifecycle_${process.pid}`;
  const runtime = await startNativeMySqlRuntime(runId);
  assert.match(runtime.version, /^8\.(?:[4-9]|\d{2,})\./u);
  assert.equal(runtime.gtidMode, 'ON');
  assert.equal(runtime.binlogFormat, 'ROW');
  assert.equal(runtime.binlogRowImage, 'FULL');
  assert.equal(await runtime.query('SELECT 1'), '1');
  assert.equal(existsSync(runtime.runtimeDirectory), true);
  await runtime.stop();
  assert.equal(existsSync(runtime.runtimeDirectory), false);
});

test('keep-run retains evidence after shutdown and explicit cleanup removes it', async () => {
  const runId = `keep_${process.pid}`;
  const runtime = await startNativeMySqlRuntime(runId, { keep: true });
  await runtime.stop({ keep: true });
  assert.equal(existsSync(runtime.runtimeDirectory), true);
  await cleanupNativeMySqlRuntime(runId);
  assert.equal(existsSync(runtime.runtimeDirectory), false);
});
