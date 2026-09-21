import type { RuntimeConfig } from '@dailydose/config';
import { PrismaClient, ClassSlotStatus } from '@prisma/client';

export class QuotaWorker {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly db: PrismaClient,
    private readonly config: RuntimeConfig['quotaEvaluation'],
    private readonly clock: () => Date = () => new Date(),
  ) {}

  start(): void {
    if (!this.config?.syntheticEnabled) return;
    this.timer = setInterval(() => void this.poll(), this.config.pollIntervalMs || 60_000);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async poll(): Promise<boolean> {
    if (!this.config?.syntheticEnabled) {
      return false;
    }

    try {
      const now = this.clock();
      // Mencari slot kelas yang dimulai dalam 24 jam ke depan
      const maxWindow = new Date(now.getTime() + 24 * 3_600_000);
      const slots = await this.db.slotKelas.findMany({
        where: {
          status: ClassSlotStatus.PUBLISHED,
          startAt: { gte: now, lte: maxWindow },
        },
        include: {
          bookings: { where: { status: 'BOOKED' } },
        },
        take: 10,
      });

      if (slots.length === 0) return false;

      for (const slot of slots) {
        const setting = await this.db.minQuotaSetting.findUnique({
          where: {
            branchId_classTypeId: {
              branchId: slot.branchId,
              classTypeId: slot.classTypeId,
            },
          },
        });

        const minQuota = setting?.active ? setting.minQuota : 1;
        if (slot.bookings.length < minQuota) {
          await this.db.slotKelas.update({
            where: { id: slot.id },
            data: {
              status: ClassSlotStatus.CANCELLED,
              cancellationReason: 'AUTO_CANCEL_MIN_QUOTA',
            },
          });
        }
      }

      return true;
    } catch {
      return false;
    }
  }
}
