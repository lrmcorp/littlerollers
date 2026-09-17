import type { PrismaClient } from '@prisma/client';
import type { RuntimeConfig } from '@dailydose/config';

export class NotificationProjectionWorker {
  constructor(
    private readonly db: PrismaClient,
    private readonly pollIntervalMs = 5_000,
    private readonly emailConfig?: RuntimeConfig['email'],
  ) {}

  start(): void {}

  stop(): void {}

  async poll(): Promise<boolean> {
    return false;
  }
}
