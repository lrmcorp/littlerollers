import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createConnection } from 'node:net';

export type HealthStatus = 'READY' | 'DEGRADED' | 'NOT_READY';
export interface DependencyHealth {
  name: 'api' | 'database' | 'redis' | 'worker' | 'private-storage' | 'payment-proof-scanner';
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
  private readonly redis: Redis | null;
  constructor(
    private readonly config: RuntimeConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.redis = config.value.redisUrl
      ? new Redis(config.value.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 0 })
      : null;
  }

  async onModuleDestroy(): Promise<void> {
    this.redis?.disconnect();
  }

  async check(): Promise<HealthResult> {
    const milliseconds = this.config.value.healthProbeTimeoutMs;
    const [database, storage, paymentProofScanner] = await Promise.all([
      this.probe('database', () => this.prisma.$queryRaw`SELECT 1`),
      this.probe('private-storage', () => this.checkPrivateStorage()),
      this.probe('payment-proof-scanner', () => this.checkPaymentProofScanner()),
    ]);
    const redisDependencies = this.redis
      ? await Promise.all([
          this.probe('redis', async () => {
            if (this.redis?.status === 'wait') await this.redis.connect();
            if ((await this.redis?.ping()) !== 'PONG') throw new Error('UNREACHABLE');
          }),
          this.probe('worker', async () => {
            const heartbeat = await this.redis?.get('dailydose:worker:heartbeat');
            if (!heartbeat || Date.now() - Date.parse(heartbeat) > 30_000)
              throw new Error('STALE_HEARTBEAT');
          }),
        ])
      : [];
    const dependencies: DependencyHealth[] = [
      { name: 'api', status: 'READY', detailCode: null },
      database,
      ...redisDependencies,
      storage,
      paymentProofScanner,
    ];
    const redis = redisDependencies.find((item) => item.name === 'redis');
    const worker = redisDependencies.find((item) => item.name === 'worker');
    const criticalFailure = [database, redis].some((item) => item && item.status !== 'READY');
    const degraded = [worker, storage, paymentProofScanner].some(
      (item) => item && item.status !== 'READY',
    );
    return {
      status: criticalFailure ? 'NOT_READY' : degraded ? 'DEGRADED' : 'READY',
      checkedAt: new Date().toISOString(),
      dependencies,
    };
  }

  private async checkPrivateStorage(): Promise<void> {
    await access(this.config.value.privateUploads.root, constants.R_OK | constants.W_OK);
  }

  private async checkPaymentProofScanner(): Promise<void> {
    const scanner = this.config.value.paymentProof;
    if (scanner.scanDriver === 'synthetic') return;
    if (!scanner.clamAvHost) throw new Error('UNREACHABLE');
    await new Promise<void>((resolveReady, rejectReady) => {
      const socket = createConnection({ host: scanner.clamAvHost!, port: scanner.clamAvPort });
      let settled = false;
      const failed = () => {
        if (settled) return;
        settled = true;
        socket.destroy();
        rejectReady(new Error('UNREACHABLE'));
      };
      socket.setTimeout(scanner.scanTimeoutMs, () => socket.destroy());
      socket.once('error', failed);
      socket.once('close', () => {
        if (!settled) failed();
      });
      socket.on('data', (chunk) => {
        if (settled) return;
        if (!Buffer.from(chunk).toString('utf8').includes('PONG')) return failed();
        settled = true;
        socket.destroy();
        resolveReady();
      });
      socket.once('connect', () => {
        socket.write('zPING\0');
      });
    });
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
