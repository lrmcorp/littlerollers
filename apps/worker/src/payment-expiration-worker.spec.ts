import { PaymentExpirationWorker } from './payment-expiration-worker';

describe('PaymentExpirationWorker', () => {
  it('expires actionable orders and releases their unique codes', async () => {
    const findMany = jest.fn().mockResolvedValue([{ purchaseId: 'purchase-1' }]);
    const updateMany = jest.fn().mockReturnValue({ kind: 'update' });
    const deleteMany = jest.fn().mockReturnValue({ kind: 'delete' });
    const transaction = jest.fn().mockResolvedValue([]);
    const worker = new PaymentExpirationWorker({
      reservasiKodeUnikPembayaran: { findMany, deleteMany },
      pembelian: { updateMany },
      $transaction: transaction,
    } as never);
    expect(await worker.runOnce(new Date('2026-07-28T00:00:00Z'))).toBe(1);
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { in: ['purchase-1'] } }),
      }),
    );
    expect(deleteMany).toHaveBeenCalled();
    expect(transaction).toHaveBeenCalled();
  });
});
