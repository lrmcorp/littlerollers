import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('navigation CSS ownership', () => {
  it('ensures legacy css files are fully eliminated and navigation uses clean classes', () => {
    const appRoot = resolve(process.cwd(), 'app');
    expect(existsSync(resolve(appRoot, 'legacy-ui.css'))).toBe(false);
    expect(existsSync(resolve(appRoot, 'legacy-compatibility.css'))).toBe(false);

    const navigationSource = readFileSync(resolve(appRoot, 'app-navigation.tsx'), 'utf8');
    expect(navigationSource).not.toContain('nav-scroll');
    expect(navigationSource).toContain('workspace-navigation-scroll');
  });
});
