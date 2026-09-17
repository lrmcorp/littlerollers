import type { RuntimeConfig } from '@dailydose/config';
import { PrismaClient } from '@prisma/client';

export class QuotaWorker {
  constructor(
    private readonly db: PrismaClient,
    private readonly config: RuntimeConfig['quotaEvaluation'],
    private readonly clock: () => Date = () => new Date(),
  ) {}

  start(): void {}

  stop(): void {}

  async poll(): Promise<boolean> {
    return false;
  }
}
