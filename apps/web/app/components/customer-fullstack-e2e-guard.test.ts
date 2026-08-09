import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('customer full-stack E2E guardrail', () => {
  it('tidak mencegat atau memalsukan endpoint bisnis', () => {
    const sources = ['e2e/customer-fullstack.spec.ts', 'e2e/customer-fullstack-fixture.ts'].map(
      (path) => readFileSync(resolve(process.cwd(), path), 'utf8'),
    );
    const combined = sources.join('\n');

    expect(combined).not.toMatch(/\bpage\.route\s*\(/u);
    expect(combined).not.toMatch(/\bcontext\.route\s*\(/u);
    expect(combined).not.toMatch(/\broute\.(?:fulfill|abort)\s*\(/u);
  });
});
