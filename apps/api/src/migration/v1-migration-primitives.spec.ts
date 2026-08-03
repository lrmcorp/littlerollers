import { migrationTestables } from '../../prisma/v1-migration';

describe('Daily Dose v1 migration primitives', () => {
  it('produces stable checksums independent of object key order', () => {
    expect(migrationTestables.recordChecksum({ a: 1, b: { c: 2 } })).toBe(
      migrationTestables.recordChecksum({ b: { c: 2 }, a: 1 }),
    );
  });

  it('produces deterministic UUID-compatible target IDs', () => {
    const first = migrationTestables.deterministicId('DAILYDOSE_V1:users:42:User');
    expect(first).toBe(migrationTestables.deterministicId('DAILYDOSE_V1:users:42:User'));
    expect(first).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-5[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u);
  });

  it.each([
    ['081234567890', '+6281234567890'],
    ['6281234567890', '+6281234567890'],
    ['+6281234567890', '+6281234567890'],
    ['000000', null],
    ['', null],
  ])('normalizes Indonesian phone %s safely', (source, expected) => {
    expect(migrationTestables.normalizedIndonesianPhone(source)).toBe(expected);
  });

  it('combines a Jakarta date and time into the correct instant', () => {
    expect(migrationTestables.legacyJakartaDateTime('2026-08-02', '09:30:00')?.toISOString()).toBe(
      '2026-08-02T02:30:00.000Z',
    );
  });

  it('rejects invalid time-of-day values', () => {
    expect(() => migrationTestables.minuteOfDay('25:00:00')).toThrow('INVALID_TIME');
  });

  it('never exposes paths or ORM details through operator failure codes', () => {
    expect(
      migrationTestables.safeFailureCode(
        new Error('\nInvalid invocation in /private/project/secret.ts:42'),
        'DELTA_APPLIER_FAILED',
      ),
    ).toBe('DELTA_APPLIER_FAILED');
    expect(
      migrationTestables.safeFailureCode(
        new Error('CREDENTIAL_DIVERGENCE:source hash changed'),
        'DELTA_APPLIER_FAILED',
      ),
    ).toBe('CREDENTIAL_DIVERGENCE');
  });

  it('preserves exact Rupiah values above JavaScript safe integer range', () => {
    expect(migrationTestables.integerText('9007199254740993')).toBe('9007199254740993');
    expect(migrationTestables.jsonInteger('9007199254740993')).toBe('9007199254740993');
    expect(migrationTestables.jsonInteger('100000')).toBe(100000);
  });
});
