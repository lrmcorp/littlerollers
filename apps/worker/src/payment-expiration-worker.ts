import type { PrismaClient } from '@prisma/client';

export class PaymentExpirationWorker {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly db: PrismaClient,
    private readonly intervalMs = 60_000,
  ) {}

  start() {
    void this.runOnce();
    this.timer = setInterval(() => void this.runOnce(), this.intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  async runOnce(now = new Date()) {
    const reservations = await this.db.paymentUniqueCodeReservation.findMany({
      where: { expiresAt: { lte: now } },
      select: { purchaseId: true },
      take: 250,
    });
    if (!reservations.length) return 0;
    const purchaseIds = reservations.map(({ purchaseId }) => purchaseId);
    await this.db.$transaction([
      this.db.purchase.updateMany({
        where: {
          id: { in: purchaseIds },
          status: { in: ['AWAITING_PAYMENT', 'ACTION_REQUIRED'] },
          paymentExpiresAt: { lte: now },
        },
        data: { status: 'EXPIRED', version: { increment: 1 } },
      }),
      this.db.paymentUniqueCodeReservation.deleteMany({
        where: {
          purchaseId: { in: purchaseIds },
          OR: [
            { expiresAt: { lte: now } },
            { purchase: { status: { in: ['APPROVED', 'REJECTED', 'EXPIRED'] } } },
          ],
        },
      }),
    ]);
    return purchaseIds.length;
  }
}
