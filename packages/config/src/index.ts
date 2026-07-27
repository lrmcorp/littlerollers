export type RuntimeEnvironment = 'development' | 'test' | 'production';

export interface RuntimeConfig {
  environment: RuntimeEnvironment;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  healthProbeTimeoutMs: number;
  workerHeartbeatIntervalMs: number;
  workerHeartbeatTtlSeconds: number;
  quotaEvaluation: {
    syntheticEnabled: boolean;
    pollIntervalMs: number;
    leaseMs: number;
    maxAttempts: number;
    backoffMs: number;
  };
  booking: {
    syntheticEnabled: boolean;
    cutoffHours: number | null;
  };
  reschedule: {
    syntheticEnabled: boolean;
    cutoffHours: number | null;
  };
  privateUploads: {
    driver: 'local';
    root: string;
    maxBytes: number;
    viewAuthorizationTtlSeconds: number;
    retentionDays: number;
  };
  publicSupportWhatsappE164: string | null;
}

const required = (env: NodeJS.ProcessEnv, key: string): string => {
  const value = env[key]?.trim();
  if (!value) throw new Error(`CONFIGURATION_MISSING:${key}`);
  return value;
};

export function loadRuntimeConfig(env: NodeJS.ProcessEnv): RuntimeConfig {
  const environment = (env.NODE_ENV ?? 'development') as RuntimeEnvironment;
  if (!['development', 'test', 'production'].includes(environment))
    throw new Error('CONFIGURATION_INVALID:NODE_ENV');
  const port = Number(env.PORT ?? '3001');
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('CONFIGURATION_INVALID:PORT');
  const positiveInteger = (key: string): number => {
    const value = Number(required(env, key));
    if (!Number.isInteger(value) || value < 1) throw new Error(`CONFIGURATION_INVALID:${key}`);
    return value;
  };
  const bookingSyntheticEnabled =
    environment !== 'production' && env.BOOKING_SYNTHETIC_ENABLED === 'true';
  const bookingCutoffValue = env.BOOKING_SYNTHETIC_CUTOFF_HOURS?.trim();
  const bookingCutoffHours = bookingCutoffValue ? Number(bookingCutoffValue) : null;
  if (
    bookingCutoffHours !== null &&
    (!Number.isInteger(bookingCutoffHours) || bookingCutoffHours < 1)
  )
    throw new Error('CONFIGURATION_INVALID:BOOKING_SYNTHETIC_CUTOFF_HOURS');
  const rescheduleSyntheticEnabled =
    environment !== 'production' && env.RESCHEDULE_SYNTHETIC_ENABLED === 'true';
  const rescheduleCutoffValue = env.RESCHEDULE_SYNTHETIC_CUTOFF_HOURS?.trim();
  const rescheduleCutoffHours = rescheduleCutoffValue ? Number(rescheduleCutoffValue) : null;
  if (
    rescheduleCutoffHours !== null &&
    (!Number.isInteger(rescheduleCutoffHours) || rescheduleCutoffHours < 1)
  )
    throw new Error('CONFIGURATION_INVALID:RESCHEDULE_SYNTHETIC_CUTOFF_HOURS');
  const privateUploadDriver = env.PRIVATE_UPLOAD_DRIVER?.trim() || 'local';
  if (privateUploadDriver !== 'local')
    throw new Error('CONFIGURATION_INVALID:PRIVATE_UPLOAD_DRIVER');
  const privateUploadRoot =
    env.PRIVATE_UPLOAD_ROOT?.trim() ||
    (environment === 'production'
      ? required(env, 'PRIVATE_UPLOAD_ROOT')
      : 'apps/api/.local-data/private');
  const configuredPositiveInteger = (key: string, fallback: number): number => {
    const raw = env[key]?.trim();
    if (!raw) return fallback;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 1) throw new Error(`CONFIGURATION_INVALID:${key}`);
    return value;
  };
  const privateUploadMaxBytes = configuredPositiveInteger('PRIVATE_UPLOAD_MAX_BYTES', 8_000_000);
  if (privateUploadMaxBytes > 8_000_000)
    throw new Error('CONFIGURATION_INVALID:PRIVATE_UPLOAD_MAX_BYTES');
  const publicSupportWhatsappE164 = env.PUBLIC_SUPPORT_WHATSAPP_E164?.trim() || null;
  if (publicSupportWhatsappE164 && !/^\+[1-9]\d{7,14}$/.test(publicSupportWhatsappE164))
    throw new Error('CONFIGURATION_INVALID:PUBLIC_SUPPORT_WHATSAPP_E164');
  return {
    environment,
    port,
    databaseUrl: required(env, 'DATABASE_URL'),
    redisUrl: required(env, 'REDIS_URL'),
    healthProbeTimeoutMs: positiveInteger('HEALTH_PROBE_TIMEOUT_MS'),
    workerHeartbeatIntervalMs: positiveInteger('WORKER_HEARTBEAT_INTERVAL_MS'),
    workerHeartbeatTtlSeconds: positiveInteger('WORKER_HEARTBEAT_TTL_SECONDS'),
    quotaEvaluation: {
      syntheticEnabled:
        environment !== 'production' && env.QUOTA_EVALUATION_SYNTHETIC_ENABLED === 'true',
      pollIntervalMs: positiveInteger('QUOTA_EVALUATION_POLL_INTERVAL_MS'),
      leaseMs: positiveInteger('QUOTA_EVALUATION_LEASE_MS'),
      maxAttempts: positiveInteger('QUOTA_EVALUATION_MAX_ATTEMPTS'),
      backoffMs: positiveInteger('QUOTA_EVALUATION_BACKOFF_MS'),
    },
    booking: {
      syntheticEnabled: bookingSyntheticEnabled,
      cutoffHours: bookingCutoffHours,
    },
    reschedule: {
      syntheticEnabled: rescheduleSyntheticEnabled,
      cutoffHours: rescheduleCutoffHours,
    },
    privateUploads: {
      driver: 'local',
      root: privateUploadRoot,
      maxBytes: privateUploadMaxBytes,
      viewAuthorizationTtlSeconds: configuredPositiveInteger('PRIVATE_VIEW_AUTH_TTL_SECONDS', 300),
      retentionDays: configuredPositiveInteger('IDENTITY_DOCUMENT_RETENTION_DAYS', 30),
    },
    publicSupportWhatsappE164,
  };
}
