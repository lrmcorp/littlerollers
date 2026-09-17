import type { PrismaClient } from '@prisma/client';

export class PaymentExpirationWorker {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly db: PrismaClient,
    private readonly intervalMs = 60_000,
  ) {}

  start(): void {
    void this.runOnce();
    this.timer = setInterval(() => void this.runOnce(), this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async runOnce(now = new Date()): Promise<number> {
    const expired = await this.db.pembelian.updateMany({
      where: {
        status: 'PENDING',
        paymentExpiresAt: { lte: now },
      },
      data: {
        status: 'CANCELLED',
      },
    });
    return expired.count;
  }
}
