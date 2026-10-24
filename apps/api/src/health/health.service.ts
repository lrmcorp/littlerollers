import { Inject, Injectable, Optional } from '@nestjs/common';
import { RuntimeConfigService } from '../configuration/runtime-config.service';
import { PrismaService } from '../database/prisma.service';
import { PRIVATE_FILE_STORAGE, type PrivateFileStorage } from '../identity/private-file-storage';
import { SchedulerService } from '../scheduler/scheduler.service';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createConnection } from 'node:net';

export type HealthStatus = 'READY' | 'DEGRADED' | 'NOT_READY';
export interface DependencyHealth {
  name: 'api' | 'database' | 'scheduler' | 'private-storage' | 'payment-proof-scanner';
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
export class HealthService {
  constructor(
    private readonly config: RuntimeConfigService,
    private readonly prisma: PrismaService,
    @Inject(PRIVATE_FILE_STORAGE) @Optional() private readonly privateStorage?: PrivateFileStorage,
    @Optional() private readonly scheduler?: SchedulerService,
  ) {}

  async check(): Promise<HealthResult> {
    const milliseconds = this.config.value.healthProbeTimeoutMs;
    const [database, storage, paymentProofScanner] = await Promise.all([
      this.probe('database', () => this.prisma.$queryRaw`SELECT 1`),
      this.probe('private-storage', () => this.checkPrivateStorage()),
      this.probe('payment-proof-scanner', () => this.checkPaymentProofScanner()),
    ]);
    // Penjadwal hanya dipantau bila hidup (SCHEDULER_ENABLED=true); bila mati tidak ada yang perlu dilaporkan.
    const schedulerDependencies: DependencyHealth[] = this.scheduler?.enabled
      ? [
          await this.probe('scheduler', async () => {
            if (!this.scheduler?.isHealthy()) throw new Error('STALE_HEARTBEAT');
          }),
        ]
      : [];
    const dependencies: DependencyHealth[] = [
      { name: 'api', status: 'READY', detailCode: null },
      database,
      ...schedulerDependencies,
      storage,
      paymentProofScanner,
    ];
    const criticalFailure = database.status !== 'READY';
    const degraded = [...schedulerDependencies, storage, paymentProofScanner].some(
      (item) => item.status !== 'READY',
    );
    return {
      status: criticalFailure ? 'NOT_READY' : degraded ? 'DEGRADED' : 'READY',
      checkedAt: new Date().toISOString(),
      dependencies,
    };
  }

  private async checkPrivateStorage(): Promise<void> {
    if (
      this.config.value.privateUploads.driver === 's3' ||
      this.config.value.privateUploads.driver === 'minio'
    ) {
      if (this.privateStorage) {
        await this.privateStorage.exists('__health_probe__');
        return;
      }
      return;
    }
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
        status: name === 'database' ? 'NOT_READY' : 'DEGRADED',
        detailCode,
      };
    }
  }
}
