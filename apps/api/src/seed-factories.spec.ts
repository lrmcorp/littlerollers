import {
  assertSeedAllowed,
  createSeedContext,
  deterministicId,
  resolveProfile,
} from '../prisma/seed/context';
import { demoUsers } from '../prisma/seed/identities';
import { branchTemplates, validateMasterTemplates } from '../prisma/seed/master-data';

describe('seed factory foundation', () => {
  it('creates stable UUID-shaped IDs by namespace and key', () => {
    expect(deterministicId('branch', 'DD-JKT')).toBe(deterministicId('branch', 'DD-JKT'));
    expect(deterministicId('branch', 'DD-JKT')).not.toBe(deterministicId('branch', 'DD-BSD'));
    expect(deterministicId('branch', 'DD-JKT')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  it('defaults to demo and rejects unsupported profiles', () => {
    expect(resolveProfile('')).toBe('demo');
    expect(resolveProfile('minimal')).toBe('minimal');
    expect(() => resolveProfile('unsafe')).toThrow('Unsupported SEED_PROFILE');
  });

  it('fails before database access in production', () => {
    expect(() =>
      assertSeedAllowed('minimal', { NODE_ENV: 'production' } as NodeJS.ProcessEnv),
    ).toThrow('forbidden in production');
  });

  it('provides the requested global super owner demo account', () => {
    expect(demoUsers).toContainEqual(
      expect.objectContaining({
        key: 'ralamzah-super-owner',
        email: 'ralamzah@gmail.com',
        password: 'ridho123',
        role: 'SUPER_OWNER',
      }),
    );
  });

  it('anchors relative scenario dates deterministically', () => {
    const context = createSeedContext({} as never, 'demo', new Date('2026-07-26T19:30:00Z'));
    expect(context.anchor.toISOString()).toBe('2026-07-26T02:00:00.000Z');
    expect(context.at(1, 2).toISOString()).toBe('2026-07-27T04:00:00.000Z');
  });

  it('validates branch overrides and rejects duplicate branch codes', () => {
    expect(() => validateMasterTemplates()).not.toThrow();
    expect(() =>
      validateMasterTemplates([
        branchTemplates[0]!,
        { ...branchTemplates[1]!, code: branchTemplates[0]!.code },
      ]),
    ).toThrow('Duplicate branch code');
  });
});
