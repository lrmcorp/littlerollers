import type { PrismaClient } from '@prisma/client';
import type { RuntimeConfig } from '@dailydose/config';

export class PackageReminderWorker {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly db: PrismaClient,
    private readonly config: RuntimeConfig['email'],
    private readonly intervalMs = 3_600_000,
  ) {}

  start(): void {
    void this.tick();
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    try {
      await this.runOnce();
    } catch {
      console.error('package_reminder_worker_failed');
    }
  }

  async runOnce(now = new Date()): Promise<number> {
    const expired = await this.db.paketPelanggan.updateMany({
      where: {
        status: 'ACTIVE',
        validUntil: { lt: now },
      },
      data: {
        status: 'EXPIRED',
      },
    });
    return expired.count;
  }
}
