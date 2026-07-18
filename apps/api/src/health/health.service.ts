import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';

export type HealthStatus = 'READY' | 'DEGRADED' | 'NOT_READY';
export interface DependencyHealth {
  name: 'api' | 'database' | 'redis' | 'worker' | 'object-storage';
  status: HealthStatus;
  detailCode: 'TIMEOUT' | 'UNREACHABLE' | 'STALE_HEARTBEAT' | null;
}
export interface HealthResult {
  status: HealthStatus;
  checkedAt: string;
  dependencies: DependencyHealth[];
}

const timeout = async <T>(promise: Promise<T>, milliseconds: number): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('TIMEOUT')), milliseconds);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

@Injectable()
export class HealthService implements OnModuleDestroy {
  private readonly redis: Redis;
  constructor(
    private readonly config: RuntimeConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.redis = new Redis(config.value.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 0 });
  }

  async onModuleDestroy(): Promise<void> {
    this.redis.disconnect();
  }

  async check(): Promise<HealthResult> {
    const milliseconds = this.config.value.healthProbeTimeoutMs;
    const [database, redis, worker, storage] = await Promise.all([
      this.probe('database', () => this.prisma.$queryRaw`SELECT 1`),
      this.probe('redis', async () => {
        if (this.redis.status === 'wait') await this.redis.connect();
        if ((await this.redis.ping()) !== 'PONG') throw new Error('UNREACHABLE');
      }),
      this.probe('worker', async () => {
        const heartbeat = await this.redis.get('dailydose:worker:heartbeat');
        if (!heartbeat || Date.now() - Date.parse(heartbeat) > 30_000)
          throw new Error('STALE_HEARTBEAT');
      }),
      this.probe('object-storage', async () => {
        const endpoint = new URL('/minio/health/ready', this.config.value.objectStorage.endpoint);
        const response = await fetch(endpoint, { signal: AbortSignal.timeout(milliseconds) });
        if (!response.ok) throw new Error('UNREACHABLE');
      }),
    ]);
    const dependencies: DependencyHealth[] = [
      { name: 'api', status: 'READY', detailCode: null },
      database,
      redis,
      worker,
      storage,
    ];
    const criticalFailure = [database, redis].some((item) => item.status !== 'READY');
    const degraded = [worker, storage].some((item) => item.status !== 'READY');
    return {
      status: criticalFailure ? 'NOT_READY' : degraded ? 'DEGRADED' : 'READY',
      checkedAt: new Date().toISOString(),
      dependencies,
    };
  }

  private async probe(
    name: DependencyHealth['name'],
    operation: () => Promise<unknown>,
  ): Promise<DependencyHealth> {
    try {
      await timeout(Promise.resolve().then(operation), this.config.value.healthProbeTimeoutMs);
      return { name, status: 'READY', detailCode: null };
    } catch (error) {
      const detailCode =
        error instanceof Error && error.message === 'TIMEOUT'
          ? 'TIMEOUT'
          : error instanceof Error && error.message === 'STALE_HEARTBEAT'
            ? 'STALE_HEARTBEAT'
            : 'UNREACHABLE';
      return {
        name,
        status: name === 'database' || name === 'redis' ? 'NOT_READY' : 'DEGRADED',
        detailCode,
      };
    }
  }
}
