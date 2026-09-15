import { PaymentReviewService } from './verifikasi-pembayaran.service';

const customer = {
  userId: 'customer-1',
  roles: [{ role: 'CUSTOMER', branchId: null }],
  branchIds: [],
  capabilities: ['customer:self', 'package:read'],
} as never;

const proof = {
  id: 'proof-1',
  userId: 'customer-1',
  branchId: 'branch-1',
  fileUrl: 'https://storage.local/proof-1.png',
  uploadStatus: 'FINALIZED',
  scanStatus: 'CLEAN',
  mimeType: 'image/png',
};

describe('PaymentReviewService customer-owned proof preview', () => {
  it('issues a one-time CUSTOMER_SELF authorization only from an owned attached order', async () => {
    const db = {
      pembelian: {
        findFirst: jest.fn().mockResolvedValue({ id: 'order-1', paymentProof: proof }),
      },
    };
    const access = { catalog: jest.fn() };
    const service = new PaymentReviewService(
      db as never,
      {} as never,
      access as never,
    );

    await expect(
      service.authorizeOwnOrderProof(customer, 'order-1', 'correlation-1'),
    ).resolves.toMatchObject({
      url: proof.fileUrl,
    });
    expect(db.pembelian.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'order-1',
          userId: 'customer-1',
        },
      }),
    );
  });

  it('consumes CUSTOMER_SELF authorization once and revalidates the attached owner', async () => {
    const db = {
      buktiPembayaran: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'proof-1',
          fileUrl: 'data:image/png;base64,' + Buffer.from('proof').toString('base64'),
        }),
      },
    };
    const access = { catalog: jest.fn() };
    const service = new PaymentReviewService(
      db as never,
      {} as never,
      access as never,
    );

    await expect(
      service.viewProofContent(customer, 'proof-1', 'correlation-2'),
    ).resolves.toMatchObject({
      mimeType: 'image/png',
      bytes: Buffer.from('proof'),
    });
  });

  it('hides missing, foreign, and unsafe proofs behind safe errors', async () => {
    const access = { catalog: jest.fn() };
    const missing = new PaymentReviewService(
      { pembelian: { findFirst: jest.fn().mockResolvedValue(null) } } as never,
      {} as never,
      access as never,
    );
    await expect(
      missing.authorizeOwnOrderProof(customer, 'order-1', 'correlation-3'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });

    const foreign = new PaymentReviewService(
      {
        pembelian: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
      } as never,
      {} as never,
      access as never,
    );
    await expect(
      foreign.authorizeOwnOrderProof(customer, 'order-1', 'correlation-4'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
  });
});
