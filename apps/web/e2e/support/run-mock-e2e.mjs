import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { startMockApiServer } from './mock-api-server.mjs';

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function normalizePlaywrightArgs(args) {
  return args[0] === '--' ? args.slice(1) : args;
}

export async function availablePort(host = '127.0.0.1') {
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, host, resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a TCP port.');
  const port = address.port;
  await new Promise((resolveClose, reject) =>
    server.close((error) => (error ? reject(error) : resolveClose())),
  );
  return port;
}

export async function waitForHttp(url, { timeoutMs = 60_000, intervalMs = 200 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, intervalMs));
  }
  throw new Error(`Readiness timeout for ${url}: ${lastError?.message ?? 'no response'}`);
}

function attachOutput(child, logStream) {
  child.stdout?.on('data', (chunk) => {
    process.stdout.write(chunk);
    logStream.write(chunk);
  });
  child.stderr?.on('data', (chunk) => {
    process.stderr.write(chunk);
    logStream.write(chunk);
  });
}

export function runCommand(command, args, { cwd = webRoot, env = process.env, logStream } = {}) {
  const child = spawn(command, args, { cwd, env, stdio: ['inherit', 'pipe', 'pipe'] });
  if (logStream) attachOutput(child, logStream);
  else {
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  }
  const completion = new Promise((resolveCompletion, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolveCompletion({ code, signal });
      else reject(new Error(`${command} exited with ${signal ?? `code ${code}`}`));
    });
  });
  return { child, completion };
}

async function stopChild(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([
    new Promise((resolveExit) => child.once('exit', resolveExit)),
    new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5_000)),
  ]);
  if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
}

export async function runMockE2E(cliArgs = process.argv.slice(2)) {
  const runId = `pw_${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}_${process.pid}`;
  const distRelative = `.next-playwright-runs/${runId}`;
  const distAbsolute = join(webRoot, distRelative);
  const generatedTsconfigName = `tsconfig.playwright.${runId}.json`;
  const generatedTsconfig = join(webRoot, generatedTsconfigName);
  const nextEnvPath = join(webRoot, 'next-env.d.ts');
  const evidenceDir = join(webRoot, 'playwright-evidence', runId);
  const keepRun = process.env.DD_PLAYWRIGHT_KEEP_RUN === 'true';
  await mkdir(evidenceDir, { recursive: true });
  await copyFile(join(webRoot, 'tsconfig.json'), generatedTsconfig);
  const originalNextEnv = await readFile(nextEnvPath, 'utf8');
  const logStream = createWriteStream(join(evidenceDir, 'runner.log'), { flags: 'a' });
  const startedAt = new Date().toISOString();
  let mockApi;
  let nextChild;
  let interruptedSignal = null;
  let failure = null;
  let stopping = false;

  const stopOnSignal = (signal) => {
    interruptedSignal = signal;
    nextChild?.kill(signal);
  };
  process.once('SIGINT', stopOnSignal);
  process.once('SIGTERM', stopOnSignal);

  try {
    mockApi = await startMockApiServer({ runId });
    await waitForHttp(`${mockApi.url}/__health`, { timeoutMs: 5_000 });
    const webPort = await availablePort();
    const webUrl = `http://127.0.0.1:${webPort}`;
    const sharedEnv = {
      ...process.env,
      API_BASE_URL: mockApi.url,
      NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED: 'true',
      NEXT_DIST_DIR: distRelative,
      NEXT_TYPESCRIPT_CONFIG: generatedTsconfigName,
      DD_PLAYWRIGHT_MOCK: 'true',
      DD_PLAYWRIGHT_BASE_URL: webUrl,
      DD_PLAYWRIGHT_RUN_ID: runId,
    };

    process.stdout.write(`[mock-e2e] run=${runId} api=${mockApi.url} web=${webUrl}\n`);
    const build = runCommand('pnpm', ['exec', 'next', 'build'], {
      env: sharedEnv,
      logStream,
    });
    await build.completion;

    const next = runCommand('pnpm', ['exec', 'next', 'start', '-p', String(webPort)], {
      env: sharedEnv,
      logStream,
    });
    nextChild = next.child;
    next.completion.catch((error) => {
      if (!failure && !interruptedSignal && !stopping) failure = error;
    });
    await waitForHttp(webUrl, { timeoutMs: 60_000 });
    if (failure) throw failure;

    const playwrightArgs = [
      'exec',
      'playwright',
      'test',
      '--config',
      'playwright.mock.config.ts',
      ...normalizePlaywrightArgs(cliArgs),
    ];
    const playwright = runCommand('pnpm', playwrightArgs, { env: sharedEnv, logStream });
    await playwright.completion;

    if (mockApi.unhandled.length > 0) {
      const unique = [
        ...new Map(
          mockApi.unhandled.map((item) => [`${item.method} ${item.pathname}`, item]),
        ).values(),
      ];
      throw new Error(
        `Mock API has ${mockApi.unhandled.length} unhandled request(s): ${unique
          .map((item) => `${item.method} ${item.pathname}`)
          .join(', ')}`,
      );
    }
  } catch (error) {
    failure = error;
  } finally {
    process.removeListener('SIGINT', stopOnSignal);
    process.removeListener('SIGTERM', stopOnSignal);
    stopping = true;
    await stopChild(nextChild);
    await mockApi?.close();

    const evidence = {
      runId,
      startedAt,
      finishedAt: new Date().toISOString(),
      status: failure || interruptedSignal ? 'FAILED' : 'PASSED',
      signal: interruptedSignal,
      error: failure instanceof Error ? failure.message : failure ? String(failure) : null,
      nextDistDir: distRelative,
      keepRun,
      requests: mockApi?.requests ?? [],
      unhandled: mockApi?.unhandled ?? [],
    };
    try {
      await mkdir(evidenceDir, { recursive: true });
      await writeFile(join(evidenceDir, 'evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);
    } finally {
      await new Promise((resolveLog) => logStream.end(resolveLog));
      if (!keepRun) await rm(distAbsolute, { recursive: true, force: true });
      await rm(generatedTsconfig, { force: true });
      await writeFile(nextEnvPath, originalNextEnv);
    }
  }

  if (interruptedSignal) {
    process.kill(process.pid, interruptedSignal);
    return;
  }
  if (failure) throw failure;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runMockE2E().catch((error) => {
    process.stderr.write(`[mock-e2e] ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
