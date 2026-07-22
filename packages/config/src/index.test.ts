import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRuntimeConfig } from './index.js';

const validEnvironment = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://local:local@127.0.0.1:55432/dailydose',
  REDIS_URL: 'redis://127.0.0.1:6379',
  HEALTH_PROBE_TIMEOUT_MS: '2000',
  WORKER_HEARTBEAT_INTERVAL_MS: '10000',
  WORKER_HEARTBEAT_TTL_SECONDS: '30',
  QUOTA_EVALUATION_SYNTHETIC_ENABLED: 'true',
  QUOTA_EVALUATION_POLL_INTERVAL_MS: '10000',
  QUOTA_EVALUATION_LEASE_MS: '30000',
  QUOTA_EVALUATION_MAX_ATTEMPTS: '5',
  QUOTA_EVALUATION_BACKOFF_MS: '60000',
  OBJECT_STORAGE_ENDPOINT: 'http://127.0.0.1:9000',
  OBJECT_STORAGE_ACCESS_KEY: 'local-only',
  OBJECT_STORAGE_SECRET_KEY: 'local-only-secret',
  OBJECT_STORAGE_BUCKET: 'dailydose-private',
  BOOKING_SYNTHETIC_ENABLED: 'true',
  BOOKING_SYNTHETIC_CUTOFF_HOURS: '2',
};

test('loads a complete synthetic local configuration', () => {
  const config = loadRuntimeConfig(validEnvironment);
  assert.equal(config.environment, 'test');
  assert.equal(config.redisUrl, 'redis://127.0.0.1:6379');
  assert.equal(config.quotaEvaluation.syntheticEnabled, true);
  assert.deepEqual(config.booking, { syntheticEnabled: true, cutoffHours: 2 });
});

test('never enables synthetic booking in production', () => {
  const config = loadRuntimeConfig({ ...validEnvironment, NODE_ENV: 'production' });
  assert.deepEqual(config.booking, { syntheticEnabled: false, cutoffHours: 2 });
});

test('does not invent defaults for production-required values', () => {
  assert.throws(() => loadRuntimeConfig({ NODE_ENV: 'production' }));
});
