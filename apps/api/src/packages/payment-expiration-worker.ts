import { Injectable, Logger } from '@nestjs/common';
import { PurchaseStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PaymentExpirationWorkerService {
  private readonly logger = new Logger(PaymentExpirationWorkerService.name);

  constructor(private readonly db: PrismaService) {}

  /**
   * Scans and expires unpaid PENDING orders that have exceeded their 24-hour payment window
   */
  async expirePendingOrders(olderThanHours = 24): Promise<{
    expiredCount: number;
    executedAt: string;
    cancelledIds: string[];
  }> {
    const cutoff = new Date(Date.now() - olderThanHours * 3600 * 1000);
    const now = new Date();

    // Find candidate pending orders without payment proof that expired
    const expiredCandidates = await this.db.pembelian.findMany({
      where: {
        status: PurchaseStatus.PENDING,
        paymentProof: null,
        OR: [
          { paymentExpiresAt: { lt: now } },
          { AND: [{ paymentExpiresAt: null }, { createdAt: { lt: cutoff } }] },
        ],
      },
      select: { id: true, invoiceNumber: true, createdAt: true },
    });

    if (expiredCandidates.length === 0) {
      return {
        expiredCount: 0,
        executedAt: now.toISOString(),
        cancelledIds: [],
      };
    }

    const cancelledIds = expiredCandidates.map((c) => c.id);

    const result = await this.db.pembelian.updateMany({
      where: {
        id: { in: cancelledIds },
      },
      data: {
        status: PurchaseStatus.CANCELLED,
        rejectionReason: `EXPIRED_AUTOMATIC: Tidak melakukan pembayaran dalam ${olderThanHours} jam.`,
      },
    });

    this.logger.log(
      `PaymentExpirationWorker: Cancelled ${result.count} stale pending purchases older than ${olderThanHours}h.`,
    );

    return {
      expiredCount: result.count,
      executedAt: now.toISOString(),
      cancelledIds,
    };
  }
}
