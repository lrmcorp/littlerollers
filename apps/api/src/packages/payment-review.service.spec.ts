import { PaymentReviewService } from './payment-review.service';

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
  objectKey: 'payment-proofs/proof-1',
  uploadStatus: 'FINALIZED',
  scanStatus: 'CLEAN',
  mimeType: 'image/png',
};

describe('PaymentReviewService customer-owned proof preview', () => {
  it('issues a one-time CUSTOMER_SELF authorization only from an owned attached order', async () => {
    const db = {
      purchase: {
        findFirst: jest.fn().mockResolvedValue({ id: 'order-1', paymentProof: proof }),
      },
      paymentProofViewAuthorization: {
        create: jest.fn().mockResolvedValue({ id: 'authorization-1' }),
      },
      auditLog: { create: jest.fn().mockResolvedValue(undefined) },
    };
    const storage = { existsPrivateObject: jest.fn().mockResolvedValue(true) };
    const access = { catalog: jest.fn() };
    const service = new PaymentReviewService(
      db as never,
      {} as never,
      storage as never,
      access as never,
    );

    await expect(
      service.authorizeOwnOrderProof(customer, 'order-1', 'correlation-1'),
    ).resolves.toMatchObject({
      url: '/api/v1/uploads/payment-proofs/view-authorizations/authorization-1/content',
    });
    expect(db.purchase.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'order-1',
          userId: 'customer-1',
          paymentProofId: { not: null },
        },
      }),
    );
    expect(db.paymentProofViewAuthorization.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        proofId: 'proof-1',
        viewerId: 'customer-1',
        purpose: 'CUSTOMER_SELF',
      }),
    });
    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'payment-proof.view-authorized',
        afterMasked: expect.objectContaining({ purpose: 'CUSTOMER_SELF' }),
      }),
    });
  });

  it('consumes CUSTOMER_SELF authorization once and revalidates the attached owner', async () => {
    const authorization = {
      id: 'authorization-1',
      viewerId: 'customer-1',
      purpose: 'CUSTOMER_SELF',
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      proof,
    };
    const db = {
      purchase: { findFirst: jest.fn().mockResolvedValue({ id: 'order-1' }) },
      paymentProofViewAuthorization: {
        findUnique: jest.fn().mockResolvedValue(authorization),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      auditLog: { create: jest.fn().mockResolvedValue(undefined) },
    };
    const storage = {
      readPrivateObject: jest.fn().mockResolvedValue(Buffer.from('proof')),
    };
    const access = { catalog: jest.fn(), review: jest.fn(), scope: jest.fn() };
    const service = new PaymentReviewService(
      db as never,
      {} as never,
      storage as never,
      access as never,
    );

    await expect(
      service.viewProofContent(customer, 'authorization-1', 'correlation-2'),
    ).resolves.toMatchObject({
      mimeType: 'image/png',
      bytes: Buffer.from('proof'),
    });
    expect(access.catalog).toHaveBeenCalledWith(customer);
    expect(access.review).not.toHaveBeenCalled();
    expect(db.purchase.findFirst).toHaveBeenCalledWith({
      where: { userId: 'customer-1', paymentProofId: 'proof-1' },
      select: { id: true },
    });
    expect(db.paymentProofViewAuthorization.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'authorization-1',
        consumedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: { consumedAt: expect.any(Date) },
    });
    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'payment-proof.viewed',
        afterMasked: { purpose: 'CUSTOMER_SELF' },
      }),
    });
  });

  it('hides missing, foreign, and unsafe proofs behind safe errors', async () => {
    const access = { catalog: jest.fn() };
    const storage = { existsPrivateObject: jest.fn().mockResolvedValue(true) };
    const missing = new PaymentReviewService(
      { purchase: { findFirst: jest.fn().mockResolvedValue(null) } } as never,
      {} as never,
      storage as never,
      access as never,
    );
    await expect(
      missing.authorizeOwnOrderProof(customer, 'order-1', 'correlation-3'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });

    const foreign = new PaymentReviewService(
      {
        purchase: {
          findFirst: jest
            .fn()
            .mockResolvedValue({ paymentProof: { ...proof, userId: 'customer-2' } }),
        },
      } as never,
      {} as never,
      storage as never,
      access as never,
    );
    await expect(
      foreign.authorizeOwnOrderProof(customer, 'order-1', 'correlation-4'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });

    const unsafe = new PaymentReviewService(
      {
        purchase: {
          findFirst: jest.fn().mockResolvedValue({
            paymentProof: { ...proof, scanStatus: 'PENDING' },
          }),
        },
      } as never,
      {} as never,
      storage as never,
      access as never,
    );
    await expect(
      unsafe.authorizeOwnOrderProof(customer, 'order-1', 'correlation-5'),
    ).rejects.toMatchObject({ code: 'PAYMENT_PROOF_NOT_CLEAN' });
  });
});
