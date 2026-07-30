import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('navigation CSS ownership', () => {
  it('does not reintroduce the legacy nav-scroll selector', () => {
    const appRoot = resolve(process.cwd(), 'app');
    const legacyCss = readFileSync(resolve(appRoot, 'legacy-ui.css'), 'utf8');
    const navigationSource = readFileSync(resolve(appRoot, 'app-navigation.tsx'), 'utf8');

    expect(legacyCss).not.toMatch(/\.nav-scroll\b/);
    expect(navigationSource).not.toContain('nav-scroll');
    expect(navigationSource).toContain('workspace-navigation-scroll');
  });
});
