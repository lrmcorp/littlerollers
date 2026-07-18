import { HealthService } from './health.service';

const config = {
  value: {
    redisUrl: 'redis://127.0.0.1:6379',
    healthProbeTimeoutMs: 10,
    objectStorage: { endpoint: 'http://127.0.0.1:9000' },
  },
};

describe('HealthService', () => {
  afterEach(() => jest.restoreAllMocks());

  function service(options?: {
    databaseFails?: boolean;
    databaseTimeout?: boolean;
    redisFails?: boolean;
    stale?: boolean;
    missingHeartbeat?: boolean;
    storageFails?: boolean;
  }) {
    const prisma = {
      $queryRaw: options?.databaseTimeout
        ? jest.fn().mockReturnValue(new Promise(() => undefined))
        : options?.databaseFails
          ? jest.fn().mockRejectedValue(new Error('password=secret'))
          : jest.fn().mockResolvedValue([1]),
    };
    const health = new HealthService(config as never, prisma as never);
    const redis = {
      status: 'ready',
      ping: options?.redisFails
        ? jest.fn().mockRejectedValue(new Error('redis://credential'))
        : jest.fn().mockResolvedValue('PONG'),
      get: jest
        .fn()
        .mockResolvedValue(
          options?.missingHeartbeat
            ? null
            : options?.stale
              ? new Date(0).toISOString()
              : new Date().toISOString(),
        ),
      disconnect: jest.fn(),
    };
    (health as unknown as { redis: typeof redis }).redis = redis;
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: !options?.storageFails } as Response);
    return health;
  }

  it('reports READY when all probes are ready', async () => {
    expect((await service().check()).status).toBe('READY');
  });

  it('reports DEGRADED for a stale worker heartbeat', async () => {
    const result = await service({ stale: true }).check();
    expect(result.status).toBe('DEGRADED');
    expect(result.dependencies).toContainEqual({
      name: 'worker',
      status: 'DEGRADED',
      detailCode: 'STALE_HEARTBEAT',
    });
  });

  it('reports DEGRADED when the worker heartbeat is missing', async () => {
    const result = await service({ missingHeartbeat: true }).check();
    expect(result.dependencies).toContainEqual({
      name: 'worker',
      status: 'DEGRADED',
      detailCode: 'STALE_HEARTBEAT',
    });
  });

  it('reports DEGRADED when object storage is unreachable', async () => {
    const result = await service({ storageFails: true }).check();
    expect(result.status).toBe('DEGRADED');
    expect(result.dependencies).toContainEqual({
      name: 'object-storage',
      status: 'DEGRADED',
      detailCode: 'UNREACHABLE',
    });
  });

  it('reports NOT_READY for critical database failure without leaking its error', async () => {
    const serialized = JSON.stringify(await service({ databaseFails: true }).check());
    expect(serialized).toContain('NOT_READY');
    expect(serialized).not.toContain('secret');
  });

  it('reports NOT_READY for Redis failure', async () => {
    expect((await service({ redisFails: true }).check()).status).toBe('NOT_READY');
  });

  it('reports a credential-safe timeout for a database probe', async () => {
    const result = await service({ databaseTimeout: true }).check();
    expect(result.status).toBe('NOT_READY');
    expect(result.dependencies).toContainEqual({
      name: 'database',
      status: 'NOT_READY',
      detailCode: 'TIMEOUT',
    });
  });
});
