import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseArguments,
  validateRehearsalEnvironment,
  validateStopAfterPhase,
} from './v1-migration-rehearsal.mjs';

const validEnvironment = {
  DATABASE_URL: 'mysql://target@target.invalid/dailydose_v2',
  V1_DATABASE_URL: 'mysql://source@source.invalid/dailydose_v1',
  V1_DUMP_SHA256: 'a'.repeat(64),
  V1_SNAPSHOT_AT: '2026-08-03T01:00:05.000Z',
  V1_SNAPSHOT_STARTED_AT: '2026-08-03T01:00:00.000Z',
  V1_SNAPSHOT_COMPLETED_AT: '2026-08-03T01:00:05.000Z',
  V1_SNAPSHOT_GTID: 'fixture:1-100',
  V1_MAPPING_VERSION: '2.0.0',
  V1_MIGRATION_MEDIA_MODE: 'metadata-only',
  V1_BRANCH_CODES: '{"1":"SYN"}',
  V1_BRANCH_TIMEZONES: '{"1":"Asia/Jakarta"}',
  V1_MIGRATION_ACTOR_SOURCE_USER_ID: '1',
  MIGRATION_PII_KEY_BASE64: 'fixture',
  MIGRATION_PII_HASH_PEPPER: 'fixture',
  V1_EXPECTED_SOURCE_MYSQL_VERSION: '8.4',
  V1_REHEARSAL_CONFIRMATION: 'REHEARSAL_1_DATABASE_ONLY',
};

test('parses explicit execution and resume flags', () => {
  assert.deepEqual(
    parseArguments(['run', '--env-file', '/tmp/rehearsal.env', '--execute', '--resume']),
    {
      _: ['run'],
      'env-file': '/tmp/rehearsal.env',
      execute: true,
      resume: true,
    },
  );
});

test('validates controlled pause phases', () => {
  assert.equal(validateStopAfterPhase('user-role'), 'user-role');
  assert.throws(() => validateStopAfterPhase('not-a-phase'), /STOP_AFTER_PHASE_INVALID/u);
});

test('accepts the locked database-only rehearsal environment', () => {
  const result = validateRehearsalEnvironment(validEnvironment);
  assert.equal(result.snapshotCompletedAt, validEnvironment.V1_SNAPSHOT_COMPLETED_AT);
  assert.match(result.snapshotGtidHash, /^[a-f0-9]{64}$/u);
});

test('rejects active media and source-target identity conflicts', () => {
  assert.throws(
    () =>
      validateRehearsalEnvironment({
        ...validEnvironment,
        V1_MIGRATION_MEDIA_MODE: 'active',
      }),
    /V1_MIGRATION_MEDIA_MODE_MUST_BE_METADATA_ONLY/u,
  );
  assert.throws(
    () =>
      validateRehearsalEnvironment({
        ...validEnvironment,
        DATABASE_URL: validEnvironment.V1_DATABASE_URL,
      }),
    /SOURCE_AND_TARGET_MUST_DIFFER/u,
  );
});

test('rejects an inconsistent snapshot window or unapproved mapping', () => {
  assert.throws(
    () =>
      validateRehearsalEnvironment({
        ...validEnvironment,
        V1_SNAPSHOT_STARTED_AT: '2026-08-03T01:00:06.000Z',
      }),
    /V1_SNAPSHOT_WINDOW_INVALID/u,
  );
  assert.throws(
    () => validateRehearsalEnvironment({ ...validEnvironment, V1_MAPPING_VERSION: '1.0.0' }),
    /V1_MAPPING_VERSION_NOT_APPROVED/u,
  );
});
