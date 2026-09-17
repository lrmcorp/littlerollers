import type { PrismaClient } from '@prisma/client';

export class PaymentProofCleanupWorker {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly db: PrismaClient,
    private readonly options: {
      privateUploadRoot: string;
      abandonedUploadTtlMinutes: number;
      intervalMs?: number;
    },
  ) {}

  start(): void {}

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async runOnce(_now = new Date()): Promise<number> {
    return 0;
  }
}
