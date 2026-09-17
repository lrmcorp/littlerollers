import type { RuntimeConfig } from '@dailydose/config';
import { PrismaClient } from '@prisma/client';

export class IdentityDeletionWorker {
  constructor(
    private readonly db: PrismaClient,
    config: RuntimeConfig['privateUploads'],
    private readonly clock: () => Date = () => new Date(),
  ) {}

  start(_intervalMs = 30_000): void {}

  stop(): void {}

  async poll(): Promise<boolean> {
    return false;
  }
}
