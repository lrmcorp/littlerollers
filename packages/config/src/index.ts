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
  objectStorage: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
    useSsl: boolean;
  };
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
    objectStorage: {
      endpoint: required(env, 'OBJECT_STORAGE_ENDPOINT'),
      accessKey: required(env, 'OBJECT_STORAGE_ACCESS_KEY'),
      secretKey: required(env, 'OBJECT_STORAGE_SECRET_KEY'),
      bucket: required(env, 'OBJECT_STORAGE_BUCKET'),
      useSsl: env.OBJECT_STORAGE_USE_SSL === 'true',
    },
  };
}
