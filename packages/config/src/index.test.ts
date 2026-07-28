import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRuntimeConfig } from './index.js';

const validEnvironment = {
  NODE_ENV: 'test',
  DATABASE_URL: 'mysql://local:local@127.0.0.1:3306/dailydose',
  REDIS_URL: 'redis://127.0.0.1:6379',
  HEALTH_PROBE_TIMEOUT_MS: '2000',
  WORKER_HEARTBEAT_INTERVAL_MS: '10000',
  WORKER_HEARTBEAT_TTL_SECONDS: '30',
  QUOTA_EVALUATION_SYNTHETIC_ENABLED: 'true',
  QUOTA_EVALUATION_POLL_INTERVAL_MS: '10000',
  QUOTA_EVALUATION_LEASE_MS: '30000',
  QUOTA_EVALUATION_MAX_ATTEMPTS: '5',
  QUOTA_EVALUATION_BACKOFF_MS: '60000',
  BOOKING_SYNTHETIC_ENABLED: 'true',
  BOOKING_SYNTHETIC_CUTOFF_HOURS: '2',
  RESCHEDULE_SYNTHETIC_ENABLED: 'true',
  RESCHEDULE_SYNTHETIC_CUTOFF_HOURS: '24',
};

test('loads a complete synthetic local configuration', () => {
  const config = loadRuntimeConfig(validEnvironment);
  assert.equal(config.environment, 'test');
  assert.equal(config.redisUrl, 'redis://127.0.0.1:6379');
  assert.equal(config.quotaEvaluation.syntheticEnabled, true);
  assert.deepEqual(config.booking, { syntheticEnabled: true, cutoffHours: 2 });
  assert.deepEqual(config.reschedule, { syntheticEnabled: true, cutoffHours: 24 });
  assert.deepEqual(config.privateUploads, {
    driver: 'local',
    root: 'apps/api/.local-data/private',
    maxBytes: 8_000_000,
    viewAuthorizationTtlSeconds: 300,
    retentionDays: 30,
  });
  assert.deepEqual(config.paymentProof, {
    maxBytes: 10_000_000,
    scanDriver: 'synthetic',
    syntheticResult: 'CLEAN',
    clamAvHost: null,
    clamAvPort: 3310,
    scanTimeoutMs: 15_000,
    abandonedUploadTtlMinutes: 60,
  });
});

test('does not require object storage credentials for local private uploads', () => {
  const config = loadRuntimeConfig(validEnvironment);
  assert.equal('objectStorage' in config, false);
});

test('loads and validates the public WhatsApp fallback as E.164', () => {
  const config = loadRuntimeConfig({
    ...validEnvironment,
    PUBLIC_SUPPORT_WHATSAPP_E164: '+628111000000',
  });
  assert.equal(config.publicSupportWhatsappE164, '+628111000000');
  assert.throws(() =>
    loadRuntimeConfig({
      ...validEnvironment,
      PUBLIC_SUPPORT_WHATSAPP_E164: '0811-1000-000',
    }),
  );
});

test('never enables synthetic booking in production', () => {
  const config = loadRuntimeConfig({
    ...validEnvironment,
    NODE_ENV: 'production',
    PRIVATE_UPLOAD_ROOT: '/var/lib/dailydose/private',
    PAYMENT_PROOF_SCAN_DRIVER: 'clamav',
    PAYMENT_PROOF_CLAMAV_HOST: '127.0.0.1',
  });
  assert.deepEqual(config.booking, { syntheticEnabled: false, cutoffHours: 2 });
  assert.deepEqual(config.reschedule, { syntheticEnabled: false, cutoffHours: 24 });
});

test('rejects synthetic payment scanning in production and validates scanner settings', () => {
  assert.throws(() =>
    loadRuntimeConfig({
      ...validEnvironment,
      NODE_ENV: 'production',
      PRIVATE_UPLOAD_ROOT: '/var/lib/dailydose/private',
      PAYMENT_PROOF_SCAN_DRIVER: 'synthetic',
    }),
  );
  assert.throws(() =>
    loadRuntimeConfig({
      ...validEnvironment,
      PAYMENT_PROOF_SCAN_DRIVER: 'clamav',
      PAYMENT_PROOF_CLAMAV_HOST: '',
    }),
  );
  assert.throws(() =>
    loadRuntimeConfig({
      ...validEnvironment,
      PAYMENT_PROOF_SYNTHETIC_SCAN_RESULT: 'TIMEOUT',
    }),
  );
});

test('does not invent defaults for production-required values', () => {
  assert.throws(() => loadRuntimeConfig({ NODE_ENV: 'production' }));
});

test('requires private upload root in production and validates limits', () => {
  assert.throws(() =>
    loadRuntimeConfig({ ...validEnvironment, NODE_ENV: 'production', PRIVATE_UPLOAD_ROOT: '' }),
  );
  assert.throws(() => loadRuntimeConfig({ ...validEnvironment, PRIVATE_UPLOAD_MAX_BYTES: '0' }));
  assert.throws(() =>
    loadRuntimeConfig({ ...validEnvironment, PRIVATE_UPLOAD_MAX_BYTES: '8000001' }),
  );
});
