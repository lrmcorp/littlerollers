import { HealthService } from './health.service';

const config = {
  value: {
    healthProbeTimeoutMs: 10,
    privateUploads: { root: '/private/identity-files' },
    buktiPembayaran: {
      scanDriver: 'synthetic',
      clamAvHost: null,
      clamAvPort: 3310,
      scanTimeoutMs: 10,
    },
  },
};

describe('HealthService', () => {
  afterEach(() => jest.restoreAllMocks());

  function service(options?: {
    databaseFails?: boolean;
    databaseTimeout?: boolean;
    scheduler?: 'off' | 'healthy' | 'stale';
    storageFails?: boolean;
    scannerFails?: boolean;
  }) {
    const prisma = {
      $queryRaw: options?.databaseTimeout
        ? jest.fn().mockReturnValue(new Promise(() => undefined))
        : options?.databaseFails
          ? jest.fn().mockRejectedValue(new Error('password=secret'))
          : jest.fn().mockResolvedValue([1]),
    };
    const scheduler =
      options?.scheduler === undefined || options.scheduler === 'off'
        ? { enabled: false, isHealthy: () => true }
        : { enabled: true, isHealthy: () => options.scheduler === 'healthy' };
    const health = new HealthService(config as never, prisma as never, undefined, scheduler as never);
    jest
      .spyOn(health as unknown as { checkPrivateStorage(): Promise<void> }, 'checkPrivateStorage')
      .mockImplementation(() =>
        options?.storageFails ? Promise.reject(new Error('permission denied')) : Promise.resolve(),
      );
    jest
      .spyOn(
        health as unknown as { checkPaymentProofScanner(): Promise<void> },
        'checkPaymentProofScanner',
      )
      .mockImplementation(() =>
        options?.scannerFails ? Promise.reject(new Error('connection refused')) : Promise.resolve(),
      );
    return health;
  }

  it('reports READY when all probes are ready', async () => {
    expect((await service().check()).status).toBe('READY');
  });

  it('does not report the scheduler while it is switched off, and never probes Redis or a worker', async () => {
    const result = await service({ scheduler: 'off' }).check();
    expect(result.status).toBe('READY');
    const names = result.dependencies.map((item) => item.name) as string[];
    expect(names).not.toContain('scheduler');
    expect(names).not.toContain('redis');
    expect(names).not.toContain('worker');
  });

  it('reports the scheduler as READY when its jobs ran recently', async () => {
    const result = await service({ scheduler: 'healthy' }).check();
    expect(result.status).toBe('READY');
    expect(result.dependencies).toContainEqual({ name: 'scheduler', status: 'READY', detailCode: null });
  });

  it('reports DEGRADED (not NOT_READY) when the scheduler stopped running its jobs', async () => {
    const result = await service({ scheduler: 'stale' }).check();
    expect(result.status).toBe('DEGRADED');
    expect(result.dependencies).toContainEqual({
      name: 'scheduler',
      status: 'DEGRADED',
      detailCode: 'STALE_HEARTBEAT',
    });
  });

  it('reports DEGRADED when private storage is unreachable', async () => {
    const result = await service({ storageFails: true }).check();
    expect(result.status).toBe('DEGRADED');
    expect(result.dependencies).toContainEqual({
      name: 'private-storage',
      status: 'DEGRADED',
      detailCode: 'UNREACHABLE',
    });
  });

  it('reports DEGRADED when the payment-proof scanner is unreachable', async () => {
    const result = await service({ scannerFails: true }).check();
    expect(result.dependencies).toContainEqual({
      name: 'payment-proof-scanner',
      status: 'DEGRADED',
      detailCode: 'UNREACHABLE',
    });
  });

  it('reports NOT_READY for critical database failure without leaking its error', async () => {
    const serialized = JSON.stringify(await service({ databaseFails: true }).check());
    expect(serialized).toContain('NOT_READY');
    expect(serialized).not.toContain('secret');
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
