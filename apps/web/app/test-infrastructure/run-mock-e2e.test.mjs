import { describe, expect, it } from 'vitest';
import {
  normalizePlaywrightArgs,
  runCommand,
  waitForHttp,
} from '../../e2e/support/run-mock-e2e.mjs';

describe('Playwright mock runner utilities', () => {
  it('forwards Playwright arguments with or without the pnpm separator', () => {
    expect(normalizePlaywrightArgs(['--', '--grep', 'migration'])).toEqual(['--grep', 'migration']);
    expect(normalizePlaywrightArgs(['--workers=5'])).toEqual(['--workers=5']);
  });

  it('reports readiness timeouts distinctly', async () => {
    await expect(
      waitForHttp('http://127.0.0.1:1/__health', { timeoutMs: 20, intervalMs: 5 }),
    ).rejects.toThrow('Readiness timeout');
  });

  it('reports child process failures', async () => {
    const command = runCommand(process.execPath, ['-e', 'process.exit(7)']);
    await expect(command.completion).rejects.toThrow('code 7');
  });
});
