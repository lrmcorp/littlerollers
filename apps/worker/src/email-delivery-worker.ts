import type { PrismaClient } from '@prisma/client';
import type { RuntimeConfig } from '@dailydose/config';

export class EmailDeliveryWorker {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly db: PrismaClient,
    private readonly config: RuntimeConfig['email'],
    private readonly pollIntervalMs = 2_000,
  ) {}

  start(): void {}

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async poll(): Promise<boolean> {
    return false;
  }
}
