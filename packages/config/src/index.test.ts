import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRuntimeConfig } from './index.js';

const validEnvironment = {
  NODE_ENV: 'test',
  DATABASE_URL: 'mysql://local:local@127.0.0.1:3306/dailydose',
  HEALTH_PROBE_TIMEOUT_MS: '2000',
  QUOTA_EVALUATION_SYNTHETIC_ENABLED: 'true',
  QUOTA_EVALUATION_POLL_INTERVAL_MS: '10000',
  QUOTA_EVALUATION_LEASE_MS: '30000',
  QUOTA_EVALUATION_MAX_ATTEMPTS: '5',
  QUOTA_EVALUATION_BACKOFF_MS: '60000',
  BOOKING_SYNTHETIC_ENABLED: 'true',
  BOOKING_SYNTHETIC_CUTOFF_HOURS: '2',
  RESCHEDULE_SYNTHETIC_ENABLED: 'true',
  RESCHEDULE_SYNTHETIC_CUTOFF_HOURS: '24',
  BOOKING_CANCELLATION_ENABLED: 'true',
  BOOKING_CANCELLATION_CUTOFF_HOURS: '24',
};

test('loads a complete synthetic local configuration', () => {
  const config = loadRuntimeConfig(validEnvironment);
  assert.equal(config.environment, 'test');
  assert.equal(config.quotaEvaluation.syntheticEnabled, true);
  assert.deepEqual(config.booking, { enabled: true, cutoffHours: 2 });
  assert.deepEqual(config.reschedule, { enabled: true, cutoffHours: 24 });
  assert.deepEqual(config.bookingCancellation, { enabled: true, cutoffHours: 24 });
  assert.deepEqual(config.mobileFeatures, {
    accountRecovery: false,
    revokeAllSessions: false,
    customerCheckIn: false,
    instructorCheckIn: false,
  });
  assert.deepEqual(config.sessionAdjustment, { enabled: true });
  assert.deepEqual(config.rbac, { policySource: 'static', managementEnabled: false });
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

test('validates RBAC rollout source and management gate', () => {
  assert.deepEqual(
    loadRuntimeConfig({
      ...validEnvironment,
      RBAC_POLICY_SOURCE: 'shadow',
      RBAC_MANAGEMENT_ENABLED: 'false',
    }).rbac,
    { policySource: 'shadow', managementEnabled: false },
  );
  assert.deepEqual(
    loadRuntimeConfig({
      ...validEnvironment,
      RBAC_POLICY_SOURCE: 'database',
      RBAC_MANAGEMENT_ENABLED: 'true',
    }).rbac,
    { policySource: 'database', managementEnabled: true },
  );
  assert.throws(() =>
    loadRuntimeConfig({
      ...validEnvironment,
      RBAC_POLICY_SOURCE: 'shadow',
      RBAC_MANAGEMENT_ENABLED: 'true',
    }),
  );
  assert.throws(() =>
    loadRuntimeConfig({ ...validEnvironment, RBAC_POLICY_SOURCE: 'unsupported' }),
  );
});

test('does not require object storage credentials for local private uploads', () => {
  const config = loadRuntimeConfig(validEnvironment);
  assert.equal(config.privateUploads.driver, 'local');
  assert.equal(config.privateUploads.objectStorage, undefined);
});

test('loads object storage configuration for s3 and minio drivers', () => {
  const minioConfig = loadRuntimeConfig({
    ...validEnvironment,
    PRIVATE_UPLOAD_DRIVER: 'minio',
    OBJECT_STORAGE_ENDPOINT: 'http://localhost:9000',
    OBJECT_STORAGE_BUCKET: 'dailydose-private',
    OBJECT_STORAGE_ACCESS_KEY: 'dailydose_local',
    OBJECT_STORAGE_SECRET_KEY: 'dailydose_local_only',
  });
  assert.equal(minioConfig.privateUploads.driver, 'minio');
  assert.equal(minioConfig.privateUploads.objectStorage?.endpoint, 'http://localhost:9000');
  assert.equal(minioConfig.privateUploads.objectStorage?.bucket, 'dailydose-private');
  assert.equal(minioConfig.privateUploads.objectStorage?.accessKey, 'dailydose_local');
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

test('uses only production policy variables in production', () => {
  const config = loadRuntimeConfig({
    ...validEnvironment,
    NODE_ENV: 'production',
    BOOKING_CANCELLATION_ENABLED: undefined,
    BOOKING_CANCELLATION_CUTOFF_HOURS: undefined,
    PRIVATE_UPLOAD_ROOT: '/var/lib/dailydose/private',
    PAYMENT_PROOF_SCAN_DRIVER: 'clamav',
    PAYMENT_PROOF_CLAMAV_HOST: '127.0.0.1',
  });
  assert.deepEqual(config.booking, { enabled: false, cutoffHours: null });
  assert.deepEqual(config.reschedule, { enabled: false, cutoffHours: null });
  assert.deepEqual(config.bookingCancellation, { enabled: false, cutoffHours: null });
  assert.deepEqual(config.mobileFeatures, {
    accountRecovery: false,
    revokeAllSessions: false,
    customerCheckIn: false,
    instructorCheckIn: false,
  });
  assert.deepEqual(config.sessionAdjustment, { enabled: false });
  assert.deepEqual(config.identityReview, { enabled: false });
  const enabled = loadRuntimeConfig({
    ...validEnvironment,
    NODE_ENV: 'production',
    PRIVATE_UPLOAD_ROOT: '/var/lib/dailydose/private',
    PAYMENT_PROOF_SCAN_DRIVER: 'clamav',
    PAYMENT_PROOF_CLAMAV_HOST: '127.0.0.1',
    BOOKING_ENABLED: 'true',
    BOOKING_CUTOFF_HOURS: '2',
    RESCHEDULE_ENABLED: 'true',
    RESCHEDULE_CUTOFF_HOURS: '24',
    BOOKING_CANCELLATION_ENABLED: 'true',
    BOOKING_CANCELLATION_CUTOFF_HOURS: '24',
    SESSION_ADJUSTMENT_ENABLED: 'true',
    IDENTITY_REVIEW_ENABLED: 'true',
    MOBILE_ACCOUNT_RECOVERY_ENABLED: 'true',
    MOBILE_REVOKE_ALL_SESSIONS_ENABLED: 'true',
    MOBILE_CUSTOMER_CHECK_IN_ENABLED: 'true',
    MOBILE_INSTRUCTOR_CHECK_IN_ENABLED: 'true',
  });
  assert.deepEqual(enabled.booking, { enabled: true, cutoffHours: 2 });
  assert.deepEqual(enabled.reschedule, { enabled: true, cutoffHours: 24 });
  assert.deepEqual(enabled.bookingCancellation, { enabled: true, cutoffHours: 24 });
  assert.deepEqual(enabled.sessionAdjustment, { enabled: true });
  assert.deepEqual(enabled.identityReview, { enabled: true });
  assert.deepEqual(enabled.mobileFeatures, {
    accountRecovery: true,
    revokeAllSessions: true,
    customerCheckIn: true,
    instructorCheckIn: true,
  });
  assert.throws(() =>
    loadRuntimeConfig({
      ...validEnvironment,
      NODE_ENV: 'production',
      PRIVATE_UPLOAD_ROOT: '/var/lib/dailydose/private',
      PAYMENT_PROOF_SCAN_DRIVER: 'clamav',
      PAYMENT_PROOF_CLAMAV_HOST: '127.0.0.1',
      RESCHEDULE_ENABLED: 'true',
    }),
  );
});

test('validates scanner settings and allows synthetic scanning in production', () => {
  const production = loadRuntimeConfig({
    ...validEnvironment,
    NODE_ENV: 'production',
    PRIVATE_UPLOAD_ROOT: '/var/lib/dailydose/private',
    PAYMENT_PROOF_SCAN_DRIVER: 'synthetic',
  });
  assert.equal(production.paymentProof.scanDriver, 'synthetic');
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

test('validates production SMTP and rejects recipient override', () => {
  const production = {
    ...validEnvironment,
    NODE_ENV: 'production',
    PRIVATE_UPLOAD_ROOT: '/var/lib/dailydose/private',
    PAYMENT_PROOF_SCAN_DRIVER: 'clamav',
    PAYMENT_PROOF_CLAMAV_HOST: 'clamav',
    EMAIL_DELIVERY_ENABLED: 'true',
    SMTP_HOST: 'smtp.hostinger.com',
    SMTP_USER: 'noreply@dailydosepilates.com',
    SMTP_PASSWORD: 'secret',
    SMTP_FROM_EMAIL: 'noreply@dailydosepilates.com',
    NOTIFICATION_ENCRYPTION_KEY: Buffer.alloc(32, 1).toString('base64'),
  };
  assert.equal(loadRuntimeConfig(production).email.smtpPort, 465);
  assert.throws(() => loadRuntimeConfig({ ...production, EMAIL_RECIPIENT_OVERRIDE: 'sink@test' }));
  assert.throws(() => loadRuntimeConfig({ ...production, SMTP_PASSWORD: '' }));
  assert.throws(() => loadRuntimeConfig({ ...production, NOTIFICATION_ENCRYPTION_KEY: 'short' }));
  assert.throws(() =>
    loadRuntimeConfig({ ...production, SMTP_FROM_NAME: 'Daily Dose\r\nBcc: leak@example.test' }),
  );
  assert.throws(() => loadRuntimeConfig({ ...production, SMTP_FROM_EMAIL: 'not-an-email' }));
});
