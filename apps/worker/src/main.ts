import 'reflect-metadata';
import { loadRuntimeConfig } from '@dailydose/config';
import { Injectable, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { QuotaWorker } from './quota-worker';
import { IdentityDeletionWorker } from './identity-deletion-worker';
import { NotificationProjectionWorker } from './notification-projection-worker';
import { PaymentExpirationWorker } from './payment-expiration-worker';
import { PaymentProofCleanupWorker } from './payment-proof-cleanup-worker';

@Injectable()
class WorkerHeartbeat implements OnModuleInit, OnModuleDestroy {
  private readonly config = loadRuntimeConfig(process.env);
  private readonly redis = new Redis(this.config.redisUrl);
  private readonly database = new PrismaClient();
  private readonly quotaWorker = new QuotaWorker(this.database, this.config.quotaEvaluation);
  private readonly identityDeletionWorker = new IdentityDeletionWorker(
    this.database,
    this.config.privateUploads,
  );
  private readonly notificationProjectionWorker = new NotificationProjectionWorker(this.database);
  private readonly paymentExpirationWorker = new PaymentExpirationWorker(this.database);
  private readonly paymentProofCleanupWorker = new PaymentProofCleanupWorker(this.database, {
    privateUploadRoot: this.config.privateUploads.root,
    abandonedUploadTtlMinutes: this.config.paymentProof.abandonedUploadTtlMinutes,
  });
  private timer?: NodeJS.Timeout;

  async onModuleInit(): Promise<void> {
    await this.beat();
    this.quotaWorker.start();
    this.identityDeletionWorker.start();
    this.notificationProjectionWorker.start();
    this.paymentExpirationWorker.start();
    this.paymentProofCleanupWorker.start();
    this.timer = setInterval(() => void this.beat(), this.config.workerHeartbeatIntervalMs);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.quotaWorker.stop();
    this.identityDeletionWorker.stop();
    this.notificationProjectionWorker.stop();
    this.paymentExpirationWorker.stop();
    this.paymentProofCleanupWorker.stop();
    await this.redis.quit();
    await this.database.$disconnect();
  }

  private async beat(): Promise<void> {
    await this.redis.set(
      'dailydose:worker:heartbeat',
      new Date().toISOString(),
      'EX',
      this.config.workerHeartbeatTtlSeconds,
    );
  }
}

@Module({ providers: [WorkerHeartbeat] })
class WorkerModule {}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'error', 'warn'],
  });
  app.enableShutdownHooks();
}
void bootstrap();
