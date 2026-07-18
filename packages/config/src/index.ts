export type RuntimeEnvironment = 'development' | 'test' | 'production';

export interface RuntimeConfig {
  environment: RuntimeEnvironment;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  healthProbeTimeoutMs: number;
  workerHeartbeatIntervalMs: number;
  workerHeartbeatTtlSeconds: number;
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
  return {
    environment,
    port,
    databaseUrl: required(env, 'DATABASE_URL'),
    redisUrl: required(env, 'REDIS_URL'),
    healthProbeTimeoutMs: positiveInteger('HEALTH_PROBE_TIMEOUT_MS'),
    workerHeartbeatIntervalMs: positiveInteger('WORKER_HEARTBEAT_INTERVAL_MS'),
    workerHeartbeatTtlSeconds: positiveInteger('WORKER_HEARTBEAT_TTL_SECONDS'),
    objectStorage: {
      endpoint: required(env, 'OBJECT_STORAGE_ENDPOINT'),
      accessKey: required(env, 'OBJECT_STORAGE_ACCESS_KEY'),
      secretKey: required(env, 'OBJECT_STORAGE_SECRET_KEY'),
      bucket: required(env, 'OBJECT_STORAGE_BUCKET'),
      useSsl: env.OBJECT_STORAGE_USE_SSL === 'true',
    },
  };
}
